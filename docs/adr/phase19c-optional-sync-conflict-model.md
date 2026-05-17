# Phase 19C — Optional Sync Conflict Model Design

## Purpose

Phase 19C is a docs/static-validator/CI-only optional sync conflict model design gate for Shime Quiz / ShimeChamhoc v2. It does not implement sync. It does not implement conflict resolver runtime. It does not implement event log runtime. It does not touch production storage, backup, FSRS, or migration runtime. Its only job is to define the conflict and event model for any future optional sync work, lock in the backup-before-merge invariant as a static-validator rule, and codify the FSRS sync sequencing constraint inherited from Phase 19A.

Phase 19C follows the HYBRID_STAGED_APPROACH selected in Phase 19B. Phase 19C does not unlock sync implementation. Each future sync stage is still its own explicit, reversible gate.

## Relationship to Phase 19B

Phase 19B selected HYBRID_STAGED_APPROACH for optional sync and established:

- localStorage remains the canonical production source of truth
- No sync runtime exists
- No account/auth/backend exists
- No cloud sync exists
- No production IndexedDBAdapter exists
- No runtime migration exists
- No dual-write exists
- No localStorage deletion happens
- Backup/export/restore behavior remains unchanged
- Manual transfer comes before runtime sync
- No sync runtime before conflict model and trust copy gates are merged
- No sync runtime before backup-before-merge is a static-validator invariant

Phase 19B directed Phase 19C to decide the conflict and event model in docs only, and Phase 19D to define no-cloud/default-off trust copy in docs only.

Phase 19C is the direct successor to Phase 19B. It inherits all Phase 19B guardrails and does not weaken any of them.

## Current production baseline

The following statements describe the current production state as of Phase 19C. None of these are changed by Phase 19C.

- Phase 19C is docs/static-validator/CI-only.
- Sync runtime is not implemented.
- Conflict resolver runtime is not implemented.
- Event log runtime is not implemented.
- Operation log runtime is not implemented.
- Tombstone runtime is not implemented.
- Device identity runtime is not implemented.
- Account/cloud sync is not implemented.
- No Shime-hosted backend exists.
- No account/auth/identity exists.
- No remote endpoint exists.
- No dual-write exists.
- No app-boot migration exists.
- No production storage backend switch exists.
- No production IndexedDBAdapter exists.
- No runtime migration exists.
- No localStorage deletion happens.
- localStorage remains the canonical production source of truth.
- Backup/export/restore behavior remains unchanged.
- Phase 19C does not unlock sync implementation.
- Phase 19D must define no-cloud/default-off trust copy before any sync UX.
- Manual transfer still comes before runtime sync.

## Conflict model decision

```text
CONFLICT_MODEL_DECISION: EVENT_LOG_PLUS_PER_RECORD_REVISION_CLOCK
```

Phase 19C adopts the two-layer conflict model: event log as the canonical change-tracking layer, with per-record revision clock, tombstones, and device ID as the structural primitives, and per-family merge policy layered on top.

This model is selected because:

- It precisely handles the most dangerous data families (FSRS metadata, review schedules, library/quiz data) without relying on coarser per-key last-write-wins semantics that cannot safely merge learning state.
- It is append-only at the event log layer, which means the event log itself is naturally conflict-resistant and can be reconstructed on any device.
- Tombstones give delete semantics without silent data loss: a delete is a record, not an absence.
- Device ID provides a writer-disambiguation primitive without requiring an account, which preserves Shime's no-account default.
- Per-family merge policy allows safe families (settings, recommendation feedback) to use simpler policies without dragging all families through per-record revision clock overhead.
- Backup-before-merge remains mandatory regardless of merge policy tier, making every merge reversible.

This model is docs-only. No runtime implementation is introduced.

## Two-layer model overview

The two-layer model is:

**Layer 1 — Change tracking:**

- Event log: an append-only sequence of change events. Each event records the data family, record ID, device ID, logical timestamp, and the mutation (create/update/delete/tombstone).
- Per-record revision clock: a monotonic counter on each record that is incremented on every mutation. A higher revision on the same record ID from any device wins unless a merge policy says otherwise.
- Tombstones: a deleted record leaves a tombstone record that carries the deletion event, revision clock value, and device ID. Tombstones prevent resurrection of deleted records during sync.
- Device ID: a stable per-device identifier (not an account). Used to disambiguate writers and to define "device-authoritative" semantics for families that use that policy.

