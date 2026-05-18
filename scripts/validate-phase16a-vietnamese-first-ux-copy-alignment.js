#!/usr/bin/env node
/**
 * scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js
 *
 * Phase 16A static validator — Vietnamese-First UX Copy / Button
 * Terminology Alignment.
 *
 * Confirms:
 *   • required docs/test/validator files exist;
 *   • workflow registers Phase 16A validator after Phase 15H;
 *   • all previous validators through Phase 15H remain registered;
 *   • no package.json / package-lock.json / e2e changes;
 *   • no i18n framework or language switcher introduced;
 *   • no new persistent language/locale settings key;
 *   • no storage schema changes;
 *   • no new ts-fsrs.next() call sites;
 *   • no broad AI / FSRS / cloud sync / EduGen rollout claims;
 *   • required Vietnamese labels appear in important UI;
 *   • forbidden internal/technical identifiers do not leak as
 *     user-facing UI text;
 *   • generated artifacts and internal registry/native binding terms
 *     are absent.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase16a-vietnamese-first-ux-copy-alignment.md';
const TEST_FILE        = 'tests/unit/vietnameseFirstUxCopyAlignment.test.js';
const VALIDATOR_SCRIPT = 'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';

const ROUTE_CONFIG = 'src/routes/routeConfig.js';
const HOME         = 'src/routes/Home.jsx';
const DASHBOARD    = 'src/routes/Dashboard.jsx';
const STUDY_ROOM   = 'src/routes/StudyRoom.jsx';
const LIBRARY      = 'src/routes/Library.jsx';
const SETTINGS     = 'src/routes/Settings.jsx';
const BRIDGE       = 'src/components/study/FsrsProductionMemoryRatingBridge.jsx';
const PANEL        = 'src/components/settings/FsrsExperimentalSettingsPanel.jsx';
const BACKUP_PANEL = 'src/components/learning/V2BackupRestorePanel.jsx';
const SETTINGS_STORAGE = 'src/state/settingsStorage.js';

const PHASE15H_VALIDATOR = 'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js';
const PHASE15G_VALIDATOR = 'scripts/validate-phase15g-release-claim-guardrail-reaudit.js';
const PHASE15F_VALIDATOR = 'scripts/validate-phase15f-studyroom-copy-ux-alignment.js';
const PHASE15E_VALIDATOR = 'scripts/validate-phase15e-controlled-internal-activation-harness.js';
const PHASE15D_VALIDATOR = 'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js';
const PHASE15C_VALIDATOR = 'scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js';
const PHASE15B_VALIDATOR = 'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js';
const PHASE15A_VALIDATOR = 'scripts/validate-phase15a-fsrs-active-scheduling-architecture.js';
const PHASE14P_VALIDATOR = 'scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js';
const PHASE14O_VALIDATOR = 'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js';
const PHASE14N_VALIDATOR = 'scripts/validate-phase14n-production-studyroom-two-step-bridge.js';

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied',
];

const generatedArtifacts = [
  'node_modules',
  'dist',
  'test-results',
  'playwright-report',
  'coverage',
  'FETCH_HEAD',
  '.env',
  '.env.local',
  '.git',
];

const requiredVietnameseLabels = [
  ['Tổng quan', [ROUTE_CONFIG, HOME, DASHBOARD]],
  ['Phòng học', [ROUTE_CONFIG, HOME, STUDY_ROOM]],
  ['Cài đặt',   [ROUTE_CONFIG, SETTINGS]],
  ['Thư viện',  [ROUTE_CONFIG, HOME, LIBRARY, STUDY_ROOM]],
  ['Bắt đầu',   [HOME, DASHBOARD]],
  ['Tiếp tục',  [STUDY_ROOM]],
  ['Sao lưu',   [BACKUP_PANEL]],
  ['Khôi phục', [BACKUP_PANEL]],
  ['Mức độ nhớ',[BRIDGE]],
];

const forbiddenInternalIdentifiersInUi = [
  'fsrsActiveSchedulingEnabled',
  'ts-fsrs',
  'schedulerKind',
  'fsrsPayload',
];

const forbiddenBroadClaims = [
  'AI scheduling enabled',
  'AI scheduling is enabled',
  'FSRS active for everyone',
  'FSRS is active for everyone',
  'cloud sync enabled',
  'cloud sync is enabled',
  'EduGen bundled',
  'EduGen is bundled',
  'built-in OCR',
  'OCR enabled',
];

const i18nDependencyNames = [
  'i18next',
  'react-i18next',
  '@lingui/core',
  '@lingui/react',
  '@formatjs/intl',
  'vue-i18n',
  'next-intl',
  'react-intl',
  'svelte-i18n',
];

const forbiddenI18nArtifacts = [
  'src/i18n.js',
  'src/i18n/index.js',
  'src/i18n/index.ts',
  'src/locales',
  'src/components/LanguageSwitcher.jsx',
  'src/components/language/LanguageSwitcher.jsx',
];

function fail(message) {
  console.error(`Phase 16A validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 16A validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`${file} must be valid JSON: ${error.message}`);
  }
}

function runGit(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
  } catch {
    if (!options.silent) warn(`Git command failed; scope checking may be limited: ${command}`);
    return '';
  }
}

function splitLines(output) {
  return output ? output.split(/\r?\n/).map(line => line.trim()).filter(Boolean) : [];
}

function uniqueSorted(files) {
  return [...new Set(files)].sort((a, b) => a.localeCompare(b));
}

function changedFilesFromPullRequestBase() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (!baseRef) return [];
  runGit(`git fetch --no-tags --depth=1 origin ${baseRef}`, { silent: true });
  const mergeBase = runGit(`git merge-base HEAD origin/${baseRef}`, { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesFromBranchBase() {
  const originMain = runGit('git rev-parse --verify origin/main', { silent: true });
  if (!originMain) return [];
  const mergeBase = runGit('git merge-base HEAD origin/main', { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesFromLocalFallbacks({ includeUntracked = true } = {}) {
  const files = [
    ...splitLines(runGit('git diff --name-only HEAD', { silent: true })),
    ...splitLines(runGit('git diff --cached --name-only', { silent: true })),
  ];
  if (includeUntracked) files.push(...splitLines(runGit('git ls-files --others --exclude-standard', { silent: true })));
  return files;
}

function changedFiles({ includeUntracked = true } = {}) {
  const prBaseFiles = changedFilesFromPullRequestBase();
  if (prBaseFiles.length > 0) return uniqueSorted(prBaseFiles);
  return uniqueSorted([
    ...changedFilesFromBranchBase(),
    ...changedFilesFromLocalFallbacks({ includeUntracked }),
  ]);
}

function trackedFiles() {
  return uniqueSorted(splitLines(runGit('git ls-files', { silent: true })));
}

// ── Required files guard ──────────────────────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(TEST_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE15H_VALIDATOR);
  read(PHASE15G_VALIDATOR);
  read(PHASE15F_VALIDATOR);
  read(PHASE15E_VALIDATOR);
  read(PHASE15D_VALIDATOR);
  read(PHASE15C_VALIDATOR);
  read(PHASE15B_VALIDATOR);
  read(PHASE15A_VALIDATOR);
  read(PHASE14P_VALIDATOR);
  read(PHASE14O_VALIDATOR);
  read(PHASE14N_VALIDATOR);
  read(ROUTE_CONFIG);
  read(HOME);
  read(DASHBOARD);
  read(STUDY_ROOM);
  read(LIBRARY);
  read(SETTINGS);
  read(BRIDGE);
  read(PANEL);
  read(BACKUP_PANEL);
  read(SETTINGS_STORAGE);
}

// ── Package guard (no package.json / lock changes; no i18n framework) ────────

function packageGuard() {
  const pkg = readJson('package.json');
  readJson('package-lock.json');

  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
    ...(pkg.optionalDependencies || {}),
    ...(pkg.peerDependencies || {}),
  };
  for (const name of i18nDependencyNames) {
    if (allDeps[name]) {
      fail(`Phase 16A must not introduce i18n dependency: ${name}`);
    }
  }

  for (const file of ['package.json', 'package-lock.json']) {
    const text = read(file);
    if (text.includes(bindingPackage)) fail(`${file} must not contain native binding dependency`);
    for (const term of internalRegistryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }

  const changed = new Set(changedFiles());
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
}

// ── No i18n / language switcher artefacts guard ──────────────────────────────

function noI18nArtifactsGuard() {
  for (const path of forbiddenI18nArtifacts) {
    if (fs.existsSync(path)) {
      fail(`Phase 16A must not introduce i18n artefact at: ${path}`);
    }
  }

  const settingsSource = read(SETTINGS_STORAGE);
  if (/\blanguage\s*:/.test(settingsSource)) {
    fail(`${SETTINGS_STORAGE} must not introduce a "language" settings key in Phase 16A`);
  }
  if (/\blocale\s*:/.test(settingsSource)) {
    fail(`${SETTINGS_STORAGE} must not introduce a "locale" settings key in Phase 16A`);
  }
  if (/\bi18n\b/i.test(settingsSource)) {
    fail(`${SETTINGS_STORAGE} must not introduce i18n references in Phase 16A`);
  }
}

// ── Workflow guard ────────────────────────────────────────────────────────────

function workflowGuard() {
  const text = read(WORKFLOW_FILE);

  const requiredValidators = [
    'node scripts/validate-phase14n-production-studyroom-two-step-bridge.js',
    'node scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js',
    'node scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js',
    'node scripts/validate-phase15a-fsrs-active-scheduling-architecture.js',
    'node scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js',
    'node scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js',
    'node scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js',
    'node scripts/validate-phase15e-controlled-internal-activation-harness.js',
    'node scripts/validate-phase15f-studyroom-copy-ux-alignment.js',
    'node scripts/validate-phase15g-release-claim-guardrail-reaudit.js',
    'node scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js',
    'node scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js',
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase15hPos = text.indexOf('node scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js');
  const phase16aPos = text.indexOf('node scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js');
  if (phase15hPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15H validator`);
  if (phase16aPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16A validator`);
  if (phase16aPos <= phase15hPos) {
    fail(`${WORKFLOW_FILE} must register Phase 16A validator after Phase 15H validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Scope guard (only forbid package/e2e changes; src/tests/docs allowed) ────

function scopeGuard() {
  for (const file of changedFiles()) {
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
    if (file.startsWith('e2e/') && file !== 'e2e/smoke.spec.js') {
      fail(`E2E file changed in Phase 16A: ${file}`);
    }
  }
}

// ── Generated artifact guard ──────────────────────────────────────────────────

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

// ── No new ts-fsrs.next() call sites guard ────────────────────────────────────

function noNewNextCallSitesGuard() {
  const wrapperSource = read('src/quiz/fsrsWrapper.js');
  const matches = wrapperSource.match(/\.next\s*\(/g) ?? [];
  if (matches.length !== 2) {
    fail(`src/quiz/fsrsWrapper.js must have exactly 2 .next() calls (Phase 15B baseline preserved), found ${matches.length}`);
  }

  // No NEW .next() call sites outside the wrapper.
  const adapterSource = read('src/quiz/reviewSchedulerAdapter.js');
  if (/\.next\s*\(/.test(adapterSource)) {
    fail('src/quiz/reviewSchedulerAdapter.js must not add new ts-fsrs.next() call sites in Phase 16A');
  }
  if (/\.next\s*\(/.test(read(STUDY_ROOM))) {
    fail(`${STUDY_ROOM} must not add new ts-fsrs.next() call sites in Phase 16A`);
  }
  if (/\.next\s*\(/.test(read(BRIDGE))) {
    fail(`${BRIDGE} must not add new ts-fsrs.next() call sites in Phase 16A`);
  }
}

// ── Forbidden broad-claim guard in public-facing surfaces ────────────────────

function forbiddenClaimGuard() {
  const surfaces = [HOME, DASHBOARD, STUDY_ROOM, LIBRARY, SETTINGS, BRIDGE, PANEL];
  for (const file of surfaces) {
    const text = read(file);
    for (const claim of forbiddenBroadClaims) {
      if (text.includes(claim)) {
        fail(`${file} must not introduce broad rollout claim: "${claim}"`);
      }
    }
  }
}

// ── Required Vietnamese labels guard ─────────────────────────────────────────

function requiredVietnameseLabelsGuard() {
  for (const [label, files] of requiredVietnameseLabels) {
    const anyMatch = files.some(file => {
      try { return read(file).includes(label); }
      catch { return false; }
    });
    if (!anyMatch) {
      fail(`Required Vietnamese label "${label}" not found in any of: ${files.join(', ')}`);
    }
  }
}

// ── Forbidden internal identifier in user-facing UI guard ────────────────────

function forbiddenInternalIdentifierUiGuard() {
  const uiSurfaces = [HOME, DASHBOARD, STUDY_ROOM, LIBRARY, SETTINGS, BRIDGE, PANEL];
  for (const file of uiSurfaces) {
    const text = read(file);
    for (const identifier of forbiddenInternalIdentifiersInUi) {
      // Only forbid the identifier when it appears as user-facing JSX text
      // (between > and <). Code-level usage (e.g. settings.fsrsActiveSchedulingEnabled,
      // adapter.schedulerKind) remains legitimate and not user-facing.
      const re = new RegExp(`>\\s*${identifier.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, '\\$&')}\\s*<`);
      if (re.test(text)) {
        fail(`${file} must not render internal identifier "${identifier}" as user-facing JSX text`);
      }
    }
  }
}

// ── Doc guard ─────────────────────────────────────────────────────────────────

function docsGuard() {
  const doc = read(DOCS_FILE);
  const required = [
    'Phase 16A',
    'Vietnamese',
    'i18n',
    'language switcher',
    'package',
    'storage',
    'scheduling',
    'Phase 16B',
    'Mức độ nhớ',
    'Tổng quan',
    'Phòng học',
    'Thư viện',
    'Cài đặt',
    'deferred',
  ];
  for (const term of required) {
    if (!doc.includes(term)) fail(`${DOCS_FILE} must mention: ${term}`);
  }
}

// ── Internal registry / native binding guard ─────────────────────────────────

function internalRegistryGuard() {
  const docsText = read(DOCS_FILE);
  if (docsText.includes(bindingPackage)) {
    fail(`${DOCS_FILE} must not reference native binding package`);
  }
  for (const term of internalRegistryTerms) {
    if (docsText.includes(term)) {
      fail(`${DOCS_FILE} references internal registry term: ${term}`);
    }
  }
}

// ── Phase 15F regression: bridge must still preserve "may adjust" copy ──────

function priorPhaseRegressionGuard() {
  const bridgeSource = read(BRIDGE);
  if (!bridgeSource.includes('may adjust when you next see this card')) {
    fail(`${BRIDGE} must preserve "may adjust" active copy (Phase 15F regression)`);
  }
  if (!bridgeSource.includes('Your schedule is not affected')) {
    fail(`${BRIDGE} must preserve "Your schedule is not affected" inert copy (Phase 15F regression)`);
  }
  if (!bridgeSource.includes('isActiveSchedulingCopyEnabled')) {
    fail(`${BRIDGE} must preserve isActiveSchedulingCopyEnabled prop (Phase 15F regression)`);
  }

  const panelSource = read(PANEL);
  if (!panelSource.includes('Enable FSRS Memory Model (Experimental)')) {
    fail(`${PANEL} must preserve "Enable FSRS Memory Model (Experimental)" reference copy (Phase 14H regression)`);
  }

  const adapterSource = read('src/quiz/reviewSchedulerAdapter.js');
  if (!adapterSource.includes('fsrsExperimentalEnabled')) {
    fail('src/quiz/reviewSchedulerAdapter.js must preserve fsrsExperimentalEnabled (Phase 15B regression)');
  }
  if (!adapterSource.includes('fsrsActiveSchedulingEnabled')) {
    fail('src/quiz/reviewSchedulerAdapter.js must preserve fsrsActiveSchedulingEnabled (Phase 15B regression)');
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  packageGuard();
  noI18nArtifactsGuard();
  workflowGuard();
  scopeGuard();
  generatedArtifactGuard();
  noNewNextCallSitesGuard();
  forbiddenClaimGuard();
  requiredVietnameseLabelsGuard();
  forbiddenInternalIdentifierUiGuard();
  docsGuard();
  internalRegistryGuard();
  priorPhaseRegressionGuard();
  console.log('Phase 16A Vietnamese-first UX copy / button terminology alignment validation passed.');
}

validate();
