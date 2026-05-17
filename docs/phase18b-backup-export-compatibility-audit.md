# Phase 18B — Backup / Export Compatibility Audit for Adapter-Backed Storage

## Purpose

Phase 18B audits backup/export/restore compatibility before any adapter-backed production storage exists.

Phase 18B is docs/static-validator/ci-only. No production runtime changes are introduced. Production backup/export behavior is unchanged in Phase 18B. localStorage remains the canonical production source of truth.

This audit defines the compatibility contract that any future adapter-backed storage must satisfy before backup, export, restore, or rollback logic is modified.

## Relationship to Phase 17I gate and Phase 18A prototype

Phase 17I gated Phase 18A as a test-only IndexedDBAdapter prototype only. Phase 18A added only synthetic test-only adapter behavior using an injected fake IndexedDB-like backend. Phase 18A does not make backup/export adapter-aware. No production storage surface changed in Phase 18A.

Phase 18B defines the contract before any future runtime work. No implementation follows from this audit until go/no-go criteria are satisfied in sequence.

## Production baseline (what is canonical today)

- Production storage remains localStorage canonical (localStorage-canonical). localStorage is the canonical production source of truth.
- Backup/export reads localStorage-derived production state.
- Restore writes localStorage-derived production state.
- No adapter-backed production data exists.
- No runtime IndexedDBAdapter exists in production.
- No production registry switch exists.
- No dual-write exists.
- No app boot migration exists.
- No real data movement has occurred.
- No localStorage deletion has occurred.
- No sync/cloud/account/auth/backend runtime exists.

## Stage truth table

The canonical source of truth changes last, not first.

| Stage | Canonical source of truth | Backup/export source | Restore target | Rollback responsibility | Allowed claims | Forbidden claims |
|---|---|---|---|---|---|---|
| 1. Current production baseline | localStorage | localStorage | localStorage | N/A (no migration) | localStorage is canonical | backup is adapter-aware |
| 2. Phase 18A test-only prototype | localStorage | localStorage | localStorage | N/A (no production migration) | test-only adapter prototype exists | production IndexedDBAdapter exists |
| 3. Phase 18B audit | localStorage | localStorage | localStorage | N/A (audit only) | compatibility risks catalogued | not allowed: adapter-backed migration is ready |
| 4. Future test-only adapter-backed storage | localStorage | localStorage | localStorage | test harness only | synthetic test coverage exists | production adapter exists |
| 5. Future internal migration pilot | localStorage (canonical until gate) | localStorage | localStorage | pilot harness with rollback proof | one-key pilot underway | canonical source changed |
| 6. Future production migration candidate | adapter-backed (only after explicit gate) | adapter (if fully verified) | adapter (if fully verified) | full rollback proof required | migration candidate validated | not allowed before gate: production IndexedDB storage claim |

## Backup/export compatibility risks

### Incomplete export

If backup/export reads only localStorage while IndexedDB holds adapter-backed data, the export is incomplete. The backup envelope must cover all storage surfaces holding canonical data.

### Split-brain storage

Split-brain storage occurs when localStorage and IndexedDB both hold copies of canonical data but diverge. Backup must not read from a split-brain state.

### Stale localStorage

Stale localStorage after adapter write: if the production adapter writes to IndexedDB but localStorage is not updated, a backup that reads localStorage will be stale.

### Stale IndexedDB

Stale IndexedDB after restore: if restore writes only to localStorage while IndexedDB remains populated from a prior state, the IndexedDB copy is stale and may shadow canonical data on next read.

### Partial restore

Partial restore: if restore fails mid-write, some keys are restored and others are not. Restore atomicity envelope must cover all keys.

### Quota failure during export

Quota failure during export: if the storage surface runs out of quota during export, the backup envelope may be incomplete. Export must detect and report quota failure before claiming success.

### Schema mismatch

Schema mismatch: if the backup envelope was produced under a different per-section schemaVersion than the restore target expects, restore may silently corrupt or drop data.

### Async read failure

Async read failure: IndexedDB reads are asynchronous. A read failure during export may silently skip keys. Export must treat async read failure as a fatal error, not a silent skip.

### Transaction failure

Transaction failure: IndexedDB operations run in transactions. A transaction failure mid-export may produce an inconsistent backup. Backup must not finalize on a failed transaction.

