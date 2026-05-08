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

const audit = read('docs/final-rc-audit.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const publicNotes = read('docs/public-release-notes.md');
const deployment = read('docs/deployment-readiness.md');
const localE2E = read('docs/local-e2e-verification.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');

const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(audit, /Phase 8W/i, 'final RC audit must mention Phase 8W baseline.');
assertMatches(audit, /final RC audit|release-candidate audit/i, 'final RC audit must identify itself as a final RC/release-candidate audit.');
assertMatches(audit, /release tag readiness/i, 'final RC audit must mention release tag readiness.');
assertMatches(audit, /local-first quiz study app/i, 'final RC audit must mention local-first quiz study app.');
assertMatches(audit, /JSON\/CSV import/i, 'final RC audit must mention JSON/CSV import.');
assertMatches(audit, /text\/Markdown|Markdown draft/i, 'final RC audit must mention text/Markdown import.');
assertMatches(audit, /Dùng quiz mẫu|demo sample quickstart/i, 'final RC audit must mention demo sample quickstart.');
assertMatches(audit, /Library empty-state onboarding/i, 'final RC audit must mention Library empty-state onboarding.');
assertMatches(audit, /Dashboard first-run onboarding/i, 'final RC audit must mention Dashboard first-run onboarding.');
assertMatches(audit, /onboarding E2E coverage/i, 'final RC audit must mention onboarding E2E coverage.');
assertMatches(audit, /local E2E verification docs|local-e2e-verification\.md/i, 'final RC audit must mention local E2E verification docs.');
assertMatches(audit, /Ubuntu browser smoke|manual browser smoke|manual Ubuntu browser/i, 'final RC audit must mention Ubuntu/manual browser smoke evidence.');
assertMatches(audit, /npm run test:e2e:onboarding[\s\S]*local Ubuntu|local Ubuntu[\s\S]*npm run test:e2e:onboarding|3 tests passed/i, 'final RC audit must carefully mention local Ubuntu onboarding E2E pass evidence.');
assertMatches(audit, /EduGen[\s\S]*(separate|not bundled)|(separate|not bundled)[\s\S]*EduGen/i, 'final RC audit must say EduGen is separate/not bundled.');
assertMatches(audit, /PDF\/DOCX\/PPTX\/ZIP[\s\S]*(configured|browser-reachable|separate)[\s\S]*(EduGen|File Processor)|EduGen[\s\S]*(PDF\/DOCX\/PPTX\/ZIP)[\s\S]*(configured|browser-reachable|separate)/i, 'final RC audit must say document import requires separate configured service.');
assertMatches(audit, /manual AI|manual prompt\/export|manual output/i, 'final RC audit must mention manual AI workflow.');
assertMatches(audit, /No built-in AI quiz generation/i, 'final RC audit must mention no built-in AI generation.');
assertMatches(audit, /No external AI\/API calls|No external AI\/API integration/i, 'final RC audit must mention no external AI/API calls.');
assertMatches(audit, /No API key\/BYOK|No API key.*BYOK/i, 'final RC audit must mention no API key/BYOK.');
assertMatches(audit, /No OCR/i, 'final RC audit must mention no OCR.');
assertMatches(audit, /No backend\/auth\/cloud sync|No backend.*cloud sync/i, 'final RC audit must mention no backend/cloud sync.');
assertMatches(audit, /No hosted production\/security certification|No production\/security certification|Do not say production certified|Do not say security certified/i, 'final RC audit must mention no production/security certification.');
assertMatches(audit, /CI Green Verification[\s\S]*(next|later)|next[\s\S]*CI Green Verification|later[\s\S]*CI Green Verification/i, 'final RC audit must list CI Green Verification as a next/later step.');
assertMatches(audit, /release tag\/version decision[\s\S]*(next|later)|release tag.*later|version decision.*later/i, 'final RC audit must list release tag/version decision as a next/later step.');
assertMatches(audit, /Final RC audit documentation exists/i, 'final RC audit must include safe conclusion.');
assertMatches(audit, /Current release candidate capabilities and caveats are audited/i, 'final RC audit must include audited capabilities/caveats safe conclusion.');

assertIncludes(readme, 'docs/final-rc-audit.md', 'README.md must link to docs/final-rc-audit.md.');
assertMatches(releaseQa, /Phase 8X/i, 'RELEASE_QA_V2.md must include Phase 8X.');
assertMatches(publicNotes, /final-rc-audit\.md|final RC audit/i, 'public release notes must link to or mention final RC audit.');
assertMatches(deployment, /final-rc-audit\.md|final RC audit/i, 'deployment readiness must link to or mention final RC audit.');
assertMatches(localE2E, /final-rc-audit\.md|final RC audit/i, 'local E2E verification docs must link to or mention final RC audit.');
assertIncludes(workflow, 'node scripts/validate-final-rc-audit.js', 'CI workflow must run validate-final-rc-audit.js.');

[
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
].forEach((validator) => assertIncludes(workflow, validator, `CI workflow must preserve ${validator}.`));

assertIncludes(workflow, 'npx playwright install --with-deps chromium', 'CI workflow must preserve Playwright install.');
assertIncludes(workflow, 'npm run test:e2e:smoke', 'CI workflow must preserve Playwright E2E smoke.');
assertIncludes(workflow, 'actions/upload-artifact@v4', 'CI workflow must preserve failure artifact upload.');
assertNotMatches(workflow, /continue-on-error:\s*true/i, 'CI workflow must not add broad continue-on-error.');

if (pkg.version !== lock.version || pkg.version !== lockRoot.version) {
  failures.push(`package version metadata mismatch or changed unexpectedly: package=${pkg.version}, lock=${lock.version}, root=${lockRoot.version}`);
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
    if (stat.isDirectory()) {
      fs.readdirSync(current).forEach((entry) => stack.push(path.join(current, entry)));
    } else if (regex.test(current)) {
      files.push(current);
    }
  }
  return files;
}

