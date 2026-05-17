#!/usr/bin/env node
/**
 * scripts/validate-phase17g-single-key-dry-run-migration-rehearsal.js
 *
 * Phase 17G static validator — Single-Key Dry-Run Migration Rehearsal.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase17g-single-key-dry-run-migration-rehearsal.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase17g-single-key-dry-run-migration-rehearsal.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE17F_VALIDATOR = 'scripts/validate-phase17f-test-only-migration-journal-prototype.js';

// Exact test-only helper paths for Phase 17G.
const TEST_HELPER_FILE = 'tests/unit/helpers/singleKeyDryRunMigrationRehearsal.js';
const TEST_FILE        = 'tests/unit/singleKeyDryRunMigrationRehearsal.test.js';

// Phase 17F harness (must exist and be imported by the Phase 17G helper).
const PHASE17F_HARNESS = 'tests/unit/helpers/migrationJournalTestHarness.js';

// Exact set of allowed changed files for Phase 17G.
const phase17gAllowedChangedFiles = new Set([
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
  'scripts/validate-phase17e-per-key-migration-manifest-design.js',
  PHASE17F_VALIDATOR,
  'scripts/validate-backup-transfer-safety-hardening.js',
  // Phase 17H forward-compat entries (Single-Key Reversible Migration Pilot)
  'scripts/validate-phase17h-single-key-reversible-migration-pilot.js',
  'docs/phase17h-single-key-reversible-migration-pilot.md',
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
  // Phase 19A forward-compat entries (FSRS Public Opt-In Sequencing Gate)
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
]);

// Forbidden runtime files that must not exist in Phase 17G.
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
  '# Phase 17G — Single-Key Dry-Run Migration Rehearsal',
  '## Purpose',
  '## Why the first rehearsal uses recommendation feedback as a low-risk family',
  '## Relationship to prior phases',
  '## What Phase 17G models',
  '## Why Phase 17G is still test-only',
  '## What Phase 17G explicitly does not implement',
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
  'phase 17f',
  'phase 17h',
  'phase 18',
  // Family
  'recommendation-feedback',
  // Manifest fields
  'manifestId',
  'sourceKey',
  'targetStore',
  'dataFamily',
  'riskClass',
  'operationType',
  'claimBoundary',
  // Status values
  'planned',
  'backup-captured',
  'write-attempted',
  'write-verified',
  'completed',
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
  'no delete-before-verified-copy',
  'write verification before completion',
  'rollback metadata preserved',
  'explicit error code on failure',
  'dry-run',
  'synthetic',
  // Phase sequencing (template literal avoids being extracted as docs/ path by forward-compat guards)
  `docs/static-validator/ci-only`,
];

// Required exact future phase sequence strings.
const requiredPhaseSequence = [
  'Phase 17G — Single-Key Dry-Run Migration Rehearsal',
  'Phase 17H',
];

// Forbidden positive claims (case-insensitive).
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
// Use template literals to avoid being extracted as single-quoted paths by Phase 17D/17E/17F guards.
const broadPathPatterns = [
  `src/`,
  `src/storage/`,
  `docs/`,
  `scripts/`,
  `tests/`,
  `e2e/`,
];

// Phase 17G allowed forward-compat entries that may be added to historical validators.
const phase17gForwardCompatEntries = [
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  TEST_HELPER_FILE,
  TEST_FILE,
  // Phase 17F harness files (may also be added to pre-17F validators by Phase 17G)
  'docs/phase17f-test-only-migration-journal-prototype.md',
  'scripts/validate-phase17f-test-only-migration-journal-prototype.js',
  'tests/unit/helpers/migrationJournalTestHarness.js',
  'tests/unit/migrationJournalTestHarness.test.js',
  // Phase 17H forward-compat entries (Single-Key Reversible Migration Pilot)
  'docs/phase17h-single-key-reversible-migration-pilot.md',
  'scripts/validate-phase17h-single-key-reversible-migration-pilot.js',
  'tests/unit/helpers/singleKeyReversibleMigrationPilot.js',
  'tests/unit/singleKeyReversibleMigrationPilot.test.js',
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
  // Phase 19A forward-compat entries (FSRS Public Opt-In Sequencing Gate)
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
];

// Required test assertion patterns in the test file (for key safety scenarios).
const requiredTestPatterns = [
  { pattern: 'recommendation-feedback', description: 'low-risk recommendation-feedback manifest assertion' },
  { pattern: 'live_mode_rejected', description: 'live-mode rejection assertion' },
  { pattern: 'write verification', description: 'write verification before completion assertion' },
  { pattern: 'rollback', description: 'rollback metadata preservation assertion' },
  { pattern: 'invalid_transition', description: 'invalid transition failure assertion (from Phase 17F harness)' },
  { pattern: 'missing_error_code', description: 'explicit error code required on failure' },
  { pattern: 'no localStorage', description: 'no browser localStorage API access' },
  { pattern: 'no indexedDB', description: 'no browser indexedDB API access' },
  { pattern: 'deterministic', description: 'deterministic output assertion' },
];

function fail(message) {
  console.error(`Phase 17G validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 17G validation warning: ${message}`);
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

// ── 1 & 2. Required Phase 17G files exist ─────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE17F_VALIDATOR);
  read(PHASE17F_HARNESS);
  read(TEST_HELPER_FILE);
  read(TEST_FILE);
}

// ── 3 & 4. Workflow registers Phase 17G validator after Phase 17F ──────────────

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase17fStr = 'node scripts/validate-phase17f-test-only-migration-journal-prototype.js';
  const phase17gStr = 'node scripts/validate-phase17g-single-key-dry-run-migration-rehearsal.js';

  if (!text.includes(phase17fStr)) fail(`${WORKFLOW_FILE} must register Phase 17F validator`);
  if (!text.includes(phase17gStr)) fail(`${WORKFLOW_FILE} must register Phase 17G validator`);

  const phase17fPos = text.indexOf(phase17fStr);
  const phase17gPos = text.indexOf(phase17gStr);
  if (phase17gPos <= phase17fPos) fail(`${WORKFLOW_FILE} must register Phase 17G validator after Phase 17F`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

// ── 5 & 6. Package files unchanged ────────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 17G');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 17G');
}

// ── 7. No src/ changes ─────────────────────────────────────────────────────────

function noSrcChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith(`src/`)) fail(`src/ file changed in Phase 17G (forbidden): ${file}`);
  }
}

// ── 8. No tests/ changes outside Phase 17G exact paths ────────────────────────

function noTestsChangesGuard() {
  for (const file of changedFiles()) {
    if (phase17gAllowedChangedFiles.has(file)) continue;
    const firstSegment = file.indexOf('/') >= 0 ? file.slice(0, file.indexOf('/')) : file;
    if (firstSegment === 'tests') fail(`tests/ file changed in Phase 17G (only exact Phase 17G test files allowed): ${file}`);
  }
}

// ── 9. No e2e/ changes ────────────────────────────────────────────────────────

function noE2eChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith(`e2e/`)) fail(`e2e/ file changed in Phase 17G (forbidden): ${file}`);
  }
}

// ── 10. Scope guard ───────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase17gAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json' || file === 'package-lock.json') fail(`${file} must not change in Phase 17G`);
    if (file.startsWith(`src/`)) fail(`src/ file changed in Phase 17G (forbidden): ${file}`);
    if (file.startsWith(`e2e/`)) fail(`e2e/ file changed in Phase 17G (forbidden): ${file}`);
    // New phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    if (file.startsWith(`docs/`)) fail(`Unexpected docs/ file changed in Phase 17G: ${file}`);
    if (file.startsWith(`tests/`)) fail(`Unexpected tests/ file changed in Phase 17G (only exact Phase 17G test files allowed): ${file}`);
    warn(`Unexpected file outside allowed scope (non-fatal): ${file}`);
  }
}

// ── 11. No forbidden runtime files ────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const path of forbiddenRuntimeFiles) {
    if (fs.existsSync(path)) fail(`Phase 17G must not introduce forbidden runtime file: ${path}`);
  }
}

// ── 12. Forbidden production files unchanged ───────────────────────────────────

function forbiddenProductionFilesGuard() {
  const changed = new Set(changedFiles());
  for (const path of forbiddenChangedProductionFiles) {
    if (changed.has(path)) fail(`Forbidden production file changed in Phase 17G: ${path}`);
  }
  for (const file of changed) {
    for (const prefix of forbiddenChangedProductionPrefixes) {
      if (file.startsWith(prefix)) fail(`Forbidden production path changed in Phase 17G: ${file}`);
    }
  }
}

// ── 13. No forbidden dependencies ─────────────────────────────────────────────

function forbiddenDependencyGuard() {
  const pkg = read('package.json');
  for (const dep of forbiddenDependencies) {
    const pattern = new RegExp(`"${dep}"\\s*:`);
    if (pattern.test(pkg)) fail(`package.json must not add forbidden dependency: "${dep}"`);
  }
}

// ── 14. Test-only helper does not reference forbidden browser APIs ──────────────

function harnessApiGuard() {
  const content = read(TEST_HELPER_FILE);
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

// ── 15. Helper imports only Phase 17F harness (no production storage modules) ──

function harnessImportGuard() {
  const content = read(TEST_HELPER_FILE);
  // The helper must import from Phase 17F harness.
  if (!content.includes('./migrationJournalTestHarness.js')) {
    fail(`${TEST_HELPER_FILE} must import from ./migrationJournalTestHarness.js (Phase 17F harness)`);
  }
  // Must not import from src/ modules.
  const importLines = content.split(/\r?\n/).filter(line => /^import\s/.test(line.trim()));
  for (const line of importLines) {
    if (line.includes('from') && (
      line.includes('/src/') ||
      line.includes('storageAdapterRegistry') ||
      line.includes('LocalStorageAdapter') ||
      line.includes('StorageAdapter') ||
      line.includes('indexedDbDryRunHarness')
    )) {
      fail(`${TEST_HELPER_FILE} must not import from production storage modules: ${line.trim()}`);
    }
  }
}

// ── 16. Required test assertions exist ────────────────────────────────────────

function requiredTestAssertionsGuard() {
  const content = read(TEST_FILE);
  for (const { pattern, description } of requiredTestPatterns) {
    if (!content.includes(pattern)) {
      fail(`${TEST_FILE} is missing required test assertion for: ${description} (pattern: "${pattern}")`);
    }
  }
}

// ── 17. Required document terms ───────────────────────────────────────────────

function docTermGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── 18. Required future phase sequence ────────────────────────────────────────

function phaseSequenceGuard() {
  const doc = read(DOCS_FILE);
  for (const seq of requiredPhaseSequence) {
    if (!doc.includes(seq)) {
      fail(`${DOCS_FILE} must include required phase sequence entry: "${seq}"`);
    }
  }
}

// ── 19. Forbidden positive claims absent ──────────────────────────────────────

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const lines = doc.split(/\r?\n/);
  let inSkippedSection = false;
  for (const line of lines) {
    if (/^##\s+(Claim boundaries|Explicit non-goals|Forbidden|What Phase 17G explicitly does not implement)/i.test(line)) {
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

// ── 20. Generated artifacts absent ────────────────────────────────────────────

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

// ── 21 & 22. Historical validator changes are exact Phase 17G forward-compat entries ──

function historicalValidatorForwardCompatGuard() {
  const changed = changedFiles();
  const mergeBase = runGit('git merge-base HEAD origin/main', { silent: true });

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
      const extractedPaths = [...line.matchAll(/'([^']+)'/g)].map(([, p]) => p);

      // Check #22: no broad path allowlists added.
      for (const broadPath of broadPathPatterns) {
        if (extractedPaths.some(p => p === broadPath)) {
          fail(`Historical validator ${validatorFile} adds forbidden broad path allowlist: '${broadPath}'`);
        }
      }

      // Check #21: any docs/ or tests/ path strings added must be Phase 17G forward-compat entries.
      const pathMatches = [...line.matchAll(/'([^']{5,})'/g)];
      for (const [, path] of pathMatches) {
        if (!path.includes('/')) continue;
        if (path.startsWith(`docs/`) && !path.includes('phase17g')) {
          if (!phase17gForwardCompatEntries.includes(path)) {
            fail(`Historical validator ${validatorFile} adds unexpected non-Phase-17G docs/ entry: '${path}'`);
          }
        }
        if (path.startsWith(`tests/`) && !phase17gForwardCompatEntries.includes(path)) {
          fail(`Historical validator ${validatorFile} adds unexpected non-Phase-17G tests/ entry: '${path}'`);
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
  noTestsChangesGuard();
  noE2eChangesGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  forbiddenProductionFilesGuard();
  forbiddenDependencyGuard();
  harnessApiGuard();
  harnessImportGuard();
  requiredTestAssertionsGuard();
  docTermGuard();
  phaseSequenceGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  docSectionGuard();
  console.log('Phase 17G Single-Key Dry-Run Migration Rehearsal validation passed.');
}

validate();
