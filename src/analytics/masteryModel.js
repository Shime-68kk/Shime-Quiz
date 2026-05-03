import { clamp } from '../utils/number.js';
import { toTime } from '../utils/date.js';

export const MASTERY_SCORE_MIN = 0;
export const MASTERY_SCORE_MAX = 100;
export const MASTERY_START_SCORE = 50;
export const WEAK_MASTERY_THRESHOLD = 60;
export const STRONG_MASTERY_THRESHOLD = 80;

const SCORABLE_STATUSES = new Set(['correct', 'wrong', 'unanswered']);

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return null;
  const id = String(item.id || '').trim();
  if (!id) return null;

  return {
    id,
    type: String(item.type || 'unknown'),
    prompt: String(item.prompt || item.front || '').trim(),
    subjectId: item.subjectId ? String(item.subjectId) : '',
    topicId: item.topicId ? String(item.topicId) : ''
  };
}

function normalizeHistoryRecord(record) {
  if (!record || typeof record !== 'object' || !Array.isArray(record.itemResults)) return null;
  return {
    id: String(record.id || ''),
    completedAt: record.completedAt || '',
    itemResults: record.itemResults
      .map(result => ({
        itemId: String(result?.itemId || '').trim(),
        status: String(result?.status || 'unscored'),
        subjectId: result?.subjectId ? String(result.subjectId) : '',
        topicId: result?.topicId ? String(result.topicId) : ''
      }))
      .filter(result => result.itemId)
  };
}

function normalizeScheduleRecord(record) {
  if (!record || typeof record !== 'object') return null;
  const itemId = String(record.itemId || '').trim();
  if (!itemId) return null;

  return {
    itemId,
    subjectId: record.subjectId ? String(record.subjectId) : '',
    topicId: record.topicId ? String(record.topicId) : '',
    dueAt: record.dueAt || '',
    correctStreak: Math.max(0, Math.floor(Number(record.correctStreak) || 0)),
    wrongCount: Math.max(0, Math.floor(Number(record.wrongCount) || 0)),
    repetitionCount: Math.max(0, Math.floor(Number(record.repetitionCount) || 0))
  };
}

