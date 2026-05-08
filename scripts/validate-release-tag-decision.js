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

const decision = read('docs/release-tag-decision.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const finalAudit = read('docs/final-rc-audit.md');
const ciGuide = read('docs/ci-green-verification.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};
const currentVersion = pkg.version;

assertMatches(decision, /Phase 9A/i, 'release tag decision doc must mention Phase 9A.');
assertMatches(decision, /Version\s*\/\s*Release Tag Decision|release tag decision/i, 'release tag decision doc must mention Version / Release Tag Decision.');
assertMatches(decision, /completed\/merged through Phase 8Y|Phase 8Y/i, 'release tag decision doc must mention completed/merged through Phase 8Y.');
assertMatches(decision, /current `?package\.json`? version|Current package\.json version|package\.json version/i, 'release tag decision doc must mention current package.json version.');
assertIncludes(decision, currentVersion, `release tag decision doc must include current package version ${currentVersion}.`);
assertMatches(decision, /release naming|tag options|release tag options/i, 'release tag decision doc must mention release tag options.');
assertMatches(decision, /v2\.0\.0-rc1|RC tag/i, 'release tag decision doc must mention v2.0.0-rc1 or RC tag option.');
assertMatches(decision, /user.*decision|user.*approve|user approval|final decision belongs to the user/i, 'release tag decision doc must require user decision/approval before version or tag changes.');
assertMatches(decision, /does not change.*package version|no package version change|do not change `?package\.json`?/i, 'release tag decision doc must state no package version change in this phase.');
assertMatches(decision, /does not.*create.*git tag|does not.*create.*release tag|no release tag created|release tag has not been created/i, 'release tag decision doc must state no release tag is created in this phase.');
assertMatches(decision, /does not.*publish.*GitHub release|no GitHub release published|GitHub release has not been published/i, 'release tag decision doc must state no GitHub release is published in this phase.');
assertMatches(decision, /Phase 9B.*GitHub Release Draft|GitHub Release Draft/i, 'release tag decision doc must mention Phase 9B GitHub Release Draft as next step.');
assertMatches(decision, /production.*certification|security.*certification|certify production|certify security/i, 'release tag decision doc must mention production/security certification is not claimed.');

assertIncludes(readme, 'docs/release-tag-decision.md', 'README.md must link to docs/release-tag-decision.md.');
assertMatches(releaseQa, /Phase 9A/i, 'RELEASE_QA_V2.md must include Phase 9A.');
assertMatches(finalAudit, /release-tag-decision\.md|release tag decision/i, 'final RC audit must link/reference release tag decision.');
assertMatches(ciGuide, /release-tag-decision\.md|release tag decision/i, 'CI green verification doc must link/reference release tag decision.');
assertIncludes(workflow, 'node scripts/validate-release-tag-decision.js', 'CI workflow must run validate-release-tag-decision.js.');

[
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
  if (/Phase 9A|release-tag-decision|Release Tag Decision/i.test(text)) {
    failures.push(`runtime source file contains Phase 9A/release tag marker: ${path.relative(root, file)}`);
  }
}
for (const file of collectFiles('e2e', /\.spec\.(js|ts)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Phase 9A|release-tag-decision|Release Tag Decision/i.test(text)) {
    failures.push(`E2E spec contains Phase 9A/release tag marker: ${path.relative(root, file)}`);
  }
}
for (const file of collectFiles('src/data', /textQuizParser|import|quizDraft|aiPrompt|aiOutput|fileProcessor/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Phase 9A|release-tag-decision|Release Tag Decision/i.test(text)) {
    failures.push(`import/parser/AI source contains Phase 9A marker: ${path.relative(root, file)}`);
  }
}

const publicDocs = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/release-tag-decision.md', decision],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/ci-green-verification.md', ciGuide]
];

function guarded(context) {
  return /no |not |does not|do not|must not|unless|without|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|approval|before/i.test(context);
}

const misleadingClaims = [
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|AI API integration|AI\/API integration|calls external AI APIs|external AI\/API calls/i },
  { label: 'OCR', pattern: /OCR support|supports OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend accounts/i },
  { label: 'production/security certification', pattern: /production certified|security certified|production\/security certification|production certification|security certification/i },
  { label: 'release tag created', pattern: /release tag created|tag was created|created a release tag/i },
  { label: 'GitHub release published', pattern: /GitHub release published|release published|published a GitHub release|published a release/i }
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
  console.error('validate-release-tag-decision failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-release-tag-decision passed.');
