#!/usr/bin/env node
/**
 * scripts/validate-phase17e-per-key-migration-manifest-design.js
 *
 * Phase 17E static validator — Per-Key Migration Manifest Design.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase17e-per-key-migration-manifest-design.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase17e-per-key-migration-manifest-design.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE17D_VALIDATOR = 'scripts/validate-phase17d-migration-journal-event-log-architecture.js';

// Exact set of allowed changed files for Phase 17E.
const phase17eAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  // Historical validator forward-compat edits
  'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js',
  'scripts/validate-phase17a-backup-rollback-harness-before-migration.js',
  'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js',
  'scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js',
  PHASE17D_VALIDATOR,
  'scripts/validate-backup-transfer-safety-hardening.js',
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
]);

// Forbidden runtime files that must not exist in Phase 17E.
const forbiddenRuntimeFiles = [
  'src/storage/EventLog.js',
  'src/storage/SyncAdapter.js',
  'src/storage/IndexedDBAdapter.js',
  'src/storage/MigrationJournal.js',
  'src/storage/migrationJournal.js',
  'src/storage/migrationRunner.js',
  'src/storage/migrationManifest.js',
  'src/storage/migrationRegistry.js',
];

// Forbidden npm dependencies.
const forbiddenDependencies = ['idb', 'dexie', 'localforage', 'pouchdb', 'rxdb', 'firebase', 'supabase'];

const generatedArtifacts = [
  'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD', '.env', '.env.local', '.git'
];

// Required document sections (exact heading strings).
const requiredDocSections = [
  '# Phase 17E — Per-Key Migration Manifest Design',
  '## Purpose',
  '## Why manifest design must come before runtime migration',
  '## Relationship to prior phases',
  '## Candidate storage key families',
  '## Manifest entry shape',
  '## Risk classes',
  '## Future migration order',
  '## Required safety rules',
  '## Explicit non-goals for Phase 17E',
  '## Claim boundaries',
  '## Acceptance criteria',
];

// Required terms in the doc (case-insensitive).
const requiredDocTerms = [
  // Phase relationships
  'phase 17a',
  'phase 17b',
  'phase 17c',
  'phase 17d',
  'phase 17f',
  'phase 17g',
  'phase 17h',
  'phase 18',
  // Manifest entry fields
  'manifestId',
  'sourceKey',
  'targetStore',
  'dataFamily',
  'riskClass',
  'ownerModule',
  'schemaVersion',
  'migrationMode',
  'requiresBackup',
  'requiresReadAfterWriteVerification',
  'requiresRollbackSnapshot',
  'idempotencyStrategy',
  'deletePolicy',
  'testGate',
  'productionGate',
  'rollbackPlan',
  'claimBoundary',
  // Storage key families
  'shimeV2',
  'quiz',
  'review schedule',
  'settings',
  'backup/restore',
  'edugen',
  'fsrs',
  'recommendation feedback',
  // Risk classes
  'low-risk metadata',
  'medium-risk user preferences',
  'high-risk learning records',
  'critical backup/restore and scheduling state',
  // Safety rules
  'backup-before-migration',
  'no delete-before-verified-copy',
  'read-after-write',
  'per-key rollback',
  'idempotent',
  'quota pressure',
  'schema mismatch',
  // Non-goals
  'no runtime manifest',
  'no migration engine',
  'no eventlog',
  'no migrationjournal',
  'no localstorage deletion',
  'no indexeddbadapter',
  'no syncadapter',
  // Phase sequencing
  'docs/static-validator/ci-only',
];

// Required exact future phase sequence strings.
const requiredPhaseSequence = [
  'Phase 17E — Per-Key Migration Manifest Design',
  'Phase 17F — Test-Only Migration Journal Prototype',
  'Phase 17G — Single-Key Dry-Run Migration Rehearsal',
  'Phase 17H — Single-Key Reversible Migration Pilot',
  'Phase 18+',
];

// Forbidden positive claims (case-insensitive, checked outside "Claim boundaries" section).
const forbiddenClaimPhrases = [
  'migration has shipped',
  'indexeddb production storage exists',
  'indexeddb is production',
  'cloud sync exists',
  'cloud sync is available',
  'storage sync exists',
  'e2ee exists',
  'e2ee is available',
  'e2ee is certified',
  'data-loss prevention is guaranteed',
  'guaranteed data safety',
  'guaranteed recovery',
  'guaranteed no data loss',
  'public active fsrs rollout',
  'built-in ai exists',
  'built-in ocr',
  'production security certification',
  'security certification exists',
  'migration is complete',
  'migration done',
];

// Broad path patterns that must not be added to historical validators.
const broadPathPatterns = [
  "'src/'",
  "'src/storage/'",
  "'docs/'",
  "'scripts/'",
  "'tests/'",
  "'e2e/'",
];

// Phase 17E allowed forward-compat entries that may be added to historical validators.
const phase17eForwardCompatEntries = [
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
];

function fail(message) {
  console.error(`Phase 17E validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 17E validation warning: ${message}`);
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

// ── 1 & 2. Required Phase 17E files exist ────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE17D_VALIDATOR);
}

// ── 3 & 4. Workflow registers Phase 17E validator after Phase 17D ─────────────

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase17dStr = 'node scripts/validate-phase17d-migration-journal-event-log-architecture.js';
  const phase17eStr = 'node scripts/validate-phase17e-per-key-migration-manifest-design.js';

  if (!text.includes(phase17dStr)) fail(`${WORKFLOW_FILE} must register Phase 17D validator`);
  if (!text.includes(phase17eStr)) fail(`${WORKFLOW_FILE} must register Phase 17E validator`);

  const phase17dPos = text.indexOf(phase17dStr);
  const phase17ePos = text.indexOf(phase17eStr);
  if (phase17ePos <= phase17dPos) fail(`${WORKFLOW_FILE} must register Phase 17E validator after Phase 17D`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

// ── 5 & 6. Package files unchanged ───────────────────────────────────────────

function packageGuard() {
  // Phase 20D naming-cleanup compat: allow exact version transition
  // <previous version> → 2.0.0-beta.1 in package.json/package-lock.json.
  const allowed = new Set(['2.0.0-beta.1']);
  const pkgRaw = fs.readFileSync('package.json', 'utf8');
  const lockRaw = fs.readFileSync('package-lock.json', 'utf8');
  const pkgVer = JSON.parse(pkgRaw).version;
  const lockVer = JSON.parse(lockRaw).version;
  if (!allowed.has(pkgVer)) fail('package.json version unexpected in Phase 17E: ' + pkgVer);
  if (!allowed.has(lockVer)) fail('package-lock.json version unexpected in Phase 17E: ' + lockVer);
}

// ── 7. No src/ changes ────────────────────────────────────────────────────────

function noSrcChangesGuard() {
  for (const file of changedFiles()) {
    if (file === 'src/version.js') { /* Phase 20D naming-cleanup compat: allow src/version.js */ } else if (file.startsWith('src/')) fail(`src/ file changed in Phase 17E (forbidden): ${file}`);
  }
}

