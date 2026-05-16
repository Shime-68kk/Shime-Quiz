import fs from 'fs';
import path from 'path';

const root = process.cwd();
const expectedVersion = '2.0.0-beta-ai.1';

const fail = (message) => {
  console.error(`validate-demo-sample-pack: ${message}`);
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

const samplePaths = [
  'docs/demo-samples/README.md',
  'docs/demo-samples/shime-demo-quiz.json',
  'docs/demo-samples/shime-demo-quiz.csv',
  'docs/demo-samples/shime-demo-text-markdown.md',
  'docs/demo-samples/shime-demo-manual-ai-output.md'
];

const packageJson = JSON.parse(readRequired('package.json'));
if (packageJson.version !== expectedVersion) {
  fail(`package version changed from expected ${expectedVersion}`);
}

const sampleReadme = readRequired('docs/demo-samples/README.md');
const sampleJsonText = readRequired('docs/demo-samples/shime-demo-quiz.json');
const sampleCsvText = readRequired('docs/demo-samples/shime-demo-quiz.csv');
const sampleMarkdown = readRequired('docs/demo-samples/shime-demo-text-markdown.md');
const sampleManualAi = readRequired('docs/demo-samples/shime-demo-manual-ai-output.md');
const readme = readRequired('README.md');
const demoScript = readRequired('docs/demo-script.md');
const screenshotChecklist = readRequired('docs/screenshot-checklist.md');
const publicNotes = readRequired('docs/public-release-notes.md');
const releaseQa = readRequired('RELEASE_QA_V2.md');

samplePaths.forEach((relativePath) => readRequired(relativePath));

for (const [file, content] of [
  ['README.md', readme],
  ['docs/demo-script.md', demoScript],
  ['docs/screenshot-checklist.md', screenshotChecklist],
  ['docs/public-release-notes.md', publicNotes]
]) {
  assertIncludes(content, 'docs/demo-samples/README.md', file);
}

assertMatches(releaseQa, /Phase 8K/i, 'RELEASE_QA_V2.md must include Phase 8K');
assertIncludes(sampleReadme, 'shime-demo-quiz.json', 'demo sample README');
assertIncludes(sampleReadme, 'shime-demo-quiz.csv', 'demo sample README');
assertIncludes(sampleReadme, 'shime-demo-text-markdown.md', 'demo sample README');
assertIncludes(sampleReadme, 'shime-demo-manual-ai-output.md', 'demo sample README');
assertMatches(sampleReadme, /EduGen.*separate|separately.*EduGen|EduGen is not bundled/is, 'demo sample README must explain the separate EduGen boundary');
assertMatches(sampleReadme, /no OCR|not OCR|OCR support/is, 'demo sample README must explain that OCR is unsupported');
assertMatches(sampleManualAi, /does not call an AI API|does not provide built-in AI generation|manual output/is, 'manual AI sample must state the honest manual AI boundary');
assertMatches(sampleManualAi, /review and verify|quality review|preview|confirm-save|confirm save/is, 'manual AI sample must require user review/preview/save confirmation');

const { validateLearningDataImport, parseLearningDataJson } = await import('../src/data/importValidator.js');
const { parseCsvImport } = await import('../src/data/csvImportParser.js');
const { parseTextQuizDraft } = await import('../src/data/textQuizParser.js');
const { reviewQuizDraftQuality } = await import('../src/data/quizDraftQuality.js');

const parsedJson = parseLearningDataJson(sampleJsonText);
if (!parsedJson.ok) fail('JSON sample must parse as valid JSON');
if (!parsedJson.validation?.canImport) fail('JSON sample must pass existing import validation');
if (parsedJson.validation.normalizedData.items.length < 3) fail('JSON sample must include multiple usable items');
const jsonReview = reviewQuizDraftQuality(parsedJson.validation.normalizedData);
if (jsonReview.summary?.errorCount) fail('JSON sample should not produce quality-review errors');

const csvResult = parseCsvImport(sampleCsvText);
if (!csvResult.validation?.canImport) fail('CSV sample must pass existing CSV import validation');
if (csvResult.validation.normalizedData.items.length < 2) fail('CSV sample must include at least two usable items');

const markdownResult = parseTextQuizDraft(sampleMarkdown);
if (!markdownResult.validation?.canImport) fail('text/Markdown sample must parse and pass existing import validation');
if (markdownResult.validation.normalizedData.items.length < 3) fail('text/Markdown sample must include multiple usable items');

const manualAiResult = parseTextQuizDraft(sampleManualAi);
if (!manualAiResult.validation?.canImport) fail('manual AI output sample must parse and pass existing text import validation');
if (manualAiResult.validation.normalizedData.items.length < 3) fail('manual AI output sample must have sufficient parse signal');

const guardedContext = /(unsupported|not supported|do not claim|do not say|do not present|do not publish|does not|does not include|does not provide|does not call|no\s+|not a|without claiming|without implying|without requiring|is not bundled|not bundled|separate|separately|requires|manual|only|avoid|not OCR|not AI generation|current release candidate does not include|does Shime include)|không/i;
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
  { label: 'security certification', pattern: /security certification|security certified|security-certified/i }
];

const docsForClaimGuard = [
  ['README.md', readme],
  ['docs/demo-script.md', demoScript],
  ['docs/screenshot-checklist.md', screenshotChecklist],
  ['docs/public-release-notes.md', publicNotes],
  ['docs/demo-samples/README.md', sampleReadme],
  ['docs/demo-samples/shime-demo-text-markdown.md', sampleMarkdown],
  ['docs/demo-samples/shime-demo-manual-ai-output.md', sampleManualAi]
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

console.log(JSON.stringify({
  jsonItems: parsedJson.validation.normalizedData.items.length,
  jsonQualityErrors: jsonReview.summary?.errorCount || 0,
  csvItems: csvResult.validation.normalizedData.items.length,
  markdownItems: markdownResult.validation.normalizedData.items.length,
  manualAiItems: manualAiResult.validation.normalizedData.items.length
}, null, 2));
console.log('validate-demo-sample-pack: PASS');
