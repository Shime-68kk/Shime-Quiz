import { createQuestionKey } from './spacedRepetition.js';

export const MAX_MASTERY_ITEMS = 12;
const DEFAULT_MASTERY = 50;

function toSafeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function hashString(value) {
  const text = normalizeText(value);
  let hash = 2166136261;

  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function getTopicLabel(question = {}, quiz = {}) {
  const fields = [
    question.chapter,
    question.category,
    question.topic,
    question.section,
    question.group,
    question.tag,
    Array.isArray(question.tags) ? question.tags[0] : '',
    quiz.chapter,
    quiz.category,
    quiz.topic,
    quiz.title
  ];

  const value = fields.find(item => String(item ?? '').trim());
  return String(value || 'Tất cả câu hỏi').trim();
}

function getDetailTopic(detail = {}) {
  return String(
    detail.chapter ||
    detail.category ||
    detail.topic ||
    detail.section ||
    detail.group ||
    detail.tag ||
    ''
  ).trim();
}

function getDetailKey(detail = {}) {
  if (detail.questionKey) return String(detail.questionKey);
  if (detail.questionId) return `detail-id:${hashString(detail.questionId)}`;
  if (detail.questionText) return `detail-text:${hashString(detail.questionText)}`;
  return '';
}

function getCurrentQuestionKey(question, quiz) {
  return createQuestionKey(question, quiz) || `current-text:${hashString(question?.text || '')}`;
}

function createEmptyStats(key) {
  return {
    questionKey: key,
    questionText: '',
    topic: '',
    attempts: 0,
    correctCount: 0,
    wrongCount: 0,
    recentOutcomes: [],
    lastAnsweredAt: '',
    lastCorrectAt: '',
    source: 'history'
  };
}

function addCurrentQuestions(statsMap, allQuizzes = []) {
  const quizzes = Array.isArray(allQuizzes) ? allQuizzes : [];

  quizzes.forEach(quiz => {
    const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];

    questions.forEach(question => {
      if (!question || typeof question !== 'object') return;
      const key = getCurrentQuestionKey(question, quiz);
      if (!key) return;

      const current = statsMap.get(key) || createEmptyStats(key);
      current.questionText = current.questionText || String(question.text || '').trim();
      current.topic = current.topic || getTopicLabel(question, quiz);
      current.source = current.attempts ? current.source : 'current';
      statsMap.set(key, current);
    });
  });
}

function addHistoryDetails(statsMap, history = []) {
  const attempts = Array.isArray(history) ? history : [];
  const sortedAttempts = attempts
    .filter(Boolean)
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  sortedAttempts.forEach(attempt => {
    const details = attempt?.details?.questions;
    if (!Array.isArray(details)) return;

    details.forEach(detail => {
      const key = getDetailKey(detail);
      if (!key) return;

      const current = statsMap.get(key) || createEmptyStats(key);
      const isCorrect = detail.isCorrect === true;
      current.questionText = current.questionText || String(detail.questionText || '').trim();
      current.topic = current.topic || getDetailTopic(detail);
      current.attempts += 1;
      if (isCorrect) {
        current.correctCount += 1;
        current.lastCorrectAt = attempt.createdAt || current.lastCorrectAt;
      } else {
        current.wrongCount += 1;
      }
      current.recentOutcomes.push(isCorrect);
      if (current.recentOutcomes.length > 6) current.recentOutcomes.shift();
      current.lastAnsweredAt = attempt.createdAt || current.lastAnsweredAt;
      current.source = 'history';
      statsMap.set(key, current);
    });
  });
}

function normalizeReviewMap(reviewSchedule = []) {
  const map = new Map();
  const items = Array.isArray(reviewSchedule) ? reviewSchedule : [];

  items.forEach(item => {
    if (!item || typeof item !== 'object') return;
    const key = String(item.questionKey || '').trim();
    if (!key) return;
    map.set(key, item);
  });

  return map;
}

function daysSince(value, now = Date.now()) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return null;
  return Math.max(0, (now - time) / 86400000);
}

function computeQuestionMastery(stats, reviewItem, bookmarkSet, now = Date.now()) {
  let score = DEFAULT_MASTERY;
  const attempts = Math.max(0, stats.attempts || 0);
  const correctCount = Math.max(0, stats.correctCount || 0);
  const wrongCount = Math.max(0, stats.wrongCount || 0);
  const reviewWrongCount = Math.max(0, toSafeNumber(reviewItem?.wrongCount, 0));
  const correctStreak = Math.max(0, toSafeNumber(reviewItem?.correctStreak, 0));
  const repetitionCount = Math.max(0, toSafeNumber(reviewItem?.repetitionCount, 0));

  if (!attempts) {
    score -= 5;
  } else {
    score += Math.min(24, correctCount * 7);
    score -= Math.min(36, wrongCount * 10);

    stats.recentOutcomes.forEach((isCorrect, index) => {
      const recencyWeight = (index + 1) / stats.recentOutcomes.length;
      score += isCorrect ? 5 * recencyWeight : -7 * recencyWeight;
    });
  }

  score += Math.min(18, correctStreak * 6);
  score += Math.min(10, repetitionCount * 2);
  score -= Math.min(22, reviewWrongCount * 4);

  const dueTime = new Date(reviewItem?.dueAt).getTime();
  if (Number.isFinite(dueTime)) {
    if (dueTime <= now) {
      const overdueDays = Math.max(0, (now - dueTime) / 86400000);
      score -= Math.min(18, 5 + overdueDays * 2);
    } else if (correctStreak >= 3 && repetitionCount >= 3) {
      score += 4;
    }
  }

  const lastReviewedDays = daysSince(reviewItem?.lastReviewedAt, now);
  if (lastReviewedDays != null && correctStreak > 0) {
    if (lastReviewedDays <= 3) score += 6;
    else if (lastReviewedDays <= 14) score += 3;
    else if (lastReviewedDays >= 30) score -= 4;
  }

  if (bookmarkSet?.has(stats.questionKey) && score < 80) score -= 2;

  return clamp(Math.round(score));
}