**Layer 2 — Per-family merge policy:**

Each data family has a declared merge policy (see Per-family merge policy section). The policy governs how conflicts between two revision clocks on the same record are resolved. Policy options are:

- `per-record-clock-lww`: last-revision-clock wins; no user interaction needed
- `per-record-clock-device-authoritative`: the device that last reviewed/edited this record is authoritative; explicit user choice required to override
- `per-record-clock-conflict-ui`: conflict UI required when clocks diverge on the same record
- `append-only-commutative`: events are commutative; no conflict possible; still backup-before-merge
- `per-key-lww-with-backup`: per-setting or per-key last-writer-wins if backup-before-merge exists; no per-record clock needed
- `never-auto-sync`: this family must never be automatically synchronized

Layer 1 is required for all sync-eligible families. Layer 2 is declared per family.

## Event log design boundary

The event log is a design boundary defined here in docs only. No runtime implementation is introduced.

Design properties of the event log:

- Append-only: events are never mutated, only appended.
- Per-device-local initially: each device accumulates its own event log. A future sync step merges event logs, but the log itself is device-local until then.
- Logically ordered by device ID + logical timestamp pair: this avoids wall-clock skew between devices.
- Schema includes: `{ eventId, familyId, recordId, deviceId, logicalTs, mutationType, payloadHash }`.
- The event log itself must never be an auto-sync target. It is device-local provenance. Future sync of the event log, if it occurs, must be gated behind its own explicit phase.
- The Phase 17D/17F migration journal and event log prototype designs are precursor artifacts to this design boundary; those designs remain test-only until their own promotion gate clears.

The forbidden runtime files for event log include:

- `src/storage/EventLog.js`
- `src/storage/operationLog.js`

These must not exist as production runtime files. Their test-only counterparts, if they exist, must remain behind double gates.

## Per-record revision clock design boundary

The per-record revision clock is a design boundary defined here in docs only. No runtime implementation is introduced.

Design properties of the per-record revision clock:

- Monotonically increasing integer attached to each record.
- Incremented on every create, update, or delete mutation, on the device that made the change.
- Two revision clocks on the same record ID are compared by value: higher revision wins for LWW policies.
- For `per-record-clock-device-authoritative` policies, the device that last mutated the record is authoritative regardless of numeric comparison.
- A revision clock of `0` means "record has never been modified since creation." A revision clock increment on delete produces a tombstone revision.
- The revision clock is part of the record schema for all sync-eligible families. It is not a separate data structure.

Minimum clock granularity: per-record. Per-key clock is not sufficient for FSRS metadata, review schedules, or library/quiz data because coarser clocks cannot distinguish "card A was edited on device 1, card B was edited on device 2" from "all cards were edited on both devices."

The forbidden runtime file for per-record revision clock includes:

- `src/storage/deviceIdentity.js`

This must not exist as a production runtime file in Phase 19C.

## Tombstone design boundary

Tombstones are a design boundary defined here in docs only. No runtime implementation is introduced.

Design properties of tombstones:

- A tombstone is a record that represents the deletion of another record. It carries: `{ tombstoneId, familyId, deletedRecordId, deviceId, revisionClock, logicalTs }`.
- Tombstones are retained until a future garbage-collection gate is defined. No garbage collection policy is set in Phase 19C.
- Tombstones prevent resurrection: if a deleted record appears in a sync merge, the tombstone's revision clock is compared against the incoming record's revision clock. If the tombstone clock is higher, the record is rejected.
- Tombstones are per-family. Backup/restore payloads and migration journals do not use tombstones; they must never auto-sync.

The forbidden runtime file for tombstones includes:

- `src/storage/tombstones.js`

This must not exist as a production runtime file in Phase 19C.

## Device identity design boundary

Device identity is a design boundary defined here in docs only. No runtime implementation is introduced.

Design properties of device identity:

- A device ID is a stable per-device identifier generated once on first launch and stored locally.
- Device ID does not require an account. It is not synced. It is not shared with a server. It is purely local disambiguation metadata.
- Device ID is used in the event log, per-record revision clocks, and tombstones to identify the writer.
- If a device is wiped and reinstalled, a new device ID is generated. This is safe: the new device has no local state to conflict with.
- Device ID must never be used as an identifier in any backend, account, or cloud system. It is local-only.

