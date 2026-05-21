import { afterEach, describe, expect, it } from 'vitest';
import { StorageAdapter } from '../../src/storage/StorageAdapter.js';
import {
  resetStorageAdapterForTests,
  setStorageAdapterForTests
} from '../../src/storage/storageAdapterRegistry.js';
import {
  PHASE24E_TEST_BACKUP_SCHEMA_VERSION,
  createAdapterAwareBackupTestSnapshot,
  previewAdapterAwareRestoreTestSnapshot,
  restoreAdapterAwareBackupTestSnapshot
} from '../../src/state/adapterAwareBackupRestoreTestScaffold.js';

const KEY_ONE = 'phase24e_test_one';
const KEY_TWO = 'phase24e_test_two';
const KEY_MISSING = 'phase24e_test_missing';

class MemoryAdapter extends StorageAdapter {
  constructor(initialData = {}) {
    super();
    this._store = new Map(Object.entries(initialData));
    this.writeCalls = [];
  }

  hasStorageSupport() { return true; }

  readRaw(key) {
    return this._store.has(key) ? this._store.get(key) : null;
  }

  writeRaw(key, value) {
    this.writeCalls.push({ key, value });
    this._store.set(key, value);
    return { ok: true };
  }

  removeRaw(key) {
    this._store.delete(key);
    return { ok: true };
  }
}

class ThrowingReadAdapter extends MemoryAdapter {
  readRaw() {
    throw new Error('phase24e_test_read_failure');
  }
}

class ThrowingWriteAdapter extends MemoryAdapter {
  writeRaw() {
    throw new Error('phase24e_test_write_failure');
  }
}

afterEach(() => {
  resetStorageAdapterForTests();
});

