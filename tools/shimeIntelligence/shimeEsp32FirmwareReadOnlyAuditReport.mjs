import fs from 'node:fs';
import { createEsp32FirmwareReadOnlyAudit } from '../../src/shimeIntelligence/esp32FirmwareReadOnlyAudit.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const paths = [
  'firmware/esp32-shime-robot/platformio.ini',
  'firmware/esp32-shime-robot/src/main.cpp',
  'firmware/esp32-shime-robot/include/ShimeProtocol.h',
  'firmware/esp32-shime-robot/src/ShimeProtocol.cpp',
  'firmware/esp32-shime-robot/include/ShimeRobotActions.h',
  'firmware/esp32-shime-robot/src/ShimeRobotActions.cpp',
  'firmware/esp32-shime-robot/protocol.md'
];
const files = {};
paths.forEach(path => {
  if (fs.existsSync(path)) files[path] = fs.readFileSync(path, 'utf8');
});
const audit = createEsp32FirmwareReadOnlyAudit(files);
if (audit.auditStatus === 'FAIL') throw new Error('Firmware read-only audit failed.');
writeShimeJson('docs/generated/shime-intelligence/shime-esp32-firmware-readonly-audit.json', audit);
console.log(`[SHIME ESP32 FIRMWARE READONLY AUDIT] status=${audit.auditStatus} files=${audit.firmwareFilesFound.length}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-esp32-firmware-readonly-audit.json');

