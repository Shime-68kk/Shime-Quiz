import { describe, expect, it } from 'vitest';
import { createCompanionEvidenceBenchmark } from '../../tools/deviceBridge/companionEvidenceBenchmark.mjs';

const BENCHMARK_TIMEOUT_MS = 20000;

describe('companionV2GoldenSnapshotIntegrity', () => {
  it('produces deterministic sanitized golden snapshots', () => {
    const a = createCompanionEvidenceBenchmark({ count: 1000, attackCount: 120, seed: 44 }).golden;
    const b = createCompanionEvidenceBenchmark({ count: 1000, attackCount: 120, seed: 44 }).golden;
    expect(a).toEqual(b);
    expect(a.snapshots.length).toBeGreaterThanOrEqual(100);
    const serialized = JSON.stringify(a);
    expect(serialized).not.toContain('payload');
    expect(serialized).not.toContain('private');
    expect(serialized).not.toContain('correctAnswer');
  }, BENCHMARK_TIMEOUT_MS);
});
