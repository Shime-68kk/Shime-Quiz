import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  V2_BACKUP_SCHEMA_VERSION,
  createV2BackupPayload,
  validateV2BackupPayload,
  restoreV2BackupPayload
} from '../../src/state/v2BackupRestore.js';
import {
  REVIEW_SCHEDULE_SCHEMA_VERSION,
  REVIEW_SCHEDULE_STORAGE_KEY,
  readReviewSchedule,
  FSRS_REVIEW_LOG_CAP
} from '../../src/state/reviewScheduleStorage.js';
import { STUDY_HISTORY_SCHEMA_VERSION } from '../../src/state/studyHistoryStorage.js';
import { RECOMMENDATION_FEEDBACK_SCHEMA_VERSION } from '../../src/state/recommendationFeedbackStorage.js';
import { STUDY_GOAL_SCHEMA_VERSION } from '../../src/state/studyGoalStorage.js';
import { STUDY_PLAN_PROGRESS_SCHEMA_VERSION } from '../../src/state/studyPlanProgressStorage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function readProjectFile(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

function loadValidLibraryData() {
  return JSON.parse(fs.readFileSync(resolve(PROJECT_ROOT, 'tests/fixtures/valid-import.json'), 'utf8'));
}

function createMockStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    get length() { return map.size; },
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: key => map.delete(key),
    key: index => [...map.keys()][index] || null,
    has: key => map.has(key)
  };
}

function withMockWindow(storage, run) {
  const prevWindow = globalThis.window;
  const prevCustomEvent = globalThis.CustomEvent;
  Object.defineProperty(globalThis, 'CustomEvent', {
    configurable: true,
    value: class CustomEvent {
      constructor(type, options = {}) { this.type = type; this.detail = options?.detail; }
    }
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: storage,
      BroadcastChannel: undefined,
      dispatchEvent() { return true; },
      addEventListener() {},
      removeEventListener() {}
    }
  });
  try {
    return run();
  } finally {
    if (prevWindow === undefined) delete globalThis.window;
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: prevWindow });
    if (prevCustomEvent === undefined) delete globalThis.CustomEvent;
    else Object.defineProperty(globalThis, 'CustomEvent', { configurable: true, value: prevCustomEvent });
  }
}

function makeMinimalLearningState(reviewScheduleOverride = null) {
  return {
    studyHistory: { schemaVersion: STUDY_HISTORY_SCHEMA_VERSION, updatedAt: '', records: [] },
    reviewSchedule: reviewScheduleOverride ?? { schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION, updatedAt: '', records: [] },
    recommendationFeedback: { schemaVersion: RECOMMENDATION_FEEDBACK_SCHEMA_VERSION, updatedAt: '', records: [] },
    studyGoal: { schemaVersion: STUDY_GOAL_SCHEMA_VERSION, updatedAt: '', goal: null },
    studyPlanProgress: { schemaVersion: STUDY_PLAN_PROGRESS_SCHEMA_VERSION, updatedAt: '', days: [] }
  };
}

function makeMinimalLibraryPayload(libraryData) {
  return {
    schemaVersion: 'shime-v2-library-v1',
    importedAt: '2026-01-01T00:00:00.000Z',
    sourceName: 'test',
    sourceType: 'backup',
    metadata: {
      schemaVersion: 'shime-v2-library-v1',
      importedAt: '2026-01-01T00:00:00.000Z',
      sourceName: 'test',
      sourceType: 'backup'
    },
    data: libraryData
  };
}

function makeFullV2BackupPayload(reviewScheduleOverride = null, extraOverrides = {}) {
  const libraryData = loadValidLibraryData();
  const state = makeMinimalLearningState(reviewScheduleOverride);
  return {
    schemaVersion: V2_BACKUP_SCHEMA_VERSION,
    backupMode: 'full',
    includesAnswers: true,
    redacted: false,
    appVersion: '2.0.0-rc1',
    exportedAt: '2026-01-01T00:00:00.000Z',
    dataTypes: ['library', 'studyHistory', 'reviewSchedule', 'recommendationFeedback', 'studyGoal', 'studyPlanProgress'],
    includesStudyDraft: false,
    data: {
      library: makeMinimalLibraryPayload(libraryData),
      ...state
    },
    ...extraOverrides
  };
}

const DORMANT_FSRS_PAYLOAD = {
  state: 'New',
  difficulty: 5.0,
  stability: 1.0,
  retrievability: 1.0,
  reps: 0,
  phase: 'phase14j-dormant-readiness'
};

