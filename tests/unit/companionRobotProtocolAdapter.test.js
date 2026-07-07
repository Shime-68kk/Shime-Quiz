import { describe, expect, it } from 'vitest';
import {
  ALLOWED_COMPANION_ROBOT_PAYLOAD_KEYS,
  COMPANION_ROBOT_PROTOCOL_VERSION,
  createCompanionRobotCommandEnvelope
} from '../../src/companion/companionRobotProtocolAdapter.js';
import { createDefaultCompanionContext } from '../../src/companion/companionContextSchema.js';

describe('companionRobotProtocolAdapter', () => {
  it('maps safe robot intents to protocol-safe command envelopes', () => {
    const context = createDefaultCompanionContext({ sessionState: { transportStatus: 'connected' } });
    const result = createCompanionRobotCommandEnvelope({
      command: 'encourage',
      intensity: 'medium',
      reasonCodes: ['recent_wrong_answer']
    }, context, { messageId: 'msg_test', emittedAt: '2026-06-27T00:00:00.000Z' });

    expect(result.ok).toBe(true);
    expect(result.envelope.protocolVersion).toBe(COMPANION_ROBOT_PROTOCOL_VERSION);
    expect(result.envelope.payload).toMatchObject({
      command: 'encourage',
      reasonCode: 'recent_wrong_answer',
      intensityBucket: 'medium',
      transportStatus: 'connected'
    });
  });

  it('rejects unknown commands and forbidden keys', () => {
    const context = createDefaultCompanionContext();

    expect(createCompanionRobotCommandEnvelope({ command: 'spin_motor' }, context).ok).toBe(false);
    expect(createCompanionRobotCommandEnvelope({ command: 'focus', prompt: 'private' }, context).reason).toBe('forbidden_companion_robot_payload');
  });

  it('payload contains only allowed coarse fields', () => {
    const context = createDefaultCompanionContext();
    const result = createCompanionRobotCommandEnvelope({ command: 'focus', reasonCodes: ['study_focus'] }, context);

    expect(Object.keys(result.envelope.payload).sort()).toEqual([...ALLOWED_COMPANION_ROBOT_PAYLOAD_KEYS].sort());
    expect(JSON.stringify(result.envelope)).not.toMatch(/question|answer|correctAnswer|explanation|userAnswer/);
  });
});
