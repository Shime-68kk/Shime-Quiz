const { isSupportedTextQuizFileName, parseTextQuizDraft } = await import('../src/data/textQuizParser.js');
const { validateLearningDataImport } = await import('../src/data/importValidator.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertFlatV2Shape(rawData, label) {
  assert(rawData && typeof rawData === 'object', `${label} should return an object`);
  assert(Array.isArray(rawData.subjects), `${label} should include subjects[]`);
  assert(Array.isArray(rawData.topics), `${label} should include topics[]`);
  assert(Array.isArray(rawData.items), `${label} should include items[]`);
}

function assertImportable(result, label) {
  assertFlatV2Shape(result.rawData, label);
  assert(result.validation.canImport, `${label} should be importable: ${JSON.stringify(result.validation.errors)}`);
  assert(validateLearningDataImport(result.rawData).canImport, `${label} rawData should pass importValidator`);
}

function assertNoDefaultPollution(result, label) {
  assert(!result.rawData.subjects.some(subject => subject.title === 'Nội dung đã dán'), `${label} should not emit default subject when context exists`);
  assert(!result.rawData.topics.some(topic => topic.title === 'Tổng quan'), `${label} should not emit default topic when context exists`);
}

assert(isSupportedTextQuizFileName('ghi-chu.txt'), '.txt file name should be supported');
assert(isSupportedTextQuizFileName('de-cuong.MD'), '.md file name should be supported case-insensitively');
assert(!isSupportedTextQuizFileName('de-cuong.pdf'), '.pdf file name should be rejected');
assert(!isSupportedTextQuizFileName('de-cuong.docx'), '.docx file name should be rejected');
assert(!isSupportedTextQuizFileName('de-cuong.md.zip'), 'double-extension archive should be rejected');
assert(!isSupportedTextQuizFileName('khong-co-duoi'), 'file without .txt/.md extension should be rejected');

const txtContent = `Môn: Sinh học
Chủ đề: Tế bào

Câu hỏi: Ribosome có chức năng gì?
A. Tổng hợp protein
B. Tạo ATP
C. Lưu trữ DNA
D. Phân giải glucose
Đáp án: A`;
const txtResult = parseTextQuizDraft(txtContent);
assertImportable(txtResult, '.txt sample content');
assert(txtResult.rawData.subjects.length === 1, '.txt sample should keep exactly one subject');
assert(txtResult.rawData.subjects[0].title === 'Sinh học', '.txt sample should preserve subject from file content');
assert(txtResult.rawData.topics.length === 1, '.txt sample should keep exactly one topic');
assert(txtResult.rawData.topics[0].title === 'Tế bào', '.txt sample should preserve topic from file content');
assertNoDefaultPollution(txtResult, '.txt sample content');

const mdContent = `# Mạng máy tính
## OSI

Câu hỏi ngắn: TCP hoạt động ở tầng nào?
Đáp án: Transport

Flashcard:
Mặt trước: Private IP 10.0.0.0/8 là gì?
Mặt sau: Một dải địa chỉ IPv4 private.`;
const mdResult = parseTextQuizDraft(mdContent);
assertImportable(mdResult, '.md sample content');
assert(mdResult.rawData.subjects.length === 1, '.md sample should keep exactly one subject');
assert(mdResult.rawData.subjects[0].title === 'Mạng máy tính', '.md sample should preserve Markdown h1 subject');
assert(mdResult.rawData.topics.length === 1, '.md sample should keep exactly one topic');
assert(mdResult.rawData.topics[0].title === 'OSI', '.md sample should preserve Markdown h2 topic');
assert(mdResult.rawData.items.some(item => item.type === 'short_answer'), '.md sample should produce a short-answer item');
assert(mdResult.rawData.items.some(item => item.type === 'flashcard'), '.md sample should produce a flashcard item');
assertNoDefaultPollution(mdResult, '.md sample content');

const noContext = parseTextQuizDraft(`Câu hỏi: HTTP là viết tắt của gì?
A. HyperText Transfer Protocol
B. High Text Transfer Process
Đáp án: A`);
assertImportable(noContext, 'file content without subject/topic context');
assert(noContext.rawData.subjects.some(subject => subject.title === 'Nội dung đã dán'), 'default subject may be created when valid file content has no context');
assert(noContext.rawData.topics.some(topic => topic.title === 'Tổng quan'), 'default topic may be created when valid file content has no context');

const emptyText = parseTextQuizDraft('   \n\n');
assert(!emptyText.validation.canImport, 'empty text should not be importable');
assert(emptyText.validation.errors.some(error => error.code === 'text_import_empty'), 'empty text should return a clear parser error');

console.log(JSON.stringify({
  textFileImport: {
    supportedNames: ['ghi-chu.txt', 'de-cuong.MD'],
    rejectedNames: ['de-cuong.pdf', 'de-cuong.docx', 'de-cuong.md.zip', 'khong-co-duoi'],
    txtItems: txtResult.rawData.items.length,
    mdItems: mdResult.rawData.items.length,
    emptyCanImport: emptyText.validation.canImport
  }
}, null, 2));
