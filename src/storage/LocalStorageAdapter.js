/**
 * LocalStorageAdapter — no-op/passthrough driver for the StorageAdapter contract.
 *
 * Wraps window.localStorage (via src/utils/storage.js helpers) and preserves
 * the exact same behavior as the direct localStorage calls in existing modules.
 *
 * This is the production default adapter. It does not introduce a new storage
 * schema, does not write migration metadata, and does not switch drivers.
 *
 * No IndexedDB. No migration. No dual-write. No sync/cloud/account/auth.
 */

import { StorageAdapter } from './StorageAdapter.js';
import { getLocalStorage } from '../utils/storage.js';

export class LocalStorageAdapter extends StorageAdapter {
  constructor() {
    super();
  }

  hasStorageSupport() {
    return getLocalStorage() !== null;
  }

  readRaw(key) {
    const storage = getLocalStorage();
    if (!storage) return null;
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  writeRaw(key, value) {
    const storage = getLocalStorage();
    if (!storage) return { ok: false, error: 'storage_unavailable' };
    try {
      storage.setItem(key, value);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'storage_write_failed', storageError: error };
    }
  }

  removeRaw(key) {
    const storage = getLocalStorage();
    if (!storage) return { ok: false, error: 'storage_unavailable' };
    try {
      storage.removeItem(key);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'storage_remove_failed', storageError: error };
    }
  }
}
