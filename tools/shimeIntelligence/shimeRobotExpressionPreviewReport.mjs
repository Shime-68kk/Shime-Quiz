import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runShimeFusionQaHarness } from '../../src/shimeIntelligence/shimeFusionQaHarness.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeRobotExpressionPreviewReport() {
  const harness = runShimeFusionQaHarness();
  const report = {
    status: 'PASS',
    previewCount: harness.cases.filter(entry => entry.expressionPreview).length,
    previews: harness.cases.filter(entry => entry.expressionPreview).map(entry => entry.expressionPreview),
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-robot-expression-preview.json'), report);
  return { report, artifact };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifact } = runShimeRobotExpressionPreviewReport();
  console.log(`[SHIME EXPRESSION PREVIEW] status=${report.status} previews=${report.previewCount} artifact=${path.relative(ROOT, artifact)}`);
}
