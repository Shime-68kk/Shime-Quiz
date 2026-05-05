const { parseTextQuizDraft } = await import('../src/data/textQuizParser.js');
const { validateLearningDataImport, parseLearningDataJson } = await import('../src/data/importValidator.js');
const { parseCsvImport } = await import('../src/data/csvImportParser.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertCanImport(result, label) {
  assert(result.validation.canImport, `${label} should be importable: ${JSON.stringify(result.validation.errors)}`);
  assert(validateLearningDataImport(result.rawData).canImport, `${label} rawData should pass importValidator`);
}


function assertNoDefaultContainers(result, label) {
  assert(!result.rawData.subjects.some(subject => subject.title === 'Nội dung đã dán'), `${label} should not emit unused default subject`);
  assert(!result.rawData.topics.some(topic => topic.title === 'Tổng quan'), `${label} should not emit unused default topic`);
}

function assertNoUnusedContainers(result, label) {
  const itemTopicIds = new Set(result.rawData.items.map(item => item.topicId));
  const itemSubjectIds = new Set(result.rawData.items.map(item => item.subjectId));
  const topicSubjectIds = new Set(result.rawData.topics.map(topic => topic.subjectId));
  result.rawData.topics.forEach(topic => {
    assert(itemTopicIds.has(topic.id), `${label} should not emit unused topic ${topic.title}`);
  });
  result.rawData.subjects.forEach(subject => {
    assert(itemSubjectIds.has(subject.id) || topicSubjectIds.has(subject.id), `${label} should not emit unused subject ${subject.title}`);
  });
}

const multipleChoiceText = `Môn: Mạng máy tính
Chủ đề: OSI

Câu hỏi: Application layer thuộc mô hình nào?
A. OSI
B. TCP/IP
C. HTTP
D. DNS
Đáp án: A
Giải thích: Application là tầng trong mô hình OSI.`;
const mcq = parseTextQuizDraft(multipleChoiceText);
assertCanImport(mcq, 'multiple choice text');
assert(mcq.rawData.items.length === 1, 'multiple choice text should produce one item');
assert(mcq.rawData.items[0].type === 'multiple_choice', 'multiple choice item type expected');
assert(mcq.rawData.items[0].correctAnswer === 'A', 'letter answer should map to choice id');

assert(mcq.rawData.subjects.length === 1, 'explicit subject/topic input should emit only one subject');
assert(mcq.rawData.subjects[0].title === 'Mạng máy tính', 'explicit subject should be preserved');
assert(mcq.rawData.topics.length === 1, 'explicit subject/topic input should emit only one topic');
assert(mcq.rawData.topics[0].title === 'OSI', 'explicit topic should be preserved');
assertNoDefaultContainers(mcq, 'explicit subject/topic input');
assertNoUnusedContainers(mcq, 'explicit subject/topic input');

const explicitBiologyText = `Môn: Sinh học
Chủ đề: Tế bào

Câu hỏi: Ribosome có chức năng gì?
A. Tổng hợp protein
B. Tạo ATP
C. Lưu trữ DNA
D. Phân giải glucose
Đáp án: A`;
const explicitBiology = parseTextQuizDraft(explicitBiologyText);
assertCanImport(explicitBiology, 'explicit biology subject/topic text');
assert(explicitBiology.rawData.subjects.length === 1, 'explicit biology input should not include default subject');
assert(explicitBiology.rawData.subjects[0].title === 'Sinh học', 'biology subject should be the only subject');
assert(explicitBiology.rawData.topics.length === 1, 'explicit biology input should not include default topic');
assert(explicitBiology.rawData.topics[0].title === 'Tế bào', 'biology topic should be the only topic');
assertNoDefaultContainers(explicitBiology, 'explicit biology input');
assertNoUnusedContainers(explicitBiology, 'explicit biology input');

const flashcardText = `Môn: Mạng máy tính
Chủ đề: Địa chỉ IP

Flashcard:
Mặt trước: Private IP 10.0.0.0/8 là gì?
Mặt sau: Một dải địa chỉ IPv4 private.`;
const flashcard = parseTextQuizDraft(flashcardText);
assertCanImport(flashcard, 'flashcard text');
assert(flashcard.rawData.items[0].type === 'flashcard', 'flashcard item type expected');

