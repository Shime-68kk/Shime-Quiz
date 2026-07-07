import { describe, expect, it } from 'vitest';
import { getCompanionReplayFixtures } from '../../tools/deviceBridge/companionReplayFixtures.mjs';
import { runCompanionReplayBenchmark } from '../../src/companion/companionReplayBenchmark.js';

describe('companionV2BenchmarkGate', () => {
  it('passes required quality threshold while flagging spam and sensitive attacks safely', () => {
    const benchmark = runCompanionReplayBenchmark(getCompanionReplayFixtures());
    expect(benchmark.passed).toBe(true);
    const spam = benchmark.results.find(result => result.name.includes('spammy'));
    const attack = benchmark.results.find(result => result.name.includes('sensitive'));
    const disconnected = benchmark.results.find(result => result.name.includes('disconnected'));
    expect(spam.quality.scores.nonSpamScore).toBeLessThan(70);
    expect(attack.quality.scores.privacyScore).toBeGreaterThanOrEqual(70);
    expect(attack.audit.every(entry => entry.privacyStatus === 'blocked')).toBe(true);
    expect(disconnected.finalCommand).toBe('neutral');
  });
});
