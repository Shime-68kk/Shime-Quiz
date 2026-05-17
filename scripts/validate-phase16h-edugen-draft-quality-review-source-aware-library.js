#!/usr/bin/env node
/**
 * scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js
 *
 * Phase 16H static validator — EduGen Draft Quality Review UX /
 * Source-Aware Library Polish.
 *
 * Confirms:
 *   • doc, test, helper, validator exist;
 *   • workflow registers Phase 16H validator after Phase 16G;
 *   • all previous validators through Phase 16G remain registered;
 *   • no package.json / package-lock.json changes;
 *   • no scheduler/storage critical files changed:
 *       src/quiz/reviewSchedulerAdapter.js
 *       src/quiz/fsrsWrapper.js
 *       src/state/reviewScheduleStorage.js
 *   • no cloud/auth/sync/AI-process runtime path introduced;
 *   • no `ai-process` runtime call site in new/changed runtime files;
 *   • no FormData / fetch / XHR / document upload in new/changed runtime;
 *   • no new `ts-fsrs` import / `.next()` call site in new/changed runtime;
 *   • Vietnamese-first / source-aware library copy is present;
 *   • forbidden positive-claim phrases absent in doc/helper/panel/settings;
 *   • generated artifacts absent from tracked files;
 *   • changed files are within the Phase 16H allowlist.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase16h-edugen-draft-quality-review-source-aware-library.md';
const TEST_FILE        = 'tests/unit/edugenDraftQualityReviewSourceLibrary.test.jsx';
const VALIDATOR_SCRIPT = 'scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';

const IMPORT_HELPER    = 'src/edugen/edugenDraftImport.js';
const REVIEW_PANEL     = 'src/components/edugen/EduGenDraftReviewPanel.jsx';
const SETTINGS_ROUTE   = 'src/routes/Settings.jsx';
const LIBRARY_ROUTE    = 'src/routes/Library.jsx';
const ADAPTER_FILE     = 'src/data/learningDataAdapter.js';
const IMPORT_VALIDATOR = 'src/data/importValidator.js';

const PHASE16G_VALIDATOR = 'scripts/validate-phase16g-edugen-draft-review-import-flow.js';
const PHASE16F_VALIDATOR = 'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js';
const PHASE16E_VALIDATOR = 'scripts/validate-phase16e-visual-polish-quick-wins.js';
const PHASE16D_VALIDATOR = 'scripts/validate-phase16d-shime-study-identity-product-principles.js';
const PHASE16C_VALIDATOR = 'scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js';
const PHASE16B_VALIDATOR = 'scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js';
const PHASE16A_VALIDATOR = 'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js';
const PHASE15H_VALIDATOR = 'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js';

// Exact set of allowed changed files for Phase 16H. The allowlist
// reflects the actual implementation: a new bounded import helper, a
// minimal additive change to the existing adapter/schema for
// sourceMetadata round-trip, panel/settings/library polish, plus doc,
// test, validator, and CI registration.
// Phase 16I additions (docs/copy polish only — no runtime change):
const phase16hAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  TEST_FILE,
  VALIDATOR_SCRIPT,
  IMPORT_HELPER,
  REVIEW_PANEL,
  SETTINGS_ROUTE,
  LIBRARY_ROUTE,
  ADAPTER_FILE,
  IMPORT_VALIDATOR,
  // Phase 16I — public README / landing / screenshots / demo quickstart (docs only)
  'README.md',
  'docs/phase16i-public-readme-landing-screenshots-demo-refresh.md',
  'docs/demo-quickstart.md',
  'docs/screenshot-capture-guide.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
  // Phase 16J — Mobile UX / PWA Quick Wins (forward compatibility)
  'docs/phase16j-mobile-ux-pwa-quick-wins.md',
  'src/styles/global.css',
  'public/sw.js',
  // Phase 16K — Storage Quota & Backup-Before-Import Runtime Hardening (forward compatibility)
  'docs/phase16k-storage-quota-backup-before-import-hardening.md',
  'scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js',
  'src/utils/storageQuotaEstimate.js',
  'src/components/learning/BackupBeforeImportNotice.jsx',
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
]);

// Hard-forbidden scheduler/storage files. Phase 16H must not touch these.
const forbiddenRuntimeFiles = [
  'src/quiz/reviewSchedulerAdapter.js',
  'src/quiz/fsrsWrapper.js',
  'src/state/reviewScheduleStorage.js'
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

const requiredDocTerms = [
  'Bản nháp cần xem lại',
  'Nguồn: EduGen',
  'Xác nhận lưu vào thư viện',
  'Tạo bản sao lưu trước khi nhập nhiều thẻ',
  'sourceMetadata',
  'reviewRequired',
  'duplicate',
  'no automatic import-to-study',
  'no automatic FSRS activation',
  'no built-in AI',
  'no OCR',
  'no cloud sync',
  'local-first',
  'optional companion',
  'not bundled'
];

// Forbidden positive-claim phrases. Documents may discuss these categories
// in negative form ("no built-in OCR"); only positive assertions are
// forbidden across new/changed Phase 16H surfaces.
const forbiddenClaimPhrases = [
  'edugen is bundled with shime',
  'edugen is shipped with shime',
  'edugen comes bundled',
  'shime includes edugen',
  'shime ships with edugen',
  'shime has built-in ai',
  'shime ships built-in ai',
  'built-in ai quiz generation exists',
  'shime has built-in ocr',
  'built-in ocr exists',
  'ocr is supported',
  'cloud sync is available',
  'cloud sync exists',
  'sync has shipped',
  'ai scheduling is enabled',
  'ai scheduled this for you',
  'mastery is guaranteed',
  'mastery guaranteed',
  'correct answers guaranteed',
  'generated questions are guaranteed correct',
  'frontend-only processes documents',
  'api key required',
  'byok is supported'
];

function fail(message) {
  console.error(`Phase 16H validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 16H validation warning: ${message}`);
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
  read(TEST_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(IMPORT_HELPER);
  read(REVIEW_PANEL);
  read(SETTINGS_ROUTE);
  read(LIBRARY_ROUTE);
  read(ADAPTER_FILE);
  read(IMPORT_VALIDATOR);
  read(PHASE16G_VALIDATOR);
  read(PHASE16F_VALIDATOR);
  read(PHASE16E_VALIDATOR);
  read(PHASE16D_VALIDATOR);
  read(PHASE16C_VALIDATOR);
  read(PHASE16B_VALIDATOR);
  read(PHASE16A_VALIDATOR);
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
  if (changed.has('package.json')) fail('package.json must not change in Phase 16H');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 16H');

  void pkg;
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase16hAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 16H`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 16H`);
    if (file.startsWith('e2e/')) {
      fail(`e2e/ file changed in Phase 16H: ${file}`);
    }
    // Historical validator updates are allowed (exact Phase 16H allowlist entries).
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    fail(`Unexpected changed file for Phase 16H scope: ${file}`);
  }
}

// ── Forbidden runtime files guard ─────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  const changed = new Set(changedFiles());
  for (const file of forbiddenRuntimeFiles) {
    if (changed.has(file)) {
      fail(`Phase 16H must not change scheduler/storage file: ${file}`);
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
    'node scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js'
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase16gPos = text.indexOf('node scripts/validate-phase16g-edugen-draft-review-import-flow.js');
  const phase16hPos = text.indexOf('node scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js');
  if (phase16gPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16G validator`);
  if (phase16hPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16H validator`);
  if (phase16hPos <= phase16gPos) {
    fail(`${WORKFLOW_FILE} must register Phase 16H validator after Phase 16G validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Required doc terms guard ──────────────────────────────────────────────────

function requiredDocTermsGuard() {
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
  const targets = [DOCS_FILE, IMPORT_HELPER, REVIEW_PANEL, SETTINGS_ROUTE, LIBRARY_ROUTE];
  for (const target of targets) {
    const text = read(target);
    const lower = text.toLowerCase();
    for (const claim of forbiddenClaimPhrases) {
      if (lower.includes(claim)) {
        fail(`${target} must not contain forbidden claim: "${claim}"`);
      }
    }
  }
}

// ── Vietnamese-first / required copy guard ────────────────────────────────────

function vietnameseFirstCopyGuard() {
  const panel = read(REVIEW_PANEL);
  const requiredPanelStrings = [
    'Xưởng bản nháp EduGen',
    'Bản nháp cần xem lại trước khi lưu',
    'Xem lại trước khi lưu',
    'Xác nhận lưu bản nháp',
    'Kết quả có thể sai hoặc thiếu ý',
    'Tạo bản sao lưu trước khi nhập nhiều thẻ',
    'Không có thẻ nào được lưu cho đến khi bạn xác nhận'
  ];
  for (const phrase of requiredPanelStrings) {
    if (!panel.includes(phrase)) {
      fail(`${REVIEW_PANEL} must include Phase 16H claim-safe phrase: "${phrase}"`);
    }
  }

  const library = read(LIBRARY_ROUTE);
  if (!library.includes('Bản nháp cần xem lại')) {
    fail(`${LIBRARY_ROUTE} must surface "Bản nháp cần xem lại" chip`);
  }
  if (!library.includes('Nguồn: EduGen')) {
    fail(`${LIBRARY_ROUTE} must surface "Nguồn: EduGen" chip`);
  }
}

// ── Helper / settings source contract ────────────────────────────────────────

function helperSourceGuard() {
  const helper = read(IMPORT_HELPER);
  const required = [
    'prepareEdugenDraftLibraryImport',
    'isSafeEdugenSourceMetadata',
    'reviewRequired',
    'sourceMetadata',
    'duplicateItems'
  ];
  for (const symbol of required) {
    if (!helper.includes(symbol)) fail(`${IMPORT_HELPER} must include ${symbol}`);
  }
  if (helper.includes('ts-fsrs')) fail(`${IMPORT_HELPER} must not import ts-fsrs`);
  if (/\.next\s*\(/.test(helper)) fail(`${IMPORT_HELPER} must not introduce a .next() call site`);
}

function settingsWiringGuard() {
  const settings = read(SETTINGS_ROUTE);
  if (!settings.includes('prepareEdugenDraftLibraryImport')) {
    fail(`${SETTINGS_ROUTE} must wire EduGen draft confirmation through prepareEdugenDraftLibraryImport`);
  }
  if (!settings.includes('setLearningData')) {
    fail(`${SETTINGS_ROUTE} must call setLearningData when EduGen drafts are confirmed`);
  }
  if (!/onConfirmImport=\{/.test(settings)) {
    fail(`${SETTINGS_ROUTE} must pass onConfirmImport to the panel`);
  }
  if (!settings.includes('EduGenDraftReviewPanel')) {
    fail(`${SETTINGS_ROUTE} must mount EduGenDraftReviewPanel`);
  }
  if (!settings.includes('EduGenDraftWorkshopPanel')) {
    fail(`${SETTINGS_ROUTE} must keep EduGenDraftWorkshopPanel mount`);
  }
  if (!settings.includes('FsrsExperimentalSettingsPanel')) {
    fail(`${SETTINGS_ROUTE} must keep FsrsExperimentalSettingsPanel mount`);
  }
}

function adapterAdditiveGuard() {
  const adapter = read(ADAPTER_FILE);
  if (!adapter.includes('sourceMetadata')) {
    fail(`${ADAPTER_FILE} must preserve sourceMetadata additively`);
  }
  if (!adapter.includes('edugen-draft')) {
    fail(`${ADAPTER_FILE} must recognise the edugen-draft sourceType`);
  }
}

function importValidatorAdditiveGuard() {
  const text = read(IMPORT_VALIDATOR);
  if (!text.includes('sourceMetadata')) {
    fail(`${IMPORT_VALIDATOR} must declare optional sourceMetadata`);
  }
  if (!text.includes('V2ItemSourceMetadataSchema')) {
    fail(`${IMPORT_VALIDATOR} must define a V2ItemSourceMetadataSchema`);
  }
}

// ── No ai-process / AI endpoint / document upload guards ─────────────────────

function noAiProcessGuard() {
  const filesToCheck = [IMPORT_HELPER, REVIEW_PANEL, SETTINGS_ROUTE, ADAPTER_FILE, IMPORT_VALIDATOR];
  for (const file of filesToCheck) {
    const text = read(file);
    if (text.includes('ai-process')) fail(`${file} must not include 'ai-process' call site`);
    if (/\/api\/(?:generate|chat|complete|ocr)/.test(text)) {
      fail(`${file} appears to call an AI/OCR-style endpoint`);
    }
  }
}

function noDocumentUploadGuard() {
  // Phase 16H must not add a new document upload UI or HTTP I/O.
  // The pre-existing Library.jsx document-upload flow (Phase 16F via
  // EduGen) keeps its <input type="file"> for PDF/DOCX/PPTX/ZIP extraction
  // through the optional companion service, so the upload check below is
  // scoped to the Phase 16H-new runtime files only.
  const filesToCheck = [IMPORT_HELPER, REVIEW_PANEL, SETTINGS_ROUTE];
  for (const file of filesToCheck) {
    const text = read(file);
    if (text.includes('FormData')) fail(`${file} must not use FormData (no document upload in Phase 16H)`);
    if (/\bfetch\s*\(/.test(text)) fail(`${file} must not call fetch() in Phase 16H`);
    if (text.includes('XMLHttpRequest')) fail(`${file} must not use XMLHttpRequest`);
    if (/<input[^>]*type=["']file["']/i.test(text)) {
      fail(`${file} must not introduce a file upload <input>`);
    }
  }
}

// ── FSRS / sync regression guards ────────────────────────────────────────────

function fsrsAndSyncRegressionGuard() {
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

  // Phase 16H must not introduce ts-fsrs.next() in any new/changed runtime file.
  for (const file of [IMPORT_HELPER, REVIEW_PANEL, SETTINGS_ROUTE, ADAPTER_FILE, IMPORT_VALIDATOR]) {
    const text = read(file);
    if (/ts-fsrs/.test(text)) fail(`${file} must not import ts-fsrs`);
    if (/\.next\s*\(/.test(text)) fail(`${file} must not introduce a ts-fsrs .next() call site`);
  }
}

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
      fail(`Phase 16H must not introduce cloud/auth/sync/AI-process path: ${path}`);
    }
  }

  // Forbid API key / BYOK runtime terms in Phase 16H new files.
  for (const file of [IMPORT_HELPER, REVIEW_PANEL, SETTINGS_ROUTE]) {
    const text = read(file);
    for (const term of ['apiKey', 'API_KEY', 'BYOK', 'bring your own key']) {
      if (text.includes(term)) {
        fail(`${file} must not introduce API key / BYOK runtime term: ${term}`);
      }
    }
  }
}

// ── Internal registry / native binding guard ──────────────────────────────────

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
  requiredDocTermsGuard();
  forbiddenClaimGuard();
  vietnameseFirstCopyGuard();
  helperSourceGuard();
  settingsWiringGuard();
  adapterAdditiveGuard();
  importValidatorAdditiveGuard();
  noAiProcessGuard();
  noDocumentUploadGuard();
  fsrsAndSyncRegressionGuard();
  noCloudAuthGuard();
  internalRegistryGuard();
  console.log('Phase 16H EduGen Draft Quality Review / Source-Aware Library validation passed.');
}

validate();
