/**
 * tests/unit/indexedDbDryRunHarness.test.js
 *
 * Phase 17C — IndexedDB Dry-Run Harness unit tests.
 *
 * All tests use fake IndexedDB stubs. No real browser IndexedDB is required.
 * No real Shime app data is read or written in any test.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkIndexedDbAvailability,
  runIndexedDbDryRun,
  createIndexedDbDryRunPlan,
  cleanupIndexedDbDryRun,
} from '../../src/storage/indexedDbDryRunHarness.js';
import {
  getStorageAdapter,
  resetStorageAdapterForTests,
} from '../../src/storage/storageAdapterRegistry.js';
import { LocalStorageAdapter } from '../../src/storage/LocalStorageAdapter.js';

// ── Fake IndexedDB builder ────────────────────────────────────────────────────

function makeFakeIdb({ failOpen = false, failRequest = false, skipUpgrade = false } = {}) {
  const dbs = {};
  let deletedDb = null;

  function makeDb(name) {
    const storeData = {};
    const storeNames = new Set();

    const db = {
      name,
      objectStoreNames: { contains: (s) => storeNames.has(s) },
      createObjectStore(storeName) {
        storeNames.add(storeName);
        storeData[storeName] = new Map();
        return {};
      },
      transaction(_storeNames, _mode) {
        return {
          objectStore(storeName) {
            const data = storeData[storeName] ?? new Map();
            return {
              put(value, key) {
                const req = { onsuccess: null, onerror: null };
                Promise.resolve().then(() => {
                  data.set(key, value);
                  if (req.onsuccess) req.onsuccess({ target: { result: key } });
                });
                return req;
              },
              get(key) {
                const req = { onsuccess: null, onerror: null };
                Promise.resolve().then(() => {
                  if (req.onsuccess) req.onsuccess({ target: { result: data.get(key) } });
                });
                return req;
              },
            };
          },
        };
      },
      close() {},
    };
    return { db, storeData };
  }

  const idb = {
    _getDeletedDb: () => deletedDb,
    open(name, _version) {
      if (failOpen) throw new Error('indexedDB.open threw synchronously');

      const req = { result: null, error: null, onsuccess: null, onerror: null, onupgradeneeded: null };

      Promise.resolve().then(() => {
        if (failRequest) {
          const err = new Error('open request error');
          req.error = err;
          if (req.onerror) req.onerror({ target: { error: err } });
          return;
        }

        const isNew = !dbs[name];
        if (!dbs[name]) {
          const { db } = makeDb(name);
          dbs[name] = db;
        }
        const db = dbs[name];

        if (isNew && !skipUpgrade && req.onupgradeneeded) {
          req.onupgradeneeded({ target: { result: db } });
        }

        req.result = db;
        if (req.onsuccess) req.onsuccess({ target: { result: db } });
      });

      return req;
    },
    deleteDatabase(name) {
      deletedDb = name;
      const req = { onsuccess: null, onerror: null, onblocked: null };
      Promise.resolve().then(() => {
        delete dbs[name];
        if (req.onsuccess) req.onsuccess({});
      });
      return req;
    },
  };

  return idb;
}

// ── Test setup ────────────────────────────────────────────────────────────────

let originalIndexedDB;

beforeEach(() => {
  originalIndexedDB = globalThis.indexedDB;
});

afterEach(() => {
  if (originalIndexedDB === undefined) {
    delete globalThis.indexedDB;
  } else {
    globalThis.indexedDB = originalIndexedDB;
  }
  resetStorageAdapterForTests();
});

// ── 1. checkIndexedDbAvailability ─────────────────────────────────────────────

describe('checkIndexedDbAvailability', () => {
  it('returns available:false when globalThis.indexedDB is undefined', () => {
    delete globalThis.indexedDB;
    const result = checkIndexedDbAvailability();
    expect(result.available).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it('returns available:false when globalThis.indexedDB is null', () => {
    globalThis.indexedDB = null;
    const result = checkIndexedDbAvailability();
    expect(result.available).toBe(false);
  });

  it('returns available:false when indexedDB.open is not a function', () => {
    globalThis.indexedDB = { open: 'not-a-function' };
    const result = checkIndexedDbAvailability();
    expect(result.available).toBe(false);
  });

  it('returns available:true when indexedDB.open is a function', () => {
    globalThis.indexedDB = { open: () => {} };
    const result = checkIndexedDbAvailability();
    expect(result.available).toBe(true);
  });
});

// ── 2. IndexedDB unavailable — safe result ────────────────────────────────────

describe('runIndexedDbDryRun — IndexedDB unavailable', () => {
  it('returns ok:false with available:false and dryRunOnly:true when indexedDB missing', async () => {
    delete globalThis.indexedDB;
    const result = await runIndexedDbDryRun();
    expect(result.ok).toBe(false);
    expect(result.available).toBe(false);
    expect(result.dryRunOnly).toBe(true);
    expect(result.reason).toBeTruthy();
    expect(Array.isArray(result.steps)).toBe(true);
    expect(result.steps.length).toBe(0);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('does not throw when indexedDB is null', async () => {
    globalThis.indexedDB = null;
    await expect(runIndexedDbDryRun()).resolves.toMatchObject({
      ok: false,
      available: false,
      dryRunOnly: true,
    });
  });
});

// ── 3. indexedDB.open throwing — safe result ──────────────────────────────────

describe('runIndexedDbDryRun — indexedDB.open throws', () => {
  it('returns ok:false with available:true and dryRunOnly:true when open throws', async () => {
    globalThis.indexedDB = makeFakeIdb({ failOpen: true });
    const result = await runIndexedDbDryRun();
    expect(result.ok).toBe(false);
    expect(result.available).toBe(true);
    expect(result.dryRunOnly).toBe(true);
    expect(result.reason).toMatch(/dry-run failed/);
    expect(result.steps).toContain('open-dry-run-db');
  });
});

// ── 4. open request error — safe result ──────────────────────────────────────

describe('runIndexedDbDryRun — open request fires onerror', () => {
  it('returns ok:false and dryRunOnly:true when open request errors', async () => {
    globalThis.indexedDB = makeFakeIdb({ failRequest: true });
    const result = await runIndexedDbDryRun();
    expect(result.ok).toBe(false);
    expect(result.available).toBe(true);
    expect(result.dryRunOnly).toBe(true);
    expect(result.reason).toBeTruthy();
  });
});

// ── 5. Successful dry-run ─────────────────────────────────────────────────────

describe('runIndexedDbDryRun — successful path', () => {
  it('returns ok:true with expected steps', async () => {
    globalThis.indexedDB = makeFakeIdb();
    const result = await runIndexedDbDryRun();
    expect(result.ok).toBe(true);
    expect(result.available).toBe(true);
    expect(result.dryRunOnly).toBe(true);
    expect(result.steps).toContain('open-dry-run-db');
    expect(result.steps).toContain('write-synthetic-record');
    expect(result.steps).toContain('read-synthetic-record');
    expect(result.steps).toContain('read-after-write-verified');
    expect(result.warnings).toEqual([]);
  });

  it('result always has dryRunOnly: true', async () => {
    globalThis.indexedDB = makeFakeIdb();
    const result = await runIndexedDbDryRun();
    expect(result.dryRunOnly).toBe(true);
  });
});

// ── 6. deleteDatabase attempted ───────────────────────────────────────────────

describe('runIndexedDbDryRun — cleanup/deleteDatabase', () => {
  it('attempts to delete the dry-run database', async () => {
    const fakeIdb = makeFakeIdb();
    globalThis.indexedDB = fakeIdb;
    const result = await runIndexedDbDryRun();
    expect(result.ok).toBe(true);
    expect(result.steps).toContain('delete-dry-run-db');
    expect(fakeIdb._getDeletedDb()).toBe('shime-v2-indexeddb-dry-run');
  });
});

// ── 7. cleanupIndexedDbDryRun ─────────────────────────────────────────────────

describe('cleanupIndexedDbDryRun', () => {
  it('returns ok:true and skipped:true when indexedDB unavailable', async () => {
    delete globalThis.indexedDB;
    const result = await cleanupIndexedDbDryRun();
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
  });

  it('returns ok:true when deleteDatabase succeeds', async () => {
    globalThis.indexedDB = makeFakeIdb();
    const result = await cleanupIndexedDbDryRun();
    expect(result.ok).toBe(true);
  });
});

// ── 8. dry-run plan contains required gates ───────────────────────────────────

describe('createIndexedDbDryRunPlan', () => {
  it('returns dryRunOnly:true', () => {
    const plan = createIndexedDbDryRunPlan();
    expect(plan.dryRunOnly).toBe(true);
  });

  it('contains backup exists gate', () => {
    const { gates } = createIndexedDbDryRunPlan();
    expect(gates.some((g) => g.includes('backup exists'))).toBe(true);
  });

  it('contains rollback snapshot gate', () => {
    const { gates } = createIndexedDbDryRunPlan();
    expect(gates.some((g) => g.includes('rollback snapshot'))).toBe(true);
  });

  it('contains read-after-write verification gate', () => {
    const { gates } = createIndexedDbDryRunPlan();
    expect(gates.some((g) => g.includes('read-after-write'))).toBe(true);
  });

  it('contains adapter scaffold gate', () => {
    const { gates } = createIndexedDbDryRunPlan();
    expect(gates.some((g) => g.includes('adapter scaffold'))).toBe(true);
  });

  it('contains dry-run IndexedDB capability check gate', () => {
    const { gates } = createIndexedDbDryRunPlan();
    expect(gates.some((g) => g.includes('dry-run IndexedDB capability check'))).toBe(true);
  });

  it('contains manual user confirmation gate', () => {
    const { gates } = createIndexedDbDryRunPlan();
    expect(gates.some((g) => g.includes('manual user confirmation'))).toBe(true);
  });

  it('warns about no live migration', () => {
    const { warnings } = createIndexedDbDryRunPlan();
    expect(warnings.some((w) => w.includes('live migration'))).toBe(true);
  });
});

// ── 9. No localStorage writes during dry-run ─────────────────────────────────

describe('runIndexedDbDryRun — no localStorage writes', () => {
  it('does not call localStorage.setItem during dry-run', async () => {
    globalThis.indexedDB = makeFakeIdb();

    const setItemSpy = vi.fn();
    const originalWindow = globalThis.window;
    globalThis.window = {
      localStorage: {
        getItem: () => null,
        setItem: setItemSpy,
        removeItem: () => {},
      },
    };

    try {
      await runIndexedDbDryRun();
    } finally {
      if (originalWindow === undefined) delete globalThis.window;
      else globalThis.window = originalWindow;
    }

    expect(setItemSpy).not.toHaveBeenCalled();
  });
});

// ── 10. No adapter registry default change during dry-run ────────────────────

describe('runIndexedDbDryRun — no adapter registry change', () => {
  it('production adapter remains LocalStorageAdapter after dry-run', async () => {
    globalThis.indexedDB = makeFakeIdb();
    resetStorageAdapterForTests();
    await runIndexedDbDryRun();
    const adapter = getStorageAdapter();
    expect(adapter).toBeInstanceOf(LocalStorageAdapter);
  });
});

// ── 11. dry-run only writes to the dry-run database name ─────────────────────

describe('runIndexedDbDryRun — synthetic data only', () => {
  it('only opens the "shime-v2-indexeddb-dry-run" database', async () => {
    const openedDbs = [];
    const fakeIdb = makeFakeIdb();
    const originalOpen = fakeIdb.open.bind(fakeIdb);
    fakeIdb.open = (name, version) => {
      openedDbs.push(name);
      return originalOpen(name, version);
    };
    globalThis.indexedDB = fakeIdb;

    await runIndexedDbDryRun();
    expect(openedDbs).toEqual(['shime-v2-indexeddb-dry-run']);
  });
});
