/**
 * indexedDbDryRunHarness.js — IndexedDB capability dry-run harness (Phase 17C).
 *
 * Checks whether IndexedDB is available and functional in the current environment
 * by writing/reading/deleting synthetic test data in a dedicated temporary database.
 *
 * DRY-RUN ONLY. Never reads or writes real Shime app data. Never touches localStorage.
 * Never changes the production StorageAdapter registry. Never runs at app boot.
 * No dual-write. No live migration. No EventLog. No sync/cloud/account/auth.
 */

const DRY_RUN_DB_NAME = 'shime-v2-indexeddb-dry-run';
const DRY_RUN_DB_VERSION = 1;
const DRY_RUN_STORE_NAME = 'dry-run-probe';
const DRY_RUN_KEY = 'shime-dry-run-probe-key';
const DRY_RUN_VALUE = { probe: 'shime-dry-run-ok' };

/**
 * Check whether the IndexedDB API is present in the current environment.
 * @returns {{ available: boolean, reason?: string }}
 */
export function checkIndexedDbAvailability() {
  if (typeof globalThis.indexedDB === 'undefined' || globalThis.indexedDB === null) {
    return { available: false, reason: 'IndexedDB API not present in this environment' };
  }
  if (typeof globalThis.indexedDB.open !== 'function') {
    return { available: false, reason: 'indexedDB.open is not a function' };
  }
  return { available: true };
}

/**
 * Create a description of what a future real migration would require.
 * Pure metadata — does not read or write app data.
 * @returns {{ dryRunOnly: true, gates: string[], description: string, warnings: string[] }}
 */
export function createIndexedDbDryRunPlan() {
  return {
    dryRunOnly: true,
    gates: [
      'backup exists',
      'rollback snapshot exists',
      'read-after-write verification available',
      'adapter scaffold exists',
      'dry-run IndexedDB capability check passed',
      'manual user confirmation required in future phase',
    ],
    description: 'IndexedDB migration dry-run plan — prerequisites only, no live migration',
    warnings: [
      'This plan does not perform live migration.',
      'No production app data is read or written.',
      'Production StorageAdapter registry default is unchanged.',
      'No dual-write. No EventLog. No boot-time migration.',
      'Manual user confirmation required before any future migration phase.',
    ],
  };
}

/**
 * Run a full IndexedDB capability dry-run: open temporary DB, write synthetic record,
 * read it back, verify, then close and delete the temporary DB.
 *
 * @returns {Promise<{
 *   ok: boolean,
 *   available: boolean,
 *   dryRunOnly: true,
 *   reason?: string,
 *   steps: string[],
 *   warnings: string[]
 * }>}
 */
export async function runIndexedDbDryRun() {
  const availability = checkIndexedDbAvailability();
  if (!availability.available) {
    return {
      ok: false,
      available: false,
      dryRunOnly: true,
      reason: availability.reason,
      steps: [],
      warnings: ['IndexedDB API unavailable — dry-run skipped safely'],
    };
  }

  const steps = [];
  const warnings = [];
  let db = null;

  try {
    steps.push('open-dry-run-db');
    db = await openDryRunDb();

    steps.push('write-synthetic-record');
    await writeSyntheticRecord(db);

    steps.push('read-synthetic-record');
    const record = await readSyntheticRecord(db);

    if (!record || record.probe !== DRY_RUN_VALUE.probe) {
      warnings.push('read-after-write verification failed — record mismatch');
      return {
        ok: false,
        available: true,
        dryRunOnly: true,
        reason: 'read-after-write verification failed',
        steps,
        warnings,
      };
    }

    steps.push('read-after-write-verified');

    try {
      db.close();
      steps.push('close-dry-run-db');
    } catch {
      warnings.push('db.close() failed — non-fatal');
    }

    db = null;

    await deleteDryRunDb();
    steps.push('delete-dry-run-db');

    return {
      ok: true,
      available: true,
      dryRunOnly: true,
      steps,
      warnings,
    };
  } catch (err) {
    if (db) {
      try { db.close(); } catch { /* non-fatal */ }
    }
    return {
      ok: false,
      available: true,
      dryRunOnly: true,
      reason: `dry-run failed: ${err && err.message ? err.message : String(err)}`,
      steps,
      warnings,
    };
  }
}

/**
 * Attempt to clean up the dry-run database if it exists.
 * @returns {Promise<{ ok: boolean, skipped?: boolean, error?: string }>}
 */
export async function cleanupIndexedDbDryRun() {
  const availability = checkIndexedDbAvailability();
  if (!availability.available) return { ok: true, skipped: true };
  try {
    await deleteDryRunDb();
    return { ok: true };
  } catch {
    return { ok: false, error: 'cleanup_failed' };
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function openDryRunDb() {
  return new Promise((resolve, reject) => {
    let req;
    try {
      req = globalThis.indexedDB.open(DRY_RUN_DB_NAME, DRY_RUN_DB_VERSION);
    } catch (err) {
      reject(err);
      return;
    }
    req.onupgradeneeded = (event) => {
      try {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(DRY_RUN_STORE_NAME)) {
          db.createObjectStore(DRY_RUN_STORE_NAME);
        }
      } catch (err) {
        reject(err);
      }
    };
    req.onsuccess = (event) => resolve(event.target.result);
    req.onerror = (event) => reject(event.target.error || new Error('indexedDB.open request failed'));
  });
}

function writeSyntheticRecord(db) {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction([DRY_RUN_STORE_NAME], 'readwrite');
      const store = tx.objectStore(DRY_RUN_STORE_NAME);
      const req = store.put({ ...DRY_RUN_VALUE, ts: Date.now() }, DRY_RUN_KEY);
      req.onsuccess = () => resolve();
      req.onerror = (event) => reject(event.target.error || new Error('put failed'));
    } catch (err) {
      reject(err);
    }
  });
}

function readSyntheticRecord(db) {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction([DRY_RUN_STORE_NAME], 'readonly');
      const store = tx.objectStore(DRY_RUN_STORE_NAME);
      const req = store.get(DRY_RUN_KEY);
      req.onsuccess = (event) => resolve(event.target.result);
      req.onerror = (event) => reject(event.target.error || new Error('get failed'));
    } catch (err) {
      reject(err);
    }
  });
}

function deleteDryRunDb() {
  return new Promise((resolve) => {
    try {
      const req = globalThis.indexedDB.deleteDatabase(DRY_RUN_DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    } catch {
      resolve();
    }
  });
}
