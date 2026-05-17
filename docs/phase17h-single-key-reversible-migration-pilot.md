# Phase 17H — Single-Key Reversible Migration Pilot

## Purpose

Phase 17H proves that a single low-risk recommendation-feedback key can complete a full reversible migration flow in test-only mode, using synthetic data only.

The phase adds rollback verification semantics on top of the dry-run rehearsal introduced in Phase 17G. Every safety step — backup snapshot before write, write verification before completion, rollback snapshot before rollback, restored-state verification — is exercised and audited before any future live migration is permitted.

**This is a bounded test-only prototype. No real user data is touched.**

## Why the pilot is still test-only and synthetic-only

Phase 17G proved a dry-run rehearsal. Phase 17H proves a full reversible flow but remains in test-only mode for the same reasons:

- The IndexedDB adapter (`IndexedDBAdapter`) does not exist in production yet.
- No runtime migration engine exists. No migration journal runtime exists.
- No live migration path is implemented anywhere in the codebase.
- The local-first hybrid storage architecture (Phase 16L ADR) requires a verified reversible path before any production key is migrated.
- Safety invariant: **no delete-before-verified-copy** must be proven at the test level before any live execution is considered.

Proving rollback semantics with synthetic data is the prerequisite for future real-data migration pilots, not a replacement for them.

## Why recommendation feedback remains the low-risk pilot family

The `shimeV2RecommendationFeedbackV1` key is selected because:

1. It contains only ephemeral user preference signals (helpful/unhelpful card votes), not irreplaceable learning records or FSRS state.
2. Loss or corruption of this data has no effect on study progress, review scheduling, or FSRS metadata.
3. The data family is structurally simple (flat list of tagged events) compared to schedule records or FSRS state.
4. It was identified as the lowest-risk candidate in the Phase 17E per-key migration manifest design.

No high-risk families (learning records, FSRS metadata, schedule records, backup data) are piloted until low-risk reversible evidence is established.

## Relationship to prior phases

| Phase | Contribution |
|-------|-------------|
| Phase 17A | Backup/rollback harness BEFORE migration: runtime safety for pre-migration snapshots |
| Phase 17B | StorageAdapter scaffold behind LocalStorage/no-op driver |
| Phase 17C | IndexedDB dry-run harness (no live migration) |
| Phase 17D | Migration journal/event log architecture guardrail (docs/validator/CI) |
| Phase 17E | Per-key migration manifest design: risk classification, manifest shape |
| Phase 17F | Test-only migration journal prototype: journal harness, status transitions |
| Phase 17G | Single-key dry-run migration rehearsal: first rehearsal for recommendation-feedback |
| Phase 17H | **This phase**: full reversible pilot (backup → write → verify → rollback → verify) |

Phase 17H builds on the Phase 17F journal harness and the Phase 17G manifest/rehearsal helpers. It does not modify any of them.

## What Phase 17H models

### Synthetic source payload

A synthetic in-memory object representing the recommendation-feedback data that would exist in `localStorage` under `shimeV2RecommendationFeedbackV1`. The payload is a plain object with a `dataFamily`, an `items` array, and a `synthetic: true` marker. No real `localStorage` is read.

### Rollback snapshot metadata

An inert synthetic reference object captured at `backup-captured` status, **before any write plan is executed**. The snapshot ref contains a `snapshotId`, `capturedAt` timestamp, and a `synthetic: true` marker. It does not represent a real localStorage backup or any persistent state.

The invariant: **no write plan starts without a rollback snapshot ref attached**.

### Synthetic write plan

The write plan is simulated by transitioning the journal entry through `write-attempted` status and attaching a `readBeforeWriteChecksum`. No bytes are written to any storage. The write plan produces a deterministic `targetChecksum` derived from the manifest's `targetStore`.

### Write verification metadata

At `write-verified` status, a synthetic `writeVerification` object is attached. It includes:
- `verified: true`
- `targetChecksum`
- `verifiedAt`
- `synthetic: true`
- `claimBoundary`

**Completion of the write phase requires `writeVerification.verified === true` to be set** before the entry can proceed to `rollback-ready`.

### Rollback verification metadata

After the rolled-back status is reached, a `rollbackVerification` object is produced:
- `verified: true`
- `restoredChecksum`
- `matchesSource: true`
- `verifiedAt`
- `synthetic: true`
- `claimBoundary`

The invariant: **`restoredChecksum` must equal `sourceChecksum`**. If they differ, the pilot fails with `rollback_checksum_mismatch`.

### Journal entries

The full status path is recorded as a sequence of frozen journal entry snapshots:

```
planned → backup-captured → write-attempted → write-verified → rollback-ready → rolled-back
```

The pilot result `status` field is `'completed'` only after rollback verification passes.

### Final reversible pilot result

