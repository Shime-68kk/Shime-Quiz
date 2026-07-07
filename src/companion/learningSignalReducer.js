import {
  BUCKETS,
  collectForbiddenCompanionKeys,
  safeBucket
} from './companionContextSchema.js';

export const COMPANION_LEARNING_EVENT_TYPES = Object.freeze([
  'session_started',
  'question_presented',
  'answer_correct',
  'answer_wrong',
  'review_due',
  'session_complete',
  'bridge_error'
]);

function progressBucket(progressCount, totalCount) {
  const progress = Number(progressCount);
  const total = Number(totalCount);
  if (!Number.isFinite(progress) || !Number.isFinite(total) || total <= 0) return 'none';
  if (progress <= 0) return 'start';
  const ratio = progress / total;
  if (ratio >= 1) return 'complete';
  if (ratio >= 0.66) return 'late';
  if (ratio >= 0.33) return 'middle';
  return 'early';
}

function accuracyBucket(value) {
  return safeBucket(value, BUCKETS.ACCURACY, 'unknown');
}

function reviewUrgencyBucket(dueCountBucket) {
  if (['none', '0'].includes(dueCountBucket)) return 'none';
  if (['1_5', 'low'].includes(dueCountBucket)) return 'low';
  if (['6_20', 'medium'].includes(dueCountBucket)) return 'medium';
  if (['20_plus', 'high'].includes(dueCountBucket)) return 'high';
  return 'none';
}

export function reduceLearningSignal(event = {}, previousState = {}) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    return {
      ok: false,
      state: previousState,
      issues: [{ code: 'invalid_learning_event', message: 'Learning event must be an object.', path: '$' }]
    };
  }

  const forbidden = collectForbiddenCompanionKeys(event);
  if (forbidden.length > 0) {
    return { ok: false, state: previousState, issues: forbidden };
  }

  if (!COMPANION_LEARNING_EVENT_TYPES.includes(event.eventType)) {
    return {
      ok: false,
      state: previousState,
      issues: [{ code: 'unknown_learning_event_type', message: 'Learning event type is not supported by companion reducer.', path: '$.eventType' }]
    };
  }

  const payload = event.payload || {};
  const base = {
    sessionPhase: previousState.sessionPhase || 'idle',
    itemType: previousState.itemType || 'unknown',
    progressBucket: previousState.progressBucket || 'none',
    reviewUrgencyBucket: previousState.reviewUrgencyBucket || 'none',
    accuracyBucket: previousState.accuracyBucket || 'unknown',
    momentumBucket: previousState.momentumBucket || 'unknown',
    frustrationRiskBucket: previousState.frustrationRiskBucket || 'unknown',
    focusRiskBucket: previousState.focusRiskBucket || 'unknown',
    transportStatus: previousState.transportStatus || 'unknown'
  };

  const next = { ...base };
  if (payload.itemType) next.itemType = safeBucket(payload.itemType, BUCKETS.ITEM_TYPE, 'unknown');
  if (payload.transportStatus) next.transportStatus = safeBucket(payload.transportStatus, BUCKETS.TRANSPORT, 'unknown');
  next.progressBucket = progressBucket(payload.progressCount, payload.totalCount) || next.progressBucket;

  switch (event.eventType) {
    case 'session_started':
      next.sessionPhase = 'starting';
      next.momentumBucket = 'steady';
      break;
    case 'question_presented':
      next.sessionPhase = 'question';
      break;
    case 'answer_correct':
      next.sessionPhase = 'answering';
      next.momentumBucket = ['positive', 'streak'].includes(previousState.momentumBucket) ? 'streak' : 'positive';
      next.frustrationRiskBucket = 'low';
      break;
    case 'answer_wrong':
      next.sessionPhase = 'answering';
      next.momentumBucket = 'cool';
      next.frustrationRiskBucket = previousState.frustrationRiskBucket === 'medium' ? 'high' : 'medium';
      break;
    case 'review_due':
      next.sessionPhase = 'review';
      next.reviewUrgencyBucket = reviewUrgencyBucket(payload.dueCountBucket);
      break;
    case 'session_complete':
      next.sessionPhase = 'complete';
      next.progressBucket = 'complete';
      next.accuracyBucket = accuracyBucket(payload.accuracyBucket || payload.scoreBucket);
      break;
    case 'bridge_error':
      next.sessionPhase = 'error';
      break;
    default:
      break;
  }

  return { ok: true, state: next, issues: [] };
}
