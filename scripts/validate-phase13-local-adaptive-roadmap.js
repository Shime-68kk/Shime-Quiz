#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
  'docs/phase13-local-adaptive-learning-roadmap.md',
  'docs/phase13-intelligence-layer-boundaries.md',
  'docs/phase13-phase14-plus-roadmap.md',
  'scripts/validate-phase13-local-adaptive-roadmap.js',
];

const coreAllowedChangedFiles = new Set([
  ...requiredFiles,
  '.github/workflows/e2e-smoke.yml',
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
  'scripts/validate-phase13-fsrs-plan.js',
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
]);

const forbiddenChangedFiles = new Set([
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'vite.config.mjs',
  'playwright.config.js',
]);

const forbiddenChangedPrefixes = ['src/', 'e2e/', 'tests/'];
const generatedArtifacts = [
  'node_modules',
  'dist',
  'test-results',
  'playwright-report',
  'coverage',
  'FETCH_HEAD',
  '.env',
  '.env.local',
  '.git',
];
const registryTerms = ['applied-caas', 'artifactory', 'internal.api.openai', 'packages.applied'];

function fail(message) {
  console.error(`Phase 13C local adaptive roadmap validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 13C local adaptive roadmap validation warning: ${message}`);
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
    ...splitLines(runGit('git diff --cached --name-only', { silent: true })),
  ];
  if (includeUntracked) files.push(...splitLines(runGit('git ls-files --others --exclude-standard', { silent: true })));
  return files;
}

