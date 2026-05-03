import { createMasteryModel } from './mastery.js';
import { createMistakePatternInsights } from './mistakePatterns.js';

const MAX_TREND_POINTS = 8;
const MAX_WEAK_ITEMS = 8;

function toSafeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toSafeInteger(value, fallback = 0) {
  return Math.max(0, Math.round(toSafeNumber(value, fallback)));
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function getLocalDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStudyStreak(history) {
  const activeDays = new Set(
    history
      .map(item => getLocalDateKey(item.createdAt))
      .filter(Boolean)
  );

  if (!activeDays.size) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (activeDays.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getQuestionTopic(question) {
  return String(
    question?.chapter ||
    question?.category ||
    question?.topic ||
    question?.section ||
    question?.tag ||
    ''
  ).trim();
}

function getQuestionKey(question) {
  return String(question?.questionKey || question?.questionId || normalizeText(question?.questionText)).trim();
}

function addWeakQuestion(bucket, question, attempt) {
  if (!question || question.isCorrect !== false) return;

  const key = getQuestionKey(question);
  if (!key) return;

  const current = bucket.get(key) || {
    key,
    questionText: String(question.questionText || 'Câu hỏi không có nội dung').trim(),
    wrongCount: 0,
    totalSeen: 0,
    lastMissedAt: '',
    sampleDetail: question,
    topic: getQuestionTopic(question)
  };

  current.wrongCount += 1;
  current.totalSeen += 1;
  current.lastMissedAt = attempt?.createdAt || current.lastMissedAt;
  if (!current.topic) current.topic = getQuestionTopic(question);
  if (!current.sampleDetail) current.sampleDetail = question;
  bucket.set(key, current);
}

function collectWeakQuestions(history) {
  const bucket = new Map();

  history.forEach(attempt => {
    const questions = attempt?.details?.questions;
    if (!Array.isArray(questions)) return;

    questions.forEach(question => addWeakQuestion(bucket, question, attempt));
  });

  return [...bucket.values()]
    .sort((a, b) => b.wrongCount - a.wrongCount || String(b.lastMissedAt).localeCompare(String(a.lastMissedAt)))
    .slice(0, MAX_WEAK_ITEMS);
}

function collectWeakTopics(weakQuestions) {
  const topics = new Map();

  weakQuestions.forEach(question => {
    if (!question.topic) return;

    const current = topics.get(question.topic) || { topic: question.topic, wrongCount: 0, questionCount: 0 };
    current.wrongCount += question.wrongCount;
    current.questionCount += 1;
    topics.set(question.topic, current);
  });

  return [...topics.values()]
    .sort((a, b) => b.wrongCount - a.wrongCount || b.questionCount - a.questionCount)
    .slice(0, MAX_WEAK_ITEMS);
}

function getRecentTrend(history) {
  return history
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-MAX_TREND_POINTS)
    .map(item => ({
      id: item.id,
      createdAt: item.createdAt,
      percentage: Math.max(0, Math.min(100, toSafeInteger(item.percentage, 0)))
    }));
}

export function createLearningAnalytics({ history = [], reviewSchedule = [], bookmarks = [], mistakeNotebook = [], allQuizzes = [] } = {}) {
  const attempts = Array.isArray(history) ? history.filter(Boolean) : [];
  const reviewItems = Array.isArray(reviewSchedule) ? reviewSchedule.filter(Boolean) : [];
  const bookmarkItems = Array.isArray(bookmarks) ? bookmarks.filter(Boolean) : [];
  const mistakeItems = Array.isArray(mistakeNotebook) ? mistakeNotebook.filter(Boolean) : [];
  const totalAttempts = attempts.length;
  const totalQuestionsAnswered = attempts.reduce((sum, item) => sum + toSafeInteger(item.totalQuestions, 0), 0);
  const totalWrongQuestions = attempts.reduce((sum, item) => sum + toSafeInteger(item.wrongCount, 0), 0);
  const totalPercentage = attempts.reduce((sum, item) => sum + toSafeNumber(item.percentage, 0), 0);
  const averageScore = totalAttempts ? Math.round(totalPercentage / totalAttempts) : 0;
  const bestScore = attempts.reduce((best, item) => Math.max(best, toSafeInteger(item.percentage, 0)), 0);
  const now = Date.now();
  const dueReviewCount = reviewItems.filter(item => new Date(item.dueAt).getTime() <= now).length;
  const weakQuestions = collectWeakQuestions(attempts);
  const openMistakeCount = mistakeItems.filter(item => (item?.status || 'open') === 'open').length;
  const mastery = createMasteryModel({
    history: attempts,
    reviewSchedule: reviewItems,
    bookmarks: bookmarkItems,
    allQuizzes
  });
  const mistakePatterns = createMistakePatternInsights({
    history: attempts,
    notebook: mistakeItems,
    reviewSchedule: reviewItems,
    mastery
  });

  return {
    totalAttempts,
    totalQuestionsAnswered,
    averageScore,
    bestScore,
    recentTrend: getRecentTrend(attempts),
    totalWrongQuestions,
    dueReviewCount,
    bookmarkCount: bookmarkItems.length,
    mistakeNotebookCount: mistakeItems.length,
    openMistakeCount,
    studyStreak: getStudyStreak(attempts),
    weakQuestions,
    weakTopics: collectWeakTopics(weakQuestions),
    mastery,
    mistakePatterns,
    canPracticeWeak: weakQuestions.length > 0
  };
}