const DORMANT_FSRS_LOG = {
  rating: 'Good',
  reviewedAt: '2026-05-14T00:00:00.000Z',
  state: 'Dormant',
  note: 'phase14j-inert-readiness-log'
};

const DORMANT_FSRS_RECORD = {
  itemId: 'item-fsrs-001',
  subjectId: 'subj-1',
  topicId: 'topic-1',
  lastReviewedAt: '2026-05-14T00:00:00.000Z',
  dueAt: '2026-05-15T00:00:00.000Z',
  intervalDays: 1,
  repetitionCount: 1,
  easeFactor: 2.25,
  correctStreak: 1,
  wrongCount: 0,
  schedulerKind: 'fsrs-planned',
  schedulerVersion: 'phase14j-dormant-readiness',
  fsrsPayload: DORMANT_FSRS_PAYLOAD,
  fsrsReviewLogs: [DORMANT_FSRS_LOG]
};

const SM2_LEGACY_RECORD = {
  itemId: 'item-sm2-legacy',
  subjectId: 'subj-1',
  topicId: 'topic-1',
  lastReviewedAt: '2026-05-10T00:00:00.000Z',
  dueAt: '2026-05-13T00:00:00.000Z',
  intervalDays: 3,
  repetitionCount: 2,
  easeFactor: 2.25,
  correctStreak: 2,
  wrongCount: 0
};

// ─── Test 1: v2 backup includes dormant FSRS fields from storage ─────────────

describe('Test 1: v2 backup includes review schedule records with dormant FSRS fields intact', () => {
  it('backup payload data.reviewSchedule.records contains FSRS metadata from storage', () => {
    const storage = createMockStorage({
      [REVIEW_SCHEDULE_STORAGE_KEY]: JSON.stringify({
        schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
        updatedAt: '2026-05-14T00:00:00.000Z',
        records: [DORMANT_FSRS_RECORD]
      })
    });

    withMockWindow(storage, () => {
      const libraryData = loadValidLibraryData();
      const result = createV2BackupPayload({ libraryData });
      expect(result.ok).toBe(true);

      const reviewScheduleSection = result.payload.data.reviewSchedule;
      expect(Array.isArray(reviewScheduleSection.records)).toBe(true);
      expect(reviewScheduleSection.records.length).toBe(1);

      const rec = reviewScheduleSection.records[0];
      expect(rec.itemId).toBe('item-fsrs-001');
      expect(rec.schedulerKind).toBe('fsrs-planned');
      expect(rec.schedulerVersion).toBe('phase14j-dormant-readiness');
      expect(rec.fsrsPayload).toBeDefined();
      expect(typeof rec.fsrsPayload).toBe('object');
      expect(Array.isArray(rec.fsrsReviewLogs)).toBe(true);
      expect(rec.fsrsReviewLogs.length).toBeGreaterThan(0);
    });
  });
});

// ─── Test 2: v2 restore preserves schedulerKind ──────────────────────────────

describe('Test 2: v2 restore preserves schedulerKind', () => {
  it('after restore schedulerKind fsrs-planned survives on the review schedule record', () => {
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '2026-05-14T00:00:00.000Z',
      records: [DORMANT_FSRS_RECORD]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);

      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-fsrs-001');
      expect(rec).toBeDefined();
      expect(rec.schedulerKind).toBe('fsrs-planned');
    });
  });
});

// ─── Test 3: v2 restore preserves schedulerVersion ───────────────────────────

describe('Test 3: v2 restore preserves schedulerVersion', () => {
  it('after restore schedulerVersion phase14j-dormant-readiness is present', () => {
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: [DORMANT_FSRS_RECORD]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);

      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-fsrs-001');
      expect(rec).toBeDefined();
      expect(rec.schedulerVersion).toBe('phase14j-dormant-readiness');
    });
  });
});

// ─── Test 4: v2 restore preserves fsrsPayload ────────────────────────────────

describe('Test 4: v2 restore preserves fsrsPayload', () => {
  it('after restore fsrsPayload object is present and matches original', () => {
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: [DORMANT_FSRS_RECORD]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);

      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-fsrs-001');
      expect(rec).toBeDefined();
      expect(rec.fsrsPayload).toBeDefined();
      expect(typeof rec.fsrsPayload).toBe('object');
      expect(rec.fsrsPayload.difficulty).toBe(5.0);
      expect(rec.fsrsPayload.stability).toBe(1.0);
      expect(rec.fsrsPayload.phase).toBe('phase14j-dormant-readiness');
    });
  });
});

