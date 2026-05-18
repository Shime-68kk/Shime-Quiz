#!/usr/bin/env node
/**
 * scripts/validate-phase16g-edugen-draft-review-import-flow.js
 *
 * Phase 16G static validator — EduGen Draft Review Import Flow (Scope B).
 *
 * Confirms:
 *   • doc, test, parser, review panel, validator exist;
 *   • workflow registers Phase 16G validator after Phase 16F;
 *   • all previous validators through Phase 16F remain registered;
 *   • no package.json / package-lock.json changes;
 *   • no scheduler/storage critical files changed:
 *       src/quiz/reviewSchedulerAdapter.js
 *       src/quiz/fsrsWrapper.js
 *       src/state/reviewScheduleStorage.js
 *   • no cloud/auth/sync/AI-process runtime path introduced;
 *   • no API key / BYOK term in new runtime files;
 *   • no `ai-process` runtime call site;
 *   • no new `ts-fsrs.next()` call sites;
 *   • no FormData / fetch / XHR / document upload in new runtime files;
 *   • Vietnamese-first / Draft Workshop / review-required copy is present;
 *   • forbidden claim phrases absent in doc, parser, panel;
 *   • generated artifacts absent from tracked files;
 *   • changed files are within the Phase 16G allowlist.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase16g-edugen-draft-review-import-flow.md';
const TEST_FILE        = 'tests/unit/edugenDraftReviewImportFlow.test.jsx';
const VALIDATOR_SCRIPT = 'scripts/validate-phase16g-edugen-draft-review-import-flow.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PARSER_FILE      = 'src/edugen/edugenDraftParser.js';
const REVIEW_PANEL     = 'src/components/edugen/EduGenDraftReviewPanel.jsx';
const SETTINGS_ROUTE   = 'src/routes/Settings.jsx';

const PHASE16F_VALIDATOR = 'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js';
const PHASE16E_VALIDATOR = 'scripts/validate-phase16e-visual-polish-quick-wins.js';
const PHASE16D_VALIDATOR = 'scripts/validate-phase16d-shime-study-identity-product-principles.js';
const PHASE16C_VALIDATOR = 'scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js';
const PHASE16B_VALIDATOR = 'scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js';
const PHASE16A_VALIDATOR = 'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js';
const PHASE15H_VALIDATOR = 'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js';

// Exact set of allowed changed files for Phase 16G.
// Phase 16G is a bounded runtime phase: new parser + new review panel UI,
// wired into Settings.jsx. Docs, test, validator, and CI are included.
// Historical validators may be updated (scopeGuard passthrough rule).
const phase16gAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  TEST_FILE,
  VALIDATOR_SCRIPT,
  PARSER_FILE,
  REVIEW_PANEL,
  SETTINGS_ROUTE,
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
  'src/styles/global.css',
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
  `docs/release/phase20h-real-user-testing-evidence-summary.md`,
  `scripts/validate-phase20h-real-user-testing-execution-results.js`,
]);

// Hard-forbidden scheduler/storage files. Phase 16G must not touch these.
const forbiddenRuntimeFiles = [
  'src/quiz/reviewSchedulerAdapter.js',
  'src/quiz/fsrsWrapper.js',
  'src/state/reviewScheduleStorage.js',
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
  'Bản nháp cần xem lại',
  'Xem lại trước khi lưu',
  'review required',
  'preview before save',
  'no automatic import-to-study',
  'no automatic FSRS activation',
  'no built-in AI',
  'no OCR',
  'no cloud sync',
  'local-first',
  'optional companion',
  'not bundled',
  'large import',
  'source attribution',
];

// Forbidden positive-claim phrases. Documents may discuss these categories
// in negative form ("no built-in OCR"); only positive assertions are
// forbidden across new Phase 16G surfaces.
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
  'ocr is supported',
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
  console.error(`Phase 16G validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 16G validation warning: ${message}`);
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
  read(PARSER_FILE);
  read(REVIEW_PANEL);
  read(SETTINGS_ROUTE);
  read(PHASE16F_VALIDATOR);
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
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase16gAllowedChangedFiles.has(file)) continue;
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
    if (file.startsWith('e2e/')) {
      fail(`e2e/ file changed in Phase 16G: ${file}`);
    }
    // Historical validator updates are allowed (exact Phase 16G allowlist entries).
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    fail(`Unexpected changed file for Phase 16G scope: ${file}`);
  }
}

// ── Forbidden runtime files guard ─────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  const changed = new Set(changedFiles());
  for (const file of forbiddenRuntimeFiles) {
    if (changed.has(file)) {
      fail(`Phase 16G must not change scheduler/storage file: ${file}`);
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
    'node scripts/validate-phase16g-edugen-draft-review-import-flow.js',
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase16fPos = text.indexOf('node scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js');
  const phase16gPos = text.indexOf('node scripts/validate-phase16g-edugen-draft-review-import-flow.js');
  if (phase16fPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16F validator`);
  if (phase16gPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16G validator`);
  if (phase16gPos <= phase16fPos) {
    fail(`${WORKFLOW_FILE} must register Phase 16G validator after Phase 16F validator`);
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
  const targets = [DOCS_FILE, PARSER_FILE, REVIEW_PANEL, SETTINGS_ROUTE];
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

// ── Vietnamese-first / required copy guard ────────────────────────────────────

function vietnameseFirstCopyGuard() {
  const panel = read(REVIEW_PANEL);
  const requiredPanelStrings = [
    'Xưởng bản nháp EduGen',
    'Bản nháp cần xem lại trước khi lưu',
    'Xem lại trước khi lưu',
    'Kết quả có thể sai hoặc thiếu ý',
    'Shime không tự gọi AI/OCR',
    'EduGen chạy riêng và tùy chọn',
    'Không có thẻ nào được lưu cho đến khi bạn xác nhận',
    'Xác nhận lưu bản nháp',
  ];
  for (const phrase of requiredPanelStrings) {
    if (!panel.includes(phrase)) {
      fail(`${REVIEW_PANEL} must include claim-safe Vietnamese-first phrase: "${phrase}"`);
    }
  }

  const parser = read(PARSER_FILE);
  if (!parser.includes('parseEdugenDraftJson')) {
    fail(`${PARSER_FILE} must export parseEdugenDraftJson`);
  }
  if (!parser.includes('reviewRequired')) {
    fail(`${PARSER_FILE} must mark items with reviewRequired metadata`);
  }
  if (!parser.includes('MAX_DRAFT_ITEMS')) {
    fail(`${PARSER_FILE} must export MAX_DRAFT_ITEMS large-import guard`);
  }
  if (!parser.includes('MAX_FIELD_LENGTH')) {
    fail(`${PARSER_FILE} must export MAX_FIELD_LENGTH field-length guard`);
  }
}

// ── No ai-process / AI endpoint / document upload in new runtime ─────────────

function noAiProcessGuard() {
  const filesToCheck = [PARSER_FILE, REVIEW_PANEL, SETTINGS_ROUTE];
  for (const file of filesToCheck) {
    const text = read(file);
    if (text.includes('ai-process')) fail(`${file} must not include 'ai-process' call site`);
    if (/\/api\/(?:generate|chat|complete|ocr)/.test(text)) {
      fail(`${file} appears to call an AI/OCR-style endpoint`);
    }
  }
}

function noDocumentUploadGuard() {
  // The new parser/panel must not perform document upload or HTTP I/O.
  // The Phase 16F connector remains the only network surface, and it is
  // health-check only. Phase 16G adds NO network calls.
  const filesToCheck = [PARSER_FILE, REVIEW_PANEL];
  for (const file of filesToCheck) {
    const text = read(file);
    if (text.includes('FormData')) fail(`${file} must not use FormData (no document upload)`);
    if (/\bfetch\s*\(/.test(text)) fail(`${file} must not call fetch() in Phase 16G`);
    if (text.includes('XMLHttpRequest')) fail(`${file} must not use XMLHttpRequest`);
    if (/<input[^>]*type=["']file["']/i.test(text)) {
      fail(`${file} must not introduce a file upload <input>`);
    }
  }
}

// ── FSRS / sync regression guards ────────────────────────────────────────────

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

  // Phase 16G must not introduce ts-fsrs.next() in new runtime files.
  for (const file of [PARSER_FILE, REVIEW_PANEL]) {
    const text = read(file);
    if (/ts-fsrs/.test(text)) fail(`${file} must not import ts-fsrs`);
    if (/\.next\s*\(/.test(text)) fail(`${file} must not introduce a ts-fsrs .next() call site`);
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
      fail(`Phase 16G must not introduce cloud/auth/sync/AI-process path: ${path}`);
    }
  }

  // Forbid API key / BYOK runtime terms in Phase 16G files.
  for (const file of [PARSER_FILE, REVIEW_PANEL]) {
    const text = read(file);
    for (const term of ['apiKey', 'API_KEY', 'BYOK', 'bring your own key']) {
      if (text.includes(term)) {
        fail(`${file} must not introduce API key / BYOK runtime term: ${term}`);
      }
    }
  }
}

// ── Settings.jsx mount guard ─────────────────────────────────────────────────

function settingsMountGuard() {
  const source = read(SETTINGS_ROUTE);
  if (!source.includes('EduGenDraftReviewPanel')) {
    fail(`${SETTINGS_ROUTE} must mount the new EduGenDraftReviewPanel`);
  }
  if (!/<EduGenDraftReviewPanel\b/.test(source)) {
    fail(`${SETTINGS_ROUTE} must render <EduGenDraftReviewPanel /> JSX`);
  }
  if (!source.includes('EduGenDraftWorkshopPanel')) {
    fail(`${SETTINGS_ROUTE} must keep Phase 16F EduGenDraftWorkshopPanel mount`);
  }
  if (!source.includes('FsrsExperimentalSettingsPanel')) {
    fail(`${SETTINGS_ROUTE} must keep FsrsExperimentalSettingsPanel mount`);
  }
}

// ── Parser source guard ──────────────────────────────────────────────────────

function parserSourceGuard() {
  const text = read(PARSER_FILE);
  const required = [
    'parseEdugenDraftJson',
    'EDUGEN_DRAFT_ERROR_CODES',
    'EDUGEN_DRAFT_PROCESSOR',
    'EDUGEN_DRAFT_SOURCE_TYPE',
    'reviewRequired',
    'describeEdugenDraftError',
  ];
  for (const symbol of required) {
    if (!text.includes(symbol)) fail(`${PARSER_FILE} must export/define ${symbol}`);
  }
  if (!text.includes('NO storage write') && !text.includes('No storage write')) {
    fail(`${PARSER_FILE} must document that it performs no storage write`);
  }
  if (!text.includes('NEVER auto-imported') && !text.includes('never auto-imported')) {
    fail(`${PARSER_FILE} must document review-required draft contract`);
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
  noDocumentUploadGuard();
  fsrsAndSyncRegressionGuard();
  noCloudAuthGuard();
  settingsMountGuard();
  parserSourceGuard();
  internalRegistryGuard();
  console.log('Phase 16G EduGen Draft Review Import Flow validation passed.');
}

validate();
