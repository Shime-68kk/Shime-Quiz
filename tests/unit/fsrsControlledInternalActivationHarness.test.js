/**
 * Phase 15E — Controlled Internal Activation Harness
 *
 * 14 tests covering:
 *  1:  internal test helper functions exist and are clearly internal/test-named
 *  2:  default settings keep fsrsActiveSchedulingEnabled false
 *  3:  old settings without active flag normalize to false
 *  4:  invalid active flag value normalizes to false
 *  5:  helper can set active flag true in controlled test
 *  6:  helper can set active flag false
 *  7:  helper preserves other settings fields
 *  8:  public Settings UI source does not expose fsrsActiveSchedulingEnabled as visible toggle/label
 *  9:  enabling fsrsExperimentalEnabled alone does not enable active flag
 *  10: active flag ON alone does not bypass double gate (no active scheduling without experimental ON)
 *  11: double gate still requires experimental + active flag both ON
 *  12: no new ts-fsrs.next() call sites outside approved wrapper
 *  13: no StudyRoom/Dashboard changes
 *  14: no package/dependency changes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';

// ── Mocks ─────────────────────────────────────────────────────────────────────

let mockStorage = null;

vi.mock('../../src/utils/storage.js', () => ({
  getLocalStorage: vi.fn(() => mockStorage)
}));

vi.mock('../../src/state/localStorageSync.js', () => ({
  publishLearningStorageChanged: vi.fn()
}));

vi.mock('../../src/quiz/fsrsWrapper.js', async () => {
  const real = await vi.importActual('../../src/quiz/fsrsWrapper.js');
  return {
    ...real,
    scheduleFsrsReview: vi.fn(real.scheduleFsrsReview)
  };
});

vi.mock('../../src/state/settingsStorage.js', async () => {
  const real = await vi.importActual('../../src/state/settingsStorage.js');
  return { ...real };
});

import { getLocalStorage } from '../../src/utils/storage.js';
import {
  getDefaultSettings,
  normalizeSettings,
  getSettings,
  updateSettings,
  clearSettings,
  setFsrsActiveSchedulingForInternalTest,
  enableFsrsActiveSchedulingForInternalTest,
  disableFsrsActiveSchedulingForInternalTest,
  SETTINGS_STORAGE_KEY
} from '../../src/state/settingsStorage.js';
import { scheduleFsrsReview } from '../../src/quiz/fsrsWrapper.js';
import {
  scheduleReview,
  SCHEDULER_KIND_FSRS_PLANNED,
  FSRS_ACTIVE_SCHEDULER_KIND
} from '../../src/quiz/reviewSchedulerAdapter.js';

function makeStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem: vi.fn(key => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    _store: store
  };
}

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
    lastReviewedAt: PAST.toISOString(),
    intervalDays: 1,
    repetitionCount: 1,
    easeFactor: 2.2,
    correctStreak: 1,
    wrongCount: 0,
    fsrsPayload: { state: 'Review', stability: 3.0, difficulty: 5.0, reps: 1 },
    fsrsReviewLogs: [],
    ...overrides
  };
}

beforeEach(() => {
  mockStorage = makeStorage();
  getLocalStorage.mockReturnValue(mockStorage);
  scheduleFsrsReview.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
  mockStorage = null;
});

// ─── Test 1: helpers exist and are clearly internal/test-named ─────────────────

describe('Test 1: internal test helper functions exist and are clearly internal/test-named', () => {
  it('setFsrsActiveSchedulingForInternalTest is exported and contains internal/test language in name', () => {
    expect(typeof setFsrsActiveSchedulingForInternalTest).toBe('function');
    // Name must include internal/test/dev language
    const name = setFsrsActiveSchedulingForInternalTest.name;
    const isInternalNamed = /internal|test|dev/i.test(name);
    expect(isInternalNamed).toBe(true);
  });

  it('enableFsrsActiveSchedulingForInternalTest is exported and contains internal/test language in name', () => {
    expect(typeof enableFsrsActiveSchedulingForInternalTest).toBe('function');
    const name = enableFsrsActiveSchedulingForInternalTest.name;
    expect(/internal|test|dev/i.test(name)).toBe(true);
  });

  it('disableFsrsActiveSchedulingForInternalTest is exported and contains internal/test language in name', () => {
    expect(typeof disableFsrsActiveSchedulingForInternalTest).toBe('function');
    const name = disableFsrsActiveSchedulingForInternalTest.name;
    expect(/internal|test|dev/i.test(name)).toBe(true);
  });

  it('settingsStorage.js source declares helpers with internal/test language', () => {
    const source = fs.readFileSync('src/state/settingsStorage.js', 'utf8');
    expect(source).toContain('ForInternalTest');
    expect(source).toContain('enableFsrsActiveSchedulingForInternalTest');
    expect(source).toContain('disableFsrsActiveSchedulingForInternalTest');
    expect(source).toContain('setFsrsActiveSchedulingForInternalTest');
  });
});

// ─── Test 2: default settings keep active flag false ─────────────────────────

describe('Test 2: default settings keep fsrsActiveSchedulingEnabled false', () => {
  it('getDefaultSettings returns fsrsActiveSchedulingEnabled: false', () => {
    const defaults = getDefaultSettings();
    expect(defaults.fsrsActiveSchedulingEnabled).toBe(false);
  });

  it('getSettings with empty storage returns fsrsActiveSchedulingEnabled: false', () => {
    mockStorage.getItem.mockReturnValue(null);
    const settings = getSettings();
    expect(settings.fsrsActiveSchedulingEnabled).toBe(false);
  });
});

// ─── Test 3: old settings without active flag normalize to false ──────────────

describe('Test 3: old settings without active flag normalize to false', () => {
  it('normalizeSettings: object without fsrsActiveSchedulingEnabled key → false', () => {
    const result = normalizeSettings({ fsrsExperimentalEnabled: true });
    expect(result.fsrsActiveSchedulingEnabled).toBe(false);
  });

  it('getSettings: stored JSON without fsrsActiveSchedulingEnabled key → false', () => {
    const storedRaw = JSON.stringify({ schemaVersion: 'shime-v2-settings-v1', fsrsExperimentalEnabled: true });
    mockStorage.getItem.mockReturnValue(storedRaw);
    const settings = getSettings();
    expect(settings.fsrsActiveSchedulingEnabled).toBe(false);
  });
});

// ─── Test 4: invalid active flag value normalizes to false ────────────────────

describe('Test 4: invalid active flag value normalizes to false', () => {
  it('normalizeSettings: string "true" → false', () => {
    expect(normalizeSettings({ fsrsActiveSchedulingEnabled: 'true' }).fsrsActiveSchedulingEnabled).toBe(false);
  });

  it('normalizeSettings: number 1 → false', () => {
    expect(normalizeSettings({ fsrsActiveSchedulingEnabled: 1 }).fsrsActiveSchedulingEnabled).toBe(false);
  });

  it('normalizeSettings: null → false', () => {
    expect(normalizeSettings({ fsrsActiveSchedulingEnabled: null }).fsrsActiveSchedulingEnabled).toBe(false);
  });

  it('normalizeSettings: object {} → false', () => {
    expect(normalizeSettings({ fsrsActiveSchedulingEnabled: {} }).fsrsActiveSchedulingEnabled).toBe(false);
  });

  it('normalizeSettings: boolean false → false (explicit false passthrough)', () => {
    expect(normalizeSettings({ fsrsActiveSchedulingEnabled: false }).fsrsActiveSchedulingEnabled).toBe(false);
  });

  it('normalizeSettings: boolean true → true (only true passthrough)', () => {
    expect(normalizeSettings({ fsrsActiveSchedulingEnabled: true }).fsrsActiveSchedulingEnabled).toBe(true);
  });
});

// ─── Test 5: helper can set active flag true in controlled test ───────────────

describe('Test 5: helper can set active flag true in controlled test', () => {
  it('setFsrsActiveSchedulingForInternalTest(true) sets fsrsActiveSchedulingEnabled to true', () => {
    const result = setFsrsActiveSchedulingForInternalTest(true);
    expect(result.ok).toBe(true);
    expect(result.settings.fsrsActiveSchedulingEnabled).toBe(true);
  });

  it('enableFsrsActiveSchedulingForInternalTest() sets fsrsActiveSchedulingEnabled to true', () => {
    const result = enableFsrsActiveSchedulingForInternalTest();
    expect(result.ok).toBe(true);
    expect(result.settings.fsrsActiveSchedulingEnabled).toBe(true);
  });

  it('getSettings after enableFsrsActiveSchedulingForInternalTest() reflects true', () => {
    enableFsrsActiveSchedulingForInternalTest();
    const settings = getSettings();
    expect(settings.fsrsActiveSchedulingEnabled).toBe(true);
  });
});

// ─── Test 6: helper can set active flag false ─────────────────────────────────

describe('Test 6: helper can set active flag false', () => {
  it('setFsrsActiveSchedulingForInternalTest(false) sets fsrsActiveSchedulingEnabled to false', () => {
    enableFsrsActiveSchedulingForInternalTest();
    const result = setFsrsActiveSchedulingForInternalTest(false);
    expect(result.ok).toBe(true);
    expect(result.settings.fsrsActiveSchedulingEnabled).toBe(false);
  });

  it('disableFsrsActiveSchedulingForInternalTest() sets fsrsActiveSchedulingEnabled to false', () => {
    enableFsrsActiveSchedulingForInternalTest();
    const result = disableFsrsActiveSchedulingForInternalTest();
    expect(result.ok).toBe(true);
    expect(result.settings.fsrsActiveSchedulingEnabled).toBe(false);
  });

  it('setFsrsActiveSchedulingForInternalTest with non-boolean coerces to false', () => {
    const result = setFsrsActiveSchedulingForInternalTest('yes');
    expect(result.ok).toBe(true);
    expect(result.settings.fsrsActiveSchedulingEnabled).toBe(false);
  });
});

// ─── Test 7: helper preserves other settings fields ──────────────────────────

describe('Test 7: helper preserves other settings fields', () => {
  it('enableFsrsActiveSchedulingForInternalTest preserves fsrsExperimentalEnabled', () => {
    updateSettings({ fsrsExperimentalEnabled: true });
    const result = enableFsrsActiveSchedulingForInternalTest();
    expect(result.settings.fsrsExperimentalEnabled).toBe(true);
    expect(result.settings.fsrsActiveSchedulingEnabled).toBe(true);
  });

  it('disableFsrsActiveSchedulingForInternalTest preserves fsrsDesiredRetention', () => {
    updateSettings({ fsrsDesiredRetention: 0.85, fsrsExperimentalEnabled: true });
    enableFsrsActiveSchedulingForInternalTest();
    const result = disableFsrsActiveSchedulingForInternalTest();
    expect(result.settings.fsrsDesiredRetention).toBe(0.85);
    expect(result.settings.fsrsExperimentalEnabled).toBe(true);
    expect(result.settings.fsrsActiveSchedulingEnabled).toBe(false);
  });

  it('helper preserves fsrsEnrollmentMode and schemaVersion fields', () => {
    const result = setFsrsActiveSchedulingForInternalTest(true);
    expect(result.settings.fsrsEnrollmentMode).toBe('new-cards-only');
    expect(result.settings.schemaVersion).toBe('shime-v2-settings-v1');
  });
});

// ─── Test 8: public Settings UI does not expose fsrsActiveSchedulingEnabled ───

describe('Test 8: public Settings UI source does not expose fsrsActiveSchedulingEnabled as visible toggle/label', () => {
  it('Settings.jsx does not reference fsrsActiveSchedulingEnabled', () => {
    const source = fs.readFileSync('src/routes/Settings.jsx', 'utf8');
    expect(source).not.toContain('fsrsActiveSchedulingEnabled');
  });

  it('Dashboard.jsx does not reference fsrsActiveSchedulingEnabled', () => {
    const source = fs.readFileSync('src/routes/Dashboard.jsx', 'utf8');
    expect(source).not.toContain('fsrsActiveSchedulingEnabled');
  });
});

// ─── Test 9: enabling fsrsExperimentalEnabled alone does not enable active flag

describe('Test 9: enabling fsrsExperimentalEnabled alone does not enable active flag', () => {
  it('updateSettings with fsrsExperimentalEnabled:true does not set fsrsActiveSchedulingEnabled:true', () => {
    const result = updateSettings({ fsrsExperimentalEnabled: true });
    expect(result.settings.fsrsExperimentalEnabled).toBe(true);
    expect(result.settings.fsrsActiveSchedulingEnabled).toBe(false);
  });

  it('getSettings after experimental ON still shows active flag false', () => {
    updateSettings({ fsrsExperimentalEnabled: true });
    const settings = getSettings();
    expect(settings.fsrsExperimentalEnabled).toBe(true);
    expect(settings.fsrsActiveSchedulingEnabled).toBe(false);
  });
});

// ─── Test 10: active flag ON alone does not bypass double gate ────────────────

describe('Test 10: active flag ON alone does not bypass double gate', () => {
  it('fsrsActiveSchedulingEnabled:true alone does not trigger active FSRS scheduling', () => {
    // Store: active ON, experimental OFF
    updateSettings({ fsrsExperimentalEnabled: false });
    setFsrsActiveSchedulingForInternalTest(true);

    const record = fsrsPlannedRecord();
    const result = scheduleReview(record, 'correct', { now: NOW });

    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
    expect(result.schedulerKind).not.toBe(FSRS_ACTIVE_SCHEDULER_KIND);
  });
});

// ─── Test 11: double gate requires both experimental + active ON ──────────────

describe('Test 11: double gate still requires experimental + active flag both ON', () => {
  it('experimental ON + active OFF → no active FSRS scheduling', () => {
    updateSettings({ fsrsExperimentalEnabled: true });
    setFsrsActiveSchedulingForInternalTest(false);

    const result = scheduleReview(fsrsPlannedRecord(), 'correct', { now: NOW });
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
    expect(result.schedulerKind).not.toBe(FSRS_ACTIVE_SCHEDULER_KIND);
  });

  it('experimental OFF + active ON → no active FSRS scheduling', () => {
    updateSettings({ fsrsExperimentalEnabled: false });
    setFsrsActiveSchedulingForInternalTest(true);

    const result = scheduleReview(fsrsPlannedRecord(), 'correct', { now: NOW });
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).not.toHaveBeenCalled();
    expect(result.schedulerKind).not.toBe(FSRS_ACTIVE_SCHEDULER_KIND);
  });

  it('experimental ON + active ON via internal helper → active FSRS scheduling runs', () => {
    updateSettings({ fsrsExperimentalEnabled: true });
    setFsrsActiveSchedulingForInternalTest(true);

    const result = scheduleReview(fsrsPlannedRecord(), 'correct', { now: NOW });
    expect(result).not.toBeNull();
    expect(scheduleFsrsReview).toHaveBeenCalledTimes(1);
    expect(result.schedulerKind).toBe(FSRS_ACTIVE_SCHEDULER_KIND);
  });
});

// ─── Test 12: no new ts-fsrs.next() call sites outside approved wrapper ───────

describe('Test 12: no new ts-fsrs.next() call sites outside approved wrapper', () => {
  it('settingsStorage.js does not call .next() directly', () => {
    const source = fs.readFileSync('src/state/settingsStorage.js', 'utf8');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });

  it('reviewSchedulerAdapter.js does not call .next() directly', () => {
    const source = fs.readFileSync('src/quiz/reviewSchedulerAdapter.js', 'utf8');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });

  it('reviewScheduleStorage.js does not call .next() directly', () => {
    const source = fs.readFileSync('src/state/reviewScheduleStorage.js', 'utf8');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });

  it('fsrsWrapper.js exports scheduleFsrsReview as the only production .next() call site', () => {
    const source = fs.readFileSync('src/quiz/fsrsWrapper.js', 'utf8');
    expect(source).toContain('export function scheduleFsrsReview');
    const matches = source.match(/\.next\s*\(/g) ?? [];
    expect(matches.length).toBe(2);
  });
});

// ─── Test 13: no StudyRoom/Dashboard changes ──────────────────────────────────

describe('Test 13: no StudyRoom/Dashboard changes in Phase 15E', () => {
  it('StudyRoom.jsx preserves Phase 14N invariants and does not call .next()', () => {
    const source = fs.readFileSync('src/routes/StudyRoom.jsx', 'utf8');
    expect(source).toContain('shouldShowFsrsTwoStepBridge');
    expect(source).toContain('appendFsrsReviewLog');
    expect(source).toContain('FsrsProductionMemoryRatingBridge');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });

  it('Dashboard.jsx preserves Phase 15C computeMixedSchedulerDueSummary and does not expose active flag', () => {
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

describe('Test 14: no package/dependency changes in Phase 15E', () => {
  it('package.json ts-fsrs remains pinned at 5.3.3', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    expect(pkg.dependencies?.['ts-fsrs']).toBe('5.3.3');
  });

  it('package.json does not reference native binding', () => {
    const pkgText = fs.readFileSync('package.json', 'utf8');
    expect(pkgText).not.toContain('@open-spaced-repetition/' + 'binding');
  });

  it('package.json does not reference internal registry terms', () => {
    const pkgText = fs.readFileSync('package.json', 'utf8');
    expect(pkgText).not.toContain('applied-caas');
    expect(pkgText).not.toContain('artifactory');
    expect(pkgText).not.toContain('internal.api.openai');
    expect(pkgText).not.toContain('packages.applied');
  });
});
