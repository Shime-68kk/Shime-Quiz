import { runRobotExpressionProtocolPipeline } from '../../src/shimeIntelligence/robotExpressionProtocolPipeline.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const result = runRobotExpressionProtocolPipeline({
  fsrs: { dueCount: 12, overdueCount: 2, retrievability: 0.42, stability: 9, difficulty: 6 },
  robotProfile: { supportsDisplay: true, supportsLed: true, supportsSound: true, motionLocked: true },
  transport: { userConsentState: 'not_requested', payloadSizeBucket: 'tiny' },
  reasonCodes: ['protocol_pipeline_report_fixture']
}, { scenarioId: 'golden' });

if (!result.safetyResult.ok || result.esp32LogPreview.accepted !== true) {
  throw new Error('Expression protocol pipeline report failed safety gate.');
}

writeShimeJson('docs/generated/shime-intelligence/shime-expression-protocol-pipeline.json', result);
writeShimeJson('docs/generated/shime-intelligence/shime-expression-envelope-golden.json', result.expressionEnvelope);

console.log(`[SHIME EXPRESSION PROTOCOL PIPELINE] status=PASS family=${result.expressionEnvelope.expressionFamily}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-expression-protocol-pipeline.json');
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-expression-envelope-golden.json');

