# Phase 17B — StorageAdapter Scaffold behind LocalStorage/no-op Driver

## Result

PASS — runtime scaffold + docs / static-validator / CI.

**FINAL_STATUS: 0**

---

## Phase Goal

Introduce the first **StorageAdapter scaffold** behind the current localStorage behavior.

This phase creates a minimal adapter contract (`StorageAdapter`) and a LocalStorage/no-op adapter (`LocalStorageAdapter`) that preserves existing behavior exactly. Exactly one low-risk module — `src/state/recommendationFeedbackStorage.js` — is migrated to route its storage reads/writes through the adapter registry. All other modules are unchanged.

This phase is **not** an IndexedDB phase.
This phase is **not** a migration phase.
This phase is **not** a sync phase.

---

## Why This Follows Phase 17A

Phase 16L locked the architecture rule:

> Storage migration must trail safety, not lead it.

Phase 17A added the backup/rollback harness foundation: `captureRestoreSnapshot`, `verificationMismatches`, `checkStorageHeadroomForBytes`, `estimateV2BackupReadiness`. These patterns establish the vocabulary and test harness that future migration phases depend on.

Phase 17B is the narrowest possible next step: introduce a thin adapter contract while keeping the actual backend as localStorage. No migration, no dual-write, no IndexedDB, no EventLog.

---

## What StorageAdapter Scaffold Was Added

### `src/storage/StorageAdapter.js`

Minimal abstract contract defining the key-value adapter shape for the v2 storage family.

Methods:
- `readRaw(key)` — returns `string|null`
- `writeRaw(key, value)` — returns `{ ok, error? }`
- `removeRaw(key)` — returns `{ ok, error? }`
- `readJson(key, fallback)` — JSON parse with fallback, does not auto-delete on parse error
- `writeJson(key, value)` — serialize and delegate to writeRaw
- `hasStorageSupport()` — advisory boolean
- `isQuotaError(error)` — quota error classifier

All methods are synchronous (matching existing localStorage callers).

### `src/storage/LocalStorageAdapter.js`

No-op/passthrough driver. Wraps `window.localStorage` (via `src/utils/storage.js`'s `getLocalStorage()`) and preserves the exact behavior of existing direct localStorage calls. No new schema. No migration metadata. No driver switching.

### `src/storage/storageAdapterRegistry.js`

Tiny registry with three exports:
- `getStorageAdapter()` — returns the active adapter (production default: `LocalStorageAdapter`)
- `setStorageAdapterForTests(adapter)` — test override
- `resetStorageAdapterForTests()` — restore production default

No user-facing setting. No feature flag. No driver state machine.

---

## Why LocalStorageAdapter Is a No-op/Current-Behavior Driver

`LocalStorageAdapter` is not a migration layer — it is a thin wrapper that delegates to the same `window.localStorage` API that callers were already using directly. The key name, schema version, and all data semantics are unchanged. The only difference is that reads and writes flow through the adapter interface instead of direct `storage.getItem` / `storage.setItem` calls.

This preserves 100% behavioral compatibility with existing callers, existing tests, and the existing backup/export format.

---

## Which Module Was Migrated and Why

Only `src/state/recommendationFeedbackStorage.js` was migrated.

Rationale:
- Lowest data risk: recommendation feedback is advisory state, not core learning or scheduling data.
- Smallest surface: one module, one storage key (`shimeV2RecommendationFeedbackV1`), well-tested.
- Validates the adapter pattern end-to-end (read/write/remove/publish) without touching any high-risk module.
- Does not affect review schedule, settings, library, study history, study draft, study goal, or study plan progress.

All other storage modules (`reviewScheduleStorage`, `settingsStorage`, `learningDataStore`, `studyHistoryStorage`, `studyDraftStorage`, `studyGoalStorage`, `studyPlanProgressStorage`) are unchanged.

---

## What Did Not Change

- `V2_BACKUP_SCHEMA_VERSION` — **no schema version bump**.
- Backup file format — unchanged.
- Storage key names — unchanged.
- Existing exported API of `recommendationFeedbackStorage.js` — unchanged.
- `localStorageSync` publication behavior — preserved.
- All other storage modules — unchanged.
- `package.json` / `package-lock.json` — unchanged.
- `e2e/` tests — unchanged.

---

## No IndexedDB

No IndexedDB runtime was introduced. No `IDBDatabase`, `IDBObjectStore`, `openDB`, `indexedDB.open`, `idb`, `dexie`, or `localforage` usage. `src/storage/IndexedDBAdapter.js` was not created.

---

## No Migration

No storage migration was performed. No data was moved between storage backends. No migration state machine. No backup schema version bump. No storage schema migration. No import parser semantics changes.

---

## No Dual-Write

No dual-write was implemented. Each storage operation writes to exactly one backend (localStorage via `LocalStorageAdapter`). No SyncAdapter, no EventLog runtime, no cloud sync, no account/auth, no backend integration.

---

## No Sync / Cloud / Account / Auth

No sync, cloud backup, account system, or authentication was implemented. The adapter is a local-only, browser-local storage interface.

---

## No EventLog

`src/storage/EventLog.js` was not created. No event log runtime.

---

## No Backup Format Migration

`V2_BACKUP_SCHEMA_VERSION` remains `shime-v2-backup-v1`. The backup/export format is unchanged. No backup format migration.

---

## No Storage Schema Migration

No storage schema migration was performed. Existing schemas for all modules are unchanged.

---

## No Import Parser Semantics Change

No import parser semantics were changed. `src/data/importValidator.js` and `src/data/learningDataAdapter.js` are unchanged.

---

## No Review Schedule / Settings / Library Migration

`reviewScheduleStorage`, `settingsStorage`, `learningDataStore`, `studyHistoryStorage`, `studyDraftStorage`, `studyGoalStorage`, and `studyPlanProgressStorage` were not modified.

---

## No FSRS / EduGen / Scheduler Behavior Change

No FSRS, EduGen, or scheduler runtime was modified. `fsrsWrapper.js`, `reviewSchedulerAdapter.js`, and all EduGen modules are unchanged.

---

## Validation Evidence Expected

- `npm run build` passes.
- `npm run test:unit` passes (including `tests/unit/storageAdapterScaffold.test.js` and `tests/unit/recommendationFeedbackStorageAdapter.test.js`).
- `node scripts/validate-phase17a-backup-rollback-harness-before-migration.js` passes.
- `node scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js` passes.
- Full validator chain `FINAL_STATUS=0`.

---

## Forbidden (confirmed not present)

- No IndexedDB runtime.
- No `src/storage/IndexedDBAdapter.js`, `SyncAdapter.js`, or `EventLog.js`.
- No sync / cloud / account / auth / backend path.
- No backup schema version bump.
- No storage schema migration.
- No import parser semantics change.
- No FSRS / EduGen / scheduler behavior change.
- No `package.json` / `package-lock.json` change.
- No e2e changes.
- No StorageAdapter production migration beyond the one low-risk module.
- No public claims of: guaranteed data safety, cloud sync, E2EE, IndexedDB done, StorageAdapter production migration complete, public active FSRS rollout, built-in AI/OCR.

---

## Next Phase Dependency

**Phase 17C — IndexedDB Migration Dry-Run Harness**

Phase 17C must be dry-run only — it must not perform live migration or move data between storage backends. Live migration must follow a separate, fully-gated phase. Phase 17C may require Opus 4.7 if risk appears high.

Phase 17B must be merged and FINAL_STATUS=0 before Phase 17C begins.
