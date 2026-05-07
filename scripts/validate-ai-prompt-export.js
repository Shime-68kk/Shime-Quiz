import fs from 'node:fs';
import path from 'node:path';
import {
  buildManualAiQuizPrompt,
  getManualAiPromptWarnings,
  normalizePromptSourceText
} from '../src/data/aiPromptBuilder.js';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const helperPath = 'src/data/aiPromptBuilder.js';
const libraryPath = 'src/routes/Library.jsx';
const docsPath = 'docs/manual-ai-prompt-workflow.md';
const releaseQaPath = 'RELEASE_QA_V2.md';
const workflowPath = '.github/workflows/e2e-smoke.yml';

for (const file of [helperPath, libraryPath, docsPath, releaseQaPath, workflowPath]) {
  assert(exists(file), `${file} must exist`);
}

const sourceText = `Mạng máy tính gồm nhiều tầng giao thức. Tầng Application cung cấp dịch vụ mạng cho ứng dụng. TCP hoạt động ở tầng Transport và hỗ trợ truyền dữ liệu tin cậy.`;
const promptResult = buildManualAiQuizPrompt({
  sourceText,
  multipleChoiceCount: 2,
  flashcardCount: 1,
  shortAnswerCount: 1,
  languageMode: 'vi'
});

assert(promptResult.ok, 'Prompt builder should return ok for valid source text');
assert(promptResult.prompt.includes('Chỉ sử dụng nội dung nguồn'), 'Prompt must instruct source-only generation');
assert(promptResult.prompt.includes('Không bịa thêm'), 'Prompt must warn against hallucination');
assert(promptResult.prompt.includes('Môn:'), 'Prompt must include Shime-friendly Môn pattern');
assert(promptResult.prompt.includes('Chủ đề:'), 'Prompt must include Shime-friendly Chủ đề pattern');
assert(promptResult.prompt.includes('Câu hỏi:'), 'Prompt must include multiple-choice pattern');
assert(promptResult.prompt.includes('A.'), 'Prompt must include A/B/C/D choice pattern');
assert(promptResult.prompt.includes('Đáp án:'), 'Prompt must include Đáp án pattern');
assert(promptResult.prompt.includes('Giải thích:'), 'Prompt must include explanation pattern');
assert(promptResult.prompt.includes('Flashcard:'), 'Prompt must include Flashcard pattern');
assert(promptResult.prompt.includes('Mặt trước:'), 'Prompt must include flashcard front pattern');
assert(promptResult.prompt.includes('Mặt sau:'), 'Prompt must include flashcard back pattern');
assert(promptResult.prompt.includes('Câu hỏi ngắn:'), 'Prompt must include short-answer pattern');
assert(promptResult.prompt.includes('Tránh đáp án nhiễu vô lý; tránh lựa chọn trùng nội dung hoặc trùng nhãn.'), 'Prompt must avoid duplicate choices/labels');
assert(promptResult.prompt.includes(sourceText), 'Prompt must include provided source text');
assert(promptResult.prompt.includes('Chỉ trả về bản nháp quiz'), 'Prompt must require only quiz draft output');

const missingSource = buildManualAiQuizPrompt({ sourceText: '', multipleChoiceCount: 1, flashcardCount: 0, shortAnswerCount: 0 });
assert(!missingSource.ok, 'Missing source text should not produce a prompt');
assert(missingSource.warnings.some(warning => warning.code === 'missing_source_text'), 'Missing source warning is required');

const noItems = buildManualAiQuizPrompt({ sourceText, multipleChoiceCount: 0, flashcardCount: 0, shortAnswerCount: 0 });
assert(!noItems.ok, 'Zero requested items should not produce a prompt');
assert(noItems.warnings.some(warning => warning.code === 'no_requested_items'), 'No requested items warning is required');

const longText = `${'A'.repeat(13000)} kết thúc`;
const normalized = normalizePromptSourceText(longText);
assert(normalized.truncated, 'Long source text should be truncated');
assert(normalized.text.length <= 12000, 'Truncated source text should respect maximum length');
assert(getManualAiPromptWarnings({ sourceText: longText, multipleChoiceCount: 1, flashcardCount: 0, shortAnswerCount: 0 }).some(warning => warning.code === 'source_truncated'), 'Truncated source warning is required');

const library = read(libraryPath);
const docs = read(docsPath);
const releaseQa = read(releaseQaPath);
const helper = read(helperPath);
const workflow = read(workflowPath);
const aiFiles = `${helper}\n${library}\n${docs}\n${releaseQa}`;

const requiredUiPhrases = [
  'Tạo prompt AI thủ công',
  'Shime không tự gửi dữ liệu cho AI',
  'Sao chép prompt',
  'Dán kết quả AI vào ô nhập văn bản/Markdown',
  'AI có thể tạo sai nội dung'
];

for (const phrase of requiredUiPhrases) {
  assert(library.includes(phrase), `Library UI must include Vietnamese phrase: ${phrase}`);
}

const requiredDocPhrases = [
  'manual prompt/export workflow only',
  'does not call AI providers',
  'does not collect API keys',
  'User manually pastes',
  'not hidden JSON',
  'Forbidden claims'
];

for (const phrase of requiredDocPhrases) {
  assert(docs.includes(phrase), `${docsPath} must include: ${phrase}`);
}

assert(releaseQa.includes('Phase 8B'), 'RELEASE_QA_V2.md must mention Phase 8B');
assert(releaseQa.includes('does not send content to AI'), 'RELEASE_QA_V2.md must say Shime does not send content to AI');
assert(releaseQa.includes('does not handle API keys'), 'RELEASE_QA_V2.md must say no API key handling');
assert(workflow.includes('node scripts/validate-ai-prompt-export.js'), 'CI workflow must run validate-ai-prompt-export');

const forbiddenRuntimeSignals = [
  'openai.chat.completions.create',
  'new OpenAI(',
  'fetch("https://api.openai.com',
  "fetch('https://api.openai.com",
  'VITE_OPENAI_API_KEY',
  'OPENAI_API_KEY=',
  'apiKey',
  'API_KEY'
];

for (const signal of forbiddenRuntimeSignals) {
  assert(!aiFiles.includes(signal), `Manual AI workflow must not add provider/API-key implementation signal: ${signal}`);
}

assert(!helper.includes('fetch('), 'Prompt builder helper must not call fetch');
assert(!helper.includes('XMLHttpRequest'), 'Prompt builder helper must not use XMLHttpRequest');
assert(!library.includes('generateAiQuiz'), 'Library must not imply working AI generation function');
assert(!library.includes('Tạo quiz bằng AI ngay'), 'Library must not claim built-in AI generation');

console.log('[validate-ai-prompt-export] PASS');
