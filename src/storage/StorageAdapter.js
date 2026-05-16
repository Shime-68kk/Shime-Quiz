/**
 * StorageAdapter — minimal key-value adapter contract for the v2 storage family.
 *
 * Defines the shape all concrete adapters must implement. The current production
 * adapter is LocalStorageAdapter (no-op/passthrough). Future phases may introduce
 * an IndexedDB adapter behind this contract without changing callers.
 *
 * All methods are synchronous to match the existing localStorage-backed callers.
 * No IndexedDB, no migration logic, no schema ownership.
 */

export class StorageAdapter {
  /**
   * Read a raw string value. Returns null if missing or unavailable.
   * @param {string} key
   * @returns {string|null}
   */
  readRaw(key) { // eslint-disable-line no-unused-vars
    throw new Error('StorageAdapter.readRaw must be implemented by subclass');
  }

  /**
   * Write a raw string value. Returns { ok: boolean, error?: string }.
   * @param {string} key
   * @param {string} value
   * @returns {{ ok: boolean, error?: string }}
   */
  writeRaw(key, value) { // eslint-disable-line no-unused-vars
    throw new Error('StorageAdapter.writeRaw must be implemented by subclass');
  }

  /**
   * Remove a key. Returns { ok: boolean, error?: string }.
   * @param {string} key
   * @returns {{ ok: boolean, error?: string }}
   */
  removeRaw(key) { // eslint-disable-line no-unused-vars
    throw new Error('StorageAdapter.removeRaw must be implemented by subclass');
  }

  /**
   * Read and JSON-parse a value. Returns fallback on missing or parse error.
   * Does NOT auto-delete on parse error — callers are responsible for cleanup.
   * @param {string} key
   * @param {*} fallback
   * @returns {*}
   */
  readJson(key, fallback = null) {
    const raw = this.readRaw(key);
    if (raw == null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  /**
   * JSON-serialize and write a value.
   * @param {string} key
   * @param {*} value
   * @returns {{ ok: boolean, error?: string }}
   */
  writeJson(key, value) {
    try {
      return this.writeRaw(key, JSON.stringify(value));
    } catch (error) {
      return { ok: false, error: 'json_serialize_failed', storageError: error };
    }
  }

  /**
   * Advisory: returns true if the underlying storage backend is accessible.
   * @returns {boolean}
   */
  hasStorageSupport() {
    return false;
  }

  /**
   * Returns true if the error looks like a storage quota error.
   * @param {unknown} error
   * @returns {boolean}
   */
  isQuotaError(error) {
    if (!error) return false;
    const name = error.name || '';
    const msg = String(error.message || '').toLowerCase();
    return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      msg.includes('quota') || msg.includes('exceeded');
  }
}
