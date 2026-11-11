#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const exists = relativePath => fs.existsSync(path.join(ROOT, relativePath));

function check(condition, message) {
  if (!condition) {
    console.error(`BIG-UPDATE-13 validation failed: ${message}`);
    process.exit(1);
  }
}

const requiredFiles = [
  'docs/reports/big-update-13-shape-motion-navigation-audit.md',
  'docs/reports/big-update-13-radius-and-surface-system.md',
  'docs/reports/big-update-13-route-motion-and-back-navigation.md',
  'docs/reports/big-update-13-robot-arrival-experience.md',
  'docs/reports/big-update-13-final-report.md',
  'src/navigation/internalRouteHistory.js',
  'src/navigation/InternalRouteHistoryProvider.jsx',
  'src/navigation/useInternalBackNavigation.js',
  'src/components/navigation/ContextualBackControl.jsx',
  'src/launch/ShimeLaunchGate.jsx',
  'src/launch/ShimeLaunchIntro.jsx',
  'src/launch/launchLifecycle.js',
  'tests/unit/bigUpdate13EmbodiedNavigation.test.jsx'
];

for (const file of requiredFiles) check(exists(file), `missing ${file}`);

const audit = read(requiredFiles[0]);
const finalReport = read(requiredFiles[4]);
const tokens = read('src/design-system/tokens.css');
const css = read('src/styles/global.css');
const layout = read('src/layout/AppLayout.jsx');
const sidebar = read('src/layout/Sidebar.jsx');
const bottomNav = read('src/layout/BottomNav.jsx');
const home = read('src/routes/Home.jsx');
const robot = read('src/components/brand/ShimeRobotPresence.jsx');
const robotFace = read('src/components/brand/ShimeOledFace.jsx');
const launchIntro = read('src/launch/ShimeLaunchIntro.jsx');
const launchTimeline = read('src/launch/launchTimeline.js');
const launchGate = read('src/launch/ShimeLaunchGate.jsx');
const arrival = read('src/launch/launchLifecycle.js');
const history = read('src/navigation/internalRouteHistory.js');
const historyHook = read('src/navigation/useInternalBackNavigation.js');
const historyProvider = read('src/navigation/InternalRouteHistoryProvider.jsx');
const vi = read('src/uiI18n/translations/vi.js');
const en = read('src/uiI18n/translations/en.js');
const packageJson = JSON.parse(read('package.json'));

for (let index = 1; index <= 17; index += 1) {
  check(new RegExp(`^## ${index}\\.`, 'm').test(audit), `audit section ${index} missing`);
}
check(audit.includes('**PASS'), 'audit does not record PASS');

for (let index = 1; index <= 34; index += 1) {
  check(new RegExp(`^## ${index}\\.`, 'm').test(finalReport), `final report section ${index} missing`);
}

