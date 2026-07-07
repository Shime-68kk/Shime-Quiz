import { describe, expect, it } from 'vitest';
import { reviewShimeEcosystemEvidence, SHIME_ECOSYSTEM_REVIEW_REQUIRED_ARTIFACTS } from '../../../src/shimeIntelligence/shimeEcosystemEvidenceReview.js';

function validArtifacts(overrides = {}) {
  const base = {
    'shime-ecosystem-evidence-summary.json': { status: 'PASS', dryRunOnly: true, motionLocked: true, timetableSuggestionOnly: true, transportRecommendationOnly: true, invariantFailureCount: 0 },
    'shime-fsrs-robot-fusion-report.md': '# Shime FSRS Robot Fusion Report',
    'shime-fsrs-robot-fusion-report.json': { status: 'PASS', scenarioCount: 10000, dryRunOnly: true },
    'shime-learning-capsule-golden.json': Array.from({ length: 10 }, (_, index) => ({ capsuleId: `c${index}`, dryRunOnly: true, privacyStatus: 'redacted_coarse_only' })),
    'shime-transport-brain-simulation.json': [{ recommendation: 'app_local_only', opensConnection: false }, { recommendation: 'no_transport_safe', opensConnection: false }],
    'shime-timetable-intervention-scenarios.json': Array.from({ length: 10 }, (_, index) => ({ scenarioId: `t${index}`, mutatesSchedule: false })),
    'shime-ecosystem-benchmark.json': { scenarioCount: 10000, validScenarioCount: 9000, attackScenarioCount: 1000, validLearningScenarioCount: 5000, transportScenarioCount: 2000, timetableScenarioCount: 1000, mixedScenarioCount: 1000 },
    'shime-ecosystem-decision-audit-sample.json': Array.from({ length: 10 }, (_, index) => ({ scenarioId: `a${index}`, dryRunOnly: true, reasonCodes: ['ok'] })),
    'shime-capsule-privacy-audit.json': { status: 'PASS', invariantFailureCount: 0, dryRunOnly: true },
    'shime-roadmap-evidence.md': 'Shime Robot and Shime Quiz remain local-first.',
    'shime-product-doctrine-report.json': { status: 'PASS' },
    'shime-fsrs-robot-policy-matrix.json': { status: 'PASS', ruleCount: 9, selections: Array.from({ length: 5 }, (_, index) => ({ scenarioId: `p${index}`, timetable: { scheduleMutationAllowed: false } })) }
  };
  return { ...base, ...overrides };
}

describe('shimeEcosystemEvidenceReview', () => {
  it('passes complete evidence with enough coverage', () => {
    const review = reviewShimeEcosystemEvidence(validArtifacts());
    expect(review.overallStatus).toBe('PASS');
    expect(review.blockers).toEqual([]);
    expect(review.artifactSummary.presentCount).toBe(SHIME_ECOSYSTEM_REVIEW_REQUIRED_ARTIFACTS.length);
    expect(review.scenarioCoverageSummary.scenarioCount).toBe(10000);
  });

  it('fails if required artifact is missing', () => {
    const artifacts = validArtifacts();
    delete artifacts['shime-capsule-privacy-audit.json'];
    const review = reviewShimeEcosystemEvidence(artifacts);
    expect(review.overallStatus).toBe('FAIL');
    expect(review.blockers.some(code => code.includes('missing_artifacts'))).toBe(true);
  });

  it('warns if benchmark is shallow but not below blocker threshold', () => {
    const review = reviewShimeEcosystemEvidence(validArtifacts({
      'shime-ecosystem-benchmark.json': { scenarioCount: 10000, validScenarioCount: 9000, attackScenarioCount: 1000, validLearningScenarioCount: 0, transportScenarioCount: 2000, timetableScenarioCount: 1000, mixedScenarioCount: 1000 }
    }));
    expect(review.overallStatus).toBe('WARN');
    expect(review.warnings).toContain('missing_scenario_family:validLearningScenarioCount');
  });

  it('fails if privacy audit fails and detects missing dryRunOnly marker', () => {
    const review = reviewShimeEcosystemEvidence(validArtifacts({
      'shime-capsule-privacy-audit.json': { status: 'FAIL', invariantFailureCount: 1, dryRunOnly: false },
      'shime-ecosystem-evidence-summary.json': { status: 'PASS', motionLocked: true, timetableSuggestionOnly: true }
    }));
    expect(review.overallStatus).toBe('FAIL');
    expect(review.blockers).toContain('privacy_audit_not_pass');
    expect(review.blockers).toContain('summary_missing_dry_run_only');
  });
});
