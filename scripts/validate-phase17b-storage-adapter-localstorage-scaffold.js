#!/usr/bin/env node
/**
 * scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js
 *
 * Phase 17B static validator — StorageAdapter Scaffold behind LocalStorage/no-op Driver.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase17b-storage-adapter-localstorage-scaffold.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE17A_VALIDATOR = 'scripts/validate-phase17a-backup-rollback-harness-before-migration.js';

const STORAGE_ADAPTER_FILE   = 'src/storage/StorageAdapter.js';
const LOCAL_STORAGE_ADAPTER  = 'src/storage/LocalStorageAdapter.js';
const ADAPTER_REGISTRY       = 'src/storage/storageAdapterRegistry.js';
const FEEDBACK_STORAGE       = 'src/state/recommendationFeedbackStorage.js';
const TEST_SCAFFOLD          = 'tests/unit/storageAdapterScaffold.test.js';
const TEST_FEEDBACK_ADAPTER  = 'tests/unit/recommendationFeedbackStorageAdapter.test.js';

// Exact set of allowed changed files for Phase 17B.
const phase17bAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  STORAGE_ADAPTER_FILE,
  LOCAL_STORAGE_ADAPTER,
  ADAPTER_REGISTRY,
  FEEDBACK_STORAGE,
  TEST_SCAFFOLD,
  TEST_FEEDBACK_ADAPTER,
  // Historical validator forward-compat edits
  'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js',
  PHASE17A_VALIDATOR,
  'scripts/validate-backup-transfer-safety-hardening.js',
  // Phase 16C unit test updated for Phase 17B scaffold forward-compat
  'tests/unit/storageLargeImportEdugenRiskAudit.test.js',
  // Phase 17C forward-compat entries (IndexedDB dry-run harness)
  'docs/phase17c-indexeddb-migration-dry-run-harness.md',
  'scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js',
  'src/storage/indexedDbDryRunHarness.js',
  'tests/unit/indexedDbDryRunHarness.test.js',
  'tests/unit/storageQuotaBackupBeforeImport.test.jsx',
  // Phase 17D forward-compat entries (Migration Journal / Event Log Architecture)
  'docs/phase17d-migration-journal-event-log-architecture.md',
  'scripts/validate-phase17d-migration-journal-event-log-architecture.js',
  // Phase 17E forward-compat entries (Per-Key Migration Manifest Design)
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
]);

// Files that absolutely must not change.
const forbiddenChangedFiles = [
  'package.json',
  'package-lock.json',
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

// These files must not exist under any circumstances in Phase 17B.
const forbiddenRuntimeFiles = [
  'src/storage/IndexedDBAdapter.js',
  'src/storage/SyncAdapter.js',
  'src/storage/EventLog.js',
  'src/sync',
  'src/auth',
  'src/cloud',
  'src/backend',
];

// IndexedDB and forbidden runtime terms must not appear in Phase 17B source files.
const forbiddenRuntimeTerms = [
  'indexedDB',
  'IDBDatabase',
  'IDBObjectStore',
  'openDB',
  'idb',
  'dexie',
  'localforage',
];

const forbiddenSyncTerms = [
  'dual-write',
  'dualWrite',
  'SyncAdapter',
  'EventLog runtime',
  'cloud sync',
  'account/auth',
  'driver state machine',
  'storage migration',
  'indexeddb.open',
];

const generatedArtifacts = [
  'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD', '.env', '.env.local', '.git'
];

const requiredDocSections = [
  '# Phase 17B — StorageAdapter Scaffold behind LocalStorage/no-op Driver',
  '## Result',
  '## Phase Goal',
  '## Why This Follows Phase 17A',
  '## What StorageAdapter Scaffold Was Added',
  '## Why LocalStorageAdapter Is a No-op/Current-Behavior Driver',
  '## Which Module Was Migrated and Why',
  '## What Did Not Change',
  '## No IndexedDB',
  '## No Migration',
  '## No Dual-Write',
  '## No Sync / Cloud / Account / Auth',
  '## No EventLog',
  '## No Backup Format Migration',
  '## No Storage Schema Migration',
  '## No Import Parser Semantics Change',
  '## No Review Schedule / Settings / Library Migration',
  '## No FSRS / EduGen / Scheduler Behavior Change',
  '## Validation Evidence Expected',
  '## Forbidden',
  '## Next Phase Dependency'
];

const requiredDocTerms = [
  'storageadapter scaffold',
  'localstoragead',
  'no-op',
  'no indexeddb',
  'no migration',
  'no dual-write',
  'no sync',
  'no eventlog',
  'no backup format migration',
  'no storage schema migration',
  'no import parser',
  'no review schedule',
  'no fsrs',
  'no fsrs / edugen',
  'phase 17a',
  'phase 17c',
  'dry-run',
  'recommendationfeedbackstorage',
  'localstorage',
];

const forbiddenClaimPhrases = [
  'indexeddb done',
  'indexeddb is implemented',
  'migration done',
  'migration is complete',
  'cloud sync is available',
  'cloud sync available',
  'e2ee is available',
  'storageadapter production migration',
  'storageadapter migration complete',
  'public active fsrs rollout',
  'built-in ai exists',
  'built-in ocr',
  'guaranteed data safety',
  'guaranteed recovery',
  'guaranteed no data loss',
];

function fail(message) {
  console.error(`Phase 17B validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 17B validation warning: ${message}`);
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

// ── 1. Phase 17B doc exists ───────────────────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE17A_VALIDATOR);
  read(STORAGE_ADAPTER_FILE);
  read(LOCAL_STORAGE_ADAPTER);
  read(ADAPTER_REGISTRY);
  read(FEEDBACK_STORAGE);
  read(TEST_SCAFFOLD);
  read(TEST_FEEDBACK_ADAPTER);
}

// ── 2. Workflow registers Phase 17B validator after Phase 17A ─────────────────

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase17aStr = 'node scripts/validate-phase17a-backup-rollback-harness-before-migration.js';
  const phase17bStr = 'node scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js';

  if (!text.includes(phase17aStr)) fail(`${WORKFLOW_FILE} must register Phase 17A validator`);
  if (!text.includes(phase17bStr)) fail(`${WORKFLOW_FILE} must register Phase 17B validator`);

  const phase17aPos = text.indexOf(phase17aStr);
  const phase17bPos = text.indexOf(phase17bStr);
  if (phase17bPos <= phase17aPos) fail(`${WORKFLOW_FILE} must register Phase 17B validator after Phase 17A`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

// ── 3. Package files unchanged ────────────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 17B');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 17B');
}

// ── 4. No e2e changes ─────────────────────────────────────────────────────────

function e2eGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17B (forbidden): ${file}`);
  }
}

// ── 5 & 6. Scope guard ────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase17bAllowedChangedFiles.has(file)) continue;
    if (forbiddenChangedFiles.includes(file)) fail(`Forbidden file changed in Phase 17B: ${file}`);
    if (forbiddenChangedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed in Phase 17B: ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17B (forbidden): ${file}`);
    // New phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    if (file.startsWith('docs/') || file.startsWith('tests/') || file.startsWith('src/')) {
      fail(`Unexpected changed file for Phase 17B scope: ${file}`);
    }
    warn(`Unexpected file outside allowed scope (non-fatal): ${file}`);
  }
}

// ── 7. No forbidden IndexedDB/Sync/EventLog files ────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const path of forbiddenRuntimeFiles) {
    if (fs.existsSync(path)) fail(`Phase 17B must not introduce forbidden runtime path: ${path}`);
  }
}

// ── 8. No IndexedDB usage in Phase 17B source files ──────────────────────────

function noIndexedDbGuard() {
  const phase17bSourceFiles = [
    STORAGE_ADAPTER_FILE,
    LOCAL_STORAGE_ADAPTER,
    ADAPTER_REGISTRY,
    FEEDBACK_STORAGE,
    TEST_SCAFFOLD,
    TEST_FEEDBACK_ADAPTER,
  ];
  for (const file of phase17bSourceFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const term of forbiddenRuntimeTerms) {
      if (content.includes(term) && term !== 'idb') {
        fail(`Forbidden IndexedDB/library term "${term}" found in ${file}`);
      }
      // 'idb' can appear as substring (e.g., 'calibrate') — check word boundary
      if (term === 'idb') {
        if (/\bidb\b/i.test(content)) fail(`Forbidden IndexedDB term "idb" found in ${file}`);
      }
    }
  }
}

// ── 9. No sync/cloud/account/auth/backend ─────────────────────────────────────

function stripComments(content) {
  // Remove single-line comments and block comment lines before scanning for terms.
  return content
    .split(/\r?\n/)
    .filter(line => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join('\n');
}

function noSyncCloudGuard() {
  const phase17bSourceFiles = [
    STORAGE_ADAPTER_FILE,
    LOCAL_STORAGE_ADAPTER,
    ADAPTER_REGISTRY,
    FEEDBACK_STORAGE,
  ];
  for (const file of phase17bSourceFiles) {
    if (!fs.existsSync(file)) continue;
    const contentLower = stripComments(fs.readFileSync(file, 'utf8')).toLowerCase();
    for (const term of forbiddenSyncTerms) {
      if (contentLower.includes(term.toLowerCase())) {
        fail(`Forbidden sync/cloud term "${term}" found in ${file}`);
      }
    }
  }
}

// ── 10. No storage migration / dual-write / driver state machine ──────────────
// (covered by noSyncCloudGuard forbiddenSyncTerms)

// ── 11. No backup schema version bump ─────────────────────────────────────────

function noSchemaBumpGuard() {
  const doc = read(DOCS_FILE).toLowerCase();
  if (!doc.includes('no backup format migration') && !doc.includes('no backup schema')) {
    fail(`${DOCS_FILE} must explicitly state no backup schema / format migration`);
  }
}

// ── 12. No storage schema migration ──────────────────────────────────────────
// (covered by doc section check)

// ── 13. No import parser semantics changes ────────────────────────────────────
// (import-related files not in allowed changed files)

// ── 14. Required tests exist ──────────────────────────────────────────────────

function requiredTestsGuard() {
  const scaffold = read(TEST_SCAFFOLD);
  const feedbackTest = read(TEST_FEEDBACK_ADAPTER);

  const scaffoldTerms = [
    'LocalStorageAdapter',
    'readRaw',
    'writeRaw',
    'removeRaw',
    'readJson',
    'getStorageAdapter',
    'setStorageAdapterForTests',
    'resetStorageAdapterForTests',
  ];
  for (const term of scaffoldTerms) {
    if (!scaffold.includes(term)) fail(`${TEST_SCAFFOLD} must include test term: "${term}"`);
  }

  const feedbackTerms = [
    'RECOMMENDATION_FEEDBACK_STORAGE_KEY',
    'readRecommendationFeedback',
    'saveRecommendationFeedback',
    'clearRecommendationFeedback',
    'storage_unavailable',
    'corrupted',
    'schemaVersion',
  ];
  for (const term of feedbackTerms) {
    if (!feedbackTest.includes(term)) fail(`${TEST_FEEDBACK_ADAPTER} must include test term: "${term}"`);
  }
}

// ── 15. Recommendation feedback is the only migrated module ──────────────────

function onlyFeedbackMigratedGuard() {
  const adapterRegistry = read(ADAPTER_REGISTRY);
  const protectedModules = [
    'reviewScheduleStorage',
    'settingsStorage',
    'learningDataStore',
    'studyHistoryStorage',
    'studyDraftStorage',
    'studyGoalStorage',
    'studyPlanProgressStorage',
  ];
  for (const mod of protectedModules) {
    if (adapterRegistry.toLowerCase().includes(mod.toLowerCase())) {
      fail(`storageAdapterRegistry.js must not reference protected module: ${mod}`);
    }
  }

  // Verify other storage modules have not been modified
  const changed = new Set(changedFiles());
  for (const file of forbiddenChangedFiles) {
    if (changed.has(file)) fail(`Protected module must not change in Phase 17B: ${file}`);
  }
}

// ── 16. Required doc terms ────────────────────────────────────────────────────

function docTermGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── Doc section guard ─────────────────────────────────────────────────────────

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

// ── LocalStorageAdapter behavioral check ─────────────────────────────────────

function localStorageAdapterBehaviorGuard() {
  const content = read(LOCAL_STORAGE_ADAPTER);
  if (!content.includes('getLocalStorage')) {
    fail(`${LOCAL_STORAGE_ADAPTER} must use getLocalStorage() from src/utils/storage.js`);
  }
  if (!content.includes('StorageAdapter')) {
    fail(`${LOCAL_STORAGE_ADAPTER} must extend StorageAdapter`);
  }
}

// ── Registry production default guard ────────────────────────────────────────

function registryDefaultGuard() {
  const content = read(ADAPTER_REGISTRY);
  if (!content.includes('LocalStorageAdapter')) {
    fail(`${ADAPTER_REGISTRY} must use LocalStorageAdapter as production default`);
  }
  if (!content.includes('getStorageAdapter')) {
    fail(`${ADAPTER_REGISTRY} must export getStorageAdapter()`);
  }
  if (!content.includes('setStorageAdapterForTests')) {
    fail(`${ADAPTER_REGISTRY} must export setStorageAdapterForTests()`);
  }
  if (!content.includes('resetStorageAdapterForTests')) {
    fail(`${ADAPTER_REGISTRY} must export resetStorageAdapterForTests()`);
  }
}

// ── Feedback module uses adapter, not direct localStorage ─────────────────────

function feedbackModuleAdapterGuard() {
  const content = read(FEEDBACK_STORAGE);
  if (!content.includes('getStorageAdapter')) {
    fail(`${FEEDBACK_STORAGE} must use getStorageAdapter() from storageAdapterRegistry`);
  }
  // Must NOT import getLocalStorage directly (it now routes through adapter)
  if (content.includes("from '../utils/storage.js'")) {
    fail(`${FEEDBACK_STORAGE} must not import directly from src/utils/storage.js after migration`);
  }
  // Must still use the same storage key
  if (!content.includes("'shimeV2RecommendationFeedbackV1'") && !content.includes('"shimeV2RecommendationFeedbackV1"')) {
    fail(`${FEEDBACK_STORAGE} must preserve storage key 'shimeV2RecommendationFeedbackV1'`);
  }
  // Must still publish to localStorageSync
  if (!content.includes('publishLearningStorageChanged')) {
    fail(`${FEEDBACK_STORAGE} must preserve publishLearningStorageChanged behavior`);
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
  noIndexedDbGuard();
  noSyncCloudGuard();
  noSchemaBumpGuard();
  generatedArtifactGuard();
  docSectionGuard();
  docTermGuard();
  requiredTestsGuard();
  onlyFeedbackMigratedGuard();
  forbiddenClaimGuard();
  localStorageAdapterBehaviorGuard();
  registryDefaultGuard();
  feedbackModuleAdapterGuard();
  console.log('Phase 17B StorageAdapter Scaffold behind LocalStorage/no-op Driver validation passed.');
}

validate();
