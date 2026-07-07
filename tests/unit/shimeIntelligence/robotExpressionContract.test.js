import { describe, expect, it } from 'vitest';
import { createRobotExpressionContract, validateRobotExpressionContract } from '../../../src/shimeIntelligence/robotExpressionContract.js';

describe('robotExpressionContract', () => {
  it('passes valid expression-only contract', () => {
    const contract = createRobotExpressionContract({ expressionFamily: 'review_due_nudge', reasonCodes: ['due'] });
    expect(validateRobotExpressionContract(contract).ok).toBe(true);
    expect(contract.motionPolicy).toBe('locked');
    expect(contract.dryRunOnly).toBe(true);
    expect(contract.sendStatus).toBe('not_sent');
  });

  it('rejects forbidden motion channel, missing reasons, unsafe send, and sensitive field', () => {
    expect(validateRobotExpressionContract({ ...createRobotExpressionContract(), allowedChannels: ['motor_motion'] }).ok).toBe(false);
    expect(validateRobotExpressionContract({ ...createRobotExpressionContract(), reasonCodes: [] }).failures).toContain('missing_reason_codes');
    expect(validateRobotExpressionContract({ ...createRobotExpressionContract(), sendStatus: 'sent' }).failures).toContain('expression_send_status_not_safe');
    expect(createRobotExpressionContract({ question: 'private' }).privacyStatus).toBe('blocked');
  });
});
