import {
  FSRS_REVIEW_LOG_CAP,
  createReviewScheduleRecordFromResult
} from '../state/reviewScheduleStorage.js';
import { scheduleFsrsReviewForTest } from './fsrsWrapper.js';

export const SCHEDULER_KIND_CURRENT = 'sm2-heuristic';
export const FSRS_DORMANT_SCHEDULER_VERSION = 'phase14j-dormant-readiness';
export const SCHEDULER_KIND_FSRS_PLANNED = 'fsrs-planned';
// Literal value of REVIEW_SCHEDULE_SCHEMA_VERSION; kept as a constant to avoid
// a circular ES-module init dependency (storage imports adapter in Phase 14L).
export const SCHEDULER_VERSION_CURRENT = 'v2-review-schedule-v1';
export const SCHEDULER_VERSION_FSRS_PLANNED = 'fsrs-planned-v1';

const CURRENT_KIND_ALIASES = new Set([
  SCHEDULER_KIND_CURRENT,
  SCHEDULER_VERSION_CURRENT,
  'current-heuristic'
]);

const FSRS_KIND_ALIASES = new Set([
  SCHEDULER_KIND_FSRS_PLANNED,
  SCHEDULER_VERSION_FSRS_PLANNED,
  'fsrs-v4'
]);

const FSRS_TEST_KIND_ALIASES = new Set([
  'fsrs-v4-test',
  'ts-fsrs-5.3.3-test'
]);

const VALID_CURRENT_OUTCOMES = new Set(['correct', 'wrong', 'unanswered']);

function normalizeKindValue(value) {
  return String(value ?? '').trim();
}

function toSafeDate(value, fallback = new Date()) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value || fallback);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function toTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  const time = date.getTime();
  return Number.isFinite(time) ? time : Date.now();
}

function toDueTime(value) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

function cloneJsonRecord(record) {
  if (!record || typeof record !== 'object') return {};
  return JSON.parse(JSON.stringify(record));
}

function normalizeOutcome(outcome) {
  const status = String(outcome || '').trim();
  return VALID_CURRENT_OUTCOMES.has(status) ? status : '';
}

function getRecordItemId(record, context = {}) {
  return String(context.itemId || context.itemResult?.itemId || record?.itemId || '').trim();
}

function createItemResult(record, outcome, context = {}) {
  const itemId = getRecordItemId(record, context);
  if (!itemId) return null;

  const status = normalizeOutcome(context.itemResult?.status || outcome);
  if (!status) return null;

  return {
    ...context.itemResult,
    itemId,
    status,
    subjectId: context.itemResult?.subjectId ?? context.subjectId ?? record?.subjectId ?? '',
    topicId: context.itemResult?.topicId ?? context.topicId ?? record?.topicId ?? ''
  };
}

export function getSchedulerKind(record) {
  const explicitKind = normalizeKindValue(record?.schedulerKind);
  const explicitVersion = normalizeKindValue(record?.schedulerVersion);

  if (
    FSRS_KIND_ALIASES.has(explicitKind) ||
    FSRS_KIND_ALIASES.has(explicitVersion) ||
    FSRS_TEST_KIND_ALIASES.has(explicitKind) ||
    FSRS_TEST_KIND_ALIASES.has(explicitVersion)
  ) {
    return SCHEDULER_KIND_FSRS_PLANNED;
  }

  if (CURRENT_KIND_ALIASES.has(explicitKind) || CURRENT_KIND_ALIASES.has(explicitVersion)) {
    return SCHEDULER_KIND_CURRENT;
  }

  return SCHEDULER_KIND_CURRENT;
}

export function getSchedulerVersion(record) {
  const explicitVersion = normalizeKindValue(record?.schedulerVersion);
  if (explicitVersion) return explicitVersion;
  return getSchedulerKind(record) === SCHEDULER_KIND_FSRS_PLANNED
    ? SCHEDULER_VERSION_FSRS_PLANNED
    : SCHEDULER_VERSION_CURRENT;
}

export function isCurrentSchedulerRecord(record) {
  return getSchedulerKind(record) === SCHEDULER_KIND_CURRENT;
}

export function getDueStatus(record, now = new Date()) {
  const dueAt = String(record?.dueAt || '').trim();
  const dueTime = dueAt ? toDueTime(dueAt) : null;
  const nowTime = toTimestamp(now);

  return {
    isDue: dueTime !== null && dueTime <= nowTime,
    isScheduled: dueTime !== null,
    dueAt: dueAt || '',
    dueTime,
    schedulerKind: getSchedulerKind(record),
    schedulerVersion: getSchedulerVersion(record)
  };
}

