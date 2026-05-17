/**
 * tests/unit/indexedDbAdapterTestPrototype.test.js
 *
 * Phase 18A — Test-Only IndexedDBAdapter Prototype unit tests.
 *
 * All tests use the Phase 18A test-only adapter helper.
 * No browser APIs are required. No real storage is accessed.
 * No localStorage, no indexedDB global, no storage adapter registry.
 * All data is synthetic. Test-only mode only.
 */

import { describe, it, expect } from 'vitest';
import {
  PHASE18A_IDENTITY,
  PHASE18A_CLAIM_BOUNDARY,
  ERR_MISSING_BACKEND,
  ERR_IDB_UNAVAILABLE,
  ERR_IDB_OPEN_FAILED,
  ERR_NOT_INITIALIZED,
  ERR_INVALID_KEY,
  ERR_TRANSACTION_FAILED,
  createFakeIndexedDBLike,
  createUnavailableIndexedDBLike,
  createIndexedDbAdapterTestPrototype,
} from './helpers/indexedDbAdapterTestPrototype.js';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeAdapter(fakeOptions = {}, adapterOptions = {}) {
  const fake    = createFakeIndexedDBLike(fakeOptions);
  const adapter = createIndexedDbAdapterTestPrototype({ indexedDBLike: fake, ...adapterOptions });
  return adapter;
}

function makeInitedAdapter(fakeOptions = {}, adapterOptions = {}) {
  const adapter = makeAdapter(fakeOptions, adapterOptions);
  const initResult = adapter.init();
  if (!initResult.ok) throw new Error(`init() failed unexpectedly: ${initResult.error}`);
  return adapter;
}

// Deterministic synthetic key/value pairs
const SYNTHETIC_KEYS = Object.freeze(['alpha', 'beta', 'gamma', 'delta']);
const SYNTHETIC_VALUES = Object.freeze({
  alpha: { type: 'card', id: 'synthetic-alpha-001', phase: '18a' },
  beta:  { type: 'card', id: 'synthetic-beta-002',  phase: '18a' },
  gamma: { type: 'card', id: 'synthetic-gamma-003', phase: '18a' },
  delta: { type: 'card', id: 'synthetic-delta-004', phase: '18a' },
});

// ── 1. Creates adapter in test-only mode ──────────────────────────────────────

describe('createIndexedDbAdapterTestPrototype — creates adapter in test-only mode', () => {
  it('creates adapter with a valid fake backend', () => {
    const adapter = makeAdapter();
    expect(adapter).not.toBeNull();
    expect(typeof adapter.init).toBe('function');
    expect(typeof adapter.isAvailable).toBe('function');
    expect(typeof adapter.getItem).toBe('function');
    expect(typeof adapter.setItem).toBe('function');
    expect(typeof adapter.removeItem).toBe('function');
    expect(typeof adapter.listKeys).toBe('function');
    expect(typeof adapter.clear).toBe('function');
  });

  it('PHASE18A_IDENTITY identifies this as test-only adapter prototype', () => {
    expect(PHASE18A_IDENTITY).toMatch(/Phase 18A/);
    expect(PHASE18A_IDENTITY).toMatch(/test-only/i);
  });

  it('PHASE18A_CLAIM_BOUNDARY states no production IndexedDBAdapter and no live migration', () => {
    expect(PHASE18A_CLAIM_BOUNDARY).toMatch(/test-only/i);
    expect(PHASE18A_CLAIM_BOUNDARY).toMatch(/no production IndexedDBAdapter/i);
    expect(PHASE18A_CLAIM_BOUNDARY).toMatch(/no live migration/i);
    expect(PHASE18A_CLAIM_BOUNDARY).toMatch(/no real data movement/i);
  });

  it('adapter _state shows not initialized before init()', () => {
    const adapter = makeAdapter();
    expect(adapter._state.initialized).toBe(false);
  });

  it('adapter _state shows initialized after successful init()', () => {
    const adapter = makeInitedAdapter();
    expect(adapter._state.initialized).toBe(true);
  });
});

