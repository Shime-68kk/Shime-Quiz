import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const requiredFiles = [
  'src/studyRoom/mobileGestureIntentModel.js',
  'tests/unit/mobileGestureIntentModel.test.js',
  'tests/unit/StudyRoomGestureTuning.test.jsx',
  'docs/studyroom/mobile-gesture-tuning.md',
  'docs/release/big-update-8-mobile-gesture-tuning-summary.md',
  'docs/reports/big-update-8-mobile-gesture-tuning-final-report.md'
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`BIG-UPDATE-8 validation failed: ${message}`);
    process.exit(1);
  }
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing ${file}`);
}

const packageJson = JSON.parse(read('package.json'));
assert(
  packageJson.scripts?.['validate:mobile-gesture-tuning'] === 'node scripts/validate-big-update-8-mobile-gesture-tuning.js',
  'missing package.json validate:mobile-gesture-tuning script'
);

const scanFiles = [
  'src/studyRoom/mobileGestureIntentModel.js',
  'src/studyRoom/studyRoomSwipeGesture.js',
  'src/routes/StudyRoom.jsx',
  'src/styles/global.css'
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

const modelSource = read('src/studyRoom/mobileGestureIntentModel.js');
assert(modelSource.includes('DIAGONAL_GUARD_VERTICAL_PRIORITY'), 'intent model missing diagonal guard reason');
assert(modelSource.includes('horizontalDominanceRatio = 1.45'), 'intent model missing 1.45 dominance ratio');
assert(modelSource.includes('transitionPreset'), 'intent model missing transition preset output');

const studyRoomSource = read('src/routes/StudyRoom.jsx');
assert(studyRoomSource.includes('resolveStudyRoomSwipeGesture'), 'StudyRoom must use tuned swipe helper');
assert(!studyRoomSource.includes('preventDefault'), 'StudyRoom must not block vertical scroll with preventDefault');

const css = read('src/styles/global.css');
assert(css.includes('touch-action: pan-y'), 'CSS must prioritize vertical pan');
assert(css.includes('scroll-snap-type: x proximity'), 'CSS must use less aggressive proximity snap');
assert(css.includes('studyQuestionSoftIn 0.18s ease-out both'), 'CSS must include short question transition');
assert(css.includes('prefers-reduced-motion: reduce'), 'CSS must include reduced motion guard');

const schedulerGate = fs.existsSync(path.join(root, 'src/scheduler/fsrsReadinessGate.js'))
  ? read('src/scheduler/fsrsReadinessGate.js')
  : '';
assert(!/fsrsCanBeDefault:\s*true/.test(schedulerGate), 'FSRS default gate must not become true');

const docs = [
  read('docs/studyroom/mobile-gesture-tuning.md'),
  read('docs/release/big-update-8-mobile-gesture-tuning-summary.md')
].join('\n');
assert(/Vertical scrolling has priority/i.test(docs), 'docs must say vertical scrolling has priority');
assert(/Horizontal navigation requires clear intent/i.test(docs), 'docs must say horizontal navigation requires clear intent');
assert(/Reduced motion is supported/i.test(docs), 'docs must say reduced motion is supported');
assert(/No cloud\/backend\/network/i.test(docs), 'docs must say no cloud/backend/network');
assert(/No scheduler behavior changed|No SM2\/FSRS behavior changed/i.test(docs), 'docs must say scheduler behavior did not change');

console.log('BIG-UPDATE-8 mobile gesture tuning validation passed.');
