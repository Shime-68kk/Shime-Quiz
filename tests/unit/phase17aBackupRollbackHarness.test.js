import { describe, expect, it, afterEach } from 'vitest';
import {
  checkStorageHeadroomForBytes
} from '../../src/utils/storageQuotaEstimate.js';

// --- checkStorageHeadroomForBytes ---

describe('checkStorageHeadroomForBytes - backup readiness headroom helper', () => {
  afterEach(() => {
    delete globalThis.navigator;
  });

  it('returns ok when navigator.storage.estimate is unavailable', async () => {
    globalThis.navigator = {};
    const result = await checkStorageHeadroomForBytes(1024);
    expect(result.ok).toBe(true);
    expect(result.estimated).toBe(false);
    expect(result.reason).toBe('api_unavailable');
  });

  it('returns ok when navigator is undefined', async () => {
    delete globalThis.navigator;
    const result = await checkStorageHeadroomForBytes(1024);
    expect(result.ok).toBe(true);
    expect(result.estimated).toBe(false);
  });

  it('returns ok with estimated=true when sufficient headroom exists', async () => {
    globalThis.navigator = {
      storage: { estimate: async () => ({ usage: 10_000, quota: 100_000 }) }
    };
    const result = await checkStorageHeadroomForBytes(5_000);
    expect(result.ok).toBe(true);
    expect(result.estimated).toBe(true);
    expect(result.available).toBe(90_000);
    expect(result.neededBytes).toBe(5_000);
  });

  it('returns ok=false when insufficient headroom', async () => {
    globalThis.navigator = {
      storage: { estimate: async () => ({ usage: 95_000, quota: 100_000 }) }
    };
    const result = await checkStorageHeadroomForBytes(10_000);
    expect(result.ok).toBe(false);
    expect(result.estimated).toBe(true);
    expect(result.reason).toBe('insufficient_space');
    expect(result.available).toBe(5_000);
  });

  it('returns ok when neededBytes is exactly equal to available space', async () => {
    globalThis.navigator = {
      storage: { estimate: async () => ({ usage: 50_000, quota: 100_000 }) }
    };
    const result = await checkStorageHeadroomForBytes(50_000);
    expect(result.ok).toBe(true);
    expect(result.estimated).toBe(true);
  });

  it('handles invalid neededBytes input gracefully', async () => {
    const cases = [NaN, -1, Infinity, null, undefined, 'lots'];
    for (const input of cases) {
      const result = await checkStorageHeadroomForBytes(input);
      expect(result.ok).toBe(true);
      expect(result.estimated).toBe(false);
      expect(result.reason).toBe('invalid_input');
    }
  });

  it('returns ok when estimate API throws', async () => {
    globalThis.navigator = {
      storage: { estimate: async () => { throw new Error('quota unavailable'); } }
    };
    const result = await checkStorageHeadroomForBytes(1024);
    expect(result.ok).toBe(true);
    expect(result.estimated).toBe(false);
    expect(result.reason).toBe('estimate_failed');
  });

  it('returns ok when estimate returns invalid values', async () => {
    globalThis.navigator = {
      storage: { estimate: async () => ({ usage: 0, quota: 0 }) }
    };
    const result = await checkStorageHeadroomForBytes(1024);
    expect(result.ok).toBe(true);
    expect(result.estimated).toBe(false);
    expect(result.reason).toBe('invalid_estimate');
  });
});

// --- v2BackupRestore helpers ---

// Setup minimal browser globals for v2BackupRestore imports
const storageData = new Map();

const localStorageMock = {
  getItem(key) { return storageData.has(String(key)) ? storageData.get(String(key)) : null; },
  setItem(key, value) { storageData.set(String(key), String(value)); },
  removeItem(key) { storageData.delete(String(key)); },
  clear() { storageData.clear(); }
};

class MockBroadcastChannel {
  constructor() { this.listeners = new Set(); }
  addEventListener() {}
  removeEventListener() {}
  postMessage() {}
  close() { this.listeners.clear(); }
}

