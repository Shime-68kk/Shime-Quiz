import { getJSON, removeStorageItem, setJSON } from '../utils/storage.js';

export const STUDY_GOAL_STORAGE_KEY = 'quizStudyGoalV1';
export const FOCUS_MODES = ['balanced', 'weakFirst', 'dueFirst', 'selectedTopics'];

const DEFAULT_DAILY_TARGET = 20;
const MAX_SELECTED_TOPICS = 40;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toSafeInteger(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
}

function toIsoDate(value) {
  const text = String(value || '').trim();
  if (!text) return '';

  const date = new Date(`${text.slice(0, 10)}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function createGoalId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeTopicKeys(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(item => String(item || '').trim()).filter(Boolean))].slice(0, MAX_SELECTED_TOPICS);
}

function normalizeFocusMode(value) {
  return FOCUS_MODES.includes(value) ? value : 'balanced';
}

export function normalizeStudyGoal(goal) {
  if (!isPlainObject(goal)) return null;

  const targetDate = toIsoDate(goal.targetDate);
  if (!targetDate) return null;

  return {
    id: String(goal.id || createGoalId()),
    createdAt: String(goal.createdAt || new Date().toISOString()),
    targetDate,
    dailyQuestionTarget: Math.max(1, Math.min(500, toSafeInteger(goal.dailyQuestionTarget, DEFAULT_DAILY_TARGET))),
    focusMode: normalizeFocusMode(goal.focusMode),
    selectedTopics: normalizeTopicKeys(goal.selectedTopics),
    completedQuestionCount: toSafeInteger(goal.completedQuestionCount, 0),
    lastUpdatedAt: String(goal.lastUpdatedAt || new Date().toISOString()),
    active: goal.active !== false,
    dismissed: Boolean(goal.dismissed)
  };
}

export function loadStudyGoal() {
  try {
    return normalizeStudyGoal(getJSON(STUDY_GOAL_STORAGE_KEY));
  } catch {
    removeStorageItem(STUDY_GOAL_STORAGE_KEY);
    return null;
  }
}

export function saveStudyGoal(goal) {
  const now = new Date().toISOString();
  const existing = loadStudyGoal();
  const normalized = normalizeStudyGoal({
    ...(existing || {}),
    ...(isPlainObject(goal) ? goal : {}),
    id: goal?.id || existing?.id || createGoalId(),
    createdAt: goal?.createdAt || existing?.createdAt || now,
    lastUpdatedAt: now,
    active: goal?.active ?? true,
    dismissed: goal?.dismissed ?? false
  });

  if (!normalized) throw new Error('Mục tiêu học tập không hợp lệ.');
  setJSON(STUDY_GOAL_STORAGE_KEY, normalized);
  return normalized;
}

export function clearStudyGoal() {
  removeStorageItem(STUDY_GOAL_STORAGE_KEY);
}

function startOfLocalDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function diffDaysInclusive(targetDate, now = new Date()) {
  const today = startOfLocalDay(now);
  const target = new Date(`${targetDate}T00:00:00`).getTime();
  if (!Number.isFinite(target)) return 0;
  return Math.ceil((target - today) / 86400000) + 1;
}

function countQuestionsSince(history = [], createdAt = '') {
  const since = new Date(createdAt).getTime();
  const validSince = Number.isFinite(since) ? since : 0;

  return (Array.isArray(history) ? history : []).reduce((sum, item) => {
    const created = new Date(item?.createdAt).getTime();
    if (Number.isFinite(created) && created < validSince) return sum;
    return sum + toSafeInteger(item?.totalQuestions, 0);
  }, 0);
}

function countTopicQuestions(allQuizzes = [], selectedTopics = []) {
  if (!selectedTopics.length) return 0;
  const topicSet = new Set(selectedTopics);
  let count = 0;

  (Array.isArray(allQuizzes) ? allQuizzes : []).forEach(quiz => {
    (Array.isArray(quiz?.questions) ? quiz.questions : []).forEach(question => {
      const values = [
        question?.chapter,
        question?.category,
        question?.topic,
        question?.section,
        question?.group,
        question?.tag,
        ...(Array.isArray(question?.tags) ? question.tags : []),
        quiz?.chapter,
        quiz?.category,
        quiz?.topic,
        quiz?.title
      ].map(item => String(item || '').trim()).filter(Boolean);

      if (values.some(value => topicSet.has(value))) count += 1;
    });
  });

  return count;
}

function getRecommendedAction(goal, { dueReviewCount = 0, weakMasteryCount = 0 } = {}) {
  if (!goal) return 'openBuilder';
  if (goal.focusMode === 'dueFirst' && dueReviewCount > 0) return 'reviewDue';
  if (goal.focusMode === 'weakFirst' && weakMasteryCount > 0) return 'masteryBoost';
  if (goal.focusMode === 'selectedTopics' && goal.selectedTopics.length) return 'deepDiveGoal';
  if (dueReviewCount > 0) return 'reviewDue';
  return 'quickReviewGoal';
}

export function createStudyPlan({ goal = loadStudyGoal(), history = [], analytics = null, allQuizzes = [], now = new Date() } = {}) {
  const normalized = normalizeStudyGoal(goal);
  if (!normalized || normalized.dismissed || normalized.active === false) {
    return { hasGoal: false, goal: null, warning: '', daysRemaining: 0, progressPercent: 0 };
  }

  const daysRemaining = diffDaysInclusive(normalized.targetDate, now);
  const isPastDue = daysRemaining <= 0;
  const completedQuestionCount = Math.max(
    normalized.completedQuestionCount || 0,
    countQuestionsSince(history, normalized.createdAt)
  );
  const totalPlannedQuestions = Math.max(normalized.dailyQuestionTarget, normalized.dailyQuestionTarget * Math.max(1, daysRemaining));
  const progressPercent = Math.max(0, Math.min(100, Math.round((completedQuestionCount / totalPlannedQuestions) * 100)));
  const dueReviewCount = toSafeInteger(analytics?.dueReviewCount, 0);
  const weakMasteryCount = toSafeInteger(analytics?.mastery?.weakCount, 0);
  const selectedTopicQuestionCount = countTopicQuestions(allQuizzes, normalized.selectedTopics);

  return {
    hasGoal: true,
    goal: normalized,
    daysRemaining,
    isPastDue,
    warning: isPastDue ? 'Ngày mục tiêu đã qua. Hãy cập nhật ngày mới để tiếp tục kế hoạch.' : '',
    todayTarget: normalized.dailyQuestionTarget,
    completedQuestionCount,
    totalPlannedQuestions,
    progressPercent,
    dueReviewCount,
    weakMasteryCount,
    selectedTopicQuestionCount,
    recommendedAction: getRecommendedAction(normalized, { dueReviewCount, weakMasteryCount }),
    recommendedReason: dueReviewCount > 0
      ? `Có ${dueReviewCount} câu đến hạn ôn, nên ưu tiên trước.`
      : weakMasteryCount > 0
        ? `Có ${weakMasteryCount} câu mastery thấp phù hợp để củng cố.`
        : `Mục tiêu hôm nay là ${normalized.dailyQuestionTarget} câu.`
  };
}
