import {
  ALLOWED_ROBOT_EXPRESSION_CHANNELS,
  ALLOWED_ROBOT_EXPRESSION_FAMILIES,
  ROBOT_EXPRESSION_CONTRACT_VERSION
} from './robotExpressionContract.js';
import { LEARNING_CAPSULE_VERSION } from './learningStateCapsule.js';
import {
  ROBOT_EXPRESSION_MESSAGE_TYPE,
  ROBOT_EXPRESSION_PROTOCOL,
  ROBOT_EXPRESSION_PROTOCOL_VERSION,
  ROBOT_EXPRESSION_SOURCE,
  ROBOT_EXPRESSION_TARGET,
  validateRobotExpressionEnvelopeStrict
} from './robotExpressionEnvelopeValidator.js';

function normalizeChannels(channels = []) {
  const safe = (Array.isArray(channels) ? channels : [])
    .filter(channel => ALLOWED_ROBOT_EXPRESSION_CHANNELS.includes(channel));
  return safe.length > 0 ? [...new Set(safe)] : ['no_op'];
}

function normalizeFamily(family) {
  return ALLOWED_ROBOT_EXPRESSION_FAMILIES.includes(family) ? family : 'neutral_presence';
}

function createEnvelopeId(input = {}, options = {}) {
  if (options.envelopeId) return options.envelopeId;
  const family = normalizeFamily(input.expressionFamily);
  const channels = normalizeChannels(input.allowedChannels).join('_');
  return `expr_v1_${family}_${channels || 'no_op'}`;
}

export function createRobotExpressionEnvelope(input = {}, options = {}) {
  const expressionFamily = normalizeFamily(input.expressionFamily);
  const allowedChannels = normalizeChannels(input.allowedChannels);
  return {
    protocol: ROBOT_EXPRESSION_PROTOCOL,
    protocolVersion: ROBOT_EXPRESSION_PROTOCOL_VERSION,
    envelopeId: createEnvelopeId({ ...input, expressionFamily, allowedChannels }, options),
    source: ROBOT_EXPRESSION_SOURCE,
    target: ROBOT_EXPRESSION_TARGET,
    messageType: ROBOT_EXPRESSION_MESSAGE_TYPE,
    expressionContractVersion: input.expressionContractVersion || ROBOT_EXPRESSION_CONTRACT_VERSION,
    capsuleProtocolVersion: input.capsuleProtocolVersion || LEARNING_CAPSULE_VERSION,
    expressionFamily,
    allowedChannels,
    displayExpression: input.displayExpression || 'none',
    ledPattern: input.ledPattern || 'none',
    soundCue: input.soundCue || 'none',
    motionPolicy: 'locked',
    intensityBucket: ['low', 'medium', 'high'].includes(input.intensityBucket) ? input.intensityBucket : 'low',
    safetyStatus: input.safetyStatus === 'blocked' ? 'blocked' : 'allowed_dry_run',
    privacyStatus: input.privacyStatus === 'blocked' ? 'blocked' : 'redacted_coarse_only',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: [...new Set([...(input.reasonCodes || []), 'robot_expression_envelope_created'])]
  };
}

export function validateRobotExpressionEnvelope(envelope = {}, options = {}) {
  return validateRobotExpressionEnvelopeStrict(envelope, options);
}

export function summarizeRobotExpressionEnvelope(envelope = {}, options = {}) {
  const validation = validateRobotExpressionEnvelope(envelope, options);
  return {
    protocol: envelope.protocol || ROBOT_EXPRESSION_PROTOCOL,
    protocolVersion: envelope.protocolVersion || ROBOT_EXPRESSION_PROTOCOL_VERSION,
    envelopeId: envelope.envelopeId || 'missing',
    messageType: envelope.messageType || 'missing',
    expressionFamily: envelope.expressionFamily || 'neutral_presence',
    channelCount: Array.isArray(envelope.allowedChannels) ? envelope.allowedChannels.length : 0,
    motionPolicy: envelope.motionPolicy || 'locked',
    dryRunOnly: envelope.dryRunOnly === true,
    sendStatus: envelope.sendStatus || 'not_sent',
    safetyStatus: envelope.safetyStatus || 'unknown',
    privacyStatus: envelope.privacyStatus || 'unknown',
    validationStatus: validation.ok ? 'accepted' : 'rejected',
    reasonCodes: [...(envelope.reasonCodes || [])]
  };
}

export function getRobotExpressionEnvelopeSchema() {
  return {
    protocol: ROBOT_EXPRESSION_PROTOCOL,
    protocolVersion: ROBOT_EXPRESSION_PROTOCOL_VERSION,
    source: ROBOT_EXPRESSION_SOURCE,
    target: ROBOT_EXPRESSION_TARGET,
    messageType: ROBOT_EXPRESSION_MESSAGE_TYPE,
    expressionContractVersion: ROBOT_EXPRESSION_CONTRACT_VERSION,
    capsuleProtocolVersion: LEARNING_CAPSULE_VERSION,
    requiredFields: [
      'protocol',
      'protocolVersion',
      'envelopeId',
      'source',
      'target',
      'messageType',
      'expressionContractVersion',
      'capsuleProtocolVersion',
      'expressionFamily',
      'allowedChannels',
      'displayExpression',
      'ledPattern',
      'soundCue',
      'motionPolicy',
      'intensityBucket',
      'safetyStatus',
      'privacyStatus',
      'dryRunOnly',
      'sendStatus',
      'reasonCodes'
    ],
    allowedFamilies: [...ALLOWED_ROBOT_EXPRESSION_FAMILIES],
    allowedChannels: [...ALLOWED_ROBOT_EXPRESSION_CHANNELS],
    invariants: {
      motionPolicy: 'locked',
      dryRunOnly: true,
      sendStatus: 'not_sent',
      privacy: 'redacted_coarse_only'
    }
  };
}
