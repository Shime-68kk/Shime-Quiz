import { describe, expect, it } from 'vitest';
import {
  createRobotExpressionEnvelope,
  getRobotExpressionEnvelopeSchema,
  summarizeRobotExpressionEnvelope,
  validateRobotExpressionEnvelope
} from '../../../src/shimeIntelligence/robotExpressionEnvelopeProtocol.js';

describe('robotExpressionEnvelopeProtocol', () => {
  it('creates a valid dry-run expression envelope', () => {
    const envelope = createRobotExpressionEnvelope({
      expressionFamily: 'review_due_nudge',
      allowedChannels: ['display_expression', 'led_expression'],
      displayExpression: 'review_due_badge',
      ledPattern: 'review_due_nudge_soft_led',
      soundCue: 'none',
      intensityBucket: 'medium',
      reasonCodes: ['unit_fixture']
    }, { envelopeId: 'unit_env_1' });

    expect(envelope).toMatchObject({
      protocol: 'shime_robot_expression',
      protocolVersion: '1.0.0',
      envelopeId: 'unit_env_1',
      source: 'shime_quiz',
      target: 'shime_robot',
      messageType: 'expression_preview',
      motionPolicy: 'locked',
      dryRunOnly: true,
      sendStatus: 'not_sent'
    });
    expect(validateRobotExpressionEnvelope(envelope).ok).toBe(true);
    expect(summarizeRobotExpressionEnvelope(envelope).validationStatus).toBe('accepted');
  });

  it('exposes the expected schema invariants', () => {
    const schema = getRobotExpressionEnvelopeSchema();
    expect(schema.requiredFields).toContain('expressionFamily');
    expect(schema.allowedChannels).toContain('display_expression');
    expect(schema.invariants).toEqual(expect.objectContaining({
      motionPolicy: 'locked',
      dryRunOnly: true,
      sendStatus: 'not_sent'
    }));
  });
});

