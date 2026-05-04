const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

const { validateLearningDataImport, parseLearningDataJson } = await import('../src/data/importValidator.js');
const { parseCsvImport } = await import('../src/data/csvImportParser.js');

const validImport = Object.freeze({
  subjects: [{ id: 's1', title: 'Mạng máy tính' }],
  topics: [{ id: 't1', subjectId: 's1', title: 'OSI' }],
  items: [
    {
      id: 'mc1',
      type: 'multiple_choice',
      subjectId: 's1',
      topicId: 't1',
      prompt: 'Layer nào dùng IP?',
      choices: [{ id: 'network', text: 'Network' }, { id: 'application', text: 'Application' }],
      correctAnswer: 'network',
      explanation: 'IP thuộc Network layer.',
      difficulty: 'cơ bản'
    },
    {
      id: 'short1',
      type: 'short_answer',
      subjectId: 's1',
      topicId: 't1',
      prompt: 'TCP viết tắt của gì?',
      acceptableAnswers: ['Transmission Control Protocol']
    },
    {
      id: 'card1',
      type: 'flashcard',
      subjectId: 's1',
      topicId: 't1',
      front: 'OSI Layer 4',
      back: 'Transport'
    }
  ]
});

const validBefore = JSON.stringify(validImport);
const validResult = validateLearningDataImport(validImport);
assert(validResult.ok && validResult.canImport, 'valid v2 import should pass');
assert(validResult.normalizedData.items.length === 3, 'valid import should normalize all usable items');
assert(JSON.stringify(validImport) === validBefore, 'validator must not mutate original input');
assert(validResult.schema?.ok, 'runtime schema should pass valid import');

const malformedJson = parseLearningDataJson('{ "subjects": [');
assert(!malformedJson.ok, 'malformed JSON parse should fail safely');
assert(malformedJson.validation.errors.some(error => error.code === 'json_parse_error'), 'malformed JSON should expose json_parse_error');

const wrongTypes = validateLearningDataImport({
  subjects: [{ id: 100, title: 'Subject' }],
  topics: 'not-array',
  items: [{
    id: 'bad1',
    type: 'multiple_choice',
    subjectId: 's1',
    topicId: 't1',
    prompt: 'Bad choices type',
    choices: 'A|B',
    correctAnswer: 'A'
  }]
});
assert(!wrongTypes.canImport, 'wrong top-level/member types must be blocked');
assert(wrongTypes.errors.some(error => error.code === 'schema_invalid_type'), 'wrong types should include schema_invalid_type');

const emptyImport = validateLearningDataImport({ subjects: [], topics: [], items: [] });
assert(!emptyImport.canImport, 'empty usable import should be blocked');
assert(emptyImport.errors.some(error => error.code === 'import_no_valid_items'), 'empty import should expose import_no_valid_items');

const mismatchImport = validateLearningDataImport({
  subjects: [{ id: 's1', title: 'Subject' }],
  topics: [{ id: 't1', subjectId: 's1', title: 'Topic' }],
  items: [{
    id: 'i1',
    type: 'multiple_choice',
    subjectId: 's1',
    topicId: 't1',
    prompt: 'Question?',
    choices: ['A', 'B'],
    correctAnswer: 'C'
  }]
});
assert(!mismatchImport.canImport, 'mismatched correctAnswer should be blocked');
assert(mismatchImport.errors.some(error => error.code === 'multiple_choice_answer_mismatch'), 'mismatched answer should expose multiple_choice_answer_mismatch');

const partialInvalid = validateLearningDataImport({
  subjects: [{ id: 's1', title: 'Subject' }],
  topics: [{ id: 't1', subjectId: 's1', title: 'Topic' }],
  items: [
    {
      id: 'good1',
      type: 'short_answer',
      subjectId: 's1',
      topicId: 't1',
      prompt: 'Valid item?',
      answer: 'yes'
    },
    {
      id: 'bad1',
      type: 'short_answer',
      subjectId: 's1',
      topicId: 't1',
      prompt: 'Missing answer'
    }
  ]
});
assert(!partialInvalid.canImport, 'partial invalid imports should remain blocked in this release');
assert(partialInvalid.summary.validItems === 1, 'partial invalid import should still report usable normalized item count');
assert(partialInvalid.rejectedItems.some(item => item.path.includes('items[1]')), 'partial invalid import should report rejected item path');

const csv = [
  'subject,topic,type,prompt,choices,correctAnswer,answer',
  'Mạng máy tính,OSI,multiple_choice,Layer nào dùng IP?,Application|Network,Network,',
  'Mạng máy tính,OSI,short_answer,TCP viết tắt?,,Transmission Control Protocol,Transmission Control Protocol'
].join('\n');
const csvResult = parseCsvImport(csv);
assert(csvResult.validation.canImport, 'CSV import path should remain compatible');
assert(csvResult.validation.normalizedData.items.length === 2, 'CSV import should normalize expected items');

const cloned = cloneJson(validImport);
validateLearningDataImport(cloned);
assert(JSON.stringify(cloned) === JSON.stringify(validImport), 'plain cloned input should not be mutated');

console.log(JSON.stringify({
  validItems: validResult.normalizedData.items.length,
  malformedJsonBlocked: !malformedJson.ok,
  wrongTypesBlocked: !wrongTypes.canImport,
  emptyBlocked: !emptyImport.canImport,
  mismatchBlocked: !mismatchImport.canImport,
  partialInvalidBlocked: !partialInvalid.canImport,
  csvItems: csvResult.validation.normalizedData.items.length
}, null, 2));
