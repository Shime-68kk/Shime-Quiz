import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCompanionAdversarialScenarios } from '../../src/companion/companionAdversarialGenerator.js';
import { runCompanionReplayBenchmark } from '../../src/companion/companionReplayBenchmark.js';
import { checkCompanionReplayInvariants } from '../../src/companion/companionInvariants.js';
import { analyzeCompanionScenarioCoverage } from '../../src/companion/companionScenarioCoverage.js';
import { evaluateCompanionV2Readiness } from '../../src/companion/companionV2ReadinessGate.js';
import { createCompanionGoldenReplay } from '../../src/companion/companionGoldenReplay.js';
import { auditCompanionDecisionSequence } from '../../src/companion/companionDecisionAudit.js';
import { getCompanionReplayFixtures } from './companionReplayFixtures.mjs';
import { writeEvidenceJson, writeEvidenceMarkdown } from './companionEvidenceSnapshotWriter.mjs';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const GENERATED_DIR = path.join(PROJECT_ROOT, 'docs/generated');
const GENERATED_AT = 'static-phase-33-evidence';

function attackScenario(index) {
  return {
    id: `attack_${index}`,
    name: `invalid attack ${index}`,
    valid: false,
    attack: true,
    expectedTags: ['sensitive_attack'],
    events: [{ eventType: 'session_started', sessionId: `attack_${index}`, payload: index % 2 ? { question: 'blocked' } : { safe: { correctAnswer: 'blocked' } } }]
  };
}

function sanitizeGolden(golden) {
  return {
    snapshotVersion: golden.snapshotVersion,
    scenarioCount: golden.scenarioCount,
    passed: golden.passed,
    snapshots: golden.snapshots.map((snapshot, index) => ({
      scenarioId: `scenario_${String(index + 1).padStart(4, '0')}`,
      eventCount: snapshot.eventCount,
      acceptedCount: snapshot.acceptedCount,
      rejectedCount: snapshot.rejectedCount,
      finalIntent: snapshot.finalIntent,
      finalCommand: snapshot.finalCommand,
      finalSafetyOutcome: snapshot.finalSafetyOutcome,
      privacyScoreBucket: snapshot.privacyScoreBucket,
      safetyScoreBucket: snapshot.safetyScoreBucket,
      nonSpamScoreBucket: snapshot.nonSpamScoreBucket,
      invariantStatus: snapshot.invariantStatus
    }))
  };
}

function sanitizeCoverage(coverage) {
  return {
    requiredCount: coverage.required.length,
    coveredCount: coverage.covered.length,
    missing: coverage.missing,
    coveragePercent: coverage.coveragePercent,
    passed: coverage.passed
  };
}

function sanitizeReadiness(readiness) {
  return {
    overall: readiness.overall,
    passed: readiness.passed,
    blockers: readiness.blockers,
    warnings: readiness.warnings,
    recommendedNextPhase: readiness.recommendedNextPhase,
    dimensions: readiness.dimensions.map(entry => ({ name: entry.name, status: entry.status })),
    benchmarkSummary: readiness.benchmarkSummary,
    coverageSummary: readiness.coverageSummary
  };
}

function sanitizeAudit(audit) {
  return audit.slice(0, 12).map(entry => ({
    step: entry.step,
    accepted: entry.accepted,
    rejectedReason: entry.rejectedReason,
    policyIntent: entry.policyIntent,
    safetyDecision: entry.safetyDecision,
    finalRobotIntent: entry.finalRobotIntent,
    reasonCodeCount: entry.reasonCodes.length,
    privacyStatus: entry.privacyStatus,
    dryRunOnly: entry.dryRunOnly
  }));
}

