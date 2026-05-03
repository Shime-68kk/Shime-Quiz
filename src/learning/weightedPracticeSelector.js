import { toTime } from '../utils/date.js';
import { safeNumber, toNonNegativeInteger } from '../utils/number.js';

export const DEFAULT_WEIGHTED_PRACTICE_COUNT = 10;
export const WEIGHTED_PRACTICE_MODE = 'smart-practice';

function normalizeItemId(value) {
  return String(value || '').trim();
}

function makeScheduleMap(scheduleRecords = []) {
  const map = new Map();
  if (!Array.isArray(scheduleRecords)) return map;

  scheduleRecords.forEach(record => {
    const itemId = normalizeItemId(record?.itemId);
    if (!itemId) return;
    map.set(itemId, record);
  });

  return map;
}

function makeHistoryStats(historyRecords = []) {
  const stats = new Map();
  if (!Array.isArray(historyRecords)) return stats;

  historyRecords.forEach(record => {
    if (!record || !Array.isArray(record.itemResults)) return;
    const completedAt = toTime(record.completedAt, 0);

    record.itemResults.forEach(result => {
      const itemId = normalizeItemId(result?.itemId);
      if (!itemId) return;

      const entry = stats.get(itemId) || {
        itemId,
        practicedCount: 0,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
        lastCorrectAt: 0,
        lastPracticedAt: 0
      };

      const status = result.status;
      if (status === 'correct') {
        entry.practicedCount += 1;
        entry.correctCount += 1;
        entry.lastCorrectAt = Math.max(entry.lastCorrectAt, completedAt);
        entry.lastPracticedAt = Math.max(entry.lastPracticedAt, completedAt);
      } else if (status === 'wrong') {
        entry.practicedCount += 1;
        entry.wrongCount += 1;
        entry.lastPracticedAt = Math.max(entry.lastPracticedAt, completedAt);
      } else if (status === 'unanswered') {
        entry.practicedCount += 1;
        entry.unansweredCount += 1;
        entry.lastPracticedAt = Math.max(entry.lastPracticedAt, completedAt);
      }

      stats.set(itemId, entry);
    });
  });

  return stats;
}

function isDue(record, nowTime) {
  const dueAt = toTime(record?.dueAt, null);
  return Boolean(dueAt && dueAt <= nowTime);
}

function matchesFilter(item, filter = {}) {
  if (!item) return false;
  if (filter.topicId && String(item.topicId || '') !== String(filter.topicId)) return false;
  if (filter.subjectId && String(item.subjectId || '') !== String(filter.subjectId)) return false;
  return true;
}

function getCorrectRate(stats) {
  const scored = (stats?.correctCount || 0) + (stats?.wrongCount || 0);
  if (!scored) return null;
  return stats.correctCount / scored;
}

export function scoreWeightedPracticeItem({ item, historyStats, scheduleRecord, nowTime }) {
  const stats = historyStats || null;
  const practicedCount = stats?.practicedCount || 0;
  const wrongCount = stats?.wrongCount || 0;
  const correctCount = stats?.correctCount || 0;
  const correctRate = getCorrectRate(stats);
  const due = isDue(scheduleRecord, nowTime);
  let weight = 1;
  const reasons = ['Trọng số nền'];

  if (due) {
    weight += 3;
    reasons.push('Đến hạn ôn tập');
  }

  if (!practicedCount) {
    weight += 2;
    reasons.push('Chưa từng luyện');
  }

  if (wrongCount > 0) {
    const wrongBonus = Math.min(4, wrongCount);
    weight += wrongBonus;
    reasons.push(`Từng sai ${wrongCount} lần`);
  }

  if (correctRate !== null && correctRate < 0.8) {
    const lowRateBonus = correctRate < 0.4 ? 3 : correctRate < 0.6 ? 2 : 1;
    weight += lowRateBonus;
    reasons.push('Tỷ lệ đúng còn thấp');
  }

  if (correctCount >= 3 && wrongCount === 0 && !due) {
    weight -= 1.5;
    reasons.push('Đã đúng nhiều lần gần đây');
  }

  return {
    item,
    itemId: normalizeItemId(item?.id),
    weight: Math.max(0.25, Math.round(weight * 100) / 100),
    due,
    practicedCount,
    correctCount,
    wrongCount,
    correctRate,
    reasons
  };
}

export function selectWeightedPracticeItems({
  items = [],
  historyRecords = [],
  scheduleRecords = [],
  requestedCount = DEFAULT_WEIGHTED_PRACTICE_COUNT,
  filter = {},
  now = new Date()
} = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  const limit = toNonNegativeInteger(requestedCount, DEFAULT_WEIGHTED_PRACTICE_COUNT);
  const nowDate = now instanceof Date ? now : new Date(now || Date.now());
  const nowTime = Number.isNaN(nowDate.getTime()) ? Date.now() : nowDate.getTime();
  const scheduleMap = makeScheduleMap(scheduleRecords);
  const historyStats = makeHistoryStats(historyRecords);
  const seen = new Set();

  const candidates = safeItems
    .filter(item => {
      const itemId = normalizeItemId(item?.id);
      if (!itemId || seen.has(itemId)) return false;
      seen.add(itemId);
      return matchesFilter(item, filter);
    })
    .map(item => {
      const itemId = normalizeItemId(item.id);
      return scoreWeightedPracticeItem({
        item,
        historyStats: historyStats.get(itemId),
        scheduleRecord: scheduleMap.get(itemId),
        nowTime
      });
    })
    .sort((left, right) => {
      if (right.weight !== left.weight) return right.weight - left.weight;
      if (Number(right.due) !== Number(left.due)) return Number(right.due) - Number(left.due);
      if (right.wrongCount !== left.wrongCount) return right.wrongCount - left.wrongCount;
      if (left.practicedCount !== right.practicedCount) return left.practicedCount - right.practicedCount;
      return left.itemId.localeCompare(right.itemId);
    });

  const selectedEntries = candidates.slice(0, Math.min(limit, candidates.length));

  return {
    requestedCount: limit,
    candidateCount: candidates.length,
    selectedCount: selectedEntries.length,
    selectedEntries,
    selectedItems: selectedEntries.map(entry => entry.item),
    selectedItemIds: selectedEntries.map(entry => entry.itemId)
  };
}
