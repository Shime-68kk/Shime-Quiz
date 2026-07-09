import { describe, expect, it } from 'vitest';
import {
  assertSchedulerOutputSafe,
  normalizeSchedulerInput,
  validateSchedulerAdapter
} from '../../src/scheduler/schedulerAdapterContract.js';
import { sm2SchedulerAdapter } from '../../src/scheduler/sm2SchedulerAdapter.js';

describe('schedulerAdapterContract', () => {
  it('normalizes safe local scheduler input', () => {
    expect(normalizeSchedulerInput({
      cardId: ' card-1 ',
      currentIntervalDays: '3',
      repetitionCount: '2',
      easeFactor: 9,
      lastReviewedAt: '2026-01-01T00:00:00.000Z',
      rating: 'Good',
      elapsedDays: 4
    })).toMatchObject({
      cardId: 'card-1',
      currentIntervalDays: 3,
      repetitionCount: 2,
      easeFactor: 2.8,
      rating: 'good',
      elapsedDays: 4
    });
  });

  it('rejects raw quiz content in scheduler input', () => {
    expect(() => normalizeSchedulerInput({ cardId: 'x', question: 'raw?', rating: 'good' })).toThrow(/question/);
    expect(() => normalizeSchedulerInput({ cardId: 'x', answer: 'raw', rating: 'good' })).toThrow(/answer/);
  });

  it('validates adapters through a safe contract probe', () => {
    expect(validateSchedulerAdapter(sm2SchedulerAdapter)).toMatchObject({ ok: true, adapterId: 'sm2' });
  });

  it('rejects unsafe output decision codes', () => {
    expect(() => assertSchedulerOutputSafe({
      schedulerId: 'x',
      nextReviewAt: '2026-01-02T00:00:00.000Z',
      intervalDays: 1,
      decisionCodes: ['RAW_PROSE'],
      migrationSafe: true
    })).toThrow(/Unsafe scheduler decision code/);
  });
});
