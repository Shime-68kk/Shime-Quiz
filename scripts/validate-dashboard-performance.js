import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { computeHistoryAnalytics } from '../src/analytics/historyAnalytics.js';
import { computeMasteryModel } from '../src/analytics/masteryModel.js';
import { createTodayRecommendation } from '../src/learning/recommendationLite.js';
import { createTodayStudyPlan } from '../src/learning/studyPlanLite.js';
import { DEFAULT_WEIGHTED_PRACTICE_COUNT, selectWeightedPracticeItems } from '../src/learning/weightedPracticeSelector.js';
import { getDueReviewSummary } from '../src/study/dueReviewSelector.js';
import { summarizeRecommendationFeedback } from '../src/state/recommendationFeedbackStorage.js';
import { computeStudyGoalProgress } from '../src/state/studyGoalStorage.js';

const HISTORY_SESSION_COUNT = 50;
const ITEM_RESULT_COUNT = 10_000;
const LIBRARY_ITEM_COUNT = 1_000;
const REVIEW_RECORD_COUNT = 1_000;
const PERFORMANCE_THRESHOLD_MS = 1_000;

function makeLibraryItems(count = LIBRARY_ITEM_COUNT) {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    type: index % 7 === 0 ? 'flashcard' : index % 5 === 0 ? 'short_answer' : 'multiple_choice',
    prompt: `Synthetic dashboard prompt ${index}`,
    subjectId: `subject-${index % 10}`,
    topicId: `topic-${index % 50}`
  }));
}

function makeHistoryRecords({ sessionCount = HISTORY_SESSION_COUNT, itemResultCount = ITEM_RESULT_COUNT } = {}) {
  const resultsPerSession = Math.ceil(itemResultCount / sessionCount);
  return Array.from({ length: sessionCount }, (_, sessionIndex) => {
    const completedAt = new Date(Date.UTC(2026, 0, 1 + (sessionIndex % 28), 8, sessionIndex % 60)).toISOString();
    const itemResults = Array.from({ length: resultsPerSession }, (_, resultIndex) => {
      const absoluteIndex = sessionIndex * resultsPerSession + resultIndex;
      const itemIndex = absoluteIndex % LIBRARY_ITEM_COUNT;
      const status = absoluteIndex % 11 === 0
        ? 'unanswered'
        : absoluteIndex % 7 === 0
          ? 'wrong'
          : absoluteIndex % 13 === 0
            ? 'reviewed_flashcard'
            : 'correct';
      return {
        itemId: `item-${itemIndex}`,
        itemType: itemIndex % 7 === 0 ? 'flashcard' : 'multiple_choice',
        status,
        subjectId: `subject-${itemIndex % 10}`,
        topicId: `topic-${itemIndex % 50}`
      };
    });
    const correctCount = itemResults.filter(result => result.status === 'correct').length;
    const wrongCount = itemResults.filter(result => result.status === 'wrong').length;
    const unansweredCount = itemResults.filter(result => result.status === 'unanswered').length;
    const flashcardReviewedCount = itemResults.filter(result => result.status === 'reviewed_flashcard').length;
    const scoredCount = correctCount + wrongCount;
    return {
      id: `session-${sessionIndex}`,
      completedAt,
      durationSeconds: 300 + sessionIndex,
      totalItems: itemResults.length,
      answeredCount: correctCount + wrongCount + flashcardReviewedCount,
      correctCount,
      wrongCount,
      unansweredCount,
      unscoredCount: 0,
      flashcardReviewedCount,
      percentage: scoredCount ? Math.round((correctCount / scoredCount) * 100) : 0,
      itemResults
    };
  });
}

function makeReviewSchedule(count = REVIEW_RECORD_COUNT) {
  const now = Date.UTC(2026, 0, 15, 8, 0, 0);
  return Array.from({ length: count }, (_, index) => ({
    itemId: `item-${index % LIBRARY_ITEM_COUNT}`,
    subjectId: `subject-${index % 10}`,
    topicId: `topic-${index % 50}`,
    lastReviewedAt: new Date(now - index * 3_600_000).toISOString(),
    dueAt: new Date(now + ((index % 9) - 4) * 86_400_000).toISOString(),
    intervalDays: Math.max(1, index % 14),
    repetitionCount: index % 8,
    easeFactor: 2.2,
    correctStreak: index % 5,
    wrongCount: index % 4
  }));
}

function makeFeedbackRecords() {
  const dateKey = '2026-01-15';
  return Array.from({ length: 80 }, (_, index) => ({
    id: `feedback-${index}`,
    recommendationType: index % 3 === 0 ? 'due_review' : index % 3 === 1 ? 'weak_mastery' : 'smart_practice',
    feedback: index % 5 === 0 ? 'hidden_today' : index % 2 === 0 ? 'not_relevant' : 'helpful',
    createdAt: new Date(Date.UTC(2026, 0, 15, 7, index % 60)).toISOString(),
    dateKey,
    reasonCode: 'synthetic'
  }));
}

