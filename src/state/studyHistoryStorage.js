import { getLocalStorage } from '../utils/storage.js';
import { hashString } from '../utils/hash.js';
import { normalizeDate } from '../utils/date.js';
import { publishLearningStorageChanged } from './localStorageSync.js';
import { clamp, safeNumber } from '../utils/number.js';
export const STUDY_HISTORY_STORAGE_KEY = 'shimeV2StudyHistoryV1';
export const STUDY_HISTORY_SCHEMA_VERSION = 'v2-study-history-v1';
export const STUDY_HISTORY_UPDATED_EVENT = 'shime-v2-study-history-updated';
export const STUDY_HISTORY_LIMIT = 50;


function emitHistoryUpdated(detail = {}) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(STUDY_HISTORY_UPDATED_EVENT, { detail }));
  publishLearningStorageChanged({
    key: STUDY_HISTORY_STORAGE_KEY,
    section: 'studyHistory',
    reason: detail.reason || 'history_changed'
  });
}



function secondsBetween(startValue, endValue) {
  const start = startValue ? new Date(startValue) : null;
  const end = endValue ? new Date(endValue) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
}

function getHistoryEnvelope(records = []) {
  return {
    schemaVersion: STUDY_HISTORY_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    records: records.slice(0, STUDY_HISTORY_LIMIT)
  };
}

function mergeHistoryRecords(primaryRecords = [], existingRecords = []) {
  const merged = [];
  const seen = new Set();

  [...primaryRecords, ...existingRecords].forEach(record => {
    const normalized = normalizeRecord(record);
    if (!normalized || seen.has(normalized.id)) return;
    seen.add(normalized.id);
    merged.push(normalized);
  });

  return merged
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, STUDY_HISTORY_LIMIT);
}

function normalizeStatus(status) {
  const known = new Set(['correct', 'wrong', 'unanswered', 'reviewed_flashcard', 'unscored']);
  return known.has(status) ? status : 'unscored';
}

function normalizeRecord(record) {
  if (!record || typeof record !== 'object') return null;
  const id = String(record.id || '').trim();
  const completedAt = normalizeDate(record.completedAt);
  if (!id || !completedAt) return null;

  const itemResults = Array.isArray(record.itemResults)
    ? record.itemResults.slice(0, 200).map((item, index) => {
      const result = {
        itemId: String(item?.itemId || `item-${index}`),
        itemType: String(item?.itemType || 'unknown'),
        status: normalizeStatus(item?.status)
      };
      // New v2 records keep a short promptSnapshot and resolve full display details from the current library.
      // Legacy records may still contain prompt/correctAnswer snapshots and remain supported.
      const promptSnapshot = String(item?.promptSnapshot || item?.prompt || '').slice(0, 180);
      if (promptSnapshot) result.promptSnapshot = promptSnapshot;
      if (item?.prompt) result.prompt = String(item.prompt);
      const userAnswer = String(item?.userAnswer || '');
      if (userAnswer) result.userAnswer = userAnswer;
      if (item?.correctAnswer) result.correctAnswer = String(item.correctAnswer);
      if (item?.topicId) result.topicId = String(item.topicId);
      if (item?.subjectId) result.subjectId = String(item.subjectId);
      return result;
    })
    : [];

  return {
    id,
    schemaVersion: STUDY_HISTORY_SCHEMA_VERSION,
    createdAt: normalizeDate(record.createdAt, completedAt),
    completedAt,
    durationSeconds: Math.max(0, safeNumber(record.durationSeconds, 0)),
    itemSetFingerprint: String(record.itemSetFingerprint || ''),
    totalItems: Math.max(0, safeNumber(record.totalItems, 0)),
    answeredCount: Math.max(0, safeNumber(record.answeredCount, 0)),
    correctCount: Math.max(0, safeNumber(record.correctCount, 0)),
    wrongCount: Math.max(0, safeNumber(record.wrongCount, 0)),
    unansweredCount: Math.max(0, safeNumber(record.unansweredCount, 0)),
    unscoredCount: Math.max(0, safeNumber(record.unscoredCount, 0)),
    flashcardReviewedCount: Math.max(0, safeNumber(record.flashcardReviewedCount, 0)),
    percentage: clamp(record.percentage, 0, 100, 0),
    itemResults
  };
}

