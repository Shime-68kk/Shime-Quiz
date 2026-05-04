export const LEARNING_STORAGE_SYNC_EVENT = 'shime-v2-learning-storage-sync';
export const LEARNING_STORAGE_CHANNEL_NAME = 'shime-v2-learning-storage-sync';

export const LEARNING_STORAGE_KEY_SECTIONS = {
  shimeV2StudyHistoryV1: 'studyHistory',
  shimeV2ReviewScheduleV1: 'reviewSchedule',
  shimeV2StudyPlanProgressV1: 'studyPlanProgress',
  shimeV2RecommendationFeedbackV1: 'recommendationFeedback',
  shimeV2StudyGoalV1: 'studyGoal',
  shimeV2LibraryDataV1: 'library'
};

const learningStorageSourceId = `tab-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
let sharedChannel = null;

export function getLearningStorageSourceId() {
  return learningStorageSourceId;
}

function canUseWindow() {
  return typeof window !== 'undefined';
}

function getBroadcastChannel() {
  if (!canUseWindow() || typeof window.BroadcastChannel !== 'function') return null;
  if (!sharedChannel) sharedChannel = new window.BroadcastChannel(LEARNING_STORAGE_CHANNEL_NAME);
  return sharedChannel;
}

export function getLearningStorageSectionForKey(key) {
  const safeKey = key ? String(key) : '';
  return LEARNING_STORAGE_KEY_SECTIONS[safeKey] || '';
}

function sanitizePayload(payload = {}) {
  const key = payload.key ? String(payload.key) : '';
  return {
    key,
    section: payload.section ? String(payload.section) : getLearningStorageSectionForKey(key),
    reason: payload.reason ? String(payload.reason) : 'storage_changed',
    timestamp: payload.timestamp || new Date().toISOString(),
    sourceId: payload.sourceId || learningStorageSourceId
  };
}

export function publishLearningStorageChanged(payload = {}) {
  if (!canUseWindow()) return null;
  const message = sanitizePayload(payload);

  if (typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(LEARNING_STORAGE_SYNC_EVENT, { detail: message }));
  }

  const channel = getBroadcastChannel();
  if (channel && typeof channel.postMessage === 'function') {
    try {
      channel.postMessage(message);
    } catch {
      // Same-tab CustomEvent and storage-event fallback still keep the app usable.
    }
  }

  return message;
}

export function subscribeLearningStorageChanged(callback, options = {}) {
  if (!canUseWindow() || typeof callback !== 'function') return () => {};
  const keys = new Set((options.keys || []).map(String));
  const sections = new Set((options.sections || []).map(String));

  function matches(message = {}) {
    if (!keys.size && !sections.size) return true;
    return (message.key && keys.has(message.key)) || (message.section && sections.has(message.section));
  }

  function notify(message = {}) {
    const normalized = sanitizePayload(message);
    if (normalized.sourceId === learningStorageSourceId && message.__fromBroadcast) return;
    if (!matches(normalized)) return;
    callback(normalized);
  }

  function onLocalEvent(event) {
    notify(event.detail || {});
  }

  function onBroadcast(event) {
    notify({ ...(event.data || {}), __fromBroadcast: true });
  }

  function onStorage(event) {
    if (!event?.key) return;
    notify({
      key: event.key,
      section: getLearningStorageSectionForKey(event.key),
      reason: event.newValue == null ? 'storage_removed' : 'storage_updated',
      timestamp: new Date().toISOString(),
      sourceId: 'storage-event'
    });
  }

  window.addEventListener(LEARNING_STORAGE_SYNC_EVENT, onLocalEvent);
  window.addEventListener('storage', onStorage);
  const channel = getBroadcastChannel();
  if (channel) channel.addEventListener('message', onBroadcast);

  return () => {
    window.removeEventListener(LEARNING_STORAGE_SYNC_EVENT, onLocalEvent);
    window.removeEventListener('storage', onStorage);
    if (channel) channel.removeEventListener('message', onBroadcast);
  };
}

export function safelyCloseLearningStorageSync() {
  if (!sharedChannel) return;
  try {
    sharedChannel.close();
  } catch {
    // Ignore close failures during app teardown/test cleanup.
  }
  sharedChannel = null;
}
