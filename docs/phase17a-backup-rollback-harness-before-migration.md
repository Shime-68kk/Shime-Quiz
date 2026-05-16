# Phase 17A — Backup/Rollback Harness BEFORE Migration

## Result

PASS — docs / static-validator / CI only + bounded runtime safety harness.

**FINAL_STATUS: 0**

---

## Phase Goal

Strengthen backup/restore safety and rollback observability **before** any StorageAdapter, IndexedDB, sync, EventLog, or migration runtime exists.

This is the gate before Phase 17B (StorageAdapter Scaffold). Storage migration must trail safety — not lead it.

---

## Why Backup/Rollback Harness Comes Before Migration

Phase 16L locked this architecture rule:

> Storage migration must trail safety, not lead it.

Phase 17A closes five risks identified by the Phase 16L ADR audit before any migration work begins:

1. **Backup probe write / doubled write quota risk** — the restore preflight temporarily doubles storage usage with a concatenated probe write. Phase 17A adds an advisory headroom helper (`checkStorageHeadroomForBytes`) that callers can use before initiating large backup/restore operations, reducing unnecessary probe risk.
2. **Sequential restore with best-effort rollback only** — rollback existed but was implicit. Phase 17A adds `captureRestoreSnapshot` as a public export so tests and callers can use it explicitly.
3. **No migration dry-run / read-after-write / rollback contract** — Phase 17A adds `verifyRestoredWrite` (internal) called after each storage write. Mismatches are collected in `verificationMismatches` on the restore result and reported as advisory (non-fatal). This establishes the read-after-write verification pattern for future migration phases.
4. **Parse/schema mismatch auto-removal is a silent data-loss risk** — this is a future migration concern; Phase 17A does not change import/parser semantics but documents the boundary.
5. **Future migration needs explicit status/recovery semantics** — Phase 17A establishes the vocabulary (`captureRestoreSnapshot`, `verificationMismatches`, `estimateV2BackupReadiness`) but does not implement IndexedDB, StorageAdapter, or migration state machines.

---

## What Runtime Safety Changed

### Added: `checkStorageHeadroomForBytes(neededBytes)` in `src/utils/storageQuotaEstimate.js`

Async advisory helper. Calls `navigator.storage.estimate()` and compares available bytes against a needed amount.

- Returns `{ ok: true, estimated: false, reason }` when the API is unavailable or input is invalid — never blocks.
- Returns `{ ok: true, estimated: true, available, neededBytes }` when enough headroom exists.
- Returns `{ ok: false, estimated: true, available, neededBytes, reason: 'insufficient_space' }` when headroom is insufficient.

This is **advisory only** — it does not prevent backup creation. Callers surface the warning to users.

### Added: `estimateV2BackupReadiness(payload)` in `src/state/v2BackupRestore.js`

Synchronous helper. Computes the estimated byte size of a backup payload using the existing `estimateV2BackupPayloadSize` function. Returns `{ ok, estimatedBytes, sections }` or an error object for invalid input.

Intended for pre-export advisory display. Does not touch storage or change the backup format.

### Added: `captureRestoreSnapshot(storage, writes)` in `src/state/v2BackupRestore.js`

Public export of the existing `snapshotRestoreKeys` function. Returns a `Map<key, value>` of the current storage state for all write targets — before any restore writes happen. Makes rollback harness behavior explicit and directly testable.

### Added: Read-after-write verification in `restoreV2BackupPayload`

After each `storage.setItem(write.key, write.value)`, the restore loop now calls `verifyRestoredWrite(storage, write)`. If the read-back value does not match the written value, the mismatch is collected in `verificationMismatches`.

- Mismatches are **advisory and non-fatal**. The restore result includes `verificationMismatches: []` on success.
- If the write itself throws, the existing rollback path runs unchanged.
- In normal localStorage environments, mismatches should not occur. The verification establishes the pattern for future migration phases.

### Unchanged: Preflight probe write

The existing `preflightRestoreWrites` probe-write behavior is unchanged. The `checkStorageHeadroomForBytes` helper can be called by UI callers before triggering restore to reduce unnecessary probe writes when quota is clearly sufficient.

---

## What Did Not Change

