# Phase 17F — Test-Only Migration Journal Prototype

## Result

docs/static-validator/CI-only (plus test-only helper and unit tests). No src/ changes. No runtime migration.

## Purpose

Phase 17F adds a test-only migration journal prototype that models the journal entry shape, status transitions, write verification metadata, rollback snapshot metadata, and failure codes defined in Phase 17D and Phase 17E — entirely within unit tests, with no production runtime migration.

The prototype exists to prove that the safety design from Phase 17D (Migration Journal / Event Log Architecture) and Phase 17E (Per-Key Migration Manifest Design) is implementable and testable before any real data movement occurs.

Phase 17F explicitly does not implement a runtime EventLog, runtime MigrationJournal, migration engine, IndexedDBAdapter, SyncAdapter, live migration, dual-write, production adapter switch, app boot migration, user-facing migration UI, real data movement, localStorage deletion, or sync/cloud/account/auth/backend.

## Relationship to prior phases

### Phase 17A — Backup/Rollback Harness BEFORE Migration

Phase 17A established that a backup readiness check and restore rollback harness must exist before any migration is attempted. The Phase 17F journal prototype models `rollbackSnapshotRef` and `rollback-ready`/`rolled-back` status transitions in alignment with Phase 17A's requirement that rollback metadata must be captured before any write is permitted.

### Phase 17B — StorageAdapter Scaffold behind LocalStorage/no-op Driver

Phase 17B created the StorageAdapter interface and the LocalStorageAdapter no-op driver. Phase 17F does not modify these production files. The journal prototype is test-only and does not reference the storage adapter registry.

### Phase 17C — IndexedDB Dry-Run Harness

Phase 17C proved IndexedDB API availability via a synthetic dry-run. Phase 17F builds on this precedent by proving journal entry shape and safety rules via a synthetic test-only prototype. The Phase 17F harness, like the Phase 17C dry-run harness, uses no real browser storage.

### Phase 17D — Migration Journal / Event Log Architecture Guardrail

Phase 17D defined the future journal entry model and the required safety rules for migration operations. Phase 17F is the first concrete implementation of that design — as a test-only prototype. The Phase 17F journal entry shape directly models the fields specified in Phase 17D:

- `operationId` → `operationId`
- `sourceStorageKey` → `sourceKey`
- `targetStorageArea` → `targetStore`
- `dryRun` → `mode` (dry-run / test)
- `backupSnapshotReference` → `rollbackSnapshotRef`
- `rollbackStatus` → transitions through `rollback-ready` and `rolled-back`
- `writeVerificationStatus` → `writeVerification` with `verified` flag
- `readBeforeWriteStatus` → `readBeforeWriteChecksum`

### Phase 17E — Per-Key Migration Manifest Design

Phase 17E defined the per-key migration manifest entry shape. Phase 17F's journal entry includes `manifestId`, `sourceKey`, `targetStore`, `dataFamily`, `operationType`, `sourceChecksum`, `targetChecksum`, `readBeforeWriteChecksum`, and `claimBoundary` — all derived from the Phase 17E manifest design. The journal prototype models how a future migration runner would record per-key progress against a manifest entry.

## Why Phase 17F is test-only

Phase 17F is test-only because:

1. No real user data must move until the full safety chain (backup → journal → verify → confirm → rollback-ready) has been proven to work end-to-end at the single-key level.
2. The journal entry shape must be validated in unit tests before any runtime module that depends on it is written.
3. Phase 17D explicitly required a test-only prototype phase before any live migration to avoid the risk of corrupt or partial writes reaching production storage.
4. The Phase 17A safety invariant — backup-before-migration — has not yet been connected to a live migration trigger. Phase 17F is the precursor step before that connection.
5. This is docs/static-validator/CI-only plus test-only: no src/ changes.

## What the prototype models

### Journal entry shape

Each migration journal entry models:

- `journalId` — unique identifier for the journal record
- `operationId` — unique identifier for the migration operation
- `manifestId` — reference to the Phase 17E manifest entry this operation follows
- `sourceKey` — the localStorage key being migrated (synthetic only in Phase 17F)
- `targetStore` — the IndexedDB store name (synthetic only in Phase 17F)
- `dataFamily` — the data family (settings, quiz, review schedule, etc.)
- `operationType` — the operation type (copy, move, etc.)
- `mode` — `dry-run` or `test` (Phase 17F test-only gate; live mode is rejected)
- `status` — current status in the lifecycle
- `timestamp` — ISO-8601 timestamp of entry creation
- `sourceChecksum` — hash of source data before migration (synthetic in Phase 17F)
- `targetChecksum` — hash of target data after write (null until write occurs)
- `readBeforeWriteChecksum` — hash of target store contents before write (null until measured)
- `writeVerification` — result of read-after-write verification (null until verified)
- `rollbackSnapshotRef` — inert metadata reference to rollback snapshot (null until captured)
- `errorCode` — explicit error code if migration fails (null unless failed)
- `claimBoundary` — explicit statement of scope and claim (must be set explicitly)

### Status transitions

The prototype models the following status lifecycle:

```
planned
  └→ backup-captured    (backup must be captured before write)
       └→ write-attempted
            └→ write-verified    (read-after-write verified)
            │    └→ completed    (only if writeVerification.verified === true)
            │    └→ rollback-ready (if rollbackSnapshotRef present)
            └→ rollback-ready    (if rollbackSnapshotRef present)
  (any status except terminal) └→ failed (must include errorCode)
  failed └→ rollback-ready
  rollback-ready └→ rolled-back  (only if rollbackSnapshotRef present)
```

Terminal states are `completed` and `rolled-back`. No transitions are allowed from terminal states.