globalThis.window = {
  BroadcastChannel: MockBroadcastChannel,
  localStorage: localStorageMock,
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() { return true; },
  URL: { createObjectURL() { return 'blob:mock'; }, revokeObjectURL() {} },
  document: {
    createElement() {
      return { click() {}, remove() {}, set href(v) { this._href = v; }, set download(v) { this._download = v; } };
    },
    body: { appendChild() {} }
  }
};
globalThis.document = window.document;
globalThis.Blob = globalThis.Blob || class Blob {
  constructor(parts = []) { this.size = parts.reduce((s, p) => s + String(p).length, 0); }
};
globalThis.CustomEvent = class CustomEvent extends Event {
  constructor(type, init = {}) { super(type); this.detail = init.detail; }
};

const {
  estimateV2BackupReadiness,
  captureRestoreSnapshot,
  estimateV2BackupPayloadSize,
  V2_BACKUP_SCHEMA_VERSION,
  V2_BACKUP_MODES
} = await import('../../src/state/v2BackupRestore.js');

const mockLearningData = (await import('../../src/data/mockLearningData.js')).default;

describe('estimateV2BackupReadiness - backup readiness helper', () => {
  it('returns estimated byte count for a valid payload', () => {
    const payload = {
      schemaVersion: V2_BACKUP_SCHEMA_VERSION,
      backupMode: V2_BACKUP_MODES.FULL,
      data: {
        library: { schemaVersion: 'v2-library-data-v1', data: mockLearningData },
        studyHistory: { schemaVersion: 'shime-v2-study-history-v1', updatedAt: '', records: [] }
      }
    };
    const result = estimateV2BackupReadiness(payload);
    expect(result.ok).toBe(true);
    expect(typeof result.estimatedBytes).toBe('number');
    expect(result.estimatedBytes).toBeGreaterThan(0);
    expect(result.sections).toBeDefined();
  });

  it('returns error for invalid payload input (missing storage estimate does not crash)', () => {
    const result = estimateV2BackupReadiness(null);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('invalid_payload');
    expect(result.estimatedBytes).toBe(0);
  });

  it('returns error for non-object payload', () => {
    expect(estimateV2BackupReadiness('bad')).toMatchObject({ ok: false, error: 'invalid_payload' });
    expect(estimateV2BackupReadiness(42)).toMatchObject({ ok: false, error: 'invalid_payload' });
    expect(estimateV2BackupReadiness(undefined)).toMatchObject({ ok: false, error: 'invalid_payload' });
  });

  it('returns zero-byte estimate for empty data without crashing', () => {
    const result = estimateV2BackupReadiness({ schemaVersion: V2_BACKUP_SCHEMA_VERSION, data: {} });
    expect(result.ok).toBe(true);
    expect(result.estimatedBytes).toBeGreaterThan(0); // JSON overhead
  });
});

describe('captureRestoreSnapshot - restore snapshot helper', () => {
  it('captures current storage values for each write target key', () => {
    storageData.clear();
    storageData.set('key-a', 'value-a');
    storageData.set('key-b', 'value-b');

    const writes = [
      { key: 'key-a', value: 'new-a', section: 'a' },
      { key: 'key-b', value: 'new-b', section: 'b' }
    ];
    const snapshot = captureRestoreSnapshot(localStorageMock, writes);

    expect(snapshot.get('key-a')).toBe('value-a');
    expect(snapshot.get('key-b')).toBe('value-b');
    expect(snapshot.size).toBe(2);
  });

  it('captures null for keys not yet in storage', () => {
    storageData.clear();
    const writes = [{ key: 'missing-key', value: 'something', section: 'x' }];
    const snapshot = captureRestoreSnapshot(localStorageMock, writes);
    expect(snapshot.get('missing-key')).toBeNull();
  });

  it('snapshot is independent of later storage mutations', () => {
    storageData.clear();
    storageData.set('snap-key', 'original');
    const writes = [{ key: 'snap-key', value: 'new', section: 'test' }];
    const snapshot = captureRestoreSnapshot(localStorageMock, writes);
    storageData.set('snap-key', 'mutated-after-snapshot');
    expect(snapshot.get('snap-key')).toBe('original');
  });
});

