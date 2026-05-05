import assert from 'node:assert/strict';

const listeners = new Map();
const storageData = new Map();
const setItemCalls = [];
let failProbeWrites = false;
let failWriteKey = null;
let failWriteAfterSuccessfulWrites = Number.POSITIVE_INFINITY;
let successfulWriteCount = 0;

class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.listeners = new Set();
  }

  addEventListener(type, listener) {
    if (type === 'message') this.listeners.add(listener);
  }

  removeEventListener(type, listener) {
    if (type === 'message') this.listeners.delete(listener);
  }

  postMessage() {}
  close() {
    this.listeners.clear();
  }
}

const localStorageMock = {
  getItem(key) {
    return storageData.has(String(key)) ? storageData.get(String(key)) : null;
  },
  setItem(key, value) {
    const safeKey = String(key);
    setItemCalls.push(safeKey);
    if (failProbeWrites && safeKey === '__shime_v2_restore_probe__') {
      throw new Error('simulated preflight quota failure');
    }
    if (safeKey !== '__shime_v2_restore_probe__') {
      if (safeKey === failWriteKey) {
        failWriteKey = null;
        throw new Error(`simulated write failure for ${safeKey}`);
      }
      if (successfulWriteCount >= failWriteAfterSuccessfulWrites) {
        throw new Error(`simulated write failure for ${safeKey}`);
      }
      successfulWriteCount += 1;
    }
    storageData.set(safeKey, String(value));
  },
  removeItem(key) {
    storageData.delete(String(key));
  },
  clear() {
    storageData.clear();
  }
};

globalThis.CustomEvent = class CustomEvent extends Event {
  constructor(type, init = {}) {
    super(type);
    this.detail = init.detail;
  }
};

globalThis.Blob = globalThis.Blob || class Blob {
  constructor(parts = []) {
    this.size = parts.reduce((sum, part) => sum + String(part).length, 0);
  }
};

globalThis.window = {
  BroadcastChannel: MockBroadcastChannel,
  localStorage: localStorageMock,
  addEventListener(type, listener) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(listener);
  },
  removeEventListener(type, listener) {
    listeners.get(type)?.delete(listener);
  },
  dispatchEvent(event) {
    listeners.get(event.type)?.forEach(listener => listener(event));
    return true;
  },
  URL: {
    createObjectURL() {
      return 'blob:mock';
    },
    revokeObjectURL() {}
  },
  document: {
    createElement() {
      return { click() {}, remove() {}, set href(value) { this._href = value; }, set download(value) { this._download = value; } };
    },
    body: { appendChild() {} }
  }
};

globalThis.document = window.document;

const mockLearningData = (await import('../src/data/mockLearningData.js')).default;
const {
  LIBRARY_STORAGE_KEY,
  getLearningDataSnapshot,
  setLearningData
} = await import('../src/data/learningDataStore.js');
const {
  LEARNING_STORAGE_SYNC_EVENT,
  safelyCloseLearningStorageSync
} = await import('../src/state/localStorageSync.js');
const {
  RECOMMENDATION_FEEDBACK_SCHEMA_VERSION,
  RECOMMENDATION_FEEDBACK_STORAGE_KEY
} = await import('../src/state/recommendationFeedbackStorage.js');
const {
  REVIEW_SCHEDULE_SCHEMA_VERSION,
  REVIEW_SCHEDULE_STORAGE_KEY
} = await import('../src/state/reviewScheduleStorage.js');
const {
  STUDY_GOAL_SCHEMA_VERSION,
  STUDY_GOAL_STORAGE_KEY
} = await import('../src/state/studyGoalStorage.js');
const {
  STUDY_HISTORY_SCHEMA_VERSION,
  STUDY_HISTORY_STORAGE_KEY
} = await import('../src/state/studyHistoryStorage.js');
const {
  STUDY_PLAN_PROGRESS_SCHEMA_VERSION,
  STUDY_PLAN_PROGRESS_STORAGE_KEY
} = await import('../src/state/studyPlanProgressStorage.js');
const {
  V2_BACKUP_MODES,
  V2_BACKUP_SCHEMA_VERSION,
  createV2BackupPayload,
  parseV2BackupJson,
  restoreV2BackupPayload,
  validateV2BackupPayload
} = await import('../src/state/v2BackupRestore.js');

