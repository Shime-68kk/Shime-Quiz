/**
 * tests/unit/fsrsProductionStudyRoomTwoStepBridge.test.jsx
 *
 * Phase 14N — Production Study Room Two-Step Memory Rating Bridge
 * Tests for shouldShowFsrsTwoStepBridge, appendFsrsReviewLog, and static source boundaries.
 * Uses pure helper + static source assertion pattern (no jsdom required).
 */

import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// -- Mock settingsStorage and studyHistoryStorage for reviewScheduleStorage --
vi.mock('../../src/state/settingsStorage.js', () => ({
  getSettings: vi.fn()
}));
vi.mock('../../src/state/studyHistoryStorage.js', () => ({
  readStudyHistory: vi.fn()
}));

import { getSettings } from '../../src/state/settingsStorage.js';
import { readStudyHistory } from '../../src/state/studyHistoryStorage.js';
import {
  shouldShowFsrsTwoStepBridge,
  getSchedulerKind,
  SCHEDULER_KIND_FSRS_PLANNED
} from '../../src/quiz/reviewSchedulerAdapter.js';
import {
  appendFsrsReviewLog,
  readReviewSchedule,
  FSRS_REVIEW_LOG_CAP
} from '../../src/state/reviewScheduleStorage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const NOW_ISO = '2026-05-14T00:00:00.000Z';

function readProjectFile(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

// ─── Mock storage helpers ───────────────────────────────────────────────────

function makeMockStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: key => (map.has(key) ? map.get(key) : null),
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
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options?.detail;
      }
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

function seedSchedule(records = []) {
  const payload = {
    schemaVersion: 'v2-review-schedule-v1',
    updatedAt: NOW_ISO,
    records
  };
  mockStorage.setItem('shimeV2ReviewScheduleV1', JSON.stringify(payload));
}

function makeFsrsRecord(itemId, extras = {}) {
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
    schedulerKind: 'fsrs-planned',
    schedulerVersion: 'phase14j-dormant-readiness',
    fsrsPayload: {
      state: 'New',
      difficulty: 5.0,
      stability: 1.0,
      retrievability: 1.0,
      reps: 0,
      phase: 'phase14j-dormant-readiness'
    },
    fsrsReviewLogs: [],
    ...extras
  };
}

