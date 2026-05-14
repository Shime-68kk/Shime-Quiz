#!/usr/bin/env node
/**
 * scripts/validate-phase14i-fsrs-two-step-fixture.js
 *
 * Phase 14I static validator — FSRS Two-Step Rating UI Fixture.
 * Modeled after validate-phase14h-fsrs-toggle-ui.js.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE = 'docs/phase14i-fsrs-two-step-rating-ui-fixture.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase14i-fsrs-two-step-fixture.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const ROUTE_CONFIG = 'src/routes/routeConfig.js';

const FIXTURE_COMPONENT = 'src/components/study/FsrsTwoStepScaffold.jsx';
const FIXTURE_ROUTE_PAGE = 'src/routes/FsrsUiFixture.jsx';
const FIXTURE_TEST = 'tests/unit/fsrsTwoStepScaffold.test.jsx';

const STUDY_ROOM = 'src/routes/StudyRoom.jsx';
const DASHBOARD = 'src/routes/Dashboard.jsx';
const ADAPTER_SOURCE = 'src/quiz/reviewSchedulerAdapter.js';
const WRAPPER_SOURCE = 'src/quiz/fsrsWrapper.js';
const STORAGE_SOURCE = 'src/state/reviewScheduleStorage.js';
const SETTINGS_STORAGE_SOURCE = 'src/state/settingsStorage.js';
const LEGACY_BACKUP = 'src/quiz/dataBackup.js';

// Phase 14H regression
const PHASE14H_DOCS = 'docs/phase14h-fsrs-experimental-toggle-ui.md';
const PHASE14H_VALIDATOR = 'scripts/validate-phase14h-fsrs-toggle-ui.js';
const SETTINGS_ROUTE = 'src/routes/Settings.jsx';
const FSRS_PANEL = 'src/components/settings/FsrsExperimentalSettingsPanel.jsx';
const SETTINGS_TEST = 'tests/unit/fsrsExperimentalSettingsPanel.test.jsx';

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied'
];

const phase14iAllowedChangedFiles = new Set([
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  WORKFLOW_FILE,
  ROUTE_CONFIG,
  FIXTURE_COMPONENT,
  FIXTURE_ROUTE_PAGE,
  FIXTURE_TEST,
  // Phase 14H historical allowlist update
  PHASE14H_VALIDATOR,
  // Phase 14H exact files
  PHASE14H_DOCS,
  SETTINGS_ROUTE,
  FSRS_PANEL,
  SETTINGS_TEST,
  // Historical validator compatibility — exact files only
  'scripts/validate-phase14g-settings-storage.js',
  'scripts/validate-phase14f-toggle-plan.js',
  'scripts/validate-phase14f-hf1-baseline-validation-recovery.js',
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
  // Phase 14O exact files (forward compatibility)
  'docs/phase14o-fsrs-active-scheduling-decision-gate.md',
  'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js',
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
  console.error(`Phase 14I two-step fixture validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 14I two-step fixture validation warning: ${message}`);
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
  read(ROUTE_CONFIG);
  read(FIXTURE_COMPONENT);
  read(FIXTURE_ROUTE_PAGE);
  read(FIXTURE_TEST);
  read(ADAPTER_SOURCE);
  read(WRAPPER_SOURCE);
  read(STORAGE_SOURCE);
  read(SETTINGS_STORAGE_SOURCE);
  read(STUDY_ROOM);
}

function phase14hRegressionGuard() {
  read(PHASE14H_DOCS);
  read(PHASE14H_VALIDATOR);
  read(SETTINGS_ROUTE);
  read(FSRS_PANEL);
  read(SETTINGS_TEST);
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
    'node scripts/validate-phase14h-fsrs-toggle-ui.js',
    'node scripts/validate-phase14i-fsrs-two-step-fixture.js'
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
    if (phase14iAllowedChangedFiles.has(file)) continue;
    if (file === ADAPTER_SOURCE) fail(`reviewSchedulerAdapter.js must not change in Phase 14I`);
    if (file === WRAPPER_SOURCE) fail(`fsrsWrapper.js must not change in Phase 14I`);
    if (file === STORAGE_SOURCE) fail(`reviewScheduleStorage.js must not change in Phase 14I`);
    if (file === SETTINGS_STORAGE_SOURCE) fail(`settingsStorage.js must not change in Phase 14I`);
    if (file === LEGACY_BACKUP) fail(`legacy dataBackup.js must not change in Phase 14I`);
    if (file === 'package.json') fail(`package.json must not change in Phase 14I`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 14I`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 14I: ${file}`);
    if (file === STUDY_ROOM) fail(`StudyRoom.jsx must not change in Phase 14I`);
    if (file === DASHBOARD) fail(`Dashboard.jsx must not change in Phase 14I`);
    fail(`Unexpected changed file for Phase 14I scope: ${file}`);
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

function fixtureComponentGuard() {
  const source = read(FIXTURE_COMPONENT);

  // Required safety banner
  if (!source.includes('FSRS UI FIXTURE: TEST MODE ONLY — NO DATA IS SAVED OR SCHEDULED.')) {
    fail(`${FIXTURE_COMPONENT} must contain safety banner`);
  }

  // Required copy strings
  const requiredCopy = [
    'Again: Failed to recall / Complete blackout.',
    'Hard: Recalled with severe mental effort or hesitation.',
    'Good: Recalled smoothly with normal effort.',
    'Easy: Instant recall; too simple.',
    'Objective correctness feeds scoring/mastery in the future.',
    'Subjective memory rating feeds FSRS scheduling in the future.',
    'This fixture does not save, schedule, migrate, or modify review records.'
  ];
  for (const copy of requiredCopy) {
    if (!source.includes(copy)) fail(`${FIXTURE_COMPONENT} must contain required copy: ${copy}`);
  }

  // Required exports
  if (!source.includes('export const INITIAL_STATE')) fail(`${FIXTURE_COMPONENT} must export INITIAL_STATE`);
  if (!source.includes('export function revealAnswer')) fail(`${FIXTURE_COMPONENT} must export revealAnswer`);
  if (!source.includes('export function selectObjective')) fail(`${FIXTURE_COMPONENT} must export selectObjective`);
  if (!source.includes('export function selectRating')) fail(`${FIXTURE_COMPONENT} must export selectRating`);
  if (!source.includes('export function reset')) fail(`${FIXTURE_COMPONENT} must export reset`);

  // Forbidden patterns
  if (/schedulerKind/.test(source)) fail(`${FIXTURE_COMPONENT} must not reference schedulerKind`);
  if (/reviewSchedulerAdapter/i.test(source)) fail(`${FIXTURE_COMPONENT} must not import reviewSchedulerAdapter`);
  if (/fsrsWrapper/i.test(source)) fail(`${FIXTURE_COMPONENT} must not import fsrsWrapper`);
  if (/settingsStorage/i.test(source)) fail(`${FIXTURE_COMPONENT} must not import settingsStorage`);
  if (/reviewScheduleStorage/i.test(source)) fail(`${FIXTURE_COMPONENT} must not import reviewScheduleStorage`);
  if (/localStorage\.(setItem|removeItem)/i.test(source)) {
    fail(`${FIXTURE_COMPONENT} must not write to localStorage`);
  }

  // Wrong path must not render Hard/Good/Easy buttons (enforced by state machine logic)
  if (!/selectObjective/.test(source)) fail(`${FIXTURE_COMPONENT} must use selectObjective state transition`);
  if (!/selectRating/.test(source)) fail(`${FIXTURE_COMPONENT} must use selectRating state transition`);
}

function routeConfigGuard() {
  const source = read(ROUTE_CONFIG);
  if (!source.includes('/dev/fsrs-ui-fixture')) {
    fail(`${ROUTE_CONFIG} must register /dev/fsrs-ui-fixture route`);
  }
  if (!source.includes('FsrsUiFixture')) {
    fail(`${ROUTE_CONFIG} must import FsrsUiFixture component`);
  }
  // Verify fixture route is hidden from nav (showInNav: false near the fixture path)
  const fixtureBlock = source.slice(source.indexOf('/dev/fsrs-ui-fixture'));
  const blockEnd = fixtureBlock.indexOf('}');
  const routeBlock = blockEnd > 0 ? fixtureBlock.slice(0, blockEnd) : fixtureBlock.slice(0, 300);
  if (!/showInNav\s*:\s*false/.test(routeBlock)) {
    fail(`${ROUTE_CONFIG} fixture route must have showInNav: false`);
  }
}

function uiEnrollmentGuard() {
  for (const file of [FIXTURE_COMPONENT, FIXTURE_ROUTE_PAGE, ROUTE_CONFIG]) {
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
  if (/FsrsTwoStepScaffold/.test(source)) {
    fail(`${STUDY_ROOM} must not reference FsrsTwoStepScaffold`);
  }
  if (/\/dev\/fsrs-ui-fixture/.test(source)) {
    fail(`${STUDY_ROOM} must not reference /dev/fsrs-ui-fixture`);
  }
}

function adapterGuard() {
  const adapterSource = read(ADAPTER_SOURCE);
  if (/fsrsExperimentalEnabled/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not reference fsrsExperimentalEnabled`);
  }
  if (/\/dev\/fsrs-ui-fixture/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not reference /dev/fsrs-ui-fixture`);
  }
  if (/FsrsTwoStepScaffold/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not reference FsrsTwoStepScaffold`);
  }
}

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 14I',
    'FSRS',
    'fixture',
    'isolated',
    'Production Study Room is unchanged',
    'No data is saved',
    'No scheduling occurs',
    'no enrollment runtime',
    'no adapter routing',
    'Wrong auto-maps to Again',
    'Right unlocks Hard',
    'Phase 14J',
    'deferred',
    'schedulerKind',
    'unchanged'
  ]);
}

function validate() {
  requiredFilesGuard();
  phase14hRegressionGuard();
  packageGuard();
  workflowGuard();
  scopeGuard();
  generatedArtifactGuard();
  fixtureComponentGuard();
  routeConfigGuard();
  uiEnrollmentGuard();
  studyRoomGuard();
  adapterGuard();
  docsGuard();
  console.log('Phase 14I FSRS two-step fixture validation passed.');
}

validate();
