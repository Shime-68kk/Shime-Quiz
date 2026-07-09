import { describe, expect, it } from 'vitest';
import { generateShimeEcosystemScenarios, runShimeEcosystemBenchmark } from '../../../src/shimeIntelligence/shimeEcosystemBenchmark.js';

const BENCHMARK_TIMEOUT_MS = 20000;

describe('shimeEcosystemBenchmark', () => {
  it('generates and passes 10000 deterministic scenarios with 1000 attacks', () => {
    const a = generateShimeEcosystemScenarios({ seed: 1 });
    const b = generateShimeEcosystemScenarios({ seed: 1 });
    expect(a).toEqual(b);
    const result = runShimeEcosystemBenchmark({ seed: 1 });
    expect(result.scenarioCount).toBeGreaterThanOrEqual(10000);
    expect(result.attackScenarioCount).toBeGreaterThanOrEqual(1000);
    expect(result.validLearningScenarioCount).toBeGreaterThanOrEqual(5000);
    expect(result.transportScenarioCount).toBeGreaterThanOrEqual(2000);
    expect(result.timetableScenarioCount).toBeGreaterThanOrEqual(1000);
    expect(result.mixedScenarioCount).toBeGreaterThanOrEqual(1000);
    expect(result.transportRecommendationOnly).toBe(true);
    expect(result.passed).toBe(true);
  }, BENCHMARK_TIMEOUT_MS);
});
