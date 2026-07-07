import { createExpressionProtocolGoldenFixtures } from '../../src/shimeIntelligence/expressionProtocolGoldenFixtures.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const fixtures = createExpressionProtocolGoldenFixtures();
if (!fixtures.allValidFixturesPass || !fixtures.allInvalidFixturesReject) {
  throw new Error('Expression golden fixtures report failed.');
}

writeShimeJson('docs/generated/shime-intelligence/shime-expression-golden-fixtures.json', fixtures);
console.log(`[SHIME EXPRESSION GOLDEN FIXTURES] status=PASS valid=${fixtures.validFixtureCount} invalid=${fixtures.invalidFixtureCount}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-expression-golden-fixtures.json');