for (const file of collectFiles('src', /\.(js|jsx|ts|tsx|css)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Phase 8X|final-rc-audit|Final RC audit|release tag readiness/i.test(text)) {
    failures.push(`runtime source file contains Phase 8X/final RC audit marker: ${path.relative(root, file)}`);
  }
}
for (const file of collectFiles('e2e', /\.spec\.(js|ts)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Phase 8X|final-rc-audit|Final RC audit|release tag readiness/i.test(text)) {
    failures.push(`E2E spec contains Phase 8X/final RC audit marker: ${path.relative(root, file)}`);
  }
}
for (const file of collectFiles('src/data', /textQuizParser|import|quizDraft|aiPrompt|aiOutput|fileProcessor/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Phase 8X|final-rc-audit|Final RC audit/i.test(text)) {
    failures.push(`import/parser/AI source contains Phase 8X marker: ${path.relative(root, file)}`);
  }
}

const publicDocs = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/final-rc-audit.md', audit],
  ['docs/public-release-notes.md', publicNotes],
  ['docs/deployment-readiness.md', deployment],
  ['docs/local-e2e-verification.md', localE2E]
];

function guarded(line) {
  return /no |not |does not|do not|unless|without|unsupported|forbidden|avoid|non-goals|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|do not say|không|environment-blocked|actual evidence|actually verified|not certify|not create|not publish/i.test(line);
}

const misleadingClaims = [
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|AI API integration|AI\/API integration|calls external AI APIs|external AI\/API calls/i },
  { label: 'API key/BYOK support', pattern: /API key support|BYOK support|API key\/BYOK support|supports API keys|supports BYOK/i },
  { label: 'OCR', pattern: /OCR support|supports OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend accounts/i },
  { label: 'production/security certification', pattern: /production certified|security certified|production\/security certification|security certification/i },
  { label: 'release tag created', pattern: /release tag created|tag was created|created a release tag/i },
  { label: 'GitHub release published', pattern: /GitHub release published|release published|published a release/i },
  { label: 'CI green', pattern: /CI is green|GitHub Actions CI is green|CI Green Verification passed/i },
  { label: 'frontend-only document import without EduGen', pattern: /frontend-only.*PDF\/DOCX\/PPTX\/ZIP.*without.*EduGen|frontend-only hosting.*document import.*without/i }
];

for (const [file, content] of publicDocs) {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const { label, pattern } of misleadingClaims) {
      if (pattern.test(line)) {
        const context = `${lines[index - 10] || ''} ${lines[index - 9] || ''} ${lines[index - 8] || ''} ${lines[index - 7] || ''} ${lines[index - 6] || ''} ${lines[index - 5] || ''} ${lines[index - 4] || ''} ${lines[index - 3] || ''} ${lines[index - 2] || ''} ${lines[index - 1] || ''} ${line} ${lines[index + 1] || ''}`;
        if (!guarded(context)) {
          failures.push(`${file}:${index + 1} contains unguarded misleading claim: ${label}: ${line.trim()}`);
        }
      }
    }
  });
}

if (failures.length) {
  console.error('validate-final-rc-audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-final-rc-audit passed.');
