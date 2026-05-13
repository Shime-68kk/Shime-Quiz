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
  SETTINGS_STORAGE_KEY,
  SETTINGS_SCHEMA_VERSION,
  FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY,
  getDefaultSettings,
  getSettings,
  clearSettings,
  updateSettings,
  importSettings
} from '../../src/state/settingsStorage.js';
import { REVIEW_SCHEDULE_SCHEMA_VERSION, REVIEW_SCHEDULE_STORAGE_KEY } from '../../src/state/reviewScheduleStorage.js';
import { STUDY_HISTORY_SCHEMA_VERSION, STUDY_HISTORY_STORAGE_KEY } from '../../src/state/studyHistoryStorage.js';
import { STUDY_GOAL_SCHEMA_VERSION, STUDY_GOAL_STORAGE_KEY } from '../../src/state/studyGoalStorage.js';
import { STUDY_PLAN_PROGRESS_SCHEMA_VERSION, STUDY_PLAN_PROGRESS_STORAGE_KEY } from '../../src/state/studyPlanProgressStorage.js';
import { RECOMMENDATION_FEEDBACK_SCHEMA_VERSION, RECOMMENDATION_FEEDBACK_STORAGE_KEY } from '../../src/state/recommendationFeedbackStorage.js';
import { LIBRARY_STORAGE_KEY } from '../../src/data/learningDataStore.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function createMockStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  const calls = [];
  return {
    calls,
    get length() { return map.size; },
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
    key(index) { return [...map.keys()][index] || null; },
    dump(key) { return map.get(key); },
    has(key) { return map.has(key); }
  };
}

function withMockWindow(storage, run) {
  const previousWindow = globalThis.window;
  const previousCustomEvent = globalThis.CustomEvent;

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
      BroadcastChannel: undefined,
      dispatchEvent() { return true; },
      addEventListener() {},
      removeEventListener() {}
    }
  });

  try {
    return run();
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
    if (previousCustomEvent === undefined) delete globalThis.CustomEvent;
    else Object.defineProperty(globalThis, 'CustomEvent', { configurable: true, value: previousCustomEvent });
  }
}

function loadValidLibraryData() {
  return JSON.parse(fs.readFileSync(resolve(PROJECT_ROOT, 'tests/fixtures/valid-import.json'), 'utf8'));
}

function makeMinimalLearningState() {
  return {
    studyHistory: { schemaVersion: STUDY_HISTORY_SCHEMA_VERSION, updatedAt: '', records: [] },
    reviewSchedule: { schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION, updatedAt: '', records: [] },
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

function makeFullV2BackupPayload(overrides = {}) {
  const libraryData = loadValidLibraryData();
  const state = makeMinimalLearningState();
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
    ...overrides
  };
}

describe('backupSettingsPersistence — createV2BackupPayload includes top-level settings', () => {
  it('includes settings key at top level of payload (not under data)', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const libraryData = loadValidLibraryData();
      const result = createV2BackupPayload({ libraryData });
      expect(result.ok).toBe(true);
      expect(result.payload).toHaveProperty('settings');
      expect(typeof result.payload.settings).toBe('object');
      expect(result.payload.settings).not.toBeNull();
    });
  });

  it('payload.settings has correct schema fields', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const libraryData = loadValidLibraryData();
      const result = createV2BackupPayload({ libraryData });
      const s = result.payload.settings;
      expect(s.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
      expect(s.fsrsExperimentalEnabled).toBe(false);
      expect(s.fsrsEnrollmentMode).toBe(FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY);
    });
  });

  it('payload.data does not contain settings or shimeV2SettingsV1 key', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const libraryData = loadValidLibraryData();
      const result = createV2BackupPayload({ libraryData });
      expect('settings' in result.payload.data).toBe(false);
      expect('shimeV2SettingsV1' in result.payload.data).toBe(false);
    });
  });
});

