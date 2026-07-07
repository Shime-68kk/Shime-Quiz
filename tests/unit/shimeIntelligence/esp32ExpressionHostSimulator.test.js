import { describe, expect, it } from 'vitest';
import { createRobotExpressionEnvelope } from '../../../src/shimeIntelligence/robotExpressionEnvelopeProtocol.js';
import { serializeRobotExpressionEnvelope } from '../../../src/shimeIntelligence/robotExpressionEnvelopeSerializer.js';
import { simulateEsp32ExpressionEnvelope } from '../../../src/shimeIntelligence/esp32ExpressionHostSimulator.js';

describe('esp32ExpressionHostSimulator', () => {
  it('accepts valid envelopes and serialized envelopes as log-only output', () => {
    const envelope = createRobotExpressionEnvelope({ reasonCodes: ['host_sim_fixture'] });
    expect(simulateEsp32ExpressionEnvelope(envelope).accepted).toBe(true);
    expect(simulateEsp32ExpressionEnvelope(serializeRobotExpressionEnvelope(envelope))).toMatchObject({
      accepted: true,
      motionPolicy: 'locked',
      dryRunOnly: true,
      sendStatus: 'not_sent'
    });
  });

  it('rejects malformed JSON and unsafe envelope changes', () => {
    expect(simulateEsp32ExpressionEnvelope('{').accepted).toBe(false);
    expect(simulateEsp32ExpressionEnvelope({ ...createRobotExpressionEnvelope(), prompt: 'blocked' }).accepted).toBe(false);
    expect(simulateEsp32ExpressionEnvelope({ ...createRobotExpressionEnvelope(), credentials: 'blocked' }).accepted).toBe(false);
    expect(simulateEsp32ExpressionEnvelope({ ...createRobotExpressionEnvelope(), motionPolicy: 'unlocked' }).accepted).toBe(false);
    expect(simulateEsp32ExpressionEnvelope({ ...createRobotExpressionEnvelope(), dryRunOnly: false }).accepted).toBe(false);
    expect(simulateEsp32ExpressionEnvelope({ ...createRobotExpressionEnvelope(), sendStatus: 'sent' }).accepted).toBe(false);
  });
});

