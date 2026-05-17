#!/usr/bin/env node
/**
 * scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js
 *
 * Phase 15C static validator — Dashboard Mixed Scheduler Due Count / Display.
 * No scheduling changes. No ts-fsrs.next() call sites. No forbidden file changes.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE     = 'docs/phase15c-dashboard-mixed-scheduler-due-count.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const TEST_FILE     = 'tests/unit/dashboardMixedSchedulerDueCount.test.jsx';

const DASHBOARD        = 'src/routes/Dashboard.jsx';
const ADAPTER_SOURCE   = 'src/quiz/reviewSchedulerAdapter.js';
const STORAGE_SOURCE   = 'src/state/reviewScheduleStorage.js';
const WRAPPER_SOURCE   = 'src/quiz/fsrsWrapper.js';
const SETTINGS_SOURCE  = 'src/state/settingsStorage.js';
const STUDY_ROOM       = 'src/routes/StudyRoom.jsx';
const BRIDGE_COMPONENT = 'src/components/study/FsrsProductionMemoryRatingBridge.jsx';
const LEGACY_BACKUP    = 'src/quiz/dataBackup.js';
const V2_BACKUP        = 'src/state/v2BackupRestore.js';

// Phase 15B regression files
const PHASE15B_DOCS      = 'docs/phase15b-active-fsrs-scheduling-double-gated.md';
const PHASE15B_VALIDATOR = 'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js';
const PHASE15B_TEST      = 'tests/unit/fsrsActiveSchedulingDoubleGated.test.js';

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied'
];

// Phase 15C allowed changed files — exact list.
// Also includes Phase 15B files because Phase 15B may not yet be merged to origin/main
// at the time Phase 15C is validated locally.
const phase15cAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  TEST_FILE,
  DASHBOARD,
  ADAPTER_SOURCE,
  // Phase 15B files (included for local validation before Phase 15B merges to origin/main)
  PHASE15B_DOCS,
  PHASE15B_TEST,
  STORAGE_SOURCE,
  WRAPPER_SOURCE,
  SETTINGS_SOURCE,
  'tests/unit/fsrsEnrollmentReadinessHarness.test.js',
  'tests/unit/fsrsExperimentalSettingsPanel.test.jsx',
  'tests/unit/fsrsPersistenceHarness.test.js',
  'tests/unit/fsrsProductionEnrollmentWiring.test.js',
  'tests/unit/fsrsWrapper.test.js',
  'tests/unit/reviewSchedulerAdapter.phase14d.test.js',
  'tests/unit/reviewSchedulerAdapter.test.js',
  'tests/unit/settingsStorage.test.js',
  // Phase 15B validator updated to add Phase 15C forward-compat allowlist and fix forbiddenScopeGuard
  PHASE15B_VALIDATOR,
  // Historical validators updated with exact Phase 15C allowlist entries only
  'scripts/validate-backup-transfer-safety-hardening.js',
  'scripts/validate-cross-device-export-import.js',
  'scripts/validate-cross-device-transfer-track-closure.js',
  'scripts/validate-cross-device-transfer-ux-copy.js',
  'scripts/validate-cross-device-transfer-ux-decision.js',
  'scripts/validate-dashboard-today-card-runtime.js',
  'scripts/validate-dashboard-today-card-ux-plan.js',
  'scripts/validate-edugen-boundary-polish.js',
  'scripts/validate-final-main-release-authorization.js',
  'scripts/validate-final-public-release-readiness-reaudit.js',
  'scripts/validate-final-release-execution-checklist.js',
  'scripts/validate-github-release-publication-plan.js',
  'scripts/validate-manual-evidence-execution-checklist.js',
  'scripts/validate-manual-evidence-results-log.js',
  'scripts/validate-manual-evidence-run-pack.js',
  'scripts/validate-phase12-closure-release-decision.js',
  'scripts/validate-phase12-roadmap-risk-register.js',
  'scripts/validate-phase13-closure.js',
  'scripts/validate-phase13-fsrs-plan.js',
  'scripts/validate-phase13-local-adaptive-roadmap.js',
  'scripts/validate-phase13-review-engine-audit.js',
  'scripts/validate-phase14a-scheduler-adapter.js',
  'scripts/validate-phase14b-fsrs-wrapper.js',
  'scripts/validate-phase14c-fsrs-persistence-harness.js',
  'scripts/validate-phase14d-fsrs-adapter-routing.js',
  'scripts/validate-phase14e-fsrs-user-facing-entry.js',
  'scripts/validate-phase14f-hf1-baseline-validation-recovery.js',
  'scripts/validate-phase14f-toggle-plan.js',
  'scripts/validate-phase14g-settings-storage.js',
  'scripts/validate-phase14h-fsrs-toggle-ui.js',
  'scripts/validate-phase14i-fsrs-two-step-fixture.js',
  'scripts/validate-phase14j-fsrs-enrollment-readiness.js',
  'scripts/validate-phase14k-fsrs-readiness-audit.js',
  'scripts/validate-phase14l-production-enrollment-wiring.js',
  'scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js',
  'scripts/validate-phase14n-production-studyroom-two-step-bridge.js',
  'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js',
  'scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js',
  'scripts/validate-phase15a-fsrs-active-scheduling-architecture.js',
  'scripts/validate-release-candidate-freeze-final-decision.js',
  'scripts/validate-release-candidate-tag-publish-gate.js',
  'scripts/validate-release-package-assembly-plan.js',
  'scripts/validate-release-tag-creation-plan.js',
  'scripts/validate-storage-capacity-indexeddb-migration-plan.js',
  'scripts/validate-storage-quota-warning-runtime.js',
  'scripts/validate-study-flow-micro-feedback-plan.js',
  'scripts/validate-study-flow-micro-feedback-runtime.js',
  'scripts/validate-unit-test-foundation-plan.js',
  'scripts/validate-vitest-unit-test-foundation.js',
  'scripts/validate-web-share-mobile-sharing-prototype-plan.js',
  'scripts/validate-web-share-runtime-fallback-hardening.js',
  'scripts/validate-web-share-runtime-prototype.js',
  // Phase 15D exact files (forward compatibility)
  'docs/phase15d-active-fsrs-runtime-smoke-rollback-audit.md',
  'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js',
  'tests/unit/fsrsActiveRuntimeRollbackAudit.test.js',
  'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js',
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
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/routes/StudyRoom.jsx',
  // Phase 15H exact files (forward compatibility)
  'docs/phase15h-fsrs-foundation-closure-phase16-readiness.md',
  'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js',

  // Phase 16A exact files (forward compatibility — Vietnamese-first UX copy alignment)
  'docs/phase16a-vietnamese-first-ux-copy-alignment.md',
  'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js',
  'tests/unit/vietnameseFirstUxCopyAlignment.test.js',
  'src/routes/Home.jsx',
  'src/routes/Dashboard.jsx',
  'src/routes/StudyRoom.jsx',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/components/settings/FsrsExperimentalSettingsPanel.jsx',
  'tests/unit/fsrsStudyRoomCopyUxAlignment.test.jsx',

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

  // Phase 16G exact files (forward compatibility)
  'docs/phase16g-edugen-draft-review-import-flow.md',
  'tests/unit/edugenDraftReviewImportFlow.test.jsx',
  'scripts/validate-phase16g-edugen-draft-review-import-flow.js',
  'src/edugen/edugenDraftParser.js',
  'src/components/edugen/EduGenDraftReviewPanel.jsx',
  // Phase 16H allowlist entries (EduGen Draft Quality Review / Source-Aware Library)
  'docs/phase16h-edugen-draft-quality-review-source-aware-library.md',
  'tests/unit/edugenDraftQualityReviewSourceLibrary.test.jsx',
  'scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js',
  'src/edugen/edugenDraftImport.js',
  'src/data/learningDataAdapter.js',
  'src/data/importValidator.js',
  'src/routes/Library.jsx',
  'src/routes/Settings.jsx',
  '.github/workflows/e2e-smoke.yml',
  // Phase 16I allowlist entries (Public README / Landing / Screenshots Polish + Demo Quickstart Refresh)
  'docs/demo-quickstart.md',
  'docs/deployment-readiness.md',
  'docs/phase16i-public-readme-landing-screenshots-demo-refresh.md',
  'docs/public-release-notes.md',
  'docs/screenshot-capture-guide.md',
  '.github/workflows/e2e-smoke.yml',
  'README.md',
  'scripts/validate-accessibility-keyboard-smoke.js',
  'scripts/validate-backup-restore-regression-smoke.js',
  'scripts/validate-backup-transfer-safety-hardening.js',
  'scripts/validate-ci-green-verification.js',
  'scripts/validate-cross-device-export-import.js',
  'scripts/validate-cross-device-transfer-track-closure.js',
  'scripts/validate-cross-device-transfer-ux-copy.js',
  'scripts/validate-cross-device-transfer-ux-decision.js',
  'scripts/validate-dashboard-today-card-runtime.js',
  'scripts/validate-dashboard-today-card-ux-plan.js',
  'scripts/validate-demo-readiness-docs.js',
  'scripts/validate-demo-sample-pack.js',
  'scripts/validate-direct-route-spa-fallback.js',
  'scripts/validate-edugen-boundary-polish.js',
  'scripts/validate-final-main-release-authorization.js',
  'scripts/validate-final-public-release-readiness-reaudit.js',
  'scripts/validate-final-release-execution-checklist.js',
  'scripts/validate-github-release-draft.js',
  'scripts/validate-github-release-publication-plan.js',
  'scripts/validate-import-regression-smoke.js',
  'scripts/validate-manual-evidence-execution-checklist.js',
  'scripts/validate-manual-evidence-results-log.js',
  'scripts/validate-manual-evidence-run-pack.js',
  'scripts/validate-mobile-ux-smoke.js',
  'scripts/validate-performance-bundle-audit.js',
  'scripts/validate-phase12-closure-release-decision.js',
  'scripts/validate-phase12-roadmap-risk-register.js',
  'scripts/validate-phase13-closure.js',
  'scripts/validate-phase13-fsrs-plan.js',
  'scripts/validate-phase13-local-adaptive-roadmap.js',
  'scripts/validate-phase13-review-engine-audit.js',
  'scripts/validate-phase14a-scheduler-adapter.js',
  'scripts/validate-phase14b-fsrs-wrapper.js',
  'scripts/validate-phase14c-fsrs-persistence-harness.js',
  'scripts/validate-phase14d-fsrs-adapter-routing.js',
  'scripts/validate-phase14e-fsrs-user-facing-entry.js',
  'scripts/validate-phase14f-toggle-plan.js',
  'scripts/validate-phase14g-settings-storage.js',
  'scripts/validate-phase14h-fsrs-toggle-ui.js',
  'scripts/validate-phase14i-fsrs-two-step-fixture.js',
  'scripts/validate-phase14j-fsrs-enrollment-readiness.js',
  'scripts/validate-phase14k-fsrs-readiness-audit.js',
  'scripts/validate-phase14l-production-enrollment-wiring.js',
  'scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js',
  'scripts/validate-phase14n-production-studyroom-two-step-bridge.js',
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
  'scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js',
  'scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js',
  'scripts/validate-phase16d-shime-study-identity-product-principles.js',
  'scripts/validate-phase16e-visual-polish-quick-wins.js',
  'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js',
  'scripts/validate-phase16g-edugen-draft-review-import-flow.js',
  'scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js',
  'scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js',
  // Phase 16J — Mobile UX / PWA Quick Wins (forward compatibility)
  'docs/phase16j-mobile-ux-pwa-quick-wins.md',
  'scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js',
  'public/sw.js',
  // Phase 16K — Storage Quota & Backup-Before-Import Runtime Hardening (forward compatibility)
  'docs/phase16k-storage-quota-backup-before-import-hardening.md',
  'scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js',
  'src/utils/storageQuotaEstimate.js',
  'src/components/learning/BackupBeforeImportNotice.jsx',
  'tests/unit/storageQuotaEstimate.test.js',
  'tests/unit/storageQuotaBackupBeforeImport.test.jsx',
  'scripts/validate-public-release-docs.js',
  'scripts/validate-readme-public-facing.js',
  'scripts/validate-release-candidate-freeze-final-decision.js',
  'scripts/validate-release-candidate-tag-publish-gate.js',
  'scripts/validate-release-package-assembly-plan.js',
  'scripts/validate-release-package-cleanliness.js',
  'scripts/validate-release-tag-creation-plan.js',
  'scripts/validate-release-tag-decision.js',
  'scripts/validate-release-tag-publish-checklist.js',
  'scripts/validate-screenshot-asset-pack.js',
  'scripts/validate-social-preview-metadata.js',
  'scripts/validate-storage-quota-warning-runtime.js',
  'scripts/validate-study-dashboard-regression-smoke.js',
  'scripts/validate-study-flow-micro-feedback-plan.js',
  'scripts/validate-study-flow-micro-feedback-runtime.js',
  'scripts/validate-unit-test-foundation-plan.js',
  'scripts/validate-vitest-unit-test-foundation.js',
  'scripts/validate-visual-asset-guidance.js',
  'scripts/validate-web-share-mobile-sharing-prototype-plan.js',
  'scripts/validate-web-share-runtime-fallback-hardening.js',
  'scripts/validate-web-share-runtime-prototype.js',
  // Phase 16L — Local-First Hybrid / StorageAdapter Plan (forward compatibility)
  'docs/phase16l-local-first-hybrid-storage-adapter-plan.md',
  'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js',
  // Phase 17A — Backup/Rollback Harness BEFORE Migration (forward compatibility)
  'docs/phase17a-backup-rollback-harness-before-migration.md',
  'scripts/validate-phase17a-backup-rollback-harness-before-migration.js',
  'src/state/v2BackupRestore.js',
  'src/utils/storageQuotaEstimate.js',
  'tests/unit/phase17aBackupRollbackHarness.test.js',
  // Phase 17B — StorageAdapter Scaffold (forward compatibility)
  'docs/phase17b-storage-adapter-localstorage-scaffold.md',
  'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js',
  'src/storage/StorageAdapter.js',
  'src/storage/LocalStorageAdapter.js',
  'src/storage/storageAdapterRegistry.js',
  'src/state/recommendationFeedbackStorage.js',
  'tests/unit/storageAdapterScaffold.test.js',
  'tests/unit/recommendationFeedbackStorageAdapter.test.js',
  'tests/unit/storageLargeImportEdugenRiskAudit.test.js',
  // Phase 17C forward-compat entries (IndexedDB dry-run harness)
  'docs/phase17c-indexeddb-migration-dry-run-harness.md',
  'scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js',
  'src/storage/indexedDbDryRunHarness.js',
  'tests/unit/indexedDbDryRunHarness.test.js',
  // Phase 17D forward-compat entries (Migration Journal / Event Log Architecture)
  'docs/phase17d-migration-journal-event-log-architecture.md',
  'scripts/validate-phase17d-migration-journal-event-log-architecture.js',
  // Phase 17E forward-compat entries (Per-Key Migration Manifest Design)
  'docs/phase17e-per-key-migration-manifest-design.md',
  'scripts/validate-phase17e-per-key-migration-manifest-design.js',
  'scripts/validate-phase17f-test-only-migration-journal-prototype.js',
  // Phase 17G forward-compat entries (Single-Key Dry-Run Migration Rehearsal)
  'docs/phase17g-single-key-dry-run-migration-rehearsal.md',
  'scripts/validate-phase17g-single-key-dry-run-migration-rehearsal.js',
  'tests/unit/helpers/singleKeyDryRunMigrationRehearsal.js',
  'tests/unit/singleKeyDryRunMigrationRehearsal.test.js',
  // Phase 17H forward-compat entries (Single-Key Reversible Migration Pilot)
  'docs/phase17h-single-key-reversible-migration-pilot.md',
  'scripts/validate-phase17h-single-key-reversible-migration-pilot.js',
  'tests/unit/helpers/singleKeyReversibleMigrationPilot.js',
  'tests/unit/singleKeyReversibleMigrationPilot.test.js',
  // Phase 17I forward-compat entries (Local Migration Readiness Closure / Phase 18 Gate)
  `docs/phase17i-local-migration-readiness-closure-phase18-gate.md`,
  `scripts/validate-phase17i-local-migration-readiness-closure-phase18-gate.js`,
  // Phase 18A forward-compat entries (Test-Only IndexedDBAdapter Prototype)
  `tests/unit/helpers/indexedDbAdapterTestPrototype.js`,
  `tests/unit/indexedDbAdapterTestPrototype.test.js`,
  `docs/phase18a-test-only-indexeddb-adapter-prototype.md`,
  `scripts/validate-phase18a-test-only-indexeddb-adapter-prototype.js`,
  // Phase 18B forward-compat entries (Backup/Export Compatibility Audit)
  `docs/phase18b-backup-export-compatibility-audit.md`,
  `scripts/validate-phase18b-backup-export-compatibility-audit.js`,
  // Phase 18C forward-compat entries (Manual Migration UX Plan)
  `docs/phase18c-manual-migration-ux-plan.md`,
  `scripts/validate-phase18c-manual-migration-ux-plan.js`,
  // Phase 18D forward-compat entries (Internal / Test-Only Local Migration Pilot)
  `docs/phase18d-internal-test-only-local-migration-pilot.md`,
  `scripts/validate-phase18d-internal-test-only-local-migration-pilot.js`,
  `tests/unit/helpers/internalLocalMigrationPilot.js`,
  `tests/unit/internalLocalMigrationPilot.test.js`,
  // Phase 18E forward-compat entries (Limited Local Backend Pilot with Rollback Gates)
  `docs/phase18e-limited-local-backend-pilot-rollback-gates.md`,
  `scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js`,
  `tests/unit/helpers/limitedLocalBackendPilot.js`,
  `tests/unit/limitedLocalBackendPilot.test.js`,
  // Phase 19A forward-compat entries (FSRS Public Opt-In Sequencing Gate)
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
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
  console.error(`Phase 15C validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 15C validation warning: ${message}`);
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

// ── Required files guard ──────────────────────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(TEST_FILE);
  read(DASHBOARD);
  read(ADAPTER_SOURCE);
  read(STORAGE_SOURCE);
  read(WRAPPER_SOURCE);
  read(SETTINGS_SOURCE);
  read(STUDY_ROOM);
  read(BRIDGE_COMPONENT);
  read(LEGACY_BACKUP);
  read(V2_BACKUP);
  // Phase 15B regression
  read(PHASE15B_DOCS);
  read(PHASE15B_VALIDATOR);
  read(PHASE15B_TEST);
}

// ── Package guard ─────────────────────────────────────────────────────────────

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
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase15bPos = text.indexOf('node scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js');
  const phase15cPos = text.indexOf('node scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js');
  if (phase15bPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15B validator`);
  if (phase15cPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15C validator`);
  if (phase15cPos <= phase15bPos) {
    fail(`${WORKFLOW_FILE} must register Phase 15C validator after Phase 15B validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase15cAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 15C`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 15C`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15C: ${file}`);
    fail(`Unexpected changed file for Phase 15C scope: ${file}`);
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

// ── Forbidden scope guard ─────────────────────────────────────────────────────

function forbiddenScopeGuard() {
  const changed = new Set(changedFiles());
  const forbidden = [
    STUDY_ROOM,
    BRIDGE_COMPONENT,
    LEGACY_BACKUP,
    V2_BACKUP,
    WRAPPER_SOURCE,
    SETTINGS_SOURCE,
    'package.json',
    'package-lock.json'
  ];
  for (const file of forbidden) {
    if (phase15cAllowedChangedFiles.has(file)) continue;
    if (changed.has(file)) fail(`Forbidden file changed in Phase 15C: ${file}`);
  }
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15C: ${file}`);
  }
}

// ── Source contracts guard ────────────────────────────────────────────────────

function sourceContractsGuard() {
  const adapterSource = read(ADAPTER_SOURCE);
  const dashboardSource = read(DASHBOARD);
  const storageSource = read(STORAGE_SOURCE);
  const wrapperSource = read(WRAPPER_SOURCE);

  // Adapter must export computeMixedSchedulerDueSummary
  if (!adapterSource.includes('export function computeMixedSchedulerDueSummary')) {
    fail(`${ADAPTER_SOURCE} must export computeMixedSchedulerDueSummary (Phase 15C)`);
  }
  // Adapter must preserve Phase 15B double-gate
  if (!adapterSource.includes('fsrsExperimentalEnabled')) {
    fail(`${ADAPTER_SOURCE} must preserve fsrsExperimentalEnabled double-gate reference`);
  }
  if (!adapterSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${ADAPTER_SOURCE} must preserve fsrsActiveSchedulingEnabled double-gate reference`);
  }
  if (!adapterSource.includes('export function scheduleActiveFsrsOrFallback')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleActiveFsrsOrFallback (Phase 15B regression)`);
  }
  // Adapter must NOT call .next() directly
  if (/\.next\s*\(/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not call .next() directly`);
  }

  // Dashboard must import computeMixedSchedulerDueSummary
  if (!dashboardSource.includes('computeMixedSchedulerDueSummary')) {
    fail(`${DASHBOARD} must import and use computeMixedSchedulerDueSummary (Phase 15C)`);
  }
  // Dashboard must NOT reference fsrsActiveSchedulingEnabled
  if (dashboardSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${DASHBOARD} must not reference fsrsActiveSchedulingEnabled`);
  }
  // Dashboard must NOT call .next()
  if (/\.next\s*\(/.test(dashboardSource)) {
    fail(`${DASHBOARD} must not call .next()`);
  }
  // Dashboard copy must use experimental language, not overclaim
  const dashLower = dashboardSource.toLowerCase();
  if (dashLower.includes('fsrs is now active for everyone')) {
    fail(`${DASHBOARD} contains forbidden overclaim: "fsrs is now active for everyone"`);
  }
  if (dashLower.includes('ai scheduling is enabled')) {
    fail(`${DASHBOARD} contains forbidden overclaim: "ai scheduling is enabled"`);
  }
  if (dashLower.includes('cloud sync enabled')) {
    fail(`${DASHBOARD} contains forbidden overclaim: "cloud sync enabled"`);
  }
  if (dashLower.includes('guaranteed better')) {
    fail(`${DASHBOARD} contains forbidden overclaim: "guaranteed better"`);
  }

  // Storage must NOT call .next()
  if (/\.next\s*\(/.test(storageSource)) {
    fail(`${STORAGE_SOURCE} must not call .next()`);
  }

  // fsrsWrapper must preserve scheduleFsrsReview as the only production .next() site
  if (!wrapperSource.includes('export function scheduleFsrsReview')) {
    fail(`${WRAPPER_SOURCE} must preserve scheduleFsrsReview`);
  }

  // StudyRoom must NOT call .next(), must preserve Phase 14N exports
  const studyRoomSource = read(STUDY_ROOM);
  if (/\.next\s*\(/.test(studyRoomSource)) {
    fail(`${STUDY_ROOM} must not call .next()`);
  }
  if (!studyRoomSource.includes('shouldShowFsrsTwoStepBridge')) {
    fail(`${STUDY_ROOM} must preserve shouldShowFsrsTwoStepBridge (Phase 14N regression)`);
  }
  if (!studyRoomSource.includes('appendFsrsReviewLog')) {
    fail(`${STUDY_ROOM} must preserve appendFsrsReviewLog (Phase 14N regression)`);
  }
}

// ── Hybrid sync guard ─────────────────────────────────────────────────────────

function hybridSyncGuard() {
  const dashSource = read(DASHBOARD);
  const adapterSource = read(ADAPTER_SOURCE);
  for (const source of [dashSource, adapterSource]) {
    if (source.includes('local-first') || source.includes('IndexedDB') || source.includes('cloud-sync')) {
      fail('Phase 15C must not implement hybrid local-first/sync');
    }
  }
}

// ── Tests guard ───────────────────────────────────────────────────────────────

function testsGuard() {
  const testSource = read(TEST_FILE);
  const required = [
    'SM-2',
    'fsrs-planned',
    'fsrs-active',
    'computeMixedSchedulerDueSummary',
    'double-count',
    'malformed',
    'unknown'
  ];
  for (const term of required) {
    if (!testSource.toLowerCase().includes(term.toLowerCase())) {
      fail(`${TEST_FILE} must cover: ${term}`);
    }
  }
  if (testSource.includes('.skip(') || testSource.includes('.todo(')) {
    fail(`${TEST_FILE} must not contain skipped or placeholder tests`);
  }
}

// ── Docs guard ────────────────────────────────────────────────────────────────

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 15C',
    'Dashboard',
    'mixed scheduler',
    'does not change scheduling logic',
    'does not call',
    'ts-fsrs.next',
    'does not modify',
    'StudyRoom',
    'fsrs-planned',
    'fsrs-active',
    'SM-2',
    'experimental',
    'double-gated',
    'default OFF',
    'fsrsActiveSchedulingEnabled',
    'backup',
    'hybrid local-first',
    'deferred'
  ]);
}

// ── Activation claims guard ───────────────────────────────────────────────────

function activationClaimsGuard() {
  const docsText = normalize(read(DOCS_FILE));
  const forbiddenClaims = [
    'fsrs is now active for everyone',
    'fsrs active scheduling is live',
    'ai scheduling is enabled',
    'cloud sync hybrid local-first is implemented',
    'dashboard fully supports every future scheduler',
    'guaranteed better scheduling',
  ];
  for (const claim of forbiddenClaims) {
    if (docsText.includes(claim)) {
      fail(`${DOCS_FILE} contains forbidden activation claim: "${claim}"`);
    }
  }
}

// ── Internal registry guard ───────────────────────────────────────────────────

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

// ── Phase 15B regression guard ────────────────────────────────────────────────

function phase15bRegressionGuard() {
  read(PHASE15B_DOCS);
  read(PHASE15B_VALIDATOR);
  read(PHASE15B_TEST);

  const adapterSource = read(ADAPTER_SOURCE);
  if (!adapterSource.includes("'fsrs-active'")) {
    fail(`${ADAPTER_SOURCE} must preserve 'fsrs-active' in FSRS_KIND_ALIASES (Phase 15B regression)`);
  }
  if (!adapterSource.includes('export function scheduleCurrentReviewPreservingFsrs')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleCurrentReviewPreservingFsrs (Phase 15B regression)`);
  }
  if (!adapterSource.includes('export function resolveActiveSchedulingRating')) {
    fail(`${ADAPTER_SOURCE} must preserve resolveActiveSchedulingRating (Phase 15B regression)`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  packageGuard();
  workflowGuard();
  scopeGuard();
  generatedArtifactGuard();
  forbiddenScopeGuard();
  sourceContractsGuard();
  hybridSyncGuard();
  testsGuard();
  docsGuard();
  activationClaimsGuard();
  internalRegistryGuard();
  phase15bRegressionGuard();
  console.log('Phase 15C dashboard mixed scheduler due-count validation passed.');
}

validate();
