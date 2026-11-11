import { assertSchedulerOutputSafe } from './schedulerAdapterContract.js';
import {
  fallbackToStableScheduler,
  getScheduler,
  resolveSchedulerSelection
} from './schedulerRegistry.js';
import { SM2_SCHEDULER_ID } from './sm2SchedulerAdapter.js';
import { FSRS_BETA_SCHEDULER_ID } from './fsrsBetaSchedulerAdapter.js';

export const SCHEDULER_STATE_SCHEMA_VERSION = 1;
export const SCHEDULER_FALLBACK_ID = SM2_SCHEDULER_ID;
export const SCHEDULER_REVIEW_LOG_CAP = 20;

const FSRS_LEGACY_KINDS = new Set([
  'fsrs-active',
  'fsrs-planned',
  'fsrs-v4',
  'fsrs-v4-test',
  'ts-fsrs-5.3.3-test'
]);
const SM2_LEGACY_KINDS = new Set(['sm2', 'sm2-heuristic', 'current-heuristic', 'v2-review-schedule-v1']);

function clone(value, fallback = null) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function safeDate(value, fallback = new Date()) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value || fallback);
  return Number.isNaN(date.getTime()) ? new Date(fallback) : date;
}

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeOutcome(value) {
  const outcome = String(value || '').trim().toLowerCase();
  return ['correct', 'wrong', 'unanswered'].includes(outcome) ? outcome : 'unanswered';
}

function normalizeRating(outcome, context = {}) {
  const memoryRating = String(context.memoryRating || context.schedulerRating || '').trim().toLowerCase();
  if (['again', 'hard', 'good', 'easy'].includes(memoryRating)) return memoryRating;
  return normalizeOutcome(outcome);
}

function getItemId(record = {}, context = {}) {
  return String(context.itemId || context.itemResult?.itemId || record.itemId || '').trim();
}

export function resolveRecordSchedulerId(record = {}) {
  const explicit = String(record.schedulerId || '').trim();
  if (explicit) return explicit;

  const legacyKind = String(record.schedulerKind || '').trim();
  const legacyVersion = String(record.schedulerVersion || '').trim();
  const hasLegacyFsrsState = record.fsrsPayload && typeof record.fsrsPayload === 'object';
  if (FSRS_LEGACY_KINDS.has(legacyKind) || FSRS_LEGACY_KINDS.has(legacyVersion) || hasLegacyFsrsState) {
    return getScheduler(FSRS_BETA_SCHEDULER_ID) ? FSRS_BETA_SCHEDULER_ID : SM2_SCHEDULER_ID;
  }
  return SM2_SCHEDULER_ID;
}

export function migrateSchedulerRecord(record = {}, context = {}) {
  const source = record && typeof record === 'object' && !Array.isArray(record) ? clone(record, {}) : {};
  const requestedSchedulerId = resolveRecordSchedulerId(source);
  const adapter = getScheduler(requestedSchedulerId);
  if (!adapter) {
    return {
      ...source,
      legacySchedulerId: requestedSchedulerId,
      schedulerId: SM2_SCHEDULER_ID,
      schedulerAdapterVersion: getScheduler(SM2_SCHEDULER_ID)?.schedulerVersion || '',
      schedulerStateSchemaVersion: SCHEDULER_STATE_SCHEMA_VERSION,
      schedulerState: createSchedulerStateEnvelope(source, context),
      schedulerFallbackReason: 'unknown_scheduler_migration'
    };
  }
  const state = adapter.migrateState(createSchedulerStateEnvelope(source, context));
  return {
    ...source,
    schedulerId: adapter.schedulerId,
    schedulerAdapterVersion: adapter.schedulerVersion,
    schedulerStateSchemaVersion: adapter.stateSchemaVersion,
    schedulerState: clone(state, {})
  };
}

export function createSchedulerStateEnvelope(record = {}, context = {}) {
  const current = record.schedulerState && typeof record.schedulerState === 'object' && !Array.isArray(record.schedulerState)
    ? clone(record.schedulerState, {})
    : {};
  const legacyAlgorithmState = record.fsrsPayload && typeof record.fsrsPayload === 'object' && !Array.isArray(record.fsrsPayload)
    ? clone(record.fsrsPayload)
    : null;
  const options = context.schedulerOptions || context.fsrsOptions || current.options;

  return {
    ...current,
    schemaVersion: SCHEDULER_STATE_SCHEMA_VERSION,
    ...(current.algorithmState ? {} : legacyAlgorithmState ? { algorithmState: legacyAlgorithmState } : {}),
    ...(options && typeof options === 'object' ? { options: clone(options, {}) } : {})
  };
}

