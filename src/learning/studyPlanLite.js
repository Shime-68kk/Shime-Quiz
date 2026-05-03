import { RECOMMENDATION_TYPES } from './recommendationLite.js';
import { safeNumber } from '../utils/number.js';
import { getLocalDateKey } from '../utils/date.js';
import { hashString } from '../utils/hash.js';
import { DEFAULT_WEIGHTED_PRACTICE_COUNT, selectWeightedPracticeItems } from './weightedPracticeSelector.js';

export const STUDY_PLAN_STEP_TYPES = {
  IMPORT_DATA: 'import_data',
  DUE_REVIEW: 'due_review',
  WEAK_AREA: 'weak_area',
  SMART_PRACTICE: 'smart_practice',
  FIRST_STUDY: 'first_study'
};

const PLAN_STEP_LIMIT = 3;


function makeRouteTargetKey(routeState = {}) {
  if (!routeState || typeof routeState !== 'object') return 'standard';
  const mode = String(routeState.mode || 'standard');
  const topicId = String(routeState.topicId || '');
  const subjectId = String(routeState.subjectId || '');
  const selectedIds = Array.isArray(routeState.selectedItemIds) ? routeState.selectedItemIds.join(',') : '';
  return `${mode}:${subjectId}:${topicId}:${hashString(selectedIds)}`;
}

function hasHiddenFeedback(feedbackSummary, recommendationType) {
  return Boolean(feedbackSummary?.hiddenTodayTypes?.has?.(recommendationType));
}

function hasHistory(historyRecords = []) {
  return Array.isArray(historyRecords) && historyRecords.some(Boolean);
}

function firstWeakTopic(mastery = {}) {
  const weakTopics = Array.isArray(mastery.weakTopics) ? mastery.weakTopics : [];
  return weakTopics[0] || null;
}

function makeStep({ dateKey, type, title, reason, actionLabel, status = 'Đề xuất', tone = 'info', estimatedItemCount = 0, routeState = null, targetKey = '' }) {
  const safeDateKey = dateKey || getLocalDateKey();
  const safeTargetKey = targetKey || makeRouteTargetKey(routeState);
  const id = `${safeDateKey}:${type}:${hashString(safeTargetKey)}`;
  return {
    id,
    type,
    title,
    reason,
    actionLabel,
    status,
    tone,
    estimatedItemCount: Math.max(0, Math.floor(Number(estimatedItemCount) || 0)),
    routeState: routeState ? { ...routeState, planStepId: id, planStepType: type, planDateKey: safeDateKey } : null
  };
}

