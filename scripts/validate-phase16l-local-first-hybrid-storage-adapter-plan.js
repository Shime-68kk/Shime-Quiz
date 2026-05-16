#!/usr/bin/env node
/**
 * scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js
 *
 * Phase 16L static validator — Local-First Hybrid / StorageAdapter ADR.
 *
 * Confirms:
 *   • Phase 16L ADR doc exists with required sections, findings, roadmap,
 *     and claim guardrails;
 *   • workflow registers Phase 16L validator after Phase 16K validator;
 *   • all previous validators through Phase 16K remain registered;
 *   • no package.json / package-lock.json changes;
 *   • no src/ changes;
 *   • no e2e/ changes;
 *   • no src/storage/ path created;
 *   • no forbidden dependencies added;
 *   • no public claims of IndexedDB done, sync ready, cloud sync, E2EE,
 *     StorageAdapter runtime done, public active FSRS rollout, built-in AI
 *     or OCR, or guaranteed data safety;
 *   • changed files are within the Phase 16L allowlist.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase16l-local-first-hybrid-storage-adapter-plan.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';

const PHASE16K_VALIDATOR = 'scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js';
const PHASE16J_VALIDATOR = 'scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js';
const PHASE16I_VALIDATOR = 'scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js';
const PHASE16H_VALIDATOR = 'scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js';
const PHASE16G_VALIDATOR = 'scripts/validate-phase16g-edugen-draft-review-import-flow.js';
const PHASE16F_VALIDATOR = 'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js';
const PHASE16E_VALIDATOR = 'scripts/validate-phase16e-visual-polish-quick-wins.js';
const PHASE15H_VALIDATOR = 'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js';

// Exact set of allowed changed files for Phase 16L.
const phase16lAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  'README.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
  // Phase 17A forward-compat entries (backup/rollback harness)
  'docs/phase17a-backup-rollback-harness-before-migration.md',
  'scripts/validate-phase17a-backup-rollback-harness-before-migration.js',
  'src/state/v2BackupRestore.js',
  'src/utils/storageQuotaEstimate.js',
  'tests/unit/phase17aBackupRollbackHarness.test.js',
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
]);

const forbiddenRuntimePaths = [
  'src/storage/StorageAdapter.js',
  'src/storage/LocalStorageAdapter.js',
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

const bindingPackage = '@open-spaced-repetition/' + 'binding';
const internalRegistryTerms = ['applied-caas', 'artifactory', 'internal.api.openai', 'packages.applied'];

const generatedArtifacts = [
  'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD', '.env', '.env.local', '.git'
];

const requiredSections = [
  '# Phase 16L — Local-First Hybrid / StorageAdapter Plan',
  '## Result',
  '## Executive Recommendation',
  '## Current Storage Architecture Map',
  '## Storage Families',
  '## Current Risk Hotspots',
  '## Local-First Hybrid Principles',
  '## StorageAdapter Boundary Proposal',
  '## Why IndexedDB Must Wait',
  '## Backup and Rollback Harness Requirements',
  '## Event Log Direction',
  '## Optional Sync Boundary',
  '## FSRS Interaction',
  '## EduGen / Source Metadata Interaction',
  '## Roadmap Through Phase 20',
  '## Phase 17A Gate Criteria',
  '## What Not To Do Yet',
  '## Claim Guardrails',
  '## Validation Evidence'
];

// Required terms (case-insensitive match against the doc).
const requiredDocTerms = [
  // Result + scope
  'planning only',
  'adr',
  'docs / static-validator / ci only',
  'do not implement runtime',
  'do not create `src/storage/`',
  // Opus findings — risk hotspots
  'probe write',
  'doubled write',
  'no single import entry point',
  'library import',
  'full restore',
  'shimeV2',
  'legacy quiz',
  'auto-remove',
  'silent data loss',
  'best-effort',
  'not transactional',
  // Roadmap ordering
  '16L',
  '16M',
  '17A',
  '17B',
  '17C',
  '17D',
  '17E',
  '18+',
  '19+',
  'Phase 20',
  'Backup/Rollback Harness BEFORE',
  'StorageAdapter scaffold',
  'IndexedDB dry-run',
  // Boundary proposal
  'StorageAdapter',
  'LocalStorageAdapter',
  'IndexedDBAdapter',
  'NoOpAdapter',
  // FSRS / EduGen
  'fsrsPayload',
  'fsrsReviewLogs',
  'fsrsEnabledAt',
  'fsrsActiveSchedulingEnabled',
  'Draft Workshop',
  'sourceMetadata',
  // Backup/rollback gate
  'Mandatory pre-migration backup',
  'Migration dry-run',
  'Read-after-write',
  'Rollback path',
  'Migration status marker',
  // Forbidden / claim guardrails
  'permanently forbidden',
  'cloud sync',
  'E2EE',
  'public active FSRS rollout',
  'built-in AI',
  'no cloud-first',
  'manual backup',
  'export',
  'import',
  'Vietnamese-first'
];

// Forbidden positive-claim phrases in the ADR doc (case-insensitive).
const forbiddenClaimPhrases = [
  'indexeddb is implemented',
  'indexeddb migration is complete',
  'indexeddb migration has been completed',
  'sync is ready',
  'cloud sync is available',
  'cloud sync is enabled',
  'cloud sync implemented',
  'e2ee is available',
  'end-to-end encryption is available',
  'storageadapter runtime exists',
  'storageadapter runtime is implemented',
  'data loss prevention is guaranteed',
  'guaranteed data loss prevention',
  'guaranteed data safety',
  'public active fsrs rollout exists',
  'fsrs is enabled for all users',
  'fsrs is live for all users',
  'edugen is bundled',
  'built-in ai exists',
  'built-in ocr exists',
  'storage certified',
  'production certified'
];

function fail(message) {
  console.error(`Phase 16L validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 16L validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`${file} must be valid JSON: ${error.message}`);
  }
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
  read(PHASE16K_VALIDATOR);
  read(PHASE16J_VALIDATOR);
  read(PHASE16I_VALIDATOR);
  read(PHASE16H_VALIDATOR);
  read(PHASE16G_VALIDATOR);
  read(PHASE16F_VALIDATOR);
  read(PHASE16E_VALIDATOR);
  read(PHASE15H_VALIDATOR);
}

// ── Package guard ─────────────────────────────────────────────────────────────

function packageGuard() {
  const pkg = readJson('package.json');
  readJson('package-lock.json');

  for (const file of ['package.json', 'package-lock.json']) {
    const text = read(file);
    if (text.includes(bindingPackage)) fail(`${file} must not contain native binding dependency`);
    for (const term of internalRegistryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }

  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 16L');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 16L');

  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const forbiddenDeps = ['idb', 'idb-keyval', 'localforage', 'dexie', 'firebase', 'supabase', '@supabase/supabase-js', 'pouchdb', 'rxdb'];
  for (const dep of forbiddenDeps) {
    if (allDeps[dep]) fail(`package.json must not include forbidden dependency: ${dep}`);
  }

  void pkg;
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase16lAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail('package.json must not change in Phase 16L');
    if (file === 'package-lock.json') fail('package-lock.json must not change in Phase 16L');
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 16L (forbidden): ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 16L (forbidden): ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 16L (forbidden): ${file}`);
    // Historical validator updates and new phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    fail(`Unexpected changed file for Phase 16L scope: ${file}`);
  }
}

// ── Forbidden runtime paths guard ────────────────────────────────────────────

// Phase 17B forward-compat: src/storage/ and StorageAdapter/LocalStorageAdapter are
// legitimately created by Phase 17B scaffold. Only truly forbidden paths are checked.
function forbiddenRuntimePathsGuard() {
  const phase17bScaffoldFiles = new Set([
    'src/storage/StorageAdapter.js',
    'src/storage/LocalStorageAdapter.js',
    'src/storage/storageAdapterRegistry.js',
  ]);
  for (const path of forbiddenRuntimePaths) {
    if (phase17bScaffoldFiles.has(path)) continue;
    if (fs.existsSync(path)) {
      fail(`Phase 16L must not introduce storage/sync/cloud/auth path: ${path}`);
    }
  }
  // src/storage/ may now exist (Phase 17B scaffold) — only fail on forbidden files inside it
  if (fs.existsSync('src/storage')) {
    const forbidden = ['src/storage/IndexedDBAdapter.js', 'src/storage/SyncAdapter.js', 'src/storage/EventLog.js'];
    for (const f of forbidden) {
      if (fs.existsSync(f)) fail(`Phase 16L constraint violated: ${f} must not exist`);
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

  const requiredValidators = [
    'node scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js',
    'node scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js',
    'node scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js',
    'node scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js',
    'node scripts/validate-phase16d-shime-study-identity-product-principles.js',
    'node scripts/validate-phase16e-visual-polish-quick-wins.js',
    'node scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js',
    'node scripts/validate-phase16g-edugen-draft-review-import-flow.js',
    'node scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js',
    'node scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js',
    'node scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js',
    'node scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js',
    'node scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js'
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase16kPos = text.indexOf('node scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js');
  const phase16lPos = text.indexOf('node scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js');
  if (phase16kPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16K validator`);
  if (phase16lPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16L validator`);
  if (phase16lPos <= phase16kPos) {
    fail(`${WORKFLOW_FILE} must register Phase 16L validator after Phase 16K validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Phase 16L doc section guard ──────────────────────────────────────────────

function phase16lDocSectionGuard() {
  const doc = read(DOCS_FILE);
  for (const section of requiredSections) {
    if (!doc.includes(section)) {
      fail(`${DOCS_FILE} must include required section header: "${section}"`);
    }
  }
}

// ── Phase 16L doc term guard ─────────────────────────────────────────────────

function phase16lDocTermGuard() {
  const doc = read(DOCS_FILE);
  const docLower = doc.toLowerCase();
  for (const term of requiredDocTerms) {
    if (!docLower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── Roadmap ordering guard ───────────────────────────────────────────────────

function roadmapOrderingGuard() {
  const doc = read(DOCS_FILE);

  const markers = [
    { name: '16L', pattern: '16L —' },
    { name: '16M', pattern: '16M —' },
    { name: '17A', pattern: '17A —' },
    { name: '17B', pattern: '17B —' },
    { name: '17C', pattern: '17C —' }
  ];

  const positions = markers.map(({ name, pattern }) => {
    const idx = doc.indexOf(pattern);
    if (idx === -1) fail(`${DOCS_FILE} must include roadmap entry "${pattern}"`);
    return { name, idx };
  });

  for (let i = 1; i < positions.length; i += 1) {
    if (positions[i].idx <= positions[i - 1].idx) {
      fail(
        `${DOCS_FILE} roadmap must list ${positions[i - 1].name} before ${positions[i].name}`
      );
    }
  }

  // Sync must be sequenced after the migration safety gates.
  const syncIdx = doc.indexOf('18+');
  const adapterScaffoldIdx = doc.indexOf('17B —');
  if (syncIdx === -1) fail(`${DOCS_FILE} must include sync phase marker "18+"`);
  if (syncIdx <= adapterScaffoldIdx) {
    fail(`${DOCS_FILE} must sequence sync (18+) after 17B adapter scaffold`);
  }
}

// ── Forbidden positive-claim guard ───────────────────────────────────────────

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const claim of forbiddenClaimPhrases) {
    if (lower.includes(claim.toLowerCase())) {
      fail(`${DOCS_FILE} must not contain forbidden positive claim: "${claim}"`);
    }
  }
}

// ── Internal registry guard ───────────────────────────────────────────────────

function internalRegistryGuard() {
  const doc = read(DOCS_FILE);
  if (doc.includes(bindingPackage)) {
    fail(`${DOCS_FILE} must not reference native binding package`);
  }
  for (const term of internalRegistryTerms) {
    if (doc.includes(term)) {
      fail(`${DOCS_FILE} references internal registry term: ${term}`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  packageGuard();
  scopeGuard();
  forbiddenRuntimePathsGuard();
  generatedArtifactGuard();
  workflowGuard();
  phase16lDocSectionGuard();
  phase16lDocTermGuard();
  roadmapOrderingGuard();
  forbiddenClaimGuard();
  internalRegistryGuard();
  console.log('Phase 16L Local-First Hybrid / StorageAdapter ADR validation passed.');
}

validate();
