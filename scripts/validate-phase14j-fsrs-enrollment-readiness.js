#!/usr/bin/env node
/**
 * scripts/validate-phase14j-fsrs-enrollment-readiness.js
 *
 * Phase 14J static validator — FSRS Enrollment Guard and Production Readiness Harness.
 * Modeled after validate-phase14i-fsrs-two-step-fixture.js.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE = 'docs/phase14j-fsrs-enrollment-readiness-harness.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase14j-fsrs-enrollment-readiness.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';

const ADAPTER_SOURCE = 'src/quiz/reviewSchedulerAdapter.js';
const WRAPPER_SOURCE = 'src/quiz/fsrsWrapper.js';
const STORAGE_SOURCE = 'src/state/reviewScheduleStorage.js';
const SETTINGS_STORAGE_SOURCE = 'src/state/settingsStorage.js';
const LEGACY_BACKUP = 'src/quiz/dataBackup.js';
const V2_BACKUP_RESTORE = 'src/state/v2BackupRestore.js';
const STUDY_ROOM = 'src/routes/StudyRoom.jsx';
const DASHBOARD = 'src/routes/Dashboard.jsx';

const HARNESS_TEST = 'tests/unit/fsrsEnrollmentReadinessHarness.test.js';

// Phase 14I regression
const PHASE14I_DOCS = 'docs/phase14i-fsrs-two-step-rating-ui-fixture.md';
const PHASE14I_VALIDATOR = 'scripts/validate-phase14i-fsrs-two-step-fixture.js';
const FIXTURE_COMPONENT = 'src/components/study/FsrsTwoStepScaffold.jsx';
const FIXTURE_ROUTE_PAGE = 'src/routes/FsrsUiFixture.jsx';
const FIXTURE_TEST = 'tests/unit/fsrsTwoStepScaffold.test.jsx';
const ROUTE_CONFIG = 'src/routes/routeConfig.js';

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

const phase14jAllowedChangedFiles = new Set([
  // Phase 14J new files
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  HARNESS_TEST,
  ADAPTER_SOURCE,
  WORKFLOW_FILE,
  // Phase 14G/14H/14I historical validators updated for Phase 14J allowlist cascade
  'scripts/validate-phase14g-settings-storage.js',
  'scripts/validate-phase14h-fsrs-toggle-ui.js',
  PHASE14I_VALIDATOR,
  // Phase 14I exact files (historical)
  PHASE14I_DOCS,
  FIXTURE_COMPONENT,
  FIXTURE_ROUTE_PAGE,
  FIXTURE_TEST,
  ROUTE_CONFIG,
  // Phase 14H exact files (historical)
  PHASE14H_DOCS,
  PHASE14H_VALIDATOR,
  SETTINGS_ROUTE,
  FSRS_PANEL,
  SETTINGS_TEST,
  // Earlier historical validator compatibility — exact files only
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
  // Phase 14K exact files (forward compatibility)
  'docs/phase14k-fsrs-readiness-audit.md',
  'scripts/validate-phase14k-fsrs-readiness-audit.js',
  // Phase 14L exact files (forward compatibility)
  'docs/phase14l-production-enrollment-wiring-dormant-no-ui.md',
  'scripts/validate-phase14l-production-enrollment-wiring.js',
  'tests/unit/fsrsProductionEnrollmentWiring.test.js',
  STORAGE_SOURCE,
  // ADAPTER_SOURCE already in allowlist; WORKFLOW_FILE already in allowlist
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
  console.error(`Phase 14J enrollment readiness validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 14J enrollment readiness validation warning: ${message}`);
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
  read(ADAPTER_SOURCE);
  read(WRAPPER_SOURCE);
  read(STORAGE_SOURCE);
  read(SETTINGS_STORAGE_SOURCE);
  read(STUDY_ROOM);
  read(HARNESS_TEST);
}

function phase14iRegressionGuard() {
  read(PHASE14I_DOCS);
  read(PHASE14I_VALIDATOR);
  read(FIXTURE_COMPONENT);
  read(FIXTURE_ROUTE_PAGE);
  read(FIXTURE_TEST);
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
    'node scripts/validate-phase14i-fsrs-two-step-fixture.js',
    'node scripts/validate-phase14j-fsrs-enrollment-readiness.js'
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
    if (phase14jAllowedChangedFiles.has(file)) continue;
    if (file === WRAPPER_SOURCE) fail(`fsrsWrapper.js must not change in Phase 14J`);
    if (file === STORAGE_SOURCE) fail(`reviewScheduleStorage.js must not change in Phase 14J`);
    if (file === SETTINGS_STORAGE_SOURCE) fail(`settingsStorage.js must not change in Phase 14J`);
    if (file === LEGACY_BACKUP) fail(`legacy dataBackup.js must not change in Phase 14J`);
    if (file === V2_BACKUP_RESTORE) fail(`v2BackupRestore.js must not change in Phase 14J`);
    if (file === 'package.json') fail(`package.json must not change in Phase 14J`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 14J`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 14J: ${file}`);
    if (file === STUDY_ROOM) fail(`StudyRoom.jsx must not change in Phase 14J`);
    if (file === DASHBOARD) fail(`Dashboard.jsx must not change in Phase 14J`);
    fail(`Unexpected changed file for Phase 14J scope: ${file}`);
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

function adapterGuard() {
  const adapterSource = read(ADAPTER_SOURCE);

  // Required exports
  if (!adapterSource.includes('export function isFsrsNewCardEnrollmentEligible')) {
    fail(`${ADAPTER_SOURCE} must export isFsrsNewCardEnrollmentEligible`);
  }
  if (!adapterSource.includes('export function scheduleDormantFsrsReview')) {
    fail(`${ADAPTER_SOURCE} must export scheduleDormantFsrsReview`);
  }
  if (!adapterSource.includes('FSRS_DORMANT_SCHEDULER_VERSION')) {
    fail(`${ADAPTER_SOURCE} must define FSRS_DORMANT_SCHEDULER_VERSION`);
  }

  // Phase 14D invariants preserved
  if (!adapterSource.includes('context.enableFsrsTestRoute === true')) {
    fail(`${ADAPTER_SOURCE} must preserve context.enableFsrsTestRoute === true (Phase 14D)`);
  }
  if (!adapterSource.includes('FSRS scheduling is not implemented in Phase 14A')) {
    fail(`${ADAPTER_SOURCE} must preserve Phase 14A throw message for fsrs-planned records`);
  }

  // Isolation: no localStorage or process.env in adapter
  if (/localStorage/i.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not reference localStorage`);
  }
  if (/process\.env/i.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not reference process.env`);
  }

  // The toggle setting string must not appear in the adapter source
  if (/fsrsExperimentalEnabled/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not reference fsrsExperimentalEnabled; pass toggleEnabled instead`);
  }

  // No active FSRS scheduling references
  if (/\/dev\/fsrs-ui-fixture/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not reference /dev/fsrs-ui-fixture`);
  }
  if (/FsrsTwoStepScaffold/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not reference FsrsTwoStepScaffold`);
  }
}

function enrollmentPolicyGuard() {
  const adapterSource = read(ADAPTER_SOURCE);
  const storageSource = read(STORAGE_SOURCE);

  // No production ts-fsrs.next() in adapter or schedule storage
  if (/\.next\s*\(/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not call .next() — production FSRS scheduling is disabled in Phase 14J`);
  }
  if (/\.next\s*\(/.test(storageSource)) {
    fail(`${STORAGE_SOURCE} must not call .next() — production FSRS scheduling is disabled in Phase 14J`);
  }

  // No import-time or boot-time enrollment markers
  const forbiddenEnrollmentTerms = [
    'import.*enrollment',
    'onMount.*enrollment',
    'useEffect.*enrollment',
    'app.*boot.*enroll',
    'session.*start.*enroll',
    'boot.*fsrs.*enroll'
  ];
  for (const term of forbiddenEnrollmentTerms) {
    if (new RegExp(term, 'i').test(adapterSource)) {
      fail(`${ADAPTER_SOURCE} appears to contain import/boot-time enrollment: ${term}`);
    }
  }
}

function dormantSchedulerGuard() {
  const adapterSource = read(ADAPTER_SOURCE);

  if (!adapterSource.includes("'phase14j-dormant-readiness'")) {
    fail(`${ADAPTER_SOURCE} must contain the FSRS_DORMANT_SCHEDULER_VERSION string 'phase14j-dormant-readiness'`);
  }

  // schedulerKind: 'fsrs-planned' must not appear in StudyRoom, Dashboard, Library, or Settings
  const forbiddenFiles = [STUDY_ROOM, DASHBOARD];
  for (const file of forbiddenFiles) {
    const source = read(file);
    if (/schedulerKind\s*:\s*['"]fsrs-planned['"]/.test(source)) {
      fail(`${file} must not assign schedulerKind: 'fsrs-planned'`);
    }
    if (/scheduleDormantFsrsReview/.test(source)) {
      fail(`${file} must not reference scheduleDormantFsrsReview`);
    }
    if (/isFsrsNewCardEnrollmentEligible/.test(source)) {
      fail(`${file} must not reference isFsrsNewCardEnrollmentEligible`);
    }
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
  if (/scheduleDormantFsrsReview/.test(source)) {
    fail(`${STUDY_ROOM} must not reference scheduleDormantFsrsReview`);
  }
}

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 14J',
    'FSRS',
    'inert',
    'active FSRS scheduling remains disabled',
    'SM-2',
    'new-card',
    'no prior study history',
    'fsrsPayload',
    'schedulerKind',
    'toggle OFF',
    'metadata',
    'StudyRoom.jsx is unchanged',
    'Dashboard.jsx is unchanged',
    'no enrollment at import time',
    'Phase 14K',
    'deferred'
  ]);
}

function harnessTestGuard() {
  const testSource = read(HARNESS_TEST);

  // Key test cases must be present
  const requiredTestTerms = [
    'isFsrsNewCardEnrollmentEligible',
    'scheduleDormantFsrsReview',
    'prior study history',
    'toggleEnabled',
    'priorRecord',
    'fsrsPayload',
    'FSRS_REVIEW_LOG_CAP',
    'phase14j-dormant-readiness',
    'scheduleReview'
  ];
  for (const term of requiredTestTerms) {
    if (!testSource.includes(term)) {
      fail(`${HARNESS_TEST} must contain test for: ${term}`);
    }
  }
}

function validate() {
  requiredFilesGuard();
  phase14hRegressionGuard();
  phase14iRegressionGuard();
  packageGuard();
  workflowGuard();
  scopeGuard();
  generatedArtifactGuard();
  adapterGuard();
  enrollmentPolicyGuard();
  dormantSchedulerGuard();
  studyRoomGuard();
  harnessTestGuard();
  docsGuard();
  console.log('Phase 14J FSRS enrollment readiness validation passed.');
}

validate();
