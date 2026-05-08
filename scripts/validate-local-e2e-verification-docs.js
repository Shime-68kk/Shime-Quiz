#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const failures = [];

function read(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`${relativePath} is missing.`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function assertIncludes(haystack, needle, message) {
  if (!haystack.includes(needle)) failures.push(message || `Missing ${needle}`);
}

function assertMatches(haystack, regex, message) {
  if (!regex.test(haystack)) failures.push(message || `Pattern not found: ${regex}`);
}

function assertNotMatches(haystack, regex, message) {
  if (regex.test(haystack)) failures.push(message || `Forbidden pattern found: ${regex}`);
}

const localGuidePath = 'docs/local-e2e-verification.md';
const localGuide = read(localGuidePath);
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const publicNotes = read('docs/public-release-notes.md');
const demoScript = read('docs/demo-script.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const pkgText = read('package.json');
const lockText = read('package-lock.json');

const pkg = pkgText ? JSON.parse(pkgText) : { scripts: {}, dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertIncludes(localGuide, 'npx playwright install chromium', 'local E2E guide must document Playwright Chromium install.');
assertIncludes(localGuide, 'npx playwright install --with-deps chromium', 'local E2E guide must document Playwright Chromium install with dependencies.');
assertIncludes(localGuide, 'npm run test:e2e:smoke', 'local E2E guide must document npm run test:e2e:smoke.');
assertIncludes(localGuide, 'npm run test:e2e:onboarding', 'local E2E guide must document npm run test:e2e:onboarding.');
assertMatches(localGuide, /missing Chromium|Executable doesn't exist|environment issue|browser\/environment issue/i, 'local E2E guide must explain missing Chromium as an environment/browser issue.');
assertMatches(localGuide, /Do not describe automated E2E as passed unless|Do not claim.*E2E.*passed.*unless|Only claim automated E2E passed after/i, 'local E2E guide must state not to claim E2E passed unless the command actually passes.');
assertMatches(localGuide, /EduGen is not required for onboarding E2E|does not require EduGen/i, 'local E2E guide must note EduGen is not required for onboarding E2E.');
assertMatches(localGuide, /PDF\/DOCX\/PPTX\/ZIP.*separately.*EduGen|document import E2E.*separate.*EduGen/i, 'local E2E guide must note document import E2E would require separate EduGen.');
assertMatches(localGuide, /4173|4174/, 'local E2E guide must mention port conflicts on 4173/4174.');
assertMatches(localGuide, /app bug|test bug|browser\/environment issue|timeout\/flakiness|selector issue/i, 'local E2E guide must classify common E2E failure types.');

assertIncludes(readme, 'docs/local-e2e-verification.md', 'README.md must link to docs/local-e2e-verification.md.');
assertIncludes(releaseQa, 'Phase 8W', 'RELEASE_QA_V2.md must include Phase 8W.');
assertMatches(publicNotes, /local-e2e-verification\.md|local E2E setup/i, 'public release notes must link to or mention local E2E setup docs.');
assertMatches(demoScript, /local-e2e-verification\.md|E2E verification/i, 'demo script must link to or reference E2E verification.');
assertIncludes(workflow, 'node scripts/validate-local-e2e-verification-docs.js', 'CI workflow must run validate-local-e2e-verification-docs.');

[
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
assertIncludes(workflow, 'npm run test:e2e:smoke', 'CI workflow must preserve existing E2E smoke command.');
assertIncludes(workflow, 'npm run test:e2e:onboarding', 'CI workflow must preserve onboarding E2E smoke command.');
assertIncludes(workflow, 'actions/upload-artifact@v4', 'CI workflow must preserve failure artifact upload.');
assertNotMatches(workflow, /continue-on-error:\s*true/i, 'CI workflow must not add broad continue-on-error.');

const rootVersion = pkg.version;
const lockVersion = lockRoot.version;
if (rootVersion !== lockVersion) failures.push(`package.json version (${rootVersion}) must match package-lock root version (${lockVersion}).`);
for (const kind of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
  const pkgDeps = JSON.stringify(pkg[kind] || {});
  const lockDeps = JSON.stringify(lockRoot[kind] || {});
  if (pkgDeps !== lockDeps) failures.push(`package.json ${kind} must match package-lock root metadata.`);
}

const runtimeFiles = [];
for (const top of ['src']) {
  const start = path.join(ROOT, top);
  if (!fs.existsSync(start)) continue;
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      fs.readdirSync(current).forEach(entry => stack.push(path.join(current, entry)));
    } else if (/\.(js|jsx|ts|tsx|css)$/.test(current)) {
      runtimeFiles.push(current);
    }
  }
}
for (const file of runtimeFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Phase 8W|local-e2e-verification|test:e2e:onboarding passed on local Ubuntu/i.test(text)) {
    failures.push(`runtime source file contains Phase 8W documentation marker: ${path.relative(ROOT, file)}`);
  }
}

const publicDocs = [
  ['README.md', readme],
  ['docs/local-e2e-verification.md', localGuide],
  ['docs/public-release-notes.md', publicNotes],
  ['docs/demo-script.md', demoScript],
  ['RELEASE_QA_V2.md', releaseQa]
];

function isGuardedUnsupportedClaimLine(line) {
  return /does not|do not|no |not |without|unsupported|forbidden|không|absence of|avoid claiming|avoid|only if future|future|manual-only|manual copy\/paste|separate|separately|requires actual|unless|environment-blocked|not as/i.test(line);
}

const forbiddenClaimPatterns = [
  /built-in AI generation/i,
  /external AI\/API integration/i,
  /AI API integration/i,
  /external AI\/API calls/i,
  /API key support/i,
  /BYOK support/i,
  /OCR support/i,
  /EduGen bundled/i,
  /cloud sync/i,
  /production certified|security certification|production\/security certification/i
];

publicDocs.forEach(([name, text]) => {
  text.split(/\r?\n/).forEach((line, index) => {
    forbiddenClaimPatterns.forEach(pattern => {
      if (pattern.test(line) && !isGuardedUnsupportedClaimLine(line)) {
        failures.push(`Unsupported claim appears unguarded in ${name}:${index + 1}: ${line.trim()}`);
      }
    });
  });
});

const automatedPassClaims = publicDocs
  .flatMap(([name, text]) => text.split(/\r?\n/).map((line, index) => ({ name, line, index: index + 1 })))
  .filter(({ line }) => /automated onboarding E2E passed|onboarding E2E.*PASS|test:e2e:onboarding.*PASS|3 tests passed/i.test(line));
for (const claim of automatedPassClaims) {
  if (!/local Ubuntu|after Playwright Chromium|actual successful command output|actually exits successfully|only after|future|Do not claim|Not allowed|named environment|environment-blocked|without a real passing run/i.test(claim.line)) {
    failures.push(`Automated E2E pass claim must be tied to local Ubuntu run or actual command output in ${claim.name}:${claim.index}: ${claim.line.trim()}`);
  }
}

if (failures.length) {
  console.error('validate-local-e2e-verification-docs failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-local-e2e-verification-docs passed.');
