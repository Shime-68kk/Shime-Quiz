import { getLocalStorage } from '../utils/storage.js';
import { clamp } from '../utils/number.js';
import { normalizeDate } from '../utils/date.js';
import { publishLearningStorageChanged } from './localStorageSync.js';
import { getSettings } from './settingsStorage.js';
import { readStudyHistory } from './studyHistoryStorage.js';
import { isFsrsNewCardEnrollmentEligible, scheduleDormantFsrsReview } from '../quiz/reviewSchedulerAdapter.js';
export const REVIEW_SCHEDULE_STORAGE_KEY = 'shimeV2ReviewScheduleV1';
export const REVIEW_SCHEDULE_SCHEMA_VERSION = 'v2-review-schedule-v1';
export const REVIEW_SCHEDULE_UPDATED_EVENT = 'shime-v2-review-schedule-updated';
export const MIN_EASE_FACTOR = 1.3;
export const MAX_EASE_FACTOR = 2.8;
export const FSRS_REVIEW_LOG_CAP = 20;


function emitReviewScheduleUpdated(detail = {}) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(REVIEW_SCHEDULE_UPDATED_EVENT, { detail }));
  publishLearningStorageChanged({
    key: REVIEW_SCHEDULE_STORAGE_KEY,
    section: 'reviewSchedule',
    reason: detail.reason || 'schedule_changed'
  });
}

function nowIso() {
  return new Date().toISOString();
}