export function getDueSummary(records = [], now = new Date()) {
  const nowTime = toTimestamp(now);
  const safeRecords = Array.isArray(records) ? records : [];
  const dueRecords = [];
  const nextRecords = [];
  let currentSchedulerCount = 0;
  let fsrsPlannedCount = 0;
  let invalidCount = 0;
  let futureCount = 0;

  safeRecords.forEach(record => {
    if (!record || typeof record !== 'object') {
      invalidCount += 1;
      return;
    }

    const status = getDueStatus(record, nowTime);
    if (status.schedulerKind === SCHEDULER_KIND_FSRS_PLANNED) fsrsPlannedCount += 1;
    else currentSchedulerCount += 1;

    if (!status.isScheduled) {
      invalidCount += 1;
      return;
    }

    if (status.isDue) dueRecords.push({ record, ...status });
    else futureCount += 1;
    nextRecords.push({ record, ...status });
  });

  nextRecords.sort((left, right) => left.dueTime - right.dueTime);
  dueRecords.sort((left, right) => left.dueTime - right.dueTime);

  return {
    totalScheduled: dueRecords.length + futureCount,
    dueCount: dueRecords.length,
    futureCount,
    currentSchedulerCount,
    fsrsPlannedCount,
    invalidCount,
    nextDueAt: nextRecords[0]?.dueAt || '',
    dueRecords: dueRecords.slice(0, 10).map(entry => entry.record),
    nextRecords: nextRecords.slice(0, 5).map(entry => entry.record)
  };
}

export function scheduleCurrentReview(record, outcome, context = {}) {
  const itemResult = createItemResult(record, outcome, context);
  if (!itemResult) return null;

  const completedAt = toSafeDate(context.completedAt || context.now || new Date()).toISOString();
  return createReviewScheduleRecordFromResult(preserveCurrentRecord(record), itemResult, completedAt);
}

function mapOutcomeToFsrsRating(outcome) {
  const normalizedOutcome = normalizeOutcome(outcome);
  if (normalizedOutcome === 'correct') return 'Good';
  if (normalizedOutcome === 'wrong' || normalizedOutcome === 'unanswered') return 'Again';
  throw new TypeError('FSRS test routing requires outcome correct, wrong, or unanswered.');
}

function scheduleGatedFsrsReview(record, outcome, context = {}) {
  const rating = mapOutcomeToFsrsRating(outcome);
  const now = context.now ? toSafeDate(context.now) : new Date();
  return scheduleFsrsReviewForTest(preserveCurrentRecord(record), rating, now);
}

export function scheduleReview(record, outcome, context = {}) {
  if (getSchedulerKind(record) === SCHEDULER_KIND_FSRS_PLANNED) {
    if (context.enableFsrsTestRoute === true) {
      return scheduleGatedFsrsReview(record, outcome, context);
    }

    throw new Error(
      `FSRS scheduling is not implemented in Phase 14A; schedulerKind ${SCHEDULER_KIND_FSRS_PLANNED} cannot be scheduled until a later approved runtime phase.`
    );
  }

  return scheduleCurrentReview(record, outcome, context);
}

export function preserveCurrentRecord(record) {
  return cloneJsonRecord(record);
}

export function isFsrsNewCardEnrollmentEligible({ itemId, toggleEnabled, priorRecord, studyHistoryRecords }) {
  if (!toggleEnabled) return false;
  const safeItemId = String(itemId || '').trim();
  if (!safeItemId) return false;
  if (priorRecord != null) return false;
  const history = Array.isArray(studyHistoryRecords) ? studyHistoryRecords : [];
  const hasHistory = history.some(
    session =>
      Array.isArray(session?.itemResults) &&
      session.itemResults.some(r => String(r?.itemId || '').trim() === safeItemId)
  );
  if (hasHistory) return false;
  return true;
}

export function scheduleDormantFsrsReview(record, outcome, context = {}) {
  const itemId = String(record?.itemId || '').trim();
  if (!itemId) return null;

  const sm2Result = scheduleCurrentReview(record, outcome, context);
  if (!sm2Result) return null;

  const existingPayload = record?.fsrsPayload;
  const fsrsPayload =
    existingPayload && typeof existingPayload === 'object' && !Array.isArray(existingPayload)
      ? JSON.parse(JSON.stringify(existingPayload))
      : { state: 'New', difficulty: 5.0, stability: 1.0, retrievability: 1.0, reps: 0, phase: FSRS_DORMANT_SCHEDULER_VERSION };

  const now = context.now ? toSafeDate(context.now) : new Date();
  const rating = mapOutcomeToFsrsRating(outcome);
  const newLogEntry = { rating, reviewedAt: now.toISOString(), state: 'Dormant', note: 'phase14j-inert-readiness-log' };

  const existingLogs = Array.isArray(record?.fsrsReviewLogs) ? record.fsrsReviewLogs : [];
  const fsrsReviewLogs = [...existingLogs, newLogEntry].slice(-FSRS_REVIEW_LOG_CAP);

  return {
    ...sm2Result,
    schedulerKind: SCHEDULER_KIND_FSRS_PLANNED,
    schedulerVersion: FSRS_DORMANT_SCHEDULER_VERSION,
    fsrsPayload,
    fsrsReviewLogs
  };
}

// Phase 14N: pure predicate — no storage, no scheduling side-effects.
// Returns true only when ALL conditions are met:
// 1. toggleEnabled is true, 2. record.schedulerKind === 'fsrs-planned', 3. record.fsrsPayload present.
// Must be re-evaluated per item at gate time — never cache for a session.
// toggleEnabled must be a boolean — caller resolves toggle state before invoking.
export function shouldShowFsrsTwoStepBridge(record, toggleEnabled) {
  if (toggleEnabled !== true) return false;
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false;
  if (getSchedulerKind(record) !== SCHEDULER_KIND_FSRS_PLANNED) return false;
  if (!record.fsrsPayload || typeof record.fsrsPayload !== 'object' || Array.isArray(record.fsrsPayload)) return false;
  return true;
}
