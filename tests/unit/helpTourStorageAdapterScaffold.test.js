import { afterEach, describe, expect, it } from 'vitest';
import { StorageAdapter } from '../../src/storage/StorageAdapter.js';
import {
  setStorageAdapterForTests,
  resetStorageAdapterForTests
} from '../../src/storage/storageAdapterRegistry.js';
import {
  HELP_TOUR_DONE_STORAGE_KEY,
  readHelpTourDone,
  markHelpTourDone,
  clearHelpTourDoneForTests
} from '../../src/ui/helpTourStorage.js';

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

class ThrowingAdapter extends StorageAdapter {
  hasStorageSupport() { return false; }
  readRaw() { throw new Error('storage unavailable'); }
  writeRaw() { throw new Error('storage unavailable'); }
  removeRaw() { throw new Error('storage unavailable'); }
}

afterEach(() => {
  resetStorageAdapterForTests();
});

describe('Help Tour completion StorageAdapter scaffold', () => {
  it('keeps the exact existing Help Tour completion key', () => {
    expect(HELP_TOUR_DONE_STORAGE_KEY).toBe('shime_tour_done');
  });

  it('returns false when the key is absent', () => {
    setStorageAdapterForTests(new MemoryAdapter());

    expect(readHelpTourDone()).toBe(false);
  });

  it('returns true only when the adapter stores "1"', () => {
    setStorageAdapterForTests(new MemoryAdapter({
      [HELP_TOUR_DONE_STORAGE_KEY]: '1'
    }));

    expect(readHelpTourDone()).toBe(true);
  });

  it('returns false for non-"1" values', () => {
    for (const value of ['0', 'true', '', 'yes']) {
      setStorageAdapterForTests(new MemoryAdapter({
        [HELP_TOUR_DONE_STORAGE_KEY]: value
      }));

      expect(readHelpTourDone()).toBe(false);
    }
  });

  it('writes "1" through the active adapter', () => {
    const adapter = new MemoryAdapter();
    setStorageAdapterForTests(adapter);

    expect(markHelpTourDone()).toEqual({ ok: true });
    expect(adapter.readRaw(HELP_TOUR_DONE_STORAGE_KEY)).toBe('1');
  });

  it('does not throw and reads safe false when storage is unavailable', () => {
    const adapter = new MemoryAdapter();
    adapter._available = false;
    setStorageAdapterForTests(adapter);

    expect(() => readHelpTourDone()).not.toThrow();
    expect(readHelpTourDone()).toBe(false);
    expect(() => markHelpTourDone()).not.toThrow();
    expect(markHelpTourDone()).toEqual({ ok: false, error: 'storage_unavailable' });
  });

  it('does not throw and returns an error result when adapter methods fail', () => {
    setStorageAdapterForTests(new ThrowingAdapter());

    expect(readHelpTourDone()).toBe(false);
    expect(markHelpTourDone()).toMatchObject({ ok: false, error: 'storage_write_failed' });
  });

  it('can clear the Help Tour flag for tests through the active adapter', () => {
    const adapter = new MemoryAdapter({ [HELP_TOUR_DONE_STORAGE_KEY]: '1' });
    setStorageAdapterForTests(adapter);

    expect(clearHelpTourDoneForTests()).toEqual({ ok: true });
    expect(readHelpTourDone()).toBe(false);
  });
});
