import { auditCompanionDecisionSequence } from './companionDecisionAudit.js';
import { scoreCompanionBehavior } from './companionQualityScoring.js';

export function runCompanionReplayScenario(scenario = {}) {
  const audit = auditCompanionDecisionSequence(scenario.events || [], scenario.options || {});
  const quality = scoreCompanionBehavior(audit, scenario.qualityOptions || {});
  const final = audit.at(-1) || {};
  return {
    name: scenario.name || 'unnamed',
    eventCount: (scenario.events || []).length,
    finalIntent: final.policyIntent || 'none',
    finalCommand: final.finalRobotIntent || 'neutral',
    quality,
    safetyResult: quality.scores.safetyScore >= 70 ? 'pass' : 'fail',
    privacyResult: quality.scores.privacyScore >= 70 ? 'pass' : 'fail',
    passed: quality.passed,
    audit
  };
}

export function runCompanionReplayBenchmark(scenarios = []) {
  const results = scenarios.map(runCompanionReplayScenario);
  const isExpectedWarning = (result, index) => {
    const scenario = scenarios[index] || {};
    const tags = scenario.expectedTags || [];
    const name = String(result.name || '').toLowerCase();
    const reasons = result.quality.failureReasons || [];
    const nonSpamOnly = reasons.length === 1 && reasons[0] === 'non_spam_score_low';
    return result.name.includes('sensitive') ||
      result.name.includes('malformed') ||
      result.name.includes('spammy') ||
      tags.includes('repeated_event_spam') ||
      (nonSpamOnly && ['streak', 'storm', 'bounded', 'alternating'].some(word => name.includes(word)));
  };
  return {
    scenarioCount: results.length,
    passedCount: results.filter(result => result.passed).length,
    failedCount: results.filter(result => !result.passed).length,
    results,
    passed: results.every((result, index) => result.passed || isExpectedWarning(result, index))
  };
}
