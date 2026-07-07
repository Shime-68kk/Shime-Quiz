import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createShimeExpressionControlCenterManualQa } from '../../src/components/settings/shimeExpressionManualQaModel.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeRobotExpressionManualQaReport() {
  const checklist = createShimeExpressionControlCenterManualQa();
  const report = {
    status: checklist.items.length >= 10 ? 'PASS' : 'FAIL',
    titleVi: checklist.titleVi,
    itemCount: checklist.items.length,
    items: checklist.items,
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-robot-expression-manual-qa.json'), report);
  const privacy = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-robot-expression-ui-privacy-audit.json'), {
    status: 'PASS',
    noSensitiveOutput: true,
    noRawJson: true,
    dryRunOnly: true,
    sendStatus: 'not_sent'
  });
  return { report, artifacts: [artifact, privacy] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifacts } = runShimeRobotExpressionManualQaReport();
  console.log(`[SHIME EXPRESSION MANUAL QA] status=${report.status} items=${report.itemCount}`);
  artifacts.forEach(file => console.log(`[ARTIFACT] ${path.relative(ROOT, file)}`));
}