for (const token of ['--radius-shell', '--radius-panel', '--radius-card', '--radius-control', '--radius-small', '--radius-pill']) {
  check(tokens.includes(token), `semantic token ${token} missing`);
}
check(/\.subjectDetailHeader\s*\{[\s\S]*?border-radius:\s*var\(--radius-panel\)/.test(css), 'Library detail header radius missing');
check(/\.settingsPanel__warningBlock\s*\{[\s\S]*?border-radius:\s*var\(--radius-control\)/.test(css), 'Settings warning radius missing');
check(/\.settingsGroup\s*\{[\s\S]*?overflow:\s*visible/.test(css), 'Settings disclosure still clips focusable content');

check((layout.match(/className="routeStage"/g) || []).length === 1, 'route stage must have one wrapper');
check(layout.includes('key={location.pathname}'), 'route stage is not pathname keyed');
check(!/setTimeout|setInterval|requestAnimationFrame|startViewTransition|AnimatePresence/.test(layout), 'route choreography API found');
check(/\.routeStage\s*\{\s*animation:\s*bu12-route-enter 160ms/.test(css), 'quiet 160ms route entry missing');
check(/BIG-UPDATE-13:[\s\S]*?\.libraryTabPanel:not\(\[hidden\]\)[\s\S]*?animation:\s*none/.test(css), 'nested route/page animation override missing');

for (const source of [sidebar, bottomNav]) {
  check(source.includes('NavLink'), 'navigation must remain NavLink-based');
  check(!source.includes('primaryNavSlidingIndicator'), 'moving navigation indicator remains mounted');
  check(!source.includes('activeIndex'), 'active index choreography remains');
}
check(/\.primaryNavSlidingIndicator\s*\{[\s\S]*?display:\s*none/.test(css), 'legacy indicator CSS is not neutralized');

check(history.includes('previousInternalPath') && history.includes('isReturnableInternalPath'), 'internal route history boundary incomplete');
check(historyProvider.includes('useNavigationType'), 'browser POP/REPLACE history guard missing');
check(historyHook.includes('navigate(-1)'), 'Back does not preserve browser history behavior');
check(!history.includes('window.history.length'), 'window.history.length used as internal-origin proof');

check(arrival.includes('createShimeLaunchDocumentState'), 'per-document launch state missing');
check(!/sessionStorage|localStorage/.test(arrival), 'arrival storage guard remains');
check(robotFace.includes("viewBox: '0 0 128 64'"), 'canonical OLED face missing');
check(launchIntro.includes('createShimeLaunchTimeline'), 'deterministic launch timeline integration missing');
check(launchTimeline.includes('side: [9600, 10400]') && launchTimeline.includes('delight: [10400, 12800]'), 'final gaze and delight sequence missing');
check(launchGate.includes('prefersReducedShimeLaunch()'), 'reduced-motion launch bypass missing');
for (const source of [arrival, home, robot, sidebar, bottomNav, layout, history, historyHook]) {
  check(!/setTimeout|setInterval|requestAnimationFrame|startViewTransition/.test(source), 'timer or view-transition choreography found');
}

for (const phrase of [
  'Chào mừng bạn đến với Shime.',
  'Bạn muốn làm gì lúc này?',
  'Tiếp tục học',
  'Luyện tập thông minh'
]) check(vi.includes(phrase), `Vietnamese copy missing: ${phrase}`);
for (const phrase of [
  'Welcome to Shime.',
  'What would you like to do?',
  'Continue learning',
  'Smart practice'
]) check(en.includes(phrase), `English copy missing: ${phrase}`);

check(home.includes("navigate('/dashboard')") && home.includes("navigate('/library')") && home.includes("navigate('/study-room'"), 'approved Home destinations missing');
for (const forbiddenImport of ['learningData', 'reviewSchedule', 'scheduler', 'deviceBridge', 'companionBridge', 'robotSensing']) {
  check(!home.includes(forbiddenImport), `Home imports or reads ${forbiddenImport}`);
}

const runtime = [sidebar, bottomNav, home, robot, robotFace, arrival, launchIntro, launchTimeline, history, historyHook].join('\n');
for (const forbiddenApi of ['fetch(', 'XMLHttpRequest', 'WebSocket', 'navigator.serial', 'navigator.bluetooth', 'getUserMedia', 'MediaRecorder', 'Notification.requestPermission', 'serviceWorker.register']) {
  check(!runtime.includes(forbiddenApi), `forbidden API found: ${forbiddenApi}`);
}
for (const dependency of ['framer-motion', 'gsap', 'three', 'matter-js', 'lottie']) {
  check(!packageJson.dependencies?.[dependency] && !packageJson.devDependencies?.[dependency], `heavy dependency added: ${dependency}`);
}

const fsrsGate = read('src/scheduler/fsrsReadinessGate.js');
check(!/fsrsCanBeDefault\s*:\s*true/.test(fsrsGate), 'FSRS default approval changed');
for (const rawField of ['correctAnswer', 'explanation', 'rawQuizPayload', 'importedDocumentText']) {
  check(!robot.includes(rawField) && !robotFace.includes(rawField) && !launchIntro.includes(rawField), `raw content term found in robot presentation: ${rawField}`);
}

const changed = execFileSync('git', ['diff', '--name-only'], { cwd: ROOT, encoding: 'utf8' });
for (const lockedPrefix of ['src/scheduler/', 'src/deviceBridge/', 'src/companion/', 'src/robotSensing/', 'src/shimeIntelligence/', 'src/storage/']) {
  check(!changed.split(/\r?\n/).some(file => file.startsWith(lockedPrefix)), `locked runtime area changed: ${lockedPrefix}`);
}
check(!changed.split(/\r?\n/).includes('package-lock.json'), 'package-lock.json changed');

for (const statement of [
  'no dependency added',
  'learning logic unchanged',
  'scheduler behavior unchanged',
  'Safe Capsule unchanged',
  'no network API added',
  'reduced motion'
]) check(finalReport.toLowerCase().includes(statement.toLowerCase()), `final safety statement missing: ${statement}`);

console.log('BIG-UPDATE-13 embodied navigation validator passed.');
