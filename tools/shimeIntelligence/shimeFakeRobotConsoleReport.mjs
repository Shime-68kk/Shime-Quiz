import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runShimeFusionQaHarness } from '../../src/shimeIntelligence/shimeFusionQaHarness.js';
import { mapFusionToRobotExpression } from '../../src/shimeIntelligence/robotExpressionMapper.js';
import { createFakeRobotExpressionRuntime, applyRobotExpressionPlan, getFakeRobotExpressionSnapshot } from '../../src/shimeIntelligence/fakeRobotExpressionRuntime.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeFakeRobotConsoleReport() {
  const harness = runShimeFusionQaHarness({ caseIds: ['normal_review_day', 'high_due_pressure', 'privacy_attack'] });
  const runtime = harness.cases.reduce((state, entry) => {
    if (!entry.expressionPreview) return state;
    const plan = mapFusionToRobotExpression({
      learningCapsule: { privacyStatus: entry.inputSummary.privacyStatus, duePressureBucket: entry.inputSummary.duePressureBucket, forgettingRiskBucket: entry.inputSummary.forgettingRiskBucket, recoveryNeedBucket: entry.inputSummary.recoveryNeedBucket },
      robotInterventionPlan: { interventionFamily: entry.expressionPreview.expressionFamily, reasonCodes: ['fake_console_report'] }
    });
    return applyRobotExpressionPlan(state, plan, { scenarioId: entry.caseId });
  }, createFakeRobotExpressionRuntime({ transcriptLimit: 8 }));
  const report = {
    status: 'PASS',
    ...getFakeRobotExpressionSnapshot(runtime),
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-fake-robot-console.json'), report);
  return { report, artifact };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifact } = runShimeFakeRobotConsoleReport();
  console.log(`[SHIME FAKE ROBOT] status=${report.status} rows=${report.recentPreviewRows.length} artifact=${path.relative(ROOT, artifact)}`);
}
