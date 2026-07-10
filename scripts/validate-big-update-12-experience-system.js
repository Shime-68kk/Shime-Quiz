import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getUiTranslationKeys, translateUi } from '../src/uiI18n/localeRuntime.js';
import { REQUIRED_THEME_ROLES, UI_THEME_IDS } from '../src/uiTheme/themeRuntime.js';
import { UI_THEME_DEFINITIONS } from '../src/uiTheme/themeDefinitions.js';
import { contrastRatio } from '../src/uiTheme/contrast.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let checks = 0;
const failures = [];

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

const requiredReports = [
  'docs/reports/big-update-12-i18n-and-theme-deep-audit.md',
  'docs/reports/big-update-12-language-coverage-report.md',
  'docs/reports/big-update-12-theme-contrast-matrix.md',
  'docs/reports/big-update-12-library-and-route-motion-report.md',
  'docs/reports/big-update-12-experience-system-final-report.md'
];

for (const report of requiredReports) check(fs.existsSync(path.join(ROOT, report)), `Missing report: ${report}`);

const viKeys = getUiTranslationKeys('vi');
const enKeys = getUiTranslationKeys('en');
check(JSON.stringify(viKeys) === JSON.stringify(enKeys), 'Vietnamese and English translation keys must match');
check(viKeys.length >= 700, 'Translation coverage is unexpectedly small');
check(translateUi('settings.title', 'invalid') === 'Cài đặt', 'Invalid locale must fall back to Vietnamese');

check(Object.keys(UI_THEME_DEFINITIONS).join('|') === UI_THEME_IDS.join('|'), 'Five canonical theme definitions must exist');
for (const [themeId, definition] of Object.entries(UI_THEME_DEFINITIONS)) {
  check(
    JSON.stringify(Object.keys(definition.roles).sort()) === JSON.stringify([...REQUIRED_THEME_ROLES].sort()),
    `${themeId} is missing semantic roles`
  );
  for (const [foreground, background] of [
    ['text-primary', 'canvas'],
    ['text-muted', 'canvas'],
    ['text-on-accent', 'brand-primary'],
    ['status-safe', 'status-safe-background'],
    ['status-warning', 'status-warning-background']
  ]) {
    check(
      contrastRatio(definition.roles[foreground], definition.roles[background]) >= 4.5,
      `${themeId} contrast failed for ${foreground}/${background}`
    );
  }
}

const packageJson = JSON.parse(read('package.json'));
for (const dependency of ['i18next', 'react-intl', 'formatjs', 'framer-motion', 'gsap', 'lottie', 'three']) {
  check(!packageJson.dependencies?.[dependency] && !packageJson.devDependencies?.[dependency], `Forbidden dependency added: ${dependency}`);
}
check(packageJson.scripts?.['validate:experience-system'] === 'node scripts/validate-big-update-12-experience-system.js', 'Validator package script missing');

const library = read('src/routes/Library.jsx');
check(library.includes("t('library.addTab')"), 'Library add-material label is not translated');
check(library.includes('LibraryMethodIcon'), 'Library inline SVG method icons are missing');
check(!/[⚡✍️📁🤖]/u.test(library), 'Library method cards still contain emoji icons');
check(!library.includes('Trợ lý Prompt'), 'Library still uses prompt-assistant framing');
for (const callback of ['openFilePicker', 'openTextFilePicker', 'openDocumentFilePicker', 'loadDemoSampleQuickstart', 'confirmImport']) {
  check(library.includes(callback), `Library callback missing: ${callback}`);
}

const layout = read('src/layout/AppLayout.jsx');
check(layout.includes('className="routeStage"') && layout.includes('key={location.pathname}'), 'Keyed route stage missing');
check(layout.includes('<Sidebar />') && layout.includes('<BottomNav />'), 'Persistent shell controls missing');
check(!/setTimeout|setInterval/.test(layout), 'Route navigation must not use timers');

const css = read('src/styles/global.css');
check(css.includes('@keyframes bu12-route-enter'), 'Route entry motion missing');
check(/prefers-reduced-motion:[\s\S]*?\.routeStage/.test(css), 'Reduced-motion route override missing');
check(css.includes('--theme-navigation-active-background') || read('src/design-system/tokens.css').includes('--theme-navigation-active-background'), 'Active navigation semantic token missing');

const settings = read('src/routes/Settings.jsx');
check(settings.indexOf('<ShimeLanguageSwitch />') < settings.indexOf('<FsrsExperimentalSettingsPanel />'), 'Appearance preferences must precede experimental settings');
check(settings.includes("title={t('settings.advanced')}") && settings.includes("title={t('settings.developer')}"), 'Settings disclosure groups missing');
const disclosure = read('src/components/settings/SettingsDisclosure.jsx');
check(disclosure.includes('aria-expanded={open}') && disclosure.includes('hidden={!open}'), 'Settings disclosures are not accessible/collapsed');

const presentationSources = [
  'src/uiI18n/localeRuntime.js', 'src/uiI18n/localeStorage.js',
  'src/uiTheme/themeRuntime.js', 'src/uiTheme/themeDefinitions.js',
  'src/layout/AppLayout.jsx', 'src/routes/Home.jsx', 'src/routes/Dashboard.jsx',
  'src/routes/Library.jsx', 'src/routes/Settings.jsx'
].map(read).join('\n');
for (const api of ['fetch(', 'XMLHttpRequest', 'WebSocket', 'navigator.bluetooth', 'navigator.serial', 'getUserMedia', 'MediaRecorder', 'Notification.requestPermission', 'serviceWorker.register']) {
  check(!presentationSources.includes(api), `Forbidden runtime API in BIG-UPDATE-12 presentation source: ${api}`);
}

const readiness = read('src/scheduler/fsrsReadinessGate.js');
check(readiness.includes('fsrsCanBeDefault: false'), 'fsrsCanBeDefault must remain false');
const routeConfig = read('src/routes/routeConfig.js');
for (const route of ['/dashboard', '/library', '/study-room', '/settings']) check(routeConfig.includes(`path: '${route}'`), `Route destination changed or missing: ${route}`);

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const forbiddenPrefixes = [
  'src/scheduler/', 'src/quiz/reviewSchedulerAdapter.js', 'src/state/reviewScheduleStorage.js',
  'src/deviceBridge/', 'src/companion/', 'src/robotSensing/', 'src/shimeIntelligence/',
  'src/storage/', 'src/data/importValidator.js', 'src/data/csvImportParser.js',
  'src/data/textQuizParser.js', 'src/data/quizParser.js', 'src/data/libraryExport.js',
  'src/data/learningDataStore.js', 'src/data/learningDataAdapter.js'
];
for (const prefix of forbiddenPrefixes) check(!changedFiles.some(file => file === prefix || file.startsWith(prefix)), `Locked path changed: ${prefix}`);
check(!changedFiles.includes('package-lock.json'), 'package-lock.json changed');

const finalReport = read('docs/reports/big-update-12-experience-system-final-report.md');
for (const statement of [
  'No commit or push was performed',
  'No browser-language detection or remote translation',
  'No experimental option is auto-enabled',
  'Safe Capsule only',
  'SM2 remains the stable default',
  'FSRS remains beta opt-in',
  'No LCP, INP, or CLS value is claimed'
]) check(finalReport.includes(statement), `Final report missing statement: ${statement}`);

if (failures.length) {
  console.error(`BIG-UPDATE-12 validator: NOT PASS (${failures.length}/${checks} failed)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`BIG-UPDATE-12 validator: PASS (${checks} checks)`);

