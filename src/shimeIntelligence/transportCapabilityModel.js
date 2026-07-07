export function createRobotCapabilityProfile(input = {}) {
  return {
    supportsWifi: input.supportsWifi === true,
    supportsBle: input.supportsBle === true,
    supportsSoftAp: input.supportsSoftAp === true,
    supportsUsbSerial: input.supportsUsbSerial === true,
    supportsMdns: input.supportsMdns === true,
    supportsWebSocket: input.supportsWebSocket === true,
    supportsPresenceSensor: input.supportsPresenceSensor === true,
    supportsDisplay: input.supportsDisplay !== false,
    supportsLed: input.supportsLed === true,
    supportsSound: input.supportsSound === true,
    supportsMotion: input.supportsMotion === true,
    motionLocked: input.motionLocked !== false,
    firmwareProtocolVersion: input.firmwareProtocolVersion || 'unknown',
    capsuleProtocolVersion: input.capsuleProtocolVersion || 'shime-learning-state-capsule-v1'
  };
}

export function validateRobotCapabilityProfile(profile = {}) {
  const failures = [];
  if (profile.supportsMotion && profile.motionLocked === false) failures.push('motion_unlocked_not_allowed');
  if (!profile.capsuleProtocolVersion) failures.push('missing_capsule_protocol');
  return { ok: failures.length === 0, failures };
}

export function summarizeRobotCapabilityProfile(profile = {}) {
  return {
    expressionChannels: [
      profile.supportsDisplay ? 'display' : null,
      profile.supportsLed ? 'led' : null,
      profile.supportsSound ? 'sound' : null
    ].filter(Boolean),
    bridgeChannels: [
      profile.supportsWifi ? 'wifi' : null,
      profile.supportsBle ? 'ble' : null,
      profile.supportsSoftAp ? 'softap' : null,
      profile.supportsUsbSerial ? 'usb_dev' : null
    ].filter(Boolean),
    motionLocked: profile.motionLocked !== false,
    capsuleProtocolVersion: profile.capsuleProtocolVersion || 'unknown'
  };
}

export function deriveAllowedActionFamilies(profile = {}, safetyMode = 'motion_disabled') {
  const families = ['neutral_presence', 'do_nothing'];
  if (profile.supportsDisplay || profile.supportsLed || profile.supportsSound) {
    families.push('focus_ritual', 'review_due_nudge', 'memory_risk_nudge', 'gentle_encourage', 'recovery_praise', 'celebrate_stability_gain', 'celebrate_session_complete', 'reconnect_hint', 'calm_error');
  }
  if (safetyMode !== 'classroom_safe') families.push('suggest_break');
  return [...new Set(families)];
}