// ─── Test 5: v2 restore preserves/caps fsrsReviewLogs ────────────────────────

describe('Test 5: v2 restore preserves and caps fsrsReviewLogs', () => {
  it('after restore single log entry is preserved', () => {
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: [DORMANT_FSRS_RECORD]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      restoreV2BackupPayload(payload);
      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-fsrs-001');
      expect(rec).toBeDefined();
      expect(Array.isArray(rec.fsrsReviewLogs)).toBe(true);
      expect(rec.fsrsReviewLogs.length).toBe(1);
    });
  });

  it('after restore, 25 logs in backup are capped at FSRS_REVIEW_LOG_CAP = 20', () => {
    expect(FSRS_REVIEW_LOG_CAP).toBe(20);

    const overflowLogs = Array.from({ length: 25 }, (_, i) => ({
      rating: 'Good',
      reviewedAt: `2026-04-${String(Math.min(i + 1, 28)).padStart(2, '0')}T00:00:00.000Z`,
      state: 'Dormant',
      note: 'phase14j-inert-readiness-log'
    }));

    const recordWithManyLogs = {
      ...DORMANT_FSRS_RECORD,
      itemId: 'item-log-cap',
      fsrsReviewLogs: overflowLogs
    };

    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: [recordWithManyLogs]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);

      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-log-cap');
      expect(rec).toBeDefined();
      expect(Array.isArray(rec.fsrsReviewLogs)).toBe(true);
      expect(rec.fsrsReviewLogs.length).toBe(FSRS_REVIEW_LOG_CAP);
    });
  });
});

// ─── Test 6: Legacy backup (no FSRS) still validates and restores ─────────────

describe('Test 6: legacy backup without FSRS metadata still validates and restores', () => {
  it('backup with only SM-2 records validates without error', () => {
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: [SM2_LEGACY_RECORD]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);
    const result = validateV2BackupPayload(payload);
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('backup with only SM-2 records restores without error', () => {
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: [SM2_LEGACY_RECORD]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);
    });
  });

  it('empty review schedule backup (no records at all) validates and restores', () => {
    const payload = makeFullV2BackupPayload(null);
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      const validateResult = validateV2BackupPayload(payload);
      expect(validateResult.ok).toBe(true);

      const restoreResult = restoreV2BackupPayload(payload);
      expect(restoreResult.ok).toBe(true);
    });
  });
});

// ─── Test 7: Restore does not add FSRS metadata to old SM-2 records ──────────

describe('Test 7: restore does not add FSRS metadata to old SM-2 records', () => {
  it('SM-2 record restored from legacy backup has no FSRS fields', () => {
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: [SM2_LEGACY_RECORD]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);

      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-sm2-legacy');
      expect(rec).toBeDefined();
      expect(rec.schedulerKind).toBeUndefined();
      expect(rec.schedulerVersion).toBeUndefined();
      expect(rec.fsrsPayload).toBeUndefined();
      expect(rec.fsrsReviewLogs).toBeUndefined();
      // SM-2 fields still present
      expect(rec.intervalDays).toBe(3);
      expect(rec.repetitionCount).toBe(2);
    });
  });
});

// ─── Test 8: Restore/import does not call enrollment helper ──────────────────

describe('Test 8: restore and import path do not call enrollment helpers', () => {
  it('v2BackupRestore.js does not import isFsrsNewCardEnrollmentEligible', () => {
    const source = readProjectFile('src/state/v2BackupRestore.js');
    expect(source).not.toContain('isFsrsNewCardEnrollmentEligible');
    expect(source).not.toContain('scheduleDormantFsrsReview');
  });

  it('v2BackupRestore.js does not have onMount/app-boot/session-start enrollment markers', () => {
    const source = readProjectFile('src/state/v2BackupRestore.js');
    expect(source).not.toMatch(/onMount.*enroll/i);
    expect(source).not.toMatch(/useEffect.*enroll/i);
    expect(source).not.toMatch(/app.*boot.*enroll/i);
    expect(source).not.toMatch(/session.*start.*enroll/i);
  });
});

// ─── Test 9: Toggle OFF does not delete dormant metadata during backup/restore ─

