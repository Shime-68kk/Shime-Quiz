import { describe, expect, it } from 'vitest';
import { createExpressionProtocolFirmwareQaPlan } from '../../../src/shimeIntelligence/expressionProtocolFirmwareQaPlan.js';

describe('expressionProtocolFirmwareQaPlan', () => {
  it('includes accept and reject tests with motion locked', () => {
    const plan = createExpressionProtocolFirmwareQaPlan();
    expect(plan.steps.join(' ')).toContain('REJECT');
    expect(plan.steps.join(' ')).toContain('no motion');
    expect(plan.motionPolicy).toBe('locked');
    expect(plan.rollbackPlan.length).toBeGreaterThan(0);
  });
});

