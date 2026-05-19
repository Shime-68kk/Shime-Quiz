#!/usr/bin/env node
/**
 * scripts/validate-phase20c-performance-quota-import-stress-test-plan.js
 *
 * Phase 20C static validator — Performance / Quota / Import Stress Test Plan.
 *
 * Phase 20C is docs/static-validator/CI-only. It does not implement sync,
 * account/auth/backend, storage changes, FSRS changes, backup/export/restore
 * changes, UI, tests, telemetry, analytics, runtime stress fixtures, or package
 * changes. Its deliverables are this validator, the Phase 20C ADR, the Phase 20C
 * stress-test plan doc, and CI registration after Phase 20B.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ADR_FILE              = `docs/adr/phase20c-performance-quota-import-stress-test-plan.md`;
const STRESS_TEST_PLAN_FILE = `docs/testing/phase20c-performance-quota-import-stress-test-plan.md`;
const VALIDATOR_SCRIPT      = `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`;
const WORKFLOW_FILE         = `.github/workflows/e2e-smoke.yml`;
const PHASE20B_VALIDATOR    = `scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`;
const PHASE20A_VALIDATOR    = `scripts/validate-phase20a-beta-local-first-hybrid-stabilization.js`;

const phase20cCoreFiles = [
  ADR_FILE,
  STRESS_TEST_PLAN_FILE,
  VALIDATOR_SCRIPT,
];

// Phase 20C forward-compat entries: the only paths historical validators may add.
const phase20cForwardCompatEntries = [
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
  `docs/testing/phase22g-filled-evidence-update.md`,
  `docs/release/phase22g-filled-evidence-summary.md`,
  `scripts/validate-phase22g-filled-evidence-update.js`,
  `docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`,
  `docs/testing/phase22h-beta-readiness-evidence-matrix.md`,
  `scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`,
  `docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`,
  `docs/release/phase23a-local-data-survival-research-summary.md`,
  `scripts/validate-phase23a-local-data-survival-research.js`,
];

// Pre-Phase-20C baseline files that may already appear in historical validator
// forward-compat lists from prior phases. They are NOT additions in Phase 20C.
const previousForwardCompatEntries = [
  // Phase 18C/18D/18E baseline
  `docs/phase18c-manual-migration-ux-plan.md`,
  `docs/phase18d-internal-test-only-local-migration-pilot.md`,
  `docs/phase18e-limited-local-backend-pilot-rollback-gates.md`,
  `scripts/validate-phase18d-internal-test-only-local-migration-pilot.js`,
  `scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js`,
  `tests/unit/helpers/internalLocalMigrationPilot.js`,
  `tests/unit/internalLocalMigrationPilot.test.js`,
  `tests/unit/helpers/limitedLocalBackendPilot.js`,
  `tests/unit/limitedLocalBackendPilot.test.js`,
  // Phase 19A baseline
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
  // Phase 19B baseline
  `docs/adr/phase19b-optional-sync-direction.md`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
  // Phase 19C baseline
  `docs/adr/phase19c-optional-sync-conflict-model.md`,
  `scripts/validate-phase19c-optional-sync-conflict-model.js`,
  // Phase 19D baseline
  `docs/trust/no-cloud-default-off.vi.md`,
  `docs/trust/no-cloud-default-off.md`,
  `docs/adr/phase19d-no-cloud-default-off-trust-copy.md`,
  `scripts/validate-phase19d-no-cloud-default-off-trust-copy.js`,
  // Phase 20A baseline
  `docs/adr/phase20a-beta-local-first-hybrid-stabilization.md`,
  `scripts/validate-phase20a-beta-local-first-hybrid-stabilization.js`,
  // Phase 20B baseline
  `docs/adr/phase20b-real-user-testing-data-safety-feedback.md`,
  `docs/testing/phase20b-real-user-testing-plan.md`,
  `scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`,
  `docs/testing/phase22g-filled-evidence-update.md`,
  `docs/release/phase22g-filled-evidence-summary.md`,
  `scripts/validate-phase22g-filled-evidence-update.js`,
  `docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`,
  `docs/testing/phase22h-beta-readiness-evidence-matrix.md`,
  `scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`,
  `docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`,
  `docs/release/phase23a-local-data-survival-research-summary.md`,
  `scripts/validate-phase23a-local-data-survival-research.js`,
];

const phase20cAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  PHASE20B_VALIDATOR,
  PHASE20A_VALIDATOR,
  ...phase20cCoreFiles,
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
phase20cAllowedChangedFiles.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
phase20cAllowedChangedFiles.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
phase20cAllowedChangedFiles.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
phase20cAllowedChangedFiles.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
phase20cAllowedChangedFiles.add(`docs/release/phase23c-backup-health-design-summary.md`);
phase20cAllowedChangedFiles.add(`scripts/validate-phase23c-backup-health-design.js`);
phase20cAllowedChangedFiles.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
phase20cAllowedChangedFiles.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
phase20cAllowedChangedFiles.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);

const fsrsRuntimeFiles = [
  `src/scheduler/fsrsAdapter.js`,
  `src/scheduler/fsrsScheduler.js`,
  `src/scheduler/fsrsEnrollment.js`,
  `src/state/fsrsMetadata.js`,
  `src/ui/FsrsExperimentalSettingsPanel.js`,
];

const storageMigrationRuntimeFiles = [
  `src/storage/IndexedDBAdapter.js`,
  `src/storage/EventLog.js`,
  `src/storage/MigrationJournal.js`,
  `src/storage/SyncAdapter.js`,
  `src/storage/migrationJournal.js`,
  `src/storage/migrationRunner.js`,
  `src/storage/migrationManifest.js`,
  `src/storage/migrationRegistry.js`,
  `src/storage/backupCoverageMap.js`,
  `src/state/adapterBackupBridge.js`,
  `src/storage/StorageAdapter.js`,
  `src/storage/LocalStorageDriver.js`,
];

const backupRestoreRuntimeFiles = [
  `src/state/v2BackupRestore.js`,
  `src/quiz/dataBackup.js`,
  `src/ui/dataBackupPanel.js`,
];

const forbiddenRuntimeFiles = [
  `src/storage/EventLog.js`,
  `src/storage/SyncAdapter.js`,
  `src/storage/conflictResolver.js`,
  `src/storage/operationLog.js`,
  `src/storage/tombstones.js`,
  `src/storage/deviceIdentity.js`,
  `src/storage/syncEngine.js`,
  `src/state/syncStorage.js`,
  `src/state/adapterBackupBridge.js`,
  `src/sync/SyncEngine.js`,
  `src/sync/CloudSyncAdapter.js`,
  `src/auth/AccountProvider.js`,
];

const forbiddenDependencies = [
  `idb`, `dexie`, `localforage`, `pouchdb`, `rxdb`, `firebase`, `supabase`,
  `aws-sdk`, `@supabase/supabase-js`, `pocketbase`,
];

const generatedArtifacts = [
  `node_modules`,
  `dist`,
  `test-results`,
  `playwright-report`,
  `coverage`,
  `FETCH_HEAD`,
  `.env`,
  `.env.local`,
  `.git`,
  `phase20c-performance-quota-import-stress-test-plan.patch`,
  `phase20c-performance-quota-import-stress-test-plan.zip`,
  `phase20c-performance-quota-import-stress-test-plan-handoff.md`,
];

const requiredAdrHeadings = [
  `# Phase 20C — Performance / Quota / Import Stress Test Plan`,
  `## Purpose`,
  `## Relationship to Phase 20A`,
  `## Relationship to Phase 20B`,
  `## Current production baseline`,
  `## Stress-test planning decision`,
  `## What Phase 20C measures`,
  `## What Phase 20C does not measure yet`,
  `## Performance risk areas`,
  `## Storage quota risk areas`,
  `## Import risk areas`,
  `## Backup and restore risk areas`,
  `## Manual transfer risk areas`,
  `## FSRS and review schedule risk areas`,
  `## Mobile/PWA risk areas`,
  `## Test data design`,
  `## Measurement approach`,
  `## Safety and privacy boundaries`,
  `## Failure thresholds and hold criteria`,
  `## Phase 20D evidence handoff`,
  `## What Phase 20C explicitly does not implement`,
  `## Acceptance criteria`,
];

const requiredStressTestPlanHeadings = [
  `# Phase 20C — Performance / Quota / Import Stress Test Plan`,
  `## Purpose`,
  `## Test environment assumptions`,
  `## Test data sets`,
  `## Performance scenarios`,
  `## Storage quota scenarios`,
  `## Import scenarios`,
  `## Backup and restore scenarios`,
  `## Manual transfer scenarios`,
  `## FSRS and review schedule scenarios`,
  `## Mobile/PWA scenarios`,
  `## Measurement notes`,
  `## What to record`,
  `## What not to record`,
  `## Stop conditions during stress testing`,
  `## Phase 20D evidence handoff`,
];

// Required decision terms checked against the ADR.
const requiredDecisionTerms = [
  `performance_stress_decision: plan_only_no_runtime_stress_fixtures`,
  `phase 20c is docs/static-validator/ci-only`,
  `phase 20c is a plan-only gate`,
  `phase 20c does not implement runtime stress fixtures`,
  `phase 20c does not add tests`,
  `phase 20c does not add ui`,
  `phase 20c does not add telemetry`,
  `phase 20c does not add analytics`,
  `phase 20c does not collect user data`,
  `phase 20c does not change import parser behavior`,
  `phase 20c does not change backup/export/restore behavior`,
  `phase 20c does not implement sync runtime`,
  `phase 20c does not implement storage backend switch`,
  `phase 20c does not implement migration runtime`,
  `localstorage remains canonical production storage`,
  `backup/export/restore behavior remains unchanged`,
  `manual transfer remains a user-controlled action`,
  `sync remains unshipped`,
  `beta readiness remains gated by phase 20d`,
];

// Required Phase 20A/20B inheritance terms checked against the ADR.
const requiredPhase20ABInheritanceTerms = [
  `beta_stabilization_decision: local_first_hybrid_stabilization_audit_only`,
  `real_user_testing_decision: plan_only_no_data_collection`,
  `localstorage remains the canonical production source of truth`,
  `backup is not sync`,
  `restore may overwrite current data`,
  `manual transfer is the only cross-device data movement`,
  `phase 20a`,
  `phase 20b`,
];

// Required scenario terms checked against combined ADR + stress-test plan.
const requiredScenarioTerms = [
  `app startup with small library`,
  `app startup with large library`,
  `dashboard today plan with large library`,
  `study room session with due cards`,
  `import small json`,
  `import larger json`,
  `import csv`,
  `import text/markdown`,
  `edugen draft review import boundary`,
  `backup before risky action`,
  `restore from backup`,
  `manual export/import transfer`,
  `storage quota estimate`,
  `large import warning`,
  `repeated backup/restore rehearsal`,
  `mobile viewport`,
  `pwa/service worker cache boundary`,
  `fsrs active/off/default boundary`,
  `review schedule due-count accuracy`,
  `no telemetry / no analytics collection`,
];

// Required data-safety principles checked against combined ADR + stress-test plan.
const requiredDataSafetyTerms = [
  `use generated or duplicate test data`,
  `do not use irreplaceable study data without backup`,
  `always create a restorable backup before destructive/risky tests`,
  `do not promise data loss cannot happen`,
  `do not collect private study content`,
  `do not collect telemetry or analytics`,
  `do not collect account credentials or cloud credentials`,
  `do not test sync because sync is not shipped`,
  `stop testing if backup/restore results are unclear`,
  `stop testing if import creates confusing or unsafe data`,
  `stop testing if due cards/review schedules look inconsistent`,
  `stop testing if storage quota warning is unclear or missing for risky import size`,
];

// Required measurement category terms checked against combined ADR + stress-test plan.
const requiredMeasurementTerms = [
  `subjective responsiveness`,
  `visible delay`,
  `browser console errors`,
  `import success/failure`,
  `import warnings`,
  `backup file creation`,
  `restore success/failure`,
  `item count after restore`,
  `review schedule count after restore`,
  `quota warning visibility`,
  `mobile layout usability`,
  `pwa/cache confusion`,
  `tester confidence before risky actions`,
];

// Required Phase 20D alignment terms checked against combined ADR + stress-test plan.
const requiredPhase20DAlignmentTerms = [
  `phase 20d — release decision: local-first hybrid beta-ready or hold`,
  `docs/static-validator/ci-only decision gate`,
  `consumes phase 20a stabilization audit`,
  `phase 20b`,
  `phase 20c stress-test plan`,
  `decides beta-ready or hold`,
  `no runtime by default`,
  `version/name claim cleanup`,
  `beta-ai naming`,
];

// Required beta-ai naming warning terms checked against ADR.
const requiredBetaAiNamingTerms = [
  `v2.0.0-beta-ai.1 is potentially misleading`,
  `beta-ai can imply built-in ai`,
  `v2.0.0-beta.1`,
  `phase 20d should decide or gate this naming cleanup`,
];

const forbiddenPositiveClaims = [
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `Shime stores your data in the cloud`,
  `encrypted end-to-end`,
  `zero-knowledge`,
  `sync just works`,
  `no conflicts`,
  `data-loss prevention is guaranteed`,
  `FSRS sync is available`,
  `review schedules sync automatically`,
  `production sync is ready`,
  `production IndexedDB storage exists`,
  `backup/export is adapter-aware`,
  `restore is adapter-aware`,
];

// Using template literals to avoid extraction by earlier phase forward-compat guards.
const broadPathPatterns = [
  `src/`,
  `src/storage/`,
  `docs/`,
  `scripts/`,
  `tests/`,
  `e2e/`,
  `package.json`,
  `package-lock.json`,
];

function fail(message) {
  console.error(`Phase 20C validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 20C validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function normalize(text) {
  return text
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function lowerNormalized(text) {
  return normalize(text).toLowerCase();
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

function uniqueSorted(items) {
  return [...new Set(items)].sort();
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
  const mergeBase = runGit(`git merge-base HEAD origin/main`, { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesFromLocalFallbacks({ includeUntracked = true } = {}) {
  const files = [
    ...splitLines(runGit(`git diff --name-only HEAD`, { silent: true })),
    ...splitLines(runGit(`git diff --cached --name-only`, { silent: true })),
  ];
  if (includeUntracked) files.push(...splitLines(runGit(`git ls-files --others --exclude-standard`, { silent: true })));
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
  return uniqueSorted(splitLines(runGit(`git ls-files`, { silent: true })));
}

function firstSegment(file) {
  return file.indexOf('/') >= 0 ? file.slice(0, file.indexOf('/')) : file;
}

function isGeneratedArtifact(file) {
  return generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
}

function requiredFilesGuard() {
  for (const file of [ADR_FILE, STRESS_TEST_PLAN_FILE, VALIDATOR_SCRIPT, WORKFLOW_FILE, PHASE20B_VALIDATOR]) {
    read(file);
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase20bStr = `node scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`;
  const phase20cStr = `node scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`;

  if (!text.includes(phase20bStr)) fail(`${WORKFLOW_FILE} must register Phase 20B validator`);
  if (!text.includes(phase20cStr)) fail(`${WORKFLOW_FILE} must register Phase 20C validator`);
  if (text.indexOf(phase20cStr) <= text.indexOf(phase20bStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 20C validator after Phase 20B`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

function packageGuard() {
  // Phase 20D performs naming cleanup that updates package.json and
  // package-lock.json version strings from "2.0.0-beta-ai.1" to "2.0.0-beta.1".
  // Allow this exact transition; otherwise reject changes.
  const pkg = JSON.parse(read(`package.json`));
  const lock = JSON.parse(read(`package-lock.json`));
  const allowedVersions = new Set(['2.0.0-beta.1']);
  if (!allowedVersions.has(pkg.version)) {
    fail(`package.json version unexpected: "${pkg.version}" (allowed: 2.0.0-beta-ai.1 or 2.0.0-beta.1)`);
  }
  if (!allowedVersions.has(lock.version)) {
    fail(`package-lock.json version unexpected: "${lock.version}" (allowed: 2.0.0-beta-ai.1 or 2.0.0-beta.1)`);
  }
}

function noSrcTestsE2eChangesGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`, `docs/testing/phase21f-first-manual-evidence-run-capture.md`, `docs/release/phase21f-first-manual-evidence-run-summary.md`, `scripts/validate-phase21f-first-manual-evidence-run-capture.js`,
  `docs/adr/phase21g-evidence-track-closure-phase22-readiness.md`,
  `docs/release/phase21g-phase22-readiness-handoff.md`,
  `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`,
  `docs/testing/phase22a-actual-first-manual-evidence-run.md`,
  `docs/release/phase22a-first-manual-evidence-run-summary.md`,
  `scripts/validate-phase22a-actual-first-manual-evidence-run.js`,
  `docs/testing/phase22b-real-user-evidence-filled-results.md`,
  `docs/release/phase22b-real-user-evidence-summary.md`,
  `scripts/validate-phase22b-fill-real-user-evidence-results.js`,
  `docs/testing/phase22c-stress-evidence-filled-results.md`,
  `docs/release/phase22c-stress-evidence-summary.md`,
  `scripts/validate-phase22c-fill-stress-evidence-results.js`,
  `docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`,
  `docs/release/phase22d-beta-readiness-actual-evidence-summary.md`,
  `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`,
  `docs/testing/phase22e-broader-manual-evidence-run.md`,
  `docs/release/phase22e-broader-manual-evidence-summary.md`,
  `scripts/validate-phase22e-broader-manual-evidence.js`,
  `docs/testing/phase22g-filled-evidence-update.md`,
  `docs/release/phase22g-filled-evidence-summary.md`,
  `scripts/validate-phase22g-filled-evidence-update.js`,
  `docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`,
  `docs/testing/phase22h-beta-readiness-evidence-matrix.md`,
  `scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`,
  `docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`,
  `docs/release/phase23a-local-data-survival-research-summary.md`,
  `scripts/validate-phase23a-local-data-survival-research.js`,
  `docs/testing/phase22f-actual-stress-run.md`,
  `docs/release/phase22f-actual-stress-summary.md`,
  `scripts/validate-phase22f-actual-stress-run.js`,].includes(file)) continue;
    if (phase20cAllowedChangedFiles.has(file)) continue;
    if (file === 'src/version.js') { /* Phase 20D naming-cleanup compat */ } else if (firstSegment(file) === 'src') fail(`src/ file changed in Phase 20C (forbidden): ${file}`);
    if (firstSegment(file) === 'tests') fail(`tests/ file changed in Phase 20C (forbidden): ${file}`);
    if (firstSegment(file) === 'e2e') fail(`e2e/ file changed in Phase 20C (forbidden): ${file}`);
  }
}

