import { describe, expect, it } from 'vitest';
import {
  createInitialBehaviorMemory,
  rememberCompanionBehavior,
  resetBehaviorMemory,
  shouldSuppressBehavior
} from '../../src/companion/companionBehaviorMemory.js';

describe('companionBehaviorMemory', () => {
  it('is bounded and resettable', () => {
    let memory = createInitialBehaviorMemory({ limit: 2 });
    memory = rememberCompanionBehavior(memory, { intent: 'focus_gently', recommendedRobotActionFamily: 'focus' });
    memory = rememberCompanionBehavior(memory, { intent: 'encourage', recommendedRobotActionFamily: 'encourage' });
    memory = rememberCompanionBehavior(memory, { intent: 'celebrate_small', recommendedRobotActionFamily: 'celebrate' });
    expect(memory.recentIntents).toEqual(['encourage', 'celebrate_small']);
    expect(resetBehaviorMemory({ limit: 2 }).recentIntents).toEqual([]);
  });

  it('suppresses repeated same behavior without persistence APIs', () => {
    let memory = createInitialBehaviorMemory();
    memory = rememberCompanionBehavior(memory, { intent: 'celebrate_small', recommendedRobotActionFamily: 'celebrate' });
    memory = rememberCompanionBehavior(memory, { intent: 'celebrate_small', recommendedRobotActionFamily: 'celebrate' });
    expect(shouldSuppressBehavior(memory, 'celebrate_small')).toBe(true);
  });
});