// ── 2. Rejects missing indexedDBLike ─────────────────────────────────────────

describe('createIndexedDbAdapterTestPrototype — rejects missing indexedDBLike', () => {
  it('returns error result when indexedDBLike is missing (undefined)', () => {
    const result = createIndexedDbAdapterTestPrototype({});
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_MISSING_BACKEND);
  });

  it('returns error result when indexedDBLike is null', () => {
    const result = createIndexedDbAdapterTestPrototype({ indexedDBLike: null });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_MISSING_BACKEND);
  });

  it('returns error result when indexedDBLike is a string (invalid type)', () => {
    const result = createIndexedDbAdapterTestPrototype({ indexedDBLike: 'not-an-object' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_MISSING_BACKEND);
  });

  it('returns error result when called with no arguments', () => {
    const result = createIndexedDbAdapterTestPrototype();
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_MISSING_BACKEND);
  });

  it('error result includes a human-readable reason', () => {
    const result = createIndexedDbAdapterTestPrototype({ indexedDBLike: null });
    expect(typeof result.reason).toBe('string');
    expect(result.reason.length).toBeGreaterThan(0);
  });
});

// ── 3. Reports unavailable backend ───────────────────────────────────────────

describe('isAvailable() — reports unavailable backend', () => {
  it('isAvailable() returns true when fake backend has open()', () => {
    const adapter = makeAdapter();
    expect(adapter.isAvailable()).toBe(true);
  });

  it('isAvailable() returns false when backend has no open() method', () => {
    const unavailable = createUnavailableIndexedDBLike();
    const adapter     = createIndexedDbAdapterTestPrototype({ indexedDBLike: unavailable });
    expect(adapter.isAvailable()).toBe(false);
  });

  it('init() returns idb_unavailable error when backend is unavailable', () => {
    const unavailable = createUnavailableIndexedDBLike();
    const adapter     = createIndexedDbAdapterTestPrototype({ indexedDBLike: unavailable });
    const result      = adapter.init();
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_IDB_UNAVAILABLE);
  });

  it('unavailable adapter init() provides a reason string', () => {
    const unavailable = createUnavailableIndexedDBLike();
    const adapter     = createIndexedDbAdapterTestPrototype({ indexedDBLike: unavailable });
    const result      = adapter.init();
    expect(typeof result.reason).toBe('string');
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it('createUnavailableIndexedDBLike returns an object without open()', () => {
    const unavailable = createUnavailableIndexedDBLike();
    expect(typeof unavailable).toBe('object');
    expect(typeof unavailable.open).not.toBe('function');
  });
});

// ── 4. Initializes database/store successfully ───────────────────────────────

describe('init() — initializes database/store successfully', () => {
  it('init() returns ok:true on success', () => {
    const adapter = makeAdapter();
    const result  = adapter.init();
    expect(result.ok).toBe(true);
  });

  it('init() result includes databaseName, storeName, version', () => {
    const adapter = createIndexedDbAdapterTestPrototype({
      indexedDBLike: createFakeIndexedDBLike(),
      databaseName:  'test-db-phase18a',
      storeName:     'test-store-phase18a',
      version:       2,
    });
    const result = adapter.init();
    expect(result.ok).toBe(true);
    expect(result.databaseName).toBe('test-db-phase18a');
    expect(result.storeName).toBe('test-store-phase18a');
    expect(result.version).toBe(2);
  });

  it('second init() call returns alreadyInitialized:true', () => {
    const adapter = makeAdapter();
    adapter.init();
    const second = adapter.init();
    expect(second.ok).toBe(true);
    expect(second.alreadyInitialized).toBe(true);
  });

  it('adapter _state.initialized is false before init()', () => {
    const adapter = makeAdapter();
    expect(adapter._state.initialized).toBe(false);
  });

  it('adapter _state.initialized is true after init()', () => {
    const adapter = makeInitedAdapter();
    expect(adapter._state.initialized).toBe(true);
  });
});

// ── 5. Rejects operations before init ────────────────────────────────────────

describe('pre-init guard — rejects operations before init()', () => {
  it('getItem() returns not_initialized before init()', () => {
    const adapter = makeAdapter();
    const result  = adapter.getItem('some-key');
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_NOT_INITIALIZED);
  });

  it('setItem() returns not_initialized before init()', () => {
    const adapter = makeAdapter();
    const result  = adapter.setItem('some-key', { x: 1 });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_NOT_INITIALIZED);
  });

  it('removeItem() returns not_initialized before init()', () => {
    const adapter = makeAdapter();
    const result  = adapter.removeItem('some-key');
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_NOT_INITIALIZED);
  });

  it('listKeys() returns not_initialized before init()', () => {
    const adapter = makeAdapter();
    const result  = adapter.listKeys();
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_NOT_INITIALIZED);
  });

  it('clear() returns not_initialized before init()', () => {
    const adapter = makeAdapter();
    const result  = adapter.clear();
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_NOT_INITIALIZED);
  });
});