function changedFiles({ includeUntracked = true } = {}) {
  const prBaseFiles = changedFilesFromPullRequestBase();
  if (prBaseFiles.length > 0) return uniqueSorted(prBaseFiles);
  return uniqueSorted([
    ...changedFilesFromBranchBase(),
    ...changedFilesFromLocalFallbacks({ includeUntracked }),
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

function requireAny(file, label, terms) {
  const text = normalize(read(file));
  if (!terms.some(term => text.includes(normalize(term)))) {
    fail(`${file} must mention ${label}; accepted wording: ${terms.join(' | ')}`);
  }
}

function roadmapContentGuard() {
  requireIncludes('docs/phase13-local-adaptive-learning-roadmap.md', [
    'local-first',
    'browser-local',
    'current scheduler',
    'SM-2-like',
    'heuristic',
    'weighted practice',
    'FSRS',
    'future',
    'planned',
    'Glicko',
    'IRT',
    'local AI',
    'Transformers.js',
    'optional sync',
    'PowerSync',
    'ElectricSQL',
    'backup/export/import',
    'Phase 14',
    'Phase 15',
    'not implemented',
    'no runtime behavior',
  ]);
}

function boundaryContentGuard() {
  requireIncludes('docs/phase13-intelligence-layer-boundaries.md', [
    'FSRS is not implemented',
    'ts-fsrs is not installed',
    'Glicko-2 is not implemented',
    'IRT is not implemented',
    'Transformers.js is not implemented',
    'PowerSync is not implemented',
    'ElectricSQL is not implemented',
    'cloud sync is not implemented',
    'automatic sync is not implemented',
    'IndexedDB runtime migration is not implemented',
    'encryption is not implemented',
    'built-in AI is not implemented',
    'external AI/API is not implemented',
    'OCR is not implemented',
    'forbidden public claims',
  ]);
}

function phase14RoadmapGuard() {
  requireIncludes('docs/phase13-phase14-plus-roadmap.md', [
    'FSRS adapter',
    'opt-in',
    'new-card',
    'rollback',
    'backup',
    'Study Room',
    'Dashboard',
    'weighted practice',
    'public FSRS claims',
    'do not start runtime until',
    'Phase 14A',
    'Phase 14B',
    'Phase 14C',
    'schemaVersion: v2-review-schedule-v1',
  ]);
  requireAny('docs/phase13-phase14-plus-roadmap.md', 'scheduler versioning', [
    'schedulerVersion',
    'schedulerKind',
  ]);
}

function lineIsSafe(line) {
  const safeMarkers = [
    'not implemented',
    'not installed',
    'not added',
    'not publicly claim',
    'future',
    'planned',
    'proposal',
    'roadmap',
    'research',
    'architecture',
    'requires phase 14',
    'requires later phase',
    'forbidden',
    'unsafe',
    'unless',
    'does not',
    'do not',
    'must not',
    'no ',
    'later',
    'before claiming',
  ];
  const normalizedLine = normalize(line);
  return safeMarkers.some(marker => normalizedLine.includes(normalize(marker)));
}

function claimGuard() {
  const claimFiles = [
    'docs/phase13-local-adaptive-learning-roadmap.md',
    'docs/phase13-intelligence-layer-boundaries.md',
    'docs/phase13-phase14-plus-roadmap.md',
  ];
  const unsafeClaims = [
    'FSRS implemented',
    'FSRS is implemented',
    'ts-fsrs installed',
    'Glicko-2 implemented',
    'Glicko-2 is implemented',
    'IRT implemented',
    'IRT is implemented',
    'Transformers.js implemented',
    'Transformers.js is implemented',
    'semantic search implemented',
    'semantic search is implemented',
    'PowerSync implemented',
    'PowerSync is implemented',
    'ElectricSQL implemented',
    'ElectricSQL is implemented',
    'automatic sync implemented',
    'automatic sync is implemented',
    'cloud sync implemented',
    'cloud sync is implemented',
    'IndexedDB migration implemented',
    'IndexedDB runtime migration is implemented',
    'built-in AI implemented',
    'built-in AI is implemented',
    'external AI/API implemented',
    'external AI/API is implemented',
    'OCR implemented',
    'OCR is implemented',
  ];

  for (const file of claimFiles) {
    const lines = read(file).split(/\r?\n/);
    let inForbiddenClaimsSection = false;
    for (const [index, line] of lines.entries()) {
      const normalizedLine = normalize(line);
      if (/^##\s+/.test(line)) inForbiddenClaimsSection = false;
      if (normalizedLine.includes('forbidden claims') || normalizedLine.includes('forbidden public claims')) {
        inForbiddenClaimsSection = true;
      }
      for (const claim of unsafeClaims) {
        if (normalizedLine.includes(normalize(claim)) && !inForbiddenClaimsSection && !lineIsSafe(line)) {
          fail(`Unsupported implementation claim in ${file}:${index + 1}: ${line.trim()}`);
        }
      }
    }
  }
}

function scopeGuard() {
  const changed = changedFiles();
  const allowedChangedFiles = new Set([...coreAllowedChangedFiles, ...historicalValidatorCompatibilityFiles]);
  for (const file of changed) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) {
      continue;
    }
    if (allowedChangedFiles.has(file)) continue;
    if (forbiddenChangedFiles.has(file)) fail(`Forbidden file changed: ${file}`);
    if (forbiddenChangedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden runtime/test path changed: ${file}`);
    if (file.startsWith('scripts/validate-')) {
      fail(`Unexpected validator changed without exact Phase 13C compatibility allowlist: ${file}`);
    }
    fail(`Unexpected changed file for Phase 13C scope: ${file}`);
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
    const text = read(file);
    for (const term of registryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }
}

function workflowGuard() {
  const text = read('.github/workflows/e2e-smoke.yml');
  if (!text.includes('node scripts/validate-phase13-local-adaptive-roadmap.js')) {
    fail('Workflow must run Phase 13C local adaptive roadmap validator.');
  }
  if (/continue-on-error:\s*true/i.test(text)) {
    fail('Workflow must not add broad continue-on-error: true.');
  }
}

function validate() {
  for (const file of requiredFiles) read(file);
  roadmapContentGuard();
  boundaryContentGuard();
  phase14RoadmapGuard();
  claimGuard();
  scopeGuard();
  generatedArtifactGuard();
  packageRegistryGuard();
  workflowGuard();
  console.log('Phase 13C local adaptive learning roadmap validation passed.');
}

validate();
