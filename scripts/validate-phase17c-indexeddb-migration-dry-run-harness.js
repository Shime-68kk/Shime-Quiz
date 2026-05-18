#!/usr/bin/env node
/**
 * scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js
 *
 * Phase 17C static validator — IndexedDB Migration Dry-Run Harness.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase17c-indexeddb-migration-dry-run-harness.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE17B_VALIDATOR = 'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js';

const DRY_RUN_HARNESS_FILE = 'src/storage/indexedDbDryRunHarness.js';
const DRY_RUN_TEST_FILE    = 'tests/unit/indexedDbDryRunHarness.test.js';

const ADAPTER_REGISTRY = 'src/storage/storageAdapterRegistry.js';

// Exact set of allowed changed files for Phase 17C.
const phase17cAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  DRY_RUN_HARNESS_FILE,
  DRY_RUN_TEST_FILE,
  // Historical validator forward-compat edits
  'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js',
  'scripts/validate-phase17a-backup-rollback-harness-before-migration.js',
  PHASE17B_VALIDATOR,
  // Phase 16C unit test updated for Phase 17C forward-compat
  'tests/unit/storageLargeImportEdugenRiskAudit.test.js',
  // Phase 16K unit test updated for Phase 17C forward-compat
  'tests/unit/storageQuotaBackupBeforeImport.test.jsx',
  // Phase 17D forward-compat entries (Migration Journal / Event Log Architecture)
  'docs/phase17d-migration-journal-event-log-architecture.md',
  'scripts/validate-phase17d-migration-journal-event-log-architecture.js',
  // Phase 17E forward-compat entries (Per-Key Migration Manifest Design)
  'docs/phase17e-per-key-migration-manifest-design.md',
  'scripts/validate-phase17e-per-key-migration-manifest-design.js',
  // Phase 17F forward-compat entries (Test-Only Migration Journal Prototype)
  'docs/phase17f-test-only-migration-journal-prototype.md',
  'scripts/validate-phase17f-test-only-migration-journal-prototype.js',
  'tests/unit/helpers/migrationJournalTestHarness.js',
  'tests/unit/migrationJournalTestHarness.test.js',
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
  // Phase 19B forward-compat entries (Optional Sync Architecture Decision Gate)
  `docs/adr/phase19b-optional-sync-direction.md`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
  // Phase 19C forward-compat entries (Optional Sync Conflict Model Design Gate)
  `docs/adr/phase19c-optional-sync-conflict-model.md`,
  `scripts/validate-phase19c-optional-sync-conflict-model.js`,
  // Phase 19D forward-compat entries (No-Cloud / Default-Off Trust Copy Gate)
  `docs/trust/no-cloud-default-off.vi.md`,
  `docs/trust/no-cloud-default-off.md`,
  `docs/adr/phase19d-no-cloud-default-off-trust-copy.md`,
  `scripts/validate-phase19d-no-cloud-default-off-trust-copy.js`,
  // Phase 20A forward-compat entries (Beta Local-First Hybrid Stabilization Gate)
  `docs/adr/phase20a-beta-local-first-hybrid-stabilization.md`,
  `scripts/validate-phase20a-beta-local-first-hybrid-stabilization.js`,
  // Phase 20B forward-compat entries (Real User Testing / Data Safety Feedback Plan)
  `docs/adr/phase20b-real-user-testing-data-safety-feedback.md`,
  `docs/testing/phase20b-real-user-testing-plan.md`,
  `scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`,
  `docs/adr/phase20c-performance-quota-import-stress-test-plan.md`,
  `docs/testing/phase20c-performance-quota-import-stress-test-plan.md`,
  `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`,
  // Phase 20D naming-cleanup compat: exact paths only (no broad allowlists)
  `DEPLOY.md`,
  `DEPLOY_V2.md`,
  `docs/adr/phase20d-hold-decision-beta-ai-naming-cleanup.md`,
  `docs/github-release-publication-plan.md`,
  `docs/release-candidate-status.md`,
  `docs/release-candidate-tag-publish-gate.md`,
  `docs/release/phase20d-beta-hold-evidence.md`,
  `docs/release-tag-creation-plan.md`,
  `docs/release-tag-decision.md`,
  `docs/V2_DATA_MODEL.md`,
  `package.json`,
  `package-lock.json`,
  `RELEASE_NOTES.md`,
  `RELEASE_NOTES_V2.md`,
  `RELEASE_QA.md`,
  `RELEASE_QA_V2.md`,
  `scripts/validate-backup-transfer-safety-hardening.js`,
  `scripts/validate-cross-device-export-import.js`,
  `scripts/validate-cross-device-transfer-track-closure.js`,
  `scripts/validate-cross-device-transfer-ux-copy.js`,
  `scripts/validate-cross-device-transfer-ux-decision.js`,
  `scripts/validate-dashboard-first-run-onboarding.js`,
  `scripts/validate-dashboard-today-card-runtime.js`,
  `scripts/validate-dashboard-today-card-ux-plan.js`,
  `scripts/validate-demo-quickstart-onboarding.js`,
  `scripts/validate-demo-readiness-docs.js`,
  `scripts/validate-demo-sample-pack.js`,
  `scripts/validate-demo-sample-quickstart.js`,
  `scripts/validate-edugen-boundary-polish.js`,
  `scripts/validate-final-main-release-authorization.js`,
  `scripts/validate-final-public-release-readiness-reaudit.js`,
  `scripts/validate-final-release-execution-checklist.js`,
  `scripts/validate-github-release-publication-plan.js`,
  `scripts/validate-library-empty-state-onboarding.js`,
  `scripts/validate-manual-evidence-execution-checklist.js`,
  `scripts/validate-manual-evidence-results-log.js`,
  `scripts/validate-manual-evidence-run-pack.js`,
  `scripts/validate-mobile-ux-smoke.js`,
  `scripts/validate-performance-bundle-audit.js`,
  `scripts/validate-phase12-closure-release-decision.js`,
  `scripts/validate-phase12-roadmap-risk-register.js`,
  `scripts/validate-phase13-closure.js`,
  `scripts/validate-phase13-fsrs-plan.js`,
  `scripts/validate-phase13-local-adaptive-roadmap.js`,
  `scripts/validate-phase13-review-engine-audit.js`,
  `scripts/validate-phase14a-scheduler-adapter.js`,
  `scripts/validate-phase14b-fsrs-wrapper.js`,
  `scripts/validate-phase14c-fsrs-persistence-harness.js`,
  `scripts/validate-phase14d-fsrs-adapter-routing.js`,
  `scripts/validate-phase14e-fsrs-user-facing-entry.js`,
  `scripts/validate-phase14f-toggle-plan.js`,
  `scripts/validate-phase14g-settings-storage.js`,
  `scripts/validate-phase14h-fsrs-toggle-ui.js`,
  `scripts/validate-phase14i-fsrs-two-step-fixture.js`,
  `scripts/validate-phase14j-fsrs-enrollment-readiness.js`,
  `scripts/validate-phase14k-fsrs-readiness-audit.js`,
  `scripts/validate-phase14l-production-enrollment-wiring.js`,
  `scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js`,
  `scripts/validate-phase14n-production-studyroom-two-step-bridge.js`,
  `scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js`,
  `scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js`,
  `scripts/validate-phase15a-fsrs-active-scheduling-architecture.js`,
  `scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js`,
  `scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js`,
  `scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js`,
  `scripts/validate-phase15e-controlled-internal-activation-harness.js`,
  `scripts/validate-phase15f-studyroom-copy-ux-alignment.js`,
  `scripts/validate-phase15g-release-claim-guardrail-reaudit.js`,
  `scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js`,
  `scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js`,
  `scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js`,
  `scripts/validate-phase16d-shime-study-identity-product-principles.js`,
  `scripts/validate-phase16e-visual-polish-quick-wins.js`,
  `scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js`,
  `scripts/validate-phase16g-edugen-draft-review-import-flow.js`,
  `scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js`,
  `scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js`,
  `scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js`,
  `scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js`,
  `scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js`,
  `scripts/validate-phase17a-backup-rollback-harness-before-migration.js`,
  `scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js`,
  `scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js`,
  `scripts/validate-phase17d-migration-journal-event-log-architecture.js`,
  `scripts/validate-phase17e-per-key-migration-manifest-design.js`,
  `scripts/validate-phase17f-test-only-migration-journal-prototype.js`,
  `scripts/validate-phase17g-single-key-dry-run-migration-rehearsal.js`,
  `scripts/validate-phase17h-single-key-reversible-migration-pilot.js`,
  `scripts/validate-phase17i-local-migration-readiness-closure-phase18-gate.js`,
  `scripts/validate-phase18a-test-only-indexeddb-adapter-prototype.js`,
  `scripts/validate-phase18b-backup-export-compatibility-audit.js`,
  `scripts/validate-phase18c-manual-migration-ux-plan.js`,
  `scripts/validate-phase18d-internal-test-only-local-migration-pilot.js`,
  `scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
  `scripts/validate-phase19c-optional-sync-conflict-model.js`,
  `scripts/validate-phase19d-no-cloud-default-off-trust-copy.js`,
  `scripts/validate-phase20a-beta-local-first-hybrid-stabilization.js`,
  `scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`,
  `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`,
  `scripts/validate-phase20d-hold-decision-beta-ai-naming-cleanup.js`,
  `scripts/validate-public-positioning-lock.js`,
  `scripts/validate-public-release-docs.js`,
  `scripts/validate-release-candidate-freeze-final-decision.js`,
  `scripts/validate-release-candidate-status.js`,
  `scripts/validate-release-candidate-tag-publish-gate.js`,
  `scripts/validate-release-package-assembly-plan.js`,
  `scripts/validate-release-tag-creation-plan.js`,
  `scripts/validate-storage-capacity-indexeddb-migration-plan.js`,
  `scripts/validate-storage-quota-warning-runtime.js`,
  `scripts/validate-study-flow-micro-feedback-plan.js`,
  `scripts/validate-study-flow-micro-feedback-runtime.js`,
  `scripts/validate-unit-test-foundation-plan.js`,
  `scripts/validate-visual-asset-guidance.js`,
  `scripts/validate-vitest-unit-test-foundation.js`,
  `scripts/validate-web-share-mobile-sharing-prototype-plan.js`,
  `scripts/validate-web-share-runtime-fallback-hardening.js`,
  `scripts/validate-web-share-runtime-prototype.js`,
  `src/version.js`,
  `sw.js`,
  `scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js`,
  // Phase 20D forward-compat entries (HOLD Decision + beta-ai Naming Cleanup Gate)
  `docs/adr/phase20d-hold-decision-beta-ai-naming-cleanup.md`,
  `docs/release/phase20d-beta-hold-evidence.md`,
  `scripts/validate-phase20d-hold-decision-beta-ai-naming-cleanup.js`,
  `package.json`,
  `package-lock.json`,
  `src/version.js`,
  `sw.js`,
  `RELEASE_QA.md`,
  `RELEASE_QA_V2.md`,
  `RELEASE_NOTES.md`,
  `RELEASE_NOTES_V2.md`,
  `DEPLOY.md`,
  `DEPLOY_V2.md`,
  `docs/V2_DATA_MODEL.md`,
  `docs/release-candidate-status.md`,
  `docs/release-tag-decision.md`,
  `docs/release-tag-creation-plan.md`,
  `docs/release-candidate-tag-publish-gate.md`,
  `docs/github-release-publication-plan.md`,
  // Phase 20E forward-compat entries (Real User Testing Results Log)
  `docs/testing/phase20e-real-user-testing-results-log.md`,
  `docs/release/phase20e-real-user-testing-evidence-protocol.md`,
  `scripts/validate-phase20e-real-user-testing-results-log.js`,
  // Phase 20F forward-compat entries (Performance / Quota / Import Stress Results Log)
  `docs/testing/phase20f-performance-quota-import-stress-results-log.md`,
  `docs/release/phase20f-performance-quota-import-stress-evidence-protocol.md`,
  `scripts/validate-phase20f-performance-quota-import-stress-results-log.js`,
  `docs/adr/phase20g-beta-readiness-redecision-after-evidence.md`,
  `docs/release/phase20g-beta-readiness-redecision-evidence-summary.md`,
  `scripts/validate-phase20g-beta-readiness-redecision-after-evidence.js`,
  `docs/testing/phase20h-real-user-testing-execution-results.md`,
  `docs/testing/phase20i-performance-quota-import-stress-execution-results.md`,
  `docs/release/phase20h-real-user-testing-evidence-summary.md`,
  `docs/release/phase20i-performance-quota-import-stress-evidence-summary.md`,
  `scripts/validate-phase20h-real-user-testing-execution-results.js`,
  `scripts/validate-phase20i-performance-quota-import-stress-execution-results.js`,
  `docs/adr/phase20j-final-beta-readiness-redecision.md`,
  `docs/release/phase20j-final-beta-readiness-evidence-summary.md`,
  `scripts/validate-phase20j-final-beta-readiness-redecision.js`,
  `docs/testing/phase21a-manual-evidence-execution-run-pack.md`,
  `docs/release/phase21a-evidence-execution-safety-checklist.md`,
  `scripts/validate-phase21a-manual-evidence-execution-run-pack.js`,
  `docs/testing/phase21b-real-user-testing-filled-results.md`,
  `docs/release/phase21b-real-user-testing-filled-evidence-summary.md`,
  `scripts/validate-phase21b-real-user-testing-filled-results.js`,
  `docs/testing/phase21c-stress-testing-filled-results.md`,
  `docs/release/phase21c-stress-testing-filled-evidence-summary.md`,
  `scripts/validate-phase21c-stress-testing-filled-results.js`,
  `docs/adr/phase21d-beta-readiness-redecision-filled-evidence.md`,
  `docs/release/phase21d-beta-readiness-filled-evidence-summary.md`,
  `scripts/validate-phase21d-beta-readiness-redecision-filled-evidence.js`,
]);

// Files that absolutely must not change.
const forbiddenChangedFiles = [
  'package.json',
  'package-lock.json',
  'src/storage/StorageAdapter.js',
  'src/storage/LocalStorageAdapter.js',
  'src/storage/storageAdapterRegistry.js',
  'src/state/recommendationFeedbackStorage.js',
  'src/quiz/reviewSchedulerAdapter.js',
  'src/quiz/fsrsWrapper.js',
  'src/state/reviewScheduleStorage.js',
  'src/state/settingsStorage.js',
  'src/state/studyHistoryStorage.js',
  'src/state/studyDraftStorage.js',
  'src/state/studyGoalStorage.js',
  'src/state/studyPlanProgressStorage.js',
  'src/data/learningDataStore.js',
  'src/data/learningDataAdapter.js',
  'src/data/importValidator.js',
];

const forbiddenChangedPrefixes = ['e2e/', 'src/edugen/', 'src/components/edugen/'];

// These runtime files must not exist.
const forbiddenRuntimeFiles = [
  'src/storage/IndexedDBAdapter.js',
  'src/storage/SyncAdapter.js',
  'src/storage/EventLog.js',
];

// Forbidden runtime concepts in the dry-run harness itself.
const forbiddenHarnessConcepts = [
  'localStorage.setItem',
  'localStorage.removeItem',
  'getLocalStorage',
  'setStorageAdapterForTests',
  'getStorageAdapter',
  'dual-write',
  'dualWrite',
  'SyncAdapter',
  'EventLog',
  'migration status',
  'deleteDatabase.*real\|real.*deleteDatabase',
];

const forbiddenHarnessPatterns = [
  /localStorage\.setItem/,
  /localStorage\.removeItem/,
  /getLocalStorage\s*\(/,
  /setStorageAdapterForTests\s*\(/,
  /getStorageAdapter\s*\(/,
  /SyncAdapter/,
  /EventLog\s+runtime/,
];

// indexedDB usage is allowed only in the dry-run harness and its test.
const indexedDbAllowedFiles = new Set([
  DRY_RUN_HARNESS_FILE,
  DRY_RUN_TEST_FILE,
]);

const generatedArtifacts = [
  'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD', '.env', '.env.local', '.git'
];

const requiredDocSections = [
  '# Phase 17C — IndexedDB Migration Dry-Run Harness',
  '## Result',
  '## Phase Goal',
  '## Why This Follows Phase 17A and Phase 17B',
  '## What Dry-Run Harness Was Added',
  '## What the Dry-Run Harness Does NOT Do',
  '## No Live Migration',
  '## No Dual-Write',
  '## No Production Adapter Switch',
  '## No App Boot Migration',
  '## No User-Facing Migration UI',
  '## No SyncAdapter / EventLog',
  '## No Backup Schema Migration',
  '## No Storage Schema Migration',
  '## No Import Parser Semantics Change',
  '## No FSRS / EduGen / Scheduler Behavior Change',
  '## No localStorage Deletion',
  '## Forbidden',
  '## Validation Evidence Expected',
  '## Next Phase Dependency',
];

const requiredDocTerms = [
  'dry-run',
  'indexeddb',
  'shime-v2-indexeddb-dry-run',
  'no live migration',
  'no dual-write',
  'no production adapter switch',
  'no app boot migration',
  'no user-facing migration ui',
  'no syncadapter',
  'no eventlog',
  'no backup schema migration',
  'no storage schema migration',
  'no import parser',
  'no localstorage deletion',
  'no fsrs',
  'no fsrs / edugen',
  'phase 17a',
  'phase 17b',
  'phase 17d',
  'checkindexeddbavailability',
  'createindexeddbdryrunplan',
  'runindexeddbdryrun',
  'localstoragead',
];

const forbiddenClaimPhrases = [
  'indexeddb migration complete',
  'indexeddb is implemented',
  'migration done',
  'migration is complete',
  'cloud sync available',
  'cloud sync is available',
  'e2ee is available',
  'storageadapter production migration',
  'storageadapter migration complete',
  'production indexeddb backend',
  'public active fsrs rollout',
  'built-in ai exists',
  'built-in ocr',
  'guaranteed data safety',
  'guaranteed recovery',
  'guaranteed no data loss',
];

function fail(message) {
  console.error(`Phase 17C validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 17C validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
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

function isGeneratedArtifact(file) {
  return generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
}

// ── 1. Required files exist ───────────────────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE17B_VALIDATOR);
  read(DRY_RUN_HARNESS_FILE);
  read(DRY_RUN_TEST_FILE);
  read(ADAPTER_REGISTRY);
}

// ── 2. Workflow registers Phase 17C validator after Phase 17B ─────────────────

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase17bStr = 'node scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js';
  const phase17cStr = 'node scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js';

  if (!text.includes(phase17bStr)) fail(`${WORKFLOW_FILE} must register Phase 17B validator`);
  if (!text.includes(phase17cStr)) fail(`${WORKFLOW_FILE} must register Phase 17C validator`);

  const phase17bPos = text.indexOf(phase17bStr);
  const phase17cPos = text.indexOf(phase17cStr);
  if (phase17cPos <= phase17bPos) fail(`${WORKFLOW_FILE} must register Phase 17C validator after Phase 17B`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

// ── 3. Package files unchanged ────────────────────────────────────────────────

function packageGuard() {
  // Phase 20D naming-cleanup compat: allow exact version transition
  // <previous version> → 2.0.0-beta.1 in package.json/package-lock.json.
  const allowed = new Set(['2.0.0-beta.1']);
  const pkgRaw = fs.readFileSync('package.json', 'utf8');
  const lockRaw = fs.readFileSync('package-lock.json', 'utf8');
  const pkgVer = JSON.parse(pkgRaw).version;
  const lockVer = JSON.parse(lockRaw).version;
  if (!allowed.has(pkgVer)) fail('package.json version unexpected in Phase 17C: ' + pkgVer);
  if (!allowed.has(lockVer)) fail('package-lock.json version unexpected in Phase 17C: ' + lockVer);
}

// ── 4. No e2e changes ─────────────────────────────────────────────────────────

function e2eGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`, `docs/testing/phase21f-first-manual-evidence-run-capture.md`, `docs/release/phase21f-first-manual-evidence-run-summary.md`, `scripts/validate-phase21f-first-manual-evidence-run-capture.js`,
  `docs/adr/phase21g-evidence-track-closure-phase22-readiness.md`,
  `docs/release/phase21g-phase22-readiness-handoff.md`,
  `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`,].includes(file)) continue;
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17C (forbidden): ${file}`);
  }
}

// ── 5 & 6. Scope guard ────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`, `docs/testing/phase21f-first-manual-evidence-run-capture.md`, `docs/release/phase21f-first-manual-evidence-run-summary.md`, `scripts/validate-phase21f-first-manual-evidence-run-capture.js`,
  `docs/adr/phase21g-evidence-track-closure-phase22-readiness.md`,
  `docs/release/phase21g-phase22-readiness-handoff.md`,
  `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`,].includes(file)) continue;
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase17cAllowedChangedFiles.has(file)) continue;
    if (forbiddenChangedFiles.includes(file)) { if (file === 'package.json' || file === 'package-lock.json') { /* Phase 20D naming-cleanup compat */ } else fail(`Forbidden file changed in Phase 17C: ${file}`); }
    if (forbiddenChangedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed in Phase 17C: ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17C (forbidden): ${file}`);
    // New phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    if (file.startsWith('docs/') || file.startsWith('tests/') || file.startsWith('src/')) {
      fail(`Unexpected changed file for Phase 17C scope: ${file}`);
    }
    warn(`Unexpected file outside allowed scope (non-fatal): ${file}`);
  }
}

// ── 7. No forbidden runtime files ────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const path of forbiddenRuntimeFiles) {
    if (fs.existsSync(path)) fail(`Phase 17C must not introduce forbidden runtime file: ${path}`);
  }
}

// ── 8. indexedDB usage limited to dry-run harness and tests ──────────────────

function indexedDbScopeGuard() {
  function scanDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = `${dirPath}/${entry.name}`;
      const rel = full.replace(/^\.\//, '');
      if (entry.isDirectory()) {
        scanDir(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!(entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) continue;
      if (indexedDbAllowedFiles.has(rel)) continue;
      const content = fs.readFileSync(full, 'utf8');
      // Check for indexedDB usage outside allowed files
      if (/indexedDB\s*\.\s*open\s*\(|IDBDatabase|IDBObjectStore|IDBFactory/i.test(content)) {
        fail(`Forbidden IndexedDB runtime term found outside dry-run harness in: ${rel}`);
      }
    }
  }
  scanDir('./src');
}

// ── 9. Production adapter registry unchanged ──────────────────────────────────

function adapterRegistryGuard() {
  const content = read(ADAPTER_REGISTRY);
  if (!content.includes('LocalStorageAdapter')) {
    fail(`${ADAPTER_REGISTRY} must still use LocalStorageAdapter as production default`);
  }
  if (content.includes('indexedDbDryRunHarness')) {
    fail(`${ADAPTER_REGISTRY} must not reference indexedDbDryRunHarness`);
  }
  if (content.includes('IndexedDB') || content.includes('indexedDB')) {
    fail(`${ADAPTER_REGISTRY} must not reference IndexedDB`);
  }
}

function stripComments(content) {
  return content
    .split(/\r?\n/)
    .filter(line => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join('\n');
}

// ── 10. No live migration/dual-write/boot migration in harness ────────────────

function harnessConceptGuard() {
  const content = stripComments(read(DRY_RUN_HARNESS_FILE));
  for (const pattern of forbiddenHarnessPatterns) {
    if (pattern.test(content)) {
      fail(`Forbidden concept found in ${DRY_RUN_HARNESS_FILE}: ${pattern}`);
    }
  }
}

// ── 11. No localStorage deletion in harness ──────────────────────────────────

function noLocalStorageDeletionGuard() {
  const content = read(DRY_RUN_HARNESS_FILE);
  if (/localStorage\.removeItem|localStorage\.clear/.test(content)) {
    fail(`${DRY_RUN_HARNESS_FILE} must not delete localStorage data`);
  }
}

// ── 12. dryRunOnly marker present in harness ──────────────────────────────────

function dryRunOnlyMarkerGuard() {
  const content = read(DRY_RUN_HARNESS_FILE);
  if (!content.includes('dryRunOnly')) {
    fail(`${DRY_RUN_HARNESS_FILE} must include dryRunOnly in result objects`);
  }
}

// ── 13. No backup schema version bump ─────────────────────────────────────────

function noSchemaBumpGuard() {
  const doc = read(DOCS_FILE).toLowerCase();
  if (!doc.includes('no backup schema migration') && !doc.includes('no backup schema')) {
    fail(`${DOCS_FILE} must explicitly state no backup schema migration`);
  }
}

// ── 14. Required tests exist ──────────────────────────────────────────────────

function requiredTestsGuard() {
  const test = read(DRY_RUN_TEST_FILE);

  const requiredTerms = [
    'checkIndexedDbAvailability',
    'runIndexedDbDryRun',
    'createIndexedDbDryRunPlan',
    'cleanupIndexedDbDryRun',
    'dryRunOnly',
    'available:',
    'ok:',
    'no localStorage',
    'setItemSpy',
    'LocalStorageAdapter',
    'dry-run',
    'shime-v2-indexeddb-dry-run',
  ];

  for (const term of requiredTerms) {
    if (!test.includes(term)) {
      fail(`${DRY_RUN_TEST_FILE} must include required term: "${term}"`);
    }
  }
}

// ── 15. Required doc terms ────────────────────────────────────────────────────

function docTermGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();

  // Case-sensitive checks for camelCase terms
  const caseSensitiveTerms = [
    'checkIndexedDbAvailability',
    'runIndexedDbDryRun',
    'createIndexedDbDryRunPlan',
    'cleanupIndexedDbDryRun',
    'LocalStorageAdapter',
  ];
  for (const term of caseSensitiveTerms) {
    const termLower = term.toLowerCase();
    if (!lower.includes(termLower)) {
      fail(`${DOCS_FILE} must include required term (case-insensitive): "${term}"`);
    }
  }

  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── 16. Doc section guard ─────────────────────────────────────────────────────

function docSectionGuard() {
  const doc = read(DOCS_FILE);
  for (const section of requiredDocSections) {
    if (!doc.includes(section)) fail(`${DOCS_FILE} must include required section: "${section}"`);
  }
}

// ── 17. No forbidden public claims ────────────────────────────────────────────

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const lines = doc.split(/\r?\n/);
  let inForbiddenSection = false;
  for (const line of lines) {
    if (/^##\s+Forbidden/i.test(line)) { inForbiddenSection = true; continue; }
    if (/^##\s+/.test(line)) inForbiddenSection = false;
    if (inForbiddenSection) continue;
    const lineLower = line.toLowerCase();
    for (const claim of forbiddenClaimPhrases) {
      if (lineLower.includes(claim.toLowerCase())) {
        const negated = /no |not |must not|forbidden|do not|denied|absent|without/i.test(line);
        if (!negated) fail(`${DOCS_FILE} must not contain forbidden positive claim: "${claim}" (line: ${line.trim()})`);
      }
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

// ── Dry-run DB name guard ─────────────────────────────────────────────────────

function dryRunDbNameGuard() {
  const content = read(DRY_RUN_HARNESS_FILE);
  if (!content.includes('shime-v2-indexeddb-dry-run')) {
    fail(`${DRY_RUN_HARNESS_FILE} must use "shime-v2-indexeddb-dry-run" as the dry-run database name`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  workflowGuard();
  packageGuard();
  e2eGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  indexedDbScopeGuard();
  adapterRegistryGuard();
  harnessConceptGuard();
  noLocalStorageDeletionGuard();
  dryRunOnlyMarkerGuard();
  noSchemaBumpGuard();
  requiredTestsGuard();
  docSectionGuard();
  docTermGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  dryRunDbNameGuard();
  console.log('Phase 17C IndexedDB Migration Dry-Run Harness validation passed.');
}

validate();
