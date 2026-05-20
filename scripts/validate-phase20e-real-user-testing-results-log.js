#!/usr/bin/env node
/**
 * scripts/validate-phase20e-real-user-testing-results-log.js
 *
 * Phase 20E static validator — Real User Testing Results Log.
 *
 * Phase 20E is docs/static-validator/CI-only. It does not implement runtime
 * behavior, sync, cloud/account/auth/backend, storage migration, FSRS
 * scheduling changes, backup/export/restore behavior changes, import parser
 * behavior changes, telemetry, analytics, or UI behavior changes. It does not
 * add tests. It does not add dependencies. Its deliverables are this
 * validator, the Phase 20E results log doc, the Phase 20E evidence protocol
 * doc, and CI registration after Phase 20D.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const RESULTS_LOG_FILE    = `docs/testing/phase20e-real-user-testing-results-log.md`;
const EVIDENCE_PROTO_FILE = `docs/release/phase20e-real-user-testing-evidence-protocol.md`;
const VALIDATOR_SCRIPT    = `scripts/validate-phase20e-real-user-testing-results-log.js`;
const WORKFLOW_FILE       = `.github/workflows/e2e-smoke.yml`;
const PHASE20D_VALIDATOR  = `scripts/validate-phase20d-hold-decision-beta-ai-naming-cleanup.js`;
const PHASE20C_VALIDATOR  = `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`;

// Phase 20E forward-compat entries: the only paths historical validators may add.
const phase20eForwardCompatEntries = [
  `scripts/validate-phase23e-data-survival-comprehension-plan.js`,
  `scripts/validate-phase23f-phase23-decision-gate.js`,
  `docs/research/phase24a-residual-direct-storage-audit.md`,
  `docs/release/phase24a-residual-direct-storage-audit-summary.md`,
  `scripts/validate-phase24a-residual-direct-storage-audit.js`,
  `docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`,
  `docs/release/phase24b-storage-adapter-boundary-summary.md`,
  `scripts/validate-phase24b-storage-adapter-boundary-decision.js`,
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

// Pre-Phase-20E baseline entries already present in historical validators.
// These are NOT additions in Phase 20E.
const previousForwardCompatEntries = [
  `scripts/validate-phase23e-data-survival-comprehension-plan.js`,
  `scripts/validate-phase23f-phase23-decision-gate.js`,
  `docs/research/phase24a-residual-direct-storage-audit.md`,
  `docs/release/phase24a-residual-direct-storage-audit-summary.md`,
  `scripts/validate-phase24a-residual-direct-storage-audit.js`,
  `docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`,
  `docs/release/phase24b-storage-adapter-boundary-summary.md`,
  `scripts/validate-phase24b-storage-adapter-boundary-decision.js`,
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
  // Phase 20D baseline (naming cleanup; package/version files also changed)
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

// Broad path patterns that historical validators must not introduce.
const broadPathPatterns = [
  `src/`,
  `src/storage/`,
  `docs/`,
  `scripts/`,
  `tests/`,
  `e2e/`,
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
  `phase20e-real-user-testing-results-log.patch`,
  `phase20e-real-user-testing-results-log.zip`,
  `phase20e-real-user-testing-results-log-handoff.md`,
];

const requiredResultsLogHeadings = [
  `# Phase 20E — Real User Testing Results Log`,
  `## Purpose`,
  `## Status`,
  `## Relationship to Phase 20B`,
  `## Relationship to Phase 20D HOLD`,
  `## Test execution rules`,
  `## Tester privacy rules`,
  `## What to record`,
  `## What not to record`,
  `## Required pre-test safety checklist`,
  `## Tester session template`,
  `## Session 1`,
  `## Session 2`,
  `## Session 3`,
  `## Session 4`,
  `## Session 5`,
  `## Evidence summary`,
  `## Hold signals`,
  `## Pass signals`,
  `## Claim boundaries`,
  `## Phase 20F handoff`,
  `## Phase 20G handoff`,
];

const requiredEvidenceProtoHeadings = [
  `# Phase 20E — Real User Testing Evidence Protocol`,
  `## Purpose`,
  `## Evidence status`,
  `## Minimum evidence needed before Phase 20G`,
  `## Tester profile`,
  `## Recruitment boundary`,
  `## Data safety protocol`,
  `## Backup protocol`,
  `## Restore protocol`,
  `## Manual transfer protocol`,
  `## Local-first trust-copy protocol`,
  `## Vietnamese-first copy comprehension protocol`,
  `## FSRS and review schedule observation protocol`,
  `## Import observation protocol`,
  `## Mobile/PWA observation protocol`,
  `## Stop conditions`,
  `## Evidence quality rubric`,
  `## What counts as passing evidence`,
  `## What counts as hold evidence`,
  `## Claim boundaries`,
  `## Phase 20F relationship`,
  `## Phase 20G readiness gate`,
];

// Required decision token in both docs.
const requiredStatusToken = `real_user_test_execution_status: results_log_template_ready`;

// Required Phase 20D HOLD reference.
const requiredHoldReference = `local_first_hybrid_beta_decision: hold`;

// Required scenario terms across both docs combined.
const requiredScenarioTerms = [
  `onboarding`,
  `create`,
  `import small`,
  `import larger`,
  `study session`,
  `due cards`,
  `review schedule`,
  `backup before risky`,
  `restore from backup`,
  `manual export`,
  `local-first`,
  `no-cloud`,
  `default-off`,
  `vietnamese-first`,
  `fsrs`,
  `experimental`,
  `edugen draft workshop`,
  `mobile`,
  `pwa`,
  `beta-ai`,
  `backup is not sync`,
  `restore may overwrite`,
  `no account`,
  `no built-in ai`,
  `no ocr`,
];

// Required privacy/safety terms across both docs combined.
const requiredPrivacySafetyTerms = [
  `do not record private study content`,
  `do not record contact`,
  `do not record credentials`,
  `do not collect telemetry`,
  `do not add`,
  `irreplaceable`,
  `duplicate`,
  `backup must be created`,
  `stop if tester confuses backup with sync`,
  `stop if tester believes shime has cloud`,
  `restore may overwrite`,
  `stop if tester sees beta-ai`,
];

// Forbidden positive claims outside forbidden/warning sections.
const forbiddenPositiveClaims = [
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync is ready`,
  `production indexeddb storage exists`,
  `storage migration is complete`,
  `backup/export is adapter-aware`,
  `restore is adapter-aware`,
  `data-loss prevention is guaranteed`,
  `built-in ai exists`,
  `ai quiz generation exists`,
  `ocr exists`,
  `beta-ai is acceptable`,
  `real user testing is complete`,
  `local-first hybrid beta is ready`,
];

// FSRS runtime files that must not change.
const fsrsRuntimeFiles = [
  `src/scheduler/fsrsAdapter.js`,
  `src/scheduler/fsrsScheduler.js`,
  `src/scheduler/fsrsEnrollment.js`,
  `src/state/fsrsMetadata.js`,
  `src/ui/FsrsExperimentalSettingsPanel.js`,
  `src/quiz/reviewSchedulerAdapter.js`,
];

// Storage/migration runtime files that must not change.
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

// Backup/export/restore runtime files that must not change.
const backupRestoreRuntimeFiles = [
  `src/state/v2BackupRestore.js`,
  `src/quiz/dataBackup.js`,
  `src/ui/dataBackupPanel.js`,
];

// Import parser/runtime files that must not change.
const importParserRuntimeFiles = [
  `src/data/importValidator.js`,
  `src/quiz/textQuizParser.js`,
  `src/quiz/textFileImport.js`,
];

// Phase 20E allowed changed files.
const phase20eAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  RESULTS_LOG_FILE,
  EVIDENCE_PROTO_FILE,
  VALIDATOR_SCRIPT,
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
  `scripts/validate-phase20a-beta-local-first-hybrid-stabilization.js`,
  `scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`,
  `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`,
  PHASE20D_VALIDATOR,
]);
phase20eAllowedChangedFiles.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
phase20eAllowedChangedFiles.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
phase20eAllowedChangedFiles.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
phase20eAllowedChangedFiles.add(`docs/release/phase23f-phase23-decision-gate.md`);
phase20eAllowedChangedFiles.add(`docs/research/phase23f-data-survival-decision-matrix.md`);
phase20eAllowedChangedFiles.add(`scripts/validate-phase23f-phase23-decision-gate.js`);
phase20eAllowedChangedFiles.add(`docs/research/phase24a-residual-direct-storage-audit.md`);
phase20eAllowedChangedFiles.add(`docs/release/phase24a-residual-direct-storage-audit-summary.md`);
phase20eAllowedChangedFiles.add(`scripts/validate-phase24a-residual-direct-storage-audit.js`);
phase20eAllowedChangedFiles.add(`docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`);
phase20eAllowedChangedFiles.add(`docs/release/phase24b-storage-adapter-boundary-summary.md`);
phase20eAllowedChangedFiles.add(`scripts/validate-phase24b-storage-adapter-boundary-decision.js`);
phase20eAllowedChangedFiles.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
phase20eAllowedChangedFiles.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
phase20eAllowedChangedFiles.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
phase20eAllowedChangedFiles.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
phase20eAllowedChangedFiles.add(`docs/release/phase23c-backup-health-design-summary.md`);
phase20eAllowedChangedFiles.add(`scripts/validate-phase23c-backup-health-design.js`);
phase20eAllowedChangedFiles.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
phase20eAllowedChangedFiles.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
phase20eAllowedChangedFiles.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);

function fail(message) {
  console.error(`Phase 20E validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 20E validation warning: ${message}`);
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
  for (const file of [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE, VALIDATOR_SCRIPT, WORKFLOW_FILE, PHASE20D_VALIDATOR]) {
    read(file);
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase20dStr = `node scripts/validate-phase20d-hold-decision-beta-ai-naming-cleanup.js`;
  const phase20eStr = `node scripts/validate-phase20e-real-user-testing-results-log.js`;

  if (!text.includes(phase20dStr)) fail(`${WORKFLOW_FILE} must register Phase 20D validator`);
  if (!text.includes(phase20eStr)) fail(`${WORKFLOW_FILE} must register Phase 20E validator`);
  if (text.indexOf(phase20eStr) <= text.indexOf(phase20dStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 20E validator after Phase 20D`);
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
    if (firstSegment(file) === `tests`) fail(`tests/ file changed in Phase 20E (forbidden): ${file}`);
    if (firstSegment(file) === `e2e`) fail(`e2e/ file changed in Phase 20E (forbidden): ${file}`);
  }
}

function noSrcChangesGuard() {
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
    if (firstSegment(file) === `src`) {
      fail(`src/ file changed in Phase 20E (forbidden): ${file}`);
    }
  }
}

function noPackageChangesGuard() {
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
    if (file === `package.json`) fail(`package.json changed in Phase 20E (forbidden)`);
    if (file === `package-lock.json`) fail(`package-lock.json changed in Phase 20E (forbidden)`);
    if (file === `sw.js`) fail(`sw.js changed in Phase 20E (forbidden)`);
  }
}

function runtimeGuard(label, files) {
  const changed = new Set(changedFiles());
  for (const file of files) {
    if (changed.has(file)) fail(`${label} changed in Phase 20E (forbidden): ${file}`);
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
    if (phase20eAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === `src`) fail(`src/ file changed in Phase 20E (forbidden): ${file}`);
    if (firstSegment(file) === `tests`) fail(`tests/ file changed in Phase 20E (forbidden): ${file}`);
    if (firstSegment(file) === `e2e`) fail(`e2e/ file changed in Phase 20E (forbidden): ${file}`);
    if (file === `package.json`) fail(`package.json changed in Phase 20E (forbidden)`);
    if (file === `package-lock.json`) fail(`package-lock.json changed in Phase 20E (forbidden)`);
    if (file === `sw.js`) fail(`sw.js changed in Phase 20E (forbidden)`);
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    warn(`Unexpected file outside allowed Phase 20E scope (non-fatal): ${file}`);
  }
}

function requireHeadings(file, headings) {
  const text = normalize(read(file));
  for (const heading of headings) {
    if (!text.includes(normalize(heading))) fail(`${file} must include required heading: "${heading}"`);
  }
}

function requireTermAcrossFiles(term, files) {
  const combined = files.map(f => lowerNormalized(read(f))).join(` `);
  if (!combined.includes(lowerNormalized(term))) {
    fail(`Required term "${term}" not found across Phase 20E docs`);
  }
}

function statusTokenGuard() {
  for (const file of [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE]) {
    const text = lowerNormalized(read(file));
    if (!text.includes(requiredStatusToken)) {
      fail(`${file} must include status token: "REAL_USER_TEST_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY"`);
    }
  }
}

function holdReferenceGuard() {
  for (const file of [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE]) {
    const text = lowerNormalized(read(file));
    if (!text.includes(requiredHoldReference)) {
      fail(`${file} must reference Phase 20D HOLD decision token`);
    }
  }
}

function noBetaReadyActiveClaimGuard() {
  for (const file of [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE]) {
    const text = read(file);
    if (/LOCAL_FIRST_HYBRID_BETA_DECISION\s*:\s*BETA_READY/.test(text)) {
      fail(`${file} must not declare LOCAL_FIRST_HYBRID_BETA_DECISION: BETA_READY as an active claim`);
    }
  }
}

function isForbiddenClaimSection(line) {
  return /^##\s+(Forbidden|Claim boundaries|What is not ready|What Phase 20E explicitly does not implement|Missing|Remaining risks|Hold signals|What counts as hold evidence)/i.test(normalize(line));
}

function isNextSection(line) {
  return /^##\s+/.test(line);
}

function isNegatedClaimContext(line) {
  return /\b(if|later|future|only if|no|not|must not|does not|do not|none|without|forbidden|disallowed|absent|unshipped|not implemented|not yet|cannot|never|unchanged|claim.*unless|unless|only.*after|only.*when|reconsidered|reconsider|missing|imply|misleading|risk|không|chưa|nếu|sau này|bị cấm|không được phép)\b/i.test(line);
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
      fail(`${file} must not contain forbidden positive claim outside forbidden/warning sections: "${claim}" (line: ${line})`);
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
        if (!path.includes(`/`)) continue;
        if (!path.endsWith(`.md`) && !path.endsWith(`.js`)) continue;
        if (phase20eForwardCompatEntries.includes(path)) continue;
        if (previousForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`) || path.startsWith(`scripts/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-20E path entry: '${path}'`);
        }
      }
    }
  }
}

function validate() {
  requiredFilesGuard();
  workflowGuard();
  noTestsE2eChangesGuard();
  noSrcChangesGuard();
  noPackageChangesGuard();
  runtimeGuard(`FSRS runtime file`, fsrsRuntimeFiles);
  runtimeGuard(`Storage/migration runtime file`, storageMigrationRuntimeFiles);
  runtimeGuard(`Backup/export/restore runtime file`, backupRestoreRuntimeFiles);
  runtimeGuard(`Import parser/runtime file`, importParserRuntimeFiles);
  scopeGuard();
  requireHeadings(RESULTS_LOG_FILE, requiredResultsLogHeadings);
  requireHeadings(EVIDENCE_PROTO_FILE, requiredEvidenceProtoHeadings);
  statusTokenGuard();
  holdReferenceGuard();
  noBetaReadyActiveClaimGuard();

  // Scenario coverage: checked across both docs combined.
  for (const term of requiredScenarioTerms) {
    requireTermAcrossFiles(term, [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE]);
  }

  // Privacy/safety coverage: checked across both docs combined.
  for (const term of requiredPrivacySafetyTerms) {
    requireTermAcrossFiles(term, [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE]);
  }

  forbiddenPositiveClaimGuardForFile(RESULTS_LOG_FILE);
  forbiddenPositiveClaimGuardForFile(EVIDENCE_PROTO_FILE);
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 20E Real User Testing Results Log validation passed.`);
}

validate();
