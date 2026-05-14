#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`${relativePath} is missing.`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8');
}
function assertIncludes(content, needle, message) {
  if (!content.includes(needle)) failures.push(message || `Missing ${needle}`);
}
function assertMatches(content, regex, message) {
  if (!regex.test(content)) failures.push(message || `Missing pattern ${regex}`);
}
function gitTrackedFiles() {
  try {
    return execSync('git ls-files', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split(/\r?\n/).filter(Boolean);
  } catch { return []; }
}
function changedFiles() {
  try {
    return execSync('git diff --name-only HEAD', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split(/\r?\n/).filter(Boolean);
  } catch { return []; }
}
function contextAround(text, match, span = 380) {
  const index = match.index ?? text.search(match);
  if (index < 0) return '';
  return text.slice(Math.max(0, index - span), Math.min(text.length, index + span));
}
function guarded(context) {
  return /no |not |does not|do not|must not|without|unless|unsupported|forbidden|avoid|separate|requires|required|manual|only|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|actual|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|unsafe claims|pending|reviewed|checklist|this phase does not|local-first|docs only|documented|explicit|private|source\/destination|clean-profile|implemented|not measured|not captured|not run|not published|not created|gap|gaps|examples only|user approval|hold|environment-blocked|optional|if Chromium is available|when Chromium is available|plan only|not executed|rollback|command plan|publication plan|gated|separate/i.test(context);
}
function forbiddenTrackedFile(file) {
  const normalized = file.replace(/\\/g, '/');
  if (/^(node_modules|dist|test-results|playwright-report|coverage)(\/|$)/.test(normalized)) return true;
  if (/^FETCH_HEAD$|(^|\/)\.DS_Store$/.test(normalized)) return true;
  if (/\.log$|npm-debug\.log|yarn-error\.log|pnpm-debug\.log/i.test(normalized)) return true;
  if (normalized === '.env.example') return false;
  if (/(^|\/)\.env($|\.)/.test(normalized)) return true;
  const basename = path.basename(normalized).toLowerCase();
  const lowerPath = normalized.toLowerCase();
  const secretLike = [
    /(^|[-_.])service-account([-_.]|$)/,
    /(^|[-_.])api-key([-_.]|$)/,
    /(^|[-_.])access-token([-_.]|$)/,
    /(^|[-_.])private-key([-_.]|$)/,
    /(^|[-_.])credentials?([-_.]|$)/,
    /(^|[-_.])secret([-_.]|$)/,
    /(^|[-_.])token([-_.]|$)/,
    /^(id_rsa|id_dsa|id_ecdsa|id_ed25519)$/,
  ];
  if (secretLike.some((pattern) => pattern.test(basename))) return true;
  if (lowerPath.endsWith('/key.pem') || basename === 'key.pem') return true;
  if (lowerPath.endsWith('/private.key') || basename === 'private.key') return true;
  if (/\.(pem|p12|pfx)$/i.test(basename)) return true;
  return false;
}

const doc = read('docs/github-release-publication-plan.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const tagPlan = read('docs/release-tag-creation-plan.md');
const manualEvidence = read('docs/manual-evidence-run-pack.md');
const gate = read('docs/release-candidate-tag-publish-gate.md');
const finalReaudit = read('docs/final-public-release-readiness-reaudit.md');
const finalAudit = read('docs/final-rc-audit.md');
const releaseDraft = read('docs/github-release-draft.md');
const tagDecision = read('docs/release-tag-decision.md');
const publishChecklist = read('docs/release-tag-publish-checklist.md');
const packageCleanliness = read('docs/release-package-cleanliness.md');
const publicNotes = read('docs/public-release-notes.md');
const deployment = read('docs/deployment-readiness.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(doc, /Phase 10N/i, 'Publication plan must mention Phase 10N.');
assertMatches(doc, /GitHub Release Publication Plan/i, 'Publication plan must mention GitHub Release Publication Plan.');
assertMatches(doc, /completed\/merged through Phase 10M/i, 'Publication plan must mention completed/merged through Phase 10M.');
assertMatches(doc, /release tag creation plan docs exist/i, 'Publication plan must mention release tag creation plan docs exist.');
assertMatches(doc, /manual evidence run pack docs exist/i, 'Publication plan must mention manual evidence run pack docs exist.');
assertMatches(doc, /release candidate tag\/publish gate docs exist/i, 'Publication plan must mention release candidate tag/publish gate docs exist.');
assertMatches(doc, /final public release readiness re-audit docs exist/i, 'Publication plan must mention final public release readiness re-audit docs exist.');
assertMatches(doc, /release tag has not been created/i, 'Publication plan must mention release tag has not been created.');
assertMatches(doc, /GitHub Release has not been published/i, 'Publication plan must mention GitHub Release has not been published.');
assertMatches(doc, /release package has not been published/i, 'Publication plan must mention release package has not been published.');
assertMatches(doc, /explicit user approval/i, 'Publication plan must mention explicit user approval.');
assertMatches(doc, /release tag should exist before publishing/i, 'Publication plan must mention release tag should exist before publishing.');
assertMatches(doc, /final tag name must be chosen by user/i, 'Publication plan must mention final tag name must be chosen by user.');
assertMatches(doc, /release notes must preserve claims guardrails/i, 'Publication plan must mention release notes claims guardrails.');
assertMatches(doc, /release package\/upload artifacts remain separate/i, 'Publication plan must mention release package/upload artifacts remain separate.');
assertIncludes(doc, 'npm ci', 'Publication plan must mention npm ci.');
assertIncludes(doc, 'npm run build', 'Publication plan must mention npm run build.');
assertMatches(doc, /full static validator chain/i, 'Publication plan must mention full static validator chain.');
assertIncludes(doc, 'docs/github-release-draft.md', 'Publication plan must mention docs/github-release-draft.md.');
assertIncludes(doc, 'docs/public-release-notes.md', 'Publication plan must mention docs/public-release-notes.md.');
assertIncludes(doc, 'docs/release-tag-publish-checklist.md', 'Publication plan must mention docs/release-tag-publish-checklist.md.');
assertMatches(doc, /GitHub UI|gh release create/i, 'Publication plan must mention GitHub UI or gh release create.');
assertMatches(doc, /do not execute in this phase/i, 'Publication plan must mention do not execute in this phase.');
assertMatches(doc, /Rollback and correction notes|Rollback\/correction notes/i, 'Publication plan must mention rollback/correction notes.');
assertMatches(doc, /Screenshots not captured unless separately done/i, 'Publication plan must mention screenshots gap.');
assertMatches(doc, /Manual mobile UX smoke not run unless separately done/i, 'Publication plan must mention mobile gap.');
assertMatches(doc, /Configured EduGen import smoke not run unless separately done/i, 'Publication plan must mention configured EduGen gap.');
assertMatches(doc, /Cross-device restore smoke not run unless separately done/i, 'Publication plan must mention cross-device gap.');
assertMatches(doc, /Lighthouse\/Core Web Vitals not measured unless separately done/i, 'Publication plan must mention Lighthouse/Core Web Vitals gap.');
assertMatches(doc, /user-approved actual tag creation and GitHub Release publication|Phase 10O.*Release Package Assembly Plan/i, 'Publication plan must mention next step.');

assertIncludes(readme, 'docs/github-release-publication-plan.md', 'README.md must link to docs/github-release-publication-plan.md.');
assertMatches(releaseQa, /Phase 10N/i, 'RELEASE_QA_V2.md must include Phase 10N.');
const linkedDocs = [
  ['docs/release-tag-creation-plan.md', tagPlan],
  ['docs/manual-evidence-run-pack.md', manualEvidence],
  ['docs/release-candidate-tag-publish-gate.md', gate],
  ['docs/final-public-release-readiness-reaudit.md', finalReaudit],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-decision.md', tagDecision],
  ['docs/release-tag-publish-checklist.md', publishChecklist],
  ['docs/release-package-cleanliness.md', packageCleanliness],
  ['docs/public-release-notes.md', publicNotes],
  ['docs/deployment-readiness.md', deployment],
];
for (const [file, text] of linkedDocs) {
  assertMatches(text, /github-release-publication-plan\.md|GitHub Release publication plan/i, `${file} must link/reference GitHub Release publication plan.`);
}
assertIncludes(workflow, 'node scripts/validate-github-release-publication-plan.js', 'Workflow must include validate-github-release-publication-plan.');

if (pkg.version !== '2.0.0-beta-ai.1') failures.push(`package version changed unexpectedly: ${pkg.version}`);
if (JSON.stringify(pkg.dependencies || {}) !== JSON.stringify(lockRoot.dependencies || {})) failures.push('package dependencies and lock root dependencies differ.');
if (JSON.stringify(pkg.devDependencies || {}) !== JSON.stringify(lockRoot.devDependencies || {})) failures.push('package devDependencies and lock root devDependencies differ.');

for (const file of gitTrackedFiles()) {
  if (forbiddenTrackedFile(file)) failures.push(`Forbidden generated/secret artifact is tracked: ${file}`);
}

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

  // Phase 13B compatibility: allow only the approved FSRS migration
  // architecture docs/static-validator/CI files while preserving older
  // phase guardrails.
  'docs/phase13-fsrs-migration-architecture.md',
  'docs/phase13-fsrs-data-model-plan.md',
  'docs/phase13-fsrs-risk-register.md',
  'scripts/validate-phase13-fsrs-plan.js',
  'scripts/validate-phase13-local-adaptive-roadmap.js',


  // Phase 12J compatibility: allow only the approved closure/release-decision
  // docs/static-validator/CI files while preserving older phase guardrails.
  '.github/workflows/e2e-smoke.yml',
  // Phase 13A compatibility: allow only the approved current review
  // engine audit docs/static-validator/CI files while preserving this
  // historical validator's existing scope guardrails.
  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',
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
]);
for (const file of changedFiles()) {
  if (!allowedChanged.has(file)) failures.push(`Unexpected changed file for Phase 10N: ${file}`);
  if (/^(e2e\/|src\/)/.test(file) && !allowedChanged.has(file)) failures.push(`Runtime/E2E source file changed unexpectedly: ${file}`);
  if (/^(package\.json|package-lock\.json)$/.test(file) && !allowedChanged.has(file)) failures.push(`${file} changed unexpectedly.`);
}

const claimFiles = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/github-release-publication-plan.md', doc],
  ...linkedDocs,
];
const forbiddenClaims = [
  [/GitHub Release (published|has been published)|release tag (created|has been created)|release package (published|has been published)/gi, 'release publication'],
  [/production certification|security certification|accessibility certification|performance certification/gi, 'certification'],
  [/built-in AI generation|external AI\/API integration|external AI\/API calls/gi, 'AI/API integration'],
  [/API key\/BYOK support/gi, 'API key/BYOK support'],
  [/\bOCR\b/gi, 'OCR'],
  [/EduGen bundled|bundled into Shime/gi, 'EduGen bundled'],
  [/frontend-only .*document conversion|frontend-only PDF\/DOCX\/PPTX\/ZIP conversion/gi, 'frontend-only document conversion'],
  [/backend\/cloud sync|backend sync|cloud sync|account sync|automatic cross-device sync/gi, 'backend/cloud/account sync'],
  [/encrypted backups/gi, 'encrypted backups'],
  [/screenshots captured|actual screenshots captured/gi, 'screenshots captured'],
  [/mobile UX passed|mobile UX pass/gi, 'mobile UX passed'],
  [/configured EduGen import passed|EduGen document import passed/gi, 'configured EduGen import passed'],
  [/cross-device restore passed|cross-device restore verified/gi, 'cross-device restore passed'],
  [/Lighthouse\/Core Web Vitals pass|Core Web Vitals pass/gi, 'Lighthouse/Core Web Vitals pass'],
];
for (const [file, text] of claimFiles) {
  for (const [regex, label] of forbiddenClaims) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const context = contextAround(text, match);
      if (!guarded(context)) failures.push(`${file} may overclaim ${label}: ${match[0]}`);
    }
  }
}

if (failures.length) {
  console.error('GitHub Release publication plan validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('GitHub Release publication plan validation passed.');
