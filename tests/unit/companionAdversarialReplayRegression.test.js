import { describe, expect, it } from 'vitest';
import { generateCompanionAdversarialScenarios } from '../../src/companion/companionAdversarialGenerator.js';
import { runCompanionReplayBenchmark } from '../../src/companion/companionReplayBenchmark.js';
import { checkCompanionReplayInvariants } from '../../src/companion/companionInvariants.js';

describe('companionAdversarialReplayRegression', () => {
  it('runs 100 generated scenarios through V2 without privacy or safety invariant failures', () => {
    const benchmark = runCompanionReplayBenchmark(generateCompanionAdversarialScenarios({ seed: 32, count: 100 }));
    const invariantFailures = benchmark.results.flatMap(result => checkCompanionReplayInvariants(result).failures);
    expect(invariantFailures).toEqual([]);
    expect(benchmark.results.filter(result => result.name.includes('sensitive')).every(result => result.audit.every(entry => entry.privacyStatus === 'blocked'))).toBe(true);
    expect(JSON.stringify(benchmark)).not.toContain('sendRobotCommand');
  });
});
