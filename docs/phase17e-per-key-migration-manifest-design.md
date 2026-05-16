# Phase 17E — Per-Key Migration Manifest Design

**Result:** PASS
**FINAL_STATUS:** 0
**Phase type:** docs/static-validator/CI-only — no runtime implementation.

---

## Purpose

Phase 17E defines the architecture of a future per-key migration manifest for Shime Quiz / ShimeChamhoc v2 local storage migration.

A migration manifest enumerates every storage key that is a candidate for future migration, assigns a risk class, specifies a migration mode, and records the safety requirements and sequencing constraints each key demands. The manifest is a design artifact: it does not implement migration, it does not move data, and it does not change storage behavior.

Phase 17E is docs/static-validator/CI-only. No runtime manifest implementation, no migration engine, no EventLog runtime, no MigrationJournal runtime, no IndexedDBAdapter, no SyncAdapter, no live migration, no dual-write, no app boot migration, no user-facing migration UI, no real data movement, no localStorage deletion, and no sync/cloud/account/auth/backend runtime is implemented in Phase 17E.

---

## Why manifest design must come before runtime migration

Future runtime migration must not begin without a manifest because:

- **Uncoordinated key migration causes partial state** — migrating some keys without a plan for others leaves the application in a mixed storage state where some reads succeed from localStorage and others fail because they were already moved to IndexedDB. Without a manifest, there is no registry to determine which keys have been migrated and which have not.
- **Risk is not uniform across key families** — a settings flag (e.g., theme preference) has a fundamentally different risk profile than FSRS review logs or backup/restore payloads. A per-key manifest assigns a `riskClass` to each key so that high-risk keys cannot be migrated before the backup/rollback harness is proven for their data family.
- **Sequencing cannot be enforced without a registry** — runtime migration phases must enforce that low-risk keys are migrated before high-risk keys. A manifest establishes the canonical ordering and the `testGate` and `productionGate` that each key requires before its migration proceeds.
- **Rollback cannot be targeted without key identity** — a per-key rollback snapshot requires knowing which key was migrated and what its pre-migration state was. The `rollbackPlan` and `requiresRollbackSnapshot` fields in the manifest provide this identity for each key.
- **Idempotency cannot be verified without key identity** — retry logic must skip keys that have already been successfully migrated. The `idempotencyStrategy` field defines how each key detects a prior successful migration.
- **Delete policy must be explicit before any source is deleted** — deletion of a localStorage key before the target copy is verified causes permanent data loss. The `deletePolicy` field records whether, when, and under what condition a source key may be deleted.

---

## Relationship to prior phases

- **Phase 17A — Backup/Rollback Harness BEFORE Migration:** Established the backup snapshot capture, restore rollback, and read-after-write verification harness. The manifest's `requiresBackup` and `requiresRollbackSnapshot` fields reference this harness. No manifest entry may have `requiresBackup: false` for a high-risk or critical key.
- **Phase 17B — StorageAdapter Scaffold behind LocalStorage/no-op Driver:** Established the `StorageAdapter` interface and `LocalStorageAdapter`. The manifest's `ownerModule` and `targetStore` fields reference the storage architecture introduced in Phase 17B.
- **Phase 17C — IndexedDB Dry-Run Harness:** Validated that IndexedDB availability checking, object store planning, and dry-run operation sequencing are feasible in the browser. The manifest's `migrationMode` field references the dry-run mode tested in Phase 17C.
- **Phase 17D — Migration Journal / Event Log Architecture Guardrail:** Defined the future journal entry model and required guardrails for when live migration is eventually introduced. The manifest's `rollbackPlan` and `requiresReadAfterWriteVerification` fields are consistent with the Phase 17D journal architecture. The manifest entry shape is the registry-level complement to the journal entry model.

---

## Candidate storage key families

The following families are candidates for future migration. This list defines the families for manifest planning only. No migration is implemented or scheduled. No key is migrated in Phase 17E.

### 1. `shimeV2*V1` family

Primary application data. Includes quiz deck data, card sets, and learning records stored under keys beginning with `shimeV2` and ending with `V1`. This family contains the user's primary study content and is the highest volume family by byte size.

- Risk class: high-risk learning records
- Owner module: `src/data/learningDataStore.js`, `src/data/learningDataAdapter.js`
- Migration notes: Must not be migrated until the backup/rollback harness has been proven across multiple test-gate cycles. Read-after-write verification is mandatory for every key in this family. Per-key rollback snapshots are required.

### 2. Legacy `quiz*V1` family

