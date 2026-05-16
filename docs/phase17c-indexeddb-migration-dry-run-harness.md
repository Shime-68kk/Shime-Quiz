# Phase 17C — IndexedDB Migration Dry-Run Harness

## Result

PASS — runtime dry-run harness + docs / static-validator / CI.

**FINAL_STATUS: 0**

---

## Phase Goal

Create a **dry-run-only IndexedDB migration harness** that can evaluate whether future migration would be possible and safe, without moving live app data and without switching any production storage path.

This phase answers:

> Can Shime safely inspect and simulate an IndexedDB-backed migration plan without changing user data, storage backend, or runtime behavior?

This phase is a preparation step only.

---

## Why This Follows Phase 17A and Phase 17B

Phase 16L locked the architecture rule:

> Storage migration must trail safety, not lead it.

Phase 17A added the backup/rollback harness foundation: `captureRestoreSnapshot`, `verificationMismatches`, `checkStorageHeadroomForBytes`, `estimateV2BackupReadiness`. These patterns establish the vocabulary and test harness that future migration phases depend on.

Phase 17B introduced the narrowest possible StorageAdapter scaffold — a thin adapter contract and a LocalStorage/no-op driver — while keeping all production behavior unchanged.

Phase 17C is the next minimal step: introduce a dry-run harness that probes IndexedDB API availability and simulates write/read/cleanup in an isolated temporary database, without touching any Shime app data.

---

## What Dry-Run Harness Was Added

### `src/storage/indexedDbDryRunHarness.js`

Exports four functions:

#### `checkIndexedDbAvailability()`

Synchronous check: does `globalThis.indexedDB` exist and does it have an `open` function? Returns `{ available: boolean, reason?: string }`. Safe if IndexedDB is absent — returns `available: false` instead of throwing.

#### `runIndexedDbDryRun()`

Async end-to-end dry-run: opens a temporary database named `shime-v2-indexeddb-dry-run`, writes synthetic probe data, reads it back, verifies read-after-write correctness, closes, and deletes the temporary database. Returns a structured result:

```js
{
  ok: boolean,
  available: boolean,
  dryRunOnly: true,
  reason?: string,
  steps: string[],
  warnings: string[]
}
```

Safe in all failure modes:
- IndexedDB API absent → `ok: false, available: false` (no throw)
- `indexedDB.open` throws → `ok: false, reason: ...` (caught)
- Open request fires `onerror` → `ok: false` (caught)
- Upgrade transaction failure → `ok: false` (caught)

#### `createIndexedDbDryRunPlan()`

Pure synchronous helper. Returns a plan object describing what a future real migration would require:

```js
{
  dryRunOnly: true,
  gates: [
    'backup exists',
    'rollback snapshot exists',
    'read-after-write verification available',
    'adapter scaffold exists',
    'dry-run IndexedDB capability check passed',
    'manual user confirmation required in future phase',
  ],
  description: string,
  warnings: string[]
}
```

Does not read or write any app data.

#### `cleanupIndexedDbDryRun()`

Async helper to delete the dry-run database if it exists. Safe if IndexedDB is unavailable. Non-fatal on failure.

### Dry-Run Database

The temporary database is named `shime-v2-indexeddb-dry-run`. The name clearly indicates this is a temporary non-production database. It is deleted after the dry-run completes.

---

## What the Dry-Run Harness Does NOT Do

### No Live Migration

No real Shime data is read from localStorage and written to IndexedDB. The harness writes only synthetic probe data (`{ probe: 'shime-dry-run-ok', ts: ... }`) to the temporary dry-run database.

### No Dual-Write

No dual-write mode. No parallel writes to both localStorage and IndexedDB. The production StorageAdapter registry default is unchanged — `LocalStorageAdapter` remains the production default.

### No Production Adapter Switch

`src/storage/storageAdapterRegistry.js` is not modified. `getStorageAdapter()` still returns `LocalStorageAdapter`. The dry-run harness is not imported or referenced by the registry, by any state module, or by any route.

### No App Boot Migration

The dry-run harness is not connected to any app initialization path. It does not run automatically at app boot, on page load, or on any lifecycle event. It can only be invoked explicitly by tests or a future manual diagnostic helper.

### No User-Facing Migration UI

No migration progress indicator. No migration modal or dialog. No migration settings toggle. No banner or notification about IndexedDB migration. No user-visible migration promise.

### No SyncAdapter / EventLog

No EventLog runtime. No `SyncAdapter`, cloud sync, account, or auth of any kind.

### No Backup Schema Migration

`V2_BACKUP_SCHEMA_VERSION` in `v2BackupRestore.js` is unchanged. No backup format migration.

### No Storage Schema Migration

No schema migration, no version bump, no migration marker written to localStorage or IndexedDB.

### No Import Parser Semantics Change

`src/data/importValidator.js` and all import parsing logic are unchanged.

### No FSRS / EduGen / Scheduler Behavior Change

No change to `reviewSchedulerAdapter.js`, `fsrsWrapper.js`, `reviewScheduleStorage.js`, or any EduGen module.

### No localStorage Deletion

The dry-run harness never deletes localStorage data.

---

## Forbidden

The following are not implemented and must not be claimed:

- IndexedDB migration complete
- production IndexedDB backend active
- migration done
- migration is complete
- cloud sync available
- cloud sync is available
- E2EE is available
- public active FSRS rollout
- built-in AI exists
- built-in OCR exists
- guaranteed data safety
- guaranteed recovery
- guaranteed no data loss

---

## Validation Evidence Expected

```text
npm run build              → pass
npm run test:unit          → pass (all existing + new indexedDbDryRunHarness tests)
node scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js   → pass
node scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js     → pass
Full validator chain FINAL_STATUS=0
```

---

## Next Phase Dependency

The immediate next phase is:

**Phase 17D — Event Log Research / Prototype Plan**

If dry-run testing exposed unresolved IndexedDB risk or environment compatibility issues, consider:

**Phase 17C.1 — IndexedDB Dry-Run Hardening**

Do not proceed to live migration, dual-write, driver state machine, or production adapter switching without completing the full gate checklist from `createIndexedDbDryRunPlan()` plus explicit Phase 17D/17E safety validation.
