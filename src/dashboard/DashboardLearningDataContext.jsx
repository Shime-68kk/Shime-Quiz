import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { computeHistoryAnalytics } from '../analytics/historyAnalytics.js';
import { computeMasteryModel } from '../analytics/masteryModel.js';
import { useLearningDataAdapter, useLearningDataSource, useLearningDataSummary } from '../data/learningDataStore.js';
import { createTodayRecommendation, RECOMMENDATION_TYPES } from '../learning/recommendationLite.js';
import { createTodayStudyPlan } from '../learning/studyPlanLite.js';
import { DEFAULT_WEIGHTED_PRACTICE_COUNT, selectWeightedPracticeItems } from '../learning/weightedPracticeSelector.js';
import {
  getTodayDateKey,
  readRecommendationFeedback,
  RECOMMENDATION_FEEDBACK_UPDATED_EVENT,
  summarizeRecommendationFeedback
} from '../state/recommendationFeedbackStorage.js';
import { getReviewScheduleSummary, readReviewSchedule, REVIEW_SCHEDULE_UPDATED_EVENT } from '../state/reviewScheduleStorage.js';
import {
  getStudyPlanStepProgress,
  readStudyPlanProgress,
  STUDY_PLAN_PROGRESS_UPDATED_EVENT
} from '../state/studyPlanProgressStorage.js';
import { computeStudyGoalProgress, readStudyGoal, STUDY_GOAL_UPDATED_EVENT } from '../state/studyGoalStorage.js';
import { readStudyHistory, STUDY_HISTORY_UPDATED_EVENT } from '../state/studyHistoryStorage.js';
import { getDueReviewSummary } from '../study/dueReviewSelector.js';

const DashboardLearningDataContext = createContext(null);

function readLocalDashboardState() {
  return {
    history: readStudyHistory(),
    schedule: readReviewSchedule(),
    feedback: readRecommendationFeedback(),
    goal: readStudyGoal(),
    planProgress: readStudyPlanProgress()
  };
}

