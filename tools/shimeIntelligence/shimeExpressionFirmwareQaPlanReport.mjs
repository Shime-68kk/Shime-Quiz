import { createExpressionProtocolFirmwareQaPlan } from '../../src/shimeIntelligence/expressionProtocolFirmwareQaPlan.js';
import { createExpressionProtocolMigrationPlan } from '../../src/shimeIntelligence/expressionProtocolMigrationPlan.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const qaPlan = createExpressionProtocolFirmwareQaPlan();
const migrationPlan = createExpressionProtocolMigrationPlan();

if (qaPlan.motionPolicy !== 'locked' || migrationPlan.motionPolicy !== 'locked') {
  throw new Error('Firmware QA or migration plan failed motion safety gate.');
}

writeShimeJson('docs/generated/shime-intelligence/shime-expression-firmware-qa-plan.json', qaPlan);
writeShimeJson('docs/generated/shime-intelligence/shime-expression-protocol-migration-plan.json', migrationPlan);

console.log(`[SHIME EXPRESSION FIRMWARE QA PLAN] status=PASS steps=${qaPlan.stepCount}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-expression-firmware-qa-plan.json');
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-expression-protocol-migration-plan.json');

