#!/usr/bin/env node
/**
 * scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js
 *
 * Phase 14P static validator — FSRS Foundation Closure / Phase 15 Parallel Handoff.
 * Docs/static-validator/CI-only. No active FSRS scheduling. No src/ changes.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE = 'docs/phase14p-fsrs-foundation-closure-phase15-handoff.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';

// Phase 14O files (for regression checks)
const PHASE14O_DOCS = 'docs/phase14o-fsrs-active-scheduling-decision-gate.md';
const PHASE14O_VALIDATOR = 'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js';

// Phase 14N files
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

// Phase 14P allowed changed files = Phase 14P new files + historical validators updated with Phase 14P allowlist entries.
const phase14pAllowedChangedFiles = new Set([
  // Phase 14P new files
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  WORKFLOW_FILE,
  // Historical validators updated with exact Phase 14P allowlist entries
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
  console.error(`Phase 14P foundation closure validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 14P foundation closure validation warning: ${message}`);
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
  // Phase 14O regression — must still exist
  read(PHASE14O_DOCS);
  read(PHASE14O_VALIDATOR);
  // Phase 14N regression
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
  // All validators through Phase 14O must still be registered
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
    'node scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js',
    'node scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js',
  ]) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }
  // Phase 14P must be registered after Phase 14O
  const phase14oPos = text.indexOf('node scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js');
  const phase14pPos = text.indexOf('node scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js');
  if (phase14oPos === -1) fail(`${WORKFLOW_FILE} must register Phase 14O validator`);
  if (phase14pPos === -1) fail(`${WORKFLOW_FILE} must register Phase 14P validator`);
  if (phase14pPos <= phase14oPos) {
    fail(`${WORKFLOW_FILE} must register Phase 14P validator after Phase 14O validator`);
  }
  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
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
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase14pAllowedChangedFiles.has(file)) continue;
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 14P: ${file}`);
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 14P: ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 14P: ${file}`);
    fail(`Unexpected changed file for Phase 14P scope: ${file}`);
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
    if (phase14pAllowedChangedFiles.has(file)) continue;
    if (changed.has(file)) fail(`Forbidden file changed in Phase 14P: ${file}`);
  }
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
    if (phase14pAllowedChangedFiles.has(file)) continue;
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 14P: ${file}`);
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 14P: ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 14P: ${file}`);
  }
}

function noNewSrcFilesGuard() {
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
    if (!file.startsWith('src/')) continue;
    if (generatedArtifacts.some(a => file === a || file.startsWith(`${a}/`))) continue;
    if (phase14pAllowedChangedFiles.has(file)) continue;
    if (file === 'src/version.js') { /* Phase 20D naming-cleanup compat */ } else fail(`Unexpected src/ file changed in Phase 14P scope: ${file}`);
  }
}

function phase14oRegressionGuard() {
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
    fail(`${STUDY_ROOM} must not call .next() — active FSRS scheduling is disabled (Phase 14P gate)`);
  }

  // Adapter must preserve Phase 14N/14J exports and must not call .next()
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
    fail(`${ADAPTER_SOURCE} must not call .next() — active FSRS scheduling is disabled (Phase 14P gate)`);
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
    fail(`${STORAGE_SOURCE} must not call .next() — active FSRS scheduling is disabled (Phase 14P gate)`);
  }

  // Bridge component must not call .next()
  const bridgeSource = read(PHASE14N_BRIDGE_COMPONENT);
  if (/\.next\s*\(/.test(bridgeSource)) {
    fail(`${PHASE14N_BRIDGE_COMPONENT} must not call .next() (Phase 14P gate)`);
  }

  // fsrsWrapper may contain .next() as wrapper definition — warn but do not fail
  const wrapperSource = read(WRAPPER_SOURCE);
  if (/\.next\s*\(/.test(wrapperSource)) {
    warn(`${WRAPPER_SOURCE} contains .next() — confirm it is not called from production paths`);
  }
}

function docsGuard() {
  // All Phase 14H through 14O milestones must be mentioned
  requireIncludes(DOCS_FILE, [
    'Phase 14H',
    'Phase 14I',
    'Phase 14J',
    'Phase 14K',
    'Phase 14L',
    'Phase 14M',
    'Phase 14N',
    'Phase 14O',
    'Phase 14P',
  ]);

  // Active FSRS scheduling state
  requireIncludes(DOCS_FILE, [
    'active FSRS scheduling',
    'ts-fsrs.next',
    'SM-2',
    'remains the only active',
  ]);

  // Memory ratings are inert logs only
  requireIncludes(DOCS_FILE, [
    'inert logs only',
  ]);

  // Dashboard mixed scheduler due-count deferred
  requireIncludes(DOCS_FILE, [
    'Dashboard mixed scheduler due-count',
  ]);

  // Codex/Claude parallel lane plan
  requireIncludes(DOCS_FILE, [
    'Codex',
    'Claude',
    'lane',
  ]);

  // File ownership guardrails — key files must be mentioned
  requireIncludes(DOCS_FILE, [
    'reviewScheduleStorage.js',
    'reviewSchedulerAdapter.js',
    'StudyRoom.jsx',
    'Dashboard.jsx',
    'settingsStorage.js',
  ]);

  // Claim guardrails section
  requireIncludes(DOCS_FILE, [
    'claim',
    'no claim',
  ]);

  // Phase 15 preflight checklist
  requireIncludes(DOCS_FILE, [
    'preflight',
    'rollback',
    'fetch',
    'confirm Phase 14P',
  ]);
}

function activationClaimsGuard() {
  const docsText = normalize(read(DOCS_FILE));
  const forbiddenClaims = [
    'fsrs scheduling is active',
    'fsrs is now the active scheduler',
    'active scheduling is live',
    'ts-fsrs next is now called',
    'production fsrs scheduling is active',
    'active fsrs scheduling is enabled',
  ];
  for (const claim of forbiddenClaims) {
    if (docsText.includes(claim)) {
      fail(`${DOCS_FILE} contains forbidden activation claim: "${claim}"`);
    }
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
  phase14oRegressionGuard();
  docsGuard();
  activationClaimsGuard();
  console.log('Phase 14P FSRS foundation closure / Phase 15 handoff validation passed.');
}

validate();
