import { describe, expect, it } from 'vitest';
import { createRobotCapabilityContract, validateRobotCapabilityContract } from '../../../src/shimeIntelligence/robotCapabilityContract.js';

describe('robotCapabilityContract', () => {
  it('keeps motion locked and rejects future unlocks', () => {
    expect(createRobotCapabilityContract({ capabilityLevel: 'expression_robot' }).motionLocked).toBe(true);
    expect(validateRobotCapabilityContract({ capabilityLevel: 'motion_capable_unlocked_future_only', motionLocked: false }).ok).toBe(false);
  });
});
