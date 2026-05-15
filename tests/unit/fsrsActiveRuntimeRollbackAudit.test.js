/**
 * Phase 15D — Active FSRS Runtime Smoke / Rollback Audit
 *
 * 14 tests covering:
 *  1:    active internal flag missing → default false
 *  2:    active internal flag invalid → false
 *  3:    experimental ON + active OFF → no FSRS active scheduling
 *  4:    experimental OFF + active ON → no FSRS active scheduling
 *  5:    fsrs-active record + active flag OFF → SM-2 fallback, metadata preserved
 *  6:    malformed fsrsPayload → SM-2 fallback, no crash
 *  7:    missing fsrsPayload → SM-2 fallback, no crash
 *  8:    wrapper throw → SM-2 fallback, metadata preserved
 *  9:    continueWithoutRating → SM-2 fallback, no FSRS call
 *  10:   no usable rating log → SM-2 fallback, no invented rating
 *  11:   Dashboard mixed due summary handles fsrs-active fallback records
 *  12:   no new ts-fsrs.next() call sites outside approved wrapper
 *  13:   StudyRoom and Dashboard source unchanged in Phase 15D
 *  14:   no package/dependency changes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';

vi.mock('../../src/state/settingsStorage.js', () => ({
  getSettings: vi.fn(() => ({
    fsrsExperimentalEnabled: false,
    fsrsActiveSchedulingEnabled: false
  })),
  getDefaultSettings: vi.fn(() => ({
    fsrsExperimentalEnabled: false,
    fsrsActiveSchedulingEnabled: false,
    fsrsEnrollmentMode: 'new-cards-only',
    fsrsEnabledAt: null,
    fsrsDesiredRetention: 0.90,
    fsrsMaximumInterval: 36500,
    schemaVersion: 'shime-v2-settings-v1',
    updatedAt: ''
  })),
  normalizeSettings: vi.fn(raw => ({
    fsrsExperimentalEnabled: typeof raw?.fsrsExperimentalEnabled === 'boolean' ? raw.fsrsExperimentalEnabled : false,
    fsrsActiveSchedulingEnabled: typeof raw?.fsrsActiveSchedulingEnabled === 'boolean' ? raw.fsrsActiveSchedulingEnabled : false,
    fsrsEnrollmentMode: 'new-cards-only',
    fsrsEnabledAt: null,
    fsrsDesiredRetention: 0.90,
    fsrsMaximumInterval: 36500,
    schemaVersion: 'shime-v2-settings-v1',
    updatedAt: ''
  }))
}));

vi.mock('../../src/state/studyHistoryStorage.js', () => ({
  readStudyHistory: vi.fn(() => ({ records: [] }))
}));

vi.mock('../../src/quiz/fsrsWrapper.js', async () => {
  const real = await vi.importActual('../../src/quiz/fsrsWrapper.js');
  return {
    ...real,
    scheduleFsrsReview: vi.fn(real.scheduleFsrsReview)
  };
});

import { getSettings } from '../../src/state/settingsStorage.js';
import { scheduleFsrsReview } from '../../src/quiz/fsrsWrapper.js';
import {
  scheduleReview,
  scheduleCurrentReviewPreservingFsrs,
  scheduleActiveFsrsOrFallback,
  SCHEDULER_KIND_FSRS_PLANNED,
  FSRS_ACTIVE_SCHEDULER_KIND,
  computeMixedSchedulerDueSummary
} from '../../src/quiz/reviewSchedulerAdapter.js';

const NOW = new Date('2026-05-15T10:00:00.000Z');
const PAST = new Date('2026-05-01T00:00:00.000Z');

function fsrsPlannedRecord(overrides = {}) {
  return {
    itemId: 'item-planned-1',
    subjectId: 'sub-1',
    topicId: 'topic-1',
    schedulerKind: 'fsrs-planned',
    schedulerVersion: 'fsrs-planned-v1',
    dueAt: PAST.toISOString(),
    lastReviewedAt: '2026-05-01T00:00:00.000Z',
    intervalDays: 1,
    repetitionCount: 1,
    easeFactor: 2.2,
    correctStreak: 1,
    wrongCount: 0,
    fsrsPayload: { state: 'New', stability: 1.0, difficulty: 5.0, reps: 0 },
    fsrsReviewLogs: [],
    ...overrides
  };
}

function fsrsActiveRecord(overrides = {}) {
  return {
    itemId: 'item-active-1',
    subjectId: 'sub-1',
    topicId: 'topic-1',
    schedulerKind: 'fsrs-active',
    schedulerVersion: 'phase15b-active-scheduling',
    dueAt: PAST.toISOString(),
    lastReviewedAt: '2026-05-01T00:00:00.000Z',
    intervalDays: 3,
    repetitionCount: 2,
    easeFactor: 2.3,
    correctStreak: 2,
    wrongCount: 0,
    fsrsPayload: { state: 'Review', stability: 3.5, difficulty: 4.8, reps: 2 },
    fsrsReviewLogs: [{ rating: 'Good', reviewedAt: PAST.toISOString(), state: 'Review' }],
    ...overrides
  };
}

function setGate(experimental, active) {
  getSettings.mockReturnValue({
    fsrsExperimentalEnabled: experimental,
    fsrsActiveSchedulingEnabled: active
  });
}

beforeEach(() => {
  setGate(false, false);
  scheduleFsrsReview.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ─── Test 1: active internal flag missing → default false ─────────────────────

describe('Test 1: active internal flag missing normalizes to false', () => {
  it('real normalizeSettings: missing fsrsActiveSchedulingEnabled defaults to false', async () => {
    const { normalizeSettings: realNormalize } = await vi.importActual('../../src/state/settingsStorage.js');
    const result = realNormalize({ fsrsExperimentalEnabled: true });
    expect(result.fsrsActiveSchedulingEnabled).toBe(false);
  });
});

// ─── Test 2: active internal flag invalid → false ─────────────────────────────

describe('Test 2: active internal flag invalid value normalizes to false', () => {
  it('real normalizeSettings: non-boolean values all normalize to false', async () => {
    const { normalizeSettings: realNormalize } = await vi.importActual('../../src/state/settingsStorage.js');
    expect(realNormalize({ fsrsActiveSchedulingEnabled: 'true' }).fsrsActiveSchedulingEnabled).toBe(false);
    expect(realNormalize({ fsrsActiveSchedulingEnabled: 1 }).fsrsActiveSchedulingEnabled).toBe(false);
    expect(realNormalize({ fsrsActiveSchedulingEnabled: null }).fsrsActiveSchedulingEnabled).toBe(false);
    expect(realNormalize({ fsrsActiveSchedulingEnabled: {} }).fsrsActiveSchedulingEnabled).toBe(false);
  });
});

// ─── Test 3: experimental ON + active OFF → no FSRS active scheduling ─────────

describe('Test 3: experimental ON + active OFF → no active FSRS scheduling', () => {
  it('fsrsExperimentalEnabled:true alone does not trigger active scheduling', () => {
    setGate(true, false);
    const result = scheduleReview(fsrsPlannedRecord(), 'correct', { now: NOW });
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
    expect(result.schedulerKind).not.toBe(FSRS_ACTIVE_SCHEDULER_KIND);
  });
});

// ─── Test 4: experimental OFF + active ON → no FSRS active scheduling ─────────

describe('Test 4: experimental OFF + active ON → no active FSRS scheduling', () => {
  it('fsrsActiveSchedulingEnabled:true alone does not trigger active scheduling', () => {
    setGate(false, true);
    const result = scheduleReview(fsrsPlannedRecord(), 'correct', { now: NOW });
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
    expect(result.schedulerKind).not.toBe(FSRS_ACTIVE_SCHEDULER_KIND);
  });
});

// ─── Test 5: fsrs-active record + active flag OFF → SM-2 fallback, metadata preserved ──

describe('Test 5: fsrs-active record with active flag OFF falls back to SM-2, preserving metadata', () => {
  it('fsrs-active record scheduled with gate OFF: SM-2 intervals, schedulerKind and fsrsPayload preserved', () => {
    setGate(false, false);
    const record = fsrsActiveRecord();
    const result = scheduleReview(record, 'correct', { now: NOW });
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
    // No demotion: schedulerKind preserved
    expect(result.schedulerKind).toBe('fsrs-active');
    // fsrsPayload deep-copied and preserved
    expect(result.fsrsPayload).toEqual(record.fsrsPayload);
    expect(result.fsrsPayload).not.toBe(record.fsrsPayload);
    // fsrsReviewLogs carried forward
    expect(Array.isArray(result.fsrsReviewLogs)).toBe(true);
    expect(result.fsrsReviewLogs).toHaveLength(1);
  });
});

// ─── Test 6: malformed fsrsPayload → SM-2 fallback, no crash ──────────────────

describe('Test 6: malformed fsrsPayload → SM-2 fallback without crash', () => {
  it('payload with invalid stability string does not crash, falls back to SM-2', () => {
    setGate(true, true);
    const record = fsrsPlannedRecord({
      fsrsPayload: { state: 'Review', stability: 'not-a-number', difficulty: 4.8, reps: 2 }
    });
    let result;
    expect(() => {
      result = scheduleActiveFsrsOrFallback(record, 'correct', { now: NOW });
    }).not.toThrow();
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });

  it('payload with missing stability does not crash, falls back to SM-2', () => {
    setGate(true, true);
    const record = fsrsPlannedRecord({
      fsrsPayload: { state: 'New', difficulty: 5.0, reps: 0 }
    });
    let result;
    expect(() => {
      result = scheduleActiveFsrsOrFallback(record, 'correct', { now: NOW });
    }).not.toThrow();
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });
});

// ─── Test 7: missing fsrsPayload → SM-2 fallback, no crash ───────────────────

describe('Test 7: missing fsrsPayload (null/undefined) → SM-2 fallback without crash', () => {
  it('null fsrsPayload does not crash, falls back to SM-2', () => {
    setGate(true, true);
    const record = fsrsPlannedRecord({ fsrsPayload: null });
    let result;
    expect(() => {
      result = scheduleActiveFsrsOrFallback(record, 'correct', { now: NOW });
    }).not.toThrow();
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });

  it('undefined fsrsPayload does not crash, falls back to SM-2', () => {
    setGate(true, true);
    const record = fsrsPlannedRecord();
    delete record.fsrsPayload;
    let result;
    expect(() => {
      result = scheduleActiveFsrsOrFallback(record, 'correct', { now: NOW });
    }).not.toThrow();
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });
});

// ─── Test 8: wrapper throw → SM-2 fallback, metadata preserved ────────────────

describe('Test 8: scheduleFsrsReview throwing → SM-2 fallback, fsrsPayload preserved', () => {
  it('exception from scheduleFsrsReview produces SM-2 result without propagating', () => {
    setGate(true, true);
    scheduleFsrsReview.mockImplementationOnce(() => { throw new Error('ts-fsrs internal error'); });
    const record = fsrsPlannedRecord({
      fsrsPayload: { state: 'Review', stability: 3.0, difficulty: 4.5, reps: 2 }
    });
    let result;
    expect(() => {
      result = scheduleActiveFsrsOrFallback(record, 'correct', { now: NOW });
    }).not.toThrow();
    expect(result).not.toBeNull();
    // Fallback preserves schedulerKind
    expect(result.schedulerKind).toBe(SCHEDULER_KIND_FSRS_PLANNED);
    // fsrsPayload is preserved in fallback
    expect(result.fsrsPayload).toEqual(record.fsrsPayload);
    // fsrsReviewLogs carried forward
    expect(Array.isArray(result.fsrsReviewLogs)).toBe(true);
  });
});

// ─── Test 9: continueWithoutRating → SM-2 fallback, no FSRS call ─────────────

describe('Test 9: continueWithoutRating → SM-2 fallback, no ts-fsrs.next() call', () => {
  it('continueWithoutRating:true in context bypasses FSRS entirely', () => {
    setGate(true, true);
    const result = scheduleActiveFsrsOrFallback(
      fsrsPlannedRecord(),
      'correct',
      { now: NOW, continueWithoutRating: true }
    );
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });

  it('SM-2 fallback result has SM-2-like interval when continueWithoutRating', () => {
    setGate(true, true);
    const result = scheduleActiveFsrsOrFallback(
      fsrsPlannedRecord({ repetitionCount: 0, intervalDays: 1 }),
      'correct',
      { now: NOW, continueWithoutRating: true }
    );
    expect(result).not.toBeNull();
    // SM-2 interval for first correct: 1 day
    expect(result.intervalDays).toBeGreaterThanOrEqual(1);
  });
});

// ─── Test 10: no usable rating log → SM-2 fallback, no invented rating ────────

describe('Test 10: no usable rating log from resolveMemoryRatingFromLogs → SM-2 fallback, no invented rating', () => {
  it('no log at or after sessionStartedAt → continueWithoutRating path → no scheduleFsrsReview call', async () => {
    const { resolveMemoryRatingFromLogs } = await vi.importActual('../../src/state/reviewScheduleStorage.js');
    setGate(true, true);

    const record = fsrsPlannedRecord({
      fsrsReviewLogs: [{ rating: 'Good', reviewedAt: '2026-04-01T00:00:00.000Z', state: 'Review' }]
    });
    const sessionStartedAt = NOW.toISOString();

    const resolvedRating = resolveMemoryRatingFromLogs(record, sessionStartedAt);
    expect(resolvedRating).toBeNull();

    // Simulate what updateReviewScheduleFromHistoryRecord does:
    const context = resolvedRating ? { memoryRating: resolvedRating } : { continueWithoutRating: true };
    expect(context.continueWithoutRating).toBe(true);

    const result = scheduleActiveFsrsOrFallback(record, 'correct', { now: NOW, ...context });
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });

  it('no fsrsReviewLogs at all → null rating → SM-2 fallback', async () => {
    const { resolveMemoryRatingFromLogs } = await vi.importActual('../../src/state/reviewScheduleStorage.js');
    const record = fsrsPlannedRecord({ fsrsReviewLogs: [] });
    const resolvedRating = resolveMemoryRatingFromLogs(record, NOW.toISOString());
    expect(resolvedRating).toBeNull();
  });
});

// ─── Test 11: Dashboard mixed due summary handles fsrs-active fallback records ─

describe('Test 11: Dashboard mixed due summary handles fsrs-active fallback records correctly', () => {
  it('fsrs-active record with past dueAt is counted in dueCount and fsrsFamilyDueCount', () => {
    const result = computeMixedSchedulerDueSummary([fsrsActiveRecord()], NOW);
    expect(result.dueCount).toBe(1);
    expect(result.fsrsFamilyDueCount).toBe(1);
    expect(result.hasFsrsFamily).toBe(true);
  });

  it('fsrs-active record that fell back to SM-2 still counted correctly by schedulerKind', () => {
    setGate(false, false);
    const originalRecord = fsrsActiveRecord();
    const fallbackResult = scheduleCurrentReviewPreservingFsrs(originalRecord, 'correct', { now: NOW });
    expect(fallbackResult).not.toBeNull();
    // After SM-2 fallback, schedulerKind is preserved as 'fsrs-active'
    expect(fallbackResult.schedulerKind).toBe('fsrs-active');
    // Dashboard counts it by schedulerKind
    const dueRecord = { ...fallbackResult, dueAt: PAST.toISOString() };
    const summary = computeMixedSchedulerDueSummary([dueRecord], NOW);
    expect(summary.fsrsFamilyDueCount).toBe(1);
  });

  it('mixed SM-2 + fsrs-planned + fsrs-active records all counted correctly', () => {
    const records = [
      { itemId: 'sm2-1', dueAt: PAST.toISOString() },
      { itemId: 'fp-1', schedulerKind: 'fsrs-planned', dueAt: PAST.toISOString() },
      { itemId: 'fa-1', schedulerKind: 'fsrs-active', dueAt: PAST.toISOString() }
    ];
    const result = computeMixedSchedulerDueSummary(records, NOW);
    expect(result.dueCount).toBe(3);
    expect(result.fsrsFamilyDueCount).toBe(2);
    expect(result.hasFsrsFamily).toBe(true);
  });
});

// ─── Test 12: no new ts-fsrs.next() call sites outside approved wrapper ───────

describe('Test 12: no new ts-fsrs.next() call sites outside approved wrapper', () => {
  it('reviewSchedulerAdapter.js does not call .next() directly', () => {
    const source = fs.readFileSync('src/quiz/reviewSchedulerAdapter.js', 'utf8');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });

  it('reviewScheduleStorage.js does not call .next() directly', () => {
    const source = fs.readFileSync('src/state/reviewScheduleStorage.js', 'utf8');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });

  it('settingsStorage.js does not call .next() directly', () => {
    const source = fs.readFileSync('src/state/settingsStorage.js', 'utf8');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });

  it('fsrsWrapper.js exports scheduleFsrsReview as the only production .next() call site', () => {
    const source = fs.readFileSync('src/quiz/fsrsWrapper.js', 'utf8');
    expect(source).toContain('export function scheduleFsrsReview');
    // Only one .next( call allowed — inside scheduleFsrsReview
    const matches = source.match(/\.next\s*\(/g) ?? [];
    expect(matches.length).toBe(2); // scheduleFsrsReview and scheduleFsrsReviewForTest each call scheduler.next
  });
});

// ─── Test 13: StudyRoom and Dashboard source unchanged in Phase 15D ────────────

describe('Test 13: StudyRoom and Dashboard source unchanged in Phase 15D', () => {
  it('StudyRoom.jsx preserves Phase 14N invariants and does not call .next()', () => {
    const source = fs.readFileSync('src/routes/StudyRoom.jsx', 'utf8');
    expect(source).toContain('shouldShowFsrsTwoStepBridge');
    expect(source).toContain('appendFsrsReviewLog');
    expect(source).toContain('FsrsProductionMemoryRatingBridge');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });

  it('Dashboard.jsx preserves Phase 15C computeMixedSchedulerDueSummary and does not call .next()', () => {
    const source = fs.readFileSync('src/routes/Dashboard.jsx', 'utf8');
    expect(source).toContain('computeMixedSchedulerDueSummary');
    expect(source).not.toContain('fsrsActiveSchedulingEnabled');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });

  it('FsrsProductionMemoryRatingBridge.jsx does not call .next()', () => {
    const source = fs.readFileSync('src/components/study/FsrsProductionMemoryRatingBridge.jsx', 'utf8');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });
});

// ─── Test 14: no package/dependency changes ───────────────────────────────────

describe('Test 14: no package/dependency changes in Phase 15D', () => {
  it('package.json ts-fsrs remains pinned at 5.3.3', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    expect(pkg.dependencies?.['ts-fsrs']).toBe('5.3.3');
  });

  it('package.json and package-lock.json do not reference native binding', () => {
    const bindingStr = 'binding';
    const pkgText = fs.readFileSync('package.json', 'utf8');
    const lockText = fs.readFileSync('package-lock.json', 'utf8');
    expect(pkgText).not.toContain('@open-spaced-repetition/' + bindingStr);
    expect(lockText).not.toContain('@open-spaced-repetition/' + bindingStr);
  });

  it('package.json does not reference internal registry terms', () => {
    const pkgText = fs.readFileSync('package.json', 'utf8');
    expect(pkgText).not.toContain('applied-caas');
    expect(pkgText).not.toContain('artifactory');
    expect(pkgText).not.toContain('internal.api.openai');
    expect(pkgText).not.toContain('packages.applied');
  });
});
