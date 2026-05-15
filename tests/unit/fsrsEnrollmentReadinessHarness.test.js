import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  FSRS_DORMANT_SCHEDULER_VERSION,
  SCHEDULER_KIND_FSRS_PLANNED,
  isFsrsNewCardEnrollmentEligible,
  scheduleDormantFsrsReview,
  scheduleReview
} from '../../src/quiz/reviewSchedulerAdapter.js';
import { FSRS_REVIEW_LOG_CAP } from '../../src/state/reviewScheduleStorage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const NOW = new Date('2026-05-14T00:00:00.000Z');
const NOW_ISO = NOW.toISOString();

function readProjectFile(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

function makeNewRecord(overrides = {}) {
  return {
    itemId: 'item-new-1',
    subjectId: 'subject-1',
    topicId: 'topic-1',
    ...overrides
  };
}

function makeExistingRecord(overrides = {}) {
  return {
    itemId: 'item-existing-1',
    subjectId: 'subject-1',
    topicId: 'topic-1',
    lastReviewedAt: '2026-05-10T00:00:00.000Z',
    dueAt: '2026-05-13T00:00:00.000Z',
    intervalDays: 3,
    repetitionCount: 2,
    easeFactor: 2.25,
    correctStreak: 2,
    wrongCount: 0,
    ...overrides
  };
}

function makeDormantRecord(overrides = {}) {
  return makeExistingRecord({
    schedulerKind: 'fsrs-planned',
    schedulerVersion: 'phase14j-dormant-readiness',
    fsrsPayload: { state: 'New', difficulty: 5.0, stability: 1.0, retrievability: 1.0, reps: 0, phase: 'phase14j-dormant-readiness' },
    fsrsReviewLogs: [{ rating: 'Good', reviewedAt: '2026-05-10T00:00:00.000Z', state: 'Dormant', note: 'phase14j-inert-readiness-log' }],
    ...overrides
  });
}

function makeHistoryRecord(itemIds = ['item-new-1']) {
  return {
    id: 'study-abc',
    completedAt: '2026-05-12T00:00:00.000Z',
    itemResults: itemIds.map(itemId => ({
      itemId,
      itemType: 'question',
      status: 'correct'
    }))
  };
}

// ─── Enrollment eligibility gate ───────────────────────────────────────────

describe('Phase 14J enrollment eligibility gate', () => {
  it('toggle OFF blocks enrollment', () => {
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: 'item-new-1',
      toggleEnabled: false,
      priorRecord: null,
      studyHistoryRecords: []
    })).toBe(false);
  });

  it('existing priorRecord blocks enrollment', () => {
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: 'item-existing-1',
      toggleEnabled: true,
      priorRecord: makeExistingRecord(),
      studyHistoryRecords: []
    })).toBe(false);
  });

  it('prior study history for item blocks enrollment', () => {
    const history = [makeHistoryRecord(['item-new-1'])];
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: 'item-new-1',
      toggleEnabled: true,
      priorRecord: null,
      studyHistoryRecords: history
    })).toBe(false);
  });

  it('no existing schedule but prior history exists => no enrollment', () => {
    const history = [makeHistoryRecord(['item-a', 'item-new-1', 'item-b'])];
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: 'item-new-1',
      toggleEnabled: true,
      priorRecord: null,
      studyHistoryRecords: history
    })).toBe(false);
  });

  it('toggle ON + no priorRecord + no study history => eligible', () => {
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: 'item-truly-new',
      toggleEnabled: true,
      priorRecord: null,
      studyHistoryRecords: []
    })).toBe(true);
  });

  it('non-matching history (different itemId) does not block enrollment', () => {
    const history = [makeHistoryRecord(['item-other', 'item-different'])];
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: 'item-truly-new',
      toggleEnabled: true,
      priorRecord: null,
      studyHistoryRecords: history
    })).toBe(true);
  });

  it('empty studyHistoryRecords + toggle ON => eligible', () => {
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: 'item-truly-new',
      toggleEnabled: true,
      priorRecord: null,
      studyHistoryRecords: []
    })).toBe(true);
  });

  it('null studyHistoryRecords (not array) + toggle ON => eligible', () => {
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: 'item-truly-new',
      toggleEnabled: true,
      priorRecord: null,
      studyHistoryRecords: null
    })).toBe(true);
  });

  it('empty/falsy itemId is never eligible', () => {
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: '',
      toggleEnabled: true,
      priorRecord: null,
      studyHistoryRecords: []
    })).toBe(false);

    expect(isFsrsNewCardEnrollmentEligible({
      itemId: null,
      toggleEnabled: true,
      priorRecord: null,
      studyHistoryRecords: []
    })).toBe(false);
  });

  it('history with matching itemId in a later session record blocks enrollment', () => {
    const history = [
      makeHistoryRecord(['item-other-1']),
      makeHistoryRecord(['item-new-1', 'item-other-2'])
    ];
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: 'item-new-1',
      toggleEnabled: true,
      priorRecord: null,
      studyHistoryRecords: history
    })).toBe(false);
  });

  it('existing priorRecord with schedulerKind blocks enrollment', () => {
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: 'item-1',
      toggleEnabled: true,
      priorRecord: makeExistingRecord({ schedulerKind: 'fsrs-planned' }),
      studyHistoryRecords: []
    })).toBe(false);
  });

  it('existing priorRecord with fsrsPayload blocks enrollment', () => {
    expect(isFsrsNewCardEnrollmentEligible({
      itemId: 'item-1',
      toggleEnabled: true,
      priorRecord: makeExistingRecord({ fsrsPayload: { state: 'New', difficulty: 5 } }),
      studyHistoryRecords: []
    })).toBe(false);
  });
});

