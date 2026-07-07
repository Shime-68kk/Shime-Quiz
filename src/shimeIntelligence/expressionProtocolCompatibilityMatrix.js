import { LEARNING_CAPSULE_VERSION } from './learningStateCapsule.js';
import { ROBOT_EXPRESSION_CONTRACT_VERSION } from './robotExpressionContract.js';
import { ROBOT_EXPRESSION_PROTOCOL_VERSION } from './robotExpressionEnvelopeValidator.js';

export const ESP32_LOG_ONLY_CONTRACT_VERSION = '1.0.0';
export const FIRMWARE_PARSER_READINESS_VERSION = 'host-log-only-0.1.0';

function major(version = '') {
  return String(version).split('.')[0];
}

function semverCompatible(actual, expected) {
  if (!actual || !expected) return false;
  return major(actual) === major(expected);
}

export function createExpressionProtocolCompatibilityMatrix(input = {}) {
  const versions = {
    expressionEnvelopeVersion: input.expressionEnvelopeVersion ?? ROBOT_EXPRESSION_PROTOCOL_VERSION,
    capsuleProtocolVersion: input.capsuleProtocolVersion ?? LEARNING_CAPSULE_VERSION,
    expressionContractVersion: input.expressionContractVersion ?? ROBOT_EXPRESSION_CONTRACT_VERSION,
    esp32LogOnlyContractVersion: input.esp32LogOnlyContractVersion ?? ESP32_LOG_ONLY_CONTRACT_VERSION,
    firmwareParserVersion: input.firmwareParserVersion ?? FIRMWARE_PARSER_READINESS_VERSION
  };
  const incompatibleVersions = [];
  if (!semverCompatible(versions.expressionEnvelopeVersion, ROBOT_EXPRESSION_PROTOCOL_VERSION)) incompatibleVersions.push('expression_envelope_version');
  if (versions.capsuleProtocolVersion !== LEARNING_CAPSULE_VERSION) incompatibleVersions.push('capsule_protocol_version');
  if (versions.expressionContractVersion !== ROBOT_EXPRESSION_CONTRACT_VERSION) incompatibleVersions.push('expression_contract_version');
  if (!semverCompatible(versions.esp32LogOnlyContractVersion, ESP32_LOG_ONLY_CONTRACT_VERSION)) incompatibleVersions.push('log_only_contract_version');
  if (!versions.firmwareParserVersion) incompatibleVersions.push('firmware_parser_version');
  return {
    compatibilityStatus: incompatibleVersions.length === 0 ? 'compatible' : 'incompatible',
    compatibleVersions: incompatibleVersions.length === 0 ? versions : {},
    incompatibleVersions,
    migrationWarnings: incompatibleVersions.length > 0 ? ['future_or_missing_version_rejected'] : [],
    downgradePolicy: 'downgrade_never_unlocks_features',
    rejectPolicy: 'unknown_major_or_missing_version_rejected',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['expression_protocol_compatibility_matrix_created']
  };
}

export function validateExpressionProtocolCompatibilityMatrix(matrix = {}) {
  const failures = [];
  if (!['compatible', 'incompatible'].includes(matrix.compatibilityStatus)) failures.push('missing_compatibility_status');
  if (matrix.downgradePolicy !== 'downgrade_never_unlocks_features') failures.push('unsafe_downgrade_policy');
  if (matrix.rejectPolicy !== 'unknown_major_or_missing_version_rejected') failures.push('unsafe_reject_policy');
  if (matrix.motionPolicy !== 'locked') failures.push('motion_not_locked');
  if (matrix.dryRunOnly !== true) failures.push('not_dry_run');
  if (matrix.sendStatus !== 'not_sent') failures.push('send_status_not_safe');
  return { ok: failures.length === 0, failures, reasonCodes: ['expression_protocol_compatibility_matrix_validated'] };
}