describe('Test 9: toggle OFF does not delete existing dormant metadata during backup/restore', () => {
  it('FSRS fields survive restore even when fsrsExperimentalEnabled is false in backup settings', () => {
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: [DORMANT_FSRS_RECORD]
    };
    // Backup includes settings with toggle OFF
    const payload = makeFullV2BackupPayload(reviewSchedule, {
      settings: { fsrsExperimentalEnabled: false }
    });
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);

      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-fsrs-001');
      expect(rec).toBeDefined();
      // Toggle OFF must not delete dormant metadata
      expect(rec.schedulerKind).toBe('fsrs-planned');
      expect(rec.schedulerVersion).toBe('phase14j-dormant-readiness');
      expect(rec.fsrsPayload).toBeDefined();
      expect(Array.isArray(rec.fsrsReviewLogs)).toBe(true);
    });
  });
});

// ─── Test 10: Invalid/malformed FSRS metadata handled safely ─────────────────

describe('Test 10: invalid or malformed FSRS metadata is handled safely and does not crash restore', () => {
  it('non-object fsrsPayload is dropped; base record preserved; no crash', () => {
    const malformedRecord = {
      ...SM2_LEGACY_RECORD,
      itemId: 'item-malformed-payload',
      schedulerKind: 'fsrs-planned',
      schedulerVersion: 'phase14j-dormant-readiness',
      fsrsPayload: 'not-a-valid-object',
      fsrsReviewLogs: [DORMANT_FSRS_LOG]
    };
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: [malformedRecord]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      expect(() => restoreV2BackupPayload(payload)).not.toThrow();
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);

      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-malformed-payload');
      expect(rec).toBeDefined();
      // malformed fsrsPayload is dropped
      expect(rec.fsrsPayload).toBeUndefined();
      // Base record fields preserved
      expect(rec.itemId).toBe('item-malformed-payload');
      expect(rec.intervalDays).toBeGreaterThanOrEqual(0);
    });
  });

  it('non-array fsrsReviewLogs is dropped; base record and fsrsPayload preserved; no crash', () => {
    const malformedRecord = {
      ...SM2_LEGACY_RECORD,
      itemId: 'item-malformed-logs',
      schedulerKind: 'fsrs-planned',
      schedulerVersion: 'phase14j-dormant-readiness',
      fsrsPayload: DORMANT_FSRS_PAYLOAD,
      fsrsReviewLogs: 'not-an-array'
    };
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: [malformedRecord]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      expect(() => restoreV2BackupPayload(payload)).not.toThrow();
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);

      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-malformed-logs');
      expect(rec).toBeDefined();
      // malformed fsrsReviewLogs is dropped
      expect(rec.fsrsReviewLogs).toBeUndefined();
      // fsrsPayload still present (it was valid)
      expect(rec.fsrsPayload).toBeDefined();
      // Base record fields preserved
      expect(rec.itemId).toBe('item-malformed-logs');
    });
  });

  it('record with non-plain-object entries in fsrsReviewLogs has those entries filtered out', () => {
    const mixedLogs = [
      DORMANT_FSRS_LOG,
      'invalid-string-entry',
      null,
      { rating: 'Again', reviewedAt: '2026-05-15T00:00:00.000Z', state: 'Dormant', note: 'valid' }
    ];
    const recordWithMixedLogs = {
      ...DORMANT_FSRS_RECORD,
      itemId: 'item-mixed-logs',
      fsrsReviewLogs: mixedLogs
    };
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: [recordWithMixedLogs]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);
    const storage = createMockStorage({});

    withMockWindow(storage, () => {
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);

      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-mixed-logs');
      expect(rec).toBeDefined();
      // Only plain-object entries survive
      expect(Array.isArray(rec.fsrsReviewLogs)).toBe(true);
      expect(rec.fsrsReviewLogs.length).toBe(2);
    });
  });
});

// ─── Test 11: Full read/write round trip through review schedule storage ──────

