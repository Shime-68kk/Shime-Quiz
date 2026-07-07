import { describe, expect, it } from 'vitest';
import { createRobotExpressionContract } from '../../../src/shimeIntelligence/robotExpressionContract.js';
import { validateRobotExpressionPlan } from '../../../src/shimeIntelligence/robotExpressionSafetyGate.js';

function validPlan(overrides = {}) {
  return {
    ...createRobotExpressionContract({ expressionFamily: 'neutral_presence', reasonCodes: ['ok'] }),
    displayExpression: 'soft_idle',
    ledPattern: 'none',
    soundCue: 'none',
    shouldInterrupt: false,
    shouldWait: true,
    scheduleMutationAllowed: false,
    notificationAllowed: false,
    calendarMutationAllowed: false,
    opensConnection: false,
    ...overrides
  };
}

describe('robotExpressionSafetyGate', () => {
  it('passes valid plans and rejects unsafe fields', () => {
    expect(validateRobotExpressionPlan(validPlan()).ok).toBe(true);
    expect(validateRobotExpressionPlan(validPlan({ allowedChannels: ['motor_motion'] })).ok).toBe(false);
    expect(validateRobotExpressionPlan(validPlan({ motionPolicy: 'unlocked' })).failures).toContain('motion_not_locked');
    expect(validateRobotExpressionPlan(validPlan({ question: 'private' })).failures).toContain('sensitive_expression_plan');
    expect(validateRobotExpressionPlan(validPlan({ dryRunOnly: false })).failures).toContain('expression_not_dry_run');
  });
});
