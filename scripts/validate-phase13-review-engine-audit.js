#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',
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
  // architecture docs/static-validator/CI files while preserving Phase 13A
  // guardrails.
  'docs/phase13-fsrs-migration-architecture.md',
  'docs/phase13-fsrs-data-model-plan.md',
  'docs/phase13-fsrs-risk-register.md',
  'scripts/validate-phase13-fsrs-plan.js',

  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',
  '.github/workflows/e2e-smoke.yml',
  'scripts/validate-backup-transfer-safety-hardening.js',
  'scripts/validate-web-share-runtime-prototype.js',
  'scripts/validate-web-share-runtime-fallback-hardening.js',
  'scripts/validate-web-share-mobile-sharing-prototype-plan.js',
  'scripts/validate-vitest-unit-test-foundation.js',
  'scripts/validate-unit-test-foundation-plan.js',
  'scripts/validate-study-flow-micro-feedback-runtime.js',
  'scripts/validate-study-flow-micro-feedback-plan.js',
  'scripts/validate-storage-quota-warning-runtime.js',
  'scripts/validate-storage-capacity-indexeddb-migration-plan.js',
  'scripts/validate-release-tag-creation-plan.js',
  'scripts/validate-release-package-assembly-plan.js',
  'scripts/validate-release-candidate-tag-publish-gate.js',
  'scripts/validate-release-candidate-freeze-final-decision.js',
  'scripts/validate-phase12-roadmap-risk-register.js',
  'scripts/validate-phase12-closure-release-decision.js',
  'scripts/validate-manual-evidence-run-pack.js',
  'scripts/validate-manual-evidence-results-log.js',
  'scripts/validate-manual-evidence-execution-checklist.js',
  'scripts/validate-github-release-publication-plan.js',
  'scripts/validate-final-release-execution-checklist.js',
  'scripts/validate-final-public-release-readiness-reaudit.js',
  'scripts/validate-final-main-release-authorization.js',
  'scripts/validate-edugen-boundary-polish.js',
  'scripts/validate-dashboard-today-card-ux-plan.js',
  'scripts/validate-dashboard-today-card-runtime.js',
  'scripts/validate-cross-device-export-import.js',
  'scripts/validate-cross-device-transfer-ux-decision.js',
  'scripts/validate-cross-device-transfer-ux-copy.js',
  'scripts/validate-cross-device-transfer-track-closure.js',
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
  'scripts/validate-phase14n-production-studyroom-two-step-bridge.js',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/routes/StudyRoom.jsx',
  'tests/unit/fsrsProductionStudyRoomTwoStepBridge.test.jsx',
]);

const forbiddenChangedFiles = new Set([
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'vite.config.mjs',
  'playwright.config.js',
]);

const forbiddenChangedPrefixes = ['src/', 'e2e/', 'tests/'];
const generatedArtifacts = ['node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD'];
const registryTerms = ['applied-caas', 'artifactory', 'internal.api.openai', 'packages.applied'];

