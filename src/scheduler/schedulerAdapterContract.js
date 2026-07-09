export const SCHEDULER_PRIVACY_CLASS_LOCAL_ONLY = 'local_only';
export const SCHEDULER_STABILITY_LEVELS = new Set(['stable', 'beta', 'experimental']);
export const SCHEDULER_RATINGS = new Set(['again', 'hard', 'good', 'easy', 'correct', 'wrong', 'unanswered']);
export const SAFE_DECISION_CODES = new Set([
  'SM2_BASELINE',
  'SM2_CORRECT_INTERVAL',
  'SM2_WRONG_RESET',
  'SM2_UNANSWERED_SOON',
  'FSRS_BETA_BASELINE',
  'FSRS_BETA_SHORT_REVIEW',
  'FSRS_BETA_LONG_REVIEW',
  'FSRS_BETA_ROLLBACK_AVAILABLE',
  'FALLBACK_TO_SM2',
  'INPUT_NORMALIZED',
  'OUTPUT_STABLE',
  'INSUFFICIENT_HISTORY',
  'ROLLBACK_REQUIRED',
  'LOCAL_ONLY'
]);

const BLOCKED_INPUT_KEYS = new Set([
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'studyHistory',
  'rawQuizPayload',
  'importedDocumentText',
  'documentText',
  'fsrsReviewLogs',
  'settings'
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nonNegativeInteger(value, fallback = 0) {
  return Math.max(0, Math.floor(finiteNumber(value, fallback)));
}

function safeIso(value, fallback = '2026-01-01T00:00:00.000Z') {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value || fallback);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function normalizeRating(value) {
  const rating = String(value || '').trim().toLowerCase();
  return SCHEDULER_RATINGS.has(rating) ? rating : 'unanswered';
}

function rejectUnsafeKeys(input) {
  if (!isPlainObject(input)) return;
  for (const key of Object.keys(input)) {
    if (BLOCKED_INPUT_KEYS.has(key)) {
      throw new TypeError(`Scheduler input cannot include unsafe field: ${key}`);
    }
  }
}

export function normalizeSchedulerInput(input = {}) {
  if (!isPlainObject(input)) {
    throw new TypeError('Scheduler input must be a plain object.');
  }
  rejectUnsafeKeys(input);

  const cardId = String(input.cardId || '').trim();
  if (!cardId) throw new TypeError('Scheduler input requires cardId.');

  const currentIntervalDays = Math.max(0, finiteNumber(input.currentIntervalDays, 0));
  const repetitionCount = nonNegativeInteger(input.repetitionCount, 0);
  const easeFactor = Math.min(2.8, Math.max(1.3, finiteNumber(input.easeFactor, 2.2)));
  const lastReviewedAt = safeIso(input.lastReviewedAt);
  const elapsedDays = Math.max(0, finiteNumber(input.elapsedDays, currentIntervalDays));
  const localReviewHistorySummary = isPlainObject(input.localReviewHistorySummary)
    ? {
        totalReviews: nonNegativeInteger(input.localReviewHistorySummary.totalReviews, repetitionCount),
        recentCorrectRate: Math.min(1, Math.max(0, finiteNumber(input.localReviewHistorySummary.recentCorrectRate, 0))),
        lapseCount: nonNegativeInteger(input.localReviewHistorySummary.lapseCount, 0)
      }
    : { totalReviews: repetitionCount, recentCorrectRate: 0, lapseCount: 0 };

  return {
    cardId,
    currentIntervalDays,
    repetitionCount,
    easeFactor,
    lastReviewedAt,
    rating: normalizeRating(input.rating),
    elapsedDays,
    localReviewHistorySummary,
    schedulerState: isPlainObject(input.schedulerState) ? JSON.parse(JSON.stringify(input.schedulerState)) : {}
  };
}

export function assertSchedulerOutputSafe(output) {
  if (!isPlainObject(output)) throw new TypeError('Scheduler output must be a plain object.');
  for (const key of Object.keys(output)) {
    if (BLOCKED_INPUT_KEYS.has(key)) throw new TypeError(`Scheduler output cannot include unsafe field: ${key}`);
  }
  if (!String(output.schedulerId || '').trim()) throw new TypeError('Scheduler output requires schedulerId.');
  const nextReviewTime = new Date(output.nextReviewAt || '').getTime();
  if (!Number.isFinite(nextReviewTime)) throw new TypeError('Scheduler output requires valid nextReviewAt.');
  if (finiteNumber(output.intervalDays, -1) < 0) throw new TypeError('Scheduler output intervalDays cannot be negative.');
  if (!Array.isArray(output.decisionCodes)) throw new TypeError('Scheduler output requires decisionCodes.');
  for (const code of output.decisionCodes) {
    if (!SAFE_DECISION_CODES.has(code)) throw new TypeError(`Unsafe scheduler decision code: ${code}`);
  }
  if (output.migrationSafe !== true) throw new TypeError('Scheduler output must be migrationSafe.');
  return true;
}

export function validateSchedulerAdapter(adapter) {
  if (!isPlainObject(adapter)) return { ok: false, error: 'adapter_not_object' };
  const requiredFunctions = ['computeNextReview', 'computeDueCards', 'summarizeWorkload', 'validateInput', 'explainDecision'];
  for (const field of ['schedulerId', 'schedulerVersion', 'stabilityLevel', 'privacyClass']) {
    if (!String(adapter[field] || '').trim()) return { ok: false, error: `missing_${field}` };
  }
  if (!SCHEDULER_STABILITY_LEVELS.has(adapter.stabilityLevel)) return { ok: false, error: 'invalid_stability' };
  if (adapter.privacyClass !== SCHEDULER_PRIVACY_CLASS_LOCAL_ONLY) return { ok: false, error: 'invalid_privacy' };
  if (typeof adapter.supportsRollback !== 'boolean') return { ok: false, error: 'missing_rollback_flag' };
  for (const name of requiredFunctions) {
    if (typeof adapter[name] !== 'function') return { ok: false, error: `missing_${name}` };
  }
  try {
    const sampleInput = normalizeSchedulerInput({
      cardId: 'contract-sample',
      currentIntervalDays: 1,
      repetitionCount: 1,
      easeFactor: 2.2,
      lastReviewedAt: '2026-01-01T00:00:00.000Z',
      rating: 'good',
      elapsedDays: 1
    });
    const output = adapter.computeNextReview(sampleInput);
    assertSchedulerOutputSafe(output);
  } catch (error) {
    return { ok: false, error: 'contract_probe_failed', detail: String(error?.message || error) };
  }
  return { ok: true, adapterId: adapter.schedulerId };
}

export function addDaysIso(baseIso, days) {
  const date = new Date(safeIso(baseIso));
  date.setDate(date.getDate() + Math.max(0, Math.round(finiteNumber(days, 0))));
  return date.toISOString();
}

export function bucketInterval(days) {
  const value = finiteNumber(days, 0);
  if (value <= 1) return 'very_short';
  if (value <= 7) return 'short';
  if (value <= 30) return 'medium';
  return 'long';
}
