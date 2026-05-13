#!/usr/bin/env node
/**
 * scripts/validate-phase14f-hf1-baseline-validation-recovery.js
 *
 * Phase 14F-HF1 static validator — baseline build/test/validator recovery.
 * Modeled after validate-phase14f-toggle-plan.js.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE = 'docs/phase14f-hf1-baseline-validation-recovery.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase14f-hf1-baseline-validation-recovery.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const HARDENING_VALIDATOR = 'scripts/validate-v2-release-hardening.js';

const PHASE14F_DOCS = 'docs/phase14f-fsrs-experimental-toggle-plan.md';
const PHASE14F_VALIDATOR = 'scripts/validate-phase14f-toggle-plan.js';

const STUDY_ROOM = 'src/routes/StudyRoom.jsx';
const DASHBOARD = 'src/routes/Dashboard.jsx';
const ADAPTER_SOURCE = 'src/quiz/reviewSchedulerAdapter.js';
const WRAPPER_SOURCE = 'src/quiz/fsrsWrapper.js';
const STORAGE_SOURCE = 'src/state/reviewScheduleStorage.js';

const hf1AllowedChangedFiles = new Set([
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  WORKFLOW_FILE,
  'package.json',
  'package-lock.json',
  HARDENING_VALIDATOR,
  // Historical validator compatibility — exact files only
  'scripts/validate-backup-transfer-safety-hardening.js',
  'scripts/validate-cross-device-export-import.js',
  'scripts/validate-cross-device-transfer-track-closure.js',
  'scripts/validate-cross-device-transfer-ux-copy.js',
  'scripts/validate-cross-device-transfer-ux-decision.js',
  'scripts/validate-dashboard-today-card-runtime.js',
  'scripts/validate-dashboard-today-card-ux-plan.js',
  'scripts/validate-edugen-boundary-polish.js',
  'scripts/validate-final-main-release-authorization.js',
  'scripts/validate-final-public-release-readiness-reaudit.js',
  'scripts/validate-final-release-execution-checklist.js',
  'scripts/validate-github-release-publication-plan.js',
  'scripts/validate-manual-evidence-execution-checklist.js',
  'scripts/validate-manual-evidence-results-log.js',
  'scripts/validate-manual-evidence-run-pack.js',
  'scripts/validate-phase12-closure-release-decision.js',
  'scripts/validate-phase12-roadmap-risk-register.js',
  'scripts/validate-phase13-closure.js',
  'scripts/validate-phase13-fsrs-plan.js',
  'scripts/validate-phase13-local-adaptive-roadmap.js',
  'scripts/validate-phase13-review-engine-audit.js',
  'scripts/validate-phase14a-scheduler-adapter.js',
  'scripts/validate-phase14b-fsrs-wrapper.js',
  'scripts/validate-phase14c-fsrs-persistence-harness.js',
  'scripts/validate-phase14d-fsrs-adapter-routing.js',
  'scripts/validate-phase14e-fsrs-user-facing-entry.js',
  'scripts/validate-phase14f-toggle-plan.js',
  'scripts/validate-release-candidate-freeze-final-decision.js',
  'scripts/validate-release-candidate-tag-publish-gate.js',
  'scripts/validate-release-package-assembly-plan.js',
  'scripts/validate-release-tag-creation-plan.js',
  'scripts/validate-storage-capacity-indexeddb-migration-plan.js',
  'scripts/validate-storage-quota-warning-runtime.js',
  'scripts/validate-study-flow-micro-feedback-plan.js',
  'scripts/validate-study-flow-micro-feedback-runtime.js',
  'scripts/validate-unit-test-foundation-plan.js',
  'scripts/validate-vitest-unit-test-foundation.js',
  'scripts/validate-web-share-mobile-sharing-prototype-plan.js',
  'scripts/validate-web-share-runtime-fallback-hardening.js',
  'scripts/validate-web-share-runtime-prototype.js',
  // Phase 14G compatibility — exact files only
  'docs/phase14g-fsrs-settings-storage-schema.md',
  'scripts/validate-phase14g-settings-storage.js',
  'src/state/settingsStorage.js',
  'src/state/localStorageSync.js',
  'src/state/v2BackupRestore.js',
  'tests/unit/settingsStorage.test.js',
  'tests/unit/backupSettingsPersistence.test.js',
  // Phase 14H compatibility — exact files only
  'docs/phase14h-fsrs-experimental-toggle-ui.md',
  'scripts/validate-phase14h-fsrs-toggle-ui.js',
  'src/routes/Settings.jsx',
  'src/routes/routeConfig.js',
  'src/components/settings/FsrsExperimentalSettingsPanel.jsx',
  'tests/unit/fsrsExperimentalSettingsPanel.test.jsx',
]);

const generatedArtifacts = [
  'node_modules', 'dist', 'test-results', 'playwright-report',
  'coverage', 'FETCH_HEAD', '.env', '.env.local', '.git'
];

function fail(message) {
  console.error(`Phase 14F-HF1 baseline validation recovery failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 14F-HF1 baseline validation recovery warning: ${message}`);
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

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[`*_()[\]{}:;,.!?"']/g, ' ')
    .replace(/[\/\\]+/g, ' ')
    .replace(/[‐-―]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function runGit(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
  } catch {
    if (!options.silent) warn(`Git command failed: ${command}`);
    return '';
  }
}

function splitLines(output) {
  return output ? output.split(/\r?\n/).map(l => l.trim()).filter(Boolean) : [];
}

function uniqueSorted(files) {
  return [...new Set(files)].sort((a, b) => a.localeCompare(b));
}

function changedFilesFromPrBase() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (!baseRef) return [];
  runGit(`git fetch --no-tags --depth=1 origin ${baseRef}`, { silent: true });
  const mergeBase = runGit(`git merge-base HEAD origin/${baseRef}`, { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesFromBranchBase() {
  const originMain = runGit('git rev-parse --verify origin/main', { silent: true });
  if (!originMain) return [];
  const mergeBase = runGit('git merge-base HEAD origin/main', { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesLocal({ includeUntracked = true } = {}) {
  const files = [
    ...splitLines(runGit('git diff --name-only HEAD', { silent: true })),
    ...splitLines(runGit('git diff --cached --name-only', { silent: true }))
  ];
  if (includeUntracked) files.push(...splitLines(runGit('git ls-files --others --exclude-standard', { silent: true })));
  return files;
}

function changedFiles({ includeUntracked = true } = {}) {
  const prFiles = changedFilesFromPrBase();
  if (prFiles.length > 0) return uniqueSorted(prFiles);
  return uniqueSorted([...changedFilesFromBranchBase(), ...changedFilesLocal({ includeUntracked })]);
}

function trackedFiles() {
  return uniqueSorted(splitLines(runGit('git ls-files', { silent: true })));
}

function requireIncludes(file, terms) {
  const text = normalize(read(file));
  for (const term of terms) {
    if (!text.includes(normalize(term))) fail(`${file} must mention: ${term}`);
  }
}

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(HARDENING_VALIDATOR);
  read('package.json');
  read('package-lock.json');
}

function phase14fRegressionGuard() {
  read(PHASE14F_DOCS);
  read(PHASE14F_VALIDATOR);
}

function packageGuard() {
  const pkg = readJson('package.json');
  readJson('package-lock.json');

  if (pkg.dependencies?.['ts-fsrs'] !== '5.3.3') {
    fail(`ts-fsrs must remain exact-pinned at 5.3.3, got ${pkg.dependencies?.['ts-fsrs'] || 'none'}`);
  }

  const vite = pkg.dependencies?.vite || '';
  if (vite === 'latest' || vite === '*') {
    fail(`package.json vite must not be "latest" or "*" — pin to a stable version, got: ${vite}`);
  }
  if (!vite.includes('7')) {
    fail(`package.json vite must be pinned to a 7.x version, got: ${vite}`);
  }

  const pluginReact = pkg.dependencies?.['@vitejs/plugin-react'] || '';
  if (pluginReact === 'latest' || pluginReact === '*') {
    fail(`package.json @vitejs/plugin-react must not be "latest" or "*", got: ${pluginReact}`);
  }
  if (!pluginReact.includes('5')) {
    fail(`package.json @vitejs/plugin-react must be pinned to a 5.x version, got: ${pluginReact}`);
  }

  const bindingPackage = '@open-spaced-repetition/' + 'binding';
  const internalRegistryTerms = ['applied-caas', 'artifactory', 'internal.api.openai', 'packages.applied'];
  for (const file of ['package.json', 'package-lock.json']) {
    const text = read(file);
    if (text.includes(bindingPackage)) fail(`${file} must not contain native binding dependency`);
    if (text.includes('rolldown') && !text.includes('vite')) {
      fail(`${file} must not add rolldown as a direct dependency`);
    }
    for (const term of internalRegistryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const requiredValidators = [
    'node scripts/validate-phase14b-fsrs-wrapper.js',
    'node scripts/validate-phase14c-fsrs-persistence-harness.js',
    'node scripts/validate-phase14d-fsrs-adapter-routing.js',
    'node scripts/validate-phase14e-fsrs-user-facing-entry.js',
    'node scripts/validate-phase14f-toggle-plan.js',
    'node scripts/validate-phase14f-hf1-baseline-validation-recovery.js'
  ];
  for (const v of requiredValidators) {
    if (!text.includes(v)) fail(`${WORKFLOW_FILE} must run: ${v}`);
  }
  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(a => file === a || file.startsWith(`${a}/`))) continue;
    if (hf1AllowedChangedFiles.has(file)) continue;
    if (file === STUDY_ROOM) fail(`StudyRoom.jsx must not change in Phase 14F-HF1`);
    if (file === DASHBOARD) fail(`Dashboard.jsx must not change in Phase 14F-HF1`);
    if (file === ADAPTER_SOURCE) fail(`reviewSchedulerAdapter.js must not change in Phase 14F-HF1`);
    if (file === WRAPPER_SOURCE) fail(`fsrsWrapper.js must not change in Phase 14F-HF1`);
    if (file === STORAGE_SOURCE) fail(`reviewScheduleStorage.js must not change in Phase 14F-HF1`);
    if (file.startsWith('src/routes/')) fail(`UI route file changed in Phase 14F-HF1: ${file}`);
    if (file.startsWith('src/')) fail(`Source file changed in Phase 14F-HF1 outside allowed scope: ${file}`);
    if (file.startsWith('tests/')) fail(`Test file changed in Phase 14F-HF1 outside allowed scope: ${file}`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 14F-HF1: ${file}`);
    warn(`Unexpected changed file in Phase 14F-HF1 scope: ${file}`);
  }
}

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(f => f === artifact || f.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in tracked/changed files: ${artifact}`);
    }
  }
}

function customEventGuard() {
  const source = read(HARDENING_VALIDATOR);
  if (!source.includes('globalThis.CustomEvent')) {
    fail(`${HARDENING_VALIDATOR} must add globalThis.CustomEvent polyfill`);
  }
  if (!source.includes("typeof CustomEvent === 'undefined'")) {
    fail(`${HARDENING_VALIDATOR} must guard CustomEvent polyfill with typeof check`);
  }
}

function vitePinGuard() {
  const pkg = readJson('package.json');
  const vite = pkg.dependencies?.vite || '';
  if (!vite || vite === 'latest' || vite === '*') {
    fail(`vite must be pinned, not "${vite}"`);
  }
  const pluginReact = pkg.dependencies?.['@vitejs/plugin-react'] || '';
  if (!pluginReact || pluginReact === 'latest' || pluginReact === '*') {
    fail(`@vitejs/plugin-react must be pinned, not "${pluginReact}"`);
  }
}

function runtimeIsolationGuard() {
  const runtimeFiles = [STUDY_ROOM, DASHBOARD, ADAPTER_SOURCE, WRAPPER_SOURCE, STORAGE_SOURCE];
  for (const file of runtimeFiles) {
    if (!fs.existsSync(file)) fail(`Required runtime file missing: ${file}`);
  }
  const combined = runtimeFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
  if (/phase14f-hf1|phase-14f-hf1/i.test(combined)) {
    fail('Runtime files must not contain Phase 14F-HF1 markers');
  }
  if (/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/i.test(combined)) {
    fail('Study Room and Dashboard must not add four-rating FSRS UI copy');
  }
}

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 14F-HF1',
    'baseline',
    'pre-existing',
    'build failure',
    'validator failure',
    'vite',
    '7.3.3',
    'rolldown',
    'plugin API',
    'ts-fsrs',
    '5.3.3',
    'CustomEvent',
    'globalThis',
    'Node.js 18',
    'validate-v2-release-hardening',
    'does not change Study Room',
    'does not change Dashboard',
    'does not change reviewSchedulerAdapter',
    'does not add user-facing FSRS',
    'no new-card enrollment',
    'scope: package.json',
    'scope: validate-v2-release-hardening.js'
  ]);
}

function validate() {
  requiredFilesGuard();
  phase14fRegressionGuard();
  packageGuard();
  workflowGuard();
  scopeGuard();
  generatedArtifactGuard();
  customEventGuard();
  vitePinGuard();
  runtimeIsolationGuard();
  docsGuard();
  console.log('Phase 14F-HF1 baseline validation recovery passed.');
}

validate();
