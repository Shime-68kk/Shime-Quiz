export const SHIME_ECOSYSTEM_REVIEW_REQUIRED_ARTIFACTS = Object.freeze([
  'shime-ecosystem-evidence-summary.json',
  'shime-fsrs-robot-fusion-report.md',
  'shime-fsrs-robot-fusion-report.json',
  'shime-learning-capsule-golden.json',
  'shime-transport-brain-simulation.json',
  'shime-timetable-intervention-scenarios.json',
  'shime-ecosystem-benchmark.json',
  'shime-ecosystem-decision-audit-sample.json',
  'shime-capsule-privacy-audit.json',
  'shime-roadmap-evidence.md',
  'shime-product-doctrine-report.json',
  'shime-fsrs-robot-policy-matrix.json'
]);

const REQUIRED_SCENARIO_FAMILIES = Object.freeze([
  'validLearningScenarioCount',
  'transportScenarioCount',
  'timetableScenarioCount',
  'mixedScenarioCount',
  'attackScenarioCount'
]);

function add(list, condition, message) {
  if (condition) list.push(message);
}

function artifactValue(artifacts, name) {
  return Object.prototype.hasOwnProperty.call(artifacts || {}, name) ? artifacts[name] : undefined;
}

function hasReasonCodes(value) {
  if (Array.isArray(value)) return value.every(hasReasonCodes);
  if (!value || typeof value !== 'object') return true;
  if (Object.prototype.hasOwnProperty.call(value, 'reasonCodes') && (!Array.isArray(value.reasonCodes) || value.reasonCodes.length === 0)) return false;
  return Object.values(value).every(hasReasonCodes);
}

function hasMarker(value, key, expected) {
  if (Array.isArray(value)) return value.some(entry => hasMarker(entry, key, expected));
  if (!value || typeof value !== 'object') return false;
  if (value[key] === expected) return true;
  return Object.values(value).some(entry => hasMarker(entry, key, expected));
}

