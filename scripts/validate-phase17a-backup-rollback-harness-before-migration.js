#!/usr/bin/env node
/**
 * scripts/validate-phase17a-backup-rollback-harness-before-migration.js
 *
 * Phase 17A static validator — Backup/Rollback Harness BEFORE Migration.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase17a-backup-rollback-harness-before-migration.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase17a-backup-rollback-harness-before-migration.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE16L_VALIDATOR = 'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js';

const PHASE17A_TEST_FILE = 'tests/unit/phase17aBackupRollbackHarness.test.js';
const V2_BACKUP_RESTORE  = 'src/state/v2BackupRestore.js';
const STORAGE_QUOTA_UTIL = 'src/utils/storageQuotaEstimate.js';

const phase17aAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  PHASE17A_TEST_FILE,
  V2_BACKUP_RESTORE,
  STORAGE_QUOTA_UTIL,
  // Historical validator forward-compat edits
  PHASE16L_VALIDATOR,
  'scripts/validate-storage-quota-warning-runtime.js',
  // Phase 17B forward-compat entries (StorageAdapter scaffold)
  'docs/phase17b-storage-adapter-localstorage-scaffold.md',
  'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js',
  'scripts/validate-backup-transfer-safety-hardening.js',
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
]);

// Phase 17B forward-compat: StorageAdapter/LocalStorageAdapter/registry are now
// created by Phase 17B and are legitimate scaffold files, not forbidden paths.
const forbiddenRuntimePaths = [
  'src/storage/IndexedDBAdapter.js',
  'src/storage/SyncAdapter.js',
  'src/storage/EventLog.js',
  'src/sync/SyncAdapter.js',
  'src/sync/EventLog.js',
  'src/auth',
  'src/cloud',
  'src/backend',
  'src/api/sync',
  'src/sync'
];

const forbiddenChangedFiles = [
  'package.json',
  'package-lock.json',
  'src/quiz/reviewSchedulerAdapter.js',
  'src/quiz/fsrsWrapper.js',
  'src/state/reviewScheduleStorage.js',
  'src/state/settingsStorage.js',
  'src/data/learningDataAdapter.js',
  'src/data/importValidator.js',
];

const forbiddenChangedPrefixes = ['e2e/', 'src/edugen/', 'src/components/edugen/'];

const generatedArtifacts = [
  'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD', '.env', '.env.local', '.git'
];

const requiredDocSections = [
  '# Phase 17A — Backup/Rollback Harness BEFORE Migration',
  '## Result',
  '## Phase Goal',
  '## Why Backup/Rollback Harness Comes Before Migration',
  '## What Runtime Safety Changed',
  '## What Did Not Change',
  '## Backup Readiness Behavior',
  '## Restore Rollback Behavior',
  '## Read-after-Write / Verification Behavior',
  '## Migration Readiness Contract',
  '## Validation Evidence Expected',
  '## Forbidden',
  '## Next Phase Dependency'
];

const requiredDocTerms = [
  'backup readiness',
  'restore rollback',
  'read-after-write',
  'verificationMismatches',
  'captureRestoreSnapshot',
  'checkStorageHeadroomForBytes',
  'estimateV2BackupReadiness',
  'no indexeddb',
  'no src/storage',
  'no storageadapter',
  'no sync',
  'no backup schema',
  'no import parser',
  'no fsrs',
  'vietnamese-first',
  'phase 17b'
];

const requiredRuntimeTerms = [
  'checkStorageHeadroomForBytes',
  'estimateV2BackupReadiness',
  'captureRestoreSnapshot',
  'verifyRestoredWrite',
  'verificationMismatches'
];

const requiredTestTerms = [
  'checkStorageHeadroomForBytes',
  'estimateV2BackupReadiness',
  'captureRestoreSnapshot',
  'verificationMismatches',
  'preflight',
  'rollback',
  'snapshot'
];

const forbiddenClaimPhrases = [
  'guaranteed data safety',
  'guaranteed recovery',
  'guaranteed no data loss',
  'cloud sync is available',
  'cloud backup',
  'e2ee is available',
  'indexeddb is implemented',
  'storageadapter runtime',
  'public active fsrs rollout',
  'built-in ai exists',
  'built-in ocr'
];

function fail(message) {
  console.error(`Phase 17A validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 17A validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function readOptional(file) {
  if (!fs.existsSync(file)) return '';
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

// ── Required files guard ──────────────────────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE16L_VALIDATOR);
  read(PHASE17A_TEST_FILE);
  read(V2_BACKUP_RESTORE);
  read(STORAGE_QUOTA_UTIL);
}

// ── Package guard ─────────────────────────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 17A');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 17A');
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase17aAllowedChangedFiles.has(file)) continue;
    if (forbiddenChangedFiles.includes(file)) fail(`Forbidden file changed in Phase 17A: ${file}`);
    if (forbiddenChangedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed in Phase 17A: ${file}`);
    if (file === 'package.json' || file === 'package-lock.json') fail(`${file} must not change in Phase 17A`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17A (forbidden): ${file}`);
    // New phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    // Warn about unexpected files but don't fail for docs/
    if (file.startsWith('docs/') || file.startsWith('tests/') || file.startsWith('src/')) {
      fail(`Unexpected changed file for Phase 17A scope: ${file}`);
    }
    warn(`Unexpected file outside allowed scope (non-fatal): ${file}`);
  }
}

// ── Forbidden runtime paths guard ────────────────────────────────────────────

// Phase 17B forward-compat: src/storage/ may exist (created by Phase 17B scaffold).
// Only truly forbidden runtime paths (IndexedDB, Sync, EventLog, auth, cloud) are checked.
function forbiddenRuntimePathsGuard() {
  for (const path of forbiddenRuntimePaths) {
    if (fs.existsSync(path)) fail(`Phase 17A must not introduce storage/sync/cloud/auth path: ${path}`);
  }
}

// ── Forbidden file guard ──────────────────────────────────────────────────────

function forbiddenFileGuard() {
  const changed = new Set(changedFiles());
  for (const file of forbiddenChangedFiles) {
    if (changed.has(file)) fail(`Forbidden file must not change in Phase 17A: ${file}`);
  }
  for (const prefix of forbiddenChangedPrefixes) {
    for (const file of changed) {
      if (file.startsWith(prefix)) fail(`Forbidden path must not change in Phase 17A: ${file}`);
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
  const phase16lStr = 'node scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js';
  const phase17aStr = 'node scripts/validate-phase17a-backup-rollback-harness-before-migration.js';

  if (!text.includes(phase16lStr)) fail(`${WORKFLOW_FILE} must register Phase 16L validator`);
  if (!text.includes(phase17aStr)) fail(`${WORKFLOW_FILE} must register Phase 17A validator`);

  const phase16lPos = text.indexOf(phase16lStr);
  const phase17aPos = text.indexOf(phase17aStr);
  if (phase17aPos <= phase16lPos) fail(`${WORKFLOW_FILE} must register Phase 17A validator after Phase 16L`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

// ── Doc section guard ─────────────────────────────────────────────────────────

function docSectionGuard() {
  const doc = read(DOCS_FILE);
  for (const section of requiredDocSections) {
    if (!doc.includes(section)) fail(`${DOCS_FILE} must include required section: "${section}"`);
  }
}

// ── Doc term guard ────────────────────────────────────────────────────────────

function docTermGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`${DOCS_FILE} must include required term: "${term}"`);
  }
}

// ── Runtime term guard ────────────────────────────────────────────────────────

function runtimeTermGuard() {
  const backupRestore = read(V2_BACKUP_RESTORE);
  const quotaUtil = read(STORAGE_QUOTA_UTIL);
  const combined = backupRestore + '\n' + quotaUtil;
  for (const term of requiredRuntimeTerms) {
    if (!combined.includes(term)) fail(`Runtime source (v2BackupRestore.js or storageQuotaEstimate.js) must include term: "${term}"`);
  }
}

// ── No schema bump guard ──────────────────────────────────────────────────────

function noSchemaBumpGuard() {
  const doc = read(DOCS_FILE).toLowerCase();
  if (!doc.includes('no schema version bump') && !doc.includes('no backup schema')) {
    fail(`${DOCS_FILE} must explicitly state no backup schema version bump`);
  }
  const backupRestore = read(V2_BACKUP_RESTORE);
  const schemaMatch = backupRestore.match(/V2_BACKUP_SCHEMA_VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (!schemaMatch) fail('v2BackupRestore.js must still define V2_BACKUP_SCHEMA_VERSION');
  if (schemaMatch[1] !== 'shime-v2-backup-v1') {
    fail(`v2BackupRestore.js V2_BACKUP_SCHEMA_VERSION must not change (found: ${schemaMatch[1]})`);
  }
}

// ── Required test guard ───────────────────────────────────────────────────────

function requiredTestGuard() {
  const test = read(PHASE17A_TEST_FILE);
  for (const term of requiredTestTerms) {
    if (!test.includes(term)) fail(`${PHASE17A_TEST_FILE} must include test term: "${term}"`);
  }
}

// ── Forbidden claim guard ─────────────────────────────────────────────────────

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const claim of forbiddenClaimPhrases) {
    if (lower.includes(claim.toLowerCase())) {
      // Check if the line containing the claim is in a "Forbidden" section or negated
      const lines = doc.split(/\r?\n/);
      let inForbiddenSection = false;
      for (const line of lines) {
        if (/^##\s+Forbidden/i.test(line)) { inForbiddenSection = true; continue; }
        if (/^##\s+/.test(line)) inForbiddenSection = false;
        if (inForbiddenSection) continue;
        const lineLower = line.toLowerCase();
        if (lineLower.includes(claim.toLowerCase())) {
          const negated = /no |not |must not|forbidden|do not|denied|absent|without/i.test(line);
          if (!negated) fail(`${DOCS_FILE} must not contain forbidden positive claim: "${claim}" (line: ${line.trim()})`);
        }
      }
    }
  }
}

// ── Phase 16L constraint guard ────────────────────────────────────────────────

function phase16lConstraintGuard() {
  // Phase 17B forward-compat: src/storage/ and StorageAdapter.js are now legitimately
  // created by Phase 17B scaffold — the Phase 16L constraint applies to Phase 17A only.
  // Only forbidden IndexedDB/Sync/EventLog files must not exist.
  const forbiddenStoragePaths = [
    'src/storage/IndexedDBAdapter.js',
    'src/storage/SyncAdapter.js',
    'src/storage/EventLog.js',
  ];
  for (const p of forbiddenStoragePaths) {
    if (fs.existsSync(p)) fail(`Phase 16L constraint violated: ${p} must not exist`);
  }

  const doc = read(DOCS_FILE).toLowerCase();
  if (!doc.includes('no storageadapter') && !doc.includes('no src/storage')) {
    fail(`${DOCS_FILE} must confirm no StorageAdapter / no src/storage`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  packageGuard();
  scopeGuard();
  forbiddenRuntimePathsGuard();
  forbiddenFileGuard();
  generatedArtifactGuard();
  workflowGuard();
  docSectionGuard();
  docTermGuard();
  runtimeTermGuard();
  noSchemaBumpGuard();
  requiredTestGuard();
  forbiddenClaimGuard();
  phase16lConstraintGuard();
  console.log('Phase 17A Backup/Rollback Harness BEFORE Migration validation passed.');
}

validate();
