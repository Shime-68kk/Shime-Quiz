import { findSensitiveKeys } from './shimeEcosystemInvariants.js';

export const LOCAL_FIRST_CAPSULE_TYPES = Object.freeze([
  'pairing_capsule',
  'presence_capsule',
  'learning_state_capsule',
  'intervention_capsule',
  'capability_capsule',
  'safety_capsule',
  'conflict_hint_capsule'
]);

export function createLocalFirstSyncCapsule(input = {}, options = {}) {
  const sensitive = findSensitiveKeys(input);
  return {
    capsuleType: LOCAL_FIRST_CAPSULE_TYPES.includes(input.capsuleType) ? input.capsuleType : 'safety_capsule',
    capsuleId: options.capsuleId || 'local_capsule_0001',
    version: 'shime-local-first-capsule-v1',
    originDeviceRole: input.originDeviceRole || 'quiz_app',
    targetDeviceRole: input.targetDeviceRole || 'robot',
    privacyClass: sensitive.length > 0 ? 'blocked' : 'redacted_coarse',
    ttlBucket: input.ttlBucket || 'short',
    conflictPolicy: input.conflictPolicy || 'app_authority_wins',
    dryRunOnly: true,
    reasonCodes: sensitive.length > 0 ? ['sensitive_input_blocked'] : ['local_first_capsule_planned']
  };
}
