import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FSRS_REVIEW_LOG_CAP,
  REVIEW_SCHEDULE_SCHEMA_VERSION,
  REVIEW_SCHEDULE_STORAGE_KEY,
  readReviewSchedule
} from '../../src/state/reviewScheduleStorage.js';
import {
  SCHEDULER_KIND_FSRS_PLANNED,
  scheduleReview
} from '../../src/quiz/reviewSchedulerAdapter.js';
import {
  V2_BACKUP_SCHEMA_VERSION,
  createV2BackupPayload,
  restoreV2BackupPayload,
  validateV2BackupPayload
} from '../../src/state/v2BackupRestore.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const NOW = '2026-05-12T00:00:00.000Z';

function makeLegacyRecord(overrides = {}) {
  return {
    itemId: 'legacy-1',
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

function makeFsrsRecord(overrides = {}) {
  return makeLegacyRecord({
    itemId: 'fsrs-preserved-1',
    schedulerKind: 'fsrs-v4-test',
    schedulerVersion: 'ts-fsrs-5.3.3-test',
    fsrsPayload: {
      due: '2026-05-14T00:00:00.000Z',
      stability: 2.3065,
      difficulty: 2.11810397,
      state: 'Learning',
      reps: 1
    },
    fsrsReviewLogs: [
      { rating: 'Good', reviewedAt: NOW, state: 'New' }
    ],
    ...overrides
  });
}

function makeEnvelope(records) {
  return {
    schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
    updatedAt: NOW,
    records
  };
}

function createMockStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  const calls = [];

  return {
    calls,
    get length() {
      return map.size;
    },
    getItem(key) {
      calls.push(['getItem', key]);
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      calls.push(['setItem', key, value]);
      map.set(key, String(value));
    },
    removeItem(key) {
      calls.push(['removeItem', key]);
      map.delete(key);
    },
    key(index) {
      return [...map.keys()][index] || null;
    },
    dump(key) {
      return map.get(key);
    }
  };
}

function withMockWindow(storage, run) {
  const previousWindow = globalThis.window;
  const previousCustomEvent = globalThis.CustomEvent;
  const listeners = [];

  Object.defineProperty(globalThis, 'CustomEvent', {
    configurable: true,
    value: class CustomEvent {
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
      }
    }
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: storage,
      dispatchEvent(event) {
        listeners.push(event);
        return true;
      },
      addEventListener() {},
      removeEventListener() {}
    }
  });

  try {
    return run({ listeners });
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
    if (previousCustomEvent === undefined) delete globalThis.CustomEvent;
    else Object.defineProperty(globalThis, 'CustomEvent', { configurable: true, value: previousCustomEvent });
  }
}

