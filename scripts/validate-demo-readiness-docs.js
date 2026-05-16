import fs from 'fs';
import path from 'path';

const root = process.cwd();
const expectedVersion = '2.0.0-beta-ai.1';

const fail = (message) => {
  console.error(`validate-demo-readiness-docs: ${message}`);
  process.exit(1);
};

const readRequired = (relativePath) => {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`${relativePath} is missing`);
  }
  return fs.readFileSync(fullPath, 'utf8');
};

const assertIncludes = (content, needle, label) => {
  if (!content.toLowerCase().includes(needle.toLowerCase())) {
    fail(`${label} must include "${needle}"`);
  }
};

const assertMatches = (content, regex, label) => {
  if (!regex.test(content)) {
    fail(label);
  }
};

const demo = readRequired('docs/demo-script.md');
const screenshots = readRequired('docs/screenshot-checklist.md');
const readme = readRequired('README.md');
const publicNotes = readRequired('docs/public-release-notes.md');
const releaseQa = readRequired('RELEASE_QA_V2.md');
const packageJson = JSON.parse(readRequired('package.json'));

if (packageJson.version !== expectedVersion) {
  fail(`package version changed from expected ${expectedVersion}`);
}

assertIncludes(readme, 'docs/demo-script.md', 'README.md');
assertIncludes(readme, 'docs/screenshot-checklist.md', 'README.md');
assertMatches(publicNotes, /docs\/demo-script\.md|demo-script\.md/i, 'public release notes must link to docs/demo-script.md');
assertMatches(publicNotes, /docs\/screenshot-checklist\.md|screenshot-checklist\.md/i, 'public release notes must link to docs/screenshot-checklist.md');
assertMatches(releaseQa, /Phase 8J/i, 'RELEASE_QA_V2.md must include Phase 8J');

assertMatches(demo, /does not (include|provide) built-in AI|manual AI/i, 'demo script must include honest AI positioning');
assertMatches(demo, /EduGen is not bundled|separate(?:ly)? configured EduGen|separate file processor service/i, 'demo script must include honest EduGen positioning');
assertMatches(demo, /what not to say|do not say|forbidden claims/i, 'demo script must include what-not-to-say or forbidden-claims guidance');
assertMatches(screenshots, /unsupported AI, OCR, API-key, backend, cloud|unsupported AI\/OCR\/API\/cloud|Do not publish screenshots/i, 'screenshot checklist must warn against implying unsupported AI/OCR/API/cloud features');

const guardedContext = /(unsupported|not supported|do not claim|do not say|do not describe|do not publish|avoid|without implying|without requiring|does not|does not include|do not use|no\s+|not a|without claiming|absence of|not production|not security|is not bundled|not bundled|must not imply|does shime include|not claimed|are not claimed)|không/i;
const misleadingClaims = [
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|calls external AI APIs|external AI API calls/i },
  { label: 'OCR support', pattern: /OCR support|supports OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime/i },
  { label: 'API key support', pattern: /API key support|API-key support/i },
  { label: 'BYOK support', pattern: /BYOK support/i },
  { label: 'cloud sync', pattern: /cloud sync/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|backend accounts|backend, account sync/i },
  { label: 'production certified', pattern: /production certified|production-certified/i },
  { label: 'security certification', pattern: /security certification|security certified|security-certified/i },
];

const docsForClaimGuard = [
  ['docs/demo-script.md', demo],
  ['docs/screenshot-checklist.md', screenshots],
  ['README.md', readme],
  ['docs/public-release-notes.md', publicNotes],
];

for (const [file, content] of docsForClaimGuard) {
  content.split(/\r?\n/).forEach((line, index) => {
    for (const claim of misleadingClaims) {
      if (claim.pattern.test(line) && !guardedContext.test(line)) {
        fail(`${file}:${index + 1} contains misleading claim without unsupported/forbidden context: ${claim.label}`);
      }
    }
  });
}

console.log('validate-demo-readiness-docs: PASS');
