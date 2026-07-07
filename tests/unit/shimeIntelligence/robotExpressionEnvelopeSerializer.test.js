import { describe, expect, it } from 'vitest';
import { createRobotExpressionEnvelope } from '../../../src/shimeIntelligence/robotExpressionEnvelopeProtocol.js';
import {
  deserializeRobotExpressionEnvelope,
  roundTripRobotExpressionEnvelope,
  serializeRobotExpressionEnvelope
} from '../../../src/shimeIntelligence/robotExpressionEnvelopeSerializer.js';

describe('robotExpressionEnvelopeSerializer', () => {
  it('serializes deterministically and round-trips valid envelopes', () => {
    const envelope = createRobotExpressionEnvelope({
      expressionFamily: 'neutral_presence',
      allowedChannels: ['idle_presence', 'display_expression'],
      displayExpression: 'soft_idle_face',
      reasonCodes: ['serializer_fixture']
    }, { envelopeId: 'serializer_1' });
    const first = serializeRobotExpressionEnvelope(envelope);
    const second = serializeRobotExpressionEnvelope({ ...envelope });
    expect(first).toBe(second);
    expect(roundTripRobotExpressionEnvelope(envelope).ok).toBe(true);
  });

  it('rejects malformed JSON, unsupported version, and unknown type', () => {
    expect(deserializeRobotExpressionEnvelope('{').failures).toContain('malformed_json');
    const base = createRobotExpressionEnvelope({ reasonCodes: ['bad_fixture'] });
    expect(deserializeRobotExpressionEnvelope(JSON.stringify({ ...base, protocolVersion: '0.0.0' })).failures).toContain('unsupported_protocol_version');
    expect(deserializeRobotExpressionEnvelope(JSON.stringify({ ...base, messageType: 'robot_command' })).failures).toContain('message_type_not_allowed');
  });
});

