import { getStorageAdapter } from '../storage/storageAdapterRegistry.js';

export const PHASE24E_TEST_BACKUP_SCHEMA_VERSION = 1;

function createTestOnlyManifest(entries) {
  return {
    schemaVersion: PHASE24E_TEST_BACKUP_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    testOnly: true,
    adapterBoundary: {
      scaffold: 'phase24e_adapter_aware_backup_restore_test_only',
      readPath: 'getStorageAdapter().readRaw',
      writePath: 'getStorageAdapter().writeRaw'
    },
    entries
  };
}

function invalidSnapshot(errorCode) {
  return { ok: false, errorCode };
}

function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    return invalidSnapshot('invalid_snapshot');
  }
  if (snapshot.schemaVersion !== PHASE24E_TEST_BACKUP_SCHEMA_VERSION) {
    return invalidSnapshot('unsupported_schema_version');
  }
  if (snapshot.testOnly !== true) {
    return invalidSnapshot('not_test_only_snapshot');
  }
  if (!snapshot.adapterBoundary || typeof snapshot.adapterBoundary !== 'object') {
    return invalidSnapshot('missing_adapter_boundary');
  }
  if (!Array.isArray(snapshot.entries)) {
    return invalidSnapshot('invalid_entries');
  }

  const seen = new Set();
  for (const entry of snapshot.entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return invalidSnapshot('invalid_entry');
    }
    if (typeof entry.key !== 'string' || entry.key.length === 0) {
      return invalidSnapshot('invalid_entry_key');
    }
    if (seen.has(entry.key)) {
      return invalidSnapshot('duplicate_entry_key');
    }
    seen.add(entry.key);

    if (entry.missing === true) {
      if ('value' in entry) return invalidSnapshot('missing_entry_has_value');
      continue;
    }
    if (entry.missing !== false || typeof entry.value !== 'string') {
      return invalidSnapshot('invalid_entry_value');
    }
  }

  return { ok: true };
}

// Phase 24E test-only/scaffold-only helper. It is intentionally not imported by
// production backup/export/restore runtime and does not define a production file format.
export function createAdapterAwareBackupTestSnapshot(keys) {
  if (!Array.isArray(keys)) {
    return { ok: false, errorCode: 'invalid_keys' };
  }
  if (!keys.every(key => typeof key === 'string' && key.length > 0)) {
    return { ok: false, errorCode: 'invalid_key' };
  }

  const adapter = getStorageAdapter();
  const entries = [];

  try {
    for (const key of keys) {
      const value = adapter.readRaw(key);
      entries.push(value == null
        ? { key, missing: true }
        : { key, missing: false, value });
    }
  } catch (error) {
    return {
      ok: false,
      errorCode: 'storage_read_failed',
      storageError: error,
      snapshot: createTestOnlyManifest(entries)
    };
  }

  return {
    ok: true,
    snapshot: createTestOnlyManifest(entries)
  };
}

// Phase 24E test-only/scaffold-only preview. It validates and reports intent only.
export function previewAdapterAwareRestoreTestSnapshot(snapshot) {
  const validation = validateSnapshot(snapshot);
  if (!validation.ok) return validation;

  return {
    ok: true,
    dryRun: true,
    wouldWrite: snapshot.entries
      .filter(entry => entry.missing === false)
      .map(entry => ({ key: entry.key, valueLength: entry.value.length })),
    skippedMissing: snapshot.entries
      .filter(entry => entry.missing === true)
      .map(entry => ({ key: entry.key }))
  };
}

// Phase 24E test-only/scaffold-only restore. Writes require confirmOverwrite: true.
export function restoreAdapterAwareBackupTestSnapshot(snapshot, options = {}) {
  const validation = validateSnapshot(snapshot);
  if (!validation.ok) return validation;

  const entriesToWrite = snapshot.entries.filter(entry => entry.missing === false);
  if (options.dryRun === true) {
    return {
      ok: true,
      dryRun: true,
      wrote: [],
      verification: entriesToWrite.map(entry => ({
        key: entry.key,
        expectedValue: entry.value,
        verified: false,
        skipped: 'dry_run'
      }))
    };
  }
  if (options.confirmOverwrite !== true) {
    return { ok: false, errorCode: 'confirm_overwrite_required' };
  }

  const adapter = getStorageAdapter();
  const wrote = [];
  try {
    for (const entry of entriesToWrite) {
      const result = adapter.writeRaw(entry.key, entry.value);
      if (!result || result.ok !== true) {
        return {
          ok: false,
          errorCode: result?.error || 'storage_write_failed',
          wrote
        };
      }
      wrote.push({ key: entry.key });
    }

    const verification = [];
    for (const entry of entriesToWrite) {
      const actualValue = adapter.readRaw(entry.key);
      verification.push({
        key: entry.key,
        expectedValue: entry.value,
        actualValue,
        verified: actualValue === entry.value
      });
    }

    return {
      ok: verification.every(entry => entry.verified),
      wrote,
      verification
    };
  } catch (error) {
    return {
      ok: false,
      errorCode: 'storage_restore_failed',
      storageError: error,
      wrote
    };
  }
}
