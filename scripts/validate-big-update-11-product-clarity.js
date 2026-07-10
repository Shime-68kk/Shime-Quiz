import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const passes = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return '';
  }
  passes.push(`Exists: ${relativePath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function assert(condition, message) {
  if (condition) passes.push(message);
  else failures.push(message);
}

function gitDiffNames() {
  try {
    return execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' })
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  } catch {
    failures.push('Unable to inspect git diff names');
    return [];
  }
}

const home = read('src/routes/Home.jsx');
const dashboard = read('src/routes/Dashboard.jsx');
const appLayout = read('src/layout/AppLayout.jsx');
const sidebar = read('src/layout/Sidebar.jsx');
const bottomNav = read('src/layout/BottomNav.jsx');
const summary = read('src/components/learning/OverviewLearnerSummary.jsx');
const disclosure = read('src/components/learning/OverviewDisclosure.jsx');
const history = read('src/components/study/StudyHistoryPanel.jsx');
const brandMark = read('src/components/brand/ShimeBrandMark.jsx');
const navIcon = read('src/components/brand/ShimeNavigationIcon.jsx');
const tokens = read('src/design-system/tokens.css');
const css = read('src/styles/global.css');
const packageJson = JSON.parse(read('package.json') || '{}');

const brandReport = read('docs/reports/big-update-11-brand-system.md');
const tieringReport = read('docs/reports/big-update-11-overview-metric-tiering.md');
const performanceReport = read('docs/reports/big-update-11-performance-comparison.md');
const finalReport = read('docs/reports/big-update-11-product-clarity-final-report.md');

assert((home.match(/<article className="shimeLandingProofCard"/g) || []).length === 3, 'Home has exactly three benefit cards');
assert(home.includes('shimeLandingFlow__steps') && (home.match(/<li><span>[123]<\/span>/g) || []).length === 3, 'Home has a three-step learning flow');
assert(home.includes('<details className="shimeLandingTechnical">') && !/<details className="shimeLandingTechnical"[^>]*open/.test(home), 'Home technical information is collapsed by default');
assert(home.includes('Dữ liệu học được giữ trên thiết bị của bạn.'), 'Home has concise local-first trust copy');
assert(!home.includes('>Local</span>') && !home.includes('>Safe</span>'), 'Home text pills were replaced');

for (const token of ['--shime-action', '--shime-robot', '--shime-canvas', '--shime-surface', '--shime-ink', '--shime-warning', '--shime-focus-ring']) {
  assert(tokens.includes(token), `Brand token exists: ${token}`);
}
assert(sidebar.includes('ShimeBrandMark') && !sidebar.includes('aria-hidden="true">S</span>'), 'Sidebar uses the reusable Shime mark');
assert(sidebar.includes('ShimeNavigationIcon') && bottomNav.includes('ShimeNavigationIcon'), 'Shell navigation uses consistent inline SVG icons');
assert((appLayout.match(/className="skipLink"/g) || []).length === 2, 'Skip link exists in standard and focus layouts');

for (const label of ['Câu đến hạn', 'Mục tiêu ngày', 'Tỷ lệ đúng gần đây', 'Chuỗi ngày học', 'Phiên đã hoàn thành', 'Cần chú ý', 'Theo môn']) {
  assert(summary.includes(label), `Default Overview metric exists: ${label}`);
}
assert(dashboard.includes('title="Thông tin nâng cao"') && dashboard.includes('level="advanced"'), 'Advanced details disclosure exists');
assert(dashboard.includes('title="Chẩn đoán dành cho nhà phát triển"') && dashboard.includes('level="developer"'), 'Developer diagnostics disclosure exists');
assert(disclosure.includes('aria-expanded={open}') && disclosure.includes('hidden={!open}'), 'Disclosures expose aria-expanded and remain hidden when closed');
assert(history.includes('item.prompt') && history.includes('item.userAnswer') && history.includes('item.correctAnswer'), 'Raw history details remain available');
assert(history.includes('className="technicalDetails"') && !/className="technicalDetails"[\s\S]{0,400}}\s*open>/.test(history), 'Raw history details are closed by default');

const uiSources = [home, dashboard, appLayout, sidebar, bottomNav, summary, disclosure, history, brandMark, navIcon].join('\n');
for (const forbidden of [
  'fetch(', 'XMLHttpRequest', 'new WebSocket', 'navigator.bluetooth', 'navigator.serial',
  'getUserMedia', 'MediaRecorder', 'Notification.requestPermission', 'serviceWorker.register'
]) {
  assert(!uiSources.includes(forbidden), `Forbidden runtime API absent: ${forbidden}`);
}
assert(!/from\s+['"](?:framer-motion|gsap|lottie|three|matter-js)['"]/.test(uiSources), 'No heavy animation/UI dependency imported');

const dependencyNames = Object.keys(packageJson.dependencies || {}).concat(Object.keys(packageJson.devDependencies || {}));
for (const forbiddenDependency of ['framer-motion', 'gsap', 'lottie', 'three', 'matter-js', 'chart.js', 'recharts']) {
  assert(!dependencyNames.includes(forbiddenDependency), `Forbidden dependency absent: ${forbiddenDependency}`);
}

const changed = gitDiffNames();
const forbiddenPrefixes = [
  'src/scheduler/', 'src/quiz/reviewSchedulerAdapter.js', 'src/state/reviewScheduleStorage.js',
  'src/state/settingsStorage.js', 'src/deviceBridge/', 'src/companion/', 'src/robotSensing/',
  'src/shimeIntelligence/', 'src/storage/', 'src/data/importValidator.js', 'src/data/csvImportParser.js',
  'src/data/textQuizParser.js', 'src/data/quizParser.js', 'src/data/libraryExport.js',
  'src/data/learningDataStore.js', 'src/data/learningDataAdapter.js', 'src/routes/StudyRoom.jsx',
  'src/routes/routeConfig.js', 'src/dashboard/DashboardLearningDataContext.jsx', 'package-lock.json'
];
for (const forbiddenPath of forbiddenPrefixes) {
  assert(!changed.some(file => file === forbiddenPath || file.startsWith(forbiddenPath)), `Locked path unchanged: ${forbiddenPath}`);
}

const readinessGate = read('src/scheduler/fsrsReadinessGate.js');
assert(/fsrsCanBeDefault:\s*false/.test(readinessGate), 'fsrsCanBeDefault remains false');

for (const [name, report] of [
  ['brand report', brandReport],
  ['metric tiering report', tieringReport],
  ['performance report', performanceReport],
  ['final report', finalReport]
]) {
  assert(/BIG-UPDATE-11/i.test(report), `${name} references BIG-UPDATE-11`);
}
assert(/no scheduler|scheduler unchanged|scheduler behavior changed:\s*no/i.test(finalReport), 'Final report confirms scheduler preservation');
assert(/Safe Capsule unchanged|Safe Capsule behavior changed:\s*no/i.test(finalReport), 'Final report confirms Safe Capsule preservation');
assert(/dependencies changed:\s*no/i.test(finalReport), 'Final report confirms no dependency changes');
assert(css.includes('@media (prefers-reduced-motion: reduce)'), 'Reduced-motion coverage remains present');

if (failures.length) {
  console.error('validate-big-update-11-product-clarity: FAIL');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-big-update-11-product-clarity: PASS');
console.log(`${passes.length} checks passed`);
console.log('Home simplified; brand roles locked; Overview tiered; logic boundaries preserved.');
