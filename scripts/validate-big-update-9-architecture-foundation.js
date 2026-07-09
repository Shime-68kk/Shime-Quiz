import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const requiredFiles = [
  'docs/reports/big-update-9-architecture-health-audit.md',
  'docs/reports/big-update-9-ui-foundation-audit.md',
  'docs/reports/big-update-9-architecture-foundation-final-report.md'
];

const forbiddenApis = [
  { pattern: /\bfetch\s*\(/, label: 'fetch(' },
  { pattern: /\bXMLHttpRequest\b/, label: 'XMLHttpRequest' },
  { pattern: /\bWebSocket\b/, label: 'WebSocket' },
  { pattern: /\bnavigator\.serial\b/, label: 'navigator.serial' },
  { pattern: /\bnavigator\.bluetooth\b/, label: 'navigator.bluetooth' },
  { pattern: /\bgetUserMedia\b/, label: 'getUserMedia' },
  { pattern: /\bMediaRecorder\b/, label: 'MediaRecorder' },
  { pattern: /\bNotification\.requestPermission\b/, label: 'Notification.requestPermission' },
  { pattern: /\bserviceWorker\.register\b/, label: 'serviceWorker.register' }
];

const appFacingBoundaryFiles = [
  'src/routes/StudyRoom.jsx',
  'src/components/study/StudyRoomSubjectSpaces.jsx',
  'src/studyRoom/mobileGestureIntentModel.js',
  'src/studyRoom/studyRoomSwipeGesture.js',
  'src/studyRoom/studySubjectSpaceModel.js',
  'src/studyRoom/subjectForgettingAlertModel.js',
  'src/studyRoom/subjectRobotSafeSummary.js',
  'src/scheduler/schedulerRegistry.js',
  'src/scheduler/sm2SchedulerAdapter.js',
  'src/scheduler/fsrsBetaSchedulerAdapter.js',
  'src/scheduler/fsrsReadinessGate.js',
  'src/components/settings/SchedulerEvidencePanel.jsx'
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function fail(message) {
  console.error(`BIG-UPDATE-9 validation failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

for (const file of requiredFiles) {
  assert(exists(file), `missing ${file}`);
}

const packageJson = JSON.parse(read('package.json'));
assert(
  packageJson.scripts?.['validate:architecture-foundation'] === 'node scripts/validate-big-update-9-architecture-foundation.js',
  'missing package.json validate:architecture-foundation script'
);

for (const file of appFacingBoundaryFiles) {
  const source = read(file);
  for (const api of forbiddenApis) {
    assert(!api.pattern.test(source), `${file} contains forbidden API ${api.label}`);
  }
}

const combinedDocs = requiredFiles.map(read).join('\n').toLowerCase();
const requiredDocPhrases = [
  'sm2 remains default',
  'fsrs remains beta opt-in',
  'no real robot bridge',
  'no cloud/backend/network',
  'raw question/answer must not cross robot-safe boundary',
  'studyroom needs future decomposition',
  'mobile ui future polish should be done after foundation hardening'
];

for (const phrase of requiredDocPhrases) {
  assert(combinedDocs.includes(phrase), `docs missing required phrase: ${phrase}`);
}

const schedulerRegistry = read('src/scheduler/schedulerRegistry.js');
assert(/getDefaultScheduler\(\)\s*{[\s\S]*SM2_SCHEDULER_ID/.test(schedulerRegistry), 'default scheduler must resolve to SM2');
assert(!/fsrsCanBeDefault:\s*true/.test(read('src/scheduler/fsrsReadinessGate.js')), 'FSRS default gate must not become true');

const robotSafeSummary = read('src/studyRoom/subjectRobotSafeSummary.js');
assert(robotSafeSummary.includes('rawContentIncluded: false'), 'subject robot-safe summary must explicitly exclude raw content');
assert(robotSafeSummary.includes("privacyClass: 'subject_state_coarse_only'"), 'subject robot-safe summary must stay coarse-only');

console.log('BIG-UPDATE-9 architecture foundation validation passed.');
