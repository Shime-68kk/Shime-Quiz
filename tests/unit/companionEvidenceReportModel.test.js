import { describe, expect, it } from 'vitest';
import { createCompanionEvidenceReportSummary } from '../../src/components/settings/companionEvidenceReportModel.js';

describe('companionEvidenceReportModel', () => {
  it('parses generated-style reports', () => {
    const summary = createCompanionEvidenceReportSummary({
      summary: { passed: true, scenarioCount: 1120, invariantFailures: 0, privacyFailures: 0, coveragePercent: 100, readinessStatus: 'PASS', goldenSnapshotCount: 150 }
    }, { generatedAt: 'static' });
    expect(summary).toMatchObject({ benchmarkStatus: 'PASS', scenarioCount: 1120, readinessStatus: 'PASS', warnings: [] });
    expect(summary.reportGeneratedAt).toBe('static');
  });

  it('uses safe warnings for missing fields without Date.now', () => {
    const summary = createCompanionEvidenceReportSummary({});
    expect(summary.warnings).toEqual(expect.arrayContaining(['missing_scenario_count', 'coverage_below_100', 'readiness_not_pass']));
    expect(summary.reportGeneratedAt).toBe('static-review-artifact');
    expect(JSON.stringify(summary)).not.toContain('private');
  });
});
