import {
  addDaysIso,
  assertSchedulerOutputSafe,
  bucketInterval,
  normalizeSchedulerInput
} from './schedulerAdapterContract.js';

export const SM2_SCHEDULER_ID = 'sm2';
export const SM2_SCHEDULER_VERSION = 'shime-sm2-wrapper-v1';

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function nextCorrectInterval(input) {
  const previousInterval = Math.max(1, Number(input.currentIntervalDays) || 1);
  if (input.repetitionCount <= 0) return 1;
  if (input.repetitionCount === 1) return 3;
  return Math.max(1, Math.round(previousInterval * input.easeFactor));
}

export function computeSm2NextReview(rawInput) {
  const input = normalizeSchedulerInput(rawInput);
  const isCorrect = input.rating === 'correct' || input.rating === 'good' || input.rating === 'easy';
  const isWrong = input.rating === 'wrong' || input.rating === 'again';

  let intervalDays = 1;
  let easeFactor = input.easeFactor;
  let decisionCodes = ['SM2_BASELINE', 'LOCAL_ONLY'];

  if (isCorrect) {
    intervalDays = nextCorrectInterval(input);
    easeFactor = clamp(input.easeFactor + 0.05, 1.3, 2.8, 2.25);
    decisionCodes = [...decisionCodes, 'SM2_CORRECT_INTERVAL', 'OUTPUT_STABLE'];
  } else if (isWrong) {
    intervalDays = 1;
    easeFactor = clamp(input.easeFactor - 0.2, 1.3, 2.8, 2);
    decisionCodes = [...decisionCodes, 'SM2_WRONG_RESET', 'OUTPUT_STABLE'];
  } else {
    intervalDays = 1;
    decisionCodes = [...decisionCodes, 'SM2_UNANSWERED_SOON', 'OUTPUT_STABLE'];
  }

  const output = {
    schedulerId: SM2_SCHEDULER_ID,
    nextReviewAt: addDaysIso(input.lastReviewedAt, intervalDays),
    intervalDays,
    easeFactor,
    stabilityBucket: bucketInterval(intervalDays),
    difficultyBucket: easeFactor < 1.8 ? 'high' : easeFactor > 2.4 ? 'low' : 'medium',
    dueState: intervalDays <= 1 ? 'soon' : 'scheduled',
    workloadBucket: intervalDays <= 1 ? 'high' : intervalDays <= 7 ? 'medium' : 'low',
    decisionCodes,
    migrationSafe: true,
    rollbackHint: 'already_stable_sm2'
  };
  assertSchedulerOutputSafe(output);
  return output;
}

export const sm2SchedulerAdapter = {
  schedulerId: SM2_SCHEDULER_ID,
  schedulerVersion: SM2_SCHEDULER_VERSION,
  stabilityLevel: 'stable',
  privacyClass: 'local_only',
  supportsRollback: true,
  computeNextReview: computeSm2NextReview,
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
      schedulerId: SM2_SCHEDULER_ID,
      dueCount: dueCards.length,
      workloadBucket: dueCards.length >= 30 ? 'high' : dueCards.length >= 10 ? 'medium' : 'low',
      decisionCodes: ['SM2_BASELINE', 'LOCAL_ONLY']
    };
  },
  validateInput(input) {
    normalizeSchedulerInput(input);
    return true;
  },
  explainDecision(input, output) {
    return {
      schedulerId: SM2_SCHEDULER_ID,
      cardId: normalizeSchedulerInput(input).cardId,
      decisionCodes: Array.isArray(output?.decisionCodes) ? output.decisionCodes : ['SM2_BASELINE'],
      explanationCode: 'SM2_STABLE_LOCAL_DECISION'
    };
  }
};

export default sm2SchedulerAdapter;
