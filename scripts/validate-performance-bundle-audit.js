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
  return /no |not |does not|do not|must not|without|unless|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|actual|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|unsafe claims|pending|reviewed|checklist|this phase does not|not a full|no screenshot|not completed|local-first|không|non-blocking|warning|audit|follow-up|future optimization|measured|if measured|unless measured|unless implemented/i.test(context);
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

const doc = read('docs/performance-bundle-audit.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const readmeGuide = read('docs/readme-public-facing-guide.md');
const releaseDraft = read('docs/github-release-draft.md');
const publishChecklist = read('docs/release-tag-publish-checklist.md');
const finalAudit = read('docs/final-rc-audit.md');
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

assertMatches(doc, /Phase 10F/i, 'Performance audit doc must mention Phase 10F.');
assertMatches(doc, /Performance\s*\/\s*Bundle-Size Audit/i, 'Performance audit doc must mention Performance / Bundle-Size Audit.');
assertMatches(doc, /completed\/merged through Phase 10E|Phase 10E/i, 'Performance audit doc must mention completed/merged through Phase 10E.');
assertMatches(doc, /public landing\/root route polish exists/i, 'Performance audit doc must mention public landing/root route polish exists.');
assertMatches(doc, /social preview metadata exists/i, 'Performance audit doc must mention social preview metadata exists.');
assertMatches(doc, /direct-route SPA fallback docs exist/i, 'Performance audit doc must mention direct-route SPA fallback docs exist.');
assertMatches(doc, /screenshot capture checklist exists/i, 'Performance audit doc must mention screenshot capture checklist exists.');
assertMatches(doc, /README public-facing rewrite exists/i, 'Performance audit doc must mention README public-facing rewrite exists.');
assertMatches(doc, /release tag has not been created/i, 'Performance audit doc must mention release tag has not been created.');
assertMatches(doc, /GitHub Release has not been published/i, 'Performance audit doc must mention GitHub Release has not been published.');
assertMatches(doc, /npm run build/i, 'Performance audit doc must mention npm run build.');
assertMatches(doc, /Vite\/Rolldown chunk-size warning|Vite.*chunk-size warning|Rolldown.*chunk-size warning/i, 'Performance audit doc must mention Vite or Rolldown chunk-size warning.');
assertMatches(doc, /warning is non-blocking unless the build fails|non-blocking unless build fails/i, 'Performance audit doc must mention warning is non-blocking unless build fails.');
assertMatches(doc, /Do not.*raising.*chunk-size.*limit.*hide|should not be hidden by raising.*chunk-size/i, 'Performance audit doc must say not to suppress warning by raising the chunk-size limit just to hide it.');
assertMatches(doc, /route-level lazy loading|code splitting/i, 'Performance audit doc must mention route-level lazy loading or code splitting.');
assertMatches(doc, /no Lighthouse\/Core Web Vitals claim unless measured|Lighthouse\/Core Web Vitals.*unless measured/i, 'Performance audit doc must mention no Lighthouse/Core Web Vitals claim unless measured.');
assertMatches(doc, /no performance optimization claim unless implemented and measured|performance optimized unless actual optimization is implemented and measured/i, 'Performance audit doc must mention no performance optimization claim unless implemented and measured.');
assertMatches(doc, /Do not commit `dist\/` or `node_modules\/`|do not commit dist\/node_modules/i, 'Performance audit doc must mention not committing dist/node_modules.');
assertMatches(doc, /Phase 10G.*Mobile UX Smoke\s*\/\s*Responsive Polish|optional performance optimization/i, 'Performance audit doc must mention Phase 10G or optional performance optimization.');

assertIncludes(readme, 'docs/performance-bundle-audit.md', 'README.md must link to docs/performance-bundle-audit.md.');
assertMatches(releaseQa, /Phase 10F/i, 'RELEASE_QA_V2.md must include Phase 10F.');
assertMatches(readmeGuide, /performance-bundle-audit\.md|performance bundle audit/i, 'README public-facing guide must link/reference performance bundle audit.');
assertMatches(releaseDraft, /performance-bundle-audit\.md|performance \/ bundle-size audit/i, 'GitHub release draft must link/reference performance bundle audit.');
assertMatches(publishChecklist, /performance-bundle-audit\.md|performance \/ bundle-size audit/i, 'Release tag publish checklist must link/reference performance bundle audit.');
assertMatches(finalAudit, /performance-bundle-audit\.md|performance \/ bundle-size audit/i, 'Final RC audit must link/reference performance bundle audit.');
assertMatches(screenshotPack, /performance-bundle-audit\.md|performance \/ bundle-size audit/i, 'Screenshot asset pack must link/reference performance bundle audit.');
assertIncludes(workflow, 'node scripts/validate-performance-bundle-audit.js', 'CI workflow must run validate-performance-bundle-audit.js.');

// Optional related docs are included in the Phase 10F update set; validate their references without making them brittle in old branches.
assertMatches(publicLanding, /performance-bundle-audit\.md|performance \/ bundle-size audit/i, 'Public landing doc must link/reference performance bundle audit.');
assertMatches(socialPreview, /performance-bundle-audit\.md|performance \/ bundle-size audit/i, 'Social preview doc must link/reference performance bundle audit.');
assertMatches(directRoute, /performance-bundle-audit\.md|lazy loading|code splitting|bundle-size/i, 'Direct route fallback doc must link/reference performance bundle audit.');

[
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
  ['docs/performance-bundle-audit.md', doc],
  ['docs/readme-public-facing-guide.md', readmeGuide],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/screenshot-asset-pack.md', screenshotPack],
  ['docs/public-landing-page.md', publicLanding],
  ['docs/social-preview-metadata.md', socialPreview],
  ['docs/direct-route-spa-fallback.md', directRoute]
]) {
  for (const { target, isImage } of markdownLinks(text)) {
    const full = resolveMarkdownTarget(sourceFile, target);
    if (full && !fs.existsSync(full)) failures.push(`${sourceFile} link points to missing file: ${target}`);
    if (isImage && full && !fs.existsSync(full)) failures.push(`${sourceFile} image link points to missing file: ${target}`);
  }
}

