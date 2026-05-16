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

const cleanliness = read('docs/release-package-cleanliness.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const finalAudit = read('docs/final-rc-audit.md');
const tagDecision = read('docs/release-tag-decision.md');
const releaseDraft = read('docs/github-release-draft.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(cleanliness, /Phase 9C/i, 'release package cleanliness doc must mention Phase 9C.');
assertMatches(cleanliness, /Release Package \/ Source Archive Verification|release package cleanliness/i, 'release package cleanliness doc must mention Release Package / Source Archive Verification or release package cleanliness.');
assertMatches(cleanliness, /completed\/merged through Phase 9B|Phase 9B/i, 'release package cleanliness doc must mention completed/merged through Phase 9B.');
assertMatches(cleanliness, /release tag has not been created|tag has not been created/i, 'release package cleanliness doc must state release tag has not been created.');
assertMatches(cleanliness, /GitHub release has not been published|release has not been published/i, 'release package cleanliness doc must state GitHub release has not been published.');
assertMatches(cleanliness, /No release package published|release package.*not.*published/i, 'release package cleanliness doc must state no release package published.');
['node_modules/', 'dist/', 'test-results/', 'playwright-report/', 'coverage/', '.env'].forEach(term =>
  assertIncludes(cleanliness, term, `release package cleanliness doc must mention ${term}.`)
);
assertMatches(cleanliness, /secret\/key files|secrets/i, 'release package cleanliness doc must mention secret/key files or secrets.');
assertIncludes(cleanliness, 'git status --short', 'release package cleanliness doc must mention git status --short.');
assertIncludes(cleanliness, 'git clean -ndX', 'release package cleanliness doc must mention git clean -ndX.');
assertMatches(cleanliness, /dry-run|dry run/i, 'release package cleanliness doc must mention dry-run cleanup guidance.');
assertIncludes(cleanliness, 'npm ci', 'release package cleanliness doc must mention npm ci.');
assertIncludes(cleanliness, 'npm run build', 'release package cleanliness doc must mention npm run build.');
assertMatches(cleanliness, /full validator chain/i, 'release package cleanliness doc must mention full validator chain.');
assertMatches(cleanliness, /Phase 9D.*Release Tag \/ Publish Checklist/i, 'release package cleanliness doc must mention Phase 9D Release Tag / Publish Checklist as next step.');

assertIncludes(readme, 'docs/release-package-cleanliness.md', 'README.md must link to docs/release-package-cleanliness.md.');
assertMatches(releaseQa, /Phase 9C/i, 'RELEASE_QA_V2.md must include Phase 9C.');
assertMatches(finalAudit, /release-package-cleanliness\.md|release package\/source archive verification/i, 'final RC audit must link/reference release package/source archive verification.');
assertMatches(tagDecision, /release-package-cleanliness\.md|release package\/source archive verification/i, 'release tag decision must link/reference release package/source archive verification.');
assertMatches(releaseDraft, /release-package-cleanliness\.md|release package\/source archive verification/i, 'GitHub release draft must link/reference release package/source archive verification.');
assertIncludes(workflow, 'node scripts/validate-release-package-cleanliness.js', 'CI workflow must run validate-release-package-cleanliness.js.');

[
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

const phaseMarker = /Phase 9C|release-package-cleanliness|Release Package \/ Source Archive Verification/i;
for (const file of collectFiles('src', /\.(js|jsx|ts|tsx|css)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`runtime source file contains Phase 9C/release cleanliness marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('e2e', /\.spec\.(js|ts)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`E2E spec contains Phase 9C/release cleanliness marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src/data', /textQuizParser|import|quizDraft|aiPrompt|aiOutput|fileProcessor/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`import/parser/AI source contains Phase 9C marker: ${path.relative(root, file)}`);
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
  if (forbiddenTracked.length) {
    failures.push(`Generated/local artifacts or env files are tracked: ${forbiddenTracked.join(', ')}`);
  }
}

const publicDocs = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/release-package-cleanliness.md', cleanliness],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/release-tag-decision.md', tagDecision],
  ['docs/github-release-draft.md', releaseDraft]
];

function guarded(context) {
  return /no |not |does not|do not|must not|unless|without|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|after.*passes|actual .*run|TBD|dry-run|dry run|không/i.test(context);
}

const misleadingClaims = [
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|AI API integration|AI\/API integration|calls external AI APIs|external AI\/API calls/i },
  { label: 'OCR', pattern: /OCR support|supports OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend accounts/i },
  { label: 'production/security certification', pattern: /production certified|security certified|production\/security certification|production certification|security certification/i },
  { label: 'release tag created', pattern: /release tag created|tag was created|created a release tag/i },
  { label: 'GitHub release published', pattern: /GitHub release published|release published|published a GitHub release|published a release/i },
  { label: 'release package published', pattern: /release package published|published a release package/i }
];

for (const [file, content] of publicDocs) {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const { label, pattern } of misleadingClaims) {
      if (pattern.test(line)) {
        const context = `${lines[index - 3] || ''} ${lines[index - 2] || ''} ${lines[index - 1] || ''} ${line} ${lines[index + 1] || ''} ${lines[index + 2] || ''}`;
        if (!guarded(context)) failures.push(`${file}:${index + 1} contains unguarded misleading claim: ${label}: ${line.trim()}`);
      }
    }
  });
}

if (failures.length) {
  console.error('validate-release-package-cleanliness failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-release-package-cleanliness passed.');
