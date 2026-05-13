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
function contextAround(text, match, span = 260) {
  const index = match.index ?? text.search(match);
  if (index < 0) return '';
  return text.slice(Math.max(0, index - span), Math.min(text.length, index + span));
}
function guarded(context) {
  return /no |not |does not|do not|must not|without|unless|unsupported|forbidden|avoid|separate|separately|requires|required|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|actual|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|unsafe claims|pending|reviewed|checklist|this phase does not|local-first|docs only|documented|browser-reachable|frontend-only/i.test(context);
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
  const basename = path.basename(normalized);
  const lowerPath = normalized.toLowerCase();
  const lowerBase = basename.toLowerCase();
  if (normalized === '.env.example') return false;
  if (/^\.env($|\.)/.test(normalized)) return true;
  if (/^(id_rsa|id_dsa|id_ecdsa|id_ed25519)$/i.test(basename)) return true;
  if (/(^|[-_.])service-account([-_.]|$)/i.test(lowerBase)) return true;
  if (/(^|[-_.])api-key([-_.]|$)/i.test(lowerBase)) return true;
  if (/(^|[-_.])access-token([-_.]|$)/i.test(lowerBase)) return true;
  if (/(^|[-_.])private-key([-_.]|$)/i.test(lowerBase)) return true;
  if (/(^|[-_.])credentials?([-_.]|$)/i.test(lowerBase)) return true;
  if (/(^|[-_.])secret([-_.]|$)/i.test(lowerBase)) return true;
  if (/(^|[-_.])token([-_.]|$)/i.test(lowerBase)) return true;
  if (lowerPath.endsWith('/key.pem') || lowerBase === 'key.pem') return true;
  if (lowerPath.endsWith('/private.key') || lowerBase === 'private.key') return true;
  if (/\.(pem|p12|pfx)$/i.test(basename)) return true;
  return false;
}

