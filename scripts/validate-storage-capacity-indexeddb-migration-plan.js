import fs from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
  'docs/storage-capacity-indexeddb-migration-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
  '.github/workflows/e2e-smoke.yml',
  // Phase 13A compatibility: allow only the approved current review
  // engine audit docs/static-validator/CI files while preserving this
  // historical validator's existing scope guardrails.
  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',
];

const forbiddenChangedPrefixes = ['src/', 'e2e/'];
const forbiddenChangedFiles = [
  'package.json',
  'package-lock.json',
  'vite.config',
  'vite.config.js',
  'vite.config.mjs',
  'playwright.config',
  'playwright.config.js',
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

  // Phase 13B compatibility: allow only the approved FSRS migration
  // architecture docs/static-validator/CI files while preserving older
  // phase guardrails.
  'docs/phase13-fsrs-migration-architecture.md',
  'docs/phase13-fsrs-data-model-plan.md',
  'docs/phase13-fsrs-risk-register.md',
  'scripts/validate-phase13-fsrs-plan.js',
  'scripts/validate-phase13-local-adaptive-roadmap.js',

  // Phase 13A compatibility: allow only the approved current review
  // engine audit docs/static-validator/CI files while preserving this
  // historical validator's existing scope guardrails.
  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',

  // Phase 12J compatibility: allow only the approved closure/release-decision
  // docs/static-validator/CI files while preserving older phase guardrails.
  '.github/workflows/e2e-smoke.yml',
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
const generatedArtifacts = ['node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD'];
const publicClaimFiles = [
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/storage-capacity-indexeddb-migration-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
];


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
  console.error(`Phase 12B validation failed: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function normalize(text) {
  return text.toLowerCase().replace(/[\u2010-\u2015]/g, '-').replace(/\s+/g, ' ');
}

function requireIncludes(file, terms) {
  const text = normalize(read(file));
  for (const term of terms) {
    if (!text.includes(normalize(term))) fail(`${file} must mention: ${term}`);
  }
}

function requireAny(file, label, patterns) {
  const text = normalize(read(file));
  if (!patterns.some((pattern) => text.includes(normalize(pattern)))) {
    fail(`${file} must mention ${label}; accepted wording: ${patterns.join(' | ')}`);
  }
}

function warn(message) {
  console.warn(`Phase 12B validation warning: ${message}`);
}

function runGit(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
  } catch (error) {
    if (!options.silent) warn(`Git command failed; changed-file scope checking may be limited: ${command}`);
    return '';
  }
}

function splitLines(output) {
  return output ? output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) : [];
}

function uniqueSorted(files) {
  return [...new Set(files)].sort((a, b) => a.localeCompare(b));
}

function changedFilesFromPullRequestBase() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (!baseRef) return [];

  runGit(`git fetch --no-tags --depth=1 origin ${baseRef}`, { silent: true });
  const mergeBase = runGit(`git merge-base HEAD origin/${baseRef}`, { silent: true });
  if (!mergeBase) {
    warn(`Could not compute merge base against origin/${baseRef}; falling back to local changed-file detection.`);
    return [];
  }

  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`));
}

function changedFilesFromLocalFallbacks({ includeUntracked = true } = {}) {
  const files = [
    ...splitLines(runGit('git diff --name-only HEAD', { silent: true })),
    ...splitLines(runGit('git diff --cached --name-only', { silent: true })),
  ];

  if (includeUntracked) {
    files.push(...splitLines(runGit('git ls-files --others --exclude-standard', { silent: true })));
  }

  if (files.length === 0 && !runGit('git rev-parse --is-inside-work-tree', { silent: true })) {
    warn('Git is unavailable; changed-file scope checks are limited to content/package sanity checks.');
  }

  return files;
}

function changedFiles({ includeUntracked = true } = {}) {
  const prBaseFiles = changedFilesFromPullRequestBase();
  if (prBaseFiles.length > 0) return uniqueSorted(prBaseFiles);
  return uniqueSorted(changedFilesFromLocalFallbacks({ includeUntracked }));
}

function trackedFiles() {
  const files = splitLines(runGit('git ls-files', { silent: true }));
  return uniqueSorted(files);
}

