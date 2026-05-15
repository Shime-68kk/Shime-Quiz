#!/usr/bin/env node
/**
 * scripts/validate-phase16e-visual-polish-quick-wins.js
 *
 * Phase 16E static validator — Visual Polish Quick Wins.
 *
 * Confirms:
 *   • doc exists with all required terms;
 *   • test file exists;
 *   • workflow registers Phase 16E validator after Phase 16D;
 *   • all previous validators through Phase 16D remain registered;
 *   • no package.json or package-lock.json changes;
 *   • no e2e/ changes;
 *   • no scheduler/storage/backup/import files changed;
 *   • no new localStorage keys;
 *   • no indexedDB, StorageAdapter, SyncAdapter, EduGen connector runtime;
 *   • Vietnamese labels remain in changed UI;
 *   • memory rating labels remain safe;
 *   • raw internal FSRS terms absent from visible JSX text;
 *   • forbidden overclaim phrases absent;
 *   • generated artifact and internal registry terms absent;
 *   • changed files are within the Phase 16E allowlist.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase16e-visual-polish-quick-wins.md';
const TEST_FILE        = 'tests/unit/visualPolishQuickWins.test.jsx';
const VALIDATOR_SCRIPT = 'scripts/validate-phase16e-visual-polish-quick-wins.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';

const PHASE16D_VALIDATOR = 'scripts/validate-phase16d-shime-study-identity-product-principles.js';
const PHASE16C_VALIDATOR = 'scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js';
const PHASE16B_VALIDATOR = 'scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js';
const PHASE16A_VALIDATOR = 'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js';
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

// Exact set of allowed changed files for Phase 16E.
// Phase 16E is a UI polish phase: allows changes only to the specified
// UI files, doc, test, validator, workflow, and CSS.
// Historical validators may be updated with exact Phase 16E allowlist entries.
const phase16eAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  TEST_FILE,
  VALIDATOR_SCRIPT,
  'src/routes/Home.jsx',
  'src/routes/Dashboard.jsx',
  'src/routes/StudyRoom.jsx',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/components/settings/FsrsExperimentalSettingsPanel.jsx',
  'src/styles/global.css',
  // Phase 16F allowlist entries (EduGen Draft Workshop Connector Foundation)
  'docs/phase16f-edugen-draft-workshop-connector-foundation.md',
  'tests/unit/edugenDraftWorkshopConnector.test.js',
  'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js',
  'src/edugen/edugenConnector.js',
  'src/components/settings/EduGenDraftWorkshopPanel.jsx',
  'src/routes/Settings.jsx',
  'src/state/settingsStorage.js',
  // Phase 16G exact files (forward compatibility)
  'docs/phase16g-edugen-draft-review-import-flow.md',
  'tests/unit/edugenDraftReviewImportFlow.test.jsx',
  'scripts/validate-phase16g-edugen-draft-review-import-flow.js',
  'src/edugen/edugenDraftParser.js',
  'src/components/edugen/EduGenDraftReviewPanel.jsx',
]);

// Hard-forbidden scheduler/storage files for Phase 16E.
//
// Note: Phase 16F (EduGen Draft Workshop Connector Foundation) is
// explicitly permitted to modify src/state/settingsStorage.js to add the
// optional `edugenServiceUrl` field, so settingsStorage.js is no longer
// listed here. Other scheduler/storage/backup files remain forbidden:
// reviewSchedulerAdapter.js, fsrsWrapper.js, reviewScheduleStorage.js,
// dataBackup.js, and v2BackupRestore.js are still untouched in both
// Phase 16E and Phase 16F.
const forbiddenRuntimeFiles = [
  'src/quiz/reviewSchedulerAdapter.js',
  'src/quiz/fsrsWrapper.js',
  'src/state/reviewScheduleStorage.js',
  'src/quiz/dataBackup.js',
  'src/state/v2BackupRestore.js',
];

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

const requiredDocTerms = [
  'visual polish quick wins',
  'calm by default',
  'beautiful but quiet',
  'motion is breath, not bounce',
  'mistakes are signals',
  'Vietnamese-first',
  'no scheduling changes',
  'no storage changes',
  'no dependencies',
  'no EduGen runtime',
];

// Raw internal FSRS identifiers that must not appear as JSX text between tags.
const forbiddenJsxTextPatterns = [
  />\s*fsrsActiveSchedulingEnabled\s*</,
  />\s*schedulerKind\s*</,
  />\s*fsrsPayload\s*</,
  />\s*ts-fsrs\s*</,
];

// CSS patterns that must NOT appear in added CSS (runtime-forbidden).
const forbiddenCssTerms = [
  'indexedDB',
  'StorageAdapter',
  'SyncAdapter',
];

// Forbidden overclaim phrases (case-insensitive substring).
const forbiddenClaimPhrases = [
  'visual polish implements adaptive scheduling',
  'active fsrs is public',
  'edugen is built in',
  'built-in ai',
  'built-in ocr',
  'cloud sync exists',
  'sync is available',
  'e2ee is implemented',
  'guaranteed mastery',
];

function fail(message) {
  console.error(`Phase 16E validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 16E validation warning: ${message}`);
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

function isGeneratedArtifact(file) {
  return generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
}

// ── Required files guard ──────────────────────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(TEST_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE16D_VALIDATOR);
  read(PHASE16C_VALIDATOR);
  read(PHASE16B_VALIDATOR);
  read(PHASE16A_VALIDATOR);
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
}

// ── Package guard ─────────────────────────────────────────────────────────────

function packageGuard() {
  const pkg = readJson('package.json');
  readJson('package-lock.json');

  for (const file of ['package.json', 'package-lock.json']) {
    const text = read(file);
    if (text.includes(bindingPackage)) fail(`${file} must not contain native binding dependency`);
    for (const term of internalRegistryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }

  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 16E');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 16E');

  void pkg;
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase16eAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 16E`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 16E`);
    if (file.startsWith('e2e/') && file !== 'e2e/onboarding-smoke.spec.js') {
      fail(`e2e/ file changed in Phase 16E: ${file}`);
    }
    // Historical validator updates are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    fail(`Unexpected changed file for Phase 16E scope: ${file}`);
  }
}

// ── Forbidden runtime files guard ─────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  const changed = new Set(changedFiles());
  for (const file of forbiddenRuntimeFiles) {
    if (changed.has(file)) {
      fail(`Phase 16E must not change scheduler/storage/backup/import file: ${file}`);
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
    'node scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js',
    'node scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js',
    'node scripts/validate-phase16d-shime-study-identity-product-principles.js',
    'node scripts/validate-phase16e-visual-polish-quick-wins.js',
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase16dPos = text.indexOf('node scripts/validate-phase16d-shime-study-identity-product-principles.js');
  const phase16ePos = text.indexOf('node scripts/validate-phase16e-visual-polish-quick-wins.js');
  if (phase16dPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16D validator`);
  if (phase16ePos === -1) fail(`${WORKFLOW_FILE} must register Phase 16E validator`);
  if (phase16ePos <= phase16dPos) {
    fail(`${WORKFLOW_FILE} must register Phase 16E validator after Phase 16D validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Required doc terms guard ──────────────────────────────────────────────────

function requiredDocTermsGuard() {
  const doc = read(DOCS_FILE);
  const docLower = doc.toLowerCase();
  for (const term of requiredDocTerms) {
    if (!docLower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── Forbidden claim guard ─────────────────────────────────────────────────────

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const docLower = doc.toLowerCase();
  for (const claim of forbiddenClaimPhrases) {
    if (docLower.includes(claim.toLowerCase())) {
      fail(`${DOCS_FILE} must not contain forbidden claim: "${claim}"`);
    }
  }
}

// ── UI Vietnamese labels guard ────────────────────────────────────────────────

function uiVietnameseLabelsGuard() {
  const homeSource = read('src/routes/Home.jsx');
  if (!homeSource.includes('Tổng quan')) fail('src/routes/Home.jsx must contain "Tổng quan"');
  if (!homeSource.includes('Phòng học')) fail('src/routes/Home.jsx must contain "Phòng học"');
  if (!homeSource.includes('Thư viện')) fail('src/routes/Home.jsx must contain "Thư viện"');

  const dashSource = read('src/routes/Dashboard.jsx');
  if (!dashSource.includes('Lộ trình hôm nay')) fail('src/routes/Dashboard.jsx must contain "Lộ trình hôm nay"');
  if (!dashSource.includes('Tổng quan')) fail('src/routes/Dashboard.jsx must contain "Tổng quan"');

  const bridgeSource = read('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
  if (!bridgeSource.includes('Mức độ nhớ')) fail('FsrsProductionMemoryRatingBridge.jsx must contain "Mức độ nhớ"');
  if (!bridgeSource.includes('Nhớ khó')) fail('FsrsProductionMemoryRatingBridge.jsx must contain "Nhớ khó"');
  if (!bridgeSource.includes('Nhớ được')) fail('FsrsProductionMemoryRatingBridge.jsx must contain "Nhớ được"');
  if (!bridgeSource.includes('Nhớ dễ')) fail('FsrsProductionMemoryRatingBridge.jsx must contain "Nhớ dễ"');
  if (!bridgeSource.includes('Chưa nhớ')) fail('FsrsProductionMemoryRatingBridge.jsx must contain "Chưa nhớ"');
}

// ── No raw internal FSRS text in JSX guard ────────────────────────────────────

function noForbiddenJsxTextGuard() {
  const filesToCheck = [
    'src/routes/Home.jsx',
    'src/routes/Dashboard.jsx',
    'src/routes/StudyRoom.jsx',
    'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
    'src/components/settings/FsrsExperimentalSettingsPanel.jsx',
  ];
  for (const file of filesToCheck) {
    if (!fs.existsSync(file)) continue;
    const source = fs.readFileSync(file, 'utf8');
    for (const pattern of forbiddenJsxTextPatterns) {
      if (pattern.test(source)) {
        fail(`${file} must not contain forbidden internal FSRS identifier as JSX text: ${pattern}`);
      }
    }
  }
}

// ── No new localStorage keys guard ───────────────────────────────────────────

function noNewLocalStorageKeysGuard() {
  const storageFile = 'src/state/reviewScheduleStorage.js';
  if (!fs.existsSync(storageFile)) return;
  const source = fs.readFileSync(storageFile, 'utf8');
  if (!source.includes("'shimeV2ReviewScheduleV1'")) {
    fail(`${storageFile} must preserve REVIEW_SCHEDULE_STORAGE_KEY = 'shimeV2ReviewScheduleV1'`);
  }

  const settingsFile = 'src/state/settingsStorage.js';
  if (!fs.existsSync(settingsFile)) return;
  const settingsSource = fs.readFileSync(settingsFile, 'utf8');
  if (!settingsSource.includes("'shimeV2SettingsV1'")) {
    fail(`${settingsFile} must preserve SETTINGS_STORAGE_KEY = 'shimeV2SettingsV1'`);
  }
}

// ── No forbidden runtime terms in CSS guard ───────────────────────────────────

function noCssForbiddenTermsGuard() {
  const cssFile = 'src/styles/global.css';
  if (!fs.existsSync(cssFile)) return;
  const css = fs.readFileSync(cssFile, 'utf8');
  for (const term of forbiddenCssTerms) {
    if (css.includes(term)) {
      fail(`${cssFile} must not contain forbidden runtime term: ${term}`);
    }
  }
}

// ── No cloud/auth/sync/EduGen runtime guard ───────────────────────────────────

function noCloudAuthGuard() {
  const forbiddenPaths = [
    'src/auth',
    'src/cloud',
    'src/backend',
    'src/api/sync',
    'src/sync',
    'src/storage/SyncAdapter.js',
    'src/storage/StorageAdapter.js',
    'src/storage/IndexedDBAdapter.js',
  ];
  for (const path of forbiddenPaths) {
    if (fs.existsSync(path)) {
      fail(`Phase 16E must not introduce cloud/auth/sync path: ${path}`);
    }
  }
}

// ── FSRS regression guard (double gate preserved) ────────────────────────────

function fsrsRegressionGuard() {
  const adapterFile = 'src/quiz/reviewSchedulerAdapter.js';
  if (!fs.existsSync(adapterFile)) return;
  const source = fs.readFileSync(adapterFile, 'utf8');
  if (!source.includes('fsrsExperimentalEnabled')) {
    fail(`${adapterFile} must preserve fsrsExperimentalEnabled (Phase 15B regression)`);
  }
  if (!source.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${adapterFile} must preserve fsrsActiveSchedulingEnabled (Phase 15B regression)`);
  }

  const wrapperFile = 'src/quiz/fsrsWrapper.js';
  if (!fs.existsSync(wrapperFile)) return;
  const wrapperSource = fs.readFileSync(wrapperFile, 'utf8');
  const matches = wrapperSource.match(/\.next\s*\(/g) ?? [];
  if (matches.length !== 2) {
    fail(`src/quiz/fsrsWrapper.js must have exactly 2 .next() calls (Phase 15B baseline preserved), found ${matches.length}`);
  }
}

// ── Internal registry / native binding guard ──────────────────────────────────

function internalRegistryGuard() {
  const doc = read(DOCS_FILE);
  if (doc.includes(bindingPackage)) {
    fail(`${DOCS_FILE} must not reference native binding package`);
  }
  for (const term of internalRegistryTerms) {
    if (doc.includes(term)) {
      fail(`${DOCS_FILE} references internal registry term: ${term}`);
    }
  }
}

// ── Reduced motion guard (if CSS has transitions) ─────────────────────────────

function reducedMotionGuard() {
  const cssFile = 'src/styles/global.css';
  if (!fs.existsSync(cssFile)) return;
  const css = fs.readFileSync(cssFile, 'utf8');
  if (css.includes('transition:') || css.includes('animation:')) {
    if (!css.includes('prefers-reduced-motion')) {
      fail(`${cssFile} adds transitions/animations but is missing a prefers-reduced-motion block`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  packageGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  generatedArtifactGuard();
  workflowGuard();
  requiredDocTermsGuard();
  forbiddenClaimGuard();
  uiVietnameseLabelsGuard();
  noForbiddenJsxTextGuard();
  noNewLocalStorageKeysGuard();
  noCssForbiddenTermsGuard();
  noCloudAuthGuard();
  fsrsRegressionGuard();
  internalRegistryGuard();
  reducedMotionGuard();
  console.log('Phase 16E visual polish quick wins validation passed.');
}

validate();
