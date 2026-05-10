import fs from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
  'docs/dashboard-today-card-ux-plan.md',
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
  'docs/dashboard-today-card-ux-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
  'scripts/validate-dashboard-today-card-ux-plan.js',
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
const forbiddenChangedPrefixes = ['src/', 'e2e/'];
const generatedArtifacts = ['node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD'];
const publicClaimFiles = [
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/dashboard-today-card-ux-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
];

function fail(message) {
  console.error(`Phase 12D validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 12D validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[`*_()[\]\/]+/g, ' ')
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

function trackedFiles() {
  return uniqueSorted(splitLines(runGit('git ls-files', { silent: true })));
}

function scopeGuard() {
  const changed = changedFiles();
  for (const file of changed) {
    if (generatedArtifacts.some((artifact) => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (forbiddenChangedFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (forbiddenChangedPrefixes.some((prefix) => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (!allowedChangedFiles.has(file)) fail(`Unexpected changed file for Phase 12D scope: ${file}`);
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

function lineIsSafe(line) {
  const safeMarkers = [
    'not implemented', 'not changed', 'not change', 'not added', 'not created', 'not published',
    'planned', 'future', 'non-goal', 'non-goals', 'forbidden claim', 'forbidden claims',
    'does not', 'do not', 'no ', 'without', 'unchanged', 'remains', 'planning', 'plan',
    'prepares', 'requirements', 'should not', 'must not', 'only',
  ];
  const normalized = normalize(line);
  return safeMarkers.some((marker) => normalized.includes(normalize(marker)));
}

function forbiddenOverclaimGuard() {
  const phraseGroups = [
    ['dashboard today card implemented'],
    ['dashboard runtime changed'],
    ['study cta implemented'],
    ['progressive disclosure implemented'],
    ['mobile dashboard redesign implemented'],
    ['mastery heatmap implemented'],
    ['recommendation algorithm changed'],
    ['study room behavior changed'],
    ['scoring changed'],
    ['srt changed'],
    ['mastery changed'],
    ['package version changed'],
    ['dependencies changed'],
    ['release package created'],
    ['release tag created'],
    ['github release published'],
    ['production certified'],
    ['security certified'],
    ['accessibility certified'],
    ['performance certified'],
    ['cloud sync implemented'],
    ['account sync implemented'],
    ['automatic sync implemented'],
    ['encryption implemented'],
  ];
  for (const file of publicClaimFiles) {
    const lines = read(file).split(/\r?\n/);
    let inForbiddenSection = false;
    for (const line of lines) {
      const normalizedLine = normalize(line);
      if (normalizedLine.includes('forbidden claims')) inForbiddenSection = true;
      else if (/^##\s+/.test(line) && inForbiddenSection) inForbiddenSection = false;
      if (inForbiddenSection) continue;
      for (const group of phraseGroups) {
        if (group.some((phrase) => normalizedLine.includes(normalize(phrase))) && !lineIsSafe(line)) {
          fail(`Unsupported positive overclaim in ${file}: ${line.trim()}`);
        }
      }
    }
  }
}

function validate() {
  for (const file of requiredFiles) read(file);

  requireIncludes('docs/dashboard-today-card-ux-plan.md', [
    'Phase 12D',
    'Dashboard Today Card UX Plan',
    'completed/merged through Phase 12C',
    'local-first',
    'browser-local',
    'Today Card',
    'What should I study today',
    'primary CTA',
    'progressive disclosure',
    'empty states',
    'accessibility',
    'mobile-first',
    'data/source requirements',
    'testing/evidence requirements',
    'non-goals',
    'allowed claims',
    'forbidden claims',
    'Phase 12E',
    'Dashboard Today Card Runtime',
  ]);

  requireAny('docs/dashboard-today-card-ux-plan.md', 'Dashboard Today Card not implemented by Phase 12D', [
    'Phase 12D does not implement Dashboard Today Card runtime',
    'Dashboard Today Card runtime is not implemented by Phase 12D',
  ]);
  requireAny('docs/dashboard-today-card-ux-plan.md', 'Dashboard runtime behavior not changed by Phase 12D', [
    'Phase 12D does not implement Dashboard runtime changes',
    'No Dashboard runtime behavior was changed by Phase 12D',
    'Phase 12D does not change existing Dashboard runtime behavior',
  ]);
  requireAny('docs/dashboard-today-card-ux-plan.md', 'Study Room behavior not changed by Phase 12D', [
    'change Study Room behavior',
    'does not change Study Room behavior',
  ]);
  requireAny('docs/dashboard-today-card-ux-plan.md', 'scoring/SRT/mastery/recommendation algorithms not changed by Phase 12D', [
    'change scoring/SRT/mastery/recommendation algorithms',
    'should not change Study Room learning logic, Study Room answer correctness behavior, scoring/SRT/mastery algorithms, or recommendation algorithms',
  ]);
  requireAny('docs/dashboard-today-card-ux-plan.md', 'storage schema not changed by Phase 12D', ['change storage schema', 'does not change storage schema']);
  requireAny('docs/dashboard-today-card-ux-plan.md', 'backup format not changed by Phase 12D', ['change backup format', 'does not change backup format']);
  requireAny('docs/dashboard-today-card-ux-plan.md', 'package dependencies not changed by Phase 12D', ['add dependencies', 'without changing package dependencies']);
  requireAny('docs/dashboard-today-card-ux-plan.md', 'runtime app behavior not changed by Phase 12D', ['does not implement Dashboard runtime changes', 'No Dashboard runtime behavior was changed by Phase 12D']);

  requireIncludes('README.md', ['docs/dashboard-today-card-ux-plan.md', 'Dashboard Today Card']);
  requireAny('README.md', 'planned or future runtime', ['planned for a future phase', 'future runtime']);
  requireAny('README.md', 'not implemented by Phase 12D', ['not implemented by Phase 12D', 'runtime is not implemented']);

  requireIncludes('RELEASE_QA_V2.md', [
    'Phase 12D',
    'Dashboard Today Card UX planning',
    'No runtime app behavior changes',
    'No `src/` changes',
    'No package version/dependency changes',
    'No Dashboard runtime changes',
    'No Study Room changes',
  ]);

  requireIncludes('docs/phase12-roadmap-risk-register.md', ['Phase 12D', 'Dashboard Today Card UX Plan', 'Phase 12E', 'Dashboard Today Card Runtime']);
  requireIncludes('docs/public-release-notes.md', ['Dashboard Today Card UX planning']);
  requireAny('docs/deployment-readiness.md', 'Dashboard Today Card UX planning or no deployment requirement change', [
    'Dashboard Today Card UX planning',
    'does not change deployment requirements',
  ]);
  requireIncludes('docs/deployment-readiness.md', ['local-first', 'no backend/cloud/account sync']);
  requireIncludes('.github/workflows/e2e-smoke.yml', ['node scripts/validate-dashboard-today-card-ux-plan.js']);

  scopeGuard();
  generatedArtifactGuard();
  forbiddenOverclaimGuard();

  console.log('Phase 12D Dashboard Today Card UX plan validation passed.');
}

validate();
