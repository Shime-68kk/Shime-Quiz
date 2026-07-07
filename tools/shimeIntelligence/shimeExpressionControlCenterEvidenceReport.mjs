import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runShimeFusionQaHarness } from '../../src/shimeIntelligence/shimeFusionQaHarness.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeExpressionControlCenterEvidenceReport() {
  const harness = runShimeFusionQaHarness();
  const report = {
    status: harness.allDryRun ? 'PASS' : 'FAIL',
    caseCount: harness.caseCount,
    expressionPreviews: harness.cases.filter(entry => entry.expressionPreview).map(entry => entry.expressionPreview),
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-expression-control-center-evidence.json'), report);
  return { report, artifact };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifact } = runShimeExpressionControlCenterEvidenceReport();
  console.log(`[SHIME EXPRESSION CONTROL] status=${report.status} previews=${report.expressionPreviews.length} artifact=${path.relative(ROOT, artifact)}`);
}
