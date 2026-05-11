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
function assertIncludes(content, needle, message) { if (!content.includes(needle)) failures.push(message || `Missing ${needle}`); }
function assertMatches(content, regex, message) { if (!regex.test(content)) failures.push(message || `Missing pattern ${regex}`); }
function gitTrackedFiles() {
  try { return execSync('git ls-files', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split(/\r?\n/).filter(Boolean); }
  catch { return []; }
}
function changedFiles() {
  try { return execSync('git diff --name-only HEAD', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split(/\r?\n/).filter(Boolean); }
  catch { return []; }
}
function contextAround(text, match, span = 460) {
  const index = match.index ?? text.search(match);
  if (index < 0) return '';
  return text.slice(Math.max(0, index - span), Math.min(text.length, index + span));
}
function guarded(context) {
  return /no |not |does not|do not|must not|without|unless|unsupported|forbidden|avoid|separate|requires|required|manual|only|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|actual|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|unsafe claims|pending|reviewed|checklist|this phase does not|local-first|docs only|documented|explicit|private|source\/destination|clean-profile|implemented|not measured|not captured|not run|not published|not created|gap|gaps|examples only|user approval|environment-blocked|optional|if Chromium is available|when Chromium is available|plan only|not executed|rollback|command plan|publication plan|assembly plan|gated|separate|exclude|excluded|do not include|not imply|execution checklist|authorization packet|approval gates|still pending|not claimed|blocker|stop before|requires explicit/i.test(context);
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

const doc = read('docs/final-main-release-authorization.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const finalExecution = read('docs/final-release-execution-checklist.md');
const packagePlan = read('docs/release-package-assembly-plan.md');
const publication = read('docs/github-release-publication-plan.md');
const tagPlan = read('docs/release-tag-creation-plan.md');
const manualEvidence = read('docs/manual-evidence-run-pack.md');
const gate = read('docs/release-candidate-tag-publish-gate.md');
const finalReaudit = read('docs/final-public-release-readiness-reaudit.md');
const packageCleanliness = read('docs/release-package-cleanliness.md');
const releaseDraft = read('docs/github-release-draft.md');
const publishChecklist = read('docs/release-tag-publish-checklist.md');
const publicNotes = read('docs/public-release-notes.md');
const deployment = read('docs/deployment-readiness.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(doc, /Phase 10Q/i, 'Final main authorization doc must mention Phase 10Q.');
assertMatches(doc, /Final Main Verification \/ Release Authorization Packet/i, 'Final main authorization doc must mention its title.');
assertMatches(doc, /completed\/merged through Phase 10P/i, 'Final main authorization doc must mention completed/merged through Phase 10P.');
assertMatches(doc, /final release execution checklist docs exist/i, 'Must mention final release execution checklist docs exist.');
assertMatches(doc, /release package assembly plan docs exist/i, 'Must mention release package assembly plan docs exist.');
assertMatches(doc, /GitHub Release publication plan docs exist/i, 'Must mention GitHub Release publication plan docs exist.');
assertMatches(doc, /release tag creation plan docs exist/i, 'Must mention release tag creation plan docs exist.');
assertMatches(doc, /manual evidence run pack docs exist/i, 'Must mention manual evidence run pack docs exist.');
assertMatches(doc, /release candidate tag\/publish gate docs exist/i, 'Must mention release candidate tag/publish gate docs exist.');
assertMatches(doc, /final public release readiness re-audit docs exist/i, 'Must mention final public release readiness re-audit docs exist.');
assertMatches(doc, /release package has not been created/i, 'Must mention release package has not been created.');
assertMatches(doc, /release package has not been published/i, 'Must mention release package has not been published.');
assertMatches(doc, /release tag has not been created/i, 'Must mention release tag has not been created.');
assertMatches(doc, /GitHub Release has not been published/i, 'Must mention GitHub Release has not been published.');
assertMatches(doc, /explicit user approval/i, 'Must mention explicit user approval.');
assertMatches(doc, /package version remains unchanged unless explicitly approved/i, 'Must mention package version remains unchanged unless explicitly approved.');
assertIncludes(doc, 'npm ci', 'Must mention npm ci.');
assertIncludes(doc, 'npm run build', 'Must mention npm run build.');
assertMatches(doc, /full static validator chain/i, 'Must mention full static validator chain.');
assertMatches(doc, /E2E smoke\/onboarding if Chromium available/i, 'Must mention E2E smoke/onboarding if Chromium available.');
assertMatches(doc, /manual evidence pack/i, 'Must mention manual evidence pack.');
assertMatches(doc, /known Vite\/Rolldown chunk-size warning/i, 'Must mention known Vite/Rolldown chunk-size warning.');
assertMatches(doc, /screenshots not captured unless separately done/i, 'Must mention screenshots not captured unless separately done.');
assertMatches(doc, /Lighthouse\/Core Web Vitals not measured unless separately done/i, 'Must mention Lighthouse/Core Web Vitals not measured unless separately done.');
assertMatches(doc, /Choose final tag name/i, 'Must mention choose final tag name.');
assertMatches(doc, /Create annotated tag/i, 'Must mention create annotated tag.');
assertMatches(doc, /Assemble release package/i, 'Must mention assemble release package.');
assertMatches(doc, /Publish GitHub Release/i, 'Must mention publish GitHub Release.');
assertMatches(doc, /Upload release assets/i, 'Must mention upload release assets.');
assertMatches(doc, /Record final release evidence/i, 'Must mention record final release evidence.');

assertIncludes(readme, 'docs/final-main-release-authorization.md', 'README.md must link to docs/final-main-release-authorization.md.');
assertMatches(releaseQa, /Phase 10Q/i, 'RELEASE_QA_V2.md must include Phase 10Q.');
const linkedDocs = [
  ['docs/final-release-execution-checklist.md', finalExecution],
  ['docs/release-package-assembly-plan.md', packagePlan],
  ['docs/github-release-publication-plan.md', publication],
  ['docs/release-tag-creation-plan.md', tagPlan],
  ['docs/manual-evidence-run-pack.md', manualEvidence],
  ['docs/release-candidate-tag-publish-gate.md', gate],
  ['docs/final-public-release-readiness-reaudit.md', finalReaudit],
  ['docs/release-package-cleanliness.md', packageCleanliness],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist],
  ['docs/public-release-notes.md', publicNotes],
  ['docs/deployment-readiness.md', deployment],
];
for (const [file, text] of linkedDocs) {
  assertMatches(text, /final-main-release-authorization\.md|final main release authorization|final main verification/i, `${file} must link/reference final main release authorization.`);
}
assertIncludes(workflow, 'node scripts/validate-final-main-release-authorization.js', 'Workflow must include validate-final-main-release-authorization.');

if (pkg.version !== '2.0.0-beta-ai.1') failures.push(`package version changed unexpectedly: ${pkg.version}`);
if (JSON.stringify(pkg.dependencies || {}) !== JSON.stringify(lockRoot.dependencies || {})) failures.push('package dependencies and lock root dependencies differ.');
if (JSON.stringify(pkg.devDependencies || {}) !== JSON.stringify(lockRoot.devDependencies || {})) failures.push('package devDependencies and lock root devDependencies differ.');

for (const file of gitTrackedFiles()) {
  if (forbiddenTrackedFile(file)) failures.push(`Forbidden generated/secret artifact is tracked: ${file}`);
}

const allowedChanged = new Set([

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
for (const file of changedFiles()) {
  if (!allowedChanged.has(file)) failures.push(`Unexpected changed file for Phase 10Q: ${file}`);
  if (/^(e2e\/|src\/)/.test(file) && !allowedChanged.has(file)) failures.push(`Runtime/E2E source file changed unexpectedly: ${file}`);
  if (/^(package\.json|package-lock\.json)$/.test(file) && !allowedChanged.has(file)) failures.push(`${file} changed unexpectedly.`);
}

const claimFiles = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/final-main-release-authorization.md', doc],
  ...linkedDocs,
];
const forbiddenClaims = [
  [/final release executed|release execution completed/gi, 'final release executed'],
  [/release package (created|has been created|published|has been published|uploaded|has been uploaded)/gi, 'release package created/published'],
  [/GitHub Release (published|has been published)|release tag (created|has been created)|tag pushed/gi, 'release/tag publication'],
  [/package version changed/gi, 'package version changed'],
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
  console.error('Final main release authorization validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Final main release authorization validation passed.');