const stateKeys = [
  STUDY_HISTORY_STORAGE_KEY,
  REVIEW_SCHEDULE_STORAGE_KEY,
  RECOMMENDATION_FEEDBACK_STORAGE_KEY,
  STUDY_GOAL_STORAGE_KEY,
  STUDY_PLAN_PROGRESS_STORAGE_KEY
];
const recognizedKeys = [LIBRARY_STORAGE_KEY, ...stateKeys];

function resetHarness() {
  storageData.clear();
  setItemCalls.length = 0;
  failProbeWrites = false;
  failWriteKey = null;
  failWriteAfterSuccessfulWrites = Number.POSITIVE_INFINITY;
  successfulWriteCount = 0;
}

function makeOldLibrary() {
  return {
    subjects: [{ id: 'old-subject', title: 'Môn cũ' }],
    topics: [{ id: 'old-topic', subjectId: 'old-subject', title: 'Chủ đề cũ' }],
    items: [{
      id: 'old-item',
      type: 'flashcard',
      subjectId: 'old-subject',
      topicId: 'old-topic',
      front: 'Câu cũ',
      back: 'Đáp án cũ'
    }]
  };
}

function putExistingState() {
  storageData.set(STUDY_HISTORY_STORAGE_KEY, JSON.stringify({
    schemaVersion: STUDY_HISTORY_SCHEMA_VERSION,
    updatedAt: '2026-05-01T00:00:00.000Z',
    records: [{ id: 'old-history', startedAt: '2026-05-01T00:00:00.000Z', itemResults: [] }]
  }));
  storageData.set(REVIEW_SCHEDULE_STORAGE_KEY, JSON.stringify({
    schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
    updatedAt: '2026-05-01T00:00:00.000Z',
    records: [{ itemId: 'old-item', dueAt: '2026-05-06T00:00:00.000Z', intervalDays: 1 }]
  }));
  storageData.set(RECOMMENDATION_FEEDBACK_STORAGE_KEY, JSON.stringify({
    schemaVersion: RECOMMENDATION_FEEDBACK_SCHEMA_VERSION,
    updatedAt: '2026-05-01T00:00:00.000Z',
    records: [{ id: 'old-feedback', itemId: 'old-item', action: 'accepted', createdAt: '2026-05-01T00:00:00.000Z' }]
  }));
  storageData.set(STUDY_GOAL_STORAGE_KEY, JSON.stringify({
    schemaVersion: STUDY_GOAL_SCHEMA_VERSION,
    updatedAt: '2026-05-01T00:00:00.000Z',
    goal: { mode: 'items', targetItems: 5 }
  }));
  storageData.set(STUDY_PLAN_PROGRESS_STORAGE_KEY, JSON.stringify({
    schemaVersion: STUDY_PLAN_PROGRESS_SCHEMA_VERSION,
    updatedAt: '2026-05-01T00:00:00.000Z',
    days: [{ dateKey: '2026-05-01', completedStepIds: ['old-step'], dismissedStepIds: [], activeStepId: '' }]
  }));
}

