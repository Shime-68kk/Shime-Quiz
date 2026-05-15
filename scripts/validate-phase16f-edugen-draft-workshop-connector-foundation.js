#!/usr/bin/env node
/**
 * scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js
 *
 * Phase 16F static validator — EduGen Draft Workshop Connector Foundation.
 *
 * Confirms:
 *   • doc, test, connector, panel, validator exist;
 *   • workflow registers Phase 16F validator after Phase 16E;
 *   • all previous validators through Phase 16E remain registered;
 *   • no package.json / package-lock.json changes;
 *   • no e2e/ changes;
 *   • no scheduler/storage/backup files changed:
 *       src/quiz/reviewSchedulerAdapter.js,
 *       src/quiz/fsrsWrapper.js,
 *       src/state/reviewScheduleStorage.js,
 *       src/quiz/dataBackup.js,
 *       src/state/v2BackupRestore.js;
 *   • no new IndexedDB / StorageAdapter / SyncAdapter / event-log impl;
 *   • no dependency changes;
 *   • Vietnamese-first / Draft Workshop / no-built-in-AI / no-OCR copy is
 *     present in the doc;
 *   • forbidden claim phrases are absent in doc, panel, Home, and connector;
 *   • no `ai-process` runtime call site;
 *   • no new `ts-fsrs.next()` call sites;
 *   • no API key / BYOK / sync / account / auth implementation;
 *   • generated artifacts absent from tracked files;
 *   • changed files are within the Phase 16F allowlist.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase16f-edugen-draft-workshop-connector-foundation.md';
const TEST_FILE        = 'tests/unit/edugenDraftWorkshopConnector.test.js';
const VALIDATOR_SCRIPT = 'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const CONNECTOR_FILE   = 'src/edugen/edugenConnector.js';
const PANEL_FILE       = 'src/components/settings/EduGenDraftWorkshopPanel.jsx';
const SETTINGS_ROUTE   = 'src/routes/Settings.jsx';
const SETTINGS_STORAGE = 'src/state/settingsStorage.js';
const HOME_ROUTE       = 'src/routes/Home.jsx';
const GLOBAL_CSS       = 'src/styles/global.css';

const PHASE16E_VALIDATOR = 'scripts/validate-phase16e-visual-polish-quick-wins.js';
const PHASE16D_VALIDATOR = 'scripts/validate-phase16d-shime-study-identity-product-principles.js';
const PHASE16C_VALIDATOR = 'scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js';
const PHASE16B_VALIDATOR = 'scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js';
const PHASE16A_VALIDATOR = 'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js';
const PHASE15H_VALIDATOR = 'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js';

// Exact set of allowed changed files for Phase 16F.
// Phase 16F is a connector foundation runtime phase: it touches a small,
// bounded set of UI/runtime files plus docs, tests, validator, and CI.
// Historical validators may be updated with exact Phase 16F allowlist
// entries; that's checked separately by the scopeGuard's validator-script
// passthrough rule (any scripts/validate-*.js change is permitted).
const phase16fAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  TEST_FILE,
  VALIDATOR_SCRIPT,
  CONNECTOR_FILE,
  PANEL_FILE,
  SETTINGS_ROUTE,
  SETTINGS_STORAGE,
  HOME_ROUTE,
  GLOBAL_CSS,
]);

// Hard-forbidden scheduler/storage/backup files. Phase 16F must not touch
// these even if a future implementation needs to wire up source metadata.
const forbiddenRuntimeFiles = [
  'src/quiz/reviewSchedulerAdapter.js',
  'src/quiz/fsrsWrapper.js',
  'src/state/reviewScheduleStorage.js',
  'src/quiz/dataBackup.js',
  'src/state/v2BackupRestore.js',
];

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied',
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
  '.git',
];

const requiredDocTerms = [
  'Draft Workshop',
  'Xưởng bản nháp',
  'optional companion',
  'not bundled',
  'review required',
  'no built-in AI',
  'no OCR',
  'no cloud sync',
  'local-first',
  'no automatic FSRS activation',
  'service URL',
  'health check',
];

// Phrases below are positive assertions that must never appear in Shime
// surfaces (doc/panel/home/connector). Docs may legitimately discuss the
// underlying categories in negative form (e.g. "no built-in OCR"); only
// the positive claim form is forbidden.
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
  'byok is supported',
];

function fail(message) {
  console.error(`Phase 16F validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 16F validation warning: ${message}`);
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
    ...splitLines(runGit('git diff --cached --name-only', { silent: true })),
  ];
  if (includeUntracked) files.push(...splitLines(runGit('git ls-files --others --exclude-standard', { silent: true })));
  return files;
}

function changedFiles({ includeUntracked = true } = {}) {
  const prBaseFiles = changedFilesFromPullRequestBase();
  if (prBaseFiles.length > 0) return uniqueSorted(prBaseFiles);
  return uniqueSorted([
    ...changedFilesFromBranchBase(),
    ...changedFilesFromLocalFallbacks({ includeUntracked }),
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
  read(CONNECTOR_FILE);
  read(PANEL_FILE);
  read(SETTINGS_ROUTE);
  read(SETTINGS_STORAGE);
  read(HOME_ROUTE);
  read(GLOBAL_CSS);
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
  if (changed.has('package.json')) fail('package.json must not change in Phase 16F');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 16F');

  void pkg;
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase16fAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 16F`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 16F`);
    if (file.startsWith('e2e/')) {
      fail(`e2e/ file changed in Phase 16F: ${file}`);
    }
    // Historical validator updates are allowed (exact Phase 16F allowlist entries).
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    fail(`Unexpected changed file for Phase 16F scope: ${file}`);
  }
}

// ── Forbidden runtime files guard ─────────────────────────────────────────────

function forbiddenRuntimeFilesGuard() {
  const changed = new Set(changedFiles());
  for (const file of forbiddenRuntimeFiles) {
    if (changed.has(file)) {
      fail(`Phase 16F must not change scheduler/storage/backup file: ${file}`);
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
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase16ePos = text.indexOf('node scripts/validate-phase16e-visual-polish-quick-wins.js');
  const phase16fPos = text.indexOf('node scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js');
  if (phase16ePos === -1) fail(`${WORKFLOW_FILE} must register Phase 16E validator`);
  if (phase16fPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16F validator`);
  if (phase16fPos <= phase16ePos) {
    fail(`${WORKFLOW_FILE} must register Phase 16F validator after Phase 16E validator`);
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
  const targets = [
    DOCS_FILE,
    PANEL_FILE,
    HOME_ROUTE,
    CONNECTOR_FILE,
    SETTINGS_ROUTE,
  ];
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

// ── Vietnamese-first / Draft Workshop copy guard ──────────────────────────────

function vietnameseFirstCopyGuard() {
  const panel = read(PANEL_FILE);
  const requiredPanelStrings = [
    'Xưởng bản nháp EduGen',
    'URL dịch vụ EduGen',
    'Tùy chọn',
    'Shime không tự xử lý PDF/DOCX nếu không có dịch vụ EduGen đang chạy.',
    'Kết quả chỉ là bản nháp, bạn cần xem lại trước khi học.',
    'Kiểm tra kết nối',
  ];
  for (const phrase of requiredPanelStrings) {
    if (!panel.includes(phrase)) {
      fail(`${PANEL_FILE} must include claim-safe Vietnamese-first phrase: "${phrase}"`);
    }
  }

  const home = read(HOME_ROUTE);
  if (!home.includes('Xưởng bản nháp')) fail(`${HOME_ROUTE} must include "Xưởng bản nháp" framing`);
  if (!home.includes('không được bundle')) fail(`${HOME_ROUTE} must keep "không được bundle" disclaimer`);
}

// ── No ai-process / AI endpoint call sites ───────────────────────────────────

function noAiProcessGuard() {
  const filesToCheck = [
    CONNECTOR_FILE,
    PANEL_FILE,
    SETTINGS_ROUTE,
    HOME_ROUTE,
    SETTINGS_STORAGE,
  ];
  for (const file of filesToCheck) {
    const text = read(file);
    if (text.includes('ai-process')) fail(`${file} must not include 'ai-process' call site`);
    if (/\/api\/(?:generate|chat|complete|ocr)/.test(text)) {
      fail(`${file} appears to call an AI/OCR-style endpoint`);
    }
  }
}

// ── No new ts-fsrs.next() call sites or auth/sync paths ──────────────────────

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
}

function noCloudAuthGuard() {
  const forbiddenPaths = [
    'src/auth',
    'src/cloud',
    'src/backend',
    'src/api/sync',
    'src/sync',
    'src/storage/SyncAdapter.js',
    'src/storage/StorageAdapter.js',
    'src/storage/IndexedDBAdapter.js',
    'src/edugen/aiProcessClient.js',
  ];
  for (const path of forbiddenPaths) {
    if (fs.existsSync(path)) {
      fail(`Phase 16F must not introduce cloud/auth/sync/AI-process path: ${path}`);
    }
  }

  // Forbid API key / BYOK runtime terms in Phase 16F files.
  for (const file of [PANEL_FILE, CONNECTOR_FILE, SETTINGS_STORAGE]) {
    const text = read(file);
    for (const term of ['apiKey', 'API_KEY', 'BYOK', 'bring your own key']) {
      if (text.includes(term)) {
        fail(`${file} must not introduce API key / BYOK runtime term: ${term}`);
      }
    }
  }
}

// ── settingsStorage edugenServiceUrl integrity ────────────────────────────────

function settingsStorageIntegrityGuard() {
  const source = read(SETTINGS_STORAGE);
  if (!source.includes("'shimeV2SettingsV1'")) {
    fail(`${SETTINGS_STORAGE} must preserve SETTINGS_STORAGE_KEY = 'shimeV2SettingsV1'`);
  }
  if (!source.includes('edugenServiceUrl')) {
    fail(`${SETTINGS_STORAGE} must declare edugenServiceUrl field`);
  }
  // The new field must default to empty string, not a hard-coded host.
  if (!source.includes("EDUGEN_SERVICE_URL_DEFAULT = ''")) {
    fail(`${SETTINGS_STORAGE} must define EDUGEN_SERVICE_URL_DEFAULT as empty string`);
  }
  // Lazy read invariant: getSettings must remain lazy. The structural marker
  // is the "LAZY READ" comment plus the no-setItem-on-missing-key branch.
  if (!source.includes('LAZY READ')) {
    fail(`${SETTINGS_STORAGE} must preserve LAZY READ invariant comment`);
  }
}

// ── Connector source guard ────────────────────────────────────────────────────

function connectorSourceGuard() {
  const text = read(CONNECTOR_FILE);
  const required = [
    'normalizeEdugenServiceUrl',
    'buildEdugenHealthUrl',
    'checkEdugenHealth',
    'EDUGEN_HEALTH_STATUS',
    '/health',
  ];
  for (const symbol of required) {
    if (!text.includes(symbol)) fail(`${CONNECTOR_FILE} must export/define ${symbol}`);
  }
  if (!text.includes('NEVER uploads documents')) {
    fail(`${CONNECTOR_FILE} must include the "NEVER uploads documents" runtime contract comment`);
  }
  if (!text.includes('NEVER calls an AI endpoint')) {
    fail(`${CONNECTOR_FILE} must include the "NEVER calls an AI endpoint" runtime contract comment`);
  }
  if (/\.next\s*\(/.test(text)) {
    fail(`${CONNECTOR_FILE} must not introduce a ts-fsrs .next() call site`);
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
  noAiProcessGuard();
  fsrsAndSyncRegressionGuard();
  noCloudAuthGuard();
  settingsStorageIntegrityGuard();
  connectorSourceGuard();
  internalRegistryGuard();
  console.log('Phase 16F EduGen Draft Workshop Connector Foundation validation passed.');
}

validate();
