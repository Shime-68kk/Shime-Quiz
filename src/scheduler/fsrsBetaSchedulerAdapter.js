import {
  addDaysIso,
  assertSchedulerOutputSafe,
  bucketInterval,
  normalizeSchedulerInput
} from './schedulerAdapterContract.js';

export const FSRS_BETA_SCHEDULER_ID = 'fsrs-beta';
export const FSRS_BETA_SCHEDULER_VERSION = 'shime-fsrs-beta-wrapper-v1';

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function getBetaInterval(input) {
  const history = input.localReviewHistorySummary;
  const base = Math.max(1, input.currentIntervalDays || 1);
  const stability = clamp(input.schedulerState.stability, 0.5, 90, base);
  const correctRate = history.recentCorrectRate;

  if (input.rating === 'again' || input.rating === 'wrong') return 1;
  if (input.rating === 'hard') return Math.max(1, Math.round(Math.min(base, stability) * 0.7));
  if (input.rating === 'easy') return Math.max(2, Math.round(Math.max(base + 1, stability * 1.8)));
  if (correctRate >= 0.85 && history.totalReviews >= 3) return Math.max(2, Math.round(stability * 1.35));
  return Math.max(1, Math.round(stability));
}

export function getFsrsBetaReadinessStatus(evidence = {}) {
  const passed =
    evidence.deterministicOutputPass === true &&
    evidence.dueCountSanityPass === true &&
    evidence.rollbackAvailablePass === true &&
    evidence.userOptInRequiredPass === true;
  const blocked = evidence.noNegativeIntervalPass === false || evidence.noImpossibleNextReviewAtPass === false;
  if (blocked) return 'fsrs_beta_blocked';
  return passed ? 'fsrs_beta_ready_for_internal_testing' : 'fsrs_beta_needs_more_evidence';
}

export function computeFsrsBetaNextReview(rawInput) {
  const input = normalizeSchedulerInput(rawInput);
  const intervalDays = getBetaInterval(input);
  const difficulty = clamp(input.schedulerState.difficulty, 1, 10, input.easeFactor < 1.8 ? 7 : 5);
  const decisionCodes = [
    'FSRS_BETA_BASELINE',
    intervalDays <= 3 ? 'FSRS_BETA_SHORT_REVIEW' : 'FSRS_BETA_LONG_REVIEW',
    'FSRS_BETA_ROLLBACK_AVAILABLE',
    'LOCAL_ONLY',
    'OUTPUT_STABLE'
  ];
  if (input.localReviewHistorySummary.totalReviews < 2) decisionCodes.push('INSUFFICIENT_HISTORY');

  const output = {
    schedulerId: FSRS_BETA_SCHEDULER_ID,
    nextReviewAt: addDaysIso(input.lastReviewedAt, intervalDays),
    intervalDays,
    easeFactor: input.easeFactor,
    stabilityBucket: bucketInterval(intervalDays),
    difficultyBucket: difficulty >= 7 ? 'high' : difficulty <= 3 ? 'low' : 'medium',
    dueState: intervalDays <= 1 ? 'soon' : 'scheduled',
    workloadBucket: intervalDays <= 1 ? 'high' : intervalDays <= 7 ? 'medium' : 'low',
    decisionCodes,
    migrationSafe: true,
    rollbackHint: 'rollback_to_sm2_available'
  };
  assertSchedulerOutputSafe(output);
  return output;
}

export const fsrsBetaSchedulerAdapter = {
  schedulerId: FSRS_BETA_SCHEDULER_ID,
  schedulerVersion: FSRS_BETA_SCHEDULER_VERSION,
  stabilityLevel: 'beta',
  privacyClass: 'local_only',
  supportsRollback: true,
  requiresExplicitOptIn: true,
  computeNextReview: computeFsrsBetaNextReview,
  computeDueCards(input = {}) {
    const nowTime = new Date(input.now || Date.now()).getTime();
    const cards = Array.isArray(input.cards) ? input.cards : [];
    return cards.filter(card => {
      const dueTime = new Date(card?.dueAt || card?.nextReviewAt || '').getTime();
      return Number.isFinite(dueTime) && dueTime <= nowTime;
    });
  },
  summarizeWorkload(input = {}) {
    const dueCards = this.computeDueCards(input);
    return {
      schedulerId: FSRS_BETA_SCHEDULER_ID,
      dueCount: dueCards.length,
      workloadBucket: dueCards.length >= 25 ? 'high' : dueCards.length >= 8 ? 'medium' : 'low',
      decisionCodes: ['FSRS_BETA_BASELINE', 'FSRS_BETA_ROLLBACK_AVAILABLE', 'LOCAL_ONLY']
    };
  },
  validateInput(input) {
    normalizeSchedulerInput(input);
    return true;
  },
  explainDecision(input, output) {
    return {
      schedulerId: FSRS_BETA_SCHEDULER_ID,
      cardId: normalizeSchedulerInput(input).cardId,
      decisionCodes: Array.isArray(output?.decisionCodes) ? output.decisionCodes : ['FSRS_BETA_BASELINE'],
      explanationCode: 'FSRS_BETA_LOCAL_PREVIEW_DECISION'
    };
  }
};

export default fsrsBetaSchedulerAdapter;
