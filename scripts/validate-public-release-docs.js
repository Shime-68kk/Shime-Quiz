import fs from 'fs';
import path from 'path';

const root = process.cwd();
const expectedVersion = '2.0.0-beta-ai.1';

const fail = (message) => {
  console.error(`validate-public-release-docs: ${message}`);
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
    fail(`${label} must mention "${needle}"`);
  }
};

const assertMatches = (content, regex, label) => {
  if (!regex.test(content)) {
    fail(label);
  }
};

const publicNotes = readRequired('docs/public-release-notes.md');
const deploymentNotes = readRequired('docs/deployment-readiness.md');
const readme = readRequired('README.md');
const releaseQa = readRequired('RELEASE_QA_V2.md');
const packageJson = JSON.parse(readRequired('package.json'));

if (packageJson.version !== expectedVersion) {
  fail(`package version changed from expected ${expectedVersion}`);
}

assertIncludes(readme, 'docs/public-release-notes.md', 'README.md');
assertIncludes(readme, 'docs/deployment-readiness.md', 'README.md');
assertIncludes(releaseQa, 'Phase 8I', 'RELEASE_QA_V2.md');

assertMatches(publicNotes, /Phase 8H final RC manual smoke passed/i, 'public release notes must mention Phase 8H final RC manual smoke passed');
assertMatches(publicNotes, /JSON\/CSV import/i, 'public release notes must mention JSON/CSV import');
assertMatches(publicNotes, /text\/Markdown/i, 'public release notes must mention text/Markdown import');
assertMatches(publicNotes, /\.txt`?\/`?\.md|\.txt\s*\/\s*\.md/i, 'public release notes must mention .txt/.md import');
assertMatches(publicNotes, /PDF\/DOCX\/PPTX\/ZIP.*EduGen|EduGen.*PDF\/DOCX\/PPTX\/ZIP/is, 'public release notes must mention PDF/DOCX/PPTX/ZIP via EduGen');

assertIncludes(deploymentNotes, 'VITE_FILE_PROCESSOR_URL', 'deployment readiness notes');
assertMatches(deploymentNotes, /EduGen[^\n.]{0,80}(separate|not bundled)|(?:separate|not bundled)[^\n.]{0,80}EduGen/i, 'deployment readiness notes must mention EduGen is separate / not bundled');

const publicDocs = [
  ['README.md', readme],
  ['docs/public-release-notes.md', publicNotes],
  ['docs/deployment-readiness.md', deploymentNotes],
  ['RELEASE_QA_V2.md', releaseQa],
];

const unsupportedPattern = /\b(no|not|does not|do not|without|unsupported|doesn\u2019t|doesn't|non-goals?|limitations?|forbidden|avoid|cannot|is not|are not)\b|kh\u00f4ng/i;
const misleadingClaims = [
  /built-in AI generation/i,
  /OCR support/i,
  /EduGen bundled/i,
  /API key support/i,
  /BYOK support/i,
  /cloud sync/i,
  /external AI\/API integration/i,
  /external AI APIs?/i,
  /hosted production\/security certification/i,
  /security certification/i,
];

const linesAround = (lines, index) => lines.slice(Math.max(0, index - 12), Math.min(lines.length, index + 13)).join(' ');

for (const [file, content] of publicDocs) {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const pattern of misleadingClaims) {
      if (pattern.test(line)) {
        const context = linesAround(lines, index);
        if (!unsupportedPattern.test(context)) {
          fail(`${file} includes a potentially misleading claim without unsupported/limitation context near line ${index + 1}: ${line.trim()}`);
        }
      }
    }
  });
}

console.log('validate-public-release-docs: PASS');