describe('Phase 24E adapter-aware backup restore test-only scaffold', () => {
  it('snapshot reads explicit keys through active StorageAdapter', () => {
    setStorageAdapterForTests(new MemoryAdapter({ [KEY_ONE]: 'alpha', [KEY_TWO]: 'beta' }));

    const result = createAdapterAwareBackupTestSnapshot([KEY_ONE, KEY_TWO]);

    expect(result.ok).toBe(true);
    expect(result.snapshot).toMatchObject({
      schemaVersion: PHASE24E_TEST_BACKUP_SCHEMA_VERSION,
      testOnly: true,
      adapterBoundary: {
        scaffold: 'phase24e_adapter_aware_backup_restore_test_only'
      },
      entries: [
        { key: KEY_ONE, missing: false, value: 'alpha' },
        { key: KEY_TWO, missing: false, value: 'beta' }
      ]
    });
  });

  it('rejects missing or non-array keys input safely', () => {
    expect(createAdapterAwareBackupTestSnapshot()).toMatchObject({
      ok: false,
      errorCode: 'invalid_keys'
    });
    expect(createAdapterAwareBackupTestSnapshot(KEY_ONE)).toMatchObject({
      ok: false,
      errorCode: 'invalid_keys'
    });
    expect(createAdapterAwareBackupTestSnapshot([KEY_ONE, null])).toMatchObject({
      ok: false,
      errorCode: 'invalid_key'
    });
  });

  it('missing keys are represented safely', () => {
    setStorageAdapterForTests(new MemoryAdapter({ [KEY_ONE]: 'alpha' }));

    const result = createAdapterAwareBackupTestSnapshot([KEY_ONE, KEY_MISSING]);

    expect(result.ok).toBe(true);
    expect(result.snapshot.entries).toEqual([
      { key: KEY_ONE, missing: false, value: 'alpha' },
      { key: KEY_MISSING, missing: true }
    ]);
  });

  it('preview rejects corrupt malformed payload without writes', () => {
    const adapter = new MemoryAdapter();
    setStorageAdapterForTests(adapter);
    const corruptPayload = { testOnly: true, entries: [{ key: KEY_ONE, value: 'alpha' }] };

    const result = previewAdapterAwareRestoreTestSnapshot(corruptPayload);

    expect(result).toMatchObject({ ok: false, errorCode: 'unsupported_schema_version' });
    expect(adapter.writeCalls).toEqual([]);
  });

  it('dry-run restore performs no writes and returns verification details', () => {
    const adapter = new MemoryAdapter();
    setStorageAdapterForTests(adapter);
    const snapshot = createAdapterAwareBackupTestSnapshot([KEY_MISSING]).snapshot;
    const writeSnapshot = {
      ...snapshot,
      entries: [{ key: KEY_ONE, missing: false, value: 'alpha' }]
    };

    const result = restoreAdapterAwareBackupTestSnapshot(writeSnapshot, { dryRun: true });

    expect(result).toMatchObject({
      ok: true,
      dryRun: true,
      wrote: [],
      verification: [
        {
          key: KEY_ONE,
          expectedValue: 'alpha',
          verified: false,
          skipped: 'dry_run'
        }
      ]
    });
    expect(adapter.writeCalls).toEqual([]);
    expect(adapter.readRaw(KEY_ONE)).toBeNull();
  });

  it('restore requires explicit confirmOverwrite true', () => {
    const adapter = new MemoryAdapter();
    setStorageAdapterForTests(adapter);
    const snapshot = {
      schemaVersion: PHASE24E_TEST_BACKUP_SCHEMA_VERSION,
      createdAt: '2026-05-21T00:00:00.000Z',
      testOnly: true,
      adapterBoundary: { scaffold: 'phase24e_adapter_aware_backup_restore_test_only' },
      entries: [{ key: KEY_ONE, missing: false, value: 'alpha' }]
    };

    const result = restoreAdapterAwareBackupTestSnapshot(snapshot);

    expect(result).toMatchObject({ ok: false, errorCode: 'confirm_overwrite_required' });
    expect(adapter.writeCalls).toEqual([]);
  });

  it('restore writes expected entries when confirmed and returns verification details', () => {
    const adapter = new MemoryAdapter();
    setStorageAdapterForTests(adapter);
    const snapshot = {
      schemaVersion: PHASE24E_TEST_BACKUP_SCHEMA_VERSION,
      createdAt: '2026-05-21T00:00:00.000Z',
      testOnly: true,
      adapterBoundary: { scaffold: 'phase24e_adapter_aware_backup_restore_test_only' },
      entries: [
        { key: KEY_ONE, missing: false, value: 'alpha' },
        { key: KEY_MISSING, missing: true }
      ]
    };

    const result = restoreAdapterAwareBackupTestSnapshot(snapshot, { confirmOverwrite: true });

    expect(result.ok).toBe(true);
    expect(result.wrote).toEqual([{ key: KEY_ONE }]);
    expect(result.verification).toEqual([
      {
        key: KEY_ONE,
        expectedValue: 'alpha',
        actualValue: 'alpha',
        verified: true
      }
    ]);
    expect(adapter.readRaw(KEY_ONE)).toBe('alpha');
    expect(adapter.readRaw(KEY_MISSING)).toBeNull();
  });

  it('same-adapter round trip works for test keys', () => {
    const adapter = new MemoryAdapter({ [KEY_ONE]: 'alpha', [KEY_TWO]: 'beta' });
    setStorageAdapterForTests(adapter);
    const snapshotResult = createAdapterAwareBackupTestSnapshot([KEY_ONE, KEY_TWO]);

    adapter.writeRaw(KEY_ONE, 'changed');
    adapter.writeRaw(KEY_TWO, 'changed');
    const restoreResult = restoreAdapterAwareBackupTestSnapshot(snapshotResult.snapshot, {
      confirmOverwrite: true
    });

    expect(restoreResult.ok).toBe(true);
    expect(adapter.readRaw(KEY_ONE)).toBe('alpha');
    expect(adapter.readRaw(KEY_TWO)).toBe('beta');
  });

  it('throwing adapter read and write failures are handled without uncaught throw', () => {
    setStorageAdapterForTests(new ThrowingReadAdapter({ [KEY_ONE]: 'alpha' }));

    expect(() => createAdapterAwareBackupTestSnapshot([KEY_ONE])).not.toThrow();
    expect(createAdapterAwareBackupTestSnapshot([KEY_ONE])).toMatchObject({
      ok: false,
      errorCode: 'storage_read_failed'
    });

    setStorageAdapterForTests(new ThrowingWriteAdapter());
    const snapshot = {
      schemaVersion: PHASE24E_TEST_BACKUP_SCHEMA_VERSION,
      createdAt: '2026-05-21T00:00:00.000Z',
      testOnly: true,
      adapterBoundary: { scaffold: 'phase24e_adapter_aware_backup_restore_test_only' },
      entries: [{ key: KEY_ONE, missing: false, value: 'alpha' }]
    };

    expect(() => restoreAdapterAwareBackupTestSnapshot(snapshot, { confirmOverwrite: true })).not.toThrow();
    expect(restoreAdapterAwareBackupTestSnapshot(snapshot, { confirmOverwrite: true })).toMatchObject({
      ok: false,
      errorCode: 'storage_restore_failed'
    });
  });
});
