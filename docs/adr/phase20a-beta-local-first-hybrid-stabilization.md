# Phase 20A — Beta Local-First Hybrid Stabilization Gate

## Purpose

Phase 20A is a docs/static-validator/CI-only beta local-first hybrid stabilization gate for
Shime Quiz / ShimeChamhoc v2. It does not implement sync. It does not implement any runtime.
It does not implement UI. It does not implement account, cloud, or auth. It does not change
storage behavior, FSRS behavior, backup/export/restore behavior, package files, or tests.

Its only job is to consolidate the Phase 17–19 evidence base, confirm that the local-first
hybrid production baseline is stable for beta discussion, define the safety invariants that must
remain active throughout all future phases, and specify the Phase 20B–20D scopes that follow.

```text
BETA_STABILIZATION_DECISION: LOCAL_FIRST_HYBRID_STABILIZATION_AUDIT_ONLY
```

Phase 20A is a stabilization audit gate only. Phase 20A does not implement sync runtime.
Phase 20A does not implement account/cloud/auth/backend. Phase 20A does not implement storage
backend switch. Phase 20A does not implement migration runtime. Phase 20A does not implement UI.
Phase 20A does not add tests. localStorage remains the canonical production source of truth.
Production backup/export/restore behavior remains unchanged. Manual transfer comes before
runtime sync. Sync remains unshipped. Conflict model remains a design decision only.
No-cloud/default-off trust copy remains the user-trust boundary.

---

## Relationship to Phase 17 storage readiness

Phase 17 delivered the storage readiness track that makes local-first hybrid a credible beta
trajectory rather than speculation.

- Phase 17A — Backup/Rollback Harness Before Migration: established the principle that a
  restorable backup must exist before any migration begins. This principle is a mandatory
  precondition for any future runtime storage work.
- Phase 17B — StorageAdapter Scaffold behind LocalStorage/no-op Driver: introduced the
  StorageAdapter boundary in test-only form with localStorage as the only active driver.
  No production storage switch was made. The scaffold remains test-only and has not been
  promoted to a runtime contract.
- Phase 17C — IndexedDB Dry-Run Harness: introduced a dry-run harness to exercise the
  migration path without touching production data. No live migration occurred.
- Phase 17D — Migration Journal / Event Log Architecture Guardrail: defined the event log
  and migration journal design as an architectural boundary. No runtime event log exists.
- Phase 17E — Per-Key Migration Manifest Design: defined per-key migration manifest design
  in docs only. No runtime manifest exists.
- Phase 17F — Test-Only Migration Journal Prototype: delivered a test-only prototype of the
  migration journal design. Stays test-only.
- Phase 17G — Single-Key Dry-Run Migration Rehearsal: exercised single-key dry-run migration
  in test-only mode. No production data moved.
- Phase 17H — Single-Key Reversible Migration Pilot: exercised single-key reversible migration
  in test-only mode behind double gates. No production data moved.
- Phase 17I — Local Migration Readiness Closure / Phase 18 Gate: confirmed that the Phase 17
  storage readiness track is complete for docs/test-only scope and that Phase 18 may begin.
  No production storage switch was made.

None of Phase 17A–17I shipped production migration, production IndexedDB storage, or a
production storage backend switch. The Phase 17B StorageAdapter scaffold and the Phase 17C-17I
test harnesses remain test-only. Phase 20A confirms this and locks it as a safety invariant.

---

## Relationship to Phase 18 local backend pilots

Phase 18 delivered the local backend pilot track that exercised the storage adapter boundary
against real IndexedDB-like test backends.

- Phase 18A — Test-Only IndexedDBAdapter Prototype: delivered an injectable fake backend for
  test-only use. Not a production IndexedDBAdapter. Not promoted to a runtime contract.
- Phase 18B — Backup/Export Compatibility Audit: confirmed that the v2 backup format remains
  the canonical rollback floor and that backup/export is not adapter-aware. No runtime changes.
- Phase 18C — Manual Migration UX Plan: defined the manual migration UX plan in docs only.
  No UX was shipped.
- Phase 18D — Internal/Test-Only Local Migration Pilot: delivered a synthetic
  recommendation-feedback pilot using the test-only local backend. No production data moved.
  No production IndexedDB storage. Remains internal/test-only.
- Phase 18E — Limited Local Backend Pilot with Rollback Gates: delivered a helper and doc
  for a synthetic local backend write/rollback gate. Remains synthetic/internal. No production
  storage switch. No production IndexedDB storage.

