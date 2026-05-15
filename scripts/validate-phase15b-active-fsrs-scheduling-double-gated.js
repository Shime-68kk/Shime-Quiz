#!/usr/bin/env node
/**
 * scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js
 *
 * Phase 15B static validator — Active FSRS Scheduling: Double-Gated, Default OFF, No Dashboard.
 * Validates source contracts, double-gate implementation, protected files, and Phase 15A regressions.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE = 'docs/phase15b-active-fsrs-scheduling-double-gated.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const TEST_FILE = 'tests/unit/fsrsActiveSchedulingDoubleGated.test.js';

const ADAPTER_SOURCE = 'src/quiz/reviewSchedulerAdapter.js';
const STORAGE_SOURCE = 'src/state/reviewScheduleStorage.js';
const WRAPPER_SOURCE = 'src/quiz/fsrsWrapper.js';
const SETTINGS_STORAGE_SOURCE = 'src/state/settingsStorage.js';
const STUDY_ROOM = 'src/routes/StudyRoom.jsx';
const DASHBOARD = 'src/routes/Dashboard.jsx';
const BRIDGE_COMPONENT = 'src/components/study/FsrsProductionMemoryRatingBridge.jsx';
const LEGACY_BACKUP = 'src/quiz/dataBackup.js';
const V2_BACKUP_RESTORE = 'src/state/v2BackupRestore.js';

// Phase 15A regression
const PHASE15A_DOCS = 'docs/phase15a-fsrs-active-scheduling-architecture.md';
const PHASE15A_VALIDATOR = 'scripts/validate-phase15a-fsrs-active-scheduling-architecture.js';
const PHASE14N_BRIDGE_COMPONENT = 'src/components/study/FsrsProductionMemoryRatingBridge.jsx';
const PHASE14N_TEST = 'tests/unit/fsrsProductionStudyRoomTwoStepBridge.test.jsx';

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied'
];

// Phase 15B allowed changed files — all files that are new or modified in Phase 15B.
const phase15bAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  TEST_FILE,
  ADAPTER_SOURCE,
  STORAGE_SOURCE,
  WRAPPER_SOURCE,
  SETTINGS_STORAGE_SOURCE,
  'tests/unit/fsrsEnrollmentReadinessHarness.test.js',
  'tests/unit/fsrsExperimentalSettingsPanel.test.jsx',
  'tests/unit/fsrsPersistenceHarness.test.js',
  'tests/unit/fsrsProductionEnrollmentWiring.test.js',
  'tests/unit/fsrsWrapper.test.js',
  'tests/unit/reviewSchedulerAdapter.phase14d.test.js',
  'tests/unit/reviewSchedulerAdapter.test.js',
  'tests/unit/settingsStorage.test.js',
  // Historical validators updated with Phase 15B forward-compatibility allowlist entries
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
  'scripts/validate-phase14f-hf1-baseline-validation-recovery.js',
  'scripts/validate-phase14f-toggle-plan.js',
  'scripts/validate-phase14g-settings-storage.js',
  'scripts/validate-phase14h-fsrs-toggle-ui.js',
  'scripts/validate-phase14i-fsrs-two-step-fixture.js',
  'scripts/validate-phase14j-fsrs-enrollment-readiness.js',
  'scripts/validate-phase14k-fsrs-readiness-audit.js',
  'scripts/validate-phase14l-production-enrollment-wiring.js',
  'scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js',
  'scripts/validate-phase14n-production-studyroom-two-step-bridge.js',
  'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js',
  'scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js',
  'scripts/validate-phase15a-fsrs-active-scheduling-architecture.js',
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
]);

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

function fail(message) {
  console.error(`Phase 15B validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 15B validation warning: ${message}`);
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
    if (!options.silent) warn(`Git command failed; changed-file scope checking may be limited: ${command}`);
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
  const originMain = runGit('git rev-parse --verify origin/main', { silent: true });
  if (!originMain) return [];
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

function requireIncludes(file, terms) {
  const text = normalize(read(file));
  for (const term of terms) {
    if (!text.includes(normalize(term))) fail(`${file} must mention: ${term}`);
  }
}

// ── Required files guard ──────────────────────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(TEST_FILE);
  read(ADAPTER_SOURCE);
  read(STORAGE_SOURCE);
  read(WRAPPER_SOURCE);
  read(SETTINGS_STORAGE_SOURCE);
  read(STUDY_ROOM);
  read(DASHBOARD);
  read(BRIDGE_COMPONENT);
  read(LEGACY_BACKUP);
  read(V2_BACKUP_RESTORE);
  // Phase 15A regression
  read(PHASE15A_DOCS);
  read(PHASE15A_VALIDATOR);
  read(PHASE14N_BRIDGE_COMPONENT);
  read(PHASE14N_TEST);
}

// ── Package guard ─────────────────────────────────────────────────────────────

function packageGuard() {
  const pkg = readJson('package.json');
  readJson('package-lock.json');
  const dependencyVersion = pkg.dependencies?.['ts-fsrs'];
  if (dependencyVersion !== '5.3.3') {
    fail(`ts-fsrs must remain exact-pinned at 5.3.3, got ${dependencyVersion || 'none'}`);
  }
  for (const file of ['package.json', 'package-lock.json']) {
    const text = read(file);
    if (text.includes(bindingPackage)) fail(`${file} must not contain native binding dependency`);
    for (const term of internalRegistryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }
}

// ── Workflow guard ────────────────────────────────────────────────────────────

function workflowGuard() {
  const text = read(WORKFLOW_FILE);

  const requiredValidators = [
    'node scripts/validate-phase14n-production-studyroom-two-step-bridge.js',
    'node scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js',
    'node scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js',
    'node scripts/validate-phase15a-fsrs-active-scheduling-architecture.js',
    'node scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js',
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  // Phase 15B must be registered after Phase 15A
  const phase15aPos = text.indexOf('node scripts/validate-phase15a-fsrs-active-scheduling-architecture.js');
  const phase15bPos = text.indexOf('node scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js');
  if (phase15aPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15A validator`);
  if (phase15bPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15B validator`);
  if (phase15bPos <= phase15aPos) {
    fail(`${WORKFLOW_FILE} must register Phase 15B validator after Phase 15A validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (phase15bAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 15B`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 15B`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15B: ${file}`);
    fail(`Unexpected changed file for Phase 15B scope: ${file}`);
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

// ── Forbidden scope guard ─────────────────────────────────────────────────────

function forbiddenScopeGuard() {
  const changed = new Set(changedFiles());
  const forbidden = [
    DASHBOARD,
    STUDY_ROOM,
    BRIDGE_COMPONENT,
    LEGACY_BACKUP,
    V2_BACKUP_RESTORE,
    'package.json',
    'package-lock.json'
  ];
  for (const file of forbidden) {
    if (changed.has(file)) fail(`Forbidden file changed in Phase 15B: ${file}`);
  }
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15B: ${file}`);
  }
}

// ── Source contracts guard ─────────────────────────────────────────────────────

function sourceContractsGuard() {
  const adapterSource = read(ADAPTER_SOURCE);
  const storageSource = read(STORAGE_SOURCE);
  const wrapperSource = read(WRAPPER_SOURCE);
  const settingsSource = read(SETTINGS_STORAGE_SOURCE);

  // Double gate contract in adapter
  if (!adapterSource.includes('fsrsExperimentalEnabled')) {
    fail(`${ADAPTER_SOURCE} must reference fsrsExperimentalEnabled for double gate`);
  }
  if (!adapterSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${ADAPTER_SOURCE} must reference fsrsActiveSchedulingEnabled for double gate`);
  }
  if (!adapterSource.includes('export function scheduleActiveFsrsOrFallback')) {
    fail(`${ADAPTER_SOURCE} must export scheduleActiveFsrsOrFallback`);
  }
  if (!adapterSource.includes('export function scheduleCurrentReviewPreservingFsrs')) {
    fail(`${ADAPTER_SOURCE} must export scheduleCurrentReviewPreservingFsrs`);
  }
  if (!adapterSource.includes('export function resolveActiveSchedulingRating')) {
    fail(`${ADAPTER_SOURCE} must export resolveActiveSchedulingRating`);
  }
  if (!adapterSource.includes("'fsrs-active'")) {
    fail(`${ADAPTER_SOURCE} must add 'fsrs-active' to FSRS_KIND_ALIASES`);
  }

  // Adapter must NOT call .next() directly — only via fsrsWrapper
  if (/\.next\s*\(/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not call .next() directly — delegate to scheduleFsrsReview in fsrsWrapper`);
  }

  // Storage must preserve Phase 14N helpers
  if (!storageSource.includes('export function appendFsrsReviewLog')) {
    fail(`${STORAGE_SOURCE} must preserve appendFsrsReviewLog export (Phase 14N regression)`);
  }
  if (!storageSource.includes('export function resolveMemoryRatingFromLogs')) {
    fail(`${STORAGE_SOURCE} must export resolveMemoryRatingFromLogs (Phase 15B)`);
  }

  // Storage must not call .next() directly
  if (/\.next\s*\(/.test(storageSource)) {
    fail(`${STORAGE_SOURCE} must not call .next() directly`);
  }

  // fsrsWrapper must export the production scheduler
  if (!wrapperSource.includes('export function scheduleFsrsReview')) {
    fail(`${WRAPPER_SOURCE} must export scheduleFsrsReview — the only production ts-fsrs.next() call site`);
  }
  if (!wrapperSource.includes('export function toRawFsrsCardFromPayload')) {
    fail(`${WRAPPER_SOURCE} must export toRawFsrsCardFromPayload`);
  }
  if (!wrapperSource.includes("export const FSRS_ACTIVE_SCHEDULER_KIND")) {
    fail(`${WRAPPER_SOURCE} must export FSRS_ACTIVE_SCHEDULER_KIND`);
  }
  if (!wrapperSource.includes("export const FSRS_ACTIVE_SCHEDULER_VERSION")) {
    fail(`${WRAPPER_SOURCE} must export FSRS_ACTIVE_SCHEDULER_VERSION`);
  }

  // settingsStorage must have fsrsActiveSchedulingEnabled default false
  if (!settingsSource.includes('fsrsActiveSchedulingEnabled: false')) {
    fail(`${SETTINGS_STORAGE_SOURCE} must include fsrsActiveSchedulingEnabled: false in defaults`);
  }

  // Protected files — must not call .next()
  const studyRoomSource = read(STUDY_ROOM);
  if (/\.next\s*\(/.test(studyRoomSource)) {
    fail(`${STUDY_ROOM} must not call .next()`);
  }
  if (!studyRoomSource.includes('shouldShowFsrsTwoStepBridge')) {
    fail(`${STUDY_ROOM} must preserve shouldShowFsrsTwoStepBridge (Phase 14N regression)`);
  }
  if (!studyRoomSource.includes('appendFsrsReviewLog')) {
    fail(`${STUDY_ROOM} must preserve appendFsrsReviewLog (Phase 14N regression)`);
  }

  // Dashboard unchanged
  const dashboardSource = read(DASHBOARD);
  if (/\.next\s*\(/.test(dashboardSource)) {
    fail(`${DASHBOARD} must not call .next()`);
  }
  if (dashboardSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${DASHBOARD} must not reference fsrsActiveSchedulingEnabled (Dashboard policy)`);
  }
}

// ── Phase 15A regression guard ────────────────────────────────────────────────

function phase15aRegressionGuard() {
  // Phase 15A docs and validator must still exist
  read(PHASE15A_DOCS);
  read(PHASE15A_VALIDATOR);

  // Phase 14N bridge must still exist and be unchanged
  const bridgeSource = read(PHASE14N_BRIDGE_COMPONENT);
  if (/\.next\s*\(/.test(bridgeSource)) {
    fail(`${PHASE14N_BRIDGE_COMPONENT} must not call .next() (Phase 14N regression)`);
  }

  // Adapter preserves Phase 14N/14J exports
  const adapterSource = read(ADAPTER_SOURCE);
  if (!adapterSource.includes('export function shouldShowFsrsTwoStepBridge')) {
    fail(`${ADAPTER_SOURCE} must preserve shouldShowFsrsTwoStepBridge (Phase 14N regression)`);
  }
  if (!adapterSource.includes('export function isFsrsNewCardEnrollmentEligible')) {
    fail(`${ADAPTER_SOURCE} must preserve isFsrsNewCardEnrollmentEligible (Phase 14J regression)`);
  }
  if (!adapterSource.includes('export function scheduleDormantFsrsReview')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleDormantFsrsReview (Phase 14J regression)`);
  }
}

// ── Docs guard ────────────────────────────────────────────────────────────────

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 15B',
    'double gate',
    'fsrsExperimentalEnabled',
    'fsrsActiveSchedulingEnabled',
    'SM-2 fallback',
    'fsrs-active',
    'fsrs-planned',
    'Default OFF',
    'scheduleFsrsReview',
    'reviewSchedulerAdapter.js',
    'reviewScheduleStorage.js',
    'settingsStorage.js',
    'fsrsWrapper.js',
    'Dashboard.jsx',
    'Phase 15C',
    'Phase 16',
    'StudyRoom.jsx',
    'fsrsPayload',
    'fsrsReviewLogs',
    'Again',
    'Hard',
    'Good',
    'Easy',
  ]);
}

// ── Activation claims guard ───────────────────────────────────────────────────

function activationClaimsGuard() {
  const docsText = normalize(read(DOCS_FILE));
  const forbiddenClaims = [
    'cloud sync hybrid local-first is implemented',
    'end-to-end encrypted sync is implemented',
    'multi-device sync is available',
    'dashboard mixed scheduler is implemented',
    'fsrs active scheduling is live',
    'fsrs is now the active scheduler',
  ];
  for (const claim of forbiddenClaims) {
    if (docsText.includes(claim)) {
      fail(`${DOCS_FILE} contains forbidden activation claim: "${claim}"`);
    }
  }
}

// ── Internal registry guard ───────────────────────────────────────────────────

function internalRegistryGuard() {
  const docsText = read(DOCS_FILE);
  if (docsText.includes(bindingPackage)) {
    fail(`${DOCS_FILE} must not reference native binding package`);
  }
  for (const term of internalRegistryTerms) {
    if (docsText.includes(term)) {
      fail(`${DOCS_FILE} references internal registry term: ${term}`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  packageGuard();
  workflowGuard();
  scopeGuard();
  generatedArtifactGuard();
  forbiddenScopeGuard();
  sourceContractsGuard();
  phase15aRegressionGuard();
  docsGuard();
  activationClaimsGuard();
  internalRegistryGuard();
  console.log('Phase 15B active FSRS scheduling double-gated validation passed.');
}

validate();
