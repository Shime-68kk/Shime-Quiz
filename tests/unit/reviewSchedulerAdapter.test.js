import { describe, expect, it } from 'vitest';
import {
  SCHEDULER_KIND_CURRENT,
  SCHEDULER_KIND_FSRS_PLANNED,
  SCHEDULER_VERSION_CURRENT,
  getDueStatus,
  getDueSummary,
  getSchedulerKind,
  getSchedulerVersion,
  isCurrentSchedulerRecord,
  preserveCurrentRecord,
  scheduleReview
} from '../../src/quiz/reviewSchedulerAdapter.js';

const NOW = new Date('2026-05-12T00:00:00.000Z');

function baseRecord(overrides = {}) {
  return {
    itemId: 'item-1',
    subjectId: 'subject-1',
    topicId: 'topic-1',
    lastReviewedAt: '2026-05-01T00:00:00.000Z',
    dueAt: '2026-05-10T00:00:00.000Z',
    intervalDays: 1,
    repetitionCount: 1,
    easeFactor: 2.2,
    correctStreak: 1,
    wrongCount: 0,
    ...overrides
  };
}

describe('review scheduler adapter kind defaults', () => {
  it('defaults missing schedulerKind to the current scheduler', () => {
    const record = baseRecord();

    expect(getSchedulerKind(record)).toBe(SCHEDULER_KIND_CURRENT);
    expect(getSchedulerVersion(record)).toBe(SCHEDULER_VERSION_CURRENT);
    expect(isCurrentSchedulerRecord(record)).toBe(true);
    expect(record.schedulerKind).toBeUndefined();
  });

  it('defaults missing schedulerVersion to the current scheduler version without mutation', () => {
    const record = baseRecord();
    const before = structuredClone(record);

    expect(getSchedulerVersion(record)).toBe('v2-review-schedule-v1');
    expect(record).toEqual(before);
  });

  it('recognizes the reserved future FSRS scheduler kind without running it', () => {
    expect(getSchedulerKind({ schedulerKind: SCHEDULER_KIND_FSRS_PLANNED })).toBe(SCHEDULER_KIND_FSRS_PLANNED);
    expect(isCurrentSchedulerRecord({ schedulerKind: SCHEDULER_KIND_FSRS_PLANNED })).toBe(false);
  });
});

describe('review scheduler adapter due status and due summary', () => {
  it('interprets dueAt consistently for due and future records', () => {
    expect(getDueStatus(baseRecord({ dueAt: '2026-05-11T00:00:00.000Z' }), NOW)).toMatchObject({
      isDue: true,
      isScheduled: true,
      schedulerKind: SCHEDULER_KIND_CURRENT
    });

    expect(getDueStatus(baseRecord({ dueAt: '2026-05-13T00:00:00.000Z' }), NOW)).toMatchObject({
      isDue: false,
      isScheduled: true,
      schedulerKind: SCHEDULER_KIND_CURRENT
    });
  });

  it('counts due and not-due records in a normalized due summary', () => {
    const due = baseRecord({ itemId: 'due-1', dueAt: '2026-05-11T00:00:00.000Z' });
    const alsoDue = baseRecord({ itemId: 'due-2', dueAt: '2026-05-12T00:00:00.000Z' });
    const future = baseRecord({ itemId: 'future-1', dueAt: '2026-05-13T00:00:00.000Z' });

    expect(getDueSummary([due, alsoDue, future], NOW)).toMatchObject({
      totalScheduled: 3,
      dueCount: 2,
      futureCount: 1,
      currentSchedulerCount: 3,
      fsrsPlannedCount: 0,
      nextDueAt: '2026-05-11T00:00:00.000Z'
    });
  });

  it('keeps reserved future FSRS records visible in due summary without scheduling them', () => {
    const summary = getDueSummary([
      baseRecord({ itemId: 'current' }),
      baseRecord({ itemId: 'future-fsrs', schedulerKind: SCHEDULER_KIND_FSRS_PLANNED })
    ], NOW);

    expect(summary.dueCount).toBe(2);
    expect(summary.currentSchedulerCount).toBe(1);
    expect(summary.fsrsPlannedCount).toBe(1);
  });
});

describe('review scheduler adapter current scheduler preservation', () => {
  it('preserves existing correct scheduling behavior through the adapter', () => {
    const result = scheduleReview(baseRecord(), 'correct', { now: NOW });

    expect(result).toMatchObject({
      itemId: 'item-1',
      subjectId: 'subject-1',
      topicId: 'topic-1',
      lastReviewedAt: '2026-05-12T00:00:00.000Z',
      dueAt: '2026-05-15T00:00:00.000Z',
      intervalDays: 3,
      repetitionCount: 2,
      easeFactor: 2.25,
      correctStreak: 2,
      wrongCount: 0
    });
  });

  it('preserves existing wrong scheduling behavior through the adapter', () => {
    const result = scheduleReview(
      baseRecord({ intervalDays: 5, repetitionCount: 3, easeFactor: 2, correctStreak: 2, wrongCount: 1 }),
      'wrong',
      { now: NOW }
    );

    expect(result).toMatchObject({
      itemId: 'item-1',
      lastReviewedAt: '2026-05-12T00:00:00.000Z',
      dueAt: '2026-05-13T00:00:00.000Z',
      intervalDays: 1,
      repetitionCount: 3,
      easeFactor: 1.8,
      correctStreak: 0,
      wrongCount: 2
    });
  });

  it('preserves existing unanswered scheduling behavior through the adapter', () => {
    const result = scheduleReview(
      baseRecord({ intervalDays: 5, repetitionCount: 3, easeFactor: 2, correctStreak: 2, wrongCount: 1 }),
      'unanswered',
      { now: NOW }
    );

    expect(result).toMatchObject({
      dueAt: '2026-05-13T00:00:00.000Z',
      intervalDays: 1,
      repetitionCount: 3,
      easeFactor: 2,
      correctStreak: 0,
      wrongCount: 1
    });
  });

  it('keeps existing records without schedulerKind working through the current path', () => {
    const record = baseRecord();

    expect(record.schedulerKind).toBeUndefined();
    expect(() => scheduleReview(record, 'correct', { now: NOW })).not.toThrow();
    expect(scheduleReview(record, 'correct', { now: NOW })?.schedulerKind).toBeUndefined();
  });

  it('does not destructively mutate input records', () => {
    const record = baseRecord({ nested: { retained: true } });
    const before = structuredClone(record);
    const result = scheduleReview(record, 'correct', { now: NOW });

    expect(record).toEqual(before);
    expect(result).not.toBe(record);
    expect(result.schedulerKind).toBeUndefined();
  });
});

describe('review scheduler adapter future FSRS rejection', () => {
  it('throws a safe error instead of silently running reserved future FSRS scheduling', () => {
    const record = baseRecord({ schedulerKind: SCHEDULER_KIND_FSRS_PLANNED });

    expect(() => scheduleReview(record, 'correct', { now: NOW })).toThrow(/FSRS scheduling is not implemented in Phase 14A/);
    expect(() => scheduleReview(record, 'correct', { now: NOW })).toThrow(new RegExp(SCHEDULER_KIND_FSRS_PLANNED));
  });
});

describe('review scheduler adapter record preservation', () => {
  it('returns a deep copy for current record preservation', () => {
    const record = baseRecord({ nested: { value: 1 } });
    const copy = preserveCurrentRecord(record);
    copy.nested.value = 2;

    expect(record.nested.value).toBe(1);
    expect(copy).not.toBe(record);
  });
});
