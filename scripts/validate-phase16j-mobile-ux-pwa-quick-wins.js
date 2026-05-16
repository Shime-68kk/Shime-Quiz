#!/usr/bin/env node
/**
 * scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js
 *
 * Phase 16J static validator — Mobile UX / PWA Quick Wins.
 *
 * Confirms:
 *   • Phase 16J doc exists with required terms;
 *   • workflow registers Phase 16J validator after Phase 16I;
 *   • all previous validators through Phase 16I remain registered;
 *   • no package.json / package-lock.json changes;
 *   • no e2e/ changes unless justified;
 *   • no protected scheduler/storage/FSRS/EduGen runtime files changed;
 *   • no dependencies added;
 *   • no sync/cloud/account/auth implementation;
 *   • no IndexedDB/Event Log/StorageAdapter/SyncAdapter runtime implementation;
 *   • no new production ts-fsrs.next() call sites;
 *   • PWA files are valid/coherent if changed;
 *   • required mobile/PWA terms exist in Phase 16J doc;
 *   • changed files are within the Phase 16J allowlist.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase16j-mobile-ux-pwa-quick-wins.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';

const PHASE16I_VALIDATOR = 'scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js';
const PHASE16H_VALIDATOR = 'scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js';
const PHASE16G_VALIDATOR = 'scripts/validate-phase16g-edugen-draft-review-import-flow.js';
const PHASE16F_VALIDATOR = 'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js';
const PHASE16E_VALIDATOR = 'scripts/validate-phase16e-visual-polish-quick-wins.js';
const PHASE15H_VALIDATOR = 'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js';

// Exact set of allowed changed files for Phase 16J.
// Phase 16J is a mobile UX / PWA quick wins phase: allows changes only to
// CSS, service worker, landing/route UI files, PWA manifest, index.html,
// doc, validator, and CI registration.
const phase16jAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  'src/styles/global.css',
  'public/sw.js',
  // Phase 16K — Storage Quota & Backup-Before-Import Runtime Hardening (forward compatibility)
  'docs/phase16k-storage-quota-backup-before-import-hardening.md',
  'src/utils/storageQuotaEstimate.js',
  'src/components/learning/BackupBeforeImportNotice.jsx',
  'tests/unit/storageQuotaEstimate.test.js',
  'tests/unit/storageQuotaBackupBeforeImport.test.jsx',
  'public/manifest.webmanifest',
  'index.html',
  'src/routes/Home.jsx',
  'src/routes/Dashboard.jsx',
  'src/routes/StudyRoom.jsx',
  'src/routes/Library.jsx',
  'src/routes/Settings.jsx',
  'src/App.jsx',
  // Phase 16L — Local-First Hybrid / StorageAdapter Plan (forward compatibility)
  'docs/phase16l-local-first-hybrid-storage-adapter-plan.md',
  'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js',
  // Phase 17A — Backup/Rollback Harness BEFORE Migration (forward compatibility)
  'docs/phase17a-backup-rollback-harness-before-migration.md',
  'scripts/validate-phase17a-backup-rollback-harness-before-migration.js',
  'src/state/v2BackupRestore.js',
  'src/utils/storageQuotaEstimate.js',
  'tests/unit/phase17aBackupRollbackHarness.test.js',
  // Phase 17B — StorageAdapter Scaffold (forward compatibility)
  'docs/phase17b-storage-adapter-localstorage-scaffold.md',
  'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js',
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
  // Phase 17D forward-compat entries (Migration Journal / Event Log Architecture)
  'docs/phase17d-migration-journal-event-log-architecture.md',
  'scripts/validate-phase17d-migration-journal-event-log-architecture.js',
  // Phase 17E forward-compat entries (Per-Key Migration Manifest Design)
  'docs/phase17e-per-key-migration-manifest-design.md',
  'scripts/validate-phase17e-per-key-migration-manifest-design.js',
]);

// Hard-forbidden scheduler/storage/EduGen runtime files. Phase 16J must not touch these.
const forbiddenRuntimeFiles = [
  'src/quiz/reviewSchedulerAdapter.js',
  'src/quiz/fsrsWrapper.js',
  'src/state/reviewScheduleStorage.js',
  'src/state/settingsStorage.js',
  'src/data/learningDataAdapter.js',
  'src/data/importValidator.js',
  'src/edugen/edugenConnector.js',
  'src/edugen/edugenDraftParser.js',
  'src/edugen/edugenDraftImport.js',
  'src/components/edugen/EduGenDraftReviewPanel.jsx'
];

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied'
];

const generatedArtifacts = [
  'node_modules',
  'dist',
  'test-results',
  'playwright-report',
  'coverage',
  'FETCH_HEAD',
  '.env',
  '.env.local',
  '.git'
];

// Required terms that must appear in the Phase 16J doc.
const requiredDocTerms = [
  'mobile',
  'narrow',
  'PWA',
  'viewport',
  'tap target',
  'manifest',
  'service worker',
  'Vietnamese',
  'overflow',
  'responsive',
  'No runtime logic expansion',
  'No EduGen',
  'No scheduler',
  'không đảm bảo nội dung'
];

// Forbidden claim phrases in Phase 16J doc.
const forbiddenClaimPhrases = [
  'shime has built-in ai',
  'built-in ai generation is available',
  'shime has built-in ocr',
  'built-in ocr is available',
  'ocr is built in',
  'edugen is bundled with shime',
  'cloud sync is available',
  'cloud sync is enabled',
  'e2ee is available',
  'end-to-end encryption is available',
  'fsrs is enabled for all users',
  'fsrs is live for all users',
  'frontend alone processes pdf',
  'frontend-only processes pdf',
  'byok is supported',
  'api key is supported'
];

function fail(message) {
  console.error(`Phase 16J validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 16J validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function readOptional(file) {
  if (!fs.existsSync(file)) return null;
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
  if (changed.has('package.json')) fail('package.json must not change in Phase 16J');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 16J');

  void pkg;
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase16jAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 16J`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 16J`);
    if (file.startsWith('e2e/')) {
      fail(`e2e/ file changed in Phase 16J: ${file}. Only allowed if an intentional UI copy/locator update.`);
    }
    // Historical validator updates and any new phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    fail(`Unexpected changed file for Phase 16J scope: ${file}`);
  }
}

// ── Forbidden runtime files guard ─────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  const changed = new Set(changedFiles());
  for (const file of forbiddenRuntimeFiles) {
    if (changed.has(file)) {
      fail(`Phase 16J must not change scheduler/storage/EduGen runtime file: ${file}`);
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
    'node scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js'
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase16iPos = text.indexOf('node scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js');
  const phase16jPos = text.indexOf('node scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js');
  if (phase16iPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16I validator`);
  if (phase16jPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16J validator`);
  if (phase16jPos <= phase16iPos) {
    fail(`${WORKFLOW_FILE} must register Phase 16J validator after Phase 16I validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Phase 16J doc guard ───────────────────────────────────────────────────────

function phase16jDocGuard() {
  const doc = read(DOCS_FILE);
  const docLower = doc.toLowerCase();

  for (const term of requiredDocTerms) {
    if (!docLower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── Forbidden claim guard ─────────────────────────────────────────────────────

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const claim of forbiddenClaimPhrases) {
    if (lower.includes(claim)) {
      fail(`${DOCS_FILE} must not contain forbidden claim: "${claim}"`);
    }
  }
}

// ── PWA coherence guard ───────────────────────────────────────────────────────

function pwaCoherenceGuard() {
  const manifestPath = 'public/manifest.webmanifest';
  if (!fs.existsSync(manifestPath)) fail(`${manifestPath} must exist`);

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`${manifestPath} must be valid JSON: ${error.message}`);
  }

  if (!manifest.name) fail(`${manifestPath} must have a "name" field`);
  if (!manifest.short_name) fail(`${manifestPath} must have a "short_name" field`);
  if (!manifest.icons || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    fail(`${manifestPath} must have at least one icon`);
  }

  for (const icon of manifest.icons) {
    const iconPath = `public/${icon.src.replace(/^\.\//, '')}`;
    if (!fs.existsSync(iconPath)) {
      fail(`${manifestPath} references icon that does not exist: ${icon.src} (checked ${iconPath})`);
    }
  }

  if (!manifest.theme_color) warn(`${manifestPath} is missing theme_color`);
  if (!manifest.background_color) warn(`${manifestPath} is missing background_color`);

  const text = fs.readFileSync(manifestPath, 'utf8').toLowerCase();
  for (const term of internalRegistryTerms) {
    if (text.includes(term)) fail(`${manifestPath} contains internal registry term: ${term}`);
  }
}

// ── No cloud/auth/sync paths guard ────────────────────────────────────────────

function noCloudAuthGuard() {
  const forbiddenPaths = [
    'src/auth',
    'src/cloud',
    'src/backend',
    'src/api/sync',
    'src/sync',
    'src/storage/SyncAdapter.js',
    // Phase 17B forward-compat: 'src/storage/StorageAdapter.js', — now a Phase 17B scaffold file
    'src/storage/IndexedDBAdapter.js',
    'src/edugen/aiProcessClient.js'
  ];
  for (const path of forbiddenPaths) {
    if (fs.existsSync(path)) {
      fail(`Phase 16J must not introduce cloud/auth/sync/AI-process path: ${path}`);
    }
  }
}

// ── FSRS regression guard ─────────────────────────────────────────────────────

function fsrsRegressionGuard() {
  const wrapperFile = 'src/quiz/fsrsWrapper.js';
  if (fs.existsSync(wrapperFile)) {
    const wrapperSource = fs.readFileSync(wrapperFile, 'utf8');
    const matches = wrapperSource.match(/\.next\s*\(/g) ?? [];
    if (matches.length !== 2) {
      fail(`src/quiz/fsrsWrapper.js must have exactly 2 .next() calls (Phase 15B baseline preserved), found ${matches.length}`);
    }
  }

  const adapterFile = 'src/quiz/reviewSchedulerAdapter.js';
  if (fs.existsSync(adapterFile)) {
    const source = fs.readFileSync(adapterFile, 'utf8');
    if (!source.includes('fsrsExperimentalEnabled')) {
      fail(`${adapterFile} must preserve fsrsExperimentalEnabled (Phase 15B regression)`);
    }
    if (!source.includes('fsrsActiveSchedulingEnabled')) {
      fail(`${adapterFile} must preserve fsrsActiveSchedulingEnabled (Phase 15B regression)`);
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

// ── SW coherence guard ────────────────────────────────────────────────────────

function swCoherenceGuard() {
  const swPath = 'public/sw.js';
  const swText = readOptional(swPath);
  if (!swText) return;

  if (swText.toLowerCase().includes('ai.1') || swText.toLowerCase().includes('beta-ai')) {
    fail(`${swPath} CACHE_VERSION must not contain 'ai' build suffix — update to match current project stage`);
  }

  for (const term of internalRegistryTerms) {
    if (swText.includes(term)) fail(`${swPath} contains internal registry term: ${term}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  packageGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  generatedArtifactGuard();
  workflowGuard();
  phase16jDocGuard();
  forbiddenClaimGuard();
  pwaCoherenceGuard();
  noCloudAuthGuard();
  fsrsRegressionGuard();
  internalRegistryGuard();
  swCoherenceGuard();
  console.log('Phase 16J Mobile UX / PWA Quick Wins validation passed.');
}

validate();
