import { describe, expect, it } from 'vitest';
import { runShimeEcosystemBenchmarkTool } from '../../../tools/shimeIntelligence/shimeEcosystemBenchmark.mjs';

const BENCHMARK_TIMEOUT_MS = 20000;

describe('shimeEcosystemEvidenceArtifacts', () => {
  it('creates safe generated evidence artifact list', () => {
    const { benchmark, artifacts } = runShimeEcosystemBenchmarkTool();
    expect(benchmark.passed).toBe(true);
    expect(artifacts.length).toBeGreaterThanOrEqual(7);
    expect(artifacts.some(file => file.endsWith('shime-ecosystem-evidence-summary.json'))).toBe(true);
  }, BENCHMARK_TIMEOUT_MS);
});
