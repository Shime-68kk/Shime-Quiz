import fs from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
  'docs/dashboard-today-card-runtime.md',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/dashboard-today-card-ux-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
  '.github/workflows/e2e-smoke.yml',
  // Phase 13A compatibility: allow only the approved current review
  // engine audit docs/static-validator/CI files while preserving this
  // historical validator's existing scope guardrails.
  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',
  'src/components/learning/DashboardTodayCard.jsx',
  'src/routes/Dashboard.jsx',
  'src/styles/global.css',
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
const forbiddenChangedPrefixes = ['e2e/'];
const generatedArtifacts = ['node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD'];
const publicClaimFiles = [
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/dashboard-today-card-runtime.md',
  'docs/dashboard-today-card-ux-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
];
const runtimeFiles = ['src/components/learning/DashboardTodayCard.jsx', 'src/routes/Dashboard.jsx', 'src/styles/global.css'];

function fail(message) {
  console.error(`Phase 12E validation failed: ${message}`);
  process.exit(1);
}
function warn(message) { console.warn(`Phase 12E validation warning: ${message}`); }
function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}
function normalize(text) {
  return String(text).toLowerCase()
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
  try { return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim(); }
  catch { if (!options.silent) warn(`Git command failed; changed-file scope checking may be limited: ${command}`); return ''; }
}
function splitLines(output) { return output ? output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) : []; }
function uniqueSorted(files) { return [...new Set(files)].sort((a, b) => a.localeCompare(b)); }
function changedFilesFromPullRequestBase() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (!baseRef) return [];
  runGit(`git fetch --no-tags --depth=1 origin ${baseRef}`, { silent: true });
  const mergeBase = runGit(`git merge-base HEAD origin/${baseRef}`, { silent: true });
  if (!mergeBase) { warn(`Could not compute merge base against origin/${baseRef}; falling back to local changed-file detection.`); return []; }
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}
function changedFilesFromLocalFallbacks({ includeUntracked = true } = {}) {
  const files = [
    ...splitLines(runGit('git diff --name-only HEAD', { silent: true })),
    ...splitLines(runGit('git diff --cached --name-only', { silent: true })),
  ];
  if (includeUntracked) files.push(...splitLines(runGit('git ls-files --others --exclude-standard', { silent: true })));
  if (files.length === 0 && !runGit('git rev-parse --is-inside-work-tree', { silent: true })) warn('Git is unavailable; changed-file scope checks are limited to content checks.');
  return files;
}
function changedFiles({ includeUntracked = true } = {}) {
  const prBaseFiles = changedFilesFromPullRequestBase();
  if (prBaseFiles.length > 0) return uniqueSorted(prBaseFiles);
  return uniqueSorted(changedFilesFromLocalFallbacks({ includeUntracked }));
}
function trackedFiles() { return uniqueSorted(splitLines(runGit('git ls-files', { silent: true }))); }
function scopeGuard() {
  const changed = changedFiles();
  for (const file of changed) {
    if (generatedArtifacts.some((artifact) => file === artifact || file.startsWith(`${artifact}/`))) continue;
    if (forbiddenChangedFiles.includes(file) && !allowedChangedFiles.has(file)) fail(`Forbidden file changed: ${file}`);
    if (!allowedChangedFiles.has(file) && forbiddenChangedPrefixes.some((prefix) => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (file.startsWith('src/') && !allowedChangedFiles.has(file)) fail(`Unexpected runtime file for Phase 12E scope: ${file}`);
    if (!allowedChangedFiles.has(file)) fail(`Unexpected changed file for Phase 12E scope: ${file}`);
  }
}
function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some((file) => file === artifact || file.startsWith(`${artifact}/`))) fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
  }
}
function lineIsSafe(line) {
  const safeMarkers = [
    'not implemented', 'not changed', 'not change', 'not added', 'not created', 'not published',
    'planned', 'future', 'non-goal', 'non-goals', 'forbidden claim', 'forbidden claims',
    'does not', 'do not', 'no ', 'without', 'unchanged', 'remains', 'preserving', 'preserve',
    'requirements', 'should not', 'must not', 'only', 'not alter', 'not delete',
  ];
  const normalized = normalize(line);
  return safeMarkers.some((marker) => normalized.includes(normalize(marker)));
}
function forbiddenOverclaimGuard() {
  const phrases = [
    'Study Room behavior changed', 'scoring changed', 'SRT changed', 'mastery changed',
    'recommendation algorithm changed', 'AI recommendations implemented', 'cloud sync implemented',
    'account sync implemented', 'automatic sync implemented', 'encryption implemented',
    'IndexedDB implemented', 'FSRS implemented', 'storage schema changed', 'backup format changed',
    'guaranteed retention improvement', 'release package created', 'release tag created',
    'GitHub Release published', 'production certified', 'security certified', 'accessibility certified',
    'performance certified',
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
        if (normalizedLine.includes(normalize(phrase)) && !lineIsSafe(line)) fail(`Unsupported positive overclaim in ${file}: ${line.trim()}`);
      }
    }
  }
}
function runtimeGuard() {
  const combinedRuntime = runtimeFiles.map(read).join('\n');
  requireAny('src/components/learning/DashboardTodayCard.jsx', 'Today Card identifier', ['Today Card', 'dashboardTodayCard', 'Hôm nay nên học gì']);
  requireAny('src/components/learning/DashboardTodayCard.jsx', 'primary CTA copy', ['Học hôm nay', 'Bắt đầu học', 'Tiếp tục học']);
  requireAny('src/components/learning/DashboardTodayCard.jsx', 'fallback or empty-state copy', ['Chưa có dữ liệu ôn tập', 'bắt đầu một phiên học ngắn', 'Mở Thư viện']);
  requireAny('src/components/learning/DashboardTodayCard.jsx', 'existing navigation usage', ['useNavigate', "navigate('/study-room'", "navigate('/library'"]);
  for (const bad of ['migrateLocalStorage', 'indexedDB.open', 'cloud sync', 'automatic sync', 'upload user data']) {
    if (normalize(combinedRuntime).includes(normalize(bad))) fail(`Runtime source contains unsupported storage/cloud keyword: ${bad}`);
  }
  if (!read('src/routes/Dashboard.jsx').includes('<DashboardTodayCard />')) fail('Dashboard route must mount DashboardTodayCard.');
}
function validate() {
  for (const file of requiredFiles) read(file);

  requireIncludes('docs/dashboard-today-card-runtime.md', [
    'Phase 12E', 'Dashboard Today Card Runtime', 'completed/merged through Phase 12D',
    'Dashboard Today Card', 'primary CTA', 'Existing Dashboard metrics remain available',
    'fallback states', 'local-first', 'browser-local', 'no backend', 'cloud', 'account sync',
    'does not change Study Room', 'does not change scoring', 'SRT', 'mastery', 'recommendation algorithms',
    'does not change storage schema', 'does not change backup format', 'does not change import/restore behavior',
    'does not implement IndexedDB', 'does not implement FSRS', 'encryption', 'Phase 12F', 'Unit Test Foundation Plan',
  ]);

  runtimeGuard();

  requireIncludes('README.md', ['Dashboard Today Card', 'clearer first study action', 'local-first']);
  requireAny('README.md', 'Study Room/scoring boundary', ['does not change Study Room logic or scoring/SRT/mastery/recommendation algorithms', 'no Study Room behavior changes']);
  requireIncludes('RELEASE_QA_V2.md', ['Phase 12E', 'Dashboard Today Card runtime', 'No Study Room behavior changes', 'No scoring/SRT/mastery/recommendation algorithm changes', 'No package version/dependency changes']);
  requireIncludes('docs/dashboard-today-card-ux-plan.md', ['Phase 12E', 'Today Card runtime']);
  requireIncludes('docs/phase12-roadmap-risk-register.md', ['Phase 12E', 'Dashboard Today Card Runtime']);
  requireIncludes('docs/public-release-notes.md', ['Dashboard Today Card runtime']);
  requireAny('docs/deployment-readiness.md', 'no deployment requirement change or local-first boundary', ['does not change deployment requirements', 'local-first/browser-local']);
  requireIncludes('.github/workflows/e2e-smoke.yml', ['node scripts/validate-dashboard-today-card-runtime.js']);

  scopeGuard();
  generatedArtifactGuard();
  forbiddenOverclaimGuard();
  console.log('Phase 12E Dashboard Today Card runtime validation passed.');
}

validate();
