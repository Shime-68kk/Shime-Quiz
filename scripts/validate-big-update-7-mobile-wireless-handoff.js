import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const requiredFiles = [
  'docs/studyroom/mobile-studyroom-polish.md',
  'src/deviceBridge/robotHandoffTransportPlan.js',
  'tests/unit/robotHandoffTransportPlan.test.js',
  'tests/unit/StudyRoomMobileLayout.test.jsx',
  'docs/robot-integration/wireless-handoff-architecture.md',
  'docs/release/big-update-7-mobile-and-wireless-handoff-summary.md',
  'docs/reports/big-update-7-mobile-wireless-handoff-final-report.md'
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`BIG-UPDATE-7 validation failed: ${message}`);
    process.exit(1);
  }
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing ${file}`);
}

const packageJson = JSON.parse(read('package.json'));
assert(
  packageJson.scripts?.['validate:mobile-wireless-handoff'] === 'node scripts/validate-big-update-7-mobile-wireless-handoff.js',
  'missing package.json validate:mobile-wireless-handoff script'
);

const scanFiles = [
  'src/deviceBridge/robotHandoffTransportPlan.js',
  'src/components/study/StudyRoomSubjectSpaces.jsx',
  'src/styles/global.css'
];
const forbiddenApis = [
  /navigator\.bluetooth/,
  /navigator\.serial/,
  /WebSocket/,
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /getUserMedia/,
  /MediaRecorder/,
  /Notification\.requestPermission/,
  /serviceWorker\.register/
];

for (const file of scanFiles) {
  const source = read(file);
  for (const pattern of forbiddenApis) {
    assert(!pattern.test(source), `${file} contains forbidden API ${pattern}`);
  }
}

const planSource = read('src/deviceBridge/robotHandoffTransportPlan.js');
for (const transportId of [
  'manual_export',
  'usb_dev_only',
  'ble_candidate',
  'wifi_lan_candidate',
  'native_wrapper_required'
]) {
  assert(planSource.includes(transportId), `handoff plan missing ${transportId}`);
}
const safeCapsuleMatches = planSource.match(/safe_capsule_only/g) || [];
assert(safeCapsuleMatches.length >= 1, 'handoff plan must use safe_capsule_only');
assert(!/realTransportEnabled:\s*true/.test(planSource), 'handoff plan must not enable real transport');

const docs = [
  read('docs/robot-integration/wireless-handoff-architecture.md'),
  read('docs/release/big-update-7-mobile-and-wireless-handoff-summary.md')
].join('\n');
assert(/USB\/cable.*dev\/debug only|USB\/cable remains dev\/debug only/i.test(docs), 'docs must say cable is dev/debug only');
assert(/No real BLE\/Wi-Fi.*enabled|does not enable real BLE, Wi-Fi/i.test(docs), 'docs must say no real BLE/Wi-Fi enabled');
assert(/No raw question\/answer\/explanation/i.test(docs), 'docs must say no raw question/answer/explanation');
assert(/No cloud required/i.test(docs), 'docs must say no cloud required');
assert(/safe capsule only/i.test(docs), 'docs must say safe capsule only');

const mobileDoc = read('docs/studyroom/mobile-studyroom-polish.md');
assert(/mobile width/i.test(mobileDoc), 'mobile polish docs must discuss mobile width');
assert(/long questions/i.test(mobileDoc), 'mobile polish docs must discuss long questions');
assert(/touch-friendly/i.test(mobileDoc), 'mobile polish docs must discuss touch-friendly answers');
assert(/reduced-motion/i.test(mobileDoc), 'mobile polish docs must discuss reduced motion');

const css = read('src/styles/global.css');
assert(css.includes('@media (max-width: 640px)'), 'mobile CSS breakpoint missing');
assert(css.includes('scroll-snap-type: x mandatory'), 'subject snap refinement missing');

console.log('BIG-UPDATE-7 mobile wireless handoff validation passed.');