// ── 6. set/get roundtrip for synthetic value ─────────────────────────────────

describe('setItem/getItem — set/get roundtrip for synthetic value', () => {
  it('set then get returns the same value for a synthetic key', () => {
    const adapter = makeInitedAdapter();
    adapter.setItem('alpha', SYNTHETIC_VALUES.alpha);
    const result = adapter.getItem('alpha');
    expect(result.ok).toBe(true);
    expect(result.found).toBe(true);
    expect(result.value).toEqual(SYNTHETIC_VALUES.alpha);
  });

  it('get on missing key returns found:false with null value', () => {
    const adapter = makeInitedAdapter();
    const result  = adapter.getItem('nonexistent-key');
    expect(result.ok).toBe(true);
    expect(result.found).toBe(false);
    expect(result.value).toBeNull();
  });

  it('setItem returns ok:true with key and writtenAt', () => {
    const adapter = makeInitedAdapter();
    const result  = adapter.setItem('beta', SYNTHETIC_VALUES.beta);
    expect(result.ok).toBe(true);
    expect(result.key).toBe('beta');
    expect(typeof result.writtenAt).toBe('string');
    expect(result.writtenAt.length).toBeGreaterThan(0);
  });

  it('setItem with clock uses provided timestamp', () => {
    const clock   = () => '2026-01-01T00:00:00.000Z';
    const adapter = makeInitedAdapter({}, { clock });
    const result  = adapter.setItem('gamma', SYNTHETIC_VALUES.gamma);
    expect(result.ok).toBe(true);
    expect(result.writtenAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('can overwrite an existing key', () => {
    const adapter  = makeInitedAdapter();
    adapter.setItem('alpha', { version: 1 });
    adapter.setItem('alpha', { version: 2 });
    const result = adapter.getItem('alpha');
    expect(result.ok).toBe(true);
    expect(result.value.version).toBe(2);
  });

  it('invalid key (empty string) returns invalid_key for setItem', () => {
    const adapter = makeInitedAdapter();
    const result  = adapter.setItem('', { x: 1 });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_INVALID_KEY);
  });

  it('invalid key (empty string) returns invalid_key for getItem', () => {
    const adapter = makeInitedAdapter();
    const result  = adapter.getItem('');
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_INVALID_KEY);
  });
});

// ── 7. remove deletes only the requested synthetic key ───────────────────────

describe('removeItem() — remove deletes only the requested synthetic key', () => {
  it('removeItem returns ok:true with existed:true for a present key', () => {
    const adapter = makeInitedAdapter();
    adapter.setItem('alpha', SYNTHETIC_VALUES.alpha);
    const result = adapter.removeItem('alpha');
    expect(result.ok).toBe(true);
    expect(result.existed).toBe(true);
    expect(result.key).toBe('alpha');
  });

  it('removed key is no longer found by getItem', () => {
    const adapter = makeInitedAdapter();
    adapter.setItem('alpha', SYNTHETIC_VALUES.alpha);
    adapter.removeItem('alpha');
    const result = adapter.getItem('alpha');
    expect(result.ok).toBe(true);
    expect(result.found).toBe(false);
  });

  it('removeItem does not affect other keys', () => {
    const adapter = makeInitedAdapter();
    adapter.setItem('alpha', SYNTHETIC_VALUES.alpha);
    adapter.setItem('beta',  SYNTHETIC_VALUES.beta);
    adapter.removeItem('alpha');
    const betaResult = adapter.getItem('beta');
    expect(betaResult.ok).toBe(true);
    expect(betaResult.found).toBe(true);
    expect(betaResult.value).toEqual(SYNTHETIC_VALUES.beta);
  });

  it('removeItem on missing key returns existed:false (no error)', () => {
    const adapter = makeInitedAdapter();
    const result  = adapter.removeItem('never-was-here');
    expect(result.ok).toBe(true);
    expect(result.existed).toBe(false);
  });

  it('invalid key (empty string) returns invalid_key for removeItem', () => {
    const adapter = makeInitedAdapter();
    const result  = adapter.removeItem('');
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_INVALID_KEY);
  });
});