### False positive on validate

False positive on validate: a validate step may return success even if keys are missing from the backup envelope if the validator does not cover all storage surfaces. Coverage assertion must name every surface checked.

### Coverage assertion gap

Coverage assertion gap: if backup claims full coverage but does not enumerate the surfaces it checked, a new surface added in future may be silently excluded. The backup envelope must include an explicit coverage assertion naming all surfaces.

### Cross-device drift

Cross-device drift: if a user exports on one device and imports on another, and the two devices have diverged adapter-backed state, restore may not reflect the state of the exporting device. Cross-device parity is not guaranteed in the absence of sync.

### Test-vs-production divergence

Test-vs-production divergence: if test-only adapter behavior diverges from production adapter behavior, tests may pass while production backup/export fails. The test-only prototype must not be used as evidence of production safety.

## Restore and rollback risk analysis

### Restore ordering risks

Restore must write all keys before declaring success. Restore ordering risks arise if keys are written in a sequence where partial completion leaves the application in an inconsistent state.

### Rollback snapshot completeness

Rollback snapshot completeness: a rollback snapshot must include all keys that will be modified by the migration. A snapshot that covers only some keys cannot support full rollback. Rollback snapshot completeness is a required invariant before any migration begins.

### Rollback idempotency

Rollback must be idempotent: rolling back twice must produce the same result as rolling back once. Idempotency is required to support retry on rollback failure.

### Partial rollback

Partial rollback: if rollback fails mid-write, some keys are restored to their pre-migration state and others are not. Rollback must be treated as an all-or-nothing operation with retry on failure.

### Read-after-write verification

Read-after-write verification is required after every restore or migration write. A write that succeeds at the API level may still fail to persist (quota eviction, browser crash, storage lock). Read-after-write verification must confirm the written value before proceeding.

### Delete-after-verified-copy rule

The delete-after-verified-copy rule applies to all migration and restore operations: source-surface data must not be deleted until the destination write is verified. Verified copy precedes delete.

### User-visible recovery expectations

User-visible recovery expectations must be defined before any migration UX is shipped. A user who loses data expects a recovery path. The recovery path must be documented and tested before user-facing migration UI is added.

### Restore atomicity envelope

The restore atomicity envelope defines the boundary within which restore is considered atomic. All keys within the envelope must be restored before success is declared. The restore atomicity envelope must be specified before any restore behavior change.

### Quiesce / snapshot protocol before adapter-backed export

Before adapter-backed export, a quiesce step must pause writes to the adapter-backed storage surface. A snapshot is taken while writes are quiesced. Export reads from the snapshot, not from live storage. The quiesce / snapshot protocol must be proven before any adapter-backed export is attempted.

### All-or-nothing export/restore failure behavior

All-or-nothing export/restore failure behavior: if export or restore fails at any step, the operation must fail completely and cleanly, leaving the storage surface in its pre-operation state. Partial success must not be reported as success.

## Verified-copy-before-delete invariant

The verified-copy-before-delete invariant governs all migration and restore operations:

- Verified copy precedes delete. A source-surface value must not be deleted until the destination write is verified by read-after-write verification.
- Source-surface deletion is forbidden until destination write is verified.
- Source-surface deletion is forbidden until backup/export compatibility is proven across all storage surfaces.
- localStorage deletion is forbidden in Phase 18B.
- Future deletion requires an explicit gate approval and a documented rollback proof.

This invariant applies without exception. A migration that deletes before verifying is forbidden.

## What Phase 18B explicitly does not implement

Phase 18B does not implement any of the following:

- No production IndexedDBAdapter.
- No production registry switch.
- No live migration.
- No dual-write.
- No runtime manifest.
- No runtime eventlog.
- No runtime migrationjournal.
- No migration engine.
- No app boot migration.
- No user-facing migration ui.
- No real data movement.
- No localStorage deletion.
- No sync.
- No cloud.
- No account.
- No auth.
- No backend.
- No backup schema change.
- No restore behavior change.
- No production runtime changes.

These non-goals are stated explicitly so this document cannot be read as claiming these features exist.

## Claim boundaries

Each claim boundary defines what may and may not be asserted after Phase 18B passes.

### Allowed claims after Phase 18B

