#!/usr/bin/env node
/**
 * scripts/validate-phase20d-hold-decision-beta-ai-naming-cleanup.js
 *
 * Phase 20D static validator — HOLD Decision + beta-ai Naming Cleanup Gate.
 *
 * Phase 20D is docs/static-validator/CI-only. It does not implement runtime
 * behavior, sync, cloud/account/auth/backend, storage migration, FSRS
 * scheduling changes, backup/export/restore behavior changes, import parser
 * behavior changes, telemetry, analytics, or UI behavior changes. It does not
 * add tests. It does not add dependencies. Its deliverables are this
 * validator, the Phase 20D ADR, the Phase 20D HOLD evidence document, CI
 * registration after Phase 20C, and the beta-ai naming cleanup in
 * package/version/cache-version/public-doc/validator strings.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ADR_FILE         = `docs/adr/phase20d-hold-decision-beta-ai-naming-cleanup.md`;
const EVIDENCE_FILE    = `docs/release/phase20d-beta-hold-evidence.md`;
const VALIDATOR_SCRIPT = `scripts/validate-phase20d-hold-decision-beta-ai-naming-cleanup.js`;
const WORKFLOW_FILE    = `.github/workflows/e2e-smoke.yml`;
const PHASE20C_VALIDATOR = `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`;
const PHASE20B_VALIDATOR = `scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`;
const PHASE20A_VALIDATOR = `scripts/validate-phase20a-beta-local-first-hybrid-stabilization.js`;
const PACKAGE_JSON     = `package.json`;
const PACKAGE_LOCK     = `package-lock.json`;
const SRC_VERSION_FILE = `src/version.js`;
const SW_FILE          = `sw.js`;

const NEW_VERSION       = `2.0.0-beta.1`;
const NEW_CACHE_VERSION = `shimechamhoc-v2.0.0-beta.1`;
const OLD_VERSION       = `2.0.0-beta-ai.1`;

const phase20dCoreFiles = [
  ADR_FILE,
  EVIDENCE_FILE,
  VALIDATOR_SCRIPT,
];

// Phase 20D forward-compat entries: the only paths historical validators may add.
// These include the three Phase 20D core artifacts plus the version/name cleanup
// files actually changed by Phase 20D.
const phase20dForwardCompatEntries = [
  `docs/adr/phase20d-hold-decision-beta-ai-naming-cleanup.md`,
  `docs/release/phase20d-beta-hold-evidence.md`,
  `scripts/validate-phase20d-hold-decision-beta-ai-naming-cleanup.js`,
  `package.json`,
  `package-lock.json`,
  `src/version.js`,
  `sw.js`,
  // Version-name cleanup files actually changed by Phase 20D.
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

// Pre-Phase-20D baseline forward-compat entries already present in historical
// validators from prior phases. They are NOT additions in Phase 20D.
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
  // Phase 20C baseline
  `docs/adr/phase20c-performance-quota-import-stress-test-plan.md`,
  `docs/testing/phase20c-performance-quota-import-stress-test-plan.md`,
  `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`,
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

// Public release/deploy docs in which Phase 20D is allowed to perform beta-ai
// to non-AI version-string cleanup (positive public-facing version names only).
const allowedPublicDocsCleanupFiles = new Set([
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
]);

// Naming-cleanup package/cache/version files: Phase 20D may change these
// strictly to remove the beta-ai substring from positive public naming.
const allowedPackageVersionCleanupFiles = new Set([
  PACKAGE_JSON,
  PACKAGE_LOCK,
  SRC_VERSION_FILE,
  SW_FILE,
]);

// Files Phase 20D explicitly allows to change.
const phase20dAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  PHASE20A_VALIDATOR,
  PHASE20B_VALIDATOR,
  PHASE20C_VALIDATOR,
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
  ...phase20dCoreFiles,
  ...allowedPackageVersionCleanupFiles,
  ...allowedPublicDocsCleanupFiles,
]);
phase20dAllowedChangedFiles.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
phase20dAllowedChangedFiles.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
phase20dAllowedChangedFiles.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
phase20dAllowedChangedFiles.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
phase20dAllowedChangedFiles.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
phase20dAllowedChangedFiles.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
phase20dAllowedChangedFiles.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
phase20dAllowedChangedFiles.add(`docs/release/phase23c-backup-health-design-summary.md`);
phase20dAllowedChangedFiles.add(`scripts/validate-phase23c-backup-health-design.js`);
phase20dAllowedChangedFiles.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
phase20dAllowedChangedFiles.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
phase20dAllowedChangedFiles.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);

// FSRS runtime files that must not change in Phase 20D.
const fsrsRuntimeFiles = [
  `src/scheduler/fsrsAdapter.js`,
  `src/scheduler/fsrsScheduler.js`,
  `src/scheduler/fsrsEnrollment.js`,
  `src/state/fsrsMetadata.js`,
  `src/ui/FsrsExperimentalSettingsPanel.js`,
  `src/quiz/reviewSchedulerAdapter.js`,
];

// Storage/migration runtime files that must not change in Phase 20D.
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

// Backup/export/restore runtime files that must not change in Phase 20D.
const backupRestoreRuntimeFiles = [
  `src/state/v2BackupRestore.js`,
  `src/quiz/dataBackup.js`,
  `src/ui/dataBackupPanel.js`,
];

// Import parser/runtime files that must not change in Phase 20D.
const importParserRuntimeFiles = [
  `src/data/importValidator.js`,
  `src/quiz/textQuizParser.js`,
  `src/quiz/textFileImport.js`,
];

// Forbidden sync/cloud/account/auth/backend runtime files.
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

// Forbidden npm dependencies.
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
  `phase20d-hold-decision-beta-ai-naming-cleanup.patch`,
  `phase20d-hold-decision-beta-ai-naming-cleanup.zip`,
  `phase20d-hold-decision-beta-ai-naming-cleanup-handoff.md`,
];

const requiredAdrHeadings = [
  `# Phase 20D — HOLD Decision + beta-ai Naming Cleanup Gate`,
  `## Purpose`,
  `## Decision`,
  `## Evidence consumed`,
  `## Why the decision is HOLD`,
  `## Relationship to Phase 20A`,
  `## Relationship to Phase 20B`,
  `## Relationship to Phase 20C`,
  `## Relationship to Phase 19 trust and sync guardrails`,
  `## Current production baseline`,
  `## What is ready`,
  `## What is not ready`,
  `## Missing real-user testing evidence`,
  `## Missing performance/quota/import stress evidence`,
  `## Data-safety risk decision`,
  `## Backup and restore decision`,
  `## Import and quota decision`,
  `## FSRS and scheduler decision`,
  `## Optional sync decision`,
  `## No-cloud/default-off trust decision`,
  `## Naming cleanup decision`,
  `## Why beta-ai naming is misleading`,
  `## Release naming and version boundary`,
  `## Required user-facing claim boundaries`,
  `## What Phase 20D explicitly does not implement`,
  `## Post-20D next steps`,
  `## Acceptance criteria`,
];

const requiredEvidenceHeadings = [
  `# Phase 20D — Beta HOLD Evidence`,
  `## Purpose`,
  `## Decision summary`,
  `## Phase 17 evidence`,
  `## Phase 18 evidence`,
  `## Phase 19 evidence`,
  `## Phase 20A evidence`,
  `## Phase 20B evidence`,
  `## Phase 20C evidence`,
  `## Evidence supporting HOLD`,
  `## Evidence missing for BETA_READY`,
  `## Storage safety evidence`,
  `## Backup and restore evidence`,
  `## Import and quota evidence`,
  `## Manual transfer evidence`,
  `## FSRS and scheduler evidence`,
  `## Optional sync evidence`,
  `## No-cloud/default-off trust evidence`,
  `## beta-ai naming evidence`,
  `## Remaining risks`,
  `## Required evidence before reconsidering BETA_READY`,
  `## Recommendation`,
];

// Required decision tokens checked against the ADR.
const requiredAdrDecisionTokens = [
  `local_first_hybrid_beta_decision: hold`,
  `beta_ai_naming_decision: remove_beta_ai_public_naming`,
];

// Required decision tokens checked against the evidence doc.
const requiredEvidenceDecisionTokens = [
  `local_first_hybrid_beta_decision: hold`,
  `beta_ai_naming_decision: remove_beta_ai_public_naming`,
];

// Required HOLD rationale statements checked against ADR.
const requiredAdrHoldRationale = [
  `phase 20d does not claim beta-ready`,
  `phase 20b was a plan`,
  `phase 20c was a plan`,
  `real user testing has not been completed`,
  `performance/quota/import stress testing has not been completed`,
  `beta-ai naming can imply built-in ai`,
  `v2.0.0-beta.1`,
  `sync remains unshipped`,
  `cloud/account/auth/backend remain absent`,
  `production indexeddb storage remains absent`,
  `backup/export/restore are not adapter-aware`,
  `data-loss prevention is not guaranteed`,
  `built-in ai/ocr/ai quiz generation are not shipped`,
];

// Required evidence statements checked against evidence doc.
const requiredEvidenceStatements = [
  `phase 17`,
  `phase 18`,
  `phase 19`,
  `phase 20a`,
  `phase 20b is plan-only`,
  `phase 20c is plan-only`,
  `executed real-user testing results log`,
  `executed performance`,
  `no real-user beta-ready signal`,
  `beta_ready should be reconsidered`,
];

// Forbidden positive claims outside forbidden-claim sections.
const forbiddenPositiveClaims = [
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `Shime stores your data in the cloud`,
  `encrypted end-to-end`,
  `zero-knowledge`,
  `sync just works`,
  `data-loss prevention is guaranteed`,
  `FSRS sync is available`,
  `review schedules sync automatically`,
  `production sync is ready`,
  `production IndexedDB storage exists`,
  `backup/export is adapter-aware`,
  `restore is adapter-aware`,
];

// Broad path patterns that historical validators must not introduce.
const broadPathPatterns = [
  `src/`,
  `src/storage/`,
  `docs/`,
  `scripts/`,
  `tests/`,
  `e2e/`,
];

function fail(message) {
  console.error(`Phase 20D validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 20D validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, `utf8`);
}

function normalize(text) {
  return text
    .replace(/[""]/g, `"`)
    .replace(/['']/g, `'`)
    .replace(/\s+/g, ` `)
    .trim();
}

function lowerNormalized(text) {
  return normalize(text).toLowerCase();
}

function runGit(command, options = {}) {
  try {
    return execSync(command, { encoding: `utf8`, stdio: [`ignore`, `pipe`, `pipe`], ...options }).trim();
  } catch {
    if (!options.silent) warn(`Git command failed; scope checking may be limited: ${command}`);
    return ``;
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
  return file.indexOf(`/`) >= 0 ? file.slice(0, file.indexOf(`/`)) : file;
}

function isGeneratedArtifact(file) {
  return generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
}

function requiredFilesGuard() {
  for (const file of [ADR_FILE, EVIDENCE_FILE, VALIDATOR_SCRIPT, WORKFLOW_FILE, PHASE20C_VALIDATOR]) {
    read(file);
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase20cStr = `node scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`;
  const phase20dStr = `node scripts/validate-phase20d-hold-decision-beta-ai-naming-cleanup.js`;

  if (!text.includes(phase20cStr)) fail(`${WORKFLOW_FILE} must register Phase 20C validator`);
  if (!text.includes(phase20dStr)) fail(`${WORKFLOW_FILE} must register Phase 20D validator`);
  if (text.indexOf(phase20dStr) <= text.indexOf(phase20cStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 20D validator after Phase 20C`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

function noTestsE2eChangesGuard() {
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
    if (firstSegment(file) === `tests`) fail(`tests/ file changed in Phase 20D (forbidden): ${file}`);
    if (firstSegment(file) === `e2e`) fail(`e2e/ file changed in Phase 20D (forbidden): ${file}`);
  }
}

function noSrcChangesExceptVersionGuard() {
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
    if (firstSegment(file) !== `src`) continue;
    if (file === SRC_VERSION_FILE) continue;
    fail(`src/ file changed in Phase 20D outside src/version.js (forbidden): ${file}`);
  }
}

function runtimeGuard(label, files) {
  const changed = new Set(changedFiles());
  for (const file of files) {
    if (changed.has(file)) fail(`${label} changed in Phase 20D (forbidden): ${file}`);
  }
}

function packageConsistencyGuard() {
  const pkg = JSON.parse(read(PACKAGE_JSON));
  const lock = JSON.parse(read(PACKAGE_LOCK));

  if (pkg.version !== NEW_VERSION) {
    fail(`${PACKAGE_JSON} version must be "${NEW_VERSION}", got "${pkg.version}"`);
  }
  if (lock.version !== NEW_VERSION) {
    fail(`${PACKAGE_LOCK} root version must be "${NEW_VERSION}", got "${lock.version}"`);
  }
  if (lock.packages && lock.packages[``] && lock.packages[``].version !== NEW_VERSION) {
    fail(`${PACKAGE_LOCK} packages[""] version must be "${NEW_VERSION}", got "${lock.packages[``].version}"`);
  }

  for (const file of [PACKAGE_JSON, PACKAGE_LOCK]) {
    const text = read(file);
    if (text.includes(OLD_VERSION)) {
      fail(`${file} must not contain old beta-ai version string "${OLD_VERSION}"`);
    }
  }
}

function versionFileGuard() {
  const versionText = read(SRC_VERSION_FILE);
  if (!versionText.includes(`'${NEW_VERSION}'`) && !versionText.includes(`"${NEW_VERSION}"`)) {
    fail(`${SRC_VERSION_FILE} must define APP_VERSION as "${NEW_VERSION}"`);
  }
  if (versionText.includes(OLD_VERSION)) {
    fail(`${SRC_VERSION_FILE} must not contain old beta-ai version string`);
  }
}

function swFileGuard() {
  const swText = read(SW_FILE);
  if (!swText.includes(NEW_CACHE_VERSION)) {
    fail(`${SW_FILE} must set CACHE_VERSION to "${NEW_CACHE_VERSION}"`);
  }
  if (swText.toLowerCase().includes(`beta-ai`)) {
    fail(`${SW_FILE} must not contain beta-ai substring`);
  }
}

function forbiddenDependencyGuard() {
  const pkg = read(PACKAGE_JSON);
  for (const dep of forbiddenDependencies) {
    if (new RegExp(`"${dep}"\\s*:`).test(pkg)) {
      fail(`${PACKAGE_JSON} must not add forbidden dependency: "${dep}"`);
    }
  }
}

function dependencyAdditionGuard() {
  const mergeBase = runGit(`git merge-base HEAD origin/main`, { silent: true });
  if (!mergeBase) return;
  const diff = runGit(`git diff ${mergeBase} HEAD -- ${PACKAGE_JSON}`, { silent: true });
  if (!diff) return;
  const addedLines = diff.split(`\n`).filter(line => line.startsWith(`+`) && !line.startsWith(`+++`));
  for (const line of addedLines) {
    // The only legal package.json addition in Phase 20D is the new version string.
    if (line.includes(`"version"`) && line.includes(NEW_VERSION)) continue;
    if (line.trim() === `+` || line.trim() === `+  "version": "${NEW_VERSION}",`) continue;
    // Detect dependency additions
    if (/^\+\s*"[^"]+"\s*:\s*"[^"]+"/.test(line) && !line.includes(`"version"`)) {
      // Allow only if this exact dep line already existed pre-Phase-20D — we
      // verify by ensuring it's not a new addition relative to the diff.
      const prefix = line.slice(1).trim();
      // A safe Phase 20D should only add/modify the version line.
      const isVersionOnly = /^"version"\s*:\s*"[^"]+",?$/.test(prefix);
      if (!isVersionOnly) {
        fail(`Phase 20D must not add/modify dependency lines in ${PACKAGE_JSON}: ${prefix}`);
      }
    }
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
    if (phase20dAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === `src` && file !== SRC_VERSION_FILE) {
      fail(`src/ file changed in Phase 20D outside src/version.js (forbidden): ${file}`);
    }
    if (firstSegment(file) === `tests`) fail(`tests/ file changed in Phase 20D (forbidden): ${file}`);
    if (firstSegment(file) === `e2e`) fail(`e2e/ file changed in Phase 20D (forbidden): ${file}`);
    // Validator scripts are allowed (historical forward-compat / hard-pin cleanup).
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    // Otherwise warn (non-fatal) so unexpected file changes are visible.
    warn(`Unexpected file outside allowed Phase 20D scope (non-fatal): ${file}`);
  }
}

function forbiddenRuntimeFilesGuard() {
  for (const file of forbiddenRuntimeFiles) {
    if (fs.existsSync(file)) fail(`Phase 20D must not introduce forbidden runtime file: ${file}`);
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

function holdDecisionExclusivityGuard() {
  const adrText = read(ADR_FILE);
  // The token "BETA_READY" must not appear as an active LOCAL_FIRST_HYBRID_BETA_DECISION.
  const activeBetaReadyRegex = /LOCAL_FIRST_HYBRID_BETA_DECISION\s*:\s*BETA_READY/;
  if (activeBetaReadyRegex.test(adrText)) {
    fail(`${ADR_FILE} must not declare LOCAL_FIRST_HYBRID_BETA_DECISION: BETA_READY as an active decision`);
  }
  if (!/LOCAL_FIRST_HYBRID_BETA_DECISION\s*:\s*HOLD/.test(adrText)) {
    fail(`${ADR_FILE} must declare LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD`);
  }
  if (!/BETA_AI_NAMING_DECISION\s*:\s*REMOVE_BETA_AI_PUBLIC_NAMING/.test(adrText)) {
    fail(`${ADR_FILE} must declare BETA_AI_NAMING_DECISION: REMOVE_BETA_AI_PUBLIC_NAMING`);
  }
}

function isForbiddenClaimSection(line) {
  return /^##\s+(What is not ready|What Phase 20D explicitly does not implement|Forbidden|Missing|Why beta-ai naming is misleading|Required user-facing claim boundaries|Remaining risks|Evidence missing|Required evidence before reconsidering BETA_READY)/i.test(normalize(line));
}

function isNextSection(line) {
  return /^##\s+/.test(line);
}

function isNegatedClaimContext(line) {
  return /\b(if|later|future|only if|no|not|must not|does not|do not|none|without|forbidden|disallowed|absent|unshipped|not implemented|not yet|cannot|never|unchanged|request to claim|reconsidered|reconsider|missing|imply|misleading|risk|không|chưa|nếu|sau này|bị cấm|không được phép)\b/i.test(line);
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

function positiveBetaAiNamingRemovalGuard() {
  // Files and contexts where positive beta-ai naming must be gone.
  const filesMustNotContainBetaAi = [
    PACKAGE_JSON,
    PACKAGE_LOCK,
    SRC_VERSION_FILE,
    SW_FILE,
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
  ];
  for (const file of filesMustNotContainBetaAi) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, `utf8`);
    if (text.toLowerCase().includes(`beta-ai`)) {
      fail(`${file} must not contain positive beta-ai naming after Phase 20D cleanup`);
    }
  }

  // Validators that previously hard-pinned 2.0.0-beta-ai.1 must now hard-pin
  // 2.0.0-beta.1 or stop asserting beta-ai. Allow phase20c/phase16j validators
  // because they reference beta-ai only as a warning/negative-assertion.
  const validatorsAllowedToKeepBetaAi = new Set([
    PHASE20C_VALIDATOR,
    `scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js`,
    VALIDATOR_SCRIPT,
  ]);
  for (const file of fs.readdirSync(`scripts`)) {
    if (!file.startsWith(`validate-`) || !file.endsWith(`.js`)) continue;
    const rel = `scripts/${file}`;
    if (validatorsAllowedToKeepBetaAi.has(rel)) continue;
    const text = fs.readFileSync(rel, `utf8`);
    if (text.includes(OLD_VERSION)) {
      fail(`${rel} must not still hard-pin "${OLD_VERSION}" after Phase 20D cleanup`);
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
    if (!diff || diff.includes(`--- /dev/null`)) continue;

    const addedLines = diff.split(`\n`)
      .filter(line => line.startsWith(`+`) && !line.startsWith(`+++`))
      .map(line => line.slice(1).trim())
      .filter(line => line.length > 0 && !line.startsWith(`//`) && !line.startsWith(`*`));

    for (const line of addedLines) {
      const extractedPaths = [
        ...line.matchAll(/'([^']+)'/g),
        ...line.matchAll(/`([^`]+)`/g),
        ...line.matchAll(/"([^"]+)"/g),
      ].map(([, path]) => path);

      for (const broadPath of broadPathPatterns) {
        if (extractedPaths.some(path => path === broadPath)) {
          fail(`Historical validator ${validatorFile} adds forbidden broad path allowlist: '${broadPath}'`);
        }
      }

      for (const path of extractedPaths) {
        if (!path.includes(`/`)) {
          // Bare paths like package.json/package-lock.json are allowed as Phase
          // 20D forward-compat entries.
          continue;
        }
        if (!path.endsWith(`.md`) && !path.endsWith(`.js`)) continue;
        if (phase20dForwardCompatEntries.includes(path)) continue;
        if (previousForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`) || path.startsWith(`scripts/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-20D path entry: '${path}'`);
        }
      }
    }
  }
}

function validate() {
  requiredFilesGuard();
  workflowGuard();
  noTestsE2eChangesGuard();
  noSrcChangesExceptVersionGuard();
  runtimeGuard(`FSRS runtime file`, fsrsRuntimeFiles);
  runtimeGuard(`Storage/migration runtime file`, storageMigrationRuntimeFiles);
  runtimeGuard(`Backup/export/restore runtime file`, backupRestoreRuntimeFiles);
  runtimeGuard(`Import parser/runtime file`, importParserRuntimeFiles);
  packageConsistencyGuard();
  versionFileGuard();
  swFileGuard();
  forbiddenDependencyGuard();
  dependencyAdditionGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  requireHeadings(ADR_FILE, requiredAdrHeadings);
  requireHeadings(EVIDENCE_FILE, requiredEvidenceHeadings);
  requireTerms(ADR_FILE, requiredAdrDecisionTokens);
  requireTerms(EVIDENCE_FILE, requiredEvidenceDecisionTokens);
  requireTerms(ADR_FILE, requiredAdrHoldRationale);
  requireTerms(EVIDENCE_FILE, requiredEvidenceStatements);
  holdDecisionExclusivityGuard();
  forbiddenPositiveClaimGuardForFile(ADR_FILE);
  forbiddenPositiveClaimGuardForFile(EVIDENCE_FILE);
  positiveBetaAiNamingRemovalGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 20D HOLD Decision + beta-ai Naming Cleanup validation passed.`);
}

validate();
