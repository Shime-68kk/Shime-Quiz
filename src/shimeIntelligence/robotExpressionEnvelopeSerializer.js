import {
  ROBOT_EXPRESSION_MESSAGE_TYPE,
  ROBOT_EXPRESSION_PROTOCOL_VERSION,
  validateRobotExpressionEnvelopeStrict
} from './robotExpressionEnvelopeValidator.js';

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((acc, key) => {
    acc[key] = sortValue(value[key]);
    return acc;
  }, {});
}

export function serializeRobotExpressionEnvelope(envelope = {}) {
  const validation = validateRobotExpressionEnvelopeStrict(envelope);
  if (!validation.ok) {
    throw new Error(`Robot expression envelope rejected: ${validation.failures.join(',')}`);
  }
  return JSON.stringify(sortValue(envelope));
}

export function deserializeRobotExpressionEnvelope(serialized = '') {
  let parsed;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    return {
      ok: false,
      envelope: null,
      failures: ['malformed_json'],
      reasonCodes: ['robot_expression_envelope_deserialize_failed']
    };
  }
  if (parsed.protocolVersion !== ROBOT_EXPRESSION_PROTOCOL_VERSION) {
    return {
      ok: false,
      envelope: parsed,
      failures: ['unsupported_protocol_version'],
      reasonCodes: ['robot_expression_envelope_deserialize_failed']
    };
  }
  if (parsed.messageType !== ROBOT_EXPRESSION_MESSAGE_TYPE) {
    return {
      ok: false,
      envelope: parsed,
      failures: ['message_type_not_allowed'],
      reasonCodes: ['robot_expression_envelope_deserialize_failed']
    };
  }
  const validation = validateRobotExpressionEnvelopeStrict(parsed);
  return {
    ok: validation.ok,
    envelope: validation.ok ? parsed : null,
    failures: validation.failures,
    reasonCodes: ['robot_expression_envelope_deserialized']
  };
}

export function roundTripRobotExpressionEnvelope(envelope = {}) {
  const serialized = serializeRobotExpressionEnvelope(envelope);
  const deserialized = deserializeRobotExpressionEnvelope(serialized);
  return {
    ok: deserialized.ok === true,
    serialized,
    envelope: deserialized.envelope,
    failures: deserialized.failures || [],
    reasonCodes: ['robot_expression_envelope_round_trip_completed']
  };
}