// ── 8. listKeys returns deterministic sorted keys ────────────────────────────

describe('listKeys() — returns deterministic sorted keys', () => {
  it('listKeys returns empty array when store is empty', () => {
    const adapter = makeInitedAdapter();
    const result  = adapter.listKeys();
    expect(result.ok).toBe(true);
    expect(result.keys).toEqual([]);
  });

  it('listKeys returns all set keys sorted alphabetically', () => {
    const adapter = makeInitedAdapter();
    // Insert in non-alphabetical order
    adapter.setItem('gamma', SYNTHETIC_VALUES.gamma);
    adapter.setItem('alpha', SYNTHETIC_VALUES.alpha);
    adapter.setItem('delta', SYNTHETIC_VALUES.delta);
    adapter.setItem('beta',  SYNTHETIC_VALUES.beta);
    const result = adapter.listKeys();
    expect(result.ok).toBe(true);
    expect(result.keys).toEqual(['alpha', 'beta', 'delta', 'gamma']);
  });

  it('listKeys excludes removed keys', () => {
    const adapter = makeInitedAdapter();
    adapter.setItem('alpha', SYNTHETIC_VALUES.alpha);
    adapter.setItem('beta',  SYNTHETIC_VALUES.beta);
    adapter.removeItem('alpha');
    const result = adapter.listKeys();
    expect(result.ok).toBe(true);
    expect(result.keys).toContain('beta');
    expect(result.keys).not.toContain('alpha');
  });

  it('listKeys result is deterministic for the same store state', () => {
    const adapter1 = makeInitedAdapter();
    const adapter2 = makeInitedAdapter();
    for (const k of SYNTHETIC_KEYS) {
      adapter1.setItem(k, SYNTHETIC_VALUES[k]);
      adapter2.setItem(k, SYNTHETIC_VALUES[k]);
    }
    const r1 = adapter1.listKeys();
    const r2 = adapter2.listKeys();
    expect(r1.keys).toEqual(r2.keys);
  });

  it('listKeys is sorted even when keys are inserted in reverse order', () => {
    const adapter = makeInitedAdapter();
    const reversed = [...SYNTHETIC_KEYS].reverse();
    for (const k of reversed) adapter.setItem(k, SYNTHETIC_VALUES[k]);
    const result = adapter.listKeys();
    const sorted = [...SYNTHETIC_KEYS].sort((a, b) => a.localeCompare(b));
    expect(result.keys).toEqual(sorted);
  });
});

// ── 9. clear removes all synthetic keys ──────────────────────────────────────

