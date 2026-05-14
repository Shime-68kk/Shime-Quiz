import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/state/settingsStorage.js', () => ({
  getSettings: vi.fn()
}));

vi.mock('../../src/state/studyHistoryStorage.js', () => ({
  readStudyHistory: vi.fn()
}));

import { getSettings } from '../../src/state/settingsStorage.js';
import { readStudyHistory } from '../../src/state/studyHistoryStorage.js';
import {
  updateReviewScheduleFromHistoryRecord,
  readReviewSchedule,
  FSRS_REVIEW_LOG_CAP
} from '../../src/state/reviewScheduleStorage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const NOW_ISO = '2026-05-14T00:00:00.000Z';

function readProjectFile(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

function makeMockStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: key => map.delete(key),
    clear: () => map.clear()
  };
}

let mockStorage;
let savedWindow;
let savedCustomEvent;

function setupMockWindow() {
  savedWindow = globalThis.window;
  savedCustomEvent = globalThis.CustomEvent;

  Object.defineProperty(globalThis, 'CustomEvent', {
    configurable: true,
    value: class CustomEvent {
      constructor(type, options = {}) { this.type = type; this.detail = options?.detail; }
    }
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: mockStorage,
      dispatchEvent() { return true; },
      addEventListener() {},
      removeEventListener() {}
    }
  });
}

function teardownMockWindow() {
  if (savedWindow === undefined) delete globalThis.window;
  else Object.defineProperty(globalThis, 'window', { configurable: true, value: savedWindow });
  if (savedCustomEvent === undefined) delete globalThis.CustomEvent;
  else Object.defineProperty(globalThis, 'CustomEvent', { configurable: true, value: savedCustomEvent });
}

beforeEach(() => {
  mockStorage = makeMockStorage();
  setupMockWindow();
  vi.clearAllMocks();
});

afterEach(() => {
  teardownMockWindow();
});

function makeHistoryRecord({ id = 'session-test-1', completedAt = NOW_ISO, itemResults = [] } = {}) {
  return { id, completedAt, itemResults };
}

function makeItemResult(itemId, status = 'correct', extras = {}) {
  return { itemId, status, subjectId: 'subj-1', topicId: 'topic-1', ...extras };
}

function makeScheduleRecord(itemId, extras = {}) {
  return {
    itemId,
    subjectId: 'subj-1',
    topicId: 'topic-1',
    lastReviewedAt: '2026-05-10T00:00:00.000Z',
    dueAt: '2026-05-13T00:00:00.000Z',
    intervalDays: 3,
    repetitionCount: 2,
    easeFactor: 2.25,
    correctStreak: 2,
    wrongCount: 0,
    ...extras
  };
}

function seedSchedule(records = []) {
  const payload = {
    schemaVersion: 'v2-review-schedule-v1',
    updatedAt: NOW_ISO,
    records
  };
  mockStorage.setItem('shimeV2ReviewScheduleV1', JSON.stringify(payload));
}

function defaultMocks({ toggleEnabled = false, priorHistory = [] } = {}) {
  getSettings.mockReturnValue({ fsrsExperimentalEnabled: toggleEnabled });
  readStudyHistory.mockReturnValue({ records: priorHistory });
}

// ─── Test 1: Toggle OFF → SM-2 schedule, no FSRS metadata ──────────────────

describe('Test 1: toggle OFF produces SM-2 schedule without FSRS metadata', () => {
  it('result has no schedulerKind, no fsrsPayload, no fsrsReviewLogs', () => {
    defaultMocks({ toggleEnabled: false });
    const hr = makeHistoryRecord({ itemResults: [makeItemResult('item-new', 'correct')] });
    const result = updateReviewScheduleFromHistoryRecord(hr);

    expect(result.ok).toBe(true);
    expect(result.updatedCount).toBe(1);
    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-new');
    expect(rec).toBeDefined();
    expect(rec.schedulerKind).toBeUndefined();
    expect(rec.fsrsPayload).toBeUndefined();
    expect(rec.fsrsReviewLogs).toBeUndefined();
  });
});

// ─── Test 2: Toggle ON + eligible new card → dormant FSRS metadata ──────────

describe('Test 2: toggle ON + eligible new card gets dormant FSRS metadata', () => {
  it('result has schedulerKind fsrs-planned, fsrsPayload, fsrsReviewLogs', () => {
    defaultMocks({ toggleEnabled: true, priorHistory: [] });
    const hr = makeHistoryRecord({ itemResults: [makeItemResult('item-brand-new', 'correct')] });
    const result = updateReviewScheduleFromHistoryRecord(hr);

    expect(result.ok).toBe(true);
    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-brand-new');
    expect(rec).toBeDefined();
    expect(rec.schedulerKind).toBe('fsrs-planned');
    expect(rec.schedulerVersion).toBe('phase14j-dormant-readiness');
    expect(rec.fsrsPayload).toBeDefined();
    expect(typeof rec.fsrsPayload).toBe('object');
    expect(Array.isArray(rec.fsrsReviewLogs)).toBe(true);
    expect(rec.fsrsReviewLogs.length).toBeGreaterThan(0);
  });
});

