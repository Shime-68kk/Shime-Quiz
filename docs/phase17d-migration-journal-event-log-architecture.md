# Phase 17D — Migration Journal / Event Log Architecture Guardrail

**Result:** PASS
**FINAL_STATUS:** 0
**Phase type:** docs/static-validator/CI-only — no runtime implementation.

---

## Purpose

Phase 17D defines the architecture and guardrails for a future migration journal, event log, and rollback audit trail for Shime Quiz / ShimeChamhoc v2 local storage migration.

Phase 17D is docs/static-validator/CI-only. No runtime EventLog, MigrationJournal, IndexedDBAdapter, SyncAdapter, live migration, dual-write, production adapter switch, app boot migration, user-facing migration UI, real data movement, or localStorage deletion is implemented in Phase 17D.

This document answers:

1. Why does Shime need a migration journal before live migration?
2. What should a future journal/event-log entry record?
3. What risks does it reduce?
4. What risks can it create if done too early?
5. Which future phase is allowed to prototype it?
6. What must remain forbidden until later?

---

## Why journal before migration

A migration journal should exist before any live migration begins because browser-local storage migration is subject to many failure modes that can silently corrupt or destroy user data without a recoverable audit trail:

- **Partial writes** — a write to IndexedDB may complete only partially if interrupted mid-transaction, leaving the target store in an inconsistent state with no record of what succeeded.
- **Interrupted sessions** — a browser tab close, reload, or crash can interrupt a multi-step migration at any point. Without a journal, there is no way to know which keys were fully migrated.
- **Quota pressure** — both `localStorage` and `IndexedDB` may be near quota limits when migration begins, causing partial failure. A journal records how far the migration progressed before quota exhaustion.
- **Schema mismatch** — the source data shape may not match the expected target schema, causing parse or write errors. A journal records the operation type and error code so the mismatch can be diagnosed.
- **Stale backups** — a backup captured before a write is not guaranteed to be current if other writes occurred concurrently. A journal entry records the `backupSnapshotReference` captured at migration time.
- **JSON parse failures** — corrupted or partially written data can fail to parse on read. A journal captures a `sourceChecksumConcept` before migration so corrupt source data can be detected.
- **Rollback mismatch** — without a journal, the system cannot reliably identify which keys were successfully migrated and which need rollback. The journal `rollbackStatus` field enables per-key rollback decisions.
- **Accidental delete-before-copy** — deleting source data before verifying the copy in the target causes permanent data loss. A journal enforces that no deletion occurs until `writeVerificationStatus` is confirmed as `ok`.
- **Retries that are not idempotent** — without a journal entry recording migration status, a retry may re-migrate already-migrated data or overwrite partial migrated data. The journal `retryCount` and `status` fields enable idempotent retry logic.

---

## Relationship to prior phases

- **Phase 17A — Backup/Rollback Harness BEFORE Migration:** The safety base. Established backup snapshot capture, restore rollback, and read-after-write verification before any migration is attempted. Phase 17D is built on top of this foundation.
- **Phase 17B — StorageAdapter Scaffold behind LocalStorage/no-op Driver:** The StorageAdapter interface and LocalStorageAdapter now exist, but the production default remains LocalStorage. No real storage routing change occurred in Phase 17B.
- **Phase 17C — IndexedDB Dry-Run Harness:** A synthetic, temporary, non-production dry-run harness was added to test IndexedDB availability and operation planning. No live migration, no dual-write, and no production adapter switch occurred in Phase 17C.
- **Phase 17D — Migration Journal / Event Log Architecture Guardrail (this phase):** Adds architecture documentation and a static validator guardrail only. No runtime migration is implemented.

---

## Future migration journal entry model

The following is a conceptual model for a future migration journal entry. This model is **not implemented in code in Phase 17D**. It describes the fields that should be recorded when live migration is eventually introduced in a future phase.

```text
operationId             — unique ID for this migration operation
phase                   — which migration phase produced this entry
sourceStorageKey        — the localStorage key being migrated
targetStorageArea       — the storage area being written to (e.g., "indexeddb", "localstorage")
targetStoreOrKey        — the target object store name or key
operationType           — type of operation (e.g., "copy", "verify", "rollback")
dryRun                  — true if this was a dry-run operation, false if live
startedAt               — ISO timestamp when the operation started
completedAt             — ISO timestamp when the operation completed (or failed)
sourceChecksumConcept   — a conceptual checksum or size snapshot of source data before migration
targetChecksumConcept   — a conceptual checksum or size snapshot of target data after migration
backupSnapshotReference — reference to the backup snapshot captured before migration
readBeforeWriteStatus   — result of read-before-write capture (ok / error / missing)
writeVerificationStatus — result of read-after-write verification (ok / mismatch / error)
rollbackStatus          — result of rollback if triggered (ok / partial / failed / not-needed)
retryCount              — number of retry attempts for this operation
errorCode               — error code or message if the operation failed
status                  — final status of the operation (pending / success / failed / rolled-back)
```

