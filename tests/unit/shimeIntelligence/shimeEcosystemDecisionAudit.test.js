import { describe, expect, it } from 'vitest';
import { runShimeEcosystemBenchmark } from '../../../src/shimeIntelligence/shimeEcosystemBenchmark.js';

describe('shimeEcosystemDecisionAudit', () => {
  it('audit sample is dry-run and contains no raw payload', () => {
    const audit = runShimeEcosystemBenchmark().auditSample;
    expect(audit.every(entry => entry.dryRunOnly === true && entry.reasonCodes.length > 0)).toBe(true);
    expect(JSON.stringify(audit)).not.toContain('payload');
  });
});
