import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  SETTINGS_STORAGE_KEY,
  SETTINGS_SCHEMA_VERSION,
  FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY,
  getDefaultSettings,
  normalizeSettings,
  getSettings,
  updateSettings,
  importSettings,
  clearSettings
} from '../../src/state/settingsStorage.js';

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
    dump(key) { return map.get(key); }
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
      dispatchEvent(event) { listeners.push(event); return true; },
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

describe('settingsStorage — getDefaultSettings', () => {
  it('returns default OFF with all required fields', () => {
    const d = getDefaultSettings();
    expect(d.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
    expect(d.fsrsExperimentalEnabled).toBe(false);
    expect(d.fsrsEnrollmentMode).toBe(FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY);
    expect(d.fsrsEnabledAt).toBeNull();
    expect(d.fsrsDesiredRetention).toBe(0.90);
    expect(d.fsrsMaximumInterval).toBe(36500);
    expect(d.updatedAt).toBe('');
  });

  it('does not include schedulerKind', () => {
    expect('schedulerKind' in getDefaultSettings()).toBe(false);
  });

  it('does not include fsrsWeights', () => {
    expect('fsrsWeights' in getDefaultSettings()).toBe(false);
  });

  it('does not include fsrsPayload or fsrsReviewLogs', () => {
    const d = getDefaultSettings();
    expect('fsrsPayload' in d).toBe(false);
    expect('fsrsReviewLogs' in d).toBe(false);
  });
});

describe('settingsStorage — normalizeSettings', () => {
  it('returns default for null input', () => {
    expect(normalizeSettings(null)).toEqual(getDefaultSettings());
  });

  it('returns default for array input', () => {
    expect(normalizeSettings([])).toEqual(getDefaultSettings());
  });

  it('returns default for non-object input', () => {
    expect(normalizeSettings('string')).toEqual(getDefaultSettings());
    expect(normalizeSettings(42)).toEqual(getDefaultSettings());
  });

  it('always locks fsrsEnrollmentMode to new-cards-only', () => {
    expect(normalizeSettings({ fsrsEnrollmentMode: 'all-cards' }).fsrsEnrollmentMode)
      .toBe(FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY);
    expect(normalizeSettings({ fsrsEnrollmentMode: null }).fsrsEnrollmentMode)
      .toBe(FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY);
  });

  it('clamps fsrsDesiredRetention to [0.70, 0.97]', () => {
    expect(normalizeSettings({ fsrsDesiredRetention: 0.50 }).fsrsDesiredRetention).toBe(0.70);
    expect(normalizeSettings({ fsrsDesiredRetention: 0.99 }).fsrsDesiredRetention).toBe(0.97);
    expect(normalizeSettings({ fsrsDesiredRetention: 0.85 }).fsrsDesiredRetention).toBe(0.85);
    expect(normalizeSettings({ fsrsDesiredRetention: 'bad' }).fsrsDesiredRetention).toBe(0.90);
  });

  it('clamps fsrsMaximumInterval to [1, 36500]', () => {
    expect(normalizeSettings({ fsrsMaximumInterval: 0 }).fsrsMaximumInterval).toBe(1);
    expect(normalizeSettings({ fsrsMaximumInterval: 99999 }).fsrsMaximumInterval).toBe(36500);
    expect(normalizeSettings({ fsrsMaximumInterval: 365 }).fsrsMaximumInterval).toBe(365);
    expect(normalizeSettings({ fsrsMaximumInterval: 'bad' }).fsrsMaximumInterval).toBe(36500);
  });

  it('rejects invalid fsrsEnabledAt (keeps null)', () => {
    expect(normalizeSettings({ fsrsEnabledAt: 'not-a-date' }).fsrsEnabledAt).toBeNull();
    expect(normalizeSettings({ fsrsEnabledAt: 123 }).fsrsEnabledAt).toBeNull();
    expect(normalizeSettings({ fsrsEnabledAt: '' }).fsrsEnabledAt).toBeNull();
  });

  it('accepts valid ISO fsrsEnabledAt', () => {
    const iso = '2026-01-15T10:00:00.000Z';
    expect(normalizeSettings({ fsrsEnabledAt: iso }).fsrsEnabledAt).toBe(iso);
  });

  it('does not include schedulerKind in normalized output', () => {
    const result = normalizeSettings({ schedulerKind: 'fsrs-v4', fsrsExperimentalEnabled: true });
    expect('schedulerKind' in result).toBe(false);
  });
});

describe('settingsStorage — getSettings (lazy read)', () => {
  it('returns default when key is missing — does not call setItem', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const settings = getSettings();
      expect(settings.fsrsExperimentalEnabled).toBe(false);
      expect(settings.fsrsEnrollmentMode).toBe(FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY);
      const setItemCalls = storage.calls.filter(c => c[0] === 'setItem');
      expect(setItemCalls).toHaveLength(0);
    });
  });

  it('returns default when key is missing — does not call removeItem', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      getSettings();
      const removeItemCalls = storage.calls.filter(c => c[0] === 'removeItem');
      expect(removeItemCalls).toHaveLength(0);
    });
  });

  it('returns default when JSON is invalid — does not call setItem', () => {
    const storage = createMockStorage({ [SETTINGS_STORAGE_KEY]: '{not valid json' });
    withMockWindow(storage, () => {
      const settings = getSettings();
      expect(settings).toEqual(getDefaultSettings());
      const setItemCalls = storage.calls.filter(c => c[0] === 'setItem');
      expect(setItemCalls).toHaveLength(0);
    });
  });

  it('returns default when JSON is invalid — does not call removeItem', () => {
    const storage = createMockStorage({ [SETTINGS_STORAGE_KEY]: '{not valid json' });
    withMockWindow(storage, () => {
      getSettings();
      const removeItemCalls = storage.calls.filter(c => c[0] === 'removeItem');
      expect(removeItemCalls).toHaveLength(0);
    });
  });

  it('returns normalized settings when key is valid', () => {
    const stored = {
      schemaVersion: SETTINGS_SCHEMA_VERSION,
      updatedAt: '2026-01-01T00:00:00.000Z',
      fsrsExperimentalEnabled: true,
      fsrsEnrollmentMode: 'new-cards-only',
      fsrsEnabledAt: '2026-01-01T00:00:00.000Z',
      fsrsDesiredRetention: 0.85,
      fsrsMaximumInterval: 1000
    };
    const storage = createMockStorage({ [SETTINGS_STORAGE_KEY]: JSON.stringify(stored) });
    withMockWindow(storage, () => {
      const settings = getSettings();
      expect(settings.fsrsExperimentalEnabled).toBe(true);
      expect(settings.fsrsDesiredRetention).toBe(0.85);
      expect(settings.fsrsMaximumInterval).toBe(1000);
      expect(settings.fsrsEnabledAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  it('does not increase storage length on read when key is missing', () => {
    const storage = createMockStorage({});
    const initialLength = storage.length;
    withMockWindow(storage, () => {
      getSettings();
      expect(storage.length).toBe(initialLength);
    });
  });
});

describe('settingsStorage — updateSettings', () => {
  it('writes normalized envelope to storage', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const result = updateSettings({ fsrsExperimentalEnabled: false });
      expect(result.ok).toBe(true);
      const written = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect(written.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
      expect(written.fsrsExperimentalEnabled).toBe(false);
      expect(written.fsrsEnrollmentMode).toBe(FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY);
    });
  });

  it('sets updatedAt on write', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const before = Date.now();
      updateSettings({ fsrsExperimentalEnabled: false });
      const written = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      const updatedAt = new Date(written.updatedAt).getTime();
      expect(updatedAt).toBeGreaterThanOrEqual(before);
    });
  });

  it('sets fsrsEnabledAt on first enable (false → true)', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const result = updateSettings({ fsrsExperimentalEnabled: true });
      expect(result.ok).toBe(true);
      expect(result.settings.fsrsEnabledAt).not.toBeNull();
      expect(() => new Date(result.settings.fsrsEnabledAt)).not.toThrow();
    });
  });

  it('does not clear fsrsEnabledAt on disable', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      updateSettings({ fsrsExperimentalEnabled: true });
      const enabledAt = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY)).fsrsEnabledAt;
      updateSettings({ fsrsExperimentalEnabled: false });
      const afterDisable = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect(afterDisable.fsrsEnabledAt).toBe(enabledAt);
    });
  });

  it('does not set fsrsEnabledAt on second enable if already set', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      updateSettings({ fsrsExperimentalEnabled: true });
      const first = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY)).fsrsEnabledAt;
      updateSettings({ fsrsExperimentalEnabled: false });
      updateSettings({ fsrsExperimentalEnabled: true });
      const second = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY)).fsrsEnabledAt;
      expect(second).toBe(first);
    });
  });

  it('always locks fsrsEnrollmentMode to new-cards-only', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      updateSettings({ fsrsEnrollmentMode: 'all-cards' });
      const written = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect(written.fsrsEnrollmentMode).toBe(FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY);
    });
  });

  it('clamps retention to [0.70, 0.97]', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      updateSettings({ fsrsDesiredRetention: 0.50 });
      expect(JSON.parse(storage.dump(SETTINGS_STORAGE_KEY)).fsrsDesiredRetention).toBe(0.70);
      updateSettings({ fsrsDesiredRetention: 0.99 });
      expect(JSON.parse(storage.dump(SETTINGS_STORAGE_KEY)).fsrsDesiredRetention).toBe(0.97);
    });
  });

  it('clamps interval to [1, 36500]', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      updateSettings({ fsrsMaximumInterval: 0 });
      expect(JSON.parse(storage.dump(SETTINGS_STORAGE_KEY)).fsrsMaximumInterval).toBe(1);
      updateSettings({ fsrsMaximumInterval: 99999 });
      expect(JSON.parse(storage.dump(SETTINGS_STORAGE_KEY)).fsrsMaximumInterval).toBe(36500);
    });
  });

  it('does not include schedulerKind in persisted envelope', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      updateSettings({ fsrsExperimentalEnabled: false });
      const written = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect('schedulerKind' in written).toBe(false);
    });
  });

  it('returns ok: false for invalid patch', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      expect(updateSettings(null).ok).toBe(false);
      expect(updateSettings([]).ok).toBe(false);
      expect(updateSettings('bad').ok).toBe(false);
    });
  });
});

