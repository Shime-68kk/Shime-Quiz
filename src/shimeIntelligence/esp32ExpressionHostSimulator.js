import { createEsp32ExpressionLogPreview } from './esp32ExpressionLogContract.js';
import { deserializeRobotExpressionEnvelope } from './robotExpressionEnvelopeSerializer.js';
import { validateRobotExpressionEnvelope } from './robotExpressionEnvelopeProtocol.js';

function reject(reason, extraReasons = []) {
  return {
    accepted: false,
    rejectedReason: reason,
    logLine: `REJECT ${reason}`,
    parsedExpressionFamily: 'calm_error',
    parsedDisplayExpression: 'none',
    parsedLedPattern: 'none',
    parsedSoundCue: 'none',
    motionPolicy: 'locked',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    safetyStatus: 'blocked',
    privacyStatus: 'blocked',
    reasonCodes: ['host_expression_simulation_rejected', reason, ...extraReasons]
  };
}

export function simulateEsp32ExpressionEnvelope(serializedOrEnvelope = {}) {
  let envelope = serializedOrEnvelope;
  if (typeof serializedOrEnvelope === 'string') {
    const parsed = deserializeRobotExpressionEnvelope(serializedOrEnvelope);
    if (!parsed.ok) return reject(parsed.failures[0] || 'invalid_serialized_envelope', parsed.failures || []);
    envelope = parsed.envelope;
  }
  const validation = validateRobotExpressionEnvelope(envelope);
  if (!validation.ok) return reject(validation.failures[0] || 'invalid_envelope', validation.failures);
  const logPreview = createEsp32ExpressionLogPreview(envelope);
  if (!logPreview.accepted) return reject(logPreview.rejectedReason || 'log_preview_rejected', logPreview.reasonCodes || []);
  return {
    accepted: true,
    rejectedReason: 'none',
    logLine: `ACCEPT expression=${envelope.expressionFamily} display=${envelope.displayExpression} led=${envelope.ledPattern} sound=${envelope.soundCue}`,
    parsedExpressionFamily: envelope.expressionFamily,
    parsedDisplayExpression: envelope.displayExpression,
    parsedLedPattern: envelope.ledPattern,
    parsedSoundCue: envelope.soundCue,
    motionPolicy: 'locked',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    safetyStatus: envelope.safetyStatus,
    privacyStatus: envelope.privacyStatus,
    reasonCodes: [...(envelope.reasonCodes || []), 'host_expression_simulation_accepted']
  };
}

export function summarizeEsp32ExpressionSimulation(result = {}) {
  return {
    accepted: result.accepted === true,
    rejectedReason: result.rejectedReason || 'none',
    expressionFamily: result.parsedExpressionFamily || 'calm_error',
    motionPolicy: result.motionPolicy || 'locked',
    dryRunOnly: result.dryRunOnly === true,
    sendStatus: result.sendStatus || 'not_sent',
    safetyStatus: result.safetyStatus || 'blocked',
    privacyStatus: result.privacyStatus || 'blocked',
    reasonCodes: [...(result.reasonCodes || [])]
  };
}

