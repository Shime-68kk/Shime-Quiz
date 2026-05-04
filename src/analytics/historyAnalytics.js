import { safeNumber } from '../utils/number.js';
import { getLocalDateKey, normalizeDateObject } from '../utils/date.js';

const SCORE_STATUSES = new Set(['correct', 'wrong']);
const KNOWN_STATUSES = new Set(['correct', 'wrong', 'unanswered', 'reviewed_flashcard', 'unscored']);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeNonNegativeNumber(value) {
  return Math.max(0, safeNumber(value, 0));
}

function safeDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function toLocalDateKey(value) {
  const date = safeDate(value);
  return date ? getLocalDateKey(date) : '';
}

function previousLocalDateKey(dateKey) {
  if (!dateKey) return '';
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return toLocalDateKey(date.toISOString());
}

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function normalizeStatus(status) {
  return KNOWN_STATUSES.has(status) ? status : 'unscored';
}

function normalizeRecord(record) {
  if (!record || typeof record !== 'object') return null;
  const completedAt = safeDate(record.completedAt);
  if (!completedAt) return null;

  const itemResults = asArray(record.itemResults).map((item, index) => ({
    itemId: String(item?.itemId || `item-${index}`),
    itemType: String(item?.itemType || 'unknown'),
    status: normalizeStatus(item?.status),
    topicId: item?.topicId ? String(item.topicId) : '',
    subjectId: item?.subjectId ? String(item.subjectId) : ''
  }));

  const correctCount = safeNonNegativeNumber(record.correctCount || itemResults.filter(item => item.status === 'correct').length);
  const wrongCount = safeNonNegativeNumber(record.wrongCount || itemResults.filter(item => item.status === 'wrong').length);
  const unansweredCount = safeNonNegativeNumber(record.unansweredCount || itemResults.filter(item => item.status === 'unanswered').length);
  const unscoredCount = safeNonNegativeNumber(record.unscoredCount || itemResults.filter(item => item.status === 'unscored').length);
  const flashcardReviewedCount = safeNonNegativeNumber(record.flashcardReviewedCount || itemResults.filter(item => item.status === 'reviewed_flashcard').length);
  const totalItems = safeNonNegativeNumber(record.totalItems || itemResults.length);
  const scoredTotal = correctCount + wrongCount;

  return {
    id: String(record.id || completedAt.toISOString()),
    completedAt: completedAt.toISOString(),
    durationSeconds: safeNonNegativeNumber(record.durationSeconds),
    totalItems,
    answeredCount: safeNonNegativeNumber(record.answeredCount || correctCount + wrongCount + flashcardReviewedCount + unscoredCount),
    correctCount,
    wrongCount,
    unansweredCount,
    unscoredCount,
    flashcardReviewedCount,
    percentage: scoredTotal ? percent(correctCount, scoredTotal) : safeNonNegativeNumber(record.percentage),
    itemResults
  };
}

function sortRecordsNewestFirst(records) {
  return [...records].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

function calculateStudyStreak(records) {
  const dateKeys = [...new Set(records.map(record => toLocalDateKey(record.completedAt)).filter(Boolean))].sort();
  if (!dateKeys.length) return 0;

  let streak = 1;
  let cursor = dateKeys[dateKeys.length - 1];
  for (let index = dateKeys.length - 2; index >= 0; index -= 1) {
    const expected = previousLocalDateKey(cursor);
    if (dateKeys[index] !== expected) break;
    streak += 1;
    cursor = dateKeys[index];
  }
  return streak;
}

function updateTopicSummary(map, item) {
  const topicId = item.topicId || 'unknown-topic';
  const current = map.get(topicId) || {
    topicId,
    subjectId: item.subjectId || '',
    practicedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    unansweredCount: 0,
    flashcardReviewedCount: 0,
    unscoredCount: 0,
    scoredCount: 0,
    accuracy: 0
  };

  current.practicedCount += 1;
  if (item.subjectId && !current.subjectId) current.subjectId = item.subjectId;
  if (item.status === 'correct') current.correctCount += 1;
  if (item.status === 'wrong') current.wrongCount += 1;
  if (item.status === 'unanswered') current.unansweredCount += 1;
  if (item.status === 'reviewed_flashcard') current.flashcardReviewedCount += 1;
  if (item.status === 'unscored') current.unscoredCount += 1;
  if (SCORE_STATUSES.has(item.status)) current.scoredCount += 1;
  current.accuracy = percent(current.correctCount, current.scoredCount);
  map.set(topicId, current);
}

export function computeHistoryAnalytics(rawRecords = []) {
  const records = sortRecordsNewestFirst(asArray(rawRecords).map(normalizeRecord).filter(Boolean));

  if (!records.length) {
    return {
      hasHistory: false,
      totalSessions: 0,
      totalItemsPracticed: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalUnanswered: 0,
      totalUnscored: 0,
      averageAccuracy: 0,
      bestSessionAccuracy: 0,
      flashcardsReviewed: 0,
      lastStudiedAt: '',
      studyStreakDays: 0,
      recentTrend: [],
      topicSummaries: [],
      weakestTopics: [],
      strongestTopics: []
    };
  }

  const totals = records.reduce((acc, record) => {
    acc.totalItemsPracticed += record.totalItems;
    acc.totalCorrect += record.correctCount;
    acc.totalWrong += record.wrongCount;
    acc.totalUnanswered += record.unansweredCount;
    acc.totalUnscored += record.unscoredCount;
    acc.flashcardsReviewed += record.flashcardReviewedCount;
    acc.bestSessionAccuracy = Math.max(acc.bestSessionAccuracy, record.percentage);
    return acc;
  }, {
    totalItemsPracticed: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalUnanswered: 0,
    totalUnscored: 0,
    flashcardsReviewed: 0,
    bestSessionAccuracy: 0
  });

  const scoredTotal = totals.totalCorrect + totals.totalWrong;
  const topicMap = new Map();
  records.forEach(record => {
    record.itemResults.forEach(item => updateTopicSummary(topicMap, item));
  });

  const topicSummaries = [...topicMap.values()].sort((a, b) => b.practicedCount - a.practicedCount);
  const weakestTopics = topicSummaries
    .filter(topic => topic.wrongCount > 0)
    .sort((a, b) => b.wrongCount - a.wrongCount || a.accuracy - b.accuracy)
    .slice(0, 3);
  const strongestTopics = topicSummaries
    .filter(topic => topic.scoredCount > 0)
    .sort((a, b) => b.accuracy - a.accuracy || b.correctCount - a.correctCount)
    .slice(0, 3);

  const recentTrend = records.slice(0, 8).reverse().map(record => ({
    id: record.id,
    completedAt: record.completedAt,
    percentage: record.percentage,
    correctCount: record.correctCount,
    wrongCount: record.wrongCount,
    totalItems: record.totalItems
  }));

  return {
    hasHistory: true,
    totalSessions: records.length,
    totalItemsPracticed: totals.totalItemsPracticed,
    totalCorrect: totals.totalCorrect,
    totalWrong: totals.totalWrong,
    totalUnanswered: totals.totalUnanswered,
    totalUnscored: totals.totalUnscored,
    averageAccuracy: percent(totals.totalCorrect, scoredTotal),
    bestSessionAccuracy: Math.round(totals.bestSessionAccuracy),
    flashcardsReviewed: totals.flashcardsReviewed,
    lastStudiedAt: records[0].completedAt,
    studyStreakDays: calculateStudyStreak(records),
    recentTrend,
    topicSummaries,
    weakestTopics,
    strongestTopics
  };
}
