#!/usr/bin/env node
/**
 * scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js
 *
 * Phase 16I static validator — Public README / Landing / Screenshots Polish
 * + Demo Quickstart Refresh.
 *
 * Confirms:
 *   • Phase 16I doc exists;
 *   • README was updated with Vietnamese-first user sections;
 *   • demo-quickstart.md and screenshot-capture-guide.md exist;
 *   • workflow registers Phase 16I validator after Phase 16H;
 *   • all previous validators through Phase 16H remain registered;
 *   • no package.json / package-lock.json changes;
 *   • no e2e changes;
 *   • no protected scheduler/storage/EduGen runtime files changed;
 *   • required public terms present in README/doc;
 *   • forbidden claim phrases absent from README/doc;
 *   • generated artifacts absent from tracked files;
 *   • changed files are within the Phase 16I allowlist.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase16i-public-readme-landing-screenshots-demo-refresh.md';
const DEMO_QUICKSTART  = 'docs/demo-quickstart.md';
const SCREENSHOT_GUIDE = 'docs/screenshot-capture-guide.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const README_FILE      = 'README.md';
const PUBLIC_NOTES     = 'docs/public-release-notes.md';
const DEPLOY_READY     = 'docs/deployment-readiness.md';

const PHASE16H_VALIDATOR = 'scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js';
const PHASE16G_VALIDATOR = 'scripts/validate-phase16g-edugen-draft-review-import-flow.js';
const PHASE16F_VALIDATOR = 'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js';
const PHASE16E_VALIDATOR = 'scripts/validate-phase16e-visual-polish-quick-wins.js';
const PHASE16D_VALIDATOR = 'scripts/validate-phase16d-shime-study-identity-product-principles.js';
const PHASE16C_VALIDATOR = 'scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js';
const PHASE16B_VALIDATOR = 'scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js';
const PHASE16A_VALIDATOR = 'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js';
const PHASE15H_VALIDATOR = 'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js';

// Exact set of allowed changed files for Phase 16I.
const phase16iAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  DEMO_QUICKSTART,
  SCREENSHOT_GUIDE,
  VALIDATOR_SCRIPT,
  README_FILE,
  PUBLIC_NOTES,
  DEPLOY_READY,
  // Phase 16J — Mobile UX / PWA Quick Wins (forward compatibility)
  'docs/phase16j-mobile-ux-pwa-quick-wins.md',
  'src/styles/global.css',
  'public/sw.js',
  // Phase 16K — Storage Quota & Backup-Before-Import Runtime Hardening (forward compatibility)
  'docs/phase16k-storage-quota-backup-before-import-hardening.md',
  'scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js',
  'src/utils/storageQuotaEstimate.js',
  'src/routes/Library.jsx',
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
]);

// Hard-forbidden scheduler/storage/EduGen runtime files. Phase 16I must not touch these.
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

// Required public terms that must be present in README or phase doc.
const requiredPublicTermsInReadme = [
  'Shime là gì',
  'Thử trong 5 phút',
  'Xưởng bản nháp EduGen',
  'local-first',
  'sao lưu',
  'khôi phục',
  'không tự gọi AI/OCR',
  'không đảm bảo nội dung',
  'Vietnamese-first'
];

// Required public terms that must appear somewhere in README or phase doc
// (checked across both files together).
const requiredPublicTermsAnyFile = [
  'ảnh demo',
  'screenshot'
];

// Forbidden positive-claim phrases in README and phase doc.
// All phrases use full positive-assertion forms so that negative-form mentions
// in claim guardrail sections ("does not claim: built-in AI quiz generation")
// are not incorrectly rejected.
const forbiddenClaimPhrases = [
  'shime has built-in ai',
  'shime provides built-in ai',
  'shime includes built-in ai',
  'shime ships built-in ai',
  'built-in ai generation is available',
  'built-in ai quiz generation is supported',
  'shime has built-in ocr',
  'built-in ocr is available',
  'ocr is built in',
  'ocr is supported by shime',
  'edugen is bundled with shime',
  'edugen is shipped with shime',
  'edugen comes bundled',
  'shime includes edugen',
  'shime ships with edugen',
  'cloud sync is available',
  'cloud sync is enabled',
  'sync is available in shime',
  'automatic sync is available',
  'e2ee is available',
  'end-to-end encryption is available',
  'e2ee is enabled',
  'fsrs is enabled for all users',
  'fsrs is live for all users',
  'fsrs public rollout is active',
  'questions are guaranteed correct',
  'answers are guaranteed correct',
  'mastery is guaranteed',
  'has production certification',
  'is production certified',
  'has security certification',
  'is security certified',
  'frontend alone processes pdf',
  'frontend-only processes pdf',
  'frontend hosting can convert pdf',
  'byok is supported',
  'api key is supported'
];

function fail(message) {
  console.error(`Phase 16I validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 16I validation warning: ${message}`);
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
  read(DEMO_QUICKSTART);
  read(SCREENSHOT_GUIDE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(README_FILE);
  read(PUBLIC_NOTES);
  read(DEPLOY_READY);
  read(PHASE16H_VALIDATOR);
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
  if (changed.has('package.json')) fail('package.json must not change in Phase 16I');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 16I');

  void pkg;
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase16iAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 16I`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 16I`);
    if (file.startsWith('e2e/')) {
      fail(`e2e/ file changed in Phase 16I: ${file}`);
    }
    // Historical validator updates are allowed (exact Phase 16I allowlist entries).
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    fail(`Unexpected changed file for Phase 16I scope: ${file}`);
  }
}

// ── Forbidden runtime files guard ─────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  const changed = new Set(changedFiles());
  for (const file of forbiddenRuntimeFiles) {
    if (changed.has(file)) {
      fail(`Phase 16I must not change scheduler/storage/EduGen runtime file: ${file}`);
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
    'node scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js'
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase16hPos = text.indexOf('node scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js');
  const phase16iPos = text.indexOf('node scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js');
  if (phase16hPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16H validator`);
  if (phase16iPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16I validator`);
  if (phase16iPos <= phase16hPos) {
    fail(`${WORKFLOW_FILE} must register Phase 16I validator after Phase 16H validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Required public terms in README ──────────────────────────────────────────

function requiredPublicTermsGuard() {
  const readme = read(README_FILE);
  const readmeLower = readme.toLowerCase();

  for (const term of requiredPublicTermsInReadme) {
    if (!readmeLower.includes(term.toLowerCase())) {
      fail(`${README_FILE} must include required public term: "${term}"`);
    }
  }

  // Terms that may appear in README or docs file
  const readmeDoc = readme + read(DOCS_FILE) + read(DEMO_QUICKSTART) + read(SCREENSHOT_GUIDE);
  const readmeDocLower = readmeDoc.toLowerCase();
  for (const term of requiredPublicTermsAnyFile) {
    if (!readmeDocLower.includes(term.toLowerCase())) {
      fail(`README/docs must include required public term: "${term}"`);
    }
  }
}

// ── Forbidden claim guard ─────────────────────────────────────────────────────

function forbiddenClaimGuard() {
  const targets = [README_FILE, DOCS_FILE, DEMO_QUICKSTART, SCREENSHOT_GUIDE, PUBLIC_NOTES, DEPLOY_READY];
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

// ── README structure guard ────────────────────────────────────────────────────

function readmeStructureGuard() {
  const readme = read(README_FILE);

  const requiredSections = [
    'Shime là gì',
    'Dành cho ai',
    'Thử trong 5 phút',
    'Tính năng chính',
    'Xưởng bản nháp EduGen',
    'Quyền riêng tư và local-first',
    'Trạng thái ghi nhớ thích ứng',
    'Cách chạy local',
    'Cách chụp ảnh demo',
    'Giới hạn hiện tại'
  ];

  for (const section of requiredSections) {
    if (!readme.includes(section)) {
      fail(`${README_FILE} must include section: "${section}"`);
    }
  }

  // Developer content must come after user-facing intro.
  const shimeLaGiPos = readme.indexOf('Shime là gì');
  const quickStartPos = readme.indexOf('## Quick start');
  if (shimeLaGiPos !== -1 && quickStartPos !== -1 && shimeLaGiPos > quickStartPos) {
    fail(`${README_FILE}: "Shime là gì" section must appear before developer "Quick start" section`);
  }
}

// ── Demo quickstart guard ─────────────────────────────────────────────────────

function demoQuickstartGuard() {
  const doc = read(DEMO_QUICKSTART);
  const docLower = doc.toLowerCase();
  const requiredTerms = [
    'Dùng quiz mẫu',
    'Thư viện',
    'Phòng học',
    'sao lưu',
    'khôi phục',
    'không tự gọi AI',
    'không đảm bảo nội dung'
  ];
  for (const term of requiredTerms) {
    if (!docLower.includes(term.toLowerCase())) {
      fail(`${DEMO_QUICKSTART} must include required term: "${term}"`);
    }
  }
}

// ── Screenshot guide guard ────────────────────────────────────────────────────

function screenshotGuideGuard() {
  const doc = read(SCREENSHOT_GUIDE);
  const requiredTerms = [
    '1280',
    '390',
    'Thư viện',
    'Dashboard',
    'Phòng học',
    'EduGen',
    'demo'
  ];
  for (const term of requiredTerms) {
    if (!doc.includes(term)) {
      fail(`${SCREENSHOT_GUIDE} must include required term: "${term}"`);
    }
  }
  // Must not claim screenshots exist
  if (doc.toLowerCase().includes('ảnh đã được tạo') || doc.toLowerCase().includes('screenshots are included')) {
    fail(`${SCREENSHOT_GUIDE} must not claim screenshot binary assets are included`);
  }
}

// ── Phase 16I doc guard ───────────────────────────────────────────────────────

function phase16iDocGuard() {
  const doc = read(DOCS_FILE);
  const requiredTerms = [
    'Phase 16I',
    'No runtime feature expansion',
    'No EduGen runtime change',
    'No scheduler/FSRS',
    'Claim guardrails',
    'không tự gọi AI/OCR',
    'không đảm bảo nội dung'
  ];
  for (const term of requiredTerms) {
    if (!doc.includes(term)) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
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
      fail(`Phase 16I must not introduce cloud/auth/sync/AI-process path: ${path}`);
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
  requiredPublicTermsGuard();
  forbiddenClaimGuard();
  readmeStructureGuard();
  demoQuickstartGuard();
  screenshotGuideGuard();
  phase16iDocGuard();
  fsrsRegressionGuard();
  noCloudAuthGuard();
  internalRegistryGuard();
  console.log('Phase 16I Public README / Landing / Screenshots Polish + Demo Quickstart Refresh validation passed.');
}

validate();