if (pkg.version !== '2.0.0-beta-ai.1') failures.push(`package.json version changed unexpectedly: ${pkg.version}`);
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

const phaseMarker = /Phase 10F|performance-bundle-audit/i;
for (const file of tracked.filter(file => /^(src|e2e)\//.test(file))) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if (phaseMarker.test(text)) failures.push(`restricted source/test file contains Phase 10F marker: ${file}`);
}

const viteConfigs = ['vite.config.js', 'vite.config.mjs', 'vite.config.ts'].filter(file => fs.existsSync(path.join(root, file)));
for (const file of viteConfigs) {
  const text = read(file);
  const match = /chunkSizeWarningLimit\s*:\s*(\d+)/.exec(text);
  if (match && Number(match[1]) > 500) failures.push(`${file} appears to raise chunkSizeWarningLimit above the default, which would hide the warning.`);
  if (/Phase 10F|suppress.*chunk|hide.*warning/i.test(text)) failures.push(`${file} appears to contain Phase 10F warning suppression text.`);
}

const docsAndReadme = [
  ['README.md', readme],
  ['docs/performance-bundle-audit.md', doc],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/readme-public-facing-guide.md', readmeGuide],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/screenshot-asset-pack.md', screenshotPack],
  ['docs/public-landing-page.md', publicLanding],
  ['docs/social-preview-metadata.md', socialPreview],
  ['docs/direct-route-spa-fallback.md', directRoute]
];
const misleadingClaims = [
  { label: 'performance optimized', pattern: /performance optimized|optimized performance|bundle optimized|bundle-size optimized/i },
  { label: 'Lighthouse/Core Web Vitals pass', pattern: /Lighthouse.*pass|Core Web Vitals.*pass|Lighthouse score|Core Web Vitals score/i },
  { label: 'performance certification', pattern: /performance certification|mobile performance certified|production performance certification/i },
  { label: 'production/security/accessibility certification', pattern: /production certification|security certification|accessibility certification|WCAG compliance/i },
  { label: 'release tag created', pattern: /release tag (?:was |has been )created|tag created/i },
  { label: 'GitHub Release published', pattern: /GitHub Release (?:was |has been )published|GitHub Release published/i },
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|AI API integration|AI\/API integration|external AI\/API calls/i },
  { label: 'OCR', pattern: /OCR support|supports OCR|optical character recognition/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled EduGen|File Processor bundled/i },
  { label: 'frontend-only document conversion', pattern: /frontend-only (?:PDF|document).*conversion|frontend-only.*PDF\/DOCX\/PPTX\/ZIP/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend sync/i }
];
for (const [name, text] of docsAndReadme) {
  for (const { label, pattern } of misleadingClaims) {
    const match = pattern.exec(text);
    if (match && !guarded(contextAround(text, match))) failures.push(`${name} has unguarded misleading ${label} claim near: ${match[0]}`);
  }
}

if (failures.length) {
  console.error('Performance bundle audit validation failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Performance bundle audit validation passed.');
