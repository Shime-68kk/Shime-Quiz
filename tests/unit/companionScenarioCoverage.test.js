import { describe, expect, it } from 'vitest';
import { generateCompanionAdversarialScenarios } from '../../src/companion/companionAdversarialGenerator.js';
import { analyzeCompanionScenarioCoverage } from '../../src/companion/companionScenarioCoverage.js';
import { getCompanionReplayFixtures } from '../../tools/deviceBridge/companionReplayFixtures.mjs';

describe('companionScenarioCoverage', () => {
  it('detects all required classes with fixture plus adversarial matrix', () => {
    const report = analyzeCompanionScenarioCoverage([
      ...getCompanionReplayFixtures(),
      ...generateCompanionAdversarialScenarios({ seed: 31, count: 100 })
    ]);
    expect(report.passed).toBe(true);
    expect(report.missing).toEqual([]);
    expect(report.coveragePercent).toBe(100);
  });

  it('fails when a required class is missing', () => {
    const report = analyzeCompanionScenarioCoverage([], { requiredClasses: ['focus'] });
    expect(report.passed).toBe(false);
    expect(report.coveragePercent).toBe(0);
  });
});
