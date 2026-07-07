import {
  ALLOWED_ROBOT_EXPRESSION_CHANNELS,
  ALLOWED_ROBOT_EXPRESSION_FAMILIES,
  FORBIDDEN_ROBOT_EXPRESSION_CHANNELS,
  ROBOT_EXPRESSION_CONTRACT_VERSION
} from './robotExpressionContract.js';
import { LEARNING_CAPSULE_VERSION } from './learningStateCapsule.js';
import { findSensitiveKeys } from './shimeEcosystemInvariants.js';

export const ROBOT_EXPRESSION_PROTOCOL = 'shime_robot_expression';
export const ROBOT_EXPRESSION_PROTOCOL_VERSION = '1.0.0';
export const ROBOT_EXPRESSION_MESSAGE_TYPE = 'expression_preview';
export const ROBOT_EXPRESSION_SOURCE = 'shime_quiz';
export const ROBOT_EXPRESSION_TARGET = 'shime_robot';

const REQUIRED_FIELDS = Object.freeze([
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
]);

const SECRET_KEY_PARTS = Object.freeze([
  ['cred', 'ential'],
  ['pass', 'word'],
  ['api', 'key'],
  ['token'],
  ['secret'],
  ['ssid'],
  ['ip']
]);

const TRANSPORT_FLAG_KEYS = Object.freeze([
  'opensConnection',
  'connectsExternally',
  'transportSendAllowed',
  'externalSendAllowed',
  'hardwareSendAllowed'
]);

const UNSAFE_MUTATION_KEY_PARTS = Object.freeze([
  ['schedule', 'MutationAllowed'],
  ['mutates', 'Schedule'],
  ['notification', 'Allowed'],
  ['cal', 'endarMutationAllowed']
]);

function scanKeys(value, predicate, path = '$', hits = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanKeys(entry, predicate, `${path}[${index}]`, hits));
    return hits;
  }
  if (!value || typeof value !== 'object') return hits;
  Object.entries(value).forEach(([key, entry]) => {
    const next = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (predicate(key, entry)) hits.push({ key, path: next });
    scanKeys(entry, predicate, next, hits);
  });
  return hits;
}

function normalizedKey(key) {
  return String(key || '').replace(/[_-]/g, '').toLowerCase();
}

function secretKeyNames() {
  return SECRET_KEY_PARTS.map(parts => normalizedKey(parts.join('')));
}

function mutationKeyNames() {
  return UNSAFE_MUTATION_KEY_PARTS.map(parts => normalizedKey(parts.join('')));
}

export function findRobotExpressionEnvelopeUnsafeKeys(value = {}) {
  const sensitive = findSensitiveKeys(value).map(hit => ({ ...hit, reason: 'sensitive_key' }));
  const secretNames = secretKeyNames();
  const mutationNames = mutationKeyNames();
  const secretHits = scanKeys(value, key => secretNames.some(name => normalizedKey(key).includes(name)))
    .map(hit => ({ ...hit, reason: 'secret_material_key' }));
  const mutationHits = scanKeys(value, key => mutationNames.includes(normalizedKey(key)))
    .map(hit => ({ ...hit, reason: 'mutation_key' }));
  return [...sensitive, ...secretHits, ...mutationHits];
}

export function validateRobotExpressionEnvelopeStrict(envelope = {}) {
  const failures = [];
  if (JSON.stringify(envelope).length > 1800) failures.push('payload_too_large');
  REQUIRED_FIELDS.forEach(field => {
    if (!(field in envelope)) failures.push(`missing_field:${field}`);
  });
  findRobotExpressionEnvelopeUnsafeKeys(envelope).forEach(hit => {
    failures.push(`${hit.reason}:${hit.path}`);
  });
  if (envelope.protocol !== ROBOT_EXPRESSION_PROTOCOL) failures.push('unsupported_protocol');
  if (envelope.protocolVersion !== ROBOT_EXPRESSION_PROTOCOL_VERSION) failures.push('unsupported_protocol_version');
  if (envelope.source !== ROBOT_EXPRESSION_SOURCE) failures.push('source_not_allowed');
  if (envelope.target !== ROBOT_EXPRESSION_TARGET) failures.push('target_not_allowed');
  if (envelope.messageType !== ROBOT_EXPRESSION_MESSAGE_TYPE) failures.push('message_type_not_allowed');
  if (envelope.expressionContractVersion !== ROBOT_EXPRESSION_CONTRACT_VERSION) failures.push('expression_contract_version_not_allowed');
  if (envelope.capsuleProtocolVersion !== LEARNING_CAPSULE_VERSION) failures.push('capsule_protocol_version_not_allowed');
  if (!ALLOWED_ROBOT_EXPRESSION_FAMILIES.includes(envelope.expressionFamily)) failures.push('expression_family_not_allowed');
  const allowedChannels = Array.isArray(envelope.allowedChannels) ? envelope.allowedChannels : [];
  if (!Array.isArray(envelope.allowedChannels) || envelope.allowedChannels.length === 0) failures.push('missing_allowed_channels');
  allowedChannels.forEach(channel => {
    if (!ALLOWED_ROBOT_EXPRESSION_CHANNELS.includes(channel)) failures.push(`channel_not_allowed:${channel}`);
    if (FORBIDDEN_ROBOT_EXPRESSION_CHANNELS.includes(channel)) failures.push(`forbidden_channel:${channel}`);
  });
  if (envelope.motionPolicy !== 'locked') failures.push('motion_not_locked');
  if (envelope.dryRunOnly !== true) failures.push('not_dry_run');
  if (envelope.sendStatus !== 'not_sent') failures.push('send_status_not_safe');
  if (!['low', 'medium', 'high'].includes(envelope.intensityBucket)) failures.push('intensity_bucket_not_allowed');
  if (!['allowed_dry_run', 'blocked'].includes(envelope.safetyStatus)) failures.push('safety_status_not_allowed');
  if (!['redacted_coarse_only', 'blocked'].includes(envelope.privacyStatus)) failures.push('privacy_status_not_allowed');
  if (!Array.isArray(envelope.reasonCodes) || envelope.reasonCodes.length === 0) failures.push('missing_reason_codes');
  TRANSPORT_FLAG_KEYS.forEach(key => {
    if (envelope[key] === true) failures.push(`runtime_transport_flag:${key}`);
  });
  return {
    ok: failures.length === 0,
    failures,
    reasonCodes: ['robot_expression_envelope_validated']
  };
}

export function summarizeRobotExpressionEnvelopeValidation(result = {}) {
  return {
    ok: result.ok === true,
    failureCount: Array.isArray(result.failures) ? result.failures.length : 0,
    failures: [...(result.failures || [])],
    reasonCodes: [...(result.reasonCodes || [])]
  };
}
