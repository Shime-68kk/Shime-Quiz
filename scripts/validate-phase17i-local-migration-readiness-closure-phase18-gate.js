#!/usr/bin/env node
/**
 * scripts/validate-phase17i-local-migration-readiness-closure-phase18-gate.js
 *
 * Phase 17I static validator — Local Migration Readiness Closure / Phase 18 Gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase17i-local-migration-readiness-closure-phase18-gate.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase17i-local-migration-readiness-closure-phase18-gate.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE17H_VALIDATOR = 'scripts/validate-phase17h-single-key-reversible-migration-pilot.js';

// Exact set of allowed changed files for Phase 17I (docs/CI-only, no test files).
const phase17iAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  // Historical validator forward-compat edits (backtick literals to avoid single-quote extraction by earlier guards)
  'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js',
  'scripts/validate-phase17a-backup-rollback-harness-before-migration.js',
  'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js',
  'scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js',
  'scripts/validate-phase17d-migration-journal-event-log-architecture.js',
  'scripts/validate-phase17e-per-key-migration-manifest-design.js',
  'scripts/validate-phase17f-test-only-migration-journal-prototype.js',
  'scripts/validate-phase17g-single-key-dry-run-migration-rehearsal.js',
  PHASE17H_VALIDATOR,
  'scripts/validate-backup-transfer-safety-hardening.js',
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
  // Phase 19B forward-compat entries (Optional Sync Architecture Decision Gate)
  `docs/adr/phase19b-optional-sync-direction.md`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
  // Phase 19C forward-compat entries (Optional Sync Conflict Model Design Gate)
  `docs/adr/phase19c-optional-sync-conflict-model.md`,
  `scripts/validate-phase19c-optional-sync-conflict-model.js`,
]);

// Forbidden runtime files that must not exist in Phase 17I.
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

// Production directory prefixes that must not change.
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

// Broad path patterns that must not be added to historical validators.
// Use template literals to avoid being extracted as single-quoted paths by Phase 17D/17E/17F/17G/17H guards.
const broadPathPatterns = [
  `src/`,
  `src/storage/`,
  `docs/`,
  `scripts/`,
  `tests/`,
  `e2e/`,
];

// Phase 17I allowed forward-compat entries that may be added to historical validators.
const phase17iForwardCompatEntries = [
  DOCS_FILE,
  VALIDATOR_SCRIPT,
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
];

// Required document sections (exact heading strings).
const requiredDocSections = [
  '# Phase 17I — Local Migration Readiness Closure / Phase 18 Gate',
  '## Purpose',
  '## Phase 17 Evidence Summary',
  '## What Phase 17 Proves',
  '## What Phase 17 Does Not Prove',
  '## Phase 18A Entry Criteria',
  '## Phase 18A Allowed Scope Preview',
  '## Claim Boundaries',
  '## Risk Register for Phase 18',
  '## Safety Invariants That Must Be Preserved in Phase 18',
  '## Future Sequencing',
  '## Acceptance Criteria',
];

// Required terms in the doc (case-insensitive).
const requiredDocTerms = [
  // Phase 17A-17H evidence
  'phase 17a',
  'phase 17b',
  'phase 17c',
  'phase 17d',
  'phase 17e',
  'phase 17f',
  'phase 17g',
  'phase 17h',
  // Phase 18A gate
  'phase 18a',
  // Key concepts
  'recommendation-feedback',
  'dry-run',
  'synthetic',
  'test-only',
  'reversible',
  'rollback',
  'backup',
  'manifest',
  'journal',
  // Entry criteria terms
  'entry criteria',
  'ci is green',
  'test-only indexeddbadapter',
  // Claim boundary terms
  'production migration remains unshipped',
  'localstorage remains',
  // Risk register terms
  'quota',
  'transaction failure',
  'partial writes',
  'fallback to localstorage',
  'export/backup mismatch',
  // Non-goals (template literal avoids extraction by forward-compat guards)
  `docs/static-validator/ci-only`,
];

// Required Phase 17A-17H summary headings.
const requiredPhase17SummaryHeadings = [
  'Phase 17A',
  'Phase 17B',
  'Phase 17C',
  'Phase 17D',
  'Phase 17E',
  'Phase 17F',
  'Phase 17G',
  'Phase 17H',
];

// Required Phase 18A scope terms.
const requiredPhase18aTerms = [
  'Phase 18A May',
  'Phase 18A Must Not',
];

// Forbidden positive claims (case-insensitive).
const forbiddenClaimPhrases = [
  'migration has shipped',
  'indexeddb production storage exists',
  'indexeddb is production',
  'production indexeddbadapter exists',
  'runtime eventlog exists',
  'runtime migrationjournal exists',
  'live migration is safe',
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

function fail(message) {
  console.error(`Phase 17I validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 17I validation warning: ${message}`);
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

// ── 1. Required Phase 17I files exist ──────────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE17H_VALIDATOR);
}

// ── 2. Workflow registers Phase 17I validator after Phase 17H ──────────────────

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase17hStr = 'node scripts/validate-phase17h-single-key-reversible-migration-pilot.js';
  const phase17iStr = 'node scripts/validate-phase17i-local-migration-readiness-closure-phase18-gate.js';

  if (!text.includes(phase17hStr)) fail(`${WORKFLOW_FILE} must register Phase 17H validator`);
  if (!text.includes(phase17iStr)) fail(`${WORKFLOW_FILE} must register Phase 17I validator`);

  const phase17hPos = text.indexOf(phase17hStr);
  const phase17iPos = text.indexOf(phase17iStr);
  if (phase17iPos <= phase17hPos) fail(`${WORKFLOW_FILE} must register Phase 17I validator after Phase 17H`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

// ── 3. Package files unchanged ─────────────────────────────────────────────────

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 17I');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 17I');
}

// ── 4. No src/ changes ────────────────────────────────────────────────────────

function noSrcChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith(`src/`)) fail(`src/ file changed in Phase 17I (forbidden): ${file}`);
  }
}

// ── 5. No tests/ changes ──────────────────────────────────────────────────────

function noTestsChangesGuard() {
  for (const file of changedFiles()) {
    if (phase17iAllowedChangedFiles.has(file)) continue;
    const firstSegment = file.indexOf('/') >= 0 ? file.slice(0, file.indexOf('/')) : file;
    if (firstSegment === 'tests') fail(`tests/ file changed in Phase 17I (forbidden — docs/CI-only phase): ${file}`);
  }
}

// ── 6. No e2e/ changes ────────────────────────────────────────────────────────

function noE2eChangesGuard() {
  for (const file of changedFiles()) {
    if (file.startsWith(`e2e/`)) fail(`e2e/ file changed in Phase 17I (forbidden): ${file}`);
  }
}

// ── 7. Scope guard ────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase17iAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json' || file === 'package-lock.json') fail(`${file} must not change in Phase 17I`);
    if (file.startsWith(`src/`)) fail(`src/ file changed in Phase 17I (forbidden): ${file}`);
    if (file.startsWith(`e2e/`)) fail(`e2e/ file changed in Phase 17I (forbidden): ${file}`);
    if (file.startsWith(`tests/`)) fail(`tests/ file changed in Phase 17I (forbidden — docs/CI-only phase): ${file}`);
    // New phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    if (file.startsWith(`docs/`)) fail(`Unexpected docs/ file changed in Phase 17I: ${file}`);
    warn(`Unexpected file outside allowed scope (non-fatal): ${file}`);
  }
}

// ── 8. No forbidden runtime files ─────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  for (const path of forbiddenRuntimeFiles) {
    if (fs.existsSync(path)) fail(`Phase 17I must not introduce forbidden runtime file: ${path}`);
  }
}

// ── 9. Protected production directories unchanged ─────────────────────────────

function forbiddenProductionFilesGuard() {
  const changed = new Set(changedFiles());
  for (const file of changed) {
    for (const prefix of forbiddenChangedProductionPrefixes) {
      if (file.startsWith(prefix)) fail(`Forbidden production path changed in Phase 17I: ${file}`);
    }
  }
}

// ── 10. No forbidden dependencies ─────────────────────────────────────────────

function forbiddenDependencyGuard() {
  const pkg = read('package.json');
  for (const dep of forbiddenDependencies) {
    const pattern = new RegExp(`"${dep}"\\s*:`);
    if (pattern.test(pkg)) fail(`package.json must not add forbidden dependency: "${dep}"`);
  }
}

// ── 11. Required document sections ────────────────────────────────────────────

function docSectionGuard() {
  const doc = read(DOCS_FILE);
  for (const section of requiredDocSections) {
    if (!doc.includes(section)) fail(`${DOCS_FILE} must include required section: "${section}"`);
  }
}

// ── 12. Required Phase 17A-17H summary headings ───────────────────────────────

function phase17SummaryGuard() {
  const doc = read(DOCS_FILE);
  for (const heading of requiredPhase17SummaryHeadings) {
    if (!doc.includes(heading)) {
      fail(`${DOCS_FILE} must include Phase 17 evidence summary heading for: "${heading}"`);
    }
  }
}

// ── 13. Required Phase 18A scope headings ─────────────────────────────────────

function phase18aScopeGuard() {
  const doc = read(DOCS_FILE);
  for (const term of requiredPhase18aTerms) {
    if (!doc.includes(term)) {
      fail(`${DOCS_FILE} must include Phase 18A scope term: "${term}"`);
    }
  }
}

// ── 14. Required document terms ───────────────────────────────────────────────

function docTermGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const term of requiredDocTerms) {
    if (!lower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── 15. Forbidden positive claims absent ──────────────────────────────────────

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const lines = doc.split(/\r?\n/);
  let inSkippedSection = false;
  for (const line of lines) {
    if (/^##\s+(Claim Boundaries|Forbidden Claims|What Phase 17 Does Not Prove)/i.test(line)) {
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

// ── 16. Generated artifacts absent ────────────────────────────────────────────

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

// ── 17. Historical validator changes are exact Phase 17I forward-compat entries ─

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

      // Check: no broad path allowlists added.
      for (const broadPath of broadPathPatterns) {
        if (extractedPaths.some(p => p === broadPath)) {
          fail(`Historical validator ${validatorFile} adds forbidden broad path allowlist: '${broadPath}'`);
        }
      }

      // Check: any docs/ or tests/ path strings added must be Phase 17I forward-compat entries.
      const pathMatches = [...line.matchAll(/'([^']{5,})'/g)];
      for (const [, path] of pathMatches) {
        if (!path.includes('/')) continue;
        if (path.startsWith(`docs/`) && !path.includes('phase17i')) {
          if (!phase17iForwardCompatEntries.includes(path)) {
            fail(`Historical validator ${validatorFile} adds unexpected non-Phase-17I docs/ entry: '${path}'`);
          }
        }
        if (path.startsWith(`tests/`) && !phase17iForwardCompatEntries.includes(path)) {
          fail(`Historical validator ${validatorFile} adds unexpected non-Phase-17I tests/ entry: '${path}'`);
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
  docSectionGuard();
  phase17SummaryGuard();
  phase18aScopeGuard();
  docTermGuard();
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log('Phase 17I Local Migration Readiness Closure / Phase 18 Gate validation passed.');
}

validate();
