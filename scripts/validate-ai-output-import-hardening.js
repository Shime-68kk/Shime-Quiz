import fs from 'node:fs';
import path from 'node:path';
import { reviewManualAiOutputText } from '../src/data/aiOutputReview.js';
import { parseTextQuizDraft } from '../src/data/textQuizParser.js';
import { reviewQuizDraftQuality } from '../src/data/quizDraftQuality.js';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function codes(review) {
  return new Set((review.warnings || []).map(warning => warning.code));
}

function assertHasCode(review, code, label) {
  assert(codes(review).has(code), `${label} should include ${code}`);
}

const helperPath = 'src/data/aiOutputReview.js';
const libraryPath = 'src/routes/Library.jsx';
const docsPath = 'docs/manual-ai-output-import-hardening.md';
const releaseQaPath = 'RELEASE_QA_V2.md';
const workflowPath = '.github/workflows/e2e-smoke.yml';

for (const file of [helperPath, libraryPath, docsPath, releaseQaPath, workflowPath]) {
  assert(exists(file), `${file} must exist`);
}

const goodOutput = `Môn: Mạng máy tính
Chủ đề: Mô hình OSI

Câu hỏi: Tầng Application trong mô hình OSI có vai trò gì?
A. Cung cấp dịch vụ mạng cho ứng dụng
B. Định tuyến gói tin giữa các mạng
C. Kiểm soát truy cập đường truyền vật lý
D. Mã hóa tín hiệu điện
Đáp án: A
Giải thích: Theo nguồn, tầng Application cung cấp dịch vụ mạng cho ứng dụng.

Flashcard:
Mặt trước: TCP hoạt động ở tầng nào?
Mặt sau: Tầng Transport.

Câu hỏi ngắn: Tầng nào cung cấp dịch vụ mạng cho ứng dụng?
Đáp án: Application`;

const goodReview = reviewManualAiOutputText(goodOutput);
assert(goodReview.summary.warningCount === 0, 'Good Shime-friendly output should have no AI format warnings');

const parsedGood = parseTextQuizDraft(goodOutput);
assert(parsedGood.validation.canImport, 'Good AI-like output should remain parseable/importable');
assert(parsedGood.rawData.items.length >= 3, 'Good AI-like output should produce multiple draft items');
const qualityReview = reviewQuizDraftQuality(parsedGood.rawData);
assert(Array.isArray(qualityReview.warnings), 'Quality review should run on parsed AI-like output');

const jsonLike = reviewManualAiOutputText(`{"questions":[{"question":"TCP ở tầng nào?","answer":"Transport"}]}`);
assertHasCode(jsonLike, 'ai_output_json_like', 'JSON-like output');
assertHasCode(jsonLike, 'ai_output_missing_subject', 'JSON-like output');
assertHasCode(jsonLike, 'ai_output_low_parse_signal', 'JSON-like output');

const commentary = reviewManualAiOutputText(`Dưới đây là bộ câu hỏi tôi tạo cho bạn:\n\n${goodOutput}\n\nHy vọng bộ câu hỏi này hữu ích!`);
assertHasCode(commentary, 'ai_output_has_extra_commentary', 'Extra commentary output');

const missingAnswer = reviewManualAiOutputText(`Môn: Sinh học
Chủ đề: Tế bào

Câu hỏi: Ribosome có chức năng gì?
A. Tổng hợp protein
B. Tạo ATP
C. Lưu trữ DNA
D. Phân giải glucose`);
assertHasCode(missingAnswer, 'ai_output_missing_answer_markers', 'Missing answer output');

const missingChoices = reviewManualAiOutputText(`Môn: Sinh học
Chủ đề: Tế bào

Câu hỏi: Ribosome có chức năng gì?
Đáp án: Tổng hợp protein`);
assertHasCode(missingChoices, 'ai_output_missing_choice_labels', 'Missing choice labels output');

const tableOutput = reviewManualAiOutputText(`Môn: Mạng máy tính
Chủ đề: OSI

| Câu hỏi | Đáp án |
|---|---|
| TCP ở tầng nào? | Transport |`);
assertHasCode(tableOutput, 'ai_output_markdown_table', 'Markdown table output');

const emptyOutput = reviewManualAiOutputText('');
assertHasCode(emptyOutput, 'ai_output_empty', 'Empty output');
assert(emptyOutput.summary.canProceed, 'AI output review should remain advisory');

const helper = read(helperPath);
const library = read(libraryPath);
const docs = read(docsPath);
const releaseQa = read(releaseQaPath);
const workflow = read(workflowPath);
const combined = `${helper}\n${library}\n${docs}\n${releaseQa}`;

const requiredUiPhrases = [
  'Kiểm tra kết quả AI thủ công',
  'Shime không tự gọi AI',
  'Nếu AI trả JSON hoặc thêm lời bình',
  'Bạn vẫn cần tự kiểm chứng nội dung'
];
for (const phrase of requiredUiPhrases) {
  assert(library.includes(phrase), `Library UI must include Vietnamese phrase: ${phrase}`);
}

const requiredDocPhrases = [
  'does not add built-in AI quiz generation',
  'Good Shime-friendly AI output',
  'Bad output: JSON',
  'Bad output: extra commentary',
  'Bad output: missing answers',
  'AI hallucinated',
  'external AI tool'
];
for (const phrase of requiredDocPhrases) {
  assert(docs.includes(phrase), `${docsPath} must include: ${phrase}`);
}

assert(releaseQa.includes('Phase 8C'), 'RELEASE_QA_V2.md must mention Phase 8C');
assert(releaseQa.includes('does not add built-in AI generation'), 'RELEASE_QA_V2.md must avoid built-in AI generation claim');
assert(releaseQa.includes('does not guarantee AI correctness'), 'RELEASE_QA_V2.md must warn that AI output is not guaranteed correct');
assert(workflow.includes('node scripts/validate-ai-output-import-hardening.js'), 'CI workflow must run validate-ai-output-import-hardening');

const forbiddenRuntimeSignals = [
  'openai.chat.completions.create',
  'new OpenAI(',
  'fetch("https://api.openai.com',
  "fetch('https://api.openai.com",
  'VITE_OPENAI_API_KEY',
  'OPENAI_API_KEY=',
  'generateAiQuiz',
  'Tạo quiz bằng AI ngay'
];
for (const signal of forbiddenRuntimeSignals) {
  assert(!combined.includes(signal), `Phase 8C must not add AI/API implementation signal: ${signal}`);
}

assert(!helper.includes('fetch('), 'AI output review helper must not call fetch');
assert(!helper.includes('XMLHttpRequest'), 'AI output review helper must not use XMLHttpRequest');
assert(!library.includes('autoImportAi'), 'Library must not auto-import AI result');

console.log('[validate-ai-output-import-hardening] PASS');