// ─── Test 3: Toggle ON + eligible → SM-2 interval fields still present ──────

describe('Test 3: dormant enrolled card still has SM-2 interval fields', () => {
  it('intervalDays, dueAt, easeFactor are present and valid', () => {
    defaultMocks({ toggleEnabled: true, priorHistory: [] });
    const hr = makeHistoryRecord({ itemResults: [makeItemResult('item-sm2-check', 'correct')] });
    updateReviewScheduleFromHistoryRecord(hr);

    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-sm2-check');
    expect(rec).toBeDefined();
    expect(typeof rec.intervalDays).toBe('number');
    expect(rec.intervalDays).toBeGreaterThan(0);
    expect(rec.dueAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(typeof rec.easeFactor).toBe('number');
    expect(rec.repetitionCount).toBeGreaterThan(0);
  });
});

// ─── Test 4: Existing schedule record blocks enrollment ─────────────────────

describe('Test 4: existing schedule record blocks dormant enrollment', () => {
  it('card with prior schedule record gets SM-2 update, no new FSRS fields added', () => {
    defaultMocks({ toggleEnabled: true, priorHistory: [] });
    seedSchedule([makeScheduleRecord('item-existing')]);
    const hr = makeHistoryRecord({ itemResults: [makeItemResult('item-existing', 'correct')] });
    updateReviewScheduleFromHistoryRecord(hr);

    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-existing');
    expect(rec).toBeDefined();
    expect(rec.schedulerKind).toBeUndefined();
    expect(rec.fsrsPayload).toBeUndefined();
    expect(rec.fsrsReviewLogs).toBeUndefined();
    // SM-2 update did happen
    expect(rec.repetitionCount).toBe(3);
  });
});

// ─── Test 5: Prior study history (different session) blocks enrollment ───────

describe('Test 5: prior study history from a different session blocks enrollment', () => {
  it('item with history in another session is not enrolled', () => {
    const priorSession = {
      id: 'session-prior',
      completedAt: '2026-05-10T00:00:00.000Z',
      itemResults: [makeItemResult('item-has-history', 'correct')]
    };
    defaultMocks({ toggleEnabled: true, priorHistory: [priorSession] });
    const hr = makeHistoryRecord({ id: 'session-new', itemResults: [makeItemResult('item-has-history', 'correct')] });
    updateReviewScheduleFromHistoryRecord(hr);

    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-has-history');
    expect(rec).toBeDefined();
    expect(rec.schedulerKind).toBeUndefined();
    expect(rec.fsrsPayload).toBeUndefined();
  });
});

// ─── Test 6: Prior-history gate excludes current session id ─────────────────

describe('Test 6: prior-history gate excludes the current session id', () => {
  it('item is enrolled when the only history record is the current session (excluded by id)', () => {
    // Simulate: the current session was already saved to study history storage
    const currentSession = {
      id: 'session-current-123',
      completedAt: NOW_ISO,
      itemResults: [makeItemResult('item-first-time', 'correct')]
    };
    // readStudyHistory returns the current session; it must be excluded by id
    defaultMocks({ toggleEnabled: true, priorHistory: [currentSession] });
    const hr = makeHistoryRecord({
      id: 'session-current-123',
      itemResults: [makeItemResult('item-first-time', 'correct')]
    });
    updateReviewScheduleFromHistoryRecord(hr);

    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-first-time');
    expect(rec).toBeDefined();
    expect(rec.schedulerKind).toBe('fsrs-planned');
    expect(rec.fsrsPayload).toBeDefined();
  });
});

// ─── Test 7: Existing schedulerKind on priorRecord blocks duplicate enrollment

describe('Test 7: existing schedulerKind on priorRecord blocks duplicate enrollment', () => {
  it('card with existing schedulerKind is not re-enrolled', () => {
    defaultMocks({ toggleEnabled: true, priorHistory: [] });
    seedSchedule([makeScheduleRecord('item-7', {
      schedulerKind: 'fsrs-planned',
      schedulerVersion: 'phase14j-dormant-readiness',
      fsrsPayload: { state: 'New', difficulty: 5.0, stability: 1.0, retrievability: 1.0, reps: 0, phase: 'phase14j-dormant-readiness' },
      fsrsReviewLogs: [{ rating: 'Good', reviewedAt: '2026-05-10T00:00:00.000Z', state: 'Dormant', note: 'phase14j-inert-readiness-log' }]
    })]);
    const hr = makeHistoryRecord({ itemResults: [makeItemResult('item-7', 'correct')] });
    updateReviewScheduleFromHistoryRecord(hr);

    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-7');
    expect(rec).toBeDefined();
    // priorRecord existed → enrollment blocked; SM-2 path ran; FSRS fields preserved
    expect(rec.schedulerKind).toBe('fsrs-planned');
    expect(rec.repetitionCount).toBe(3);
  });
});

// ─── Test 8: Existing fsrsPayload on priorRecord blocks duplicate enrollment ─

describe('Test 8: existing fsrsPayload on priorRecord blocks duplicate enrollment', () => {
  it('card with existing fsrsPayload is not re-enrolled', () => {
    defaultMocks({ toggleEnabled: true, priorHistory: [] });
    seedSchedule([makeScheduleRecord('item-8', {
      fsrsPayload: { state: 'Learning', difficulty: 6.0, stability: 2.0, retrievability: 0.9, reps: 1, phase: 'phase14j-dormant-readiness' }
    })]);
    const hr = makeHistoryRecord({ itemResults: [makeItemResult('item-8', 'correct')] });
    updateReviewScheduleFromHistoryRecord(hr);

    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-8');
    expect(rec).toBeDefined();
    // priorRecord existed; existing fsrsPayload preserved via getPreservedFsrsFields
    expect(rec.fsrsPayload).toBeDefined();
    expect(rec.fsrsPayload.difficulty).toBe(6.0);
  });
});

// ─── Test 9: Toggle OFF preserves existing dormant metadata ─────────────────

describe('Test 9: toggle OFF preserves existing dormant fsrsPayload and fsrsReviewLogs', () => {
  it('toggle OFF does not wipe existing dormant metadata from prior record', () => {
    defaultMocks({ toggleEnabled: false });
    const existingPayload = { state: 'Learning', difficulty: 6.5, stability: 3.0, retrievability: 0.88, reps: 2, phase: 'phase14j-dormant-readiness' };
    const existingLogs = [{ rating: 'Good', reviewedAt: '2026-05-10T00:00:00.000Z', state: 'Dormant', note: 'phase14j-inert-readiness-log' }];
    seedSchedule([makeScheduleRecord('item-9', {
      schedulerKind: 'fsrs-planned',
      schedulerVersion: 'phase14j-dormant-readiness',
      fsrsPayload: existingPayload,
      fsrsReviewLogs: existingLogs
    })]);
    const hr = makeHistoryRecord({ itemResults: [makeItemResult('item-9', 'correct')] });
    updateReviewScheduleFromHistoryRecord(hr);

    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-9');
    expect(rec).toBeDefined();
    // FSRS metadata preserved by getPreservedFsrsFields in normalizeScheduleRecord
    expect(rec.fsrsPayload).toEqual(existingPayload);
    expect(Array.isArray(rec.fsrsReviewLogs)).toBe(true);
    expect(rec.fsrsReviewLogs[0]).toEqual(existingLogs[0]);
  });
});

// ─── Test 10: No enrollment via import/boot/session-start ────────────────────

describe('Test 10: no import/boot/session-start enrollment in reviewScheduleStorage source', () => {
  it('source has no onMount/useEffect/app-boot FSRS enrollment markers', () => {
    const source = readProjectFile('src/state/reviewScheduleStorage.js');
    expect(source).not.toMatch(/onMount.*enroll/i);
    expect(source).not.toMatch(/useEffect.*enroll/i);
    expect(source).not.toMatch(/app.*boot.*enroll/i);
    expect(source).not.toMatch(/session.*start.*enroll/i);
    expect(source).not.toMatch(/boot.*fsrs.*enroll/i);
    // enrollment wiring is ONLY in updateReviewScheduleFromHistoryRecord
    expect(source).toContain('updateReviewScheduleFromHistoryRecord');
    expect(source).toContain('isFsrsNewCardEnrollmentEligible');
    expect(source).toContain('scheduleDormantFsrsReview');
  });
});

// ─── Test 11: No ts-fsrs.next() in storage or adapter ───────────────────────

describe('Test 11: no production ts-fsrs.next() in storage or adapter source', () => {
  it('reviewScheduleStorage.js has no .next() calls', () => {
    expect(readProjectFile('src/state/reviewScheduleStorage.js')).not.toMatch(/\.next\s*\(/);
  });

  it('reviewSchedulerAdapter.js has no .next() calls', () => {
    expect(readProjectFile('src/quiz/reviewSchedulerAdapter.js')).not.toMatch(/\.next\s*\(/);
  });
});

// ─── Test 12: StudyRoom/Dashboard unchanged, no FSRS rating UI ──────────────

describe('Test 12: StudyRoom and Dashboard unchanged — no FSRS production rating UI', () => {
  it('StudyRoom.jsx has no four-rating FSRS UI or dormant scheduler references', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).not.toMatch(/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/i);
    expect(source).not.toMatch(/FsrsTwoStepScaffold/);
    expect(source).not.toMatch(/scheduleDormantFsrsReview/);
    expect(source).not.toMatch(/isFsrsNewCardEnrollmentEligible/);
  });

  it('Dashboard.jsx has no four-rating FSRS UI', () => {
    const source = readProjectFile('src/routes/Dashboard.jsx');
    expect(source).not.toMatch(/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/i);
  });
});

// ─── Test 13: Phase 14J helpers still exported from adapter ─────────────────

describe('Test 13: Phase 14J helpers remain intact in adapter', () => {
  it('adapter exports isFsrsNewCardEnrollmentEligible and scheduleDormantFsrsReview', () => {
    const source = readProjectFile('src/quiz/reviewSchedulerAdapter.js');
    expect(source).toContain('export function isFsrsNewCardEnrollmentEligible');
    expect(source).toContain('export function scheduleDormantFsrsReview');
    expect(source).toContain('FSRS_DORMANT_SCHEDULER_VERSION');
    expect(source).toContain('context.enableFsrsTestRoute === true');
    expect(source).toContain('FSRS scheduling is not implemented in Phase 14A');
  });
});

// ─── Test 14: Round-trip preserves dormant FSRS fields ───────────────────────

describe('Test 14: read/write/read round-trip preserves dormant FSRS fields', () => {
  it('schedulerKind, schedulerVersion, fsrsPayload, fsrsReviewLogs survive normalization', () => {
    defaultMocks({ toggleEnabled: true, priorHistory: [] });
    const hr = makeHistoryRecord({ id: 'session-rt', itemResults: [makeItemResult('item-rt', 'correct')] });
    updateReviewScheduleFromHistoryRecord(hr);

    // First read after enrollment
    const { records: r1 } = readReviewSchedule();
    const rec1 = r1.find(r => r.itemId === 'item-rt');
    expect(rec1).toBeDefined();
    expect(rec1.schedulerKind).toBe('fsrs-planned');
    expect(rec1.schedulerVersion).toBe('phase14j-dormant-readiness');
    expect(rec1.fsrsPayload).toBeDefined();
    expect(Array.isArray(rec1.fsrsReviewLogs)).toBe(true);

    // Update again with toggle OFF — must preserve metadata
    defaultMocks({ toggleEnabled: false });
    const hr2 = makeHistoryRecord({ id: 'session-rt-2', itemResults: [makeItemResult('item-rt', 'correct')] });
    updateReviewScheduleFromHistoryRecord(hr2);

    // Second read — dormant metadata must survive
    const { records: r2 } = readReviewSchedule();
    const rec2 = r2.find(r => r.itemId === 'item-rt');
    expect(rec2).toBeDefined();
    expect(rec2.schedulerKind).toBe('fsrs-planned');
    expect(rec2.schedulerVersion).toBe('phase14j-dormant-readiness');
    expect(rec2.fsrsPayload).toEqual(rec1.fsrsPayload);
    expect(Array.isArray(rec2.fsrsReviewLogs)).toBe(true);
  });
});

// ─── Test 15: fsrsReviewLogs cap remains enforced ────────────────────────────

describe('Test 15: fsrsReviewLogs cap enforced at FSRS_REVIEW_LOG_CAP = 20', () => {
  it('when prior record has 21 logs, after SM-2 update logs are capped at 20', () => {
    expect(FSRS_REVIEW_LOG_CAP).toBe(20);

    const overflowLogs = Array.from({ length: 21 }, (_, i) => ({
      rating: 'Good',
      reviewedAt: `2026-04-${String(Math.min(i + 1, 28)).padStart(2, '0')}T00:00:00.000Z`,
      state: 'Dormant',
      note: 'phase14j-inert-readiness-log'
    }));
    seedSchedule([makeScheduleRecord('item-cap', {
      schedulerKind: 'fsrs-planned',
      schedulerVersion: 'phase14j-dormant-readiness',
      fsrsPayload: { state: 'New', difficulty: 5.0, stability: 1.0, retrievability: 1.0, reps: 0, phase: 'phase14j-dormant-readiness' },
      fsrsReviewLogs: overflowLogs
    })]);

    defaultMocks({ toggleEnabled: false });
    const hr = makeHistoryRecord({ id: 'session-cap', itemResults: [makeItemResult('item-cap', 'correct')] });
    updateReviewScheduleFromHistoryRecord(hr);

    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-cap');
    expect(rec).toBeDefined();
    // getPreservedFsrsFields slices to FSRS_REVIEW_LOG_CAP
    expect(rec.fsrsReviewLogs.length).toBe(FSRS_REVIEW_LOG_CAP);
  });
});
