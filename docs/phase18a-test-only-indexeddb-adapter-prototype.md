# Phase 18A — Test-Only IndexedDBAdapter Prototype

## Purpose

Phase 18A introduces a **test-only IndexedDBAdapter prototype** that proves the adapter contract behavior using synthetic fixtures and an injectable fake backend. It does not switch production storage, does not migrate real data, and does not add user-facing migration UI.

This is the first Phase 18 implementation step after the Phase 17I readiness gate.

## Relationship to Phase 17I Gate

Phase 17I closed the Phase 17 local migration readiness track and gates Phase 18A explicitly. Phase 17I verified that:

- Phase 17A: Backup/rollback harness proved snapshot safety before any migration.
- Phase 17B: StorageAdapter scaffold behind LocalStorage/no-op driver was safe.
- Phase 17C: IndexedDB dry-run harness proved read-only diagnostic safety.
- Phase 17D: Migration Journal / Event Log Architecture was designed.
- Phase 17E: Per-Key Migration Manifest Design was documented.
- Phase 17F: Test-only Migration Journal Prototype with 54 unit tests.
- Phase 17G: Single-Key Dry-Run Migration Rehearsal with 63 unit tests.
- Phase 17H: Single-Key Reversible Migration Pilot behind test-only gate.

Phase 17I's acceptance criteria required that Phase 18A be a test-only IndexedDBAdapter prototype only — no production migration and no registry switch.

## Why it remains test-only

Phase 18A remains test-only because:

1. IndexedDB production storage has not been validated under real user data conditions.
2. Production migration requires backup/export compatibility audits (Phase 18B).
3. Manual migration UX needs to be designed before user-facing changes (Phase 18C).
4. Internal pilot migration must be tested in isolation before any user-facing rollout (Phase 18D).
5. Limited local backend pilot with rollback gates is required before broader activation (Phase 18E).

The adapter prototype exists only to prove the **adapter contract** — open/init, store readiness, get/set/remove/list/clear, failure handling — without touching real user data.

## What it models

### Adapter contract behavior

The prototype exposes a factory:

```js
createIndexedDbAdapterTestPrototype({
  indexedDBLike,
  databaseName,
  storeName,
  version,
  clock,
})
```

Where `indexedDBLike` is an injectable fake IDB-like backend. The adapter never accesses the real browser global `indexedDB`.

### open/init

- `init()` calls `indexedDBLike.open(databaseName, storeName)` on the injected fake.
- If the backend is unavailable (no `open()` method), `init()` returns `{ ok: false, error: 'idb_unavailable' }`.
- If open fails (simulated), `init()` returns `{ ok: false, error: 'idb_open_failed' }`.
- On success, `init()` returns `{ ok: true, databaseName, storeName, version }`.
- A second `init()` call returns `{ ok: true, alreadyInitialized: true }`.

### Object-store readiness

- The adapter tracks initialization state internally.
- All operations (`getItem`, `setItem`, `removeItem`, `listKeys`, `clear`) reject with `not_initialized` before `init()` is called.
- The `_state` accessor exposes `{ initialized, databaseName, storeName, version }`.

### Synthetic set/get/remove/list/clear behavior

- `setItem(key, value)` deep-copies the value (structured clone-like) and stores it.
- `getItem(key)` returns a deep copy of the stored value.
- `removeItem(key)` deletes the key; returns `{ existed: true/false }`.
- `listKeys()` returns alphabetically sorted keys for determinism.
- `clear()` removes all keys; returns `{ clearedCount }`.

### Unsupported-browser fallback

`createUnavailableIndexedDBLike()` produces a backend with no `open()` method. When injected:

- `isAvailable()` returns `false`.
- `init()` returns `{ ok: false, error: 'idb_unavailable' }`.

### Failure handling

- `createFakeIndexedDBLike({ shouldFailOpen: true })` — simulates open failure.
- `createFakeIndexedDBLike({ shouldFailTransaction: true })` — simulates write failure.
- All failures return explicit error codes: `idb_open_failed`, `transaction_failed`.

## What it explicitly does not implement

- **no production IndexedDBAdapter** — `src/storage/IndexedDBAdapter.js` does not exist.
- **no production registry switch** — `src/storage/storageAdapterRegistry.js` is unchanged.
- **no live migration** — no real data is moved between storage backends.
- **no dual-write** — no parallel write to both LocalStorage and IndexedDB.
- **no runtime manifest** — no MigrationManifest runtime loader.
- **no runtime EventLog** — `src/storage/EventLog.js` does not exist.
- **no runtime MigrationJournal** — `src/storage/MigrationJournal.js` does not exist.
- **no migration engine** — no migration orchestrator or runner.
- **no app boot migration** — app boot does not trigger any migration.
- **no user-facing migration UI** — no Settings panel, banner, or prompt for migration.
- **no real data movement** — no localStorage values are read, moved, or deleted.
- **no localStorage deletion** — localStorage is not cleared or modified.
- **no sync/cloud/account/auth/backend** — no remote storage, no sync, no auth changes.
- **no FSRS changes** — FSRS scheduling is unaffected.
- **no EduGen changes** — EduGen connectors and import flows are unaffected.
- **no scheduler changes** — quiz scheduling is unaffected.
- **no import parser changes** — import parsers are unaffected.
- **no backup schema changes** — backup format is unaffected.
- **no storage schema behavior changes** — active storage schema is unchanged.

## Safety invariants

1. **Synthetic data only** — the adapter prototype uses only injected synthetic data.
2. **Injected fake IndexedDB-like backend** — no access to `globalThis.indexedDB` or `window.indexedDB`.
3. **No production imports** — the helper imports no `src/` modules and no production storage adapters.
4. **No global browser storage dependency** — the helper does not reference `localStorage`, `window.localStorage`, `indexedDB`, or `document`.
5. **No localStorage read/write/delete** — localStorage is untouched.
6. **No production claims** — the helper and tests contain explicit `claimBoundary` strings that state test-only scope.
7. **docs/static-validator/ci-only scope for Phase 18A** — Phase 18A adds only test helpers, unit tests, docs, a validator, and CI registration. No production code is modified.

## Future sequencing

- **Phase 18B** — backup/export compatibility audit for adapter-backed storage.
- **Phase 18C** — manual migration UX plan.
- **Phase 18D** — internal/test-only local migration pilot.
- **Phase 18E** — limited local backend pilot with rollback gates.

## Acceptance criteria

- `tests/unit/helpers/indexedDbAdapterTestPrototype.js` exists and contains only test-only logic.
- `tests/unit/indexedDbAdapterTestPrototype.test.js` exists with at least 20 test groups covering all required scenarios.
- `docs/phase18a-test-only-indexeddb-adapter-prototype.md` exists and satisfies all required terms.
- `scripts/validate-phase18a-test-only-indexeddb-adapter-prototype.js` exists and passes.
- `.github/workflows/e2e-smoke.yml` registers Phase 18A validator after Phase 17I.
- `package.json` and `package-lock.json` are unchanged.
- `src/storage/IndexedDBAdapter.js` does not exist.
- `src/storage/EventLog.js` does not exist.
- `src/storage/MigrationJournal.js` does not exist.
- `src/storage/SyncAdapter.js` does not exist.
- `src/storage/storageAdapterRegistry.js` is unchanged.
- `src/storage/StorageAdapter.js` is unchanged.
- `src/storage/LocalStorageAdapter.js` is unchanged.
- `src/storage/indexedDbDryRunHarness.js` is unchanged.
- No production `src/` file is modified.
- No `e2e/` file is modified.
- All unit tests pass.
- Validator chain is green (`FINAL_STATUS=0`).
