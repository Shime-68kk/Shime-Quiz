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

function contextAround(text, match, span = 220) {
  const index = match.index ?? text.search(match);
  if (index < 0) return '';
  return text.slice(Math.max(0, index - span), Math.min(text.length, index + span));
}

function guarded(context) {
  return /no |not |does not|do not|must not|without|unless|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|actual|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|unsafe claims|pending|reviewed|capture guidance|checklist|do not say|stop condition|local-first|không|this phase does not|not a full|no WCAG|no screenshot|not completed|fake/i.test(context);
}

function markdownImageRefs(markdown) {
  const refs = [];
  const imagePattern = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = imagePattern.exec(markdown)) !== null) {
    const target = match[1].trim().split(/\s+/)[0].replace(/^<|>$/g, '');
    refs.push(target);
  }
  return refs;
}

function isExternal(target) {
  return /^https?:\/\//i.test(target);
}

function resolveMarkdownTarget(sourceFile, target) {
  if (isExternal(target) || target.startsWith('#')) return null;
  const clean = target.split('#')[0].split('?')[0];
  if (!clean) return null;
  return path.normalize(path.join(root, path.dirname(sourceFile), clean));
}

const doc = read('docs/screenshot-asset-pack.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
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

assertMatches(doc, /Phase 10D/i, 'Screenshot asset pack doc must mention Phase 10D.');
assertMatches(doc, /Screenshot Asset Pack/i, 'Screenshot asset pack doc must mention Screenshot Asset Pack.');
assertMatches(doc, /completed\/merged through Phase 10C|Phase 10C/i, 'Screenshot asset pack doc must mention completed/merged through Phase 10C.');
assertMatches(doc, /public landing\/root route polish exists|public landing.*exists|root route polish exists/i, 'Screenshot doc must mention public landing/root route polish exists.');
assertMatches(doc, /social preview metadata exists/i, 'Screenshot doc must mention social preview metadata exists.');
assertMatches(doc, /direct-route SPA fallback audit docs exist|direct-route.*fallback.*docs exist/i, 'Screenshot doc must mention direct-route SPA fallback audit docs exist.');
assertMatches(doc, /release tag has not been created/i, 'Screenshot doc must mention release tag has not been created.');
assertMatches(doc, /GitHub Release has not been published/i, 'Screenshot doc must mention GitHub Release has not been published.');
assertMatches(doc, /Actual screenshots are pending actual capture|screenshots pending actual capture|Actual screenshots included/i, 'Screenshot doc must state actual screenshots included or pending capture.');
assertMatches(doc, /public landing\/root route/i, 'Screenshot doc must mention public landing/root route.');
assertMatches(doc, /Dashboard first-run onboarding/i, 'Screenshot doc must mention Dashboard first-run onboarding.');
assertMatches(doc, /Library empty-state onboarding/i, 'Screenshot doc must mention Library empty-state onboarding.');
assertMatches(doc, /Dùng quiz mẫu|demo quickstart/i, 'Screenshot doc must mention Dùng quiz mẫu or demo quickstart.');
assertMatches(doc, /demo sample preview\s*\/\s*validation\s*\/\s*quality review/i, 'Screenshot doc must mention demo sample preview / validation / quality review.');
assertMatches(doc, /Study Room/i, 'Screenshot doc must mention Study Room.');
assertMatches(doc, /backup\/restore/i, 'Screenshot doc must mention backup/restore.');
assertMatches(doc, /manual AI prompt\/export workflow/i, 'Screenshot doc must mention manual AI prompt/export workflow.');
assertMatches(doc, /EduGen.*separate service boundary|separate.*EduGen.*boundary/i, 'Screenshot doc must mention EduGen separate service boundary.');
assertMatches(doc, /Do not fake screenshots/i, 'Screenshot doc must mention do not fake screenshots.');
assertMatches(doc, /Do not claim screenshots exist unless actual image files are present/i, 'Screenshot doc must mention not claiming screenshots exist unless actual image files are present.');
assertMatches(doc, /Do not claim screenshot capture completed unless.*image files are present/i, 'Screenshot doc must mention not claiming screenshot capture completed unless image files are present.');
assertMatches(doc, /private data/i, 'Screenshot doc must mention no private data.');
assertMatches(doc, /unsupported claims/i, 'Screenshot doc must mention no unsupported claims.');
assertMatches(doc, /Phase 10E.*README Public-Facing Rewrite \/ Split|Phase 10F.*Performance \/ Bundle-Size Audit/i, 'Screenshot doc must mention Phase 10E or Phase 10F as next step.');

assertIncludes(readme, 'docs/screenshot-asset-pack.md', 'README.md must link to docs/screenshot-asset-pack.md.');
assertMatches(releaseQa, /Phase 10D/i, 'RELEASE_QA_V2.md must include Phase 10D.');
assertMatches(publicLanding, /screenshot-asset-pack\.md|screenshot asset pack/i, 'Public landing doc must link/reference screenshot asset pack.');
assertMatches(socialPreview, /screenshot-asset-pack\.md|screenshot asset pack/i, 'Social preview doc must link/reference screenshot asset pack.');
assertMatches(directRoute, /screenshot-asset-pack\.md|screenshot asset pack/i, 'Direct route doc must link/reference screenshot asset pack.');
assertMatches(releaseDraft, /screenshot-asset-pack\.md|screenshot asset pack/i, 'GitHub release draft must link/reference screenshot asset pack.');
assertMatches(publishChecklist, /screenshot-asset-pack\.md|screenshot asset pack/i, 'Release tag publish checklist must link/reference screenshot asset pack.');
assertMatches(finalAudit, /screenshot-asset-pack\.md|screenshot asset pack/i, 'Final RC audit must link/reference screenshot asset pack.');
assertIncludes(workflow, 'node scripts/validate-screenshot-asset-pack.js', 'CI workflow must run validate-screenshot-asset-pack.js.');

[
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

const phaseMarker = /Phase 10D|screenshot-asset-pack|Screenshot Asset Pack|docs\/assets\/screenshots/i;
for (const file of collectFiles('e2e', /\.spec\.(js|ts)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`E2E spec contains Phase 10D marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src/data', /textQuizParser|import|quizDraft|aiPrompt|aiOutput|fileProcessor/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`import/parser/AI source contains Phase 10D marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src', /backup|restore|storage|schema|StudyRoom|Dashboard|learning|srt|mastery|history|recommendation/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`restricted runtime source contains Phase 10D marker: ${path.relative(root, file)}`);
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

    // Allow the checked-in safe environment template, but block real env files.
    if (normalized === '.env.example') return false;
    if (/^\.env($|\.)/.test(normalized)) return true;

    // Secret-like filenames must be blocked before any source-extension allowlist.
    // This catches private/service-account.json, private/api-key.txt, creds/access-token.env,
    // private/secret.txt, private/key.pem, private/private.key, and common SSH key names.
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

const screenshotFiles = collectFiles('docs/assets/screenshots', /\.(png|jpe?g|webp|gif|svg)$/i)
  .map(file => path.relative(root, file).replace(/\\/g, '/'))
  .filter(file => !file.endsWith('/.gitkeep'));
const hasScreenshots = screenshotFiles.length > 0;
if (!fs.existsSync(path.join(root, 'docs/assets/screenshots/.gitkeep')) && !hasScreenshots) {
  failures.push('docs/assets/screenshots/.gitkeep should exist when screenshots are pending.');
}
if (!hasScreenshots) {
  assertMatches(doc, /Actual screenshots are pending actual capture|screenshots pending actual capture/i, 'When no screenshots exist, docs must clearly say screenshots are pending actual capture.');
  const badScreenshotClaims = [
    ['README.md', readme],
    ['docs/github-release-draft.md', releaseDraft],
    ['docs/screenshot-asset-pack.md', doc]
  ];
  for (const [name, text] of badScreenshotClaims) {
    const patterns = [
      /actual screenshots (?:are )?included/i,
      /screenshot capture completed/i,
      /README screenshots are available/i,
      /screenshot asset pack exists/i
    ];
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match && !guarded(contextAround(text, match))) {
        failures.push(`${name} appears to claim screenshots exist/capture completed without actual screenshot files: ${match[0]}`);
      }
    }
  }
}

for (const [sourceFile, text] of [
  ['README.md', readme],
  ['docs/github-release-draft.md', releaseDraft]
]) {
  for (const target of markdownImageRefs(text)) {
    const full = resolveMarkdownTarget(sourceFile, target);
    if (full && !fs.existsSync(full)) failures.push(`${sourceFile} image link points to missing file: ${target}`);
  }
}

const docsAndScreenshotRefs = [
  ['docs/screenshot-asset-pack.md', doc],
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/public-landing-page.md', publicLanding],
  ['docs/social-preview-metadata.md', socialPreview],
  ['docs/direct-route-spa-fallback.md', directRoute],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist]
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
  { label: 'GitHub Release published', pattern: /GitHub Release (?:was |has been )published|GitHub Release published/i }
];
for (const [name, text] of docsAndScreenshotRefs) {
  for (const { label, pattern } of misleadingClaims) {
    const match = pattern.exec(text);
    if (match && !guarded(contextAround(text, match))) failures.push(`${name} has unguarded misleading ${label} claim near: ${match[0]}`);
  }
}

if (failures.length) {
  console.error('Screenshot asset pack validation failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Screenshot asset pack validation passed.');
