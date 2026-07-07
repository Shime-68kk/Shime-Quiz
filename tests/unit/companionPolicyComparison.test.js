import { describe, expect, it } from 'vitest';
import { compareCompanionPolicies } from '../../src/companion/companionPolicyComparison.js';

describe('companionPolicyComparison', () => {
  it('labels equivalent decisions', () => {
    const result = compareCompanionPolicies(
      { intent: 'focus_gently', allowedRobotActionFamily: 'focus', reasonCodes: ['study_focus'] },
      { adjustedIntent: 'focus_gently', finalRobotIntent: 'focus', reasonCodes: ['study_focus'] }
    );
    expect(result.label).toBe('equivalent');
    expect(result.noSensitiveOutput).toBe(true);
  });

  it('labels V2 improvement and safety regression', () => {
    expect(compareCompanionPolicies(
      { intent: 'focus_gently', allowedRobotActionFamily: 'focus', shouldMove: true },
      { adjustedIntent: 'focus_gently', finalRobotIntent: 'focus', reasonCodes: ['study_focus'] }
    ).label).toBe('v2_improved');

    expect(compareCompanionPolicies(
      { intent: 'focus_gently', allowedRobotActionFamily: 'focus', reasonCodes: ['study_focus'] },
      { adjustedIntent: 'focus_gently', finalRobotIntent: 'focus', shouldMove: true, reasonCodes: ['study_focus'] }
    ).label).toBe('possible_regression');
  });
});
