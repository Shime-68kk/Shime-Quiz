import fs from 'node:fs';
import path from 'node:path';
import { reviewManualAiOutputText } from '../src/data/aiOutputReview.js';
import { parseTextQuizDraft } from '../src/data/textQuizParser.js';
import { validateLearningDataImport } from '../src/data/importValidator.js';
import { reviewQuizDraftQuality } from '../src/data/quizDraftQuality.js';

const root = process.cwd();
const fixtureDir = path.join(root, 'test/fixtures/ai-draft-evaluation');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fixture(name) {
  const filePath = path.join(fixtureDir, name);
  assert(fs.existsSync(filePath), `Missing AI draft evaluation fixture: ${name}`);
  return fs.readFileSync(filePath, 'utf8');
}

function warningCodes(review) {
  return new Set((review?.warnings || []).map((warning) => warning.code));
}

function qualityCodes(review) {
  return new Set((review?.warnings || []).map((warning) => warning.code));
}

function assertHasCode(review, code, label) {
  assert(warningCodes(review).has(code), `${label} should include ${code}`);
}

function assertHasQualityCode(review, code, label) {
  assert(qualityCodes(review).has(code), `${label} should include quality warning ${code}`);
}

const expectedFixtures = [
  'good-shime-friendly-output.md',
  'bad-json-output.txt',
  'bad-extra-commentary-output.md',
  'bad-missing-answer-output.md',
  'bad-missing-choice-labels-output.md',
  'bad-markdown-table-output.md',
  'bad-duplicate-choice-output.md',
  'suspicious-hallucination-risk-output.md'
];

for (const name of expectedFixtures) {
  fixture(name);
}

const goodText = fixture('good-shime-friendly-output.md');
const goodReview = reviewManualAiOutputText(goodText);
assert(goodReview.summary.errorCount === 0, 'Good fixture should not produce AI output review errors');
assert(!warningCodes(goodReview).has('ai_output_json_like'), 'Good fixture should not look JSON-like');
assert(!warningCodes(goodReview).has('ai_output_has_extra_commentary'), 'Good fixture should not include extra commentary warning');
assert(!warningCodes(goodReview).has('ai_output_missing_answer_markers'), 'Good fixture should include answer markers');
assert(!warningCodes(goodReview).has('ai_output_missing_choice_labels'), 'Good fixture should include choice labels');

const parsedGood = parseTextQuizDraft(goodText);
assert(parsedGood.rawData.items.length >= 3, 'Good fixture should produce multiple draft items');
assert(parsedGood.validation.canImport, 'Good fixture should pass existing import validation');
const revalidatedGood = validateLearningDataImport(parsedGood.rawData);
assert(revalidatedGood.canImport, 'Good fixture rawData should validate through importValidator');
const goodQuality = reviewQuizDraftQuality(parsedGood.rawData);
assert(Array.isArray(goodQuality.warnings), 'Quality review should run for good fixture');

const jsonReview = reviewManualAiOutputText(fixture('bad-json-output.txt'));
assertHasCode(jsonReview, 'ai_output_json_like', 'JSON-like fixture');
assertHasCode(jsonReview, 'ai_output_low_parse_signal', 'JSON-like fixture');

const commentaryReview = reviewManualAiOutputText(fixture('bad-extra-commentary-output.md'));
assertHasCode(commentaryReview, 'ai_output_has_extra_commentary', 'Extra commentary fixture');

const missingAnswerText = fixture('bad-missing-answer-output.md');
const missingAnswerReview = reviewManualAiOutputText(missingAnswerText);
assertHasCode(missingAnswerReview, 'ai_output_missing_answer_markers', 'Missing answer fixture');
const missingAnswerParsed = parseTextQuizDraft(missingAnswerText);
assert(!missingAnswerParsed.validation.canImport, 'Missing answer fixture should not be silently importable');

const missingChoiceLabelsReview = reviewManualAiOutputText(fixture('bad-missing-choice-labels-output.md'));
assertHasCode(missingChoiceLabelsReview, 'ai_output_missing_choice_labels', 'Missing choice labels fixture');

const tableReview = reviewManualAiOutputText(fixture('bad-markdown-table-output.md'));
assertHasCode(tableReview, 'ai_output_markdown_table', 'Markdown table fixture');

const duplicateChoiceText = fixture('bad-duplicate-choice-output.md');
const duplicateChoiceParsed = parseTextQuizDraft(duplicateChoiceText);
assert(duplicateChoiceParsed.rawData.items.length >= 1, 'Duplicate choice fixture should parse at least one item');
const duplicateChoiceQuality = reviewQuizDraftQuality(duplicateChoiceParsed.rawData);
assertHasQualityCode(duplicateChoiceQuality, 'duplicate_choices', 'Duplicate choice fixture');

