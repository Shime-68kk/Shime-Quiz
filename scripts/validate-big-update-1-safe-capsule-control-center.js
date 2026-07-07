import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const REQUIRED_FILES = [
  'docs/device-bridge/big-update-1-safe-capsule-control-center.md',
  'docs/release/big-update-1-safe-capsule-control-center-summary.md',
  'docs/testing/big-update-1-safe-capsule-control-center-test-matrix.md',
  'src/components/settings/SafeCapsuleControlCenter.jsx',
  'src/components/settings/safeCapsuleControlCenterModel.js',
  'src/deviceBridge/studyRoomDerivedSummary.js',
  'src/deviceBridge/mockRobotImportPackage.js',
  'tests/unit/safeCapsuleControlCenterModel.test.js',
  'tests/unit/SafeCapsuleControlCenter.test.jsx',
  'tests/unit/studyRoomDerivedSummary.test.js',
  'tests/unit/mockRobotImportPackage.test.js',
  'tests/unit/settingsSafeCapsuleControlCenterIntegration.test.jsx',
  'e2e/safe-capsule-control-center.spec.js'
];

const DOC_FILES = [
  'docs/device-bridge/big-update-1-safe-capsule-control-center.md',
  'docs/release/big-update-1-safe-capsule-control-center-summary.md',
  'docs/testing/big-update-1-safe-capsule-control-center-test-matrix.md'
];

const CONTROL_CENTER_SOURCE_FILES = [
  'src/components/settings/SafeCapsuleControlCenter.jsx',
  'src/components/settings/safeCapsuleControlCenterModel.js',
  'src/deviceBridge/studyRoomDerivedSummary.js',
  'src/deviceBridge/mockRobotImportPackage.js'
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertFileExists(relativePath) {
  assert(exists(relativePath), `Missing required file: ${relativePath}`);
}

function assertDocs() {
  const combined = DOC_FILES.map(read).join('\n').toLowerCase();
  assert(/mock only|chỉ mô phỏng/.test(combined), 'Docs must state mock only / chỉ mô phỏng.');
  assert(/not a real robot bridge|not real robot bridge|không.*robot thật|no real bridge/.test(combined), 'Docs must state no real bridge.');
  assert(/no raw quiz|no raw quiz\/study\/history|không.*raw quiz|không.*study.*history|raw quiz.*study.*history/.test(combined), 'Docs must state no raw quiz/study/history export.');
  assert(/r5x19\.2_safe_mock_import/i.test(combined), 'Docs must mention R5X19.2 safe mock import compatibility.');
}

function assertSettingsReference() {
  const settings = read('src/routes/Settings.jsx');
  assert(/SafeCapsuleControlCenter/.test(settings), 'Settings must reference SafeCapsuleControlCenter.');
}

function assertSourceSafety() {
  const forbiddenRuntimePatterns = [
    [/navigator\.serial/i, 'navigator.serial'],
    [/navigator\.bluetooth/i, 'navigator.bluetooth'],
    [/new\s+WebSocket/i, 'WebSocket construction'],
    [/fetch\s*\(/i, 'fetch('],
    [/XMLHttpRequest/i, 'XMLHttpRequest'],
    [/localStorage|sessionStorage/i, 'browser storage for capsule package'],
    [/<button[^>]*>[^<]*(Send to robot|Gửi robot|Connect robot|Kết nối robot thật)/i, 'send/connect robot button']
  ];

  CONTROL_CENTER_SOURCE_FILES.forEach(relativePath => {
    const source = read(relativePath);
    forbiddenRuntimePatterns.forEach(([pattern, label]) => {
      assert(!pattern.test(source), `${relativePath} must not contain ${label}.`);
    });
  });

  const packageSource = read('src/deviceBridge/mockRobotImportPackage.js');
  assert(/realBridgeEnabled:\s*false/.test(packageSource), 'Mock package must force realBridgeEnabled false.');
  assert(/transportEnabled:\s*false/.test(packageSource), 'Mock package must force transportEnabled false.');
  assert(/persistentWritesEnabled:\s*false/.test(packageSource), 'Mock package must force persistentWritesEnabled false.');
  assert(/motionLockedExpected:\s*true/.test(packageSource), 'Mock package must expect motion locked.');
}

function assertPackageJsonScript() {
  const pkg = JSON.parse(read('package.json'));
  assert(pkg.scripts?.['test:e2e:safe-capsule'], 'package.json must define test:e2e:safe-capsule.');
}

function main() {
  REQUIRED_FILES.forEach(assertFileExists);
  assertDocs();
  assertSettingsReference();
  assertSourceSafety();
  assertPackageJsonScript();
  console.log('BIG_UPDATE_1_SAFE_CAPSULE_CONTROL_CENTER_VALIDATED');
}

main();
