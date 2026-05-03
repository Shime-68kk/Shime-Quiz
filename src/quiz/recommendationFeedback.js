import { getJSON, removeStorageItem, setJSON } from '../utils/storage.js';

export const RECOMMENDATION_FEEDBACK_STORAGE_KEY = 'quizRecommendationFeedbackV1';
export const MAX_RECOMMENDATION_FEEDBACK_ITEMS = 100;

const VALID_FEEDBACK = new Set(['helpful', 'not_relevant', 'hidden_today']);
const VALID_REASON_CODES = new Set(['too_easy', 'too_hard', 'not_now', 'already_done']);

function todayKey(date = new Date()) {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  return safeDate.toISOString().slice(0, 10);
}

function toSafeString(value, maxLength = 120) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function normalizeFeedbackItem(item) {
  if (!item || typeof item !== 'object') return null;

  const recommendationType = toSafeString(item.recommendationType || item.type || item.id, 80);
  const feedback = toSafeString(item.feedback, 40);
  if (!recommendationType || !VALID_FEEDBACK.has(feedback)) return null;

  const timestamp = String(item.timestamp || new Date().toISOString());
  const reasonCode = toSafeString(item.reasonCode || item.reason, 40);

  return {
    recommendationType,
    timestamp,
    feedback,
    ...(VALID_REASON_CODES.has(reasonCode) ? { reasonCode } : {})
  };
}

export function loadRecommendationFeedback() {
  try {
    const raw = getJSON(RECOMMENDATION_FEEDBACK_STORAGE_KEY);
    if (!Array.isArray(raw)) return [];

    return raw
      .map(item => {
        try {
          return normalizeFeedbackItem(item);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .slice(0, MAX_RECOMMENDATION_FEEDBACK_ITEMS);
  } catch {
    removeStorageItem(RECOMMENDATION_FEEDBACK_STORAGE_KEY);
    return [];
  }
}

export function saveRecommendationFeedback({ recommendationType, feedback, reasonCode } = {}) {
  const item = normalizeFeedbackItem({
    recommendationType,
    feedback,
    reasonCode,
    timestamp: new Date().toISOString()
  });

  if (!item) return loadRecommendationFeedback();

  const next = [item, ...loadRecommendationFeedback()].slice(0, MAX_RECOMMENDATION_FEEDBACK_ITEMS);
  setJSON(RECOMMENDATION_FEEDBACK_STORAGE_KEY, next);
  return next;
}

export function getRecommendationFeedbackSummary(feedbackItems = loadRecommendationFeedback(), { now = new Date() } = {}) {
  const summary = new Map();
  const currentDay = todayKey(now);
  const items = Array.isArray(feedbackItems) ? feedbackItems : [];

  items.forEach(item => {
    const normalized = normalizeFeedbackItem(item);
    if (!normalized) return;

    const current = summary.get(normalized.recommendationType) || {
      helpful: 0,
      notRelevant: 0,
      hiddenToday: false,
      priorityAdjustment: 0
    };

    if (normalized.feedback === 'helpful') current.helpful += 1;
    if (normalized.feedback === 'not_relevant') current.notRelevant += 1;
    if (normalized.feedback === 'hidden_today' && normalized.timestamp.slice(0, 10) === currentDay) {
      current.hiddenToday = true;
    }

    summary.set(normalized.recommendationType, current);
  });

  summary.forEach(value => {
    value.priorityAdjustment = Math.max(-12, Math.min(12, value.helpful * 3 - value.notRelevant * 4));
  });

  return summary;
}
