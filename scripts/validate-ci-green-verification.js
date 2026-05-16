#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

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

const ciGuide = read('docs/ci-green-verification.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const finalAudit = read('docs/final-rc-audit.md');
const localE2E = read('docs/local-e2e-verification.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(ciGuide, /GitHub Actions\s*\/\s*CI Green Verification|CI Green Verification/i, 'CI guide must mention GitHub Actions / CI Green Verification.');
assertIncludes(ciGuide, 'npm ci', 'CI guide must mention npm ci.');
assertIncludes(ciGuide, 'npm run build', 'CI guide must mention npm run build.');
assertMatches(ciGuide, /static validator chain|full static validator/i, 'CI guide must mention the static validator chain.');
assertMatches(ciGuide, /Playwright Chromium install|Playwright-managed Chromium/i, 'CI guide must mention Playwright Chromium install/setup.');
assertIncludes(ciGuide, 'npx playwright install --with-deps chromium', 'CI guide must mention Playwright install with deps.');
assertIncludes(ciGuide, 'npm run test:e2e:smoke', 'CI guide must mention npm run test:e2e:smoke.');
assertIncludes(ciGuide, 'npm run test:e2e:onboarding', 'CI guide must mention npm run test:e2e:onboarding.');
assertMatches(ciGuide, /missing Chromium|browser dependencies|CI environment issue|browser\/environment issue/i, 'CI guide must classify missing Chromium/browser dependencies as an environment issue when appropriate.');
assertMatches(ciGuide, /Do not claim CI green|Only claim.*after.*actual.*GitHub Actions|actual successful GitHub Actions run/i, 'CI guide must say not to claim CI green unless an actual GitHub Actions run passes.');
assertMatches(ciGuide, /production certification|production readiness|security certification/i, 'CI guide must mention not claiming production/security certification.');
assertMatches(ciGuide, /does not create a release tag|no release tag|release tag.*not/i, 'CI guide must state no release tag is created.');
assertMatches(ciGuide, /does not publish a GitHub release|no GitHub release|GitHub release.*not/i, 'CI guide must state no GitHub release is published.');
assertMatches(ciGuide, /EduGen remains a separate service|EduGen.*separate/i, 'CI guide must note EduGen is separate.');
assertMatches(ciGuide, /not required for onboarding E2E|onboarding E2E.*does not require EduGen/i, 'CI guide must note EduGen is not required for onboarding E2E.');
assertMatches(ciGuide, /PDF\/DOCX\/PPTX\/ZIP.*requires.*EduGen|document import E2E.*requires.*EduGen|File Processor/i, 'CI guide must note document import E2E requires separate EduGen/File Processor if tested.');

assertIncludes(readme, 'docs/ci-green-verification.md', 'README.md must link to docs/ci-green-verification.md.');
assertMatches(releaseQa, /Phase 8Y/i, 'RELEASE_QA_V2.md must include Phase 8Y.');
assertMatches(finalAudit, /ci-green-verification\.md|CI Green Verification/i, 'final RC audit must reference CI green verification.');
assertMatches(localE2E, /ci-green-verification\.md|CI green verification/i, 'local E2E guide must reference CI green verification.');

assertIncludes(workflow, 'node scripts/validate-ci-green-verification.js', 'CI workflow must run validate-ci-green-verification.js.');
assertIncludes(workflow, 'npx playwright install --with-deps chromium', 'CI workflow must include Playwright Chromium install/setup.');
assertIncludes(workflow, 'npm run test:e2e:smoke', 'CI workflow must run E2E smoke.');
assertIncludes(workflow, 'npm run test:e2e:onboarding', 'CI workflow must run onboarding E2E.');
assertNotMatches(workflow, /continue-on-error:\s*true/i, 'CI workflow must not include broad continue-on-error.');
assertNotMatches(workflow, /test:e2e:smoke[\s\S]{0,80}(?:--skip|skip|true\s*#\s*skip)/i, 'CI workflow must not skip E2E smoke.');
assertNotMatches(workflow, /test:e2e:onboarding[\s\S]{0,80}(?:--skip|skip|true\s*#\s*skip)/i, 'CI workflow must not skip onboarding E2E.');

[
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
assertIncludes(workflow, 'actions/upload-artifact@v4', 'CI workflow must preserve failure artifact upload.');

if (pkg.version !== lockRoot.version || pkg.version !== lock.version) {
  failures.push(`package version metadata mismatch: package=${pkg.version}, lock=${lock.version}, root=${lockRoot.version}`);
}
for (const kind of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
  const pkgDeps = JSON.stringify(pkg[kind] || {});
  const lockDeps = JSON.stringify(lockRoot[kind] || {});
  if (pkgDeps !== lockDeps) failures.push(`package.json ${kind} must match package-lock root metadata.`);
}

function collectFiles(startRelative, regex) {
  const start = path.join(root, startRelative);
  if (!fs.existsSync(start)) return [];
  const files = [];
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) fs.readdirSync(current).forEach(entry => stack.push(path.join(current, entry)));
    else if (regex.test(current)) files.push(current);
  }
  return files;
}

for (const file of collectFiles('src', /\.(js|jsx|ts|tsx|css)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Phase 8Y|ci-green-verification|CI Green Verification/i.test(text)) {
    failures.push(`runtime source file contains Phase 8Y/CI marker: ${path.relative(root, file)}`);
  }
}
for (const file of collectFiles('e2e', /\.spec\.(js|ts)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Phase 8Y|ci-green-verification|CI Green Verification/i.test(text)) {
    failures.push(`E2E spec contains Phase 8Y/CI marker: ${path.relative(root, file)}`);
  }
}
for (const file of collectFiles('src/data', /textQuizParser|import|quizDraft|aiPrompt|aiOutput|fileProcessor/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Phase 8Y|ci-green-verification|CI Green Verification/i.test(text)) {
    failures.push(`import/parser/AI source contains Phase 8Y marker: ${path.relative(root, file)}`);
  }
}

const publicDocs = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/ci-green-verification.md', ciGuide],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/local-e2e-verification.md', localE2E]
];

function guarded(context) {
  return /no |not |does not|do not|must not|unless|without|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|environment-blocked|actual .*run passes|after .*passes|không/i.test(context);
}

const misleadingClaims = [
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|AI API integration|AI\/API integration|calls external AI APIs|external AI\/API calls/i },
  { label: 'OCR', pattern: /OCR support|supports OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend accounts/i },
  { label: 'production/security certification', pattern: /production certified|security certified|production\/security certification|security certification/i },
  { label: 'release tag created', pattern: /release tag created|tag was created|created a release tag/i },
  { label: 'GitHub release published', pattern: /GitHub release published|release published|published a release/i },
  { label: 'CI green', pattern: /GitHub Actions CI is green|CI is green|CI Green Verification passed/i }
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
  console.error('validate-ci-green-verification failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-ci-green-verification passed.');
