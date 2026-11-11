#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = file => fs.existsSync(path.join(ROOT, file));

function check(condition, message) {
  if (!condition) {
    console.error(`BIG-UPDATE-14 launch validation failed: ${message}`);
    process.exit(1);
  }
}

const required = [
  'docs/design/big-update-14-shime-launch-storyboard.html',
  'docs/reports/big-update-14-oled-firmware-audit.md',
  'docs/reports/big-update-14-final-report.md',
  'src/launch/ShimeLaunchGate.jsx',
  'src/launch/ShimeLaunchIntro.jsx',
  'src/launch/launchLifecycle.js',
  'src/launch/launchTimeline.js',
  'src/components/brand/ShimeRobotHead.jsx',
  'src/components/brand/ShimeOledFace.jsx',
  'src/components/study/ShimeStudyCompanion.jsx',
  'tests/unit/bigUpdate14ShimeLaunch.test.jsx',
  'tests/unit/bigUpdate14RobotExpression.test.jsx'
];
for (const file of required) check(exists(file), `missing ${file}`);

const gate = read(required[3]);
const intro = read(required[4]);
const lifecycle = read(required[5]);
const timeline = read(required[6]);
const head = read(required[7]);
const oled = read(required[8]);
const studyCompanion = read(required[9]);
const home = read('src/routes/Home.jsx');
const studyRoom = read('src/routes/StudyRoom.jsx');
const main = read('src/main.jsx');
const tokens = read('src/design-system/tokens.css');
const css = read('src/styles/global.css');
const vi = read('src/uiI18n/translations/vi.js');
const en = read('src/uiI18n/translations/en.js');
const packageJson = JSON.parse(read('package.json'));

check(oled.includes("viewBox: '0 0 128 64'"), 'OLED viewBox contract missing');
for (const geometry of [
  'x: 27, y: 14, width: 32, height: 36, radius: 8',
  'x: 69, y: 14, width: 32, height: 36, radius: 8',
  'x: 25, y: 13, width: 34, height: 38, radius: 8',
  'x: 69, y: 13, width: 34, height: 38, radius: 8'
]) check(oled.includes(geometry), `OLED geometry missing: ${geometry}`);
check(oled.includes('gap: 10'), 'OLED gap 10 missing');
check(!/dotEye|eyeVariant/.test(oled), 'legacy dot-eye implementation remains');
check(head.includes("import ShimeOledFace from './ShimeOledFace.jsx'"), 'head does not compose OLED face');

for (const role of ['head-surface', 'head-border', 'oled-surface', 'eye', 'eye-soft', 'glow', 'impact-particle', 'message-surface']) {
  check((tokens.match(new RegExp(`--theme-robot-${role}:`, 'g')) || []).length === 5, `robot role ${role} is not defined in all five themes`);
}

check(main.includes('<ShimeLaunchGate>') && main.indexOf('<ShimeLaunchGate>') < main.indexOf('<Routes>'), 'launch gate is not before routes');
check(gate.includes('inert={active ? true : undefined}'), 'hidden app is not inert');
check(gate.includes("aria-hidden={active ? 'true' : undefined}"), 'hidden app remains in accessibility tree');
check(gate.includes("event.key === 'Escape'"), 'Escape skip missing');
check(intro.includes("onClick={() => onComplete('skip')}"), 'Skip button completion missing');
check(lifecycle.includes('createShimeLaunchDocumentState'), 'document lifecycle factory missing');
check(!/localStorage|sessionStorage|indexedDB/.test(lifecycle), 'launch replay authority uses storage');

