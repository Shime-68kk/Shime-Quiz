import { describe, expect, it } from 'vitest';
import { createExpressionProtocolMigrationPlan } from '../../../src/shimeIntelligence/expressionProtocolMigrationPlan.js';

describe('expressionProtocolMigrationPlan', () => {
  it('has rollback and safety gates for every step', () => {
    const plan = createExpressionProtocolMigrationPlan();
    expect(plan.stepCount).toBeGreaterThanOrEqual(8);
    plan.steps.forEach(step => {
      expect(step.rollbackPlan).toBeTruthy();
      expect(step.safetyStatus).toContain('required');
      expect(step.forbiddenChanges).toContain('motion_unlock');
    });
  });
});