function trackedOrChangedGeneratedArtifacts() {
  const changedOrTracked = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (changedOrTracked.some((file) => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

function scopeGuard() {
  const changed = changedFiles();
  for (const file of changed) {
    if (!allowedChangedFiles.has(file) && forbiddenChangedFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (!allowedChangedFiles.has(file) && forbiddenChangedPrefixes.some((prefix) => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
  }
}

function packageGuard() {
  const changed = changedFiles();
  if ((changed.includes('package.json') && !allowedChangedFiles.has('package.json')) || (changed.includes('package-lock.json') && !allowedChangedFiles.has('package-lock.json'))) {
    fail('package.json or package-lock.json changed in docs/static-validator phase');
  }
  const pkg = JSON.parse(read('package.json'));
  if (!pkg.version) fail('package.json sanity check failed: missing version');
  if (typeof pkg.dependencies !== 'object' && pkg.dependencies !== undefined) fail('package.json dependencies sanity check failed');
  if (typeof pkg.devDependencies !== 'object' && pkg.devDependencies !== undefined) fail('package.json devDependencies sanity check failed');
}

function lineIsSafe(line) {
  const safeMarkers = [
    'not implemented', 'not migrate', 'not migrated', 'not changed', 'not change', 'not added',
    'not created', 'not published', 'planned', 'evaluated', 'future', 'non-goal', 'non-goals',
    'forbidden claim', 'forbidden claims', 'does not', 'do not', 'no ', 'only documents',
    'planning', 'requirements', 'recommended next phase'
  ];
  const normalized = normalize(line);
  return safeMarkers.some((marker) => normalized.includes(marker));
}

function forbiddenOverclaimGuard() {
  const phraseGroups = [
    ['indexeddb implemented'],
    ['migrated to indexeddb', 'localstorage migrated'],
    ['storage schema changed'],
    ['backup format changed'],
    ['restore behavior changed'],
    ['storage quota warning implemented'],
    ['storage capacity solved'],
    ['backup checksum implemented'],
    ['partial restore implemented'],
    ['incremental sync implemented'],
    ['cloud sync implemented'],
    ['account sync implemented'],
    ['automatic sync implemented'],
    ['encryption implemented', 'encrypted backups implemented'],
    ['data loss prevention guaranteed'],
    ['production storage reliability certified'],
    ['release package created'],
    ['release tag created'],
    ['github release published'],
  ];

  for (const file of publicClaimFiles) {
    const lines = read(file).split(/\r?\n/);
    for (const line of lines) {
      const normalizedLine = normalize(line);
      for (const group of phraseGroups) {
        if (group.some((phrase) => normalizedLine.includes(phrase)) && !lineIsSafe(line)) {
          if (isNegatedBoundaryLine(line)) continue;
          fail(`Unsupported positive overclaim in ${file}: ${line.trim()}`);
        }
      }
    }
  }
}

function validate() {
  for (const file of requiredFiles) read(file);

  requireIncludes('docs/storage-capacity-indexeddb-migration-plan.md', [
    'Phase 12B',
    'Storage Capacity / IndexedDB Migration Plan',
    'completed/merged through Phase 12A',
    'local-first',
    'browser-local',
    'manual backup/export/import',
    'storage capacity risk',
    'localStorage',
    'IndexedDB',
    'quota',
    'failure modes',
    'backup/restore compatibility',
    'rollback',
    'fallback',
    'testing',
    'evidence',
    'non-goals',
    'allowed claims',
    'forbidden claims',
    'Phase 12C',
    'Storage Quota Warning Runtime',
  ]);

  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'IndexedDB not implemented by Phase 12B', ['IndexedDB is not implemented in Phase 12B', 'does not implement IndexedDB']);
  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'localStorage not migrated by Phase 12B', ['does not migrate localStorage data', 'No user data is migrated in Phase 12B']);
  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'storage schema not changed by Phase 12B', ['does not change storage schema']);
  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'backup format not changed by Phase 12B', ['does not change backup format']);
  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'restore behavior not changed by Phase 12B', ['does not change restore behavior']);
  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'storage quota warning runtime not implemented by Phase 12B', ['does not add storage quota warning UI or runtime', 'Storage Quota Warning Runtime is recommended for Phase 12C']);
  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'backup checksum not implemented by Phase 12B', ['does not implement backup checksum', 'does not add backup checksum']);
  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'partial restore not implemented by Phase 12B', ['does not implement partial restore', 'does not add partial restore']);
  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'cloud/account sync not implemented by Phase 12B', ['There is no backend, cloud, account sync', 'does not add cloud/account sync']);
  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'encryption not implemented by Phase 12B', ['does not add encryption']);
  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'package dependencies not changed by Phase 12B', ['does not add dependencies']);
  requireAny('docs/storage-capacity-indexeddb-migration-plan.md', 'runtime app behavior not changed by Phase 12B', ['does not change runtime behavior', 'does not change runtime app code']);

  requireIncludes('docs/storage-capacity-indexeddb-migration-plan.md', [
    'Quota exceeded',
    'Partial write',
    'Corrupt or malformed stored payload',
    'Oversized imported content',
    'Backup from corrupted state',
    'Restore into an existing data/profile',
    'Private/incognito storage clearing',
    'User clearing site data',
    'Browser-specific quota differences',
    'preserve existing localStorage data',
    'backup before migration',
    'idempotent',
    'resumable or safely retryable',
    'rollback/fallback',
    'user-visible error states',
    'test coverage before rollout',
  ]);

  requireIncludes('README.md', ['docs/storage-capacity-indexeddb-migration-plan.md', 'storage capacity', 'IndexedDB']);
  requireAny('README.md', 'not implemented or planned/evaluated only', ['planned/evaluated only', 'not implemented by Phase 12B']);

  requireIncludes('RELEASE_QA_V2.md', ['Phase 12B', 'storage capacity', 'IndexedDB migration plan', 'No runtime app behavior changes', 'No storage schema changes', 'No backup format changes', 'No package version/dependency changes']);
  requireIncludes('docs/phase12-roadmap-risk-register.md', ['Phase 12B', 'storage capacity / IndexedDB migration plan', 'Phase 12C', 'Storage Quota Warning Runtime']);
  requireIncludes('docs/public-release-notes.md', ['storage capacity', 'IndexedDB migration planning']);
  requireIncludes('docs/deployment-readiness.md', ['storage planning', 'local-first browser app', 'no backend/cloud/account sync']);
  requireIncludes('.github/workflows/e2e-smoke.yml', ['node scripts/validate-storage-capacity-indexeddb-migration-plan.js']);

  packageGuard();
  scopeGuard();
  trackedOrChangedGeneratedArtifacts();
  forbiddenOverclaimGuard();

  console.log('Phase 12B storage capacity / IndexedDB migration plan validation passed.');
}

validate();