const shortAnswerText = `Môn: Mạng máy tính
Chủ đề: Transport

Câu hỏi ngắn: TCP hoạt động ở tầng nào?
Đáp án: Transport`;
const shortAnswer = parseTextQuizDraft(shortAnswerText);
assertCanImport(shortAnswer, 'short answer text');
assert(shortAnswer.rawData.items[0].type === 'short_answer', 'short answer item type expected');

const markdownText = `# Mạng máy tính
## OSI
- Application layer là tầng 7.
- TCP hoạt động ở tầng Transport.`;
const markdown = parseTextQuizDraft(markdownText);
assertCanImport(markdown, 'markdown heading text');
assert(markdown.rawData.subjects.some(subject => subject.title === 'Mạng máy tính'), 'markdown h1 should create subject');
assert(markdown.rawData.topics.some(topic => topic.title === 'OSI'), 'markdown h2 should create topic');
assert(markdown.rawData.items.length === 2, 'markdown facts should create draft short-answer items');
assert(markdown.validation.warnings.some(warning => warning.code === 'text_fact_draft_review_required'), 'markdown facts should warn that review is required');

assert(markdown.rawData.subjects.length === 1, 'markdown headings should emit one subject');
assert(markdown.rawData.topics.length === 1, 'markdown headings should emit one topic');
assertNoDefaultContainers(markdown, 'markdown heading input');
assertNoUnusedContainers(markdown, 'markdown heading input');

const noContextText = `Câu hỏi: HTTP là viết tắt của gì?
A. HyperText Transfer Protocol
B. High Text Transfer Process
Đáp án: A`;
const noContext = parseTextQuizDraft(noContextText);
assertCanImport(noContext, 'valid question without subject/topic context');
assert(noContext.rawData.subjects.some(subject => subject.title === 'Nội dung đã dán'), 'default subject should be created when valid item has no context');
assert(noContext.rawData.topics.some(topic => topic.title === 'Tổng quan'), 'default topic should be created when valid item has no context');
assertNoUnusedContainers(noContext, 'default context input');

const unusedContextText = `Môn: Sinh học
Chủ đề: Di truyền
Chủ đề: Tế bào

Câu hỏi: Ribosome có chức năng gì?
A. Tổng hợp protein
B. Tạo ATP
Đáp án: A`;
const prunedContext = parseTextQuizDraft(unusedContextText);
assertCanImport(prunedContext, 'unused topic pruning text');
assert(prunedContext.rawData.topics.length === 1, 'unused explicit topic should be pruned');
assert(prunedContext.rawData.topics[0].title === 'Tế bào', 'used explicit topic should remain');
assertNoUnusedContainers(prunedContext, 'unused topic pruning text');

const unstructured = parseTextQuizDraft('Đây là một đoạn ghi chú tự do chưa có câu hỏi hoặc đáp án rõ ràng.');
assert(!unstructured.validation.canImport, 'unstructured text should not be importable');
assert(unstructured.validation.warnings.some(warning => warning.code === 'text_no_clear_questions'), 'unstructured text should return a clear warning');

const jsonFixture = {
  subjects: [{ id: 's1', title: 'Mạng máy tính' }],
  topics: [{ id: 't1', subjectId: 's1', title: 'OSI' }],
  items: [{
    id: 'i1',
    type: 'multiple_choice',
    subjectId: 's1',
    topicId: 't1',
    prompt: 'Application layer thuộc mô hình nào?',
    choices: [{ id: 'A', text: 'OSI' }, { id: 'B', text: 'TCP/IP' }],
    correctAnswer: 'A'
  }]
};
const jsonResult = parseLearningDataJson(JSON.stringify(jsonFixture));
assert(jsonResult.validation.canImport, 'existing JSON import should remain valid');

const csvText = `subject,topic,type,prompt,choices,correctAnswer
Mạng máy tính,OSI,multiple_choice,Application layer thuộc mô hình nào?,OSI|TCP/IP,OSI`;
const csvResult = parseCsvImport(csvText);
assert(csvResult.validation.canImport, 'CSV compatibility should remain valid');

console.log(JSON.stringify({
  textQuizParser: {
    multipleChoiceItems: mcq.rawData.items.length,
    flashcardItems: flashcard.rawData.items.length,
    shortAnswerItems: shortAnswer.rawData.items.length,
    markdownItems: markdown.rawData.items.length,
    unstructuredWarnings: unstructured.validation.warnings.length
  },
  existingImports: {
    jsonValid: jsonResult.validation.canImport,
    csvValid: csvResult.validation.canImport
  }
}, null, 2));
