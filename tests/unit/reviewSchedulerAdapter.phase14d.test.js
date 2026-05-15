import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  SCHEDULER_KIND_CURRENT,
  SCHEDULER_KIND_FSRS_PLANNED,
  getSchedulerKind,
  scheduleCurrentReview,
  scheduleReview
} from '../../src/quiz/reviewSchedulerAdapter.js';
import {
  FSRS_TEST_SCHEDULER_KIND,
  createFsrsSeedCardForTest
} from '../../src/quiz/fsrsWrapper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const NOW = new Date('2026-05-12T00:00:00.000Z');

function currentRecord(overrides = {}) {
  return {
    itemId: 'item-sm2-1',
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

function fsrsTestRecord(overrides = {}) {
  return {
    ...createFsrsSeedCardForTest(NOW),
    itemId: 'item-fsrs-1',
    subjectId: 'subject-1',
    topicId: 'topic-1',
    ...overrides
  };
}

function readProjectFile(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

describe('Phase 14D developer gate disabled', () => {
  it('returns SM-2 fallback for FSRS records when the test gate is absent (Phase 15B)', () => {
    let result;
    expect(() => { result = scheduleReview(fsrsTestRecord(), 'correct', { now: NOW }); }).not.toThrow();
    expect(result).not.toBeNull();
  });

  it('requires enableFsrsTestRoute to be the strict boolean true value to reach test route', () => {
    for (const value of [false, 1, 'true']) {
      let result;
      expect(() => {
        result = scheduleReview(fsrsTestRecord(), 'correct', { now: NOW, enableFsrsTestRoute: value });
      }).not.toThrow();
      expect(result).not.toBeNull();
    }
  });
});

describe('Phase 14D developer gate enabled', () => {
  it('routes a valid FSRS test record to the Phase 14B wrapper only when the gate is enabled', () => {
    const record = fsrsTestRecord();
    const before = structuredClone(record);
    const result = scheduleReview(record, 'correct', { now: NOW, enableFsrsTestRoute: true });

    expect(result).toMatchObject({
      schedulerKind: FSRS_TEST_SCHEDULER_KIND,
      rating: 'Good',
      card: {
        schedulerKind: FSRS_TEST_SCHEDULER_KIND,
        reps: 1
      },
      reviewLog: {
        rating: 'Good',
        state: 'New'
      }
    });
    expect(result.card.dueAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(record).toEqual(before);
  });

  it('maps correct to Good, wrong to Again, and unanswered to Again in the test-only route', () => {
    expect(scheduleReview(fsrsTestRecord(), 'correct', { now: NOW, enableFsrsTestRoute: true }).rating).toBe('Good');
    expect(scheduleReview(fsrsTestRecord(), 'wrong', { now: NOW, enableFsrsTestRoute: true }).rating).toBe('Again');
    expect(scheduleReview(fsrsTestRecord(), 'unanswered', { now: NOW, enableFsrsTestRoute: true }).rating).toBe(
      'Again'
    );
  });

  it('does not convert the reserved fsrs-planned kind into production scheduling without a valid test payload', () => {
    let thrown;
    try {
      scheduleReview(currentRecord({ schedulerKind: SCHEDULER_KIND_FSRS_PLANNED }), 'correct', {
        now: NOW,
        enableFsrsTestRoute: true
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect(thrown.message).not.toMatch(/FSRS scheduling is not implemented in Phase 14A/);
    expect(thrown.message).toMatch(/schedulerKind|fsrsPayload/);
  });
});

describe('Phase 14D current scheduler immunity', () => {
  it('keeps a record without schedulerKind on SM-2 even when the FSRS test gate is true', () => {
    const result = scheduleReview(currentRecord(), 'correct', { now: NOW, enableFsrsTestRoute: true });

    expect(getSchedulerKind(currentRecord())).toBe(SCHEDULER_KIND_CURRENT);
    expect(result).toMatchObject({
      itemId: 'item-sm2-1',
      dueAt: '2026-05-15T00:00:00.000Z',
      intervalDays: 3,
      repetitionCount: 2,
      easeFactor: 2.25,
      correctStreak: 2,
      wrongCount: 0
    });
    expect(result.schedulerKind).toBeUndefined();
    expect(result.card).toBeUndefined();
    expect(result.reviewLog).toBeUndefined();
  });

  it('keeps an explicit sm2-heuristic record on SM-2 even when the FSRS test gate is true', () => {
    const result = scheduleReview(currentRecord({ schedulerKind: 'sm2-heuristic' }), 'correct', {
      now: NOW,
      enableFsrsTestRoute: true
    });

    expect(result).toMatchObject({
      intervalDays: 3,
      repetitionCount: 2,
      correctStreak: 2
    });
    expect(result.schedulerKind).toBeUndefined();
    expect(result.card).toBeUndefined();
  });

  it('leaves scheduleCurrentReview unaffected by enableFsrsTestRoute context', () => {
    const record = currentRecord();
    const withGate = scheduleCurrentReview(record, 'correct', { now: NOW, enableFsrsTestRoute: true });
    const withoutGate = scheduleCurrentReview(record, 'correct', { now: NOW });

    expect(withGate).toEqual(withoutGate);
  });
});

describe('Phase 14D gate isolation', () => {
  it('does not use localStorage or process.env in the adapter source', () => {
    const adapter = readProjectFile('src/quiz/reviewSchedulerAdapter.js');

    expect(adapter).not.toMatch(/localStorage/i);
    expect(adapter).not.toMatch(/process\.env/i);
    expect(adapter).not.toMatch(/SHIME_DEV_/i);
  });

  it('does not read localStorage while routing a gated FSRS test record', () => {
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
      scheduleReview(fsrsTestRecord(), 'correct', { now: NOW, enableFsrsTestRoute: true });
    } finally {
      if (previousStorage === undefined) delete globalThis.localStorage;
      else Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: previousStorage });
    }

    expect(calls).toEqual([]);
  });

  it('keeps Study Room and Dashboard disconnected from the developer FSRS test route', () => {
    const combined = `${readProjectFile('src/routes/StudyRoom.jsx')}\n${readProjectFile('src/routes/Dashboard.jsx')}`;

    expect(combined).not.toMatch(/enableFsrsTestRoute/);
    expect(combined).not.toMatch(/fsrsWrapper/);
    expect(combined).not.toMatch(/scheduleFsrsReviewForTest/);
    expect(combined).not.toMatch(/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/);
  });
});
