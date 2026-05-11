import fs from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
  'docs/study-flow-micro-feedback-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
  '.github/workflows/e2e-smoke.yml',
];

const allowedChangedFiles = new Set([
  '.github/workflows/e2e-smoke.yml',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/study-flow-micro-feedback-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
  'scripts/validate-study-flow-micro-feedback-plan.js',
  // Phase 12I compatibility: Study Flow runtime follow-up may modify these narrow files while preserving Phase 12H plan claims.
  'docs/study-flow-micro-feedback-runtime.md',
  'scripts/validate-study-flow-micro-feedback-runtime.js',
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
  'scripts/validate-unit-test-foundation-plan.js',
  'scripts/validate-vitest-unit-test-foundation.js',
  'scripts/validate-web-share-mobile-sharing-prototype-plan.js',
  'scripts/validate-web-share-runtime-fallback-hardening.js',
  'scripts/validate-web-share-runtime-prototype.js',
  'src/routes/StudyRoom.jsx',
  'src/components/study/StudyResultSummary.jsx',
]);

const forbiddenChangedFiles = [
  'package.json',
  'package-lock.json',
  'vite.config',
  'vite.config.js',
  'vite.config.mjs',
  'playwright.config',
  'playwright.config.js',
];
const forbiddenChangedPrefixes = ['src/', 'e2e/', 'tests/', '__tests__/'];
const generatedArtifacts = ['node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD'];
const internalRegistryTerms = ['applied-caas', 'artifactory', 'internal.api.openai', 'packages.applied'];
const claimFiles = [
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/study-flow-micro-feedback-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
];

