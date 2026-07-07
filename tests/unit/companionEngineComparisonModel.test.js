import { describe, expect, it } from 'vitest';
import { compareCompanionEngineOutputs } from '../../src/components/settings/companionEngineComparisonModel.js';

describe('companionEngineComparisonModel', () => {
  it('reports equivalent comparison', () => {
    const result = compareCompanionEngineOutputs(
      [{ companionIntent: 'focus_gently', robotCommand: 'focus', reasonCodes: ['study_focus'] }],
      [{ v2Intent: 'focus_gently', v2Command: 'focus', v2ReasonCodes: ['study_focus'] }]
    );
    expect(result.comparisonStatus).toBe('equivalent');
  });

  it('reports safer or blocked V2 states and avoids sensitive output', () => {
    const safer = compareCompanionEngineOutputs(
      [{ companionIntent: 'focus_gently', robotCommand: 'focus', reasonCodes: [] }],
      [{ v2Intent: 'calm_error', v2Command: 'neutral', v2Safety: 'blocked', v2ReasonCodes: ['forbidden_companion_key'] }]
    );
    expect(safer.comparisonStatus).toBe('v2_blocked');
    expect(JSON.stringify(safer)).not.toContain('private');
  });
});
