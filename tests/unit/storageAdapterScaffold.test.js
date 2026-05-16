import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { StorageAdapter } from '../../src/storage/StorageAdapter.js';
import { LocalStorageAdapter } from '../../src/storage/LocalStorageAdapter.js';
import {
  getStorageAdapter,
  setStorageAdapterForTests,
  resetStorageAdapterForTests
} from '../../src/storage/storageAdapterRegistry.js';

// ── StorageAdapter base class ─────────────────────────────────────────────────

describe('StorageAdapter base class', () => {
  it('readRaw throws on base class', () => {
    const adapter = new StorageAdapter();
    expect(() => adapter.readRaw('k')).toThrow('must be implemented by subclass');
  });

  it('writeRaw throws on base class', () => {
    const adapter = new StorageAdapter();
    expect(() => adapter.writeRaw('k', 'v')).toThrow('must be implemented by subclass');
  });

  it('removeRaw throws on base class', () => {
    const adapter = new StorageAdapter();
    expect(() => adapter.removeRaw('k')).toThrow('must be implemented by subclass');
  });

  it('hasStorageSupport returns false on base class', () => {
    expect(new StorageAdapter().hasStorageSupport()).toBe(false);
  });

  it('isQuotaError returns false for null/undefined', () => {
    const adapter = new StorageAdapter();
    expect(adapter.isQuotaError(null)).toBe(false);
    expect(adapter.isQuotaError(undefined)).toBe(false);
  });

  it('isQuotaError returns true for QuotaExceededError', () => {
    const adapter = new StorageAdapter();
    const err = new Error('QuotaExceededError');
    err.name = 'QuotaExceededError';
    expect(adapter.isQuotaError(err)).toBe(true);
  });

  it('isQuotaError returns true for message containing quota', () => {
    const adapter = new StorageAdapter();
    expect(adapter.isQuotaError(new Error('storage quota exceeded'))).toBe(true);
  });
});

// ── LocalStorageAdapter read/write/remove/JSON ────────────────────────────────

function makeMockStorage() {
  const store = new Map();
  return {
    getItem: key => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => { store.set(key, value); },
    removeItem: key => { store.delete(key); },
    _store: store
  };
}

describe('LocalStorageAdapter', () => {
  let adapter;
  let originalWindow;

  beforeEach(() => {
    originalWindow = globalThis.window;
    const mockStorage = makeMockStorage();
    globalThis.window = { localStorage: mockStorage };
    adapter = new LocalStorageAdapter();
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  });

  it('hasStorageSupport returns true when localStorage is available', () => {
    expect(adapter.hasStorageSupport()).toBe(true);
  });

  it('hasStorageSupport returns false when window is undefined', () => {
    delete globalThis.window;
    const a = new LocalStorageAdapter();
    expect(a.hasStorageSupport()).toBe(false);
  });

  it('readRaw returns null for missing key', () => {
    expect(adapter.readRaw('missing')).toBeNull();
  });

  it('writeRaw stores and readRaw retrieves value', () => {
    const result = adapter.writeRaw('testKey', 'hello');
    expect(result.ok).toBe(true);
    expect(adapter.readRaw('testKey')).toBe('hello');
  });

  it('removeRaw deletes a key', () => {
    adapter.writeRaw('removeMe', 'val');
    const result = adapter.removeRaw('removeMe');
    expect(result.ok).toBe(true);
    expect(adapter.readRaw('removeMe')).toBeNull();
  });

  it('readRaw returns null when window is unavailable', () => {
    delete globalThis.window;
    const a = new LocalStorageAdapter();
    expect(a.readRaw('k')).toBeNull();
  });

  it('writeRaw returns ok:false when storage unavailable', () => {
    delete globalThis.window;
    const a = new LocalStorageAdapter();
    expect(a.writeRaw('k', 'v').ok).toBe(false);
    expect(a.writeRaw('k', 'v').error).toBe('storage_unavailable');
  });

  it('removeRaw returns ok:false when storage unavailable', () => {
    delete globalThis.window;
    const a = new LocalStorageAdapter();
    expect(a.removeRaw('k').ok).toBe(false);
  });

  it('readJson returns fallback for missing key', () => {
    expect(adapter.readJson('nope', 'default')).toBe('default');
  });

  it('readJson parses JSON correctly', () => {
    adapter.writeRaw('jsonKey', JSON.stringify({ x: 1 }));
    expect(adapter.readJson('jsonKey')).toEqual({ x: 1 });
  });

  it('readJson returns fallback on invalid JSON', () => {
    adapter.writeRaw('badJson', 'not-json{{');
    expect(adapter.readJson('badJson', null)).toBeNull();
  });

  it('writeJson serializes and stores object', () => {
    const result = adapter.writeJson('obj', { a: 'b' });
    expect(result.ok).toBe(true);
    expect(adapter.readJson('obj')).toEqual({ a: 'b' });
  });

  it('writeRaw returns error detail on write failure', () => {
    const throwingStorage = {
      getItem: () => null,
      setItem: () => { throw new Error('disk full'); },
      removeItem: () => {}
    };
    globalThis.window = { localStorage: throwingStorage };
    const a = new LocalStorageAdapter();
    const result = a.writeRaw('k', 'v');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('storage_write_failed');
  });
});

// ── storageAdapterRegistry ─────────────────────────────────────────────────────

describe('storageAdapterRegistry', () => {
  afterEach(() => {
    resetStorageAdapterForTests();
  });

  it('getStorageAdapter returns a LocalStorageAdapter by default', () => {
    resetStorageAdapterForTests();
    const adapter = getStorageAdapter();
    expect(adapter).toBeInstanceOf(LocalStorageAdapter);
  });

  it('setStorageAdapterForTests overrides the active adapter', () => {
    const fakeAdapter = new StorageAdapter();
    setStorageAdapterForTests(fakeAdapter);
    expect(getStorageAdapter()).toBe(fakeAdapter);
  });

  it('resetStorageAdapterForTests restores production default', () => {
    const fakeAdapter = new StorageAdapter();
    setStorageAdapterForTests(fakeAdapter);
    resetStorageAdapterForTests();
    expect(getStorageAdapter()).toBeInstanceOf(LocalStorageAdapter);
  });

  it('multiple calls to getStorageAdapter return same instance', () => {
    resetStorageAdapterForTests();
    const a = getStorageAdapter();
    const b = getStorageAdapter();
    expect(a).toBe(b);
  });
});