function readProjectFile(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

function loadValidLibraryData() {
  return JSON.parse(readProjectFile('tests/fixtures/valid-import.json'));
}

describe('Phase 14C FSRS persistence harness', () => {
  it('exports the review log cap as 20', () => {
    expect(FSRS_REVIEW_LOG_CAP).toBe(20);
  });

  it('keeps existing SM-2 records unchanged and does not add FSRS fields', () => {
    const record = makeLegacyRecord();
    const storage = createMockStorage({
      [REVIEW_SCHEDULE_STORAGE_KEY]: JSON.stringify(makeEnvelope([record]))
    });

    withMockWindow(storage, () => {
      expect(readReviewSchedule().records[0]).toEqual(record);
    });
  });

  it('does not preserve implied current schedulerKind aliases on SM-2 records', () => {
    const storage = createMockStorage({
      [REVIEW_SCHEDULE_STORAGE_KEY]: JSON.stringify(makeEnvelope([
        makeLegacyRecord({ itemId: 'current-1', schedulerKind: 'sm2-heuristic' }),
        makeLegacyRecord({ itemId: 'current-2', schedulerKind: 'current-heuristic' })
      ]))
    });

    withMockWindow(storage, () => {
      expect(readReviewSchedule().records).toEqual([
        makeLegacyRecord({ itemId: 'current-1' }),
        makeLegacyRecord({ itemId: 'current-2' })
      ]);
    });
  });

  it('preserves FSRS-shaped fields through storage read normalization', () => {
    const record = makeFsrsRecord();
    const storage = createMockStorage({
      [REVIEW_SCHEDULE_STORAGE_KEY]: JSON.stringify(makeEnvelope([record]))
    });

    withMockWindow(storage, () => {
      expect(readReviewSchedule().records[0]).toMatchObject({
        schedulerKind: 'fsrs-v4-test',
        schedulerVersion: 'ts-fsrs-5.3.3-test',
        fsrsPayload: record.fsrsPayload,
        fsrsReviewLogs: record.fsrsReviewLogs
      });
    });
  });

  it('caps FSRS review logs to the latest 20 entries and ignores invalid entries', () => {
    const logs = Array.from({ length: 25 }, (_, index) => ({
      rating: index % 2 === 0 ? 'Good' : 'Again',
      reviewedAt: `2026-05-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
      index
    }));
    const record = makeFsrsRecord({
      fsrsReviewLogs: [
        null,
        'bad-log',
        { validButOld: true, index: -1 },
        ...logs,
        42
      ]
    });
    const storage = createMockStorage({
      [REVIEW_SCHEDULE_STORAGE_KEY]: JSON.stringify(makeEnvelope([record]))
    });

    withMockWindow(storage, () => {
      const normalizedLogs = readReviewSchedule().records[0].fsrsReviewLogs;

      expect(normalizedLogs).toHaveLength(FSRS_REVIEW_LOG_CAP);
      expect(normalizedLogs[0].index).toBe(5);
      expect(normalizedLogs.at(-1).index).toBe(24);
      expect(normalizedLogs.every(log => log && typeof log === 'object' && !Array.isArray(log))).toBe(true);
    });
  });

  it('does not crash on unknown schedulerKind and preserves it without scheduling', () => {
    const record = makeFsrsRecord({ schedulerKind: 'future-experimental-kind' });
    const storage = createMockStorage({
      [REVIEW_SCHEDULE_STORAGE_KEY]: JSON.stringify(makeEnvelope([record]))
    });

    withMockWindow(storage, () => {
      expect(readReviewSchedule().records[0].schedulerKind).toBe('future-experimental-kind');
    });
  });

  it('plain storage read does not rewrite localStorage or run app-boot migration', () => {
    const storage = createMockStorage({
      [REVIEW_SCHEDULE_STORAGE_KEY]: JSON.stringify(makeEnvelope([makeFsrsRecord()]))
    });

    withMockWindow(storage, () => {
      readReviewSchedule();
    });

    expect(storage.calls.map(call => call[0])).toEqual(['getItem']);
  });

  it('preserves FSRS-shaped review schedule data through v2 backup validation and restore', () => {
    const fsrsRecord = makeFsrsRecord({
      fsrsReviewLogs: Array.from({ length: FSRS_REVIEW_LOG_CAP }, (_, index) => ({
        rating: 'Good',
        reviewedAt: `2026-05-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
        index
      }))
    });
    const storage = createMockStorage({
      [REVIEW_SCHEDULE_STORAGE_KEY]: JSON.stringify(makeEnvelope([fsrsRecord]))
    });

    withMockWindow(storage, () => {
      const backup = createV2BackupPayload({ libraryData: loadValidLibraryData() });

      expect(backup.ok).toBe(true);
      expect(backup.payload.schemaVersion).toBe(V2_BACKUP_SCHEMA_VERSION);
      expect(backup.payload.data.reviewSchedule.records[0]).toMatchObject({
        schedulerKind: 'fsrs-v4-test',
        schedulerVersion: 'ts-fsrs-5.3.3-test',
        fsrsPayload: fsrsRecord.fsrsPayload,
        fsrsReviewLogs: fsrsRecord.fsrsReviewLogs
      });

      const validation = validateV2BackupPayload(backup.payload);
      expect(validation.ok).toBe(true);
      expect(validation.sections.reviewSchedule.records[0].fsrsPayload).toEqual(fsrsRecord.fsrsPayload);

      const restore = restoreV2BackupPayload(backup.payload);
      expect(restore.ok).toBe(true);
      const restored = JSON.parse(storage.dump(REVIEW_SCHEDULE_STORAGE_KEY));
      expect(restored.records[0].fsrsPayload).toEqual(fsrsRecord.fsrsPayload);
      expect(restored.records[0].fsrsReviewLogs).toHaveLength(FSRS_REVIEW_LOG_CAP);
    });
  });

  it('keeps Study Room and Dashboard disconnected from FSRS wrapper and four-rating UI', () => {
    const studyRoom = readProjectFile('src/routes/StudyRoom.jsx');
    const dashboard = readProjectFile('src/routes/Dashboard.jsx');
    const combined = `${studyRoom}\n${dashboard}`;

    expect(combined).not.toMatch(/fsrsWrapper|fsrsPersistenceHarness|FSRS_TEST_SCHEDULER_KIND/);
    expect(combined).not.toMatch(/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/);
  });

  it('keeps production adapter FSRS scheduling rejected', () => {
    expect(() => {
      scheduleReview(makeLegacyRecord({ schedulerKind: SCHEDULER_KIND_FSRS_PLANNED }), 'correct', {
        now: new Date(NOW)
      });
    }).toThrow(/FSRS scheduling is not implemented in Phase 14A/);
  });

  it('does not add production localStorage migration helpers or flags', () => {
    const storageSource = readProjectFile('src/state/reviewScheduleStorage.js');
    const adapterSource = readProjectFile('src/quiz/reviewSchedulerAdapter.js');

    expect(storageSource).not.toMatch(/SHIME_DEV_FSRS_ENABLED|migrate.*fsrs|fsrs.*migration/i);
    expect(adapterSource).not.toMatch(/SHIME_DEV_FSRS_ENABLED|scheduleFsrsReviewForTest|fsrsWrapper/);
  });
});
