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

function assertNotMatches(content, regex, message) {
  if (regex.test(content)) failures.push(message || `Forbidden pattern ${regex}`);
}

function collectFiles(startRelative, regex = /./) {
  const start = path.join(root, startRelative);
  if (!fs.existsSync(start)) return [];
  const files = [];
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      fs.readdirSync(current).forEach(entry => stack.push(path.join(current, entry)));
    } else if (regex.test(current)) {
      files.push(current);
    }
  }
  return files;
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

function contextAround(text, match, span = 240) {
  const index = match.index ?? text.search(match);
  if (index < 0) return '';
  return text.slice(Math.max(0, index - span), Math.min(text.length, index + span));
}

function guarded(context) {
  return /no |not |does not|do not|must not|without|unless|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|actual|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|unsafe claims|pending|reviewed|checklist|this phase does not|not a full|no screenshot|not completed|local-first/i.test(context);
}

function markdownLinks(markdown) {
  const refs = [];
  const pattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    const raw = match[1].trim().split(/\s+/)[0].replace(/^<|>$/g, '');
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

const guide = read('docs/readme-public-facing-guide.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const finalAudit = read('docs/final-rc-audit.md');
const releaseDraft = read('docs/github-release-draft.md');
const publishChecklist = read('docs/release-tag-publish-checklist.md');
const screenshotPack = read('docs/screenshot-asset-pack.md');
const publicLanding = read('docs/public-landing-page.md');
const socialPreview = read('docs/social-preview-metadata.md');
const directRoute = read('docs/direct-route-spa-fallback.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(guide, /Phase 10E/i, 'README public-facing guide must mention Phase 10E.');
assertMatches(guide, /README Public-Facing Rewrite\s*\/\s*Split/i, 'Guide must mention README Public-Facing Rewrite / Split.');
assertMatches(guide, /completed\/merged through Phase 10D|Phase 10D/i, 'Guide must mention completed/merged through Phase 10D.');
assertMatches(guide, /public landing\/root route polish exists/i, 'Guide must mention public landing/root route polish exists.');
assertMatches(guide, /social preview metadata exists/i, 'Guide must mention social preview metadata exists.');
assertMatches(guide, /direct-route SPA fallback docs exist/i, 'Guide must mention direct-route SPA fallback docs exist.');
assertMatches(guide, /screenshot capture checklist exists/i, 'Guide must mention screenshot capture checklist exists.');
assertMatches(guide, /screenshots are pending unless actual files exist|actual screenshots are pending/i, 'Guide must mention screenshots pending unless actual files exist.');
assertMatches(guide, /release tag has not been created/i, 'Guide must mention release tag has not been created.');
assertMatches(guide, /GitHub Release has not been published/i, 'Guide must mention GitHub Release has not been published.');

assertMatches(readme, /local-first quiz study app/i, 'README must mention local-first quiz study app.');
assertMatches(readme, /Quick start/i, 'README must mention quick start.');
assertMatches(readme, /Dùng quiz mẫu|demo quickstart/i, 'README must mention Dùng quiz mẫu or demo quickstart.');
assertMatches(readme, /JSON/i, 'README must mention JSON.');
assertMatches(readme, /CSV/i, 'README must mention CSV.');
assertMatches(readme, /text\/Markdown/i, 'README must mention text/Markdown.');
assertMatches(readme, /\.txt.*\.md|\.txt\/\.md/i, 'README must mention .txt/.md.');
assertMatches(readme, /EduGen\/File Processor.*separate|separate.*EduGen\/File Processor|not bundled into Shime/i, 'README must mention EduGen/File Processor separate service or not bundled.');
assertMatches(readme, /PDF\/DOCX\/PPTX\/ZIP.*separately configured|PDF\/DOCX\/PPTX\/ZIP.*separate/i, 'README must mention PDF/DOCX/PPTX/ZIP requires separate configured service.');
assertMatches(readme, /Frontend-only hosting alone does not provide.*document conversion|frontend-only.*does not provide.*conversion/i, 'README must mention frontend-only hosting alone does not provide document conversion.');
assertMatches(readme, /manual AI workflow/i, 'README must mention manual AI workflow.');
assertMatches(readme, /no built-in AI generation|does \*\*not\*\* provide built-in AI generation/i, 'README must mention no built-in AI generation.');
assertMatches(readme, /no external AI\/API calls|external AI\/API integration/i, 'README must mention no external AI/API calls.');
assertMatches(readme, /no API key\/BYOK|API key\/BYOK support/i, 'README must mention no API key/BYOK.');
assertMatches(readme, /no OCR|OCR/i, 'README must mention no OCR.');
assertMatches(readme, /no backend\/cloud sync|backend\/auth\/cloud sync/i, 'README must mention no backend/cloud sync.');

[
  'docs/public-landing-page.md',
  'docs/social-preview-metadata.md',
  'docs/direct-route-spa-fallback.md',
  'docs/screenshot-asset-pack.md',
  'docs/github-release-draft.md',
  'docs/release-tag-publish-checklist.md',
  'docs/final-rc-audit.md'
].forEach(link => assertIncludes(readme, link, `README must link to ${link}.`));

for (const { target, isImage } of markdownLinks(readme)) {
  const full = resolveMarkdownTarget('README.md', target);
  if (full && !fs.existsSync(full)) failures.push(`README link points to missing file: ${target}`);
  if (isImage && full && !fs.existsSync(full)) failures.push(`README image link points to missing file: ${target}`);
}

const screenshotFiles = collectFiles('docs/assets/screenshots', /\.(png|jpe?g|webp|gif|svg)$/i)
  .map(file => path.relative(root, file).replace(/\\/g, '/'))
  .filter(file => !file.endsWith('/.gitkeep'));
const hasScreenshots = screenshotFiles.length > 0;
const readmeImageLinks = markdownLinks(readme).filter(link => link.isImage);
if (!hasScreenshots) {
  assertMatches(readme, /Actual screenshot image files are not included yet|does not claim screenshots are available|until real reviewed image files are added/i, 'README must state screenshots are pending/not available when no image files exist.');
  if (readmeImageLinks.length) failures.push('README must not embed screenshot image links when only .gitkeep exists.');
  const screenshotClaim = /(README screenshots are available|actual screenshots captured|screenshot asset pack exists|screenshots are available)/i.exec(readme);
  if (screenshotClaim && !guarded(contextAround(readme, screenshotClaim))) {
    failures.push(`README appears to overclaim screenshot availability: ${screenshotClaim[0]}`);
  }
}

assertMatches(releaseQa, /Phase 10E/i, 'RELEASE_QA_V2.md must include Phase 10E.');
assertMatches(finalAudit, /readme-public-facing-guide\.md|README public-facing rewrite/i, 'Final RC audit must link/reference README rewrite.');
assertMatches(releaseDraft, /readme-public-facing-guide\.md|README public-facing rewrite/i, 'GitHub release draft must link/reference README rewrite.');
assertMatches(publishChecklist, /readme-public-facing-guide\.md|README public-facing rewrite/i, 'Release tag publish checklist must link/reference README rewrite.');
assertMatches(screenshotPack, /readme-public-facing-guide\.md|README/i, 'Screenshot asset pack must link/reference README rewrite.');
assertMatches(publicLanding, /readme-public-facing-guide\.md|README public-facing/i, 'Public landing doc must link/reference README rewrite.');
assertMatches(socialPreview, /readme-public-facing-guide\.md|README public-facing/i, 'Social preview doc must link/reference README rewrite.');
assertMatches(directRoute, /readme-public-facing-guide\.md|README public-facing/i, 'Direct route doc must link/reference README rewrite.');
assertIncludes(workflow, 'node scripts/validate-readme-public-facing.js', 'CI workflow must run validate-readme-public-facing.js.');

[
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
assertIncludes(workflow, 'npx playwright install --with-deps chromium', 'CI workflow must preserve Playwright Chromium install.');
assertIncludes(workflow, 'npm run test:e2e:smoke', 'CI workflow must preserve E2E smoke.');
assertIncludes(workflow, 'npm run test:e2e:onboarding', 'CI workflow must preserve onboarding E2E.');
assertIncludes(workflow, 'actions/upload-artifact@v4', 'CI workflow must preserve failure artifact upload.');
assertNotMatches(workflow, /continue-on-error:\s*true/i, 'CI workflow must not include broad continue-on-error.');

if (pkg.version !== lock.version || pkg.version !== lockRoot.version) {
  failures.push(`package version metadata mismatch: package=${pkg.version}, lock=${lock.version}, root=${lockRoot.version}`);
}
for (const kind of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
  const pkgDeps = JSON.stringify(pkg[kind] || {});
  const lockDeps = JSON.stringify(lockRoot[kind] || {});
  if (pkgDeps !== lockDeps) failures.push(`package.json ${kind} must match package-lock root metadata.`);
}

const phaseMarker = /Phase 10E|readme-public-facing-guide|README Public-Facing Rewrite/i;
for (const file of collectFiles('e2e', /\.spec\.(js|ts)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`E2E spec contains Phase 10E marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src', /\.(js|jsx|ts|tsx|css)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`runtime source contains Phase 10E marker: ${path.relative(root, file)}`);
}

const tracked = gitTrackedFiles();
if (tracked.length) {
  const forbiddenTracked = tracked.filter(file => {
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
  });
  if (forbiddenTracked.length) failures.push(`Forbidden generated/secret artifact is tracked: ${forbiddenTracked.join(', ')}`);
}

const docsAndReadme = [
  ['README.md', readme],
  ['docs/readme-public-facing-guide.md', guide],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist],
  ['docs/screenshot-asset-pack.md', screenshotPack],
  ['docs/public-landing-page.md', publicLanding],
  ['docs/social-preview-metadata.md', socialPreview],
  ['docs/direct-route-spa-fallback.md', directRoute]
];
const misleadingClaims = [
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|AI API integration|AI\/API integration|calls external AI APIs|external AI\/API calls/i },
  { label: 'OCR', pattern: /OCR support|supports OCR|optical character recognition/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled EduGen|File Processor bundled/i },
  { label: 'frontend-only document conversion', pattern: /frontend-only (?:PDF|document).*conversion|frontend-only.*PDF\/DOCX\/PPTX\/ZIP/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend sync/i },
  { label: 'account/auth sync', pattern: /account\/auth sync|auth sync|account sync/i },
  { label: 'production/security certification', pattern: /production certification|security certification|production\/security certification|certified for production|security certified/i },
  { label: 'WCAG/accessibility certification', pattern: /WCAG compliance|accessibility certification|accessibility certified/i },
  { label: 'release tag created', pattern: /release tag (?:was |has been )created|tag created/i },
  { label: 'GitHub Release published', pattern: /GitHub Release (?:was |has been )published|GitHub Release published/i },
  { label: 'SEO/all crawler success', pattern: /SEO ranking improvement|all crawlers render|all-crawlers-render success|crawler indexing success/i }
];
for (const [name, text] of docsAndReadme) {
  for (const { label, pattern } of misleadingClaims) {
    const match = pattern.exec(text);
    if (match && !guarded(contextAround(text, match))) failures.push(`${name} has unguarded misleading ${label} claim near: ${match[0]}`);
  }
}

if (failures.length) {
  console.error('README public-facing validation failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('README public-facing validation passed.');
