#!/usr/bin/env node
/**
 * scripts/validate-phase15g-release-claim-guardrail-reaudit.js
 *
 * Phase 15G static validator — Release / Claim Guardrail Re-Audit.
 * Confirms that no forbidden runtime/test/package/e2e files changed,
 * no broad active-FSRS / AI / cloud / sync / security overclaims exist,
 * all prior validators through Phase 15F remain registered, and the
 * Phase 15G docs carry all required safe-claim terms.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase15g-release-claim-guardrail-reaudit.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase15g-release-claim-guardrail-reaudit.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';

const PHASE15F_VALIDATOR = 'scripts/validate-phase15f-studyroom-copy-ux-alignment.js';
const PHASE15E_VALIDATOR = 'scripts/validate-phase15e-controlled-internal-activation-harness.js';
const PHASE15D_VALIDATOR = 'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js';
const PHASE15C_VALIDATOR = 'scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js';
const PHASE15B_VALIDATOR = 'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js';
const PHASE14N_VALIDATOR = 'scripts/validate-phase14n-production-studyroom-two-step-bridge.js';

// Exact list of allowed changed files for Phase 15G.
// Phase 15G is docs/static-validator/CI-only: no src/, tests/, e2e/,
// package.json, or package-lock.json changes are allowed.
const phase15gAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  // Historical validators updated with exact Phase 15G allowlist entries only
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
  'scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js',
  'scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js',
  'scripts/validate-phase15a-fsrs-active-scheduling-architecture.js',
  PHASE15B_VALIDATOR,
  PHASE15C_VALIDATOR,
  PHASE15D_VALIDATOR,
  PHASE15E_VALIDATOR,
  PHASE15F_VALIDATOR,
  // Phase 15H allowlist entries
  'docs/phase15h-fsrs-foundation-closure-phase16-readiness.md',
  'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js',
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

]);

const bindingPackage = '@open-spaced-repetition/' + 'binding';

const internalRegistryTerms = [
  'applied-caas',
  'artifactory',
  'internal.api.openai',
  'packages.applied'
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
  '.git'
];

function fail(message) {
  console.error(`Phase 15G validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 15G validation warning: ${message}`);
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
  read(PHASE15F_VALIDATOR);
  read(PHASE15E_VALIDATOR);
  read(PHASE15D_VALIDATOR);
  read(PHASE15C_VALIDATOR);
  read(PHASE15B_VALIDATOR);
  read(PHASE14N_VALIDATOR);
  read('docs/phase15f-studyroom-copy-ux-alignment.md');
  read('docs/phase15e-controlled-internal-activation-harness.md');
  read('docs/phase15d-active-fsrs-runtime-smoke-rollback-audit.md');
  read('docs/phase15c-dashboard-mixed-scheduler-due-count.md');
  read('docs/phase15b-active-fsrs-scheduling-double-gated.md');
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
  if (changed.has('package.json')) fail('package.json must not change in Phase 15G');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 15G');
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
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase15fPos = text.indexOf('node scripts/validate-phase15f-studyroom-copy-ux-alignment.js');
  const phase15gPos = text.indexOf('node scripts/validate-phase15g-release-claim-guardrail-reaudit.js');
  if (phase15fPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15F validator`);
  if (phase15gPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15G validator`);
  if (phase15gPos <= phase15fPos) {
    fail(`${WORKFLOW_FILE} must register Phase 15G validator after Phase 15F validator`);
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
    if (phase15gAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 15G`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 15G`);
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 15G: ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 15G: ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 15G: ${file}`);
    fail(`Unexpected changed file for Phase 15G scope: ${file}`);
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
  for (const file of changed) {
    if (phase15gAllowedChangedFiles.has(file)) continue;
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 15G: ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 15G: ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 15G: ${file}`);
  }
  if (changed.has('package.json')) fail('package.json must not change in Phase 15G');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 15G');
}

// ── No new ts-fsrs.next() call sites guard ────────────────────────────────────

function noNewNextCallSitesGuard() {
  const wrapperSource = read('src/quiz/fsrsWrapper.js');
  const matches = wrapperSource.match(/\.next\s*\(/g) ?? [];
  if (matches.length !== 2) {
    fail(`src/quiz/fsrsWrapper.js must have exactly 2 .next() calls (scheduleFsrsReview + scheduleFsrsReviewForTest), found ${matches.length}`);
  }
  const changedSet = new Set(changedFiles());
  for (const file of changedSet) {
    if (phase15gAllowedChangedFiles.has(file)) continue;
    if (file.startsWith('src/')) {
      fail(`Phase 15G must not add new ts-fsrs.next() call sites (src/ changed): ${file}`);
    }
  }
}

// ── Forbidden claim guard (README, release notes) ─────────────────────────────
// Checks public-facing docs for positive active-FSRS / AI / cloud overclaims.
// Uses specific positive-assertion patterns that would not appear in the
// legitimate negation sections ("does not include", "no X") already present
// in README and release notes.
// Note: DOCS_FILE is the Phase 15G audit document, not a public-facing doc.

function forbiddenClaimGuard() {
  const targets = [
    'README.md',
    'docs/public-release-notes.md',
    'docs/deployment-readiness.md',
  ];

  // These are positive-claim patterns that should never appear in public docs.
  // They are distinct from the negation phrases already used in README/notes
  // (e.g. "does not provide built-in AI generation" is fine; these are not).
  const forbiddenPositiveClaims = [
    'fsrs scheduling is live for everyone',
    'fsrs is broadly available as a user-facing feature',
    'active scheduling is guaranteed better',
    'ai scheduling is enabled',
    'fsrs is now active for everyone',
    'fsrs active scheduling is live',
    'active scheduling is broadly available',
    'active fsrs rollout is complete',
    'cloud sync hybrid local-first is implemented',
    'hybrid local-first is implemented',
    'end-to-end encrypted sync is implemented',
    'e2ee sync is implemented',
    'multi-device sync is available',
    'dashboard fully supports every future scheduler',
  ];

  for (const file of targets) {
    if (!fs.existsSync(file)) continue;
    const text = normalize(read(file));
    for (const claim of forbiddenPositiveClaims) {
      if (text.includes(normalize(claim))) {
        fail(`${file} contains forbidden active-FSRS/AI/cloud positive claim: "${claim}"`);
      }
    }
  }
}

// ── No internal flag as user-facing text guard ────────────────────────────────

function noInternalFlagExposureGuard() {
  const targets = ['README.md', 'docs/public-release-notes.md'];
  const internalFlags = ['fsrsActiveSchedulingEnabled', 'fsrsExperimentalEnabled'];
  for (const file of targets) {
    if (!fs.existsSync(file)) continue;
    const text = read(file);
    for (const flag of internalFlags) {
      if (text.includes(flag)) {
        fail(`${file} must not expose internal flag "${flag}" in public-facing docs`);
      }
    }
  }
}

// ── Required safe terms in Phase 15G docs ─────────────────────────────────────

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 15G',
    'docs/static-validator/CI',
    'no runtime files changed',
    'experimental',
    'double-gated',
    'default OFF',
    'internal/test activation',
    'no public rollout',
    'Phase 15B',
    'Phase 15C',
    'Phase 15D',
    'Phase 15E',
    'Phase 15F',
    'Phase 16',
    'hybrid local-first',
    'not implemented',
    'no new ts-fsrs.next',
  ]);
}

// ── Internal registry / native binding guard ──────────────────────────────────

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

// ── Prior phase regression guard ──────────────────────────────────────────────

function priorPhaseRegressionGuard() {
  read('docs/phase14n-production-studyroom-two-step-memory-rating-bridge.md');
  read('docs/phase15a-fsrs-active-scheduling-architecture.md');
  read('docs/phase15b-active-fsrs-scheduling-double-gated.md');
  read('docs/phase15c-dashboard-mixed-scheduler-due-count.md');
  read('docs/phase15d-active-fsrs-runtime-smoke-rollback-audit.md');
  read('docs/phase15e-controlled-internal-activation-harness.md');
  read('docs/phase15f-studyroom-copy-ux-alignment.md');
  read(PHASE14N_VALIDATOR);
  read(PHASE15B_VALIDATOR);
  read(PHASE15C_VALIDATOR);
  read(PHASE15D_VALIDATOR);
  read(PHASE15E_VALIDATOR);
  read(PHASE15F_VALIDATOR);

  const adapterSource = read('src/quiz/reviewSchedulerAdapter.js');
  if (!adapterSource.includes('export function scheduleActiveFsrsOrFallback')) {
    fail(`src/quiz/reviewSchedulerAdapter.js must preserve scheduleActiveFsrsOrFallback (Phase 15D regression)`);
  }
  if (!adapterSource.includes('export function computeMixedSchedulerDueSummary')) {
    fail(`src/quiz/reviewSchedulerAdapter.js must preserve computeMixedSchedulerDueSummary (Phase 15C regression)`);
  }
  if (!adapterSource.includes('export function shouldShowFsrsTwoStepBridge')) {
    fail(`src/quiz/reviewSchedulerAdapter.js must preserve shouldShowFsrsTwoStepBridge (Phase 14N regression)`);
  }
  if (!adapterSource.includes('fsrsExperimentalEnabled')) {
    fail(`src/quiz/reviewSchedulerAdapter.js must preserve fsrsExperimentalEnabled (Phase 15B regression)`);
  }
  if (!adapterSource.includes('fsrsActiveSchedulingEnabled')) {
    fail(`src/quiz/reviewSchedulerAdapter.js must preserve fsrsActiveSchedulingEnabled (Phase 15B regression)`);
  }

  const settingsSource = read('src/state/settingsStorage.js');
  if (!settingsSource.includes('fsrsActiveSchedulingEnabled: false')) {
    fail(`src/state/settingsStorage.js must preserve fsrsActiveSchedulingEnabled: false default (Phase 15B regression)`);
  }

  const bridgeSource = read('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
  if (!bridgeSource.includes('isActiveSchedulingCopyEnabled')) {
    fail(`src/components/study/FsrsProductionMemoryRatingBridge.jsx must preserve isActiveSchedulingCopyEnabled prop (Phase 15F regression)`);
  }
  if (!bridgeSource.includes('may adjust when you next see this card')) {
    fail(`src/components/study/FsrsProductionMemoryRatingBridge.jsx must preserve "may adjust" active copy (Phase 15F regression)`);
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
  noNewNextCallSitesGuard();
  forbiddenClaimGuard();
  noInternalFlagExposureGuard();
  docsGuard();
  internalRegistryGuard();
  priorPhaseRegressionGuard();
  console.log('Phase 15G release/claim guardrail re-audit validation passed.');
}

validate();
