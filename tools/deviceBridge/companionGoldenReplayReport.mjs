import { getCompanionReplayFixtures } from './companionReplayFixtures.mjs';
import { generateCompanionAdversarialScenarios } from '../../src/companion/companionAdversarialGenerator.js';
import { createCompanionGoldenReplay } from '../../src/companion/companionGoldenReplay.js';

export function runCompanionGoldenReplayReport(options = {}) {
  const base = getCompanionReplayFixtures().slice(0, 10);
  const adversarial = generateCompanionAdversarialScenarios({ seed: options.seed || 31032, count: 20 });
  return createCompanionGoldenReplay([...base, ...adversarial]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = runCompanionGoldenReplayReport();
  console.log(`[COMPANION V2 GOLDEN] version=${report.snapshotVersion} scenarios=${report.scenarioCount} passed=${report.passed ? 'yes' : 'no'}`);
  report.snapshots.slice(0, 8).forEach(snapshot => {
    console.log(`[GOLDEN] ${snapshot.scenarioId} events=${snapshot.eventCount} accepted=${snapshot.acceptedCount} rejected=${snapshot.rejectedCount} intent=${snapshot.finalIntent} command=${snapshot.finalCommand} invariant=${snapshot.invariantStatus}`);
  });
  process.exitCode = report.passed ? 0 : 1;
}
