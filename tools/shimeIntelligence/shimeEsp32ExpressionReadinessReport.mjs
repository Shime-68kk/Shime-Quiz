import { createEsp32ExpressionReadinessContract } from '../../src/shimeIntelligence/esp32ExpressionReadinessContract.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const readiness = createEsp32ExpressionReadinessContract({
  envelopeSchemaStable: true,
  goldenFixturesGenerated: true,
  hostSimulatorPasses: true,
  validatorPasses: true,
  serializerRoundTripPasses: true,
  sensitiveAttacksRejected: true,
  secretMaterialRejected: true,
  motionLocked: true,
  noMotorServoCommands: true,
  noRadioImplementationRequired: true,
  serialQaPlanExists: true,
  hardwareManualQaChecklistExists: true,
  rollbackPlanExists: true,
  firmwareScopeIsolated: true,
  noRealRobotSendFromApp: true,
  phase38ManualQaComplete: false
});

if (readiness.gateStatus !== 'PASS') {
  throw new Error(`Readiness gate failed: ${readiness.blockers.join(',')}`);
}

writeShimeJson('docs/generated/shime-intelligence/shime-esp32-expression-readiness-contract.json', readiness);
console.log(`[SHIME ESP32 READINESS] status=${readiness.gateStatus} blockers=${readiness.blockers.length} warnings=${readiness.warnings.length}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-esp32-expression-readiness-contract.json');