function addDaysIso(baseDate, days) {
  const date = baseDate instanceof Date ? new Date(baseDate.getTime()) : new Date(baseDate || Date.now());
  if (Number.isNaN(date.getTime())) return nowIso();
  date.setDate(date.getDate() + Math.max(0, Number(days) || 0));
  return date.toISOString();
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cloneJsonSafe(value, fallback = null) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function getPreservedFsrsFields(record) {
  const preserved = {};
  const schedulerKind = typeof record.schedulerKind === 'string' ? record.schedulerKind.trim() : '';
  const schedulerVersion = typeof record.schedulerVersion === 'string' ? record.schedulerVersion.trim() : '';

  if (schedulerKind && !['sm2-heuristic', 'current-heuristic'].includes(schedulerKind)) {
    preserved.schedulerKind = schedulerKind;
  }
  if (schedulerVersion) {
    preserved.schedulerVersion = schedulerVersion;
  }
  if (isPlainObject(record.fsrsPayload)) {
    const payload = cloneJsonSafe(record.fsrsPayload);
    if (isPlainObject(payload)) preserved.fsrsPayload = payload;
  }
  if (Array.isArray(record.fsrsReviewLogs)) {
    const logs = record.fsrsReviewLogs
      .filter(isPlainObject)
      .map(log => cloneJsonSafe(log))
      .filter(isPlainObject)
      .slice(-FSRS_REVIEW_LOG_CAP);
    if (logs.length > 0) preserved.fsrsReviewLogs = logs;
  }

  return preserved;
}


function normalizeScheduleRecord(record) {
  if (!record || typeof record !== 'object') return null;
  const itemId = String(record.itemId || '').trim();
  if (!itemId) return null;

  return {
    itemId,
    subjectId: record.subjectId ? String(record.subjectId) : '',
    topicId: record.topicId ? String(record.topicId) : '',
    lastReviewedAt: normalizeDate(record.lastReviewedAt, nowIso()),
    dueAt: normalizeDate(record.dueAt, nowIso()),
    intervalDays: Math.max(0, Number(record.intervalDays) || 0),
    repetitionCount: Math.max(0, Math.floor(Number(record.repetitionCount) || 0)),
    easeFactor: clamp(record.easeFactor, MIN_EASE_FACTOR, MAX_EASE_FACTOR, 2.2),
    correctStreak: Math.max(0, Math.floor(Number(record.correctStreak) || 0)),
    wrongCount: Math.max(0, Math.floor(Number(record.wrongCount) || 0)),
    ...getPreservedFsrsFields(record)
  };
}

function normalizeEnvelope(payload) {
  const records = Array.isArray(payload?.records)
    ? payload.records.map(normalizeScheduleRecord).filter(Boolean)
    : [];

  return {
    schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
    updatedAt: normalizeDate(payload?.updatedAt, nowIso()),
    records
  };
}

function mergeScheduleRecords(primaryRecords = [], existingRecords = []) {
  const byItemId = new Map();

  existingRecords.map(normalizeScheduleRecord).filter(Boolean).forEach(record => {
    byItemId.set(record.itemId, record);
  });

  primaryRecords.map(normalizeScheduleRecord).filter(Boolean).forEach(record => {
    byItemId.set(record.itemId, record);
  });

  return Array.from(byItemId.values()).sort((left, right) => new Date(left.dueAt) - new Date(right.dueAt));
}

function readEnvelope() {
  const storage = getLocalStorage();
  if (!storage) return { schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION, updatedAt: '', records: [], storageAvailable: false };

  try {
    const raw = storage.getItem(REVIEW_SCHEDULE_STORAGE_KEY);
    if (!raw) return { schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION, updatedAt: '', records: [] };
    return normalizeEnvelope(JSON.parse(raw));
  } catch {
    try {
      storage.removeItem(REVIEW_SCHEDULE_STORAGE_KEY);
    } catch {
      // Ignore cleanup failure; callers still receive a safe empty schedule.
    }
    return { schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION, updatedAt: '', records: [], discarded: true };
  }
}

function writeRecords(records = [], options = {}) {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable', records: [] };

  const sourceRecords = options.mergeWithLatest
    ? mergeScheduleRecords(records, readEnvelope().records || [])
    : records;
  const normalizedRecords = sourceRecords.map(normalizeScheduleRecord).filter(Boolean);
  const uniqueRecords = [];
  const seen = new Set();
  normalizedRecords.forEach(record => {
    if (seen.has(record.itemId)) return;
    seen.add(record.itemId);
    uniqueRecords.push(record);
  });

  const payload = {
    schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
    updatedAt: nowIso(),
    records: uniqueRecords
  };

  try {
    storage.setItem(REVIEW_SCHEDULE_STORAGE_KEY, JSON.stringify(payload));
    emitReviewScheduleUpdated({ reason: 'schedule_saved', count: uniqueRecords.length });
    return { ok: true, records: uniqueRecords, updatedAt: payload.updatedAt };
  } catch (error) {
    return { ok: false, error: 'storage_write_failed', storageError: error, records: uniqueRecords };
  }
}

function getNextCorrectIntervalDays(previousRecord) {
  const repetitionCount = Math.max(0, Number(previousRecord?.repetitionCount) || 0);
  const previousInterval = Math.max(1, Number(previousRecord?.intervalDays) || 1);
  const easeFactor = clamp(previousRecord?.easeFactor, MIN_EASE_FACTOR, MAX_EASE_FACTOR, 2.2);

  if (repetitionCount <= 0) return 1;
  if (repetitionCount === 1) return 3;
  return Math.max(1, Math.round(previousInterval * easeFactor));
}

function updateRecordFromResult(previousRecord, itemResult, completedAt) {
  if (!itemResult?.itemId) return null;
  const status = itemResult.status;
  if (!['correct', 'wrong', 'unanswered'].includes(status)) return null;

  const base = normalizeScheduleRecord(previousRecord) || {
    itemId: String(itemResult.itemId),
    subjectId: itemResult.subjectId ? String(itemResult.subjectId) : '',
    topicId: itemResult.topicId ? String(itemResult.topicId) : '',
    lastReviewedAt: completedAt,
    dueAt: completedAt,
    intervalDays: 0,
    repetitionCount: 0,
    easeFactor: 2.2,
    correctStreak: 0,
    wrongCount: 0
  };

  const reviewedAt = normalizeDate(completedAt, nowIso());

  if (status === 'correct') {
    const intervalDays = getNextCorrectIntervalDays(base);
    return normalizeScheduleRecord({
      ...base,
      subjectId: itemResult.subjectId || base.subjectId,
      topicId: itemResult.topicId || base.topicId,
      lastReviewedAt: reviewedAt,
      dueAt: addDaysIso(reviewedAt, intervalDays),
      intervalDays,
      repetitionCount: base.repetitionCount + 1,
      easeFactor: clamp(base.easeFactor + 0.05, MIN_EASE_FACTOR, MAX_EASE_FACTOR, 2.25),
      correctStreak: base.correctStreak + 1,
      wrongCount: base.wrongCount
    });
  }

  if (status === 'wrong') {
    return normalizeScheduleRecord({
      ...base,
      subjectId: itemResult.subjectId || base.subjectId,
      topicId: itemResult.topicId || base.topicId,
      lastReviewedAt: reviewedAt,
      dueAt: addDaysIso(reviewedAt, 1),
      intervalDays: 1,
      repetitionCount: base.repetitionCount,
      easeFactor: clamp(base.easeFactor - 0.2, MIN_EASE_FACTOR, MAX_EASE_FACTOR, 2),
      correctStreak: 0,
      wrongCount: base.wrongCount + 1
    });
  }

  // Unanswered scorable items are made due soon without increasing wrongCount.
  return normalizeScheduleRecord({
    ...base,
    subjectId: itemResult.subjectId || base.subjectId,
    topicId: itemResult.topicId || base.topicId,
    lastReviewedAt: reviewedAt,
    dueAt: addDaysIso(reviewedAt, 1),
    intervalDays: 1,
    repetitionCount: base.repetitionCount,
    easeFactor: base.easeFactor,
    correctStreak: 0,
    wrongCount: base.wrongCount
  });
}

export function createReviewScheduleRecordFromResult(previousRecord, itemResult, completedAt = nowIso()) {
  return updateRecordFromResult(previousRecord, itemResult, completedAt);
}

export function readReviewSchedule() {
  return readEnvelope();
}

export function clearReviewSchedule() {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable' };

  try {
    storage.removeItem(REVIEW_SCHEDULE_STORAGE_KEY);
    emitReviewScheduleUpdated({ reason: 'schedule_cleared' });
    return { ok: true, records: [] };
  } catch (error) {
    return { ok: false, error: 'storage_remove_failed', storageError: error };
  }
}

export function updateReviewScheduleFromHistoryRecord(historyRecord) {
  if (!historyRecord?.id || !Array.isArray(historyRecord.itemResults)) {
    return { ok: false, updatedCount: 0, skippedCount: 0, error: 'invalid_history_record' };
  }

  const current = readEnvelope();
  const byItemId = new Map((current.records || []).map(record => [record.itemId, record]));
  let updatedCount = 0;
  let skippedCount = 0;
  const completedAt = normalizeDate(historyRecord.completedAt, nowIso());

  // Phase 14L: re-read toggle at processing time; never use a session-start cache.
  const fsrsToggleEnabled = getSettings().fsrsExperimentalEnabled === true;
  // Exclude the current session from prior-history: it may already be saved to storage.
  const priorHistoryRecords = fsrsToggleEnabled
    ? (readStudyHistory().records || []).filter(r => r.id !== historyRecord.id)
    : [];

  historyRecord.itemResults.forEach(itemResult => {
    const itemId = String(itemResult?.itemId || '').trim();
    if (!itemId) {
      skippedCount += 1;
      return;
    }

    const priorRecord = byItemId.get(itemId) ?? null;
    let nextRecord = null;

    // Phase 14L: attempt dormant enrollment for strict new-card first completed reviews.
    const resultStatus = String(itemResult?.status || '').trim();
    if (
      fsrsToggleEnabled &&
      ['correct', 'wrong', 'unanswered'].includes(resultStatus) &&
      isFsrsNewCardEnrollmentEligible({
        itemId,
        toggleEnabled: fsrsToggleEnabled,
        priorRecord,
        studyHistoryRecords: priorHistoryRecords
      })
    ) {
      const baseRecord = {
        itemId,
        subjectId: itemResult.subjectId ? String(itemResult.subjectId) : '',
        topicId: itemResult.topicId ? String(itemResult.topicId) : ''
      };
      nextRecord = scheduleDormantFsrsReview(baseRecord, resultStatus, { completedAt });
    }

    // SM-2 fallback for all ineligible or unenrolled items (intervals remain SM-2-like).
    if (!nextRecord) {
      nextRecord = updateRecordFromResult(priorRecord, itemResult, completedAt);
    }

    if (!nextRecord) {
      skippedCount += 1;
      return;
    }

    byItemId.set(itemId, nextRecord);
    updatedCount += 1;
  });

  const records = Array.from(byItemId.values()).sort((left, right) => new Date(left.dueAt) - new Date(right.dueAt));
  const result = writeRecords(records, { mergeWithLatest: true });
  return {
    ...result,
    updatedCount,
    skippedCount
  };
}

export function getReviewScheduleSummary(records = [], nowValue = new Date()) {
  const nowDate = nowValue instanceof Date ? nowValue : new Date(nowValue || Date.now());
  const nowTime = Number.isNaN(nowDate.getTime()) ? Date.now() : nowDate.getTime();
  const safeRecords = Array.isArray(records) ? records.map(normalizeScheduleRecord).filter(Boolean) : [];
  const dueRecords = safeRecords.filter(record => new Date(record.dueAt).getTime() <= nowTime);
  const futureRecords = safeRecords.filter(record => new Date(record.dueAt).getTime() > nowTime);
  const nextDueRecord = safeRecords.slice().sort((left, right) => new Date(left.dueAt) - new Date(right.dueAt))[0] || null;

  return {
    totalScheduled: safeRecords.length,
    dueCount: dueRecords.length,
    futureCount: futureRecords.length,
    nextDueAt: nextDueRecord?.dueAt || '',
    dueRecords: dueRecords.slice(0, 10),
    nextRecords: safeRecords.slice().sort((left, right) => new Date(left.dueAt) - new Date(right.dueAt)).slice(0, 5)
  };
}
