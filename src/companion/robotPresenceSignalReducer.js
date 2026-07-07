import {
  BUCKETS,
  collectForbiddenCompanionKeys,
  safeBucket
} from './companionContextSchema.js';

export function reduceRobotPresenceSignal(signal = {}, previousState = {}) {
  const forbidden = collectForbiddenCompanionKeys(signal);
  if (forbidden.length > 0) {
    return { ok: false, state: previousState, issues: forbidden };
  }

  const sensorHealth = ['unknown', 'healthy', 'degraded', 'offline'].includes(signal.sensorHealth)
    ? signal.sensorHealth
    : 'unknown';

  const robotAvailability = sensorHealth === 'offline'
    ? 'offline'
    : sensorHealth === 'degraded'
      ? 'unhealthy'
      : safeBucket(signal.robotAvailability, BUCKETS.AVAILABILITY, previousState.robotAvailability || 'unknown');

  return {
    ok: true,
    state: {
      presenceBucket: safeBucket(signal.presenceBucket, BUCKETS.PRESENCE, previousState.presenceBucket || 'unknown'),
      distanceBucket: ['unknown', 'far', 'near', 'very_near'].includes(signal.distanceBucket) ? signal.distanceBucket : 'unknown',
      approachVelocityBucket: safeBucket(signal.approachVelocityBucket, BUCKETS.APPROACH, previousState.approachVelocityBucket || 'unknown'),
      interactionConfidenceBucket: safeBucket(signal.confidenceBucket || signal.interactionConfidenceBucket, BUCKETS.CONFIDENCE, previousState.interactionConfidenceBucket || 'unknown'),
      sensorHealth,
      robotAvailability
    },
    issues: []
  };
}
