import { describe, expect, it } from 'vitest';
import { createRobotExpressionEnvelope } from '../../../src/shimeIntelligence/robotExpressionEnvelopeProtocol.js';
import { validateRobotExpressionEnvelopeStrict } from '../../../src/shimeIntelligence/robotExpressionEnvelopeValidator.js';

describe('robotExpressionEnvelopeValidator', () => {
  const valid = () => createRobotExpressionEnvelope({
    expressionFamily: 'gentle_encourage',
    allowedChannels: ['display_expression'],
    displayExpression: 'supportive_smile',
    reasonCodes: ['validator_fixture']
  });

  it('rejects unsafe protocol fields', () => {
    expect(validateRobotExpressionEnvelopeStrict({ ...valid(), protocolVersion: '0.0.0' }).failures).toContain('unsupported_protocol_version');
    expect(validateRobotExpressionEnvelopeStrict({ ...valid(), messageType: 'robot_command' }).failures).toContain('message_type_not_allowed');
    expect(validateRobotExpressionEnvelopeStrict({ ...valid(), dryRunOnly: false }).failures).toContain('not_dry_run');
    expect(validateRobotExpressionEnvelopeStrict({ ...valid(), sendStatus: 'sent' }).failures).toContain('send_status_not_safe');
    expect(validateRobotExpressionEnvelopeStrict({ ...valid(), motionPolicy: 'unlocked' }).failures).toContain('motion_not_locked');
  });

  it('rejects forbidden channels and sensitive or secret-like keys', () => {
    expect(validateRobotExpressionEnvelopeStrict({ ...valid(), allowedChannels: ['motor_motion'] }).failures).toContain('channel_not_allowed:motor_motion');
    expect(validateRobotExpressionEnvelopeStrict({ ...valid(), question: 'blocked' }).ok).toBe(false);
    expect(validateRobotExpressionEnvelopeStrict({ ...valid(), nested: { sourceMetadata: 'blocked' } }).ok).toBe(false);
    expect(validateRobotExpressionEnvelopeStrict({ ...valid(), credentials: 'blocked' }).ok).toBe(false);
  });

  it('rejects malformed channel shape instead of throwing', () => {
    const result = validateRobotExpressionEnvelopeStrict({ ...valid(), allowedChannels: 'display_expression' });
    expect(result.ok).toBe(false);
    expect(result.failures).toContain('missing_allowed_channels');
  });
});
