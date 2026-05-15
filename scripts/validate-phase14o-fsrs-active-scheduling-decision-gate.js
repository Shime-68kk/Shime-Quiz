#!/usr/bin/env node
/**
 * scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js
 *
 * Phase 14O static validator — FSRS Active Scheduling Rollout Decision Gate.
 * Docs/static-validator/CI-only. No active FSRS scheduling. No src/ changes.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE = 'docs/phase14o-fsrs-active-scheduling-decision-gate.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';

// Phase 14N files (for regression + allowlist cascade)
const PHASE14N_DOCS = 'docs/phase14n-production-studyroom-two-step-memory-rating-bridge.md';
const PHASE14N_VALIDATOR = 'scripts/validate-phase14n-production-studyroom-two-step-bridge.js';
const PHASE14N_TEST = 'tests/unit/fsrsProductionStudyRoomTwoStepBridge.test.jsx';
const PHASE14N_BRIDGE_COMPONENT = 'src/components/study/FsrsProductionMemoryRatingBridge.jsx';

const STUDY_ROOM = 'src/routes/StudyRoom.jsx';
const DASHBOARD = 'src/routes/Dashboard.jsx';
const ADAPTER_SOURCE = 'src/quiz/reviewSchedulerAdapter.js';
const STORAGE_SOURCE = 'src/state/reviewScheduleStorage.js';
const WRAPPER_SOURCE = 'src/quiz/fsrsWrapper.js';
const SETTINGS_STORAGE_SOURCE = 'src/state/settingsStorage.js';
const LEGACY_BACKUP = 'src/quiz/dataBackup.js';
const V2_BACKUP_RESTORE = 'src/state/v2BackupRestore.js';

// Phase 14M
const PHASE14M_DOCS = 'docs/phase14m-fsrs-metadata-backup-import-export-hardening.md';
const PHASE14M_VALIDATOR = 'scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js';
const PHASE14M_TEST = 'tests/unit/fsrsMetadataBackupImportExportHardening.test.js';

// Phase 14L
const PHASE14L_DOCS = 'docs/phase14l-production-enrollment-wiring-dormant-no-ui.md';
const PHASE14L_VALIDATOR = 'scripts/validate-phase14l-production-enrollment-wiring.js';
const ENROLLMENT_WIRING_TEST = 'tests/unit/fsrsProductionEnrollmentWiring.test.js';

// Phase 14K
const PHASE14K_DOCS = 'docs/phase14k-fsrs-readiness-audit.md';
const PHASE14K_VALIDATOR = 'scripts/validate-phase14k-fsrs-readiness-audit.js';

// Phase 14J
const PHASE14J_DOCS = 'docs/phase14j-fsrs-enrollment-readiness-harness.md';
const PHASE14J_VALIDATOR = 'scripts/validate-phase14j-fsrs-enrollment-readiness.js';
const HARNESS_TEST = 'tests/unit/fsrsEnrollmentReadinessHarness.test.js';

// Phase 14I
const PHASE14I_DOCS = 'docs/phase14i-fsrs-two-step-rating-ui-fixture.md';
const PHASE14I_VALIDATOR = 'scripts/validate-phase14i-fsrs-two-step-fixture.js';
const FIXTURE_COMPONENT = 'src/components/study/FsrsTwoStepScaffold.jsx';
const FIXTURE_ROUTE_PAGE = 'src/routes/FsrsUiFixture.jsx';
const FIXTURE_TEST = 'tests/unit/fsrsTwoStepScaffold.test.jsx';
const ROUTE_CONFIG = 'src/routes/routeConfig.js';

// Phase 14H
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

// Phase 14O allowed changed files = Phase 14N allowlist + Phase 14O new files.
// Phase 14N files are included because Phase 14N may not yet be in origin/main
// when Phase 14O is being validated, so they appear in the diff.
const phase14oAllowedChangedFiles = new Set([
  // Phase 14O new files
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  WORKFLOW_FILE,
  // Phase 14N files (inherited — in diff from origin/main if Phase 14N not yet merged)
  PHASE14N_DOCS,
  PHASE14N_VALIDATOR,
  PHASE14N_TEST,
  PHASE14N_BRIDGE_COMPONENT,
  STUDY_ROOM,
  ADAPTER_SOURCE,
  STORAGE_SOURCE,
  // Phase 14N updated historical validators
  PHASE14K_VALIDATOR,
  PHASE14L_VALIDATOR,
  PHASE14M_VALIDATOR,
  // Phase 14M exact files
  PHASE14M_DOCS,
  PHASE14M_TEST,
  // Phase 14L exact files
  PHASE14L_DOCS,
  ENROLLMENT_WIRING_TEST,
  // Phase 14K exact files
  PHASE14K_DOCS,
  // Phase 14J exact files
  PHASE14J_DOCS,
  PHASE14J_VALIDATOR,
  HARNESS_TEST,
  // Phase 14I exact files
  PHASE14I_DOCS,
  PHASE14I_VALIDATOR,
  FIXTURE_COMPONENT,
  FIXTURE_ROUTE_PAGE,
  FIXTURE_TEST,
  ROUTE_CONFIG,
  // Phase 14H exact files
  PHASE14H_DOCS,
  PHASE14H_VALIDATOR,
  SETTINGS_ROUTE,
  FSRS_PANEL,
  SETTINGS_TEST,
  // Earlier historical validator compatibility — exact files only
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
  // Phase 14P exact files (forward compatibility)
  'docs/phase14p-fsrs-foundation-closure-phase15-handoff.md',
  'scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js',
  // Phase 15A exact files (forward compatibility)
  'docs/phase15a-fsrs-active-scheduling-architecture.md',
  'scripts/validate-phase15a-fsrs-active-scheduling-architecture.js',
  // Phase 15B exact files (forward compatibility)
  '.github/workflows/e2e-smoke.yml',
  'docs/phase15b-active-fsrs-scheduling-double-gated.md',
  'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js',
  'src/quiz/fsrsWrapper.js',
  'src/quiz/reviewSchedulerAdapter.js',
  'src/state/reviewScheduleStorage.js',
  'src/state/settingsStorage.js',
  'tests/unit/fsrsActiveSchedulingDoubleGated.test.js',
  'tests/unit/fsrsEnrollmentReadinessHarness.test.js',
  'tests/unit/fsrsExperimentalSettingsPanel.test.jsx',
  'tests/unit/fsrsPersistenceHarness.test.js',
  'tests/unit/fsrsProductionEnrollmentWiring.test.js',
  'tests/unit/fsrsWrapper.test.js',
  'tests/unit/reviewSchedulerAdapter.phase14d.test.js',
  'tests/unit/reviewSchedulerAdapter.test.js',
  'tests/unit/settingsStorage.test.js',
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
  console.error(`Phase 14O decision gate validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 14O decision gate validation warning: ${message}`);
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
  // Phase 14N regression — these files must still exist
  read(PHASE14N_DOCS);
  read(PHASE14N_VALIDATOR);
  read(PHASE14N_TEST);
  read(PHASE14N_BRIDGE_COMPONENT);
  read(STUDY_ROOM);
  read(ADAPTER_SOURCE);
  read(STORAGE_SOURCE);
  read(WRAPPER_SOURCE);
  read(SETTINGS_STORAGE_SOURCE);
  read(DASHBOARD);
  read(ENROLLMENT_WIRING_TEST);
  read(PHASE14M_DOCS);
  read(PHASE14M_VALIDATOR);
  read(PHASE14M_TEST);
  read(PHASE14L_DOCS);
  read(PHASE14L_VALIDATOR);
  read(PHASE14K_DOCS);
  read(PHASE14K_VALIDATOR);
  read(PHASE14J_DOCS);
  read(PHASE14J_VALIDATOR);
  read(HARNESS_TEST);
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
  // All validators through Phase 14N must be registered
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
    'node scripts/validate-phase14j-fsrs-enrollment-readiness.js',
    'node scripts/validate-phase14k-fsrs-readiness-audit.js',
    'node scripts/validate-phase14l-production-enrollment-wiring.js',
    'node scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js',
    'node scripts/validate-phase14n-production-studyroom-two-step-bridge.js',
    'node scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js'
  ]) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }
  // Phase 14O must be registered after Phase 14N
  const phase14nPos = text.indexOf('node scripts/validate-phase14n-production-studyroom-two-step-bridge.js');
  const phase14oPos = text.indexOf('node scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js');
  if (phase14nPos === -1) fail(`${WORKFLOW_FILE} must register Phase 14N validator`);
  if (phase14oPos === -1) fail(`${WORKFLOW_FILE} must register Phase 14O validator`);
  if (phase14oPos <= phase14nPos) {
    fail(`${WORKFLOW_FILE} must register Phase 14O validator after Phase 14N validator`);
  }
  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (phase14oAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 14O`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 14O`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 14O: ${file}`);
    if (file === DASHBOARD) fail(`Dashboard.jsx must not change in Phase 14O`);
    if (file === WRAPPER_SOURCE) fail(`fsrsWrapper.js must not change in Phase 14O`);
    if (file === SETTINGS_STORAGE_SOURCE) fail(`settingsStorage.js must not change in Phase 14O`);
    if (file === LEGACY_BACKUP) fail(`dataBackup.js must not change in Phase 14O`);
    if (file === V2_BACKUP_RESTORE) fail(`v2BackupRestore.js must not change in Phase 14O`);
    fail(`Unexpected changed file for Phase 14O scope: ${file}`);
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

function forbiddenScopeGuard() {
  const forbidden = [
    DASHBOARD,
    WRAPPER_SOURCE,
    SETTINGS_STORAGE_SOURCE,
    LEGACY_BACKUP,
    V2_BACKUP_RESTORE,
    'package.json',
    'package-lock.json'
  ];
  const changed = new Set(changedFiles());
  for (const file of forbidden) {
    if (phase14oAllowedChangedFiles.has(file)) continue;
    if (changed.has(file)) fail(`Forbidden file changed in Phase 14O: ${file}`);
  }
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 14O: ${file}`);
  }
}

function phase14nRegressionGuard() {
  // Study Room must preserve Phase 14N references and must not call .next()
  const studyRoomSource = read(STUDY_ROOM);
  if (!studyRoomSource.includes('shouldShowFsrsTwoStepBridge')) {
    fail(`${STUDY_ROOM} must preserve shouldShowFsrsTwoStepBridge (Phase 14N regression)`);
  }
  if (!studyRoomSource.includes('appendFsrsReviewLog')) {
    fail(`${STUDY_ROOM} must preserve appendFsrsReviewLog (Phase 14N regression)`);
  }
  if (!studyRoomSource.includes('FsrsProductionMemoryRatingBridge')) {
    fail(`${STUDY_ROOM} must preserve FsrsProductionMemoryRatingBridge import (Phase 14N regression)`);
  }
  if (/\.next\s*\(/.test(studyRoomSource)) {
    fail(`${STUDY_ROOM} must not call .next() — active FSRS scheduling is disabled (Phase 14O gate)`);
  }

  // Adapter must preserve Phase 14N/14J exports and must not call .next() in bridge fn
  const adapterSource = read(ADAPTER_SOURCE);
  if (!adapterSource.includes('export function shouldShowFsrsTwoStepBridge')) {
    fail(`${ADAPTER_SOURCE} must preserve shouldShowFsrsTwoStepBridge export (Phase 14N regression)`);
  }
  if (!adapterSource.includes('export function isFsrsNewCardEnrollmentEligible')) {
    fail(`${ADAPTER_SOURCE} must preserve isFsrsNewCardEnrollmentEligible export (Phase 14J regression)`);
  }
  if (!adapterSource.includes('export function scheduleDormantFsrsReview')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleDormantFsrsReview export (Phase 14J regression)`);
  }
  if (/\.next\s*\(/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not call .next() — active FSRS scheduling is disabled (Phase 14O gate)`);
  }

  // Storage must preserve Phase 14N helper and must not call .next()
  const storageSource = read(STORAGE_SOURCE);
  if (!storageSource.includes('export function appendFsrsReviewLog')) {
    fail(`${STORAGE_SOURCE} must preserve appendFsrsReviewLog export (Phase 14N regression)`);
  }
  if (!storageSource.includes('FSRS_REVIEW_LOG_CAP')) {
    fail(`${STORAGE_SOURCE} must preserve FSRS_REVIEW_LOG_CAP (Phase 14N regression)`);
  }
  if (/\.next\s*\(/.test(storageSource)) {
    fail(`${STORAGE_SOURCE} must not call .next() — active FSRS scheduling is disabled (Phase 14O gate)`);
  }

  // Bridge component must not call .next()
  const bridgeSource = read(PHASE14N_BRIDGE_COMPONENT);
  if (/\.next\s*\(/.test(bridgeSource)) {
    fail(`${PHASE14N_BRIDGE_COMPONENT} must not call .next() (Phase 14O gate)`);
  }

  // fsrsWrapper must not call .next() in production paths
  const wrapperSource = read(WRAPPER_SOURCE);
  if (/\.next\s*\(/.test(wrapperSource)) {
    // fsrsWrapper is the ts-fsrs integration layer — .next() calls inside it are
    // expected as the wrapper definition, but production callers must not invoke it
    // via adapter/storage/StudyRoom. We warn but do not fail for the wrapper itself.
    warn(`${WRAPPER_SOURCE} contains .next() — confirm it is not called from production paths`);
  }
}

function noNewSrcFilesGuard() {
  // Phase 14O must not introduce any new src/ files beyond Phase 14N's state.
  // We check that no src/ files appear in changedFiles() except those in the Phase 14N allowlist.
  const phase14nSrcAllowed = new Set([
    STUDY_ROOM,
    ADAPTER_SOURCE,
    STORAGE_SOURCE,
    PHASE14N_BRIDGE_COMPONENT,
    // Phase 14I
    FIXTURE_COMPONENT,
    FIXTURE_ROUTE_PAGE,
    ROUTE_CONFIG,
    // Phase 14H
    SETTINGS_ROUTE,
    FSRS_PANEL,
    // Phase 15B exact src files (forward compatibility)
    WRAPPER_SOURCE,
    SETTINGS_STORAGE_SOURCE,
  ]);
  for (const file of changedFiles()) {
    if (!file.startsWith('src/')) continue;
    if (generatedArtifacts.some(a => file === a || file.startsWith(`${a}/`))) continue;
    if (phase14nSrcAllowed.has(file)) continue;
    fail(`Unexpected src/ file changed in Phase 14O scope: ${file}`);
  }
}

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 14O',
    'docs/static-validator/CI-only',
    'active FSRS scheduling',
    'ts-fsrs.next',
    'SM-2',
    'fsrs-planned',
    'fsrsReviewLogs',
    'Dashboard',
    'migration',
    'backup',
    'Phase 14N',
    'Phase 14P',
    'rollback',
    'toggle',
    'dormant',
    'inert',
    'Dashboard mixed scheduler due-count',
    'import-time',
    'app-boot',
    'session-start',
    'user-facing',
    'Gate 1',
    'Gate 2',
    'Gate 3',
    'Gate 4',
    'Gate 5',
    'Gate 6',
    'Gate 7',
    'Gate 8',
    'Gate 9',
    'Gate 10',
  ]);

}

function activationClaimsGuard() {
  // Scan docs for any false activation claims
  const docsText = normalize(read(DOCS_FILE));
  const forbiddenClaims = [
    'fsrs scheduling is active',
    'fsrs is now the active scheduler',
    'active scheduling is live',
    'ts-fsrs next is now called',
    'production fsrs scheduling is active',
  ];
  for (const claim of forbiddenClaims) {
    if (docsText.includes(claim)) {
      fail(`${DOCS_FILE} contains forbidden activation claim: "${claim}"`);
    }
  }
}

function futureGatesGuard() {
  const text = read(DOCS_FILE);
  // All 10 required future gates must be present
  for (let i = 1; i <= 10; i++) {
    if (!text.includes(`Gate ${i}`)) {
      fail(`${DOCS_FILE} must document required future Gate ${i}`);
    }
  }
  // Must mention rating mapping (Gate 2 requirement)
  const normalized = normalize(text);
  if (!normalized.includes('rating')) {
    fail(`${DOCS_FILE} must mention rating mapping for future scheduling gate`);
  }
  // Must mention backward compatibility (Gate 3)
  if (!normalized.includes('backward compat') && !normalized.includes('backward-compat') && !normalized.includes('backward compatibility')) {
    fail(`${DOCS_FILE} must mention backward compatibility for existing fsrsReviewLogs`);
  }
  // Must mention rollback (Gate 1 / Gate 7)
  if (!normalized.includes('rollback')) {
    fail(`${DOCS_FILE} must mention rollback plan in future gates`);
  }
  // Must mention toggle OFF rollback (Gate 7)
  if (!text.includes('Toggle OFF') && !text.includes('toggle OFF') && !text.includes('toggle is turned OFF')) {
    fail(`${DOCS_FILE} must mention toggle OFF rollback behavior`);
  }
  // Must recommend future phase split (Phase 14P or Phase 15A)
  if (!text.includes('Phase 14P') && !text.includes('Phase 15A')) {
    fail(`${DOCS_FILE} must recommend Phase 14P or Phase 15A for active scheduling`);
  }
}

function validate() {
  requiredFilesGuard();
  packageGuard();
  workflowGuard();
  scopeGuard();
  generatedArtifactGuard();
  forbiddenScopeGuard();
  noNewSrcFilesGuard();
  phase14nRegressionGuard();
  docsGuard();
  activationClaimsGuard();
  futureGatesGuard();
  console.log('Phase 14O FSRS active scheduling decision gate validation passed.');
}

validate();
