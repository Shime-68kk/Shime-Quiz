/**
 * tests/unit/helpers/indexedDbAdapterTestPrototype.js
 *
 * Phase 18A — Test-Only IndexedDBAdapter Prototype
 *
 * Test-only helper. No production storage imports. No real browser globals.
 * Synthetic data only. Injectable fake backend only.
 * No production IndexedDBAdapter. No live migration. No real data movement.
 *
 * This module provides:
 *   - createFakeIndexedDBLike()       — injectable fake IDB-like backend
 *   - createUnavailableIndexedDBLike() — fake backend simulating unavailable IndexedDB
 *   - createIndexedDbAdapterTestPrototype() — test-only adapter factory
 *
 * The adapter models:
 *   - open/init behavior
 *   - object-store readiness
 *   - get/set/remove/list/clear with synthetic keys
 *   - structured clone-like value protection
 *   - unsupported-browser / unavailable backend fallback
 *   - open failure and transaction failure handling
 *   - no production registry switch
 *   - no real user data migration
 *   - no app boot behavior
 */

// ── Phase identity ─────────────────────────────────────────────────────────────

export const PHASE18A_IDENTITY =
  'Phase 18A — Test-Only IndexedDBAdapter Prototype';

export const PHASE18A_CLAIM_BOUNDARY =
  'Phase 18A test-only; no production IndexedDBAdapter; no live migration; ' +
  'no real data movement; adapter contract proof only; synthetic data only';

// ── Allowed adapter result statuses ───────────────────────────────────────────

export const ADAPTER_RESULT_OK    = 'ok';
export const ADAPTER_RESULT_ERROR = 'error';

// ── Error codes ────────────────────────────────────────────────────────────────

export const ERR_MISSING_BACKEND   = 'missing_indexeddb_like';
export const ERR_IDB_UNAVAILABLE   = 'idb_unavailable';
export const ERR_IDB_OPEN_FAILED   = 'idb_open_failed';
export const ERR_NOT_INITIALIZED   = 'not_initialized';
export const ERR_INVALID_KEY       = 'invalid_key';
export const ERR_TRANSACTION_FAILED = 'transaction_failed';

// ── Fake IDB-like backend factory ─────────────────────────────────────────────

/**
 * Creates a controllable fake IDB-like backend for deterministic tests.
 *
 * Options:
 *   shouldFailOpen        — simulate open failure (boolean, default false)
 *   shouldFailTransaction — simulate write transaction failure (boolean, default false)
 *   initialData           — pre-populate the store with key-value pairs (object, default {})
 *
 * Returns an object with an `open(databaseName, storeName)` method:
 *   - success: { ok: true, db: { storeName, shouldFailTransaction, _data } }
 *   - failure: { ok: false, error: 'idb_open_failed', reason }
 */
export function createFakeIndexedDBLike({
  shouldFailOpen        = false,
  shouldFailTransaction = false,
  initialData           = {},
} = {}) {
  const stores = {};

  return {
    open(databaseName, storeName) {
      if (shouldFailOpen) {
        return {
          ok:     false,
          error:  ERR_IDB_OPEN_FAILED,
          reason: `Simulated open failure for database "${databaseName}" store "${storeName}"`,
        };
      }
      if (!stores[storeName]) {
        stores[storeName] = Object.assign({}, initialData);
      }
      return {
        ok: true,
        db: {
          storeName,
          shouldFailTransaction,
          _data: stores[storeName],
        },
      };
    },
  };
}

/**
 * Creates a fake backend that simulates an unavailable (unsupported) IndexedDB
 * environment. The returned object has no `open` method, so `isAvailable()`
 * returns false on the adapter.
 */
export function createUnavailableIndexedDBLike() {
  return {};
}

// ── Adapter factory ───────────────────────────────────────────────────────────

/**
 * Creates a test-only IndexedDB adapter prototype.
 *
 * Parameters:
 *   indexedDBLike  — injectable fake IDB-like backend (required)
 *   databaseName   — synthetic database name (default 'shime-test-db')
 *   storeName      — synthetic object-store name (default 'shime-test-store')
 *   version        — synthetic database version (default 1)
 *   clock          — optional function returning an ISO timestamp string
 *
 * If `indexedDBLike` is missing or not an object, returns:
 *   { ok: false, error: 'missing_indexeddb_like', reason }
 *
 * Otherwise returns an adapter object with:
 *   isAvailable()            → boolean
 *   init()                   → { ok, databaseName, storeName, version } | { ok, error, reason }
 *   getItem(key)             → { ok, found, value } | { ok, error, reason }
 *   setItem(key, value)      → { ok, key, writtenAt } | { ok, error, reason }
 *   removeItem(key)          → { ok, key, existed } | { ok, error, reason }
 *   listKeys()               → { ok, keys } | { ok, error, reason }
 *   clear()                  → { ok, clearedCount } | { ok, error, reason }
 *   _state                   → { initialized, databaseName, storeName, version }
 *
 * All operations return result objects. No promises. Synchronous.
 * No browser globals are accessed. No production storage modules are used.
 */