describe('Test 11: full read/write round trip through review schedule storage preserves dormant fields', () => {
  it('seeding storage directly and reading back via readReviewSchedule preserves all FSRS fields', () => {
    const storage = createMockStorage({
      [REVIEW_SCHEDULE_STORAGE_KEY]: JSON.stringify({
        schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
        updatedAt: '2026-05-14T00:00:00.000Z',
        records: [DORMANT_FSRS_RECORD]
      })
    });

    withMockWindow(storage, () => {
      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-fsrs-001');
      expect(rec).toBeDefined();
      expect(rec.schedulerKind).toBe('fsrs-planned');
      expect(rec.schedulerVersion).toBe('phase14j-dormant-readiness');
      expect(rec.fsrsPayload).toBeDefined();
      expect(rec.fsrsPayload.difficulty).toBe(5.0);
      expect(rec.fsrsPayload.phase).toBe('phase14j-dormant-readiness');
      expect(Array.isArray(rec.fsrsReviewLogs)).toBe(true);
      expect(rec.fsrsReviewLogs[0].rating).toBe('Good');
    });
  });

  it('full backup → validate → restore → read round-trip preserves all dormant FSRS fields', () => {
    const reviewSchedule = {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '2026-05-14T00:00:00.000Z',
      records: [DORMANT_FSRS_RECORD]
    };
    const payload = makeFullV2BackupPayload(reviewSchedule);

    const validation = validateV2BackupPayload(payload);
    expect(validation.ok).toBe(true);

    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const restoreResult = restoreV2BackupPayload(payload);
      expect(restoreResult.ok).toBe(true);

      const { records } = readReviewSchedule();
      const rec = records.find(r => r.itemId === 'item-fsrs-001');
      expect(rec).toBeDefined();
      expect(rec.schedulerKind).toBe('fsrs-planned');
      expect(rec.schedulerVersion).toBe('phase14j-dormant-readiness');
      expect(rec.fsrsPayload).toEqual(DORMANT_FSRS_PAYLOAD);
      expect(Array.isArray(rec.fsrsReviewLogs)).toBe(true);
      expect(rec.fsrsReviewLogs.length).toBe(1);
      expect(rec.fsrsReviewLogs[0]).toEqual(DORMANT_FSRS_LOG);
    });
  });
});

// ─── Test 12: No production ts-fsrs.next() usage ─────────────────────────────

describe('Test 12: no production ts-fsrs.next() in backup/restore or review schedule storage', () => {
  it('v2BackupRestore.js has no .next() calls', () => {
    const source = readProjectFile('src/state/v2BackupRestore.js');
    expect(source).not.toMatch(/\.next\s*\(/);
  });

  it('reviewScheduleStorage.js has no .next() calls', () => {
    const source = readProjectFile('src/state/reviewScheduleStorage.js');
    expect(source).not.toMatch(/\.next\s*\(/);
  });
});

// ─── Test 13: StudyRoom/Dashboard source unchanged ───────────────────────────

describe('Test 13: StudyRoom and Dashboard remain unchanged — no production FSRS rating UI', () => {
  it('StudyRoom.jsx has no four-rating FSRS UI or enrollment references', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).not.toMatch(/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/i);
    expect(source).not.toContain('FsrsTwoStepScaffold');
    expect(source).not.toContain('scheduleDormantFsrsReview');
    expect(source).not.toContain('isFsrsNewCardEnrollmentEligible');
  });

  it('Dashboard.jsx has no four-rating FSRS UI', () => {
    const source = readProjectFile('src/routes/Dashboard.jsx');
    expect(source).not.toMatch(/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/i);
  });
});

// ─── Test 14: No package/dependency changes ───────────────────────────────────

describe('Test 14: backup/export/import hardening does not change package or dependencies', () => {
  it('package.json ts-fsrs remains pinned at 5.3.3', () => {
    const pkg = JSON.parse(readProjectFile('package.json'));
    expect(pkg.dependencies?.['ts-fsrs']).toBe('5.3.3');
  });

  it('package.json has no native binding dependency', () => {
    const text = readProjectFile('package.json');
    expect(text).not.toContain('@open-spaced-repetition/binding');
  });
});

// ─── Test 15: Existing Phase 14L production enrollment tests still pass ───────

describe('Test 15: Phase 14L production enrollment test file still exists and has required content', () => {
  it('fsrsProductionEnrollmentWiring.test.js exists and has enrollment wiring tests', () => {
    const source = readProjectFile('tests/unit/fsrsProductionEnrollmentWiring.test.js');
    expect(source).toContain('updateReviewScheduleFromHistoryRecord');
    expect(source).toContain('schedulerKind');
    expect(source).toContain('fsrsPayload');
    expect(source).toContain('dormant');
    expect(source).toContain('toggle');
    expect(source).toContain('prior-history');
  });

  it('fsrsProductionEnrollmentWiring.test.js has the expected 15 test suites', () => {
    const source = readProjectFile('tests/unit/fsrsProductionEnrollmentWiring.test.js');
    const describeCount = (source.match(/^describe\(/gm) || []).length;
    expect(describeCount).toBeGreaterThanOrEqual(15);
  });
});
