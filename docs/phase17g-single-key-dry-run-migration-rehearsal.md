# Phase 17G — Single-Key Dry-Run Migration Rehearsal

## Purpose

Phase 17G performs the first narrow dry-run rehearsal that combines the Phase 17E per-key manifest design with the Phase 17F migration journal test harness. It proves that a single synthetic low-risk key can be represented by a manifest fixture, run through a dry-run rehearsal, produce journal entries, verify synthetic write metadata, and end with a safe dry-run result without moving any real data.

This phase is still test-only/dry-run-only. It does not implement production migration, production IndexedDB storage, a production IndexedDBAdapter, a runtime migration engine, real localStorage reads/writes, or user-facing migration UI.

## Why the first rehearsal uses recommendation feedback as a low-risk family

The recommended pilot family is **recommendation-feedback** for the following reasons:

- It is low-risk metadata, not core study progress.
- It is not review schedule state, so errors do not affect learning continuity.
- It is not FSRS scheduling state, so errors do not corrupt spaced-repetition progress.
- It is not backup/restore payload state, so errors do not affect recovery capability.
- It is safer as a first migration rehearsal target than:
  - learning records (core study progress)
  - schedule records (controls what cards appear)
  - FSRS metadata (drives the FSRS algorithm)
  - backup data (needed for recovery)

Starting with recommendation-feedback allows the team to validate the migration rehearsal architecture without risking data that drives the core study loop.

## Relationship to prior phases

| Phase | Role |
|-------|------|
| Phase 17A | Backup/Rollback Harness BEFORE Migration — establishes safety harness that must run before any migration |
| Phase 17B | StorageAdapter Scaffold behind LocalStorage/no-op Driver — creates the adapter interface used by migration |
| Phase 17C | IndexedDB Dry-Run Harness — non-destructive IndexedDB probe without live migration |
| Phase 17D | Migration Journal / Event Log Architecture Guardrail — defines journal entry schema and safety rules |
| Phase 17E | Per-Key Migration Manifest Design — defines the per-key manifest entry shape and risk classes |
| Phase 17F | Test-Only Migration Journal Prototype — implements the journal harness used by Phase 17G |

Phase 17G is the first phase that *combines* the manifest design (Phase 17E) with the journal harness (Phase 17F) in a coordinated dry-run rehearsal flow.

## What Phase 17G models

Phase 17G models the following using synthetic data only:

### One synthetic manifest entry

A single frozen manifest entry for the recommendation-feedback pilot family:

```
manifestId:    'phase17g-rec-feedback-pilot-v1'
sourceKey:     'shimeV2RecommendationFeedbackV1'
targetStore:   'shime-v2-idb-rec-feedback'
dataFamily:    'recommendation-feedback'
riskClass:     'low'
operationType: 'copy'
claimBoundary: 'Phase 17G test-only; no live migration; no real data movement'
```

### One synthetic source payload

A synthetic object representing the data that would be migrated. No real localStorage data is read. The payload is provided by the test as a fixture.

### Dry-run journal entries

Using the Phase 17F test-only harness (`tests/unit/helpers/migrationJournalTestHarness.js`), Phase 17G creates journal entries that transition through the following status path:

1. `planned` — journal entry created with source checksum
2. `backup-captured` — rollback snapshot reference attached (inert test metadata)
3. `write-attempted` — read-before-write checksum attached
4. `write-verified` — write verification metadata attached
5. `completed` — requires `writeVerification.verified === true`

Each transition is validated by the Phase 17F harness's `transitionStatus()` function.

### Synthetic checksums

Both source and target checksums are deterministic synthetic strings. They do not represent real hash values of real data. They prove the plumbing for checksum attachment without performing real cryptographic operations.

```
sourceChecksum: 'sha256-synthetic-source-<key>-phase17g'
targetChecksum: 'sha256-synthetic-target-<store>-phase17g'
readBeforeWriteChecksum: 'sha256-synthetic-read-before-write-<key>-phase17g'
```

### Write verification metadata

Write verification is modeled as an inert object with `verified: true` and a `synthetic: true` flag. It is attached to the journal entry before completion. Completion is rejected unless `writeVerification.verified === true`.

```
writeVerification: {
  verified:      true,
  targetChecksum: '...',
  verifiedAt:    '2026-05-17T00:00:00.000Z',
  synthetic:     true,
  claimBoundary: 'Phase 17G test-only write verification; no real write occurred',
}
```

### Rollback snapshot metadata

Rollback snapshot reference is inert test metadata attached at the `backup-captured` stage. It is preserved through all subsequent journal entry transitions. It proves that rollback metadata would be available in a real migration but does not represent a real snapshot.

```
rollbackSnapshotRef: {
  snapshotId:    'snap-phase17g-<sourceKey>',
  capturedAt:    '2026-05-17T00:00:00.000Z',
  synthetic:     true,
  claimBoundary: 'Phase 17G test-only rollback metadata; no real snapshot',
}
```

### Dry-run result status

The rehearsal returns a result object with `ok: true`, `dryRunOnly: true`, `pilotFamily`, `manifestEntry`, `journalEntries`, and `finalEntry`. The result is immutable.

## Why Phase 17G is still test-only

Phase 17G is strictly test-only because:

1. No production migration path is proven safe yet for any key family.
2. The IndexedDB adapter (`IndexedDBAdapter`) does not exist in production.
3. The migration engine (a runtime component that reads manifests and executes migrations) does not exist yet.
4. No dual-write or atomic migration has been designed or validated.
5. No production rollback has been exercised with real data.

