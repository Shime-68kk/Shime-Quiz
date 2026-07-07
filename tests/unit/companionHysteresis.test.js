import { describe, expect, it } from 'vitest';
import { createInitialBehaviorMemory, rememberCompanionBehavior } from '../../src/companion/companionBehaviorMemory.js';
import { applyCompanionHysteresis } from '../../src/companion/companionHysteresis.js';

describe('companionHysteresis', () => {
  it('blocks celebration spam and premature break suggestion', () => {
    let memory = createInitialBehaviorMemory();
    memory = rememberCompanionBehavior(memory, { intent: 'celebrate_small', recommendedRobotActionFamily: 'celebrate' });
    memory = rememberCompanionBehavior(memory, { intent: 'celebrate_small', recommendedRobotActionFamily: 'celebrate' });
    expect(applyCompanionHysteresis({ intent: 'celebrate_small', recommendedRobotActionFamily: 'celebrate' }, memory, {}).adjustedIntent).toBe('steady_progress');
    expect(applyCompanionHysteresis({ intent: 'suggest_break', recommendedRobotActionFamily: 'encourage' }, createInitialBehaviorMemory(), { repeatedWrongCountBucket: 'one' }).adjustedIntent).toBe('encourage');
  });

  it('transport unsafe becomes reconnect safe and classroom mode conservative', () => {
    expect(applyCompanionHysteresis({ intent: 'focus_gently' }, createInitialBehaviorMemory(), { transportHealth: 'error' }).adjustedIntent).toBe('reconnect_hint');
    expect(applyCompanionHysteresis({ intent: 'celebrate_big', intensityBucket: 'high' }, createInitialBehaviorMemory(), { safetyMode: 'classroom_safe', correctStreakBucket: 'large' }).adjustedIntent).toBe('celebrate_small');
  });
});

