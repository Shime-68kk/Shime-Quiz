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
  return /no |not |does not|do not|must not|without|unless|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|actual|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|unsafe claims|pending|reviewed|checklist|this phase does not|not a full|no screenshot|not completed|local-first|không|non-blocking|warning|audit|follow-up|future optimization|measured|if measured|unless measured|unless actual|environment|docs only|documented/i.test(context);
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

const doc = read('docs/mobile-ux-smoke.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const performance = read('docs/performance-bundle-audit.md');
const screenshotPack = read('docs/screenshot-asset-pack.md');
const publicLanding = read('docs/public-landing-page.md');
const socialPreview = read('docs/social-preview-metadata.md');
const directRoute = read('docs/direct-route-spa-fallback.md');
const finalAudit = read('docs/final-rc-audit.md');
const releaseDraft = read('docs/github-release-draft.md');
const publishChecklist = read('docs/release-tag-publish-checklist.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(doc, /Phase 10G/i, 'Mobile UX smoke doc must mention Phase 10G.');
assertMatches(doc, /Mobile UX Smoke\s*\/\s*Responsive Polish/i, 'Mobile UX smoke doc must mention Mobile UX Smoke / Responsive Polish.');
assertMatches(doc, /completed\/merged through Phase 10F|Phase 10F/i, 'Mobile UX smoke doc must mention completed/merged through Phase 10F.');
assertMatches(doc, /public landing\/root route polish exists/i, 'Mobile UX smoke doc must mention public landing/root route polish exists.');
assertMatches(doc, /social preview metadata exists/i, 'Mobile UX smoke doc must mention social preview metadata exists.');
assertMatches(doc, /direct-route SPA fallback audit docs exist/i, 'Mobile UX smoke doc must mention direct-route SPA fallback audit docs exist.');
assertMatches(doc, /screenshot capture checklist exists/i, 'Mobile UX smoke doc must mention screenshot capture checklist exists.');
assertMatches(doc, /README public-facing rewrite exists/i, 'Mobile UX smoke doc must mention README public-facing rewrite exists.');
assertMatches(doc, /performance\/bundle-size audit docs exist/i, 'Mobile UX smoke doc must mention performance/bundle-size audit docs exist.');
assertMatches(doc, /release tag has not been created/i, 'Mobile UX smoke doc must mention release tag has not been created.');
assertMatches(doc, /GitHub Release has not been published/i, 'Mobile UX smoke doc must mention GitHub Release has not been published.');
['360x640','375x667','390x844','412x915','768x1024'].forEach(viewport => assertIncludes(doc, viewport, `Mobile UX smoke doc must mention ${viewport}.`));
assertMatches(doc, /root `\/`|root \/|Open root/i, 'Mobile UX smoke doc must mention root `/`.');
assertIncludes(doc, '`/dashboard`', 'Mobile UX smoke doc must mention `/dashboard`.');
assertIncludes(doc, '`/library`', 'Mobile UX smoke doc must mention `/library`.');
assertMatches(doc, /Dashboard/i, 'Mobile UX smoke doc must mention Dashboard.');
assertMatches(doc, /Library/i, 'Mobile UX smoke doc must mention Library.');
assertMatches(doc, /Study Room/i, 'Mobile UX smoke doc must mention Study Room.');
assertMatches(doc, /Dùng quiz mẫu|demo quickstart/i, 'Mobile UX smoke doc must mention Dùng quiz mẫu or demo quickstart.');
assertMatches(doc, /import controls/i, 'Mobile UX smoke doc must mention import controls.');
assertMatches(doc, /JSON/i, 'Mobile UX smoke doc must mention JSON.');
assertMatches(doc, /CSV/i, 'Mobile UX smoke doc must mention CSV.');
assertMatches(doc, /text\/Markdown/i, 'Mobile UX smoke doc must mention text/Markdown.');
assertMatches(doc, /\.txt\/\.md/i, 'Mobile UX smoke doc must mention .txt/.md.');
assertMatches(doc, /EduGen boundary|separate service/i, 'Mobile UX smoke doc must mention EduGen boundary or separate service.');
assertMatches(doc, /manual AI workflow/i, 'Mobile UX smoke doc must mention manual AI workflow.');
assertMatches(doc, /preview\/review\/confirm-save/i, 'Mobile UX smoke doc must mention preview/review/confirm-save.');
assertMatches(doc, /backup\/restore/i, 'Mobile UX smoke doc must mention backup/restore.');
assertMatches(doc, /no obvious horizontal overflow/i, 'Mobile UX smoke doc must mention no obvious horizontal overflow.');
assertMatches(doc, /no essential controls are clipped off-screen/i, 'Mobile UX smoke doc must mention no essential controls clipped off-screen.');
assertMatches(doc, /readable text|text remains readable/i, 'Mobile UX smoke doc must mention readable text.');
assertMatches(doc, /Do not claim mobile UX smoke passed unless an actual mobile\/responsive run passes|do not claim mobile UX.*actual/i, 'Mobile UX smoke doc must mention no mobile UX pass claim without run evidence.');
assertMatches(doc, /Do not claim Lighthouse\/Core Web Vitals pass unless measured|Lighthouse\/Core Web Vitals.*unless measured/i, 'Mobile UX smoke doc must mention no Lighthouse/Core Web Vitals pass unless measured.');
assertMatches(doc, /Do not claim mobile performance certified|mobile performance certified/i, 'Mobile UX smoke doc must mention no mobile performance certification.');
assertMatches(doc, /Phase 10H.*EduGen Boundary\s*\/\s*Integration Polish|actual manual mobile smoke run/i, 'Mobile UX smoke doc must mention Phase 10H or actual manual mobile smoke run.');

assertIncludes(readme, 'docs/mobile-ux-smoke.md', 'README.md must link to docs/mobile-ux-smoke.md.');
assertMatches(releaseQa, /Phase 10G/i, 'RELEASE_QA_V2.md must include Phase 10G.');
assertMatches(performance, /mobile-ux-smoke\.md|mobile UX smoke/i, 'Performance audit doc must link/reference mobile UX smoke.');
assertMatches(screenshotPack, /mobile-ux-smoke\.md|mobile UX smoke/i, 'Screenshot asset pack must link/reference mobile UX smoke.');
assertMatches(publicLanding, /mobile-ux-smoke\.md|mobile UX smoke/i, 'Public landing doc must link/reference mobile UX smoke.');
assertMatches(socialPreview, /mobile-ux-smoke\.md|mobile UX smoke/i, 'Social preview doc must link/reference mobile UX smoke.');
assertMatches(directRoute, /mobile-ux-smoke\.md|mobile UX smoke/i, 'Direct route fallback doc must link/reference mobile UX smoke.');
assertMatches(finalAudit, /mobile-ux-smoke\.md|mobile UX smoke/i, 'Final RC audit must link/reference mobile UX smoke.');
assertMatches(releaseDraft, /mobile-ux-smoke\.md|mobile UX smoke/i, 'GitHub release draft must link/reference mobile UX smoke.');
assertMatches(publishChecklist, /mobile-ux-smoke\.md|mobile UX smoke/i, 'Release tag publish checklist must link/reference mobile UX smoke.');
assertIncludes(workflow, 'node scripts/validate-mobile-ux-smoke.js', 'CI workflow must run validate-mobile-ux-smoke.js.');

[
  'validate-performance-bundle-audit',
  'validate-readme-public-facing',
  'validate-screenshot-asset-pack',
  'validate-direct-route-spa-fallback',
  'validate-social-preview-metadata',
  'validate-public-landing-page',
  'validate-accessibility-keyboard-smoke',
  'validate-study-dashboard-regression-smoke',
  'validate-backup-restore-regression-smoke',
  'validate-import-regression-smoke',
  'validate-release-tag-publish-checklist',
  'validate-release-package-cleanliness',
  'validate-github-release-draft',
  'validate-release-tag-decision',
  'validate-ci-green-verification',
  'validate-final-rc-audit',
  'validate-local-e2e-verification-docs',
  'validate-onboarding-e2e-smoke',
  'validate-public-positioning-lock',
  'validate-dashboard-first-run-onboarding',
  'validate-library-empty-state-onboarding',
  'validate-demo-quickstart-onboarding',
  'validate-demo-sample-quickstart',
  'validate-visual-asset-guidance',
  'validate-demo-sample-pack',
  'validate-demo-readiness-docs',
  'validate-public-release-docs',
  'validate-release-candidate-status',
  'validate-dashboard-plan-completion-guard',
  'validate-ai-draft-evaluation-fixtures',
  'validate-ai-integration-readiness',
  'validate-ai-output-import-hardening',
  'validate-ai-prompt-export',
  'validate-ai-planning-docs',
  'validate-import-ux-release-readiness',
  'validate-quiz-draft-quality',
  'validate-edugen-document-integration',
  'validate-edugen-pdf-integration',
  'validate-text-file-import',
  'validate-text-quiz-parser',
  'validate-backup-restore-recovery',
  'validate-dashboard-performance',
  'validate-import-validation',
  'validate-storage-sync',
  'validate-weighted-selection',
  'validate-recommendation-feedback',
  'validate-exam-readiness',
  'validate-v2-release-hardening',
  'validate-smoke-fixture'
].forEach(name => assertIncludes(workflow, name, `CI workflow must preserve ${name}.`));

for (const [sourceFile, text] of [
  ['README.md', readme],
  ['docs/mobile-ux-smoke.md', doc],
  ['docs/performance-bundle-audit.md', performance],
  ['docs/screenshot-asset-pack.md', screenshotPack],
  ['docs/public-landing-page.md', publicLanding],
  ['docs/social-preview-metadata.md', socialPreview],
  ['docs/direct-route-spa-fallback.md', directRoute],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist]
]) {
  for (const { target, isImage } of markdownLinks(text)) {
    const full = resolveMarkdownTarget(sourceFile, target);
    if (full && !fs.existsSync(full)) failures.push(`${sourceFile} link points to missing file: ${target}`);
    if (isImage && full && !fs.existsSync(full)) failures.push(`${sourceFile} image link points to missing file: ${target}`);
  }
}

if (pkg.version !== '2.0.0-beta.1') failures.push(`package.json version changed unexpectedly: ${pkg.version}`);
const lockVersion = lockRoot.version;
if (lockVersion && lockVersion !== pkg.version) failures.push(`package-lock root version ${lockVersion} does not match package.json ${pkg.version}.`);
const pkgDeps = JSON.stringify(pkg.dependencies || {});
const lockDeps = JSON.stringify(lockRoot.dependencies || {});
if (pkgDeps !== lockDeps) failures.push('package dependencies differ from package-lock root dependencies.');
const pkgDevDeps = JSON.stringify(pkg.devDependencies || {});
const lockDevDeps = JSON.stringify(lockRoot.devDependencies || {});
if (pkgDevDeps !== lockDevDeps) failures.push('package devDependencies differ from package-lock root devDependencies.');

const tracked = gitTrackedFiles();
if (tracked.length) {
  const forbiddenTracked = tracked.filter(forbiddenTrackedFile);
  if (forbiddenTracked.length) failures.push(`Forbidden generated/secret artifact is tracked: ${forbiddenTracked.join(', ')}`);
}

const phaseMarker = /Phase 10G|mobile-ux-smoke/i;
for (const file of tracked.filter(file => /^(src|e2e)\//.test(file))) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if (phaseMarker.test(text)) failures.push(`restricted source/test file contains Phase 10G marker: ${file}`);
}

const docsAndReadme = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/mobile-ux-smoke.md', doc],
  ['docs/performance-bundle-audit.md', performance],
  ['docs/screenshot-asset-pack.md', screenshotPack],
  ['docs/public-landing-page.md', publicLanding],
  ['docs/social-preview-metadata.md', socialPreview],
  ['docs/direct-route-spa-fallback.md', directRoute],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist]
];
const misleadingClaims = [
  { label: 'mobile UX passed', pattern: /mobile UX (?:smoke )?(?:passed|passes)|responsive smoke (?:passed|passes)/i },
  { label: 'Lighthouse/Core Web Vitals pass', pattern: /Lighthouse.*pass|Core Web Vitals.*pass|Lighthouse score|Core Web Vitals score/i },
  { label: 'mobile performance certification', pattern: /mobile performance certified|mobile performance certification/i },
  { label: 'production/security/accessibility certification', pattern: /production certification|security certification|accessibility certification|WCAG compliance/i },
  { label: 'release tag created', pattern: /release tag (?:was |has been )created|tag created/i },
  { label: 'GitHub Release published', pattern: /GitHub Release (?:was |has been )published|GitHub Release published/i },
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|AI API integration|AI\/API integration|external AI\/API calls/i },
  { label: 'OCR', pattern: /OCR support|supports OCR|optical character recognition/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled EduGen|File Processor bundled/i },
  { label: 'frontend-only document conversion', pattern: /frontend-only (?:PDF|document).*conversion|frontend-only.*PDF\/DOCX\/PPTX\/ZIP/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend sync/i },
  { label: 'performance certification', pattern: /performance certification|production performance certification/i }
];
for (const [name, text] of docsAndReadme) {
  for (const { label, pattern } of misleadingClaims) {
    const match = pattern.exec(text);
    if (match && !guarded(contextAround(text, match))) failures.push(`${name} has unguarded misleading ${label} claim near: ${match[0]}`);
  }
}

if (failures.length) {
  console.error('Mobile UX smoke validation failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Mobile UX smoke validation passed.');