function makeFullBackup() {
  putExistingState();
  const result = createV2BackupPayload({
    libraryData: mockLearningData,
    librarySource: { sourceType: 'mock', sourceName: 'Mock drill library' },
    librarySummary: { subjectCount: mockLearningData.subjects.length, topicCount: mockLearningData.topics.length, itemCount: mockLearningData.items.length },
    mode: V2_BACKUP_MODES.FULL
  });
  assert.equal(result.ok, true, 'full backup payload can be created');
  assert.equal(result.payload.schemaVersion, V2_BACKUP_SCHEMA_VERSION);
  assert.equal(result.payload.backupMode, V2_BACKUP_MODES.FULL);
  assert.equal(result.payload.includesAnswers, true);
  assert.ok(result.payload.data.library?.data?.items?.some(item => item.correctAnswer || item.answer || item.back), 'full backup can include answer content');
  return result.payload;
}

function snapshotKeys() {
  return Object.fromEntries(recognizedKeys.map(key => [key, storageData.has(key) ? storageData.get(key) : null]));
}

function assertSnapshotsEqual(actual, expected, message) {
  assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), message);
  Object.keys(expected).forEach(key => assert.equal(actual[key], expected[key], `${message}: ${key}`));
}

function countSyncEvents() {
  return capturedEvents.filter(event => event.type === LEARNING_STORAGE_SYNC_EVENT).length;
}

const capturedEvents = [];
window.addEventListener(LEARNING_STORAGE_SYNC_EVENT, event => capturedEvents.push({ type: event.type, detail: event.detail }));
window.addEventListener('shime-v2-study-history-updated', event => capturedEvents.push({ type: event.type, detail: event.detail }));
window.addEventListener('shime-v2-review-schedule-updated', event => capturedEvents.push({ type: event.type, detail: event.detail }));
window.addEventListener('shime-v2-recommendation-feedback-updated', event => capturedEvents.push({ type: event.type, detail: event.detail }));
window.addEventListener('shime-v2-study-goal-updated', event => capturedEvents.push({ type: event.type, detail: event.detail }));
window.addEventListener('shime-v2-study-plan-progress-updated', event => capturedEvents.push({ type: event.type, detail: event.detail }));

// Full backup can be parsed, validated, and restored.
resetHarness();
const fullPayload = makeFullBackup();
const parsedFull = parseV2BackupJson(JSON.stringify(fullPayload));
assert.equal(parsedFull.ok, true, 'full backup JSON parses and validates');
assert.equal(parsedFull.validation.restoreSupported, true);

resetHarness();
setLearningData(makeOldLibrary(), { skipStorage: true });
const successEventsBefore = countSyncEvents();
const restoreResult = restoreV2BackupPayload(fullPayload);
assert.equal(restoreResult.ok, true, 'full backup restore succeeds');
recognizedKeys.forEach(key => assert.ok(storageData.has(key), `${key} written on successful restore`));
assert.notEqual(getLearningDataSnapshot().items[0].id, 'old-item', 'in-memory library updates after successful storage writes');
assert.ok(countSyncEvents() > successEventsBefore, 'restore publishes storage sync only after success');
const restoreSyncEvents = capturedEvents.filter(event => event.type === LEARNING_STORAGE_SYNC_EVENT).slice(successEventsBefore);
restoreSyncEvents.forEach(event => {
  const serialized = JSON.stringify(event.detail);
  assert.equal(serialized.includes('correctAnswer'), false, 'sync event does not include answer fields');
  assert.equal(serialized.includes('acceptableAnswers'), false, 'sync event does not include answer fields');
  assert.equal(serialized.includes('items'), false, 'sync event does not include library items');
  assert.ok(event.detail.section, 'sync event contains section metadata');
});

// Redacted and progress-only backups remain non-restorable.
resetHarness();
const redacted = createV2BackupPayload({ libraryData: mockLearningData, mode: V2_BACKUP_MODES.REDACTED_LIBRARY });
assert.equal(redacted.ok, true);
assert.equal(redacted.payload.includesAnswers, false);
assert.equal(JSON.stringify(redacted.payload.data.library).includes('correctAnswer'), false, 'redacted backup removes correctAnswer');
assert.equal(JSON.stringify(redacted.payload.data.library).includes('acceptableAnswers'), false, 'redacted backup removes acceptableAnswers');
const redactedValidation = validateV2BackupPayload(redacted.payload);
assert.equal(redactedValidation.restoreSupported, false, 'redacted restore is blocked');
assert.equal(restoreV2BackupPayload(redacted.payload).error, 'unsupported_backup_mode');

