import assert from 'node:assert/strict';

const listeners = new Map();
const postedMessages = [];

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

  postMessage(message) {
    postedMessages.push({ channel: this.name, message });
  }

  close() {
    this.listeners.clear();
  }
}

const storageData = new Map();
let getItemOverride = null;
const localStorageMock = {
  getItem(key) {
    if (typeof getItemOverride === 'function') return getItemOverride(key);
    return storageData.has(key) ? storageData.get(key) : null;
  },
  setItem(key, value) {
    storageData.set(String(key), String(value));
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
  }
};

const {
  LEARNING_STORAGE_CHANNEL_NAME,
  getLearningStorageSectionForKey,
  publishLearningStorageChanged,
  safelyCloseLearningStorageSync,
  subscribeLearningStorageChanged
} = await import('../src/state/localStorageSync.js');

const knownKeySections = {
  shimeV2StudyHistoryV1: 'studyHistory',
  shimeV2ReviewScheduleV1: 'reviewSchedule',
  shimeV2StudyPlanProgressV1: 'studyPlanProgress',
  shimeV2RecommendationFeedbackV1: 'recommendationFeedback',
  shimeV2StudyGoalV1: 'studyGoal',
  shimeV2LibraryDataV1: 'library'
};

Object.entries(knownKeySections).forEach(([key, section]) => {
  assert.equal(getLearningStorageSectionForKey(key), section, `${key} maps to ${section}`);
});
assert.equal(getLearningStorageSectionForKey('unknown-key'), '');

let callbackPayload = null;
const unsubscribe = subscribeLearningStorageChanged(payload => {
  callbackPayload = payload;
}, { sections: ['studyHistory'] });

const message = publishLearningStorageChanged({
  key: 'shimeV2StudyHistoryV1',
  section: 'studyHistory',
  reason: 'history_saved'
});

assert.equal(message.section, 'studyHistory');
assert.equal(message.key, 'shimeV2StudyHistoryV1');
assert.equal(message.reason, 'history_saved');
assert.ok(message.timestamp);
assert.ok(message.sourceId);
assert.deepEqual(callbackPayload, message);
assert.equal(postedMessages.length, 1);
assert.equal(postedMessages[0].channel, LEARNING_STORAGE_CHANNEL_NAME);
assert.equal(postedMessages[0].message.section, 'studyHistory');

const serialized = JSON.stringify(message);
assert.equal(serialized.includes('correctAnswer'), false);
assert.equal(serialized.includes('acceptableAnswers'), false);
assert.equal(serialized.includes('answerKeys'), false);
assert.equal(serialized.includes('items'), false);

callbackPayload = null;
publishLearningStorageChanged({ key: 'shimeV2ReviewScheduleV1', section: 'reviewSchedule', reason: 'schedule_saved' });
assert.equal(callbackPayload, null);

unsubscribe();

let fallbackPayload = null;
const unsubscribeFallback = subscribeLearningStorageChanged(payload => {
  fallbackPayload = payload;
}, { sections: ['library', 'studyPlanProgress'] });

window.dispatchEvent({
  type: 'storage',
  key: 'shimeV2LibraryDataV1',
  newValue: '{"schemaVersion":"v2-library-data-v1"}'
});
assert.equal(fallbackPayload?.key, 'shimeV2LibraryDataV1');
assert.equal(fallbackPayload?.section, 'library');
assert.equal(fallbackPayload?.sourceId, 'storage-event');

fallbackPayload = null;
window.dispatchEvent({
  type: 'storage',
  key: 'shimeV2StudyPlanProgressV1',
  newValue: '{"schemaVersion":"v2-study-plan-progress-v1","days":[]}'
});
assert.equal(fallbackPayload?.section, 'studyPlanProgress');

fallbackPayload = null;
window.dispatchEvent({ type: 'storage', key: 'unknown-storage-key', newValue: '{}' });
assert.equal(fallbackPayload, null);
unsubscribeFallback();
safelyCloseLearningStorageSync();

const {
  STUDY_PLAN_PROGRESS_SCHEMA_VERSION,
  STUDY_PLAN_PROGRESS_STORAGE_KEY,
  resetStudyPlanProgressForDate
} = await import('../src/state/studyPlanProgressStorage.js');

function makeEnvelope(days) {
  return JSON.stringify({
    schemaVersion: STUDY_PLAN_PROGRESS_SCHEMA_VERSION,
    updatedAt: '2026-05-05T00:00:00.000Z',
    days
  });
}

const targetDay = {
  dateKey: '2026-05-05',
  completedStepIds: ['today-step'],
  dismissedStepIds: [],
  activeStepId: 'today-step',
  updatedAt: '2026-05-05T01:00:00.000Z'
};
const unrelatedLatestDay = {
  dateKey: '2026-05-04',
  completedStepIds: ['yesterday-step'],
  dismissedStepIds: ['later-step'],
  activeStepId: '',
  updatedAt: '2026-05-05T01:01:00.000Z'
};

let readCount = 0;
getItemOverride = key => {
  if (key !== STUDY_PLAN_PROGRESS_STORAGE_KEY) return storageData.get(key) || null;
  readCount += 1;
  if (readCount === 1) return makeEnvelope([targetDay]);
  return makeEnvelope([targetDay, unrelatedLatestDay]);
};

const resetResult = resetStudyPlanProgressForDate('2026-05-05');
getItemOverride = null;
assert.equal(resetResult.ok, true);
assert.ok(readCount >= 2, 'reset re-reads latest storage before writing');
const written = JSON.parse(storageData.get(STUDY_PLAN_PROGRESS_STORAGE_KEY));
assert.deepEqual(written.days.map(day => day.dateKey), ['2026-05-04']);
assert.deepEqual(written.days[0].completedStepIds, ['yesterday-step']);
assert.deepEqual(written.days[0].dismissedStepIds, ['later-step']);
assert.equal(written.days.some(day => day.dateKey === '2026-05-05'), false);

console.log('storage sync validator passed');