The forbidden runtime file for device identity includes:

- `src/storage/deviceIdentity.js`
- `src/state/syncStorage.js`

These must not exist as production runtime files in Phase 19C.

## Per-family merge policy

The following table defines the merge policy for each Shime data family. This is a design-only declaration. No runtime implements these policies in Phase 19C.

| Data family | Merge policy | Notes |
|---|---|---|
| library / quiz data | `per-record-clock-conflict-ui` | Conflict UI required for same-record divergence. Backup-before-merge mandatory. |
| study history | `append-only-commutative` | Append-only by nature; events commute. Backup-before-merge still mandatory. |
| review schedules | `per-record-clock-device-authoritative` | Device that last scheduled is authoritative. No silent merge. Explicit user choice required to override. Backup-before-merge mandatory. |
| FSRS metadata / review logs | `per-record-clock-device-authoritative` | Highest-stakes family. No silent merge. Per-record clock minimum. Follows Phase 19A FSRS opt-in sequencing. Backup-before-merge mandatory. |
| settings | `per-key-lww-with-backup` | Per-setting last-writer-wins only when backup-before-merge exists. No per-record clock required. |
| recommendation feedback | `append-only-commutative` | Commutative candidate. No conflict UI required. Backup-before-merge still mandatory. |
| EduGen draft / source metadata | `per-record-clock-conflict-ui` | Per-record clock and conflict UI required. Backup-before-merge mandatory. |
| backup / restore payloads | `never-auto-sync` | Must never be automatically synchronized. User-initiated only. They are the rollback floor. |
| migration manifests / journals | `never-auto-sync` | Device-local provenance only. Must never auto-sync. |

Key rules:

- Every family requires backup-before-merge before any merge can be applied.
- FSRS-family data is the highest-risk sync target and additionally gated by Phase 19A.
- Backup payloads and migration journals must never auto-sync.

## Backup-before-merge invariant

The backup-before-merge invariant is elevated to a static-validator rule by Phase 19C.

Before any future sync merge can mutate local state, all of the following must hold:

1. A restorable local snapshot must be captured into a backup artifact before the merge begins.
2. The backup/export/restore boundary must remain separate from sync. Backup is user-initiated; sync is device-initiated. The two paths must remain visually and semantically separate.
3. Backup payloads must not be sync targets. They are themselves the rollback floor.
4. Migration journals and manifests must not be sync targets. They are device-local provenance.
5. Every merge must be reversible or abortable. If the merge cannot be aborted after the backup is captured, the design is not acceptable.
6. Local state must not be silently overwritten by any sync merge. Every overwrite requires a prior backup and a user-visible confirmation or conflict UI.

This invariant is not about runtime today. It is recorded here so that the Phase 19C static validator and all future static validators can cite it and block any sync runtime that would violate it.

The Phase 19B ADR already stated: "No sync runtime before backup-before-merge is a static-validator invariant." Phase 19C fulfills that requirement by recording this invariant in the Phase 19C validator's checks.

## FSRS and review schedule conflict policy

FSRS metadata and review schedules are the highest-stakes sync targets in Shime. The following rules apply and are mandatory for any future sync design that involves these families.

1. FSRS sync cannot precede Phase 19A public opt-in sequencing. The Phase 19A gate must clear first. Phase 19C does not change this.
2. FSRS/review schedule data must not silently merge. Silent merge is unacceptable for these families because a wrong merge can silently degrade learning (moving a card from "due in 6 days" to "due tomorrow" or vice versa).
3. FSRS/review schedule data requires per-record revision clocks at minimum. A coarser clock is insufficient.
4. Device-authoritative policy or explicit user choice is required for FSRS/review schedule data. The device that last reviewed or scheduled a card is authoritative for it unless the user explicitly overrides.
5. Backup-before-merge is mandatory for FSRS/review schedule data. No FSRS merge without a prior local backup.
6. Any future FSRS sync runtime work must first land internal/test-only behind double gates, as established by Phases 14J/14K/14L/14M/14N for FSRS scheduling itself.

These rules are recorded here so that the Phase 19C validator and future validators can enforce them as static invariants.

## Manual conflict resolution policy

