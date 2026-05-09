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

function collectFiles(startRelative, regex) {
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

function guarded(context) {
  return /no |not |does not|do not|must not|without|unless|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|actual|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|unsafe claims|do not say|stop condition|local-first|this phase does not|may require|simple crawlers may not|not a|no SSR|no all-crawlers/i.test(context);
}

const doc = read('docs/direct-route-spa-fallback.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const publicLanding = read('docs/public-landing-page.md');
const socialPreview = read('docs/social-preview-metadata.md');
const finalAudit = read('docs/final-rc-audit.md');
const releaseDraft = read('docs/github-release-draft.md');
const publishChecklist = read('docs/release-tag-publish-checklist.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const vercel = fs.existsSync(path.join(root, 'vercel.json')) ? read('vercel.json') : '';
const netlify = fs.existsSync(path.join(root, 'netlify.toml')) ? read('netlify.toml') : '';
const redirects = fs.existsSync(path.join(root, 'public/_redirects')) ? read('public/_redirects') : '';
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(doc, /Phase 10C/i, 'Direct route doc must mention Phase 10C.');
assertMatches(doc, /Direct Route\s*\/\s*SPA Fallback UX Audit/i, 'Direct route doc must mention Direct Route / SPA Fallback UX Audit.');
assertMatches(doc, /completed\/merged through Phase 10B|Phase 10B/i, 'Direct route doc must mention completed/merged through Phase 10B.');
assertMatches(doc, /public landing\/root route polish exists|public landing.*exists|root route polish exists/i, 'Direct route doc must mention public landing/root route polish exists.');
assertMatches(doc, /static SEO\/social preview metadata exists|static.*social preview metadata exists/i, 'Direct route doc must mention static SEO/social preview metadata exists.');
assertMatches(doc, /release tag has not been created/i, 'Direct route doc must mention release tag has not been created.');
assertMatches(doc, /GitHub Release has not been published/i, 'Direct route doc must mention GitHub Release has not been published.');
assertMatches(doc, /React\/Vite SPA/i, 'Direct route doc must mention React/Vite SPA.');
assertMatches(doc, /static-host fallback to `?index\.html`?|fall back to `?index\.html`?/i, 'Direct route doc must mention static-host fallback to index.html.');
assertMatches(doc, /body content may require JavaScript rendering/i, 'Direct route doc must mention body content may require JavaScript rendering.');
assertMatches(doc, /simple crawlers may not render app body content/i, 'Direct route doc must mention simple crawlers may not render app body content.');
assertMatches(doc, /Vercel fallback reviewed/i, 'Direct route doc must mention Vercel fallback reviewed.');
assertMatches(doc, /Netlify fallback reviewed|Netlify.*config/i, 'Direct route doc must mention Netlify fallback reviewed or config.');
assertMatches(doc, /direct route manual smoke checklist/i, 'Direct route doc must mention direct route manual smoke checklist.');
assertMatches(doc, /`\/`|open `\/`/i, 'Direct route doc must mention /.');
assertMatches(doc, /`\/dashboard`|\/dashboard/i, 'Direct route doc must mention /dashboard.');
assertMatches(doc, /`\/library`|\/library/i, 'Direct route doc must mention /library.');
assertMatches(doc, /unknown route|`\/not-a-real-route`|\/not-a-real-route/i, 'Direct route doc must mention unknown route or /not-a-real-route.');
assertMatches(doc, /no auth\/login redirect expected|No login\/auth redirect is expected/i, 'Direct route doc must mention no auth/login redirect expected.');
assertMatches(doc, /do not claim.*direct-route smoke passed.*actual.*verifies|do not claim.*direct-route smoke passed.*actual run evidence/i, 'Direct route doc must mention not claiming direct-route smoke passed without actual evidence.');
assertMatches(doc, /do not claim all crawlers render SPA content|all crawlers render SPA content/i, 'Direct route doc must mention not claiming all crawlers render SPA content.');
assertMatches(doc, /no SSR claim|Do not claim SSR|not claim server-side rendering/i, 'Direct route doc must mention no SSR claim.');
assertMatches(doc, /Phase 10D.*Screenshot Asset Pack/i, 'Direct route doc must mention Phase 10D Screenshot Asset Pack as next step.');

assertIncludes(readme, 'docs/direct-route-spa-fallback.md', 'README.md must link to docs/direct-route-spa-fallback.md.');
assertMatches(releaseQa, /Phase 10C/i, 'RELEASE_QA_V2.md must include Phase 10C.');
assertMatches(publicLanding, /direct-route-spa-fallback\.md|direct-route SPA fallback|Direct Route/i, 'Public landing doc must link/reference direct-route SPA fallback.');
assertMatches(socialPreview, /direct-route-spa-fallback\.md|direct-route SPA fallback|Direct Route/i, 'Social preview doc must link/reference direct-route SPA fallback.');
assertMatches(finalAudit, /direct-route-spa-fallback\.md|direct-route SPA fallback|Direct Route/i, 'Final RC audit must link/reference direct-route SPA fallback.');
assertMatches(releaseDraft, /direct-route-spa-fallback\.md|direct-route SPA fallback|Direct Route/i, 'GitHub release draft must link/reference direct-route SPA fallback.');
assertMatches(publishChecklist, /direct-route-spa-fallback\.md|direct-route SPA fallback|Direct Route/i, 'Release tag publish checklist must link/reference direct-route SPA fallback.');
assertIncludes(workflow, 'node scripts/validate-direct-route-spa-fallback.js', 'CI workflow must run validate-direct-route-spa-fallback.js.');

if (vercel) {
  assertMatches(vercel, /"source"\s*:\s*"\/\(\.\*\)"|"destination"\s*:\s*"\/index\.html"/i, 'vercel.json should preserve SPA fallback rewrite to /index.html.');
}
if (netlify) {
  assertMatches(netlify, /to\s*=\s*"\/index\.html"/i, 'netlify.toml should preserve SPA fallback to /index.html.');
  assertMatches(netlify, /status\s*=\s*200/i, 'netlify.toml SPA fallback should preserve status 200.');
}
if (redirects) {
  assertMatches(redirects, /\/\*\s+\/index\.html\s+200/i, 'public/_redirects should preserve SPA fallback to /index.html 200.');
}

[
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
  if (pkgDeps !== lockDeps) failures.push(`package.json ${kind} does not match package-lock root ${kind}.`);
}

const tracked = gitTrackedFiles();
const forbiddenGeneratedDirectories = [
  /^node_modules\//,
  /^dist\//,
  /^test-results\//,
  /^playwright-report\//,
  /^coverage\//
];

function isForbiddenEnvOrSecretFile(file) {
  const basename = path.basename(file);
  if (basename === '.env.example') return false;
  if (basename === '.env' || /^\.env\.(local|production|development|test|staging|preview)$/i.test(basename)) return true;
  if (/^\.env\./i.test(basename)) return true;
  return /(^|\/)(?:.*(?:secret|private).*|.*(?:api[-_]?key|access[-_]?token|service[-_]?account).*)\.(?:pem|key|json|txt|env)$/i.test(file);
}

for (const file of tracked) {
  if (forbiddenGeneratedDirectories.some(pattern => pattern.test(file)) || isForbiddenEnvOrSecretFile(file)) {
    failures.push(`Forbidden generated/secret artifact is tracked: ${file}`);
  }
}

const sourceGlobs = [
  ['e2e', /\.spec\.[jt]sx?$/],
  ['src', /(import|parser|backup|restore|storage|schema|study|dashboard|srt|mastery|history|recommendation|edugen|file.?processor|ai)/i]
];
for (const [dir, regex] of sourceGlobs) collectFiles(dir, regex); // Keep traversal covered without brittle baseline diffing.

const docsAndMetadata = [
  ['docs/direct-route-spa-fallback.md', doc],
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/public-landing-page.md', publicLanding],
  ['docs/social-preview-metadata.md', socialPreview],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist]
];

const misleadingClaims = [
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|AI API integration|AI\/API integration|calls external AI APIs|external AI\/API calls/i },
  { label: 'OCR', pattern: /OCR support|supports OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime/i },
  { label: 'frontend-only document conversion', pattern: /frontend-only .*provides document conversion|frontend-only PDF\/DOCX\/PPTX\/ZIP conversion/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend accounts|account\/auth sync/i },
  { label: 'production/security certification', pattern: /production certification|security certification|production certified|security certified|certified for production/i },
  { label: 'WCAG/accessibility certification', pattern: /WCAG compliance|accessibility certification|accessibility certified/i },
  { label: 'release tag created', pattern: /release tag created|tag has been created|created a release tag/i },
  { label: 'GitHub Release published', pattern: /GitHub Release published|GitHub release has been published|published a GitHub Release/i },
  { label: 'SSR', pattern: /server-side rendering|\bSSR\b/i },
  { label: 'all crawlers render SPA content', pattern: /all crawlers render|all-crawlers-render|crawler rendering success/i },
  { label: 'direct-route smoke passed', pattern: /direct-route smoke passed|direct route smoke passed|Vercel\/direct-route smoke passed/i },
  { label: 'auth/login/protected routes', pattern: /auth\/login\/protected routes|protected routes|login redirect|auth redirect/i }
];

for (const [file, content] of docsAndMetadata) {
  for (const claim of misleadingClaims) {
    let match;
    const regex = new RegExp(claim.pattern.source, claim.pattern.flags.includes('g') ? claim.pattern.flags : `${claim.pattern.flags}g`);
    while ((match = regex.exec(content)) !== null) {
      const start = Math.max(0, match.index - 220);
      const end = Math.min(content.length, match.index + match[0].length + 220);
      const context = content.slice(start, end);
      if (!guarded(context)) failures.push(`${file} appears to claim ${claim.label}: "${match[0]}"`);
    }
  }
}

if (failures.length) {
  console.error('validate-direct-route-spa-fallback failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('validate-direct-route-spa-fallback passed.');
