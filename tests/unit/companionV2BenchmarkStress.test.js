import { describe, expect, it } from 'vitest';
import { createCompanionEvidenceBenchmark } from '../../tools/deviceBridge/companionEvidenceBenchmark.mjs';

describe('companionV2BenchmarkStress', () => {
  it('runs 1000 generated scenarios with attacks through the evidence gate', () => {
    const report = createCompanionEvidenceBenchmark({ count: 1000, attackCount: 120, seed: 33000 });
    expect(report.summary.scenarioCount).toBeGreaterThanOrEqual(1000);
    expect(report.summary.attackScenarioCount).toBeGreaterThanOrEqual(100);
    expect(report.summary.invariantFailures).toBe(0);
    expect(report.summary.privacyFailures).toBe(0);
    expect(report.summary.passed).toBe(true);
  });
});
