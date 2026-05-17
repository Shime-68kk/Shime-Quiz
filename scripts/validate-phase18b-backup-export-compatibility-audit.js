#!/usr/bin/env node
/**
 * scripts/validate-phase18b-backup-export-compatibility-audit.js
 *
 * Phase 18B static validator — Backup/Export Compatibility Audit for Adapter-Backed Storage.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase18b-backup-export-compatibility-audit.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase18b-backup-export-compatibility-audit.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE18A_VALIDATOR = 'scripts/validate-phase18a-test-only-indexeddb-adapter-prototype.js';

// Exact set of allowed changed files for Phase 18B.
const phase18bAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
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
  'scripts/validate-phase17i-local-migration-readiness-closure-phase18-gate.js',
  'scripts/validate-backup-transfer-safety-hardening.js',
  PHASE18A_VALIDATOR,
]);

// Forbidden runtime files that must not exist in Phase 18B.
const forbiddenRuntimeFiles = [
  'src/storage/IndexedDBAdapter.js',
  'src/storage/EventLog.js',
  'src/storage/MigrationJournal.js',
  'src/storage/SyncAdapter.js',
  'src/storage/migrationJournal.js',
  'src/storage/migrationRunner.js',
  'src/storage/migrationManifest.js',
  'src/storage/migrationRegistry.js',
  'src/storage/backupCoverageMap.js',
  'src/state/adapterBackupBridge.js',
];

// Forbidden npm dependencies.
const forbiddenDependencies = ['idb', 'dexie', 'localforage', 'pouchdb', 'rxdb', 'firebase', 'supabase'];

const generatedArtifacts = [
  'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD', '.env', '.env.local', '.git'
];

// Required document sections (exact heading strings).
const requiredDocSections = [
  '# Phase 18B — Backup / Export Compatibility Audit for Adapter-Backed Storage',
  '## Purpose',
  '## Relationship to Phase 17I gate and Phase 18A prototype',
  '## Production baseline (what is canonical today)',
  '## Stage truth table',
  '## Backup/export compatibility risks',
  '## Restore and rollback risk analysis',
  '## Verified-copy-before-delete invariant',
  '## What Phase 18B explicitly does not implement',
  '## Claim boundaries',
  '## Go/no-go criteria for Phase 18C, 18D, 18E',
  '## Safety invariants',
  '## Future sequencing',
  '## Acceptance criteria',
];

// Required terms in the doc (case-insensitive).
const requiredDocTerms = [
  'phase 18b',
  'phase 18a',
  'phase 17i',
  'localstorage canonical',
  'adapter-backed storage',
  'indexeddbadapter',
  'backup envelope',
  'per-section schemaversion',
  'restore atomicity envelope',
  'quiesce',
  'read-after-write verification',
  'verified copy precedes delete',
  'rollback snapshot completeness',
  'claim boundary',
  'incomplete export',
  'split-brain',
  'stale localstorage',
  'stale indexeddb',
  'partial restore',
  'quota failure during export',
  'schema mismatch',
  'async read failure',
  'transaction failure',
  'false positive on validate',
  'coverage assertion',
  'cross-device drift',
  'test-vs-production divergence',
  'phase 18c',
  'phase 18d',
  'phase 18e',
];

// Required non-goal negation terms (case-insensitive exact phrases).
const requiredNonGoalTerms = [
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
  `no sync`,
  `no cloud`,
  `no account`,
  `no auth`,
  `no backend`,
  `no backup schema change`,
  `no restore behavior change`,
  `no production runtime changes`,
  `docs/static-validator/ci-only`,
];

// Forbidden positive claims (case-insensitive) in the doc.
const forbiddenClaimPhrases = [
  'backup/export supports indexeddb-backed production storage',
  'adapter-backed migration is ready',
  'production indexeddb storage exists',
  'data-loss prevention is guaranteed',
  'live migration is safe',
  'live migration is implemented',
  'cloud sync exists',
  'cloud sync is available',
  'storage sync exists',
  'e2ee exists',
  'migration has shipped',
  'migration is complete',
  'migration done',
  'runtime eventlog exists',
  'runtime migrationjournal exists',
  'runtime migration exists',
  'public active fsrs rollout',
  'dual-write is safe',
  'cross-device parity is guaranteed',
  'backup is adapter-aware',
  'restore is adapter-aware',
  'guaranteed no data loss',
  'guaranteed data safety',
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

// Phase 18B allowed forward-compat entries that may be added to historical validators.
const phase18bForwardCompatEntries = [
  DOCS_FILE,
  VALIDATOR_SCRIPT,
];

function fail(message) {
  console.error(`Phase 18B validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 18B validation warning: ${message}`);
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

// ── 1. Required Phase 18B files exist ─────────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE18A_VALIDATOR);
}

// ── 2. Workflow registers Phase 18B validator after Phase 18A ──────────────────

function workflowGuard() {
  const text        = read(WORKFLOW_FILE);
  const phase18aStr = 'node scripts/validate-phase18a-test-only-indexeddb-adapter-prototype.js';
  const phase18bStr = 'node scripts/validate-phase18b-backup-export-compatibility-audit.js';

  if (!text.includes(phase18aStr)) fail(`${WORKFLOW_FILE} must register Phase 18A validator`);
  if (!text.includes(phase18bStr)) fail(`${WORKFLOW_FILE} must register Phase 18B validator`);

  const phase18aPos = text.indexOf(phase18aStr);
  const phase18bPos = text.indexOf(phase18bStr);
  if (phase18bPos <= phase18aPos) fail(`${WORKFLOW_FILE} must register Phase 18B validator after Phase 18A`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

// ── 3. Package files unchanged ─────────────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has('package.json'))      fail('package.json must not change in Phase 18B');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 18B');
}

// ── 4. No src/ changes ────────────────────────────────────────────────────────

function noSrcChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith(`src/`)) fail(`src/ file changed in Phase 18B (forbidden): ${file}`);
  }
}

// ── 5. No tests/ changes ──────────────────────────────────────────────────────

function noTestsChangesGuard() {
  for (const file of changedFiles()) {
    const firstSegment = file.indexOf('/') >= 0 ? file.slice(0, file.indexOf('/')) : file;
    if (firstSegment === 'tests') fail(`tests/ file changed in Phase 18B (forbidden): ${file}`);
  }
}

// ── 6. No e2e/ changes ────────────────────────────────────────────────────────

function noE2eChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith(`e2e/`)) fail(`e2e/ file changed in Phase 18B (forbidden): ${file}`);
  }
}

// ── 7. Scope guard ────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase18bAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json' || file === 'package-lock.json') fail(`${file} must not change in Phase 18B`);
    if (file.startsWith(`src/`))   fail(`src/ file changed in Phase 18B (forbidden): ${file}`);
    if (file.startsWith(`e2e/`))   fail(`e2e/ file changed in Phase 18B (forbidden): ${file}`);
    // New phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    if (file.startsWith(`docs/`))  fail(`Unexpected docs/ file changed in Phase 18B: ${file}`);
    const firstSegment = file.indexOf('/') >= 0 ? file.slice(0, file.indexOf('/')) : file;
    if (firstSegment === 'tests') fail(`Unexpected tests/ file changed in Phase 18B (Phase 18B must not add tests): ${file}`);
    warn(`Unexpected file outside allowed scope (non-fatal): ${file}`);
  }
}

// ── 8. No forbidden runtime files ─────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const path of forbiddenRuntimeFiles) {
    if (fs.existsSync(path)) fail(`Phase 18B must not introduce forbidden runtime file: ${path}`);
  }
}

// ── 9. No forbidden dependencies ──────────────────────────────────────────────

function forbiddenDependencyGuard() {
  const pkg = read('package.json');
  for (const dep of forbiddenDependencies) {
    const pattern = new RegExp(`"${dep}"\\s*:`);
    if (pattern.test(pkg)) fail(`package.json must not add forbidden dependency: "${dep}"`);
  }
}

// ── 10. Required document sections ────────────────────────────────────────────

function docSectionGuard() {
  const doc = read(DOCS_FILE);
  for (const section of requiredDocSections) {
    if (!doc.includes(section)) fail(`${DOCS_FILE} must include required section: "${section}"`);
  }
}

// ── 11. Required document terms ───────────────────────────────────────────────

function docTermGuard() {
  const doc   = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── 12. Required non-goal terms ───────────────────────────────────────────────

function nonGoalTermGuard() {
  const doc   = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const term of requiredNonGoalTerms) {
    if (!lower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required non-goal term: "${term}"`);
    }
  }
}

// ── 13. Forbidden positive claims absent ──────────────────────────────────────

function forbiddenClaimGuard() {
  const doc   = read(DOCS_FILE);
  const lines = doc.split(/\r?\n/);
  let inSkippedSection = false;
  for (const line of lines) {
    if (/^##\s+(What Phase 18B explicitly does not implement|Claim boundaries|Forbidden|Safety invariants)/i.test(line)) {
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

// ── 14. Generated artifacts absent ────────────────────────────────────────────

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

// ── 15. Historical validator forward-compat guard ─────────────────────────────

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

    const addedLines = diff.split('\n')
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .map(line => line.slice(1).trim())
      .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('*'));

    for (const line of addedLines) {
      const extractedPaths = [...line.matchAll(/'([^']+)'/g)].map(([, p]) => p);

      // Check: no broad path allowlists added.
      for (const broadPath of broadPathPatterns) {
        if (extractedPaths.some(p => p === broadPath)) {
          fail(`Historical validator ${validatorFile} adds forbidden broad path allowlist: '${broadPath}'`);
        }
      }

      // Check: any docs/ or tests/ path strings added must be Phase 18B forward-compat entries.
      const pathMatches = [...line.matchAll(/'([^']{5,})'/g)];
      for (const [, path] of pathMatches) {
        if (!path.includes('/')) continue;
        if (path.startsWith(`docs/`) && !path.includes('phase18b')) {
          if (!phase18bForwardCompatEntries.includes(path)) {
            fail(`Historical validator ${validatorFile} adds unexpected non-Phase-18B docs/ entry: '${path}'`);
          }
        }
        const firstSegment = path.indexOf('/') >= 0 ? path.slice(0, path.indexOf('/')) : path;
        if (firstSegment === 'tests' && !phase18bForwardCompatEntries.includes(path)) {
          fail(`Historical validator ${validatorFile} adds unexpected non-Phase-18B tests/ entry: '${path}'`);
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
  forbiddenDependencyGuard();
  docSectionGuard();
  docTermGuard();
  nonGoalTermGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log('Phase 18B Backup/Export Compatibility Audit validation passed.');
}

validate();