function fail(message) {
  console.error(`Phase 13A review engine audit validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 13A review engine audit validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[`*_()[\]{}:;,.!?"']/g, ' ')
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

function changedFilesFromLocalFallbacks({ includeUntracked = true } = {}) {
  const files = [
    ...splitLines(runGit('git diff --name-only HEAD', { silent: true })),
    ...splitLines(runGit('git diff --cached --name-only', { silent: true })),
  ];
  if (includeUntracked) files.push(...splitLines(runGit('git ls-files --others --exclude-standard', { silent: true })));
  return files;
}

function changedFiles({ includeUntracked = true } = {}) {
  const prBaseFiles = changedFilesFromPullRequestBase();
  if (prBaseFiles.length > 0) return uniqueSorted(prBaseFiles);
  return uniqueSorted(changedFilesFromLocalFallbacks({ includeUntracked }));
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

function auditDocGuard() {
  requireIncludes('docs/phase13-current-review-engine-audit.md', [
    'src/quiz/spacedRepetition.js',
    'src/state/reviewScheduleStorage.js',
    'src/learning/weightedPracticeSelector.js',
    'src/quiz/weightedSelection.js',
    'src/quiz/mastery.js',
    'src/analytics/masteryModel.js',
    'src/routes/StudyRoom.jsx',
    'src/routes/Dashboard.jsx',
    'src/utils/storage.js',
    'src/utils/storageQuotaEstimate.js',
    'easeFactor',
    'intervalDays',
    'repetitionCount',
    'correctStreak',
    'wrongCount',
    'dueAt',
    'lastReviewedAt',
    'quizReviewScheduleV1',
    'shimeV2ReviewScheduleV1',
    'SM-2-like',
    'heuristic',
    'not FSRS',
    'browser-local',
    'local-first',
    'weighted practice',
  ]);
}

function claimBoundaryGuard() {
  requireIncludes('docs/phase13-review-engine-claim-boundaries.md', [
    'Shime has a browser-local review schedule',
    'SM-2-like / heuristic spaced repetition scheduler',
    'weighted practice selection',
    'local/browser storage',
    'future FSRS planning',
    'FSRS is implemented',
    'Glicko-2 is implemented',
    'IRT/adaptive rating is implemented',
    'Transformers.js/local AI is implemented',
    'Semantic search is implemented',
    'PowerSync is implemented',
    'ElectricSQL is implemented',
    'Automatic sync is implemented',
    'Cloud/account sync is implemented',
    'IndexedDB migration is implemented',
    'Encryption is implemented',
    'Built-in AI quiz generation is implemented',
    'External AI/API integration is implemented',
    'API key/BYOK support exists',
    'OCR exists',
    'planned',
    'future',
    'not implemented',
    'not publicly claimable yet',
    'requires separate approved runtime phase',
    'research reference only',
  ]);
}

function lineIsSafe(line) {
  const safeMarkers = [
    'not implemented',
    'not publicly claimable',
    'planned',
    'future',
    'research reference only',
    'requires separate',
    'forbidden',
    'unsafe',
    'avoid',
    'unless',
    'does not',
    'do not',
    'must not',
    'no ',
  ];
  const normalized = normalize(line);
  return safeMarkers.some(marker => normalized.includes(normalize(marker)));
}

function overclaimGuard() {
  const claimFiles = [
    'docs/phase13-current-review-engine-audit.md',
    'docs/phase13-review-engine-claim-boundaries.md',
  ];
  const unsupportedPhrases = [
    'FSRS implemented',
    'Glicko-2 implemented',
    'Transformers.js implemented',
    'PowerSync implemented',
    'automatic sync implemented',
    'cloud sync implemented',
    'IndexedDB implemented',
    'built-in AI implemented',
    'OCR implemented',
  ];

  for (const file of claimFiles) {
    const lines = read(file).split(/\r?\n/);
    for (const line of lines) {
      const normalizedLine = normalize(line);
      for (const phrase of unsupportedPhrases) {
        if (normalizedLine.includes(normalize(phrase)) && !lineIsSafe(line)) {
          fail(`Unsupported implementation claim in ${file}: ${line.trim()}`);
        }
      }
    }
  }
}

function scopeGuard() {
  const changed = changedFiles();
  for (const file of changed) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (allowedChangedFiles.has(file)) continue;
    if (forbiddenChangedFiles.has(file)) fail(`Forbidden file changed: ${file}`);
    if (forbiddenChangedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden runtime/test path changed: ${file}`);
    fail(`Unexpected changed file for Phase 13A scope: ${file}`);
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

function packageRegistryGuard() {
  for (const file of ['package.json', 'package-lock.json']) {
    if (!fs.existsSync(file)) continue;
    const text = read(file);
    for (const term of registryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }
}

function workflowGuard() {
  const workflow = '.github/workflows/e2e-smoke.yml';
  const changed = changedFiles();
  if (!changed.includes(workflow)) return;
  const text = read(workflow);
  if (!text.includes('node scripts/validate-phase13-review-engine-audit.js')) {
    fail('Workflow changed but does not run Phase 13A review engine audit validator.');
  }
  if (/continue-on-error:\s*true/i.test(text)) {
    fail('Workflow must not add broad continue-on-error: true.');
  }
}

function validate() {
  for (const file of requiredFiles) read(file);
  auditDocGuard();
  claimBoundaryGuard();
  overclaimGuard();
  scopeGuard();
  generatedArtifactGuard();
  packageRegistryGuard();
  workflowGuard();
  console.log('Phase 13A current review engine audit validation passed.');
}

validate();