- `V2_BACKUP_SCHEMA_VERSION` — **no schema version bump**.
- Backup file format — unchanged.
- Restore section semantics — unchanged.
- Import parser semantics — unchanged.
- No IndexedDB.
- No StorageAdapter.
- No `src/storage/` directory.
- No sync / cloud / account / auth / backend.
- No backup format migration.
- No storage schema migration.
- No FSRS / EduGen / scheduler behavior change.
- No `package.json` / `package-lock.json` change.
- No e2e changes.

---

## Backup Readiness Behavior

`checkStorageHeadroomForBytes(neededBytes)` is an **advisory** async helper for UI layers:

```js
const headroom = await checkStorageHeadroomForBytes(estimatedBytes);
if (!headroom.ok && headroom.estimated) {
  // Surface advisory warning to user — do not block backup
}
```

`estimateV2BackupReadiness(payload)` is a **sync** size estimator:

```js
const readiness = estimateV2BackupReadiness(payload);
// readiness.estimatedBytes is the approximate serialized size
```

Neither function prevents backup creation. They surface advisory state.

---

## Restore Rollback Behavior

`captureRestoreSnapshot(storage, writes)` returns a `Map` of pre-restore storage values.

If any write fails mid-restore, `rollbackRestoreWrites(storage, snapshot)` restores all keys to their pre-restore state. The result reports `rollbackOk` and `rollbackErrors`.

This is not transactional — rollback is best-effort. If rollback also fails, the errors are reported in `rollbackErrors`. The user can always retry from their backup file.

---

## Read-after-Write / Verification Behavior

After each write in `restoreV2BackupPayload`, the restored value is read back and compared. Mismatches are collected in `verificationMismatches` on the result object.

A mismatch does NOT abort or rollback the restore — it is advisory. In practice, mismatches should not occur in normal localStorage environments. If mismatches are present, the caller can surface a calm advisory notice.

Example result shape:
```js
{ ok: true, validation, writtenSections, verificationMismatches: [] }
```

---

## Migration Readiness Contract (no migration)

Phase 17A establishes the vocabulary and test patterns for future migration safety:

| Term | Where | Purpose |
|------|--------|---------|
| `captureRestoreSnapshot` | v2BackupRestore.js | Pre-write state capture |
| `verificationMismatches` | restore result | Read-after-write check |
| `estimateV2BackupReadiness` | v2BackupRestore.js | Byte-size advisory |
| `checkStorageHeadroomForBytes` | storageQuotaEstimate.js | Quota headroom check |

**No migration state machine. No IndexedDB. No StorageAdapter. No src/storage. No dual-write.**

Future migration phases (Phase 17B+) must use these patterns as a foundation.

---

## User-facing Recovery Copy (if visible)

If the UI surfaces a quota or restore advisory, the copy must be:

- Vietnamese-first and calm
- Honest about local browser storage
- Not fear-heavy

Accepted themes:
- Export/backup trước khi thực hiện thao tác rủi ro (Export backup before risky operations)
- Dữ liệu cũ vẫn còn trên trình duyệt này (Old data remains local)
- Nếu khôi phục không thành công, bạn có thể thử lại từ file sao lưu (If restore fails, you can retry from backup file)

Do not claim:
- Guaranteed recovery / no data loss
- Sync protection of any kind
- E2EE / storage certification

---

## Validation Evidence Expected

- `npm run build` passes.
- `npm run test:unit` passes (including `tests/unit/phase17aBackupRollbackHarness.test.js`).
- `node scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js` passes.
- `node scripts/validate-phase17a-backup-rollback-harness-before-migration.js` passes.
- Full validator chain `FINAL_STATUS=0`.

---

## Forbidden (confirmed not present)

- No IndexedDB runtime.
- No `src/storage/` directory or StorageAdapter / LocalStorageAdapter / IndexedDBAdapter / SyncAdapter / EventLog.
- No sync / cloud / account / auth / backend path.
- No backup schema version bump.
- No storage schema migration.
- No import parser semantics change.
- No FSRS / EduGen / scheduler behavior change.
- No `package.json` / `package-lock.json` change.
- No e2e changes.
- No public claims of: guaranteed data safety, cloud sync, E2EE, IndexedDB done, StorageAdapter done, public active FSRS rollout, built-in AI/OCR.

---

## Next Phase Dependency

**Phase 17B — StorageAdapter Scaffold behind LocalStorage/no-op driver**

Phase 17A must be merged and FINAL_STATUS=0 before Phase 17B begins.
