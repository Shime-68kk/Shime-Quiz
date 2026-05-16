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

const smoke = read('docs/backup-restore-regression-smoke.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const finalAudit = read('docs/final-rc-audit.md');
const publishChecklist = read('docs/release-tag-publish-checklist.md');
const releaseDraft = read('docs/github-release-draft.md');
const importSmoke = read('docs/import-regression-smoke.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(smoke, /Phase 9F/i, 'backup/restore regression smoke doc must mention Phase 9F.');
assertMatches(smoke, /Backup \/ Restore Manual Regression Smoke/i, 'backup/restore regression smoke doc must mention Backup / Restore Manual Regression Smoke.');
assertMatches(smoke, /completed\/merged through Phase 9E|Phase 9E/i, 'backup/restore regression smoke doc must mention completed/merged through Phase 9E.');
assertMatches(smoke, /release tag has not been created|tag has not been created/i, 'backup/restore regression smoke doc must state release tag has not been created.');
assertMatches(smoke, /GitHub release has not been published|GitHub Release has not been published/i, 'backup/restore regression smoke doc must state GitHub release has not been published.');
assertMatches(smoke, /export backup/i, 'backup/restore regression smoke doc must mention export backup.');
assertMatches(smoke, /restore backup/i, 'backup/restore regression smoke doc must mention restore backup.');
assertMatches(smoke, /Library data/i, 'backup/restore regression smoke doc must mention Library data.');
assertMatches(smoke, /quiz content/i, 'backup/restore regression smoke doc must mention quiz content.');
assertMatches(smoke, /study history|progress/i, 'backup/restore regression smoke doc must mention study history or progress.');
assertMatches(smoke, /review schedule/i, 'backup/restore regression smoke doc must mention review schedule.');
assertMatches(smoke, /recommendation feedback/i, 'backup/restore regression smoke doc must mention recommendation feedback.');
assertMatches(smoke, /study goal|plan progress/i, 'backup/restore regression smoke doc must mention study goal or plan progress.');
assertMatches(smoke, /malformed|bad backup/i, 'backup/restore regression smoke doc must mention malformed or bad backup.');
assertMatches(smoke, /local-first/i, 'backup/restore regression smoke doc must mention local-first.');
assertMatches(smoke, /no backend\/cloud sync|No backend\/cloud sync|backend\/cloud sync is required/i, 'backup/restore regression smoke doc must mention no backend/cloud sync.');
assertMatches(smoke, /no account\/auth|required for backup or restore|account\/auth is required/i, 'backup/restore regression smoke doc must mention no account/auth required.');
assertMatches(smoke, /Do not claim manual backup\/restore regression passed unless an actual tester\/user run passes|do not claim manual backup\/restore regression passed unless.*actual/i, 'backup/restore regression smoke doc must mention no manual pass claim without actual run.');
assertMatches(smoke, /Do not claim all state categories are preserved unless each was actually checked|all state categories are preserved unless each.*checked/i, 'backup/restore regression smoke doc must mention no all-state preservation claim unless checked.');
assertMatches(smoke, /Phase 9G.*Study Room \/ Dashboard Learning Flow Smoke|optional.*hardening/i, 'backup/restore regression smoke doc must mention Phase 9G or optional next hardening.');

assertIncludes(readme, 'docs/backup-restore-regression-smoke.md', 'README.md must link to docs/backup-restore-regression-smoke.md.');
assertMatches(releaseQa, /Phase 9F/i, 'RELEASE_QA_V2.md must include Phase 9F.');
assertMatches(finalAudit, /backup-restore-regression-smoke\.md|backup\/restore regression smoke/i, 'final RC audit must link/reference backup/restore regression smoke.');
assertMatches(publishChecklist, /backup-restore-regression-smoke\.md|backup\/restore regression smoke/i, 'release tag publish checklist must link/reference backup/restore regression smoke.');
assertMatches(releaseDraft, /backup-restore-regression-smoke\.md|backup\/restore regression smoke/i, 'GitHub release draft must link/reference backup/restore regression smoke.');
assertMatches(importSmoke, /backup-restore-regression-smoke\.md|backup\/restore regression smoke/i, 'import regression smoke must link/reference backup/restore regression smoke.');
assertIncludes(workflow, 'node scripts/validate-backup-restore-regression-smoke.js', 'CI workflow must run validate-backup-restore-regression-smoke.js.');

[
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

const phaseMarker = /Phase 9F|backup-restore-regression-smoke|Backup \/ Restore Manual Regression Smoke/i;
for (const file of collectFiles('src', /\.(js|jsx|ts|tsx|css)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`runtime source file contains Phase 9F/backup restore smoke marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('e2e', /\.spec\.(js|ts)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`E2E spec contains Phase 9F/backup restore smoke marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src', /backup|restore|storage|schema|srt|mastery|study|recommendation|dashboard/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`backup/storage/scoring/study source contains Phase 9F marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src/data', /textQuizParser|import|quizDraft|aiPrompt|aiOutput|fileProcessor/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (phaseMarker.test(text)) failures.push(`import/parser/AI source contains Phase 9F marker: ${path.relative(root, file)}`);
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

const publicDocs = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/backup-restore-regression-smoke.md', smoke],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/release-tag-publish-checklist.md', publishChecklist],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/import-regression-smoke.md', importSmoke]
];

function guarded(context) {
  return /no |not |does not|do not|must not|unless|without|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|after.*passes|actual .*run|if claiming|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|do not say|stop condition|Release notes must not|local-first|không|where applicable|checked/i.test(context);
}

const misleadingClaims = [
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|AI API integration|AI\/API integration|calls external AI APIs|external AI\/API calls/i },
  { label: 'OCR', pattern: /OCR support|supports OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend accounts/i },
  { label: 'account/auth backup', pattern: /account\/auth backup|auth backup|account backup/i },
  { label: 'production/security certification', pattern: /production certified|security certified|production\/security certification|production certification|security certification/i },
  { label: 'release tag created', pattern: /release tag created|tag was created|created a release tag/i },
  { label: 'GitHub release published', pattern: /GitHub release published|release published|published a GitHub release|published a release/i },
  { label: 'manual backup/restore regression passed', pattern: /manual backup\/restore regression passed|backup\/restore regression passed|all state categories are preserved/i }
];

for (const [file, content] of publicDocs) {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    const context = lines.slice(Math.max(0, index - 8), index + 1).join(' ');
    for (const { label, pattern } of misleadingClaims) {
      if (pattern.test(line) && !guarded(context)) {
        failures.push(`${file}:${index + 1} may overclaim ${label}: ${line.trim()}`);
      }
    }
  });
}

if (failures.length) {
  console.error('validate-backup-restore-regression-smoke failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-backup-restore-regression-smoke passed.');