When a merge policy requires conflict UI (families: library/quiz data, EduGen draft/source metadata), the following design principles apply. These are docs-only design constraints; no UI is implemented.

- The conflict UI must present both versions to the user, clearly labelled by device ID and logical timestamp.
- The conflict UI must not auto-resolve in the background. The user must make an explicit choice.
- The conflict UI must not proceed until after backup-before-merge is captured.
- The user must be able to abort the merge and restore from the pre-merge backup without data loss.
- The Vietnamese-first copy for conflict UI will be defined in Phase 19D or Phase 20C, not here.

For families with `per-record-clock-device-authoritative` policy (review schedules, FSRS metadata), the device-authoritative resolution is the default and no conflict UI is shown. A user-override path exists but is not described in detail until Phase 20C.

For families with `append-only-commutative` policy (study history, recommendation feedback), no conflict UI is needed because events commute.

For families with `per-key-lww-with-backup` policy (settings), no conflict UI is needed because last-writer-wins, but backup-before-merge is still required.

For `never-auto-sync` families (backup payloads, migration journals), no conflict UI is defined or needed. These families must never enter a sync merge path.

## Families that must never auto-sync

The following families must never be automatically synchronized, regardless of which sync option (C or D) is eventually adopted:

- **Backup and restore payloads**: they are the rollback floor. If they are auto-synced, they lose their meaning as a safe restore point. The user must initiate backup/restore explicitly.
- **Migration manifests and journals**: these are device-local provenance records that track what migrations have run on this specific device. They must remain device-local so that a restore from a different device does not confuse the migration system.

These families are in the `never-auto-sync` policy tier and are enforced as such by the Phase 19C validator.

## Validator and CI guardrails

The Phase 19C static validator checks:

- Phase 19C ADR doc exists at `docs/adr/phase19c-optional-sync-conflict-model.md`
- Phase 19C validator exists at `scripts/validate-phase19c-optional-sync-conflict-model.js`
- CI registers Phase 19C validator after Phase 19B validator in `.github/workflows/e2e-smoke.yml`
- Workflow does not use `continue-on-error: true`
- `package.json` unchanged
- `package-lock.json` unchanged
- No `src/` changes
- No `tests/` changes
- No `e2e/` changes
- No FSRS runtime file changes
- No storage/migration runtime file changes
- No backup/export/restore runtime file changes
- No dependency additions
- Forbidden runtime files absent (EventLog.js, SyncAdapter.js, conflictResolver.js, operationLog.js, tombstones.js, deviceIdentity.js, syncStorage.js, adapterBackupBridge.js, syncEngine.js)
- Required ADR headings exist
- Required decision terms exist (CONFLICT_MODEL_DECISION: EVENT_LOG_PLUS_PER_RECORD_REVISION_CLOCK)
- Required per-family policy terms exist
- Required backup-before-merge invariant terms exist
- Required FSRS policy terms exist
- Forbidden positive claims absent
- Historical validator forward-compat entries are exact Phase 19C paths only (no broad allowlists)
- No generated artifacts in tracked/changed files

## What Phase 19C explicitly does not implement

Phase 19C does not implement any of the following. This list is stated so that the Phase 19C static validator and future static validators can cite it.

- Phase 19C does not implement sync runtime.
- Phase 19C does not implement conflict resolver runtime.
- Phase 19C does not implement event log runtime.
- Phase 19C does not implement operation log runtime.
- Phase 19C does not implement tombstone runtime.
- Phase 19C does not implement device identity runtime.
- Phase 19C does not implement account/auth/identity.
- Phase 19C does not implement a Shime-hosted backend.
- Phase 19C does not implement a remote endpoint.
- Phase 19C does not implement cloud sync.
- Phase 19C does not implement file-based sync.
- Phase 19C does not implement dual-write between backends.
- Phase 19C does not implement an app-boot migration.
- Phase 19C does not implement a production storage backend switch.
- Phase 19C does not implement a production IndexedDBAdapter.
- Phase 19C does not implement a runtime migration.
- Phase 19C does not delete localStorage entries.
- Phase 19C does not change backup/export/restore behavior.
- Phase 19C does not change FSRS behavior.
- Phase 19C does not change the active FSRS double-gate.
- Phase 19C does not ship public FSRS opt-in.
- Phase 19C does not change user-facing copy.
- Phase 19C does not add tests of production behavior.
- Phase 19C does not add dependencies.
- Phase 19C does not add UI.
- Phase 19C does not add conflict UI.
- Phase 19C does not add a settings sync toggle.
- Phase 19C does not unlock sync implementation in any subsequent phase by its own existence; each subsequent phase must clear its own gate.

