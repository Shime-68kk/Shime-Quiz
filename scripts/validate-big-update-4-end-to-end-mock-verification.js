import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REQUIRED = [
  'src/deviceBridge/robotMockImportReport.js',
  'src/components/settings/safeCapsuleEndToEndVerificationModel.js',
  'src/deviceBridge/hardwareReadinessGate.js',
  'src/components/settings/SafeCapsuleEndToEndVerificationPanel.jsx',
  'scripts/verify-safe-capsule-mock-handoff.js',
  'tests/unit/robotMockImportReport.test.js',
  'tests/unit/safeCapsuleEndToEndVerificationModel.test.js',
  'tests/unit/hardwareReadinessGate.test.js',
  'tests/unit/SafeCapsuleEndToEndVerificationPanel.test.jsx',
  'tests/unit/verifySafeCapsuleMockHandoffScript.test.js',
  'e2e/safe-capsule-end-to-end-verification.spec.js',
  'docs/device-bridge/big-update-4-end-to-end-mock-verification.md',
  'docs/release/big-update-4-end-to-end-mock-verification-summary.md',
  'docs/testing/big-update-4-end-to-end-mock-verification-test-matrix.md'
];
const BROWSER = [
  'src/components/settings/SafeCapsuleEndToEndVerificationPanel.jsx',
  'src/components/settings/safeCapsuleEndToEndVerificationModel.js',
  'src/deviceBridge/robotMockImportReport.js',
  'src/deviceBridge/hardwareReadinessGate.js'
];
function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function assert(c, m) { if (!c) throw new Error(m); }
function main() {
  REQUIRED.forEach(p => assert(fs.existsSync(path.join(ROOT, p)), `Missing ${p}`));
  const docs = [
    'docs/device-bridge/big-update-4-end-to-end-mock-verification.md',
    'docs/release/big-update-4-end-to-end-mock-verification-summary.md',
    'docs/testing/big-update-4-end-to-end-mock-verification-test-matrix.md'
  ].map(read).join('\n').toLowerCase();
  assert(/mock verification/.test(docs), 'Docs must mention mock verification.');
  assert(/not a real bridge|no real bridge/.test(docs), 'Docs must say no real bridge.');
  assert(/no serial\/websocket\/ble\/wi-fi\/cloud\/backend\/ai\/api/.test(docs), 'Docs must say no transport/cloud/backend/AI/API.');
  assert(/no raw quiz\/study\/history export/.test(docs), 'Docs must say no raw quiz/study/history export.');
  const settings = read('src/routes/Settings.jsx');
  assert(/SafeCapsuleEndToEndVerificationPanel/.test(settings), 'Settings must reference panel.');
  const pkg = JSON.parse(read('package.json'));
  assert(pkg.scripts?.['test:e2e:safe-capsule-e2e-verify'], 'Missing e2e verify script.');
  assert(pkg.scripts?.['verify:safe-capsule-mock-handoff'], 'Missing CLI verify script.');
  for (const file of BROWSER) {
    const source = read(file);
    assert(!/navigator\.serial|navigator\.bluetooth|new\s+WebSocket\s*\(|fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB/i.test(source), `${file} contains forbidden API.`);
    assert(!/<button[^>]*>[^<]*(Send to robot|Gửi robot|Connect robot|Kết nối robot thật)/i.test(source), `${file} renders send/connect controls.`);
  }
  assert(/realBridgeAllowed:\s*false/.test(read('src/deviceBridge/hardwareReadinessGate.js')), 'Gate must include realBridgeAllowed false.');
  assert(/Bridge thật vẫn bị khóa/.test(read('src/components/settings/SafeCapsuleEndToEndVerificationPanel.jsx')), 'UI must include bridge locked copy.');
  console.log('BIG_UPDATE_4_END_TO_END_MOCK_VERIFICATION_VALIDATED');
}
main();