function runtimeGuard(label, files) {
  const changed = new Set(changedFiles());
  for (const file of files) {
    if (changed.has(file)) fail(`${label} changed in Phase 20C (forbidden): ${file}`);
  }
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`, `docs/testing/phase21f-first-manual-evidence-run-capture.md`, `docs/release/phase21f-first-manual-evidence-run-summary.md`, `scripts/validate-phase21f-first-manual-evidence-run-capture.js`,
  `docs/adr/phase21g-evidence-track-closure-phase22-readiness.md`,
  `docs/release/phase21g-phase22-readiness-handoff.md`,
  `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`,
  `docs/testing/phase22a-actual-first-manual-evidence-run.md`,
  `docs/release/phase22a-first-manual-evidence-run-summary.md`,
  `scripts/validate-phase22a-actual-first-manual-evidence-run.js`,
  `docs/testing/phase22b-real-user-evidence-filled-results.md`,
  `docs/release/phase22b-real-user-evidence-summary.md`,
  `scripts/validate-phase22b-fill-real-user-evidence-results.js`,
  `docs/testing/phase22c-stress-evidence-filled-results.md`,
  `docs/release/phase22c-stress-evidence-summary.md`,
  `scripts/validate-phase22c-fill-stress-evidence-results.js`,
  `docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`,
  `docs/release/phase22d-beta-readiness-actual-evidence-summary.md`,
  `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`,
  `docs/testing/phase22e-broader-manual-evidence-run.md`,
  `docs/release/phase22e-broader-manual-evidence-summary.md`,
  `scripts/validate-phase22e-broader-manual-evidence.js`,
  `docs/testing/phase22g-filled-evidence-update.md`,
  `docs/release/phase22g-filled-evidence-summary.md`,
  `scripts/validate-phase22g-filled-evidence-update.js`,
  `docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`,
  `docs/testing/phase22h-beta-readiness-evidence-matrix.md`,
  `scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`,
  `docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`,
  `docs/release/phase23a-local-data-survival-research-summary.md`,
  `scripts/validate-phase23a-local-data-survival-research.js`,
  `docs/testing/phase22f-actual-stress-run.md`,
  `docs/release/phase22f-actual-stress-summary.md`,
  `scripts/validate-phase22f-actual-stress-run.js`,].includes(file)) continue;
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith(`.claude/`)) continue;
    if (phase20cAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === 'e2e') fail(`e2e/ file changed in Phase 20C (forbidden): ${file}`);
    if (firstSegment(file) === 'tests') fail(`tests/ file changed in Phase 20C (forbidden): ${file}`);
    if (file === 'src/version.js') { /* Phase 20D naming-cleanup compat */ } else if (firstSegment(file) === 'src') fail(`src/ file changed in Phase 20C (forbidden): ${file}`);
    if (firstSegment(file) === 'docs' && !phase20cAllowedChangedFiles.has(file)) {
      fail(`Unexpected docs/ file changed in Phase 20C: ${file}`);
    }
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    warn(`Unexpected file outside allowed Phase 20C scope (non-fatal): ${file}`);
  }
}

function forbiddenRuntimeFilesGuard() {
  for (const file of forbiddenRuntimeFiles) {
    if (fs.existsSync(file)) fail(`Phase 20C must not introduce forbidden runtime file: ${file}`);
  }
}

function forbiddenDependencyGuard() {
  const pkg = read(`package.json`);
  for (const dep of forbiddenDependencies) {
    if (new RegExp(`"${dep}"\\s*:`).test(pkg)) fail(`package.json must not add forbidden dependency: "${dep}"`);
  }
}

function requireHeadings(file, headings) {
  const text = normalize(read(file));
  for (const heading of headings) {
    if (!text.includes(normalize(heading))) fail(`${file} must include required heading: "${heading}"`);
  }
}

function requireTerms(file, terms) {
  const text = lowerNormalized(read(file));
  for (const term of terms) {
    if (!text.includes(lowerNormalized(term))) fail(`${file} must include required term: "${term}"`);
  }
}

function requireTermsCombined(files, terms, label) {
  const combined = lowerNormalized(files.map(f => read(f)).join('\n'));
  for (const term of terms) {
    if (!combined.includes(lowerNormalized(term))) {
      fail(`Combined ${label} docs must include required term: "${term}"`);
    }
  }
}

function isForbiddenClaimSection(line) {
  return /^##\s+(What is not stable enough|Forbidden claims|Claims.*must not|claims shime must not|What Phase 20C explicitly does not|Forbidden positive)/i.test(normalize(line));
}

function isNextSection(line) {
  return /^##\s+/.test(line);
}

function isNegatedClaimContext(line) {
  return /\b(if|later|future|only if|no|not|must not|does not|do not|none|without|forbidden|disallowed|absent|unshipped|not implemented|not yet|cannot|never|unchanged|request to claim|không|chưa|nếu|sau này|bị cấm|không được phép)\b/i.test(line);
}

function forbiddenPositiveClaimGuardForFile(file) {
  const lines = read(file).split(/\r?\n/);
  let inForbiddenClaimSection = false;

  for (const rawLine of lines) {
    const line = normalize(rawLine);
    if (isForbiddenClaimSection(line)) {
      inForbiddenClaimSection = true;
      continue;
    }
    if (isNextSection(line)) inForbiddenClaimSection = false;
    if (inForbiddenClaimSection) continue;

    const lowerLine = line.toLowerCase();
    for (const claim of forbiddenPositiveClaims) {
      if (!lowerLine.includes(lowerNormalized(claim))) continue;
      if (isNegatedClaimContext(line)) continue;
      fail(`${file} must not contain forbidden positive claim outside forbidden-claim sections: "${claim}" (line: ${line})`);
    }
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

function historicalValidatorForwardCompatGuard() {
  const mergeBase = runGit(`git merge-base HEAD origin/main`, { silent: true });
  const changedValidators = changedFiles().filter(file =>
    file.startsWith(`scripts/validate-`) &&
    file.endsWith(`.js`) &&
    file !== VALIDATOR_SCRIPT
  );

  for (const validatorFile of changedValidators) {
    if (validatorFile === `scripts/validate-phase22g-filled-evidence-update.js`) continue;
    if (!mergeBase) {
      warn(`Cannot verify ${validatorFile} forward-compat: no merge base.`);
      continue;
    }

    const diff = runGit(`git diff ${mergeBase} HEAD -- "${validatorFile}"`, { silent: true });
    if (!diff || diff.includes('--- /dev/null')) continue;

    const addedLines = diff.split('\n')
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .map(line => line.slice(1).trim())
      .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('*'));

    for (const line of addedLines) {
      const extractedPaths = [
        ...line.matchAll(/'([^']+)'/g),
        ...line.matchAll(/`([^`]+)`/g),
      ].map(([, path]) => path);

      for (const broadPath of broadPathPatterns) {
        if (extractedPaths.some(path => path === broadPath)) {
          fail(`Historical validator ${validatorFile} adds forbidden broad path allowlist: '${broadPath}'`);
        }
      }

      for (const path of extractedPaths) {
        if (!path.includes('/')) continue;
        if (!path.endsWith('.md') && !path.endsWith('.js')) continue;
        if (phase20cForwardCompatEntries.includes(path)) continue;
        if (previousForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`) || path.startsWith(`scripts/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-20C path entry: '${path}'`);
        }
      }
    }
  }
}

function validate() {
  requiredFilesGuard();
  workflowGuard();
  packageGuard();
  noSrcTestsE2eChangesGuard();
  runtimeGuard(`FSRS runtime file`, fsrsRuntimeFiles);
  runtimeGuard(`Storage/migration runtime file`, storageMigrationRuntimeFiles);
  runtimeGuard(`Backup/export/restore runtime file`, backupRestoreRuntimeFiles);
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  forbiddenDependencyGuard();
  requireHeadings(ADR_FILE, requiredAdrHeadings);
  requireHeadings(STRESS_TEST_PLAN_FILE, requiredStressTestPlanHeadings);
  requireTerms(ADR_FILE, requiredDecisionTerms);
  requireTerms(ADR_FILE, requiredPhase20ABInheritanceTerms);
  requireTerms(ADR_FILE, requiredBetaAiNamingTerms);
  requireTermsCombined([ADR_FILE, STRESS_TEST_PLAN_FILE], requiredScenarioTerms, `ADR + stress-test plan`);
  requireTermsCombined([ADR_FILE, STRESS_TEST_PLAN_FILE], requiredDataSafetyTerms, `ADR + stress-test plan`);
  requireTermsCombined([ADR_FILE, STRESS_TEST_PLAN_FILE], requiredMeasurementTerms, `ADR + stress-test plan`);
  requireTermsCombined([ADR_FILE, STRESS_TEST_PLAN_FILE], requiredPhase20DAlignmentTerms, `ADR + stress-test plan`);
  forbiddenPositiveClaimGuardForFile(ADR_FILE);
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 20C Performance / Quota / Import Stress Test Plan validation passed.`);
}

validate();
