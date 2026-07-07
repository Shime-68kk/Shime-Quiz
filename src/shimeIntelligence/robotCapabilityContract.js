export const ROBOT_CAPABILITY_LEVELS = Object.freeze([
  'none',
  'display_only',
  'led_expression',
  'sound_expression',
  'presence_sensor',
  'connectivity_bridge',
  'expression_robot',
  'motion_capable_locked',
  'motion_capable_unlocked_future_only'
]);

export function normalizeRobotCapabilityLevel(value) {
  return ROBOT_CAPABILITY_LEVELS.includes(value) ? value : 'none';
}

export function validateRobotCapabilityContract(contract = {}) {
  const level = normalizeRobotCapabilityLevel(contract.capabilityLevel);
  const failures = [];
  if (level === 'motion_capable_unlocked_future_only') failures.push('future_motion_not_allowed');
  if (contract.motionLocked === false) failures.push('motion_must_remain_locked');
  return { ok: failures.length === 0, failures, level };
}

export function createRobotCapabilityContract(input = {}) {
  const level = normalizeRobotCapabilityLevel(input.capabilityLevel);
  return {
    contractVersion: 'shime-robot-capability-contract-v1',
    capabilityLevel: level,
    expressionOnly: !['none'].includes(level),
    bridgePlanningOnly: level === 'connectivity_bridge',
    motionLocked: true,
    rejectUnknownCapsuleVersions: true,
    rejectSensitiveCapsuleFields: true,
    reasonCodes: ['robot_capability_contract_created']
  };
}
