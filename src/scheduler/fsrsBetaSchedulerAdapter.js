import {
  addDaysIso,
  assertSchedulerOutputSafe,
  bucketInterval,
  normalizeSchedulerInput
} from './schedulerAdapterContract.js';
import {
  createFsrsSeedPayload,
  getFsrsRetrievability,
  scheduleFsrsReview
} from '../quiz/fsrsWrapper.js';

export const FSRS_BETA_SCHEDULER_ID = 'fsrs-beta';
export const FSRS_BETA_SCHEDULER_VERSION = 'shime-ts-fsrs-5.4.1-fsrs6-beta-v2';

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function mapRating(rating) {
  if (rating === 'again' || rating === 'wrong' || rating === 'unanswered') return 'Again';
  if (rating === 'hard') return 'Hard';
  if (rating === 'easy') return 'Easy';
  return 'Good';
}

function createPayload(input) {
  const algorithmState = input.schedulerState?.algorithmState;
  if (algorithmState && typeof algorithmState === 'object' && !Array.isArray(algorithmState)) {
    return JSON.parse(JSON.stringify(algorithmState));
  }
  if (input.repetitionCount <= 0) {
    return createFsrsSeedPayload(input.reviewedAt, { enableFuzz: false });
  }

  const intervalDays = Math.max(1, Math.round(input.currentIntervalDays || 1));
  return {
    due: addDaysIso(input.lastReviewedAt, intervalDays),
    stability: clamp(input.schedulerState.stability, 0.01, 36500, intervalDays),
    difficulty: clamp(input.schedulerState.difficulty, 1, 10, input.easeFactor < 1.8 ? 7 : 5),
    elapsedDays: Math.max(0, Math.round(input.elapsedDays)),
    scheduledDays: intervalDays,
    reps: input.repetitionCount,
    lapses: input.localReviewHistorySummary.lapseCount,
    learningSteps: 0,
    state: 'Review',
    lastReview: input.lastReviewedAt
  };
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
  const reviewDate = input.reviewedAt;
  const schedulerOptions = {
    enableFuzz: input.schedulerState?.options?.enableFuzz ?? false,
    requestRetention: input.schedulerState?.options?.requestRetention,
    maximumInterval: input.schedulerState?.options?.maximumInterval,
    enableShortTerm: input.schedulerState?.options?.enableShortTerm
  };
  const result = scheduleFsrsReview(
    createPayload(input),
    mapRating(input.rating),
    reviewDate,
    schedulerOptions
  );
  const intervalDays = result.intervalDays;
  const difficulty = clamp(result.card.difficulty, 1, 10, 5);
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
    nextReviewAt: result.dueAt,
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
  output.schedulerState = {
    schemaVersion: 1,
    algorithmState: result.card.fsrsPayload,
    reviewLog: result.reviewLog,
    retrievability: result.card.retrievability
  };
  assertSchedulerOutputSafe(output);
  return output;
}

export const fsrsBetaSchedulerAdapter = {
  schedulerId: FSRS_BETA_SCHEDULER_ID,
  schedulerVersion: FSRS_BETA_SCHEDULER_VERSION,
  stateSchemaVersion: 1,
  decisionCodePrefix: 'FSRS_',
  stabilityLevel: 'beta',
  privacyClass: 'local_only',
  supportsRollback: true,
  requiresExplicitOptIn: true,
  capabilities: ['schedule', 'due-cards', 'workload', 'explain', 'retrievability'],
  migrateState(state = {}) {
    const safeState = state && typeof state === 'object' && !Array.isArray(state) ? state : {};
    return { ...safeState, schemaVersion: 1 };
  },
  getRetrievability(record, now = new Date()) {
    const payload = record?.schedulerState?.algorithmState || record?.fsrsPayload;
    if (!payload || typeof payload !== 'object') return null;
    return getFsrsRetrievability(payload, now);
  },
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
