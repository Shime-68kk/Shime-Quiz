#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ADAPTER_SOURCE = 'src/quiz/reviewSchedulerAdapter.js';
const STORAGE_SOURCE = 'src/state/reviewScheduleStorage.js';
const ADAPTER_TEST = 'tests/unit/reviewSchedulerAdapter.test.js';
const DOCS_FILE = 'docs/phase14a-scheduler-adapter-boundary.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase14a-scheduler-adapter.js';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';

const requiredFiles = [ADAPTER_SOURCE, STORAGE_SOURCE, ADAPTER_TEST, DOCS_FILE, VALIDATOR_SCRIPT];

const coreAllowedChangedFiles = new Set([
  ADAPTER_SOURCE,
  STORAGE_SOURCE,
  ADAPTER_TEST,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  WORKFLOW_FILE,

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

const historicalValidatorCompatibilityFiles = new Set([
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
]);

const forbiddenChangedFiles = new Set([
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'vite.config.mjs',
  'playwright.config.js'
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

const registryTerms = ['applied-caas', 'artifactory', 'internal.api.openai', 'packages.applied'];

function fail(message) {
  console.error(`Phase 14A scheduler adapter validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 14A scheduler adapter validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
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
  if (!text.includes('node scripts/validate-phase14a-scheduler-adapter.js')) {
    fail(`${WORKFLOW_FILE} must run node scripts/validate-phase14a-scheduler-adapter.js`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
}

function packageGuard() {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const tsFsrsVersion = pkg.dependencies?.['ts-fsrs'];
  if (tsFsrsVersion && tsFsrsVersion !== '5.3.3') fail('Phase 14B compatibility allows only exact ts-fsrs 5.3.3');
  if (tsFsrsVersion && /^[~^]/.test(tsFsrsVersion)) fail('Phase 14B compatibility requires exact ts-fsrs pinning');
  if (tsFsrsVersion && lock.packages?.['']?.dependencies?.['ts-fsrs'] !== tsFsrsVersion) {
    fail('package-lock root ts-fsrs version must match package.json');
  }
  if (tsFsrsVersion && lock.packages?.['node_modules/ts-fsrs']?.version !== tsFsrsVersion) {
    fail('package-lock must include exact ts-fsrs package metadata');
  }
  for (const file of ['package.json', 'package-lock.json']) {
    const text = file === 'package.json' ? JSON.stringify(pkg) : JSON.stringify(lock);
    for (const term of registryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }
}

function scopeGuard() {
  const allowedChangedFiles = new Set([...coreAllowedChangedFiles, ...historicalValidatorCompatibilityFiles]);
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (allowedChangedFiles.has(file)) continue;
    if (forbiddenChangedFiles.has(file)) fail(`Forbidden file changed: ${file}`);
    if (file.startsWith('e2e/')) fail(`E2E file changed without Phase 14A approval: ${file}`);
    if (file.startsWith('src/') && !coreAllowedChangedFiles.has(file)) fail(`Unexpected src/ file changed: ${file}`);
    if (file.startsWith('tests/') && file !== ADAPTER_TEST) fail(`Unexpected tests/ file changed: ${file}`);
    if (file.startsWith('docs/') && file !== DOCS_FILE) fail(`Unexpected docs/ file changed: ${file}`);
    if (file.startsWith('scripts/') && !allowedChangedFiles.has(file)) fail(`Unexpected scripts/ file changed: ${file}`);
    if (!allowedChangedFiles.has(file)) fail(`Unexpected changed file for Phase 14A scope: ${file}`);
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
    'Phase 14A',
    'adapter boundary',
    'current scheduler',
    'SM-2-like',
    'heuristic',
    'schedulerKind',
    'schedulerVersion',
    'normalized due status',
    'due summary',
    'no FSRS runtime',
    'Study Room',
    'Dashboard',
    'no migration',
    'no backup',
    'no public FSRS claim',
    'easeFactor',
    'FSRS difficulty',
    'binary correct/wrong',
    'review logs',
    'Phase 14B'
  ]);

  const unsafeClaims = [
    'FSRS is implemented',
    'FSRS runtime is available',
    'ts-fsrs is installed',
    'FSRS implemented',
    'adaptive learning is implemented',
    'AI is implemented',
    'sync is implemented',
    'IndexedDB migration is implemented',
    'encryption is implemented',
    'OCR is implemented'
  ];
  const safeMarkers = [
    'not implemented',
    'not installed',
    'does not',
    'do not',
    'must not',
    'no ',
    'future',
    'planned',
    'reserved',
    'later',
    'phase 14b',
    'public claim boundary'
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

function adapterSourceGuard() {
  const source = read(ADAPTER_SOURCE);
  const normalizedSource = normalize(source);
  if (/from\s+['"]ts-fsrs['"]|require\s*\(\s*['"]ts-fsrs['"]\s*\)/i.test(source)) {
    fail(`${ADAPTER_SOURCE} must not import ts-fsrs`);
  }
  for (const term of [
    'SCHEDULER_KIND_CURRENT',
    'SCHEDULER_KIND_FSRS_PLANNED',
    'SCHEDULER_VERSION_CURRENT',
    'getSchedulerKind',
    'getSchedulerVersion',
    'isCurrentSchedulerRecord',
    'getDueStatus',
    'getDueSummary',
    'scheduleCurrentReview',
    'scheduleReview',
    'preserveCurrentRecord',
    'sm2-heuristic',
    'fsrs-planned',
    'createReviewScheduleRecordFromResult'
  ]) {
    if (!normalizedSource.includes(normalize(term))) fail(`${ADAPTER_SOURCE} must include adapter term: ${term}`);
  }
  if (!normalizedSource.includes(normalize('FSRS scheduling is not implemented in Phase 14A')) &&
      !source.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${ADAPTER_SOURCE} must safely reject future FSRS scheduling`);
  }
}

function storageSourceGuard() {
  const source = read(STORAGE_SOURCE);
  if (!source.includes('export function createReviewScheduleRecordFromResult')) {
    fail(`${STORAGE_SOURCE} must expose the narrow pure current-scheduler wrapper`);
  }
  if (!source.includes('return updateRecordFromResult(previousRecord, itemResult, completedAt);')) {
    fail(`${STORAGE_SOURCE} wrapper must delegate to existing updateRecordFromResult logic`);
  }
}

function unitTestGuard() {
  const text = read(ADAPTER_TEST);
  const normalizedText = normalize(text);
  const phase15bApplied = read(ADAPTER_SOURCE).includes('fsrsActiveSchedulingEnabled');
  for (const term of [
    'missing schedulerKind',
    'defaults missing schedulerVersion',
    'getDueStatus',
    'getDueSummary',
    'dueCount',
    'FSRS scheduling is not implemented in Phase 14A',
    'preserves existing correct scheduling behavior',
    'preserves existing wrong scheduling behavior',
    'without schedulerKind working',
    'does not destructively mutate input records'
  ]) {
    if (term === 'FSRS scheduling is not implemented in Phase 14A' && phase15bApplied) continue;
    if (!normalizedText.includes(normalize(term))) fail(`${ADAPTER_TEST} must cover: ${term}`);
  }
}

function validate() {
  for (const file of requiredFiles) read(file);
  workflowGuard();
  packageGuard();
  scopeGuard();
  generatedArtifactGuard();
  docsContentGuard();
  adapterSourceGuard();
  storageSourceGuard();
  unitTestGuard();
  console.log('Phase 14A scheduler adapter boundary validation passed.');
}

validate();
