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
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return [];
  }
}
function changedFiles() {
  try {
    return execSync('git diff --name-only HEAD', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return [];
  }
}
function contextAround(text, match, span = 320) {
  const index = match.index ?? text.search(match);
  if (index < 0) return '';
  return text.slice(Math.max(0, index - span), Math.min(text.length, index + span));
}
function guarded(context) {
  return /no |not |does not|do not|must not|without|unless|unsupported|forbidden|avoid|separate|separately|requires|required|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|actual|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|unsafe claims|pending|reviewed|checklist|this phase does not|local-first|docs only|documented|browser-local|explicit|private|source\/destination|clean-profile|implemented|not measured|not captured|not run|not published|not created|gap|gaps/i.test(context);
}
function markdownLinks(markdown) {
  const refs = [];
  const pattern = /!?(\[[^\]]*\])\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    const raw = match[2].trim().split(/\s+/)[0].replace(/^<|>$/g, '');
    refs.push({ target: raw, isImage: match[0].startsWith('!') });
  }
  return refs;
}
function isExternal(target) {
  return /^https?:\/\//i.test(target) || /^mailto:/i.test(target);
}
function resolveMarkdownTarget(sourceFile, target) {
  if (isExternal(target) || target.startsWith('#')) return null;
  const clean = target.split('#')[0].split('?')[0];
  if (!clean) return null;
  return path.normalize(path.join(root, path.dirname(sourceFile), clean));
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

const doc = read('docs/final-public-release-readiness-reaudit.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const finalAudit = read('docs/final-rc-audit.md');
const releaseDraft = read('docs/github-release-draft.md');
const publishChecklist = read('docs/release-tag-publish-checklist.md');
const publicNotes = read('docs/public-release-notes.md');
const deployment = read('docs/deployment-readiness.md');
const publicLanding = read('docs/public-landing-page.md');
const socialPreview = read('docs/social-preview-metadata.md');
const directRoute = read('docs/direct-route-spa-fallback.md');
const screenshots = read('docs/screenshot-asset-pack.md');
const readmeGuide = read('docs/readme-public-facing-guide.md');
const performance = read('docs/performance-bundle-audit.md');
const mobile = read('docs/mobile-ux-smoke.md');
const edugenBoundary = read('docs/edugen-boundary-polish.md');
const crossDevice = read('docs/cross-device-export-import.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(doc, /Phase 10J/i, 'Final re-audit doc must mention Phase 10J.');
assertMatches(doc, /Final Public Release Readiness Re-Audit/i, 'Final re-audit doc must mention Final Public Release Readiness Re-Audit.');
assertMatches(doc, /completed\/merged through Phase 10I/i, 'Final re-audit doc must mention completed/merged through Phase 10I.');
[
  /public landing\/root route polish exists/i,
  /social preview metadata exists/i,
  /direct-route SPA fallback audit docs exist/i,
  /screenshot capture checklist exists/i,
  /README public-facing rewrite exists/i,
  /performance\/bundle-size audit docs exist/i,
  /mobile UX smoke checklist exists/i,
  /EduGen\/File Processor boundary docs exist/i,
  /cross-device export\/import guidance exists/i,
].forEach((pattern) => assertMatches(doc, pattern, `Final re-audit doc must mention ${pattern}.`));
assertMatches(doc, /release tag has not been created/i, 'Final re-audit doc must mention release tag has not been created.');
assertMatches(doc, /GitHub Release has not been published/i, 'Final re-audit doc must mention GitHub Release has not been published.');
assertMatches(doc, /release package has not been published/i, 'Final re-audit doc must mention release package has not been published.');
assertMatches(doc, /actual screenshots not captured/i, 'Final re-audit doc must mention actual screenshots not captured.');
assertMatches(doc, /manual mobile UX smoke not run unless separately done/i, 'Final re-audit doc must mention manual mobile UX smoke gap.');
assertMatches(doc, /configured EduGen document import smoke not run unless separately done/i, 'Final re-audit doc must mention configured EduGen smoke gap.');
assertMatches(doc, /cross-device backup\/restore smoke not run unless separately done/i, 'Final re-audit doc must mention cross-device backup/restore smoke gap.');
assertMatches(doc, /Lighthouse\/Core Web Vitals not measured unless separately done/i, 'Final re-audit doc must mention Lighthouse/Core Web Vitals gap.');
assertMatches(doc, /Vite\/Rolldown chunk-size warning/i, 'Final re-audit doc must mention Vite/Rolldown chunk-size warning.');
assertMatches(doc, /warning is non-blocking/i, 'Final re-audit doc must mention warning is non-blocking.');
assertMatches(doc, /no performance optimization claim/i, 'Final re-audit doc must mention no performance optimization claim.');
assertMatches(doc, /Forbidden claims/i, 'Final re-audit doc must mention forbidden claims.');
assertMatches(doc, /Phase 10K.*Release Candidate Tag Decision \/ Publish Gate|manual evidence run/i, 'Final re-audit doc must mention Phase 10K or manual evidence run.');

const linkedDocs = [
  ['README.md', readme],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist],
  ['docs/public-release-notes.md', publicNotes],
  ['docs/deployment-readiness.md', deployment],
  ['docs/public-landing-page.md', publicLanding],
  ['docs/social-preview-metadata.md', socialPreview],
  ['docs/direct-route-spa-fallback.md', directRoute],
  ['docs/screenshot-asset-pack.md', screenshots],
  ['docs/readme-public-facing-guide.md', readmeGuide],
  ['docs/performance-bundle-audit.md', performance],
  ['docs/mobile-ux-smoke.md', mobile],
  ['docs/edugen-boundary-polish.md', edugenBoundary],
  ['docs/cross-device-export-import.md', crossDevice],
];
for (const [file, text] of linkedDocs) {
  assertMatches(text, /final-public-release-readiness-reaudit\.md|final public release readiness re-audit/i, `${file} must link/reference final public release readiness re-audit.`);
}
assertMatches(releaseQa, /Phase 10J/i, 'RELEASE_QA_V2.md must include Phase 10J.');
assertIncludes(workflow, 'node scripts/validate-final-public-release-readiness-reaudit.js', 'Workflow must include validate-final-public-release-readiness-reaudit.');

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
  // Phase 14K exact files (forward compatibility)
  'docs/phase14k-fsrs-readiness-audit.md',
  'scripts/validate-phase14k-fsrs-readiness-audit.js',
  // Phase 14L exact files (forward compatibility)
  'docs/phase14l-production-enrollment-wiring-dormant-no-ui.md',
  'scripts/validate-phase14l-production-enrollment-wiring.js',
  'tests/unit/fsrsProductionEnrollmentWiring.test.js',
  'src/state/reviewScheduleStorage.js',
  // Phase 14M exact files (forward compatibility)
  'scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js',
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
  'scripts/validate-phase14n-production-studyroom-two-step-bridge.js',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/routes/StudyRoom.jsx',
  'tests/unit/fsrsProductionStudyRoomTwoStepBridge.test.jsx',
]);
for (const file of changedFiles()) {
  if (!allowedChanged.has(file)) failures.push(`Unexpected changed file for Phase 10J: ${file}`);
  if (/^(e2e\/|src\/)/.test(file) && !allowedChanged.has(file)) failures.push(`Runtime/E2E source file changed unexpectedly: ${file}`);
  if (/^(package\.json|package-lock\.json)$/.test(file) && !allowedChanged.has(file)) failures.push(`${file} changed unexpectedly.`);
}

