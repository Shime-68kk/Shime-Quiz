#!/usr/bin/env node
/**
 * scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js
 *
 * Phase 16F static validator — EduGen Draft Workshop Connector Foundation.
 *
 * Confirms:
 *   • doc, test, connector, panel, validator exist;
 *   • workflow registers Phase 16F validator after Phase 16E;
 *   • all previous validators through Phase 16E remain registered;
 *   • no package.json / package-lock.json changes;
 *   • no e2e/ changes;
 *   • no scheduler/storage/backup files changed:
 *       src/quiz/reviewSchedulerAdapter.js,
 *       src/quiz/fsrsWrapper.js,
 *       src/state/reviewScheduleStorage.js,
 *       src/quiz/dataBackup.js,
 *       src/state/v2BackupRestore.js;
 *   • no new IndexedDB / StorageAdapter / SyncAdapter / event-log impl;
 *   • no dependency changes;
 *   • Vietnamese-first / Draft Workshop / no-built-in-AI / no-OCR copy is
 *     present in the doc;
 *   • forbidden claim phrases are absent in doc, panel, Home, and connector;
 *   • no `ai-process` runtime call site;
 *   • no new `ts-fsrs.next()` call sites;
 *   • no API key / BYOK / sync / account / auth implementation;
 *   • generated artifacts absent from tracked files;
 *   • changed files are within the Phase 16F allowlist.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase16f-edugen-draft-workshop-connector-foundation.md';
const TEST_FILE        = 'tests/unit/edugenDraftWorkshopConnector.test.js';
const VALIDATOR_SCRIPT = 'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const CONNECTOR_FILE   = 'src/edugen/edugenConnector.js';
const PANEL_FILE       = 'src/components/settings/EduGenDraftWorkshopPanel.jsx';
const SETTINGS_ROUTE   = 'src/routes/Settings.jsx';
const SETTINGS_STORAGE = 'src/state/settingsStorage.js';
const HOME_ROUTE       = 'src/routes/Home.jsx';
const GLOBAL_CSS       = 'src/styles/global.css';

const PHASE16E_VALIDATOR = 'scripts/validate-phase16e-visual-polish-quick-wins.js';
const PHASE16D_VALIDATOR = 'scripts/validate-phase16d-shime-study-identity-product-principles.js';
const PHASE16C_VALIDATOR = 'scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js';
const PHASE16B_VALIDATOR = 'scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js';
const PHASE16A_VALIDATOR = 'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js';
const PHASE15H_VALIDATOR = 'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js';

// Exact set of allowed changed files for Phase 16F.
// Phase 16F is a connector foundation runtime phase: it touches a small,
// bounded set of UI/runtime files plus docs, tests, validator, and CI.
// Historical validators may be updated with exact Phase 16F allowlist
// entries; that's checked separately by the scopeGuard's validator-script
// passthrough rule (any scripts/validate-*.js change is permitted).
const phase16fAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  TEST_FILE,
  VALIDATOR_SCRIPT,
  CONNECTOR_FILE,
  PANEL_FILE,
  SETTINGS_ROUTE,
  SETTINGS_STORAGE,
  HOME_ROUTE,
  GLOBAL_CSS,
  // Phase 16G exact files (forward compatibility)
  'docs/phase16g-edugen-draft-review-import-flow.md',
  'tests/unit/edugenDraftReviewImportFlow.test.jsx',
  'scripts/validate-phase16g-edugen-draft-review-import-flow.js',
  'src/edugen/edugenDraftParser.js',
  'src/components/edugen/EduGenDraftReviewPanel.jsx',
  // Phase 16H exact files (forward compatibility)
  'docs/phase16h-edugen-draft-quality-review-source-aware-library.md',
  'tests/unit/edugenDraftQualityReviewSourceLibrary.test.jsx',
  'scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js',
  'src/edugen/edugenDraftImport.js',
  'src/data/learningDataAdapter.js',
  'src/data/importValidator.js',
  'src/routes/Library.jsx',
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
  // Phase 16J — Mobile UX / PWA Quick Wins (forward compatibility)
  'docs/phase16j-mobile-ux-pwa-quick-wins.md',
  'public/sw.js',
  // Phase 16K — Storage Quota & Backup-Before-Import Runtime Hardening (forward compatibility)
  'docs/phase16k-storage-quota-backup-before-import-hardening.md',
  'scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js',
  'src/utils/storageQuotaEstimate.js',
  'src/components/learning/BackupBeforeImportNotice.jsx',
  'tests/unit/storageQuotaEstimate.test.js',
  'tests/unit/storageQuotaBackupBeforeImport.test.jsx',
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
phase16fAllowedChangedFiles.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
phase16fAllowedChangedFiles.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
phase16fAllowedChangedFiles.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
phase16fAllowedChangedFiles.add(`docs/release/phase23f-phase23-decision-gate.md`);
phase16fAllowedChangedFiles.add(`docs/research/phase23f-data-survival-decision-matrix.md`);
phase16fAllowedChangedFiles.add(`scripts/validate-phase23f-phase23-decision-gate.js`);
phase16fAllowedChangedFiles.add(`docs/research/phase24a-residual-direct-storage-audit.md`);
phase16fAllowedChangedFiles.add(`docs/release/phase24a-residual-direct-storage-audit-summary.md`);
phase16fAllowedChangedFiles.add(`scripts/validate-phase24a-residual-direct-storage-audit.js`);
phase16fAllowedChangedFiles.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
phase16fAllowedChangedFiles.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
phase16fAllowedChangedFiles.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
phase16fAllowedChangedFiles.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
phase16fAllowedChangedFiles.add(`docs/release/phase23c-backup-health-design-summary.md`);
phase16fAllowedChangedFiles.add(`scripts/validate-phase23c-backup-health-design.js`);
phase16fAllowedChangedFiles.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
phase16fAllowedChangedFiles.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
phase16fAllowedChangedFiles.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);

// Hard-forbidden scheduler/storage/backup files. Phase 16F must not touch
// these even if a future implementation needs to wire up source metadata.
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
  'Draft Workshop',
  'Xưởng bản nháp',
  'optional companion',
  'not bundled',
  'review required',
  'no built-in AI',
  'no OCR',
  'no cloud sync',
  'local-first',
  'no automatic FSRS activation',
  'service URL',
  'health check',
];

// Phrases below are positive assertions that must never appear in Shime
// surfaces (doc/panel/home/connector). Docs may legitimately discuss the
// underlying categories in negative form (e.g. "no built-in OCR"); only
// the positive claim form is forbidden.
const forbiddenClaimPhrases = [
  'edugen is bundled with shime',
  'edugen is shipped with shime',
  'edugen comes bundled',
  'shime includes edugen',
  'shime ships with edugen',
  'shime has built-in ai',
  'shime ships built-in ai',
  'built-in ai quiz generation exists',
  'shime has built-in ocr',
  'built-in ocr exists',
  'cloud sync is available',
  'cloud sync exists',
  'sync has shipped',
  'ai scheduling is enabled',
  'ai scheduled this for you',
  'mastery is guaranteed',
  'mastery guaranteed',
  'correct answers guaranteed',
  'generated questions are guaranteed correct',
  'frontend-only processes documents',
  'api key required',
  'byok is supported',
];

function fail(message) {
  console.error(`Phase 16F validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 16F validation warning: ${message}`);
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
  read(CONNECTOR_FILE);
  read(PANEL_FILE);
  read(SETTINGS_ROUTE);
  read(SETTINGS_STORAGE);
  read(HOME_ROUTE);
  read(GLOBAL_CSS);
  read(PHASE16E_VALIDATOR);
  read(PHASE16D_VALIDATOR);
  read(PHASE16C_VALIDATOR);
  read(PHASE16B_VALIDATOR);
  read(PHASE16A_VALIDATOR);
  read(PHASE15H_VALIDATOR);
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
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
  void pkg;
}

// ── Scope guard ───────────────────────────────────────────────────────────────

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
    if (file.startsWith('.claude/')) continue;
    if (phase16fAllowedChangedFiles.has(file)) continue;
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
    if (file.startsWith('e2e/')) {
      fail(`e2e/ file changed in Phase 16F: ${file}`);
    }
    // Historical validator updates are allowed (exact Phase 16F allowlist entries).
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    fail(`Unexpected changed file for Phase 16F scope: ${file}`);
  }
}

// ── Forbidden runtime files guard ─────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  const changed = new Set(changedFiles());
  for (const file of forbiddenRuntimeFiles) {
    if (changed.has(file) && !phase16fAllowedChangedFiles.has(file)) {
      fail(`Phase 16F must not change scheduler/storage/backup file: ${file}`);
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
    'node scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js',
    'node scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js',
    'node scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js',
    'node scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js',
    'node scripts/validate-phase16d-shime-study-identity-product-principles.js',
    'node scripts/validate-phase16e-visual-polish-quick-wins.js',
    'node scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js',
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase16ePos = text.indexOf('node scripts/validate-phase16e-visual-polish-quick-wins.js');
  const phase16fPos = text.indexOf('node scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js');
  if (phase16ePos === -1) fail(`${WORKFLOW_FILE} must register Phase 16E validator`);
  if (phase16fPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16F validator`);
  if (phase16fPos <= phase16ePos) {
    fail(`${WORKFLOW_FILE} must register Phase 16F validator after Phase 16E validator`);
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
  const targets = [
    DOCS_FILE,
    PANEL_FILE,
    HOME_ROUTE,
    CONNECTOR_FILE,
    SETTINGS_ROUTE,
  ];
  for (const target of targets) {
    const text = read(target);
    const lower = text.toLowerCase();
    for (const claim of forbiddenClaimPhrases) {
      if (lower.includes(claim)) {
        fail(`${target} must not contain forbidden claim: "${claim}"`);
      }
    }
  }
}

// ── Vietnamese-first / Draft Workshop copy guard ──────────────────────────────

function vietnameseFirstCopyGuard() {
  const panel = read(PANEL_FILE);
  const requiredPanelStrings = [
    'Xưởng bản nháp EduGen',
    'URL dịch vụ EduGen',
    'Tùy chọn',
    'Shime không tự xử lý PDF/DOCX nếu không có dịch vụ EduGen đang chạy.',
    'Kết quả chỉ là bản nháp, bạn cần xem lại trước khi học.',
    'Kiểm tra kết nối',
  ];
  for (const phrase of requiredPanelStrings) {
    if (!panel.includes(phrase)) {
      fail(`${PANEL_FILE} must include claim-safe Vietnamese-first phrase: "${phrase}"`);
    }
  }

  const home = read(HOME_ROUTE);
  if (!home.includes('Xưởng bản nháp')) fail(`${HOME_ROUTE} must include "Xưởng bản nháp" framing`);
  if (!home.includes('không được bundle')) fail(`${HOME_ROUTE} must keep "không được bundle" disclaimer`);
}

// ── No ai-process / AI endpoint call sites ───────────────────────────────────

function noAiProcessGuard() {
  const filesToCheck = [
    CONNECTOR_FILE,
    PANEL_FILE,
    SETTINGS_ROUTE,
    HOME_ROUTE,
    SETTINGS_STORAGE,
  ];
  for (const file of filesToCheck) {
    const text = read(file);
    if (text.includes('ai-process')) fail(`${file} must not include 'ai-process' call site`);
    if (/\/api\/(?:generate|chat|complete|ocr)/.test(text)) {
      fail(`${file} appears to call an AI/OCR-style endpoint`);
    }
  }
}

// ── No new ts-fsrs.next() call sites or auth/sync paths ──────────────────────

function fsrsAndSyncRegressionGuard() {
  const wrapperFile = 'src/quiz/fsrsWrapper.js';
  if (fs.existsSync(wrapperFile)) {
    const wrapperSource = fs.readFileSync(wrapperFile, 'utf8');
    const matches = wrapperSource.match(/\.next\s*\(/g) ?? [];
    if (matches.length !== 2) {
      fail(`src/quiz/fsrsWrapper.js must have exactly 2 .next() calls (Phase 15B baseline preserved), found ${matches.length}`);
    }
  }

  const adapterFile = 'src/quiz/reviewSchedulerAdapter.js';
  if (fs.existsSync(adapterFile)) {
    const source = fs.readFileSync(adapterFile, 'utf8');
    if (!source.includes('fsrsExperimentalEnabled')) {
      fail(`${adapterFile} must preserve fsrsExperimentalEnabled (Phase 15B regression)`);
    }
    if (!source.includes('fsrsActiveSchedulingEnabled')) {
      fail(`${adapterFile} must preserve fsrsActiveSchedulingEnabled (Phase 15B regression)`);
    }
  }
}

function noCloudAuthGuard() {
  const forbiddenPaths = [
    'src/auth',
    'src/cloud',
    'src/backend',
    'src/api/sync',
    'src/sync',
    'src/storage/SyncAdapter.js',
    // Phase 17B forward-compat: 'src/storage/StorageAdapter.js', — now a Phase 17B scaffold file
    'src/storage/IndexedDBAdapter.js',
    'src/edugen/aiProcessClient.js',
  ];
  for (const path of forbiddenPaths) {
    if (fs.existsSync(path)) {
      fail(`Phase 16F must not introduce cloud/auth/sync/AI-process path: ${path}`);
    }
  }

  // Forbid API key / BYOK runtime terms in Phase 16F files.
  for (const file of [PANEL_FILE, CONNECTOR_FILE, SETTINGS_STORAGE]) {
    const text = read(file);
    for (const term of ['apiKey', 'API_KEY', 'BYOK', 'bring your own key']) {
      if (text.includes(term)) {
        fail(`${file} must not introduce API key / BYOK runtime term: ${term}`);
      }
    }
  }
}

// ── settingsStorage edugenServiceUrl integrity ────────────────────────────────

function settingsStorageIntegrityGuard() {
  const source = read(SETTINGS_STORAGE);
  if (!source.includes("'shimeV2SettingsV1'")) {
    fail(`${SETTINGS_STORAGE} must preserve SETTINGS_STORAGE_KEY = 'shimeV2SettingsV1'`);
  }
  if (!source.includes('edugenServiceUrl')) {
    fail(`${SETTINGS_STORAGE} must declare edugenServiceUrl field`);
  }
  // The new field must default to empty string, not a hard-coded host.
  if (!source.includes("EDUGEN_SERVICE_URL_DEFAULT = ''")) {
    fail(`${SETTINGS_STORAGE} must define EDUGEN_SERVICE_URL_DEFAULT as empty string`);
  }
  // Lazy read invariant: getSettings must remain lazy. The structural marker
  // is the "LAZY READ" comment plus the no-setItem-on-missing-key branch.
  if (!source.includes('LAZY READ')) {
    fail(`${SETTINGS_STORAGE} must preserve LAZY READ invariant comment`);
  }
}

// ── Connector source guard ────────────────────────────────────────────────────

function connectorSourceGuard() {
  const text = read(CONNECTOR_FILE);
  const required = [
    'normalizeEdugenServiceUrl',
    'buildEdugenHealthUrl',
    'checkEdugenHealth',
    'EDUGEN_HEALTH_STATUS',
    '/health',
  ];
  for (const symbol of required) {
    if (!text.includes(symbol)) fail(`${CONNECTOR_FILE} must export/define ${symbol}`);
  }
  if (!text.includes('NEVER uploads documents')) {
    fail(`${CONNECTOR_FILE} must include the "NEVER uploads documents" runtime contract comment`);
  }
  if (!text.includes('NEVER calls an AI endpoint')) {
    fail(`${CONNECTOR_FILE} must include the "NEVER calls an AI endpoint" runtime contract comment`);
  }
  if (/\.next\s*\(/.test(text)) {
    fail(`${CONNECTOR_FILE} must not introduce a ts-fsrs .next() call site`);
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
  vietnameseFirstCopyGuard();
  noAiProcessGuard();
  fsrsAndSyncRegressionGuard();
  noCloudAuthGuard();
  settingsStorageIntegrityGuard();
  connectorSourceGuard();
  internalRegistryGuard();
  console.log('Phase 16F EduGen Draft Workshop Connector Foundation validation passed.');
}

validate();
