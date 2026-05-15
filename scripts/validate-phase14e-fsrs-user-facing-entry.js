#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE = 'docs/phase14e-fsrs-user-facing-entry-decision.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase14e-fsrs-user-facing-entry.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';

const STUDY_ROOM = 'src/routes/StudyRoom.jsx';
const DASHBOARD = 'src/routes/Dashboard.jsx';
const ADAPTER_SOURCE = 'src/quiz/reviewSchedulerAdapter.js';
const WRAPPER_SOURCE = 'src/quiz/fsrsWrapper.js';
const STORAGE_SOURCE = 'src/state/reviewScheduleStorage.js';
const MASTERY_MODEL = 'src/analytics/masteryModel.js';
const MASTERY_SOURCE = 'src/quiz/mastery.js';

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const phase14eAllowedChangedFiles = new Set([
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  WORKFLOW_FILE,

  // Historical validator compatibility: exact validator files only. These
  // files may be updated to allow the Phase 14E docs/static-validator/CI scope.
  'docs/phase14f-fsrs-experimental-toggle-plan.md',
  'scripts/validate-phase14f-toggle-plan.js',
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

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied'
];

const forbiddenRuntimeFiles = new Set([
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'playwright.config.js',
  STUDY_ROOM,
  DASHBOARD,
  ADAPTER_SOURCE,
  WRAPPER_SOURCE,
  STORAGE_SOURCE,
  MASTERY_MODEL,
  MASTERY_SOURCE,
  'src/quiz/spacedRepetition.js',
  'src/quiz/weightedSelection.js',
  'src/learning/weightedPracticeSelector.js',
  'src/quiz/dataBackup.js',
  'src/state/v2BackupRestore.js',
  'src/data/libraryExport.js'
]);

function fail(message) {
  console.error(`Phase 14E FSRS user-facing entry validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 14E FSRS user-facing entry validation warning: ${message}`);
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
    .replace(/[\u2010-\u2015]/g, '-')
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

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  for (const validator of [
    'node scripts/validate-phase14b-fsrs-wrapper.js',
    'node scripts/validate-phase14c-fsrs-persistence-harness.js',
    'node scripts/validate-phase14d-fsrs-adapter-routing.js',
    'node scripts/validate-phase14e-fsrs-user-facing-entry.js'
  ]) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

function packageGuard() {
  const pkg = readJson('package.json');
  readJson('package-lock.json');
  const dependencyVersion = pkg.dependencies?.['ts-fsrs'];
  if (dependencyVersion !== '5.3.3') fail(`ts-fsrs must remain exact-pinned at 5.3.3, got ${dependencyVersion || 'none'}`);

  for (const file of ['package.json', 'package-lock.json']) {
    const text = read(file);
    if (text.includes(bindingPackage)) fail(`${file} must not contain native binding dependency`);
    for (const term of internalRegistryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (phase14eAllowedChangedFiles.has(file)) continue;
    if (forbiddenRuntimeFiles.has(file)) fail(`Forbidden Phase 14E file changed: ${file}`);
    if (file.startsWith('src/')) fail(`Runtime source changed in Phase 14E: ${file}`);
    if (file.startsWith('tests/')) fail(`Test file changed in Phase 14E: ${file}`);
    if (file.startsWith('e2e/')) fail(`E2E file changed in Phase 14E: ${file}`);
    if (file.startsWith('docs/')) fail(`Unexpected docs file changed in Phase 14E: ${file}`);
    if (file.startsWith('scripts/validate-')) fail(`Unexpected validator changed without exact Phase 14E allowlist: ${file}`);
    fail(`Unexpected changed file for Phase 14E scope: ${file}`);
  }
}

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 14E',
    'docs/static-validator/CI only',
    'does not change runtime behavior',
    'Two-Step Evaluation',
    'objective correctness',
    'subjective memory rating',
    'scoring',
    'mastery',
    'progress',
    'FSRS only',
    'must not auto-map correct -> Good',
    'Phase 14D',
    'test-only wiring',
    'wrong or unanswered',
    'auto-lock',
    'Again',
    'Hard, Good, and Easy only',
    'Again is not offered',
    'experimental',
    'defaults OFF',
    'new-card-only',
    'Existing SM-2-like heuristic records must never be automatically migrated',
    'Missing schedulerKind',
    'current SM-2-like heuristic scheduler',
    'backup/import/export',
    'Phase 14C',
    'Future Phase Split',
    'Phase 14F',
    'Phase 14G',
    'Phase 14H',
    'Phase 14I',
    'FSRS is user-facing, because that is not implemented',
    'Production FSRS scheduling is enabled, because that is not implemented',
    'Study Room supports Again/Hard/Good/Easy rating UI, because that is not implemented',
    'Dashboard supports mixed scheduler due counts, because that is not implemented'
  ]);
}

function unsafeClaimGuard() {
  const unsafeClaims = [
    'FSRS is user-facing',
    'FSRS production scheduling is enabled',
    'Production FSRS scheduling is enabled',
    'FSRS is available to users',
    'Study Room supports Again Hard Good Easy',
    'Study Room supports FSRS ratings',
    'Dashboard supports mixed scheduler due counts',
    'Dashboard supports FSRS due counts',
    'existing SM-2 records are migrated',
    'existing records are migrated',
    'correct Good is production',
    'wrong Again is production',
    'adaptive learning is implemented',
    'AI is implemented',
    'sync is implemented',
    'IndexedDB migration is implemented',
    'encryption is implemented',
    'OCR is implemented'
  ];

  const safeMarkers = [
    'must not',
    'does not',
    'not implemented',
    'not enabled',
    'not user-facing',
    'not production',
    'no user-facing',
    'no production',
    'never',
    'prohibited',
    'forbidden',
    'future',
    'planned',
    'later',
    'test only',
    'developer test only',
    'because that is not implemented',
    'must not be claimed'
  ].map(normalize);

  for (const [index, line] of read(DOCS_FILE).split(/\r?\n/).entries()) {
    const normalizedLine = normalize(line);
    const safe = safeMarkers.some(marker => normalizedLine.includes(marker));
    for (const claim of unsafeClaims) {
      if (normalizedLine.includes(normalize(claim)) && !safe) {
        fail(`Unsafe claim in ${DOCS_FILE}:${index + 1}: ${line.trim()}`);
      }
    }
  }
}

function runtimeIsolationGuard() {
  const runtimeFiles = [
    STUDY_ROOM,
    DASHBOARD,
    ADAPTER_SOURCE,
    WRAPPER_SOURCE,
    STORAGE_SOURCE,
    MASTERY_MODEL,
    MASTERY_SOURCE
  ];

  for (const file of runtimeFiles) read(file);

  const uiCombined = `${read(STUDY_ROOM)}\n${read(DASHBOARD)}`;
  if (/phase14e|phase-14e/i.test(uiCombined)) fail('Study Room and Dashboard must not contain Phase 14E markers');
  if (/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/i.test(uiCombined)) fail('Study Room and Dashboard must not add four-rating FSRS UI copy');
  if (/validate-phase14e|Two-Step Evaluation|auto-lock/i.test(uiCombined)) fail('Study Room and Dashboard must not include Phase 14E decision copy');
}

function validate() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  packageGuard();
  workflowGuard();
  scopeGuard();
  generatedArtifactGuard();
  docsGuard();
  unsafeClaimGuard();
  runtimeIsolationGuard();
  console.log('Phase 14E FSRS user-facing entry decision validation passed.');
}

validate();
