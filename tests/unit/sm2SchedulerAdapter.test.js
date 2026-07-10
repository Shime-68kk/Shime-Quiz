import { describe, expect, it } from 'vitest';
import { computeSm2NextReview, sm2SchedulerAdapter } from '../../src/scheduler/sm2SchedulerAdapter.js';

const BASE_INPUT = {
  cardId: 'item-1',
  currentIntervalDays: 1,
  repetitionCount: 1,
  easeFactor: 2.2,
  lastReviewedAt: '2026-05-12T00:00:00.000Z',
  rating: 'correct',
  elapsedDays: 1
};

describe('sm2SchedulerAdapter', () => {
  it('is stable, local-only, and rollback-capable', () => {
    expect(sm2SchedulerAdapter).toMatchObject({
      schedulerId: 'sm2',
      stabilityLevel: 'stable',
      privacyClass: 'local_only',
      supportsRollback: true
    });
  });

  it('preserves existing SM2 correct interval behavior', () => {
    expect(computeSm2NextReview(BASE_INPUT)).toMatchObject({
      schedulerId: 'sm2',
      nextReviewAt: '2026-05-15T00:00:00.000Z',
      intervalDays: 3,
      easeFactor: 2.25,
      migrationSafe: true
    });
  });

  it('schedules wrong answers soon without raw content', () => {
    const output = computeSm2NextReview({ ...BASE_INPUT, rating: 'wrong', currentIntervalDays: 5, repetitionCount: 3 });
    expect(output).toMatchObject({ intervalDays: 1, dueState: 'soon' });
    expect(JSON.stringify(output)).not.toMatch(/question|answer|prompt/i);
  });

  it('is deterministic for the same input', () => {
    expect(computeSm2NextReview(BASE_INPUT)).toEqual(computeSm2NextReview(BASE_INPUT));
  });
});
