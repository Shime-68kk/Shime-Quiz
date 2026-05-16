#!/usr/bin/env node
/**
 * scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js
 *
 * Phase 17C static validator — IndexedDB Migration Dry-Run Harness.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase17c-indexeddb-migration-dry-run-harness.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE17B_VALIDATOR = 'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js';

const DRY_RUN_HARNESS_FILE = 'src/storage/indexedDbDryRunHarness.js';
const DRY_RUN_TEST_FILE    = 'tests/unit/indexedDbDryRunHarness.test.js';

const ADAPTER_REGISTRY = 'src/storage/storageAdapterRegistry.js';

// Exact set of allowed changed files for Phase 17C.
const phase17cAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  DRY_RUN_HARNESS_FILE,
  DRY_RUN_TEST_FILE,
  // Historical validator forward-compat edits
  'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js',
  'scripts/validate-phase17a-backup-rollback-harness-before-migration.js',
  PHASE17B_VALIDATOR,
  // Phase 16C unit test updated for Phase 17C forward-compat
  'tests/unit/storageLargeImportEdugenRiskAudit.test.js',
  // Phase 16K unit test updated for Phase 17C forward-compat
  'tests/unit/storageQuotaBackupBeforeImport.test.jsx',
]);

// Files that absolutely must not change.
const forbiddenChangedFiles = [
  'package.json',
  'package-lock.json',
  'src/storage/StorageAdapter.js',
  'src/storage/LocalStorageAdapter.js',
  'src/storage/storageAdapterRegistry.js',
  'src/state/recommendationFeedbackStorage.js',
  'src/quiz/reviewSchedulerAdapter.js',
  'src/quiz/fsrsWrapper.js',
  'src/state/reviewScheduleStorage.js',
  'src/state/settingsStorage.js',
  'src/state/studyHistoryStorage.js',
  'src/state/studyDraftStorage.js',
  'src/state/studyGoalStorage.js',
  'src/state/studyPlanProgressStorage.js',
  'src/data/learningDataStore.js',
  'src/data/learningDataAdapter.js',
  'src/data/importValidator.js',
];

const forbiddenChangedPrefixes = ['e2e/', 'src/edugen/', 'src/components/edugen/'];

// These runtime files must not exist.
const forbiddenRuntimeFiles = [
  'src/storage/IndexedDBAdapter.js',
  'src/storage/SyncAdapter.js',
  'src/storage/EventLog.js',
];

// Forbidden runtime concepts in the dry-run harness itself.
const forbiddenHarnessConcepts = [
  'localStorage.setItem',
  'localStorage.removeItem',
  'getLocalStorage',
  'setStorageAdapterForTests',
  'getStorageAdapter',
  'dual-write',
  'dualWrite',
  'SyncAdapter',
  'EventLog',
  'migration status',
  'deleteDatabase.*real\|real.*deleteDatabase',
];

const forbiddenHarnessPatterns = [
  /localStorage\.setItem/,
  /localStorage\.removeItem/,
  /getLocalStorage\s*\(/,
  /setStorageAdapterForTests\s*\(/,
  /getStorageAdapter\s*\(/,
  /SyncAdapter/,
  /EventLog\s+runtime/,
];

// indexedDB usage is allowed only in the dry-run harness and its test.
const indexedDbAllowedFiles = new Set([
  DRY_RUN_HARNESS_FILE,
  DRY_RUN_TEST_FILE,
]);

const generatedArtifacts = [
  'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD', '.env', '.env.local', '.git'
];

const requiredDocSections = [
  '# Phase 17C — IndexedDB Migration Dry-Run Harness',
  '## Result',
  '## Phase Goal',
  '## Why This Follows Phase 17A and Phase 17B',
  '## What Dry-Run Harness Was Added',
  '## What the Dry-Run Harness Does NOT Do',
  '## No Live Migration',
  '## No Dual-Write',
  '## No Production Adapter Switch',
  '## No App Boot Migration',
  '## No User-Facing Migration UI',
  '## No SyncAdapter / EventLog',
  '## No Backup Schema Migration',
  '## No Storage Schema Migration',
  '## No Import Parser Semantics Change',
  '## No FSRS / EduGen / Scheduler Behavior Change',
  '## No localStorage Deletion',
  '## Forbidden',
  '## Validation Evidence Expected',
  '## Next Phase Dependency',
];

const requiredDocTerms = [
  'dry-run',
  'indexeddb',
  'shime-v2-indexeddb-dry-run',
  'no live migration',
  'no dual-write',
  'no production adapter switch',
  'no app boot migration',
  'no user-facing migration ui',
  'no syncadapter',
  'no eventlog',
  'no backup schema migration',
  'no storage schema migration',
  'no import parser',
  'no localstorage deletion',
  'no fsrs',
  'no fsrs / edugen',
  'phase 17a',
  'phase 17b',
  'phase 17d',
  'checkindexeddbavailability',
  'createindexeddbdryrunplan',
  'runindexeddbdryrun',
  'localstoragead',
];

const forbiddenClaimPhrases = [
  'indexeddb migration complete',
  'indexeddb is implemented',
  'migration done',
  'migration is complete',
  'cloud sync available',
  'cloud sync is available',
  'e2ee is available',
  'storageadapter production migration',
  'storageadapter migration complete',
  'production indexeddb backend',
  'public active fsrs rollout',
  'built-in ai exists',
  'built-in ocr',
  'guaranteed data safety',
  'guaranteed recovery',
  'guaranteed no data loss',
];

function fail(message) {
  console.error(`Phase 17C validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 17C validation warning: ${message}`);
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

// ── 1. Required files exist ───────────────────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE17B_VALIDATOR);
  read(DRY_RUN_HARNESS_FILE);
  read(DRY_RUN_TEST_FILE);
  read(ADAPTER_REGISTRY);
}

// ── 2. Workflow registers Phase 17C validator after Phase 17B ─────────────────

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase17bStr = 'node scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js';
  const phase17cStr = 'node scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js';

  if (!text.includes(phase17bStr)) fail(`${WORKFLOW_FILE} must register Phase 17B validator`);
  if (!text.includes(phase17cStr)) fail(`${WORKFLOW_FILE} must register Phase 17C validator`);

  const phase17bPos = text.indexOf(phase17bStr);
  const phase17cPos = text.indexOf(phase17cStr);
  if (phase17cPos <= phase17bPos) fail(`${WORKFLOW_FILE} must register Phase 17C validator after Phase 17B`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

// ── 3. Package files unchanged ────────────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 17C');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 17C');
}

// ── 4. No e2e changes ─────────────────────────────────────────────────────────

function e2eGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17C (forbidden): ${file}`);
  }
}

// ── 5 & 6. Scope guard ────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase17cAllowedChangedFiles.has(file)) continue;
    if (forbiddenChangedFiles.includes(file)) fail(`Forbidden file changed in Phase 17C: ${file}`);
    if (forbiddenChangedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed in Phase 17C: ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17C (forbidden): ${file}`);
    // New phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    if (file.startsWith('docs/') || file.startsWith('tests/') || file.startsWith('src/')) {
      fail(`Unexpected changed file for Phase 17C scope: ${file}`);
    }
    warn(`Unexpected file outside allowed scope (non-fatal): ${file}`);
  }
}

// ── 7. No forbidden runtime files ────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const path of forbiddenRuntimeFiles) {
    if (fs.existsSync(path)) fail(`Phase 17C must not introduce forbidden runtime file: ${path}`);
  }
}

// ── 8. indexedDB usage limited to dry-run harness and tests ──────────────────

function indexedDbScopeGuard() {
  function scanDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = `${dirPath}/${entry.name}`;
      const rel = full.replace(/^\.\//, '');
      if (entry.isDirectory()) {
        scanDir(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!(entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) continue;
      if (indexedDbAllowedFiles.has(rel)) continue;
      const content = fs.readFileSync(full, 'utf8');
      // Check for indexedDB usage outside allowed files
      if (/indexedDB\s*\.\s*open\s*\(|IDBDatabase|IDBObjectStore|IDBFactory/i.test(content)) {
        fail(`Forbidden IndexedDB runtime term found outside dry-run harness in: ${rel}`);
      }
    }
  }
  scanDir('./src');
}

// ── 9. Production adapter registry unchanged ──────────────────────────────────

function adapterRegistryGuard() {
  const content = read(ADAPTER_REGISTRY);
  if (!content.includes('LocalStorageAdapter')) {
    fail(`${ADAPTER_REGISTRY} must still use LocalStorageAdapter as production default`);
  }
  if (content.includes('indexedDbDryRunHarness')) {
    fail(`${ADAPTER_REGISTRY} must not reference indexedDbDryRunHarness`);
  }
  if (content.includes('IndexedDB') || content.includes('indexedDB')) {
    fail(`${ADAPTER_REGISTRY} must not reference IndexedDB`);
  }
}

function stripComments(content) {
  return content
    .split(/\r?\n/)
    .filter(line => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join('\n');
}

// ── 10. No live migration/dual-write/boot migration in harness ────────────────

function harnessConceptGuard() {
  const content = stripComments(read(DRY_RUN_HARNESS_FILE));
  for (const pattern of forbiddenHarnessPatterns) {
    if (pattern.test(content)) {
      fail(`Forbidden concept found in ${DRY_RUN_HARNESS_FILE}: ${pattern}`);
    }
  }
}

// ── 11. No localStorage deletion in harness ──────────────────────────────────

function noLocalStorageDeletionGuard() {
  const content = read(DRY_RUN_HARNESS_FILE);
  if (/localStorage\.removeItem|localStorage\.clear/.test(content)) {
    fail(`${DRY_RUN_HARNESS_FILE} must not delete localStorage data`);
  }
}

// ── 12. dryRunOnly marker present in harness ──────────────────────────────────

function dryRunOnlyMarkerGuard() {
  const content = read(DRY_RUN_HARNESS_FILE);
  if (!content.includes('dryRunOnly')) {
    fail(`${DRY_RUN_HARNESS_FILE} must include dryRunOnly in result objects`);
  }
}

// ── 13. No backup schema version bump ─────────────────────────────────────────

function noSchemaBumpGuard() {
  const doc = read(DOCS_FILE).toLowerCase();
  if (!doc.includes('no backup schema migration') && !doc.includes('no backup schema')) {
    fail(`${DOCS_FILE} must explicitly state no backup schema migration`);
  }
}

// ── 14. Required tests exist ──────────────────────────────────────────────────

function requiredTestsGuard() {
  const test = read(DRY_RUN_TEST_FILE);

  const requiredTerms = [
    'checkIndexedDbAvailability',
    'runIndexedDbDryRun',
    'createIndexedDbDryRunPlan',
    'cleanupIndexedDbDryRun',
    'dryRunOnly',
    'available:',
    'ok:',
    'no localStorage',
    'setItemSpy',
    'LocalStorageAdapter',
    'dry-run',
    'shime-v2-indexeddb-dry-run',
  ];

  for (const term of requiredTerms) {
    if (!test.includes(term)) {
      fail(`${DRY_RUN_TEST_FILE} must include required term: "${term}"`);
    }
  }
}

// ── 15. Required doc terms ────────────────────────────────────────────────────

function docTermGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();

  // Case-sensitive checks for camelCase terms
  const caseSensitiveTerms = [
    'checkIndexedDbAvailability',
    'runIndexedDbDryRun',
    'createIndexedDbDryRunPlan',
    'cleanupIndexedDbDryRun',
    'LocalStorageAdapter',
  ];
  for (const term of caseSensitiveTerms) {
    const termLower = term.toLowerCase();
    if (!lower.includes(termLower)) {
      fail(`${DOCS_FILE} must include required term (case-insensitive): "${term}"`);
    }
  }

  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── 16. Doc section guard ─────────────────────────────────────────────────────

function docSectionGuard() {
  const doc = read(DOCS_FILE);
  for (const section of requiredDocSections) {
    if (!doc.includes(section)) fail(`${DOCS_FILE} must include required section: "${section}"`);
  }
}

// ── 17. No forbidden public claims ────────────────────────────────────────────

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const lines = doc.split(/\r?\n/);
  let inForbiddenSection = false;
  for (const line of lines) {
    if (/^##\s+Forbidden/i.test(line)) { inForbiddenSection = true; continue; }
    if (/^##\s+/.test(line)) inForbiddenSection = false;
    if (inForbiddenSection) continue;
    const lineLower = line.toLowerCase();
    for (const claim of forbiddenClaimPhrases) {
      if (lineLower.includes(claim.toLowerCase())) {
        const negated = /no |not |must not|forbidden|do not|denied|absent|without/i.test(line);
        if (!negated) fail(`${DOCS_FILE} must not contain forbidden positive claim: "${claim}" (line: ${line.trim()})`);
      }
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

// ── Dry-run DB name guard ─────────────────────────────────────────────────────

function dryRunDbNameGuard() {
  const content = read(DRY_RUN_HARNESS_FILE);
  if (!content.includes('shime-v2-indexeddb-dry-run')) {
    fail(`${DRY_RUN_HARNESS_FILE} must use "shime-v2-indexeddb-dry-run" as the dry-run database name`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  workflowGuard();
  packageGuard();
  e2eGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  indexedDbScopeGuard();
  adapterRegistryGuard();
  harnessConceptGuard();
  noLocalStorageDeletionGuard();
  dryRunOnlyMarkerGuard();
  noSchemaBumpGuard();
  requiredTestsGuard();
  docSectionGuard();
  docTermGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  dryRunDbNameGuard();
  console.log('Phase 17C IndexedDB Migration Dry-Run Harness validation passed.');
}

validate();