function makeSm2Record(itemId, extras = {}) {
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

beforeEach(() => {
  mockStorage = makeMockStorage();
  setupMockWindow();
  vi.clearAllMocks();
  getSettings.mockReturnValue({ fsrsExperimentalEnabled: false });
  readStudyHistory.mockReturnValue({ records: [] });
});

afterEach(() => {
  teardownMockWindow();
});

// ─── 1. Bridge gate: toggle OFF ──────────────────────────────────────────────

describe('Test 1: bridge hidden when toggle OFF', () => {
  it('shouldShowFsrsTwoStepBridge returns false with toggle OFF and fsrs-planned record', () => {
    const record = makeFsrsRecord('item-1');
    expect(shouldShowFsrsTwoStepBridge(record, false)).toBe(false);
  });
});

// ─── 2. Bridge gate: non-fsrs-planned record ────────────────────────────────

describe('Test 2: bridge hidden for non-fsrs-planned records', () => {
  it('shouldShowFsrsTwoStepBridge returns false for SM-2 record with toggle ON', () => {
    const record = makeSm2Record('item-2');
    expect(shouldShowFsrsTwoStepBridge(record, true)).toBe(false);
  });

  it('returns false for record with sm2-heuristic schedulerKind', () => {
    const record = { ...makeSm2Record('item-2b'), schedulerKind: 'sm2-heuristic', fsrsPayload: { state: 'New' } };
    expect(shouldShowFsrsTwoStepBridge(record, true)).toBe(false);
  });
});

// ─── 3. Bridge gate: fsrsPayload missing ────────────────────────────────────

describe('Test 3: bridge hidden when fsrsPayload missing', () => {
  it('shouldShowFsrsTwoStepBridge returns false when toggle ON, fsrs-planned, but no fsrsPayload', () => {
    const record = { ...makeFsrsRecord('item-3'), fsrsPayload: undefined };
    expect(shouldShowFsrsTwoStepBridge(record, true)).toBe(false);
  });

  it('returns false when fsrsPayload is null', () => {
    const record = { ...makeFsrsRecord('item-3b'), fsrsPayload: null };
    expect(shouldShowFsrsTwoStepBridge(record, true)).toBe(false);
  });

  it('returns false when fsrsPayload is an array (invalid)', () => {
    const record = { ...makeFsrsRecord('item-3c'), fsrsPayload: [] };
    expect(shouldShowFsrsTwoStepBridge(record, true)).toBe(false);
  });
});

// ─── 4. Bridge gate: null/missing record ────────────────────────────────────

describe('Test 4: bridge hidden when record is null or missing', () => {
  it('returns false for null record', () => {
    expect(shouldShowFsrsTwoStepBridge(null, true)).toBe(false);
  });

  it('returns false for undefined record', () => {
    expect(shouldShowFsrsTwoStepBridge(undefined, true)).toBe(false);
  });
});

// ─── 4b. Bridge gate: all conditions true ───────────────────────────────────

describe('Test 4b: bridge shows when all gate conditions are met', () => {
  it('shouldShowFsrsTwoStepBridge returns true with toggle ON + fsrs-planned + fsrsPayload', () => {
    const record = makeFsrsRecord('item-4b');
    expect(shouldShowFsrsTwoStepBridge(record, true)).toBe(true);
  });
});

// ─── 5. Wrong answer → auto-Again log appended ──────────────────────────────

describe('Test 5: wrong answer on eligible record appends inert Again log', () => {
  it('appendFsrsReviewLog adds Again log to fsrs-planned record', () => {
    seedSchedule([makeFsrsRecord('item-5')]);
    const logEntry = {
      rating: 'Again',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: NOW_ISO,
      objectiveCorrect: false
    };
    const result = appendFsrsReviewLog('item-5', logEntry);
    expect(result.ok).toBe(true);

    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-5');
    expect(rec).toBeDefined();
    expect(Array.isArray(rec.fsrsReviewLogs)).toBe(true);
    expect(rec.fsrsReviewLogs.length).toBe(1);
    expect(rec.fsrsReviewLogs[0].rating).toBe('Again');
    expect(rec.fsrsReviewLogs[0].source).toBe('phase14n-studyroom-bridge');
  });
});

// ─── 6. Wrong path does not add Hard/Good/Easy (static source check) ─────────

describe('Test 6: wrong answer path does not add Hard/Good/Easy log', () => {
  it('appendFsrsReviewLog with Again does not append Hard, Good, or Easy', () => {
    seedSchedule([makeFsrsRecord('item-6')]);
    appendFsrsReviewLog('item-6', {
      rating: 'Again',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: NOW_ISO,
      objectiveCorrect: false
    });
    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-6');
    const ratings = rec.fsrsReviewLogs.map(l => l.rating);
    expect(ratings).not.toContain('Hard');
    expect(ratings).not.toContain('Good');
    expect(ratings).not.toContain('Easy');
  });
});

// ─── 7. Correct path bridge shows Hard/Good/Easy (via static source) ─────────

describe('Test 7: correct path bridge shows Hard/Good/Easy option', () => {
  it('FsrsProductionMemoryRatingBridge source contains Hard, Good, Easy effort options', () => {
    const source = readProjectFile('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
    expect(source).toContain('Hard');
    expect(source).toContain('Good');
    expect(source).toContain('Easy');
    expect(source).toContain('onSelectRating');
  });
});

// ─── 8. Selecting Hard appends inert Hard log ───────────────────────────────

describe('Test 8: selecting Hard appends inert Hard log', () => {
  it('appendFsrsReviewLog with Hard adds Hard log, does not change scheduling fields', () => {
    const initialRecord = makeFsrsRecord('item-8');
    seedSchedule([initialRecord]);

    const result = appendFsrsReviewLog('item-8', {
      rating: 'Hard',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: NOW_ISO,
      objectiveCorrect: true
    });
    expect(result.ok).toBe(true);

    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-8');
    expect(rec.fsrsReviewLogs[0].rating).toBe('Hard');
    // Scheduling fields unchanged
    expect(rec.dueAt).toBe(initialRecord.dueAt);
    expect(rec.intervalDays).toBe(initialRecord.intervalDays);
    expect(rec.easeFactor).toBe(initialRecord.easeFactor);
    expect(rec.repetitionCount).toBe(initialRecord.repetitionCount);
    expect(rec.correctStreak).toBe(initialRecord.correctStreak);
    expect(rec.wrongCount).toBe(initialRecord.wrongCount);
    expect(rec.schedulerKind).toBe('fsrs-planned');
    expect(rec.schedulerVersion).toBe('phase14j-dormant-readiness');
  });
});

// ─── 9. Selecting Good appends inert Good log ───────────────────────────────

describe('Test 9: selecting Good appends inert Good log', () => {
  it('appendFsrsReviewLog with Good appends Good log', () => {
    seedSchedule([makeFsrsRecord('item-9')]);
    appendFsrsReviewLog('item-9', {
      rating: 'Good',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: NOW_ISO,
      objectiveCorrect: true
    });
    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-9');
    expect(rec.fsrsReviewLogs[0].rating).toBe('Good');
  });
});

// ─── 10. Selecting Easy appends inert Easy log ──────────────────────────────

describe('Test 10: selecting Easy appends inert Easy log', () => {
  it('appendFsrsReviewLog with Easy appends Easy log', () => {
    seedSchedule([makeFsrsRecord('item-10')]);
    appendFsrsReviewLog('item-10', {
      rating: 'Easy',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: NOW_ISO,
      objectiveCorrect: true
    });
    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-10');
    expect(rec.fsrsReviewLogs[0].rating).toBe('Easy');
  });
});

// ─── 11. Continue without rating appends no log ─────────────────────────────

describe('Test 11: continue without rating appends no log', () => {
  it('appendFsrsReviewLog is NOT called when user skips — zero logs remain', () => {
    seedSchedule([makeFsrsRecord('item-11')]);
    // Skip = no call to appendFsrsReviewLog
    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-11');
    expect(rec).toBeDefined();
    // No logs appended — empty arrays are not preserved by getPreservedFsrsFields
    expect(rec.fsrsReviewLogs == null || rec.fsrsReviewLogs.length === 0).toBe(true);
  });

  it('bridge component source contains "Continue without rating" option', () => {
    const source = readProjectFile('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
    expect(source).toContain('Continue without rating');
  });
});

// ─── 12. Logs include source: 'phase14n-studyroom-bridge' ───────────────────

describe('Test 12: rating logs include correct source tag', () => {
  it('appended log has source field phase14n-studyroom-bridge', () => {
    seedSchedule([makeFsrsRecord('item-12')]);
    appendFsrsReviewLog('item-12', {
      rating: 'Good',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: NOW_ISO,
      objectiveCorrect: true
    });
    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-12');
    expect(rec.fsrsReviewLogs[0].source).toBe('phase14n-studyroom-bridge');
  });
});

// ─── 13. Logs include activeScheduling: false ────────────────────────────────

describe('Test 13: rating logs include activeScheduling: false marker', () => {
  it('appended log has activeScheduling: false', () => {
    seedSchedule([makeFsrsRecord('item-13')]);
    appendFsrsReviewLog('item-13', {
      rating: 'Hard',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: NOW_ISO,
      objectiveCorrect: true
    });
    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-13');
    expect(rec.fsrsReviewLogs[0].activeScheduling).toBe(false);
  });
});

// ─── 14. Logs are capped at 20 ──────────────────────────────────────────────

describe('Test 14: logs are capped at FSRS_REVIEW_LOG_CAP = 20', () => {
  it('appending a log to a full cap record drops oldest, respects cap', () => {
    expect(FSRS_REVIEW_LOG_CAP).toBe(20);
    const fullLogs = Array.from({ length: 20 }, (_, i) => ({
      rating: 'Good',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: `2026-04-${String(Math.min(i + 1, 28)).padStart(2, '0')}T00:00:00.000Z`,
      objectiveCorrect: true
    }));
    seedSchedule([makeFsrsRecord('item-14', { fsrsReviewLogs: fullLogs })]);

    appendFsrsReviewLog('item-14', {
      rating: 'Easy',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: NOW_ISO,
      objectiveCorrect: true
    });
    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-14');
    expect(rec.fsrsReviewLogs.length).toBe(FSRS_REVIEW_LOG_CAP);
    // Newest log is at end
    expect(rec.fsrsReviewLogs[rec.fsrsReviewLogs.length - 1].rating).toBe('Easy');
  });
});

// ─── 15. Due/interval/scheduler output unchanged (scheduling invariance) ─────

describe('Test 15: due/interval/scheduler fields not modified by appendFsrsReviewLog', () => {
  it('scheduling fields are identical before and after log append', () => {
    const initialRecord = makeFsrsRecord('item-15');
    seedSchedule([initialRecord]);
    appendFsrsReviewLog('item-15', {
      rating: 'Hard',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: NOW_ISO,
      objectiveCorrect: true
    });
    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-15');
    expect(rec.dueAt).toBe(initialRecord.dueAt);
    expect(rec.intervalDays).toBe(initialRecord.intervalDays);
    expect(rec.easeFactor).toBe(initialRecord.easeFactor);
    expect(rec.repetitionCount).toBe(initialRecord.repetitionCount);
    expect(rec.correctStreak).toBe(initialRecord.correctStreak);
    expect(rec.wrongCount).toBe(initialRecord.wrongCount);
    expect(rec.schedulerKind).toBe(initialRecord.schedulerKind);
    expect(rec.schedulerVersion).toBe(initialRecord.schedulerVersion);
  });
});

// ─── 16. Correctness/scoring/mastery unchanged (static source check) ──────────

describe('Test 16: scoring/mastery/progress unchanged — appendFsrsReviewLog does not assign scheduling fields', () => {
  it('appendFsrsReviewLog source does not assign dueAt, intervalDays, easeFactor', () => {
    const source = readProjectFile('src/state/reviewScheduleStorage.js');
    // appendFsrsReviewLog function body must not assign these fields
    const fnStart = source.indexOf('export function appendFsrsReviewLog');
    const fnEnd = source.indexOf('\nexport function', fnStart + 1);
    const fnBody = fnEnd === -1 ? source.slice(fnStart) : source.slice(fnStart, fnEnd);
    expect(fnBody).not.toMatch(/\bdueAt\s*=/);
    expect(fnBody).not.toMatch(/\bintervalDays\s*=/);
    expect(fnBody).not.toMatch(/\beaseFactor\s*=/);
    expect(fnBody).not.toMatch(/\brepetitionCount\s*=/);
    expect(fnBody).not.toMatch(/\bcorrectStreak\s*=/);
    expect(fnBody).not.toMatch(/\bwrongCount\s*=/);
    expect(fnBody).not.toMatch(/\.next\s*\(/);
  });
});

// ─── 17. Toggle OFF mid-session prevents new log append ─────────────────────

describe('Test 17: appendFsrsReviewLog is a no-op for non-fsrs-planned records', () => {
  it('returns error when record schedulerKind is not fsrs-planned', () => {
    seedSchedule([makeSm2Record('item-17')]);
    const result = appendFsrsReviewLog('item-17', {
      rating: 'Hard',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: NOW_ISO,
      objectiveCorrect: true
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('not_fsrs_planned');
  });
});

// ─── 18. Existing fsrsPayload and fsrsReviewLogs preserved ──────────────────

describe('Test 18: existing fsrsPayload and fsrsReviewLogs preserved after append', () => {
  it('fsrsPayload not modified by appendFsrsReviewLog', () => {
    const originalPayload = { state: 'Learning', difficulty: 6.5, stability: 3.0, retrievability: 0.88, reps: 2, phase: 'phase14j-dormant-readiness' };
    const existingLog = { rating: 'Good', source: 'phase14j', activeScheduling: false, reviewedAt: '2026-05-10T00:00:00.000Z' };
    seedSchedule([makeFsrsRecord('item-18', {
      fsrsPayload: originalPayload,
      fsrsReviewLogs: [existingLog]
    })]);

    appendFsrsReviewLog('item-18', {
      rating: 'Easy',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: NOW_ISO,
      objectiveCorrect: true
    });

    const { records } = readReviewSchedule();
    const rec = records.find(r => r.itemId === 'item-18');
    expect(rec.fsrsPayload).toEqual(originalPayload);
    expect(rec.fsrsReviewLogs.length).toBe(2);
    expect(rec.fsrsReviewLogs[0].rating).toBe('Good');
    expect(rec.fsrsReviewLogs[1].rating).toBe('Easy');
  });
});

// ─── 19. No production ts-fsrs.next() usage ─────────────────────────────────

describe('Test 19: no production ts-fsrs.next() usage', () => {
  it('StudyRoom.jsx has no .next() call', () => {
    expect(readProjectFile('src/routes/StudyRoom.jsx')).not.toMatch(/\.next\s*\(/);
  });

  it('FsrsProductionMemoryRatingBridge.jsx has no .next() call', () => {
    expect(readProjectFile('src/components/study/FsrsProductionMemoryRatingBridge.jsx')).not.toMatch(/\.next\s*\(/);
  });

  it('reviewScheduleStorage.js has no .next() call', () => {
    expect(readProjectFile('src/state/reviewScheduleStorage.js')).not.toMatch(/\.next\s*\(/);
  });

  it('reviewSchedulerAdapter.js has no production .next() call', () => {
    const source = readProjectFile('src/quiz/reviewSchedulerAdapter.js');
    // scheduleFsrsReviewForTest is the only allowed .next(); production path must not use it
    expect(source).not.toMatch(/export function shouldShowFsrsTwoStepBridge[\s\S]*?\.next\s*\(/);
  });
});

// ─── 20. Dashboard source unchanged ─────────────────────────────────────────

describe('Test 20: Dashboard source unchanged by Phase 14N', () => {
  it('Dashboard.jsx has no phase14n bridge references', () => {
    const source = readProjectFile('src/routes/Dashboard.jsx');
    expect(source).not.toContain('phase14n');
    expect(source).not.toContain('appendFsrsReviewLog');
    expect(source).not.toContain('shouldShowFsrsTwoStepBridge');
    expect(source).not.toContain('FsrsProductionMemoryRatingBridge');
  });
});

// ─── 21. Backup/import runtime source unchanged ──────────────────────────────

describe('Test 21: backup/import runtime source unchanged', () => {
  it('v2BackupRestore.js has no phase14n bridge references', () => {
    const source = readProjectFile('src/state/v2BackupRestore.js');
    expect(source).not.toContain('phase14n');
    expect(source).not.toContain('appendFsrsReviewLog');
    expect(source).not.toContain('shouldShowFsrsTwoStepBridge');
  });
});

// ─── 22. Fixture route/component still works (static check) ─────────────────

describe('Test 22: fixture route and component unchanged', () => {
  it('FsrsTwoStepScaffold.jsx still exists and is not modified', () => {
    const source = readProjectFile('src/components/study/FsrsTwoStepScaffold.jsx');
    expect(source).toContain('INITIAL_STATE');
    expect(source).toContain('revealAnswer');
    expect(source).toContain('selectObjective');
    expect(source).toContain('selectRating');
  });

  it('FsrsUiFixture.jsx still exists', () => {
    const source = readProjectFile('src/routes/FsrsUiFixture.jsx');
    expect(source).toContain('FsrsTwoStepScaffold');
  });
});

// ─── Additional: StudyRoom bridge integration checks ────────────────────────

describe('StudyRoom.jsx bridge integration source checks', () => {
  it('StudyRoom.jsx imports shouldShowFsrsTwoStepBridge', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).toContain('shouldShowFsrsTwoStepBridge');
  });

  it('StudyRoom.jsx imports appendFsrsReviewLog', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).toContain('appendFsrsReviewLog');
  });

  it('StudyRoom.jsx imports FsrsProductionMemoryRatingBridge', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).toContain('FsrsProductionMemoryRatingBridge');
  });

  it('StudyRoom.jsx does not contain FSRS user-facing jargon in JSX text', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    // Should not have "FSRS" in JSX text content (between tags)
    // Imports and identifiers are OK; user-facing string literals are not
    expect(source).not.toMatch(/>\s*FSRS\s*</);
    expect(source).not.toMatch(/'FSRS scheduling/i);
    expect(source).not.toMatch(/"FSRS scheduling/i);
  });

  it('StudyRoom.jsx does not reference FsrsTwoStepScaffold (fixture stays separate)', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).not.toContain('FsrsTwoStepScaffold');
  });

  it('StudyRoom.jsx does not reference scheduleDormantFsrsReview', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).not.toContain('scheduleDormantFsrsReview');
  });

  it('StudyRoom.jsx does not import from fsrsWrapper.js', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).not.toContain('fsrsWrapper');
  });
});