function describeMastery(item) {
  if (!item.attempts) return 'Chưa làm';
  if (item.masteryScore < 40) return 'Cần luyện lại';
  if (item.masteryScore < 70) return 'Đang học';
  if (item.masteryScore < 88) return 'Khá vững';
  return 'Đã vững';
}

function createTopicMastery(questionMastery) {
  const topics = new Map();

  questionMastery.forEach(item => {
    const topic = item.topic || 'Tất cả câu hỏi';
    const current = topics.get(topic) || {
      topic,
      questionCount: 0,
      weakCount: 0,
      totalScore: 0,
      masteryScore: 0
    };

    current.questionCount += 1;
    current.totalScore += item.masteryScore;
    if (item.masteryScore < 60) current.weakCount += 1;
    topics.set(topic, current);
  });

  return [...topics.values()]
    .map(topic => ({
      ...topic,
      masteryScore: topic.questionCount ? Math.round(topic.totalScore / topic.questionCount) : 0
    }))
    .sort((a, b) => a.masteryScore - b.masteryScore || b.weakCount - a.weakCount);
}

export function createMasteryModel({ history = [], reviewSchedule = [], bookmarks = [], allQuizzes = [] } = {}) {
  const statsMap = new Map();
  const bookmarkSet = new Set((Array.isArray(bookmarks) ? bookmarks : []).map(item => item?.questionKey).filter(Boolean));
  const reviewMap = normalizeReviewMap(reviewSchedule);
  const now = Date.now();

  addCurrentQuestions(statsMap, allQuizzes);
  addHistoryDetails(statsMap, history);

  reviewMap.forEach((reviewItem, key) => {
    if (!statsMap.has(key)) statsMap.set(key, createEmptyStats(key));
  });

  const questionMastery = [...statsMap.values()].map(stats => {
    const reviewItem = reviewMap.get(stats.questionKey);
    const masteryScore = computeQuestionMastery(stats, reviewItem, bookmarkSet, now);
    return {
      questionKey: stats.questionKey,
      questionText: stats.questionText || 'Câu hỏi chưa có trong dữ liệu hiện tại',
      topic: stats.topic || 'Tất cả câu hỏi',
      attempts: stats.attempts,
      correctCount: stats.correctCount,
      wrongCount: stats.wrongCount + Math.max(0, toSafeNumber(reviewItem?.wrongCount, 0)),
      correctStreak: Math.max(0, toSafeNumber(reviewItem?.correctStreak, 0)),
      dueAt: reviewItem?.dueAt || null,
      isDue: reviewItem?.dueAt ? new Date(reviewItem.dueAt).getTime() <= now : false,
      isBookmarked: bookmarkSet.has(stats.questionKey),
      masteryScore,
      label: describeMastery({ ...stats, masteryScore })
    };
  });

  questionMastery.sort((a, b) => a.masteryScore - b.masteryScore || b.wrongCount - a.wrongCount || b.attempts - a.attempts);

  const topicMastery = createTopicMastery(questionMastery);
  const answeredItems = questionMastery.filter(item => item.attempts > 0 || item.correctStreak > 0 || item.wrongCount > 0);
  const overallSource = answeredItems.length ? answeredItems : questionMastery;
  const overallMastery = overallSource.length
    ? Math.round(overallSource.reduce((sum, item) => sum + item.masteryScore, 0) / overallSource.length)
    : 0;

  const weakestQuestions = questionMastery
    .filter(item => item.attempts > 0 || item.wrongCount > 0 || item.isDue)
    .slice(0, MAX_MASTERY_ITEMS);
  const strongestQuestions = questionMastery
    .filter(item => item.attempts > 0 || item.correctStreak > 0)
    .slice()
    .sort((a, b) => b.masteryScore - a.masteryScore || b.correctStreak - a.correctStreak)
    .slice(0, MAX_MASTERY_ITEMS);

  return {
    overallMastery,
    questionCount: questionMastery.length,
    answeredQuestionCount: answeredItems.length,
    weakCount: questionMastery.filter(item => item.masteryScore < 60).length,
    questionMastery,
    topicMastery,
    weakestTopics: topicMastery.slice(0, MAX_MASTERY_ITEMS),
    strongestTopics: topicMastery.slice().sort((a, b) => b.masteryScore - a.masteryScore).slice(0, MAX_MASTERY_ITEMS),
    weakestQuestions,
    strongestQuestions,
    canPracticeWeakMastery: weakestQuestions.length > 0
  };
}
