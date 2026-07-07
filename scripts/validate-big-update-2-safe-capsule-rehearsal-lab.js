import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const REQUIRED_FILES = [
  'src/components/settings/SafeCapsuleRehearsalLab.jsx',
  'src/components/settings/safeCapsuleRehearsalLabModel.js',
  'src/deviceBridge/safeCapsulePrivacyEvidence.js',
  'scripts/create-safe-capsule-mock-import-package.js',
  'tests/unit/safeCapsuleRehearsalLabModel.test.js',
  'tests/unit/safeCapsulePrivacyEvidence.test.js',
  'tests/unit/createSafeCapsuleMockImportPackageScript.test.js',
  'tests/unit/SafeCapsuleRehearsalLab.test.jsx',
  'e2e/safe-capsule-rehearsal-lab.spec.js',
  'docs/device-bridge/big-update-2-safe-capsule-rehearsal-lab.md',
  'docs/release/big-update-2-safe-capsule-rehearsal-lab-summary.md',
  'docs/testing/big-update-2-safe-capsule-rehearsal-lab-test-matrix.md'
];

const DOC_FILES = [
  'docs/device-bridge/big-update-2-safe-capsule-rehearsal-lab.md',
  'docs/release/big-update-2-safe-capsule-rehearsal-lab-summary.md',
  'docs/testing/big-update-2-safe-capsule-rehearsal-lab-test-matrix.md'
];

const BROWSER_RUNTIME_FILES = [
  'src/components/settings/SafeCapsuleRehearsalLab.jsx',
  'src/components/settings/safeCapsuleRehearsalLabModel.js',
  'src/deviceBridge/safeCapsulePrivacyEvidence.js'
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertExists(relativePath) {
  assert(fs.existsSync(path.join(ROOT, relativePath)), `Missing required file: ${relativePath}`);
}

function assertDocs() {
  const combined = DOC_FILES.map(read).join('\n').toLowerCase();
  assert(/mock-only|mock only|chỉ mô phỏng|diễn tập mock/.test(combined), 'Docs must state mock-only / chỉ mô phỏng / diễn tập mock.');
  assert(/not a real robot bridge|not.*real bridge|no real bridge|không.*real bridge/.test(combined), 'Docs must state no real bridge.');
  assert(/no raw quiz\/study\/history|no raw quiz.*history|raw quiz\/study\/history export/.test(combined), 'Docs must state no raw quiz/study/history export.');
  assert(/serial\/websocket\/ble\/wi-fi\/cloud\/backend\/ai\/api/.test(combined), 'Docs must state no Serial/WebSocket/BLE/Wi-Fi/cloud/backend/AI/API.');
  assert(/developer-only|developer only/.test(combined), 'Docs must state offline script is developer-only.');
  assert(/r5x19\.2/.test(combined), 'Docs must mention R5X19.2 compatibility.');
}

function assertPackageJson() {
  const pkg = JSON.parse(read('package.json'));
  assert(pkg.scripts?.['test:e2e:safe-capsule-rehearsal'], 'package.json missing test:e2e:safe-capsule-rehearsal.');
  assert(pkg.scripts?.['create:safe-capsule-mock-import'], 'package.json missing create:safe-capsule-mock-import.');
}

function assertSettingsReference() {
  const source = read('src/routes/Settings.jsx');
  assert(/SafeCapsuleRehearsalLab/.test(source), 'Settings must reference SafeCapsuleRehearsalLab.');
}

function assertRuntimeSafety() {
  const apiPatterns = [
    [/navigator\.serial/i, 'navigator.serial'],
    [/navigator\.bluetooth/i, 'navigator.bluetooth'],
    [/new\s+WebSocket\s*\(/i, 'new WebSocket('],
    [/fetch\s*\(/i, 'fetch('],
    [/XMLHttpRequest/i, 'XMLHttpRequest'],
    [/localStorage|sessionStorage/i, 'browser storage for capsule package']
  ];

  BROWSER_RUNTIME_FILES.forEach(relativePath => {
    const source = read(relativePath);
    apiPatterns.forEach(([pattern, label]) => {
      assert(!pattern.test(source), `${relativePath} must not contain ${label}.`);
    });
    assert(!/<button[^>]*>[^<]*(Send to robot|Gửi robot|Connect robot|Kết nối robot thật)/i.test(source), `${relativePath} must not render send/connect robot controls.`);
  });
}

function assertCliSafety() {
  const source = read('scripts/create-safe-capsule-mock-import-package.js');
  const forbidden = /navigator\.serial|navigator\.bluetooth|new\s+WebSocket\s*\(|fetch\s*\(|XMLHttpRequest|child_process|execFile|spawn|npm\s+install|pio\s+run/i;
  assert(!forbidden.test(source), 'Offline CLI must not contain network/serial/websocket/bluetooth/external command APIs.');
}

function assertUiDoesNotRenderRawFieldNames() {
  const ui = read('src/components/settings/SafeCapsuleRehearsalLab.jsx');
  assert(!/prompt|correctAnswer|userAnswer|studyHistory|sourceMetadata|cardId|deckId|ssid|bssid|mac|token|password/i.test(ui), 'Rehearsal UI must not render raw field names.');
}

function main() {
  REQUIRED_FILES.forEach(assertExists);
  assertDocs();
  assertPackageJson();
  assertSettingsReference();
  assertRuntimeSafety();
  assertCliSafety();
  assertUiDoesNotRenderRawFieldNames();
  console.log('BIG_UPDATE_2_SAFE_CAPSULE_REHEARSAL_LAB_VALIDATED');
}

main();
