#!/usr/bin/env node
import { runCompanionReplayBenchmark } from '../../src/companion/companionReplayBenchmark.js';
import { getCompanionReplayFixtures } from './companionReplayFixtures.mjs';

export function runCompanionReplayBenchmarkTool(log = console.log) {
  const report = runCompanionReplayBenchmark(getCompanionReplayFixtures());
  report.results.forEach(result => {
    log(`[COMPANION V2 BENCH] ${result.name} events=${result.eventCount} finalIntent=${result.finalIntent} finalCommand=${result.finalCommand} safety=${result.safetyResult} privacy=${result.privacyResult} passed=${result.passed ? 'yes' : 'no'} score=${result.quality.scores.average}`);
  });
  log(`[COMPANION V2 BENCH] passed=${report.passed ? 'yes' : 'no'} scenarios=${report.scenarioCount}`);
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCompanionReplayBenchmarkTool();
}

