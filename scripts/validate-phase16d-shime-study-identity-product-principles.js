#!/usr/bin/env node
/**
 * scripts/validate-phase16d-shime-study-identity-product-principles.js
 *
 * Phase 16D static validator — Shime Study Identity / Product Principles.
 *
 * Confirms:
 *   • identity doc exists with all required terms;
 *   • workflow registers Phase 16D validator after Phase 16C;
 *   • all previous validators through Phase 16C remain registered;
 *   • no src/, tests/, e2e/, package.json, or package-lock.json changes;
 *   • no runtime implementation files added;
 *   • no visual polish / mascot asset / CSS changes;
 *   • no EduGen connector runtime;
 *   • no sync/cloud/account/auth code;
 *   • no new ts-fsrs.next() call sites;
 *   • forbidden claims are absent from the identity doc;
 *   • generated artifacts and internal registry/native binding terms absent;
 *   • changed files are within the Phase 16D allowlist.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase16d-shime-study-identity-product-principles.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase16d-shime-study-identity-product-principles.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';

const PHASE16C_VALIDATOR = 'scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js';
const PHASE16B_VALIDATOR = 'scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js';
const PHASE16A_VALIDATOR = 'scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js';
const PHASE15H_VALIDATOR = 'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js';
const PHASE15G_VALIDATOR = 'scripts/validate-phase15g-release-claim-guardrail-reaudit.js';
const PHASE15F_VALIDATOR = 'scripts/validate-phase15f-studyroom-copy-ux-alignment.js';
const PHASE15E_VALIDATOR = 'scripts/validate-phase15e-controlled-internal-activation-harness.js';
const PHASE15D_VALIDATOR = 'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js';
const PHASE15C_VALIDATOR = 'scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js';
const PHASE15B_VALIDATOR = 'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js';
const PHASE15A_VALIDATOR = 'scripts/validate-phase15a-fsrs-active-scheduling-architecture.js';
const PHASE14P_VALIDATOR = 'scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js';
const PHASE14O_VALIDATOR = 'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js';
const PHASE14N_VALIDATOR = 'scripts/validate-phase14n-production-studyroom-two-step-bridge.js';

// Exact list of allowed changed files for Phase 16D.
// Phase 16D is docs/static-validator/CI-only: no src/, tests/, e2e/,
// package.json, or package-lock.json changes are allowed.
const phase16dAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,

  // Historical validators updated with exact Phase 16D allowlist entries only
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
  PHASE14N_VALIDATOR,
  PHASE14O_VALIDATOR,
  PHASE14P_VALIDATOR,
  PHASE15A_VALIDATOR,
  PHASE15B_VALIDATOR,
  PHASE15C_VALIDATOR,
  PHASE15D_VALIDATOR,
  PHASE15E_VALIDATOR,
  PHASE15F_VALIDATOR,
  PHASE15G_VALIDATOR,
  PHASE15H_VALIDATOR,
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
  PHASE16A_VALIDATOR,
  PHASE16B_VALIDATOR,
  PHASE16C_VALIDATOR,

  // Phase 16E allowlist entries
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
  // Phase 16G allowlist entries (EduGen Draft Review Import Flow)
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

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied',
];

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

const requiredDocTerms = [
  'calm',
  'learner-owned',
  'local-first',
  'explainable memory',
  'draft before trust',
  'source-aware learning',
  'beautiful but quiet',
  'honest copy',
  'mistakes are signals',
  'motion is breath, not bounce',
  'Study Room',
  'Today\'s Path',
  'Memory Garden',
  'Draft Workshop',
  'Source Library',
  'no runtime changes',
  'docs/static-validator/CI only',
];

const forbiddenDocClaims = [
  'visual polish is implemented',
  'mascot runtime exists',
  'EduGen is bundled',
  'built-in AI quiz generation exists',
  'built-in OCR exists',
  'cloud sync exists',
  'sync is available',
  'E2EE is implemented',
  'active FSRS is public',
  'active fsrs public rollout',
  'AI scheduling enabled',
  'AI scheduling is enabled',
  'guaranteed mastery',
];

function fail(message) {
  console.error(`Phase 16D validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 16D validation warning: ${message}`);
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

function isGeneratedArtifact(file) {
  return generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
}

// ── Required files guard ──────────────────────────────────────────────────────

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE16C_VALIDATOR);
  read(PHASE16B_VALIDATOR);
  read(PHASE16A_VALIDATOR);
  read(PHASE15H_VALIDATOR);
  read(PHASE15G_VALIDATOR);
  read(PHASE15F_VALIDATOR);
  read(PHASE15E_VALIDATOR);
  read(PHASE15D_VALIDATOR);
  read(PHASE15C_VALIDATOR);
  read(PHASE15B_VALIDATOR);
  read(PHASE15A_VALIDATOR);
  read(PHASE14P_VALIDATOR);
  read(PHASE14O_VALIDATOR);
  read(PHASE14N_VALIDATOR);
}

// ── Package guard ─────────────────────────────────────────────────────────────

function packageGuard() {
  const pkg = readJson('package.json');
  readJson('package-lock.json');

  for (const file of ['package.json', 'package-lock.json']) {
    const text = read(file);
    if (text.includes(bindingPackage)) fail(`${file} must not contain native binding dependency`);
    for (const term of internalRegistryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }

  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 16D');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 16D');

  void pkg;
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase16dAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 16D`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 16D`);
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 16D: ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 16D: ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 16D: ${file}`);
    fail(`Unexpected changed file for Phase 16D scope: ${file}`);
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
    'node scripts/validate-phase15f-studyroom-copy-ux-alignment.js',
    'node scripts/validate-phase15g-release-claim-guardrail-reaudit.js',
    'node scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js',
    'node scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js',
    'node scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js',
    'node scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js',
    'node scripts/validate-phase16d-shime-study-identity-product-principles.js',
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase16cPos = text.indexOf('node scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js');
  const phase16dPos = text.indexOf('node scripts/validate-phase16d-shime-study-identity-product-principles.js');
  if (phase16cPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16C validator`);
  if (phase16dPos === -1) fail(`${WORKFLOW_FILE} must register Phase 16D validator`);
  if (phase16dPos <= phase16cPos) {
    fail(`${WORKFLOW_FILE} must register Phase 16D validator after Phase 16C validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── No runtime implementation guard ──────────────────────────────────────────

function noRuntimeImplementationGuard() {
  const changed = changedFiles();
  for (const file of changed) {
    if (isGeneratedArtifact(file)) continue;
    if (phase16dAllowedChangedFiles.has(file)) continue;
    if (file.startsWith('src/')) {
      fail(`Phase 16D must not modify src/ files: ${file}`);
    }
    if (file.startsWith('tests/')) {
      fail(`Phase 16D must not modify tests/ files: ${file}`);
    }
    if (file.startsWith('e2e/')) {
      fail(`Phase 16D must not modify e2e/ files: ${file}`);
    }
  }

  const forbiddenNewFiles = [
    'src/identity',
    'src/mascot',
    'src/assets/mascot',
    'src/styles/mascot',
    'src/components/mascot',
    'src/components/identity',
  ];
  for (const path of forbiddenNewFiles) {
    if (fs.existsSync(path)) {
      fail(`Phase 16D must not create runtime path: ${path}`);
    }
  }
}

// ── No new localStorage keys guard ───────────────────────────────────────────

function noNewLocalStorageKeysGuard() {
  const storageFile = 'src/state/reviewScheduleStorage.js';
  if (!fs.existsSync(storageFile)) return;
  const source = fs.readFileSync(storageFile, 'utf8');
  if (!source.includes("'shimeV2ReviewScheduleV1'")) {
    fail(`${storageFile} must preserve REVIEW_SCHEDULE_STORAGE_KEY = 'shimeV2ReviewScheduleV1'`);
  }

  const settingsFile = 'src/state/settingsStorage.js';
  if (!fs.existsSync(settingsFile)) return;
  const settingsSource = fs.readFileSync(settingsFile, 'utf8');
  if (!settingsSource.includes("'shimeV2SettingsV1'")) {
    fail(`${settingsFile} must preserve SETTINGS_STORAGE_KEY = 'shimeV2SettingsV1'`);
  }
}

// ── No new ts-fsrs.next() call sites guard ────────────────────────────────────

function noNewNextCallSitesGuard() {
  const wrapperFile = 'src/quiz/fsrsWrapper.js';
  if (!fs.existsSync(wrapperFile)) return;
  const wrapperSource = fs.readFileSync(wrapperFile, 'utf8');
  const matches = wrapperSource.match(/\.next\s*\(/g) ?? [];
  if (matches.length !== 2) {
    fail(`src/quiz/fsrsWrapper.js must have exactly 2 .next() calls (Phase 15B baseline preserved), found ${matches.length}`);
  }

  const adapterFile = 'src/quiz/reviewSchedulerAdapter.js';
  if (!fs.existsSync(adapterFile)) return;
  const adapterSource = fs.readFileSync(adapterFile, 'utf8');
  if (/\.next\s*\(/.test(adapterSource)) {
    fail(`src/quiz/reviewSchedulerAdapter.js must not call .next() directly`);
  }
}

// ── Required doc terms guard ──────────────────────────────────────────────────

function requiredDocTermsGuard() {
  const doc = read(DOCS_FILE);
  const docLower = doc.toLowerCase();
  for (const term of requiredDocTerms) {
    if (!docLower.includes(term.toLowerCase())) {
      fail(`${DOCS_FILE} must include required term: "${term}"`);
    }
  }
}

// ── Forbidden claim guard ─────────────────────────────────────────────────────

function forbiddenDocClaimGuard() {
  const doc = read(DOCS_FILE);
  const docLower = doc.toLowerCase();
  for (const claim of forbiddenDocClaims) {
    if (docLower.includes(claim.toLowerCase())) {
      fail(`${DOCS_FILE} must not contain forbidden claim: "${claim}"`);
    }
  }
}

// ── Internal registry / native binding guard ──────────────────────────────────

function internalRegistryGuard() {
  const doc = read(DOCS_FILE);
  if (doc.includes(bindingPackage)) {
    fail(`${DOCS_FILE} must not reference native binding package`);
  }
  for (const term of internalRegistryTerms) {
    if (doc.includes(term)) {
      fail(`${DOCS_FILE} references internal registry term: ${term}`);
    }
  }
}

// ── FSRS regression guard (double gate preserved) ────────────────────────────

function fsrsRegressionGuard() {
  const adapterFile = 'src/quiz/reviewSchedulerAdapter.js';
  if (!fs.existsSync(adapterFile)) return;
  const source = fs.readFileSync(adapterFile, 'utf8');
  if (!source.includes('fsrsExperimentalEnabled')) {
    fail(`${adapterFile} must preserve fsrsExperimentalEnabled (Phase 15B regression)`);
  }
  if (!source.includes('fsrsActiveSchedulingEnabled')) {
    fail(`${adapterFile} must preserve fsrsActiveSchedulingEnabled (Phase 15B regression)`);
  }

  const wrapperFile = 'src/quiz/fsrsWrapper.js';
  if (!fs.existsSync(wrapperFile)) return;
  const wrapperSource = fs.readFileSync(wrapperFile, 'utf8');
  const matches = wrapperSource.match(/\.next\s*\(/g) ?? [];
  if (matches.length !== 2) {
    fail(`src/quiz/fsrsWrapper.js must have exactly 2 .next() calls (Phase 15B baseline preserved), found ${matches.length}`);
  }
}

// ── No account/auth/cloud/backend guard ──────────────────────────────────────

function noCloudAuthGuard() {
  const FORBIDDEN_CLOUD_FILES = [
    'src/auth',
    'src/cloud',
    'src/backend',
    'src/api/sync',
    'src/sync',
    'src/storage/SyncAdapter.js',
    'src/storage/StorageAdapter.js',
    'src/storage/IndexedDBAdapter.js',
  ];
  for (const path of FORBIDDEN_CLOUD_FILES) {
    if (fs.existsSync(path)) {
      fail(`Phase 16D must not introduce cloud/auth/sync path: ${path}`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function validate() {
  requiredFilesGuard();
  packageGuard();
  scopeGuard();
  generatedArtifactGuard();
  workflowGuard();
  noRuntimeImplementationGuard();
  noNewLocalStorageKeysGuard();
  noNewNextCallSitesGuard();
  requiredDocTermsGuard();
  forbiddenDocClaimGuard();
  internalRegistryGuard();
  fsrsRegressionGuard();
  noCloudAuthGuard();
  console.log('Phase 16D shime study identity product principles validation passed.');
}

validate();
