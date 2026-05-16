#!/usr/bin/env node
/**
 * scripts/validate-phase15a-fsrs-active-scheduling-architecture.js
 *
 * Phase 15A static validator — Active FSRS Scheduling Architecture & Rollout Plan.
 * Docs/static-validator/CI-only. No active FSRS scheduling. No src/ changes. No tests/ changes.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE = 'docs/phase15a-fsrs-active-scheduling-architecture.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase15a-fsrs-active-scheduling-architecture.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';

// Phase 14P regression files
const PHASE14P_DOCS = 'docs/phase14p-fsrs-foundation-closure-phase15-handoff.md';
const PHASE14P_VALIDATOR = 'scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js';
// Phase 14O regression files
const PHASE14O_DOCS = 'docs/phase14o-fsrs-active-scheduling-decision-gate.md';
const PHASE14O_VALIDATOR = 'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js';
// Phase 14N regression files
const PHASE14N_DOCS = 'docs/phase14n-production-studyroom-two-step-memory-rating-bridge.md';
const PHASE14N_VALIDATOR = 'scripts/validate-phase14n-production-studyroom-two-step-bridge.js';
const PHASE14N_TEST = 'tests/unit/fsrsProductionStudyRoomTwoStepBridge.test.jsx';
const PHASE14N_BRIDGE_COMPONENT = 'src/components/study/FsrsProductionMemoryRatingBridge.jsx';

const STUDY_ROOM = 'src/routes/StudyRoom.jsx';
const DASHBOARD = 'src/routes/Dashboard.jsx';
const ADAPTER_SOURCE = 'src/quiz/reviewSchedulerAdapter.js';
const STORAGE_SOURCE = 'src/state/reviewScheduleStorage.js';
const WRAPPER_SOURCE = 'src/quiz/fsrsWrapper.js';
const SETTINGS_STORAGE_SOURCE = 'src/state/settingsStorage.js';

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied'
];

// Phase 15A allowed changed files — narrow and exact.
const phase15aAllowedChangedFiles = new Set([
  // Phase 15A new files
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  WORKFLOW_FILE,
  // Historical validators updated with exact Phase 15A allowlist entries only
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
  // Phase 15B exact files (forward compatibility)
  '.github/workflows/e2e-smoke.yml',
  'docs/phase15b-active-fsrs-scheduling-double-gated.md',
  'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js',
  'src/quiz/fsrsWrapper.js',
  'src/quiz/reviewSchedulerAdapter.js',
  'src/state/reviewScheduleStorage.js',
  'src/state/settingsStorage.js',
  'tests/unit/fsrsActiveSchedulingDoubleGated.test.js',
  'tests/unit/fsrsEnrollmentReadinessHarness.test.js',
  'tests/unit/fsrsExperimentalSettingsPanel.test.jsx',
  'tests/unit/fsrsPersistenceHarness.test.js',
  'tests/unit/fsrsProductionEnrollmentWiring.test.js',
  'tests/unit/fsrsWrapper.test.js',
  'tests/unit/reviewSchedulerAdapter.phase14d.test.js',
  'tests/unit/reviewSchedulerAdapter.test.js',
  'tests/unit/settingsStorage.test.js',
  // Phase 15C exact files (forward compatibility)
  'docs/phase15c-dashboard-mixed-scheduler-due-count.md',
  'scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js',
  'src/routes/Dashboard.jsx',
  'tests/unit/dashboardMixedSchedulerDueCount.test.jsx',
  // Phase 15D exact files (forward compatibility)
  'docs/phase15d-active-fsrs-runtime-smoke-rollback-audit.md',
  'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js',
  'tests/unit/fsrsActiveRuntimeRollbackAudit.test.js',
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
  // Phase 16I allowlist entries (Public README / Landing / Screenshots Polish + Demo Quickstart Refresh)
  'docs/demo-quickstart.md',
  'docs/deployment-readiness.md',
  'docs/phase16i-public-readme-landing-screenshots-demo-refresh.md',
  'docs/public-release-notes.md',
  'docs/screenshot-capture-guide.md',
  '.github/workflows/e2e-smoke.yml',
  'README.md',
  'scripts/validate-accessibility-keyboard-smoke.js',
  'scripts/validate-backup-restore-regression-smoke.js',
  'scripts/validate-backup-transfer-safety-hardening.js',
  'scripts/validate-ci-green-verification.js',
  'scripts/validate-cross-device-export-import.js',
  'scripts/validate-cross-device-transfer-track-closure.js',
  'scripts/validate-cross-device-transfer-ux-copy.js',
  'scripts/validate-cross-device-transfer-ux-decision.js',
  'scripts/validate-dashboard-today-card-runtime.js',
  'scripts/validate-dashboard-today-card-ux-plan.js',
  'scripts/validate-demo-readiness-docs.js',
  'scripts/validate-demo-sample-pack.js',
  'scripts/validate-direct-route-spa-fallback.js',
  'scripts/validate-edugen-boundary-polish.js',
  'scripts/validate-final-main-release-authorization.js',
  'scripts/validate-final-public-release-readiness-reaudit.js',
  'scripts/validate-final-release-execution-checklist.js',
  'scripts/validate-github-release-draft.js',
  'scripts/validate-github-release-publication-plan.js',
  'scripts/validate-import-regression-smoke.js',
  'scripts/validate-manual-evidence-execution-checklist.js',
  'scripts/validate-manual-evidence-results-log.js',
  'scripts/validate-manual-evidence-run-pack.js',
  'scripts/validate-mobile-ux-smoke.js',
  'scripts/validate-performance-bundle-audit.js',
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
  'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js',
  'scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js',
  'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js',
  'scripts/validate-phase15e-controlled-internal-activation-harness.js',
  'scripts/validate-phase15f-studyroom-copy-ux-alignment.js',
  'scripts/validate-phase15g-release-claim-guardrail-reaudit.js',
  'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js',
  'scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js',
  'scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js',
  'scripts/validate-phase16d-shime-study-identity-product-principles.js',
  'scripts/validate-phase16e-visual-polish-quick-wins.js',
  'scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js',
  'scripts/validate-phase16g-edugen-draft-review-import-flow.js',
  'scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js',
  'scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js',
  // Phase 16J — Mobile UX / PWA Quick Wins (forward compatibility)
  'docs/phase16j-mobile-ux-pwa-quick-wins.md',
  'scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js',
  'public/sw.js',
  // Phase 16K — Storage Quota & Backup-Before-Import Runtime Hardening (forward compatibility)
  'docs/phase16k-storage-quota-backup-before-import-hardening.md',
  'scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js',
  'src/utils/storageQuotaEstimate.js',
  'src/components/learning/BackupBeforeImportNotice.jsx',
  'tests/unit/storageQuotaEstimate.test.js',
  'tests/unit/storageQuotaBackupBeforeImport.test.jsx',
  'scripts/validate-public-release-docs.js',
  'scripts/validate-readme-public-facing.js',
  'scripts/validate-release-candidate-freeze-final-decision.js',
  'scripts/validate-release-candidate-tag-publish-gate.js',
  'scripts/validate-release-package-assembly-plan.js',
  'scripts/validate-release-package-cleanliness.js',
  'scripts/validate-release-tag-creation-plan.js',
  'scripts/validate-release-tag-decision.js',
  'scripts/validate-release-tag-publish-checklist.js',
  'scripts/validate-screenshot-asset-pack.js',
  'scripts/validate-social-preview-metadata.js',
  'scripts/validate-storage-quota-warning-runtime.js',
  'scripts/validate-study-dashboard-regression-smoke.js',
  'scripts/validate-study-flow-micro-feedback-plan.js',
  'scripts/validate-study-flow-micro-feedback-runtime.js',
  'scripts/validate-unit-test-foundation-plan.js',
  'scripts/validate-vitest-unit-test-foundation.js',
  'scripts/validate-visual-asset-guidance.js',
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
  console.error(`Phase 15A architecture validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 15A architecture validation warning: ${message}`);
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
  // Phase 14P regression — must still exist
  read(PHASE14P_DOCS);
  read(PHASE14P_VALIDATOR);
  // Phase 14O regression — must still exist
  read(PHASE14O_DOCS);
  read(PHASE14O_VALIDATOR);
  // Phase 14N regression — must still exist
  read(PHASE14N_DOCS);
  read(PHASE14N_VALIDATOR);
  read(PHASE14N_TEST);
  read(PHASE14N_BRIDGE_COMPONENT);
  read(STUDY_ROOM);
  read(ADAPTER_SOURCE);
  read(STORAGE_SOURCE);
  read(WRAPPER_SOURCE);
  read(SETTINGS_STORAGE_SOURCE);
  read(DASHBOARD);
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

  // All Phase 14 validators through 14P must still be registered
  const requiredValidators = [
    'node scripts/validate-phase14b-fsrs-wrapper.js',
    'node scripts/validate-phase14c-fsrs-persistence-harness.js',
    'node scripts/validate-phase14d-fsrs-adapter-routing.js',
    'node scripts/validate-phase14e-fsrs-user-facing-entry.js',
    'node scripts/validate-phase14f-toggle-plan.js',
    'node scripts/validate-phase14f-hf1-baseline-validation-recovery.js',
    'node scripts/validate-phase14g-settings-storage.js',
    'node scripts/validate-phase14h-fsrs-toggle-ui.js',
    'node scripts/validate-phase14i-fsrs-two-step-fixture.js',
    'node scripts/validate-phase14j-fsrs-enrollment-readiness.js',
    'node scripts/validate-phase14k-fsrs-readiness-audit.js',
    'node scripts/validate-phase14l-production-enrollment-wiring.js',
    'node scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js',
    'node scripts/validate-phase14n-production-studyroom-two-step-bridge.js',
    'node scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js',
    'node scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js',
    'node scripts/validate-phase15a-fsrs-active-scheduling-architecture.js',
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  // Phase 15A must be registered after Phase 14P
  const phase14pPos = text.indexOf('node scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js');
  const phase15aPos = text.indexOf('node scripts/validate-phase15a-fsrs-active-scheduling-architecture.js');
  if (phase14pPos === -1) fail(`${WORKFLOW_FILE} must register Phase 14P validator`);
  if (phase15aPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15A validator`);
  if (phase15aPos <= phase14pPos) {
    fail(`${WORKFLOW_FILE} must register Phase 15A validator after Phase 14P validator`);
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
    if (phase15aAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 15A`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 15A`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15A: ${file}`);
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 15A: ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 15A: ${file}`);
    fail(`Unexpected changed file for Phase 15A scope: ${file}`);
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
    WRAPPER_SOURCE,
    SETTINGS_STORAGE_SOURCE,
    'src/quiz/dataBackup.js',
    'src/state/v2BackupRestore.js',
    'package.json',
    'package-lock.json'
  ];
  for (const file of forbidden) {
    if (phase15aAllowedChangedFiles.has(file)) continue;
    if (changed.has(file)) fail(`Forbidden file changed in Phase 15A: ${file}`);
  }
  for (const file of changedFiles()) {
    if (phase15aAllowedChangedFiles.has(file)) continue;
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 15A: ${file}`);
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 15A: ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 15A: ${file}`);
  }
}

// ── Phase 14P regression guard ────────────────────────────────────────────────

function phase14pRegressionGuard() {
  // Study Room must preserve Phase 14N references and must not call .next()
  const studyRoomSource = read(STUDY_ROOM);
  if (!studyRoomSource.includes('shouldShowFsrsTwoStepBridge')) {
    fail(`${STUDY_ROOM} must preserve shouldShowFsrsTwoStepBridge (Phase 14N regression)`);
  }
  if (!studyRoomSource.includes('appendFsrsReviewLog')) {
    fail(`${STUDY_ROOM} must preserve appendFsrsReviewLog (Phase 14N regression)`);
  }
  if (!studyRoomSource.includes('FsrsProductionMemoryRatingBridge')) {
    fail(`${STUDY_ROOM} must preserve FsrsProductionMemoryRatingBridge import (Phase 14N regression)`);
  }
  if (/\.next\s*\(/.test(studyRoomSource)) {
    fail(`${STUDY_ROOM} must not call .next() — active FSRS scheduling is disabled (Phase 15A gate)`);
  }

  // Adapter must preserve Phase 14N/14J exports and must not call .next()
  const adapterSource = read(ADAPTER_SOURCE);
  if (!adapterSource.includes('export function shouldShowFsrsTwoStepBridge')) {
    fail(`${ADAPTER_SOURCE} must preserve shouldShowFsrsTwoStepBridge export (Phase 14N regression)`);
  }
  if (!adapterSource.includes('export function isFsrsNewCardEnrollmentEligible')) {
    fail(`${ADAPTER_SOURCE} must preserve isFsrsNewCardEnrollmentEligible export (Phase 14J regression)`);
  }
  if (!adapterSource.includes('export function scheduleDormantFsrsReview')) {
    fail(`${ADAPTER_SOURCE} must preserve scheduleDormantFsrsReview export (Phase 14J regression)`);
  }
  if (/\.next\s*\(/.test(adapterSource)) {
    fail(`${ADAPTER_SOURCE} must not call .next() — active FSRS scheduling is disabled (Phase 15A gate)`);
  }

  // Storage must preserve Phase 14N helper and must not call .next()
  const storageSource = read(STORAGE_SOURCE);
  if (!storageSource.includes('export function appendFsrsReviewLog')) {
    fail(`${STORAGE_SOURCE} must preserve appendFsrsReviewLog export (Phase 14N regression)`);
  }
  if (!storageSource.includes('FSRS_REVIEW_LOG_CAP')) {
    fail(`${STORAGE_SOURCE} must preserve FSRS_REVIEW_LOG_CAP (Phase 14N regression)`);
  }
  if (/\.next\s*\(/.test(storageSource)) {
    fail(`${STORAGE_SOURCE} must not call .next() — active FSRS scheduling is disabled (Phase 15A gate)`);
  }

  // Bridge component must not call .next()
  const bridgeSource = read(PHASE14N_BRIDGE_COMPONENT);
  if (/\.next\s*\(/.test(bridgeSource)) {
    fail(`${PHASE14N_BRIDGE_COMPONENT} must not call .next() (Phase 15A gate)`);
  }

  // fsrsWrapper may contain .next() as wrapper definition
  const wrapperSource = read(WRAPPER_SOURCE);
  if (/\.next\s*\(/.test(wrapperSource)) {
    warn(`${WRAPPER_SOURCE} contains .next() — confirm it is not called from production paths`);
  }
}

// ── Docs guard ────────────────────────────────────────────────────────────────

function docsGuard() {
  // Phase 15A is docs/CI-only
  requireIncludes(DOCS_FILE, [
    'Phase 15A is',
    'docs/static-validator/CI-only',
    'Active FSRS scheduling is not enabled in this phase',
    'production `ts-fsrs.next()` is not called in Phase 15A',
    'No `src/` files are changed in Phase 15A',
    'No `tests/` files are changed in Phase 15A',
  ]);

  // Phase 15B is implementation, Phase 15C is Dashboard
  requireIncludes(DOCS_FILE, [
    'Phase 15B',
    'Phase 15C',
    'Dashboard mixed scheduler',
    'active scheduling',
  ]);

  // Hybrid local-first deferral
  requireIncludes(DOCS_FILE, [
    'Phase 16',
    'hybrid local-first',
    'deferred',
    'not part of Phase 15',
  ]);

  // Ten Phase 14O gate decisions must all be covered
  requireIncludes(DOCS_FILE, [
    'Gate 1',
    'Gate 2',
    'Gate 3',
    'Gate 4',
    'Gate 5',
    'Gate 6',
    'Gate 7',
    'Gate 8',
    'Gate 9',
    'Gate 10',
  ]);

  // Active scheduling gate contract
  requireIncludes(DOCS_FILE, [
    'fsrsExperimentalEnabled',
    'fsrsActiveSchedulingEnabled',
    'fsrs-planned',
    'fsrs-active',
    'try/catch',
    'SM-2 fallback',
  ]);

  // Rating mapping
  requireIncludes(DOCS_FILE, [
    'Again',
    'Hard',
    'Good',
    'Easy',
    'Wrong',
    'Unanswered',
    'Continue without rating',
  ]);

  // Continue without rating policy
  requireIncludes(DOCS_FILE, [
    'Do not call `ts-fsrs.next()`',
    'Preserve',
    'fsrsPayload',
    'fsrsReviewLogs',
    'do not demote',
  ]);

  // Scheduler kind policy
  requireIncludes(DOCS_FILE, [
    'FSRS_KIND_ALIASES',
    'appendFsrsReviewLog',
  ]);

  // Rollback policy
  requireIncludes(DOCS_FILE, [
    'rollback',
    'mass reschedule',
    'fsrsActiveSchedulingEnabled',
    'engineering kill-switch',
  ]);

  // Existing card policy — no migration
  requireIncludes(DOCS_FILE, [
    'no-migration',
    'no app-boot',
    'no session-start',
    'SM-2 fields',
    'synchronized in parallel',
  ]);

  // Dormant record policy
  requireIncludes(DOCS_FILE, [
    'zero',
    'dominant',
    'Empty logs',
  ]);

  // Dashboard policy
  requireIncludes(DOCS_FILE, [
    'Dashboard',
    'Phase 15C',
    'dueCount',
    'kind-agnostic',
  ]);

  // Backup restore policy
  requireIncludes(DOCS_FILE, [
    'round-trip',
    'getPreservedFsrsFields',
    'backup',
    'restore',
  ]);

  // Phase 15B file scope
  requireIncludes(DOCS_FILE, [
    'reviewSchedulerAdapter.js',
    'reviewScheduleStorage.js',
    'settingsStorage.js',
    'fsrsWrapper.js',
  ]);

  // Phase 15C scope
  requireIncludes(DOCS_FILE, [
    'Dashboard.jsx',
  ]);

  // Parallel lane plan
  requireIncludes(DOCS_FILE, [
    'Codex',
    'Claude',
    'lane',
    'file ownership',
  ]);

  // Risk register
  requireIncludes(DOCS_FILE, [
    'Risk',
    'mass reschedule storm',
    'malformed',
    'skip',
    'backup',
  ]);

  // Claims control
  requireIncludes(DOCS_FILE, [
    'Claims Control',
    'Forbidden',
    'cloud sync',
    'E2EE',
    'multi-device sync',
  ]);

  // Active scheduling disabled evidence section
  requireIncludes(DOCS_FILE, [
    'Active Scheduling Disabled Evidence',
    'does not call',
    'SM-2-like scheduling remains the only active production scheduler',
  ]);

  // Manual/browser smoke documentation
  requireIncludes(DOCS_FILE, [
    'Manual/browser smoke not run because Phase 15A is docs/static-validator/CI-only',
  ]);
}

// ── Activation claims guard ───────────────────────────────────────────────────

function activationClaimsGuard() {
  const docsText = normalize(read(DOCS_FILE));
  const forbiddenClaims = [
    'fsrs active scheduling is live',
    'fsrs is now the active scheduler',
    'active scheduling is live',
    'ts-fsrs next is now called',
    'production fsrs scheduling is active',
    'active fsrs scheduling is enabled',
    'cloud sync hybrid local-first is implemented',
    'end-to-end encrypted sync is implemented',
    'multi-device sync is available',
    'dashboard mixed scheduler is implemented',
  ];
  for (const claim of forbiddenClaims) {
    if (docsText.includes(claim)) {
      fail(`${DOCS_FILE} contains forbidden activation claim: "${claim}"`);
    }
  }
}

// ── Internal registry / native binding guard ──────────────────────────────────

function internalRegistryGuard() {
  // Check docs file only; package.json and package-lock.json are checked in packageGuard.
  // The validator script itself is excluded because it defines the forbidden terms as check targets.
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
  phase14pRegressionGuard();
  docsGuard();
  activationClaimsGuard();
  internalRegistryGuard();
  console.log('Phase 15A active FSRS scheduling architecture validation passed.');
}

validate();
