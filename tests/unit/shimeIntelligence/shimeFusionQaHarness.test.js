import { describe, expect, it } from 'vitest';
import { SHIME_FUSION_QA_CASE_IDS, runShimeFusionQaHarness } from '../../../src/shimeIntelligence/shimeFusionQaHarness.js';

describe('shimeFusionQaHarness', () => {
  it('creates deterministic required QA cases', () => {
    const a = runShimeFusionQaHarness();
    const b = runShimeFusionQaHarness();
    expect(a).toEqual(b);
    expect(a.caseCount).toBe(SHIME_FUSION_QA_CASE_IDS.length);
    ['empty_state', 'privacy_attack', 'display_only_robot', 'led_only_robot', 'motion_capable_locked'].forEach(id => {
      expect(a.cases.some(entry => entry.caseId === id)).toBe(true);
    });
    expect(a.allDryRun).toBe(true);
  });

  it('blocks or neutralizes sensitive case and avoids raw payload', () => {
    const result = runShimeFusionQaHarness();
    const sensitive = result.cases.find(entry => entry.caseId === 'privacy_attack');
    expect(sensitive.expectedBlockedOrSafeStatus).toBe('blocked');
    expect(JSON.stringify(result)).not.toContain('payload');
  });
});
