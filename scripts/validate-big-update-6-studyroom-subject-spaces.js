import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const requiredFiles = [
  'src/studyRoom/studySubjectSpaceModel.js',
  'src/studyRoom/subjectForgettingAlertModel.js',
  'src/studyRoom/studyRoomSubjectNavigationModel.js',
  'src/studyRoom/subjectRobotSafeSummary.js',
  'src/studyRoom/subjectSpaceBackupMetadata.js',
  'src/studyRoom/studyNotificationPreferenceModel.js',
  'src/components/study/StudyRoomSubjectSpaces.jsx',
  'tests/unit/studySubjectSpaceModel.test.js',
  'tests/unit/subjectForgettingAlertModel.test.js',
  'tests/unit/studyRoomSubjectNavigationModel.test.js',
  'tests/unit/subjectRobotSafeSummary.test.js',
  'tests/unit/subjectSpaceBackupMetadata.test.js',
  'tests/unit/studyNotificationPreferenceModel.test.js',
  'tests/unit/StudyRoomSubjectSpaces.test.jsx',
  'docs/reports/big-update-6-architecture-debt-audit.md',
  'docs/reports/big-update-6-studyroom-subject-spaces-final-report.md',
  'docs/studyroom/big-update-6-subject-spaces.md',
  'docs/studyroom/subject-forgetting-alerts.md',
  'docs/studyroom/mobile-swipe-studyroom-ux.md',
  'docs/robot-integration/subject-state-safe-summary.md',
  'docs/release/big-update-6-studyroom-subject-spaces-summary.md'
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`BIG-UPDATE-6 validation failed: ${message}`);
    process.exit(1);
  }
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing ${file}`);
}

const packageJson = JSON.parse(read('package.json'));
assert(
  packageJson.scripts?.['validate:studyroom-subject-spaces'] === 'node scripts/validate-big-update-6-studyroom-subject-spaces.js',
  'missing package.json validate:studyroom-subject-spaces script'
);

const scanFiles = [
  'src/studyRoom/studySubjectSpaceModel.js',
  'src/studyRoom/subjectForgettingAlertModel.js',
  'src/studyRoom/studyRoomSubjectNavigationModel.js',
  'src/studyRoom/subjectRobotSafeSummary.js',
  'src/studyRoom/subjectSpaceBackupMetadata.js',
  'src/studyRoom/studyNotificationPreferenceModel.js',
  'src/components/study/StudyRoomSubjectSpaces.jsx'
];

const forbiddenApis = [
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /WebSocket/,
  /navigator\.serial/,
  /navigator\.bluetooth/,
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

const robotSource = read('src/studyRoom/subjectRobotSafeSummary.js');
for (const leak of ['question', 'answer', 'correctAnswer', 'explanation', 'rawQuizPayload', 'importedDocumentText']) {
  assert(!robotSource.includes(leak), `robot summary source contains forbidden raw-content marker ${leak}`);
}

const docs = [
  read('docs/studyroom/big-update-6-subject-spaces.md'),
  read('docs/studyroom/subject-forgetting-alerts.md'),
  read('docs/studyroom/mobile-swipe-studyroom-ux.md'),
  read('docs/robot-integration/subject-state-safe-summary.md'),
  read('docs/release/big-update-6-studyroom-subject-spaces-summary.md')
].join('\n');

assert(/local-first/i.test(docs), 'docs must say local-first');
assert(/no cloud/i.test(docs), 'docs must say no cloud');
assert(/backend/i.test(docs) && /push/i.test(docs), 'docs must say no backend push');
assert(/raw question\/answer.*robot|question\/answer sent to robot:\s*no/i.test(docs), 'docs must say no raw question/answer to robot');

const finalReport = read('docs/reports/big-update-6-studyroom-subject-spaces-final-report.md');
for (const marker of [
  'subject space model added: yes',
  'forgetting alert model added: yes',
  'mobile swipe/navigation model added: yes',
  'StudyRoom UI subject spaces added: yes',
  'robot safe subject summary added: yes',
  'local device notification permission requested: no',
  'service worker push added: no',
  'cloud/backend/network added: no',
  'SM2/FSRS behavior changed: no',
  'FSRS default changed: no',
  'What to send back to ChatGPT'
]) {
  assert(finalReport.includes(marker), `final report missing marker: ${marker}`);
}

console.log('BIG-UPDATE-6 StudyRoom subject spaces validation passed.');
