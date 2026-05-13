#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function normalize(text) {
  return text.toLowerCase().replace(/[\u2010-\u2015]/g, '-').replace(/\s+/g, ' ');
}

function requireFile(file) {
  if (!exists(file)) fail(`missing required file: ${file}`);
}

function requireIncludes(file, terms) {
  if (!exists(file)) return;
  const text = read(file);
  const n = normalize(text);
  for (const term of terms) {
    const t = normalize(term);
    if (!n.includes(t)) fail(`${file} missing required content: ${term}`);
  }
}

function requirePattern(file, regex, label) {
  if (!exists(file)) return;
  const text = read(file);
  if (!regex.test(text)) fail(`${file} missing required wording: ${label}`);
}

function gitOutput(command) {
  try {
    return execSync(command, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (_) {
    return '';
  }
}

const generatedArtifactRoots = ['node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD'];

function isGeneratedArtifact(file) {
  return generatedArtifactRoots.some((artifact) => file === artifact || file.startsWith(`${artifact}/`));
}

function changedFiles() {
  const names = new Set();
  const diff = gitOutput('git diff --name-only HEAD');
  const staged = gitOutput('git diff --cached --name-only');
  const untracked = gitOutput('git ls-files --others --exclude-standard');
  for (const block of [diff, staged]) {
    for (const line of block.split(/\r?\n/)) {
      if (line.trim()) names.add(line.trim());
    }
  }
  for (const line of untracked.split(/\r?\n/)) {
    const file = line.trim();
    if (file && !isGeneratedArtifact(file)) names.add(file);
  }
  return [...names].sort();
}

function trackedOrStagedFiles() {
  const names = new Set();
  const diff = gitOutput('git diff --name-only HEAD');
  const staged = gitOutput('git diff --cached --name-only');
  for (const block of [diff, staged]) {
    for (const line of block.split(/\r?\n/)) {
      if (line.trim()) names.add(line.trim());
    }
  }
  return [...names].sort();
}

function gitShow(file) {
  try {
    return execSync(`git show HEAD:${file}`, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (_) {
    return null;
  }
}

function lineHasNegationOrBoundary(line) {
  const l = normalize(line);
  return /\b(no|not|never|without|does not|do not|must not|forbidden|non-goal|non-goals|planned|planning|future|evaluation|evaluate|option|only|remain|remains|unless|not added|not changed|not created|not published|not implemented|unimplemented)\b/.test(l);
}

function checkForbiddenClaims(file, claims) {
  if (!exists(file)) return;
  const lines = read(file).split(/\r?\n/);
  lines.forEach((line, index) => {
    const l = normalize(line);
    for (const claim of claims) {
      const c = normalize(claim);
      if (l.includes(c) && !lineHasNegationOrBoundary(line)) {
        fail(`${file}:${index + 1} unsupported positive claim: ${claim}`);
      }
    }
  });
}

function checkHypeClaims(file, claims) {
  if (!exists(file)) return;
  const lines = read(file).split(/\r?\n/);
  lines.forEach((line, index) => {
    const l = normalize(line);
    for (const claim of claims) {
      const c = normalize(claim);
      if (l.includes(c) && !lineHasNegationOrBoundary(line)) {
        fail(`${file}:${index + 1} unsupported hype/public claim: ${claim}`);
      }
    }
  });
}

const requiredFiles = [
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
requiredFiles.forEach(requireFile);

requireIncludes('docs/phase12-roadmap-risk-register.md', [
  'Phase 12A',
  'Phase 12 Roadmap / Risk Register / Scope Lock',
  'completed/merged through Phase 11H',
  'Phase 11 cross-device transfer track closure',
  'Stability + UX + Performance + Data Safety',
  'storage capacity risk',
  'IndexedDB migration',
  'storage quota warning',
  'Dashboard Today Card',
  'Study flow micro-feedback',
  'unit test foundation',
  'route-level code splitting',
  'FSRS',
  'QR',
  'cloud',
  'encryption',
  'risk register',
  'non-goals',
  'allowed claims',
  'forbidden claims',
  'Phase 12B',
  'Storage Capacity / IndexedDB Migration Plan',
]);

const roadmap = 'docs/phase12-roadmap-risk-register.md';
requirePattern(roadmap, /IndexedDB[^\n.]{0,120}(not implemented|planned\/evaluated|planned for future evaluation)|not implemented[^\n.]{0,120}IndexedDB/i, 'IndexedDB is not implemented by Phase 12A');
requirePattern(roadmap, /FSRS[^\n.]{0,120}(not implemented|future evaluation)|not implemented[^\n.]{0,120}FSRS/i, 'FSRS is not implemented by Phase 12A');
requirePattern(roadmap, /QR transfer[^\n.]{0,120}not implemented|not implement[^\n.]{0,120}QR transfer/i, 'QR transfer is not implemented by Phase 12A');
requirePattern(roadmap, /cloud\/account sync[^\n.]{0,120}not implemented|not implement[^\n.]{0,120}cloud\/account sync/i, 'cloud/account sync is not implemented by Phase 12A');
requirePattern(roadmap, /encryption[^\n.]{0,120}not implemented|not implement[^\n.]{0,120}encryption/i, 'encryption is not implemented by Phase 12A');
requirePattern(roadmap, /Dashboard Today Card[^\n.]{0,120}planned[^\n.]{0,120}not implemented/i, 'Dashboard Today Card is planned, not implemented by Phase 12A');
requirePattern(roadmap, /Study (flow )?micro-feedback[^\n.]{0,120}planned[^\n.]{0,120}not implemented/i, 'Study micro-feedback is planned, not implemented by Phase 12A');
requirePattern(roadmap, /Route-level code splitting[^\n.]{0,120}planned[^\n.]{0,120}not implemented/i, 'route-level code splitting is planned, not implemented by Phase 12A');
requirePattern(roadmap, /Unit tests?[^\n.]{0,120}planned[^\n.]{0,120}not added/i, 'unit tests are planned, not added by Phase 12A');

requireIncludes('README.md', [
  'docs/phase12-roadmap-risk-register.md',
  'Phase 12',
  'Stability + UX + Performance + Data Safety',
]);

requireIncludes('RELEASE_QA_V2.md', [
  'Phase 12A',
  'Phase 12 roadmap',
  'risk register',
  'scope lock',
  'No runtime app behavior changes',
  'No package version or dependency changes',
]);

requirePattern('docs/public-release-notes.md', /Phase 12A[\s\S]{0,300}roadmap\/risk register/i, 'public release notes reference Phase 12 roadmap/risk register');
requirePattern('docs/deployment-readiness.md', /Phase 12A[\s\S]{0,300}roadmap\/scope lock/i, 'deployment readiness references Phase 12 roadmap/scope lock');
requireIncludes('.github/workflows/e2e-smoke.yml', ['node scripts/validate-phase12-roadmap-risk-register.js']);

const changed = changedFiles();
const allowedChanged = new Set([
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
]);

const forbiddenChanged = [
  'src/',
  'e2e/',
  'package.json',
  'package-lock.json',
  'vite.config',
  'vite.config.js',
  'vite.config.mjs',
  'playwright.config',
  'playwright.config.js',
];
for (const file of changed) {
  for (const forbidden of forbiddenChanged) {
    if ((file === forbidden || file.startsWith(forbidden)) && !allowedChanged.has(file)) {
      fail(`forbidden changed file for docs/static-validator/CI-only Phase 12A: ${file}`);
    }
  }
}


for (const file of changed) {
  if (!allowedChanged.has(file)) fail(`unexpected changed/untracked file outside Phase 12A scope: ${file}`);
}

for (const file of ['package.json', 'package-lock.json']) {
  if (changed.includes(file) && !allowedChanged.has(file)) fail(`${file} must not appear in changed files`);
  const before = gitShow(file);
  if (before !== null && exists(file)) {
    const after = read(file);
    if (before !== after && !allowedChanged.has(file)) fail(`${file} content changed`);
  }
}

if (exists('package.json')) {
  try {
    const pkg = JSON.parse(read('package.json'));
    if (!pkg.version) fail('package.json missing version');
    if (pkg.dependencies && typeof pkg.dependencies !== 'object') fail('package.json dependencies must be an object when present');
    if (pkg.devDependencies && typeof pkg.devDependencies !== 'object') fail('package.json devDependencies must be an object when present');
  } catch (error) {
    fail(`package.json is not valid JSON: ${error.message}`);
  }
}

for (const file of trackedOrStagedFiles()) {
  if (isGeneratedArtifact(file)) {
    fail(`generated artifact must not be tracked/staged/changed: ${file}`);
  }
}

const publicDocs = [
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
];
const forbiddenClaims = [
  'IndexedDB implemented',
  'migrated to IndexedDB',
  'FSRS implemented',
  'QR transfer implemented',
  'transfer code implemented',
  'transfer-code flow implemented',
  'WebRTC transfer implemented',
  'cloud sync implemented',
  'account sync implemented',
  'automatic sync implemented',
  'encryption implemented',
  'encrypted backups implemented',
  'partial restore implemented',
  'incremental sync implemented',
  'Dashboard Today Card implemented',
  'Study micro-feedback implemented',
  'route-level code splitting implemented',
  'release package created',
  'release tag created',
  'GitHub Release published',
  'production certified',
  'security certified',
  'accessibility certified',
  'performance certified',
];
const hypeClaims = [
  'S-tier',
  'Apple-like',
  '99.99%',
  'guaranteed reliability',
  'industry standard implemented',
  'world-class',
  'certified secure',
  'certified accessible',
  'certified performance',
];
publicDocs.forEach((file) => checkForbiddenClaims(file, forbiddenClaims));
publicDocs.forEach((file) => checkHypeClaims(file, hypeClaims));

if (failures.length > 0) {
  console.error('Phase 12A roadmap/risk register validator failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Phase 12A roadmap/risk register validator passed.');
