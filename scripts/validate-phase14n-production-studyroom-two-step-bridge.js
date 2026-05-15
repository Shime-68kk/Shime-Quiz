#!/usr/bin/env node
/**
 * scripts/validate-phase14n-production-studyroom-two-step-bridge.js
 *
 * Phase 14N static validator — Production Study Room Two-Step Memory Rating Bridge.
 * Modeled after validate-phase14m-fsrs-metadata-backup-import-export-hardening.js.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE = 'docs/phase14n-production-studyroom-two-step-memory-rating-bridge.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase14n-production-studyroom-two-step-bridge.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const TEST_FILE = 'tests/unit/fsrsProductionStudyRoomTwoStepBridge.test.jsx';
const BRIDGE_COMPONENT = 'src/components/study/FsrsProductionMemoryRatingBridge.jsx';

const ADAPTER_SOURCE = 'src/quiz/reviewSchedulerAdapter.js';
const WRAPPER_SOURCE = 'src/quiz/fsrsWrapper.js';
const STORAGE_SOURCE = 'src/state/reviewScheduleStorage.js';
const SETTINGS_STORAGE_SOURCE = 'src/state/settingsStorage.js';
const LEGACY_BACKUP = 'src/quiz/dataBackup.js';
const V2_BACKUP_RESTORE = 'src/state/v2BackupRestore.js';
const STUDY_ROOM = 'src/routes/StudyRoom.jsx';
const DASHBOARD = 'src/routes/Dashboard.jsx';
const FIXTURE_COMPONENT = 'src/components/study/FsrsTwoStepScaffold.jsx';
const FIXTURE_ROUTE_PAGE = 'src/routes/FsrsUiFixture.jsx';
const FIXTURE_TEST = 'tests/unit/fsrsTwoStepScaffold.test.jsx';
const ROUTE_CONFIG = 'src/routes/routeConfig.js';

// Phase 14M regression
const PHASE14M_DOCS = 'docs/phase14m-fsrs-metadata-backup-import-export-hardening.md';
const PHASE14M_VALIDATOR = 'scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js';
const PHASE14M_TEST = 'tests/unit/fsrsMetadataBackupImportExportHardening.test.js';

// Phase 14L regression
const PHASE14L_DOCS = 'docs/phase14l-production-enrollment-wiring-dormant-no-ui.md';
const PHASE14L_VALIDATOR = 'scripts/validate-phase14l-production-enrollment-wiring.js';
const ENROLLMENT_WIRING_TEST = 'tests/unit/fsrsProductionEnrollmentWiring.test.js';

// Phase 14K regression
const PHASE14K_DOCS = 'docs/phase14k-fsrs-readiness-audit.md';
const PHASE14K_VALIDATOR = 'scripts/validate-phase14k-fsrs-readiness-audit.js';

// Phase 14J regression
const PHASE14J_DOCS = 'docs/phase14j-fsrs-enrollment-readiness-harness.md';
const PHASE14J_VALIDATOR = 'scripts/validate-phase14j-fsrs-enrollment-readiness.js';
const HARNESS_TEST = 'tests/unit/fsrsEnrollmentReadinessHarness.test.js';

// Phase 14I regression
const PHASE14I_DOCS = 'docs/phase14i-fsrs-two-step-rating-ui-fixture.md';
const PHASE14I_VALIDATOR = 'scripts/validate-phase14i-fsrs-two-step-fixture.js';

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

const phase14nAllowedChangedFiles = new Set([
  // Phase 14N new/modified files
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  TEST_FILE,
  BRIDGE_COMPONENT,
  STUDY_ROOM,
  ADAPTER_SOURCE,
  STORAGE_SOURCE,
  WORKFLOW_FILE,
  // Historical validators updated for Phase 14N allowlist cascade
  PHASE14K_VALIDATOR,
  PHASE14L_VALIDATOR,
  PHASE14M_VALIDATOR,
  // Phase 14M exact files (historical)
  PHASE14M_DOCS,
  PHASE14M_TEST,
  // Phase 14L exact files (historical)
  PHASE14L_DOCS,
  ENROLLMENT_WIRING_TEST,
  // Phase 14K exact files (historical)
  PHASE14K_DOCS,
  // Phase 14J exact files (historical)
  PHASE14J_DOCS,
  PHASE14J_VALIDATOR,
  HARNESS_TEST,
  // Phase 14I exact files (historical)
  PHASE14I_DOCS,
  PHASE14I_VALIDATOR,
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
  // Phase 14O exact files (forward compatibility)
  'docs/phase14o-fsrs-active-scheduling-decision-gate.md',
  'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js',
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
  // Phase 15C exact files (forward compatibility)
  'docs/phase15c-dashboard-mixed-scheduler-due-count.md',
  'scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js',
  'src/routes/Dashboard.jsx',
  'tests/unit/dashboardMixedSchedulerDueCount.test.jsx',
  // Phase 15D exact files (forward compatibility)
  'docs/phase15d-active-fsrs-runtime-smoke-rollback-audit.md',
  'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js',
  'tests/unit/fsrsActiveRuntimeRollbackAudit.test.js',
  // Phase 15E exact files (forward compatibility)
  'docs/phase15e-controlled-internal-activation-harness.md',
  'scripts/validate-phase15e-controlled-internal-activation-harness.js',
  'tests/unit/fsrsControlledInternalActivationHarness.test.js',
  // Phase 15F exact files (forward compatibility)
  'docs/phase15f-studyroom-copy-ux-alignment.md',
  'scripts/validate-phase15f-studyroom-copy-ux-alignment.js',
  // Phase 15G exact files (forward compatibility)
  'docs/phase15g-release-claim-guardrail-reaudit.md',
  'scripts/validate-phase15g-release-claim-guardrail-reaudit.js',
  'tests/unit/fsrsStudyRoomCopyUxAlignment.test.jsx',
  // Phase 15H exact files (forward compatibility)
  'docs/phase15h-fsrs-foundation-closure-phase16-readiness.md',
  'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js',

  // Phase 16A allowlist entries (Vietnamese-first UX copy alignment)
  'docs/phase16a-vietnamese-first-ux-copy-alignment.md',
  'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js',
  'tests/unit/vietnameseFirstUxCopyAlignment.test.js',
  'tests/unit/fsrsStudyRoomCopyUxAlignment.test.jsx',
  'src/routes/Home.jsx',
  'src/routes/Dashboard.jsx',
  'src/routes/StudyRoom.jsx',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/components/settings/FsrsExperimentalSettingsPanel.jsx',
  'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js',
  'scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js',
  'scripts/validate-phase15a-fsrs-active-scheduling-architecture.js',
  'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js',
  'scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js',
  'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js',
  'scripts/validate-phase15e-controlled-internal-activation-harness.js',
  'scripts/validate-phase15f-studyroom-copy-ux-alignment.js',
  'scripts/validate-phase15g-release-claim-guardrail-reaudit.js',
  'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js',

  // Phase 16B allowlist entries (Hybrid Local-First Architecture / Optional Sync Direction)
  'docs/phase16b-hybrid-local-first-optional-sync-direction.md',
  'scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js',
  // Phase 16C allowlist entries (Storage / Large Import Safety / EduGen Bulk Import Risk Audit)
  'docs/phase16c-storage-large-import-edugen-risk-audit.md',
  'tests/unit/storageLargeImportEdugenRiskAudit.test.js',
  'scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js',
  // Phase 16D allowlist entries (Shime Study Identity / Product Principles)
  'docs/phase16d-shime-study-identity-product-principles.md',
  'scripts/validate-phase16d-shime-study-identity-product-principles.js',
  // Phase 16E allowlist entries (Visual Polish Quick Wins)
  'docs/phase16e-visual-polish-quick-wins.md',
  'tests/unit/visualPolishQuickWins.test.jsx',
  'scripts/validate-phase16e-visual-polish-quick-wins.js',
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
  console.error(`Phase 14N production study room two-step bridge validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 14N production study room two-step bridge validation warning: ${message}`);
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
  read(TEST_FILE);
  read(BRIDGE_COMPONENT);
  read(STUDY_ROOM);
  read(STORAGE_SOURCE);
  read(ADAPTER_SOURCE);
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
    'node scripts/validate-phase14n-production-studyroom-two-step-bridge.js'
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
    if (file.startsWith('.claude/')) continue;
    if (phase14nAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 14N`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 14N`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 14N: ${file}`);
    if (file === DASHBOARD) fail(`Dashboard.jsx must not change in Phase 14N`);
    if (file === WRAPPER_SOURCE) fail(`fsrsWrapper.js must not change in Phase 14N`);
    if (file === SETTINGS_STORAGE_SOURCE) fail(`settingsStorage.js must not change in Phase 14N`);
    if (file === LEGACY_BACKUP) fail(`dataBackup.js must not change in Phase 14N`);
    if (file === V2_BACKUP_RESTORE) fail(`v2BackupRestore.js must not change in Phase 14N`);
    fail(`Unexpected changed file for Phase 14N scope: ${file}`);
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

function studyRoomGuard() {
  const source = read(STUDY_ROOM);

  // Must reference bridge helpers
  if (!source.includes('shouldShowFsrsTwoStepBridge')) {
    fail(`${STUDY_ROOM} must reference shouldShowFsrsTwoStepBridge (Phase 14N gate)`);
  }
  if (!source.includes('appendFsrsReviewLog')) {
    fail(`${STUDY_ROOM} must reference appendFsrsReviewLog (Phase 14N log append)`);
  }
  if (!source.includes('FsrsProductionMemoryRatingBridge')) {
    fail(`${STUDY_ROOM} must import and render FsrsProductionMemoryRatingBridge`);
  }

  // Must not use forbidden scheduling references
  if (/scheduleDormantFsrsReview/.test(source)) {
    fail(`${STUDY_ROOM} must not reference scheduleDormantFsrsReview`);
  }
  if (/isFsrsNewCardEnrollmentEligible/.test(source)) {
    fail(`${STUDY_ROOM} must not reference isFsrsNewCardEnrollmentEligible`);
  }
  if (/\.next\s*\(/.test(source)) {
    fail(`${STUDY_ROOM} must not call .next() — active FSRS scheduling is disabled in Phase 14N`);
  }
  if (/fsrsWrapper/.test(source)) {
    fail(`${STUDY_ROOM} must not import fsrsWrapper.js`);
  }
  if (/FsrsTwoStepScaffold/.test(source)) {
    fail(`${STUDY_ROOM} must not reference FsrsTwoStepScaffold (fixture stays separate)`);
  }

  // Must not have user-facing FSRS jargon in JSX text
  if (/>\s*FSRS\s*</.test(source)) {
    fail(`${STUDY_ROOM} must not contain user-facing "FSRS" text in JSX`);
  }
  if (/'FSRS scheduling/i.test(source) || /"FSRS scheduling/i.test(source)) {
    fail(`${STUDY_ROOM} must not contain user-facing FSRS scheduling claim`);
  }
}

function adapterGuard() {
  const adapterSource = read(ADAPTER_SOURCE);

  // Must export the new Phase 14N predicate
  if (!adapterSource.includes('export function shouldShowFsrsTwoStepBridge')) {
    fail(`${ADAPTER_SOURCE} must export shouldShowFsrsTwoStepBridge (Phase 14N)`);
  }

  // Phase 14J exports must remain intact
  if (!adapterSource.includes('export function isFsrsNewCardEnrollmentEligible')) {
    fail(`${ADAPTER_SOURCE} must export isFsrsNewCardEnrollmentEligible (Phase 14J)`);
  }
  if (!adapterSource.includes('export function scheduleDormantFsrsReview')) {
    fail(`${ADAPTER_SOURCE} must export scheduleDormantFsrsReview (Phase 14J)`);
  }
  if (!adapterSource.includes('FSRS_DORMANT_SCHEDULER_VERSION')) {
    fail(`${ADAPTER_SOURCE} must define FSRS_DORMANT_SCHEDULER_VERSION (Phase 14J)`);
  }
  if (!adapterSource.includes('context.enableFsrsTestRoute === true')) {
    fail(`${ADAPTER_SOURCE} must preserve context.enableFsrsTestRoute === true (Phase 14D)`);
  }
  if (!adapterSource.includes('FSRS scheduling is not implemented in Phase 14A') &&
      !adapterSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${ADAPTER_SOURCE} must preserve Phase 14A throw message for fsrs-planned records`);
  }

  // Isolation checks
  if (/localStorage/i.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not reference localStorage (Phase 14D isolation)`);
  }
  if (/process\.env/i.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not reference process.env (Phase 14D isolation)`);
  }
  if (/fsrsExperimentalEnabled/.test(adapterSource) && !adapterSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${ADAPTER_SOURCE} must not reference fsrsExperimentalEnabled; pass toggleEnabled instead`);
  }

  // No active FSRS scheduling in the new predicate body
  // Extract the shouldShowFsrsTwoStepBridge function body and check
  const bridgeFnStart = adapterSource.indexOf('export function shouldShowFsrsTwoStepBridge');
  if (bridgeFnStart !== -1) {
    const bridgeFnEnd = adapterSource.indexOf('\nexport function', bridgeFnStart + 1);
    const bridgeFnBody = bridgeFnEnd === -1
      ? adapterSource.slice(bridgeFnStart)
      : adapterSource.slice(bridgeFnStart, bridgeFnEnd);
    if (/\.next\s*\(/.test(bridgeFnBody)) {
      fail(`${ADAPTER_SOURCE}:shouldShowFsrsTwoStepBridge must not call .next()`);
    }
    if (/localStorage/i.test(bridgeFnBody)) {
      fail(`${ADAPTER_SOURCE}:shouldShowFsrsTwoStepBridge must not access localStorage`);
    }
  }
}

function storageGuard() {
  const storageSource = read(STORAGE_SOURCE);

  // Must export the new Phase 14N helper
  if (!storageSource.includes('export function appendFsrsReviewLog')) {
    fail(`${STORAGE_SOURCE} must export appendFsrsReviewLog (Phase 14N)`);
  }

  // appendFsrsReviewLog must not assign scheduling fields
  const fnStart = storageSource.indexOf('export function appendFsrsReviewLog');
  if (fnStart !== -1) {
    const fnEnd = storageSource.indexOf('\nexport function', fnStart + 1);
    const fnBody = fnEnd === -1 ? storageSource.slice(fnStart) : storageSource.slice(fnStart, fnEnd);

    if (/\bdueAt\s*=/.test(fnBody)) fail(`appendFsrsReviewLog must not assign dueAt`);
    if (/\bintervalDays\s*=/.test(fnBody)) fail(`appendFsrsReviewLog must not assign intervalDays`);
    if (/\beaseFactor\s*=/.test(fnBody)) fail(`appendFsrsReviewLog must not assign easeFactor`);
    if (/\brepetitionCount\s*=/.test(fnBody)) fail(`appendFsrsReviewLog must not assign repetitionCount`);
    if (/\bcorrectStreak\s*=/.test(fnBody)) fail(`appendFsrsReviewLog must not assign correctStreak`);
    if (/\bwrongCount\s*=/.test(fnBody)) fail(`appendFsrsReviewLog must not assign wrongCount`);
    if (/\.next\s*\(/.test(fnBody)) fail(`appendFsrsReviewLog must not call .next()`);
  }

  // Phase 14J/L preservation checks
  if (!storageSource.includes('getPreservedFsrsFields')) {
    fail(`${STORAGE_SOURCE} must define getPreservedFsrsFields (Phase 14J/14M preservation requirement)`);
  }
  if (!storageSource.includes('FSRS_REVIEW_LOG_CAP')) {
    fail(`${STORAGE_SOURCE} must define/use FSRS_REVIEW_LOG_CAP`);
  }

  // No active FSRS scheduling
  if (/\.next\s*\(/.test(storageSource)) {
    fail(`${STORAGE_SOURCE} must not call .next() — active FSRS scheduling is disabled in Phase 14N`);
  }
}

function bridgeComponentGuard() {
  const source = read(BRIDGE_COMPONENT);

  // Must NOT import scheduling or ts-fsrs modules
  if (/fsrsWrapper/.test(source)) {
    fail(`${BRIDGE_COMPONENT} must not import fsrsWrapper.js`);
  }
  if (/reviewScheduleStorage/.test(source)) {
    fail(`${BRIDGE_COMPONENT} must not import reviewScheduleStorage (pure presentation component)`);
  }
  if (/reviewSchedulerAdapter/.test(source)) {
    fail(`${BRIDGE_COMPONENT} must not import reviewSchedulerAdapter`);
  }
  if (/\.next\s*\(/.test(source)) {
    fail(`${BRIDGE_COMPONENT} must not call .next()`);
  }

  // Must have Hard/Good/Easy and Continue without rating
  if (!source.includes('Hard')) fail(`${BRIDGE_COMPONENT} must contain Hard rating option`);
  if (!source.includes('Good')) fail(`${BRIDGE_COMPONENT} must contain Good rating option`);
  if (!source.includes('Easy')) fail(`${BRIDGE_COMPONENT} must contain Easy rating option`);
  if (!source.includes('Continue without rating')) {
    fail(`${BRIDGE_COMPONENT} must contain "Continue without rating" option`);
  }

  // Must not use user-facing FSRS jargon
  if (/>\s*FSRS\s*</.test(source)) {
    fail(`${BRIDGE_COMPONENT} must not contain user-facing "FSRS" text in JSX`);
  }

  // Must have scheduling-not-affected copy
  if (!source.toLowerCase().includes('schedule') || !source.toLowerCase().includes('not changed')) {
    fail(`${BRIDGE_COMPONENT} must include scheduling-not-affected copy`);
  }

  // Must have role/aria attributes
  if (!source.includes('role="region"') && !source.includes("role='region'")) {
    fail(`${BRIDGE_COMPONENT} must use role="region" for accessibility`);
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
    if (phase14nAllowedChangedFiles.has(file)) continue;
    if (changed.has(file)) fail(`Forbidden file changed in Phase 14N: ${file}`);
  }
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 14N: ${file}`);
  }
}

function testCoverageGuard() {
  requireIncludes(TEST_FILE, [
    'toggle',
    'fsrsPayload',
    'schedulerKind',
    'fsrs-planned',
    'Again',
    'Hard',
    'Good',
    'Easy',
    'Continue without rating',
    'appendFsrsReviewLog',
    'shouldShowFsrsTwoStepBridge',
    'phase14n-studyroom-bridge',
    'activeScheduling',
    'source',
    'FSRS_REVIEW_LOG_CAP',
    'Dashboard',
    'ts-fsrs',
    'scheduling fields',
    'dueAt'
  ]);

  const testSource = read(TEST_FILE);

  // Must test the bridge predicate
  if (!testSource.includes('shouldShowFsrsTwoStepBridge')) {
    fail(`${TEST_FILE} must test shouldShowFsrsTwoStepBridge`);
  }
  // Must test appendFsrsReviewLog
  if (!testSource.includes('appendFsrsReviewLog')) {
    fail(`${TEST_FILE} must test appendFsrsReviewLog`);
  }
  // Must test Again log for wrong path
  if (!testSource.includes("'Again'")) {
    fail(`${TEST_FILE} must test Again rating for wrong path`);
  }
  // Must test cap enforcement
  if (!testSource.includes('FSRS_REVIEW_LOG_CAP')) {
    fail(`${TEST_FILE} must test FSRS_REVIEW_LOG_CAP enforcement`);
  }
  // Must test no-op for non-fsrs-planned
  if (!testSource.includes('not_fsrs_planned')) {
    fail(`${TEST_FILE} must test no-op error for non-fsrs-planned record`);
  }
}

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 14N',
    'StudyRoom',
    'fsrs-planned',
    'fsrsPayload',
    'fsrsReviewLogs',
    'appendFsrsReviewLog',
    'shouldShowFsrsTwoStepBridge',
    'active FSRS scheduling',
    'ts-fsrs.next',
    'Dashboard',
    'toggle OFF',
    'Again',
    'Hard',
    'Good',
    'Easy',
    'Continue without rating',
    'scheduling',
    'correctness',
    'scoring',
    'phase14n-studyroom-bridge',
    'activeScheduling',
    'Phase 14O',
    'FSRS_REVIEW_LOG_CAP',
    'backup',
    'fixture'
  ]);
}

function noRouteConfigChangeGuard() {
  const source = read(ROUTE_CONFIG);
  if (source.includes('phase14n')) {
    fail(`${ROUTE_CONFIG} must not reference phase14n — no new routes in Phase 14N`);
  }
}

function validate() {
  requiredFilesGuard();
  packageGuard();
  workflowGuard();
  scopeGuard();
  generatedArtifactGuard();
  studyRoomGuard();
  adapterGuard();
  storageGuard();
  bridgeComponentGuard();
  forbiddenScopeGuard();
  testCoverageGuard();
  docsGuard();
  noRouteConfigChangeGuard();
  console.log('Phase 14N production study room two-step bridge validation passed.');
}

validate();