const progressOnly = createV2BackupPayload({ libraryData: mockLearningData, mode: V2_BACKUP_MODES.PROGRESS_ONLY });
assert.equal(progressOnly.ok, true);
assert.equal(progressOnly.payload.data.library, undefined, 'progress-only backup excludes library content');
assert.equal(validateV2BackupPayload(progressOnly.payload).restoreSupported, false, 'progress-only restore is blocked');
assert.equal(restoreV2BackupPayload(progressOnly.payload).error, 'unsupported_backup_mode');

// Malformed and missing-section backups are rejected safely.
const malformed = parseV2BackupJson('{ invalid json');
assert.equal(malformed.ok, false, 'malformed JSON is rejected');
assert.equal(malformed.error, 'json_parse_failed');
const missingLibrary = structuredClone(fullPayload);
delete missingLibrary.data.library;
const missingResult = restoreV2BackupPayload(missingLibrary);
assert.equal(missingResult.ok, false, 'missing required full-backup library blocks restore');
assert.equal(missingResult.error, 'validation_failed');

// Preflight failure prevents partial writes and sync events.
resetHarness();
putExistingState();
storageData.set(LIBRARY_STORAGE_KEY, JSON.stringify({ schemaVersion: 'v2-library-data-v1', data: makeOldLibrary() }));
const beforePreflight = snapshotKeys();
const eventsBeforePreflight = countSyncEvents();
failProbeWrites = true;
const preflightResult = restoreV2BackupPayload(fullPayload);
assert.equal(preflightResult.ok, false);
assert.equal(preflightResult.error, 'storage_preflight_failed');
assertSnapshotsEqual(snapshotKeys(), beforePreflight, 'preflight failure leaves recognized keys unchanged');
assert.equal(countSyncEvents(), eventsBeforePreflight, 'preflight failure emits no sync event');

// Mid-restore failure rolls recognized keys back and leaves in-memory library unchanged.
resetHarness();
putExistingState();
storageData.set(LIBRARY_STORAGE_KEY, JSON.stringify({ schemaVersion: 'v2-library-data-v1', data: makeOldLibrary() }));
setLearningData(makeOldLibrary(), { skipStorage: true });
const beforeMidWrite = snapshotKeys();
const oldSnapshotItemId = getLearningDataSnapshot().items[0].id;
const eventsBeforeMidWrite = countSyncEvents();
failWriteKey = REVIEW_SCHEDULE_STORAGE_KEY;
const midWriteResult = restoreV2BackupPayload(fullPayload);
assert.equal(midWriteResult.ok, false, 'mid-restore write failure is reported');
assert.equal(midWriteResult.error, 'restore_write_failed');
assert.equal(midWriteResult.rollbackOk, true, 'rollback succeeds in mock storage');
assertSnapshotsEqual(snapshotKeys(), beforeMidWrite, 'mid-restore failure rolls recognized keys back');
assert.equal(getLearningDataSnapshot().items[0].id, oldSnapshotItemId, 'in-memory library not applied before successful storage writes');
assert.equal(countSyncEvents(), eventsBeforeMidWrite, 'failed restore emits no storage sync event');

// Successful restore does not change the backup schema marker.
assert.equal(fullPayload.schemaVersion, V2_BACKUP_SCHEMA_VERSION);
assert.equal(createV2BackupPayload({ libraryData: mockLearningData, mode: V2_BACKUP_MODES.FULL }).payload.schemaVersion, V2_BACKUP_SCHEMA_VERSION);

safelyCloseLearningStorageSync();
console.log('backup restore recovery validator passed');
