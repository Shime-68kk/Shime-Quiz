#!/usr/bin/env node
/**
 * scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js
 *
 * Phase 15H static validator — FSRS Foundation Closure / Phase 16 Readiness Handoff.
 * Confirms that no forbidden runtime/test/package/e2e files changed,
 * no broad active-FSRS / AI / cloud / sync / security overclaims exist,
 * all prior validators through Phase 15G remain registered, and the
 * Phase 15H docs carry all required safe-claim and closure terms.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase15h-fsrs-foundation-closure-phase16-readiness.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';

const PHASE15G_VALIDATOR = 'scripts/validate-phase15g-release-claim-guardrail-reaudit.js';
const PHASE15F_VALIDATOR = 'scripts/validate-phase15f-studyroom-copy-ux-alignment.js';
const PHASE15E_VALIDATOR = 'scripts/validate-phase15e-controlled-internal-activation-harness.js';
const PHASE15D_VALIDATOR = 'scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js';
const PHASE15C_VALIDATOR = 'scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js';
const PHASE15B_VALIDATOR = 'scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js';
const PHASE14N_VALIDATOR = 'scripts/validate-phase14n-production-studyroom-two-step-bridge.js';

// Exact list of allowed changed files for Phase 15H.
// Phase 15H is docs/static-validator/CI-only: no src/, tests/, e2e/,
// package.json, or package-lock.json changes are allowed.
const phase15hAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  // Historical validators updated with exact Phase 15H allowlist entries only
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
  PHASE15G_VALIDATOR,
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
  console.error(`Phase 15H validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 15H validation warning: ${message}`);
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
  read(PHASE15G_VALIDATOR);
  read(PHASE15F_VALIDATOR);
  read(PHASE15E_VALIDATOR);
  read(PHASE15D_VALIDATOR);
  read(PHASE15C_VALIDATOR);
  read(PHASE15B_VALIDATOR);
  read(PHASE14N_VALIDATOR);
  read('docs/phase15g-release-claim-guardrail-reaudit.md');
  read('docs/phase15f-studyroom-copy-ux-alignment.md');
  read('docs/phase15e-controlled-internal-activation-harness.md');
  read('docs/phase15d-active-fsrs-runtime-smoke-rollback-audit.md');
  read('docs/phase15c-dashboard-mixed-scheduler-due-count.md');
  read('docs/phase15b-active-fsrs-scheduling-double-gated.md');
  read('docs/phase15a-fsrs-active-scheduling-architecture.md');
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
  if (changed.has('package.json')) fail('package.json must not change in Phase 15H');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 15H');
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
  ];
  for (const validator of requiredValidators) {
    if (!text.includes(validator)) fail(`${WORKFLOW_FILE} must run ${validator}`);
  }

  const phase15gPos = text.indexOf('node scripts/validate-phase15g-release-claim-guardrail-reaudit.js');
  const phase15hPos = text.indexOf('node scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js');
  if (phase15gPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15G validator`);
  if (phase15hPos === -1) fail(`${WORKFLOW_FILE} must register Phase 15H validator`);
  if (phase15hPos <= phase15gPos) {
    fail(`${WORKFLOW_FILE} must register Phase 15H validator after Phase 15G validator`);
  }

  if (/continue-on-error:\s*true/i.test(text)) {
    fail(`${WORKFLOW_FILE} must not add broad continue-on-error`);
  }
}

// ── Scope guard ───────────────────────────────────────────────────────────────

function scopeGuard() {
  for (const file of changedFiles()) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (phase15hAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json') fail(`package.json must not change in Phase 15H`);
    if (file === 'package-lock.json') fail(`package-lock.json must not change in Phase 15H`);
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 15H: ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 15H: ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 15H: ${file}`);
    fail(`Unexpected changed file for Phase 15H scope: ${file}`);
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
    if (file.startsWith('src/')) fail(`src/ file changed in Phase 15H: ${file}`);
    if (file.startsWith('tests/')) fail(`tests/ file changed in Phase 15H: ${file}`);
    if (file.startsWith('e2e/')) fail(`e2e/ file changed in Phase 15H: ${file}`);
  }
  if (changed.has('package.json')) fail('package.json must not change in Phase 15H');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 15H');
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
    if (file.startsWith('src/')) {
      fail(`Phase 15H must not add new ts-fsrs.next() call sites (src/ changed): ${file}`);
    }
  }
}

// ── Forbidden claim guard (README, release notes) ─────────────────────────────

function forbiddenClaimGuard() {
  const targets = [
    'README.md',
    'docs/public-release-notes.md',
    'docs/deployment-readiness.md',
  ];

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

// ── Required terms in Phase 15H docs ─────────────────────────────────────────

function docsGuard() {
  requireIncludes(DOCS_FILE, [
    'Phase 15H',
    'docs/static-validator/CI only',
    'no runtime files changed',
    'experimental',
    'double-gated',
    'default OFF',
    'internal/test activation',
    'no public rollout',
    'Phase 15A',
    'Phase 15B',
    'Phase 15C',
    'Phase 15D',
    'Phase 15E',
    'Phase 15F',
    'Phase 15G',
    'Phase 16A',
    'hybrid local-first',
    'not implemented',
    'no new ts-fsrs.next',
    'deferred',
    'docs/static-validator/CI only',
    'no runtime implementation',
    'no sync',
    'no cloud',
    'no E2EE',
    'no AI scheduling claim',
    'no security certification claim',
    'no guarantee of better learning outcomes',
    'Phase 15 Closure',
    'Phase 16A Readiness',
    'Hybrid Local-First Architecture',
    'Optional Sync Direction',
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
  read('docs/phase15g-release-claim-guardrail-reaudit.md');
  read(PHASE14N_VALIDATOR);
  read(PHASE15B_VALIDATOR);
  read(PHASE15C_VALIDATOR);
  read(PHASE15D_VALIDATOR);
  read(PHASE15E_VALIDATOR);
  read(PHASE15F_VALIDATOR);
  read(PHASE15G_VALIDATOR);

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
  console.log('Phase 15H FSRS foundation closure / Phase 16 readiness validation passed.');
}

validate();