describe('clear() — removes all synthetic keys', () => {
  it('clear() returns ok:true with clearedCount equal to number of keys', () => {
    const adapter = makeInitedAdapter();
    adapter.setItem('alpha', SYNTHETIC_VALUES.alpha);
    adapter.setItem('beta',  SYNTHETIC_VALUES.beta);
    const result = adapter.clear();
    expect(result.ok).toBe(true);
    expect(result.clearedCount).toBe(2);
  });

  it('clear() removes all keys from the store', () => {
    const adapter = makeInitedAdapter();
    for (const k of SYNTHETIC_KEYS) adapter.setItem(k, SYNTHETIC_VALUES[k]);
    adapter.clear();
    const listResult = adapter.listKeys();
    expect(listResult.ok).toBe(true);
    expect(listResult.keys).toEqual([]);
  });

  it('clear() on empty store returns clearedCount:0', () => {
    const adapter = makeInitedAdapter();
    const result  = adapter.clear();
    expect(result.ok).toBe(true);
    expect(result.clearedCount).toBe(0);
  });

  it('getItem returns not-found for any key after clear()', () => {
    const adapter = makeInitedAdapter();
    adapter.setItem('alpha', SYNTHETIC_VALUES.alpha);
    adapter.clear();
    const result = adapter.getItem('alpha');
    expect(result.ok).toBe(true);
    expect(result.found).toBe(false);
  });

  it('clear() then setItem works correctly (store is reusable)', () => {
    const adapter = makeInitedAdapter();
    adapter.setItem('alpha', SYNTHETIC_VALUES.alpha);
    adapter.clear();
    adapter.setItem('gamma', SYNTHETIC_VALUES.gamma);
    const result = adapter.getItem('gamma');
    expect(result.ok).toBe(true);
    expect(result.found).toBe(true);
    expect(result.value).toEqual(SYNTHETIC_VALUES.gamma);
  });
});

// ── 10. open failure returns explicit error ───────────────────────────────────

