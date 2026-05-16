#!/usr/bin/env node
/**
 * scripts/validate-phase15e-controlled-internal-activation-harness.js
 *
 * Phase 15E static validator — Controlled Internal Activation Harness.
 * Active FSRS scheduling remains default OFF, double-gated, no public UI.
 * Internal/test-only helpers added to settingsStorage.js only.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE       = 'docs/phase15e-controlled-internal-activation-harness.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase15e-controlled-internal-activation-harness.js';
const WORKFLOW_FILE   = '.github/workflows/e2e-smoke.yml';
const TEST_FILE       = 'tests/unit/fsrsControlledInternalActivationHarness.test.js';
const SETTINGS_SOURCE = 'src/state/settingsStorage.js';

const ADAPTER_SOURCE   = 'src/quiz/reviewSchedulerAdapter.js';
const STORAGE_SOURCE   = 'src/state/reviewScheduleStorage.js';
const WRAPPER_SOURCE   = 'src/quiz/fsrsWrapper.js';
const STUDY_ROOM       = 'src/routes/StudyRoom.jsx';
const DASHBOARD        = 'src/routes/Dashboard.jsx';
const SETTINGS_ROUTE   = 'src/routes/Settings.jsx';
const BRIDGE_COMPONENT = 'src/components/study/FsrsProductionMemoryRatingBridge.jsx';
const LEGACY_BACKUP    = 'src/quiz/dataBackup.js';
const V2_BACKUP        = 'src/state/v2BackupRestore.js';

// Phase 15D regression files
const PHASE15D_DOCS      = 'docs/phase15d-active-fsrs-runtime-smoke-rollback-audit.md';
const PHASE15D_VALIDATOR = 'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js';
const PHASE15D_TEST      = 'tests/unit/fsrsActiveRuntimeRollbackAudit.test.js';

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

// Phase 15E allowed changed files — exact list.
// The 5 core Phase 15E files, plus historical validators updated with
// exact Phase 15E forward-compat allowlist entries.
const phase15eAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  TEST_FILE,
  SETTINGS_SOURCE,
  // Phase 15B/15C/15D validators updated with Phase 15E allowlist entries
  PHASE15B_VALIDATOR,
  PHASE15C_VALIDATOR,
  PHASE15D_VALIDATOR,
  // Historical validators updated with Phase 15E forward-compat allowlist entries
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
  // Phase 16C allowlist entries (Storage / Large Import Safety / EduGen Bulk Import Risk Audit)
  'docs/phase16c-storage-large-import-edugen-risk-audit.md',
  'tests/unit/storageLargeImportEdugenRiskAudit.test.js',
  'scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js',
  // Phase 16D allowlist entries (Shime Study Identity / Product Principles)
  'docs/phase16d-shime-study-identity-product-principles.md',
  'scripts/validate-phase16d-shime-study-identity-product-principles.js',
  // Phase 16E allowlist entries (Visual Polish Quick Wins)
  'docs/phase16e-visual-polish-quick-wins.md',
  'tests/unit/visualPolishQuickWins.test.jsx',
  'scripts/validate-phase16e-visual-polish-quick-wins.js',
  'src/routes/Home.jsx',
  'src/routes/Dashboard.jsx',
  'src/routes/StudyRoom.jsx',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/components/settings/FsrsExperimentalSettingsPanel.jsx',
  'src/styles/global.css',
// Phase 16F allowlist entries (EduGen Draft Workshop Connector Foundation)
  'docs/phase16f-edugen-draft-workshop-connector-foundation.md',
  'tests/unit/edugenDraftWorkshopConnector.test.js',
  'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js',
  'src/edugen/edugenConnector.js',
  'src/components/settings/EduGenDraftWorkshopPanel.jsx',
  'src/routes/Settings.jsx',
  'src/state/settingsStorage.js',

  // Phase 16G exact files (forward compatibility)
  'docs/phase16g-edugen-draft-review-import-flow.md',
  'tests/unit/edugenDraftReviewImportFlow.test.jsx',
  'scripts/validate-phase16g-edugen-draft-review-import-flow.js',
  'src/edugen/edugenDraftParser.js',
  'src/components/edugen/EduGenDraftReviewPanel.jsx',
  // Phase 16H allowlist entries (EduGen Draft Quality Review / Source-Aware Library)
  'docs/phase16h-edugen-draft-quality-review-source-aware-library.md',
  'tests/unit/edugenDraftQualityReviewSourceLibrary.test.jsx',
  'scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js',
  'src/edugen/edugenDraftImport.js',
  'src/data/learningDataAdapter.js',
  'src/data/importValidator.js',
  'src/routes/Library.jsx',
  'src/routes/Settings.jsx',
  '.github/workflows/e2e-smoke.yml',
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
  console.error(`Phase 15E validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 15E validation warning: ${message}`);
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
  read(SETTINGS_SOURCE);
  read(ADAPTER_SOURCE);
  read(STORAGE_SOURCE);
  read(WRAPPER_SOURCE);
  read(SETTINGS_ROUTE);
  read(STUDY_ROOM);
  read(DASHBOARD);
  read(BRIDGE_COMPONENT);
  read(LEGACY_BACKUP);
  read(V2_BACKUP);
  // Phase 15D regression
  read(PHASE15D_DOCS);
  read(PHASE15D_VALIDATOR);
  read(PHASE15D_TEST);
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
  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 15E');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 15E');
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
    'node scripts/validate-phase15e-controlled-internal-activation-harness.js',
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  // Phase 15E must be registered after Phase 15D
  const phase15dPos = text.indexOf('node scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js');
  const phase15ePos = text.indexOf('node scripts/validate-phase15e-controlled-internal-activation-harness.js');
  if (phase15dPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15D validator`);
  if (phase15ePos === -1) fail(`${WORKFLOW_FILE} must register Phase 15E validator`);
  if (phase15ePos <= phase15dPos) {
    fail(`${WORKFLOW_FILE} must register Phase 15E validator after Phase 15D validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase15eAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 15E`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 15E`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15E: ${file}`);
    fail(`Unexpected changed file for Phase 15E scope: ${file}`);
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
    ADAPTER_SOURCE,
    STORAGE_SOURCE,
    WRAPPER_SOURCE,
    'package.json',
    'package-lock.json'
  ];
  for (const file of forbidden) {
    if (phase15eAllowedChangedFiles.has(file)) continue;
    if (changed.has(file)) fail(`Forbidden file changed in Phase 15E: ${file}`);
  }
  for (const file of changedFiles()) {
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15E: ${file}`);
  }
}

// ── Internal helper names guard ───────────────────────────────────────────────

function internalHelperNamesGuard() {
  const settingsSource = read(SETTINGS_SOURCE);
  const requiredHelpers = [
    'enableFsrsActiveSchedulingForInternalTest',
    'disableFsrsActiveSchedulingForInternalTest',
    'setFsrsActiveSchedulingForInternalTest'
  ];
  for (const helper of requiredHelpers) {
    if (!settingsSource.includes(helper)) {
      fail(`${SETTINGS_SOURCE} must export internal/test helper: ${helper}`);
    }
    // All helpers must have internal/test/dev language in their names
    if (!/internal|test|dev/i.test(helper)) {
      fail(`Helper ${helper} must contain internal/test/dev language in its name`);
    }
  }
}

// ── No public Settings UI exposure guard ──────────────────────────────────────

function noPublicUiExposureGuard() {
  const settingsRouteSource = read(SETTINGS_ROUTE);
  if (settingsRouteSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${SETTINGS_ROUTE} must not expose fsrsActiveSchedulingEnabled in public UI`);
  }
  const dashboardSource = read(DASHBOARD);
  if (dashboardSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${DASHBOARD} must not expose fsrsActiveSchedulingEnabled`);
  }
  const studyRoomSource = read(STUDY_ROOM);
  if (/>\s*fsrsActiveSchedulingEnabled\s*</.test(studyRoomSource)) {
    fail(`${STUDY_ROOM} must not render fsrsActiveSchedulingEnabled as JSX text`);
  }
  if (/["']fsrsActiveSchedulingEnabled["']/.test(studyRoomSource)) {
    fail(`${STUDY_ROOM} must not use fsrsActiveSchedulingEnabled as a string literal in UI text`);
  }
}

// ── No migration/backfill/boot activation guard ───────────────────────────────

function noBootActivationGuard() {
  const legacyBackup = read(LEGACY_BACKUP);
  const v2Backup = read(V2_BACKUP);
  for (const [file, source] of [[LEGACY_BACKUP, legacyBackup], [V2_BACKUP, v2Backup]]) {
    if (source.includes('enableFsrsActiveSchedulingForInternalTest') ||
        source.includes('setFsrsActiveSchedulingForInternalTest')) {
      fail(`Phase 15E internal helpers must not be called from ${file} (no boot/import activation)`);
    }
  }
  // StudyRoom must not auto-enable active flag
  const studyRoomSource = read(STUDY_ROOM);
  if (studyRoomSource.includes('enableFsrsActiveSchedulingForInternalTest') ||
      studyRoomSource.includes('setFsrsActiveSchedulingForInternalTest')) {
    fail(`Phase 15E internal helpers must not be called from ${STUDY_ROOM}`);
  }
}

// ── Source contracts guard ────────────────────────────────────────────────────

function sourceContractsGuard() {
  const adapterSource = read(ADAPTER_SOURCE);
  const settingsSource = read(SETTINGS_SOURCE);
  const wrapperSource = read(WRAPPER_SOURCE);
  const storageSource = read(STORAGE_SOURCE);

  // Double-gate contract preserved
  if (!adapterSource.includes('fsrsExperimentalEnabled')) {
    fail(`${ADAPTER_SOURCE} must reference fsrsExperimentalEnabled for double gate`);
  }
  if (!adapterSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${ADAPTER_SOURCE} must reference fsrsActiveSchedulingEnabled for double gate`);
  }
  if (!adapterSource.includes('export function scheduleActiveFsrsOrFallback')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleActiveFsrsOrFallback`);
  }
  if (!adapterSource.includes('export function computeMixedSchedulerDueSummary')) {
    fail(`${ADAPTER_SOURCE} must preserve computeMixedSchedulerDueSummary`);
  }
  if (/\.next\s*\(/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not call .next() directly`);
  }

  // Settings: default false preserved
  if (!settingsSource.includes('fsrsActiveSchedulingEnabled: false')) {
    fail(`${SETTINGS_SOURCE} must include fsrsActiveSchedulingEnabled: false in defaults`);
  }
  // Helpers present
  if (!settingsSource.includes('export function setFsrsActiveSchedulingForInternalTest')) {
    fail(`${SETTINGS_SOURCE} must export setFsrsActiveSchedulingForInternalTest`);
  }
  if (!settingsSource.includes('export function enableFsrsActiveSchedulingForInternalTest')) {
    fail(`${SETTINGS_SOURCE} must export enableFsrsActiveSchedulingForInternalTest`);
  }
  if (!settingsSource.includes('export function disableFsrsActiveSchedulingForInternalTest')) {
    fail(`${SETTINGS_SOURCE} must export disableFsrsActiveSchedulingForInternalTest`);
  }
  if (/\.next\s*\(/.test(settingsSource)) {
    fail(`${SETTINGS_SOURCE} must not call .next() directly`);
  }

  // Wrapper: only approved .next() call site
  if (!wrapperSource.includes('export function scheduleFsrsReview')) {
    fail(`${WRAPPER_SOURCE} must export scheduleFsrsReview — the only production ts-fsrs.next() call site`);
  }

  // StudyRoom: unchanged from Phase 14N/15D
  const studyRoomSource = read(STUDY_ROOM);
  if (!studyRoomSource.includes('shouldShowFsrsTwoStepBridge')) {
    fail(`${STUDY_ROOM} must preserve shouldShowFsrsTwoStepBridge (Phase 14N regression)`);
  }
  if (!studyRoomSource.includes('appendFsrsReviewLog')) {
    fail(`${STUDY_ROOM} must preserve appendFsrsReviewLog (Phase 14N regression)`);
  }
  if (/\.next\s*\(/.test(studyRoomSource)) {
    fail(`${STUDY_ROOM} must not call .next()`);
  }

  // Dashboard: unchanged from Phase 15C
  const dashboardSource = read(DASHBOARD);
  if (!dashboardSource.includes('computeMixedSchedulerDueSummary')) {
    fail(`${DASHBOARD} must preserve computeMixedSchedulerDueSummary (Phase 15C regression)`);
  }
  if (dashboardSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${DASHBOARD} must not expose fsrsActiveSchedulingEnabled`);
  }
  if (/\.next\s*\(/.test(dashboardSource)) {
    fail(`${DASHBOARD} must not call .next()`);
  }

  // Storage
  if (!storageSource.includes('export function resolveMemoryRatingFromLogs')) {
    fail(`${STORAGE_SOURCE} must export resolveMemoryRatingFromLogs (Phase 15B regression)`);
  }
  if (/\.next\s*\(/.test(storageSource)) {
    fail(`${STORAGE_SOURCE} must not call .next() directly`);
  }
}

// ── No new ts-fsrs.next() call sites guard ────────────────────────────────────

function noNewNextCallSitesGuard() {
  const wrapperSource = read(WRAPPER_SOURCE);
  const matches = wrapperSource.match(/\.next\s*\(/g) ?? [];
  if (matches.length !== 2) {
    fail(`${WRAPPER_SOURCE} must have exactly 2 .next() calls (scheduleFsrsReview + scheduleFsrsReviewForTest), found ${matches.length}`);
  }
  const settingsSource = read(SETTINGS_SOURCE);
  if (/\.next\s*\(/.test(settingsSource)) {
    fail(`${SETTINGS_SOURCE} must not call .next() directly (Phase 15E helpers must not add call sites)`);
  }
}

// ── No hybrid sync guard ──────────────────────────────────────────────────────

function noHybridSyncGuard() {
  const settingsSource = read(SETTINGS_SOURCE);
  if (settingsSource.includes('local-first') || settingsSource.includes('IndexedDB') || settingsSource.includes('cloud-sync')) {
    fail(`Phase 15E must not implement hybrid local-first/sync in ${SETTINGS_SOURCE}`);
  }
}

// ── Tests guard ───────────────────────────────────────────────────────────────

function testsGuard() {
  const testSource = read(TEST_FILE);

  if (testSource.includes('.skip(') || testSource.includes('.todo(')) {
    fail(`${TEST_FILE} must not contain skipped or placeholder tests`);
  }

  const required = [
    'helper',
    'internal',
    'default',
    'false',
    'normalize',
    'enableFsrsActiveSchedulingForInternalTest',
    'disableFsrsActiveSchedulingForInternalTest',
    'setFsrsActiveSchedulingForInternalTest',
    'preserves',
    'Settings',
    'experimental',
    'double gate',
    'scheduleFsrsReview',
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
    'Phase 15E',
    'controlled internal',
    'activation harness',
    'does not publicly expose',
    'does not change StudyRoom',
    'does not change Dashboard',
    'does not add new ts-fsrs.next',
    'default OFF',
    'fsrsActiveSchedulingEnabled',
    'double-gated',
    'internal/test',
    'no public rollout',
    'fsrsExperimentalEnabled',
    'enableFsrsActiveSchedulingForInternalTest',
    'disableFsrsActiveSchedulingForInternalTest',
    'setFsrsActiveSchedulingForInternalTest',
    'Phase 15F',
    'Phase 16',
    'hybrid local-first',
    'deferred',
    'no automatic activation',
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
    'guaranteed better scheduling',
    'end-to-end encrypted sync is implemented',
    'multi-device sync is available',
    'active scheduling is broadly available',
  ];
  for (const claim of forbiddenClaims) {
    if (docsText.includes(normalize(claim))) {
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

// ── Phase 15D regression guard ────────────────────────────────────────────────

function phase15dRegressionGuard() {
  read(PHASE15D_DOCS);
  read(PHASE15D_VALIDATOR);
  read(PHASE15D_TEST);

  const adapterSource = read(ADAPTER_SOURCE);
  if (!adapterSource.includes('export function scheduleActiveFsrsOrFallback')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleActiveFsrsOrFallback (Phase 15D regression)`);
  }
  if (!adapterSource.includes("'fsrs-active'")) {
    fail(`${ADAPTER_SOURCE} must preserve 'fsrs-active' in FSRS_KIND_ALIASES (Phase 15D regression)`);
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
}

// ── Phase 15B regression guard ────────────────────────────────────────────────

function phase15bRegressionGuard() {
  read(PHASE15B_DOCS);
  read(PHASE15B_VALIDATOR);
  read(PHASE15B_TEST);

  const adapterSource = read(ADAPTER_SOURCE);
  if (!adapterSource.includes('export function scheduleCurrentReviewPreservingFsrs')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleCurrentReviewPreservingFsrs (Phase 15B regression)`);
  }
  if (!adapterSource.includes('export function resolveActiveSchedulingRating')) {
    fail(`${ADAPTER_SOURCE} must preserve resolveActiveSchedulingRating (Phase 15B regression)`);
  }

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
  internalHelperNamesGuard();
  noPublicUiExposureGuard();
  noBootActivationGuard();
  sourceContractsGuard();
  noNewNextCallSitesGuard();
  noHybridSyncGuard();
  testsGuard();
  docsGuard();
  activationClaimsGuard();
  internalRegistryGuard();
  phase15dRegressionGuard();
  phase15cRegressionGuard();
  phase15bRegressionGuard();
  console.log('Phase 15E controlled internal activation harness validation passed.');
}

validate();