function buildSchedulerInput(record, outcome, context = {}) {
  const itemId = getItemId(record, context);
  if (!itemId) throw new TypeError('Scheduler kernel requires an itemId.');

  const reviewedAt = safeDate(context.now || context.completedAt || new Date());
  const previousReviewedAt = safeDate(record.lastReviewedAt || reviewedAt, reviewedAt);
  const elapsedDays = Math.max(0, (reviewedAt.getTime() - previousReviewedAt.getTime()) / 86_400_000);

  return {
    cardId: itemId,
    currentIntervalDays: Math.max(0, finite(record.intervalDays, 0)),
    repetitionCount: Math.max(0, Math.floor(finite(record.repetitionCount, 0))),
    easeFactor: Math.min(2.8, Math.max(1.3, finite(record.easeFactor, 2.2))),
    lastReviewedAt: previousReviewedAt.toISOString(),
    reviewedAt: reviewedAt.toISOString(),
    rating: normalizeRating(outcome, context),
    elapsedDays,
    localReviewHistorySummary: {
      totalReviews: Math.max(0, Math.floor(finite(record.repetitionCount, 0) + finite(record.wrongCount, 0))),
      recentCorrectRate: context.recentCorrectRate,
      lapseCount: Math.max(0, Math.floor(finite(record.wrongCount, 0)))
    },
    schedulerState: createSchedulerStateEnvelope(record, context)
  };
}

function computeOutput(adapter, input) {
  if (!adapter || typeof adapter.computeNextReview !== 'function') {
    throw new TypeError('Scheduler adapter cannot compute the next review.');
  }
  const migratedState = adapter.migrateState(input.schedulerState || {});
  if (!migratedState || typeof migratedState !== 'object' || Array.isArray(migratedState)) {
    throw new TypeError('Scheduler state migration must return an object.');
  }
  const output = adapter.computeNextReview({ ...input, schedulerState: migratedState });
  assertSchedulerOutputSafe(output, { decisionCodePrefix: adapter.decisionCodePrefix });
  if (output.schedulerId !== adapter.schedulerId) {
    throw new TypeError('Scheduler output id does not match its registered adapter.');
  }
  return output;
}

function updateCounters(record, outcome) {
  const normalized = normalizeOutcome(outcome);
  const repetitionCount = Math.max(0, Math.floor(finite(record.repetitionCount, 0)));
  const correctStreak = Math.max(0, Math.floor(finite(record.correctStreak, 0)));
  const wrongCount = Math.max(0, Math.floor(finite(record.wrongCount, 0)));
  if (normalized === 'correct') {
    return { repetitionCount: repetitionCount + 1, correctStreak: correctStreak + 1, wrongCount };
  }
  if (normalized === 'wrong') {
    return { repetitionCount, correctStreak: 0, wrongCount: wrongCount + 1 };
  }
  return { repetitionCount, correctStreak: 0, wrongCount };
}

function appendReviewLog(record, schedulerState) {
  const existing = Array.isArray(record.fsrsReviewLogs) ? record.fsrsReviewLogs : [];
  const log = schedulerState?.reviewLog;
  if (!log || typeof log !== 'object') return existing.slice(-SCHEDULER_REVIEW_LOG_CAP);
  return [...existing, clone(log, {})].slice(-SCHEDULER_REVIEW_LOG_CAP);
}

function applyOutput(record, outcome, context, adapter, output) {
  const reviewedAt = safeDate(context.now || context.completedAt || new Date()).toISOString();
  const itemResult = context.itemResult || {};
  const schedulerState = output.schedulerState && typeof output.schedulerState === 'object'
    ? clone(output.schedulerState, {})
    : createSchedulerStateEnvelope(record, context);
  const next = {
    ...clone(record, {}),
    itemId: getItemId(record, context),
    subjectId: String(itemResult.subjectId ?? context.subjectId ?? record.subjectId ?? ''),
    topicId: String(itemResult.topicId ?? context.topicId ?? record.topicId ?? ''),
    lastReviewedAt: reviewedAt,
    dueAt: new Date(output.nextReviewAt).toISOString(),
    intervalDays: Math.max(0, finite(output.intervalDays, 0)),
    easeFactor: Math.min(2.8, Math.max(1.3, finite(output.easeFactor, record.easeFactor || 2.2))),
    ...updateCounters(record, outcome),
    schedulerId: adapter.schedulerId,
    schedulerAdapterVersion: adapter.schedulerVersion,
    schedulerStateSchemaVersion: adapter.stateSchemaVersion,
    schedulerState
  };

  if (adapter.schedulerId === FSRS_BETA_SCHEDULER_ID) {
    next.fsrsPayload = clone(schedulerState.algorithmState, record.fsrsPayload || {});
    next.fsrsReviewLogs = appendReviewLog(record, schedulerState);
  }
  if (adapter.schedulerId === SM2_SCHEDULER_ID && SM2_LEGACY_KINDS.has(String(next.schedulerKind || ''))) {
    delete next.schedulerKind;
  }
  return next;
}

