import { describe, expect, it } from 'vitest';
import {
  FSRS_TEST_SCHEDULER_KIND,
  createFsrsSeedCardForTest,
  getFsrsDueStatusForTest,
  scheduleFsrsReviewForTest,
  serializeFsrsCard,
  validateFsrsPayload
} from '../../src/quiz/fsrsWrapper.js';
import {
  SCHEDULER_KIND_FSRS_PLANNED,
  scheduleReview
} from '../../src/quiz/reviewSchedulerAdapter.js';

const NOW = new Date('2026-05-12T00:00:00.000Z');

function expectIsoString(value) {
  expect(typeof value).toBe('string');
  expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  expect(Number.isNaN(new Date(value).getTime())).toBe(false);
}

describe('FSRS wrapper internal test prototype', () => {
  it('creates a Shime-native seed card from the ts-fsrs wrapper smoke path', () => {
    const card = createFsrsSeedCardForTest(NOW);

    expect(validateFsrsPayload(card)).toBe(true);
    expect(card).toMatchObject({
      schedulerKind: FSRS_TEST_SCHEDULER_KIND,
      dueAt: '2026-05-12T00:00:00.000Z',
      stability: 0,
      difficulty: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: 'New',
      lastReviewedAt: null
    });
    expect(card.fsrsPayload).toMatchObject({
      due: '2026-05-12T00:00:00.000Z',
      state: 'New',
      stateValue: 0
    });
  });

  it('schedules all four FSRS ratings through internal test-only functions', () => {
    for (const rating of ['Again', 'Hard', 'Good', 'Easy']) {
      const result = scheduleFsrsReviewForTest(createFsrsSeedCardForTest(NOW), rating, NOW);

      expect(result.rating).toBe(rating);
      expect(result.card.schedulerKind).toBe(FSRS_TEST_SCHEDULER_KIND);
      expect(result.card.reps).toBe(1);
      expect(result.reviewLog.rating).toBe(rating);
      expect(result.reviewLog.state).toBe('New');
      expectIsoString(result.card.dueAt);
      expectIsoString(result.reviewLog.reviewedAt);
      expectIsoString(result.reviewLog.dueAt);
    }
  });

  it('serializes returned card and review log dates as ISO strings', () => {
    const result = scheduleFsrsReviewForTest(createFsrsSeedCardForTest(NOW), 'Good', NOW);

    expectIsoString(result.card.dueAt);
    expectIsoString(result.card.lastReviewedAt);
    expectIsoString(result.card.fsrsPayload.due);
    expectIsoString(result.card.fsrsPayload.lastReview);
    expectIsoString(result.reviewLog.dueAt);
    expectIsoString(result.reviewLog.reviewedAt);
  });

  it('does not mutate the input card payload', () => {
    const card = createFsrsSeedCardForTest(NOW);
    const before = structuredClone(card);

    scheduleFsrsReviewForTest(card, 'Easy', NOW);

    expect(card).toEqual(before);
  });

  it('rejects invalid FSRS payloads clearly', () => {
    expect(() => validateFsrsPayload({})).toThrow(/schedulerKind/);
    expect(() => scheduleFsrsReviewForTest({ schedulerKind: FSRS_TEST_SCHEDULER_KIND }, 'Good', NOW)).toThrow(
      /fsrsPayload/
    );
    expect(() => scheduleFsrsReviewForTest(createFsrsSeedCardForTest(NOW), 'Correct', NOW)).toThrow(
      /Again, Hard, Good, or Easy/
    );
  });

  it('returns due status without storage writes', () => {
    const seed = createFsrsSeedCardForTest(NOW);
    const scheduled = scheduleFsrsReviewForTest(seed, 'Easy', NOW).card;

    expect(getFsrsDueStatusForTest(seed, NOW)).toMatchObject({
      isDue: true,
      isScheduled: true,
      schedulerKind: FSRS_TEST_SCHEDULER_KIND
    });
    expect(getFsrsDueStatusForTest(scheduled, NOW)).toMatchObject({
      isDue: false,
      isScheduled: true,
      schedulerKind: FSRS_TEST_SCHEDULER_KIND
    });
  });

  it('does not call browser storage while creating or scheduling FSRS test cards', () => {
    const previousStorage = globalThis.localStorage;
    const calls = [];
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: key => calls.push(['getItem', key]),
        setItem: (key, value) => calls.push(['setItem', key, value]),
        removeItem: key => calls.push(['removeItem', key])
      }
    });

    try {
      const seed = createFsrsSeedCardForTest(NOW);
      scheduleFsrsReviewForTest(seed, 'Hard', NOW);
      getFsrsDueStatusForTest(seed, NOW);
    } finally {
      if (previousStorage === undefined) {
        delete globalThis.localStorage;
      } else {
        Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: previousStorage });
      }
    }

    expect(calls).toEqual([]);
  });

  it('does not route the production Phase 14A adapter to FSRS', () => {
    const record = {
      itemId: 'fsrs-planned-record',
      schedulerKind: SCHEDULER_KIND_FSRS_PLANNED,
      dueAt: '2026-05-12T00:00:00.000Z'
    };

    expect(() => scheduleReview(record, 'correct', { now: NOW })).toThrow(
      /FSRS scheduling is not implemented in Phase 14A/
    );
  });

  it('keeps serialization plain and detached from raw Date objects', () => {
    const card = serializeFsrsCard({
      due: NOW,
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: 0,
      lapses: 0,
      learning_steps: 0,
      state: 0
    });

    expect(card.dueAt).toBe('2026-05-12T00:00:00.000Z');
    expect(card.fsrsPayload.due).toBe('2026-05-12T00:00:00.000Z');
    expect(JSON.parse(JSON.stringify(card))).toEqual(card);
  });
});
