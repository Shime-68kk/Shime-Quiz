import { generateCompanionAdversarialScenarios } from '../../src/companion/companionAdversarialGenerator.js';
import { runCompanionReplayBenchmark } from '../../src/companion/companionReplayBenchmark.js';
import { checkCompanionReplayInvariants } from '../../src/companion/companionInvariants.js';

export function runCompanionAdversarialReplayTool(options = {}) {
  const scenarios = generateCompanionAdversarialScenarios({ seed: options.seed || 31032, count: options.count || 100 });
  const benchmark = runCompanionReplayBenchmark(scenarios);
  const invariantFailures = benchmark.results.flatMap(result => checkCompanionReplayInvariants(result).failures);
  const passed = benchmark.passed && invariantFailures.length === 0;
  return {
    seed: options.seed || 31032,
    scenarioCount: scenarios.length,
    benchmarkPassed: benchmark.passed,
    invariantFailureCount: invariantFailures.length,
    passed
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = runCompanionAdversarialReplayTool();
  console.log(`[COMPANION V2 ADVERSARIAL] seed=${report.seed} scenarios=${report.scenarioCount} benchmark=${report.benchmarkPassed ? 'pass' : 'fail'} invariants=${report.invariantFailureCount} passed=${report.passed ? 'yes' : 'no'}`);
  process.exitCode = report.passed ? 0 : 1;
}