None of Phase 18A–18E shipped production IndexedDB storage, production storage backend
switching, or any migration that moved real user data. The Phase 18A test-only IndexedDBAdapter
prototype remains test-only. The Phase 18E synthetic pilot remains internal. Phase 20A confirms
this and locks it as a safety invariant.

---

## Relationship to Phase 19 sync and trust decisions

Phase 19 delivered the sync architecture, conflict model, and trust copy track.

- Phase 19A — FSRS Public Opt-In Sequencing Gate: confirmed that FSRS public opt-in is
  upstream of any FSRS sync work. FSRS public opt-in has not shipped. FSRS sync cannot
  precede public opt-in.
- Phase 19B — Optional Sync Architecture Decision: selected HYBRID_STAGED_APPROACH. No sync
  runtime was implemented. Each future sync stage is its own explicit, reversible gate.
- Phase 19C — Optional Sync Conflict Model Design: adopted
  EVENT_LOG_PLUS_PER_RECORD_REVISION_CLOCK. No conflict resolver runtime was implemented.
  No event log runtime was implemented. Backup-before-merge elevated to a static-validator
  invariant.
- Phase 19D — No-Cloud / Default-Off Trust Copy: defined Vietnamese-first trust copy and
  English companion. Defined the allowed-claim and forbidden-claim boundary for all future
  phases. No runtime was implemented. No sync was unlocked.

No sync runtime exists as a result of Phase 19A–19D. No account/cloud/auth/backend exists.
The conflict model is a design decision only. The trust copy is docs only. Phase 20A confirms
this and locks it as a safety invariant.

---

## Current production baseline

The following statements describe the current production state as of Phase 20A. None of these
are changed by Phase 20A.

- Phase 20A is docs/static-validator/CI-only.
- Sync runtime is not implemented.
- Account/cloud sync is not implemented.
- No Shime-hosted backend exists.
- No account/auth/identity exists.
- No remote endpoint exists.
- No dual-write exists.
- No app-boot migration exists.
- No production storage backend switch exists.
- No production IndexedDB storage exists.
- No production IndexedDBAdapter exists.
- No runtime migration exists.
- No localStorage deletion happens.
- localStorage remains the canonical production source of truth.
- Backup/export/restore behavior remains unchanged.
- Backup is not sync.
- Restore may overwrite current data.
- The Phase 17B StorageAdapter scaffold remains test-only.
- The Phase 18A test-only IndexedDBAdapter prototype remains test-only.
- The Phase 18E synthetic local backend pilot remains internal.
- FSRS active scheduling remains experimental, double-gated, and internal/test-controlled.
- FSRS public opt-in has not shipped.
- Manual transfer is the only cross-device data movement available today.

---

## Beta stabilization decision

```text
BETA_STABILIZATION_DECISION: LOCAL_FIRST_HYBRID_STABILIZATION_AUDIT_ONLY
```

Phase 20A selects LOCAL_FIRST_HYBRID_STABILIZATION_AUDIT_ONLY.

This decision means:

- Phase 20A consolidates evidence from Phase 17–19 and confirms the production baseline.
- Phase 20A does not promote any test-only or synthetic pilot work to production runtime.
- Phase 20A does not implement sync runtime.
- Phase 20A does not implement storage backend switching.
- Phase 20A does not implement migration runtime.
- Phase 20A does not implement UI.
- Phase 20A does not add tests.
- Phase 20A does not claim beta readiness; beta readiness is gated by Phase 20B–20D.
- localStorage remains canonical; local-first remains the production baseline.
- Manual transfer remains the only cross-device data movement path.

The audit confirms that the local-first hybrid trajectory is internally consistent, that all
safety invariants from Phase 17–19 remain active, and that the Phase 20B–20D plan is
coherent. That is the full scope of Phase 20A.

---

## What "local-first hybrid" means for beta

"Local-first hybrid" in the Shime beta context means:

- All production data lives in localStorage on the user's device. This is the single source
  of truth today.
- The StorageAdapter abstraction exists as a boundary that could in the future allow an
  IndexedDB driver or a sync-capable driver to replace the localStorage driver, but this
  promotion has not happened and is not happening in Phase 20A.
- "Hybrid" refers to the design trajectory, not the current production state. The current
  production state is pure local-first (localStorage only).
- "Beta" means the architecture is stable enough to discuss the trajectory publicly without
  making claims that exceed what has been implemented.

Phase 20A does not change any of this. Phase 20A only confirms and documents this state.

---

## What is stable enough for beta discussion

The following is stable enough for beta discussion after Phase 20A:

- The local-first production baseline is confirmed. Data lives on the user's device in
  localStorage. This has been the case since v1 and was audited through Phase 16L, 17A–17I,
  18A–18E, and 19A–19D.