The dry-run rehearsal proves the *plumbing* — journal entry shape, status transitions, checksum attachment, write verification gating, rollback metadata preservation — without any risk to real user data.

## What Phase 17G explicitly does not implement

Non-goals: no runtime EventLog, no runtime MigrationJournal, no migration engine, no IndexedDBAdapter, no SyncAdapter, no live migration, no dual-write, no production adapter switch, no app boot migration, no user-facing migration UI, no real data movement, no localStorage deletion.

Phase 17G does **not** implement any of the following:

- **No runtime migration** — no actual data is moved from localStorage to IndexedDB or any other store.
- **No migration engine** — no runtime component reads manifests and triggers migrations.
- **No EventLog runtime** — `src/storage/EventLog.js` does not exist and is not created.
- **No MigrationJournal runtime** — `src/storage/MigrationJournal.js` does not exist and is not created.
- **No IndexedDBAdapter** — `src/storage/IndexedDBAdapter.js` does not exist and is not created.
- **No SyncAdapter** — `src/storage/SyncAdapter.js` does not exist and is not created.
- **No live migration** — no live migration path is activated.
- **No dual-write** — no dual-write to localStorage + IndexedDB.
- **No production adapter switch** — the storage adapter registry is not modified.
- **No app boot migration** — no migration runs at application startup.
- **No user-facing migration UI** — no settings panel, progress indicator, or migration prompt is added.
- **No real data movement** — no localStorage key is read from real user storage.
- **No localStorage deletion** — no localStorage key is deleted.
- **No sync/cloud/account/auth/backend** — no server-side components are involved.

## Safety invariants

The following safety invariants are enforced by Phase 17G:

1. **No delete-before-verified-copy** — the dry-run rehearsal does not delete any data; it models the invariant structurally by requiring write verification before completion.

2. **Write verification before completion** — `completeEntry()` (from Phase 17F harness) rejects completion unless `writeVerification.verified === true`. Phase 17G uses this guard in all rehearsal flows.

3. **Rollback metadata preserved** — `rollbackSnapshotRef` is attached at `backup-captured` and is preserved immutably through all subsequent transitions, including in the final `completed` entry.

4. **Explicit error code on failure** — `markFailed()` (from Phase 17F harness) requires a non-empty `errorCode`. All simulated failure paths provide an explicit error code.

5. **Synthetic-only data** — no real localStorage data is read. No real IndexedDB data is written. All checksums, payloads, and references are synthetic.

6. **Dry-run/test-only mode** — live mode is rejected by both the Phase 17F harness (`createPlannedDryRunEntry`) and the Phase 17G rehearsal helper (`runSingleKeyDryRunRehearsal`).

7. **No production storage access** — the rehearsal helper does not import or call `getStorageAdapter`, `setStorageAdapterForTests`, `LocalStorageAdapter`, `StorageAdapter`, or `storageAdapterRegistry`.

8. **No browser APIs** — no `localStorage`, `indexedDB`, `window`, or `document` access.

## Future sequencing

### Phase 17H — Single-Key Reversible Migration Pilot (next)

Phase 17H will introduce a single low-risk reversible migration pilot behind a test-only gate. It will exercise the full backup → write → verify → rollback loop for the recommendation-feedback family using the harnesses from Phase 17A through 17G.

**No live migration to Phase 17H.** Phase 17H remains test-only, behind an explicit gate.

### No high-risk data before low-risk evidence

No high-risk learning/schedule/FSRS/backup data migration will be attempted until low-risk evidence from the recommendation-feedback pilot exists.

### No optional sync until local migration stability

Optional sync (cross-device, cloud) will not be designed or attempted until local-only migration stability is established across at least one full round-trip of the recommendation-feedback pilot.

### Phase 18+

Phase 18+ will address production migration activation, live dual-write, production adapter switch, and user-facing migration UI — none of which exist in Phase 17G.

## Claim boundaries

This document describes what Phase 17G models in test-only/dry-run-only mode. The following claims are explicitly **false** for Phase 17G:

- migration has shipped → FALSE
- indexeddb production storage exists → FALSE; no IndexedDBAdapter exists in production
- live migration is implemented → FALSE
- runtime migration exists → FALSE
- cloud sync exists → FALSE
- e2ee exists → FALSE
- guaranteed data safety → FALSE; the phase is a dry-run rehearsal only

## Acceptance criteria

Phase 17G is complete when:

1. `tests/unit/helpers/singleKeyDryRunMigrationRehearsal.js` exists and passes all guards.
2. `tests/unit/singleKeyDryRunMigrationRehearsal.test.js` exists with ≥ 17 unit tests covering all required scenarios.
3. `docs/phase17g-single-key-dry-run-migration-rehearsal.md` exists (this document).
4. `scripts/validate-phase17g-single-key-dry-run-migration-rehearsal.js` exists and passes.
5. `.github/workflows/e2e-smoke.yml` registers Phase 17G validator after Phase 17F.
6. All unit tests pass via `npm run test:unit`.
7. Full validator chain passes (FINAL_STATUS=0).
8. `package.json` and `package-lock.json` are unchanged.
9. No `src/` files are modified.
10. No `e2e/` files are modified.
11. No production storage modules are modified or created.
12. No forbidden runtime files (`EventLog.js`, `MigrationJournal.js`, `IndexedDBAdapter.js`, `SyncAdapter.js`) exist.

## docs/static-validator/ci-only

Phase 17G is a docs/static-validator/ci-only phase with a test harness addition. No production runtime is modified or created.
