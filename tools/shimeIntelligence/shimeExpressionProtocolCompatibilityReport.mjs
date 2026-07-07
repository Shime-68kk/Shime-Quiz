import { createExpressionProtocolCompatibilityMatrix, validateExpressionProtocolCompatibilityMatrix } from '../../src/shimeIntelligence/expressionProtocolCompatibilityMatrix.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const matrix = createExpressionProtocolCompatibilityMatrix();
const validation = validateExpressionProtocolCompatibilityMatrix(matrix);
if (!validation.ok || matrix.compatibilityStatus !== 'compatible') {
  throw new Error('Expression protocol compatibility report failed.');
}

writeShimeJson('docs/generated/shime-intelligence/shime-expression-protocol-compatibility-matrix.json', matrix);
console.log(`[SHIME EXPRESSION COMPATIBILITY] status=${matrix.compatibilityStatus}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-expression-protocol-compatibility-matrix.json');