describe('restore read-after-write verification', () => {
  it('result includes verificationMismatches array on successful restore', async () => {
    const {
      createV2BackupPayload,
      restoreV2BackupPayload
    } = await import('../../src/state/v2BackupRestore.js');

    storageData.clear();
    const backup = createV2BackupPayload({
      libraryData: mockLearningData,
      librarySource: { sourceType: 'mock', sourceName: 'Mock' },
      mode: V2_BACKUP_MODES.FULL
    });
    expect(backup.ok).toBe(true);

    storageData.clear();
    const result = restoreV2BackupPayload(backup.payload);
    expect(result.ok).toBe(true);
    expect(Array.isArray(result.verificationMismatches)).toBe(true);
    expect(result.verificationMismatches).toHaveLength(0);
  });

  it('existing backup/restore happy path still works', async () => {
    const {
      createV2BackupPayload,
      restoreV2BackupPayload,
      parseV2BackupJson
    } = await import('../../src/state/v2BackupRestore.js');

    storageData.clear();
    const backup = createV2BackupPayload({
      libraryData: mockLearningData,
      librarySource: { sourceType: 'mock', sourceName: 'Mock' },
      mode: V2_BACKUP_MODES.FULL
    });
    expect(backup.ok).toBe(true);
    expect(backup.payload.schemaVersion).toBe(V2_BACKUP_SCHEMA_VERSION);

    const parsed = parseV2BackupJson(JSON.stringify(backup.payload));
    expect(parsed.ok).toBe(true);
    expect(parsed.validation.restoreSupported).toBe(true);

    storageData.clear();
    const restored = restoreV2BackupPayload(backup.payload);
    expect(restored.ok).toBe(true);
    expect(restored.writtenSections.length).toBeGreaterThan(0);
  });

  it('quota/preflight failure returns recoverable state with rollback', async () => {
    const {
      createV2BackupPayload,
      restoreV2BackupPayload
    } = await import('../../src/state/v2BackupRestore.js');

    storageData.clear();
    const backup = createV2BackupPayload({
      libraryData: mockLearningData,
      mode: V2_BACKUP_MODES.FULL
    });
    expect(backup.ok).toBe(true);

    // Seed existing data so rollback has something to preserve
    storageData.set('__existing__', 'preserved-value');

    // Intercept setItem for the probe key only
    const origSetItem = localStorageMock.setItem;
    localStorageMock.setItem = function(key, value) {
      if (key === '__shime_v2_restore_probe__') throw new Error('simulated quota exceeded');
      origSetItem.call(this, key, value);
    };

    const result = restoreV2BackupPayload(backup.payload);
    localStorageMock.setItem = origSetItem;

    expect(result.ok).toBe(false);
    expect(result.error).toBe('storage_preflight_failed');
    // Existing data must be untouched (rollback / no-write guarantee)
    expect(storageData.get('__existing__')).toBe('preserved-value');
  });

  it('restore snapshot/rollback preserves old state on simulated mid-write failure', async () => {
    const {
      createV2BackupPayload,
      restoreV2BackupPayload
    } = await import('../../src/state/v2BackupRestore.js');

    const {
      STUDY_HISTORY_STORAGE_KEY,
      STUDY_HISTORY_SCHEMA_VERSION
    } = await import('../../src/state/studyHistoryStorage.js');

    storageData.clear();
    storageData.set(STUDY_HISTORY_STORAGE_KEY, JSON.stringify({
      schemaVersion: STUDY_HISTORY_SCHEMA_VERSION,
      updatedAt: '2026-01-01T00:00:00.000Z',
      records: [{ id: 'old-record' }]
    }));

    const backup = createV2BackupPayload({
      libraryData: mockLearningData,
      mode: V2_BACKUP_MODES.FULL
    });
    expect(backup.ok).toBe(true);

    const originalHistory = storageData.get(STUDY_HISTORY_STORAGE_KEY);

    let writeCount = 0;
    const origSetItem = localStorageMock.setItem;
    localStorageMock.setItem = function(key, value) {
      if (key === '__shime_v2_restore_probe__') { return origSetItem.call(this, key, value); }
      writeCount++;
      if (writeCount === 3) throw new Error('simulated mid-write failure');
      origSetItem.call(this, key, value);
    };

    const result = restoreV2BackupPayload(backup.payload);
    localStorageMock.setItem = origSetItem;

    expect(result.ok).toBe(false);
    expect(result.error).toBe('restore_write_failed');
    expect(result.rollbackOk).toBe(true);
    // The old study history should be restored by rollback
    expect(storageData.get(STUDY_HISTORY_STORAGE_KEY)).toBe(originalHistory);
  });
});
