import { describe, expect, it } from 'vitest';
import { generateCompanionAdversarialScenarios } from '../../src/companion/companionAdversarialGenerator.js';
import { createCompanionGoldenReplay } from '../../src/companion/companionGoldenReplay.js';
import { evaluateCompanionV2Readiness } from '../../src/companion/companionV2ReadinessGate.js';
import { runCompanionReplayBenchmark } from '../../src/companion/companionReplayBenchmark.js';
import { checkCompanionOutputForSensitiveData } from '../../src/companion/companionInvariants.js';

describe('companionV2NoSensitiveOutput', () => {
  it('keeps valid reports free of raw sensitive keys', () => {
    const scenarios = generateCompanionAdversarialScenarios({ seed: 44, count: 30 }).filter(scenario => scenario.valid);
    const outputs = [
      runCompanionReplayBenchmark(scenarios),
      createCompanionGoldenReplay(scenarios),
      evaluateCompanionV2Readiness(scenarios)
    ];
    expect(outputs.every(output => checkCompanionOutputForSensitiveData(output).ok)).toBe(true);
  });
});
