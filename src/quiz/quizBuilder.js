import { createQuestionKey, getDueReviewKeys, loadReviewSchedule } from './spacedRepetition.js';
import { loadBookmarks } from './bookmarks.js';
import { loadQuizHistory } from './history.js';
import { shuffleInPlace, strip } from '../utils/helpers.js';
import { buildHistoryStats, weightedBalancedSampleByGroup, weightedSampleQuestions } from './weightedSelection.js';
import { createMasteryModel } from './mastery.js';

export const QUIZ_BUILDER_TITLE_PREFIX = '🧩 Tạo đề';

const DEFAULT_COUNTS = {
  custom: 20,
  quickReview: 20,
  deepDive: 30,
  mockExam: 60,
  masteryBoost: 20
};

const MAX_BUILDER_QUESTIONS = 500;

function normalizeText(value) {
  return strip(String(value ?? '')).trim();
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

export function getQuestionTopic(question = {}, quiz = {}) {
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

function makeTopicKey(label) {
  return `topic:${hashString(label)}`;
}

function getQuestionIdentity(question, quiz) {
  return createQuestionKey(question, quiz) || `fallback:${hashString(question?.text || '')}`;
}

export function flattenQuestionPool(allQuizzes = []) {
  const quizzes = Array.isArray(allQuizzes) ? allQuizzes : [];
  const seen = new Set();
  const pool = [];

  quizzes.forEach((sourceQuiz, quizIndex) => {
    const questions = Array.isArray(sourceQuiz?.questions) ? sourceQuiz.questions : [];

    questions.forEach((question, questionIndex) => {
      if (!question || typeof question !== 'object') return;

      const questionKey = getQuestionIdentity(question, sourceQuiz);
      const fallbackKey = `${quizIndex}:${questionIndex}:${hashString(question.text || '')}`;
      const dedupeKey = questionKey || fallbackKey;
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);

      const topicLabel = getQuestionTopic(question, sourceQuiz);
      pool.push({
        question,
        sourceQuiz,
        quizIndex,
        questionIndex,
        questionKey,
        topicKey: makeTopicKey(topicLabel),
        topicLabel
      });
    });
  });

  return pool;
}

export function getBuilderTopics(allQuizzes = []) {
  const topicMap = new Map();

  flattenQuestionPool(allQuizzes).forEach(item => {
    const current = topicMap.get(item.topicKey) || {
      key: item.topicKey,
      label: item.topicLabel,
      count: 0
    };
    current.count += 1;
    topicMap.set(item.topicKey, current);
  });

  return Array.from(topicMap.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label, 'vi');
  });
}

function getWrongHistoryKeys(history = loadQuizHistory()) {
  const keys = new Set();
  const items = Array.isArray(history) ? history : [];

  items.forEach(item => {
    const details = item?.details?.questions;
    if (!Array.isArray(details)) return;

    details.forEach(detail => {
      if (!detail || detail.isCorrect !== false) return;
      if (detail.questionKey) keys.add(String(detail.questionKey));
      if (detail.questionText) keys.add(`text:${hashString(detail.questionText)}`);
    });
  });

  return keys;
}

function matchesWrongHistory(item, wrongKeys) {
  if (!wrongKeys?.size) return false;
  if (item.questionKey && wrongKeys.has(item.questionKey)) return true;
  return wrongKeys.has(`text:${hashString(item.question?.text || '')}`);
}