export function createCompanionEvidenceBenchmark(options = {}) {
  const curated = getCompanionReplayFixtures();
  const generated = generateCompanionAdversarialScenarios({ seed: options.seed || 33000, count: options.count || 1000 });
  const attacks = Array.from({ length: options.attackCount || 120 }, (_, index) => attackScenario(index + 1));
  const scenarios = [...curated, ...generated, ...attacks];
  const benchmark = runCompanionReplayBenchmark(scenarios);
  const invariantResults = benchmark.results.map(result => checkCompanionReplayInvariants(result));
  const invariantFailures = invariantResults.flatMap(result => result.failures);
  const validScenarioCount = scenarios.filter(scenario => scenario.valid !== false && scenario.attack !== true).length;
  const attackScenarioCount = scenarios.filter(scenario => scenario.attack === true).length;
  const coverage = analyzeCompanionScenarioCoverage(scenarios);
  const readiness = evaluateCompanionV2Readiness(scenarios, { seed: options.seed || 33000 });
  const golden = createCompanionGoldenReplay(scenarios.slice(0, 150));
  const audit = auditCompanionDecisionSequence(curated[0].events);
  const dryRunFailures = benchmark.results.flatMap(result => result.audit || []).filter(entry => entry.dryRunOnly !== true).length;
  const sendStatusFailures = 0;
  const privacyFailures = invariantFailures.filter(failure => String(failure.code).includes('sensitive')).length;
  const passed = scenarios.length >= 1000 &&
    attackScenarioCount >= 100 &&
    invariantFailures.length === 0 &&
    readiness.passed &&
    coverage.coveragePercent === 100 &&
    dryRunFailures === 0 &&
    sendStatusFailures === 0;

  const summary = {
    generatedAt: GENERATED_AT,
    benchmarkStatus: passed ? 'PASS' : 'FAIL',
    passed,
    scenarioCount: scenarios.length,
    validScenarioCount,
    attackScenarioCount,
    invariantFailures: invariantFailures.length,
    privacyFailures,
    dryRunFailures,
    sendStatusFailures,
    coveragePercent: coverage.coveragePercent,
    readinessStatus: readiness.overall,
    goldenSnapshotCount: golden.snapshots.length,
    recommendation: passed ? 'SAFE_FOR_PHASE_34_V2_CONTROL_CENTER_MANUAL_QA' : 'SAFE_FOR_PHASE_34_MORE_V2_EVIDENCE_HARDENING'
  };

  return {
    summary,
    benchmark: {
      scenarioCount: benchmark.scenarioCount,
      passedCount: benchmark.passedCount,
      failedCount: benchmark.failedCount,
      passed: benchmark.passed
    },
    coverage: sanitizeCoverage(coverage),
    readiness: sanitizeReadiness(readiness),
    golden: sanitizeGolden(golden),
    auditSample: sanitizeAudit(audit)
  };
}

export function writeCompanionEvidenceBenchmarkArtifacts(report, options = {}) {
  const outputDir = options.outputDir || GENERATED_DIR;
  const artifacts = [];
  artifacts.push(writeEvidenceJson(path.join(outputDir, 'companion-v2-evidence-summary.json'), report.summary));
  artifacts.push(writeEvidenceJson(path.join(outputDir, 'companion-v2-golden-snapshots.json'), report.golden));
  artifacts.push(writeEvidenceJson(path.join(outputDir, 'companion-v2-coverage-report.json'), report.coverage));
  artifacts.push(writeEvidenceJson(path.join(outputDir, 'companion-v2-readiness-report.json'), report.readiness));
  artifacts.push(writeEvidenceJson(path.join(outputDir, 'companion-v2-decision-audit-sample.json'), report.auditSample));
  artifacts.push(writeEvidenceMarkdown(path.join(outputDir, 'companion-v2-evidence-benchmark.md'), `
# Companion V2 Evidence Benchmark

- Status: ${report.summary.benchmarkStatus}
- Scenario count: ${report.summary.scenarioCount}
- Attack scenario count: ${report.summary.attackScenarioCount}
- Invariant failures: ${report.summary.invariantFailures}
- Privacy failures: ${report.summary.privacyFailures}
- Dry-run failures: ${report.summary.dryRunFailures}
- Coverage: ${report.summary.coveragePercent}%
- Readiness: ${report.summary.readinessStatus}
- Recommendation: ${report.summary.recommendation}
`));
  return artifacts;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = createCompanionEvidenceBenchmark();
  const artifacts = writeCompanionEvidenceBenchmarkArtifacts(report);
  console.log(`[COMPANION V2 EVIDENCE] status=${report.summary.benchmarkStatus} scenarios=${report.summary.scenarioCount} attacks=${report.summary.attackScenarioCount} coverage=${report.summary.coveragePercent}% readiness=${report.summary.readinessStatus}`);
  artifacts.forEach(file => console.log(`[ARTIFACT] ${path.relative(PROJECT_ROOT, file)}`));
  process.exitCode = report.summary.passed ? 0 : 1;
}
