import { getLocalDateKey, normalizeDate } from '../utils/date.js';
import { getLocalStorage } from '../utils/storage.js';
import { publishLearningStorageChanged } from './localStorageSync.js';

export const STUDY_PLAN_PROGRESS_STORAGE_KEY = 'shimeV2StudyPlanProgressV1';
export const STUDY_PLAN_PROGRESS_SCHEMA_VERSION = 'v2-study-plan-progress-v1';
export const STUDY_PLAN_PROGRESS_UPDATED_EVENT = 'shime-v2-study-plan-progress-updated';
const STUDY_PLAN_PROGRESS_DAY_LIMIT = 14;


function emitPlanProgressUpdated(detail = {}) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(STUDY_PLAN_PROGRESS_UPDATED_EVENT, { detail }));
  publishLearningStorageChanged({
    key: STUDY_PLAN_PROGRESS_STORAGE_KEY,
    section: 'studyPlanProgress',
    reason: detail.reason || 'plan_progress_changed'
  });
}

function uniqueStrings(values = []) {
  const seen = new Set();
  const output = [];
  (Array.isArray(values) ? values : []).forEach(value => {
    const text = String(value || '').trim();
    if (!text || seen.has(text)) return;
    seen.add(text);
    output.push(text);
  });
  return output;
}

