import { normalizeDateObject, toTime } from '../utils/date.js';
import { safeNumber } from '../utils/number.js';
function safeDateTime(value) {
  return toTime(value, Number.POSITIVE_INFINITY);
}

function normalizeNow(nowValue = new Date()) {
  return normalizeDateObject(nowValue);
}

function makeItemLookup(items = []) {
  return new Map(
    (Array.isArray(items) ? items : [])
      .filter(item => item?.id)
      .map(item => [String(item.id), item])
  );
}

function normalizeDueRecord(record) {
  if (!record?.itemId) return null;
  const dueTime = safeDateTime(record.dueAt);
  if (!Number.isFinite(dueTime)) return null;

  return {
    ...record,
    itemId: String(record.itemId),
    dueTime,
    wrongCount: Math.max(0, safeNumber(record.wrongCount, 0))
  };
}

export function selectDueReviewItems({ items = [], scheduleRecords = [], now = new Date(), limit = 50 } = {}) {
  const nowDate = normalizeNow(now);
  const nowTime = nowDate.getTime();
  const itemLookup = makeItemLookup(items);
  const seen = new Set();

  const dueEntries = (Array.isArray(scheduleRecords) ? scheduleRecords : [])
    .map(normalizeDueRecord)
    .filter(Boolean)
    .filter(record => record.dueTime <= nowTime)
    .filter(record => itemLookup.has(record.itemId))
    .sort((left, right) => {
      const overdueDelta = (nowTime - right.dueTime) - (nowTime - left.dueTime);
      if (overdueDelta !== 0) return overdueDelta;
      const dueDelta = left.dueTime - right.dueTime;
      if (dueDelta !== 0) return dueDelta;
      return right.wrongCount - left.wrongCount;
    })
    .filter(record => {
      if (seen.has(record.itemId)) return false;
      seen.add(record.itemId);
      return true;
    })
    .slice(0, Math.max(1, safeNumber(limit, 50)))
    .map(record => ({
      record,
      item: itemLookup.get(record.itemId)
    }));

  return dueEntries;
}

export function getDueReviewSummary({ items = [], scheduleRecords = [], now = new Date(), limit = 50 } = {}) {
  const itemLookup = makeItemLookup(items);
  const nowDate = normalizeNow(now);
  const nowTime = nowDate.getTime();
  const safeRecords = (Array.isArray(scheduleRecords) ? scheduleRecords : [])
    .map(normalizeDueRecord)
    .filter(Boolean);
  const dueRecords = safeRecords.filter(record => record.dueTime <= nowTime);
  const dueEntries = selectDueReviewItems({ items, scheduleRecords: safeRecords, now: nowDate, limit });
  const missingDueCount = dueRecords.filter(record => !itemLookup.has(record.itemId)).length;
  const futureRecords = safeRecords
    .filter(record => record.dueTime > nowTime && itemLookup.has(record.itemId))
    .sort((left, right) => left.dueTime - right.dueTime);

  return {
    dueCount: dueEntries.length,
    missingDueCount,
    totalScheduled: safeRecords.length,
    matchedScheduledCount: safeRecords.filter(record => itemLookup.has(record.itemId)).length,
    nextDueAt: dueEntries[0]?.record?.dueAt || futureRecords[0]?.dueAt || '',
    dueEntries
  };
}