```javascript
{
  pilotId,             // Injected or generated pilot identifier
  manifestId,          // From the manifest entry
  mode,                // 'dry-run' or 'test'
  dataFamily,          // 'recommendation-feedback'
  status,              // 'completed' after successful rollback verification
  sourceChecksum,      // sha256-synthetic-source-...-phase17h
  targetChecksum,      // sha256-synthetic-target-...-phase17h
  restoredChecksum,    // Must equal sourceChecksum
  writeVerification,   // { verified: true, targetChecksum, synthetic: true, claimBoundary }
  rollbackVerification,// { verified: true, restoredChecksum, matchesSource: true, synthetic: true, claimBoundary }
  rollbackSnapshotRef, // Inert synthetic snapshot ref
  journalEntries,      // Frozen array of all status-step entries
  manifestEntry,       // Frozen copy of the manifest
  claimBoundary,       // Phase 17H claim boundary string
  reversiblePilotOnly, // true
}
```

## Why rollback verification must exist before any future live migration

The central purpose of Phase 17H is to prove that if a live migration writes data and something goes wrong, the system can restore the prior state and verify the restoration was correct.

Without a verified rollback path:
- A failed live migration could leave data in an inconsistent state (partial write to IndexedDB, stale data in localStorage, corrupted FSRS state).
- There is no recovery guarantee.
- Users could lose learning progress or recommendation-feedback history silently.

Phase 17H establishes the test-level evidence that:

1. **A rollback snapshot is always captured before a write plan starts.**
2. **A write plan cannot complete without write verification.**
3. **Rollback cannot proceed without a rollback snapshot ref.**
4. **Rollback is only marked complete after restored checksum matches original source checksum.**
5. **Every failure path records an explicit error code** — no silent failures.

This test-level evidence is required before any live migration pilot is designed.

## What Phase 17H explicitly does not implement

- No runtime eventlog
- No runtime migrationjournal
- No migration engine
- No indexeddbadapter
- No syncadapter
- No live migration
- No dual-write
- No production adapter switch
- No app boot migration
- No user-facing migration UI
- No real data movement
- No localStorage deletion
- No sync/cloud/account/auth/backend integration

All behavior in Phase 17H is test-only and uses synthetic data only.

## Safety invariants

1. **Backup/snapshot before write plan** — `rollbackSnapshotRef` attached at `backup-captured` before `write-attempted`.
2. **No delete-before-verified-copy** — the pilot does not delete any source data; it only simulates a write.
3. **Write verification before completion** — `writeVerification.verified === true` required before transitioning to `rollback-ready`.
4. **Rollback metadata before rollback** — `rollbackSnapshotRef` required for both `rollback-ready` and `rolled-back` transitions (enforced by Phase 17F harness `markRollbackReady` and `markRolledBack`).
5. **Rollback verification before final success** — `restoredChecksum === sourceChecksum` required for pilot `status: 'completed'`.
6. **Explicit error code on failure** — `simulateReversiblePilotFailure` requires a non-empty `errorCode`; any failure path records the code.
7. **Synthetic-only data** — no real localStorage or IndexedDB is read or written at any point.
8. **Dry-run/test-only mode** — live mode is rejected by gate check; only `'dry-run'` and `'test'` modes are accepted.
9. **No production storage access** — the helper imports only Phase 17F and Phase 17G test helpers; no production storage modules or adapter registry are imported.

## Future sequencing

Phase 17H establishes the reversible pilot evidence required before future phases proceed:

- **Phase 17I** — closure/readiness gate or expanded candidate-key dry-run coverage for additional low-risk families
- **No high-risk data migration** (learning records, FSRS metadata, schedule records, backup data) until low-risk reversible evidence exists and passes a readiness gate
- **No optional sync** (cloud/account/auth backend) until local migration stability is proven
- docs/static-validator/ci-only constraints remain in force until the IndexedDB adapter is production-ready and tested end-to-end

## Claim boundaries

Phase 17H is a test-only reversible migration pilot for a single low-risk recommendation-feedback key using synthetic data only.

It does not implement live migration, does not move real user data, does not write to localStorage or IndexedDB, and does not constitute a production migration path.

The claim boundary string is:

```
Phase 17H test-only; no live migration; no real data movement; reversible pilot only
```

## Acceptance criteria

- [ ] `tests/unit/helpers/singleKeyReversibleMigrationPilot.js` exists and exports the required pilot API.
- [ ] `tests/unit/singleKeyReversibleMigrationPilot.test.js` exists with ≥ 20 test coverage scenarios.
- [ ] All unit tests pass.
- [ ] `scripts/validate-phase17h-single-key-reversible-migration-pilot.js` exists and passes.
- [ ] Full validator chain passes (`FINAL_STATUS=0`).
- [ ] `.github/workflows/e2e-smoke.yml` registers Phase 17H validator after Phase 17G.
- [ ] `package.json` and `package-lock.json` unchanged.
- [ ] No `src/` changes. No `e2e/` changes.
- [ ] No forbidden runtime files created.
- [ ] No production storage modules imported in the helper.
- [ ] No browser APIs (localStorage, indexedDB, window, document) referenced in the helper.
- [ ] `restoredChecksum === sourceChecksum` verified by tests.
- [ ] All rollback-safety invariants pass tests.
