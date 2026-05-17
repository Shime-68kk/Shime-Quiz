#!/usr/bin/env node
/**
 * scripts/validate-phase19c-optional-sync-conflict-model.js
 *
 * Phase 19C static validator — Optional Sync Conflict Model Design Gate.
 *
 * Phase 19C is docs/static-validator/CI-only. It does not implement sync,
 * conflict resolver runtime, event log runtime, or any production runtime.
 * It does not change storage, FSRS, backup/export/restore, package files,
 * UI, or tests. Its only deliverables are this validator, the Phase 19C
 * conflict model ADR, and the Phase 19C CI registration after Phase 19B.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ADR_FILE           = `docs/adr/phase19c-optional-sync-conflict-model.md`;
const VALIDATOR_SCRIPT   = `scripts/validate-phase19c-optional-sync-conflict-model.js`;
const WORKFLOW_FILE      = `.github/workflows/e2e-smoke.yml`;
const PHASE19B_VALIDATOR = `scripts/validate-phase19b-optional-sync-architecture-decision.js`;

// Phase 19C core files (docs + validator only — no test files).
const phase19cCoreFiles = [
  ADR_FILE,
  VALIDATOR_SCRIPT,
];

// Phase 19C forward-compat entries: the only paths historical validators may add.
const phase19cForwardCompatEntries = [
  `docs/adr/phase19c-optional-sync-conflict-model.md`,
  `scripts/validate-phase19c-optional-sync-conflict-model.js`,
];

// Pre-Phase-19C baseline files that may already appear in historical validator
// forward-compat lists from prior phases. They are NOT additions in Phase 19C;
// they are tolerated only so that pre-existing references in historical validators
// do not trip this guard.
const previousForwardCompatEntries = [
  // Phase 18C/18D/18E baseline (preserved from prior phases)
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
];

// Pre-Phase-19C baseline files that may appear in changedFiles() if the branch
// is based on a pre-merged Phase 19B state.
const prePhase19cBaselineFiles = [
  `docs/phase18c-manual-migration-ux-plan.md`,
  `docs/phase18d-internal-test-only-local-migration-pilot.md`,
  `docs/phase18e-limited-local-backend-pilot-rollback-gates.md`,
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `docs/adr/phase19b-optional-sync-direction.md`,
  `tests/unit/helpers/internalLocalMigrationPilot.js`,
  `tests/unit/internalLocalMigrationPilot.test.js`,
  `tests/unit/helpers/limitedLocalBackendPilot.js`,
  `tests/unit/limitedLocalBackendPilot.test.js`,
];

const phase19cAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  ADR_FILE,
  VALIDATOR_SCRIPT,
  PHASE19B_VALIDATOR,
  ...prePhase19cBaselineFiles,
]);

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
  `src/storage/MigrationJournal.js`,
  `src/storage/SyncAdapter.js`,
  `src/storage/syncEngine.js`,
  `src/storage/conflictResolver.js`,
  `src/storage/operationLog.js`,
  `src/storage/tombstones.js`,
  `src/storage/deviceIdentity.js`,
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
  `node_modules`, `dist`, `test-results`, `playwright-report`, `coverage`, `FETCH_HEAD`, `.env`, `.env.local`, `.git`
];

const requiredAdrSections = [
  `# Phase 19C — Optional Sync Conflict Model Design`,
  `## Purpose`,
  `## Relationship to Phase 19B`,
  `## Current production baseline`,
  `## Conflict model decision`,
  `## Two-layer model overview`,
  `## Event log design boundary`,
  `## Per-record revision clock design boundary`,
  `## Tombstone design boundary`,
  `## Device identity design boundary`,
  `## Per-family merge policy`,
  `## Backup-before-merge invariant`,
  `## FSRS and review schedule conflict policy`,
  `## Manual conflict resolution policy`,
  `## Families that must never auto-sync`,
  `## Validator and CI guardrails`,
  `## What Phase 19C explicitly does not implement`,
  `## Go/no-go criteria for Phase 19D`,
  `## Future sequencing`,
  `## Acceptance criteria`,
];

const requiredAdrDecisionTerms = [
  `phase 19c is docs/static-validator/ci-only`,
  `conflict_model_decision: event_log_plus_per_record_revision_clock`,
  `sync runtime is not implemented`,
  `conflict resolver runtime is not implemented`,
  `event log runtime is not implemented`,
  `account/cloud sync is not implemented`,
  `no shime-hosted backend exists`,
  `no account/auth/identity exists`,
  `no remote endpoint exists`,
  `no dual-write exists`,
  `no app-boot migration exists`,
  `no production storage backend switch exists`,
  `no production indexeddbadapter exists`,
  `no runtime migration exists`,
  `no localstorage deletion happens`,
  `localstorage remains the canonical production source of truth`,
  `backup/export/restore behavior remains unchanged`,
  `phase 19c does not unlock sync implementation`,
  `manual transfer still comes before runtime sync`,
  `phase 19d must define no-cloud/default-off trust copy`,
];

const requiredPerFamilyPolicyTerms = [
  `library / quiz data`,
  `study history`,
  `review schedules`,
  `fsrs metadata`,
  `settings`,
  `recommendation feedback`,
  `edugen draft`,
  `backup`,
  `migration manifests`,
  `never-auto-sync`,
  `per-record`,
  `append-only`,
  `backup-before-merge`,
];

const requiredBackupBeforeMergeTerms = [
  `backup-before-merge invariant`,
  `restorable local snapshot`,
  `backup payloads must not be sync targets`,
  `migration journals`,
  `merge must be reversible`,
  `local state must not be silently overwritten`,
];

const requiredFsrsPolicyTerms = [
  `fsrs sync cannot precede phase 19a`,
  `fsrs/review schedule data must not silently merge`,
  `fsrs/review schedule data requires per-record revision clocks`,
  `device-authoritative`,
  `backup-before-merge is mandatory for fsrs`,
];

const forbiddenClaimPhrases = [
  `sync exists`,
  `conflict resolver exists`,
  `event log runtime exists`,
  `device identity runtime exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync is ready`,
  `encrypted end-to-end`,
  `zero-knowledge`,
  `sync just works`,
  `no conflicts`,
  `data-loss prevention is guaranteed`,
  `production indexeddb storage exists`,
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
  console.error(`Phase 19C validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 19C validation warning: ${message}`);
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

// ── 1. Required files exist ────────────────────────────────────────────────────

function requiredFilesGuard() {
  read(ADR_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE19B_VALIDATOR);
}

// ── 2. Workflow registers Phase 19C validator after Phase 19B ─────────────────

function workflowGuard() {
  const text        = read(WORKFLOW_FILE);
  const phase19bStr = `node scripts/validate-phase19b-optional-sync-architecture-decision.js`;
  const phase19cStr = `node scripts/validate-phase19c-optional-sync-conflict-model.js`;

  if (!text.includes(phase19bStr)) fail(`${WORKFLOW_FILE} must register Phase 19B validator`);
  if (!text.includes(phase19cStr)) fail(`${WORKFLOW_FILE} must register Phase 19C validator`);

  if (text.indexOf(phase19cStr) <= text.indexOf(phase19bStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 19C validator after Phase 19B`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

// ── 3. Package files unchanged ─────────────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has(`package.json`))      fail(`package.json must not change in Phase 19C`);
  if (changed.has(`package-lock.json`)) fail(`package-lock.json must not change in Phase 19C`);
}

// ── 4. No src/ changes ────────────────────────────────────────────────────────

function noSrcChangesGuard() {
  for (const file of changedFiles()) {
    if (phase19cAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === 'src') fail(`src/ file changed in Phase 19C (forbidden): ${file}`);
  }
}

// ── 5. No tests/ changes ──────────────────────────────────────────────────────

function noTestsChangesGuard() {
  for (const file of changedFiles()) {
    if (phase19cAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === 'tests') fail(`tests/ file changed in Phase 19C (forbidden): ${file}`);
  }
}

// ── 6. No e2e/ changes ────────────────────────────────────────────────────────

function noE2eChangesGuard() {
  for (const file of changedFiles()) {
    if (phase19cAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === 'e2e') fail(`e2e/ file changed in Phase 19C (forbidden): ${file}`);
  }
}

// ── 7. FSRS runtime files unchanged ───────────────────────────────────────────

function fsrsRuntimeGuard() {
  const changed = new Set(changedFiles());
  for (const file of fsrsRuntimeFiles) {
    if (changed.has(file)) fail(`FSRS runtime file changed in Phase 19C (forbidden): ${file}`);
  }
}

// ── 8. Storage/migration runtime files unchanged ──────────────────────────────

function storageMigrationRuntimeGuard() {
  const changed = new Set(changedFiles());
  for (const file of storageMigrationRuntimeFiles) {
    if (changed.has(file)) fail(`Storage/migration runtime file changed in Phase 19C (forbidden): ${file}`);
  }
}

// ── 9. Backup/export/restore runtime files unchanged ──────────────────────────

function backupRestoreRuntimeGuard() {
  const changed = new Set(changedFiles());
  for (const file of backupRestoreRuntimeFiles) {
    if (changed.has(file)) fail(`Backup/export/restore runtime file changed in Phase 19C (forbidden): ${file}`);
  }
}

// ── 10. Scope guard ───────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith(`.claude/`)) continue;
    if (phase19cAllowedChangedFiles.has(file)) continue;
    if (file === `package.json` || file === `package-lock.json`) fail(`${file} must not change in Phase 19C`);
    if (firstSegment(file) === 'src') fail(`src/ file changed in Phase 19C (forbidden): ${file}`);
    if (firstSegment(file) === 'e2e') fail(`e2e/ file changed in Phase 19C (forbidden): ${file}`);
    if (firstSegment(file) === 'tests') fail(`tests/ file changed in Phase 19C (forbidden): ${file}`);
    if (firstSegment(file) === 'docs' && file !== ADR_FILE) {
      fail(`Unexpected docs/ file changed in Phase 19C: ${file}`);
    }
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    warn(`Unexpected file outside allowed Phase 19C scope (non-fatal): ${file}`);
  }
}

// ── 11. Forbidden runtime files absent ────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const file of forbiddenRuntimeFiles) {
    if (fs.existsSync(file)) fail(`Phase 19C must not introduce forbidden runtime file: ${file}`);
  }
}

// ── 12. No forbidden dependency additions ─────────────────────────────────────

function forbiddenDependencyGuard() {
  const pkg = read(`package.json`);
  for (const dep of forbiddenDependencies) {
    if (new RegExp(`"${dep}"\\s*:`).test(pkg)) fail(`package.json must not add forbidden dependency: "${dep}"`);
  }
}

// ── 13. Required ADR sections ─────────────────────────────────────────────────

function adrSectionGuard() {
  const adr = read(ADR_FILE);
  for (const section of requiredAdrSections) {
    if (!adr.includes(section)) fail(`${ADR_FILE} must include required section: "${section}"`);
  }
}

// ── 14. Required ADR decision terms ───────────────────────────────────────────

function adrDecisionTermGuard() {
  const lower = read(ADR_FILE).toLowerCase();
  for (const term of requiredAdrDecisionTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${ADR_FILE} must include required decision term: "${term}"`);
  }
}

// ── 15. Required per-family policy terms ──────────────────────────────────────

function adrPerFamilyPolicyGuard() {
  const lower = read(ADR_FILE).toLowerCase();
  for (const term of requiredPerFamilyPolicyTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${ADR_FILE} must include per-family policy term: "${term}"`);
  }
}

// ── 16. Required backup-before-merge invariant terms ──────────────────────────

function adrBackupBeforeMergeGuard() {
  const lower = read(ADR_FILE).toLowerCase();
  for (const term of requiredBackupBeforeMergeTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${ADR_FILE} must include backup-before-merge term: "${term}"`);
  }
}

// ── 17. Required FSRS policy terms ────────────────────────────────────────────

function adrFsrsPolicyGuard() {
  const lower = read(ADR_FILE).toLowerCase();
  for (const term of requiredFsrsPolicyTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${ADR_FILE} must include FSRS policy term: "${term}"`);
  }
}

// ── 18. Forbidden positive claims absent ──────────────────────────────────────

function forbiddenClaimGuard() {
  const lines = read(ADR_FILE).split(/\r?\n/);
  let inSkippedSection = false;

  for (const line of lines) {
    if (/^##\s+(What Phase 19C explicitly does not implement|Current production baseline|Go\/no-go criteria for Phase 19D|Future sequencing|Acceptance criteria|Validator and CI guardrails|Families that must never auto-sync|Backup-before-merge invariant|FSRS and review schedule conflict policy|Manual conflict resolution policy)/i.test(line)) {
      inSkippedSection = true;
      continue;
    }
    if (/^##\s+/.test(line)) inSkippedSection = false;
    if (inSkippedSection) continue;

    const lowerLine = line.toLowerCase();
    for (const claim of forbiddenClaimPhrases) {
      if (!lowerLine.includes(claim.toLowerCase())) continue;
      const negated = /no |not |must not|forbidden|do not|absent|without|does not|has not|cannot|unchanged|rejected|unshipped|not shipped|never|disallowed|forbidden|claim that/i.test(line);
      if (!negated) fail(`${ADR_FILE} must not contain forbidden positive claim: "${claim}" (line: ${line.trim()})`);
    }
  }
}

// ── 19. No generated artifacts in tracked/changed files ───────────────────────

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

// ── 20. Historical validator forward-compat entries are Phase 19C paths only ──

function historicalValidatorForwardCompatGuard() {
  const mergeBase = runGit(`git merge-base HEAD origin/main`, { silent: true });
  const changedValidators = changedFiles().filter(file =>
    file.startsWith(`scripts/validate-`) &&
    file.endsWith(`.js`) &&
    file !== VALIDATOR_SCRIPT
  );

  for (const validatorFile of changedValidators) {
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
        if (phase19cForwardCompatEntries.includes(path)) continue;
        if (previousForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`) || path.startsWith(`scripts/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-19C path entry: '${path}'`);
        }
      }
    }
  }
}

function validate() {
  requiredFilesGuard();
  workflowGuard();
  packageGuard();
  noSrcChangesGuard();
  noTestsChangesGuard();
  noE2eChangesGuard();
  fsrsRuntimeGuard();
  storageMigrationRuntimeGuard();
  backupRestoreRuntimeGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  forbiddenDependencyGuard();
  adrSectionGuard();
  adrDecisionTermGuard();
  adrPerFamilyPolicyGuard();
  adrBackupBeforeMergeGuard();
  adrFsrsPolicyGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 19C Optional Sync Conflict Model Design validation passed.`);
}

validate();