function normalizeDayRecord(record, fallbackDateKey = getLocalDateKey()) {
  if (!record || typeof record !== 'object') return null;
  const dateKey = String(record.dateKey || fallbackDateKey || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;

  return {
    dateKey,
    completedStepIds: uniqueStrings(record.completedStepIds),
    dismissedStepIds: uniqueStrings(record.dismissedStepIds),
    activeStepId: String(record.activeStepId || '').trim(),
    updatedAt: normalizeDate(record.updatedAt, new Date().toISOString())
  };
}

function normalizeEnvelope(payload) {
  const days = Array.isArray(payload?.days)
    ? payload.days.map(day => normalizeDayRecord(day)).filter(Boolean)
    : [];
  const byDate = new Map();
  days.forEach(day => {
    if (!byDate.has(day.dateKey)) byDate.set(day.dateKey, day);
  });

  return {
    schemaVersion: STUDY_PLAN_PROGRESS_SCHEMA_VERSION,
    updatedAt: normalizeDate(payload?.updatedAt, new Date().toISOString()),
    days: Array.from(byDate.values())
      .sort((left, right) => right.dateKey.localeCompare(left.dateKey))
      .slice(0, STUDY_PLAN_PROGRESS_DAY_LIMIT)
  };
}

function emptyDay(dateKey = getLocalDateKey()) {
  return {
    dateKey,
    completedStepIds: [],
    dismissedStepIds: [],
    activeStepId: '',
    updatedAt: ''
  };
}

function readEnvelope() {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable', days: [] };

  try {
    const raw = storage.getItem(STUDY_PLAN_PROGRESS_STORAGE_KEY);
    if (!raw) return { ok: true, days: [] };
    const payload = JSON.parse(raw);
    if (payload?.schemaVersion !== STUDY_PLAN_PROGRESS_SCHEMA_VERSION || !Array.isArray(payload.days)) {
      storage.removeItem(STUDY_PLAN_PROGRESS_STORAGE_KEY);
      emitPlanProgressUpdated({ reason: 'plan_progress_invalid_cleared' });
      return { ok: false, error: 'invalid_plan_progress_payload', discarded: true, days: [] };
    }
    return { ok: true, ...normalizeEnvelope(payload) };
  } catch (error) {
    try {
      storage.removeItem(STUDY_PLAN_PROGRESS_STORAGE_KEY);
    } catch {
      // Ignore cleanup failure; callers still receive a safe empty state.
    }
    emitPlanProgressUpdated({ reason: 'plan_progress_corrupt_cleared' });
    return { ok: false, error: 'plan_progress_parse_failed', discarded: true, storageError: error, days: [] };
  }
}


function mergeDayRecords(latestDay, nextDay, fallbackDateKey = getLocalDateKey()) {
  const latest = normalizeDayRecord(latestDay, fallbackDateKey) || emptyDay(fallbackDateKey);
  const next = normalizeDayRecord(nextDay, latest.dateKey) || latest;
  const completedStepIds = uniqueStrings([...(latest.completedStepIds || []), ...(next.completedStepIds || [])]);
  return normalizeDayRecord({
    dateKey: next.dateKey || latest.dateKey,
    completedStepIds,
    dismissedStepIds: uniqueStrings([...(latest.dismissedStepIds || []), ...(next.dismissedStepIds || [])])
      .filter(id => !completedStepIds.includes(id)),
    activeStepId: next.activeStepId || latest.activeStepId || '',
    updatedAt: next.updatedAt || new Date().toISOString()
  }, fallbackDateKey);
}

function writeDays(days = [], detail = {}) {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable', days: [] };

  const payload = normalizeEnvelope({
    schemaVersion: STUDY_PLAN_PROGRESS_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    days
  });

  try {
    storage.setItem(STUDY_PLAN_PROGRESS_STORAGE_KEY, JSON.stringify(payload));
    emitPlanProgressUpdated({ reason: detail.reason || 'plan_progress_saved', dateKey: detail.dateKey, count: payload.days.length });
    return { ok: true, days: payload.days, updatedAt: payload.updatedAt };
  } catch (error) {
    return { ok: false, error: 'storage_write_failed', storageError: error, days: payload.days };
  }
}

function updateDay(dateKey = getLocalDateKey(), updater, reason = 'plan_progress_saved') {
  const current = readEnvelope();
  const safeDateKey = getLocalDateKey(`${dateKey}T00:00:00`);
  const days = Array.isArray(current.days) ? current.days.slice() : [];
  const index = days.findIndex(day => day.dateKey === safeDateKey);
  const existing = index >= 0 ? days[index] : emptyDay(safeDateKey);
  const nextDay = normalizeDayRecord({ ...updater(existing), updatedAt: new Date().toISOString() }, safeDateKey);
  if (!nextDay) return { ok: false, error: 'invalid_plan_progress_day' };

  // Re-read immediately before writing and merge by day/step ids. This keeps
  // close multi-tab updates from dropping a completed/dismissed step that was
  // written after the first read.
  const latest = readEnvelope();
  const latestDays = Array.isArray(latest.days) ? latest.days.slice() : [];
  const latestIndex = latestDays.findIndex(day => day.dateKey === safeDateKey);
  const mergedDay = mergeDayRecords(latestIndex >= 0 ? latestDays[latestIndex] : existing, nextDay, safeDateKey);
  if (latestIndex >= 0) latestDays[latestIndex] = mergedDay;
  else latestDays.unshift(mergedDay);

  const result = writeDays(latestDays, { reason, dateKey: safeDateKey });
  return { ...result, day: mergedDay };
}

export function readStudyPlanProgress(dateKey = getLocalDateKey()) {
  const envelope = readEnvelope();
  const safeDateKey = getLocalDateKey(`${dateKey}T00:00:00`);
  const day = (envelope.days || []).find(record => record.dateKey === safeDateKey) || emptyDay(safeDateKey);
  return { ...envelope, dateKey: safeDateKey, day };
}

export function markStudyPlanStepActive(stepId, dateKey = getLocalDateKey()) {
  const safeStepId = String(stepId || '').trim();
  if (!safeStepId) return { ok: false, error: 'invalid_step_id' };
  return updateDay(dateKey, day => ({ ...day, activeStepId: safeStepId }), 'plan_step_active');
}

export function clearActiveStudyPlanStep(stepId = '', dateKey = getLocalDateKey()) {
  return updateDay(dateKey, day => {
    const safeStepId = String(stepId || '').trim();
    if (safeStepId && day.activeStepId !== safeStepId) return day;
    return { ...day, activeStepId: '' };
  }, 'plan_step_active_cleared');
}

export function markStudyPlanStepComplete(stepId, dateKey = getLocalDateKey()) {
  const safeStepId = String(stepId || '').trim();
  if (!safeStepId) return { ok: false, error: 'invalid_step_id' };
  return updateDay(dateKey, day => ({
    ...day,
    completedStepIds: uniqueStrings([...day.completedStepIds, safeStepId]),
    dismissedStepIds: day.dismissedStepIds.filter(id => id !== safeStepId),
    activeStepId: day.activeStepId === safeStepId ? '' : day.activeStepId
  }), 'plan_step_completed');
}

export function unmarkStudyPlanStepComplete(stepId, dateKey = getLocalDateKey()) {
  const safeStepId = String(stepId || '').trim();
  if (!safeStepId) return { ok: false, error: 'invalid_step_id' };
  return updateDay(dateKey, day => ({
    ...day,
    completedStepIds: day.completedStepIds.filter(id => id !== safeStepId)
  }), 'plan_step_uncompleted');
}

export function resetStudyPlanProgressForDate(dateKey = getLocalDateKey()) {
  const safeDateKey = getLocalDateKey(`${dateKey}T00:00:00`);
  const current = readEnvelope();
  if (!current.ok && current.error === 'storage_unavailable') {
    return { ok: false, error: current.error, days: [], day: emptyDay(safeDateKey) };
  }

  // Re-read the latest snapshot immediately before writing the reset. The
  // operation removes only the requested day from that latest snapshot so a
  // close write from another tab to a different day is preserved.
  const latest = readEnvelope();
  if (!latest.ok && latest.error === 'storage_unavailable') {
    return { ok: false, error: latest.error, days: [], day: emptyDay(safeDateKey) };
  }

  const days = (latest.days || []).filter(day => day.dateKey !== safeDateKey);
  const result = writeDays(days, { reason: 'plan_progress_reset_today', dateKey: safeDateKey });
  return { ...result, day: emptyDay(safeDateKey) };
}

export function getStudyPlanStepProgress(steps = [], progressDay = emptyDay()) {
  const completed = new Set(progressDay.completedStepIds || []);
  const activeStepId = String(progressDay.activeStepId || '');
  const safeSteps = Array.isArray(steps) ? steps.filter(step => step?.id) : [];
  const completedCount = safeSteps.filter(step => completed.has(step.id)).length;

  return {
    totalSteps: safeSteps.length,
    completedCount,
    activeStepId,
    allCompleted: safeSteps.length > 0 && completedCount === safeSteps.length,
    getStatus(stepId) {
      const safeStepId = String(stepId || '');
      if (completed.has(safeStepId)) return 'completed';
      if (activeStepId && activeStepId === safeStepId) return 'active';
      return 'pending';
    }
  };
}