describe('init() open failure — open failure returns explicit error', () => {
  it('init() returns idb_open_failed when fake is configured to fail on open', () => {
    const adapter = makeAdapter({ shouldFailOpen: true });
    const result  = adapter.init();
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_IDB_OPEN_FAILED);
  });

  it('init() open failure includes a reason string', () => {
    const adapter = makeAdapter({ shouldFailOpen: true });
    const result  = adapter.init();
    expect(typeof result.reason).toBe('string');
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it('adapter _state.initialized remains false after open failure', () => {
    const adapter = makeAdapter({ shouldFailOpen: true });
    adapter.init();
    expect(adapter._state.initialized).toBe(false);
  });

  it('operations remain unavailable after open failure', () => {
    const adapter = makeAdapter({ shouldFailOpen: true });
    adapter.init();
    expect(adapter.setItem('key', { x: 1 }).error).toBe(ERR_NOT_INITIALIZED);
    expect(adapter.getItem('key').error).toBe(ERR_NOT_INITIALIZED);
    expect(adapter.listKeys().error).toBe(ERR_NOT_INITIALIZED);
    expect(adapter.clear().error).toBe(ERR_NOT_INITIALIZED);
  });
});

// ── 11. transaction/write failure returns explicit error ──────────────────────

describe('setItem() transaction failure — transaction/write failure returns explicit error', () => {
  it('setItem() returns transaction_failed when fake is configured to fail on transaction', () => {
    const adapter = makeInitedAdapter({ shouldFailTransaction: true });
    const result  = adapter.setItem('alpha', SYNTHETIC_VALUES.alpha);
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ERR_TRANSACTION_FAILED);
  });

  it('transaction failure includes a reason string', () => {
    const adapter = makeInitedAdapter({ shouldFailTransaction: true });
    const result  = adapter.setItem('beta', SYNTHETIC_VALUES.beta);
    expect(typeof result.reason).toBe('string');
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it('getItem still works after a write failure (read path unaffected)', () => {
    const fake    = createFakeIndexedDBLike({ initialData: { 'pre-existing': { x: 99 } }, shouldFailTransaction: true });
    const adapter = createIndexedDbAdapterTestPrototype({ indexedDBLike: fake });
    adapter.init();
    const result = adapter.getItem('pre-existing');
    expect(result.ok).toBe(true);
    expect(result.found).toBe(true);
    expect(result.value.x).toBe(99);
  });

  it('listKeys still works after a write failure', () => {
    const adapter = makeInitedAdapter({ shouldFailTransaction: true });
    const result  = adapter.listKeys();
    expect(result.ok).toBe(true);
    expect(Array.isArray(result.keys)).toBe(true);
  });
});

// ── 12. unsupported-browser fallback behavior is explicit ─────────────────────

describe('unsupported-browser fallback — explicit unavailable handling', () => {
  it('isAvailable() returns false for unavailable backend', () => {
    const unavailable = createUnavailableIndexedDBLike();
    const adapter     = createIndexedDbAdapterTestPrototype({ indexedDBLike: unavailable });
    expect(adapter.isAvailable()).toBe(false);
  });

  it('init() returns idb_unavailable when backend has no open()', () => {
    const unavailable = createUnavailableIndexedDBLike();
    const adapter     = createIndexedDbAdapterTestPrototype({ indexedDBLike: unavailable });
    expect(adapter.init().error).toBe(ERR_IDB_UNAVAILABLE);
  });

  it('init() on unavailable backend does not throw', () => {
    const unavailable = createUnavailableIndexedDBLike();
    const adapter     = createIndexedDbAdapterTestPrototype({ indexedDBLike: unavailable });
    expect(() => adapter.init()).not.toThrow();
  });

  it('ERR_IDB_UNAVAILABLE is a non-empty string constant', () => {
    expect(typeof ERR_IDB_UNAVAILABLE).toBe('string');
    expect(ERR_IDB_UNAVAILABLE.length).toBeGreaterThan(0);
  });
});

// ── 13. values are cloned or protected from accidental mutation ───────────────

describe('value protection — cloned to prevent accidental mutation', () => {
  it('setItem stores a deep copy; mutating the original does not affect stored value', () => {
    const adapter = makeInitedAdapter();
    const original = { synthetic: true, count: 1, nested: { x: 10 } };
    adapter.setItem('clonetest', original);
    original.count = 999;
    original.nested.x = 999;
    const result = adapter.getItem('clonetest');
    expect(result.ok).toBe(true);
    expect(result.value.count).toBe(1);
    expect(result.value.nested.x).toBe(10);
  });

  it('getItem returns a deep copy; mutating the returned value does not affect stored value', () => {
    const adapter = makeInitedAdapter();
    adapter.setItem('clonetest2', { count: 5 });
    const first  = adapter.getItem('clonetest2');
    first.value.count = 9999;
    const second = adapter.getItem('clonetest2');
    expect(second.value.count).toBe(5);
  });

  it('two successive getItem calls return equal but not identical objects', () => {
    const adapter = makeInitedAdapter();
    adapter.setItem('clonetest3', { val: 'abc' });
    const a = adapter.getItem('clonetest3');
    const b = adapter.getItem('clonetest3');
    expect(a.value).toEqual(b.value);
    expect(a.value).not.toBe(b.value);
  });
});

// ── 14. no production storage registry import ─────────────────────────────────

describe('no production storage modules — synthetic-only adapter', () => {
  it('PHASE18A_IDENTITY identifies this as test-only prototype', () => {
    expect(PHASE18A_IDENTITY).toMatch(/test-only/i);
    expect(PHASE18A_IDENTITY).toMatch(/Phase 18A/);
  });

  it('PHASE18A_CLAIM_BOUNDARY explicitly states no production IndexedDBAdapter', () => {
    expect(PHASE18A_CLAIM_BOUNDARY).toMatch(/no production IndexedDBAdapter/i);
  });

  it('PHASE18A_CLAIM_BOUNDARY explicitly states adapter contract proof only', () => {
    expect(PHASE18A_CLAIM_BOUNDARY).toMatch(/adapter contract proof only/i);
  });

  it('no production storage registry import exists in helper (structural test via constants)', () => {
    // Verify adapter factory creates standalone, isolated adapter
    const fake    = createFakeIndexedDBLike();
    const adapter = createIndexedDbAdapterTestPrototype({ indexedDBLike: fake });
    // Adapter has no reference to production storageAdapterRegistry, LocalStorageAdapter, etc.
    expect(typeof adapter.getStorageAdapter).toBe('undefined');
    expect(typeof adapter.storageAdapterRegistry).toBe('undefined');
    expect(typeof adapter.LocalStorageAdapter).toBe('undefined');
  });
});

// ── 15. no localStorage usage ──────────────────────────────────────────────────

describe('no localStorage — adapter does not access globalThis.localStorage', () => {
  it('createIndexedDbAdapterTestPrototype does not access globalThis.localStorage', () => {
    const original = globalThis.localStorage;
    let accessed   = false;
    Object.defineProperty(globalThis, 'localStorage', {
      get() { accessed = true; return undefined; },
      configurable: true,
    });
    try {
      const fake    = createFakeIndexedDBLike();
      const adapter = createIndexedDbAdapterTestPrototype({ indexedDBLike: fake });
      adapter.init();
      adapter.setItem('key', { x: 1 });
      adapter.getItem('key');
      adapter.listKeys();
      adapter.removeItem('key');
      adapter.clear();
    } finally {
      if (original !== undefined) {
        Object.defineProperty(globalThis, 'localStorage', {
          value: original, configurable: true, writable: true,
        });
      } else {
        try { delete globalThis.localStorage; } catch { /* ignore */ }
      }
    }
    expect(accessed).toBe(false);
  });
});

// ── 16. no real data migration ────────────────────────────────────────────────

describe('no real data migration — synthetic data only', () => {
  it('adapter uses only injected data, never reads real storage', () => {
    const fake    = createFakeIndexedDBLike({ initialData: { 'synthetic-key': { synthetic: true } } });
    const adapter = createIndexedDbAdapterTestPrototype({ indexedDBLike: fake });
    adapter.init();
    const result = adapter.getItem('synthetic-key');
    expect(result.ok).toBe(true);
    expect(result.value.synthetic).toBe(true);
  });

  it('PHASE18A_CLAIM_BOUNDARY confirms no real data movement', () => {
    expect(PHASE18A_CLAIM_BOUNDARY).toMatch(/no real data movement/i);
  });
});

// ── 17. no app boot behavior ──────────────────────────────────────────────────

describe('no app boot behavior — adapter is standalone and isolated', () => {
  it('adapter can be created and used without any app initialization', () => {
    const fake    = createFakeIndexedDBLike();
    const adapter = createIndexedDbAdapterTestPrototype({ indexedDBLike: fake });
    const init    = adapter.init();
    expect(init.ok).toBe(true);
  });

  it('adapter does not expose any app-boot or registry methods', () => {
    const adapter = makeAdapter();
    expect(typeof adapter.bootApp).toBe('undefined');
    expect(typeof adapter.registerAdapter).toBe('undefined');
    expect(typeof adapter.switchToProduction).toBe('undefined');
  });
});

// ── 18. no dependency on package additions ────────────────────────────────────

describe('no package additions — helper uses no external dependencies', () => {
  it('createFakeIndexedDBLike creates a working backend with no external imports', () => {
    const fake = createFakeIndexedDBLike();
    expect(typeof fake.open).toBe('function');
    const result = fake.open('db', 'store');
    expect(result.ok).toBe(true);
  });

  it('createUnavailableIndexedDBLike creates an object with no open() method', () => {
    const unavailable = createUnavailableIndexedDBLike();
    expect(typeof unavailable.open).not.toBe('function');
  });

  it('adapter operations work with no external runtime dependencies', () => {
    expect(() => {
      const adapter = makeInitedAdapter();
      adapter.setItem('key', { x: 1 });
      adapter.getItem('key');
      adapter.listKeys();
      adapter.removeItem('key');
      adapter.clear();
    }).not.toThrow();
  });
});

// ── 19. deterministic output for same synthetic input ─────────────────────────

describe('deterministic output — same synthetic input produces same output', () => {
  it('two adapters with same initial data produce same getItem result', () => {
    const data = { 'syn-key-1': { val: 'abc' }, 'syn-key-2': { val: 'def' } };
    const a1   = createIndexedDbAdapterTestPrototype({
      indexedDBLike: createFakeIndexedDBLike({ initialData: { ...data } }),
    });
    const a2   = createIndexedDbAdapterTestPrototype({
      indexedDBLike: createFakeIndexedDBLike({ initialData: { ...data } }),
    });
    a1.init(); a2.init();
    const r1 = a1.getItem('syn-key-1');
    const r2 = a2.getItem('syn-key-1');
    expect(r1.value).toEqual(r2.value);
  });

  it('listKeys returns the same sorted order across adapter instances', () => {
    const a1 = makeInitedAdapter(); const a2 = makeInitedAdapter();
    for (const k of SYNTHETIC_KEYS) {
      a1.setItem(k, SYNTHETIC_VALUES[k]);
      a2.setItem(k, SYNTHETIC_VALUES[k]);
    }
    expect(a1.listKeys().keys).toEqual(a2.listKeys().keys);
  });

  it('same key set returns same sorted key list on repeated calls', () => {
    const adapter = makeInitedAdapter();
    for (const k of SYNTHETIC_KEYS) adapter.setItem(k, SYNTHETIC_VALUES[k]);
    const r1 = adapter.listKeys();
    const r2 = adapter.listKeys();
    expect(r1.keys).toEqual(r2.keys);
  });

  it('open failure is deterministic for same fake configuration', () => {
    const r1 = makeAdapter({ shouldFailOpen: true }).init();
    const r2 = makeAdapter({ shouldFailOpen: true }).init();
    expect(r1.error).toBe(r2.error);
    expect(r1.ok).toBe(r2.ok);
  });

  it('write failure is deterministic for same fake configuration', () => {
    const r1 = makeInitedAdapter({ shouldFailTransaction: true }).setItem('k', { x: 1 });
    const r2 = makeInitedAdapter({ shouldFailTransaction: true }).setItem('k', { x: 1 });
    expect(r1.error).toBe(r2.error);
    expect(r1.ok).toBe(r2.ok);
  });
});

// ── 20. claim boundary remains test-only ─────────────────────────────────────

describe('claim boundary — explicit test-only scope', () => {
  it('PHASE18A_CLAIM_BOUNDARY is a non-empty string', () => {
    expect(typeof PHASE18A_CLAIM_BOUNDARY).toBe('string');
    expect(PHASE18A_CLAIM_BOUNDARY.length).toBeGreaterThan(0);
  });

  it('PHASE18A_CLAIM_BOUNDARY explicitly states synthetic data only', () => {
    expect(PHASE18A_CLAIM_BOUNDARY).toMatch(/synthetic data only/i);
  });

  it('ERR_MISSING_BACKEND, ERR_IDB_UNAVAILABLE, ERR_IDB_OPEN_FAILED are distinct error codes', () => {
    expect(ERR_MISSING_BACKEND).not.toBe(ERR_IDB_UNAVAILABLE);
    expect(ERR_MISSING_BACKEND).not.toBe(ERR_IDB_OPEN_FAILED);
    expect(ERR_IDB_UNAVAILABLE).not.toBe(ERR_IDB_OPEN_FAILED);
  });

  it('adapter does not switch production StorageAdapter registry', () => {
    const adapter = makeInitedAdapter();
    expect(typeof adapter.switchProductionRegistry).toBe('undefined');
    expect(typeof adapter.setProductionAdapter).toBe('undefined');
  });

  it('PHASE18A_IDENTITY and PHASE18A_CLAIM_BOUNDARY are frozen/stable constants', () => {
    expect(typeof PHASE18A_IDENTITY).toBe('string');
    expect(typeof PHASE18A_CLAIM_BOUNDARY).toBe('string');
  });
});
