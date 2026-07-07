import {
  validateRobotExpressionEnvelope
} from './robotExpressionEnvelopeProtocol.js';
import {
  ROBOT_EXPRESSION_PROTOCOL_VERSION
} from './robotExpressionEnvelopeValidator.js';

export const ESP32_EXPRESSION_LOG_PROTOCOL = 'shime_esp32_expression_log';

export function createEsp32ExpressionLogPreview(envelope = {}) {
  const validation = validateRobotExpressionEnvelope(envelope);
  return {
    logProtocol: ESP32_EXPRESSION_LOG_PROTOCOL,
    protocolVersion: ROBOT_EXPRESSION_PROTOCOL_VERSION,
    accepted: validation.ok,
    rejectedReason: validation.ok ? 'none' : validation.failures[0] || 'invalid_envelope',
    expressionFamily: validation.ok ? envelope.expressionFamily : 'calm_error',
    displayExpression: validation.ok ? envelope.displayExpression : 'none',
    ledPattern: validation.ok ? envelope.ledPattern : 'none',
    soundCue: validation.ok ? envelope.soundCue : 'none',
    motionPolicy: 'locked',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    safetyStatus: validation.ok ? envelope.safetyStatus : 'blocked',
    privacyStatus: validation.ok ? envelope.privacyStatus : 'blocked',
    reasonCodes: validation.ok
      ? [...(envelope.reasonCodes || []), 'esp32_expression_log_preview_accepted']
      : ['esp32_expression_log_preview_rejected', ...validation.failures]
  };
}

export function validateEsp32ExpressionLogPreview(logPreview = {}) {
  const failures = [];
  if (logPreview.logProtocol !== ESP32_EXPRESSION_LOG_PROTOCOL) failures.push('log_protocol_not_allowed');
  if (logPreview.protocolVersion !== ROBOT_EXPRESSION_PROTOCOL_VERSION) failures.push('log_protocol_version_not_allowed');
  if (typeof logPreview.accepted !== 'boolean') failures.push('missing_acceptance_status');
  if (logPreview.motionPolicy !== 'locked') failures.push('motion_not_locked');
  if (logPreview.dryRunOnly !== true) failures.push('not_dry_run');
  if (logPreview.sendStatus !== 'not_sent') failures.push('send_status_not_safe');
  if (!Array.isArray(logPreview.reasonCodes) || logPreview.reasonCodes.length === 0) failures.push('missing_reason_codes');
  return {
    ok: failures.length === 0,
    failures,
    reasonCodes: ['esp32_expression_log_preview_validated']
  };
}

export function summarizeEsp32ExpressionLogPreview(logPreview = {}) {
  const validation = validateEsp32ExpressionLogPreview(logPreview);
  return {
    logProtocol: logPreview.logProtocol || ESP32_EXPRESSION_LOG_PROTOCOL,
    accepted: logPreview.accepted === true,
    rejectedReason: logPreview.rejectedReason || 'none',
    expressionFamily: logPreview.expressionFamily || 'calm_error',
    motionPolicy: logPreview.motionPolicy || 'locked',
    dryRunOnly: logPreview.dryRunOnly === true,
    sendStatus: logPreview.sendStatus || 'not_sent',
    validationStatus: validation.ok ? 'pass' : 'fail',
    reasonCodes: [...(logPreview.reasonCodes || [])]
  };
}