function readEnvelope() {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, records: [], error: 'storage_unavailable' };

  const text = storage.getItem(STUDY_HISTORY_STORAGE_KEY);
  if (!text) return { ok: true, records: [] };

  try {
    const payload = JSON.parse(text);
    if (payload?.schemaVersion !== STUDY_HISTORY_SCHEMA_VERSION || !Array.isArray(payload.records)) {
      storage.removeItem(STUDY_HISTORY_STORAGE_KEY);
      emitHistoryUpdated({ reason: 'history_invalid_cleared' });
      return { ok: false, records: [], error: 'invalid_history_payload', discarded: true };
    }

    const records = payload.records
      .map(normalizeRecord)
      .filter(Boolean)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, STUDY_HISTORY_LIMIT);

    return { ok: true, records };
  } catch (error) {
    try {
      storage.removeItem(STUDY_HISTORY_STORAGE_KEY);
    } catch {
      // Ignore cleanup failures; callers still receive a safe empty state.
    }
    emitHistoryUpdated({ reason: 'history_corrupt_cleared' });
    return { ok: false, records: [], error: 'history_parse_failed', discarded: true, storageError: error };
  }
}

function writeRecords(records) {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable' };

  const cleanRecords = records
    .map(normalizeRecord)
    .filter(Boolean)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, STUDY_HISTORY_LIMIT);

  try {
    storage.setItem(STUDY_HISTORY_STORAGE_KEY, JSON.stringify(getHistoryEnvelope(cleanRecords)));
    emitHistoryUpdated({ reason: 'history_saved' });
    return { ok: true, records: cleanRecords };
  } catch (error) {
    return { ok: false, error: 'storage_write_failed', storageError: error, records: cleanRecords };
  }
}

export function readStudyHistory() {
  return readEnvelope();
}

export function clearStudyHistory() {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable' };

  try {
    storage.removeItem(STUDY_HISTORY_STORAGE_KEY);
    emitHistoryUpdated({ reason: 'history_cleared' });
    return { ok: true, records: [] };
  } catch (error) {
    return { ok: false, error: 'storage_remove_failed', storageError: error };
  }
}

export function createStudyHistoryRecord({ startedAt, completedAt, itemSetFingerprint, summary }) {
  const safeSummary = summary || {};
  const safeCompletedAt = normalizeDate(completedAt, new Date().toISOString());
  const safeStartedAt = normalizeDate(startedAt, safeCompletedAt);
  const itemResults = Array.isArray(safeSummary.details)
    ? safeSummary.details.map(detail => ({
      itemId: String(detail.id || ''),
      itemType: String(detail.type || 'unknown'),
      // Store only a lightweight prompt fallback for deleted/changed library items.
      // Correct answers are intentionally resolved from library data in history detail views.
      promptSnapshot: String(detail.prompt || '').slice(0, 180),
      userAnswer: String(detail.userAnswer || '').slice(0, 500),
      status: normalizeStatus(detail.status),
      topicId: detail.topicId ? String(detail.topicId) : '',
      subjectId: detail.subjectId ? String(detail.subjectId) : ''
    }))
    : [];
  const stableIdSource = `${itemSetFingerprint || 'items'}|${safeStartedAt}`;

  return normalizeRecord({
    id: `study-${hashString(stableIdSource)}`,
    createdAt: safeStartedAt,
    completedAt: safeCompletedAt,
    durationSeconds: secondsBetween(safeStartedAt, safeCompletedAt),
    itemSetFingerprint,
    totalItems: safeSummary.totalItems,
    answeredCount: safeSummary.answeredCount,
    correctCount: safeSummary.correctCount,
    wrongCount: safeSummary.wrongCount,
    unansweredCount: safeSummary.unansweredCount,
    unscoredCount: safeSummary.unscoredCount,
    flashcardReviewedCount: safeSummary.flashcardReviewedCount,
    percentage: safeSummary.accuracy,
    itemResults
  });
}

export function saveStudyHistoryRecord(record) {
  const normalizedRecord = normalizeRecord(record);
  if (!normalizedRecord) return { ok: false, saved: false, error: 'invalid_record' };

  // localStorage is not transactional, but re-reading immediately before writing
  // reduces lost-update risk when another tab saved a different record.
  const latest = readEnvelope();
  const records = latest.records || [];
  const existingIndex = records.findIndex(item => item.id === normalizedRecord.id);

  if (existingIndex >= 0) {
    return { ok: true, saved: false, duplicate: true, record: records[existingIndex], records };
  }

  const result = writeRecords(mergeHistoryRecords([normalizedRecord], records));
  if (!result.ok) return { ...result, saved: false, record: normalizedRecord };
  return { ok: true, saved: true, record: normalizedRecord, records: result.records };
}
