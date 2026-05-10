import { describe, expect, it } from 'vitest';
import {
  asArrayAnswer,
  isAnswerCorrect,
  calculateQuizScore
} from '../../src/quiz/scoring.js';

describe('quiz scoring helpers', () => {
  it('normalizes answer indexes into sorted numeric arrays', () => {
    expect(asArrayAnswer([3, '1', 'x', 2])).toEqual([1, 2, 3]);
    expect(asArrayAnswer(0)).toEqual([0]);
  });

  it('checks multiple choice answers without changing order-sensitive behavior', () => {
    const question = { choices: ['A', 'B', 'C'], answer: [2, 0] };

    expect(isAnswerCorrect(question, [0, 2])).toBe(true);
    expect(isAnswerCorrect(question, [2])).toBe(false);
  });

  it('checks fill answers with whitespace and numeric normalization', () => {
    expect(isAnswerCorrect({ type: 'fill', answer: '  Hà   Nội ' }, 'hà nội')).toBe(true);
    expect(isAnswerCorrect({ type: 'input', answer: '3,14' }, '3.14')).toBe(true);
  });

  it('calculates quiz score from existing answer correctness rules', () => {
    const quiz = {
      questions: [
        { choices: ['A', 'B'], answer: 1 },
        { type: 'fill', answer: 'local first' },
        { choices: ['A', 'B'], answer: 0 }
      ]
    };

    expect(calculateQuizScore(quiz, [
      { value: 1 },
      { value: 'local   first' },
      { value: 1 }
    ])).toEqual({ totalCorrect: 2, total: 3, percent: 67 });
  });
});
