const SAFE_MIN_WEIGHT = 0.1;
const DEFAULT_SEED = null;

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashSeed(value) {
  const text = String(value ?? '');
  let hash = 2166136261;

  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createSeededRandom(seed = DEFAULT_SEED) {
  if (seed == null || seed === '') return Math.random;

  let state = hashSeed(seed) || 1;
  return function seededRandom() {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeReviewMap(reviewSchedule = []) {
  if (reviewSchedule instanceof Map) return reviewSchedule;

  const map = new Map();
  const items = Array.isArray(reviewSchedule) ? reviewSchedule : [];

  items.forEach(item => {
    const key = String(item?.questionKey || '').trim();
    if (key) map.set(key, item);
  });

  return map;
}

function normalizeBookmarkSet(bookmarks = []) {
  if (bookmarks instanceof Set) return bookmarks;

  const set = new Set();
  const items = Array.isArray(bookmarks) ? bookmarks : [];

  items.forEach(item => {
    const key = typeof item === 'string' ? item : item?.questionKey;
    if (key) set.add(String(key));
  });

  return set;
}

function addHistoryStats(stats, key, isCorrect) {
  if (!key) return;

  const current = stats.get(key) || {
    attempts: 0,
    correctCount: 0,
    wrongCount: 0,
    lastSeenAt: 0
  };

  current.attempts += 1;
  if (isCorrect) current.correctCount += 1;
  else current.wrongCount += 1;
  stats.set(key, current);
}

export function buildHistoryStats(history = []) {
  const stats = new Map();
  const items = Array.isArray(history) ? history : [];

  items.forEach(item => {
    const createdAt = new Date(item?.createdAt || 0).getTime() || 0;
    const details = item?.details?.questions;
    if (!Array.isArray(details)) return;

    details.forEach(detail => {
      const isCorrect = detail?.isCorrect === true;
      const key = String(detail?.questionKey || '').trim();
      addHistoryStats(stats, key, isCorrect);

      const text = String(detail?.questionText || '').trim();
      if (text && !key) addHistoryStats(stats, `text:${text.toLowerCase().replace(/\s+/g, ' ')}`, isCorrect);

      const current = stats.get(key);
      if (current && createdAt > current.lastSeenAt) current.lastSeenAt = createdAt;
    });
  });

  return stats;
}

function getItemKey(item) {
  return String(item?.questionKey || '').trim();
}

function getHistoryStatForItem(item, historyStats) {
  const key = getItemKey(item);
  if (key && historyStats?.has(key)) return historyStats.get(key);

  const text = String(item?.question?.text || '').trim();
  if (!text) return null;
  return historyStats?.get(`text:${text.toLowerCase().replace(/\s+/g, ' ')}`) || null;
}


function normalizeMasteryMap(mastery = null) {
  if (mastery instanceof Map) return mastery;

  const map = new Map();
  const items = Array.isArray(mastery?.questionMastery)
    ? mastery.questionMastery
    : Array.isArray(mastery)
      ? mastery
      : [];

  items.forEach(item => {
    const key = String(item?.questionKey || '').trim();
    if (key) map.set(key, item);
  });

  return map;
}

function getMasteryForItem(item, masteryMap) {
  const key = getItemKey(item);
  if (key && masteryMap?.has(key)) return masteryMap.get(key);
  return null;
}

function getModeMultipliers(mode) {
  if (mode === 'quickReview') {
    return {
      neverAnswered: 1.35,
      wrong: 1.45,
      due: 1.6,
      bookmarked: 1,
      masteredPenalty: 1.2,
      lowMastery: 1.55,
      highMasteryPenalty: 1.35
    };
  }

  if (mode === 'mockExam') {
    return {
      neverAnswered: 0.45,
      wrong: 0.45,
      due: 0.4,
      bookmarked: 0.35,
      masteredPenalty: 0.45,
      lowMastery: 0.35,
      highMasteryPenalty: 0.35
    };
  }

  if (mode === 'masteryBoost') {
    return {
      neverAnswered: 1.1,
      wrong: 1.45,
      due: 1.55,
      bookmarked: 0.85,
      masteredPenalty: 1.4,
      lowMastery: 1.9,
      highMasteryPenalty: 1.6
    };
  }

  return {
    neverAnswered: 1,
    wrong: 1,
    due: 1,
    bookmarked: 1,
    masteredPenalty: 1,
    lowMastery: 1,
    highMasteryPenalty: 1
  };
}

export function calculateQuestionWeight(item, context = {}) {
  const mode = context.mode || context.preset || 'custom';
  const historyStats = context.historyStats instanceof Map ? context.historyStats : buildHistoryStats(context.history);
  const reviewMap = normalizeReviewMap(context.reviewSchedule);
  const dueReviewKeys = context.dueReviewKeys instanceof Set ? context.dueReviewKeys : new Set();
  const bookmarkKeys = normalizeBookmarkSet(context.bookmarks || context.bookmarkKeys);
  const multipliers = getModeMultipliers(mode);
  const masteryMap = normalizeMasteryMap(context.mastery);
  const questionKey = getItemKey(item);
  const stat = getHistoryStatForItem(item, historyStats);
  const review = questionKey ? reviewMap.get(questionKey) : null;
  const mastery = getMasteryForItem(item, masteryMap);
  const masteryScore = toNumber(mastery?.masteryScore, NaN);
  const now = toNumber(context.now, Date.now());

  let weight = 1;
  const attempts = toNumber(stat?.attempts, 0);
  const wrongCount = toNumber(stat?.wrongCount, 0);
  const correctCount = toNumber(stat?.correctCount, 0);
  const correctStreak = toNumber(review?.correctStreak, 0);
  const reviewWrongCount = toNumber(review?.wrongCount, 0);
  const isDue = Boolean(
    questionKey && (
      dueReviewKeys.has(questionKey) ||
      (review?.dueAt && new Date(review.dueAt).getTime() <= now)
    )
  );

  if (!attempts && !review) weight += 2 * multipliers.neverAnswered;
  if (wrongCount > 0) weight += clamp(wrongCount, 1, 4) * multipliers.wrong;
  if (reviewWrongCount > 0) weight += clamp(reviewWrongCount * 0.5, 0.5, 2.5) * multipliers.wrong;
  if (isDue) weight += 3 * multipliers.due;

  if (attempts > 0) {
    const wrongRate = wrongCount / Math.max(1, attempts);
    weight += clamp(wrongRate * 2, 0, 2) * multipliers.wrong;
  }

  if (questionKey && bookmarkKeys.has(questionKey)) weight += 0.5 * multipliers.bookmarked;

  if (Number.isFinite(masteryScore)) {
    if (masteryScore < 40) weight += 3.2 * multipliers.lowMastery;
    else if (masteryScore < 60) weight += 2.1 * multipliers.lowMastery;
    else if (masteryScore < 75 && mode !== 'mockExam') weight += 0.8 * multipliers.lowMastery;

    if (masteryScore >= 88 && !isDue) {
      weight -= 1.4 * multipliers.highMasteryPenalty;
      if (mode !== 'mockExam') weight *= 0.72;
    } else if (masteryScore >= 75 && !isDue && mode !== 'mockExam') {
      weight *= 0.88;
    }
  }

  const masterySignals = correctStreak + Math.max(0, correctCount - wrongCount);
  if (masterySignals >= 3 && !isDue) {
    weight -= clamp(masterySignals * 0.25, 0.5, 2) * multipliers.masteredPenalty;
  }

  if (review?.dueAt && new Date(review.dueAt).getTime() > now && correctStreak >= 2) {
    weight *= mode === 'mockExam' ? 0.85 : 0.65;
  }

  return clamp(weight, SAFE_MIN_WEIGHT, 25);
}

function uniqueByQuestionKey(items = []) {
  const seen = new Set();
  const result = [];

  items.forEach((item, index) => {
    const key = getItemKey(item) || `${item?.quizIndex ?? 'q'}:${item?.questionIndex ?? index}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });

  return result;
}

function weightedPickOne(entries, random) {
  const totalWeight = entries.reduce((sum, entry) => sum + Math.max(SAFE_MIN_WEIGHT, toNumber(entry.weight, SAFE_MIN_WEIGHT)), 0);
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) return Math.floor(random() * entries.length);

  let threshold = random() * totalWeight;
  for (let i = 0; i < entries.length; i++) {
    threshold -= Math.max(SAFE_MIN_WEIGHT, toNumber(entries[i].weight, SAFE_MIN_WEIGHT));
    if (threshold <= 0) return i;
  }

  return entries.length - 1;
}

export function weightedSampleQuestions(candidates = [], requestedCount = 0, context = {}) {
  const count = Math.max(0, Math.round(Number(requestedCount) || 0));
  const pool = uniqueByQuestionKey(Array.isArray(candidates) ? candidates : []);
  if (!pool.length || count <= 0) return [];
  if (pool.length <= count) return pool.slice();

  const random = typeof context.random === 'function' ? context.random : createSeededRandom(context.seed);
  const entries = pool.map(item => ({
    item,
    weight: calculateQuestionWeight(item, context)
  }));

  if (!entries.some(entry => Number.isFinite(entry.weight) && entry.weight > 0)) {
    return pool
      .map(item => ({ item, sort: random() }))
      .sort((a, b) => a.sort - b.sort)
      .slice(0, count)
      .map(entry => entry.item);
  }

  const selected = [];
  const working = entries.slice();

  while (selected.length < count && working.length) {
    const pickedIndex = weightedPickOne(working, random);
    const [picked] = working.splice(pickedIndex, 1);
    if (picked?.item) selected.push(picked.item);
  }

  return selected;
}

export function weightedBalancedSampleByGroup(candidates = [], requestedCount = 0, getGroupKey = item => item?.topicKey || 'default', context = {}) {
  const count = Math.max(0, Math.round(Number(requestedCount) || 0));
  const pool = uniqueByQuestionKey(Array.isArray(candidates) ? candidates : []);
  if (!pool.length || count <= 0) return [];
  if (pool.length <= count) return pool.slice();

  const groups = new Map();
  pool.forEach(item => {
    const key = String(getGroupKey(item) || 'default');
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  });

  const selected = [];
  const active = Array.from(groups.entries()).filter(([, items]) => items.length);
  const random = typeof context.random === 'function' ? context.random : createSeededRandom(context.seed);

  while (selected.length < count && active.length) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (selected.length >= count) break;
      const [groupKey, items] = active[i];
      const [picked] = weightedSampleQuestions(items, 1, {
        ...context,
        random,
        mode: context.mode === 'mockExam' ? 'mockExam' : context.mode
      });

      if (picked) {
        selected.push(picked);
        const removeIndex = items.indexOf(picked);
        if (removeIndex >= 0) items.splice(removeIndex, 1);
      }

      if (!items.length) active.splice(i, 1);
      else active[i] = [groupKey, items];
    }
  }

  return selected;
}