export function createIndexedDbAdapterTestPrototype({
  indexedDBLike,
  databaseName = 'shime-test-db',
  storeName    = 'shime-test-store',
  version      = 1,
  clock,
} = {}) {
  // Gate: indexedDBLike is required
  if (indexedDBLike === null || indexedDBLike === undefined || typeof indexedDBLike !== 'object') {
    return {
      ok:     false,
      error:  ERR_MISSING_BACKEND,
      reason: 'createIndexedDbAdapterTestPrototype requires an injected indexedDBLike fake backend',
    };
  }

  let _db          = null;
  let _initialized = false;

  const now = () => (typeof clock === 'function' ? clock() : '2026-05-17T00:00:00.000Z');

  // Structured clone-like deep copy using JSON round-trip (handles plain objects/arrays/primitives).
  function deepClone(val) {
    if (val === undefined) return undefined;
    return JSON.parse(JSON.stringify(val));
  }

  const adapter = {
    // ── isAvailable ───────────────────────────────────────────────────────────

    isAvailable() {
      return typeof indexedDBLike.open === 'function';
    },

    // ── init ──────────────────────────────────────────────────────────────────

    init() {
      if (_initialized) {
        return { ok: true, alreadyInitialized: true, databaseName, storeName, version };
      }
      if (!this.isAvailable()) {
        return {
          ok:     false,
          error:  ERR_IDB_UNAVAILABLE,
          reason: 'IndexedDB-like backend is not available in this environment',
        };
      }
      const openResult = indexedDBLike.open(databaseName, storeName);
      if (!openResult.ok) {
        return {
          ok:     false,
          error:  openResult.error  ?? ERR_IDB_OPEN_FAILED,
          reason: openResult.reason ?? `Failed to open database "${databaseName}"`,
        };
      }
      _db          = openResult.db;
      _initialized = true;
      return { ok: true, databaseName, storeName, version };
    },

    // ── getItem ───────────────────────────────────────────────────────────────

    getItem(key) {
      if (!_initialized || !_db) {
        return { ok: false, error: ERR_NOT_INITIALIZED, reason: 'Adapter must be initialized before use' };
      }
      if (typeof key !== 'string' || key === '') {
        return { ok: false, error: ERR_INVALID_KEY, reason: 'Key must be a non-empty string' };
      }
      const hasKey   = Object.prototype.hasOwnProperty.call(_db._data, key);
      if (!hasKey) {
        return { ok: true, found: false, value: null };
      }
      // Structured clone-like protection: return a deep copy to prevent accidental mutation
      return { ok: true, found: true, value: deepClone(_db._data[key]) };
    },

    // ── setItem ───────────────────────────────────────────────────────────────

    setItem(key, value) {
      if (!_initialized || !_db) {
        return { ok: false, error: ERR_NOT_INITIALIZED, reason: 'Adapter must be initialized before use' };
      }
      if (typeof key !== 'string' || key === '') {
        return { ok: false, error: ERR_INVALID_KEY, reason: 'Key must be a non-empty string' };
      }
      if (_db.shouldFailTransaction) {
        return {
          ok:     false,
          error:  ERR_TRANSACTION_FAILED,
          reason: 'Simulated write transaction failure',
        };
      }
      // Deep copy to prevent accidental mutation of caller's object
      _db._data[key] = deepClone(value);
      return { ok: true, key, writtenAt: now() };
    },

    // ── removeItem ────────────────────────────────────────────────────────────

    removeItem(key) {
      if (!_initialized || !_db) {
        return { ok: false, error: ERR_NOT_INITIALIZED, reason: 'Adapter must be initialized before use' };
      }
      if (typeof key !== 'string' || key === '') {
        return { ok: false, error: ERR_INVALID_KEY, reason: 'Key must be a non-empty string' };
      }
      const existed = Object.prototype.hasOwnProperty.call(_db._data, key);
      if (existed) delete _db._data[key];
      return { ok: true, key, existed };
    },

    // ── listKeys ──────────────────────────────────────────────────────────────

    listKeys() {
      if (!_initialized || !_db) {
        return { ok: false, error: ERR_NOT_INITIALIZED, reason: 'Adapter must be initialized before use' };
      }
      // Return sorted keys for determinism
      const keys = Object.keys(_db._data).sort((a, b) => a.localeCompare(b));
      return { ok: true, keys };
    },

    // ── clear ─────────────────────────────────────────────────────────────────

    clear() {
      if (!_initialized || !_db) {
        return { ok: false, error: ERR_NOT_INITIALIZED, reason: 'Adapter must be initialized before use' };
      }
      const count = Object.keys(_db._data).length;
      for (const k of Object.keys(_db._data)) {
        delete _db._data[k];
      }
      return { ok: true, clearedCount: count };
    },

    // ── _state (read-only diagnostic) ─────────────────────────────────────────

    get _state() {
      return Object.freeze({ initialized: _initialized, databaseName, storeName, version });
    },
  };

  return adapter;
}