- The optional sync architecture direction is documented (HYBRID_STAGED_APPROACH).
- The optional sync conflict model is documented
  (EVENT_LOG_PLUS_PER_RECORD_REVISION_CLOCK).
- The no-cloud/default-off trust copy is available in Vietnamese and English.
- The backup/export/restore boundary is stable. The v2 backup format is the canonical
  rollback floor.
- The safety invariants are locked as static-validator rules.
- The Phase 20B–20D roadmap is defined (docs only).

---

## What is not stable enough for beta

The following is not stable enough for beta and must not be claimed:

- Sync does not exist. Claiming sync is possible is a forbidden claim.
- Production IndexedDB storage does not exist. Claiming it exists is a forbidden claim.
- Backup/export is not adapter-aware. Claiming it is adapter-aware is a forbidden claim.
- Restore is not adapter-aware. Claiming it is adapter-aware is a forbidden claim.
- FSRS sync is not available. Claiming it is available is a forbidden claim.
- Review schedules do not sync automatically. Claiming they do is a forbidden claim.
- Production migration has not run. Claiming it has is a forbidden claim.
- Data-loss prevention is not guaranteed. Claiming it is guaranteed is a forbidden claim.
- End-to-end encryption does not exist. Claiming it exists is a forbidden claim.
- Zero-knowledge does not exist. Claiming it exists is a forbidden claim.
- Cloud sync does not exist. Claiming it exists is a forbidden claim.
- Account/auth/backend does not exist. Claiming it exists is a forbidden claim.

---

## Evidence inventory

The following evidence items are referenced as support for the Phase 20A stabilization audit.
These items confirm that the local-first hybrid trajectory is internally consistent and that
no forbidden runtime work has been shipped.

Phase 17 storage readiness evidence:

- Phase 17A: backup/rollback harness before migration — restorable backup precondition exists
  as a static-validator rule.
- Phase 17B: StorageAdapter localStorage scaffold — test-only, no production driver switch.
- Phase 17C: IndexedDB migration dry-run harness — dry-run only, no production data moved.
- Phase 17D: migration journal/event log architecture guardrail — docs-only design boundary.
- Phase 17E: per-key migration manifest design — docs-only, no runtime manifest.
- Phase 17F: test-only migration journal prototype — stays test-only.
- Phase 17G: single-key dry-run migration rehearsal — test-only, no production data moved.
- Phase 17H: single-key reversible migration pilot — test-only behind double gates, no
  production data moved.
- Phase 17I: local migration readiness closure / Phase 18 gate — confirmed Phase 17 track
  is complete for docs/test-only scope.

Phase 18 local backend pilot evidence:

- Phase 18A: test-only IndexedDBAdapter prototype — injectable fake, not production.
- Phase 18B: backup/export compatibility audit — v2 backup format confirmed as rollback
  floor; backup not adapter-aware.
- Phase 18C: manual migration UX plan — docs-only, no UX shipped.
- Phase 18D: internal/test-only local migration pilot — synthetic, no production data moved.
- Phase 18E: limited local backend pilot with rollback gates — synthetic/internal, no
  production storage switch.

Phase 19 sync and trust evidence:

- Phase 19A: FSRS public opt-in sequencing gate — FSRS public opt-in upstream of FSRS sync,
  opt-in has not shipped, FSRS sync cannot precede public opt-in.
- Phase 19B: optional sync architecture decision — HYBRID_STAGED_APPROACH selected, no sync
  runtime implemented, localStorage remains canonical.
- Phase 19C: optional sync conflict model design —
  EVENT_LOG_PLUS_PER_RECORD_REVISION_CLOCK adopted in docs, backup-before-merge elevated to
  static-validator invariant, no conflict resolver runtime.
- Phase 19D: no-cloud/default-off trust copy — Vietnamese-first trust copy and English
  companion in docs, allowed/forbidden claim boundary defined, no runtime.

None of these phases shipped production migration runtime, production sync runtime, production
IndexedDB storage, production storage backend switching, or any runtime that moves real user
data to a new storage backend.

---

## Safety invariants

The following safety invariants are active as of Phase 20A. They must remain active for all
future phases unless explicitly unlocked by a separate, dedicated gate.

Storage invariants:

- localStorage remains canonical production storage.
- No production IndexedDB storage exists.
- No production storage registry switch exists.
- No runtime migration exists.
- No dual-write between backends exists.
- No app-boot migration exists.
- localStorage deletion is forbidden in any storage transition path.

Backup/restore invariants:

- backup/export/restore remains separate from sync.
- backup is not sync.
- restore may overwrite current data.
- backup-before-merge remains required before any future sync merge.
- backup payloads must never auto-sync.
- migration manifests/journals must never auto-sync.
- The v2 backup format remains the canonical rollback floor.

Sync invariants:

- no sync runtime before manual transfer has shipped and survived real beta feedback.
- no storage backend switch without a separate runtime gate.
- no account/cloud/auth/backend without a separate architecture gate.
- no public claim that sync exists.
- no public claim that data-loss prevention is guaranteed.
- no public claim of end-to-end encryption or zero-knowledge.

FSRS invariants:

- FSRS/review schedule data must not silently merge.
- FSRS sync must follow Phase 19A public opt-in; FSRS sync never precedes public opt-in.
- FSRS active scheduling remains double-gated and internal/test-controlled.

---

## Manual transfer before sync

Manual transfer is the only cross-device data movement path today. Before any sync runtime
is considered, manual transfer must have shipped via Phase 20A–20D and survived one full
real-beta cycle without silent data loss, surprise overwrites, or a large support backlog.

"Manual transfer" means:

1. User exports data on the source device.
2. User carries the file (USB, email, or any manual method) to the target device.
3. User imports the file on the target device.

This is not sync. This is manual transfer. If the user edits data on both devices after
transferring, the two copies diverge and Shime cannot automatically merge them. The user is
the conflict resolver in the manual transfer model.

Phase 20A does not ship manual transfer UX. Phase 20A confirms the trajectory. Phase 20B
will define the transfer archive design. Phase 20C will define the transfer UX copy. Phase 20D
will be the first phase that could plausibly ship manual transfer runtime.

---

## Backup and restore boundaries

The backup/restore boundary is a hard boundary that must remain intact regardless of future
sync or storage work.

- Backup is user-initiated. The user explicitly requests a backup. Shime does not
  automatically backup.
- Restore is destructive. Restore replaces current local state. A restore may overwrite
  current data. Shime warns before restoring.
- Backup is not sync. Even if sync is ever implemented, backup remains a separate,
  user-initiated, user-verifiable snapshot. Backup files must never be silently overwritten
  by sync activity.
- The two paths (backup/restore and sync) must remain visually and semantically separate
  in any future UX.
- Backup payloads must never auto-sync. They are the rollback floor. Auto-syncing them would
  destroy their meaning as a safe restore point.
- Migration manifests and journals must never auto-sync. They are device-local provenance.

---

## FSRS and scheduler boundaries

FSRS metadata and review schedules are the highest-risk sync targets in Shime.

- FSRS active scheduling remains experimental, double-gated, and internal/test-controlled.
- FSRS public opt-in has not shipped. No copy may imply that FSRS is publicly available.
- FSRS sync cannot precede public opt-in per the Phase 19A sequencing gate.
- FSRS/review schedule data must not silently merge between devices.
- Device-authoritative is the safe default for FSRS/review schedule data.
- Per-record revision clock minimum is required for FSRS/review schedule sync (if ever).
- Backup-before-merge is mandatory for FSRS/review schedule data.
- Any future FSRS sync runtime must first land internal/test-only behind double gates.

Phase 20A does not change FSRS behavior. Phase 20A does not change the FSRS double-gate.

---

## Storage and migration boundaries

The storage and migration boundary defines what may not change without a separate explicit gate.

- localStorage remains the canonical production storage driver.
- The Phase 17B StorageAdapter scaffold remains test-only. It must not be promoted to a
  production runtime contract without a separate explicit gate.
- The Phase 18A test-only IndexedDBAdapter prototype remains test-only. It must not be
  promoted to a production IndexedDB driver without a separate explicit gate.
- The Phase 18E synthetic local backend pilot remains internal. It must not be promoted to
  production without a separate explicit gate.
- The Phase 17D/17E/17F event-log/manifest/journal designs remain test-only prototypes. They
  must not be promoted to runtime contracts without a separate explicit gate.
- No production migration may run without a separate runtime gate that includes a backup
  precondition, a rollback path, and a user-visible confirmation flow.

---

## Sync and cloud boundaries

The sync and cloud boundary defines what may not exist without a separate explicit gate.

- No sync runtime exists.
- No cloud sync exists.
- No Shime-hosted backend exists.
- No account/auth/identity exists.
- No remote endpoint exists.
- No event log runtime exists.
- No conflict resolver runtime exists.
- No device identity runtime exists.
- No dual-write runtime exists.

Any of the above requires a dedicated architecture gate before implementation may begin.
A docs/static-validator/CI-only phase does not unlock sync implementation.

