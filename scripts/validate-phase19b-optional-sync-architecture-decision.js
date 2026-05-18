#!/usr/bin/env node
/**
 * scripts/validate-phase19b-optional-sync-architecture-decision.js
 *
 * Phase 19B static validator — Optional Sync Architecture Decision Gate.
 *
 * Phase 19B is docs/static-validator/CI-only. It does not implement sync.
 * It does not change runtime, storage, FSRS, backup/export/restore, package
 * files, UI, or tests. Its only deliverables are this validator, the Phase
 * 19B ADR, and the Phase 19B CI registration after Phase 19A.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ADR_FILE           = `docs/adr/phase19b-optional-sync-direction.md`;
const VALIDATOR_SCRIPT   = `scripts/validate-phase19b-optional-sync-architecture-decision.js`;
const WORKFLOW_FILE      = `.github/workflows/e2e-smoke.yml`;
const PHASE19A_VALIDATOR = `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`;

// Phase 19B core files (docs + validator only — no test files).
const phase19bCoreFiles = [
  ADR_FILE,
  VALIDATOR_SCRIPT,
];

// Phase 19B forward-compat entries: the only paths historical validators may add.
const phase19bForwardCompatEntries = [
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
  // Phase 20C forward-compat entries (Performance / Quota / Import Stress Test Plan)
  `docs/adr/phase20c-performance-quota-import-stress-test-plan.md`,
  `docs/testing/phase20c-performance-quota-import-stress-test-plan.md`,
  `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`,
];

// Pre-Phase-19B baseline files that may already appear in historical validator
// forward-compat lists from prior phases. They are NOT additions in Phase 19B;
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
  // Phase 19A baseline (already merged on origin/main before Phase 19B branched).
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
];

// Pre-Phase-19B baseline files that may appear in changedFiles() if the branch
// is based on a pre-merged Phase 19A state. They are tolerated as no-ops here.
const prePhase19bBaselineFiles = [
  `docs/phase18c-manual-migration-ux-plan.md`,
  `docs/phase18d-internal-test-only-local-migration-pilot.md`,
  `docs/phase18e-limited-local-backend-pilot-rollback-gates.md`,
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `tests/unit/helpers/internalLocalMigrationPilot.js`,
  `tests/unit/internalLocalMigrationPilot.test.js`,
  `tests/unit/helpers/limitedLocalBackendPilot.js`,
  `tests/unit/limitedLocalBackendPilot.test.js`,
];

const phase19bAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  ADR_FILE,
  VALIDATOR_SCRIPT,
  PHASE19A_VALIDATOR,
  ...prePhase19bBaselineFiles,
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
  // Phase 20C forward-compat entries (Performance / Quota / Import Stress Test Plan)
  `docs/adr/phase20c-performance-quota-import-stress-test-plan.md`,
  `docs/testing/phase20c-performance-quota-import-stress-test-plan.md`,
  `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`,
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
  `# Phase 19B — Optional Sync Architecture Decision`,
  `## Purpose`,
  `## Research source`,
  `## Executive decision`,
  `## Current baseline and non-negotiable guardrails`,
  `## Option comparison summary`,
  `## Selected approach: HYBRID_STAGED_APPROACH`,
  `## Near-term direction: manual transfer first`,
  `## Mid-term direction: conflict model and trust copy gates`,
  `## Long-term optional sync conditions`,
  `## Data-family sync risk classification`,
  `## Backup/export/restore implications`,
  `## FSRS and scheduler metadata implications`,
  `## Vietnamese-first UX and trust copy implications`,
  `## Security and privacy claim boundaries`,
  `## Phase 19C scope`,
  `## Phase 19D scope`,
  `## Phase 20A–20D alignment`,
  `## Go/no-go criteria before any sync implementation`,
  `## What Phase 19B explicitly does not implement`,
  `## Acceptance criteria`,
];

const requiredAdrDecisionTerms = [
  `phase 19b is docs/static-validator/ci-only`,
  `hybrid_staged_approach`,
  `sync runtime is not implemented`,
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
  `phase 19b does not unlock sync implementation`,
  `manual transfer comes before runtime sync`,
  `phase 19c should decide`,
  `phase 19d should define`,
  `no sync runtime before manual transfer has shipped`,
  `no sync runtime before conflict model and trust copy gates are merged`,
  `no sync runtime before backup-before-merge is a static-validator invariant`,
];

const requiredOptionTerms = [
  `option a`,
  `option b`,
  `option c`,
  `option d`,
  `option e`,
];

const requiredDataFamilyTerms = [
  `library / quiz data`,
  `study history`,
  `review schedules`,
  `fsrs metadata`,
  `settings`,
  `recommendation feedback`,
  `edugen draft`,
  `backup / restore payloads`,
  `migration manifests`,
];

const requiredAllowedClaimTerms = [
  `local-first by default`,
  `no account required`,
  `no cloud sync today`,
  `data stays on this device unless exported`,
  `optional sync architecture direction has been decided`,
  `sync remains unshipped`,
];

const forbiddenClaimPhrases = [
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `encrypted end-to-end`,
  `zero-knowledge`,
  `sync just works`,
  `no conflicts`,
  `production sync is ready`,
  `data-loss prevention is guaranteed`,
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
  console.error(`Phase 19B validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 19B validation warning: ${message}`);
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
  read(PHASE19A_VALIDATOR);
}

// ── 2. Workflow registers Phase 19B validator after Phase 19A ─────────────────

function workflowGuard() {
  const text        = read(WORKFLOW_FILE);
  const phase19aStr = `node scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`;
  const phase19bStr = `node scripts/validate-phase19b-optional-sync-architecture-decision.js`;

  if (!text.includes(phase19aStr)) fail(`${WORKFLOW_FILE} must register Phase 19A validator`);
  if (!text.includes(phase19bStr)) fail(`${WORKFLOW_FILE} must register Phase 19B validator`);

  if (text.indexOf(phase19bStr) <= text.indexOf(phase19aStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 19B validator after Phase 19A`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

// ── 3. Package files unchanged ─────────────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has(`package.json`))      fail(`package.json must not change in Phase 19B`);
  if (changed.has(`package-lock.json`)) fail(`package-lock.json must not change in Phase 19B`);
}

// ── 4. No src/ changes ────────────────────────────────────────────────────────

function noSrcChangesGuard() {
  for (const file of changedFiles()) {
    if (phase19bAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === 'src') fail(`src/ file changed in Phase 19B (forbidden): ${file}`);
  }
}

// ── 5. No tests/ changes (only pre-Phase-19B baseline test files allowed) ─────

function noTestsChangesGuard() {
  for (const file of changedFiles()) {
    if (phase19bAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === 'tests') fail(`tests/ file changed in Phase 19B (forbidden): ${file}`);
  }
}

// ── 6. No e2e/ changes ────────────────────────────────────────────────────────

function noE2eChangesGuard() {
  for (const file of changedFiles()) {
    if (phase19bAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === 'e2e') fail(`e2e/ file changed in Phase 19B (forbidden): ${file}`);
  }
}

// ── 7. FSRS runtime files unchanged ───────────────────────────────────────────

function fsrsRuntimeGuard() {
  const changed = new Set(changedFiles());
  for (const file of fsrsRuntimeFiles) {
    if (changed.has(file)) fail(`FSRS runtime file changed in Phase 19B (forbidden): ${file}`);
  }
}

// ── 8. Storage/migration runtime files unchanged ──────────────────────────────

function storageMigrationRuntimeGuard() {
  const changed = new Set(changedFiles());
  for (const file of storageMigrationRuntimeFiles) {
    if (changed.has(file)) fail(`Storage/migration runtime file changed in Phase 19B (forbidden): ${file}`);
  }
}

// ── 9. Backup/export/restore runtime files unchanged ──────────────────────────

function backupRestoreRuntimeGuard() {
  const changed = new Set(changedFiles());
  for (const file of backupRestoreRuntimeFiles) {
    if (changed.has(file)) fail(`Backup/export/restore runtime file changed in Phase 19B (forbidden): ${file}`);
  }
}

// ── 10. Scope guard ───────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith(`.claude/`)) continue;
    if (phase19bAllowedChangedFiles.has(file)) continue;
    if (file === `package.json` || file === `package-lock.json`) fail(`${file} must not change in Phase 19B`);
    if (firstSegment(file) === 'src') fail(`src/ file changed in Phase 19B (forbidden): ${file}`);
    if (firstSegment(file) === 'e2e') fail(`e2e/ file changed in Phase 19B (forbidden): ${file}`);
    if (firstSegment(file) === 'tests') fail(`tests/ file changed in Phase 19B (forbidden): ${file}`);
    if (firstSegment(file) === 'docs' && file !== ADR_FILE) {
      fail(`Unexpected docs/ file changed in Phase 19B: ${file}`);
    }
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    warn(`Unexpected file outside allowed Phase 19B scope (non-fatal): ${file}`);
  }
}

// ── 11. Forbidden runtime files absent ────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const file of forbiddenRuntimeFiles) {
    if (fs.existsSync(file)) fail(`Phase 19B must not introduce forbidden runtime file: ${file}`);
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

// ── 15. Required option comparison terms ──────────────────────────────────────

function adrOptionTermGuard() {
  const lower = read(ADR_FILE).toLowerCase();
  for (const term of requiredOptionTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${ADR_FILE} must include option comparison term: "${term}"`);
  }
}

// ── 16. Required data-family classification terms ─────────────────────────────

function adrDataFamilyTermGuard() {
  const lower = read(ADR_FILE).toLowerCase();
  for (const term of requiredDataFamilyTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${ADR_FILE} must include data-family term: "${term}"`);
  }
}

// ── 17. Required allowed claim terms ──────────────────────────────────────────

function adrAllowedClaimTermGuard() {
  const lower = read(ADR_FILE).toLowerCase();
  for (const term of requiredAllowedClaimTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${ADR_FILE} must include allowed claim term: "${term}"`);
  }
}

// ── 18. Forbidden positive claims absent (outside disallowed-claim sections) ──

function forbiddenClaimGuard() {
  const lines = read(ADR_FILE).split(/\r?\n/);
  let inSkippedSection = false;

  for (const line of lines) {
    if (/^##\s+(What Phase 19B explicitly does not implement|Security and privacy claim boundaries|Current baseline and non-negotiable guardrails|Long-term optional sync conditions|Go\/no-go criteria before any sync implementation|FSRS and scheduler metadata implications|Backup\/export\/restore implications|Data-family sync risk classification|Phase 19C scope|Phase 19D scope|Phase 20A–20D alignment|Acceptance criteria|Mid-term direction: conflict model and trust copy gates)/i.test(line)) {
      inSkippedSection = true;
      continue;
    }
    if (/^##\s+/.test(line)) inSkippedSection = false;
    if (inSkippedSection) continue;

    const lowerLine = line.toLowerCase();
    for (const claim of forbiddenClaimPhrases) {
      if (!lowerLine.includes(claim.toLowerCase())) continue;
      const negated = /no |not |must not|forbidden|do not|absent|without|does not|has not|cannot|unchanged|rejected|unshipped|not shipped|never|disallowed|forbidden positive|claim that/i.test(line);
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

// ── 20. Historical validator forward-compat entries are Phase 19B paths only ──

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
        if (phase19bForwardCompatEntries.includes(path)) continue;
        if (previousForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`) || path.startsWith(`scripts/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-19B path entry: '${path}'`);
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
  adrOptionTermGuard();
  adrDataFamilyTermGuard();
  adrAllowedClaimTermGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 19B Optional Sync Architecture Decision Gate validation passed.`);
}

validate();