## Go/no-go criteria for Phase 19D

Phase 19D (`Phase 19D — No-Cloud / Default-Off Trust Copy`) may proceed when all of the following hold:

Go criteria:

- Phase 19C is merged and CI is green.
- The conflict model ADR (`docs/adr/phase19c-optional-sync-conflict-model.md`) exists.
- The backup-before-merge invariant is documented in the ADR.
- Forbidden sync/cloud/account/auth claims remain blocked.
- No runtime changes happened in Phase 19C.
- Vietnamese-first trust copy can reference Phase 19B and Phase 19C ADRs.

No-go criteria:

- Any request to implement sync runtime.
- Any request to ship account/cloud/auth/backend.
- Any request to expose sync UI.
- Any request to claim encrypted end-to-end or zero-knowledge.
- Any request to silently merge FSRS/review schedule data.
- Any request to make backup payloads sync targets.

## Future sequencing

The full future sequencing from Phase 19C onward is recorded here for continuity. None of these are commitments. Each is its own gate.

- **Phase 19D** — No-Cloud / Default-Off Trust Copy. Vietnamese-first trust copy, English companion, no-cloud/default-off user-trust rules, claim boundary validator. Docs/static-validator/CI-only.
- **Phase 20A** — Local-first hybrid runtime stabilization audit. Confirm Phase 17B StorageAdapter scaffold and Phase 18A IndexedDBAdapter prototype remain test-only. Confirm Phase 18E synthetic pilot remains internal. Docs/static-validator/CI-only.
- **Phase 20B** — Manual transfer archive design. Choose the canonical transfer archive shape extending the v2 backup format. Docs/static-validator/CI-only.
- **Phase 20C** — Manual transfer UX design. Vietnamese-first copy drafts. Docs/static-validator/CI-only.
- **Phase 20D** — Manual transfer runtime gate. First phase that could plausibly ship manual cross-device transfer runtime, but only if Phases 20A–20C cleared. Still no sync. Still no cloud. Still no account.

Before any sync runtime (Option C or D) is considered:

1. Manual transfer has shipped and survived one full real-beta cycle.
2. Phase 19C conflict model ADR is merged and static-validator rules are live.
3. Phase 19D trust copy is merged in Vietnamese and English.
4. Backup-before-merge is a static-validator invariant.
5. The StorageAdapter has a real (not test-only) adapter for the chosen sync target.
6. Phase 17D/17E/17F event-log/manifest/journal designs are promoted from test-only prototype to runtime contracts.
7. FSRS public opt-in has shipped per the Phase 19A sequencing gate.
8. A documented and rehearsed rollback story exists.
9. The "claims we will and will not make" appendix has been honored across README, landing, marketing, and in-product copy in both Vietnamese and English.
10. Solo/small-team support capacity is confirmed sufficient.

## Acceptance criteria

Phase 19C is complete when all of the following hold:

- This ADR (`docs/adr/phase19c-optional-sync-conflict-model.md`) is present and includes all required headings and decision terms.
- The Phase 19C static validator (`scripts/validate-phase19c-optional-sync-conflict-model.js`) is present, registered in `.github/workflows/e2e-smoke.yml` after the Phase 19B validator, and passes.
- The full validator chain passes with `FINAL_STATUS=0`.
- No `src/` files changed.
- No `tests/` files changed.
- No `e2e/` files changed.
- `package.json` unchanged.
- `package-lock.json` unchanged.
- No FSRS runtime files changed.
- No storage/migration runtime files changed.
- No backup/export/restore runtime files changed.
- No dependencies added.
- No UI added.
- No conflict UI added.
- No sync runtime added.
- No account/auth/backend added.
- No remote endpoint added.
- Backup/export/restore behavior unchanged.
- FSRS behavior unchanged.
- localStorage remains the canonical production source of truth.
- No forbidden positive claims appear in this ADR.
- Historical validator forward-compat entries are restricted to exact Phase 19C paths only (no broad allowlists).
- Artifacts created: patch, ZIP, handoff.