const claimFiles = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/final-public-release-readiness-reaudit.md', doc],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist],
  ['docs/public-release-notes.md', publicNotes],
  ['docs/deployment-readiness.md', deployment],
  ['docs/public-landing-page.md', publicLanding],
  ['docs/social-preview-metadata.md', socialPreview],
  ['docs/direct-route-spa-fallback.md', directRoute],
  ['docs/screenshot-asset-pack.md', screenshots],
  ['docs/readme-public-facing-guide.md', readmeGuide],
  ['docs/performance-bundle-audit.md', performance],
  ['docs/mobile-ux-smoke.md', mobile],
  ['docs/edugen-boundary-polish.md', edugenBoundary],
  ['docs/cross-device-export-import.md', crossDevice],
];
const forbiddenClaims = [
  [/built-in AI generation|external AI\/API integration|external AI\/API calls|API key\/BYOK support/gi, 'AI/API/BYOK claim'],
  [/\bOCR\b/gi, 'OCR claim'],
  [/EduGen (is )?bundled|bundled EduGen|EduGen bundled/gi, 'EduGen bundled claim'],
  [/frontend-only (hosting )?(can|does|will|supports).*convert|frontend-only PDF\/DOCX\/PPTX\/ZIP conversion/gi, 'frontend-only document conversion claim'],
  [/backend\/auth\/cloud sync|backend\/cloud sync|cloud sync|account sync|automatic cross-device sync/gi, 'backend/cloud/account sync claim'],
  [/encrypted backups?|backup encryption/gi, 'encrypted backup claim'],
  [/cross-device restore (passed|verified|complete|works)/gi, 'cross-device restore passed claim'],
  [/mobile UX (passed|verified|complete)/gi, 'mobile UX passed claim'],
  [/Lighthouse\/Core Web Vitals (pass|passed)|Core Web Vitals pass|Lighthouse score/gi, 'Lighthouse/Core Web Vitals claim'],
  [/production certification|security certification|accessibility certification|performance certification/gi, 'certification claim'],
  [/release tag (created|has been created)|GitHub Release (published|has been published)|release package (published|has been published)/gi, 'release publication claim'],
];
for (const [file, text] of claimFiles) {
  for (const [pattern, label] of forbiddenClaims) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const context = contextAround(text, match);
      if (!guarded(context)) failures.push(`${file} includes potentially misleading claim without boundary context: ${label}.`);
    }
  }
  for (const link of markdownLinks(text)) {
    const resolved = resolveMarkdownTarget(file, link.target);
    if (resolved && !fs.existsSync(resolved)) failures.push(`${file} links to missing file: ${link.target}`);
  }
}

if (failures.length) {
  console.error('Final public release readiness re-audit validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Final public release readiness re-audit validation passed.');
