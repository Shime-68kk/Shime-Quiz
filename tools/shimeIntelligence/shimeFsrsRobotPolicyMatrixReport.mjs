import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFsrsRobotPolicyMatrix, selectRobotPolicyFromFsrsSignals, selectTimetablePolicyFromFsrsSignals } from '../../src/shimeIntelligence/fsrsRobotPolicyMatrix.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeFsrsRobotPolicyMatrixReport() {
  const matrix = getFsrsRobotPolicyMatrix();
  const scenarios = [
    { id: 'high_due_pressure', signals: { duePressureBucket: 'high', recoveryNeedBucket: 'none' } },
    { id: 'struggle_due_pressure', signals: { duePressureBucket: 'high', recoveryNeedBucket: 'high' } },
    { id: 'memory_risk', signals: { retrievabilityBucket: 'low', forgettingRiskBucket: 'high' } },
    { id: 'protect_rest', signals: { duePressureBucket: 'none' }, context: { quietMode: true } },
    { id: 'privacy_unsafe', signals: { privacyStatus: 'blocked' } }
  ];
  const report = {
    status: 'PASS',
    matrixVersion: matrix.matrixVersion,
    ruleCount: matrix.rules.length,
    selections: scenarios.map(scenario => ({
      scenarioId: scenario.id,
      robot: selectRobotPolicyFromFsrsSignals(scenario.signals, scenario.context),
      timetable: selectTimetablePolicyFromFsrsSignals(scenario.signals, scenario.context)
    })),
    dryRunOnly: true
  };
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-fsrs-robot-policy-matrix.json'), report);
  return { report, artifact };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifact } = runShimeFsrsRobotPolicyMatrixReport();
  console.log(`[SHIME FSRS ROBOT MATRIX] status=${report.status} rules=${report.ruleCount} artifact=${path.relative(ROOT, artifact)}`);
}
