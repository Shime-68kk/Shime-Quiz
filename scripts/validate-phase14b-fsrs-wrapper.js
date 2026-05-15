#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE = 'docs/phase14b-fsrs-wrapper-test-prototype.md';
const WRAPPER_SOURCE = 'src/quiz/fsrsWrapper.js';
const WRAPPER_TEST = 'tests/unit/fsrsWrapper.test.js';
const VALIDATOR_SCRIPT = 'scripts/validate-phase14b-fsrs-wrapper.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const ADAPTER_SOURCE = 'src/quiz/reviewSchedulerAdapter.js';
const STORAGE_SOURCE = 'src/state/reviewScheduleStorage.js';

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const requiredFiles = [
  DOCS_FILE,
  WRAPPER_SOURCE,
  WRAPPER_TEST,
  VALIDATOR_SCRIPT,
  WORKFLOW_FILE
];

const coreAllowedChangedFiles = new Set([
  'package.json',
  'package-lock.json',
  DOCS_FILE,
  WRAPPER_SOURCE,
  WRAPPER_TEST,
  VALIDATOR_SCRIPT,
  WORKFLOW_FILE
]);

const historicalValidatorCompatibilityFiles = new Set([
  'docs/phase14f-fsrs-experimental-toggle-plan.md',
  'scripts/validate-phase14f-toggle-plan.js',
  'docs/phase14e-fsrs-user-facing-entry-decision.md',
  'scripts/validate-phase14e-fsrs-user-facing-entry.js',
  'docs/phase14d-developer-gated-fsrs-adapter-routing.md',
  'src/quiz/reviewSchedulerAdapter.js',
  'tests/unit/reviewSchedulerAdapter.phase14d.test.js',
  'scripts/validate-phase14d-fsrs-adapter-routing.js',
  'docs/phase14c-fsrs-persistence-backup-harness.md',
  'tests/unit/fsrsPersistenceHarness.test.js',
  'scripts/validate-phase14c-fsrs-persistence-harness.js',
  'src/state/reviewScheduleStorage.js',
  'scripts/validate-phase14a-scheduler-adapter.js',
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

const internalRegistryTerms = ['applied-caas', 'artifactory', 'internal.api.openai', 'packages.applied'];

function fail(message) {
  console.error(`Phase 14B FSRS wrapper validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 14B FSRS wrapper validation warning: ${message}`);
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
  const normalizedText = normalize(read(file));
  for (const term of terms) {
    if (!normalizedText.includes(normalize(term))) fail(`${file} must mention: ${term}`);
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  if (!text.includes('node scripts/validate-phase14b-fsrs-wrapper.js')) {
    fail(`${WORKFLOW_FILE} must run node scripts/validate-phase14b-fsrs-wrapper.js`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

function packageGuard() {
  const pkg = readJson('package.json');
  const lock = readJson('package-lock.json');
  const dependencyVersion = pkg.dependencies?.['ts-fsrs'];

  if (!dependencyVersion) fail('package.json must include direct dependency ts-fsrs');
  if (/^[~^]/.test(dependencyVersion)) fail('ts-fsrs must be exact pinned with no ^ or ~');
  if (dependencyVersion !== '5.3.3') fail(`ts-fsrs must be pinned to the installed 5.3.3 version, got ${dependencyVersion}`);

  const rootLockVersion = lock.packages?.['']?.dependencies?.['ts-fsrs'];
  if (rootLockVersion !== dependencyVersion) fail('package-lock root dependency for ts-fsrs must match package.json');
  if (lock.packages?.['node_modules/ts-fsrs']?.version !== dependencyVersion) {
    fail('package-lock must include node_modules/ts-fsrs at the exact package.json version');
  }

  const baselineText = runGit('git show origin/main:package.json', { silent: true });
  if (baselineText) {
    const baseline = JSON.parse(baselineText);
    const beforeDeps = baseline.dependencies || {};
    const afterDeps = pkg.dependencies || {};
    const newDeps = Object.keys(afterDeps).filter(name => !Object.prototype.hasOwnProperty.call(beforeDeps, name));
    // Phase 14F-HF1 exemption: vite and @vitejs/plugin-react are pinned away from "latest"
    // to fix the vite 8 + rolldown RC incompatibility. These are infrastructure version pins,
    // not new runtime deps — exempt them from the baseline-diff check.
    const hf1ExemptDeps = new Set(['vite', '@vitejs/plugin-react']);
    const changedExistingDeps = Object.keys(beforeDeps).filter(
      name => afterDeps[name] !== beforeDeps[name] && !hf1ExemptDeps.has(name)
    );
    if (newDeps.length > 0) {
      if (newDeps.length !== 1 || newDeps[0] !== 'ts-fsrs') {
        fail(`Only ts-fsrs may be added as a new direct runtime dependency; got ${newDeps.join(', ')}`);
      }
    } else if (!afterDeps['ts-fsrs']) {
      fail('ts-fsrs must be present in package.json dependencies after Phase 14B merge');
    }
    if (changedExistingDeps.length > 0) fail(`Existing dependencies changed unexpectedly: ${changedExistingDeps.join(', ')}`);
    if (JSON.stringify(pkg.devDependencies || {}) !== JSON.stringify(baseline.devDependencies || {})) {
      fail('devDependencies must remain unchanged in Phase 14B');
    }
  }

  for (const file of ['package.json', 'package-lock.json']) {
    const text = read(file);
    if (text.includes(bindingPackage)) fail(`${file} must not include native binding dependency`);
    for (const term of internalRegistryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }
}

function scopeGuard() {
  const allowedChangedFiles = new Set([...coreAllowedChangedFiles, ...historicalValidatorCompatibilityFiles]);
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (allowedChangedFiles.has(file)) continue;
    if (file === ADAPTER_SOURCE) fail(`${ADAPTER_SOURCE} must remain unchanged in Phase 14B`);
    if (file === STORAGE_SOURCE) fail(`${STORAGE_SOURCE} must remain unchanged in Phase 14B`);
    if (file === 'src/routes/StudyRoom.jsx') fail('Study Room UI must not change in Phase 14B');
    if (file === 'src/routes/Dashboard.jsx') fail('Dashboard UI must not change in Phase 14B');
    if (file.startsWith('e2e/')) fail(`E2E file changed without Phase 14B approval: ${file}`);
    if (/^src\/.*(backup|restore|import|export|migration)/i.test(file)) {
      fail(`Backup/import/export or storage migration source changed unexpectedly: ${file}`);
    }
    if (file.startsWith('src/') && file !== WRAPPER_SOURCE) fail(`Unexpected src/ file changed: ${file}`);
    if (file.startsWith('tests/') && file !== WRAPPER_TEST) fail(`Unexpected tests/ file changed: ${file}`);
    if (file.startsWith('docs/') && file !== DOCS_FILE) fail(`Unexpected docs/ file changed: ${file}`);
    if (file.startsWith('scripts/') && !allowedChangedFiles.has(file)) fail(`Unexpected script changed: ${file}`);
    if (!allowedChangedFiles.has(file)) fail(`Unexpected changed file for Phase 14B scope: ${file}`);
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

function docsContentGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 14B',
    'ts-fsrs',
    'exact-pinned',
    'internal/test-only',
    'not user-facing',
    'no production routing',
    'Study Room',
    'Dashboard',
    'localStorage',
    'backup/export/import',
    'no existing-card migration',
    'binary correct/wrong',
    'easeFactor',
    'FSRS difficulty',
    'Phase 14C',
    'native open-spaced-repetition binding package is not installed'
  ]);

  const unsafeClaims = [
    'FSRS is user-facing',
    'FSRS production scheduling is enabled',
    'FSRS is available to users',
    'Study Room supports FSRS ratings',
    'Dashboard reads mixed FSRS',
    'backup/export/import supports FSRS',
    'existing records are migrated to FSRS',
    'adaptive learning is implemented',
    'AI is implemented',
    'sync is implemented',
    'IndexedDB migration is implemented',
    'encryption is implemented',
    'OCR is implemented'
  ];
  const safeMarkers = [
    'not',
    'no ',
    'does not',
    'do not',
    'must not',
    'internal/test-only',
    'test-only',
    'not claim',
    'future',
    'later',
    'phase 14c'
  ];

  for (const [index, line] of read(DOCS_FILE).split(/\r?\n/).entries()) {
    const normalizedLine = normalize(line);
    const safe = safeMarkers.some(marker => normalizedLine.includes(normalize(marker)));
    for (const claim of unsafeClaims) {
      if (normalizedLine.includes(normalize(claim)) && !safe) {
        fail(`Unsafe implementation claim in ${DOCS_FILE}:${index + 1}: ${line.trim()}`);
      }
    }
  }
}

function wrapperSourceGuard() {
  const source = read(WRAPPER_SOURCE);
  const normalizedSource = normalize(source);
  if (!/from\s+['"]ts-fsrs['"]/i.test(source)) fail(`${WRAPPER_SOURCE} must import ts-fsrs`);
  for (const forbidden of ['localStorage', 'reviewScheduleStorage', 'reviewSchedulerAdapter', '../state/', '../utils/storage']) {
    if (source.includes(forbidden)) fail(`${WRAPPER_SOURCE} must not import or use production storage/adapter term: ${forbidden}`);
  }
  for (const term of [
    'FSRS_TEST_SCHEDULER_KIND',
    'fsrs-v4-test',
    'FSRS_TEST_SCHEDULER_VERSION',
    'createFsrsSeedCardForTest',
    'scheduleFsrsReviewForTest',
    'serializeFsrsCard',
    'serializeFsrsReviewLog',
    'validateFsrsPayload',
    'getFsrsDueStatusForTest',
    'createEmptyCard',
    'generatorParameters',
    'Rating',
    'State',
    'scheduler.next',
    'toISOString',
    'fsrsPayload'
  ]) {
    if (!normalizedSource.includes(normalize(term))) fail(`${WRAPPER_SOURCE} must include wrapper term: ${term}`);
  }
}

function unitTestGuard() {
  const text = read(WRAPPER_TEST);
  const normalizedText = normalize(text);
  const phase15bApplied = read(ADAPTER_SOURCE).includes('fsrsActiveSchedulingEnabled');
  for (const term of [
    'Again',
    'Hard',
    'Good',
    'Easy',
    'does not mutate',
    'localStorage',
    'scheduleReview',
    'FSRS scheduling is not implemented in Phase 14A',
    'getFsrsDueStatusForTest',
    'invalid FSRS payloads',
    'serializeFsrsCard'
  ]) {
    if (term === 'FSRS scheduling is not implemented in Phase 14A' && phase15bApplied) continue;
    if (!normalizedText.includes(normalize(term))) fail(`${WRAPPER_TEST} must cover: ${term}`);
  }
  if (text.includes('?raw')) fail(`${WRAPPER_TEST} must not use import ?raw`);
}

function productionRouteGuard() {
  const adapter = read(ADAPTER_SOURCE);
  if (!adapter.includes('FSRS scheduling is not implemented in Phase 14A') &&
      !adapter.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${ADAPTER_SOURCE} must still reject planned FSRS scheduling`);
  }
  if (/from\s+['"]ts-fsrs['"]/i.test(adapter)) fail(`${ADAPTER_SOURCE} must not import ts-fsrs`);

  const storage = read(STORAGE_SOURCE);
  if (/from\s+['"]ts-fsrs['"]/i.test(storage)) fail(`${STORAGE_SOURCE} must not import ts-fsrs`);
  if (/fsrs-v4-test/i.test(storage)) fail(`${STORAGE_SOURCE} must not persist Phase 14B FSRS test scheduler kind`);
}

function bindingReferenceGuard() {
  for (const file of ['package.json', 'package-lock.json', WRAPPER_SOURCE, WRAPPER_TEST]) {
    if (read(file).includes(bindingPackage)) fail(`${file} must not reference native binding package`);
  }
}

function validate() {
  for (const file of requiredFiles) read(file);
  workflowGuard();
  packageGuard();
  scopeGuard();
  generatedArtifactGuard();
  docsContentGuard();
  wrapperSourceGuard();
  unitTestGuard();
  productionRouteGuard();
  bindingReferenceGuard();
  console.log('Phase 14B FSRS wrapper test prototype validation passed.');
}

validate();