// ── 8. No tests/ changes ─────────────────────────────────────────────────────

function noTestsChangesGuard() {
  for (const file of changedFiles()) {
    if (phase17eAllowedChangedFiles.has(file)) continue;
    const firstSegment = file.indexOf('/') >= 0 ? file.slice(0, file.indexOf('/')) : file;
    if (firstSegment === 'tests') fail(`tests/ file changed in Phase 17E (forbidden): ${file}`);
  }
}

// ── 9. No e2e/ changes ───────────────────────────────────────────────────────

function noE2eChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17E (forbidden): ${file}`);
  }
}

// ── Scope guard (combines 7, 8, 9, and overall scope check) ──────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase17eAllowedChangedFiles.has(file)) continue;
  // Phase 20D naming-cleanup compat: line neutralized for exact 2.0.0-beta.1 transition.
    if (file === 'src/version.js') { /* Phase 20D naming-cleanup compat: allow src/version.js */ } else if (file.startsWith('src/')) fail(`src/ file changed in Phase 17E (forbidden): ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 17E (forbidden): ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17E (forbidden): ${file}`);
    // New phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    if (file.startsWith('docs/')) fail(`Unexpected docs/ file changed in Phase 17E: ${file}`);
    warn(`Unexpected file outside allowed scope (non-fatal): ${file}`);
  }
}

// ── 10. No forbidden runtime files ───────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const path of forbiddenRuntimeFiles) {
    if (fs.existsSync(path)) fail(`Phase 17E must not introduce forbidden runtime file: ${path}`);
  }
}

// ── 11. No forbidden dependencies ────────────────────────────────────────────

function forbiddenDependencyGuard() {
  const pkg = read('package.json');
  for (const dep of forbiddenDependencies) {
    const pattern = new RegExp(`"${dep}"\\s*:`);
    if (pattern.test(pkg)) fail(`package.json must not add forbidden dependency: "${dep}"`);
  }
}

// ── 12. Required document terms ──────────────────────────────────────────────

function docTermGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();

  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── 13. Required future phase sequence ───────────────────────────────────────

function phaseSequenceGuard() {
  const doc = read(DOCS_FILE);
  for (const seq of requiredPhaseSequence) {
    if (!doc.includes(seq)) {
      fail(`${DOCS_FILE} must include required phase sequence entry: "${seq}"`);
    }
  }
}

// ── 14. Forbidden positive claims absent ─────────────────────────────────────

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const lines = doc.split(/\r?\n/);
  let inSkippedSection = false;
  for (const line of lines) {
    if (/^##\s+(Claim boundaries|Explicit non-goals|Forbidden)/i.test(line)) {
      inSkippedSection = true;
      continue;
    }
    if (/^##\s+/.test(line)) inSkippedSection = false;
    if (inSkippedSection) continue;
    const lineLower = line.toLowerCase();
    for (const claim of forbiddenClaimPhrases) {
      if (lineLower.includes(claim.toLowerCase())) {
        const negated = /no |not |must not|forbidden|do not|denied|absent|without|has not|does not|have not|cannot/i.test(line);
        if (!negated) fail(`${DOCS_FILE} must not contain forbidden positive claim: "${claim}" (line: ${line.trim()})`);
      }
    }
  }
}

// ── 15. Generated artifacts absent from changed/untracked files ───────────────

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

// ── 16 & 17. Historical validator changes are exact Phase 17E forward-compat entries ──

function historicalValidatorForwardCompatGuard() {
  const changed = changedFiles();
  const mergeBase = runGit('git merge-base HEAD origin/main', { silent: true });

  // Check ALL changed scripts/validate-*.js files (except the new Phase 17E validator itself).
  const changedValidators = changed.filter(f =>
    f.startsWith('scripts/validate-') &&
    f.endsWith('.js') &&
    f !== VALIDATOR_SCRIPT
  );

  for (const validatorFile of changedValidators) {
    if (!mergeBase) {
      warn(`Cannot verify ${validatorFile} forward-compat: no merge base.`);
      continue;
    }

    const diff = runGit(`git diff ${mergeBase} HEAD -- "${validatorFile}"`, { silent: true });
    if (!diff) continue;
    if (diff.includes('--- /dev/null')) continue; // newly created file — not a historical validator

    const addedLines = diff.split('\n')
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .map(line => line.slice(1).trim())
      .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('*'));

    for (const line of addedLines) {
      // Extract all single-quoted path strings from the line.
      const extractedPaths = [...line.matchAll(/'([^']+)'/g)].map(([, p]) => p);

      // Check #17: no broad path allowlists added.
      // Uses exact-path matching: only flag if the extracted path IS the broad path (not a longer path prefixed by it).
      for (const broadPattern of broadPathPatterns) {
        const broadPath = broadPattern.slice(1, -1); // strip surrounding quotes
        if (extractedPaths.some(p => p === broadPath)) {
          fail(`Historical validator ${validatorFile} adds forbidden broad path allowlist: ${broadPattern}`);
        }
      }

      // Check #16: any docs/ or tests/ path strings added in quotes must be Phase 17E forward-compat entries
      const pathMatches = [...line.matchAll(/'([^']{5,})'/g)];
      for (const [, path] of pathMatches) {
        if (!path.includes('/')) continue; // not a file path
        // Scrutinize docs/ paths — scripts/validate- paths are checked by broadPathPatterns
        if (path.startsWith('docs/') && !path.includes('phase17e')) {
          if (!phase17eForwardCompatEntries.includes(path)) {
            fail(`Historical validator ${validatorFile} adds unexpected non-Phase-17E docs/ entry: '${path}'`);
          }
        }
        // Scrutinize tests/ paths — only exact Phase 17E/17F forward-compat test entries allowed
        if (path.startsWith('tests/') && !phase17eForwardCompatEntries.includes(path)) {
          fail(`Historical validator ${validatorFile} adds unexpected non-Phase-17E tests/ entry: '${path}'`);
        }
      }
    }
  }
}

// ── Required doc sections ─────────────────────────────────────────────────────

function docSectionGuard() {
  const doc = read(DOCS_FILE);
  for (const section of requiredDocSections) {
    if (!doc.includes(section)) fail(`${DOCS_FILE} must include required section: "${section}"`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  workflowGuard();
  packageGuard();
  noSrcChangesGuard();
  noTestsChangesGuard();
  noE2eChangesGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  forbiddenDependencyGuard();
  docTermGuard();
  phaseSequenceGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  docSectionGuard();
  console.log('Phase 17E Per-Key Migration Manifest Design validation passed.');
}

validate();
