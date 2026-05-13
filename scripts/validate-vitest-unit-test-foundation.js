import fs from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
  'docs/vitest-unit-test-foundation.md',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/unit-test-foundation-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
  'package.json',
  'package-lock.json',
  '.github/workflows/e2e-smoke.yml',
  // Phase 13A compatibility: allow only the approved current review
  // engine audit docs/static-validator/CI files while preserving this
  // historical validator's existing scope guardrails.
  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',
];

const unitTestFiles = [
  'tests/unit/storageQuotaEstimate.test.js',
  'tests/unit/scoring.test.js',
  'tests/unit/weightedSelection.test.js',
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
  ...unitTestFiles,

  // Phase 12G compatibility: allow only the approved Vitest unit-test foundation
  // package/doc/test/validator changes while preserving existing phase guardrails.
  '.github/workflows/e2e-smoke.yml',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/deployment-readiness.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/unit-test-foundation-plan.md',
  'docs/vitest-unit-test-foundation.md',
  'package-lock.json',
  'package.json',
  'scripts/validate-vitest-unit-test-foundation.js',
  'tests/unit/scoring.test.js',
  'tests/unit/storageQuotaEstimate.test.js',
  'tests/unit/weightedSelection.test.js',
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
  'scripts/validate-unit-test-foundation-plan.js',
  'scripts/validate-web-share-mobile-sharing-prototype-plan.js',
  'scripts/validate-web-share-runtime-fallback-hardening.js',
  'scripts/validate-web-share-runtime-prototype.js',
]);

const generatedArtifacts = ['node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD'];
const forbiddenChangedPrefixes = ['e2e/'];
const forbiddenChangedFiles = ['vite.config', 'vite.config.js', 'vite.config.mjs', 'playwright.config', 'playwright.config.js'];
const forbiddenPackageNames = ['fast-check', 'jest', 'mocha', 'ava', 'cypress', 'nyc', 'istanbul'];
const publicClaimFiles = [
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/vitest-unit-test-foundation.md',
  'docs/unit-test-foundation-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
];

