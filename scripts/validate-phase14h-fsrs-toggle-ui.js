#!/usr/bin/env node
/**
 * scripts/validate-phase14h-fsrs-toggle-ui.js
 *
 * Phase 14H static validator — FSRS Experimental Toggle UX and Settings UI Scaffold.
 * Modeled after validate-phase14g-settings-storage.js.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE = 'docs/phase14h-fsrs-experimental-toggle-ui.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase14h-fsrs-toggle-ui.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';

const SETTINGS_ROUTE = 'src/routes/Settings.jsx';
const FSRS_PANEL = 'src/components/settings/FsrsExperimentalSettingsPanel.jsx';
const SETTINGS_TEST = 'tests/unit/fsrsExperimentalSettingsPanel.test.jsx';
const ROUTE_CONFIG = 'src/routes/routeConfig.js';

const SETTINGS_STORAGE_SOURCE = 'src/state/settingsStorage.js';
const STUDY_ROOM = 'src/routes/StudyRoom.jsx';
const DASHBOARD = 'src/routes/Dashboard.jsx';
const ADAPTER_SOURCE = 'src/quiz/reviewSchedulerAdapter.js';
const WRAPPER_SOURCE = 'src/quiz/fsrsWrapper.js';
const STORAGE_SOURCE = 'src/state/reviewScheduleStorage.js';
const LEGACY_BACKUP = 'src/quiz/dataBackup.js';

const PHASE14G_DOCS = 'docs/phase14g-fsrs-settings-storage-schema.md';
const PHASE14G_VALIDATOR = 'scripts/validate-phase14g-settings-storage.js';
const PHASE14F_VALIDATOR = 'scripts/validate-phase14f-toggle-plan.js';
const PHASE14F_HF1_VALIDATOR = 'scripts/validate-phase14f-hf1-baseline-validation-recovery.js';

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied'
];

const phase14hAllowedChangedFiles = new Set([
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  WORKFLOW_FILE,
  SETTINGS_ROUTE,
  FSRS_PANEL,
  SETTINGS_TEST,
  ROUTE_CONFIG,
  // Phase 14G historical allowlist update
  PHASE14G_VALIDATOR,
  // Historical validator compatibility — exact files only
  PHASE14F_VALIDATOR,
  PHASE14F_HF1_VALIDATOR,
  'scripts/validate-phase14b-fsrs-wrapper.js',
  'scripts/validate-phase14c-fsrs-persistence-harness.js',
  'scripts/validate-phase14d-fsrs-adapter-routing.js',
  'scripts/validate-phase14e-fsrs-user-facing-entry.js',
  'scripts/validate-backup-transfer-safety-hardening.js',
  'scripts/validate-cross-device-transfer-track-closure.js',
  'scripts/validate-cross-device-transfer-ux-copy.js',
  'scripts/validate-cross-device-transfer-ux-decision.js',
  'scripts/validate-dashboard-today-card-runtime.js',
  'scripts/validate-dashboard-today-card-ux-plan.js',
  'scripts/validate-manual-evidence-execution-checklist.js',
  'scripts/validate-manual-evidence-results-log.js',
  'scripts/validate-phase12-closure-release-decision.js',
  'scripts/validate-phase12-roadmap-risk-register.js',
  'scripts/validate-storage-capacity-indexeddb-migration-plan.js',
  'scripts/validate-storage-quota-warning-runtime.js',
  'scripts/validate-study-flow-micro-feedback-plan.js',
  'scripts/validate-study-flow-micro-feedback-runtime.js',
  'scripts/validate-unit-test-foundation-plan.js',
  'scripts/validate-vitest-unit-test-foundation.js',
  'scripts/validate-web-share-mobile-sharing-prototype-plan.js',
  'scripts/validate-web-share-runtime-fallback-hardening.js',
  'scripts/validate-web-share-runtime-prototype.js',
  'scripts/validate-cross-device-export-import.js',
  'scripts/validate-edugen-boundary-polish.js',
  'scripts/validate-final-main-release-authorization.js',
  'scripts/validate-final-public-release-readiness-reaudit.js',
  'scripts/validate-final-release-execution-checklist.js',
  'scripts/validate-github-release-publication-plan.js',
  'scripts/validate-manual-evidence-run-pack.js',
  'scripts/validate-phase13-closure.js',
  'scripts/validate-phase13-fsrs-plan.js',
  'scripts/validate-phase13-local-adaptive-roadmap.js',
  'scripts/validate-phase13-review-engine-audit.js',
  'scripts/validate-phase14a-scheduler-adapter.js',
  'scripts/validate-release-candidate-freeze-final-decision.js',
  'scripts/validate-release-candidate-tag-publish-gate.js',
  'scripts/validate-release-package-assembly-plan.js',
  'scripts/validate-release-tag-creation-plan.js',
  // Phase 14I compatibility — exact files only
  'docs/phase14i-fsrs-two-step-rating-ui-fixture.md',
  'scripts/validate-phase14i-fsrs-two-step-fixture.js',
  'src/components/study/FsrsTwoStepScaffold.jsx',
  'src/routes/FsrsUiFixture.jsx',
  'tests/unit/fsrsTwoStepScaffold.test.jsx',
  // Phase 14J compatibility — exact files only
  'src/quiz/reviewSchedulerAdapter.js',
  'docs/phase14j-fsrs-enrollment-readiness-harness.md',
  'scripts/validate-phase14j-fsrs-enrollment-readiness.js',
  'tests/unit/fsrsEnrollmentReadinessHarness.test.js',
  // Phase 14K exact files (forward compatibility)
  'docs/phase14k-fsrs-readiness-audit.md',
  'scripts/validate-phase14k-fsrs-readiness-audit.js',
  // Phase 14L exact files (forward compatibility)
  'docs/phase14l-production-enrollment-wiring-dormant-no-ui.md',
  'scripts/validate-phase14l-production-enrollment-wiring.js',
  'tests/unit/fsrsProductionEnrollmentWiring.test.js',
  'src/state/reviewScheduleStorage.js',
  // Phase 14M exact files (forward compatibility)
  'docs/phase14m-fsrs-metadata-backup-import-export-hardening.md',
  'scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js',
  'tests/unit/fsrsMetadataBackupImportExportHardening.test.js',
  // Phase 14N exact files (forward compatibility)
  'docs/phase14n-production-studyroom-two-step-memory-rating-bridge.md',
  'scripts/validate-phase14n-production-studyroom-two-step-bridge.js',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/routes/StudyRoom.jsx',
  'tests/unit/fsrsProductionStudyRoomTwoStepBridge.test.jsx',
]);

const generatedArtifacts = [
  'node_modules',
  'dist',
  'test-results',
  'playwright-report',
  'coverage',
  'FETCH_HEAD',
  '.env',
  '.env.local',
  '.git'
];

function fail(message) {
  console.error(`Phase 14H toggle UI validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 14H toggle UI validation warning: ${message}`);
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

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[`*_()[\]{}:;,.!?"']/g, ' ')
    .replace(/[\/\\]+/g, ' ')
    .replace(/[‐-―]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function runGit(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
  } catch {
    if (!options.silent) warn(`Git command failed; changed-file scope checking may be limited: ${command}`);
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
    ...splitLines(runGit('git diff --cached --name-only', { silent: true }))
  ];
  if (includeUntracked) files.push(...splitLines(runGit('git ls-files --others --exclude-standard', { silent: true })));
  return files;
}

function changedFiles({ includeUntracked = true } = {}) {
  const prBaseFiles = changedFilesFromPullRequestBase();
  if (prBaseFiles.length > 0) return uniqueSorted(prBaseFiles);
  return uniqueSorted([
    ...changedFilesFromBranchBase(),
    ...changedFilesFromLocalFallbacks({ includeUntracked })
  ]);
}

function trackedFiles() {
  return uniqueSorted(splitLines(runGit('git ls-files', { silent: true })));
}

function requireIncludes(file, terms) {
  const text = normalize(read(file));
  for (const term of terms) {
    if (!text.includes(normalize(term))) fail(`${file} must mention: ${term}`);
  }
}

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(SETTINGS_ROUTE);
  read(FSRS_PANEL);
  read(SETTINGS_TEST);
  read(ROUTE_CONFIG);
  read(SETTINGS_STORAGE_SOURCE);
}

function phase14gRegressionGuard() {
  read(PHASE14G_DOCS);
  read(PHASE14G_VALIDATOR);
  read(PHASE14F_VALIDATOR);
  read(PHASE14F_HF1_VALIDATOR);
}

function packageGuard() {
  const pkg = readJson('package.json');
  readJson('package-lock.json');
  const dependencyVersion = pkg.dependencies?.['ts-fsrs'];
  if (dependencyVersion !== '5.3.3') {
    fail(`ts-fsrs must remain exact-pinned at 5.3.3, got ${dependencyVersion || 'none'}`);
  }
  for (const file of ['package.json', 'package-lock.json']) {
    const text = read(file);
    if (text.includes(bindingPackage)) fail(`${file} must not contain native binding dependency`);
    for (const term of internalRegistryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  for (const validator of [
    'node scripts/validate-phase14b-fsrs-wrapper.js',
    'node scripts/validate-phase14c-fsrs-persistence-harness.js',
    'node scripts/validate-phase14d-fsrs-adapter-routing.js',
    'node scripts/validate-phase14e-fsrs-user-facing-entry.js',
    'node scripts/validate-phase14f-toggle-plan.js',
    'node scripts/validate-phase14f-hf1-baseline-validation-recovery.js',
    'node scripts/validate-phase14g-settings-storage.js',
    'node scripts/validate-phase14h-fsrs-toggle-ui.js'
  ]) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }
  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (phase14hAllowedChangedFiles.has(file)) continue;
    if (file === ADAPTER_SOURCE) fail(`reviewSchedulerAdapter.js must not change in Phase 14H`);
    if (file === WRAPPER_SOURCE) fail(`fsrsWrapper.js must not change in Phase 14H`);
    if (file === STORAGE_SOURCE) fail(`reviewScheduleStorage.js must not change in Phase 14H`);
    if (file === LEGACY_BACKUP) fail(`legacy dataBackup.js must not change in Phase 14H`);
    if (file === 'package.json') fail(`package.json must not change in Phase 14H`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 14H`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 14H: ${file}`);
    if (file === STUDY_ROOM) fail(`StudyRoom.jsx must not change in Phase 14H`);
    if (file === DASHBOARD) fail(`Dashboard.jsx must not change in Phase 14H`);
    fail(`Unexpected changed file for Phase 14H scope: ${file}`);
  }
}

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

function panelSourceGuard() {
  const source = read(FSRS_PANEL);

  // Must import from settingsStorage.js
  if (!source.includes('settingsStorage')) {
    fail(`${FSRS_PANEL} must import from settingsStorage.js`);
  }
  if (!source.includes('getSettings')) {
    fail(`${FSRS_PANEL} must call getSettings`);
  }
  if (!source.includes('updateSettings')) {
    fail(`${FSRS_PANEL} must call updateSettings`);
  }

  // Required UI copy
  const requiredCopy = [
    'Enable FSRS Memory Model (Experimental)',
    'Preparation Phase Only',
    'does not migrate existing cards',
    'does not change your current due dates',
    'Study Room four-rating FSRS review UI is not available yet',
    'Status: Dormant (Awaiting future update)',
    'Disabling this pauses FSRS preparation',
    'You are enabling the scaffold for the experimental FSRS memory model',
    'Enable preparation'
  ];
  for (const copy of requiredCopy) {
    if (!source.includes(copy)) fail(`${FSRS_PANEL} must contain required copy: ${copy}`);
  }

  // Must NOT contain forbidden patterns
  if (/schedulerKind/.test(source)) fail(`${FSRS_PANEL} must not reference schedulerKind`);
  if (/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/i.test(source)) {
    fail(`${FSRS_PANEL} must not contain four-rating FSRS UI copy`);
  }
  if (/enrollmentMode|enroll\b/i.test(source) && !/enrollment.*paus/i.test(source)) {
    fail(`${FSRS_PANEL} must not contain enrollment runtime references`);
  }
  if (/reviewSchedulerAdapter/i.test(source)) {
    fail(`${FSRS_PANEL} must not import reviewSchedulerAdapter`);
  }
  if (/fsrsWrapper/i.test(source)) {
    fail(`${FSRS_PANEL} must not import fsrsWrapper`);
  }
}

function routeConfigGuard() {
  const source = read(ROUTE_CONFIG);
  if (!source.includes('/settings')) fail(`${ROUTE_CONFIG} must register /settings route`);
  if (!source.includes('Settings')) fail(`${ROUTE_CONFIG} must import Settings component`);
}

function uiEnrollmentGuard() {
  for (const file of [SETTINGS_ROUTE, FSRS_PANEL, ROUTE_CONFIG]) {
    const source = read(file);
    if (/schedulerKind/.test(source)) fail(`${file} must not assign schedulerKind`);
    if (/enableFsrsTestRoute/i.test(source)) fail(`${file} must not reference enableFsrsTestRoute`);
  }
}

function studyRoomGuard() {
  const source = read(STUDY_ROOM);
  if (/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/i.test(source)) {
    fail(`${STUDY_ROOM} must not contain four-rating FSRS rating UI`);
  }
  if (/fsrsExperimentalEnabled/.test(source)) {
    fail(`${STUDY_ROOM} must not reference fsrsExperimentalEnabled`);
  }
}

function dashboardGuard() {
  const source = read(DASHBOARD);
  if (/fsrsExperimentalEnabled/.test(source)) {
    fail(`${DASHBOARD} must not reference fsrsExperimentalEnabled`);
  }
}

function adapterGuard() {
  const adapterSource = read(ADAPTER_SOURCE);
  if (/fsrsExperimentalEnabled/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not reference fsrsExperimentalEnabled`);
  }
}

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 14H',
    'FSRS Experimental Toggle UI',
    'Preparation Phase Only',
    'does not migrate existing cards',
    'does not change',
    'current due dates',
    'Dormant',
    'Awaiting future update',
    'Study Room four-rating FSRS review UI is not available yet',
    'no enrollment runtime',
    'no production FSRS route',
    'no schedulerKind',
    'fsrsExperimentalEnabled',
    'settingsStorage',
    'Phase 14G',
    'unchanged',
    'not changed',
    'deferred'
  ]);
}

function validate() {
  requiredFilesGuard();
  phase14gRegressionGuard();
  packageGuard();
  workflowGuard();
  scopeGuard();
  generatedArtifactGuard();
  panelSourceGuard();
  routeConfigGuard();
  uiEnrollmentGuard();
  studyRoomGuard();
  dashboardGuard();
  adapterGuard();
  docsGuard();
  console.log('Phase 14H FSRS experimental toggle UI validation passed.');
}

validate();
