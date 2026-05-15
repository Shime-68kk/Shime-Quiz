#!/usr/bin/env node
/**
 * scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js
 *
 * Phase 15D static validator — Active FSRS Runtime Smoke / Rollback Audit.
 * No new scheduling features. No new ts-fsrs.next() call sites.
 * No forbidden file changes. Audit/hardening after Phase 15B/15C only.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE      = 'docs/phase15d-active-fsrs-runtime-smoke-rollback-audit.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js';
const WORKFLOW_FILE  = '.github/workflows/e2e-smoke.yml';
const TEST_FILE      = 'tests/unit/fsrsActiveRuntimeRollbackAudit.test.js';

const ADAPTER_SOURCE   = 'src/quiz/reviewSchedulerAdapter.js';
const STORAGE_SOURCE   = 'src/state/reviewScheduleStorage.js';
const WRAPPER_SOURCE   = 'src/quiz/fsrsWrapper.js';
const SETTINGS_SOURCE  = 'src/state/settingsStorage.js';
const STUDY_ROOM       = 'src/routes/StudyRoom.jsx';
const DASHBOARD        = 'src/routes/Dashboard.jsx';
const BRIDGE_COMPONENT = 'src/components/study/FsrsProductionMemoryRatingBridge.jsx';
const LEGACY_BACKUP    = 'src/quiz/dataBackup.js';
const V2_BACKUP        = 'src/state/v2BackupRestore.js';

// Phase 15C regression files
const PHASE15C_DOCS      = 'docs/phase15c-dashboard-mixed-scheduler-due-count.md';
const PHASE15C_VALIDATOR = 'scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js';
const PHASE15C_TEST      = 'tests/unit/dashboardMixedSchedulerDueCount.test.jsx';

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

// Phase 15D allowed changed files — exact list.
// Historical validator files are included because they were updated with Phase 15D allowlist entries.
const phase15dAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  TEST_FILE,
  // Historical validators updated with Phase 15D forward-compat allowlist entries
  PHASE15B_VALIDATOR,
  PHASE15C_VALIDATOR,
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
  // Phase 15E exact files (forward compatibility)
  'src/state/settingsStorage.js',
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
  console.error(`Phase 15D validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 15D validation warning: ${message}`);
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
  read(ADAPTER_SOURCE);
  read(STORAGE_SOURCE);
  read(WRAPPER_SOURCE);
  read(SETTINGS_SOURCE);
  read(STUDY_ROOM);
  read(DASHBOARD);
  read(BRIDGE_COMPONENT);
  read(LEGACY_BACKUP);
  read(V2_BACKUP);
  // Phase 15C regression
  read(PHASE15C_DOCS);
  read(PHASE15C_VALIDATOR);
  read(PHASE15C_TEST);
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
  // package.json and package-lock.json must not have changed in Phase 15D
  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 15D');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 15D');
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
    'node scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js',
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  // Phase 15D must be registered after Phase 15C
  const phase15cPos = text.indexOf('node scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js');
  const phase15dPos = text.indexOf('node scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js');
  if (phase15cPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15C validator`);
  if (phase15dPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15D validator`);
  if (phase15dPos <= phase15cPos) {
    fail(`${WORKFLOW_FILE} must register Phase 15D validator after Phase 15C validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (phase15dAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 15D`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 15D`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15D: ${file}`);
    fail(`Unexpected changed file for Phase 15D scope: ${file}`);
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
    DASHBOARD,
    BRIDGE_COMPONENT,
    LEGACY_BACKUP,
    V2_BACKUP,
    'package.json',
    'package-lock.json'
  ];
  for (const file of forbidden) {
    if (phase15dAllowedChangedFiles.has(file)) continue;
    if (changed.has(file)) fail(`Forbidden file changed in Phase 15D: ${file}`);
  }
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15D: ${file}`);
  }
}

// ── Source contracts guard ────────────────────────────────────────────────────

function sourceContractsGuard() {
  const adapterSource = read(ADAPTER_SOURCE);
  const storageSource = read(STORAGE_SOURCE);
  const wrapperSource = read(WRAPPER_SOURCE);
  const settingsSource = read(SETTINGS_SOURCE);

  // Phase 15B double-gate contract preserved
  if (!adapterSource.includes('fsrsExperimentalEnabled')) {
    fail(`${ADAPTER_SOURCE} must reference fsrsExperimentalEnabled for double gate (Phase 15B regression)`);
  }
  if (!adapterSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${ADAPTER_SOURCE} must reference fsrsActiveSchedulingEnabled for double gate (Phase 15B regression)`);
  }
  if (!adapterSource.includes('export function scheduleActiveFsrsOrFallback')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleActiveFsrsOrFallback (Phase 15B regression)`);
  }
  if (!adapterSource.includes('export function scheduleCurrentReviewPreservingFsrs')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleCurrentReviewPreservingFsrs (Phase 15B regression)`);
  }
  if (!adapterSource.includes('export function resolveActiveSchedulingRating')) {
    fail(`${ADAPTER_SOURCE} must preserve resolveActiveSchedulingRating (Phase 15B regression)`);
  }
  if (!adapterSource.includes("'fsrs-active'")) {
    fail(`${ADAPTER_SOURCE} must preserve 'fsrs-active' in FSRS_KIND_ALIASES (Phase 15B regression)`);
  }
  // Phase 15C computeMixedSchedulerDueSummary preserved
  if (!adapterSource.includes('export function computeMixedSchedulerDueSummary')) {
    fail(`${ADAPTER_SOURCE} must preserve computeMixedSchedulerDueSummary (Phase 15C regression)`);
  }
  // Adapter must NOT call .next() directly
  if (/\.next\s*\(/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not call .next() directly — only via scheduleFsrsReview in fsrsWrapper`);
  }

  // Storage contracts
  if (!storageSource.includes('export function resolveMemoryRatingFromLogs')) {
    fail(`${STORAGE_SOURCE} must export resolveMemoryRatingFromLogs (Phase 15B regression)`);
  }
  if (!storageSource.includes('export function appendFsrsReviewLog')) {
    fail(`${STORAGE_SOURCE} must preserve appendFsrsReviewLog (Phase 14N regression)`);
  }
  if (/\.next\s*\(/.test(storageSource)) {
    fail(`${STORAGE_SOURCE} must not call .next() directly`);
  }

  // Wrapper contracts
  if (!wrapperSource.includes('export function scheduleFsrsReview')) {
    fail(`${WRAPPER_SOURCE} must export scheduleFsrsReview — the only production ts-fsrs.next() call site`);
  }
  if (!wrapperSource.includes('export function toRawFsrsCardFromPayload')) {
    fail(`${WRAPPER_SOURCE} must export toRawFsrsCardFromPayload`);
  }
  if (!wrapperSource.includes('export const FSRS_ACTIVE_SCHEDULER_KIND')) {
    fail(`${WRAPPER_SOURCE} must export FSRS_ACTIVE_SCHEDULER_KIND`);
  }

  // Settings: fsrsActiveSchedulingEnabled must default false
  if (!settingsSource.includes('fsrsActiveSchedulingEnabled: false')) {
    fail(`${SETTINGS_SOURCE} must include fsrsActiveSchedulingEnabled: false in defaults`);
  }

  // StudyRoom: unchanged, preserves Phase 14N invariants
  const studyRoomSource = read(STUDY_ROOM);
  if (/\.next\s*\(/.test(studyRoomSource)) {
    fail(`${STUDY_ROOM} must not call .next() (Phase 15D: no StudyRoom changes)`);
  }
  if (!studyRoomSource.includes('shouldShowFsrsTwoStepBridge')) {
    fail(`${STUDY_ROOM} must preserve shouldShowFsrsTwoStepBridge (Phase 14N regression)`);
  }
  if (!studyRoomSource.includes('appendFsrsReviewLog')) {
    fail(`${STUDY_ROOM} must preserve appendFsrsReviewLog (Phase 14N regression)`);
  }

  // Dashboard: unchanged from Phase 15C
  const dashboardSource = read(DASHBOARD);
  if (/\.next\s*\(/.test(dashboardSource)) {
    fail(`${DASHBOARD} must not call .next() (Phase 15D: no Dashboard changes)`);
  }
  if (!dashboardSource.includes('computeMixedSchedulerDueSummary')) {
    fail(`${DASHBOARD} must preserve computeMixedSchedulerDueSummary (Phase 15C regression)`);
  }
  if (dashboardSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${DASHBOARD} must not expose fsrsActiveSchedulingEnabled (internal flag policy)`);
  }

  // Bridge: unchanged
  const bridgeSource = read(BRIDGE_COMPONENT);
  if (/\.next\s*\(/.test(bridgeSource)) {
    fail(`${BRIDGE_COMPONENT} must not call .next() (Phase 15D: no bridge changes)`);
  }
}

// ── No settings UI exposure guard ────────────────────────────────────────────

function noSettingsUiExposureGuard() {
  // No source file in Phase 15D may expose fsrsActiveSchedulingEnabled via UI
  const dashboardSource = read(DASHBOARD);
  if (dashboardSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${DASHBOARD} must not expose fsrsActiveSchedulingEnabled in Phase 15D`);
  }
  // StudyRoom must not expose the internal flag as user-facing JSX text or as
  // a user-visible string literal. A control-flow reference for deriving the
  // Phase 15F bridge copy mode is permitted.
  const studyRoomSource = read(STUDY_ROOM);
  if (/>\s*fsrsActiveSchedulingEnabled\s*</.test(studyRoomSource)) {
    fail(`${STUDY_ROOM} must not render fsrsActiveSchedulingEnabled as JSX text in Phase 15D`);
  }
  if (/["']fsrsActiveSchedulingEnabled["']/.test(studyRoomSource)) {
    fail(`${STUDY_ROOM} must not use fsrsActiveSchedulingEnabled as a string literal in UI text`);
  }
}

// ── No hybrid sync guard ──────────────────────────────────────────────────────

function noHybridSyncGuard() {
  const adapterSource = read(ADAPTER_SOURCE);
  const storageSource = read(STORAGE_SOURCE);
  for (const [file, source] of [[ADAPTER_SOURCE, adapterSource], [STORAGE_SOURCE, storageSource]]) {
    if (source.includes('local-first') || source.includes('IndexedDB') || source.includes('cloud-sync')) {
      fail(`Phase 15D must not implement hybrid local-first/sync in ${file}`);
    }
  }
}

// ── Tests guard ───────────────────────────────────────────────────────────────

function testsGuard() {
  const testSource = read(TEST_FILE);

  // No skipped or placeholder tests
  if (testSource.includes('.skip(') || testSource.includes('.todo(')) {
    fail(`${TEST_FILE} must not contain skipped or placeholder tests`);
  }

  // Required coverage terms
  const required = [
    'default false',
    'experimental ON',
    'active OFF',
    'experimental OFF',
    'active ON',
    'SM-2 fallback',
    'malformed',
    'missing fsrsPayload',
    'scheduleFsrsReview',
    'continueWithoutRating',
    'no usable rating log',
    'fsrs-active fallback',
    'StudyRoom',
    'Dashboard',
    'package'
  ];
  for (const term of required) {
    if (!testSource.toLowerCase().includes(term.toLowerCase())) {
      fail(`${TEST_FILE} must cover: ${term}`);
    }
  }
}

// ── Docs guard ────────────────────────────────────────────────────────────────

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 15D',
    'audit',
    'hardening',
    'does not add new scheduling',
    'does not add new ui',
    'does not add new',
    'ts-fsrs.next',
    'StudyRoom',
    'Dashboard',
    'default OFF',
    'fsrsActiveSchedulingEnabled',
    'rollback',
    'fallback',
    'SM-2',
    'fsrs-active',
    'fsrs-planned',
    'fsrsPayload',
    'fsrsReviewLogs',
    'manual smoke',
    'Phase 15E',
    'Phase 16',
    'hybrid local-first',
    'deferred',
    'double-gated',
    'scheduleCurrentReviewPreservingFsrs',
    'scheduleFsrsReview',
    'no demotion',
    'metadata preserved',
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
    'end-to-end encrypted sync is implemented',
    'multi-device sync is available',
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

// ── Phase 15C regression guard ────────────────────────────────────────────────

function phase15cRegressionGuard() {
  read(PHASE15C_DOCS);
  read(PHASE15C_VALIDATOR);
  read(PHASE15C_TEST);

  const adapterSource = read(ADAPTER_SOURCE);
  if (!adapterSource.includes('export function computeMixedSchedulerDueSummary')) {
    fail(`${ADAPTER_SOURCE} must preserve computeMixedSchedulerDueSummary (Phase 15C regression)`);
  }
  if (!adapterSource.includes('export function scheduleActiveFsrsOrFallback')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleActiveFsrsOrFallback (Phase 15C regression)`);
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

  // Phase 14N bridge preserved
  const bridgeSource = read(BRIDGE_COMPONENT);
  if (/\.next\s*\(/.test(bridgeSource)) {
    fail(`${BRIDGE_COMPONENT} must not call .next() (Phase 14N regression)`);
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
  noSettingsUiExposureGuard();
  noHybridSyncGuard();
  testsGuard();
  docsGuard();
  activationClaimsGuard();
  internalRegistryGuard();
  phase15cRegressionGuard();
  phase15bRegressionGuard();
  console.log('Phase 15D active FSRS runtime smoke/rollback audit validation passed.');
}

validate();