function fail(message) {
  console.error(`Phase 12G validation failed: ${message}`);
  process.exit(1);
}
function warn(message) { console.warn(`Phase 12G validation warning: ${message}`); }
function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}
function normalize(text) {
  return String(text).toLowerCase()
    .replace(/[`*_()[\]/]+/g, ' ')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
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
function runGit(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
  } catch {
    if (!options.silent) warn(`Git command failed; changed-file scope checking may be limited: ${command}`);
    return '';
  }
}
function splitLines(output) { return output ? output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) : []; }
function uniqueSorted(files) { return [...new Set(files)].sort((a, b) => a.localeCompare(b)); }
function changedFilesFromPullRequestBase() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (!baseRef) return [];
  runGit(`git fetch --no-tags --depth=1 origin ${baseRef}`, { silent: true });
  const mergeBase = runGit(`git merge-base HEAD origin/${baseRef}`, { silent: true });
  if (!mergeBase) {
    warn(`Could not compute merge base against origin/${baseRef}; falling back to local changed-file detection.`);
    return [];
  }
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}
function changedFilesFromLocalFallbacks({ includeUntracked = true } = {}) {
  const files = [
    ...splitLines(runGit('git diff --name-only HEAD', { silent: true })),
    ...splitLines(runGit('git diff --cached --name-only', { silent: true })),
  ];
  if (includeUntracked) files.push(...splitLines(runGit('git ls-files --others --exclude-standard', { silent: true })));
  if (files.length === 0 && !runGit('git rev-parse --is-inside-work-tree', { silent: true })) {
    warn('Git is unavailable; changed-file scope checks are limited to content checks.');
  }
  return files;
}
function changedFiles({ includeUntracked = true } = {}) {
  const prBaseFiles = changedFilesFromPullRequestBase();
  if (prBaseFiles.length > 0) return uniqueSorted(prBaseFiles);
  return uniqueSorted(changedFilesFromLocalFallbacks({ includeUntracked }));
}
function trackedFiles() { return uniqueSorted(splitLines(runGit('git ls-files', { silent: true }))); }

function packageChecks() {
  const pkg = JSON.parse(read('package.json'));
  if (pkg.version !== '2.0.0-beta-ai.1') fail(`package.json version changed unexpectedly: ${pkg.version}`);
  if (!pkg.devDependencies?.vitest) fail('package.json must include vitest in devDependencies.');
  if (pkg.scripts?.['test:unit'] !== 'vitest run tests/unit') fail('package.json must include test:unit script as "vitest run tests/unit".');
  const dependencies = pkg.dependencies || {};
  if (Object.prototype.hasOwnProperty.call(dependencies, 'vitest')) fail('vitest must not be added as a production dependency.');
  for (const name of forbiddenPackageNames) {
    if (pkg.dependencies?.[name] || pkg.devDependencies?.[name]) fail(`Unapproved dependency introduced: ${name}`);
  }
  const lock = read('package-lock.json');
  if (!lock.includes('vitest')) fail('package-lock.json must include vitest lock data.');
}

function testContentChecks() {
  for (const file of unitTestFiles) {
    const text = read(file);
    if (!/\bdescribe\s*\(/.test(text)) fail(`${file} must contain describe().`);
    if (!/\b(it|test)\s*\(/.test(text)) fail(`${file} must contain it() or test().`);
    if (!/\bexpect\s*\(/.test(text)) fail(`${file} must contain expect().`);
    if (!text.includes('../../src/')) fail(`${file} must import from existing app source.`);
    if (text.includes('/e2e/') || text.includes('../../e2e/')) fail(`${file} must not import from e2e/.`);
    if (/\bfetch\s*\(|XMLHttpRequest|http:\/\/|https:\/\//.test(text)) fail(`${file} must not use real network calls.`);
    if (/playwright|chromium|firefox|webkit/.test(text)) fail(`${file} must not require browser launch.`);
  }
}

function scopeGuard() {
  const changed = changedFiles();
  for (const file of changed) {
    if (generatedArtifacts.some((artifact) => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (forbiddenChangedFiles.some((name) => file === name || file.startsWith(`${name}.`))) fail(`Forbidden config file changed: ${file}`);
    if (!allowedChangedFiles.has(file) && forbiddenChangedPrefixes.some((prefix) => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (file.startsWith('src/') && !allowedChangedFiles.has(file)) fail(`Runtime source file changed unexpectedly: ${file}`);
    if (!allowedChangedFiles.has(file)) fail(`Unexpected changed file for Phase 12G scope: ${file}`);
  }
}
function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some((file) => file === artifact || file.startsWith(`${artifact}/`))) fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
  }
}
function lineIsSafe(line) {
  const safeMarkers = ['not implemented','not changed','not created','not published','not claim','does not','do not','no ','without','limited','initial','minimal','future','non-goal','non-goals','forbidden claim','forbidden claims','unchanged','avoid','preserve','not replace','not replaced','was not intentionally changed'];
  const normalized = normalize(line);
  return safeMarkers.some((marker) => normalized.includes(normalize(marker)));
}
function forbiddenOverclaimGuard() {
  const phrases = [
    'full test coverage','complete regression coverage','E2E replaced by unit tests','algorithms changed','scoring changed','SRT changed','mastery changed','recommendation algorithm changed','Study Room behavior changed','FSRS implemented','IndexedDB implemented','cloud sync implemented','account sync implemented','automatic sync implemented','encryption implemented','release package created','release tag created','GitHub Release published','production certified','security certified','accessibility certified','performance certified'
  ];
  for (const file of publicClaimFiles) {
    const lines = read(file).split(/\r?\n/);
    let inForbiddenSection = false;
    for (const line of lines) {
      const normalizedLine = normalize(line);
      if (normalizedLine.includes('forbidden')) inForbiddenSection = true;
      else if (/^##\s+/.test(line) && inForbiddenSection) inForbiddenSection = false;
      if (inForbiddenSection) continue;
      for (const phrase of phrases) {
        if (normalizedLine.includes(normalize(phrase)) && !lineIsSafe(line)) {
          fail(`Unsupported positive overclaim in ${file}: ${line.trim()}`);
        }
      }
    }
  }
}

function validate() {
  for (const file of requiredFiles) read(file);
  for (const file of unitTestFiles) read(file);
  packageChecks();
  requireIncludes('docs/vitest-unit-test-foundation.md', [
    'Phase 12G','Vitest Unit Test Foundation','completed/merged through Phase 12F','Vitest','npm run test:unit','initial unit tests','CI','local-first','browser-local','no runtime app behavior changes','no scoring/SRT/mastery/recommendation changes','no Study Room behavior changes','no storage schema','no backup format','no FSRS implementation','no IndexedDB implementation','Phase 12H','Study Flow Micro-feedback Plan'
  ]);
  requireIncludes('README.md', ['Vitest','npm run test:unit','initial unit tests']);
  requireAny('README.md','runtime/algorithm boundary',['does not claim runtime app behavior changes','No runtime/algorithm behavior change is claimed','does not claim runtime app behavior changes or scoring/SRT/mastery/recommendation algorithm changes']);
  requireIncludes('RELEASE_QA_V2.md', ['Phase 12G','Vitest Unit Test Foundation','npm run test:unit','No Study Room behavior changes','No scoring/SRT/mastery/recommendation changes','No storage schema changes','No backup format changes']);
  requireIncludes('docs/unit-test-foundation-plan.md', ['Phase 12G','Vitest']);
  requireIncludes('docs/phase12-roadmap-risk-register.md', ['Phase 12G','Vitest Unit Test Foundation']);
  requireIncludes('docs/public-release-notes.md', ['Vitest unit test foundation']);
  requireAny('docs/deployment-readiness.md','deployment unchanged',['unit test tooling does not change deployment requirements','no deployment requirement change']);
  requireIncludes('.github/workflows/e2e-smoke.yml', ['npm run test:unit','node scripts/validate-vitest-unit-test-foundation.js','node scripts/validate-unit-test-foundation-plan.js','node scripts/validate-dashboard-today-card-runtime.js','node scripts/validate-dashboard-today-card-ux-plan.js','node scripts/validate-storage-quota-warning-runtime.js','node scripts/validate-storage-capacity-indexeddb-migration-plan.js','node scripts/validate-phase12-roadmap-risk-register.js']);
  testContentChecks();
  scopeGuard();
  generatedArtifactGuard();
  forbiddenOverclaimGuard();
  console.log('Phase 12G Vitest Unit Test Foundation validation passed.');
}

validate();
