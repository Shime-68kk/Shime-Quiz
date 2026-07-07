import { describe, expect, it } from 'vitest';
import { reduceLearningSignal } from '../../src/companion/learningSignalReducer.js';

describe('learningSignalReducer', () => {
  it('accepts safe Device Bridge-style events', () => {
    const result = reduceLearningSignal({
      eventType: 'question_presented',
      payload: {
        itemType: 'short_answer',
        progressCount: 2,
        totalCount: 5,
        transportStatus: 'connected'
      }
    });

    expect(result.ok).toBe(true);
    expect(result.state).toMatchObject({
      sessionPhase: 'question',
      itemType: 'short_answer',
      progressBucket: 'middle',
      transportStatus: 'connected'
    });
  });

  it('rejects sensitive event payloads', () => {
    const result = reduceLearningSignal({
      eventType: 'answer_correct',
      payload: {
        answer: 'private'
      }
    });

    expect(result.ok).toBe(false);
    expect(result.issues[0].code).toBe('forbidden_companion_key');
  });

  it('derives streak and frustration coarse state', () => {
    const first = reduceLearningSignal({ eventType: 'answer_correct', payload: { progressCount: 1, totalCount: 3 } });
    const second = reduceLearningSignal({ eventType: 'answer_correct', payload: { progressCount: 2, totalCount: 3 } }, first.state);
    const wrong = reduceLearningSignal({ eventType: 'answer_wrong', payload: { progressCount: 3, totalCount: 3 } }, second.state);

    expect(second.state.momentumBucket).toBe('streak');
    expect(wrong.state.frustrationRiskBucket).toBe('medium');
  });
});
