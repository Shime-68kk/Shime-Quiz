import { collectForbiddenCompanionKeys } from './companionContextSchema.js';

const MAX_REASONS = 8;

function bucketCount(count) {
  if (count <= 0) return 'none';
  if (count === 1) return 'one';
  if (count === 2) return 'two';
  return 'three_plus';
}

function streakBucket(count) {
  if (count <= 0) return 'none';
  if (count < 3) return 'small';
  if (count < 5) return 'medium';
  return 'large';
}

function completionQuality(correct, wrong, explicitBucket) {
  if (['low', 'mixed', 'high'].includes(explicitBucket)) return explicitBucket;
  const total = correct + wrong;
  if (total <= 0) return 'unknown';
  const ratio = correct / total;
  if (ratio >= 0.8) return 'high';
  if (ratio >= 0.5) return 'mixed';
  return 'low';
}

function struggleBucket(wrong, repeatedWrong) {
  if (wrong <= 0) return 'none';
  if (repeatedWrong >= 3 || wrong >= 4) return 'high';
  if (repeatedWrong >= 2 || wrong >= 2) return 'medium';
  return 'low';
}

function recoveryBucket(state, eventType) {
  if (eventType !== 'answer_correct') return state.recoveryBucket;
  if (state.answerWrongCount <= 0) return 'none';
  if (state.repeatedWrongCount >= 2) return 'strong';
  return 'small';
}

function phaseForEvent(eventType) {
  return {
    session_started: 'starting',
    question_presented: 'question',
    answer_correct: 'answering',
    answer_wrong: 'answering',
    review_due: 'review',
    session_complete: 'complete',
    bridge_error: 'error'
  }[eventType] || 'idle';
}

export function createInitialCompanionSessionState(options = {}) {
  return {
    sessionPhase: options.sessionPhase || 'idle',
    eventCount: 0,
    questionCount: 0,
    answerCorrectCount: 0,
    answerWrongCount: 0,
    repeatedWrongCount: 0,
    correctStreakCount: 0,
    repeatedWrongCountBucket: 'none',
    correctStreakBucket: 'none',
    struggleBucket: 'none',
    recoveryBucket: 'none',
    reviewUrgencyBucket: 'none',
    completionQualityBucket: 'unknown',
    transportHealth: options.transportHealth || 'connected',
    robotAvailability: options.robotAvailability || 'available',
    safetyMode: options.safetyMode || 'motion_disabled',
    lastEventType: null,
    lastIntent: null,
    lastCommand: null,
    recentReasonCodes: [],
    rejected: false,
    rejectedReason: null
  };
}

export function resetCompanionSessionState(options = {}) {
  return createInitialCompanionSessionState(options);
}

export function reduceCompanionSessionEvent(state = createInitialCompanionSessionState(), event = {}, options = {}) {
  const forbidden = collectForbiddenCompanionKeys(event);
  if (forbidden.length > 0) {
    return {
      ...state,
      eventCount: state.eventCount + 1,
      sessionPhase: 'error',
      lastEventType: event?.eventType || 'unknown',
      rejected: true,
      rejectedReason: 'forbidden_companion_key',
      recentReasonCodes: ['forbidden_companion_key', ...state.recentReasonCodes].slice(0, MAX_REASONS)
    };
  }

  const payload = event?.payload || {};
  const eventType = event?.eventType || 'unknown';
  const answerCorrectCount = state.answerCorrectCount + (eventType === 'answer_correct' ? 1 : 0);
  const answerWrongCount = state.answerWrongCount + (eventType === 'answer_wrong' ? 1 : 0);
  const repeatedWrongCount = eventType === 'answer_wrong' ? state.repeatedWrongCount + 1 : eventType === 'answer_correct' ? 0 : state.repeatedWrongCount;
  const correctStreakCount = eventType === 'answer_correct' ? state.correctStreakCount + 1 : eventType === 'answer_wrong' ? 0 : state.correctStreakCount;
  const reasonCodes = options.reasonCodes || [];

  return {
    ...state,
    eventCount: state.eventCount + 1,
    questionCount: state.questionCount + (eventType === 'question_presented' ? 1 : 0),
    answerCorrectCount,
    answerWrongCount,
    repeatedWrongCount,
    correctStreakCount,
    repeatedWrongCountBucket: bucketCount(repeatedWrongCount),
    correctStreakBucket: streakBucket(correctStreakCount),
    struggleBucket: struggleBucket(answerWrongCount, repeatedWrongCount),
    recoveryBucket: recoveryBucket(state, eventType),
    reviewUrgencyBucket: payload.dueCountBucket === '20_plus' ? 'high' : payload.dueCountBucket ? 'medium' : state.reviewUrgencyBucket,
    completionQualityBucket: eventType === 'session_complete'
      ? completionQuality(answerCorrectCount, answerWrongCount, payload.accuracyBucket || payload.scoreBucket)
      : state.completionQualityBucket,
    transportHealth: payload.transportStatus || (eventType === 'bridge_error' ? 'error' : state.transportHealth),
    robotAvailability: options.robotAvailability || state.robotAvailability,
    safetyMode: options.safetyMode || state.safetyMode,
    sessionPhase: phaseForEvent(eventType),
    lastEventType: eventType,
    lastIntent: options.intent || state.lastIntent,
    lastCommand: options.command || state.lastCommand,
    recentReasonCodes: [...reasonCodes, ...state.recentReasonCodes].slice(0, MAX_REASONS),
    rejected: false,
    rejectedReason: null
  };
}

export function getCompanionSessionSnapshot(state = createInitialCompanionSessionState()) {
  const {
    repeatedWrongCount,
    correctStreakCount,
    ...snapshot
  } = state;
  return {
    ...snapshot,
    recentReasonCodes: [...(snapshot.recentReasonCodes || [])]
  };
}

