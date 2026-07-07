import fs from 'node:fs';
import path from 'node:path';
import { reviewExpressionProtocolArtifacts } from '../../src/shimeIntelligence/expressionProtocolReview.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const dir = 'docs/generated/shime-intelligence';
const names = [
  'shime-expression-protocol-pipeline.json',
  'shime-expression-protocol-benchmark.json',
  'shime-esp32-expression-log-contract.json',
  'shime-expression-protocol-evidence.json',
  'shime-expression-envelope-golden.json'
];
const artifacts = {};
names.forEach(name => {
  const file = path.join(dir, name);
  if (fs.existsSync(file)) artifacts[name] = JSON.parse(fs.readFileSync(file, 'utf8'));
});

const review = reviewExpressionProtocolArtifacts(artifacts);
if (review.overallStatus === 'FAIL') {
  throw new Error(`Expression protocol review failed: ${review.blockers.join(',')}`);
}

writeShimeJson(path.join(dir, 'shime-expression-protocol-review.json'), review);
console.log(`[SHIME EXPRESSION PROTOCOL REVIEW] status=${review.overallStatus} blockers=${review.blockers.length} warnings=${review.warnings.length}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-expression-protocol-review.json');