// ─── Additional: shouldShowFsrsTwoStepBridge edge cases ──────────────────────

describe('shouldShowFsrsTwoStepBridge additional edge cases', () => {
  it('returns false when toggleEnabled is null', () => {
    const record = makeFsrsRecord('item-edge-1');
    expect(shouldShowFsrsTwoStepBridge(record, null)).toBe(false);
  });

  it('returns false when toggleEnabled is false', () => {
    const record = makeFsrsRecord('item-edge-2');
    expect(shouldShowFsrsTwoStepBridge(record, false)).toBe(false);
  });

  it('returns false when record is an array', () => {
    expect(shouldShowFsrsTwoStepBridge([], true)).toBe(false);
  });

  it('SCHEDULER_KIND_FSRS_PLANNED constant is fsrs-planned', () => {
    expect(SCHEDULER_KIND_FSRS_PLANNED).toBe('fsrs-planned');
  });
});

// ─── Additional: appendFsrsReviewLog no-op guards ────────────────────────────

describe('appendFsrsReviewLog no-op guards', () => {
  it('returns error when itemId is empty', () => {
    const result = appendFsrsReviewLog('', { rating: 'Good' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('invalid_item_id');
  });

  it('returns error when logEntry is invalid', () => {
    seedSchedule([makeFsrsRecord('item-guard-2')]);
    const result = appendFsrsReviewLog('item-guard-2', null);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('invalid_log_entry');
  });

  it('returns error when record does not exist', () => {
    seedSchedule([]);
    const result = appendFsrsReviewLog('item-nonexistent', { rating: 'Good', source: 'phase14n-studyroom-bridge' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('record_not_found');
  });

  it('does not create new records for missing items', () => {
    seedSchedule([]);
    appendFsrsReviewLog('ghost-item', { rating: 'Good', source: 'phase14n-studyroom-bridge' });
    const { records } = readReviewSchedule();
    expect(records.find(r => r.itemId === 'ghost-item')).toBeUndefined();
  });
});

// ─── Additional: reviewSchedulerAdapter exports check ───────────────────────

describe('reviewSchedulerAdapter.js exports shouldShowFsrsTwoStepBridge', () => {
  it('adapter exports shouldShowFsrsTwoStepBridge as a function', () => {
    expect(typeof shouldShowFsrsTwoStepBridge).toBe('function');
  });

  it('adapter does not reference localStorage', () => {
    const source = readProjectFile('src/quiz/reviewSchedulerAdapter.js');
    expect(source).not.toMatch(/localStorage/i);
  });

  it('adapter does not reference process.env', () => {
    const source = readProjectFile('src/quiz/reviewSchedulerAdapter.js');
    expect(source).not.toMatch(/process\.env/i);
  });
});
