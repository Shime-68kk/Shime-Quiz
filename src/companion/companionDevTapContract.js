import { FORBIDDEN_COMPANION_KEYS } from './companionContextSchema.js';

export const COMPANION_DEV_TAP_STATES = Object.freeze({
  DISABLED: 'disabled',
  ENABLED: 'enabled',
  PAUSED: 'paused',
  ERROR: 'error'
});

export const COMPANION_DEV_TAP_MODES = Object.freeze({
  OBSERVE_ONLY: 'observe_only',
  TRANSCRIPT_ONLY: 'transcript_only'
});

export const COMPANION_DEV_TAP_PRIVACY_MODES = Object.freeze({
  REDACTED_ONLY: 'redacted_only'
});

export const COMPANION_DEV_TAP_FORBIDDEN_KEYS = FORBIDDEN_COMPANION_KEYS;

export function createCompanionDevTapSnapshot(fields = {}) {
  return {
    enabled: fields.enabled === true,
    state: fields.state || COMPANION_DEV_TAP_STATES.DISABLED,
    mode: fields.mode || COMPANION_DEV_TAP_MODES.OBSERVE_ONLY,
    privacyMode: COMPANION_DEV_TAP_PRIVACY_MODES.REDACTED_ONLY,
    observedEventCount: fields.observedEventCount || 0,
    acceptedEventCount: fields.acceptedEventCount || 0,
    rejectedEventCount: fields.rejectedEventCount || 0,
    transcriptCount: fields.transcriptCount || 0,
    lastInputEventType: fields.lastInputEventType || null,
    lastCompanionIntent: fields.lastCompanionIntent || null,
    lastRobotCommand: fields.lastRobotCommand || null,
    lastSafetyOutcome: fields.lastSafetyOutcome || null,
    lastError: fields.lastError || null
  };
}
