import { STUDY_GOAL_FOCUS_MODES } from '../state/studyGoalStorage.js';
import { safeNumber } from '../utils/number.js';

export const DUE_REVIEW_PROTECTION_COUNT = 5;

export const RECOMMENDATION_TYPES = {
  LIBRARY_EMPTY: 'library_empty',
  DUE_REVIEW: 'due_review',
  WEAK_MASTERY: 'weak_mastery',
  FIRST_SESSION: 'first_session',
  SMART_PRACTICE: 'smart_practice'
};


function getHistoryCount(historyRecords = []) {
  return Array.isArray(historyRecords) ? historyRecords.filter(Boolean).length : 0;
}

function getFirstWeakTopic(mastery) {
  if (!mastery || typeof mastery !== 'object') return null;
  const weakTopics = Array.isArray(mastery.weakTopics) ? mastery.weakTopics : [];
  return weakTopics[0] || null;
}

function getWeakItemCount(mastery) {
  if (!mastery || typeof mastery !== 'object') return 0;
  return safeNumber(mastery.weakItemCount || (Array.isArray(mastery.weakItems) ? mastery.weakItems.length : 0));
}

function getFeedbackAdjustment(feedbackSummary, type) {
  const details = feedbackSummary?.byType?.get?.(type);
  return safeNumber(details?.adjustment);
}

function isHiddenToday(feedbackSummary, type) {
  return Boolean(feedbackSummary?.hiddenTodayTypes?.has?.(type));
}

function buildRecommendationCandidates({ itemCount, historyCount, dueCount, weakTopic, weakItemCount, smartCount, activeGoal }) {
  const candidates = [];

  if (!itemCount) {
    candidates.push({
      type: RECOMMENDATION_TYPES.LIBRARY_EMPTY,
      title: 'Nạp dữ liệu học',
      reason: 'Bạn cần nạp dữ liệu học trước.',
      actionLabel: 'Nạp dữ liệu',
      tone: 'warning',
      priority: 1,
      protected: true
    });
    return candidates;
  }

  if (dueCount > 0) {
    candidates.push({
      type: RECOMMENDATION_TYPES.DUE_REVIEW,
      title: 'Ôn tập hôm nay',
      reason: `Có ${dueCount} câu đến hạn ôn.`,
      actionLabel: 'Ôn tập hôm nay',
      tone: 'warning',
      priority: activeGoal?.focusMode === STUDY_GOAL_FOCUS_MODES.DUE_REVIEW_FIRST ? 1.5 : 2,
      protected: dueCount >= DUE_REVIEW_PROTECTION_COUNT,
      dueCount
    });
  }

  if (weakTopic || weakItemCount > 0) {
    candidates.push({
      type: RECOMMENDATION_TYPES.WEAK_MASTERY,
      title: 'Luyện phần yếu',
      reason: 'Một số chủ đề cần luyện thêm.',
      actionLabel: 'Luyện phần yếu',
      tone: 'danger',
      priority: activeGoal?.focusMode === STUDY_GOAL_FOCUS_MODES.WEAK_AREAS_FIRST && dueCount < DUE_REVIEW_PROTECTION_COUNT ? 1.8 : 3,
      topicId: weakTopic?.topicId || weakTopic?.id || '',
      subjectId: weakTopic?.subjectId || '',
      weakItemCount
    });
  }

  if (!historyCount) {
    candidates.push({
      type: RECOMMENDATION_TYPES.FIRST_SESSION,
      title: 'Bắt đầu phiên học đầu tiên',
      reason: 'Hãy hoàn thành phiên học đầu tiên để hệ thống có dữ liệu.',
      actionLabel: 'Bắt đầu học',
      tone: 'info',
      priority: 4
    });
  }

  candidates.push({
    type: RECOMMENDATION_TYPES.SMART_PRACTICE,
    title: 'Luyện tập thông minh',
    reason: 'Ưu tiên câu từng sai, câu chưa luyện và câu đến hạn.',
    actionLabel: 'Luyện tập thông minh',
    tone: 'success',
    priority: historyCount ? 5 : 6,
    selectedCount: smartCount
  });

  return candidates;
}

export function createTodayRecommendation({
  items = [],
  historyRecords = [],
  dueSummary = {},
  mastery = {},
  smartPracticeSelection = null,
  feedbackSummary = null,
  studyGoal = null
} = {}) {
  const itemCount = Array.isArray(items) ? items.filter(item => item?.id).length : 0;
  const historyCount = getHistoryCount(historyRecords);
  const dueCount = safeNumber(dueSummary?.dueCount);
  const weakTopic = getFirstWeakTopic(mastery?.hasMasteryData ? mastery : null);
  const weakItemCount = mastery?.hasMasteryData ? getWeakItemCount(mastery) : 0;
  const smartCount = safeNumber(smartPracticeSelection?.selectedCount);
  const activeGoal = studyGoal?.isActive ? studyGoal : null;

  const candidates = buildRecommendationCandidates({
    itemCount,
    historyCount,
    dueCount,
    weakTopic,
    weakItemCount,
    smartCount,
    activeGoal
  }).map(candidate => ({
    ...candidate,
    feedbackAdjustment: getFeedbackAdjustment(feedbackSummary, candidate.type)
  }));

  const visibleCandidates = candidates
    .filter(candidate => candidate.protected || !isHiddenToday(feedbackSummary, candidate.type))
    .map(candidate => ({
      ...candidate,
      adjustedPriority: candidate.priority + candidate.feedbackAdjustment
    }))
    .sort((a, b) => {
      if (a.adjustedPriority !== b.adjustedPriority) return a.adjustedPriority - b.adjustedPriority;
      return a.priority - b.priority;
    });

  const selected = visibleCandidates[0] || candidates[0] || {
    type: RECOMMENDATION_TYPES.SMART_PRACTICE,
    title: 'Luyện tập thông minh',
    reason: 'Ưu tiên câu từng sai, câu chưa luyện và câu đến hạn.',
    actionLabel: 'Luyện tập thông minh',
    tone: 'success',
    priority: 5,
    selectedCount: smartCount
  };

  return {
    ...selected,
    hiddenFallback: visibleCandidates.length === 0 && candidates.length > 0,
    candidateCount: candidates.length,
    goalHint: activeGoal?.focusMode || ''
  };
}
