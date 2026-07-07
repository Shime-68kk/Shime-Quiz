import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runShimeEcosystemBenchmark } from '../../src/shimeIntelligence/shimeEcosystemBenchmark.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeFsrsRobotFusionReport() {
  const benchmark = runShimeEcosystemBenchmark();
  const report = {
    status: benchmark.passed ? 'PASS' : 'FAIL',
    scenarioCount: benchmark.scenarioCount,
    appIsMemoryBrain: true,
    robotIsExpressionEndpoint: true,
    fsrsCanonical: true,
    robotSchedulerMutation: false,
    dryRunOnly: true
  };
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-fsrs-robot-fusion-report.json'), report);
  return { report, artifact };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifact } = runShimeFsrsRobotFusionReport();
  console.log(`[SHIME FSRS ROBOT] status=${report.status} scenarios=${report.scenarioCount} artifact=${path.relative(ROOT, artifact)}`);
  process.exitCode = report.status === 'PASS' ? 0 : 1;
}
