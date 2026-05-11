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
    return execSync('git ls-files', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}
function changedFiles() {
  try {
    return execSync('git diff --name-only HEAD', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}
function contextAround(text, regex, span = 460) {
  const match = regex.exec(text);
  if (!match) return '';
  const index = match.index;
  return text.slice(Math.max(0, index - span), Math.min(text.length, index + span));
}
function guarded(context) {
  return /no |not |does not|do not|must not|without|unless|unsupported|forbidden|avoid|separate|requires|required|manual|only|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|actual|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|unsafe claims|pending|reviewed|checklist|this phase does not|local-first|docs only|documented|explicit|private|implemented|not measured|not captured|not run|not published|not created|gap|gaps|examples only|user approval|environment-blocked|optional|if Chromium is available|when Chromium is available|plan only|not executed|rollback|command plan|publication plan|assembly plan|gated|separate|exclude|excluded|do not include|not imply|execution checklist|authorization packet|approval gates|still pending|not claimed|freeze|unpublished|final decision|reopening requires/i.test(context);
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

const doc = read('docs/release-candidate-freeze-final-decision.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const finalAuth = read('docs/final-main-release-authorization.md');
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
const pkg = JSON.parse(read('package.json') || '{}');
const lock = JSON.parse(read('package-lock.json') || '{}');
const lockRoot = lock.packages?.[''] || {};

assertMatches(doc, /Phase 10R/i, 'Freeze memo must mention Phase 10R.');
assertMatches(doc, /Release Candidate Freeze \/ Final Decision Memo/i, 'Freeze memo must mention its title.');
assertMatches(doc, /completed\/merged through Phase 10Q/i, 'Freeze memo must mention completed/merged through Phase 10Q.');
assertMatches(doc, /final main verification \/ release authorization packet docs exist/i, 'Must mention final main authorization docs exist.');
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
assertMatches(doc, /planning track is complete/i, 'Must mention planning track is complete.');
assertMatches(doc, /release candidate remains unpublished/i, 'Must mention release candidate remains unpublished.');
assertMatches(doc, /final decision options/i, 'Must mention final decision options.');
assertMatches(doc, /optional manual evidence/i, 'Must mention optional manual evidence.');
assertMatches(doc, /product development reopening requires explicit user request/i, 'Must mention product development reopening requires explicit user request.');
assertMatches(doc, /screenshots not captured unless separately done/i, 'Must mention screenshots not captured unless separately done.');
assertMatches(doc, /Lighthouse\/Core Web Vitals not measured unless separately done/i, 'Must mention Lighthouse/Core Web Vitals not measured unless separately done.');
assertMatches(doc, /user-approved final release execution/i, 'Must mention user-approved final release execution.');

const requiredInventory = [
  /Public landing\/root route polish/i,
  /Social preview metadata/i,
  /Direct-route SPA fallback audit/i,
  /Screenshot capture checklist/i,
  /Public README rewrite/i,
  /Performance\/bundle audit docs/i,
  /Mobile UX smoke checklist/i,
  /EduGen\/File Processor boundary docs/i,
  /Cross-device export\/import guidance/i,
  /Final public release re-audit/i,
  /Release tag\/publish gate/i,
  /Manual evidence run pack/i,
  /Release tag creation plan/i,
  /GitHub Release publication plan/i,
  /Release package assembly plan/i,
  /Final release execution checklist/i,
  /Final main authorization packet/i,
];
for (const pattern of requiredInventory) assertMatches(doc, pattern, `Freeze memo inventory missing ${pattern}.`);

assertIncludes(readme, 'docs/release-candidate-freeze-final-decision.md', 'README.md must link to docs/release-candidate-freeze-final-decision.md.');
assertMatches(releaseQa, /Phase 10R/i, 'RELEASE_QA_V2.md must include Phase 10R.');
const linkedDocs = [
  ['docs/final-main-release-authorization.md', finalAuth],
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
for (const [file, content] of linkedDocs) {
  if (!/release-candidate-freeze-final-decision\.md|release candidate freeze/i.test(content)) {
    failures.push(`${file} must link to docs/release-candidate-freeze-final-decision.md or reference release candidate freeze.`);
  }
}
assertIncludes(workflow, 'node scripts/validate-release-candidate-freeze-final-decision.js', 'Workflow must include validate-release-candidate-freeze-final-decision.');

if (pkg.version !== '2.0.0-beta-ai.1') failures.push(`package.json version changed unexpectedly: ${pkg.version}`);
if (lockRoot.version && lockRoot.version !== pkg.version) failures.push(`package-lock root version ${lockRoot.version} does not match package.json ${pkg.version}.`);
if (JSON.stringify(pkg.dependencies || {}) !== JSON.stringify(lockRoot.dependencies || {})) failures.push('package-lock dependencies differ from package.json dependencies.');
if (JSON.stringify(pkg.devDependencies || {}) !== JSON.stringify(lockRoot.devDependencies || {})) failures.push('package-lock devDependencies differ from package.json devDependencies.');

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
  if (allowedChanged.has(file)) continue;
  failures.push(`Unexpected changed file for Phase 10R: ${file}`);
  if (/^(src|e2e|edugen|server|api)(\/|$)/.test(file)) failures.push(`Runtime/test/source file changed unexpectedly: ${file}`);
}
for (const file of gitTrackedFiles()) {
  if (forbiddenTrackedFile(file)) failures.push(`Forbidden generated/secret artifact is tracked: ${file}`);
}

const combined = [readme, releaseQa, doc, finalAuth, finalExecution, packagePlan, publication, tagPlan, manualEvidence, gate, finalReaudit, packageCleanliness, releaseDraft, publishChecklist, publicNotes, deployment].join('\n---DOC---\n');
const unsafeClaims = [
  [/\bfinal release executed\b/i, 'final release executed'],
  [/\brelease package (created|published|uploaded)\b/i, 'release package created/published/uploaded'],
  [/\bGitHub Release published\b/i, 'GitHub Release published'],
  [/\brelease tag created\b/i, 'release tag created'],
  [/\btag pushed\b/i, 'tag pushed'],
  [/\bpackage version changed\b/i, 'package version changed'],
  [/\bproduction certification\b/i, 'production certification'],
  [/\bsecurity certification\b/i, 'security certification'],
  [/\baccessibility certification\b|\bWCAG compliance\b/i, 'accessibility/WCAG certification'],
  [/\bperformance certification\b/i, 'performance certification'],
  [/\bbuilt-in AI generation\b/i, 'built-in AI generation'],
  [/\bexternal AI\/API integration\b|\bexternal AI API integration\b/i, 'external AI/API integration'],
  [/\bAPI key\/BYOK support\b|\bBYOK support\b/i, 'API key/BYOK support'],
  [/\bOCR\b/i, 'OCR'],
  [/\bEduGen bundled into Shime\b|\bEduGen is bundled\b/i, 'EduGen bundled into Shime'],
  [/\bfrontend-only document conversion\b|\bfrontend-only PDF\/DOCX\/PPTX\/ZIP conversion\b/i, 'frontend-only document conversion'],
  [/\bbackend\/cloud sync\b|\bbackend sync\b|\bcloud sync\b/i, 'backend/cloud sync'],
  [/\baccount sync\b/i, 'account sync'],
  [/\bautomatic cross-device sync\b/i, 'automatic cross-device sync'],
  [/\bencrypted backups\b/i, 'encrypted backups'],
  [/\bscreenshots captured\b/i, 'screenshots captured'],
  [/\bmobile UX passed\b/i, 'mobile UX passed'],
  [/\bconfigured EduGen import passed\b/i, 'configured EduGen import passed'],
  [/\bcross-device restore passed\b/i, 'cross-device restore passed'],
  [/\bLighthouse\/Core Web Vitals pass\b/i, 'Lighthouse/Core Web Vitals pass'],
];
for (const [regex, label] of unsafeClaims) {
  let match;
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  while ((match = re.exec(combined))) {
    const context = contextAround(combined, new RegExp(regex.source, regex.flags.replace('g', '')));
    if (!guarded(context)) failures.push(`Potential unsupported claim without guardrail: ${label}`);
    break;
  }
}

if (failures.length) {
  console.error('Release candidate freeze final decision validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Release candidate freeze final decision validation passed.');
