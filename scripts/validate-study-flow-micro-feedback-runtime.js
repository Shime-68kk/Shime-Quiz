import fs from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
  'docs/study-flow-micro-feedback-runtime.md',
  'docs/study-flow-micro-feedback-plan.md',
  'src/routes/StudyRoom.jsx',
  'src/components/study/StudyResultSummary.jsx',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
  'docs/phase12-roadmap-risk-register.md',
  '.github/workflows/e2e-smoke.yml'
];

const allowedChangedFiles = new Set([
  // Phase 14B compatibility: allow only the approved internal/test-only
  // FSRS wrapper prototype files and exact ts-fsrs package metadata.
  'package.json',
  'package-lock.json',
  'docs/phase14b-fsrs-wrapper-test-prototype.md',
  'scripts/validate-phase14b-fsrs-wrapper.js',
  'src/quiz/fsrsWrapper.js',
  'tests/unit/fsrsWrapper.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 14C compatibility: allow only the approved FSRS persistence
  // backup harness files while preserving older phase guardrails.
  'docs/phase14c-fsrs-persistence-backup-harness.md',
  'scripts/validate-phase14c-fsrs-persistence-harness.js',
  'src/state/reviewScheduleStorage.js',
  'tests/unit/fsrsPersistenceHarness.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 14D compatibility: allow only the approved developer-gated
  // FSRS adapter routing files while preserving older phase guardrails.
  'docs/phase14f-fsrs-experimental-toggle-plan.md',
  'scripts/validate-phase14f-toggle-plan.js',
  'docs/phase14e-fsrs-user-facing-entry-decision.md',
  'scripts/validate-phase14e-fsrs-user-facing-entry.js',
  'docs/phase14d-developer-gated-fsrs-adapter-routing.md',
  'scripts/validate-phase14d-fsrs-adapter-routing.js',
  'src/quiz/reviewSchedulerAdapter.js',
  'tests/unit/reviewSchedulerAdapter.phase14d.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 14A compatibility: allow only the approved scheduler adapter
  // boundary scaffolding files while preserving older phase guardrails.
  'docs/phase14a-scheduler-adapter-boundary.md',
  'scripts/validate-phase14a-scheduler-adapter.js',
  'src/quiz/reviewSchedulerAdapter.js',
  'src/state/reviewScheduleStorage.js',
  'tests/unit/reviewSchedulerAdapter.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 13D compatibility: allow only the approved FSRS entry
  // decision docs/static-validator/CI files while preserving older
  // phase guardrails.
  'docs/phase13-closure-fsrs-entry-decision.md',
  'docs/phase14-fsrs-implementation-scope.md',
  'docs/phase14-risk-and-validation-plan.md',
  'scripts/validate-phase13-closure.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 13C compatibility: allow only the approved local adaptive
  // learning roadmap docs/static-validator files while preserving older
  // phase guardrails.
  'docs/phase13-local-adaptive-learning-roadmap.md',
  'docs/phase13-intelligence-layer-boundaries.md',
  'docs/phase13-phase14-plus-roadmap.md',
  'scripts/validate-phase13-local-adaptive-roadmap.js',

  // Phase 13B compatibility: allow only the approved FSRS migration
  // architecture docs/static-validator/CI files while preserving older
  // phase guardrails.
  'docs/phase13-fsrs-migration-architecture.md',
  'docs/phase13-fsrs-data-model-plan.md',
  'docs/phase13-fsrs-risk-register.md',
  'scripts/validate-phase13-fsrs-plan.js',


  // Phase 12J compatibility: allow only the approved closure/release-decision
  // docs/static-validator/CI files while preserving older phase guardrails.
  '.github/workflows/e2e-smoke.yml',
  // Phase 13A compatibility: allow only the approved current review
  // engine audit docs/static-validator/CI files while preserving this
  // historical validator's existing scope guardrails.
  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/deployment-readiness.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/phase12-closure-release-decision.md',
  'scripts/validate-phase12-closure-release-decision.js',
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
  'scripts/validate-phase12-roadmap-risk-register.js',
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
  // Phase 14F-HF1 compatibility — exact files only
  'package.json',
  'package-lock.json',
  'scripts/validate-v2-release-hardening.js',
  'docs/phase14f-hf1-baseline-validation-recovery.md',
  'scripts/validate-phase14f-hf1-baseline-validation-recovery.js',
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
  // Phase 14I compatibility — exact files only
  'docs/phase14i-fsrs-two-step-rating-ui-fixture.md',
  'scripts/validate-phase14i-fsrs-two-step-fixture.js',
  'src/components/study/FsrsTwoStepScaffold.jsx',
  'src/routes/FsrsUiFixture.jsx',
  'tests/unit/fsrsTwoStepScaffold.test.jsx',
  // Phase 14J compatibility — exact files only
  'src/quiz/reviewSchedulerAdapter.js',
  'docs/phase14j-fsrs-enrollment-readiness-harness.md',
  'scripts/validate-phase14j-fsrs-enrollment-readiness.js',
  'tests/unit/fsrsEnrollmentReadinessHarness.test.js',
  // Phase 14K exact files (forward compatibility)
  'docs/phase14k-fsrs-readiness-audit.md',
  'scripts/validate-phase14k-fsrs-readiness-audit.js',
  // Phase 14L exact files (forward compatibility)
  'docs/phase14l-production-enrollment-wiring-dormant-no-ui.md',
  'scripts/validate-phase14l-production-enrollment-wiring.js',
  'tests/unit/fsrsProductionEnrollmentWiring.test.js',
  'src/state/reviewScheduleStorage.js',
  // Phase 14M exact files (forward compatibility)
  'docs/phase14m-fsrs-metadata-backup-import-export-hardening.md',
  'scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js',
  'tests/unit/fsrsMetadataBackupImportExportHardening.test.js',
  // Phase 14N exact files (forward compatibility)
  'docs/phase14n-production-studyroom-two-step-memory-rating-bridge.md',
  // Phase 14O exact files (forward compatibility)
  'docs/phase14o-fsrs-active-scheduling-decision-gate.md',
  'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js',
  // Phase 14P exact files (forward compatibility)
  'docs/phase14p-fsrs-foundation-closure-phase15-handoff.md',
  'scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js',
  // Phase 15A exact files (forward compatibility)
  'docs/phase15a-fsrs-active-scheduling-architecture.md',
  'scripts/validate-phase15a-fsrs-active-scheduling-architecture.js',
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
  'scripts/validate-phase14n-production-studyroom-two-step-bridge.js',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/routes/StudyRoom.jsx',
  'tests/unit/fsrsProductionStudyRoomTwoStepBridge.test.jsx',
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
  // Phase 15H exact files (forward compatibility)
  'docs/phase15h-fsrs-foundation-closure-phase16-readiness.md',
  'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js',

  // Phase 16A allowlist entries (Vietnamese-first UX copy alignment)
  'docs/phase16a-vietnamese-first-ux-copy-alignment.md',
  'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js',
  'tests/unit/vietnameseFirstUxCopyAlignment.test.js',
  'tests/unit/fsrsStudyRoomCopyUxAlignment.test.jsx',
  'src/routes/Home.jsx',
  'src/routes/Dashboard.jsx',
  'src/routes/StudyRoom.jsx',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/components/settings/FsrsExperimentalSettingsPanel.jsx',
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
]);

