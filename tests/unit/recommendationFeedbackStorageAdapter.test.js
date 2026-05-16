import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { StorageAdapter } from '../../src/storage/StorageAdapter.js';
import {
  setStorageAdapterForTests,
  resetStorageAdapterForTests
} from '../../src/storage/storageAdapterRegistry.js';
import {
  RECOMMENDATION_FEEDBACK_STORAGE_KEY,
  RECOMMENDATION_FEEDBACK_SCHEMA_VERSION,
  RECOMMENDATION_FEEDBACK_TYPES,
  readRecommendationFeedback,
  saveRecommendationFeedback,
  clearRecommendationFeedback,
  summarizeRecommendationFeedback,
  getTodayDateKey
} from '../../src/state/recommendationFeedbackStorage.js';

// ── In-memory adapter for tests ───────────────────────────────────────────────

class MemoryAdapter extends StorageAdapter {
  constructor(initialData = {}) {
    super();
    this._store = new Map(Object.entries(initialData));
    this._available = true;
  }

  hasStorageSupport() { return this._available; }

  readRaw(key) {
    if (!this._available) return null;
    return this._store.has(key) ? this._store.get(key) : null;
  }

  writeRaw(key, value) {
    if (!this._available) return { ok: false, error: 'storage_unavailable' };
    this._store.set(key, value);
    return { ok: true };
  }

