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
  return /no |not |does not|do not|must not|without|unless|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|actual|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|unsafe claims|do not say|stop condition|local-first|this phase does not|does not guarantee/i.test(context);
}

const doc = read('docs/social-preview-metadata.md');
const index = read('index.html');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const publicLanding = read('docs/public-landing-page.md');
const finalAudit = read('docs/final-rc-audit.md');
const releaseDraft = read('docs/github-release-draft.md');
const publishChecklist = read('docs/release-tag-publish-checklist.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(doc, /Phase 10B/i, 'Social preview doc must mention Phase 10B.');
assertMatches(doc, /SEO\s*\/\s*Open Graph\s*\/\s*Social Preview Metadata/i, 'Social preview doc must mention SEO / Open Graph / Social Preview Metadata.');
assertMatches(doc, /completed\/merged through Phase 10A|Phase 10A/i, 'Social preview doc must mention completed/merged through Phase 10A.');
assertMatches(doc, /public landing\/root route polish exists|public landing.*exists|root route polish exists/i, 'Social preview doc must mention public landing/root route polish exists.');
assertMatches(doc, /release tag has not been created/i, 'Social preview doc must mention release tag has not been created.');
assertMatches(doc, /GitHub Release has not been published/i, 'Social preview doc must mention GitHub Release has not been published.');
assertMatches(doc, /static metadata/i, 'Social preview doc must mention static metadata.');
assertMatches(doc, /Open Graph/i, 'Social preview doc must mention Open Graph.');
assertMatches(doc, /Twitter|social card metadata/i, 'Social preview doc must mention Twitter or social card metadata.');
assertMatches(doc, /Vite SPA/i, 'Social preview doc must mention Vite SPA.');
assertMatches(doc, /body content may require JavaScript rendering/i, 'Social preview doc must mention body content may require JavaScript rendering.');
assertMatches(doc, /does not guarantee all crawlers render app body content|no guarantee all crawlers render/i, 'Social preview doc must mention no guarantee all crawlers render app body content.');
assertMatches(doc, /do not claim SEO optimization success|does not claim SEO ranking|SEO ranking or optimization success/i, 'Social preview doc must mention no SEO ranking/optimization success claim.');
assertMatches(doc, /Phase 10C.*Direct Route.*SPA Fallback UX Audit/i, 'Social preview doc must mention Phase 10C Direct Route / SPA Fallback UX Audit as next step.');

assertMatches(index, /<title>[^<]+<\/title>/i, 'index.html must include title.');
assertMatches(index, /<meta\s+name=["']description["']/i, 'index.html must include meta description.');
assertMatches(index, /<meta\s+property=["']og:title["']/i, 'index.html must include og:title.');
assertMatches(index, /<meta\s+property=["']og:description["']/i, 'index.html must include og:description.');
assertMatches(index, /<meta\s+property=["']og:type["']/i, 'index.html must include og:type.');
assertMatches(index, /<meta\s+property=["']og:image["']/i, 'index.html must include og:image.');
assertMatches(index, /<meta\s+name=["']twitter:card["']/i, 'index.html must include twitter:card.');
assertMatches(index, /<meta\s+name=["']twitter:title["']/i, 'index.html must include twitter:title.');
assertMatches(index, /<meta\s+name=["']twitter:description["']/i, 'index.html must include twitter:description.');
assertMatches(index, /<meta\s+name=["']twitter:image["']/i, 'index.html must include twitter:image.');
assertMatches(index, /<meta\s+name=["']theme-color["']/i, 'index.html must include theme-color.');

const imageMatch = index.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i);
if (!imageMatch) {
  failures.push('Could not locate local social preview image reference.');
} else if (!/^https?:\/\//i.test(imageMatch[1])) {
  const localPath = imageMatch[1].replace(/^\//, 'public/');
  if (!fs.existsSync(path.join(root, localPath))) failures.push(`Referenced social preview image does not exist: ${localPath}`);
}

assertIncludes(readme, 'docs/social-preview-metadata.md', 'README.md must link to docs/social-preview-metadata.md.');
assertMatches(releaseQa, /Phase 10B/i, 'RELEASE_QA_V2.md must include Phase 10B.');
assertMatches(publicLanding, /social-preview-metadata\.md|social preview metadata|SEO \/ Open Graph/i, 'Public landing doc must link/reference social preview metadata.');
assertMatches(finalAudit, /social-preview-metadata\.md|social preview metadata|SEO \/ social preview/i, 'Final RC audit must link/reference social preview metadata.');
assertMatches(releaseDraft, /social-preview-metadata\.md|social preview metadata|SEO \/ social preview/i, 'GitHub release draft must link/reference social preview metadata.');
assertMatches(publishChecklist, /social-preview-metadata\.md|social preview metadata|SEO \/ social preview/i, 'Release tag publish checklist must link/reference social preview metadata.');
assertIncludes(workflow, 'node scripts/validate-social-preview-metadata.js', 'CI workflow must run validate-social-preview-metadata.js.');

[
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

const phaseMarker = /Phase 10B|social-preview-metadata|Social Preview Metadata|og:image|twitter:card/i;
for (const file of collectFiles('e2e', /\.spec\.(js|ts)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`E2E spec contains Phase 10B/social metadata marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src/data', /textQuizParser|import|quizDraft|aiPrompt|aiOutput|fileProcessor/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`import/parser/AI source contains Phase 10B marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src', /backup|restore|storage|schema|StudyRoom|Dashboard|learning|srt|mastery|history|recommendation/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`restricted runtime source contains Phase 10B marker: ${path.relative(root, file)}`);
}

const tracked = gitTrackedFiles();
if (tracked.length) {
  const forbiddenTracked = tracked.filter(file => {
    const normalized = file.replace(/\\/g, '/');
    if (/^(node_modules|dist|test-results|playwright-report|coverage)(\/|$)/.test(normalized)) return true;
    if (/^FETCH_HEAD$|(^|\/)\.DS_Store$/.test(normalized)) return true;
    if (/\.log$|npm-debug\.log|yarn-error\.log|pnpm-debug\.log/i.test(normalized)) return true;
    if (/^\.env($|\.)/.test(normalized) && normalized !== '.env.example') return true;
    return false;
  });
  if (forbiddenTracked.length) failures.push(`Generated/local artifacts or env files are tracked: ${forbiddenTracked.join(', ')}`);
}

const publicDocsAndMetadata = [
  ['index.html', index],
  ['docs/social-preview-metadata.md', doc],
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/public-landing-page.md', publicLanding],
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
  { label: 'SEO ranking improvement', pattern: /SEO ranking improvement|search ranking improvement|all crawlers render|crawler rendering success|SEO optimization success/i }
];

for (const [file, content] of publicDocsAndMetadata) {
  for (const claim of misleadingClaims) {
    let match;
    const regex = new RegExp(claim.pattern.source, claim.pattern.flags.includes('g') ? claim.pattern.flags : `${claim.pattern.flags}g`);
    while ((match = regex.exec(content)) !== null) {
      const start = Math.max(0, match.index - 180);
      const end = Math.min(content.length, match.index + match[0].length + 180);
      const context = content.slice(start, end);
      if (!guarded(context)) failures.push(`${file} appears to claim ${claim.label}: "${match[0]}"`);
    }
  }
}

if (failures.length) {
  console.error('validate-social-preview-metadata failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-social-preview-metadata passed.');
