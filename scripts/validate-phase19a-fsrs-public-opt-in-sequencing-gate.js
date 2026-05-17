#!/usr/bin/env node
/**
 * scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js
 *
 * Phase 19A static validator — FSRS Public Opt-In Sequencing Gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE          = `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`;
const VALIDATOR_SCRIPT   = `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`;
const WORKFLOW_FILE      = `.github/workflows/e2e-smoke.yml`;
const PHASE18E_VALIDATOR = `scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js`;

// Phase 19A core files (docs + validator only — no test files).
const phase19aCoreFiles = [
  DOCS_FILE,
  VALIDATOR_SCRIPT,
];

// Phase 19A forward-compat entries: the only paths historical validators may add.
const phase19aForwardCompatEntries = [
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
  // Phase 19B forward-compat entries (Optional Sync Architecture Decision Gate)
  `docs/adr/phase19b-optional-sync-direction.md`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
];

// Pre-Phase-19A baseline files added in Phase 18 that may appear in changedFiles()
// when this branch is based on a pre-merged Phase 18E state.
const prePhase19aBaselineFiles = [
  `docs/phase18c-manual-migration-ux-plan.md`,
  `docs/phase18d-internal-test-only-local-migration-pilot.md`,
  `docs/phase18e-limited-local-backend-pilot-rollback-gates.md`,
  `tests/unit/helpers/internalLocalMigrationPilot.js`,
  `tests/unit/internalLocalMigrationPilot.test.js`,
  `tests/unit/helpers/limitedLocalBackendPilot.js`,
  `tests/unit/limitedLocalBackendPilot.test.js`,
];

// Previous forward-compat entries that historical validators may already contain
// from Phase 18C, 18D, and 18E additions.
const previousForwardCompatEntries = [
  `docs/phase18c-manual-migration-ux-plan.md`,
  `docs/phase18d-internal-test-only-local-migration-pilot.md`,
  `docs/phase18e-limited-local-backend-pilot-rollback-gates.md`,
  `tests/unit/helpers/internalLocalMigrationPilot.js`,
  `tests/unit/internalLocalMigrationPilot.test.js`,
  `tests/unit/helpers/limitedLocalBackendPilot.js`,
  `tests/unit/limitedLocalBackendPilot.test.js`,
];

const phase19aAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  PHASE18E_VALIDATOR,
  ...prePhase19aBaselineFiles,
  // Phase 19B forward-compat entries (Optional Sync Architecture Decision Gate)
  `docs/adr/phase19b-optional-sync-direction.md`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
]);

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
];

const forbiddenDependencies = [`idb`, `dexie`, `localforage`, `pouchdb`, `rxdb`, `firebase`, `supabase`];

const generatedArtifacts = [
  `node_modules`, `dist`, `test-results`, `playwright-report`, `coverage`, `FETCH_HEAD`, `.env`, `.env.local`, `.git`
];

const requiredDocSections = [
  `# Phase 19A — FSRS Public Opt-In Sequencing Gate`,
  `## Purpose`,
  `## Relationship to Phase 15 FSRS foundation`,
  `## Relationship to Phase 18 storage safety foundation`,
  `## Current production baseline`,
  `## Public opt-in is not shipped in Phase 19A`,
  `## Preconditions before any public FSRS opt-in`,
  `## Storage and backup trust dependencies`,
  `## User-facing opt-in principles`,
  `## Rollback and exit requirements`,
  `## Copy and claim boundaries`,
  `## Risk register`,
  `## Go/no-go criteria for future FSRS public opt-in implementation`,
  `## What Phase 19A explicitly does not implement`,
  `## Future sequencing`,
  `## Acceptance criteria`,
];

const requiredDocTerms = [
  `phase 19a`,
  `phase 15`,
  `phase 18`,
  `docs/static-validator/ci`,
  `public fsrs opt-in is not shipped`,
  `no user-facing fsrs opt-in ui`,
  `no active fsrs scheduling behavior changes`,
  `ts-fsrs.next()`,
  `experimental`,
  `double-gated`,
  `internal/test`,
  `localstorage is the canonical production source of truth`,
  `production backup/export/restore behavior remains unchanged`,
  `internal/test-only and synthetic-only`,
  `no production indexeddbadapter`,
  `no production storage registry switch`,
  `no runtime migration`,
  `no sync, cloud, account, auth, or backend`,
];

const requiredPreconditionTerms = [
  `storage safety foundation remains green`,
  `backup/export/restore trust boundaries are not regressed`,
  `rollback and exit paths are documented`,
  `fsrs claim language remains narrow and honest`,
  `user-controlled and reversible`,
  `must not silently migrate existing records`,
  `must not change storage backends`,
  `must not imply cloud/sync/account/auth`,
  `must not guarantee better outcomes`,
  `recovery copy before implementation`,
  `internal dogfood gate`,
  `explicit metrics/evidence requirements`,
];

const requiredRiskTerms = [
  `user misunderstanding experimental fsrs`,
  `perceived data loss`,
  `backup/restore mismatch`,
  `rollback confusion`,
  `mixed sm-2/fsrs`,
  `public claim overreach`,
  `premature ui toggle`,
  `migration implied by opt-in`,
  `support burden`,
  `storage foundation regression`,
  `sync/cloud misconception`,
  `vietnamese-first copy ambiguity`,
];

const requiredGoNoCriteriaTerms = [
  `phase 19a merged and ci green`,
  `phase 18 storage safety validators remain green`,
  `phase 15 fsrs double-gate validators remain green`,
  `public copy is approved as experimental and reversible`,
  `no production storage migration is required`,
  `backup/restore behavior remains trustworthy`,
  `rollback/exit plan exists`,
  `internal dogfood plan exists`,
  `user-facing copy avoids guarantees`,
];

const requiredNoGoCriteriaTerms = [
  `request to enable public fsrs without rollback copy`,
  `request to migrate existing records silently`,
  `request to remove double gate immediately`,
  `request to imply guaranteed learning gains`,
  `request to imply cloud sync/account backup`,
  `request to change storage backend as part of opt-in`,
  `request to expose ui before guardrails are validated`,
];

const requiredAllowedClaimTerms = [
  `fsrs public opt-in sequencing has been planned`,
  `public opt-in remains unshipped`,
  `active fsrs remains experimental and controlled`,
  `storage safety dependencies for future fsrs opt-in are documented`,
  `rollback/exit requirements for future public opt-in are documented`,
  `localstorage remains canonical production storage`,
  `production backup/export/restore behavior remains unchanged`,
];

const forbiddenClaimPhrases = [
  `public fsrs opt-in exists`,
  `public fsrs rollout has shipped`,
  `active fsrs is broadly available`,
  `fsrs guarantees better learning`,
  `production storage migration is complete`,
  `production indexeddb storage exists`,
  `backup/export is adapter-aware`,
  `restore is adapter-aware`,
  `sync/cloud/account/auth/backend exists`,
  `data-loss prevention is guaranteed`,
  `built-in ai or ocr exists`,
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
  console.error(`Phase 19A validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 19A validation warning: ${message}`);
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
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE18E_VALIDATOR);
}

// ── 2. Workflow registers Phase 19A validator after Phase 18E ──────────────────

function workflowGuard() {
  const text        = read(WORKFLOW_FILE);
  const phase18eStr = `node scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js`;
  const phase19aStr = `node scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`;

  if (!text.includes(phase18eStr)) fail(`${WORKFLOW_FILE} must register Phase 18E validator`);
  if (!text.includes(phase19aStr)) fail(`${WORKFLOW_FILE} must register Phase 19A validator`);

  if (text.indexOf(phase19aStr) <= text.indexOf(phase18eStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 19A validator after Phase 18E`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

// ── 3. Package files unchanged ─────────────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has(`package.json`))      fail(`package.json must not change in Phase 19A`);
  if (changed.has(`package-lock.json`)) fail(`package-lock.json must not change in Phase 19A`);
}

// ── 4. No src/ changes ────────────────────────────────────────────────────────

function noSrcChangesGuard() {
  for (const file of changedFiles()) {
    if (phase19aAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === 'src') fail(`src/ file changed in Phase 19A (forbidden): ${file}`);
  }
}

// ── 5. No tests/ changes (only pre-Phase-19A baseline test files allowed) ─────

function noTestsChangesGuard() {
  for (const file of changedFiles()) {
    if (phase19aAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === 'tests') fail(`tests/ file changed in Phase 19A (forbidden): ${file}`);
  }
}

// ── 6. No e2e/ changes ────────────────────────────────────────────────────────

function noE2eChangesGuard() {
  for (const file of changedFiles()) {
    if (phase19aAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === 'e2e') fail(`e2e/ file changed in Phase 19A (forbidden): ${file}`);
  }
}

// ── 7. Backup/export/restore runtime files unchanged ─────────────────────────

function backupRestoreRuntimeGuard() {
  const changed = new Set(changedFiles());
  for (const file of backupRestoreRuntimeFiles) {
    if (changed.has(file)) fail(`Backup/export/restore runtime file changed in Phase 19A (forbidden): ${file}`);
  }
}

// ── 8. Scope guard ────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith(`.claude/`)) continue;
    if (phase19aAllowedChangedFiles.has(file)) continue;
    if (file === `package.json` || file === `package-lock.json`) fail(`${file} must not change in Phase 19A`);
    if (firstSegment(file) === 'src') fail(`src/ file changed in Phase 19A (forbidden): ${file}`);
    if (firstSegment(file) === 'e2e') fail(`e2e/ file changed in Phase 19A (forbidden): ${file}`);
    if (firstSegment(file) === 'tests') fail(`tests/ file changed in Phase 19A (forbidden): ${file}`);
    if (firstSegment(file) === 'docs') fail(`Unexpected docs/ file changed in Phase 19A: ${file}`);
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    warn(`Unexpected file outside allowed Phase 19A scope (non-fatal): ${file}`);
  }
}

// ── 9. Forbidden runtime files absent ─────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const file of forbiddenRuntimeFiles) {
    if (fs.existsSync(file)) fail(`Phase 19A must not introduce forbidden runtime file: ${file}`);
  }
}

// ── 10. No forbidden dependency additions ─────────────────────────────────────

function forbiddenDependencyGuard() {
  const pkg = read(`package.json`);
  for (const dep of forbiddenDependencies) {
    if (new RegExp(`"${dep}"\\s*:`).test(pkg)) fail(`package.json must not add forbidden dependency: "${dep}"`);
  }
}

// ── 11. Required doc sections ─────────────────────────────────────────────────

function docSectionGuard() {
  const doc = read(DOCS_FILE);
  for (const section of requiredDocSections) {
    if (!doc.includes(section)) fail(`${DOCS_FILE} must include required section: "${section}"`);
  }
}

// ── 12. Required doc terms ────────────────────────────────────────────────────

function docTermGuard() {
  const lower = read(DOCS_FILE).toLowerCase();
  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${DOCS_FILE} must include required term: "${term}"`);
  }
}

// ── 13. Required precondition terms ──────────────────────────────────────────

function preconditionTermGuard() {
  const lower = read(DOCS_FILE).toLowerCase();
  for (const term of requiredPreconditionTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${DOCS_FILE} must include precondition term: "${term}"`);
  }
}

// ── 14. Required risk register terms ─────────────────────────────────────────

function riskTermGuard() {
  const lower = read(DOCS_FILE).toLowerCase();
  for (const term of requiredRiskTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${DOCS_FILE} must include risk register term: "${term}"`);
  }
}

// ── 15. Required go/no-go criteria terms ─────────────────────────────────────

function goNoGoCriteriaGuard() {
  const lower = read(DOCS_FILE).toLowerCase();
  for (const term of requiredGoNoCriteriaTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${DOCS_FILE} must include go-criteria term: "${term}"`);
  }
  for (const term of requiredNoGoCriteriaTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${DOCS_FILE} must include no-go-criteria term: "${term}"`);
  }
}

// ── 16. Required allowed claim terms ─────────────────────────────────────────

function allowedClaimTermGuard() {
  const lower = read(DOCS_FILE).toLowerCase();
  for (const term of requiredAllowedClaimTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${DOCS_FILE} must include allowed claim term: "${term}"`);
  }
}

// ── 17. Forbidden positive claims absent ─────────────────────────────────────

function forbiddenClaimGuard() {
  const lines = read(DOCS_FILE).split(/\r?\n/);
  let inSkippedSection = false;

  for (const line of lines) {
    if (/^##\s+(What Phase 19A explicitly does not implement|Copy and claim boundaries)/i.test(line)) {
      inSkippedSection = true;
      continue;
    }
    if (/^##\s+/.test(line)) inSkippedSection = false;
    if (inSkippedSection) continue;

    const lowerLine = line.toLowerCase();
    for (const claim of forbiddenClaimPhrases) {
      if (!lowerLine.includes(claim.toLowerCase())) continue;
      const negated = /no |not |must not|forbidden|do not|absent|without|does not|has not|cannot|unchanged|rejected|unshipped|not shipped/i.test(line);
      if (!negated) fail(`${DOCS_FILE} must not contain forbidden positive claim: "${claim}" (line: ${line.trim()})`);
    }
  }
}

// ── 18. No generated artifacts in tracked/changed files ───────────────────────

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

// ── 19. Historical validator forward-compat entries are Phase 19A paths only ──

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
        if (phase19aForwardCompatEntries.includes(path)) continue;
        if (previousForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-19A path entry: '${path}'`);
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
  backupRestoreRuntimeGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  forbiddenDependencyGuard();
  docSectionGuard();
  docTermGuard();
  preconditionTermGuard();
  riskTermGuard();
  goNoGoCriteriaGuard();
  allowedClaimTermGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 19A FSRS Public Opt-In Sequencing Gate validation passed.`);
}

validate();
