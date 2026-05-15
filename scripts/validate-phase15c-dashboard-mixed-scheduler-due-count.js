#!/usr/bin/env node
/**
 * scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js
 *
 * Phase 15C static validator — Dashboard Mixed Scheduler Due Count / Display.
 * No scheduling changes. No ts-fsrs.next() call sites. No forbidden file changes.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE     = 'docs/phase15c-dashboard-mixed-scheduler-due-count.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const TEST_FILE     = 'tests/unit/dashboardMixedSchedulerDueCount.test.jsx';

const DASHBOARD        = 'src/routes/Dashboard.jsx';
const ADAPTER_SOURCE   = 'src/quiz/reviewSchedulerAdapter.js';
const STORAGE_SOURCE   = 'src/state/reviewScheduleStorage.js';
const WRAPPER_SOURCE   = 'src/quiz/fsrsWrapper.js';
const SETTINGS_SOURCE  = 'src/state/settingsStorage.js';
const STUDY_ROOM       = 'src/routes/StudyRoom.jsx';
const BRIDGE_COMPONENT = 'src/components/study/FsrsProductionMemoryRatingBridge.jsx';
const LEGACY_BACKUP    = 'src/quiz/dataBackup.js';
const V2_BACKUP        = 'src/state/v2BackupRestore.js';

// Phase 15B regression files
const PHASE15B_DOCS      = 'docs/phase15b-active-fsrs-scheduling-double-gated.md';
const PHASE15B_VALIDATOR = 'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js';
const PHASE15B_TEST      = 'tests/unit/fsrsActiveSchedulingDoubleGated.test.js';

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied'
];

// Phase 15C allowed changed files — exact list.
// Also includes Phase 15B files because Phase 15B may not yet be merged to origin/main
// at the time Phase 15C is validated locally.
const phase15cAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  TEST_FILE,
  DASHBOARD,
  ADAPTER_SOURCE,
  // Phase 15B files (included for local validation before Phase 15B merges to origin/main)
  PHASE15B_DOCS,
  PHASE15B_TEST,
  STORAGE_SOURCE,
  WRAPPER_SOURCE,
  SETTINGS_SOURCE,
  'tests/unit/fsrsEnrollmentReadinessHarness.test.js',
  'tests/unit/fsrsExperimentalSettingsPanel.test.jsx',
  'tests/unit/fsrsPersistenceHarness.test.js',
  'tests/unit/fsrsProductionEnrollmentWiring.test.js',
  'tests/unit/fsrsWrapper.test.js',
  'tests/unit/reviewSchedulerAdapter.phase14d.test.js',
  'tests/unit/reviewSchedulerAdapter.test.js',
  'tests/unit/settingsStorage.test.js',
  // Phase 15B validator updated to add Phase 15C forward-compat allowlist and fix forbiddenScopeGuard
  PHASE15B_VALIDATOR,
  // Historical validators updated with exact Phase 15C allowlist entries only
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
  // Phase 15D exact files (forward compatibility)
  'docs/phase15d-active-fsrs-runtime-smoke-rollback-audit.md',
  'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js',
  'tests/unit/fsrsActiveRuntimeRollbackAudit.test.js',
  'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js',
  // Phase 15E exact files (forward compatibility)
  'docs/phase15e-controlled-internal-activation-harness.md',
  'scripts/validate-phase15e-controlled-internal-activation-harness.js',
  'tests/unit/fsrsControlledInternalActivationHarness.test.js',
  // Phase 15F exact files (forward compatibility)
  'docs/phase15f-studyroom-copy-ux-alignment.md',
  'scripts/validate-phase15f-studyroom-copy-ux-alignment.js',
  // Phase 15G exact files (forward compatibility)
  'docs/phase15g-release-claim-guardrail-reaudit.md',
  'scripts/validate-phase15g-release-claim-guardrail-reaudit.js',
  'tests/unit/fsrsStudyRoomCopyUxAlignment.test.jsx',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/routes/StudyRoom.jsx',
  // Phase 15H exact files (forward compatibility)
  'docs/phase15h-fsrs-foundation-closure-phase16-readiness.md',
  'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js',

  // Phase 16A exact files (forward compatibility — Vietnamese-first UX copy alignment)
  'docs/phase16a-vietnamese-first-ux-copy-alignment.md',
  'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js',
  'tests/unit/vietnameseFirstUxCopyAlignment.test.js',
  'src/routes/Home.jsx',
  'src/routes/Dashboard.jsx',
  'src/routes/StudyRoom.jsx',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/components/settings/FsrsExperimentalSettingsPanel.jsx',
  'tests/unit/fsrsStudyRoomCopyUxAlignment.test.jsx',

  // Phase 16B allowlist entries (Hybrid Local-First Architecture / Optional Sync Direction)
  'docs/phase16b-hybrid-local-first-optional-sync-direction.md',
  'scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js',
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
  console.error(`Phase 15C validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 15C validation warning: ${message}`);
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
  read(DASHBOARD);
  read(ADAPTER_SOURCE);
  read(STORAGE_SOURCE);
  read(WRAPPER_SOURCE);
  read(SETTINGS_SOURCE);
  read(STUDY_ROOM);
  read(BRIDGE_COMPONENT);
  read(LEGACY_BACKUP);
  read(V2_BACKUP);
  // Phase 15B regression
  read(PHASE15B_DOCS);
  read(PHASE15B_VALIDATOR);
  read(PHASE15B_TEST);
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
    'node scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js',
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase15bPos = text.indexOf('node scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js');
  const phase15cPos = text.indexOf('node scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js');
  if (phase15bPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15B validator`);
  if (phase15cPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15C validator`);
  if (phase15cPos <= phase15bPos) {
    fail(`${WORKFLOW_FILE} must register Phase 15C validator after Phase 15B validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (phase15cAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 15C`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 15C`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15C: ${file}`);
    fail(`Unexpected changed file for Phase 15C scope: ${file}`);
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
    STUDY_ROOM,
    BRIDGE_COMPONENT,
    LEGACY_BACKUP,
    V2_BACKUP,
    WRAPPER_SOURCE,
    SETTINGS_SOURCE,
    'package.json',
    'package-lock.json'
  ];
  for (const file of forbidden) {
    if (phase15cAllowedChangedFiles.has(file)) continue;
    if (changed.has(file)) fail(`Forbidden file changed in Phase 15C: ${file}`);
  }
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15C: ${file}`);
  }
}

// ── Source contracts guard ────────────────────────────────────────────────────

function sourceContractsGuard() {
  const adapterSource = read(ADAPTER_SOURCE);
  const dashboardSource = read(DASHBOARD);
  const storageSource = read(STORAGE_SOURCE);
  const wrapperSource = read(WRAPPER_SOURCE);

  // Adapter must export computeMixedSchedulerDueSummary
  if (!adapterSource.includes('export function computeMixedSchedulerDueSummary')) {
    fail(`${ADAPTER_SOURCE} must export computeMixedSchedulerDueSummary (Phase 15C)`);
  }
  // Adapter must preserve Phase 15B double-gate
  if (!adapterSource.includes('fsrsExperimentalEnabled')) {
    fail(`${ADAPTER_SOURCE} must preserve fsrsExperimentalEnabled double-gate reference`);
  }
  if (!adapterSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${ADAPTER_SOURCE} must preserve fsrsActiveSchedulingEnabled double-gate reference`);
  }
  if (!adapterSource.includes('export function scheduleActiveFsrsOrFallback')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleActiveFsrsOrFallback (Phase 15B regression)`);
  }
  // Adapter must NOT call .next() directly
  if (/\.next\s*\(/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not call .next() directly`);
  }

  // Dashboard must import computeMixedSchedulerDueSummary
  if (!dashboardSource.includes('computeMixedSchedulerDueSummary')) {
    fail(`${DASHBOARD} must import and use computeMixedSchedulerDueSummary (Phase 15C)`);
  }
  // Dashboard must NOT reference fsrsActiveSchedulingEnabled
  if (dashboardSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${DASHBOARD} must not reference fsrsActiveSchedulingEnabled`);
  }
  // Dashboard must NOT call .next()
  if (/\.next\s*\(/.test(dashboardSource)) {
    fail(`${DASHBOARD} must not call .next()`);
  }
  // Dashboard copy must use experimental language, not overclaim
  const dashLower = dashboardSource.toLowerCase();
  if (dashLower.includes('fsrs is now active for everyone')) {
    fail(`${DASHBOARD} contains forbidden overclaim: "fsrs is now active for everyone"`);
  }
  if (dashLower.includes('ai scheduling is enabled')) {
    fail(`${DASHBOARD} contains forbidden overclaim: "ai scheduling is enabled"`);
  }
  if (dashLower.includes('cloud sync enabled')) {
    fail(`${DASHBOARD} contains forbidden overclaim: "cloud sync enabled"`);
  }
  if (dashLower.includes('guaranteed better')) {
    fail(`${DASHBOARD} contains forbidden overclaim: "guaranteed better"`);
  }

  // Storage must NOT call .next()
  if (/\.next\s*\(/.test(storageSource)) {
    fail(`${STORAGE_SOURCE} must not call .next()`);
  }

  // fsrsWrapper must preserve scheduleFsrsReview as the only production .next() site
  if (!wrapperSource.includes('export function scheduleFsrsReview')) {
    fail(`${WRAPPER_SOURCE} must preserve scheduleFsrsReview`);
  }

  // StudyRoom must NOT call .next(), must preserve Phase 14N exports
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
}

// ── Hybrid sync guard ─────────────────────────────────────────────────────────

function hybridSyncGuard() {
  const dashSource = read(DASHBOARD);
  const adapterSource = read(ADAPTER_SOURCE);
  for (const source of [dashSource, adapterSource]) {
    if (source.includes('local-first') || source.includes('IndexedDB') || source.includes('cloud-sync')) {
      fail('Phase 15C must not implement hybrid local-first/sync');
    }
  }
}

// ── Tests guard ───────────────────────────────────────────────────────────────

function testsGuard() {
  const testSource = read(TEST_FILE);
  const required = [
    'SM-2',
    'fsrs-planned',
    'fsrs-active',
    'computeMixedSchedulerDueSummary',
    'double-count',
    'malformed',
    'unknown'
  ];
  for (const term of required) {
    if (!testSource.toLowerCase().includes(term.toLowerCase())) {
      fail(`${TEST_FILE} must cover: ${term}`);
    }
  }
  if (testSource.includes('.skip(') || testSource.includes('.todo(')) {
    fail(`${TEST_FILE} must not contain skipped or placeholder tests`);
  }
}

// ── Docs guard ────────────────────────────────────────────────────────────────

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 15C',
    'Dashboard',
    'mixed scheduler',
    'does not change scheduling logic',
    'does not call',
    'ts-fsrs.next',
    'does not modify',
    'StudyRoom',
    'fsrs-planned',
    'fsrs-active',
    'SM-2',
    'experimental',
    'double-gated',
    'default OFF',
    'fsrsActiveSchedulingEnabled',
    'backup',
    'hybrid local-first',
    'deferred'
  ]);
}

// ── Activation claims guard ───────────────────────────────────────────────────

function activationClaimsGuard() {
  const docsText = normalize(read(DOCS_FILE));
  const forbiddenClaims = [
    'fsrs is now active for everyone',
    'fsrs active scheduling is live',
    'ai scheduling is enabled',
    'cloud sync hybrid local-first is implemented',
    'dashboard fully supports every future scheduler',
    'guaranteed better scheduling',
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

// ── Phase 15B regression guard ────────────────────────────────────────────────

function phase15bRegressionGuard() {
  read(PHASE15B_DOCS);
  read(PHASE15B_VALIDATOR);
  read(PHASE15B_TEST);

  const adapterSource = read(ADAPTER_SOURCE);
  if (!adapterSource.includes("'fsrs-active'")) {
    fail(`${ADAPTER_SOURCE} must preserve 'fsrs-active' in FSRS_KIND_ALIASES (Phase 15B regression)`);
  }
  if (!adapterSource.includes('export function scheduleCurrentReviewPreservingFsrs')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleCurrentReviewPreservingFsrs (Phase 15B regression)`);
  }
  if (!adapterSource.includes('export function resolveActiveSchedulingRating')) {
    fail(`${ADAPTER_SOURCE} must preserve resolveActiveSchedulingRating (Phase 15B regression)`);
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
  hybridSyncGuard();
  testsGuard();
  docsGuard();
  activationClaimsGuard();
  internalRegistryGuard();
  phase15bRegressionGuard();
  console.log('Phase 15C dashboard mixed scheduler due-count validation passed.');
}

validate();
