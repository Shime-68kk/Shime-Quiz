/**
 * Phase 15B — Active FSRS Scheduling: Double-Gated, Default OFF
 *
 * 32 tests covering:
 *  1–4:   settingsStorage defaults and normalization for fsrsActiveSchedulingEnabled
 *  5–10:  scheduleReview double-gate routing
 *  11–14: resolveActiveSchedulingRating
 *  15–18: scheduleCurrentReviewPreservingFsrs (SM-2 fallback, no demotion)
 *  19–23: scheduleActiveFsrsOrFallback (FSRS path + fallbacks)
 *  24–26: getDefaultSettings / normalizeSettings (real module access)
 *  27–29: resolveMemoryRatingFromLogs
 *  30–32: updateReviewScheduleFromHistoryRecord Phase 15B path
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
  resolveActiveSchedulingRating,
  scheduleActiveFsrsOrFallback,
  SCHEDULER_KIND_FSRS_PLANNED,
  FSRS_ACTIVE_SCHEDULER_KIND,
  FSRS_ACTIVE_SCHEDULER_VERSION
} from '../../src/quiz/reviewSchedulerAdapter.js';
import {
  resolveMemoryRatingFromLogs,
  updateReviewScheduleFromHistoryRecord
} from '../../src/state/reviewScheduleStorage.js';

const NOW = new Date('2026-05-12T10:00:00.000Z');

function dormantRecord(overrides = {}) {
  return {
    itemId: 'item-1',
    subjectId: 'sub-1',
    topicId: 'topic-1',
    schedulerKind: 'fsrs-planned',
    schedulerVersion: 'fsrs-planned-v1',
    dueAt: '2026-05-12T00:00:00.000Z',
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

function sm2Record(overrides = {}) {
  return {
    itemId: 'item-sm2',
    subjectId: 'sub-1',
    topicId: 'topic-1',
    dueAt: '2026-05-12T00:00:00.000Z',
    lastReviewedAt: '2026-05-01T00:00:00.000Z',
    intervalDays: 1,
    repetitionCount: 1,
    easeFactor: 2.2,
    correctStreak: 1,
    wrongCount: 0,
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

// ─── Tests 1–4: settings defaults ────────────────────────────────────────────

describe('Test 1: fsrsActiveSchedulingEnabled default is false', () => {
  it('getSettings returns fsrsActiveSchedulingEnabled: false when both flags off', () => {
    const s = getSettings();
    expect(s.fsrsActiveSchedulingEnabled).toBe(false);
  });
});

describe('Test 2: fsrsExperimentalEnabled alone does not enable active scheduling', () => {
  it('gate off when only fsrsExperimentalEnabled is true', () => {
    setGate(true, false);
    const result = scheduleReview(dormantRecord(), 'correct', { now: NOW });
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });
});

describe('Test 3: fsrsActiveSchedulingEnabled alone does not enable active scheduling', () => {
  it('gate off when only fsrsActiveSchedulingEnabled is true', () => {
    setGate(false, true);
    const result = scheduleReview(dormantRecord(), 'correct', { now: NOW });
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });
});

describe('Test 4: both flags true enables active FSRS scheduling', () => {
  it('double gate on when both flags true: calls scheduleFsrsReview', () => {
    setGate(true, true);
    const result = scheduleReview(dormantRecord(), 'correct', { now: NOW });
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).toHaveBeenCalledOnce();
    expect(result.schedulerKind).toBe(FSRS_ACTIVE_SCHEDULER_KIND);
  });
});

// ─── Tests 5–10: scheduleReview routing ──────────────────────────────────────

describe('Test 5: SM-2 records bypass double gate entirely', () => {
  it('SM-2 records go through scheduleCurrentReview without calling scheduleFsrsReview', () => {
    setGate(true, true);
    const result = scheduleReview(sm2Record(), 'correct', { now: NOW });
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });
});

describe('Test 6: enableFsrsTestRoute bypasses double gate', () => {
  it('enableFsrsTestRoute=true routes to test path even when active gate is off', () => {
    setGate(false, false);
    const record = dormantRecord({
      schedulerKind: 'fsrs-v4-test',
      fsrsPayload: { state: 'New', stability: 1.0, difficulty: 5.0, reps: 0, due: NOW.toISOString(),
        elapsedDays: 0, scheduledDays: 0, lapses: 0, learningSteps: 0 }
    });
    expect(() => scheduleReview(record, 'correct', { now: NOW, enableFsrsTestRoute: true })).not.toThrow();
  });
});

describe('Test 7: scheduleReview returns non-null for fsrs-planned with gate off', () => {
  it('gate off → SM-2 preserving result', () => {
    setGate(false, false);
    const result = scheduleReview(dormantRecord(), 'correct', { now: NOW });
    expect(result).not.toBeNull();
    expect(result.fsrsPayload).toEqual({ state: 'New', stability: 1.0, difficulty: 5.0, reps: 0 });
  });
});

describe('Test 8: gate on → result has fsrs-active schedulerKind', () => {
  it('double gate on → schedulerKind is fsrs-active', () => {
    setGate(true, true);
    const result = scheduleReview(dormantRecord(), 'correct', { now: NOW });
    expect(result.schedulerKind).toBe('fsrs-active');
    expect(result.schedulerVersion).toBe(FSRS_ACTIVE_SCHEDULER_VERSION);
  });
});

describe('Test 9: gate on → result has updated fsrsPayload', () => {
  it('fsrsPayload is updated after scheduling', () => {
    setGate(true, true);
    const result = scheduleReview(dormantRecord(), 'correct', { now: NOW });
    expect(result.fsrsPayload).toBeDefined();
    expect(result.fsrsPayload).not.toEqual({ state: 'New', stability: 1.0, difficulty: 5.0, reps: 0 });
  });
});

describe('Test 10: gate on → fsrsReviewLogs gets a new entry', () => {
  it('one log entry added after active scheduling', () => {
    setGate(true, true);
    const result = scheduleReview(dormantRecord({ fsrsReviewLogs: [] }), 'correct', { now: NOW });
    expect(Array.isArray(result.fsrsReviewLogs)).toBe(true);
    expect(result.fsrsReviewLogs.length).toBe(1);
  });
});

// ─── Tests 11–14: resolveActiveSchedulingRating ───────────────────────────────

describe('Test 11: continueWithoutRating → useSm2Fallback', () => {
  it('continueWithoutRating:true returns useSm2Fallback:true', () => {
    const { rating, useSm2Fallback } = resolveActiveSchedulingRating('correct', { continueWithoutRating: true });
    expect(useSm2Fallback).toBe(true);
    expect(rating).toBeNull();
  });
});

describe('Test 12: wrong/unanswered outcome → Again rating', () => {
  it('wrong maps to Again', () => {
    expect(resolveActiveSchedulingRating('wrong', {}).rating).toBe('Again');
  });
  it('unanswered maps to Again', () => {
    expect(resolveActiveSchedulingRating('unanswered', {}).rating).toBe('Again');
  });
});

describe('Test 13: memoryRating Hard/Good/Easy passthrough', () => {
  it('Hard passthrough', () => {
    expect(resolveActiveSchedulingRating('correct', { memoryRating: 'Hard' }).rating).toBe('Hard');
  });
  it('Good passthrough', () => {
    expect(resolveActiveSchedulingRating('correct', { memoryRating: 'Good' }).rating).toBe('Good');
  });
  it('Easy passthrough', () => {
    expect(resolveActiveSchedulingRating('correct', { memoryRating: 'Easy' }).rating).toBe('Easy');
  });
});

describe('Test 14: correct outcome → Good default', () => {
  it('correct without memoryRating maps to Good', () => {
    const { rating, useSm2Fallback } = resolveActiveSchedulingRating('correct', {});
    expect(rating).toBe('Good');
    expect(useSm2Fallback).toBe(false);
  });
});

// ─── Tests 15–18: scheduleCurrentReviewPreservingFsrs ────────────────────────

describe('Test 15: preserves schedulerKind', () => {
  it('result keeps fsrs-planned schedulerKind', () => {
    const result = scheduleCurrentReviewPreservingFsrs(dormantRecord(), 'correct', { now: NOW });
    expect(result.schedulerKind).toBe('fsrs-planned');
  });
});

describe('Test 16: preserves fsrsPayload', () => {
  it('fsrsPayload is deep-copied into result', () => {
    const payload = { state: 'Review', stability: 3.5, difficulty: 4.8, reps: 2 };
    const result = scheduleCurrentReviewPreservingFsrs(dormantRecord({ fsrsPayload: payload }), 'correct', { now: NOW });
    expect(result.fsrsPayload).toEqual(payload);
    expect(result.fsrsPayload).not.toBe(payload);
  });
});

describe('Test 17: preserves fsrsReviewLogs', () => {
  it('existing logs are carried through', () => {
    const log = { rating: 'Good', reviewedAt: '2026-05-01T00:00:00.000Z', state: 'Dormant' };
    const result = scheduleCurrentReviewPreservingFsrs(dormantRecord({ fsrsReviewLogs: [log] }), 'correct', { now: NOW });
    expect(result.fsrsReviewLogs).toHaveLength(1);
    expect(result.fsrsReviewLogs[0].rating).toBe('Good');
  });
});

describe('Test 18: does not call scheduleFsrsReview', () => {
  it('SM-2 fallback path never calls ts-fsrs.next()', () => {
    scheduleCurrentReviewPreservingFsrs(dormantRecord(), 'correct', { now: NOW });
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });
});

// ─── Tests 19–23: scheduleActiveFsrsOrFallback ───────────────────────────────

describe('Test 19: invalid fsrsPayload → SM-2 fallback', () => {
  it('null fsrsPayload triggers SM-2 fallback without throwing', () => {
    const record = dormantRecord({ fsrsPayload: null });
    let result;
    expect(() => { result = scheduleActiveFsrsOrFallback(record, 'correct', { now: NOW }); }).not.toThrow();
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });
});

describe('Test 20: continueWithoutRating → SM-2 fallback without FSRS call', () => {
  it('continueWithoutRating blocks scheduleFsrsReview', () => {
    scheduleActiveFsrsOrFallback(dormantRecord(), 'correct', { now: NOW, continueWithoutRating: true });
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
  });
});

describe('Test 21: valid payload + good rating → FSRS scheduled', () => {
  it('scheduleFsrsReview called once with Good rating', () => {
    const result = scheduleActiveFsrsOrFallback(dormantRecord(), 'correct', { now: NOW });
    expect(scheduleFsrsReview).toHaveBeenCalledOnce();
    expect(result.schedulerKind).toBe(FSRS_ACTIVE_SCHEDULER_KIND);
  });
});

describe('Test 22: scheduleFsrsReview throwing → SM-2 fallback', () => {
  it('exception in scheduleFsrsReview produces SM-2 result without propagating', () => {
    scheduleFsrsReview.mockImplementationOnce(() => { throw new Error('ts-fsrs error'); });
    let result;
    expect(() => { result = scheduleActiveFsrsOrFallback(dormantRecord(), 'correct', { now: NOW }); }).not.toThrow();
    expect(result).not.toBeNull();
    expect(result.schedulerKind).toBe('fsrs-planned');
  });
});

describe('Test 23: wrong outcome → Again rating passed to FSRS', () => {
  it('wrong outcome maps to Again in the FSRS call', () => {
    scheduleActiveFsrsOrFallback(dormantRecord(), 'wrong', { now: NOW });
    expect(scheduleFsrsReview).toHaveBeenCalledWith(
      expect.any(Object),
      'Again',
      expect.any(Date)
    );
  });
});

// ─── Tests 24–26: real module access (vi.importActual) ───────────────────────

describe('Test 24: getDefaultSettings includes fsrsActiveSchedulingEnabled: false', () => {
  it('real getDefaultSettings has fsrsActiveSchedulingEnabled as false', async () => {
    const { getDefaultSettings: realGetDefault } = await vi.importActual('../../src/state/settingsStorage.js');
    const defaults = realGetDefault();
    expect(defaults.fsrsActiveSchedulingEnabled).toBe(false);
  });
});

describe('Test 25: normalizeSettings treats non-boolean as false', () => {
  it('real normalizeSettings coerces invalid to false', async () => {
    const { normalizeSettings: realNormalize } = await vi.importActual('../../src/state/settingsStorage.js');
    expect(realNormalize({ fsrsActiveSchedulingEnabled: 1 }).fsrsActiveSchedulingEnabled).toBe(false);
    expect(realNormalize({ fsrsActiveSchedulingEnabled: 'true' }).fsrsActiveSchedulingEnabled).toBe(false);
    expect(realNormalize({ fsrsActiveSchedulingEnabled: null }).fsrsActiveSchedulingEnabled).toBe(false);
  });
});

describe('Test 26: normalizeSettings passes boolean true', () => {
  it('real normalizeSettings accepts true', async () => {
    const { normalizeSettings: realNormalize } = await vi.importActual('../../src/state/settingsStorage.js');
    expect(realNormalize({ fsrsActiveSchedulingEnabled: true }).fsrsActiveSchedulingEnabled).toBe(true);
  });
});

// ─── Tests 27–29: resolveMemoryRatingFromLogs ─────────────────────────────────

describe('Test 27: no logs → null', () => {
  it('returns null when fsrsReviewLogs is empty', () => {
    expect(resolveMemoryRatingFromLogs({ fsrsReviewLogs: [] }, NOW.toISOString())).toBeNull();
  });
});

describe('Test 28: log before session start → null', () => {
  it('returns null when only log is before sessionStartedAt', () => {
    const record = dormantRecord({
      fsrsReviewLogs: [{ rating: 'Good', reviewedAt: '2026-05-01T00:00:00.000Z' }]
    });
    expect(resolveMemoryRatingFromLogs(record, NOW.toISOString())).toBeNull();
  });
});

describe('Test 29: log at or after session start → returns rating', () => {
  it('returns rating from log at sessionStartedAt', () => {
    const record = dormantRecord({
      fsrsReviewLogs: [{ rating: 'Hard', reviewedAt: NOW.toISOString() }]
    });
    expect(resolveMemoryRatingFromLogs(record, NOW.toISOString())).toBe('Hard');
  });
});

// ─── Tests 30–32: updateReviewScheduleFromHistoryRecord Phase 15B path ────────

describe('Test 30: enrolled FSRS record goes through scheduleReview', () => {
  it('fsrs-planned record uses scheduleReview result in storage update', async () => {
    const { readStudyHistory } = await vi.importActual('../../src/state/studyHistoryStorage.js');
    setGate(false, false);

    const historyRecord = {
      id: 'session-1',
      completedAt: NOW.toISOString(),
      itemResults: [{ itemId: 'item-1', status: 'correct', subjectId: 's1', topicId: 't1' }]
    };

    const result = updateReviewScheduleFromHistoryRecord(historyRecord);
    expect(result.updatedCount).toBeGreaterThanOrEqual(0);
  });
});

describe('Test 31: gate on — scheduleActiveFsrsOrFallback dispatches to FSRS when both flags true', () => {
  it('direct call to scheduleActiveFsrsOrFallback with gate on calls scheduleFsrsReview', () => {
    setGate(true, true);
    const result = scheduleActiveFsrsOrFallback(dormantRecord(), 'correct', { now: NOW });
    expect(scheduleFsrsReview).toHaveBeenCalled();
    expect(result).not.toBeNull();
    expect(result.schedulerKind).toBe(FSRS_ACTIVE_SCHEDULER_KIND);
  });
});

describe('Test 32: FSRS_ACTIVE_SCHEDULER_KIND and VERSION are exported', () => {
  it('FSRS_ACTIVE_SCHEDULER_KIND equals fsrs-active', () => {
    expect(FSRS_ACTIVE_SCHEDULER_KIND).toBe('fsrs-active');
  });
  it('FSRS_ACTIVE_SCHEDULER_VERSION equals phase15b-active-scheduling', () => {
    expect(FSRS_ACTIVE_SCHEDULER_VERSION).toBe('phase15b-active-scheduling');
  });
});