This model is defined here for architecture alignment only. A future test-only prototype phase (Phase 17F) may implement a draft of this model in test code before any production runtime is introduced.

---

## Data-loss risks this addresses

A migration journal addresses the following specific data-loss risks:

- **Partial migration** — journal entries allow the system to identify which keys were fully migrated and which were not, enabling safe retry or rollback of incomplete operations.
- **Interrupted writes** — if a session is interrupted mid-write, the journal records the last known state of each migration operation, providing a recovery checkpoint.
- **Browser crash or reload** — without a journal, a crashed migration leaves the system in an unknown state. A journal provides the recovery checkpoint needed to resume or roll back safely.
- **Quota exhaustion** — a journal records when quota pressure caused a migration to abort, allowing the system to resume from the last safe checkpoint rather than retrying from scratch.
- **Inconsistent localStorage and IndexedDB state** — the journal tracks which keys exist in which store, preventing double-write or delete-before-copy scenarios.
- **Stale backup** — journal entries reference the `backupSnapshotReference` captured before each migration, ensuring rollback uses the correct backup snapshot.
- **Invalid JSON** — a journal records the `sourceChecksumConcept` and can detect if source data is corrupt before migration starts, preventing corrupt data from being migrated.
- **Schema mismatch** — the journal records the `operationType` and `status`, making it possible to detect and abort when a schema mismatch prevents a successful write.
- **Delete-before-verified-copy** — the journal enforces that no deletion occurs until `writeVerificationStatus` is confirmed as `ok`.
- **Retry duplication** — the `retryCount` and `status` fields allow idempotent retry logic to skip already-completed operations and avoid re-migrating data.

---

## Risks if implemented too early

Implementing a migration journal or event log too early introduces its own risks:

- **Event log becoming an accidental source of truth** — if the event log is introduced before the storage architecture is stable, application code may begin to depend on the log for state reconstruction, creating a second source of truth that diverges from actual storage.
- **Excessive storage growth** — an event log that writes to localStorage or IndexedDB for every storage operation will grow unboundedly, consuming quota and potentially causing quota exhaustion for the user's primary data.
- **Privacy risk from logging too much data** — a migration journal that captures data values (not just checksums or sizes) risks logging sensitive user study data in a secondary store that may outlive the original data and is harder to audit or delete.
- **Replay complexity** — an event log optimized for rollback replay requires complex replay logic. If the log format is wrong or the replay logic is untested, replay can produce incorrect results and make the data state worse than before migration.
- **Sync conflict assumptions too early** — introducing an event log before the storage boundary is stable may encode assumptions about sync conflict resolution that are not yet validated in the architecture.
- **Production migration assumptions before backup/rollback is mature** — Phase 17A established the backup/rollback harness foundation, but a production migration journal assumes this harness is fully battle-tested in real user conditions. Rushing to a production journal risks producing a system that cannot be reliably used for rollback.

---

## Future phase sequencing

Migration journal work must follow this exact sequence. No phase may skip ahead.

```text
Phase 17D — Migration Journal / Event Log Architecture Guardrail: docs/static-validator/CI-only.
Phase 17E — Per-Key Migration Manifest Design: docs/static-validator/CI-only manifest design.
Phase 17F — Test-Only Migration Journal Prototype: test-only journal shape, no production runtime.
Phase 17G — Single-Key Dry-Run Migration Rehearsal: synthetic/dry-run only.
Phase 17H — Single-Key Reversible Migration Pilot: internal/test-only gate, backup required, no broad rollout.
Phase 18+ — Optional sync architecture only after local migration stability.
```

Each phase is gated on the previous phase completing cleanly with `FINAL_STATUS=0` and the full validator chain passing.

---

## Required future runtime guardrails

When a live migration journal is eventually implemented (not in Phase 17D), it must include all of the following guardrails:

- **Backup-before-migration** — a backup snapshot must be captured and verified before any live migration begins for a given key. This is the Phase 17A foundation.
- **Read-before-write capture** — the source data must be read and its checksum/size recorded before the write to the target store begins. This enables detection of source data corruption before migration.
- **Read-after-write verification** — after writing to the target, the written data must be read back and verified to match the source. No deletion may occur until this verification passes.
- **No delete-before-verified-copy** — the source key must not be deleted until `writeVerificationStatus` is confirmed as `ok`. Violating this rule causes permanent data loss.
- **Per-key rollback** — each key must be rollback-able independently. A failure migrating key B must not prevent rollback of key A.
- **Idempotent retry plan** — the journal must record status so that a retry skips already-completed operations and does not double-migrate data. The `retryCount` and `status` fields support this.
- **Explicit migration status** — each journal entry must have an explicit terminal status: `success`, `failed`, `rolled-back`, or `pending`. Ambiguous or missing status is forbidden.
- **Test-only gate before production gate** — any migration journal implementation must pass a test-only gate (Phase 17F) before a production gate (Phase 17H) is introduced.
- **Small per-key rollout before broad migration** — a single-key pilot (Phase 17G, Phase 17H) must succeed before broad multi-key migration is attempted.
- **No scheduler/FSRS migration bundled with storage migration** — storage migration must be scoped to storage keys only. FSRS state, review schedules, and EduGen metadata must not be migrated as part of a storage migration operation.