function fail(message) {
  console.error(`Phase 12H validation failed: ${message}`);
  process.exit(1);
}
function warn(message) { console.warn(`Phase 12H validation warning: ${message}`); }
function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}
function normalize(text) {
  return String(text)
    .toLowerCase()
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
  const prFiles = changedFilesFromPullRequestBase();
  if (prFiles.length > 0) return uniqueSorted(prFiles);
  return uniqueSorted(changedFilesFromLocalFallbacks({ includeUntracked }));
}
function trackedFiles() { return uniqueSorted(splitLines(runGit('git ls-files', { silent: true }))); }
function scopeGuard() {
  const changed = changedFiles();
  for (const file of changed) {
    if (generatedArtifacts.some((artifact) => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (allowedChangedFiles.has(file)) continue;
    if (forbiddenChangedFiles.includes(file)) fail(`Forbidden file changed in Phase 12H: ${file}`);
    if (forbiddenChangedPrefixes.some((prefix) => file.startsWith(prefix))) fail(`Forbidden path changed in Phase 12H: ${file}`);
    fail(`Unexpected changed file for Phase 12H scope: ${file}`);
  }
}
function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some((file) => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}
function packageLockRegistryGuard() {
  for (const file of ['package.json', 'package-lock.json']) {
    const text = read(file);
    for (const term of internalRegistryTerms) {
      if (text.includes(term)) fail(`Internal registry URL/marker found in ${file}: ${term}`);
    }
  }
}
function lineIsSafe(line) {
  const safeMarkers = [
    'not implemented', 'planned', 'future', 'not changed', 'unchanged', 'not created', 'not published',
    'non-goal', 'non-goals', 'forbidden claim', 'forbidden claims', 'does not', 'do not', 'no ',
    'without', 'must not', 'should not', 'remains', 'guidance only', 'planning', 'requirements',
  ];
  const normalizedLine = normalize(line);
  return safeMarkers.some((marker) => normalizedLine.includes(normalize(marker)));
}
function forbiddenOverclaimGuard() {
  const phrases = [
    'Study Flow micro-feedback implemented',
    'correct/incorrect feedback changed',
    'Study Room behavior changed',
    'scoring changed',
    'SRT changed',
    'mastery changed',
    'recommendation algorithm changed',
    'animations implemented',
    'sound effects implemented',
    'badges implemented',
    'achievements implemented',
    'retention improved',
    'package dependencies changed',
    'release package created',
    'release tag created',
    'GitHub Release published',
  ];
  for (const file of claimFiles) {
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

  requireIncludes('docs/study-flow-micro-feedback-plan.md', [
    'Phase 12H',
    'Study Flow Micro-feedback Plan',
    'completed/merged through Phase 12G',
    'local-first',
    'browser-local',
    'Study Room',
    'correct/incorrect feedback',
    'feedback principles',
    'copy guidance',
    'accessibility',
    'reduced-motion',
    'algorithm boundaries',
    'testing/evidence requirements',
    'non-goals',
    'allowed claims',
    'forbidden claims',
    'Phase 12I',
    'Study Flow Micro-feedback Runtime',
  ]);

  requireAny('docs/study-flow-micro-feedback-plan.md', 'Study Flow micro-feedback not implemented by Phase 12H', [
    'Study Flow micro-feedback is not implemented by Phase 12H',
    'not implemented by Phase 12H',
    'does not implement runtime micro-feedback',
  ]);
  requireAny('docs/study-flow-micro-feedback-plan.md', 'Study Room behavior not changed by Phase 12H', [
    'Study Room behavior is not changed by Phase 12H',
    'does not change Study Room behavior',
    'No Study Room runtime behavior changed by Phase 12H',
  ]);
  requireAny('docs/study-flow-micro-feedback-plan.md', 'answer correctness logic not changed by Phase 12H', [
    'answer correctness logic is not changed by Phase 12H',
    'does not change answer correctness logic',
  ]);
  requireAny('docs/study-flow-micro-feedback-plan.md', 'scoring/SRT/mastery/recommendation algorithms not changed by Phase 12H', [
    'scoring/SRT/mastery/recommendation algorithms are not changed by Phase 12H',
    'does not change scoring/SRT/mastery/recommendation algorithms',
  ]);
  requireAny('docs/study-flow-micro-feedback-plan.md', 'runtime app behavior not changed by Phase 12H', [
    'runtime app behavior is not changed by Phase 12H',
    'does not change runtime app behavior',
  ]);
  requireAny('docs/study-flow-micro-feedback-plan.md', 'package dependencies not changed by Phase 12H', [
    'package dependencies are not changed by Phase 12H',
    'does not add dependencies',
  ]);

  requireIncludes('README.md', ['docs/study-flow-micro-feedback-plan.md', 'Study Flow Micro-feedback Plan']);
  requireAny('README.md', 'future runtime/planned and not implemented by Phase 12H', [
    'Runtime micro-feedback is planned for a future phase and is not implemented by Phase 12H',
    'not implemented by Phase 12H',
  ]);
  requireAny('README.md', 'Study Room/scoring algorithms unchanged', [
    'Study Room behavior is unchanged by Phase 12H, scoring/SRT/mastery/recommendation algorithms are unchanged by Phase 12H',
    'Study Room behavior is unchanged',
  ]);

  requireIncludes('RELEASE_QA_V2.md', [
    'Phase 12H',
    'Study Flow Micro-feedback planning',
    'no runtime app behavior changes',
    'no `src/` changes',
    'no `e2e/` changes',
    'no tests added',
    'no package version/dependency changes',
    'no Study Room behavior changes',
    'no answer correctness changes',
    'no scoring/SRT/mastery/recommendation changes',
  ]);

  requireIncludes('docs/phase12-roadmap-risk-register.md', [
    'Phase 12H',
    'Study Flow Micro-feedback Plan',
    'Phase 12I',
    'Study Flow Micro-feedback Runtime',
    'Phase 12J',
    'Phase 12 Closure / Release Decision',
  ]);
  requireIncludes('docs/public-release-notes.md', ['Study Flow micro-feedback planning']);
  requireAny('docs/deployment-readiness.md', 'Study Flow micro-feedback planning or deployment unchanged', [
    'Study Flow micro-feedback planning does not change deployment requirements',
    'Study Flow micro-feedback planning',
  ]);
  requireIncludes('docs/deployment-readiness.md', ['local-first', 'no backend', 'cloud', 'account sync']);
  requireIncludes('.github/workflows/e2e-smoke.yml', [
    'node scripts/validate-study-flow-micro-feedback-plan.js',
    'npm run test:unit',
    'node scripts/validate-vitest-unit-test-foundation.js',
    'node scripts/validate-unit-test-foundation-plan.js',
    'node scripts/validate-dashboard-today-card-runtime.js',
    'node scripts/validate-dashboard-today-card-ux-plan.js',
    'node scripts/validate-storage-quota-warning-runtime.js',
    'node scripts/validate-storage-capacity-indexeddb-migration-plan.js',
    'node scripts/validate-phase12-roadmap-risk-register.js',
  ]);

  scopeGuard();
  generatedArtifactGuard();
  packageLockRegistryGuard();
  forbiddenOverclaimGuard();
  console.log('Phase 12H Study Flow Micro-feedback Plan validation passed.');
}
validate();
