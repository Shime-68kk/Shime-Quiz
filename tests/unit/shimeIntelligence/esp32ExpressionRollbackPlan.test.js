import { describe, expect, it } from 'vitest';
import { createEsp32ExpressionRollbackPlan } from '../../../src/shimeIntelligence/esp32ExpressionRollbackPlan.js';

describe('esp32ExpressionRollbackPlan', () => {
  it('includes restore paths and no dependency on app runtime', () => {
    const plan = createEsp32ExpressionRollbackPlan();
    expect(plan.restorePaths).toContain('firmware/esp32-shime-robot/src/ShimeProtocol.cpp');
    expect(plan.steps.join(' ')).toContain('Do not add app runtime dependency');
    expect(plan.motionPolicy).toBe('locked');
  });
});

