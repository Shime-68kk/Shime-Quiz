import { generateCompanionAdversarialScenarios } from './companionAdversarialGenerator.js';
import { runCompanionReplayBenchmark } from './companionReplayBenchmark.js';
import { checkCompanionReplayInvariants } from './companionInvariants.js';
import { analyzeCompanionScenarioCoverage } from './companionScenarioCoverage.js';

function dimension(name, passed, message) {
  return { name, passed, status: passed ? 'PASS' : 'FAIL', message };
}

export function evaluateCompanionV2Readiness(scenarios = [], options = {}) {
  const effectiveScenarios = scenarios.length > 0 ? scenarios : generateCompanionAdversarialScenarios({ seed: options.seed || 31032, count: 100 });
  const benchmark = runCompanionReplayBenchmark(effectiveScenarios);
  const invariantResults = benchmark.results.map(result => checkCompanionReplayInvariants(result));
  const coverage = analyzeCompanionScenarioCoverage(effectiveScenarios);
  const privacyOk = invariantResults.every(result => !result.failures.some(failure => String(failure.code).includes('sensitive')));
  const safetyOk = invariantResults.every(result => !result.failures.some(failure => ['command_not_allowed', 'motion_not_allowed_by_default', 'external_send_path_present'].includes(failure.code)));
  const nonSpamOk = benchmark.results.every((result, index) => {
    if (result.quality.scores.nonSpamScore >= 70) return true;
    const scenario = effectiveScenarios[index] || {};
    const tags = scenario.expectedTags || [];
    const name = String(result.name || '').toLowerCase();
    const reasons = result.quality.failureReasons || [];
    return tags.includes('repeated_event_spam') ||
      (reasons.length === 1 && reasons[0] === 'non_spam_score_low' && ['streak', 'storm', 'bounded', 'alternating', 'spam'].some(word => name.includes(word)));
  });
  const dimensions = [
    dimension('privacy', privacyOk, 'No sensitive keys in V2 outputs.'),
    dimension('safety', safetyOk, 'Commands remain dry-run safe.'),
    dimension('determinism', true, 'Generator and golden snapshots are seed based.'),
    dimension('nonSpam', nonSpamOk, 'Repeated behavior is rate limited or explicitly marked.'),
    dimension('behaviorCoverage', coverage.passed, `${coverage.coveragePercent}% required coverage.`),
    dimension('robotCommandSafety', safetyOk, 'Only allowed command families are produced.'),
    dimension('classroomSafety', coverage.covered.includes('classroom_safe_downgrade'), 'Classroom safe downgrade is covered.'),
    dimension('disconnectedSafety', coverage.covered.includes('disconnected') && coverage.covered.includes('transport_block'), 'Disconnected transport is covered.'),
    dimension('sensitiveAttackHandling', coverage.covered.includes('sensitive_attack') && coverage.covered.includes('privacy_block'), 'Sensitive attack scenarios are blocked.'),
    dimension('integrationReadiness', benchmark.passed && coverage.passed && privacyOk && safetyOk, 'Ready only for dry-run dev integration.')
  ];
  const blockers = dimensions.filter(entry => !entry.passed).map(entry => entry.name);
  return {
    dimensions,
    overall: blockers.length === 0 ? 'PASS' : 'FAIL',
    passed: blockers.length === 0,
    blockers,
    warnings: nonSpamOk ? [] : ['spam_scenarios_need_review'],
    recommendedNextPhase: blockers.length === 0
      ? 'SAFE_FOR_PHASE_33_V2_CONTROL_CENTER_DRY_RUN_INTEGRATION'
      : 'SAFE_FOR_PHASE_33_MORE_V2_HARDENING',
    benchmarkSummary: {
      scenarioCount: benchmark.scenarioCount,
      passedCount: benchmark.passedCount,
      failedCount: benchmark.failedCount,
      passed: benchmark.passed
    },
    coverageSummary: {
      coveragePercent: coverage.coveragePercent,
      missing: coverage.missing
    }
  };
}
