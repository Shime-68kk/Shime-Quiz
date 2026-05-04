class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(String(key), String(value));
  }
  removeItem(key) {
    this.store.delete(String(key));
  }
  clear() {
    this.store.clear();
  }
}

const listeners = new Map();
globalThis.window = {
  localStorage: new MemoryStorage(),
  dispatchEvent(event) {
    const callbacks = listeners.get(event.type) || [];
    callbacks.forEach(callback => callback(event));
  },
  addEventListener(type, callback) {
    const callbacks = listeners.get(type) || [];
    callbacks.push(callback);
    listeners.set(type, callbacks);
  },
  removeEventListener(type, callback) {
    const callbacks = listeners.get(type) || [];
    listeners.set(type, callbacks.filter(item => item !== callback));
  },
  CustomEvent: globalThis.CustomEvent
};

globalThis.localStorage = globalThis.window.localStorage;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const { validateLearningDataImport } = await import('../src/data/importValidator.js');
const { createStudyHistoryRecord, saveStudyHistoryRecord, clearStudyHistory, readStudyHistory } = await import('../src/state/studyHistoryStorage.js');
const { clearReviewSchedule, readReviewSchedule, updateReviewScheduleFromHistoryRecord } = await import('../src/state/reviewScheduleStorage.js');
const { createV2BackupPayload, restoreV2BackupPayload, V2_BACKUP_MODES } = await import('../src/state/v2BackupRestore.js');
const { computeHistoryAnalytics } = await import('../src/analytics/historyAnalytics.js');
const { computeMasteryModel } = await import('../src/analytics/masteryModel.js');

function makeLibrary() {
  return {
    subjects: [{ id: 's1', title: 'Mạng máy tính' }],
    topics: [{ id: 't1', subjectId: 's1', title: 'OSI' }],
    items: [
      {
        id: 'i1',
        type: 'multiple_choice',
        subjectId: 's1',
        topicId: 't1',
        prompt: 'Layer nào dùng IP?',
        choices: ['Application', 'Network'],
        correctAnswer: 'Network'
      },
      {
        id: 'i2',
        type: 'short_answer',
        subjectId: 's1',
        topicId: 't1',
        prompt: 'TCP viết tắt?',
        answer: 'Transmission Control Protocol'
      }
    ]
  };
}

const emptyImport = validateLearningDataImport({ subjects: [], topics: [], items: [] });
assert(!emptyImport.canImport, 'empty normalized import must be blocked');
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
assert(!mismatchImport.canImport, 'mismatched multiple_choice correctAnswer must be blocked');
assert(mismatchImport.errors.some(error => error.code === 'multiple_choice_answer_mismatch'), 'mismatched answer should expose multiple_choice_answer_mismatch');

const malformedChoices = validateLearningDataImport({
  subjects: [{ id: 's1', title: 'Subject' }],
  topics: [{ id: 't1', subjectId: 's1', title: 'Topic' }],
  items: [{
    id: 'i1',
    type: 'multiple_choice',
    subjectId: 's1',
    topicId: 't1',
    prompt: 'Question?',
    choices: ['A', '', { nope: true }, 'B'],
    correctAnswer: 'B'
  }]
});
assert(malformedChoices.canImport, 'valid choices with some malformed entries should remain importable');
assert(malformedChoices.warnings.some(warning => warning.code === 'multiple_choice_choices_malformed'), 'malformed choice warning should be present');

