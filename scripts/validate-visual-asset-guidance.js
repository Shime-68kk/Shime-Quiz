import fs from 'fs';
import path from 'path';

const root = process.cwd();
const expectedVersion = '2.0.0-beta-ai.1';

const fail = (message) => {
  console.error(`validate-visual-asset-guidance: ${message}`);
  process.exit(1);
};

const readRequired = (relativePath) => {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) fail(`${relativePath} is missing`);
  return fs.readFileSync(fullPath, 'utf8');
};

const assertIncludes = (content, needle, label) => {
  if (!content.toLowerCase().includes(needle.toLowerCase())) {
    fail(`${label} must include "${needle}"`);
  }
};

const assertMatches = (content, regex, label) => {
  if (!regex.test(content)) fail(label);
};

const packageJson = JSON.parse(readRequired('package.json'));
if (packageJson.version !== expectedVersion) {
  fail(`package version changed from expected ${expectedVersion}`);
}

const visualGuidance = readRequired('docs/visual-asset-guidance.md');
const readme = readRequired('README.md');
const screenshotChecklist = readRequired('docs/screenshot-checklist.md');
const demoScript = readRequired('docs/demo-script.md');
const publicNotes = readRequired('docs/public-release-notes.md');
const releaseQa = readRequired('RELEASE_QA_V2.md');

assertIncludes(readme, 'docs/visual-asset-guidance.md', 'README.md');
assertIncludes(readme, 'docs/screenshot-checklist.md', 'README.md');
assertIncludes(readme, 'docs/demo-samples/README.md', 'README.md');
assertIncludes(screenshotChecklist, 'docs/visual-asset-guidance.md', 'docs/screenshot-checklist.md');
assertIncludes(demoScript, 'docs/visual-asset-guidance.md', 'docs/demo-script.md');
assertIncludes(publicNotes, 'docs/visual-asset-guidance.md', 'docs/public-release-notes.md');
assertMatches(releaseQa, /Phase 8M/i, 'RELEASE_QA_V2.md must include Phase 8M');

for (const filename of [
  'dashboard-overview.png',
  'library-import-panel.png',
  'text-markdown-import-preview.png',
  'quiz-draft-quality-review.png',
  'study-room.png',
  'manual-ai-prompt-export.png',
  'manual-ai-output-review.png',
  'edugen-document-import-surface.png'
]) {
  assertIncludes(visualGuidance, filename, 'docs/visual-asset-guidance.md');
}

assertMatches(visualGuidance, /alt text/i, 'visual asset guidance must mention recommended alt text');
assertIncludes(visualGuidance, 'docs/assets/screenshots/', 'docs/visual-asset-guidance.md');
assertIncludes(visualGuidance, 'docs/demo-samples/README.md', 'docs/visual-asset-guidance.md');
assertMatches(visualGuidance, /built-in AI|external AI APIs|API key|BYOK|OCR|backend|cloud sync/i, 'visual asset guidance must warn against implying unsupported AI/API/OCR/cloud/backend features');
assertMatches(visualGuidance, /EduGen.*separate|separate.*EduGen|not bundled into Shime/is, 'visual asset guidance must state EduGen is separate for document import');
assertMatches(visualGuidance, /does not add screenshot image assets|does not add screenshot|Do not reference screenshot files until|not committed as image files/is, 'visual asset guidance must state this phase does not add screenshot assets');

const screenshotsDir = path.join(root, 'docs/assets/screenshots');
const imageAssetsExist = fs.existsSync(screenshotsDir) && fs.readdirSync(screenshotsDir).some((entry) => /\.(png|jpe?g|webp|gif|svg)$/i.test(entry));

const visualClaimDocs = [
  ['README.md', readme],
  ['docs/public-release-notes.md', publicNotes],
  ['docs/screenshot-checklist.md', screenshotChecklist],
  ['docs/demo-script.md', demoScript],
  ['docs/visual-asset-guidance.md', visualGuidance]
];

if (!imageAssetsExist) {
  const screenshotExistClaims = [
    /!\[[^\]]*\]\([^)]+\)/,
    /screenshots? (?:are|is) (?:available|included|shown|embedded|committed|added)/i,
    /see the screenshots? below/i,
    /the following screenshots? show/i
  ];
  for (const [file, content] of visualClaimDocs) {
    content.split(/\r?\n/).forEach((line, index) => {
      for (const pattern of screenshotExistClaims) {
        if (pattern.test(line) && !/not|until|future|guidance|checklist|capture/i.test(line)) {
          fail(`${file}:${index + 1} claims screenshot assets exist even though no screenshot image files were added`);
        }
      }
    });
  }
}

const guardedContext = /(unsupported|not supported|do not claim|do not say|do not say:|do not imply|do not publish|should not|avoid|does not|does not include|does not provide|does not call|no\s+|not a|without claiming|without implying|without requiring|is not bundled|not bundled|separate|separately|requires|manual|only|guardrail|caveat|current release candidate does not include|does shime include)|không/i;
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
  { label: 'production certification', pattern: /production certification/i },
  { label: 'security certification', pattern: /security certification|security certified|security-certified/i }
];

for (const [file, content] of visualClaimDocs) {
  content.split(/\r?\n/).forEach((line, index) => {
    for (const claim of misleadingClaims) {
      if (claim.pattern.test(line) && !guardedContext.test(line)) {
        fail(`${file}:${index + 1} contains misleading claim without unsupported/forbidden context: ${claim.label}`);
      }
    }
  });
}

console.log(JSON.stringify({
  imageAssetsExist,
  checkedFiles: visualClaimDocs.map(([file]) => file)
}, null, 2));
console.log('validate-visual-asset-guidance: PASS');
