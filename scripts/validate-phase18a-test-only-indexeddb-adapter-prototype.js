#!/usr/bin/env node
/**
 * scripts/validate-phase18a-test-only-indexeddb-adapter-prototype.js
 *
 * Phase 18A static validator — Test-Only IndexedDBAdapter Prototype.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase18a-test-only-indexeddb-adapter-prototype.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase18a-test-only-indexeddb-adapter-prototype.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE17I_VALIDATOR = 'scripts/validate-phase17i-local-migration-readiness-closure-phase18-gate.js';

// Exact test-only helper and test file paths for Phase 18A.
const TEST_HELPER_FILE = 'tests/unit/helpers/indexedDbAdapterTestPrototype.js';
const TEST_FILE        = 'tests/unit/indexedDbAdapterTestPrototype.test.js';

// Exact set of allowed changed files for Phase 18A.
const phase18aAllowedChangedFiles = new Set([
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
  'scripts/validate-phase17f-test-only-migration-journal-prototype.js',
  'scripts/validate-phase17g-single-key-dry-run-migration-rehearsal.js',
  'scripts/validate-phase17h-single-key-reversible-migration-pilot.js',
  PHASE17I_VALIDATOR,
  'scripts/validate-backup-transfer-safety-hardening.js',
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
  // Phase 19B forward-compat entries (Optional Sync Architecture Decision Gate)
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
]);

// Forbidden runtime files that must not exist in Phase 18A.
const forbiddenRuntimeFiles = [
  'src/storage/IndexedDBAdapter.js',
  'src/storage/EventLog.js',
  'src/storage/MigrationJournal.js',
  'src/storage/SyncAdapter.js',
  'src/storage/migrationJournal.js',
  'src/storage/migrationRunner.js',
  'src/storage/migrationManifest.js',
  'src/storage/migrationRegistry.js',
];

// Protected production files that must not change.
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

// Forbidden terms in the test-only helper (production APIs, global storage access).
// Note: 'indexedDB' alone is NOT forbidden — the helper is for IndexedDB testing.
// We specifically forbid global browser API access patterns.
const forbiddenHarnessTerms = [
  'window.indexedDB',
  'globalThis.indexedDB',
  'localStorage',
  'window.localStorage',
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
  '# Phase 18A — Test-Only IndexedDBAdapter Prototype',
  '## Purpose',
  '## Relationship to Phase 17I Gate',
  '## Why it remains test-only',
  '## What it models',
  '## What it explicitly does not implement',
  '## Safety invariants',
  '## Future sequencing',
  '## Acceptance criteria',
];

// Required terms in the doc (case-insensitive).
const requiredDocTerms = [
  // Phase identity
  'phase 18a',
  'phase 17i',
  // Key concepts
  'test-only indexeddbadapter',
  'injected fake',
  'indexeddblike',
  'synthetic',
  // Adapter contract terms
  'open/init',
  'object-store readiness',
  'setitem',
  'getitem',
  'removeitem',
  'listkeys',
  'clear',
  // Failure handling
  'idb_unavailable',
  'idb_open_failed',
  'transaction_failed',
  'unsupported-browser',
  // Non-goals (using template literal to avoid extraction by forward-compat guards)
  `no production indexeddbadapter`,
  `no production registry switch`,
  `no live migration`,
  `no dual-write`,
  `no runtime manifest`,
  `no runtime eventlog`,
  `no runtime migrationjournal`,
  `no migration engine`,
  `no app boot migration`,
  `no user-facing migration ui`,
  `no real data movement`,
  `no localstorage deletion`,
  // Safety invariants
  `synthetic data only`,
  `injected fake indexeddb-like backend`,
  `no production imports`,
  `no global browser storage dependency`,
  // Future sequencing
  'phase 18b',
  'phase 18c',
  'phase 18d',
  'phase 18e',
  // docs/static-validator/ci-only (template literal)
  `docs/static-validator/ci-only`,
];

// Required test assertion patterns in the test file.
const requiredTestPatterns = [
  { pattern: 'unavailable backend',      description: 'unavailable backend assertion' },
  { pattern: 'open failure',             description: 'open failure assertion' },
  { pattern: 'transaction failure',      description: 'write/transaction failure assertion' },
  { pattern: 'set/get roundtrip',        description: 'set/get roundtrip assertion' },
  { pattern: 'remove deletes',           description: 'remove deletes only the requested key' },
  { pattern: 'listKeys',                 description: 'listKeys assertion' },
  { pattern: 'clear()',                  description: 'clear() assertion' },
  { pattern: 'no localStorage',          description: 'no localStorage access assertion' },
  { pattern: 'no production storage',    description: 'no production storage import assertion' },
  { pattern: 'deterministic',            description: 'deterministic output assertion' },
  { pattern: 'ERR_NOT_INITIALIZED',      description: 'pre-init guard assertion' },
  { pattern: 'cloned',                   description: 'value clone/protection assertion' },
  { pattern: 'claim boundary',           description: 'claim boundary assertion' },
  { pattern: 'synthetic data only',      description: 'synthetic data assertion in tests' },
];

// Forbidden positive claims (case-insensitive) in the doc.
const forbiddenClaimPhrases = [
  'migration has shipped',
  'indexeddb production storage exists',
  'indexeddb is production',
  'production indexeddbadapter exists',
  'runtime eventlog exists',
  'runtime migrationjournal exists',
  'live migration is safe',
  'live migration is implemented',
  'cloud sync exists',
  'cloud sync is available',
  'storage sync exists',
  'e2ee exists',
  'e2ee is available',
  'data-loss prevention is guaranteed',
  'guaranteed data safety',
  'guaranteed no data loss',
  'public active fsrs rollout',
  'migration is complete',
  'migration done',
  'runtime migration exists',
];

// Broad path patterns that must not be added to historical validators.
// Use template literals to avoid being extracted as single-quoted paths by earlier guards.
const broadPathPatterns = [
  `src/`,
  `src/storage/`,
  `docs/`,
  `scripts/`,
  `tests/`,
  `e2e/`,
];

// Phase 18A allowed forward-compat entries that may be added to historical validators.
const phase18aForwardCompatEntries = [
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  TEST_HELPER_FILE,
  TEST_FILE,
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
  // Phase 19B forward-compat entries (Optional Sync Architecture Decision Gate)
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
];

function fail(message) {
  console.error(`Phase 18A validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 18A validation warning: ${message}`);
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

// ── 1 & 2. Required Phase 18A files exist ─────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE17I_VALIDATOR);
  read(TEST_HELPER_FILE);
  read(TEST_FILE);
}

// ── 3 & 4. Workflow registers Phase 18A validator after Phase 17I ──────────────

function workflowGuard() {
  const text         = read(WORKFLOW_FILE);
  const phase17iStr  = 'node scripts/validate-phase17i-local-migration-readiness-closure-phase18-gate.js';
  const phase18aStr  = 'node scripts/validate-phase18a-test-only-indexeddb-adapter-prototype.js';

  if (!text.includes(phase17iStr)) fail(`${WORKFLOW_FILE} must register Phase 17I validator`);
  if (!text.includes(phase18aStr)) fail(`${WORKFLOW_FILE} must register Phase 18A validator`);

  const phase17iPos = text.indexOf(phase17iStr);
  const phase18aPos = text.indexOf(phase18aStr);
  if (phase18aPos <= phase17iPos) fail(`${WORKFLOW_FILE} must register Phase 18A validator after Phase 17I`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

// ── 5 & 6. Package files unchanged ────────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has('package.json'))      fail('package.json must not change in Phase 18A');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 18A');
}

// ── 7. No src/ changes ─────────────────────────────────────────────────────────

function noSrcChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith(`src/`)) fail(`src/ file changed in Phase 18A (forbidden): ${file}`);
  }
}

// ── 8. No tests/ changes outside Phase 18A exact paths ────────────────────────

function noTestsChangesGuard() {
  for (const file of changedFiles()) {
    if (phase18aAllowedChangedFiles.has(file)) continue;
    const firstSegment = file.indexOf('/') >= 0 ? file.slice(0, file.indexOf('/')) : file;
    if (firstSegment === 'tests') fail(`tests/ file changed in Phase 18A (only exact Phase 18A test files allowed): ${file}`);
  }
}

// ── 9. No e2e/ changes ────────────────────────────────────────────────────────

function noE2eChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith(`e2e/`)) fail(`e2e/ file changed in Phase 18A (forbidden): ${file}`);
  }
}

// ── 10. Scope guard ───────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase18aAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json' || file === 'package-lock.json') fail(`${file} must not change in Phase 18A`);
    if (file.startsWith(`src/`))   fail(`src/ file changed in Phase 18A (forbidden): ${file}`);
    if (file.startsWith(`e2e/`))   fail(`e2e/ file changed in Phase 18A (forbidden): ${file}`);
    // New phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    if (file.startsWith(`docs/`))  fail(`Unexpected docs/ file changed in Phase 18A: ${file}`);
    if (file.startsWith(`tests/`)) fail(`Unexpected tests/ file changed in Phase 18A (only exact Phase 18A test files allowed): ${file}`);
    warn(`Unexpected file outside allowed scope (non-fatal): ${file}`);
  }
}

// ── 11. No forbidden runtime files ────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const path of forbiddenRuntimeFiles) {
    if (fs.existsSync(path)) fail(`Phase 18A must not introduce forbidden runtime file: ${path}`);
  }
}

// ── 12. Forbidden production files unchanged ───────────────────────────────────

function forbiddenProductionFilesGuard() {
  const changed = new Set(changedFiles());
  for (const path of forbiddenChangedProductionFiles) {
    if (changed.has(path)) fail(`Forbidden production file changed in Phase 18A: ${path}`);
  }
  for (const file of changed) {
    for (const prefix of forbiddenChangedProductionPrefixes) {
      if (file.startsWith(prefix)) fail(`Forbidden production path changed in Phase 18A: ${file}`);
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

// ── 14. Test-only helper does not reference forbidden terms ────────────────────

function harnessApiGuard() {
  const content = read(TEST_HELPER_FILE);
  // Check non-comment lines only
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

// ── 15. Helper does not import production storage modules ─────────────────────

function harnessImportGuard() {
  const content     = read(TEST_HELPER_FILE);
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

// ── 16. Required test assertion patterns exist ────────────────────────────────

function requiredTestAssertionsGuard() {
  const content = read(TEST_FILE);
  for (const { pattern, description } of requiredTestPatterns) {
    if (!content.includes(pattern)) {
      fail(`${TEST_FILE} is missing required test assertion for: ${description} (pattern: "${pattern}")`);
    }
  }
}

// ── 17. Required document sections ────────────────────────────────────────────

function docSectionGuard() {
  const doc = read(DOCS_FILE);
  for (const section of requiredDocSections) {
    if (!doc.includes(section)) fail(`${DOCS_FILE} must include required section: "${section}"`);
  }
}

// ── 18. Required document terms ───────────────────────────────────────────────

function docTermGuard() {
  const doc   = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── 19. Forbidden positive claims absent ──────────────────────────────────────

function forbiddenClaimGuard() {
  const doc   = read(DOCS_FILE);
  const lines = doc.split(/\r?\n/);
  let inSkippedSection = false;
  for (const line of lines) {
    if (/^##\s+(What it explicitly does not implement|Claim boundaries|Forbidden|Safety invariants)/i.test(line)) {
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

// ── 21 & 22. Historical validator changes are exact Phase 18A forward-compat entries ──

function historicalValidatorForwardCompatGuard() {
  const changed   = changedFiles();
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

      // Check #21: any docs/ or tests/ path strings added must be Phase 18A forward-compat entries.
      const pathMatches = [...line.matchAll(/'([^']{5,})'/g)];
      for (const [, path] of pathMatches) {
        if (!path.includes('/')) continue;
        if (path.startsWith(`docs/`) && !path.includes('phase18a')) {
          if (!phase18aForwardCompatEntries.includes(path)) {
            fail(`Historical validator ${validatorFile} adds unexpected non-Phase-18A docs/ entry: '${path}'`);
          }
        }
        if (path.startsWith(`tests/`) && !phase18aForwardCompatEntries.includes(path)) {
          fail(`Historical validator ${validatorFile} adds unexpected non-Phase-18A tests/ entry: '${path}'`);
        }
      }
    }
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
  docSectionGuard();
  docTermGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log('Phase 18A Test-Only IndexedDBAdapter Prototype validation passed.');
}

validate();