Older application data stored under keys beginning with `quiz` and ending with `V1`. These keys may exist in user installations that have not been fully migrated to the `shimeV2*V1` format. This family requires a schema version audit before any migration is attempted.

- Risk class: high-risk learning records
- Owner module: `src/data/learningDataStore.js`, `src/data/importValidator.js`
- Migration notes: Must check for `quiz*V1` key presence and schema version before migration. May require a schema upgrade path. Must not delete `quiz*V1` keys until the upgrade and copy are verified.

### 3. Review schedule / study state family

Keys recording the user's active review schedule, study session state, and active card queue. These keys are written frequently during study sessions and must not be migrated while a study session is active.

- Risk class: critical backup/restore and scheduling state
- Owner module: `src/state/reviewScheduleStorage.js`, `src/quiz/reviewSchedulerAdapter.js`
- Migration notes: Must not be migrated while any active study session is in progress. Requires session lock before migration begins. Per-key rollback snapshots are required. FSRS scheduling behavior must not be altered by migration.

### 4. Settings family

User preference and configuration keys, including feature flags, UI preferences, and study goal parameters. Settings keys have the lowest byte size of all families but may be read at application startup.

- Risk class: medium-risk user preferences
- Owner module: `src/state/settingsStorage.js`
- Migration notes: Migration of settings keys may proceed after a low-risk dry-run pilot succeeds. Settings migration must not change the default values of any flag. Settings migration must not alter FSRS experimental flag behavior.

### 5. Backup/restore payload family

Keys storing backup snapshots produced by the Phase 17A backup/rollback harness and the application's export/import system. These keys contain the recovery data needed for all other migration rollbacks.

- Risk class: critical backup/restore and scheduling state
- Owner module: `src/state/` backup-related modules
- Migration notes: Backup/restore payload keys must NOT be migrated before all other families, because they are the source of rollback for other keys. Migration of backup keys must be the LAST step, not the first. If backup keys are migrated incorrectly, rollback for all other families is broken.

### 6. EduGen/source metadata family

Keys storing EduGen draft metadata, source card associations, and workshop draft state. This family is relevant only when the EduGen feature is active.

- Risk class: medium-risk user preferences
- Owner module: `src/components/edugen/`, `src/state/`
- Migration notes: EduGen migration must not be bundled with core learning data migration. EduGen keys may be migrated independently after the core `shimeV2*V1` migration is stable.

### 7. FSRS metadata/review logs family

Keys storing FSRS scheduling state, review history logs, and per-card FSRS parameters. This family is only active when the FSRS experimental feature flag is enabled.

- Risk class: high-risk learning records
- Owner module: `src/quiz/fsrsWrapper.js`, `src/state/` FSRS-related modules
- Migration notes: FSRS metadata must not be migrated as part of storage migration. FSRS scheduling behavior must not be altered by storage migration. FSRS keys must only be migrated after storage stability is confirmed across all other families. FSRS migration must be gated by the FSRS experimental flag in both testGate and productionGate.

### 8. Recommendation feedback family

Keys storing user recommendation feedback, dismissed card signals, and deck rating data used by the recommendation engine.

- Risk class: low-risk metadata
- Owner module: `src/state/recommendationFeedbackStorage.js`
- Migration notes: Recommendation feedback is the lowest risk family. A single key from this family is the recommended pilot candidate for the first reversible migration (Phase 17H). It is small, bounded in size, and recoverable from user re-interaction if lost.

---

## Manifest entry shape

The following is the conceptual shape of a future manifest entry for a single storage key. This shape is **not implemented in code in Phase 17E**. It defines what a future manifest registry must record for each key.

```text
manifestId                        — unique stable identifier for this manifest entry
sourceKey                         — the exact localStorage key or key pattern being migrated
targetStore                       — the target storage area and object store name
dataFamily                        — which family this key belongs to (one of the eight families above)
riskClass                         — low-risk metadata | medium-risk user preferences |
                                    high-risk learning records | critical backup/restore and scheduling state
ownerModule                       — the src/ module responsible for reading and writing this key
schemaVersion                     — the schema version of the data expected at this key
migrationMode                     — dry-run | copy-verify | copy-verify-delete | deferred
requiresBackup                    — true | false (must be true for high-risk and critical)
requiresReadAfterWriteVerification — true | false (must be true for high-risk and critical)
requiresRollbackSnapshot          — true | false (must be true for high-risk and critical)
idempotencyStrategy               — skip-if-target-exists | compare-checksum | always-overwrite
deletePolicy                      — never | after-verified-copy | after-retention-period | manual-only
testGate                          — the test phase that must pass before this key may be migrated
productionGate                    — the production phase that must pass before this key may go live
rollbackPlan                      — the rollback procedure if migration of this key fails
claimBoundary                     — explicit list of claims that must NOT be made about this key's migration
```