function uniqueItems(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = item.questionKey || `${item.quizIndex}:${item.questionIndex}:${hashString(item.question?.text || '')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pickRandom(items, count) {
  const copy = items.slice();
  shuffleInPlace(copy);
  return copy.slice(0, count);
}

function pickBalancedByTopic(items, count) {
  const groups = new Map();

  items.forEach(item => {
    const group = groups.get(item.topicKey) || [];
    group.push(item);
    groups.set(item.topicKey, group);
  });

  groups.forEach(group => shuffleInPlace(group));

  const picked = [];
  const activeGroups = Array.from(groups.values()).filter(group => group.length);

  while (picked.length < count && activeGroups.length) {
    for (let i = activeGroups.length - 1; i >= 0; i--) {
      if (picked.length >= count) break;
      const next = activeGroups[i].shift();
      if (next) picked.push(next);
      if (!activeGroups[i].length) activeGroups.splice(i, 1);
    }
  }

  return picked;
}

function clonePlain(value) {
  if (typeof globalThis.structuredClone === 'function') return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function prepareQuestion(item) {
  const question = clonePlain(item.question);
  question._id = question._id ?? question.id ?? item.questionIndex;
  question._reviewKey = question._reviewKey || item.questionKey;
  question._reviewSource = question._reviewSource || item.sourceQuiz?.title || item.topicLabel;
  return question;
}

function toPositiveCount(value, fallback) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(MAX_BUILDER_QUESTIONS, n);
}

function normalizeTopicKeys(topicKeys) {
  return new Set(Array.isArray(topicKeys) ? topicKeys.filter(Boolean).map(String) : []);
}

function createMasteryLookup(mastery) {
  const map = new Map();
  const items = Array.isArray(mastery?.questionMastery) ? mastery.questionMastery : [];

  items.forEach(item => {
    const key = String(item?.questionKey || '').trim();
    if (key) map.set(key, item);
  });

  return map;
}

function getMasteryForItem(item, masteryMap) {
  return item?.questionKey && masteryMap?.has(item.questionKey) ? masteryMap.get(item.questionKey) : null;
}

function hasLearningSignal(mastery) {
  return Boolean(mastery && (
    mastery.attempts > 0 ||
    mastery.wrongCount > 0 ||
    mastery.correctStreak > 0 ||
    mastery.isDue
  ));
}

export function getBuilderContext({ bookmarks, reviewKeys, reviewSchedule, history, allQuizzes } = {}) {
  const bookmarkItems = Array.isArray(bookmarks) ? bookmarks : loadBookmarks();
  const bookmarkKeys = new Set(bookmarkItems.map(item => item.questionKey).filter(Boolean));
  const dueReviewKeys = reviewKeys instanceof Set ? reviewKeys : getDueReviewKeys();
  const safeHistory = Array.isArray(history) ? history : loadQuizHistory();
  const wrongHistoryKeys = getWrongHistoryKeys(safeHistory);
  const safeReviewSchedule = Array.isArray(reviewSchedule) ? reviewSchedule : loadReviewSchedule();
  const historyStats = buildHistoryStats(safeHistory);
  const mastery = createMasteryModel({
    history: safeHistory,
    reviewSchedule: safeReviewSchedule,
    bookmarks: bookmarkItems,
    allQuizzes: Array.isArray(allQuizzes) ? allQuizzes : []
  });
  const masteryMap = createMasteryLookup(mastery);

  return { bookmarkKeys, dueReviewKeys, wrongHistoryKeys, reviewSchedule: safeReviewSchedule, historyStats, mastery, masteryMap };
}

export function getBuilderStats(allQuizzes = [], contextOptions = {}) {
  const context = contextOptions?.dueReviewKeys || contextOptions?.bookmarkKeys || contextOptions?.wrongHistoryKeys || contextOptions?.historyStats
    ? contextOptions
    : getBuilderContext({ ...contextOptions, allQuizzes });
  const pool = flattenQuestionPool(allQuizzes);
  return {
    total: pool.length,
    topics: getBuilderTopics(allQuizzes),
    dueCount: pool.filter(item => context.dueReviewKeys?.has(item.questionKey)).length,
    bookmarkedCount: pool.filter(item => context.bookmarkKeys?.has(item.questionKey)).length,
    weakCount: pool.filter(item => matchesWrongHistory(item, context.wrongHistoryKeys)).length,
    lowMasteryCount: pool.filter(item => {
      const mastery = getMasteryForItem(item, context.masteryMap);
      return hasLearningSignal(mastery) && mastery.masteryScore < 60;
    }).length
  };
}

function filterByOptions(pool, options = {}, context) {
  const topicKeys = normalizeTopicKeys(options.topicKeys);
  let items = pool.slice();

  if (topicKeys.size) items = items.filter(item => topicKeys.has(item.topicKey));
  if (options.includeBookmarked) items = items.filter(item => context.bookmarkKeys?.has(item.questionKey));
  if (options.includeDueReview) items = items.filter(item => context.dueReviewKeys?.has(item.questionKey));
  if (options.includeWeak) items = items.filter(item => (
    matchesWrongHistory(item, context.wrongHistoryKeys) ||
    (() => { const mastery = getMasteryForItem(item, context.masteryMap); return hasLearningSignal(mastery) && mastery.masteryScore < 65; })()
  ));

  return items;
}



function getDifficultyGroup(item) {
  const raw = String(
    item?.question?.difficulty ||
    item?.question?.level ||
    item?.question?.rank ||
    item?.question?.difficultyLevel ||
    ''
  ).trim().toLowerCase();

  if (!raw) return '';
  if (/^(1|easy|dễ|de|basic|nhanh)$/.test(raw)) return 'easy';
  if (/^(3|hard|khó|kho|advanced|nâng cao)$/.test(raw)) return 'hard';
  return 'medium';
}

function hasDifficultyData(items) {
  return Array.isArray(items) && items.some(item => Boolean(getDifficultyGroup(item)));
}

function getLowMasteryItems(items, context, threshold = 60) {
  return uniqueItems(items).filter(item => {
    const mastery = getMasteryForItem(item, context.masteryMap);
    return hasLearningSignal(mastery) && mastery.masteryScore < threshold;
  });
}

function getUnansweredItems(items, context) {
  return uniqueItems(items).filter(item => {
    const stat = item.questionKey ? context.historyStats?.get(item.questionKey) : null;
    const mastery = getMasteryForItem(item, context.masteryMap);
    return !stat?.attempts && !mastery?.attempts;
  });
}

function getTopicMasterySummary(selectedTopicKeys, context) {
  const topics = Array.isArray(context.mastery?.topicMastery) ? context.mastery.topicMastery : [];
  if (!selectedTopicKeys?.size || !topics.length) return '';

  const labels = Array.from(selectedTopicKeys).map(key => String(key));
  const matched = topics.filter(topic => labels.some(key => key === makeTopicKey(topic.topic)));
  if (!matched.length) return '';

  const avg = Math.round(matched.reduce((sum, topic) => sum + topic.masteryScore, 0) / matched.length);
  const weakCount = matched.reduce((sum, topic) => sum + (topic.weakCount || 0), 0);
  return `Mastery chủ đề khoảng ${avg}% · ${weakCount} câu cần củng cố.`;
}

function summarizeSelectionSources(selected, context, preset, selectedTopicKeys) {
  const total = selected.length || 0;
  if (!total) return '';

  const due = selected.filter(item => context.dueReviewKeys?.has(item.questionKey)).length;
  const wrong = selected.filter(item => matchesWrongHistory(item, context.wrongHistoryKeys)).length;
  const lowMastery = selected.filter(item => {
    const mastery = getMasteryForItem(item, context.masteryMap);
    return hasLearningSignal(mastery) && mastery.masteryScore < 60;
  }).length;
  const unanswered = getUnansweredItems(selected, context).length;
  const topicSummary = preset === 'deepDive' ? getTopicMasterySummary(selectedTopicKeys, context) : '';

  if (preset === 'mockExam') {
    const mockParts = ['cân bằng theo nhóm'];
    if (lowMastery) mockParts.push(`${lowMastery} mastery thấp`);
    if (unanswered) mockParts.push(`${unanswered} câu chưa làm`);
    return `Nguồn chọn: ${mockParts.join(' · ')}.`;
  }

  const parts = [];
  if (due) parts.push(`${due} cần ôn`);
  if (lowMastery) parts.push(`${lowMastery} mastery thấp`);
  if (wrong) parts.push(`${wrong} từng sai`);
  if (unanswered) parts.push(`${unanswered} chưa làm`);
  if (!parts.length) parts.push('ngẫu nhiên cân bằng');

  return topicSummary ? `${topicSummary} Nguồn chọn: ${parts.join(' · ')}.` : `Nguồn chọn: ${parts.join(' · ')}.`;
}

function getSelectionExplanation(preset) {
  if (preset === 'quickReview') {
    return 'Đề được ưu tiên theo câu sai, câu chưa làm và câu cần ôn.';
  }

  if (preset === 'deepDive') {
    return 'Đề tập trung trong chủ đề đã chọn và ưu tiên nhẹ theo dữ liệu học tập.';
  }

  if (preset === 'mockExam') {
    return 'Đề mô phỏng kiểm tra với lựa chọn cân bằng giữa các nhóm câu hỏi.';
  }

  if (preset === 'masteryBoost') {
    return 'Đề tập trung nâng vùng yếu bằng mastery thấp, câu cần ôn và câu từng sai.';
  }

  return 'Đề được chọn theo cấu hình hiện tại và ưu tiên nhẹ dữ liệu học tập.';
}

function makeSelectionContext(context, preset, options = {}) {
  return {
    ...context,
    mode: preset,
    preset,
    seed: options.seed,
    now: options.now,
    bookmarks: Array.from(context.bookmarkKeys || []).map(questionKey => ({ questionKey })),
    bookmarkKeys: context.bookmarkKeys,
    dueReviewKeys: context.dueReviewKeys,
    reviewSchedule: context.reviewSchedule,
    historyStats: context.historyStats,
    history: options.history,
    mastery: context.mastery,
    masteryMap: context.masteryMap
  };
}

function selectWeightedWithFallback(primaryItems, fallbackItems, count, selectionContext) {
  const primary = uniqueItems(primaryItems);
  const selected = weightedSampleQuestions(primary, count, selectionContext);

  if (selected.length >= count) return selected;

  const selectedKeys = new Set(selected.map(item => item.questionKey || `${item.quizIndex}:${item.questionIndex}`));
  const fallback = uniqueItems(fallbackItems).filter(item => {
    const key = item.questionKey || `${item.quizIndex}:${item.questionIndex}`;
    return !selectedKeys.has(key);
  });

  return uniqueItems([
    ...selected,
    ...weightedSampleQuestions(fallback, count - selected.length, selectionContext)
  ]).slice(0, count);
}

function selectForPreset(pool, preset, count, options, context) {
  const selectedTopicKeys = normalizeTopicKeys(options.topicKeys);
  const selectionContext = makeSelectionContext(context, preset, options);

  if (preset === 'quickReview') {
    const priorityPool = uniqueItems(pool).filter(item => (
      context.dueReviewKeys?.has(item.questionKey) ||
      matchesWrongHistory(item, context.wrongHistoryKeys) ||
      (() => { const mastery = getMasteryForItem(item, context.masteryMap); return hasLearningSignal(mastery) && mastery.masteryScore < 65; })()
    ));
    const fallbackPool = uniqueItems([...getUnansweredItems(pool, context), ...pool]);

    return selectWeightedWithFallback(priorityPool, fallbackPool, count, selectionContext);
  }

  if (preset === 'deepDive') {
    const scoped = selectedTopicKeys.size ? pool.filter(item => selectedTopicKeys.has(item.topicKey)) : pool;
    if (hasDifficultyData(scoped)) {
      return weightedBalancedSampleByGroup(scoped, count, item => getDifficultyGroup(item) || 'unknown', selectionContext);
    }
    return weightedSampleQuestions(scoped, count, selectionContext);
  }

  if (preset === 'mockExam') {
    const scoped = selectedTopicKeys.size ? pool.filter(item => selectedTopicKeys.has(item.topicKey)) : pool;
    return weightedBalancedSampleByGroup(scoped, count, item => item.topicKey, { ...selectionContext, mode: 'mockExam' });
  }

  if (preset === 'masteryBoost') {
    const lowMastery = getLowMasteryItems(pool, context, 65);
    const dueOrWrong = uniqueItems(pool).filter(item => (
      context.dueReviewKeys?.has(item.questionKey) ||
      matchesWrongHistory(item, context.wrongHistoryKeys)
    ));
    const priority = uniqueItems([...lowMastery, ...dueOrWrong]);
    return selectWeightedWithFallback(priority, pool, count, { ...selectionContext, mode: 'masteryBoost' });
  }

  const filtered = filterByOptions(pool, options, context);
  return weightedSampleQuestions(filtered.length ? filtered : pool, count, selectionContext);
}

export function buildCustomQuiz(allQuizzes = [], options = {}) {
  const context = getBuilderContext({ ...options, allQuizzes });
  const pool = flattenQuestionPool(allQuizzes);
  const preset = options.preset || 'custom';
  const fallbackCount = DEFAULT_COUNTS[preset] || DEFAULT_COUNTS.custom;
  const count = toPositiveCount(options.count, fallbackCount);
  const selected = uniqueItems(selectForPreset(pool, preset, count, options, context)).slice(0, count);

  if (!selected.length) {
    return {
      quiz: null,
      selectedCount: 0,
      availableCount: filterByOptions(pool, options, context).length,
      message: 'Không có câu hỏi phù hợp với cấu hình hiện tại.'
    };
  }

  const topicLabels = Array.from(new Set(selected.map(item => item.topicLabel))).slice(0, 3);
  const titleByPreset = {
    custom: 'Tạo đề tùy chỉnh',
    quickReview: 'Quick Review',
    deepDive: 'Deep Dive',
    mockExam: 'Mock Exam',
    masteryBoost: 'Mastery Boost'
  };

  const quiz = {
    title: `${QUIZ_BUILDER_TITLE_PREFIX} · ${titleByPreset[preset] || titleByPreset.custom} (${selected.length} câu)`,
    timeLimit: Math.max(0, Math.round(Number(options.timerMinutes) || 0) * 60),
    shuffle: Boolean(options.shuffle),
    questions: selected.map(prepareQuestion)
  };

  return {
    quiz,
    selectedCount: selected.length,
    availableCount: pool.length,
    topics: topicLabels,
    selectionHint: getSelectionExplanation(preset),
    sourceSummary: summarizeSelectionSources(selected, context, preset, normalizeTopicKeys(options.topicKeys)),
    message: selected.length < count
      ? `Chỉ tìm thấy ${selected.length}/${count} câu phù hợp.`
      : ''
  };
}