---

## Vietnamese-first trust copy boundaries

Phase 19D defined the Vietnamese-first trust copy and the allowed/forbidden claim boundary.
Phase 20A confirms those boundaries are active and must remain active.

- The Vietnamese trust copy (`docs/trust/no-cloud-default-off.vi.md`) is the primary source
  of truth for all trust-critical user-facing copy.
- The English companion (`docs/trust/no-cloud-default-off.md`) must remain consistent with
  the Vietnamese version.
- Any conflict or ambiguity is resolved by the Vietnamese version.
- Forbidden claims defined in Phase 19D remain forbidden in Phase 20A and all future phases.
- Any new trust-critical user-facing string must have both a Vietnamese version and an English
  version, with Vietnamese as the primary.

---

## Phase 20B scope

Phase 20B is `Phase 20B — Real User Testing / Data Safety Feedback Plan`.

Scope:

- docs/static-validator/CI-only.
- Plan user testing and data safety feedback collection.
- No runtime.
- No UI.
- No sync.

Phase 20B should handle real user testing / data safety feedback plan. Phase 20B does not
implement sync, runtime, UI, or storage changes. Phase 20B is gated by Phase 20A completing.

---

## Phase 20C scope

Phase 20C is `Phase 20C — Performance / Quota / Import Stress Test Plan`.

Scope:

- docs/static-validator/CI-only or test-only stress fixtures if explicitly approved later.
- Plan performance, quota, and import stress testing.
- No sync runtime.
- No storage backend switch.
- No production migration.

Phase 20C should handle performance/quota/import stress test plan. Phase 20C does not
implement sync runtime or storage backend switching. Phase 20C is gated by Phase 20B completing.

---

## Phase 20D scope

Phase 20D is `Phase 20D — Release Decision: Local-First Hybrid Beta-Ready or Hold`.

Scope:

- docs/static-validator/CI-only decision gate.
- Decide beta-ready or hold.
- No runtime unless separately scoped later.

Phase 20D should decide local-first hybrid beta-ready or hold. Phase 20D is gated by Phase
20B and Phase 20C completing. Phase 20D does not implement runtime unless a separate explicit
gate authorizes it.

---

## What Phase 20A explicitly does not implement

Phase 20A does not implement any of the following. This list is stated so that the Phase 20A
static validator and future static validators can cite it.

- Phase 20A does not implement sync runtime.
- Phase 20A does not implement conflict resolver runtime.
- Phase 20A does not implement event log runtime.
- Phase 20A does not implement tombstone runtime.
- Phase 20A does not implement device identity runtime.
- Phase 20A does not implement account/auth/identity.
- Phase 20A does not implement a Shime-hosted backend.
- Phase 20A does not implement a remote endpoint.
- Phase 20A does not implement cloud sync.
- Phase 20A does not implement file-based sync.
- Phase 20A does not implement dual-write between backends.
- Phase 20A does not implement an app-boot migration.
- Phase 20A does not implement a production storage backend switch.
- Phase 20A does not implement a production IndexedDBAdapter.
- Phase 20A does not implement a runtime migration.
- Phase 20A does not delete localStorage entries.
- Phase 20A does not change backup/export/restore behavior.
- Phase 20A does not change FSRS behavior.
- Phase 20A does not change the active FSRS double-gate.
- Phase 20A does not ship public FSRS opt-in.
- Phase 20A does not change user-facing production UI copy.
- Phase 20A does not add tests of production behavior.
- Phase 20A does not add dependencies.
- Phase 20A does not add UI.
- Phase 20A does not add a settings sync toggle.
- Phase 20A does not unlock sync implementation in any subsequent phase by its own existence;
  each subsequent phase must clear its own gate.

---

## Acceptance criteria

Phase 20A is complete when all of the following hold:

- This ADR (`docs/adr/phase20a-beta-local-first-hybrid-stabilization.md`) is present and
  includes all required headings and decision terms.
- The Phase 20A static validator
  (`scripts/validate-phase20a-beta-local-first-hybrid-stabilization.js`) is present,
  registered in `.github/workflows/e2e-smoke.yml` after the Phase 19D validator, and passes.
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
- No sync runtime added.
- No account/auth/backend added.
- No remote endpoint added.
- Backup/export/restore behavior unchanged.
- FSRS behavior unchanged.
- localStorage remains the canonical production source of truth.
- No forbidden positive claims appear outside explicitly labelled forbidden-claim sections.
- Historical validator forward-compat entries are restricted to exact Phase 20A paths only
  (no broad allowlists).
- Artifacts created: patch, ZIP, handoff.