### Write verification metadata

The `writeVerification` field models the result of a read-after-write check. Completion (`completed` status) requires `writeVerification.verified === true`. This enforces the Phase 17D invariant: no delete-before-verified-copy.

### Rollback snapshot metadata

The `rollbackSnapshotRef` field models an inert reference to a rollback snapshot captured before the write. It is metadata only — no actual snapshot data is stored in Phase 17F. The invariants are:

- `rollback-ready` status requires `rollbackSnapshotRef` to be non-null.
- `rolled-back` status requires `rollbackSnapshotRef` to be non-null.
- These guards prevent rollback from being attempted without evidence that a snapshot was captured.

### Failure codes

The `errorCode` field must be a non-empty string when transitioning to `failed`. This enforces the Phase 17D requirement for explicit failure categorization. Example codes: `quota_exceeded`, `schema_mismatch`, `read_after_write_failed`, `partial_write_detected`.

### Dry-run / test-only mode

Phase 17F permits only `mode: 'dry-run'` or `mode: 'test'`. Any entry with `mode: 'live'` or any other live production mode is rejected at creation time and by the `rejectLiveMode` guard. This is the Phase 17F test-only gate.

## What Phase 17F explicitly does not implement

Non-goals: no runtime EventLog, no runtime MigrationJournal, no migration engine, no IndexedDBAdapter, no SyncAdapter, no live migration, no dual-write, no production adapter switch, no app boot migration, no user-facing migration UI, no real data movement, no localStorage deletion.

Phase 17F does not implement:

- **runtime EventLog** — no `src/storage/EventLog.js` is created
- **runtime MigrationJournal** — no `src/storage/MigrationJournal.js` is created
- **migration engine** — no migration runner, scheduler, or orchestrator is created
- **IndexedDBAdapter** — no `src/storage/IndexedDBAdapter.js` is created
- **SyncAdapter** — no `src/storage/SyncAdapter.js` is created
- **live migration** — no real data is copied, moved, or transformed
- **dual-write** — no data is written to two stores simultaneously
- **production adapter switch** — the production adapter registry is not modified
- **app boot migration** — no migration runs at application startup
- **user-facing migration UI** — no settings panel, progress indicator, or migration prompt is added
- **real data movement** — no localStorage keys are read from or written to
- **localStorage deletion** — no localStorage data is removed
- **sync/cloud/account/auth/backend** — no cloud, sync, auth, or backend runtime is added
- **FSRS changes** — no FSRS behavior is modified
- **EduGen changes** — no EduGen behavior is modified
- **scheduler changes** — no review scheduler is modified
- **import parser changes** — no import parser semantics are changed
- **backup schema changes** — no backup schema version is bumped
- **storage schema changes** — no storage schema is modified

## Safety invariants

The following safety invariants from Phase 17A–17E are modeled in the Phase 17F prototype and must remain non-negotiable in all future migration phases:

1. **backup-before-migration** — `rollbackSnapshotRef` must be attached (Phase 17A) before any write is permitted in a live migration.
2. **no delete-before-verified-copy** — `completed` status requires `writeVerification.verified === true`. No data may be deleted before the copy is verified.
3. **write verification before completion** — `completeEntry()` rejects entries without `writeVerification.verified === true`.
4. **rollback metadata before rollback** — `markRolledBack()` and `markRollbackReady()` reject entries without `rollbackSnapshotRef`.
5. **explicit failure code** — `markFailed()` requires a non-empty `errorCode` string.
6. **dry-run/test-only mode** — Phase 17F permits only `dry-run`/`test` mode. Live mode is rejected by a hard gate.
7. **synthetic-only data** — Phase 17F uses only synthetic key names and synthetic payload hashes. No real user data is read, written, or deleted.
8. **no mutation of input entries** — all helper functions return new frozen entry objects; they do not mutate their inputs.
9. **explicit claim boundary** — `claimBoundary` is an explicit field on every journal entry. It must be set by callers to document the scope of the migration operation.

## Future sequencing

Phase 17F is the first narrow, test-only prototype in the migration journal track. The expected sequence is:

- Phase 17F — Test-Only Migration Journal Prototype (this phase)
- Phase 17G — Single-Key Dry-Run Migration Rehearsal (validate the journal harness against a single low-risk key in dry-run mode)
- Phase 17H — Single-Key Reversible Migration Pilot (first live migration of a single low-risk key, behind a test-only gate, with full rollback readiness)
- Phase 17I+ — Expand only after evidence from single-key pilot
- Phase 18+ — Optional sync architecture only after local migration stability is proven

No broad key migration proceeds until single-key evidence exists from Phase 17G and Phase 17H.

## Claim boundaries

This phase does not implement runtime migration, production storage changes, or any user-visible migration behavior.

The Phase 17F test-only harness (`tests/unit/helpers/migrationJournalTestHarness.js`) is:
- Pure functions only
- No browser API dependencies
- No localStorage access
- No indexedDB access
- No storage adapter registry access
- Synthetic data only
- Test-only use only

## Acceptance criteria

- `tests/unit/helpers/migrationJournalTestHarness.js` exists with pure functions covering all required capabilities
- `tests/unit/migrationJournalTestHarness.test.js` exists with unit tests covering all 13 required scenarios
- All unit tests pass (`npm run test:unit`)
- `scripts/validate-phase17f-test-only-migration-journal-prototype.js` passes
- All historical validators pass with Phase 17F forward-compat entries
- CI workflow registers Phase 17F validator after Phase 17E validator
- No src/ changes
- No e2e/ changes
- No package.json or package-lock.json changes
- No forbidden runtime files created
- No live migration implemented
