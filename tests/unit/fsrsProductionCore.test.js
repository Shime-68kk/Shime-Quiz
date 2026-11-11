import { describe, expect, it } from 'vitest';
import {
  createFsrsSeedPayload,
  getFsrsRetrievability,
  scheduleFsrsReview
} from '../../src/quiz/fsrsWrapper.js';
import { selectDueReviewItems } from '../../src/study/dueReviewSelector.js';

const REVIEW_PAYLOAD = {
  due: '2026-06-01T00:00:00.000Z',
  stability: 500,
  difficulty: 3,
  elapsedDays: 500,
  scheduledDays: 500,
  reps: 20,
  lapses: 1,
  learningSteps: 0,
  state: 'Review',
  lastReview: '2025-01-01T00:00:00.000Z'
};

describe('FSRS production configuration', () => {
  it('higher desired retention produces a shorter interval', () => {
    const low = scheduleFsrsReview(REVIEW_PAYLOAD, 'Easy', REVIEW_PAYLOAD.due, {
      requestRetention: 0.85,
      enableFuzz: false
    });
    const high = scheduleFsrsReview(REVIEW_PAYLOAD, 'Easy', REVIEW_PAYLOAD.due, {
      requestRetention: 0.95,
      enableFuzz: false
    });

    expect(high.intervalDays).toBeLessThan(low.intervalDays);
  });

  it('enforces maximumInterval as an absolute application cap', () => {
    const result = scheduleFsrsReview(REVIEW_PAYLOAD, 'Easy', REVIEW_PAYLOAD.due, {
      maximumInterval: 30,
      enableFuzz: false
    });

    expect(result.intervalDays).toBe(30);
    expect(result.dueAt).toBe('2026-07-01T00:00:00.000Z');
  });

  it('persists scheduler configuration and reuses it on the next review', () => {
    const first = scheduleFsrsReview(REVIEW_PAYLOAD, 'Good', REVIEW_PAYLOAD.due, {
      requestRetention: 0.94,
      maximumInterval: 40,
      enableFuzz: false
    });
    const config = first.card.fsrsPayload.schedulerConfig;
    const second = scheduleFsrsReview(first.card.fsrsPayload, 'Easy', first.dueAt);

    expect(config).toMatchObject({
      algorithmVersion: 'fsrs-6',
      libraryVersion: 'ts-fsrs-5.4.1',
      requestRetention: 0.94,
      maximumInterval: 40,
      enableFuzz: false
    });
    expect(second.intervalDays).toBeLessThanOrEqual(40);
    expect(second.card.fsrsPayload.schedulerConfig).toEqual(config);
  });
});

describe('retrievability-aware due selection', () => {
  function payload(stability) {
    return {
      due: '2026-05-02T00:00:00.000Z',
      stability,
      difficulty: 5,
      elapsedDays: 1,
      scheduledDays: 1,
      reps: 2,
      lapses: 0,
      learningSteps: 0,
      state: 'Review',
      lastReview: '2026-05-01T00:00:00.000Z'
    };
  }

  it('places the least retrievable FSRS card first', () => {
    const now = new Date('2026-05-11T00:00:00.000Z');
    const records = [
      { itemId: 'strong', dueAt: '2026-05-02T00:00:00.000Z', fsrsPayload: payload(20) },
      { itemId: 'fragile', dueAt: '2026-05-02T00:00:00.000Z', fsrsPayload: payload(2) }
    ];
    const items = records.map(record => ({ id: record.itemId }));
    const selected = selectDueReviewItems({ items, scheduleRecords: records, now });

    expect(selected.map(entry => entry.item.id)).toEqual(['fragile', 'strong']);
    expect(selected[0].record.retrievability).toBeLessThan(selected[1].record.retrievability);
  });

  it('keeps overdue ordering when scheduler families are mixed', () => {
    const records = [
      { itemId: 'fsrs', dueAt: '2026-05-09T00:00:00.000Z', fsrsPayload: payload(20) },
      { itemId: 'sm2', dueAt: '2026-04-01T00:00:00.000Z' }
    ];
    const items = records.map(record => ({ id: record.itemId }));
    const selected = selectDueReviewItems({
      items,
      scheduleRecords: records,
      now: '2026-05-11T00:00:00.000Z'
    });

    expect(selected.map(entry => entry.item.id)).toEqual(['sm2', 'fsrs']);
  });

  it('does not hide a due card with malformed FSRS metadata', () => {
    const records = [{ itemId: 'legacy', dueAt: '2026-05-01T00:00:00.000Z', fsrsPayload: { broken: true } }];
    const selected = selectDueReviewItems({
      items: [{ id: 'legacy' }],
      scheduleRecords: records,
      now: '2026-05-11T00:00:00.000Z'
    });

    expect(selected).toHaveLength(1);
    expect(selected[0].record.itemId).toBe('legacy');
  });
});

describe('FSRS scheduling stress safety', () => {
  it('keeps 500 consecutive reviews finite, valid, and locally serializable', () => {
    let now = new Date('2026-01-01T00:00:00.000Z');
    let current = createFsrsSeedPayload(now, { enableFuzz: false });
    const ratings = ['Good', 'Good', 'Hard', 'Easy', 'Again'];

    for (let index = 0; index < 500; index += 1) {
      const result = scheduleFsrsReview(current, ratings[index % ratings.length], now, {
        requestRetention: 0.9,
        maximumInterval: 36500,
        enableFuzz: false
      });
      expect(Number.isFinite(result.intervalDays)).toBe(true);
      expect(result.intervalDays).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(new Date(result.dueAt).getTime())).toBe(true);
      expect(() => JSON.stringify(result.card.fsrsPayload)).not.toThrow();
      current = result.card.fsrsPayload;
      now = new Date(result.dueAt);
    }

    expect(Number.isFinite(getFsrsRetrievability(current, now))).toBe(true);
  });
});
