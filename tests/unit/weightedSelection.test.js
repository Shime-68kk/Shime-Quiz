import { describe, expect, it } from 'vitest';
import {
  buildHistoryStats,
  calculateQuestionWeight,
  createSeededRandom
} from '../../src/quiz/weightedSelection.js';

describe('weighted selection helpers', () => {
  it('creates deterministic random sequences for the same seed', () => {
    const first = createSeededRandom('phase-12g');
    const second = createSeededRandom('phase-12g');

    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it('builds history stats from recorded question details', () => {
    const stats = buildHistoryStats([
      {
        createdAt: '2026-01-01T00:00:00.000Z',
        details: {
          questions: [
            { questionKey: 'q:1', isCorrect: false },
            { questionKey: 'q:1', isCorrect: true }
          ]
        }
      }
    ]);

    expect(stats.get('q:1')).toMatchObject({ attempts: 2, correctCount: 1, wrongCount: 1 });
  });

  it('keeps calculated weights inside the documented safe range', () => {
    const weight = calculateQuestionWeight(
      { questionKey: 'q:due', question: { text: 'Due question' } },
      {
        dueReviewKeys: new Set(['q:due']),
        historyStats: new Map([['q:due', { attempts: 3, wrongCount: 2, correctCount: 1 }]]),
        now: new Date('2026-01-02T00:00:00.000Z').getTime()
      }
    );

    expect(weight).toBeGreaterThanOrEqual(0.1);
    expect(weight).toBeLessThanOrEqual(25);
  });
});
