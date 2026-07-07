import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runShimeEcosystemBenchmark } from '../../src/shimeIntelligence/shimeEcosystemBenchmark.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeCapsulePrivacyAudit() {
  const benchmark = runShimeEcosystemBenchmark();
  const report = {
    status: benchmark.invariantFailureCount === 0 ? 'PASS' : 'FAIL',
    checkedScenarioCount: benchmark.scenarioCount,
    invariantFailureCount: benchmark.invariantFailureCount,
    attackScenarioCount: benchmark.attackScenarioCount,
    dryRunOnly: benchmark.dryRunOnly
  };
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-capsule-privacy-audit.json'), report);
  return { report, artifact };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifact } = runShimeCapsulePrivacyAudit();
  console.log(`[SHIME CAPSULE PRIVACY] status=${report.status} checked=${report.checkedScenarioCount} artifact=${path.relative(ROOT, artifact)}`);
  process.exitCode = report.status === 'PASS' ? 0 : 1;
}