const duplicateChoiceIdDraft = {
  subjects: [{ id: 'subject:test', title: 'Mạng máy tính' }],
  topics: [{ id: 'topic:test', subjectId: 'subject:test', title: 'OSI' }],
  items: [{
    id: 'item:test',
    type: 'multiple_choice',
    subjectId: 'subject:test',
    topicId: 'topic:test',
    prompt: 'Tầng Application liên quan đến điều gì?',
    choices: [
      { id: 'A', text: 'Ứng dụng người dùng' },
      { id: 'a ', text: 'Dịch vụ mạng cho ứng dụng' },
      { id: 'B', text: 'Định tuyến gói tin' },
      { id: 'C', text: 'Mã hóa tín hiệu' }
    ],
    correctAnswer: 'A',
    explanation: 'Ví dụ tổng hợp để kiểm tra mã lựa chọn trùng.'
  }]
};
const duplicateIdQuality = reviewQuizDraftQuality(duplicateChoiceIdDraft);
assertHasQualityCode(duplicateIdQuality, 'duplicate_choice_ids', 'Synthetic duplicate choice id draft');

const hallucinationRiskText = fixture('suspicious-hallucination-risk-output.md');
assert(parseTextQuizDraft(hallucinationRiskText).rawData.items.length >= 1, 'Hallucination-risk fixture should parse so docs can explain factual limits');

const docsPath = 'docs/ai-draft-evaluation-fixtures.md';
const releaseQaPath = 'RELEASE_QA_V2.md';
const workflowPath = '.github/workflows/e2e-smoke.yml';
for (const file of [docsPath, releaseQaPath, workflowPath]) {
  assert(exists(file), `${file} must exist`);
}
const docs = read(docsPath);
const releaseQa = read(releaseQaPath);
const workflow = read(workflowPath);

const requiredDocPhrases = [
  'AI draft evaluation fixture suite',
  'Good output criteria',
  'Bad output categories',
  'cannot prove factual correctness',
  'cannot prove privacy behavior of external AI tools',
  'cannot guarantee no hallucination',
  'provider output must pass parser/import validation',
  'manual AI output review',
  'quiz draft quality review',
  'user preview and confirmation',
  'does not add built-in AI generation'
];
for (const phrase of requiredDocPhrases) {
  assert(docs.includes(phrase), `AI draft evaluation docs must include: ${phrase}`);
}

const releasePhrases = [
  'Phase 8E',
  'AI draft evaluation fixture suite',
  'not built-in AI generation',
  'No API calls',
  'no API keys',
  'Existing validation/quality review/preview/user-confirm-save boundaries remain'
];
for (const phrase of releasePhrases) {
  assert(releaseQa.includes(phrase), `RELEASE_QA_V2.md must include: ${phrase}`);
}

assert(workflow.includes('node scripts/validate-ai-draft-evaluation-fixtures.js'), 'CI must run validate-ai-draft-evaluation-fixtures.js');
assert(workflow.includes('node scripts/validate-ai-integration-readiness.js'), 'CI must preserve AI integration readiness validator');
assert(workflow.includes('node scripts/validate-ai-output-import-hardening.js'), 'CI must preserve AI output hardening validator');

const filesToScan = [
  docsPath,
  releaseQaPath,
  workflowPath,
  ...expectedFixtures.map(name => `test/fixtures/ai-draft-evaluation/${name}`)
];
const combined = filesToScan.map(read).join('\n');
const forbiddenSignals = [
  /fetch\s*\(\s*['"]https?:\/\//i,
  /XMLHttpRequest\s*\(/i,
  /OPENAI_API_KEY\s*=/i,
  /ANTHROPIC_API_KEY\s*=/i,
  /GEMINI_API_KEY\s*=/i,
  /from\s+['"]openai['"]/i,
  /from\s+['"]@anthropic\/sdk['"]/i,
  /chat\.completions/i,
  /autoSaveAi/i,
  /autoImportAi/i
];
for (const pattern of forbiddenSignals) {
  assert(!pattern.test(combined), `Phase 8E must not add network/API/key/auto-import signal: ${pattern}`);
}

console.log('[validate-ai-draft-evaluation-fixtures] PASS: AI draft fixtures exercise manual output review, parser/import validation, and quality review without AI/API calls.');
