import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runShimeFusionQaHarness } from '../../src/shimeIntelligence/shimeFusionQaHarness.js';
import { createShimeFusionManualQaChecklist, summarizeShimeFusionManualQaChecklist } from '../../src/shimeIntelligence/shimeFusionManualQaModel.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeFusionQaHarnessReport() {
  const harness = runShimeFusionQaHarness();
  const checklist = createShimeFusionManualQaChecklist();
  const report = {
    status: harness.allDryRun ? 'PASS' : 'FAIL',
    caseCount: harness.caseCount,
    cases: harness.cases,
    manualQaSummary: summarizeShimeFusionManualQaChecklist(checklist),
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-fusion-qa-harness.json'), report);
  return { report, artifact };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifact } = runShimeFusionQaHarnessReport();
  console.log(`[SHIME FUSION QA] status=${report.status} cases=${report.caseCount} artifact=${path.relative(ROOT, artifact)}`);
  process.exitCode = report.status === 'PASS' ? 0 : 1;
}
