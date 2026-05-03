import { normalizeDate, getLocalDateKey } from '../utils/date.js';
import { hashString } from '../utils/hash.js';
import { getLocalStorage } from '../utils/storage.js';

export const RECOMMENDATION_FEEDBACK_STORAGE_KEY = 'shimeV2RecommendationFeedbackV1';
export const RECOMMENDATION_FEEDBACK_SCHEMA_VERSION = 'v2-recommendation-feedback-v1';
export const RECOMMENDATION_FEEDBACK_UPDATED_EVENT = 'shime-v2-recommendation-feedback-updated';
export const RECOMMENDATION_FEEDBACK_LIMIT = 100;

export const RECOMMENDATION_FEEDBACK_TYPES = {
  HELPFUL: 'helpful',
  NOT_RELEVANT: 'not_relevant',
  HIDDEN_TODAY: 'hidden_today'
};


function emitFeedbackUpdated(detail = {}) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(RECOMMENDATION_FEEDBACK_UPDATED_EVENT, { detail }));
}

export function getTodayDateKey(date = new Date()) {
  return getLocalDateKey(date);
}

function normalizeFeedback(value) {
  return Object.values(RECOMMENDATION_FEEDBACK_TYPES).includes(value) ? value : '';
}

function normalizeRecord(record) {
  if (!record || typeof record !== 'object') return null;
  const recommendationType = String(record.recommendationType || '').trim();
  const feedback = normalizeFeedback(record.feedback);
  const createdAt = normalizeDate(record.createdAt);
  const dateKey = String(record.dateKey || '').trim();
  if (!recommendationType || !feedback || !createdAt || !dateKey) return null;

  return {
    id: String(record.id || hashString(`${recommendationType}|${feedback}|${createdAt}|${dateKey}`)),
    recommendationType,
    feedback,
    createdAt,
    dateKey,
    reasonCode: record.reasonCode ? String(record.reasonCode) : ''
  };
}

function normalizeEnvelope(payload) {
  const records = Array.isArray(payload?.records)
    ? payload.records.map(normalizeRecord).filter(Boolean)
    : [];

  return {
    schemaVersion: RECOMMENDATION_FEEDBACK_SCHEMA_VERSION,
    updatedAt: normalizeDate(payload?.updatedAt, new Date().toISOString()),
    records: records
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, RECOMMENDATION_FEEDBACK_LIMIT)
  };
}

function readEnvelope() {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, records: [], error: 'storage_unavailable' };

  try {
    const text = storage.getItem(RECOMMENDATION_FEEDBACK_STORAGE_KEY);
    if (!text) return { ok: true, records: [] };
    const payload = JSON.parse(text);
    if (payload?.schemaVersion !== RECOMMENDATION_FEEDBACK_SCHEMA_VERSION || !Array.isArray(payload.records)) {
      storage.removeItem(RECOMMENDATION_FEEDBACK_STORAGE_KEY);
      emitFeedbackUpdated({ reason: 'feedback_invalid_cleared' });
      return { ok: false, records: [], error: 'invalid_feedback_payload', discarded: true };
    }
    return { ok: true, ...normalizeEnvelope(payload) };
  } catch (error) {
    try {
      storage.removeItem(RECOMMENDATION_FEEDBACK_STORAGE_KEY);
    } catch {
      // Ignore cleanup failure; callers still receive a safe empty state.
    }
    emitFeedbackUpdated({ reason: 'feedback_corrupt_cleared' });
    return { ok: false, records: [], error: 'feedback_parse_failed', discarded: true, storageError: error };
  }
}

function writeRecords(records = []) {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable', records: [] };

  const payload = normalizeEnvelope({
    schemaVersion: RECOMMENDATION_FEEDBACK_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    records
  });

  try {
    storage.setItem(RECOMMENDATION_FEEDBACK_STORAGE_KEY, JSON.stringify(payload));
    emitFeedbackUpdated({ reason: 'feedback_saved', count: payload.records.length });
    return { ok: true, records: payload.records, updatedAt: payload.updatedAt };
  } catch (error) {
    return { ok: false, error: 'storage_write_failed', storageError: error, records: payload.records };
  }
}

export function readRecommendationFeedback() {
  return readEnvelope();
}

export function saveRecommendationFeedback({ recommendationType, feedback, reasonCode = '', date = new Date() } = {}) {
  const safeType = String(recommendationType || '').trim();
  const safeFeedback = normalizeFeedback(feedback);
  if (!safeType || !safeFeedback) return { ok: false, saved: false, error: 'invalid_feedback' };

  const createdAt = new Date().toISOString();
  const record = normalizeRecord({
    id: `recfb-${hashString(`${safeType}|${safeFeedback}|${createdAt}|${Math.random()}`)}`,
    recommendationType: safeType,
    feedback: safeFeedback,
    createdAt,
    dateKey: getTodayDateKey(date),
    reasonCode
  });

  const current = readEnvelope();
  const result = writeRecords([record, ...(current.records || [])]);
  if (!result.ok) return { ...result, saved: false, record };
  return { ok: true, saved: true, record, records: result.records };
}

export function clearRecommendationFeedback() {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable' };

  try {
    storage.removeItem(RECOMMENDATION_FEEDBACK_STORAGE_KEY);
    emitFeedbackUpdated({ reason: 'feedback_cleared' });
    return { ok: true, records: [] };
  } catch (error) {
    return { ok: false, error: 'storage_remove_failed', storageError: error };
  }
}

export function summarizeRecommendationFeedback(records = [], dateKey = getTodayDateKey()) {
  const cleanRecords = Array.isArray(records) ? records.map(normalizeRecord).filter(Boolean) : [];
  const byType = new Map();
  const hiddenTodayTypes = new Set();

  cleanRecords.forEach(record => {
    const current = byType.get(record.recommendationType) || {
      helpful: 0,
      notRelevant: 0,
      hiddenToday: 0,
      total: 0,
      adjustment: 0
    };

    current.total += 1;
    if (record.feedback === RECOMMENDATION_FEEDBACK_TYPES.HELPFUL) current.helpful += 1;
    if (record.feedback === RECOMMENDATION_FEEDBACK_TYPES.NOT_RELEVANT) current.notRelevant += 1;
    if (record.feedback === RECOMMENDATION_FEEDBACK_TYPES.HIDDEN_TODAY) {
      current.hiddenToday += 1;
      if (record.dateKey === dateKey) hiddenTodayTypes.add(record.recommendationType);
    }

    current.adjustment = Math.max(-0.4, Math.min(0.8, (current.notRelevant * 0.25) - (current.helpful * 0.1)));
    byType.set(record.recommendationType, current);
  });

  return {
    dateKey,
    byType,
    hiddenTodayTypes,
    recordCount: cleanRecords.length
  };
}