function createFallbackSnapshot(record) {
  return {
    schedulerId: SM2_SCHEDULER_ID,
    schedulerVersion: record.schedulerAdapterVersion || record.schedulerVersion || '',
    lastReviewedAt: record.lastReviewedAt,
    dueAt: record.dueAt,
    intervalDays: record.intervalDays,
    repetitionCount: record.repetitionCount,
    easeFactor: record.easeFactor,
    correctStreak: record.correctStreak,
    wrongCount: record.wrongCount
  };
}

function getFallbackBase(record) {
  const snapshot = record.fallbackSnapshot;
  return snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot)
    ? { ...record, ...clone(snapshot, {}) }
    : record;
}

function runStableFallback(record, outcome, context, reason) {
  const fallback = fallbackToStableScheduler(reason);
  const base = getFallbackBase(record);
  const input = buildSchedulerInput(base, outcome, context);
  const output = computeOutput(fallback.scheduler, input);
  const legacySchedulerId = String(record.schedulerId || '').trim();
  return {
    ...applyOutput(base, outcome, context, fallback.scheduler, output),
    ...(legacySchedulerId && legacySchedulerId !== SM2_SCHEDULER_ID ? { legacySchedulerId } : {}),
    schedulerFallbackReason: reason,
    schedulerFallbackAt: safeDate(context.now || context.completedAt || new Date()).toISOString()
  };
}

export function scheduleRecordWithKernel({
  record = {},
  outcome,
  context = {},
  schedulerId
} = {}) {
  const requestedSchedulerId = context.forceSm2Fallback === true
    ? SM2_SCHEDULER_ID
    : String(schedulerId || resolveRecordSchedulerId(record));
  const selection = resolveSchedulerSelection({
    schedulerId: requestedSchedulerId,
    explicitOptIn: requestedSchedulerId !== SM2_SCHEDULER_ID
  }, context);
  const adapter = selection.scheduler;
  if (!adapter) throw new TypeError('Stable SM-2 scheduler is unavailable.');

  if (selection.activeSchedulerId === SM2_SCHEDULER_ID && requestedSchedulerId !== SM2_SCHEDULER_ID) {
    return runStableFallback(record, outcome, context, selection.fallbackReason || 'scheduler_unavailable');
  }

  try {
    const input = buildSchedulerInput(record, outcome, context);
    const output = computeOutput(adapter, input);
    const primary = applyOutput(record, outcome, context, adapter, output);
    if (adapter.schedulerId === SM2_SCHEDULER_ID) return primary;

    const shadowInput = buildSchedulerInput(getFallbackBase(record), outcome, context);
    const shadowOutput = computeOutput(getScheduler(SM2_SCHEDULER_ID), shadowInput);
    const shadowRecord = applyOutput(getFallbackBase(record), outcome, context, getScheduler(SM2_SCHEDULER_ID), shadowOutput);
    return {
      ...primary,
      fallbackSnapshot: createFallbackSnapshot(shadowRecord),
      schedulerFallbackReason: ''
    };
  } catch (error) {
    return runStableFallback(record, outcome, context, `adapter_failure:${adapter.schedulerId}`);
  }
}

export function getSchedulerRetrievability(record, now = new Date()) {
  const adapter = getScheduler(resolveRecordSchedulerId(record));
  if (!adapter || !Array.isArray(adapter.capabilities) || !adapter.capabilities.includes('retrievability')) {
    return null;
  }
  if (typeof adapter.getRetrievability !== 'function') return null;
  try {
    const value = Number(adapter.getRetrievability(record, now));
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : null;
  } catch {
    return null;
  }
}
