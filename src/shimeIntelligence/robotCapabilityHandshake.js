import { ROBOT_EXPRESSION_CONTRACT_VERSION } from './robotExpressionContract.js';
import { LEARNING_CAPSULE_VERSION } from './learningStateCapsule.js';
import { findSensitiveKeys } from './shimeEcosystemInvariants.js';

export const ROBOT_CAPABILITY_HANDSHAKE_VERSION = 'shime-robot-capability-handshake-v1';
export const ROBOT_CAPABILITY_PROTOCOL_VERSION = 'shime-robot-protocol-v0';

const UNSAFE_SETUP_KEYS = Object.freeze(['wifiPassword', 'wifiSsid', 'ipAddress', 'accessToken', 'secretKey']);

export function createRobotCapabilityHandshake(input = {}) {
  return {
    handshakeVersion: input.handshakeVersion || ROBOT_CAPABILITY_HANDSHAKE_VERSION,
    appRole: 'shime_quiz',
    robotRole: 'shime_robot',
    protocolVersion: input.protocolVersion || ROBOT_CAPABILITY_PROTOCOL_VERSION,
    capsuleProtocolVersion: input.capsuleProtocolVersion || LEARNING_CAPSULE_VERSION,
    expressionContractVersion: input.expressionContractVersion || ROBOT_EXPRESSION_CONTRACT_VERSION,
    supportsDisplay: input.supportsDisplay !== false,
    supportsLed: input.supportsLed === true,
    supportsSound: input.supportsSound === true,
    supportsPresenceSensor: input.supportsPresenceSensor === true,
    supportsWifi: input.supportsWifi === true,
    supportsBle: input.supportsBle === true,
    supportsSoftAp: input.supportsSoftAp === true,
    supportsUsbSerial: input.supportsUsbSerial === true,
    supportsMdns: input.supportsMdns === true,
    supportsWebSocket: input.supportsWebSocket === true,
    supportsMotion: input.supportsMotion === true,
    motionLocked: input.motionLocked !== false,
    maxCapsuleSizeBucket: input.maxCapsuleSizeBucket || 'tiny',
    privacyMode: input.privacyMode || 'redacted_coarse_only',
    safetyMode: input.safetyMode || 'motion_disabled',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: ['robot_capability_handshake_created']
  };
}

export function validateRobotCapabilityHandshake(handshake = {}) {
  const failures = [];
  if (findSensitiveKeys(handshake).length > 0) failures.push('sensitive_handshake_field');
  UNSAFE_SETUP_KEYS.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(handshake, key)) failures.push(`setup_secret_not_allowed:${key}`);
  });
  if (handshake.handshakeVersion !== ROBOT_CAPABILITY_HANDSHAKE_VERSION) failures.push('handshake_needs_update');
  if (handshake.protocolVersion !== ROBOT_CAPABILITY_PROTOCOL_VERSION) failures.push('protocol_needs_update');
  if (handshake.capsuleProtocolVersion !== LEARNING_CAPSULE_VERSION) failures.push('capsule_protocol_not_supported');
  if (handshake.motionLocked !== true) failures.push('motion_lock_missing_or_false');
  if (handshake.supportsMotion === true && handshake.motionLocked !== true) failures.push('motion_unlocked_not_allowed');
  if (handshake.dryRunOnly !== true) failures.push('handshake_not_dry_run');
  if (handshake.sendStatus !== 'not_sent') failures.push('handshake_send_status_not_safe');
  return {
    ok: failures.length === 0,
    status: failures.length === 0 ? 'accepted_schema_only' : 'rejected_needs_update',
    failures,
    reasonCodes: ['robot_capability_handshake_validated']
  };
}

export function summarizeRobotCapabilityHandshake(handshake = {}) {
  const validation = validateRobotCapabilityHandshake(handshake);
  return {
    handshakeVersion: handshake.handshakeVersion,
    status: validation.status,
    expressionContractVersion: handshake.expressionContractVersion,
    capsuleProtocolVersion: handshake.capsuleProtocolVersion,
    expressionChannels: [
      handshake.supportsDisplay ? 'display' : null,
      handshake.supportsLed ? 'led' : null,
      handshake.supportsSound ? 'sound' : null
    ].filter(Boolean),
    bridgeCapabilities: [
      handshake.supportsWifi ? 'wifi' : null,
      handshake.supportsBle ? 'ble' : null,
      handshake.supportsSoftAp ? 'softap' : null,
      handshake.supportsUsbSerial ? 'usb_dev' : null
    ].filter(Boolean),
    motionLocked: handshake.motionLocked === true,
    dryRunOnly: handshake.dryRunOnly === true,
    sendStatus: handshake.sendStatus || 'not_sent',
    failures: validation.failures,
    reasonCodes: ['robot_capability_handshake_summarized']
  };
}