- Backup/export/restore compatibility risks have been audited.
- Phase 18B defines the compatibility contract that future adapter-backed storage must satisfy.
- Production backup/export/restore behavior remains unchanged in Phase 18B.
- localStorage remains the canonical production storage surface.
- The verified-copy-before-delete invariant is documented and required for any future migration.
- Backup, restore, and rollback risks for multi-surface storage are catalogued.
- No production IndexedDBAdapter, registry switch, dual-write, migration engine, app boot migration, or user-facing migration UI exists.
- Go/no-go criteria for Phases 18C, 18D, and 18E are written.

### Forbidden claims after Phase 18B

The following claims are forbidden. These claim boundaries apply until the corresponding gates pass:

- backup/export supports indexeddb-backed production storage — forbidden, not implemented.
- adapter-backed migration is ready — forbidden, not gated.
- production indexeddb storage exists — forbidden, not implemented.
- data-loss prevention is not guaranteed — correct, do not claim it is guaranteed.
- live migration is not implemented, not safe to claim.
- dual-write is not safe, not implemented.
- cross-device parity is not guaranteed.
- sync/cloud/account/auth/backend does not exist.
- backup is not adapter-aware in Phase 18B.
- restore is not adapter-aware in Phase 18B.
- migration has not shipped.
- migration is not complete.
- public active FSRS rollout is not in scope.

## Go/no-go criteria for Phase 18C, 18D, 18E

### Phase 18C — Manual migration UX plan

Go only if:
- Phase 18B is merged on main and CI green.
- Phase 18B audit is referenced from the Phase 18C doc.
- User-visible recovery expectations from Phase 18B are treated as UX input.
- Phase 18C remains docs-only.
- No UI code, no shipped strings, no Settings toggle is added.

No-go if:
- Phase 18B validator is not green.
- UX plan tries to ship UI before audit invariants are codified.
- Any migration toggle is proposed before rollback path is documented.

### Phase 18D — Internal/test-only local migration pilot

Go only if:
- Phase 18B and 18C are merged and CI green.
- One low-risk key family is selected.
- Pilot is gated behind a test-only flag and is never reachable in production app boot.
- Canonical write remains localStorage.
- Read-after-write verification is mandatory.
- Rollback is proven before completion.
- Backup/export remains unchanged.
- No production user data is touched.
- Synthetic fixtures only.

No-go if:
- App boot migration is proposed.
- IndexedDB becomes the production read source.
- localStorage deletion is proposed.
- User-facing toggle is proposed before Phase 18E.

### Phase 18E — Limited local backend pilot with rollback gates

Phase 18E cannot start until backup, restore, rollback, validation, and UI copy are all adapter-aware in test, and the internal pilot from Phase 18D has demonstrated zero-loss reversibility across representative synthetic/internal data.

## Safety invariants

The following safety invariants apply to all phases from Phase 18B onward:

- localStorage is canonical until an explicit future gate changes this.
- Backup reads the canonical source only.
- Restore writes to the canonical target only.
- Verified-copy-before-delete: delete only after verified write to destination.
- Backup/export must not claim coverage of storage surfaces it does not cover.
- Rollback snapshot completeness is required before any migration begins.
- Read-after-write verification is required after every migration or restore write.
- All-or-nothing export/restore failure behavior: fail clean, not partial.
- No production runtime changes are introduced in Phase 18B.

## Future sequencing

The planned sequence from Phase 18B forward:

1. Phase 18B — audit doc + validator + CI registration (this phase)
2. Phase 18C — manual migration UX plan, docs-only
3. Phase 18D — internal/test-only local migration pilot, one low-risk key family
4. Pause and verify: zero-loss reversibility demonstrated
5. Phase 18E — limited local backend pilot with rollback gates, only if all gates pass

## Acceptance criteria

Phase 18B passes when:

- `docs/phase18b-backup-export-compatibility-audit.md` exists with all required sections.
- `scripts/validate-phase18b-backup-export-compatibility-audit.js` exists and passes.
- `.github/workflows/e2e-smoke.yml` registers Phase 18B validator after Phase 18A.
- All required terms are present in the doc.
- All non-goal terms are present.
- No forbidden positive claims appear outside negated context.
- No forbidden runtime files exist.
- No src/, tests/, e2e/, or package files are changed.
- Full validator chain passes: FINAL_STATUS=0.
