#!/usr/bin/env node
/**
 * scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js
 *
 * Phase 18E static validator — Limited Local Backend Pilot with Rollback Gates.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE          = `docs/phase18e-limited-local-backend-pilot-rollback-gates.md`;
const VALIDATOR_SCRIPT   = `scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js`;
const WORKFLOW_FILE      = `.github/workflows/e2e-smoke.yml`;
const PHASE18D_VALIDATOR = `scripts/validate-phase18d-internal-test-only-local-migration-pilot.js`;

const TEST_HELPER_FILE = `tests/unit/helpers/limitedLocalBackendPilot.js`;
const TEST_FILE        = `tests/unit/limitedLocalBackendPilot.test.js`;

const phase18eCoreFiles = [
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  TEST_HELPER_FILE,
  TEST_FILE,
];

const prePhase18eBaselineFiles = [
  `docs/phase18c-manual-migration-ux-plan.md`,
  `docs/phase18d-internal-test-only-local-migration-pilot.md`,
  `tests/unit/helpers/internalLocalMigrationPilot.js`,
  `tests/unit/internalLocalMigrationPilot.test.js`,
];

const previousForwardCompatEntries = [
  `docs/phase18c-manual-migration-ux-plan.md`,
  `docs/phase18d-internal-test-only-local-migration-pilot.md`,
  `scripts/validate-phase18d-internal-test-only-local-migration-pilot.js`,
  `tests/unit/helpers/internalLocalMigrationPilot.js`,
  `tests/unit/internalLocalMigrationPilot.test.js`,
  // Phase 19A forward-compat entries (FSRS Public Opt-In Sequencing Gate)
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
  // Phase 19B forward-compat entries (Optional Sync Architecture Decision Gate)
  `docs/adr/phase19b-optional-sync-direction.md`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
];

const phase18eAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  ...phase18eCoreFiles,
  ...prePhase18eBaselineFiles,
  // Phase 19A forward-compat entries (FSRS Public Opt-In Sequencing Gate)
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
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

const forbiddenHelperAndTestTerms = [
  `window.localStorage`,
  `globalThis.localStorage`,
  `localStorage.getItem`,
  `localStorage.setItem`,
  `localStorage.removeItem`,
  `localStorage.clear`,
  `window.indexedDB`,
  `globalThis.indexedDB`,
  `indexedDB.open`,
  `storageAdapterRegistry`,
  `getStorageAdapter`,
  `setStorageAdapterForTests`,
  `LocalStorageAdapter`,
  `indexedDbDryRunHarness`,
  `app boot migration`,
  `Settings UI`,
];

const forbiddenImportTerms = [
  `/src/`,
  `../src/`,
  `../../src/`,
  `storageAdapterRegistry`,
  `LocalStorageAdapter`,
  `StorageAdapter`,
  `indexedDbDryRunHarness`,
  `main.jsx`,
  `main.js`,
  `App.jsx`,
];

const requiredDocSections = [
  `# Phase 18E — Limited Local Backend Pilot with Rollback Gates`,
  `## Purpose`,
  `## Relationship to Phase 18D`,
  `## Production baseline`,
  `## Pilot scope`,
  `## Recommendation-feedback pilot family`,
  `## Synthetic local backend model`,
  `## Internal/test-only gate`,
  `## Preflight requirements`,
  `## Write gate requirements`,
  `## Verification gate requirements`,
  `## Rollback gate requirements`,
  `## Recovery verification requirements`,
  `## Failure and stop-on-failure behavior`,
  `## What Phase 18E explicitly does not implement`,
  `## Claim boundaries`,
  `## Go/no-go criteria for Phase 19A or storage-stabilization hold`,
  `## Future sequencing`,
  `## Acceptance criteria`,
];

const requiredDocTerms = [
  `phase 18e`,
  `phase 18d`,
  `internal/test-only`,
  `recommendation-feedback`,
  `synthetic local backend`,
  `synthetic source payload`,
  `testOnlyGate`,
  `write gate`,
  `rollback gate`,
  `write verification`,
  `rollback verification`,
  `stop-on-failure`,
  `explicit failure codes`,
  `localstorage is the canonical production source of truth`,
  `production behavior is unchanged`,
  `backup/export behavior is unchanged`,
  `restore behavior is unchanged`,
  `no production indexeddbadapter`,
  `no production registry switch`,
  `no app boot migration`,
  `no user-facing migration ui`,
  `no real user data`,
  `no localstorage deletion`,
  `no sync, cloud, account, auth, or backend service`,
  `pilot is not reachable by production users`,
  `data-loss prevention is not guaranteed`,
  `does not make backup/export adapter-aware`,
  `does not make restore adapter-aware`,
  `live_mode_rejected`,
  `missing_test_only_gate`,
  `write_gate_failed`,
  `write_verification_failed`,
  `rollback_gate_failed`,
  `rollback_checksum_mismatch`,
];

const requiredClaimBoundaryTerms = [
  `phase 18e is internal/test-only`,
  `localstorage is the canonical production source of truth`,
  `production behavior is unchanged`,
  `backup/export behavior is unchanged`,
  `restore behavior is unchanged`,
  `the pilot uses synthetic data only`,
  `synthetic local backend only`,
  `the pilot does not access real browser storage`,
  `no localstorage deletion happens`,
  `backupExportUnchanged: true`,
  `restoreUnchanged: true`,
  `internalPilotOnly: true`,
];

const forbiddenClaimPhrases = [
  `production migration has shipped`,
  `production indexeddb storage exists`,
  `production indexeddbadapter exists`,
  `production registry switch has occurred`,
  `backup/export is adapter-aware`,
  `restore is adapter-aware`,
  `data-loss prevention is guaranteed`,
  `live migration is safe`,
  `live migration is implemented`,
  `cloud sync exists`,
  `account or auth system exists`,
  `any backend service exists`,
  `any backend exists`,
  `public active fsrs rollout exists`,
  `built-in ai or ocr exists`,
  `pilot is reachable by production users`,
];

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
  console.error(`Phase 18E validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 18E validation warning: ${message}`);
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

function splitLines(value) {
  return value ? value.split(/\r?\n/).map(line => line.trim()).filter(Boolean) : [];
}

function uniqueSorted(items) {
  return [...new Set(items)].sort();
}

function changedFilesFromBranchBase() {
  const mergeBase = runGit(`git merge-base HEAD origin/main`, { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesFromLocalFallbacks({ includeUntracked = true } = {}) {
  const files = [
    ...splitLines(runGit(`git diff --name-only`, { silent: true })),
    ...splitLines(runGit(`git diff --cached --name-only`, { silent: true })),
  ];
  if (includeUntracked) {
    files.push(...splitLines(runGit(`git ls-files --others --exclude-standard`, { silent: true })));
  }
  return files;
}

function changedFiles(options = {}) {
  const includeUntracked = options.includeUntracked !== false;
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

function nonCommentContent(file) {
  return read(file)
    .split(/\r?\n/)
    .filter(line => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join('\n');
}

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE18D_VALIDATOR);
  read(TEST_HELPER_FILE);
  read(TEST_FILE);
}

function workflowGuard() {
  const text        = read(WORKFLOW_FILE);
  const phase18dStr = `node scripts/validate-phase18d-internal-test-only-local-migration-pilot.js`;
  const phase18eStr = `node scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js`;

  if (!text.includes(phase18dStr)) fail(`${WORKFLOW_FILE} must register Phase 18D validator`);
  if (!text.includes(phase18eStr)) fail(`${WORKFLOW_FILE} must register Phase 18E validator`);

  if (text.indexOf(phase18eStr) <= text.indexOf(phase18dStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 18E validator after Phase 18D`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has(`package.json`))      fail(`package.json must not change in Phase 18E`);
  if (changed.has(`package-lock.json`)) fail(`package-lock.json must not change in Phase 18E`);
}

function noSrcChangesGuard() {
  for (const file of changedFiles()) {
    if (firstSegment(file) === 'src') fail(`src/ file changed in Phase 18E (forbidden): ${file}`);
  }
}

function noE2eChangesGuard() {
  for (const file of changedFiles()) {
    if (firstSegment(file) === 'e2e') fail(`e2e/ file changed in Phase 18E (forbidden): ${file}`);
  }
}

function backupRestoreRuntimeGuard() {
  const changed = new Set(changedFiles());
  for (const file of backupRestoreRuntimeFiles) {
    if (changed.has(file)) fail(`Backup/export/restore runtime file changed in Phase 18E (forbidden): ${file}`);
  }
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith(`.claude/`)) continue;
    if (phase18eAllowedChangedFiles.has(file)) continue;
    if (file === `package.json` || file === `package-lock.json`) fail(`${file} must not change in Phase 18E`);
    if (firstSegment(file) === 'src') fail(`src/ file changed in Phase 18E (forbidden): ${file}`);
    if (firstSegment(file) === 'e2e') fail(`e2e/ file changed in Phase 18E (forbidden): ${file}`);
    if (firstSegment(file) === 'tests') fail(`Unexpected tests/ file changed in Phase 18E: ${file}`);
    if (firstSegment(file) === 'docs') fail(`Unexpected docs/ file changed in Phase 18E: ${file}`);
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    warn(`Unexpected file outside allowed Phase 18E scope (non-fatal): ${file}`);
  }
}

function forbiddenRuntimeFilesGuard() {
  for (const file of forbiddenRuntimeFiles) {
    if (fs.existsSync(file)) fail(`Phase 18E must not introduce forbidden runtime file: ${file}`);
  }
}

function forbiddenDependencyGuard() {
  const pkg = read(`package.json`);
  for (const dep of forbiddenDependencies) {
    if (new RegExp(`"${dep}"\\s*:`).test(pkg)) fail(`package.json must not add forbidden dependency: "${dep}"`);
  }
}

function helperAndTestLocationGuard() {
  if (!TEST_HELPER_FILE.startsWith(`tests/unit/helpers/`)) fail(`Helper must stay under tests/unit/helpers/`);
  if (!TEST_FILE.startsWith(`tests/unit/`)) fail(`Test file must stay under tests/unit/`);
}

function helperAndTestApiGuard() {
  for (const file of [TEST_HELPER_FILE, TEST_FILE]) {
    const content = nonCommentContent(file);
    for (const term of forbiddenHelperAndTestTerms) {
      if (content.includes(term)) fail(`${file} must not reference forbidden test-only boundary term: "${term}"`);
    }
  }
}

function helperAndTestImportGuard() {
  for (const file of [TEST_HELPER_FILE, TEST_FILE]) {
    const importLines = read(file).split(/\r?\n/).filter(line => /^import\s/.test(line.trim()));
    for (const line of importLines) {
      for (const term of forbiddenImportTerms) {
        if (line.includes(term)) fail(`${file} must not import production storage or app runtime: ${line.trim()}`);
      }
    }
  }
}

function helperExportGuard() {
  const content = read(TEST_HELPER_FILE);
  const required = [
    `createLimitedLocalBackendPilot`,
    `createSyntheticLocalBackend`,
    `validateBackendPilotPreflight`,
    `captureBackendPilotSnapshot`,
    `prepareBackendWriteGate`,
    `commitSyntheticBackendWrite`,
    `verifyBackendWriteGate`,
    `prepareRollbackGate`,
    `executeSyntheticRollback`,
    `verifyRollbackGate`,
    `runLimitedLocalBackendPilot`,
    `FAILURE_CODES`,
  ];
  for (const term of required) {
    if (!content.includes(term)) fail(`${TEST_HELPER_FILE} must include helper concept/export: "${term}"`);
  }
}

function testCoverageTermGuard() {
  const content = read(TEST_FILE);
  const required = [
    `recommendation-feedback`,
    `MISSING_TEST_ONLY_GATE`,
    `LIVE_MODE_REJECTED`,
    `MISSING_SOURCE_PAYLOAD`,
    `INVALID_BACKEND_KIND`,
    `PHASE18E_CANONICAL_SOURCE`,
    `prepareBackendWriteGate`,
    `commitSyntheticBackendWrite`,
    `verifyBackendWriteGate`,
    `prepareRollbackGate`,
    `executeSyntheticRollback`,
    `verifyRollbackGate`,
    `simulateBackendPilotFailure`,
    `idProvider`,
    `backupExportUnchanged`,
    `restoreUnchanged`,
    `claimBoundary`,
  ];
  for (const term of required) {
    if (!content.includes(term)) fail(`${TEST_FILE} must cover required test concept: "${term}"`);
  }
}

function docSectionGuard() {
  const doc = read(DOCS_FILE);
  for (const section of requiredDocSections) {
    if (!doc.includes(section)) fail(`${DOCS_FILE} must include required section: "${section}"`);
  }
}

function docTermGuard() {
  const lower = read(DOCS_FILE).toLowerCase();
  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${DOCS_FILE} must include required term: "${term}"`);
  }
}

function claimBoundaryTermGuard() {
  const lower = read(DOCS_FILE).toLowerCase();
  for (const term of requiredClaimBoundaryTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${DOCS_FILE} must include claim boundary term: "${term}"`);
  }
}

function forbiddenClaimGuard() {
  const lines = read(DOCS_FILE).split(/\r?\n/);
  let inSkippedSection = false;

  for (const line of lines) {
    if (/^##\s+(What Phase 18E explicitly does not implement|Claim boundaries)/i.test(line)) {
      inSkippedSection = true;
      continue;
    }
    if (/^##\s+/.test(line)) inSkippedSection = false;
    if (inSkippedSection) continue;

    const lowerLine = line.toLowerCase();
    for (const claim of forbiddenClaimPhrases) {
      if (!lowerLine.includes(claim.toLowerCase())) continue;
      const negated = /no |not |must not|forbidden|do not|absent|without|does not|has not|cannot|unchanged|rejected/i.test(line);
      if (!negated) fail(`${DOCS_FILE} must not contain forbidden positive claim: "${claim}" (line: ${line.trim()})`);
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
        if (phase18eCoreFiles.includes(path)) continue;
        if (previousForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-18E path entry: '${path}'`);
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
  noE2eChangesGuard();
  backupRestoreRuntimeGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  forbiddenDependencyGuard();
  helperAndTestLocationGuard();
  helperAndTestApiGuard();
  helperAndTestImportGuard();
  helperExportGuard();
  testCoverageTermGuard();
  docSectionGuard();
  docTermGuard();
  claimBoundaryTermGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 18E Limited Local Backend Pilot with Rollback Gates validation passed.`);
}

validate();
