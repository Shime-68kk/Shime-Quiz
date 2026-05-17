#!/usr/bin/env node
/**
 * scripts/validate-phase17d-migration-journal-event-log-architecture.js
 *
 * Phase 17D static validator — Migration Journal / Event Log Architecture Guardrail.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase17d-migration-journal-event-log-architecture.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase17d-migration-journal-event-log-architecture.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE17C_VALIDATOR = 'scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js';

// Exact set of allowed changed files for Phase 17D.
const phase17dAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  // Historical validator forward-compat edits
  'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js',
  'scripts/validate-phase17a-backup-rollback-harness-before-migration.js',
  'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js',
  PHASE17C_VALIDATOR,
  'scripts/validate-backup-transfer-safety-hardening.js',
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
]);

// Forbidden runtime files that must not exist in Phase 17D.
const forbiddenRuntimeFiles = [
  'src/storage/EventLog.js',
  'src/storage/SyncAdapter.js',
  'src/storage/IndexedDBAdapter.js',
  'src/storage/MigrationJournal.js',
  'src/storage/migrationJournal.js',
  'src/storage/migrationRunner.js',
  'src/storage/migrationManifest.js',
];

// Forbidden npm dependencies.
const forbiddenDependencies = ['idb', 'dexie', 'localforage', 'pouchdb', 'rxdb', 'firebase', 'supabase'];

const generatedArtifacts = [
  'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD', '.env', '.env.local', '.git'
];

// Required document sections (exact heading strings).
const requiredDocSections = [
  '# Phase 17D — Migration Journal / Event Log Architecture Guardrail',
  '## Purpose',
  '## Why journal before migration',
  '## Relationship to prior phases',
  '## Future migration journal entry model',
  '## Data-loss risks this addresses',
  '## Risks if implemented too early',
  '## Future phase sequencing',
  '## Required future runtime guardrails',
  '## Explicit non-goals for Phase 17D',
  '## Claim boundaries',
  '## Acceptance criteria',
];

// Required terms in the doc (case-insensitive).
const requiredDocTerms = [
  // Phase relationships
  'phase 17a',
  'phase 17b',
  'phase 17c',
  'phase 17e',
  'phase 17f',
  'phase 17g',
  'phase 17h',
  'phase 18',
  // Journal entry model fields
  'operationId',
  'sourceStorageKey',
  'targetStorageArea',
  'dryRun',
  'backupSnapshotReference',
  'rollbackStatus',
  'writeVerificationStatus',
  'readBeforeWriteStatus',
  // Data-loss risks
  'partial writes',
  'quota pressure',
  'schema mismatch',
  'idempotent',
  // Future guardrails
  'backup-before-migration',
  'read-before-write',
  'read-after-write',
  'no delete-before-verified-copy',
  // Non-goals
  'no live migration',
  'no dual-write',
  'no eventlog',
  'no migrationjournal',
  'no localstorage deletion',
  // Phase sequencing
  'per-key migration manifest',
  'test-only migration journal',
  'dry-run migration rehearsal',
  'reversible migration pilot',
  // Purpose
  'docs/static-validator/ci-only',
];

// Required exact future phase sequence strings.
const requiredPhaseSequence = [
  'Phase 17D — Migration Journal / Event Log Architecture Guardrail',
  'Phase 17E — Per-Key Migration Manifest Design',
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
];

// Broad path patterns that must not be added to historical validators.
const broadPathPatterns = [
  "'src/'",
  "'src/storage/'",
  "'docs/'",
  "'scripts/'",
  "'tests/'",
  "'e2e/'",
];

// Historical validators that are explicitly tracked for forward-compat audit.
// The historicalValidatorForwardCompatGuard() checks all changed scripts/validate-*.js files.
const coreHistoricalValidators = [
  'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js',
  'scripts/validate-phase17a-backup-rollback-harness-before-migration.js',
  'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js',
  'scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js',
  'scripts/validate-backup-transfer-safety-hardening.js',
];

// Phase 17D allowed forward-compat entries that may be added to historical validators.
const phase17dForwardCompatEntries = [
  'docs/phase17d-migration-journal-event-log-architecture.md',
  'scripts/validate-phase17d-migration-journal-event-log-architecture.js',
  // Phase 17E forward-compat entries (Per-Key Migration Manifest Design)
  'docs/phase17e-per-key-migration-manifest-design.md',
  'scripts/validate-phase17e-per-key-migration-manifest-design.js',
  // Phase 17F forward-compat entries (Test-Only Migration Journal Prototype)
  'docs/phase17f-test-only-migration-journal-prototype.md',
  'scripts/validate-phase17f-test-only-migration-journal-prototype.js',
  // Phase 17G forward-compat entries (Single-Key Dry-Run Migration Rehearsal)
  'docs/phase17g-single-key-dry-run-migration-rehearsal.md',
  'scripts/validate-phase17g-single-key-dry-run-migration-rehearsal.js',
  // Phase 17H forward-compat entries (Single-Key Reversible Migration Pilot)
  'docs/phase17h-single-key-reversible-migration-pilot.md',
  'scripts/validate-phase17h-single-key-reversible-migration-pilot.js',
  'tests/unit/helpers/singleKeyReversibleMigrationPilot.js',
  'tests/unit/singleKeyReversibleMigrationPilot.test.js',
];

function fail(message) {
  console.error(`Phase 17D validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 17D validation warning: ${message}`);
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

// ── 1 & 2. Required Phase 17D files exist ────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE17C_VALIDATOR);
}

// ── 3 & 4. Workflow registers Phase 17D validator after Phase 17C ─────────────

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase17cStr = 'node scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js';
  const phase17dStr = 'node scripts/validate-phase17d-migration-journal-event-log-architecture.js';

  if (!text.includes(phase17cStr)) fail(`${WORKFLOW_FILE} must register Phase 17C validator`);
  if (!text.includes(phase17dStr)) fail(`${WORKFLOW_FILE} must register Phase 17D validator`);

  const phase17cPos = text.indexOf(phase17cStr);
  const phase17dPos = text.indexOf(phase17dStr);
  if (phase17dPos <= phase17cPos) fail(`${WORKFLOW_FILE} must register Phase 17D validator after Phase 17C`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

// ── 5 & 6. Package files unchanged ───────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 17D');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 17D');
}

// ── 7. No src/ changes ────────────────────────────────────────────────────────

function noSrcChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 17D (forbidden): ${file}`);
  }
}

// ── 8. No tests/ changes ─────────────────────────────────────────────────────

function noTestsChangesGuard() {
  for (const file of changedFiles()) {
    if (phase17dAllowedChangedFiles.has(file)) continue;
    const firstSegment = file.indexOf('/') >= 0 ? file.slice(0, file.indexOf('/')) : file;
    if (firstSegment === 'tests') fail(`tests/ file changed in Phase 17D (forbidden): ${file}`);
  }
}

// ── 9. No e2e/ changes ───────────────────────────────────────────────────────

function noE2eChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17D (forbidden): ${file}`);
  }
}

// ── Scope guard (combines 7, 8, 9, and overall scope check) ──────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase17dAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json' || file === 'package-lock.json') fail(`${file} must not change in Phase 17D`);
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 17D (forbidden): ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 17D (forbidden): ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 17D (forbidden): ${file}`);
    // New phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    if (file.startsWith('docs/')) fail(`Unexpected docs/ file changed in Phase 17D: ${file}`);
    warn(`Unexpected file outside allowed scope (non-fatal): ${file}`);
  }
}

// ── 10. No forbidden runtime files ───────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const path of forbiddenRuntimeFiles) {
    if (fs.existsSync(path)) fail(`Phase 17D must not introduce forbidden runtime file: ${path}`);
  }
}

// ── 11. No forbidden dependencies ────────────────────────────────────────────

function forbiddenDependencyGuard() {
  const pkg = read('package.json');
  for (const dep of forbiddenDependencies) {
    const pattern = new RegExp(`"${dep}"\\s*:`);
    if (pattern.test(pkg)) fail(`package.json must not add forbidden dependency: "${dep}"`);
  }
}

// ── 12. Required document terms ──────────────────────────────────────────────

function docTermGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();

  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── 13. Required future phase sequence ───────────────────────────────────────

function phaseSequenceGuard() {
  const doc = read(DOCS_FILE);
  for (const seq of requiredPhaseSequence) {
    if (!doc.includes(seq)) {
      fail(`${DOCS_FILE} must include required phase sequence entry: "${seq}"`);
    }
  }
}

// ── 14. Forbidden positive claims absent ─────────────────────────────────────

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const lines = doc.split(/\r?\n/);
  let inSkippedSection = false;
  for (const line of lines) {
    if (/^##\s+(Claim boundaries|Explicit non-goals|Forbidden)/i.test(line)) {
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

// ── 15. Generated artifacts absent from changed/untracked files ───────────────

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

// ── 16 & 17. Historical validator changes are exact Phase 17D forward-compat entries ──

function historicalValidatorForwardCompatGuard() {
  const changed = changedFiles();
  const mergeBase = runGit('git merge-base HEAD origin/main', { silent: true });

  // Check ALL changed scripts/validate-*.js files (except the new Phase 17D validator itself).
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
      // Extract all single-quoted path strings from the line.
      const extractedPaths = [...line.matchAll(/'([^']+)'/g)].map(([, p]) => p);

      // Check #17: no broad path allowlists added.
      // Uses exact-path matching: only flag if the extracted path IS the broad path (not a longer path prefixed by it).
      for (const broadPattern of broadPathPatterns) {
        const broadPath = broadPattern.slice(1, -1); // strip surrounding quotes
        if (extractedPaths.some(p => p === broadPath)) {
          fail(`Historical validator ${validatorFile} adds forbidden broad path allowlist: ${broadPattern}`);
        }
      }

      // Check #16: any docs/ path strings added in quotes must be Phase 17D forward-compat entries
      const pathMatches = [...line.matchAll(/'([^']{5,})'/g)];
      for (const [, path] of pathMatches) {
        if (!path.includes('/')) continue; // not a file path
        // Only scrutinize docs/ paths — scripts/validate- paths are checked by broadPathPatterns
        if (path.startsWith('docs/') && !path.includes('phase17d')) {
          if (!phase17dForwardCompatEntries.includes(path)) {
            fail(`Historical validator ${validatorFile} adds unexpected non-Phase-17D docs/ entry: '${path}'`);
          }
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
  forbiddenDependencyGuard();
  docTermGuard();
  phaseSequenceGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  docSectionGuard();
  console.log('Phase 17D Migration Journal / Event Log Architecture Guardrail validation passed.');
}

validate();
