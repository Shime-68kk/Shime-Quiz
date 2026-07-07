import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runShimeEcosystemBenchmark } from '../../src/shimeIntelligence/shimeEcosystemBenchmark.js';
import { createShimeEcosystemEvidence } from '../../src/shimeIntelligence/shimeEcosystemGeneratedEvidence.js';
import { writeShimeJson, writeShimeMarkdown } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'docs/generated/shime-intelligence');

export function runShimeEcosystemBenchmarkTool(options = {}) {
  const benchmark = runShimeEcosystemBenchmark(options);
  const evidence = createShimeEcosystemEvidence(benchmark);
  const artifacts = [
    writeShimeJson(path.join(OUT, 'shime-ecosystem-evidence-summary.json'), evidence.summary),
    writeShimeJson(path.join(OUT, 'shime-ecosystem-benchmark.json'), {
      scenarioCount: benchmark.scenarioCount,
      validScenarioCount: benchmark.validScenarioCount,
      attackScenarioCount: benchmark.attackScenarioCount,
      validLearningScenarioCount: benchmark.validLearningScenarioCount,
      transportScenarioCount: benchmark.transportScenarioCount,
      timetableScenarioCount: benchmark.timetableScenarioCount,
      mixedScenarioCount: benchmark.mixedScenarioCount,
      invariantFailureCount: benchmark.invariantFailureCount,
      passed: benchmark.passed
    }),
    writeShimeJson(path.join(OUT, 'shime-learning-capsule-golden.json'), evidence.goldenCapsules),
    writeShimeJson(path.join(OUT, 'shime-transport-brain-simulation.json'), evidence.transportSimulation),
    writeShimeJson(path.join(OUT, 'shime-timetable-intervention-scenarios.json'), evidence.timetableScenarios),
    writeShimeJson(path.join(OUT, 'shime-ecosystem-decision-audit-sample.json'), evidence.auditSample),
    writeShimeMarkdown(path.join(OUT, 'shime-fsrs-robot-fusion-report.md'), `
# Shime FSRS Robot Fusion Report

- Status: ${evidence.summary.status}
- Scenario count: ${evidence.summary.scenarioCount}
- Attack scenario count: ${evidence.summary.attackScenarioCount}
- Dry-run only: ${evidence.summary.dryRunOnly}
- Motion locked: ${evidence.summary.motionLocked}
- Recommendation: ${evidence.summary.recommendation}
`)
  ];
  return { benchmark, evidence, artifacts };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { benchmark, artifacts } = runShimeEcosystemBenchmarkTool();
  console.log(`[SHIME ECOSYSTEM BENCH] passed=${benchmark.passed ? 'yes' : 'no'} scenarios=${benchmark.scenarioCount} attacks=${benchmark.attackScenarioCount}`);
  artifacts.forEach(file => console.log(`[ARTIFACT] ${path.relative(ROOT, file)}`));
  process.exitCode = benchmark.passed ? 0 : 1;
}
