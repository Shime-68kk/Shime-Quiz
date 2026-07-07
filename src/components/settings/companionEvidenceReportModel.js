export function createCompanionEvidenceReportSummary(evidence = {}, options = {}) {
  const warnings = [];
  const summary = evidence.summary || evidence;
  const coverage = evidence.coverage || evidence.coverageReport || {};
  const readiness = evidence.readiness || evidence.readinessReport || {};
  const golden = evidence.golden || evidence.goldenSnapshots || {};

  const scenarioCount = Number.isFinite(summary.scenarioCount) ? summary.scenarioCount : 0;
  const invariantFailures = Number.isFinite(summary.invariantFailures) ? summary.invariantFailures : 0;
  const privacyFailures = Number.isFinite(summary.privacyFailures) ? summary.privacyFailures : 0;
  const coveragePercent = Number.isFinite(summary.coveragePercent) ? summary.coveragePercent : coverage.coveragePercent ?? 0;
  const readinessStatus = summary.readinessStatus || readiness.overall || 'UNKNOWN';
  const goldenSnapshotCount = Number.isFinite(summary.goldenSnapshotCount)
    ? summary.goldenSnapshotCount
    : golden.scenarioCount || golden.snapshots?.length || 0;

  if (scenarioCount <= 0) warnings.push('missing_scenario_count');
  if (coveragePercent < 100) warnings.push('coverage_below_100');
  if (readinessStatus !== 'PASS') warnings.push('readiness_not_pass');
  if (invariantFailures > 0) warnings.push('invariant_failures_present');
  if (privacyFailures > 0) warnings.push('privacy_failures_present');

  return {
    benchmarkStatus: summary.passed === true || summary.benchmarkStatus === 'PASS' ? 'PASS' : 'REVIEW',
    scenarioCount,
    invariantFailures,
    privacyFailures,
    coveragePercent,
    readinessStatus,
    goldenSnapshotCount,
    reportGeneratedAt: options.generatedAt || summary.generatedAt || 'static-review-artifact',
    warnings
  };
}
