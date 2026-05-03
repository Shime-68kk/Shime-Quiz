import assert from 'node:assert/strict';
import { weightedSampleQuestions, calculateQuestionWeight } from '../src/quiz/weightedSelection.js';

const candidates = Array.from({ length: 6 }, (_, index) => ({
  questionKey: `q:${index}`,
  quizIndex: 0,
  questionIndex: index,
  question: { text: `Question ${index}` }
}));

const history = [
  {
    details: [
      { questionKey: 'q:1', isCorrect: false },
      { questionKey: 'q:1', isCorrect: false },
      { questionKey: 'q:2', isCorrect: true },
      { questionKey: 'q:2', isCorrect: true },
      { questionKey: 'q:2', isCorrect: true }
    ]
  }
];
const reviewSchedule = [
  { questionKey: 'q:3', dueAt: new Date(Date.now() - 1000).toISOString(), correctStreak: 0, wrongCount: 0 },
  { questionKey: 'q:2', dueAt: new Date(Date.now() + 86400000).toISOString(), correctStreak: 4, wrongCount: 0 }
];

const weakWeight = calculateQuestionWeight(candidates[1], { history, reviewSchedule, mode: 'quickReview' });
const dueWeight = calculateQuestionWeight(candidates[3], { history, reviewSchedule, mode: 'quickReview' });
const masteredWeight = calculateQuestionWeight(candidates[2], { history, reviewSchedule, mode: 'quickReview' });
const lowMasteryWeight = calculateQuestionWeight(candidates[4], {
  history,
  reviewSchedule,
  mode: 'masteryBoost',
  mastery: { questionMastery: [{ questionKey: 'q:4', masteryScore: 35 }] }
});
const highMasteryWeight = calculateQuestionWeight(candidates[5], {
  history,
  reviewSchedule,
  mode: 'masteryBoost',
  mastery: { questionMastery: [{ questionKey: 'q:5', masteryScore: 92 }] }
});
assert.ok(lowMasteryWeight > highMasteryWeight, 'low mastery should outrank high mastery in mastery boost');
assert.ok(weakWeight > masteredWeight, 'weak questions should outrank mastered questions');
assert.ok(dueWeight > masteredWeight, 'due questions should outrank mastered questions');

const selectedA = weightedSampleQuestions(candidates, 4, { history, reviewSchedule, mode: 'quickReview', seed: 'phase5b' });
const selectedB = weightedSampleQuestions(candidates, 4, { history, reviewSchedule, mode: 'quickReview', seed: 'phase5b' });
assert.equal(selectedA.length, 4, 'selected count should match request');
assert.deepEqual(selectedA.map(item => item.questionKey), selectedB.map(item => item.questionKey), 'seeded selection should be deterministic');
assert.equal(new Set(selectedA.map(item => item.questionKey)).size, selectedA.length, 'selection should not contain duplicates');

const small = weightedSampleQuestions(candidates.slice(0, 2), 5, { seed: 'small' });
assert.equal(small.length, 2, 'selection should return all candidates when fewer than requested');

console.log('Weighted selection validation passed');
