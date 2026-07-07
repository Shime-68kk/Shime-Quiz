import { describe, expect, it } from 'vitest';
import { createRobotCapabilityProfile, deriveAllowedActionFamilies, validateRobotCapabilityProfile } from '../../../src/shimeIntelligence/transportCapabilityModel.js';

describe('transportCapabilityModel', () => {
  it('limits display, led, and locked motion capabilities', () => {
    const display = createRobotCapabilityProfile({ supportsDisplay: true });
    const led = createRobotCapabilityProfile({ supportsLed: true });
    const motion = createRobotCapabilityProfile({ supportsMotion: true, motionLocked: true });
    expect(deriveAllowedActionFamilies(display)).toContain('focus_ritual');
    expect(deriveAllowedActionFamilies(led)).toContain('review_due_nudge');
    expect(validateRobotCapabilityProfile(motion).ok).toBe(true);
    expect(validateRobotCapabilityProfile({ supportsMotion: true, motionLocked: false }).ok).toBe(false);
  });
});