export function reviewShimeEcosystemEvidence(artifacts = {}) {
  const blockers = [];
  const warnings = [];
  const missingArtifacts = SHIME_ECOSYSTEM_REVIEW_REQUIRED_ARTIFACTS.filter(name => artifactValue(artifacts, name) === undefined);
  add(blockers, missingArtifacts.length > 0, `missing_artifacts:${missingArtifacts.join(',')}`);

  const benchmark = artifactValue(artifacts, 'shime-ecosystem-benchmark.json') || {};
  const summary = artifactValue(artifacts, 'shime-ecosystem-evidence-summary.json') || {};
  const privacy = artifactValue(artifacts, 'shime-capsule-privacy-audit.json') || {};
  const capsuleGolden = artifactValue(artifacts, 'shime-learning-capsule-golden.json') || [];
  const transport = artifactValue(artifacts, 'shime-transport-brain-simulation.json') || [];
  const timetable = artifactValue(artifacts, 'shime-timetable-intervention-scenarios.json') || [];
  const audit = artifactValue(artifacts, 'shime-ecosystem-decision-audit-sample.json') || [];
  const matrix = artifactValue(artifacts, 'shime-fsrs-robot-policy-matrix.json') || {};
  const roadmap = String(artifactValue(artifacts, 'shime-roadmap-evidence.md') || '');

  add(blockers, Number(benchmark.scenarioCount || 0) < 10000, 'benchmark_scenario_count_below_10000');
  add(blockers, Number(benchmark.attackScenarioCount || 0) < 1000, 'attack_scenario_count_below_1000');
  add(blockers, privacy.status !== 'PASS', 'privacy_audit_not_pass');
  add(blockers, summary.status !== 'PASS', 'evidence_summary_not_pass');
  add(blockers, summary.dryRunOnly !== true, 'summary_missing_dry_run_only');
  add(blockers, summary.motionLocked !== true, 'summary_missing_motion_locked');
  add(blockers, summary.timetableSuggestionOnly !== true, 'summary_missing_timetable_suggestion_only');

  REQUIRED_SCENARIO_FAMILIES.forEach(key => {
    add(warnings, Number(benchmark[key] || 0) <= 0, `missing_scenario_family:${key}`);
  });
  add(warnings, Number(matrix.ruleCount || 0) < 8, 'policy_matrix_rule_count_low');
  add(warnings, !Array.isArray(matrix.selections) || matrix.selections.length < 5, 'policy_matrix_selection_coverage_low');
  add(warnings, !Array.isArray(capsuleGolden) || capsuleGolden.length < 10, 'capsule_golden_sample_low');
  add(warnings, !Array.isArray(timetable) || timetable.length < 10, 'timetable_sample_low');
  add(warnings, !Array.isArray(audit) || audit.length < 10, 'audit_sample_low');
  add(warnings, !roadmap.includes('Shime Robot') || !roadmap.includes('Shime Quiz'), 'roadmap_product_roles_unclear');
  add(warnings, !hasReasonCodes(audit), 'audit_missing_reason_codes');
  add(warnings, !hasMarker(audit, 'dryRunOnly', true), 'audit_missing_dry_run_only');
  add(warnings, !hasMarker(capsuleGolden, 'dryRunOnly', true), 'capsules_missing_dry_run_only');
  add(warnings, !hasMarker(matrix, 'scheduleMutationAllowed', false), 'matrix_missing_schedule_mutation_false');
  add(warnings, !hasMarker(summary, 'motionLocked', true), 'summary_missing_motion_locked_marker');

  const transportRecommendations = new Set((Array.isArray(transport) ? transport : []).map(entry => entry.recommendation));
  add(warnings, transportRecommendations.size <= 1, 'transport_simulation_recommendation_distribution_shallow');
  add(warnings, !hasMarker(transport, 'opensConnection', false), 'transport_missing_opens_connection_false');
  add(warnings, !hasMarker(timetable, 'mutatesSchedule', false), 'timetable_missing_mutates_schedule_false');

  const artifactSummary = {
    requiredCount: SHIME_ECOSYSTEM_REVIEW_REQUIRED_ARTIFACTS.length,
    presentCount: SHIME_ECOSYSTEM_REVIEW_REQUIRED_ARTIFACTS.length - missingArtifacts.length,
    missingArtifacts
  };
  const scenarioCoverageSummary = {
    scenarioCount: Number(benchmark.scenarioCount || 0),
    validScenarioCount: Number(benchmark.validScenarioCount || 0),
    attackScenarioCount: Number(benchmark.attackScenarioCount || 0),
    validLearningScenarioCount: Number(benchmark.validLearningScenarioCount || 0),
    transportScenarioCount: Number(benchmark.transportScenarioCount || 0),
    timetableScenarioCount: Number(benchmark.timetableScenarioCount || 0),
    mixedScenarioCount: Number(benchmark.mixedScenarioCount || 0)
  };
  const privacySummary = {
    privacyAuditStatus: privacy.status || 'UNKNOWN',
    invariantFailureCount: Number(privacy.invariantFailureCount ?? summary.invariantFailureCount ?? 0),
    dryRunOnly: privacy.dryRunOnly === true && summary.dryRunOnly === true
  };
  const policyMatrixSummary = {
    status: matrix.status || 'UNKNOWN',
    ruleCount: Number(matrix.ruleCount || 0),
    selectionCount: Array.isArray(matrix.selections) ? matrix.selections.length : 0
  };

  const overallStatus = blockers.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARN' : 'PASS';
  return {
    overallStatus,
    blockers,
    warnings,
    artifactSummary,
    scenarioCoverageSummary,
    privacySummary,
    policyMatrixSummary,
    manualReviewNotes: [
      'Verify Section D remains explicit-click only.',
      'Verify generated evidence remains summary-only and coarse.',
      'Transport distribution warning is acceptable for a dry-run planning phase if no real transport is mounted.'
    ],
    recommendation: overallStatus === 'FAIL'
      ? 'NOT_SAFE_FOR_SHIME_FUSION_CONTROL_CENTER'
      : warnings.length > 0
        ? 'SAFE_FOR_PHASE_37_MORE_EVIDENCE_HARDENING'
        : 'SAFE_FOR_PHASE_37_SHIME_FUSION_CONTROL_CENTER_MANUAL_QA',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: ['shime_evidence_review_completed']
  };
}