export function createTodayStudyPlan({
  items = [],
  historyRecords = [],
  scheduleRecords = [],
  dueSummary = {},
  mastery = {},
  feedbackSummary = null,
  studyGoal = null,
  goalProgress = null,
  requestedCount = DEFAULT_WEIGHTED_PRACTICE_COUNT,
  dateKey = getLocalDateKey()
} = {}) {
  const safeItems = Array.isArray(items) ? items.filter(item => item?.id) : [];
  const itemCount = safeItems.length;
  const historyExists = hasHistory(historyRecords);
  const dueCount = safeNumber(dueSummary?.dueCount);
  const weakTopic = mastery?.hasMasteryData ? firstWeakTopic(mastery) : null;
  const weakItemCount = mastery?.hasMasteryData ? safeNumber(mastery.weakItemCount) : 0;
  const goalCompleted = Boolean(goalProgress?.hasGoal && goalProgress.remainingToday === 0);
  const steps = [];
  const notices = [];

  if (!itemCount) {
    return {
      hasPlan: true,
      goalCompleted,
      notices,
      steps: [makeStep({
        dateKey,
        type: STUDY_PLAN_STEP_TYPES.IMPORT_DATA,
        title: 'Nạp dữ liệu',
        reason: 'Bạn cần có học liệu trong thư viện trước khi bắt đầu.',
        actionLabel: 'Nạp dữ liệu',
        status: 'Ưu tiên',
        tone: 'warning',
        routeState: null
      })]
    };
  }

  if (goalCompleted) {
    notices.push('Bạn đã đạt mục tiêu hôm nay. Có thể luyện thêm nếu bạn muốn.');
  }

  if (dueCount > 0) {
    steps.push(makeStep({
      dateKey,
      type: STUDY_PLAN_STEP_TYPES.DUE_REVIEW,
      title: 'Ôn tập câu đến hạn',
      reason: `Có ${dueCount} câu đến hạn trong lịch ôn tập cục bộ.`,
      actionLabel: 'Ôn tập hôm nay',
      status: 'Ưu tiên',
      tone: 'warning',
      estimatedItemCount: dueCount,
      targetKey: 'due-review',
      routeState: {
        mode: 'due-review',
        source: 'study-plan-lite',
        label: 'Ôn tập hôm nay',
        dueCount
      }
    }));
  }

  if ((weakTopic || weakItemCount > 0) && !hasHiddenFeedback(feedbackSummary, RECOMMENDATION_TYPES.WEAK_MASTERY)) {
    const weakSelection = selectWeightedPracticeItems({
      items: safeItems,
      historyRecords,
      scheduleRecords,
      requestedCount,
      filter: {
        subjectId: weakTopic?.subjectId || '',
        topicId: weakTopic?.topicId || weakTopic?.id || ''
      }
    });

    const fallbackSelection = weakSelection.selectedCount
      ? weakSelection
      : selectWeightedPracticeItems({ items: safeItems, historyRecords, scheduleRecords, requestedCount });

    if (fallbackSelection.selectedCount > 0) {
      steps.push(makeStep({
        dateKey,
        type: STUDY_PLAN_STEP_TYPES.WEAK_AREA,
        title: 'Luyện phần yếu',
        reason: 'Một số chủ đề hoặc câu có mức nắm vững còn thấp.',
        actionLabel: 'Luyện phần yếu',
        status: dueCount > 0 ? 'Đề xuất' : 'Ưu tiên',
        tone: 'danger',
        estimatedItemCount: fallbackSelection.selectedCount,
        targetKey: `weak:${weakTopic?.subjectId || ''}:${weakTopic?.topicId || weakTopic?.id || ''}:${fallbackSelection.selectedItemIds.join(',')}`,
        routeState: {
          mode: 'smart-practice',
          source: 'study-plan-lite',
          label: 'Luyện phần yếu',
          requestedCount: fallbackSelection.requestedCount,
          selectedItemIds: fallbackSelection.selectedItemIds
        }
      }));
    }
  }

  if (!historyExists) {
    steps.push(makeStep({
      dateKey,
      type: STUDY_PLAN_STEP_TYPES.FIRST_STUDY,
      title: 'Bắt đầu học',
      reason: 'Hoàn thành phiên học đầu tiên để hệ thống có dữ liệu cục bộ.',
      actionLabel: 'Bắt đầu học',
      status: steps.length ? 'Đề xuất' : 'Ưu tiên',
      tone: 'info',
      estimatedItemCount: Math.min(itemCount, requestedCount),
      routeState: {
        mode: 'standard',
        source: 'study-plan-lite',
        label: 'Bắt đầu học'
      }
    }));
  }

  if (!hasHiddenFeedback(feedbackSummary, RECOMMENDATION_TYPES.SMART_PRACTICE)) {
    const smartSelection = selectWeightedPracticeItems({
      items: safeItems,
      historyRecords,
      scheduleRecords,
      requestedCount
    });

    if (smartSelection.selectedCount > 0) {
      steps.push(makeStep({
        dateKey,
        type: STUDY_PLAN_STEP_TYPES.SMART_PRACTICE,
        title: 'Luyện tập thông minh',
        reason: 'Ưu tiên câu đến hạn, câu từng sai và câu chưa luyện.',
        actionLabel: 'Luyện tập thông minh',
        status: steps.length ? 'Đề xuất' : 'Ưu tiên',
        tone: 'success',
        estimatedItemCount: smartSelection.selectedCount,
        targetKey: `smart:${smartSelection.selectedItemIds.join(',')}`,
        routeState: {
          mode: 'smart-practice',
          source: 'study-plan-lite',
          label: 'Luyện tập thông minh',
          requestedCount: smartSelection.requestedCount,
          selectedItemIds: smartSelection.selectedItemIds
        }
      }));
    }
  }

  const uniqueSteps = [];
  const seenTypes = new Set();
  steps.forEach(step => {
    if (!step?.type || seenTypes.has(step.type)) return;
    seenTypes.add(step.type);
    uniqueSteps.push(step);
  });

  if (!uniqueSteps.length) {
    uniqueSteps.push(makeStep({
      dateKey,
      type: STUDY_PLAN_STEP_TYPES.FIRST_STUDY,
      title: 'Bắt đầu học',
      reason: 'Không có kế hoạch phù hợp từ dữ liệu hiện tại, bạn vẫn có thể học tiếp.',
      actionLabel: 'Bắt đầu học',
      status: 'Đề xuất',
      tone: 'info',
      estimatedItemCount: Math.min(itemCount, requestedCount),
      routeState: {
        mode: 'standard',
        source: 'study-plan-lite',
        label: 'Bắt đầu học'
      }
    }));
  }

  return {
    hasPlan: uniqueSteps.length > 0,
    goalCompleted,
    notices,
    steps: uniqueSteps.slice(0, PLAN_STEP_LIMIT)
  };
}
