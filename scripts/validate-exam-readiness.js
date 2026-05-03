import { createExamReadiness } from '../src/quiz/examReadiness.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const empty = createExamReadiness({ analytics: {}, history: [], reviewSchedule: [] });
assert(empty.score >= 0 && empty.score <= 100, 'empty readiness score should be clamped');
assert(empty.hasEnoughData === false, 'empty readiness should report insufficient data');
assert(empty.primaryAction?.action, 'empty readiness should provide a safe action');

const strong = createExamReadiness({
  analytics: {
    totalAttempts: 4,
    totalQuestionsAnswered: 80,
    averageScore: 88,
    dueReviewCount: 0,
    studyStreak: 4,
    mastery: {
      overallMastery: 88,
      answeredQuestionCount: 40,
      weakCount: 0,
      topicMastery: [
        { topic: 'A', masteryScore: 90, weakCount: 0 },
        { topic: 'B', masteryScore: 86, weakCount: 0 }
      ],
      weakestTopics: [{ topic: 'B', masteryScore: 86, weakCount: 0 }]
    }
  },
  history: [
    { createdAt: '2026-01-01T00:00:00.000Z', percentage: 80 },
    { createdAt: '2026-01-02T00:00:00.000Z', percentage: 86 },
    { createdAt: '2026-01-03T00:00:00.000Z', percentage: 90 },
    { createdAt: '2026-01-04T00:00:00.000Z', percentage: 92 }
  ],
  reviewSchedule: []
});
assert(strong.score >= 70, 'strong readiness should be high enough');
assert(strong.hasEnoughData === true, 'strong readiness should have enough data');

const overdue = createExamReadiness({
  analytics: {
    totalAttempts: 3,
    totalQuestionsAnswered: 40,
    averageScore: 70,
    dueReviewCount: 12,
    studyStreak: 1,
    mastery: {
      overallMastery: 65,
      answeredQuestionCount: 25,
      weakCount: 8,
      topicMastery: [{ topic: 'Weak', masteryScore: 45, weakCount: 8 }],
      weakestTopics: [{ topic: 'Weak', masteryScore: 45, weakCount: 8 }]
    }
  },
  history: [
    { createdAt: '2026-01-01T00:00:00.000Z', percentage: 74 },
    { createdAt: '2026-01-02T00:00:00.000Z', percentage: 70 },
    { createdAt: '2026-01-03T00:00:00.000Z', percentage: 66 }
  ],
  reviewSchedule: Array.from({ length: 20 }, (_, i) => ({ questionKey: `q-${i}` }))
});
assert(overdue.score < strong.score, 'overdue weak readiness should score below strong readiness');
assert(overdue.primaryAction.action === 'reviewDue', 'due review should be the primary action when due questions exist');

console.log('Exam readiness validation passed');
