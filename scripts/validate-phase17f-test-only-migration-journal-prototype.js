#!/usr/bin/env node
/**
 * scripts/validate-phase17f-test-only-migration-journal-prototype.js
 *
 * Phase 17F static validator — Test-Only Migration Journal Prototype.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase17f-test-only-migration-journal-prototype.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase17f-test-only-migration-journal-prototype.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE17E_VALIDATOR = 'scripts/validate-phase17e-per-key-migration-manifest-design.js';

// Exact test-only helper path chosen for Phase 17F.
const TEST_HELPER_FILE = 'tests/unit/helpers/migrationJournalTestHarness.js';
const TEST_FILE        = 'tests/unit/migrationJournalTestHarness.test.js';

// Exact set of allowed changed files for Phase 17F.
const phase17fAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  TEST_HELPER_FILE,
  TEST_FILE,
  // Historical validator forward-compat edits
  'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js',
  'scripts/validate-phase17a-backup-rollback-harness-before-migration.js',
  'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js',
  'scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js',
  'scripts/validate-phase17d-migration-journal-event-log-architecture.js',
  PHASE17E_VALIDATOR,
  'scripts/validate-backup-transfer-safety-hardening.js',
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
]);

// Forbidden runtime files that must not exist in Phase 17F.
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

// Forbidden production files that must not change.
const forbiddenChangedProductionFiles = [
  'src/storage/storageAdapterRegistry.js',
  'src/storage/StorageAdapter.js',
  'src/storage/LocalStorageAdapter.js',
  'src/storage/indexedDbDryRunHarness.js',
];

const forbiddenChangedProductionPrefixes = [
  'src/state/',
  'src/quiz/',
  'src/edugen/',
  'src/data/',
  'src/routes/',
  'src/components/',
];

// Forbidden npm dependencies.
const forbiddenDependencies = ['idb', 'dexie', 'localforage', 'pouchdb', 'rxdb', 'firebase', 'supabase'];

const generatedArtifacts = [
  'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD', '.env', '.env.local', '.git'
];

// Forbidden browser API / storage references in the test-only helper.
const forbiddenHarnessTerms = [
  'localStorage',
  'indexedDB',
  'window.',
  'document.',
  'getStorageAdapter',
  'setStorageAdapterForTests',
  'storageAdapterRegistry',
  'LocalStorageAdapter',
  'StorageAdapter',
  'indexedDbDryRunHarness',
];

// Required document sections (exact heading strings).
const requiredDocSections = [
  '# Phase 17F — Test-Only Migration Journal Prototype',
  '## Purpose',
  '## Relationship to prior phases',
  '## Why Phase 17F is test-only',
  '## What the prototype models',
  '## What Phase 17F explicitly does not implement',
  '## Safety invariants',
  '## Future sequencing',
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
  'phase 17e',
  'phase 17g',
  'phase 17h',
  'phase 18',
  // Journal entry fields
  'journalId',
  'operationId',
  'manifestId',
  'sourceKey',
  'targetStore',
  'dataFamily',
  'operationType',
  'mode',
  'sourceChecksum',
  'targetChecksum',
  'readBeforeWriteChecksum',
  'writeVerification',
  'rollbackSnapshotRef',
  'errorCode',
  'claimBoundary',
  // Status values
  'planned',
  'backup-captured',
  'write-attempted',
  'write-verified',
  'rollback-ready',
  'completed',
  'failed',
  'rolled-back',
  // Non-goals
  'no runtime eventlog',
  'no runtime migrationjournal',
  'no migration engine',
  'no indexeddbadapter',
  'no syncadapter',
  'no live migration',
  'no dual-write',
  'no production adapter switch',
  'no app boot migration',
  'no user-facing migration ui',
  'no real data movement',
  'no localStorage deletion',
  // Safety invariants
  'backup-before-migration',
  'no delete-before-verified-copy',
  'write verification before completion',
  'rollback metadata before rollback',
  'explicit failure code',
  'dry-run',
  'synthetic',
  // Phase sequencing
  'docs/static-validator/ci-only',
];

// Required exact future phase sequence strings.
const requiredPhaseSequence = [
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
  'live migration is implemented',
  'runtime migration exists',
];

// Broad path patterns that must not be added to historical validators.
// Note: the check uses exact-path matching (not substring) to avoid false positives.
const broadPathPatterns = [
  'src/',
  'src/storage/',
  'docs/',
  'scripts/',
  'tests/',
  'e2e/',
];

// Phase 17F allowed forward-compat entries that may be added to historical validators.
const phase17fForwardCompatEntries = [
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  TEST_HELPER_FILE,
  TEST_FILE,
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
];

// Required test assertion patterns in the test file (for key safety scenarios).
const requiredTestPatterns = [
  { pattern: 'live_mode_rejected', description: 'live-mode rejection assertion' },
  { pattern: 'invalid_transition', description: 'invalid transition rejection assertion' },
  { pattern: 'write_verification_required', description: 'write verification before completion assertion' },
  { pattern: 'missing_rollback_snapshot', description: 'rollback metadata before rollback assertion' },
  { pattern: 'no localStorage', description: 'synthetic-only behavior (no localStorage)' },
  { pattern: 'no indexedDB', description: 'synthetic-only behavior (no indexedDB)' },
  { pattern: 'missing_error_code', description: 'explicit error code required on failure' },
];

function fail(message) {
  console.error(`Phase 17F validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 17F validation warning: ${message}`);
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

// ── 1 & 2. Required Phase 17F files exist ────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE17E_VALIDATOR);
  read(TEST_HELPER_FILE);
  read(TEST_FILE);
}

// ── 3 & 4. Workflow registers Phase 17F validator after Phase 17E ─────────────

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase17eStr = 'node scripts/validate-phase17e-per-key-migration-manifest-design.js';
  const phase17fStr = 'node scripts/validate-phase17f-test-only-migration-journal-prototype.js';

  if (!text.includes(phase17eStr)) fail(`${WORKFLOW_FILE} must register Phase 17E validator`);
  if (!text.includes(phase17fStr)) fail(`${WORKFLOW_FILE} must register Phase 17F validator`);

  const phase17ePos = text.indexOf(phase17eStr);
  const phase17fPos = text.indexOf(phase17fStr);
  if (phase17fPos <= phase17ePos) fail(`${WORKFLOW_FILE} must register Phase 17F validator after Phase 17E`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

// ── 5 & 6. Package files unchanged ───────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 17F');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 17F');
}

// ── 7. No src/ changes ───────────────────────────────────────────────────────

function noSrcChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 17F (forbidden): ${file}`);
  }
}

// ── 8. No e2e/ changes ───────────────────────────────────────────────────────

function noE2eChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17F (forbidden): ${file}`);
  }
}

// ── 9. Scope guard ────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase17fAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json' || file === 'package-lock.json') fail(`${file} must not change in Phase 17F`);
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 17F (forbidden): ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17F (forbidden): ${file}`);
    // New phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    if (file.startsWith('docs/')) fail(`Unexpected docs/ file changed in Phase 17F: ${file}`);
    if (file.startsWith('tests/')) fail(`Unexpected tests/ file changed in Phase 17F (only exact Phase 17F test files allowed): ${file}`);
    warn(`Unexpected file outside allowed scope (non-fatal): ${file}`);
  }
}

// ── 10. No forbidden runtime files ───────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const path of forbiddenRuntimeFiles) {
    if (fs.existsSync(path)) fail(`Phase 17F must not introduce forbidden runtime file: ${path}`);
  }
}

// ── 11. Forbidden production files unchanged ──────────────────────────────────

function forbiddenProductionFilesGuard() {
  const changed = new Set(changedFiles());
  for (const path of forbiddenChangedProductionFiles) {
    if (changed.has(path)) fail(`Forbidden production file changed in Phase 17F: ${path}`);
  }
  for (const file of changed) {
    for (const prefix of forbiddenChangedProductionPrefixes) {
      if (file.startsWith(prefix)) fail(`Forbidden production path changed in Phase 17F: ${file}`);
    }
  }
}

// ── 12. No forbidden dependencies ────────────────────────────────────────────

function forbiddenDependencyGuard() {
  const pkg = read('package.json');
  for (const dep of forbiddenDependencies) {
    const pattern = new RegExp(`"${dep}"\\s*:`);
    if (pattern.test(pkg)) fail(`package.json must not add forbidden dependency: "${dep}"`);
  }
}

// ── 13. Test-only helper does not reference forbidden browser APIs ────────────

function harnessApiGuard() {
  const content = read(TEST_HELPER_FILE);
  // Strip comment lines before checking.
  const nonCommentLines = content
    .split(/\r?\n/)
    .filter(line => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join('\n');
  for (const term of forbiddenHarnessTerms) {
    if (nonCommentLines.includes(term)) {
      fail(`Test-only helper ${TEST_HELPER_FILE} must not reference "${term}"`);
    }
  }
}

// ── 14. Required test assertions exist ───────────────────────────────────────

function requiredTestAssertionsGuard() {
  const content = read(TEST_FILE);
  for (const { pattern, description } of requiredTestPatterns) {
    if (!content.includes(pattern)) {
      fail(`${TEST_FILE} is missing required test assertion for: ${description} (pattern: "${pattern}")`);
    }
  }
}

// ── 15. Required document terms ──────────────────────────────────────────────

function docTermGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── 16. Required future phase sequence ───────────────────────────────────────

function phaseSequenceGuard() {
  const doc = read(DOCS_FILE);
  for (const seq of requiredPhaseSequence) {
    if (!doc.includes(seq)) {
      fail(`${DOCS_FILE} must include required phase sequence entry: "${seq}"`);
    }
  }
}

// ── 17. Forbidden positive claims absent ─────────────────────────────────────

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const lines = doc.split(/\r?\n/);
  let inSkippedSection = false;
  for (const line of lines) {
    if (/^##\s+(Claim boundaries|Explicit non-goals|Forbidden|What Phase 17F explicitly does not implement)/i.test(line)) {
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

// ── 18. Generated artifacts absent ────────────────────────────────────────────

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

// ── 19 & 20. Historical validator changes are exact Phase 17F forward-compat entries ──

function historicalValidatorForwardCompatGuard() {
  const changed = changedFiles();
  const mergeBase = runGit('git merge-base HEAD origin/main', { silent: true });

  // Check ALL changed scripts/validate-*.js files (except the new Phase 17F validator itself).
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

      // Check #20: no broad path allowlists added.
      // Use exact-path matching: a broad path is the full path string (e.g. 'tests/'), not a prefix.
      for (const broadPath of broadPathPatterns) {
        if (extractedPaths.some(p => p === broadPath)) {
          fail(`Historical validator ${validatorFile} adds forbidden broad path allowlist: '${broadPath}'`);
        }
      }

      // Check #19: any docs/ or tests/ path strings added must be Phase 17F forward-compat entries.
      for (const path of extractedPaths) {
        if (!path.includes('/')) continue;
        if (path.startsWith('docs/') && !path.includes('phase17f')) {
          if (!phase17fForwardCompatEntries.includes(path)) {
            fail(`Historical validator ${validatorFile} adds unexpected non-Phase-17F docs/ entry: '${path}'`);
          }
        }
        if (path.startsWith('tests/') && !phase17fForwardCompatEntries.includes(path)) {
          fail(`Historical validator ${validatorFile} adds unexpected non-Phase-17F tests/ entry: '${path}'`);
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
  noE2eChangesGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  forbiddenProductionFilesGuard();
  forbiddenDependencyGuard();
  harnessApiGuard();
  requiredTestAssertionsGuard();
  docTermGuard();
  phaseSequenceGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  docSectionGuard();
  console.log('Phase 17F Test-Only Migration Journal Prototype validation passed.');
}

validate();
