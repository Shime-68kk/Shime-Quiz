import { createDailyRecommendations } from '../src/quiz/recommendations.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const analyticsWithDue = {
  totalAttempts: 3,
  dueReviewCount: 12,
  studyStreak: 2,
  weakQuestions: [],
  mastery: {
    questionMastery: [],
    weakestTopics: []
  }
};

const hiddenDue = createDailyRecommendations({
  analytics: analyticsWithDue,
  feedback: [{ recommendationType: 'reviewDue', feedback: 'hidden_today', timestamp: new Date().toISOString() }]
});
assert(hiddenDue.some(item => item.id === 'reviewDue'), 'Critical due review should not be hidden when many questions are due');

const analyticsQuick = {
  totalAttempts: 2,
  dueReviewCount: 0,
  studyStreak: 1,
  weakQuestions: [],
  mastery: {
    questionMastery: [],
    weakestTopics: []
  }
};

const hiddenQuick = createDailyRecommendations({
  analytics: analyticsQuick,
  feedback: [{ recommendationType: 'quickReview', feedback: 'hidden_today', timestamp: new Date().toISOString() }]
});
assert(!hiddenQuick.some(item => item.id === 'quickReview'), 'Hidden-today quick review should be suppressed for today');
assert(hiddenQuick.length > 0, 'Feedback suppression should still leave a safe fallback recommendation');

const helpfulWeak = createDailyRecommendations({
  analytics: {
    totalAttempts: 5,
    dueReviewCount: 0,
    studyStreak: 0,
    weakQuestions: [{ wrongCount: 2 }],
    mastery: {
      questionMastery: [],
      weakestTopics: []
    }
  },
  feedback: [
    { recommendationType: 'recentWrong', feedback: 'helpful', timestamp: new Date().toISOString() },
    { recommendationType: 'recentWrong', feedback: 'helpful', timestamp: new Date().toISOString() }
  ]
});
assert(helpfulWeak.some(item => item.id === 'recentWrong'), 'Helpful feedback should keep matching recommendation available');

console.log('Recommendation feedback validation passed');
