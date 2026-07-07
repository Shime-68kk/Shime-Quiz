import { describe, expect, it } from 'vitest';
import { runShimePolicyQualityAudit } from '../../../src/shimeIntelligence/shimePolicyQualityAudit.js';

describe('shimePolicyQualityAudit', () => {
  it('passes safe robot/timetable mappings', () => {
    const audit = runShimePolicyQualityAudit();
    expect(audit.overallStatus).toBe('PASS');
    expect(audit.policyQualityScore).toBeGreaterThanOrEqual(95);
    expect(audit.riskyMappings).toEqual([]);
    expect(audit.dryRunOnly).toBe(true);
    expect(audit.sendStatus).toBe('not_sent');
  });

  it('can flag evidence hardening recommendations without failing safe mappings', () => {
    const audit = runShimePolicyQualityAudit({ requireTransportDiversity: true });
    expect(audit.overallStatus).toBe('PASS');
    expect(audit.recommendedFixes).toContain('Add richer transport recommendation evidence before real transport QA.');
  });
});
