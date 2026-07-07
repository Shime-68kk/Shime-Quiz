import { runRobotExpressionProtocolPipeline } from '../../src/shimeIntelligence/robotExpressionProtocolPipeline.js';
import { validateEsp32ExpressionLogPreview } from '../../src/shimeIntelligence/esp32ExpressionLogContract.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const pipeline = runRobotExpressionProtocolPipeline({
  fsrs: { dueCount: 6, overdueCount: 1, retrievability: 0.58, stability: 14, difficulty: 4 },
  robotProfile: { supportsDisplay: true, supportsLed: true, supportsSound: false, motionLocked: true },
  transport: { userConsentState: 'not_requested', payloadSizeBucket: 'tiny' },
  reasonCodes: ['esp32_log_contract_fixture']
}, { scenarioId: 'esp32_log_only' });

const validation = validateEsp32ExpressionLogPreview(pipeline.esp32LogPreview);
if (!validation.ok || pipeline.esp32LogPreview.accepted !== true) {
  throw new Error('ESP32 expression log-only contract report failed.');
}

writeShimeJson('docs/generated/shime-intelligence/shime-esp32-expression-log-contract.json', pipeline.esp32LogPreview);

console.log(`[SHIME ESP32 EXPRESSION LOG CONTRACT] status=PASS accepted=${pipeline.esp32LogPreview.accepted}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-esp32-expression-log-contract.json');