---

## Explicit non-goals for Phase 17D

Phase 17D does not add and must not add any of the following:

- **No EventLog** — no `src/storage/EventLog.js` or any EventLog implementation. No live event log runtime.
- **No MigrationJournal** — no `src/storage/MigrationJournal.js`, `src/storage/migrationJournal.js`, or any MigrationJournal implementation.
- **IndexedDBAdapter** — no `src/storage/IndexedDBAdapter.js` or any production IndexedDB adapter.
- **SyncAdapter** — no `src/storage/SyncAdapter.js` or any sync adapter.
- **Live migration** — no real data movement between localStorage and IndexedDB.
- **Dual-write** — no writing to both localStorage and IndexedDB simultaneously.
- **App boot migration** — no migration triggered during application startup.
- **Settings migration UI** — no user-facing migration controls or settings panel for migration.
- **User-facing migration controls** — no UI for users to trigger or monitor migration.
- **Real data movement** — no copying or moving of user study data between storage areas.
- **No localStorage deletion** — no deletion of existing localStorage keys.
- **Cloud/sync/account/auth** — no cloud sync, no account system, no authentication, no backend runtime.
- **FSRS/EduGen/scheduler behavior changes** — no changes to scheduling, FSRS state, EduGen, or import parser behavior.

---

## Claim boundaries

The following claims are forbidden in Phase 17D documentation and in public-facing materials. These claims must not be made:

- **Migration has shipped** — local storage migration has not shipped. No live data movement has occurred. The dry-run harness (Phase 17C) is synthetic and non-production.
- **IndexedDB production storage exists** — IndexedDB is not a production storage backend in Phase 17D. Only a dry-run harness exists (Phase 17C) and that is temporary, synthetic, and not production.
- **Cloud sync exists** — no cloud sync, no cross-device sync, and no backend sync has been implemented in any phase through Phase 17D.
- **E2EE exists** — no end-to-end encryption has been implemented or certified in any phase through Phase 17D.
- **Data-loss prevention is guaranteed** — the architecture guardrail reduces risk but does not guarantee data-loss prevention. A journal is a future safeguard, not a current guarantee.
- **Public active FSRS rollout exists** — FSRS scheduling is not publicly active through Phase 17D. It remains gated behind internal/developer flags.
- **Built-in AI/OCR exists** — no built-in AI or OCR capability exists in the runtime through Phase 17D.
- **Production/security certification exists** — no security audit or production certification has been completed through Phase 17D.

---

## Acceptance criteria

Phase 17D passes when all of the following are true:

1. `docs/phase17d-migration-journal-event-log-architecture.md` exists with all required sections.
2. `scripts/validate-phase17d-migration-journal-event-log-architecture.js` exists and passes.
3. `.github/workflows/e2e-smoke.yml` registers the Phase 17D validator after the Phase 17C validator.
4. No `src/` files are created or modified in Phase 17D.
5. No `tests/` files are created or modified in Phase 17D.
6. No `e2e/` files are created or modified in Phase 17D.
7. `package.json` and `package-lock.json` are unchanged.
8. No forbidden runtime files exist: `src/storage/EventLog.js`, `src/storage/SyncAdapter.js`, `src/storage/IndexedDBAdapter.js`, `src/storage/MigrationJournal.js`, `src/storage/migrationJournal.js`, `src/storage/migrationRunner.js`, `src/storage/migrationManifest.js`.
9. No forbidden dependencies (`idb`, `dexie`, `localforage`, `pouchdb`, `rxdb`, `firebase`, `supabase`) are added to `package.json`.
10. All historical validator changes, if any, are exact Phase 17D forward-compat entries only.
11. Full validator chain passes: `FINAL_STATUS=0`.
12. Build passes: `npm run build`.
13. Unit tests pass: `npm run test:unit`.

Phase 17D did not implement runtime EventLog, MigrationJournal, IndexedDBAdapter, SyncAdapter, live migration, dual-write, production adapter switch, app boot migration, user-facing migration UI, real data movement, localStorage deletion, sync/cloud/account/auth/backend runtime, FSRS changes, EduGen changes, scheduler changes, import parser changes, backup schema changes, or storage schema migration.
