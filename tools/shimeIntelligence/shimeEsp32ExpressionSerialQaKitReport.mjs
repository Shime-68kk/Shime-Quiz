import fs from 'node:fs';
import { createEsp32ExpressionSerialQaKit } from '../../src/shimeIntelligence/esp32ExpressionSerialQaKit.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const fixtures = JSON.parse(fs.readFileSync('docs/generated/shime-intelligence/shime-expression-golden-fixtures.json', 'utf8'));
const kit = createEsp32ExpressionSerialQaKit(fixtures);
if (kit.expectedAcceptCount < 12 || kit.expectedRejectCount < 7) throw new Error('Serial QA kit missing payloads.');
writeShimeJson('docs/generated/shime-intelligence/shime-esp32-expression-serial-qa-kit.json', kit);
console.log(`[SHIME ESP32 EXPRESSION SERIAL QA KIT] status=PASS accept=${kit.expectedAcceptCount} reject=${kit.expectedRejectCount}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-esp32-expression-serial-qa-kit.json');