check(lifecycle.includes('SHIME_LAUNCH_DURATION_MS = 5150'), '5.15-second Scene 1 duration contract missing');
check(lifecycle.includes('SHIME_LAUNCH_REDUCED_DURATION_MS = 650'), 'short reduced-motion Scene 1 contract missing');
check(timeline.includes('createShimeLaunchTimeline') && timeline.includes('element.animate'), 'deterministic WAAPI launch timeline missing');
check(timeline.includes('document.timeline.currentTime'), 'shared launch timeline clock missing');
check(!css.includes('shimeLaunch141'), 'obsolete 9.2-second CSS choreography remains');
check(/prefers-reduced-motion:[\s\S]*?\.shimeLaunchIntro--reduced/.test(css), 'static reduced-motion Scene 1 path missing');
check(gate.includes('reducedMotion={reducedMotion}'), 'reduced-motion state does not reach Scene 1');
check((intro.match(/data-rock-actor="persistent"/g) || []).length === 1, 'single persistent rock actor missing');
check(intro.includes('data-scene-actor="shime-head"'), 'head-centric Scene 1 robot missing');
check(!/LaunchLeg|shimeLaunchIntro__leg|shimeLaunchIntro__foot|shimeLaunchIntro__brand|shimeLaunchIntro__fragment/.test(intro), 'later-scene actor leaked into Scene 1');
for (const expression of ['turboExcited', 'impactShock', 'dazed', 'closed', 'recovering', 'angryRecovery']) {
  check(oled.includes(`shimeCinematicFace__expression--${expression}`), `Scene 1 OLED expression missing: ${expression}`);
  check(timeline.includes(expression), `Scene 1 timeline state missing: ${expression}`);
}
for (const expression of ['TURBO_EXCITED', 'IMPACT_SHOCK', 'DAZED', 'ANGRY_RECOVERY']) {
  check(oled.includes(`data-scene-expression="${expression}"`), `Scene 1 expression contract missing: ${expression}`);
}

check(vi.includes("'launch.welcome': 'Chào mừng đến với Shime Quiz.'"), 'Vietnamese launch copy missing');
check(en.includes("'launch.welcome': 'Welcome to Shime Quiz.'"), 'English launch copy missing');
check(vi.includes("'study.companionIncorrect': 'Chưa đúng — mình xem lại một chút nhé.'"), 'Vietnamese incorrect companion copy missing');
check(en.includes("'study.companionIncorrect': 'Not quite — let’s take another look.'"), 'English incorrect companion copy missing');
check(!intro.includes('<strong>Shime Quiz</strong>'), 'brand assembly appears before Scene 1 ends');
check(!/ShimeArrivalGreeting|arrivalSession|arrivalActive|arrivalGreeting|arrivalPrompt/.test(home), 'duplicate Home arrival remains');

check(studyCompanion.includes('getStudyCompanionExpression'), 'StudyRoom coarse expression adapter missing');
check(studyRoom.includes('<StudyMascot reaction={mascotReaction} message={mascotMessage} />'), 'StudyRoom does not use existing coarse reaction');
for (const raw of ['prompt', 'question', 'answer', 'correctAnswer', 'userAnswer', 'explanation', 'sourceMetadata']) {
  check(!studyCompanion.includes(raw), `raw learning term reaches robot UI: ${raw}`);
}

const runtime = [gate, intro, lifecycle, timeline, head, oled, studyCompanion].join('\n');
for (const forbidden of [
  'fetch(', 'XMLHttpRequest', 'WebSocket', 'navigator.serial', 'navigator.bluetooth', 'getUserMedia',
  'MediaRecorder', 'setTimeout', 'setInterval', 'requestAnimationFrame', 'Math.random', '<canvas', '<video'
]) check(!runtime.includes(forbidden), `forbidden runtime capability found: ${forbidden}`);

for (const dependency of ['framer-motion', 'gsap', 'lottie', 'react-spring', 'three', 'matter-js']) {
  check(!packageJson.dependencies?.[dependency] && !packageJson.devDependencies?.[dependency], `forbidden dependency added: ${dependency}`);
}

check(!/fsrsCanBeDefault\s*:\s*true/.test(read('src/scheduler/fsrsReadinessGate.js')), 'FSRS default changed');
check(read('src/deviceBridge/safeLearningCapsule.js').includes('`${capsule.capsuleId}|${capsule.sourceType}|${capsule.safeSummaryCode}`'), 'Safe Capsule checksum changed');

const changed = execFileSync('git', ['diff', '--name-only'], { cwd: ROOT, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
for (const locked of ['src/scheduler/', 'src/deviceBridge/', 'src/companion/', 'src/robotSensing/', 'src/shimeIntelligence/', 'src/storage/', 'src/data/']) {
  check(!changed.some(file => file.startsWith(locked)), `locked path changed: ${locked}`);
}
check(!changed.includes('package-lock.json'), 'package-lock.json changed');

console.log('BIG-UPDATE-14 Shime launch and OLED validator passed.');
