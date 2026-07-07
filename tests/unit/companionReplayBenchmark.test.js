import { describe, expect, it } from 'vitest';
import { getCompanionReplayFixtures } from '../../tools/deviceBridge/companionReplayFixtures.mjs';
import { runCompanionReplayBenchmark } from '../../src/companion/companionReplayBenchmark.js';

describe('companionReplayBenchmark', () => {
  it('contains all required scenarios and is deterministic', () => {
    const fixtures = getCompanionReplayFixtures();
    expect(fixtures).toHaveLength(18);
    expect(runCompanionReplayBenchmark(fixtures)).toEqual(runCompanionReplayBenchmark(fixtures));
  });

  it('normal scenarios pass and sensitive scenario fails safely', () => {
    const report = runCompanionReplayBenchmark(getCompanionReplayFixtures());
    expect(report.results.find(result => result.name === 'normal short session').passed).toBe(true);
    const sensitive = report.results.find(result => result.name === 'sensitive payload attack');
    expect(sensitive.privacyResult).toBe('pass');
    expect(JSON.stringify(report)).not.toContain('private text');
  });
});

