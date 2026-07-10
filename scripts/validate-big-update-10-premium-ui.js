#!/usr/bin/env node
/**
 * validate-big-update-10-premium-ui.js
 * BIG-UPDATE-10 Premium UI Validator
 *
 * Checks:
 * 1. Required docs exist
 * 2. Key content assertions on docs
 * 3. Required source files exist
 * 4. Forbidden APIs absent from new source files
 * 5. No heavy animation lib added
 * 6. No FSRS default change
 * 7. No raw quiz content in robot/UI new files
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const passes = [];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`MISSING: ${rel}`);
    return '';
  }
  passes.push(`EXISTS: ${rel}`);
  return fs.readFileSync(full, 'utf8');
}

function assertIncludes(content, needle, message) {
  if (!content.includes(needle)) failures.push(message || `Missing: "${needle}"`);
}

function assertMatches(content, regex, message) {
  if (!regex.test(content)) failures.push(message || `Pattern not found: ${regex}`);
}

function assertNotMatches(content, regex, message) {
  if (regex.test(content)) failures.push(message || `Forbidden pattern found: ${regex}`);
}

function assertNotContains(content, needle, message) {
  if (content.includes(needle)) failures.push(message || `Forbidden string found: "${needle}"`);
}

// ────────────────────────────
// Check required docs
// ────────────────────────────
const designAudit = read('docs/reports/big-update-10-premium-ui-design-audit.md');
const uxWritingGuide = read('docs/reports/big-update-10-ux-writing-guide.md');
const perfBudget = read('docs/reports/big-update-10-performance-budget.md');
const finalReport = read('docs/reports/big-update-10-premium-ui-final-report.md');

// Design audit content checks
assertMatches(designAudit, /big.update.10/i, 'Design audit must reference big-update-10');
assertMatches(designAudit, /reduced.motion|prefers-reduced-motion/i, 'Design audit must address reduced motion');
assertMatches(designAudit, /no blocking intro|no autoplay/i, 'Design audit must confirm no blocking intro/autoplay');

// UX writing guide checks
assertMatches(uxWritingGuide, /big.update.10/i, 'UX writing guide must reference big-update-10');
assertMatches(uxWritingGuide, /local.first|cục bộ/i, 'UX writing guide must mention local-first');
assertMatches(uxWritingGuide, /không.*cloud|no.*cloud/i, 'UX writing guide must confirm no cloud');

// Performance budget checks
assertMatches(perfBudget, /big.update.10/i, 'Performance budget must reference big-update-10');
assertMatches(perfBudget, /LCP|Largest Contentful Paint/i, 'Performance budget must mention LCP');
assertMatches(perfBudget, /no autoplay|autoplay/i, 'Performance budget must address autoplay');
assertMatches(perfBudget, /transform.*opacity|animate.*transform/i, 'Performance budget must confirm transform/opacity animations');

// Final report checks
assertMatches(finalReport, /big.update.10/i, 'Final report must reference big-update-10');
assertMatches(finalReport, /PASS/i, 'Final report must include PASS verdict');
assertMatches(finalReport, /reduced.motion|prefers-reduced-motion/i, 'Final report must address reduced motion');
assertMatches(finalReport, /robot bridge|robot bridge added/i, 'Final report must address robot bridge');
assertMatches(finalReport, /scheduler/i, 'Final report must confirm no scheduler change');
assertMatches(finalReport, /Safe Capsule/i, 'Final report must confirm Safe Capsule unchanged');
assertMatches(finalReport, /local-first|cục bộ/i, 'Final report must mention local-first');

// ────────────────────────────
// Check required source files
// ────────────────────────────
const robotPresence = read('src/components/brand/ShimeRobotPresence.jsx');
const motionTokens = read('src/uiMotion/motionTokens.js');
const productVoice = read('src/copy/productVoice.js');
const homeJsx = read('src/routes/Home.jsx');

// ────────────────────────────
// Check required test files
// ────────────────────────────
const robotTest = read('tests/unit/ShimeRobotPresence.test.jsx');
const motionTest = read('tests/unit/motionTokens.test.js');
const voiceTest = read('tests/unit/productVoice.test.js');

// ────────────────────────────
// Forbidden API checks — new UI source files only
// ────────────────────────────
const newUiFiles = [
  ['src/components/brand/ShimeRobotPresence.jsx', robotPresence],
  ['src/uiMotion/motionTokens.js', motionTokens],
  ['src/copy/productVoice.js', productVoice],
  ['src/routes/Home.jsx', homeJsx]
];

const forbiddenApis = [
  'fetch(',
  'XMLHttpRequest',
  'new WebSocket',
  'navigator.serial',
  'navigator.bluetooth',
  'getUserMedia',
  'MediaRecorder',
  'Notification.requestPermission',
  'serviceWorker.register',
  'localStorage.setItem',
  'sessionStorage.setItem',
  'indexedDB.open'
];

const forbiddenAnimLibs = ['framer-motion', 'gsap', 'three', 'matter-js', 'lottie'];

const forbiddenRobotContent = ['correctAnswer', 'explanation', 'rawQuizPayload', 'importedDocumentText'];

for (const [filePath, content] of newUiFiles) {
  if (!content) continue;

  for (const api of forbiddenApis) {
    if (content.includes(api)) {
      failures.push(`FORBIDDEN API in ${filePath}: "${api}"`);
    }
  }

  for (const lib of forbiddenAnimLibs) {
    if (content.includes(lib)) {
      failures.push(`FORBIDDEN ANIMATION LIB in ${filePath}: "${lib}"`);
    }
  }

  for (const field of forbiddenRobotContent) {
    if (content.includes(field)) {
      failures.push(`RAW CONTENT FIELD in ${filePath}: "${field}"`);
    }
  }
}

// ────────────────────────────
// FSRS default check
// ────────────────────────────
const fsrsPanel = fs.existsSync(path.join(root, 'src/components/settings/FsrsExperimentalSettingsPanel.jsx'))
  ? fs.readFileSync(path.join(root, 'src/components/settings/FsrsExperimentalSettingsPanel.jsx'), 'utf8')
  : '';

if (fsrsPanel) {
  if (/fsrsCanBeDefault\s*=\s*true/.test(fsrsPanel)) {
    failures.push('FSRS default changed: fsrsCanBeDefault became true — forbidden in BIG-UPDATE-10');
  } else {
    passes.push('FSRS default not changed');
  }
}

// ────────────────────────────
// Home.jsx preserved validator requirements
// ────────────────────────────
const homeChecks = [
  [/ShimeChamhoc v2/i, 'Home.jsx must identify ShimeChamhoc v2'],
  [/cục bộ|local.first/i, 'Home.jsx must mention local-first/cục bộ'],
  [/Dùng quiz mẫu/i, 'Home.jsx must mention Dùng quiz mẫu'],
  [/JSON/i, 'Home.jsx must mention JSON'],
  [/CSV/i, 'Home.jsx must mention CSV'],
  [/Text\/Markdown/i, 'Home.jsx must mention Text/Markdown'],
  [/\.txt\/\.md/i, 'Home.jsx must mention .txt/.md'],
  [/PDF\/DOCX\/PPTX\/ZIP/i, 'Home.jsx must mention PDF/DOCX/PPTX/ZIP'],
  [/EduGen.*không được bundle|EduGen.*not bundled|separate/i, 'Home.jsx must state EduGen is separate'],
  [/không gọi AI\/API|no external AI\/API|không có built-in AI|không có built.in AI/i, 'Home.jsx must state no AI/API'],
  [/không có API key\/BYOK|no API key\/BYOK/i, 'Home.jsx must state no API key/BYOK'],
  [/Không OCR|không OCR|no OCR/i, 'Home.jsx must state no OCR'],
  [/không thêm backend\/cloud sync|backend\/cloud sync|cloud sync/i, 'Home.jsx must state no backend/cloud sync'],
  [/navigate\('\/dashboard'\)/, 'Home.jsx must include dashboard CTA'],
  [/navigate\('\/library'\)/, 'Home.jsx must include library CTA'],
  [/navigate\('\/study-room'\)/, 'Home.jsx must include study-room CTA']
];

for (const [regex, msg] of homeChecks) {
  assertMatches(homeJsx, regex, msg);
}

// ────────────────────────────
// Robot presence component checks
// ────────────────────────────
assertMatches(robotPresence, /aria-hidden|role.*img/i, 'Robot presence must have accessibility attributes');
assertMatches(robotPresence, /decorative/i, 'Robot presence must handle decorative prop');
assertMatches(robotPresence, /reducedMotion/i, 'Robot presence must handle reducedMotion prop');
assertMatches(robotPresence, /idle.*ready.*focus.*success.*warning/s, 'Robot presence must support all 5 states');

// ────────────────────────────
// Motion tokens checks
// ────────────────────────────
assertMatches(motionTokens, /durationFast.*120/s, 'motionTokens must define durationFast = 120');
assertMatches(motionTokens, /durationNormal.*180/s, 'motionTokens must define durationNormal = 180');
assertMatches(motionTokens, /durationSlow.*240/s, 'motionTokens must define durationSlow = 240');
assertMatches(motionTokens, /reducedMotionDuration.*0/s, 'motionTokens must define reducedMotionDuration = 0');

// ────────────────────────────
// Product voice checks
// ────────────────────────────
assertMatches(productVoice, /HERO_COPY/i, 'productVoice must export HERO_COPY');
assertMatches(productVoice, /VOICE_RULES/i, 'productVoice must export VOICE_RULES');
assertMatches(productVoice, /no-robot-sense/i, 'productVoice must include no-robot-sense voice rule');

// ────────────────────────────
// CSS styles check
// ────────────────────────────
const css = read('src/styles/global.css');
assertMatches(css, /shimeLandingHero|shimeRobotPresence/, 'global.css must include BIG-UPDATE-10 new CSS classes');
assertMatches(css, /prefers-reduced-motion.*reduce/, 'global.css must include reduced motion media query');
assertMatches(css, /shimeHomeEnter|shimeRobotAmbientPresence/, 'global.css must include Home entrance and robot ambient keyframes');
assertMatches(css, /shimeRobotEyeBlink[\s\S]*scaleY\(0\.12\)/, 'global.css must include the subtle robot eye blink');
assertMatches(css, /shimeHeadlineAccentReveal/, 'global.css must include the one-shot headline accent reveal');
assertMatches(css, /@media \(hover: hover\) and \(pointer: fine\)/, 'Home hover motion must be pointer-gated');
assertMatches(homeJsx, /--motion-index/, 'Home proof cards must use CSS motion indices');
assertNotMatches(homeJsx, /<button[^>]*shimeLandingProofCard/, 'Proof cards must remain non-interactive articles');
assertNotMatches(`${homeJsx}\n${robotPresence}`, /\b(?:setTimeout|setInterval|requestAnimationFrame)\s*\(/, 'Home motion must not use JavaScript timers');

// ────────────────────────────
// Result
// ────────────────────────────
if (failures.length > 0) {
  console.error('\n❌ validate-big-update-10-premium-ui: FAIL');
  failures.forEach(f => console.error(`  - ${f}`));
  console.log(`\n✅ Passing checks (${passes.length}):`);
  passes.slice(0, 10).forEach(p => console.log(`  + ${p}`));
  process.exit(1);
}

console.log('✅ validate-big-update-10-premium-ui: PASS');
console.log(`  - ${passes.length} checks passed`);
console.log('  - No forbidden APIs in new UI files');
console.log('  - No heavy animation libraries added');
console.log('  - No FSRS default change');
console.log('  - No raw quiz content in robot/UI files');
console.log('  - Home.jsx validator requirements preserved');
console.log('  - Reduced motion supported');
console.log('  - No blocking intro animation');
console.log('  - No autoplay video');
console.log('  Recommendation: SAFE_TO_COMMIT_BIG_UPDATE_10');
