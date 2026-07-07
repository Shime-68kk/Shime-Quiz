import { findSensitiveKeys } from './shimeEcosystemInvariants.js';

export const ROBOT_EXPRESSION_CONTRACT_VERSION = 'shime-robot-expression-contract-v1';

export const ALLOWED_ROBOT_EXPRESSION_CHANNELS = Object.freeze([
  'display_expression',
  'led_expression',
  'sound_cue',
  'idle_presence',
  'attention_hint',
  'no_op'
]);

export const FORBIDDEN_ROBOT_EXPRESSION_CHANNELS = Object.freeze([
  'motor_motion',
  'wheel_motion',
  'servo_motion',
  'physical_push',
  'autonomous_navigation',
  'camera_capture',
  'microphone_capture',
  'raw_data_display',
  'speech_from_raw_content',
  'schedule_mutation',
  'notification_send',
  'robot_command_send'
]);

export const ALLOWED_ROBOT_EXPRESSION_FAMILIES = Object.freeze([
  'neutral_presence',
  'focus_ritual',
  'review_due_nudge',
  'memory_risk_nudge',
  'gentle_encourage',
  'recovery_praise',
  'celebrate_stability_gain',
  'celebrate_session_complete',
  'suggest_break_soft',
  'reconnect_hint',
  'calm_error',
  'do_nothing'
]);

function normalizeFamily(value) {
  if (ALLOWED_ROBOT_EXPRESSION_FAMILIES.includes(value)) return value;
  if (value === 'suggest_break') return 'suggest_break_soft';
  return 'neutral_presence';
}

function normalizeChannels(channels = []) {
  const safe = (Array.isArray(channels) ? channels : [])
    .filter(channel => ALLOWED_ROBOT_EXPRESSION_CHANNELS.includes(channel));
  return safe.length > 0 ? [...new Set(safe)] : ['no_op'];
}

export function getAllowedRobotExpressionFamilies() {
  return [...ALLOWED_ROBOT_EXPRESSION_FAMILIES];
}

export function createRobotExpressionContract(input = {}, options = {}) {
  const sensitive = findSensitiveKeys(input);
  const expressionFamily = sensitive.length > 0 ? 'calm_error' : normalizeFamily(input.expressionFamily);
  const requestedChannels = options.allowedChannels || input.allowedChannels || ['display_expression', 'idle_presence'];
  return {
    contractVersion: ROBOT_EXPRESSION_CONTRACT_VERSION,
    expressionFamily,
    allowedChannels: normalizeChannels(requestedChannels),
    forbiddenChannels: [...FORBIDDEN_ROBOT_EXPRESSION_CHANNELS],
    intensityBucket: input.intensityBucket || 'low',
    classroomSafe: input.classroomSafe === true,
    motionPolicy: 'locked',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    privacyStatus: sensitive.length > 0 ? 'blocked' : input.privacyStatus || 'redacted_coarse_only',
    safetyStatus: sensitive.length > 0 ? 'blocked' : input.safetyStatus || 'allowed_dry_run',
    reasonCodes: sensitive.length > 0
      ? ['sensitive_expression_input_blocked']
      : [...new Set([...(input.reasonCodes || []), 'robot_expression_contract_created'])]
  };
}

export function validateRobotExpressionContract(contract = {}) {
  const failures = [];
  if (findSensitiveKeys(contract).length > 0) failures.push('sensitive_expression_contract');
  if (contract.contractVersion !== ROBOT_EXPRESSION_CONTRACT_VERSION) failures.push('unknown_expression_contract_version');
  if (!ALLOWED_ROBOT_EXPRESSION_FAMILIES.includes(contract.expressionFamily)) failures.push('expression_family_not_allowed');
  if (!Array.isArray(contract.allowedChannels) || contract.allowedChannels.length === 0) failures.push('missing_allowed_channels');
  (contract.allowedChannels || []).forEach(channel => {
    if (!ALLOWED_ROBOT_EXPRESSION_CHANNELS.includes(channel)) failures.push(`channel_not_allowed:${channel}`);
    if (FORBIDDEN_ROBOT_EXPRESSION_CHANNELS.includes(channel)) failures.push(`forbidden_channel:${channel}`);
  });
  if (contract.motionPolicy !== 'locked') failures.push('motion_not_locked');
  if (contract.dryRunOnly !== true) failures.push('expression_not_dry_run');
  if (contract.sendStatus !== 'not_sent') failures.push('expression_send_status_not_safe');
  if (!Array.isArray(contract.reasonCodes) || contract.reasonCodes.length === 0) failures.push('missing_reason_codes');
  return { ok: failures.length === 0, failures, reasonCodes: ['robot_expression_contract_validated'] };
}

export function summarizeRobotExpressionContract(contract = {}) {
  return {
    contractVersion: contract.contractVersion,
    expressionFamily: contract.expressionFamily || 'neutral_presence',
    allowedChannelCount: Array.isArray(contract.allowedChannels) ? contract.allowedChannels.length : 0,
    intensityBucket: contract.intensityBucket || 'low',
    classroomSafe: contract.classroomSafe === true,
    motionPolicy: contract.motionPolicy || 'locked',
    dryRunOnly: contract.dryRunOnly === true,
    sendStatus: contract.sendStatus || 'not_sent',
    privacyStatus: contract.privacyStatus || 'unknown',
    safetyStatus: contract.safetyStatus || 'unknown',
    reasonCodes: [...(contract.reasonCodes || [])]
  };
}