describe('backupSettingsPersistence — validateV2BackupPayload with settings', () => {
  it('old backup without settings key validates without error', () => {
    const payload = makeFullV2BackupPayload();
    // Confirm no settings key
    expect('settings' in payload).toBe(false);
    const result = validateV2BackupPayload(payload);
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('old backup without settings — validated.settings is null', () => {
    const payload = makeFullV2BackupPayload();
    const result = validateV2BackupPayload(payload);
    expect(result.settings).toBeNull();
  });

  it('backup with valid settings validates and normalizes settings', () => {
    const payload = makeFullV2BackupPayload({
      settings: {
        schemaVersion: SETTINGS_SCHEMA_VERSION,
        fsrsExperimentalEnabled: true,
        fsrsDesiredRetention: 0.88,
        fsrsMaximumInterval: 1000,
        fsrsEnabledAt: '2026-03-01T00:00:00.000Z',
        fsrsEnrollmentMode: 'new-cards-only',
        updatedAt: '2026-03-01T00:00:00.000Z'
      }
    });
    const result = validateV2BackupPayload(payload);
    expect(result.ok).toBe(true);
    expect(result.settings).not.toBeNull();
    expect(result.settings.fsrsExperimentalEnabled).toBe(true);
    expect(result.settings.fsrsDesiredRetention).toBe(0.88);
    expect(result.settings.fsrsEnabledAt).toBe('2026-03-01T00:00:00.000Z');
    // Enrollment mode always locked
    expect(result.settings.fsrsEnrollmentMode).toBe(FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY);
  });

  it('backup with out-of-range settings normalizes to safe values', () => {
    const payload = makeFullV2BackupPayload({
      settings: {
        fsrsExperimentalEnabled: false,
        fsrsDesiredRetention: 0.10,
        fsrsMaximumInterval: -5
      }
    });
    const result = validateV2BackupPayload(payload);
    expect(result.ok).toBe(true);
    expect(result.settings.fsrsDesiredRetention).toBe(0.70);
    expect(result.settings.fsrsMaximumInterval).toBe(1);
  });
});

describe('backupSettingsPersistence — restoreV2BackupPayload settings restore', () => {
  it('restores settings when backup includes them', () => {
    const settingsPayload = {
      schemaVersion: SETTINGS_SCHEMA_VERSION,
      fsrsExperimentalEnabled: true,
      fsrsDesiredRetention: 0.91,
      fsrsMaximumInterval: 730,
      fsrsEnabledAt: '2026-04-01T00:00:00.000Z',
      fsrsEnrollmentMode: 'new-cards-only',
      updatedAt: ''
    };
    const payload = makeFullV2BackupPayload({ settings: settingsPayload });

    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);
      const restored = getSettings();
      expect(restored.fsrsExperimentalEnabled).toBe(true);
      expect(restored.fsrsDesiredRetention).toBe(0.91);
      expect(restored.fsrsMaximumInterval).toBe(730);
    });
  });

  it('leaves existing settings unchanged when backup has no settings', () => {
    const payload = makeFullV2BackupPayload();
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      // Store a known settings value
      updateSettings({ fsrsDesiredRetention: 0.82 });
      const before = getSettings();

      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);

      const after = getSettings();
      expect(after.fsrsDesiredRetention).toBe(before.fsrsDesiredRetention);
    });
  });

  it('main restore succeeds even if settings key is absent in payload', () => {
    const payload = makeFullV2BackupPayload();
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const result = restoreV2BackupPayload(payload);
      expect(result.ok).toBe(true);
    });
  });
});

describe('backupSettingsPersistence — importSettings direct', () => {
  it('importSettings writes normalized settings to storage', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const raw = {
        schemaVersion: SETTINGS_SCHEMA_VERSION,
        fsrsExperimentalEnabled: false,
        fsrsDesiredRetention: 0.90,
        fsrsMaximumInterval: 36500,
        fsrsEnabledAt: null,
        fsrsEnrollmentMode: 'new-cards-only',
        updatedAt: ''
      };
      const result = importSettings(raw);
      expect(result.ok).toBe(true);
      const written = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect(written.fsrsExperimentalEnabled).toBe(false);
      expect(written.fsrsEnrollmentMode).toBe(FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY);
    });
  });
});

describe('backupSettingsPersistence — legacy dataBackup.js unchanged', () => {
  it('legacy dataBackup.js does not import settingsStorage', () => {
    const source = fs.readFileSync(
      resolve(PROJECT_ROOT, 'src/quiz/dataBackup.js'), 'utf8'
    );
    expect(source).not.toMatch(/settingsStorage/);
    expect(source).not.toMatch(/shimeV2SettingsV1/);
    expect(source).not.toMatch(/fsrsExperimentalEnabled/);
  });
});