  removeRaw(key) {
    if (!this._available) return { ok: false, error: 'storage_unavailable' };
    this._store.delete(key);
    return { ok: true };
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

let adapter;

function validEnvelope(overrides = {}) {
  return {
    schemaVersion: RECOMMENDATION_FEEDBACK_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    records: [],
    ...overrides
  };
}

function validRecord(overrides = {}) {
  return {
    id: 'rec-1',
    recommendationType: 'daily_review',
    feedback: RECOMMENDATION_FEEDBACK_TYPES.HELPFUL,
    createdAt: new Date().toISOString(),
    dateKey: getTodayDateKey(),
    reasonCode: '',
    ...overrides
  };
}

let _prevCustomEvent;
let _prevWindow;

beforeEach(() => {
  adapter = new MemoryAdapter();
  setStorageAdapterForTests(adapter);

  _prevWindow = globalThis.window;
  _prevCustomEvent = globalThis.CustomEvent;

  globalThis.window = { dispatchEvent: vi.fn(), BroadcastChannel: undefined };
  Object.defineProperty(globalThis, 'CustomEvent', {
    configurable: true,
    value: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
  });
});

afterEach(() => {
  resetStorageAdapterForTests();
  if (_prevWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = _prevWindow;
  }
  if (_prevCustomEvent === undefined) {
    delete globalThis.CustomEvent;
  } else {
    Object.defineProperty(globalThis, 'CustomEvent', { configurable: true, value: _prevCustomEvent });
  }
});

// ── readRecommendationFeedback ────────────────────────────────────────────────

describe('readRecommendationFeedback via adapter', () => {
  it('returns ok:true with empty records when storage key is absent', () => {
    const result = readRecommendationFeedback();
    expect(result.ok).toBe(true);
    expect(result.records).toEqual([]);
  });

  it('reads and returns valid envelope records', () => {
    const record = validRecord();
    const envelope = validEnvelope({ records: [record] });
    adapter.writeRaw(RECOMMENDATION_FEEDBACK_STORAGE_KEY, JSON.stringify(envelope));

    const result = readRecommendationFeedback();
    expect(result.ok).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records[0].recommendationType).toBe('daily_review');
  });

  it('uses the same storage key as before migration', () => {
    expect(RECOMMENDATION_FEEDBACK_STORAGE_KEY).toBe('shimeV2RecommendationFeedbackV1');
  });

  it('returns ok:false and discards on wrong schemaVersion', () => {
    const bad = { schemaVersion: 'wrong', records: [] };
    adapter.writeRaw(RECOMMENDATION_FEEDBACK_STORAGE_KEY, JSON.stringify(bad));

    const result = readRecommendationFeedback();
    expect(result.ok).toBe(false);
    expect(result.discarded).toBe(true);
    expect(adapter.readRaw(RECOMMENDATION_FEEDBACK_STORAGE_KEY)).toBeNull();
  });

  it('returns ok:false and discards when records is not an array', () => {
    const bad = { schemaVersion: RECOMMENDATION_FEEDBACK_SCHEMA_VERSION, records: 'nope' };
    adapter.writeRaw(RECOMMENDATION_FEEDBACK_STORAGE_KEY, JSON.stringify(bad));

    const result = readRecommendationFeedback();
    expect(result.ok).toBe(false);
    expect(result.discarded).toBe(true);
  });

  it('returns ok:false and clears on corrupted/invalid JSON', () => {
    adapter.writeRaw(RECOMMENDATION_FEEDBACK_STORAGE_KEY, '{{not valid json');

    const result = readRecommendationFeedback();
    expect(result.ok).toBe(false);
    expect(result.error).toBe('feedback_parse_failed');
    expect(adapter.readRaw(RECOMMENDATION_FEEDBACK_STORAGE_KEY)).toBeNull();
  });

  it('returns storage_unavailable when adapter has no support', () => {
    adapter._available = false;
    const result = readRecommendationFeedback();
    expect(result.ok).toBe(false);
    expect(result.error).toBe('storage_unavailable');
  });
});

// ── saveRecommendationFeedback ────────────────────────────────────────────────

describe('saveRecommendationFeedback via adapter', () => {
  it('saves a valid feedback record and returns ok:true', () => {
    const result = saveRecommendationFeedback({
      recommendationType: 'daily_review',
      feedback: RECOMMENDATION_FEEDBACK_TYPES.HELPFUL
    });
    expect(result.ok).toBe(true);
    expect(result.saved).toBe(true);
    expect(result.record.recommendationType).toBe('daily_review');
  });

  it('persists to the same storage key', () => {
    saveRecommendationFeedback({
      recommendationType: 'weekly_summary',
      feedback: RECOMMENDATION_FEEDBACK_TYPES.NOT_RELEVANT
    });
    const raw = adapter.readRaw(RECOMMENDATION_FEEDBACK_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw);
    expect(parsed.schemaVersion).toBe(RECOMMENDATION_FEEDBACK_SCHEMA_VERSION);
    expect(parsed.records).toHaveLength(1);
    expect(parsed.records[0].recommendationType).toBe('weekly_summary');
  });

  it('returns ok:false for invalid feedback type', () => {
    const result = saveRecommendationFeedback({
      recommendationType: 'daily_review',
      feedback: 'invalid_type'
    });
    expect(result.ok).toBe(false);
    expect(result.saved).toBe(false);
  });

  it('returns ok:false for missing recommendationType', () => {
    const result = saveRecommendationFeedback({ feedback: RECOMMENDATION_FEEDBACK_TYPES.HELPFUL });
    expect(result.ok).toBe(false);
  });

  it('merges with existing records on successive saves', () => {
    saveRecommendationFeedback({ recommendationType: 'type_a', feedback: RECOMMENDATION_FEEDBACK_TYPES.HELPFUL });
    saveRecommendationFeedback({ recommendationType: 'type_b', feedback: RECOMMENDATION_FEEDBACK_TYPES.NOT_RELEVANT });

    const result = readRecommendationFeedback();
    expect(result.records.length).toBeGreaterThanOrEqual(2);
  });

  it('returns storage_unavailable when adapter has no support', () => {
    adapter._available = false;
    const result = saveRecommendationFeedback({
      recommendationType: 'type_a',
      feedback: RECOMMENDATION_FEEDBACK_TYPES.HELPFUL
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('storage_unavailable');
  });
});

// ── clearRecommendationFeedback ───────────────────────────────────────────────

describe('clearRecommendationFeedback via adapter', () => {
  it('removes the storage key and returns ok:true', () => {
    const envelope = validEnvelope({ records: [validRecord()] });
    adapter.writeRaw(RECOMMENDATION_FEEDBACK_STORAGE_KEY, JSON.stringify(envelope));

    const result = clearRecommendationFeedback();
    expect(result.ok).toBe(true);
    expect(result.records).toEqual([]);
    expect(adapter.readRaw(RECOMMENDATION_FEEDBACK_STORAGE_KEY)).toBeNull();
  });

  it('returns storage_unavailable when adapter has no support', () => {
    adapter._available = false;
    const result = clearRecommendationFeedback();
    expect(result.ok).toBe(false);
    expect(result.error).toBe('storage_unavailable');
  });
});

// ── summarizeRecommendationFeedback (pure logic, adapter-independent) ─────────

describe('summarizeRecommendationFeedback', () => {
  it('returns zero counts for empty records', () => {
    const summary = summarizeRecommendationFeedback([]);
    expect(summary.recordCount).toBe(0);
    expect(summary.byType.size).toBe(0);
  });

  it('counts helpful and notRelevant correctly', () => {
    const records = [
      validRecord({ recommendationType: 'daily_review', feedback: RECOMMENDATION_FEEDBACK_TYPES.HELPFUL }),
      validRecord({ id: 'r2', recommendationType: 'daily_review', feedback: RECOMMENDATION_FEEDBACK_TYPES.NOT_RELEVANT })
    ];
    const summary = summarizeRecommendationFeedback(records);
    const stats = summary.byType.get('daily_review');
    expect(stats.helpful).toBe(1);
    expect(stats.notRelevant).toBe(1);
    expect(stats.total).toBe(2);
  });

  it('identifies hiddenTodayTypes for current dateKey', () => {
    const todayKey = getTodayDateKey();
    const records = [
      validRecord({ id: 'h1', feedback: RECOMMENDATION_FEEDBACK_TYPES.HIDDEN_TODAY, dateKey: todayKey })
    ];
    const summary = summarizeRecommendationFeedback(records, todayKey);
    expect(summary.hiddenTodayTypes.has('daily_review')).toBe(true);
  });

  it('ignores invalid/null records gracefully', () => {
    const summary = summarizeRecommendationFeedback([null, undefined, {}, 'bad']);
    expect(summary.recordCount).toBe(0);
  });
});