---

## Risk classes

All manifest entries must assign exactly one of the following risk classes:

### low-risk metadata

Applied to keys that are small, recoverable from user re-interaction, and whose loss does not affect study continuity. Recommendation feedback keys are the canonical example. Low-risk metadata keys may be piloted first in reversible migration.

### medium-risk user preferences

Applied to keys that affect application behavior but are not part of the user's study record. Settings and EduGen metadata keys are examples. Loss or corruption of these keys may cause UI regressions or reset preferences, but does not affect the user's study history. Medium-risk keys require backup before migration.

### high-risk learning records

Applied to keys that contain the user's primary study data, deck content, card sets, review history, and FSRS parameters. The `shimeV2*V1`, `quiz*V1`, and FSRS metadata families are high-risk. Loss or corruption of these keys causes permanent study history loss. High-risk keys require backup, read-after-write verification, and per-key rollback snapshots.

### critical backup/restore and scheduling state

Applied to keys that are the foundation for rolling back all other migrations. Backup/restore payload keys and active review schedule keys are critical. Critical keys must not be migrated until all other families are stable. Loss of these keys breaks the rollback foundation.

---

## Future migration order

Migration of keys must follow this exact order. No phase may skip ahead or migrate a higher-risk family before a lower-risk one is validated.

```text
Phase 17E — Per-Key Migration Manifest Design: docs/static-validator/CI-only manifest design. No data movement.
Phase 17F — Test-Only Migration Journal Prototype: test-only journal shape, no production runtime.
Phase 17G — Single-Key Dry-Run Migration Rehearsal: synthetic/dry-run only for one low-risk key.
Phase 17H — Single-Key Reversible Migration Pilot: internal/test-only gate, backup required,
             low-risk key only, no broad rollout.
Phase 18+  — Optional sync architecture only after local migration stability.

Within runtime migration phases (after Phase 17H):
  Step 1 — Single low-risk metadata key (recommendation feedback) pilot.
  Step 2 — Settings family only after pilot succeeds.
  Step 3 — EduGen metadata family only after settings are stable.
  Step 4 — Review schedule / study state family only after backup/rollback maturity is confirmed.
  Step 5 — shimeV2*V1 and quiz*V1 families only after review schedule stability.
  Step 6 — FSRS metadata/review logs only after storage stability across all other families.
  Step 7 — Backup/restore payload keys last, after all other families are proven.
  Step 8 — Optional cloud/sync architecture only after all local migration is stable.
```

Each step requires `FINAL_STATUS=0` from the full validator chain and a clean build and unit test run before the next step begins.

---

## Required safety rules

Future runtime migration phases must implement all of the following safety rules. These rules are not implemented in Phase 17E.

- **backup-before-migration** — a backup snapshot must be captured using the Phase 17A harness and verified before any live migration of any key begins. No key may be migrated without a confirmed backup snapshot. This applies to all riskClass levels.
- **no delete-before-verified-copy** — the source localStorage key must not be deleted until the `writeVerificationStatus` is confirmed as `ok` for that key. This is a hard constraint with no exceptions.
- **read-after-write verification** — after writing each key to the target store, the written data must be read back and compared to the source. Migration must abort if verification fails.
- **per-key rollback snapshot** — each key must have an independent rollback snapshot captured before migration begins. A failure migrating key B must not prevent rollback of key A. Mixed-family rollback is not allowed.
- **idempotent retry** — the migration journal must record a terminal status for each key so that retry skips already-completed keys. An idempotent retry must never overwrite a successfully migrated key with a re-read of the source.
- **explicit status per key** — every manifest entry in the runtime journal must have an explicit terminal status: `success`, `failed`, `rolled-back`, or `pending`. Ambiguous or missing status is forbidden.
- **partial migration recovery** — if migration of a key family is interrupted, the recovery procedure must use the journal to identify which keys completed and which did not, and must resume from the last known safe checkpoint.
- **quota pressure handling** — before migrating each key, the migration engine must check that sufficient quota is available in the target store. If quota is insufficient, migration must abort and set status to `failed` with error code `quota-exceeded`.
- **schema mismatch handling** — before migrating each key, the migration engine must validate that the source data matches the expected `schemaVersion` from the manifest entry. If the schema does not match, migration must abort and set status to `failed` with error code `schema-mismatch`.
- **user export remains trustworthy** — migration must not alter the format or content of any user data export. The export/import system must produce identical output before and after migration of any key.

