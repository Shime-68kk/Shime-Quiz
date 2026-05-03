import { getLocalDateKey, normalizeDate } from '../utils/date.js';
import { hashString } from '../utils/hash.js';
import { clampInteger } from '../utils/number.js';
import { getLocalStorage } from '../utils/storage.js';

export const STUDY_GOAL_STORAGE_KEY = 'shimeV2StudyGoalV1';
export const STUDY_GOAL_SCHEMA_VERSION = 'v2-study-goal-v1';
export const STUDY_GOAL_UPDATED_EVENT = 'shime-v2-study-goal-updated';

export const STUDY_GOAL_FOCUS_MODES = {
  BALANCED: 'balanced',
  DUE_REVIEW_FIRST: 'due_review_first',
  WEAK_AREAS_FIRST: 'weak_areas_first'
};

export const DEFAULT_DAILY_ITEM_TARGET = 10;


function emitGoalUpdated(detail = {}) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(STUDY_GOAL_UPDATED_EVENT, { detail }));
}

function normalizeTargetDate(value) {
  if (!value) return '';
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return '';
  const date = new Date(`${text}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return text;
}

function normalizeFocusMode(value) {
  const known = new Set(Object.values(STUDY_GOAL_FOCUS_MODES));
  return known.has(value) ? value : STUDY_GOAL_FOCUS_MODES.BALANCED;
}

function normalizeGoal(goal) {
  if (!goal || typeof goal !== 'object') return null;
  const now = new Date().toISOString();
  const dailyItemTarget = clampInteger(goal.dailyItemTarget, 1, 200, DEFAULT_DAILY_ITEM_TARGET);
  const createdAt = normalizeDate(goal.createdAt, now);
  const updatedAt = normalizeDate(goal.updatedAt, createdAt);
  const id = String(goal.id || `goal-${hashString(`${createdAt}|${dailyItemTarget}`)}`).trim();

  return {
    id,
    schemaVersion: STUDY_GOAL_SCHEMA_VERSION,
    createdAt,
    updatedAt,
    dailyItemTarget,
    targetDate: normalizeTargetDate(goal.targetDate),
    focusMode: normalizeFocusMode(goal.focusMode),
    isActive: goal.isActive !== false
  };
}

function getEnvelope(goal = null) {
  return {
    schemaVersion: STUDY_GOAL_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    goal: goal ? normalizeGoal(goal) : null
  };
}

export function readStudyGoal() {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, goal: null, error: 'storage_unavailable' };
  const text = storage.getItem(STUDY_GOAL_STORAGE_KEY);
  if (!text) return { ok: true, goal: null };

  try {
    const payload = JSON.parse(text);
    if (payload?.schemaVersion !== STUDY_GOAL_SCHEMA_VERSION) {
      storage.removeItem(STUDY_GOAL_STORAGE_KEY);
      emitGoalUpdated({ reason: 'goal_invalid_cleared' });
      return { ok: false, goal: null, error: 'invalid_goal_payload', discarded: true };
    }

    const goal = normalizeGoal(payload.goal);
    if (!goal) {
      storage.removeItem(STUDY_GOAL_STORAGE_KEY);
      emitGoalUpdated({ reason: 'goal_empty_cleared' });
      return { ok: true, goal: null };
    }

    return { ok: true, goal };
  } catch (error) {
    try {
      storage.removeItem(STUDY_GOAL_STORAGE_KEY);
    } catch {
      // Ignore cleanup failures; callers still get a safe empty state.
    }
    emitGoalUpdated({ reason: 'goal_corrupt_cleared' });
    return { ok: false, goal: null, error: 'goal_parse_failed', discarded: true, storageError: error };
  }
}

export function saveStudyGoal(goalInput) {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, goal: null, error: 'storage_unavailable' };
  const existing = readStudyGoal().goal;
  const now = new Date().toISOString();
  const goal = normalizeGoal({
    ...existing,
    ...goalInput,
    id: goalInput?.id || existing?.id,
    createdAt: goalInput?.createdAt || existing?.createdAt || now,
    updatedAt: now,
    isActive: goalInput?.isActive ?? existing?.isActive ?? true
  });

  if (!goal) return { ok: false, goal: null, error: 'invalid_goal' };

  try {
    storage.setItem(STUDY_GOAL_STORAGE_KEY, JSON.stringify(getEnvelope(goal)));
    emitGoalUpdated({ reason: 'goal_saved' });
    return { ok: true, goal };
  } catch (error) {
    return { ok: false, goal, error: 'storage_write_failed', storageError: error };
  }
}

export function clearStudyGoal() {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable' };
  try {
    storage.removeItem(STUDY_GOAL_STORAGE_KEY);
    emitGoalUpdated({ reason: 'goal_cleared' });
    return { ok: true, goal: null };
  } catch (error) {
    return { ok: false, error: 'storage_remove_failed', storageError: error };
  }
}

export function computeStudyGoalProgress(goal, historyRecords = [], now = new Date()) {
  const normalizedGoal = normalizeGoal(goal);
  if (!normalizedGoal?.isActive) {
    return {
      hasGoal: false,
      itemsPracticedToday: 0,
      sessionsToday: 0,
      remainingToday: 0,
      progressPercent: 0,
      daysRemaining: null,
      targetDateWarning: ''
    };
  }

  const todayKey = getLocalDateKey(now);
  const safeRecords = Array.isArray(historyRecords) ? historyRecords : [];
  const todayRecords = safeRecords.filter(record => getLocalDateKey(record?.completedAt) === todayKey);
  const itemsPracticedToday = todayRecords.reduce((sum, record) => sum + Math.max(0, Number(record?.totalItems) || 0), 0);
  const remainingToday = Math.max(0, normalizedGoal.dailyItemTarget - itemsPracticedToday);
  const progressPercent = Math.max(0, Math.min(100, Math.round((itemsPracticedToday / normalizedGoal.dailyItemTarget) * 100)));

  let daysRemaining = null;
  let targetDateWarning = '';
  if (normalizedGoal.targetDate) {
    const today = new Date(`${todayKey}T00:00:00`);
    const target = new Date(`${normalizedGoal.targetDate}T00:00:00`);
    if (!Number.isNaN(target.getTime())) {
      daysRemaining = Math.ceil((target.getTime() - today.getTime()) / 86400000);
      if (daysRemaining < 0) targetDateWarning = 'Ngày mục tiêu đã qua. Bạn có thể chỉnh sửa mục tiêu.';
    }
  }

  return {
    hasGoal: true,
    itemsPracticedToday,
    sessionsToday: todayRecords.length,
    remainingToday,
    progressPercent,
    daysRemaining,
    targetDateWarning
  };
}