describe('settingsStorage — clearSettings', () => {
  it('removes the settings key', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      updateSettings({ fsrsExperimentalEnabled: false });
      expect(storage.dump(SETTINGS_STORAGE_KEY)).not.toBeUndefined();
      clearSettings();
      expect(storage.dump(SETTINGS_STORAGE_KEY)).toBeUndefined();
    });
  });

  it('after clear, getSettings returns default', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      updateSettings({ fsrsExperimentalEnabled: true });
      clearSettings();
      const settings = getSettings();
      expect(settings).toEqual(getDefaultSettings());
    });
  });
});

describe('settingsStorage — importSettings', () => {
  it('writes normalized settings to storage', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const raw = {
        schemaVersion: SETTINGS_SCHEMA_VERSION,
        fsrsExperimentalEnabled: true,
        fsrsDesiredRetention: 0.88,
        fsrsMaximumInterval: 500,
        fsrsEnabledAt: '2026-03-01T00:00:00.000Z',
        fsrsEnrollmentMode: 'new-cards-only',
        updatedAt: ''
      };
      const result = importSettings(raw);
      expect(result.ok).toBe(true);
      const written = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect(written.fsrsExperimentalEnabled).toBe(true);
      expect(written.fsrsDesiredRetention).toBe(0.88);
      expect(written.fsrsEnabledAt).toBe('2026-03-01T00:00:00.000Z');
    });
  });

  it('preserves existing fsrsEnabledAt if backup lacks it', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      updateSettings({ fsrsExperimentalEnabled: true });
      const existingEnabledAt = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY)).fsrsEnabledAt;
      importSettings({ fsrsExperimentalEnabled: false });
      const after = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect(after.fsrsEnabledAt).toBe(existingEnabledAt);
    });
  });

  it('returns ok: false for non-object input', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      expect(importSettings(null).ok).toBe(false);
      expect(importSettings('bad').ok).toBe(false);
    });
  });
});