---

## Explicit non-goals for Phase 17E

Phase 17E does not add and must not add any of the following:

- **No runtime manifest implementation** — no JavaScript manifest object, registry, or factory. No `migrationManifest.js`, no `migrationRegistry.js`, no runtime manifest loader.
- **No migration engine** — no migration runner, no key iterator, no migration scheduler, no migration trigger.
- **No EventLog runtime** — no `src/storage/EventLog.js`, no event log write calls, no event log read calls.
- **No MigrationJournal runtime** — no `src/storage/MigrationJournal.js`, no `src/storage/migrationJournal.js`, no journal write calls.
- **No IndexedDBAdapter** — no `src/storage/IndexedDBAdapter.js`, no production IndexedDB adapter, no production adapter switch.
- **No SyncAdapter** — no `src/storage/SyncAdapter.js`, no sync adapter runtime.
- **No real data movement** — no copying or moving of user study data between any storage areas.
- **No localStorage deletion** — no deletion of any existing localStorage keys.
- **No app boot migration** — no migration triggered during application startup or initialization.
- **No user-facing migration UI** — no settings panel, progress indicator, or user prompt for migration.
- **No cloud/sync/account/auth/backend** — no cloud sync, no account system, no authentication, no backend runtime.
- **No FSRS, EduGen, or scheduler behavior changes** — no changes to scheduling algorithms, FSRS state, EduGen logic, or import parser behavior.

---

## Claim boundaries

The following claims are forbidden in Phase 17E documentation and in public-facing materials. These claims must not be made:

- **Do not claim migration has shipped** — local storage migration has not shipped. No live data movement has occurred in any phase through Phase 17E.
- **Do not claim IndexedDB production storage exists** — IndexedDB is not a production storage backend through Phase 17E. Only a synthetic dry-run harness exists (Phase 17C) and it is temporary and non-production.
- **Do not claim storage sync exists** — no cross-device sync, no backend sync, and no cloud sync has been implemented in any phase through Phase 17E.
- **Do not claim data-loss prevention is guaranteed** — the manifest design and safety rules reduce risk but do not guarantee data-loss prevention. These are future requirements, not current guarantees.
- **Do not claim E2EE/security certification** — no end-to-end encryption has been implemented or certified in any phase through Phase 17E.
- **Do not claim public active FSRS rollout** — FSRS scheduling is not publicly active through Phase 17E. It remains gated behind internal/developer flags.
- **Do not claim built-in AI/OCR** — no built-in AI or OCR capability exists in the runtime through Phase 17E.

---

## Acceptance criteria

Phase 17E passes when all of the following are true:

1. `docs/phase17e-per-key-migration-manifest-design.md` exists with all required sections.
2. `scripts/validate-phase17e-per-key-migration-manifest-design.js` exists and passes.
3. `.github/workflows/e2e-smoke.yml` registers the Phase 17E validator after the Phase 17D validator.
4. No `src/` files are created or modified in Phase 17E.
5. No `tests/` files are created or modified in Phase 17E.
6. No `e2e/` files are created or modified in Phase 17E.
7. `package.json` and `package-lock.json` are unchanged.
8. No forbidden runtime files exist: `src/storage/EventLog.js`, `src/storage/MigrationJournal.js`, `src/storage/IndexedDBAdapter.js`, `src/storage/SyncAdapter.js`.
9. No forbidden dependencies (`idb`, `dexie`, `localforage`, `pouchdb`, `rxdb`, `firebase`, `supabase`) are added to `package.json`.
10. All required manifest terms appear in the document.
11. All required safety terms appear in the document.
12. All historical validator changes, if any, are exact Phase 17E forward-compat entries only.
13. Full validator chain passes: `FINAL_STATUS=0`.
14. Build passes: `npm run build`.
15. Unit tests pass: `npm run test:unit`.

Phase 17E did not implement runtime manifest, EventLog, MigrationJournal, IndexedDBAdapter, SyncAdapter, live migration, dual-write, production adapter switch, app boot migration, user-facing migration UI, real data movement, localStorage deletion, sync/cloud/account/auth/backend runtime, FSRS changes, EduGen changes, scheduler changes, import parser changes, backup schema changes, or storage schema migration.