function makeStudyGoal() {
  return {
    id: 'goal-dashboard-performance',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
    dailyItemTarget: 120,
    targetDate: '2026-02-01',
    focusMode: 'balanced',
    isActive: true
  };
}

const items = makeLibraryItems();
const historyRecords = makeHistoryRecords();
const scheduleRecords = makeReviewSchedule();
const feedbackRecords = makeFeedbackRecords();
const studyGoal = makeStudyGoal();

const mutationSnapshot = JSON.stringify({ items, historyRecords, scheduleRecords, feedbackRecords, studyGoal });
const start = performance.now();

const historyAnalytics = computeHistoryAnalytics(historyRecords);
const scheduleSummary = {
  totalScheduled: scheduleRecords.length
};
const dueSummary = getDueReviewSummary({ items, scheduleRecords, now: new Date('2026-01-15T08:00:00.000Z') });
const mastery = computeMasteryModel({ items, historyRecords, scheduleRecords, now: new Date('2026-01-15T08:00:00.000Z') });
const feedbackSummary = summarizeRecommendationFeedback(feedbackRecords, '2026-01-15');
const goalProgress = computeStudyGoalProgress(studyGoal, historyRecords, '2026-01-15');
const smartPracticeSelection = selectWeightedPracticeItems({
  items,
  historyRecords,
  scheduleRecords,
  requestedCount: DEFAULT_WEIGHTED_PRACTICE_COUNT,
  now: new Date('2026-01-15T08:00:00.000Z')
});
const recommendation = createTodayRecommendation({
  items,
  historyRecords,
  dueSummary,
  mastery,
  smartPracticeSelection,
  feedbackSummary,
  studyGoal
});
const todayPlan = createTodayStudyPlan({
  items,
  historyRecords,
  scheduleRecords,
  dueSummary,
  mastery,
  feedbackSummary,
  studyGoal,
  goalProgress,
  dateKey: '2026-01-15'
});

const elapsedMs = performance.now() - start;

assert.equal(historyAnalytics.totalSessions, HISTORY_SESSION_COUNT, 'history analytics should process synthetic session count');
assert.equal(historyAnalytics.totalItemsPracticed, HISTORY_SESSION_COUNT * Math.ceil(ITEM_RESULT_COUNT / HISTORY_SESSION_COUNT), 'history analytics should count synthetic item results');
assert.ok(Array.isArray(historyAnalytics.topicSummaries), 'history topic summaries should be an array');
assert.equal(mastery.itemCount, LIBRARY_ITEM_COUNT, 'mastery should keep item count shape');
assert.ok(Array.isArray(mastery.itemMastery), 'mastery item output should be an array');
assert.ok(dueSummary.totalScheduled > 0, 'due summary should process schedule records');
assert.equal(scheduleSummary.totalScheduled, REVIEW_RECORD_COUNT, 'schedule summary sanity check should reflect synthetic records');
assert.ok(smartPracticeSelection.selectedCount <= DEFAULT_WEIGHTED_PRACTICE_COUNT, 'weighted selection should respect requested count');
assert.ok(recommendation.type, 'recommendation should produce a selected recommendation type');
assert.ok(Array.isArray(todayPlan.steps), 'study plan should produce steps array');
assert.ok(todayPlan.steps.length <= 3, 'study plan should respect existing plan step limit');
assert.equal(JSON.stringify({ items, historyRecords, scheduleRecords, feedbackRecords, studyGoal }), mutationSnapshot, 'dashboard derivations must not mutate inputs');
assert.ok(elapsedMs < PERFORMANCE_THRESHOLD_MS, `dashboard derivations should stay under ${PERFORMANCE_THRESHOLD_MS}ms, got ${elapsedMs.toFixed(1)}ms`);

const malformedAnalytics = computeHistoryAnalytics([{ completedAt: 'not-a-date', itemResults: 'bad' }, null]);
const malformedMastery = computeMasteryModel({ items: [{ id: '', prompt: 'bad' }, null], historyRecords: [{ itemResults: 'bad' }], scheduleRecords: [null] });
const malformedDue = getDueReviewSummary({ items: 'bad', scheduleRecords: [{ itemId: '', dueAt: 'bad' }] });
assert.equal(malformedAnalytics.hasHistory, false, 'malformed analytics input should fall back safely');
assert.equal(malformedMastery.itemCount, 0, 'malformed mastery items should be rejected safely');
assert.equal(malformedDue.totalScheduled, 0, 'malformed due review records should be rejected safely');

console.log(JSON.stringify({
  dashboardPerformance: {
    elapsedMs: Math.round(elapsedMs * 10) / 10,
    thresholdMs: PERFORMANCE_THRESHOLD_MS,
    sessions: HISTORY_SESSION_COUNT,
    itemResults: HISTORY_SESSION_COUNT * Math.ceil(ITEM_RESULT_COUNT / HISTORY_SESSION_COUNT),
    libraryItems: LIBRARY_ITEM_COUNT,
    reviewRecords: REVIEW_RECORD_COUNT,
    selectedPracticeItems: smartPracticeSelection.selectedCount,
    recommendationType: recommendation.type,
    planSteps: todayPlan.steps.length
  }
}, null, 2));
