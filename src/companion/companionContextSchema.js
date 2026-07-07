export const COMPANION_CONTEXT_VERSION = 'shime-companion-context-v0';

export const FORBIDDEN_COMPANION_KEYS = Object.freeze([
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'importedDocumentText',
  'studyHistory',
  'backupPayload',
  'rawQuizPayload',
  'wifiCredentials',
  'cameraFrames',
  'audioRecordings',
  'biometricIdentity',
  'settings'
]);

export const BUCKETS = Object.freeze({
  SESSION_PHASE: ['idle', 'starting', 'question', 'answering', 'review', 'complete', 'error'],
  ITEM_TYPE: ['unknown', 'flashcard', 'multiple_choice', 'short_answer', 'true_false'],
  PROGRESS: ['none', 'start', 'early', 'middle', 'late', 'complete'],
  ACCURACY: ['unknown', 'low', 'mixed', 'high'],
  MOMENTUM: ['unknown', 'cool', 'steady', 'positive', 'streak'],
  RISK: ['unknown', 'low', 'medium', 'high'],
  REVIEW_URGENCY: ['none', 'low', 'medium', 'high'],
  PRESENCE: ['unknown', 'absent', 'near', 'approaching', 'present'],
  APPROACH: ['unknown', 'still', 'leaving', 'approaching_slow', 'approaching_fast'],
  CONFIDENCE: ['unknown', 'low', 'medium', 'high'],
  AVAILABILITY: ['unknown', 'available', 'busy', 'offline', 'unhealthy'],
  TRANSPORT: ['unknown', 'disabled', 'disconnected', 'connecting', 'connected', 'error'],
  SAFETY_MODE: ['privacy_locked', 'classroom_safe', 'motion_disabled', 'expression_only', 'future_motion_review']
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function issue(code, message, path = '$') {
  return { code, message, path };
}

export function collectForbiddenCompanionKeys(value, path = '$', found = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectForbiddenCompanionKeys(entry, `${path}[${index}]`, found));
    return found;
  }

  if (!value || typeof value !== 'object') return found;

  Object.entries(value).forEach(([key, entry]) => {
    const nextPath = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (FORBIDDEN_COMPANION_KEYS.includes(key)) {
      found.push(issue('forbidden_companion_key', `Forbidden companion key: ${key}`, nextPath));
    }
    collectForbiddenCompanionKeys(entry, nextPath, found);
  });

  return found;
}

export function safeBucket(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

export function createDefaultCompanionContext(input = {}) {
  const learningState = input.learningState || {};
  const sessionState = input.sessionState || {};
  const performanceState = input.performanceState || {};
  const robotPresenceState = input.robotPresenceState || {};
  const safetyState = input.safetyState || {};

  return {
    protocolVersion: COMPANION_CONTEXT_VERSION,
    contextId: typeof input.contextId === 'string' && input.contextId.trim() ? input.contextId : 'companion_context',
    timestamp: typeof input.timestamp === 'string' && input.timestamp.trim() ? input.timestamp : '1970-01-01T00:00:00.000Z',
    learningState: {
      sessionPhase: safeBucket(learningState.sessionPhase, BUCKETS.SESSION_PHASE, 'idle'),
      itemType: safeBucket(learningState.itemType, BUCKETS.ITEM_TYPE, 'unknown'),
      progressBucket: safeBucket(learningState.progressBucket, BUCKETS.PROGRESS, 'none'),
      reviewUrgencyBucket: safeBucket(learningState.reviewUrgencyBucket, BUCKETS.REVIEW_URGENCY, 'none')
    },
    sessionState: {
      transportStatus: safeBucket(sessionState.transportStatus, BUCKETS.TRANSPORT, 'unknown')
    },
    performanceState: {
      accuracyBucket: safeBucket(performanceState.accuracyBucket, BUCKETS.ACCURACY, 'unknown'),
      momentumBucket: safeBucket(performanceState.momentumBucket, BUCKETS.MOMENTUM, 'unknown'),
      frustrationRiskBucket: safeBucket(performanceState.frustrationRiskBucket, BUCKETS.RISK, 'unknown'),
      focusRiskBucket: safeBucket(performanceState.focusRiskBucket, BUCKETS.RISK, 'unknown')
    },
    robotPresenceState: {
      presenceBucket: safeBucket(robotPresenceState.presenceBucket, BUCKETS.PRESENCE, 'unknown'),
      approachVelocityBucket: safeBucket(robotPresenceState.approachVelocityBucket, BUCKETS.APPROACH, 'unknown'),
      interactionConfidenceBucket: safeBucket(robotPresenceState.interactionConfidenceBucket, BUCKETS.CONFIDENCE, 'unknown'),
      robotAvailability: safeBucket(robotPresenceState.robotAvailability, BUCKETS.AVAILABILITY, 'unknown')
    },
    safetyState: {
      safetyMode: safeBucket(safetyState.safetyMode, BUCKETS.SAFETY_MODE, 'motion_disabled'),
      privacyLock: safetyState.privacyLock !== false,
      motionAllowed: safetyState.motionAllowed === true,
      childSafeMode: safetyState.childSafeMode !== false
    },
    userExperienceMode: typeof input.userExperienceMode === 'string' ? input.userExperienceMode : 'calm_companion'
  };
}

export function validateCompanionContext(context) {
  if (!isPlainObject(context)) {
    return { ok: false, context: null, issues: [issue('context_not_object', 'Companion context must be an object.')] };
  }

  const forbidden = collectForbiddenCompanionKeys(context);
  if (forbidden.length > 0) {
    return { ok: false, context: null, issues: forbidden };
  }

  const normalized = createDefaultCompanionContext(context);
  return { ok: true, context: normalized, issues: [] };
}
