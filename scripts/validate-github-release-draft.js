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

const draft = read('docs/github-release-draft.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const finalAudit = read('docs/final-rc-audit.md');
const tagDecision = read('docs/release-tag-decision.md');
const ciGuide = read('docs/ci-green-verification.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(draft, /Phase 9B/i, 'GitHub release draft must mention Phase 9B.');
assertMatches(draft, /GitHub Release Draft/i, 'GitHub release draft must mention GitHub Release Draft.');
assertMatches(draft, /completed\/merged through Phase 9A|Phase 9A/i, 'GitHub release draft must mention completed/merged through Phase 9A.');
assertMatches(draft, /release tag has not been created|tag has not been created/i, 'GitHub release draft must state release tag has not been created.');
assertMatches(draft, /GitHub release has not been published|release has not been published/i, 'GitHub release draft must state GitHub release has not been published.');
assertMatches(draft, /package version was not changed|package version.*not changed/i, 'GitHub release draft must state package version was not changed in this phase.');
assertMatches(draft, /local-first quiz study app/i, 'GitHub release draft must mention local-first quiz study app.');
assertMatches(draft, /JSON\/CSV import/i, 'GitHub release draft must mention JSON/CSV import.');
assertMatches(draft, /text\/Markdown|paste text\/Markdown/i, 'GitHub release draft must mention text/Markdown import.');
assertMatches(draft, /\.txt.*\.md|\.md.*\.txt/i, 'GitHub release draft must mention .txt/.md import.');
assertMatches(draft, /PDF\/DOCX\/PPTX\/ZIP.*EduGen|PDF\/DOCX\/PPTX\/ZIP.*File Processor/i, 'GitHub release draft must mention PDF/DOCX/PPTX/ZIP through separate EduGen/File Processor.');
assertMatches(draft, /advisory quiz draft quality review/i, 'GitHub release draft must mention advisory quiz draft quality review.');
assertMatches(draft, /manual AI prompt\/export workflow/i, 'GitHub release draft must mention manual AI prompt/export workflow.');
assertMatches(draft, /manual AI output review\/import hardening/i, 'GitHub release draft must mention manual AI output review/import hardening.');
assertMatches(draft, /Dùng quiz mẫu|demo quickstart/i, 'GitHub release draft must mention Dùng quiz mẫu or demo quickstart.');
assertMatches(draft, /Library empty-state onboarding/i, 'GitHub release draft must mention Library empty-state onboarding.');
assertMatches(draft, /Dashboard first-run onboarding/i, 'GitHub release draft must mention Dashboard first-run onboarding.');
assertMatches(draft, /onboarding E2E smoke coverage/i, 'GitHub release draft must mention onboarding E2E smoke coverage.');
assertIncludes(draft, 'npm ci', 'GitHub release draft must mention npm ci.');
assertIncludes(draft, 'npm run build', 'GitHub release draft must mention npm run build.');
assertIncludes(draft, 'npm run test:e2e:smoke', 'GitHub release draft must mention npm run test:e2e:smoke.');
assertIncludes(draft, 'npm run test:e2e:onboarding', 'GitHub release draft must mention npm run test:e2e:onboarding.');
assertMatches(draft, /GitHub Actions CI green.*actual passing|actual passing GitHub Actions|only be claimed after.*GitHub Actions/i, 'GitHub release draft must tie CI green claims to actual GitHub Actions evidence.');
assertMatches(draft, /EduGen\/File Processor.*separate|EduGen.*separate/i, 'GitHub release draft must mention EduGen/File Processor is separate.');
assertMatches(draft, /not bundled into Shime/i, 'GitHub release draft must mention EduGen is not bundled.');
assertMatches(draft, /Frontend-only hosting alone.*does not provide document conversion|frontend-only hosting.*does not provide/i, 'GitHub release draft must mention frontend-only hosting alone does not provide document conversion.');
assertMatches(draft, /no built-in AI generation/i, 'GitHub release draft must mention no built-in AI generation.');
assertMatches(draft, /no external AI\/API calls/i, 'GitHub release draft must mention no external AI/API calls.');
assertMatches(draft, /no API key\/BYOK|API key\/BYOK implementation/i, 'GitHub release draft must mention no API key/BYOK.');
assertMatches(draft, /no OCR|OCR support/i, 'GitHub release draft must mention no OCR.');
assertMatches(draft, /no backend\/cloud sync|backend\/auth\/cloud sync|Backend\/auth\/cloud sync/i, 'GitHub release draft must mention no backend/cloud sync.');
assertMatches(draft, /no production\/security certification|production certification|security certification/i, 'GitHub release draft must mention no production/security certification.');
assertMatches(draft, /Phase 9C.*Release Package|source archive verification/i, 'GitHub release draft must mention Phase 9C release package/source archive verification as next step.');

assertIncludes(readme, 'docs/github-release-draft.md', 'README.md must link to docs/github-release-draft.md.');
assertMatches(releaseQa, /Phase 9B/i, 'RELEASE_QA_V2.md must include Phase 9B.');
assertMatches(finalAudit, /github-release-draft\.md|GitHub Release Draft/i, 'final RC audit must link/reference GitHub release draft.');
assertMatches(tagDecision, /github-release-draft\.md|GitHub Release Draft/i, 'release tag decision must link/reference GitHub release draft.');
assertMatches(ciGuide, /github-release-draft\.md|GitHub Release Draft/i, 'CI green verification doc must link/reference GitHub release draft.');
assertIncludes(workflow, 'node scripts/validate-github-release-draft.js', 'CI workflow must run validate-github-release-draft.js.');

[
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
  if (/Phase 9B|github-release-draft|GitHub Release Draft/i.test(text)) {
    failures.push(`runtime source file contains Phase 9B/GitHub release draft marker: ${path.relative(root, file)}`);
  }
}
for (const file of collectFiles('e2e', /\.spec\.(js|ts)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Phase 9B|github-release-draft|GitHub Release Draft/i.test(text)) {
    failures.push(`E2E spec contains Phase 9B/GitHub release draft marker: ${path.relative(root, file)}`);
  }
}
for (const file of collectFiles('src/data', /textQuizParser|import|quizDraft|aiPrompt|aiOutput|fileProcessor/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Phase 9B|github-release-draft|GitHub Release Draft/i.test(text)) {
    failures.push(`import/parser/AI source contains Phase 9B marker: ${path.relative(root, file)}`);
  }
}

const publicDocs = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/github-release-draft.md', draft],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/release-tag-decision.md', tagDecision],
  ['docs/ci-green-verification.md', ciGuide]
];

function guarded(context) {
  return /no |not |does not|do not|must not|unless|without|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|after.*passes|actual .*run|TBD/i.test(context);
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
  console.error('validate-github-release-draft failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-github-release-draft passed.');