const forbiddenFiles = ['package.json', 'package-lock.json', 'vite.config.js', 'vite.config.mjs', 'playwright.config.js'];
const forbiddenPrefixes = ['e2e/', 'tests/', '__tests__/'];
const generatedArtifacts = ['node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD'];
const internalRegistryTerms = ['applied-caas', 'artifactory', 'internal.api.openai', 'packages.applied'];


function isNegatedBoundaryLine(line) {
  const normalized = String(line || '').toLowerCase();
  return (
    /:\s*no\b/.test(normalized) ||
    /\bno\b/.test(normalized) ||
    /\bnot\b/.test(normalized) ||
    /\bunchanged\b/.test(normalized) ||
    /\bdoes not\b/.test(normalized) ||
    /\bwithout\b/.test(normalized) ||
    /\bnon-goal\b/.test(normalized) ||
    /\bforbidden\b/.test(normalized) ||
    /\bplanned-only\b/.test(normalized)
  );
}


function fail(message) {
  console.error(`Phase 12I validation failed: ${message}`);
  process.exit(1);
}
function warn(message) { console.warn(`Phase 12I validation warning: ${message}`); }
function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}
function normalize(text) {
  return String(text).toLowerCase().replace(/[“”`*_()[\]/]+/g, ' ').replace(/[\u2010-\u2015]/g, '-').replace(/\s+/g, ' ').trim();
}
function requireIncludes(file, terms) {
  const text = normalize(read(file));
  for (const term of terms) {
    if (!text.includes(normalize(term))) fail(`${file} must mention: ${term}`);
  }
}
function requireAny(file, label, patterns) {
  const text = normalize(read(file));
  if (!patterns.some(pattern => text.includes(normalize(pattern)))) {
    fail(`${file} must mention ${label}; accepted wording: ${patterns.join(' | ')}`);
  }
}
function runGit(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
  } catch {
    if (!options.silent) warn(`Git command failed; scope check may be limited: ${command}`);
    return '';
  }
}
function splitLines(output) { return output ? output.split(/\r?\n/).map(line => line.trim()).filter(Boolean) : []; }
function uniqueSorted(files) { return [...new Set(files)].sort((a, b) => a.localeCompare(b)); }
function changedFilesFromPullRequestBase() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (!baseRef) return [];
  runGit(`git fetch --no-tags --depth=1 origin ${baseRef}`, { silent: true });
  const mergeBase = runGit(`git merge-base HEAD origin/${baseRef}`, { silent: true });
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
  const prFiles = changedFilesFromPullRequestBase();
  if (prFiles.length > 0) return uniqueSorted(prFiles);
  return uniqueSorted(changedFilesFromLocalFallbacks({ includeUntracked }));
}
function trackedFiles() { return uniqueSorted(splitLines(runGit('git ls-files', { silent: true }))); }

function scopeGuard() {
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (allowedChangedFiles.has(file)) continue;
    if (forbiddenFiles.includes(file)) fail(`Forbidden file changed in Phase 12I: ${file}`);
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed in Phase 12I: ${file}`);
    if (file.startsWith('src/') && !allowedChangedFiles.has(file)) fail(`Unexpected runtime file changed in Phase 12I: ${file}`);
    if (!file.startsWith('src/') && !allowedChangedFiles.has(file)) fail(`Unexpected changed file for Phase 12I: ${file}`);
  }
}
function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
  }
}
function packageRegistryGuard() {
  for (const file of ['package.json', 'package-lock.json']) {
    const text = read(file);
    for (const term of internalRegistryTerms) {
      if (text.includes(term)) fail(`Internal registry marker found in ${file}: ${term}`);
    }
  }
}
function forbiddenRuntimePatternGuard() {
  const studyRoom = read('src/routes/StudyRoom.jsx');
  if (studyRoom.includes('window.confirm')) fail('StudyRoom must not use native window.confirm for Phase 12I session actions.');
  if (!studyRoom.includes('pendingSessionAction')) fail('StudyRoom must include inline pending session action confirmation state.');
  if (!studyRoom.includes('requestFinishSession')) fail('StudyRoom must route finish through recovered session action handler.');
  if (!studyRoom.includes('requestRestartSession')) fail('StudyRoom must route restart through recovered session action handler.');
  if (!studyRoom.includes('confirmPendingSessionAction')) fail('StudyRoom must expose inline confirmation handler.');
  if (!studyRoom.includes('aria-live="polite"')) fail('StudyRoom must expose polite live feedback for micro-feedback/status.');
  if (!studyRoom.includes("navigate('/dashboard')")) fail('StudyRoom must include direct Dashboard/overview navigation recovery.');
  const summary = read('src/components/study/StudyResultSummary.jsx');
  if (!summary.includes('onGoToDashboard')) fail('StudyResultSummary must expose Dashboard/overview action.');
  if (!summary.includes('Quay về thư viện')) fail('StudyResultSummary must preserve Library navigation.');
  if (!summary.includes('Làm lại phiên học')) fail('StudyResultSummary must preserve restart action.');
}
function workflowGuard() {
  const workflow = read('.github/workflows/e2e-smoke.yml');
  const required = [
    'npm run test:unit',
    'node scripts/validate-study-flow-micro-feedback-plan.js',
    'node scripts/validate-study-flow-micro-feedback-runtime.js',
    'node scripts/validate-vitest-unit-test-foundation.js',
    'node scripts/validate-unit-test-foundation-plan.js',
    'node scripts/validate-dashboard-today-card-runtime.js',
    'node scripts/validate-storage-quota-warning-runtime.js',
    'npm run test:e2e:smoke',
    'npm run test:e2e:onboarding',
    'actions/upload-artifact'
  ];
  for (const term of required) if (!workflow.includes(term)) fail(`Workflow missing required check: ${term}`);
  if (workflow.includes('continue-on-error: true')) fail('Workflow must not add broad continue-on-error.');
}
function claimsGuard() {
  const claimFiles = ['README.md', 'RELEASE_QA_V2.md', 'docs/study-flow-micro-feedback-runtime.md', 'docs/public-release-notes.md', 'docs/deployment-readiness.md'];
  const forbidden = ['scoring changed', 'SRT changed', 'mastery changed', 'recommendation algorithm changed', 'retention improved', 'FSRS implemented', 'IndexedDB implemented', 'cloud/account sync implemented', 'release package created', 'release tag created', 'GitHub Release published'];
  const safeMarkers = ['not', 'no ', 'does not', 'do not', 'unchanged', 'forbidden', 'non-goal', 'non-goals', 'without', 'do not claim'];
  for (const file of claimFiles) {
    let inSafeList = false;
    for (const line of read(file).split(/\r?\n/)) {
      const normalizedLine = normalize(line);
      if (normalizedLine.includes('forbidden claims') || normalizedLine.includes('do not claim') || normalizedLine.includes('non-goals')) inSafeList = true;
      else if (/^##\s+/.test(line) && inSafeList) inSafeList = false;
      if (inSafeList) continue;
      for (const phrase of forbidden) {
        if (normalizedLine.includes(normalize(phrase)) && !safeMarkers.some(marker => normalizedLine.includes(marker))) {
          if (isNegatedBoundaryLine(line)) continue;
          fail(`Unsupported overclaim in ${file}: ${line.trim()}`);
        }
      }
    }
  }
}

function validate() {
  for (const file of requiredFiles) read(file);
  requireIncludes('docs/study-flow-micro-feedback-runtime.md', [
    'Phase 12I',
    'Study Flow Micro-feedback Runtime',
    'Phase 12H',
    'local-first',
    'browser-local',
    'Hoàn thành phiên học',
    'Làm lại phiên học',
    'inline confirmation',
    'micro-feedback',
    'aria-live',
    'algorithm and data boundaries',
    'No answer correctness',
    'No package',
    'Phase 12J'
  ]);
  requireAny('README.md', 'Phase 12I runtime reference', ['Phase 12I Study Flow Micro-feedback Runtime']);
  requireAny('RELEASE_QA_V2.md', 'Phase 12I release QA section', ['Phase 12I — Study Flow Micro-feedback Runtime']);
  requireAny('docs/public-release-notes.md', 'Phase 12I public note', ['Phase 12I Study Flow micro-feedback runtime']);
  requireAny('docs/deployment-readiness.md', 'Phase 12I deployment note', ['Phase 12I Study Flow runtime deployment note']);
  requireAny('docs/phase12-roadmap-risk-register.md', 'Phase 12I roadmap note', ['Phase 12I follow-up — Study Flow Micro-feedback Runtime']);
  forbiddenRuntimePatternGuard();
  workflowGuard();
  scopeGuard();
  generatedArtifactGuard();
  packageRegistryGuard();
  claimsGuard();
  console.log('Phase 12I Study Flow Micro-feedback Runtime validation passed.');
}

validate();