clearStudyHistory();
clearReviewSchedule();
const startedAt = '2026-05-01T00:00:00.000Z';
const firstRecord = createStudyHistoryRecord({
  startedAt,
  completedAt: '2026-05-01T00:05:00.000Z',
  itemSetFingerprint: 'standard:items:1:a',
  summary: {
    totalItems: 1,
    answeredCount: 1,
    correctCount: 1,
    wrongCount: 0,
    unansweredCount: 0,
    unscoredCount: 0,
    flashcardReviewedCount: 0,
    accuracy: 100,
    details: [{ id: 'i1', type: 'multiple_choice', status: 'correct', topicId: 't1', subjectId: 's1', prompt: 'Layer nào dùng IP?', userAnswer: 'Network' }]
  }
});
const secondRecord = createStudyHistoryRecord({
  startedAt: '2026-05-01T00:10:00.000Z',
  completedAt: '2026-05-01T00:15:00.000Z',
  itemSetFingerprint: 'standard:items:1:b',
  summary: {
    totalItems: 1,
    answeredCount: 1,
    correctCount: 0,
    wrongCount: 1,
    unansweredCount: 0,
    unscoredCount: 0,
    flashcardReviewedCount: 0,
    accuracy: 0,
    details: [{ id: 'i2', type: 'short_answer', status: 'wrong', topicId: 't1', subjectId: 's1', prompt: 'TCP viết tắt?', userAnswer: 'wrong' }]
  }
});
assert(saveStudyHistoryRecord(firstRecord).saved, 'first history record should save');
assert(saveStudyHistoryRecord(secondRecord).saved, 'second history record should save');
assert(readStudyHistory().records.length === 2, 'history save should preserve existing records');

const scheduleResultA = updateReviewScheduleFromHistoryRecord(firstRecord);
const scheduleResultB = updateReviewScheduleFromHistoryRecord(secondRecord);
assert(scheduleResultA.ok && scheduleResultB.ok, 'schedule updates should succeed');
assert(readReviewSchedule().records.length === 2, 'schedule update should preserve unrelated item records');

const backupResult = createV2BackupPayload({ libraryData: makeLibrary(), mode: V2_BACKUP_MODES.FULL });
assert(backupResult.ok, 'full backup payload should be created');
const restoreResult = restoreV2BackupPayload(backupResult.payload);
assert(restoreResult.ok, 'full backup restore should succeed');
assert(restoreResult.writtenSections.includes('library'), 'restore should include library section');

const largeHistory = Array.from({ length: 50 }, (_, sessionIndex) => ({
  id: `history-${sessionIndex}`,
  completedAt: new Date(Date.UTC(2026, 0, 1, 0, sessionIndex)).toISOString(),
  itemResults: Array.from({ length: 200 }, (_, itemIndex) => ({
    itemId: `item-${itemIndex}`,
    itemType: 'multiple_choice',
    status: itemIndex % 3 === 0 ? 'wrong' : 'correct',
    topicId: `topic-${itemIndex % 20}`,
    subjectId: `subject-${itemIndex % 5}`
  }))
}));
const largeItems = Array.from({ length: 1000 }, (_, index) => ({
  id: `item-${index}`,
  type: 'multiple_choice',
  prompt: `Prompt ${index}`,
  topicId: `topic-${index % 20}`,
  subjectId: `subject-${index % 5}`
}));
const start = performance.now();
const analytics = computeHistoryAnalytics(largeHistory);
const mastery = computeMasteryModel({ items: largeItems, historyRecords: largeHistory, scheduleRecords: [] });
const elapsedMs = performance.now() - start;
assert(analytics.totalSessions === 50, 'analytics should process capped history');
assert(mastery.itemMastery.length === 1000, 'mastery should process large library items');

console.log(JSON.stringify({
  importValidation: {
    emptyBlocked: !emptyImport.canImport,
    mismatchBlocked: !mismatchImport.canImport,
    malformedChoiceWarnings: malformedChoices.warnings.length
  },
  persistence: {
    historyRecords: readStudyHistory().records.length,
    scheduleRecords: readReviewSchedule().records.length
  },
  restore: {
    ok: restoreResult.ok,
    writtenSections: restoreResult.writtenSections
  },
  benchmark: {
    sessions: largeHistory.length,
    itemResults: largeHistory.length * 200,
    libraryItems: largeItems.length,
    elapsedMs: Math.round(elapsedMs)
  }
}, null, 2));
