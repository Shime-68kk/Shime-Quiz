import { runCompanionReplayScenario } from './companionReplayBenchmark.js';
import { checkCompanionReplayInvariants } from './companionInvariants.js';

function bucketFromScore(score) {
  if (score >= 85) return 'high';
  if (score >= 70) return 'medium';
  return 'low';
}

function summarizeReasonCodes(audit = []) {
  const counts = {};
  audit.forEach(entry => {
    (entry.reasonCodes || []).forEach(code => {
      counts[code] = (counts[code] || 0) + 1;
    });
  });
  return Object.keys(counts).sort().map(code => `${code}:${counts[code]}`);
}

export function createCompanionGoldenSnapshot(scenario = {}) {
  const result = runCompanionReplayScenario(scenario);
  const invariant = checkCompanionReplayInvariants(result, scenario.options || {});
  const acceptedCount = (result.audit || []).filter(entry => entry.accepted).length;
  const rejectedCount = (result.audit || []).filter(entry => !entry.accepted).length;
  return {
    scenarioId: scenario.id || scenario.name || 'unnamed',
    eventCount: result.eventCount,
    acceptedCount,
    rejectedCount,
    finalIntent: result.finalIntent,
    finalCommand: result.finalCommand,
    finalSafetyOutcome: result.safetyResult,
    privacyScoreBucket: bucketFromScore(result.quality.scores.privacyScore),
    safetyScoreBucket: bucketFromScore(result.quality.scores.safetyScore),
    nonSpamScoreBucket: bucketFromScore(result.quality.scores.nonSpamScore),
    reasonCodeSummary: summarizeReasonCodes(result.audit),
    invariantStatus: invariant.ok ? 'pass' : 'fail'
  };
}

export function createCompanionGoldenReplay(scenarios = []) {
  const snapshots = scenarios.map(createCompanionGoldenSnapshot);
  return {
    snapshotVersion: 'shime-companion-v2-golden-1',
    scenarioCount: snapshots.length,
    snapshots,
    passed: snapshots.every(snapshot => snapshot.invariantStatus === 'pass' || snapshot.rejectedCount > 0)
  };
}
