import fs from 'node:fs';
import { createEsp32ExpressionFirmwarePatchBlueprint } from '../../src/shimeIntelligence/esp32ExpressionFirmwarePatchBlueprint.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const fixtures = JSON.parse(fs.readFileSync('docs/generated/shime-intelligence/shime-expression-golden-fixtures.json', 'utf8'));
const blueprint = createEsp32ExpressionFirmwarePatchBlueprint({
  validFixtureIds: fixtures.fixtures.filter(fixture => fixture.validExpected).slice(0, 2).map(fixture => fixture.fixtureId),
  invalidFixtureIds: fixtures.fixtures.filter(fixture => !fixture.validExpected).slice(0, 2).map(fixture => fixture.fixtureId)
});
if (blueprint.motionPolicy !== 'locked' || blueprint.noRadioRequirement !== true) throw new Error('Patch blueprint failed safety gate.');
writeShimeJson('docs/generated/shime-intelligence/shime-esp32-expression-patch-blueprint.json', blueprint);
console.log(`[SHIME ESP32 EXPRESSION PATCH BLUEPRINT] status=PASS files=${blueprint.targetFilesLikelyToChange.length}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-esp32-expression-patch-blueprint.json');