function percent(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function getDaysOverdue(scheduleRecord, nowTime) {
  const dueTime = toTime(scheduleRecord?.dueAt);
  if (!dueTime || dueTime >= nowTime) return 0;
  return Math.max(0, Math.floor((nowTime - dueTime) / 86400000));
}

function createEmptyStats(item) {
  return {
    item,
    correctCount: 0,
    wrongCount: 0,
    unansweredCount: 0,
    unscoredCount: 0,
    reviewedFlashcardCount: 0,
    practicedCount: 0,
    lastStatus: '',
    lastReviewedAt: '',
    hasEvidence: false
  };
}

function computeItemScore(stats, scheduleRecord, nowTime) {
  const hasHistoryEvidence = stats.practicedCount > 0;
  const hasScheduleEvidence = Boolean(scheduleRecord);
  const hasEvidence = hasHistoryEvidence || hasScheduleEvidence;
  if (!hasEvidence) {
    return {
      score: MASTERY_START_SCORE,
      hasEvidence: false,
      reasons: ['no_evidence']
    };
  }

  const correctBoost = Math.min(24, stats.correctCount * 8);
  const wrongPenalty = Math.min(30, stats.wrongCount * 10);
  // Unanswered scorable items slightly reduce confidence without treating them as wrong.
  const unansweredPenalty = Math.min(9, stats.unansweredCount * 3);
  const streakBoost = Math.min(20, (scheduleRecord?.correctStreak || 0) * 5);
  const scheduledWrongPenalty = Math.min(20, (scheduleRecord?.wrongCount || 0) * 4);
  const overduePenalty = Math.min(10, getDaysOverdue(scheduleRecord, nowTime) * 2);
  const recentAdjustment = stats.lastStatus === 'correct'
    ? 5
    : stats.lastStatus === 'wrong'
      ? -6
      : stats.lastStatus === 'unanswered'
        ? -2
        : 0;

  const rawScore = MASTERY_START_SCORE
    + correctBoost
    - wrongPenalty
    - unansweredPenalty
    + streakBoost
    - scheduledWrongPenalty
    - overduePenalty
    + recentAdjustment;

  return {
    score: clamp(Math.round(rawScore)),
    hasEvidence: true,
    reasons: [
      stats.correctCount ? 'correct_history' : '',
      stats.wrongCount ? 'wrong_history' : '',
      stats.unansweredCount ? 'unanswered_history' : '',
      scheduleRecord?.correctStreak ? 'correct_streak' : '',
      scheduleRecord?.wrongCount ? 'scheduled_wrong_count' : '',
      overduePenalty ? 'overdue_due_date' : ''
    ].filter(Boolean)
  };
}

function aggregateBy(items, getKey) {
  const byKey = new Map();

  items.forEach(itemMastery => {
    if (!itemMastery.hasEvidence) return;
    const key = getKey(itemMastery);
    if (!key) return;

    const current = byKey.get(key) || {
      id: key,
      subjectId: itemMastery.subjectId || '',
      topicId: itemMastery.topicId || '',
      scoreTotal: 0,
      itemCount: 0,
      weakItemCount: 0,
      strongItemCount: 0,
      correctCount: 0,
      wrongCount: 0,
      unansweredCount: 0
    };

    current.scoreTotal += itemMastery.score;
    current.itemCount += 1;
    if (itemMastery.score < WEAK_MASTERY_THRESHOLD) current.weakItemCount += 1;
    if (itemMastery.score >= STRONG_MASTERY_THRESHOLD) current.strongItemCount += 1;
    current.correctCount += itemMastery.correctCount;
    current.wrongCount += itemMastery.wrongCount;
    current.unansweredCount += itemMastery.unansweredCount;
    byKey.set(key, current);
  });

  return [...byKey.values()].map(group => ({
    ...group,
    score: Math.round(group.scoreTotal / Math.max(1, group.itemCount))
  }));
}

export function computeMasteryModel({ items = [], historyRecords = [], scheduleRecords = [], now = new Date() } = {}) {
  const nowTime = toTime(now) || Date.now();
  const safeItems = Array.isArray(items) ? items.map(normalizeItem).filter(Boolean) : [];
  const statsByItemId = new Map(safeItems.map(item => [item.id, createEmptyStats(item)]));
  const schedulesByItemId = new Map(
    (Array.isArray(scheduleRecords) ? scheduleRecords : [])
      .map(normalizeScheduleRecord)
      .filter(Boolean)
      .map(record => [record.itemId, record])
  );

  const records = (Array.isArray(historyRecords) ? historyRecords : [])
    .map(normalizeHistoryRecord)
    .filter(Boolean)
    .sort((left, right) => toTime(left.completedAt) - toTime(right.completedAt));

  records.forEach(record => {
    record.itemResults.forEach(result => {
      const stats = statsByItemId.get(result.itemId);
      if (!stats) return;

      if (SCORABLE_STATUSES.has(result.status)) {
        stats.practicedCount += 1;
        stats.lastStatus = result.status;
        stats.lastReviewedAt = record.completedAt;
        stats.hasEvidence = true;
        if (result.status === 'correct') stats.correctCount += 1;
        if (result.status === 'wrong') stats.wrongCount += 1;
        if (result.status === 'unanswered') stats.unansweredCount += 1;
        return;
      }

      if (result.status === 'reviewed_flashcard') {
        stats.reviewedFlashcardCount += 1;
        stats.lastStatus = result.status;
        stats.lastReviewedAt = record.completedAt;
        stats.hasEvidence = true;
        return;
      }

      if (result.status === 'unscored') {
        stats.unscoredCount += 1;
        stats.lastStatus = result.status;
        stats.lastReviewedAt = record.completedAt;
        stats.hasEvidence = true;
      }
    });
  });

  const itemMastery = safeItems.map(item => {
    const stats = statsByItemId.get(item.id) || createEmptyStats(item);
    const schedule = schedulesByItemId.get(item.id) || null;
    const scoreData = computeItemScore(stats, schedule, nowTime);

    return {
      itemId: item.id,
      itemType: item.type,
      prompt: item.prompt,
      subjectId: item.subjectId || schedule?.subjectId || '',
      topicId: item.topicId || schedule?.topicId || '',
      score: scoreData.score,
      hasEvidence: scoreData.hasEvidence,
      correctCount: stats.correctCount,
      wrongCount: stats.wrongCount,
      unansweredCount: stats.unansweredCount,
      practicedCount: stats.practicedCount,
      reviewedFlashcardCount: stats.reviewedFlashcardCount,
      correctStreak: schedule?.correctStreak || 0,
      scheduleWrongCount: schedule?.wrongCount || 0,
      dueAt: schedule?.dueAt || '',
      reasons: scoreData.reasons
    };
  });

  const evidenceItems = itemMastery.filter(item => item.hasEvidence);
  const weakItems = evidenceItems
    .filter(item => item.score < WEAK_MASTERY_THRESHOLD)
    .sort((left, right) => left.score - right.score || right.wrongCount - left.wrongCount || left.prompt.localeCompare(right.prompt))
    .slice(0, 5);

  const topicMastery = aggregateBy(itemMastery, item => item.topicId)
    .sort((left, right) => left.score - right.score || right.weakItemCount - left.weakItemCount);
  const subjectMastery = aggregateBy(itemMastery, item => item.subjectId)
    .sort((left, right) => left.score - right.score || right.weakItemCount - left.weakItemCount);

  return {
    hasMasteryData: evidenceItems.length > 0,
    itemCount: itemMastery.length,
    evidenceItemCount: evidenceItems.length,
    weakItemCount: weakItems.length,
    averageMastery: evidenceItems.length
      ? Math.round(evidenceItems.reduce((total, item) => total + item.score, 0) / evidenceItems.length)
      : 0,
    correctRate: percent(
      evidenceItems.reduce((total, item) => total + item.correctCount, 0),
      evidenceItems.reduce((total, item) => total + item.correctCount + item.wrongCount, 0)
    ),
    itemMastery,
    weakItems,
    topicMastery,
    subjectMastery,
    weakTopics: topicMastery
      .filter(topic => topic.weakItemCount > 0 || topic.score < WEAK_MASTERY_THRESHOLD)
      .sort((left, right) => left.score - right.score || right.weakItemCount - left.weakItemCount)
      .slice(0, 3),
    strongTopics: topicMastery
      .filter(topic => topic.score >= STRONG_MASTERY_THRESHOLD)
      .sort((left, right) => right.score - left.score || right.itemCount - left.itemCount)
      .slice(0, 3),
    weakSubjects: subjectMastery
      .filter(subject => subject.weakItemCount > 0 || subject.score < WEAK_MASTERY_THRESHOLD)
      .slice(0, 3),
    generatedAt: new Date(nowTime).toISOString()
  };
}