const doc = read('docs/edugen-boundary-polish.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const deployment = read('docs/deployment-readiness.md');
const publicNotes = read('docs/public-release-notes.md');
const publicLanding = read('docs/public-landing-page.md');
const mobile = read('docs/mobile-ux-smoke.md');
const finalAudit = read('docs/final-rc-audit.md');
const releaseDraft = read('docs/github-release-draft.md');
const publishChecklist = read('docs/release-tag-publish-checklist.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(doc, /Phase 10H/i, 'EduGen boundary polish doc must mention Phase 10H.');
assertMatches(doc, /EduGen Boundary\s*\/\s*Integration Polish/i, 'EduGen boundary polish doc must mention EduGen Boundary / Integration Polish.');
assertMatches(doc, /completed\/merged through Phase 10G|Phase 10G/i, 'EduGen boundary polish doc must mention completed/merged through Phase 10G.');
assertMatches(doc, /public landing\/root route polish exists/i, 'EduGen boundary polish doc must mention public landing/root route polish exists.');
assertMatches(doc, /social preview metadata exists/i, 'EduGen boundary polish doc must mention social preview metadata exists.');
assertMatches(doc, /direct-route SPA fallback audit docs exist/i, 'EduGen boundary polish doc must mention direct-route SPA fallback audit docs exist.');
assertMatches(doc, /screenshot capture checklist exists/i, 'EduGen boundary polish doc must mention screenshot capture checklist exists.');
assertMatches(doc, /README public-facing rewrite exists/i, 'EduGen boundary polish doc must mention README public-facing rewrite exists.');
assertMatches(doc, /performance\/bundle-size audit docs exist/i, 'EduGen boundary polish doc must mention performance/bundle-size audit docs exist.');
assertMatches(doc, /mobile UX smoke checklist exists/i, 'EduGen boundary polish doc must mention mobile UX smoke checklist exists.');
assertMatches(doc, /release tag has not been created/i, 'EduGen boundary polish doc must mention release tag has not been created.');
assertMatches(doc, /GitHub Release has not been published/i, 'EduGen boundary polish doc must mention GitHub Release has not been published.');
['JSON','CSV','text/Markdown','.txt/.md','PDF/DOCX/PPTX/ZIP'].forEach(term => assertIncludes(doc, term, `EduGen boundary polish doc must mention ${term}.`));
assertMatches(doc, /separate configured EduGen\/File Processor service/i, 'EduGen boundary polish doc must mention separate configured EduGen/File Processor service.');
assertMatches(doc, /browser-reachable service|browser-reachable EduGen/i, 'EduGen boundary polish doc must mention browser-reachable service.');
assertIncludes(doc, 'VITE_FILE_PROCESSOR_URL', 'EduGen boundary polish doc must mention VITE_FILE_PROCESSOR_URL.');
assertMatches(doc, /frontend-only hosting alone (cannot convert documents|does not provide document conversion)/i, 'EduGen boundary polish doc must mention frontend-only hosting alone cannot convert documents or does not provide document conversion.');
assertMatches(doc, /EduGen\/File Processor is not bundled into Shime/i, 'EduGen boundary polish doc must mention EduGen/File Processor is not bundled into Shime.');
assertMatches(doc, /no OCR claim|OCR is not included/i, 'EduGen boundary polish doc must mention no OCR claim.');
assertMatches(doc, /no backend\/cloud sync/i, 'EduGen boundary polish doc must mention no backend/cloud sync.');
assertMatches(doc, /Do not claim document import passed unless a real configured service run verifies it|do not claim document import passed unless actual configured/i, 'EduGen boundary polish doc must include evidence rule for document import pass claims.');
assertMatches(doc, /Phase 10I.*Cross-Device Export\/Import Polish|actual manual EduGen configured smoke/i, 'EduGen boundary polish doc must mention Phase 10I or manual EduGen configured smoke.');

assertIncludes(readme, 'docs/edugen-boundary-polish.md', 'README.md must link to docs/edugen-boundary-polish.md.');
assertMatches(releaseQa, /Phase 10H/i, 'RELEASE_QA_V2.md must include Phase 10H.');
assertMatches(deployment, /edugen-boundary-polish\.md|EduGen boundary polish/i, 'Deployment readiness must link/reference EduGen boundary polish.');
assertMatches(publicNotes, /edugen-boundary-polish\.md|EduGen boundary polish/i, 'Public release notes must link/reference EduGen boundary polish.');
assertMatches(publicLanding, /edugen-boundary-polish\.md|EduGen boundary polish/i, 'Public landing doc must link/reference EduGen boundary polish.');
assertMatches(mobile, /edugen-boundary-polish\.md|EduGen boundary polish/i, 'Mobile UX smoke doc must link/reference EduGen boundary polish.');
assertMatches(finalAudit, /edugen-boundary-polish\.md|EduGen boundary polish/i, 'Final RC audit must link/reference EduGen boundary polish.');
assertMatches(releaseDraft, /edugen-boundary-polish\.md|EduGen boundary polish/i, 'GitHub release draft must link/reference EduGen boundary polish.');
assertMatches(publishChecklist, /edugen-boundary-polish\.md|EduGen boundary polish/i, 'Release tag publish checklist must link/reference EduGen boundary polish.');
assertIncludes(workflow, 'node scripts/validate-edugen-boundary-polish.js', 'Workflow must include validate-edugen-boundary-polish.');

if (pkg.version !== '2.0.0-beta-ai.1') failures.push(`package version changed unexpectedly: ${pkg.version}`);
if (JSON.stringify(pkg.dependencies || {}) !== JSON.stringify(lockRoot.dependencies || {})) failures.push('package dependencies and lock root dependencies differ.');
if (JSON.stringify(pkg.devDependencies || {}) !== JSON.stringify(lockRoot.devDependencies || {})) failures.push('package devDependencies and lock root devDependencies differ.');

const tracked = gitTrackedFiles();
for (const file of tracked) {
  if (forbiddenTrackedFile(file)) failures.push(`Forbidden generated/secret artifact is tracked: ${file}`);
  if (/^e2e\/.*\.spec\.[jt]sx?$/.test(file)) {
    // Existing specs may be tracked, but this validator should not require edits.
  }
}

const currentDiff = (() => {
  try {
    return execSync('git diff --name-only HEAD', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return [];
  }
})();
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
]);
for (const file of currentDiff) {
  if (!allowedChanged.has(file)) failures.push(`Unexpected changed file for Phase 10H: ${file}`);
  if (/^(e2e\/|src\/)/.test(file) && !allowedChanged.has(file)) failures.push(`Runtime/E2E source file changed unexpectedly: ${file}`);
  if (/^(package\.json|package-lock\.json)$/.test(file) && !allowedChanged.has(file)) failures.push(`${file} changed unexpectedly.`);
}

const claimFiles = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/edugen-boundary-polish.md', doc],
  ['docs/deployment-readiness.md', deployment],
  ['docs/public-release-notes.md', publicNotes],
  ['docs/public-landing-page.md', publicLanding],
  ['docs/mobile-ux-smoke.md', mobile],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist]
];
const forbiddenClaims = [
  [/\bOCR\b/gi, 'OCR'],
  [/EduGen (is )?bundled|bundled EduGen|EduGen bundled/gi, 'EduGen bundled'],
  [/frontend-only (hosting )?(can|does|will|supports).*convert|frontend-only PDF\/DOCX\/PPTX\/ZIP conversion/gi, 'frontend-only document conversion'],
  [/document import (passed|verified|works|is supported).*PDF\/DOCX\/PPTX\/ZIP/gi, 'document import passed'],
  [/backend\/cloud sync|cloud sync|backend sync/gi, 'backend/cloud sync'],
  [/built-in AI generation|external AI\/API integration|external AI\/API calls/gi, 'AI/API integration'],
  [/release tag (created|has been created)|GitHub Release (published|has been published)/gi, 'release publication'],
  [/production certification|security certification|accessibility certification/gi, 'certification']
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
  console.error('EduGen boundary polish validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('EduGen boundary polish validation passed.');