describe('settingsStorage — source scan (UI/adapter isolation)', () => {
  it('StudyRoom.jsx does not reference shimeV2SettingsV1 or fsrsExperimentalEnabled', () => {
    const source = fs.readFileSync(
      resolve(PROJECT_ROOT, 'src/routes/StudyRoom.jsx'), 'utf8'
    );
    expect(source).not.toMatch(/shimeV2SettingsV1/);
    expect(source).not.toMatch(/fsrsExperimentalEnabled/);
    expect(source).not.toMatch(/settingsStorage/);
  });

  it('Dashboard.jsx does not reference shimeV2SettingsV1 or fsrsExperimentalEnabled', () => {
    const source = fs.readFileSync(
      resolve(PROJECT_ROOT, 'src/routes/Dashboard.jsx'), 'utf8'
    );
    expect(source).not.toMatch(/shimeV2SettingsV1/);
    expect(source).not.toMatch(/fsrsExperimentalEnabled/);
    expect(source).not.toMatch(/settingsStorage/);
  });

  it('reviewSchedulerAdapter.js references fsrsExperimentalEnabled and fsrsActiveSchedulingEnabled for the double gate (Phase 15B)', () => {
    const source = fs.readFileSync(
      resolve(PROJECT_ROOT, 'src/quiz/reviewSchedulerAdapter.js'), 'utf8'
    );
    expect(source).not.toMatch(/shimeV2SettingsV1/);
    expect(source).toContain('fsrsExperimentalEnabled');
    expect(source).toContain('fsrsActiveSchedulingEnabled');
    expect(source).toContain('settingsStorage');
  });
});
