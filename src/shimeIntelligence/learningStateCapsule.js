import { extractFsrsMemorySignals } from './fsrsSignalExtractor.js';
import { findSensitiveKeys } from './shimeEcosystemInvariants.js';

export const LEARNING_CAPSULE_VERSION = 'shime-learning-state-capsule-v1';

function safeBucket(value, fallback = 'unknown') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function redactLearningStateCapsule(input = {}) {
  const signals = input.signals || extractFsrsMemorySignals(input.fsrs || input);
  return {
    sessionPhase: safeBucket(input.sessionPhase, 'idle'),
    memoryPressureBucket: signals.memoryPressureBucket,
    duePressureBucket: signals.duePressureBucket,
    retrievabilityBucket: signals.retrievabilityBucket,
    stabilityBucket: signals.stabilityBucket,
    difficultyBucket: signals.difficultyBucket,
    forgettingRiskBucket: signals.forgettingRiskBucket,
    reviewUrgencyBucket: signals.reviewUrgencyBucket,
    recoveryNeedBucket: signals.recoveryNeedBucket,
    habitMomentumBucket: signals.habitMomentumBucket,
    scheduleDriftBucket: signals.scheduleDriftBucket,
    sessionLoadBucket: signals.sessionLoadBucket,
    longTermProgressBucket: signals.longTermProgressBucket,
    robotSupportNeedBucket: signals.robotSupportNeedBucket,
    routineSupportNeedBucket: signals.routineSupportNeedBucket,
    companionIntent: safeBucket(input.companionIntent, 'neutral_wait'),
    allowedActionFamily: safeBucket(input.allowedActionFamily, 'neutral'),
    safetyMode: safeBucket(input.safetyMode, 'motion_disabled'),
    transportHealth: safeBucket(input.transportHealth, 'connected'),
    robotAvailability: safeBucket(input.robotAvailability, 'available'),
    privacyStatus: input.privacyStatus === 'blocked' ? 'blocked' : 'redacted_coarse_only',
    reasonCodes: [...new Set([...(signals.reasonCodes || []), ...(input.reasonCodes || []), 'learning_capsule_redacted'])]
  };
}

export function createLearningStateCapsule(input = {}, options = {}) {
  const sensitive = findSensitiveKeys(input);
  const redacted = redactLearningStateCapsule(input);
  return {
    capsuleVersion: LEARNING_CAPSULE_VERSION,
    capsuleId: options.capsuleId || 'learning_capsule_0001',
    source: 'shime_quiz',
    target: options.target || 'shime_ecosystem',
    ...redacted,
    dryRunOnly: true,
    privacyStatus: sensitive.length > 0 ? 'blocked' : redacted.privacyStatus,
    reasonCodes: sensitive.length > 0
      ? ['sensitive_input_blocked', 'learning_capsule_blocked']
      : redacted.reasonCodes
  };
}

export function validateLearningStateCapsule(capsule = {}) {
  const failures = [];
  if (findSensitiveKeys(capsule).length > 0) failures.push('sensitive_capsule_key');
  if (capsule.capsuleVersion !== LEARNING_CAPSULE_VERSION) failures.push('unknown_capsule_version');
  if (capsule.dryRunOnly !== true) failures.push('capsule_not_dry_run');
  if (!Array.isArray(capsule.reasonCodes) || capsule.reasonCodes.length === 0) failures.push('missing_reason_codes');
  return { ok: failures.length === 0, failures };
}

export function summarizeLearningStateCapsule(capsule = {}) {
  return {
    capsuleVersion: capsule.capsuleVersion,
    source: capsule.source,
    target: capsule.target,
    memoryPressureBucket: capsule.memoryPressureBucket,
    forgettingRiskBucket: capsule.forgettingRiskBucket,
    reviewUrgencyBucket: capsule.reviewUrgencyBucket,
    recoveryNeedBucket: capsule.recoveryNeedBucket,
    robotSupportNeedBucket: capsule.robotSupportNeedBucket,
    routineSupportNeedBucket: capsule.routineSupportNeedBucket,
    companionIntent: capsule.companionIntent,
    allowedActionFamily: capsule.allowedActionFamily,
    privacyStatus: capsule.privacyStatus,
    dryRunOnly: capsule.dryRunOnly === true,
    reasonCodes: [...(capsule.reasonCodes || [])]
  };
}

export function compareLearningStateCapsules(a = {}, b = {}) {
  const fields = [
    'sessionPhase',
    'memoryPressureBucket',
    'duePressureBucket',
    'retrievabilityBucket',
    'stabilityBucket',
    'difficultyBucket',
    'forgettingRiskBucket',
    'reviewUrgencyBucket',
    'recoveryNeedBucket',
    'habitMomentumBucket',
    'scheduleDriftBucket',
    'sessionLoadBucket',
    'longTermProgressBucket',
    'robotSupportNeedBucket',
    'routineSupportNeedBucket',
    'companionIntent',
    'allowedActionFamily',
    'safetyMode',
    'transportHealth',
    'robotAvailability',
    'privacyStatus'
  ];
  const changedFields = fields.filter(field => a[field] !== b[field]);
  return {
    equivalent: changedFields.length === 0,
    changedFields,
    dryRunOnly: true,
    reasonCodes: ['learning_capsules_compared']
  };
}
