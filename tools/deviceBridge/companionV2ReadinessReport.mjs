import { getCompanionReplayFixtures } from './companionReplayFixtures.mjs';
import { generateCompanionAdversarialScenarios } from '../../src/companion/companionAdversarialGenerator.js';
import { evaluateCompanionV2Readiness } from '../../src/companion/companionV2ReadinessGate.js';

export function runCompanionV2ReadinessReport(options = {}) {
  const scenarios = [
    ...getCompanionReplayFixtures(),
    ...generateCompanionAdversarialScenarios({ seed: options.seed || 31032, count: options.count || 100 })
  ];
  return evaluateCompanionV2Readiness(scenarios, options);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = runCompanionV2ReadinessReport();
  console.log(`[COMPANION V2 READINESS] overall=${report.overall} next=${report.recommendedNextPhase}`);
  report.dimensions.forEach(entry => {
    console.log(`[READINESS] ${entry.name}=${entry.status} ${entry.message}`);
  });
  process.exitCode = report.passed ? 0 : 1;
}