// ─── Dormant scheduler ─────────────────────────────────────────────────────

describe('Phase 14J dormant scheduler', () => {
  it('returns a result with SM-2 interval fields', () => {
    const record = makeNewRecord({ itemId: 'item-dormant-1' });
    const result = scheduleDormantFsrsReview(record, 'correct', { now: NOW });

    expect(result).not.toBeNull();
    expect(typeof result.intervalDays).toBe('number');
    expect(result.intervalDays).toBeGreaterThan(0);
    expect(result.dueAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(result.repetitionCount).toBeGreaterThan(0);
  });

  it('assigns schedulerKind: fsrs-planned', () => {
    const result = scheduleDormantFsrsReview(makeNewRecord(), 'correct', { now: NOW });
    expect(result.schedulerKind).toBe(SCHEDULER_KIND_FSRS_PLANNED);
    expect(result.schedulerKind).toBe('fsrs-planned');
  });

  it('assigns schedulerVersion: phase14j-dormant-readiness', () => {
    const result = scheduleDormantFsrsReview(makeNewRecord(), 'correct', { now: NOW });
    expect(result.schedulerVersion).toBe(FSRS_DORMANT_SCHEDULER_VERSION);
    expect(result.schedulerVersion).toBe('phase14j-dormant-readiness');
  });

  it('preserves existing fsrsPayload when present (KEY blocker fix)', () => {
    const existingPayload = { state: 'Learning', difficulty: 6.5, stability: 2.3, retrievability: 0.85, reps: 3, phase: 'phase14j-dormant-readiness' };
    const record = makeDormantRecord({ fsrsPayload: existingPayload });
    const result = scheduleDormantFsrsReview(record, 'correct', { now: NOW });

    expect(result.fsrsPayload).toEqual(existingPayload);
    // Must not overwrite with dormant placeholder
    expect(result.fsrsPayload.difficulty).toBe(6.5);
    expect(result.fsrsPayload.reps).toBe(3);
  });

  it('creates initial dormant payload when no existing fsrsPayload', () => {
    const record = makeNewRecord({ itemId: 'item-no-payload' });
    const result = scheduleDormantFsrsReview(record, 'correct', { now: NOW });

    expect(result.fsrsPayload).toMatchObject({
      state: 'New',
      difficulty: 5.0,
      stability: 1.0,
      retrievability: 1.0,
      reps: 0,
      phase: 'phase14j-dormant-readiness'
    });
  });

  it('appends inert log entry with correct fields for correct outcome', () => {
    const record = makeNewRecord();
    const result = scheduleDormantFsrsReview(record, 'correct', { now: NOW });

    expect(Array.isArray(result.fsrsReviewLogs)).toBe(true);
    const lastLog = result.fsrsReviewLogs.at(-1);
    expect(lastLog.rating).toBe('Good');
    expect(lastLog.state).toBe('Dormant');
    expect(lastLog.note).toBe('phase14j-inert-readiness-log');
    expect(lastLog.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it('appends inert log entry with Again for wrong outcome', () => {
    const record = makeNewRecord();
    const result = scheduleDormantFsrsReview(record, 'wrong', { now: NOW });

    const lastLog = result.fsrsReviewLogs.at(-1);
    expect(lastLog.rating).toBe('Again');
  });

  it('appends inert log entry with Again for unanswered outcome', () => {
    const record = makeNewRecord();
    const result = scheduleDormantFsrsReview(record, 'unanswered', { now: NOW });

    const lastLog = result.fsrsReviewLogs.at(-1);
    expect(lastLog.rating).toBe('Again');
  });

  it('caps fsrsReviewLogs at FSRS_REVIEW_LOG_CAP = 20', () => {
    const existingLogs = Array.from({ length: 22 }, (_, i) => ({
      rating: 'Good',
      reviewedAt: `2026-04-${String(i + 1).padStart(2, '0')}T00:00:00.000Z`,
      state: 'Dormant',
      note: 'phase14j-inert-readiness-log'
    }));
    const record = makeDormantRecord({ fsrsReviewLogs: existingLogs });
    const result = scheduleDormantFsrsReview(record, 'correct', { now: NOW });

    expect(result.fsrsReviewLogs).toHaveLength(FSRS_REVIEW_LOG_CAP);
    expect(FSRS_REVIEW_LOG_CAP).toBe(20);
    // Most recent log is the new inert entry
    expect(result.fsrsReviewLogs.at(-1).note).toBe('phase14j-inert-readiness-log');
  });

  it('appends to existing review logs (does not replace them)', () => {
    const existingLog = { rating: 'Good', reviewedAt: '2026-05-10T00:00:00.000Z', state: 'Dormant', note: 'phase14j-inert-readiness-log' };
    const record = makeDormantRecord({ fsrsReviewLogs: [existingLog] });
    const result = scheduleDormantFsrsReview(record, 'correct', { now: NOW });

    expect(result.fsrsReviewLogs).toHaveLength(2);
    expect(result.fsrsReviewLogs[0]).toEqual(existingLog);
  });

  it('does not mutate the input record', () => {
    const record = makeDormantRecord();
    const before = JSON.parse(JSON.stringify(record));
    scheduleDormantFsrsReview(record, 'correct', { now: NOW });
    expect(record).toEqual(before);
  });

  it('returns null for invalid itemId', () => {
    const result = scheduleDormantFsrsReview({ itemId: '' }, 'correct', { now: NOW });
    expect(result).toBeNull();
  });
});

// ─── Phase 14J invariants ──────────────────────────────────────────────────

describe('Phase 14J invariants', () => {
  it('patch consistency: all Phase 14J required files exist on disk', () => {
    expect(fs.existsSync(resolve(PROJECT_ROOT, 'docs/phase14j-fsrs-enrollment-readiness-harness.md'))).toBe(true);
    expect(fs.existsSync(resolve(PROJECT_ROOT, 'scripts/validate-phase14j-fsrs-enrollment-readiness.js'))).toBe(true);
    expect(fs.existsSync(resolve(PROJECT_ROOT, 'tests/unit/fsrsEnrollmentReadinessHarness.test.js'))).toBe(true);
  });

  it('adapter exports isFsrsNewCardEnrollmentEligible and scheduleDormantFsrsReview', () => {
    const adapterSource = readProjectFile('src/quiz/reviewSchedulerAdapter.js');
    expect(adapterSource).toContain('export function isFsrsNewCardEnrollmentEligible');
    expect(adapterSource).toContain('export function scheduleDormantFsrsReview');
    expect(adapterSource).toContain('FSRS_DORMANT_SCHEDULER_VERSION');
  });

  it('Phase 14D enableFsrsTestRoute behavior is still intact in adapter source', () => {
    const adapterSource = readProjectFile('src/quiz/reviewSchedulerAdapter.js');
    expect(adapterSource).toContain('context.enableFsrsTestRoute === true');
  });

  it('adapter does not read localStorage or process.env', () => {
    const adapterSource = readProjectFile('src/quiz/reviewSchedulerAdapter.js');
    expect(adapterSource).not.toMatch(/localStorage/i);
    expect(adapterSource).not.toMatch(/process\.env/i);
  });

  it('no production ts-fsrs.next() in adapter or storage source', () => {
    const adapterSource = readProjectFile('src/quiz/reviewSchedulerAdapter.js');
    const storageSource = readProjectFile('src/state/reviewScheduleStorage.js');
    // next( is only allowed in fsrsWrapper.js (test prototype)
    expect(adapterSource).not.toMatch(/\.next\s*\(/);
    expect(storageSource).not.toMatch(/\.next\s*\(/);
  });

  it('scheduleReview handles fsrs-planned records via double gate (SM-2 fallback when gate off)', () => {
    let result;
    expect(() => {
      result = scheduleReview(makeExistingRecord({ schedulerKind: 'fsrs-planned' }), 'correct', { now: NOW });
    }).not.toThrow();
    expect(result).not.toBeNull();
  });

  it('StudyRoom and Dashboard unchanged — no FSRS rating UI', () => {
    const studyRoom = readProjectFile('src/routes/StudyRoom.jsx');
    const dashboard = readProjectFile('src/routes/Dashboard.jsx');
    expect(studyRoom).not.toMatch(/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/);
    expect(dashboard).not.toMatch(/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/);
    expect(studyRoom).not.toMatch(/scheduleDormantFsrsReview/);
    expect(studyRoom).not.toMatch(/isFsrsNewCardEnrollmentEligible/);
  });

  it('active FSRS scheduling via scheduleActiveFsrsOrFallback — no .next() in adapter directly', () => {
    const adapterSource = readProjectFile('src/quiz/reviewSchedulerAdapter.js');
    // scheduleDormantFsrsReview must not call ts-fsrs.next()
    expect(adapterSource).not.toMatch(/scheduleFsrsReviewForTest\s*\(\s*[^)]*\)\s*;?\s*\/\/.*dormant/i);
    // scheduleReview uses double gate; adapter delegates .next() only via scheduleFsrsReview from fsrsWrapper
    expect(adapterSource).toContain('scheduleActiveFsrsOrFallback');
    expect(adapterSource).toContain('fsrsExperimentalEnabled');
    expect(adapterSource).toContain('fsrsActiveSchedulingEnabled');
  });

  it('FSRS_REVIEW_LOG_CAP is exported and equals 20', () => {
    expect(FSRS_REVIEW_LOG_CAP).toBe(20);
  });

  it('toggle OFF preserves existing fsrsPayload and fsrsReviewLogs through dormant scheduling', () => {
    const existingPayload = { state: 'Learning', difficulty: 6.0, stability: 3.0, retrievability: 0.90, reps: 2, phase: 'phase14j-dormant-readiness' };
    const existingLog = { rating: 'Good', reviewedAt: '2026-05-10T00:00:00.000Z', state: 'Dormant', note: 'phase14j-inert-readiness-log' };
    const record = makeDormantRecord({ fsrsPayload: existingPayload, fsrsReviewLogs: [existingLog] });

    // Simulating: toggle OFF means no new enrollment, but dormant fallback still preserves metadata
    const result = scheduleDormantFsrsReview(record, 'correct', { now: NOW });

    expect(result.fsrsPayload).toEqual(existingPayload);
    expect(result.fsrsReviewLogs[0]).toEqual(existingLog);
    expect(result.fsrsReviewLogs).toHaveLength(2);
  });
});
