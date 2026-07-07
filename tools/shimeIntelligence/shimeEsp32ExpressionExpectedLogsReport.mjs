import fs from 'node:fs';
import { createEsp32ExpressionExpectedLogs } from '../../src/shimeIntelligence/esp32ExpressionExpectedLogs.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const fixtures = JSON.parse(fs.readFileSync('docs/generated/shime-intelligence/shime-expression-golden-fixtures.json', 'utf8'));
const logs = createEsp32ExpressionExpectedLogs(fixtures);
if (logs.acceptCount < 12 || logs.rejectCount < 7 || logs.motionPolicy !== 'locked') throw new Error('Expected logs failed safety gate.');
writeShimeJson('docs/generated/shime-intelligence/shime-esp32-expression-expected-logs.json', logs);
console.log(`[SHIME ESP32 EXPRESSION EXPECTED LOGS] status=PASS accept=${logs.acceptCount} reject=${logs.rejectCount}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-esp32-expression-expected-logs.json');

