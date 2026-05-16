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

const checklist = read('docs/release-tag-publish-checklist.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const finalAudit = read('docs/final-rc-audit.md');
const tagDecision = read('docs/release-tag-decision.md');
const releaseDraft = read('docs/github-release-draft.md');
const cleanliness = read('docs/release-package-cleanliness.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(checklist, /Phase 9D/i, 'release tag publish checklist must mention Phase 9D.');
assertMatches(checklist, /Release Tag \/ Publish Checklist/i, 'release tag publish checklist must mention Release Tag / Publish Checklist.');
assertMatches(checklist, /completed\/merged through Phase 9C|Phase 9C/i, 'release tag publish checklist must mention completed/merged through Phase 9C.');
assertMatches(checklist, /release tag has not been created|tag has not been created/i, 'release tag publish checklist must state release tag has not been created.');
assertMatches(checklist, /GitHub release has not been published|GitHub Release has not been published/i, 'release tag publish checklist must state GitHub release has not been published.');
assertMatches(checklist, /Release package has not been published|release package.*not.*published/i, 'release tag publish checklist must state release package has not been published.');
[
  'git status --short',
  'git checkout main',
  'git pull origin main',
  'npm ci',
  'npm run build',
  'npm run test:e2e:smoke',
  'npm run test:e2e:onboarding',
  'docs/github-release-draft.md',
  'docs/release-package-cleanliness.md'
].forEach(term => assertIncludes(checklist, term, `release tag publish checklist must mention ${term}.`));
assertMatches(checklist, /git log --oneline --decorate/i, 'release tag publish checklist must mention git log --oneline --decorate.');
assertMatches(checklist, /full static validator chain|full validator chain/i, 'release tag publish checklist must mention full static validator chain.');
assertMatches(checklist, /GitHub Actions green.*actual|actual GitHub Actions run passes/i, 'release tag publish checklist must scope GitHub Actions green to actual Actions success.');
assertMatches(checklist, /Vite.*chunk-size warning.*non-blocking|chunk.*500 kB.*non-blocking/i, 'release tag publish checklist must mention Vite chunk-size warning as non-blocking if build passes.');
assertMatches(checklist, /No generated artifacts committed|generated artifacts.*committed/i, 'release tag publish checklist must mention no generated artifacts committed.');
assertMatches(checklist, /No secrets\/env files committed|secrets\/env files/i, 'release tag publish checklist must mention no secrets/env files committed.');
assertMatches(checklist, /stop conditions/i, 'release tag publish checklist must mention stop conditions.');
assertMatches(checklist, /Example tag commands are examples only|examples only/i, 'release tag publish checklist must state example tag commands are examples only.');
assertMatches(checklist, /no production\/security certification|production certification|security certification/i, 'release tag publish checklist must mention no production/security certification.');

assertIncludes(readme, 'docs/release-tag-publish-checklist.md', 'README.md must link to docs/release-tag-publish-checklist.md.');
assertMatches(releaseQa, /Phase 9D/i, 'RELEASE_QA_V2.md must include Phase 9D.');
assertMatches(finalAudit, /release-tag-publish-checklist\.md|release tag \/ publish checklist/i, 'final RC audit must link/reference release tag / publish checklist.');
assertMatches(tagDecision, /release-tag-publish-checklist\.md|release tag \/ publish checklist/i, 'release tag decision must link/reference release tag / publish checklist.');
assertMatches(releaseDraft, /release-tag-publish-checklist\.md|release tag \/ publish checklist/i, 'GitHub release draft must link/reference release tag / publish checklist.');
assertMatches(cleanliness, /release-tag-publish-checklist\.md|release tag \/ publish checklist/i, 'release package cleanliness must link/reference release tag / publish checklist.');
assertIncludes(workflow, 'node scripts/validate-release-tag-publish-checklist.js', 'CI workflow must run validate-release-tag-publish-checklist.js.');

[
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

const phaseMarker = /Phase 9D|release-tag-publish-checklist|Release Tag \/ Publish Checklist/i;
for (const file of collectFiles('src', /\.(js|jsx|ts|tsx|css)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`runtime source file contains Phase 9D/release publish marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('e2e', /\.spec\.(js|ts)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`E2E spec contains Phase 9D/release publish marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src/data', /textQuizParser|import|quizDraft|aiPrompt|aiOutput|fileProcessor/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`import/parser/AI source contains Phase 9D marker: ${path.relative(root, file)}`);
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
  ['docs/release-tag-publish-checklist.md', checklist],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/release-tag-decision.md', tagDecision],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-package-cleanliness.md', cleanliness]
];

function guarded(context) {
  return /no |not |does not|do not|must not|unless|without|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|after.*passes|actual .*run|example|examples only|claim|if claiming|stop conditions|dry-run|dry run|không/i.test(context);
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
  console.error('validate-release-tag-publish-checklist failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-release-tag-publish-checklist passed.');
