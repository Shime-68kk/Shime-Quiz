/**
 * tests/unit/fsrsExperimentalSettingsPanel.test.jsx
 *
 * Phase 14H — FSRS Experimental Settings Panel unit tests.
 *
 * DOM/component rendering is not available (no jsdom vitest environment configured).
 * Tests cover:
 *   1. Storage behaviour the panel relies on (settingsStorage functions)
 *   2. Static assertions about the panel source file
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  SETTINGS_STORAGE_KEY,
  getDefaultSettings,
  getSettings,
  updateSettings,
  clearSettings
} from '../../src/state/settingsStorage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

// ---------------------------------------------------------------------------
// Mock helpers (same pattern as settingsStorage.test.js)
// ---------------------------------------------------------------------------

function createMockStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  const calls = [];
  return {
    calls,
    get length() { return map.size; },
    getItem(key) { calls.push(['getItem', key]); return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { calls.push(['setItem', key, value]); map.set(key, String(value)); },
    removeItem(key) { calls.push(['removeItem', key]); map.delete(key); },
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

// ---------------------------------------------------------------------------
// 1. Storage behaviour — missing settings key → default OFF, no write
// ---------------------------------------------------------------------------

describe('FsrsExperimentalSettingsPanel storage — missing key renders OFF', () => {
  it('getSettings returns fsrsExperimentalEnabled: false when key is absent', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const settings = getSettings();
      expect(settings.fsrsExperimentalEnabled).toBe(false);
    });
  });

  it('getSettings does not call setItem when key is absent (lazy read)', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      getSettings();
      const writes = storage.calls.filter(c => c[0] === 'setItem');
      expect(writes).toHaveLength(0);
    });
  });

  it('getSettings does not call removeItem when key is absent', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      getSettings();
      const removes = storage.calls.filter(c => c[0] === 'removeItem');
      expect(removes).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 2. Storage behaviour — invalid settings → OFF/default, no crash
// ---------------------------------------------------------------------------

describe('FsrsExperimentalSettingsPanel storage — invalid JSON renders OFF safely', () => {
  it('getSettings returns default OFF for invalid JSON without throwing', () => {
    const storage = createMockStorage({ [SETTINGS_STORAGE_KEY]: '%%%invalid%%%' });
    withMockWindow(storage, () => {
      let settings;
      expect(() => { settings = getSettings(); }).not.toThrow();
      expect(settings.fsrsExperimentalEnabled).toBe(false);
    });
  });

  it('getSettings does not call removeItem on invalid JSON (no destructive cleanup)', () => {
    const storage = createMockStorage({ [SETTINGS_STORAGE_KEY]: '{bad json' });
    withMockWindow(storage, () => {
      getSettings();
      const removes = storage.calls.filter(c => c[0] === 'removeItem');
      expect(removes).toHaveLength(0);
    });
  });

  it('getSettings does not write when settings object is missing fsrsExperimentalEnabled', () => {
    const noToggleSettings = JSON.stringify({ schemaVersion: 'shime-v2-settings-v1' });
    const storage = createMockStorage({ [SETTINGS_STORAGE_KEY]: noToggleSettings });
    withMockWindow(storage, () => {
      const settings = getSettings();
      expect(settings.fsrsExperimentalEnabled).toBe(false);
      const writes = storage.calls.filter(c => c[0] === 'setItem');
      expect(writes).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 3. Storage behaviour — confirm ON writes fsrsExperimentalEnabled: true
// ---------------------------------------------------------------------------

describe('FsrsExperimentalSettingsPanel storage — confirm ON writes correctly', () => {
  it('updateSettings({ fsrsExperimentalEnabled: true }) writes exactly once', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const result = updateSettings({ fsrsExperimentalEnabled: true });
      expect(result.ok).toBe(true);
      const writes = storage.calls.filter(c => c[0] === 'setItem');
      expect(writes).toHaveLength(1);
      const written = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect(written.fsrsExperimentalEnabled).toBe(true);
    });
  });

  it('confirming ON sets fsrsEnabledAt (write-once timestamp)', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      updateSettings({ fsrsExperimentalEnabled: true });
      const written = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect(typeof written.fsrsEnabledAt).toBe('string');
      expect(written.fsrsEnabledAt.length).toBeGreaterThan(0);
    });
  });

  it('confirming ON does not assign schedulerKind', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      updateSettings({ fsrsExperimentalEnabled: true });
      const written = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect('schedulerKind' in written).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// 4. Storage behaviour — cancel does NOT write
// ---------------------------------------------------------------------------

describe('FsrsExperimentalSettingsPanel storage — cancel does not write', () => {
  it('not calling updateSettings (simulating cancel) leaves storage unchanged', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      // Simulate: user clicks ON → modal opens → user cancels (modal.handleCancel)
      // Cancel path: setShowModal(false) only — no updateSettings call
      // Verify: calling getSettings() alone produces no writes
      getSettings();
      const writes = storage.calls.filter(c => c[0] === 'setItem');
      expect(writes).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 5. Storage behaviour — toggle OFF writes fsrsExperimentalEnabled: false
// ---------------------------------------------------------------------------

describe('FsrsExperimentalSettingsPanel storage — toggle OFF writes correctly', () => {
  it('updateSettings({ fsrsExperimentalEnabled: false }) writes exactly once', () => {
    const existing = JSON.stringify({
      schemaVersion: 'shime-v2-settings-v1',
      fsrsExperimentalEnabled: true,
      fsrsEnabledAt: new Date().toISOString()
    });
    const storage = createMockStorage({ [SETTINGS_STORAGE_KEY]: existing });
    withMockWindow(storage, () => {
      const result = updateSettings({ fsrsExperimentalEnabled: false });
      expect(result.ok).toBe(true);
      const writes = storage.calls.filter(c => c[0] === 'setItem');
      expect(writes).toHaveLength(1);
      const written = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect(written.fsrsExperimentalEnabled).toBe(false);
    });
  });

  it('toggle OFF preserves fsrsEnabledAt (write-once, never cleared)', () => {
    const enabledAt = '2025-01-01T00:00:00.000Z';
    const existing = JSON.stringify({
      schemaVersion: 'shime-v2-settings-v1',
      fsrsExperimentalEnabled: true,
      fsrsEnabledAt: enabledAt
    });
    const storage = createMockStorage({ [SETTINGS_STORAGE_KEY]: existing });
    withMockWindow(storage, () => {
      updateSettings({ fsrsExperimentalEnabled: false });
      const written = JSON.parse(storage.dump(SETTINGS_STORAGE_KEY));
      expect(written.fsrsEnabledAt).toBe(enabledAt);
    });
  });
});

// ---------------------------------------------------------------------------
// 6. Storage behaviour — initial render does not write localStorage
// ---------------------------------------------------------------------------

describe('FsrsExperimentalSettingsPanel storage — initial render does not write', () => {
  it('getSettings() with existing OFF value does not write', () => {
    const existing = JSON.stringify({
      schemaVersion: 'shime-v2-settings-v1',
      fsrsExperimentalEnabled: false
    });
    const storage = createMockStorage({ [SETTINGS_STORAGE_KEY]: existing });
    withMockWindow(storage, () => {
      getSettings();
      const writes = storage.calls.filter(c => c[0] === 'setItem');
      expect(writes).toHaveLength(0);
    });
  });

  it('getSettings() with existing ON value does not write', () => {
    const existing = JSON.stringify({
      schemaVersion: 'shime-v2-settings-v1',
      fsrsExperimentalEnabled: true,
      fsrsEnabledAt: new Date().toISOString()
    });
    const storage = createMockStorage({ [SETTINGS_STORAGE_KEY]: existing });
    withMockWindow(storage, () => {
      getSettings();
      const writes = storage.calls.filter(c => c[0] === 'setItem');
      expect(writes).toHaveLength(0);
    });
  });

  it('clearSettings then getSettings returns default OFF without writing', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      clearSettings();
      storage.calls.length = 0;
      const settings = getSettings();
      expect(settings.fsrsExperimentalEnabled).toBe(false);
      const writes = storage.calls.filter(c => c[0] === 'setItem');
      expect(writes).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 7. Static checks — component source contains required safe copy
// ---------------------------------------------------------------------------

describe('FsrsExperimentalSettingsPanel source — required safe copy', () => {
  const panelPath = resolve(PROJECT_ROOT, 'src/components/settings/FsrsExperimentalSettingsPanel.jsx');
  const source = fs.readFileSync(panelPath, 'utf8');

  it('contains toggle label: Enable FSRS Memory Model (Experimental)', () => {
    expect(source).toContain('Enable FSRS Memory Model (Experimental)');
  });

  it('contains Preparation Phase Only copy', () => {
    expect(source).toContain('Preparation Phase Only');
  });

  it('contains "does not migrate existing cards"', () => {
    expect(source).toContain('does not migrate existing cards');
  });

  it('contains "does not change your current due dates"', () => {
    expect(source).toContain('does not change your current due dates');
  });

  it('contains Study Room four-rating UI unavailability notice', () => {
    expect(source).toContain('Study Room four-rating FSRS review UI is not available yet');
  });

  it('contains Dormant / Awaiting future update ON status', () => {
    expect(source).toContain('Status: Dormant (Awaiting future update)');
  });

  it('contains disabling pauses copy', () => {
    expect(source).toContain('Disabling this pauses FSRS preparation');
  });

  it('contains modal body: You are enabling the scaffold for the experimental FSRS memory model', () => {
    expect(source).toContain('You are enabling the scaffold for the experimental FSRS memory model');
  });

  it('contains confirm button: Enable preparation', () => {
    expect(source).toContain('Enable preparation');
  });
});

// ---------------------------------------------------------------------------
// 8. Static checks — component source forbidden patterns
// ---------------------------------------------------------------------------

describe('FsrsExperimentalSettingsPanel source — forbidden patterns absent', () => {
  const panelPath = resolve(PROJECT_ROOT, 'src/components/settings/FsrsExperimentalSettingsPanel.jsx');
  const source = fs.readFileSync(panelPath, 'utf8');

  it('does not assign schedulerKind', () => {
    expect(source).not.toMatch(/schedulerKind/);
  });

  it('does not contain Again/Hard/Good/Easy four-rating FSRS UI', () => {
    expect(source).not.toMatch(/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/i);
  });

  it('does not import reviewSchedulerAdapter', () => {
    expect(source).not.toMatch(/reviewSchedulerAdapter/i);
  });

  it('does not import fsrsWrapper', () => {
    expect(source).not.toMatch(/fsrsWrapper/i);
  });

  it('imports from settingsStorage.js', () => {
    expect(source).toMatch(/settingsStorage/);
  });

  it('uses getSettings', () => {
    expect(source).toContain('getSettings');
  });

  it('uses updateSettings', () => {
    expect(source).toContain('updateSettings');
  });
});

// ---------------------------------------------------------------------------
// 9. Static checks — StudyRoom has no FSRS rating buttons
// ---------------------------------------------------------------------------

describe('StudyRoom — no four-rating FSRS UI added', () => {
  const studyRoomPath = resolve(PROJECT_ROOT, 'src/routes/StudyRoom.jsx');
  const source = fs.readFileSync(studyRoomPath, 'utf8');

  it('does not contain Again/Hard/Good/Easy', () => {
    expect(source).not.toMatch(/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/i);
  });

  it('does not reference fsrsExperimentalEnabled', () => {
    expect(source).not.toContain('fsrsExperimentalEnabled');
  });
});

// ---------------------------------------------------------------------------
// 10. Static checks — reviewSchedulerAdapter unchanged / no production route
// ---------------------------------------------------------------------------

describe('reviewSchedulerAdapter — no production FSRS route added', () => {
  const adapterPath = resolve(PROJECT_ROOT, 'src/quiz/reviewSchedulerAdapter.js');
  const source = fs.readFileSync(adapterPath, 'utf8');

  it('does not reference fsrsExperimentalEnabled (UI setting not wired to adapter)', () => {
    expect(source).not.toContain('fsrsExperimentalEnabled');
  });
});

// ---------------------------------------------------------------------------
// 11. Static checks — Settings route registered, no schedulerKind in settings UI
// ---------------------------------------------------------------------------

describe('routeConfig — settings route registered', () => {
  const routeConfigPath = resolve(PROJECT_ROOT, 'src/routes/routeConfig.js');
  const source = fs.readFileSync(routeConfigPath, 'utf8');

  it('registers /settings route', () => {
    expect(source).toContain('/settings');
  });

  it('imports Settings component', () => {
    expect(source).toContain('Settings');
  });

  it('does not assign schedulerKind', () => {
    expect(source).not.toMatch(/schedulerKind/);
  });
});
