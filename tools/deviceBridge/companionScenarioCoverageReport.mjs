import { getCompanionReplayFixtures } from './companionReplayFixtures.mjs';
import { generateCompanionAdversarialScenarios } from '../../src/companion/companionAdversarialGenerator.js';
import { analyzeCompanionScenarioCoverage } from '../../src/companion/companionScenarioCoverage.js';

export function runCompanionScenarioCoverageReport(options = {}) {
  const scenarios = [
    ...getCompanionReplayFixtures(),
    ...generateCompanionAdversarialScenarios({ seed: options.seed || 31032, count: options.count || 100 })
  ];
  return analyzeCompanionScenarioCoverage(scenarios);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = runCompanionScenarioCoverageReport();
  console.log(`[COMPANION V2 COVERAGE] coverage=${report.coveragePercent}% passed=${report.passed ? 'yes' : 'no'} missing=${report.missing.join(',') || 'none'}`);
  process.exitCode = report.passed ? 0 : 1;
}