export function DashboardLearningDataProvider({ children }) {
  const adapter = useLearningDataAdapter();
  const librarySummary = useLearningDataSummary();
  const dataSource = useLearningDataSource();
  const [localState, setLocalState] = useState(readLocalDashboardState);

  useEffect(() => {
    function refresh() {
      setLocalState(readLocalDashboardState());
    }

    window.addEventListener(STUDY_HISTORY_UPDATED_EVENT, refresh);
    window.addEventListener(REVIEW_SCHEDULE_UPDATED_EVENT, refresh);
    window.addEventListener(RECOMMENDATION_FEEDBACK_UPDATED_EVENT, refresh);
    window.addEventListener(STUDY_GOAL_UPDATED_EVENT, refresh);
    window.addEventListener(STUDY_PLAN_PROGRESS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener(STUDY_HISTORY_UPDATED_EVENT, refresh);
      window.removeEventListener(REVIEW_SCHEDULE_UPDATED_EVENT, refresh);
      window.removeEventListener(RECOMMENDATION_FEEDBACK_UPDATED_EVENT, refresh);
      window.removeEventListener(STUDY_GOAL_UPDATED_EVENT, refresh);
      window.removeEventListener(STUDY_PLAN_PROGRESS_UPDATED_EVENT, refresh);
    };
  }, []);

  const items = useMemo(() => adapter.getAllItems(), [adapter]);
  const subjects = useMemo(() => adapter.getSubjects(), [adapter]);
  const topics = useMemo(() => Array.isArray(adapter.data?.topics) ? adapter.data.topics : [], [adapter]);
  const subjectsById = useMemo(() => new Map(subjects.map(subject => [subject.id, subject])), [subjects]);
  const topicsById = useMemo(() => new Map(topics.map(topic => [topic.id, topic])), [topics]);

  const historyRecords = localState.history.records || [];
  const scheduleRecords = localState.schedule.records || [];
  const feedbackRecords = localState.feedback.records || [];
  const studyGoal = localState.goal.goal || null;
  const planProgressState = localState.planProgress || readStudyPlanProgress();
  const planProgressDay = planProgressState.day;

  const historyAnalytics = useMemo(
    () => computeHistoryAnalytics(historyRecords),
    [historyRecords]
  );

  const scheduleSummary = useMemo(
    () => getReviewScheduleSummary(scheduleRecords),
    [scheduleRecords]
  );

  const dueSummary = useMemo(
    () => getDueReviewSummary({ items, scheduleRecords }),
    [items, scheduleRecords]
  );

  const mastery = useMemo(
    () => computeMasteryModel({ items, historyRecords, scheduleRecords }),
    [items, historyRecords, scheduleRecords]
  );

  const feedbackSummary = useMemo(
    () => summarizeRecommendationFeedback(feedbackRecords, getTodayDateKey()),
    [feedbackRecords]
  );

  const goalProgress = useMemo(
    () => computeStudyGoalProgress(studyGoal, historyRecords),
    [studyGoal, historyRecords]
  );

  const smartPracticeSelection = useMemo(
    () => selectWeightedPracticeItems({
      items,
      historyRecords,
      scheduleRecords,
      requestedCount: DEFAULT_WEIGHTED_PRACTICE_COUNT
    }),
    [items, historyRecords, scheduleRecords]
  );

  const recommendation = useMemo(
    () => createTodayRecommendation({
      items,
      historyRecords,
      dueSummary,
      mastery,
      smartPracticeSelection,
      feedbackSummary,
      studyGoal
    }),
    [items, historyRecords, dueSummary, mastery, smartPracticeSelection, feedbackSummary, studyGoal]
  );

  const weakPracticeSelection = useMemo(() => {
    if (recommendation.type !== RECOMMENDATION_TYPES.WEAK_MASTERY) return null;
    return selectWeightedPracticeItems({
      items,
      historyRecords,
      scheduleRecords,
      requestedCount: DEFAULT_WEIGHTED_PRACTICE_COUNT,
      filter: {
        subjectId: recommendation.subjectId,
        topicId: recommendation.topicId
      }
    });
  }, [items, historyRecords, scheduleRecords, recommendation]);

  const todayPlan = useMemo(
    () => createTodayStudyPlan({
      items,
      historyRecords,
      scheduleRecords,
      dueSummary,
      mastery,
      feedbackSummary,
      studyGoal,
      goalProgress,
      dateKey: planProgressDay?.dateKey
    }),
    [items, historyRecords, scheduleRecords, dueSummary, mastery, feedbackSummary, studyGoal, goalProgress, planProgressDay?.dateKey]
  );

  const planStepProgress = useMemo(
    () => getStudyPlanStepProgress(todayPlan.steps || [], planProgressDay),
    [todayPlan.steps, planProgressDay]
  );

  const notices = useMemo(() => ({
    hasDiscardedLocalData: Boolean(
      localState.history.discarded
      || localState.schedule.discarded
      || localState.feedback.discarded
      || localState.goal.discarded
      || localState.planProgress.discarded
    )
  }), [localState.history.discarded, localState.schedule.discarded, localState.feedback.discarded, localState.goal.discarded, localState.planProgress.discarded]);

  const value = useMemo(() => ({
    adapter,
    items,
    subjects,
    topics,
    subjectsById,
    topicsById,
    librarySummary,
    dataSource,
    historyState: localState.history,
    scheduleState: localState.schedule,
    feedbackState: localState.feedback,
    goalState: localState.goal,
    planProgressState,
    historyRecords,
    scheduleRecords,
    feedbackRecords,
    studyGoal,
    historyAnalytics,
    scheduleSummary,
    dueSummary,
    mastery,
    feedbackSummary,
    goalProgress,
    smartPracticeSelection,
    weakPracticeSelection,
    recommendation,
    todayPlan,
    planStepProgress,
    notices
  }), [
    adapter,
    items,
    subjects,
    topics,
    subjectsById,
    topicsById,
    librarySummary,
    dataSource,
    localState.history,
    localState.schedule,
    localState.feedback,
    localState.goal,
    planProgressState,
    historyRecords,
    scheduleRecords,
    feedbackRecords,
    studyGoal,
    historyAnalytics,
    scheduleSummary,
    dueSummary,
    mastery,
    feedbackSummary,
    goalProgress,
    smartPracticeSelection,
    weakPracticeSelection,
    recommendation,
    todayPlan,
    planStepProgress,
    notices
  ]);

  return (
    <DashboardLearningDataContext.Provider value={value}>
      {children}
    </DashboardLearningDataContext.Provider>
  );
}

export function useDashboardLearningData() {
  const value = useContext(DashboardLearningDataContext);
  if (!value) {
    throw new Error('useDashboardLearningData must be used inside DashboardLearningDataProvider');
  }
  return value;
}
