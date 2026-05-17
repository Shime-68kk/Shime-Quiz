#!/usr/bin/env node
/**
 * scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js
 *
 * Phase 16K static validator — Storage Quota & Backup-Before-Import Runtime Hardening.
 *
 * Confirms:
 *   • Phase 16K doc exists with required terms;
 *   • workflow registers Phase 16K validator after Phase 16J;
 *   • all previous validators through Phase 16J remain registered;
 *   • no package.json / package-lock.json changes;
 *   • no e2e/ changes unless justified;
 *   • no protected scheduler/storage/FSRS/EduGen runtime files changed;
 *   • no dependencies added;
 *   • no sync/cloud/account/auth implementation;
 *   • no IndexedDB/Event Log/StorageAdapter/SyncAdapter runtime implementation;
 *   • no new production ts-fsrs.next() call sites;
 *   • required backup-before-import and storage quota terms exist in Phase 16K doc;
 *   • BackupBeforeImportNotice component exists with required copy;
 *   • changed files are within the Phase 16K allowlist;
 *   • no broad public claims about cloud sync, guaranteed safety, or storage certification.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase16k-storage-quota-backup-before-import-hardening.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';

const PHASE16J_VALIDATOR = 'scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js';
const PHASE16I_VALIDATOR = 'scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js';
const PHASE16H_VALIDATOR = 'scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js';
const PHASE16G_VALIDATOR = 'scripts/validate-phase16g-edugen-draft-review-import-flow.js';
const PHASE16F_VALIDATOR = 'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js';
const PHASE16E_VALIDATOR = 'scripts/validate-phase16e-visual-polish-quick-wins.js';
const PHASE15H_VALIDATOR = 'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js';

// Exact set of allowed changed files for Phase 16K.
const phase16kAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  'src/utils/storageQuotaEstimate.js',
  'src/components/learning/BackupBeforeImportNotice.jsx',
  'src/routes/Library.jsx',
  'tests/unit/storageQuotaEstimate.test.js',
  'tests/unit/storageQuotaBackupBeforeImport.test.jsx',
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
  'scripts/validate-phase17f-test-only-migration-journal-prototype.js',
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
  // Phase 19A forward-compat entries (FSRS Public Opt-In Sequencing Gate)
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
  // Phase 19B forward-compat entries (Optional Sync Architecture Decision Gate)
  `docs/adr/phase19b-optional-sync-direction.md`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
]);

// Hard-forbidden scheduler/storage/EduGen runtime files.
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

const forbiddenRuntimePaths = [
  // Phase 17B forward-compat: 'src/storage/StorageAdapter.js' is now a Phase 17B scaffold file
  // Phase 17B forward-compat: 'src/storage/LocalStorageAdapter.js' is now a Phase 17B scaffold file
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

// Required terms in Phase 16K doc.
const requiredDocTerms = [
  'storage quota',
  'backup',
  'import',
  'local',
  'navigator.storage',
  'no IndexedDB migration',
  'no sync',
  'no cloud',
  'large import',
  'EduGen',
  'draft',
  'review',
  'LARGE_IMPORT_ITEM_THRESHOLD',
  'BackupBeforeImportNotice',
  'advisory',
  'Phase 16L'
];

// Forbidden claim phrases in Phase 16K doc.
const forbiddenClaimPhrases = [
  'shime has built-in ai',
  'built-in ai generation is available',
  'cloud sync is available',
  'cloud sync is enabled',
  'cloud sync implemented',
  'indexeddb implemented',
  'indexeddb migration has been completed',
  'e2ee is available',
  'end-to-end encryption is available',
  'fsrs is enabled for all users',
  'fsrs is live for all users',
  'storage certified',
  'production certified',
  'guaranteed data loss prevention',
  'data-loss prevention guaranteed',
  'backup format changed',
  'import behavior changed',
  'storage schema changed'
];

function fail(message) {
  console.error(`Phase 16K validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 16K validation warning: ${message}`);
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
  read(PHASE16J_VALIDATOR);
  read(PHASE16I_VALIDATOR);
  read(PHASE16H_VALIDATOR);
  read(PHASE16G_VALIDATOR);
  read(PHASE16F_VALIDATOR);
  read(PHASE16E_VALIDATOR);
  read(PHASE15H_VALIDATOR);
  if (!fs.existsSync('src/utils/storageQuotaEstimate.js')) fail('src/utils/storageQuotaEstimate.js must exist');
  if (!fs.existsSync('src/components/learning/BackupBeforeImportNotice.jsx')) {
    fail('src/components/learning/BackupBeforeImportNotice.jsx must exist');
  }
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
  if (changed.has('package.json')) fail('package.json must not change in Phase 16K');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 16K');

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
    if (phase16kAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 16K`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 16K`);
    if (file.startsWith('e2e/')) {
      fail(`e2e/ file changed in Phase 16K: ${file}. Only allowed if intentional and documented.`);
    }
    // Historical validator updates and new phase validator scripts are allowed.
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    fail(`Unexpected changed file for Phase 16K scope: ${file}`);
  }
}

// ── Forbidden runtime files guard ─────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  const changed = new Set(changedFiles());
  for (const file of forbiddenRuntimeFiles) {
    if (changed.has(file)) {
      fail(`Phase 16K must not change scheduler/storage/EduGen runtime file: ${file}`);
    }
  }
  for (const path of forbiddenRuntimePaths) {
    if (fs.existsSync(path)) {
      fail(`Phase 16K must not introduce cloud/auth/sync/adapter path: ${path}`);
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
    'node scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js'
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase16jPos = text.indexOf('node scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js');
  const phase16kPos = text.indexOf('node scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js');
  if (phase16jPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16J validator`);
  if (phase16kPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16K validator`);
  if (phase16kPos <= phase16jPos) {
    fail(`${WORKFLOW_FILE} must register Phase 16K validator after Phase 16J validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Phase 16K doc guard ───────────────────────────────────────────────────────

function phase16kDocGuard() {
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
    if (lower.includes(claim.toLowerCase())) {
      fail(`${DOCS_FILE} must not contain forbidden claim: "${claim}"`);
    }
  }
}

// ── Storage quota runtime guard ───────────────────────────────────────────────

function storageQuotaRuntimeGuard() {
  const source = read('src/utils/storageQuotaEstimate.js');

  for (const term of ['navigator.storage', 'estimate', 'usage', 'quota']) {
    if (!source.includes(term)) fail(`src/utils/storageQuotaEstimate.js must include storage estimate term: ${term}`);
  }
  if (!/threshold|percent|ratio/i.test(source)) {
    fail('src/utils/storageQuotaEstimate.js must include threshold, percent, or ratio logic.');
  }
  if (!/typeof navigator|unavailable|invalid|catch|ok: false|shouldWarn: false/i.test(source)) {
    fail('src/utils/storageQuotaEstimate.js must gracefully handle unavailable API or invalid values.');
  }
  if (!source.includes('LARGE_IMPORT_ITEM_THRESHOLD')) {
    fail('src/utils/storageQuotaEstimate.js must export LARGE_IMPORT_ITEM_THRESHOLD');
  }
  if (!source.includes('getLargeImportItemCountWarning')) {
    fail('src/utils/storageQuotaEstimate.js must export getLargeImportItemCountWarning');
  }
}

// ── Backup-before-import UI guard ─────────────────────────────────────────────

function backupBeforeImportUiGuard() {
  const notice = read('src/components/learning/BackupBeforeImportNotice.jsx');
  const noticeLower = notice.toLowerCase();

  if (!noticeLower.includes('sao lưu') && !noticeLower.includes('backup')) {
    fail('BackupBeforeImportNotice.jsx must include backup-oriented copy (sao lưu or backup)');
  }
  if (!noticeLower.includes('cục bộ') && !noticeLower.includes('local')) {
    fail('BackupBeforeImportNotice.jsx must mention local storage (cục bộ or local)');
  }
  if (!noticeLower.includes('large_import_item_threshold') && !notice.includes('LARGE_IMPORT_ITEM_THRESHOLD')) {
    fail('BackupBeforeImportNotice.jsx must reference LARGE_IMPORT_ITEM_THRESHOLD');
  }

  const library = read('src/routes/Library.jsx');
  if (!library.includes('BackupBeforeImportNotice')) {
    fail('src/routes/Library.jsx must import and use BackupBeforeImportNotice');
  }
}

// ── No cloud/auth/sync paths guard ────────────────────────────────────────────

// Phase 17B forward-compat: StorageAdapter.js and LocalStorageAdapter.js are
// now Phase 17B scaffold files; only IndexedDB/Sync/auth/cloud/backend are still forbidden.
function noCloudAuthGuard() {
  const forbiddenPaths = [
    'src/auth', 'src/cloud', 'src/backend', 'src/api/sync', 'src/sync',
    'src/storage/SyncAdapter.js',
    'src/storage/IndexedDBAdapter.js', 'src/edugen/aiProcessClient.js'
  ];
  for (const path of forbiddenPaths) {
    if (fs.existsSync(path)) {
      fail(`Phase 16K must not introduce cloud/auth/sync/AI-process path: ${path}`);
    }
  }
}

// ── No IndexedDB in src/ guard ────────────────────────────────────────────────

function noIndexedDBGuard() {
  const SRC_DIR = 'src';
  if (!fs.existsSync(SRC_DIR)) return;

  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = `${dirPath}/${entry.name}`;
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
        const content = fs.readFileSync(full, 'utf8');
        if (/indexedDB\.open\s*\(|openIDB\s*\(|new\s+IDBFactory/i.test(content)) {
          if (full === 'src/storage/indexedDbDryRunHarness.js') continue;
          fail(`Phase 16K must not introduce IndexedDB runtime in: ${full}`);
        }
      }
    }
  }

  scanDir(SRC_DIR);
}

// ── FSRS regression guard ─────────────────────────────────────────────────────

function fsrsRegressionGuard() {
  const wrapperFile = 'src/quiz/fsrsWrapper.js';
  if (fs.existsSync(wrapperFile)) {
    const source = fs.readFileSync(wrapperFile, 'utf8');
    const matches = source.match(/\.next\s*\(/g) ?? [];
    if (matches.length !== 2) {
      fail(`src/quiz/fsrsWrapper.js must have exactly 2 .next() calls (Phase 15B baseline), found ${matches.length}`);
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

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  packageGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  generatedArtifactGuard();
  workflowGuard();
  phase16kDocGuard();
  forbiddenClaimGuard();
  storageQuotaRuntimeGuard();
  backupBeforeImportUiGuard();
  noCloudAuthGuard();
  noIndexedDBGuard();
  fsrsRegressionGuard();
  internalRegistryGuard();
  console.log('Phase 16K Storage Quota & Backup-Before-Import Runtime Hardening validation passed.');
}

validate();
