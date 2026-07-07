import fs from 'node:fs';
import path from 'node:path';
import { createRobotExpressionProtocolManualQaModel } from '../../src/shimeIntelligence/robotExpressionProtocolManualQaModel.js';
import { reviewRobotExpressionProtocolEvidence } from '../../src/shimeIntelligence/robotExpressionProtocolEvidenceReview.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const generatedDir = 'docs/generated/shime-intelligence';
const artifactNames = [
  'shime-expression-protocol-pipeline.json',
  'shime-expression-protocol-benchmark.json',
  'shime-esp32-expression-log-contract.json',
  'shime-expression-envelope-golden.json'
];

const artifacts = {};
artifactNames.forEach(name => {
  const filePath = path.join(generatedDir, name);
  if (fs.existsSync(filePath)) {
    artifacts[name] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
});

const manualQa = createRobotExpressionProtocolManualQaModel();
writeShimeJson(path.join(generatedDir, 'shime-expression-protocol-manual-qa.json'), manualQa);
artifacts['shime-expression-protocol-manual-qa.json'] = manualQa;

const reviewInput = {
  ...artifacts,
  'shime-expression-protocol-evidence.json': { placeholder: true, dryRunOnly: true, sendStatus: 'not_sent' }
};
const review = reviewRobotExpressionProtocolEvidence(reviewInput);

if (!review.ok) {
  throw new Error(`Expression protocol evidence review failed: ${review.failures.join(',')}`);
}

writeShimeJson(path.join(generatedDir, 'shime-expression-protocol-evidence.json'), review);

console.log(`[SHIME EXPRESSION PROTOCOL EVIDENCE] status=PASS artifacts=${review.artifactCount}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-expression-protocol-evidence.json');
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-expression-protocol-manual-qa.json');

