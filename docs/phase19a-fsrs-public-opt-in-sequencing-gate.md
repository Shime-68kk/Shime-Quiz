# Phase 19A — FSRS Public Opt-In Sequencing Gate

## Purpose

Phase 19A is a docs/static-validator/CI-only gate that decides how FSRS public opt-in should be sequenced after the storage safety foundation established in Phase 18.

Phase 19A does not ship public FSRS opt-in. It documents the sequencing requirements, preconditions, risk register, and go/no-go criteria so that a future implementation phase can proceed safely.

Public FSRS opt-in is not shipped in Phase 19A. No runtime code, no UI code, no test changes, no package changes, no FSRS behavior changes, and no storage behavior changes are introduced.

## Relationship to Phase 15 FSRS foundation

Phase 15 established the active FSRS scheduling foundation — double-gated, experimental, and controlled. Active FSRS is not broadly public or user-visible. Existing active FSRS remains experimental, double-gated, internal/test controlled, and not broadly public or user-visible. No production `ts-fsrs.next()` call sites were added beyond the existing experimental gate.

Phase 15 validators remain green and are unchanged by Phase 19A. The double-gated structure protecting active FSRS is unchanged.

## Relationship to Phase 18 storage safety foundation

Phase 18 established storage safety foundations:

- Phase 18A introduced a test-only IndexedDB adapter prototype (injectable fake backend, no production exposure).
- Phase 18B audited backup/export compatibility.
- Phase 18C documented manual migration UX.
- Phase 18D introduced an internal/test-only local migration pilot using synthetic recommendation-feedback data.
- Phase 18E introduced a limited local backend pilot with write/rollback gates.

Phase 18 storage/migration pilots remain internal/test-only and synthetic-only. No production IndexedDBAdapter exists. No production storage registry switch exists. No runtime migration exists.

localStorage is the canonical production source of truth. Production backup/export/restore behavior remains unchanged.

## Current production baseline

- localStorage is the canonical production source of truth.
- Production backup/export/restore behavior remains unchanged.
- No production IndexedDBAdapter exists.
- No production storage registry switch exists.
- No runtime migration exists.
- No sync, cloud, account, auth, or backend exists.
- Active FSRS remains experimental, double-gated, and internal/test controlled.
- No user-facing FSRS opt-in UI is present in Phase 19A.
- No active FSRS scheduling behavior changes have been made in Phase 19A.
- No production `ts-fsrs.next()` call sites have been added in Phase 19A.

## Public opt-in is not shipped in Phase 19A

Public FSRS opt-in is not shipped in Phase 19A. This phase is docs/static-validator/CI-only.

No user-facing FSRS opt-in UI is added in Phase 19A. No active FSRS scheduling behavior changes are introduced. No new production `ts-fsrs.next()` call sites are added. Existing active FSRS remains experimental, double-gated, internal/test controlled, and not broadly public or user-visible.

## Preconditions before any public FSRS opt-in

Before any public FSRS opt-in can be implemented in a future phase, all of the following preconditions must be satisfied:

1. Storage safety foundation remains green after Phase 18. Phase 18 validators must pass without regression before any public opt-in.
2. Backup/export/restore trust boundaries are not regressed. Production backup/export/restore behavior remains unchanged from the Phase 18 baseline.
3. Rollback and exit paths are documented before user exposure. A user must be able to leave FSRS scheduling and return to SM-2 without data loss.
4. FSRS claim language remains narrow and honest. Claims must not overstate algorithm performance or imply guarantees.
5. Public opt-in must be user-controlled and reversible. Users must be able to disable FSRS scheduling at any time without data loss.
6. Public opt-in must not silently migrate existing records. No existing SM-2 records may be modified without explicit user acknowledgment.
7. Public opt-in must not change storage backends. Opt-in refers to scheduling algorithm only, not the storage layer.
8. Public opt-in must not imply cloud/sync/account/auth. No sync, cloud, account, auth, or backend service is involved.
9. Public opt-in must not guarantee better outcomes. Algorithm claims must be hedged as experimental with no guaranteed learning gains.
10. Public opt-in must have recovery copy before implementation. A backup/restore plan must exist before any user-facing migration step.
11. Public opt-in must have an internal dogfood gate before broad exposure. Internal users must validate the experience before rollout.
12. Public opt-in must have explicit metrics/evidence requirements before release. Success criteria and evidence thresholds must be defined and approved before shipping.

## Storage and backup trust dependencies

Public FSRS opt-in cannot be safely exposed without the following storage and backup trust dependencies being satisfied:

- Phase 18 storage safety validators remain green.
- localStorage remains canonical. No production storage switch has occurred.
- Backup/export format is unchanged. Existing backups remain restorable.
- Restore behavior is unchanged. Existing restore flows work identically.
- No production IndexedDBAdapter is required for FSRS opt-in.
- No production storage registry switch is required for FSRS opt-in.
- No runtime migration is required for FSRS scheduling opt-in.
- FSRS scheduling metadata (stability, difficulty, reps, lapses, last_review) is preserved by backup/export.
- FSRS scheduling metadata survives a round-trip backup and restore without loss.

## User-facing opt-in principles

If public FSRS opt-in is ever implemented in a future phase, the following principles must be followed:

- Opt-in must be presented as experimental, not production-grade.
- Opt-in must be reversible. Users can switch back to SM-2 without data loss.
- Opt-in must not imply cloud sync, account backup, or guaranteed retention.
- Opt-in must not imply guaranteed learning gains or guaranteed better outcomes.
- Opt-in copy must be narrow and honest, reviewed in Vietnamese-first context before implementation.
- Opt-in must not silently migrate existing SM-2 records.
- Opt-in must not change the storage backend.
- Opt-in must display a clear "experimental" label.
- Opt-in must have a documented exit path shown to the user before activation.
- Opt-in must not imply any sync/cloud/account/auth/backend service.

## Rollback and exit requirements

Before any public FSRS opt-in implementation:

- A rollback plan must exist that reverts FSRS scheduling metadata to SM-2 defaults without data loss.
- An exit copy must exist for the opt-out UI path, approved in Vietnamese before implementation.
- A backup/restore plan must exist that preserves scheduling metadata across opt-in and opt-out.
- Recovery documentation must exist and be validated before user exposure.
- Internal dogfood rollback must be validated before broad rollout begins.

## Copy and claim boundaries

**Allowed claims after Phase 19A:**

- FSRS public opt-in sequencing has been planned.
- Public opt-in remains unshipped.
- Active FSRS remains experimental and controlled.
- Storage safety dependencies for future FSRS opt-in are documented.
- Rollback/exit requirements for future public opt-in are documented.
- localStorage remains canonical production storage.
- Production backup/export/restore behavior remains unchanged.

**Forbidden claims after Phase 19A:**

The following claims must not be made after Phase 19A. This section is listed to document the boundary, not to assert these claims:

- public fsrs opt-in exists
- public fsrs rollout has shipped
- active fsrs is broadly available
- fsrs guarantees better learning
- production storage migration is complete
- production indexeddb storage exists
- backup/export is adapter-aware
- restore is adapter-aware
- sync/cloud/account/auth/backend exists
- data-loss prevention is guaranteed
- built-in ai or ocr exists

## Risk register

| Risk | Severity | Mitigation |
|------|----------|------------|
| User misunderstanding experimental FSRS | High | Copy must be explicit about experimental status; no guarantees |
| Perceived data loss from changed due dates | High | Rollback path must be documented and tested before user exposure |
| Backup/restore mismatch with scheduling metadata | High | FSRS metadata must survive backup round-trip before opt-in ships |
| Rollback confusion | Medium | Exit copy must be approved before implementation |
| Mixed SM-2/FSRS scheduler display confusion | Medium | Dashboard display must handle mixed state before public opt-in |
| Public claim overreach | High | Claim boundaries enforced by validator; copy review required |
| Premature UI toggle | High | UI must not be exposed before guardrails are validated |
| Migration implied by opt-in | Medium | Copy must explicitly state no silent record migration occurs |
| Support burden | Medium | Internal dogfood gate must validate support load before broad rollout |
| Storage foundation regression | High | Phase 18 validators must remain green before any public opt-in |
| Sync/cloud misconception | Medium | Copy must explicitly state no sync, cloud, account, auth, or backend |
| Vietnamese-first copy ambiguity | Medium | All user-facing opt-in copy must be reviewed in Vietnamese first |

## Go/no-go criteria for future FSRS public opt-in implementation

**Go criteria:**

All of the following must be true before implementing public FSRS opt-in:

- Phase 19A merged and CI green.
- Phase 18 storage safety validators remain green.
- Phase 15 FSRS double-gate validators remain green.
- Public copy is approved as experimental and reversible.
- No production storage migration is required.
- Backup/restore behavior remains trustworthy.
- Rollback/exit plan exists.
- Internal dogfood plan exists.
- User-facing copy avoids guarantees.

**No-go criteria:**

Any of the following triggers an immediate stop:

- Request to enable public FSRS without rollback copy.
- Request to migrate existing records silently.
- Request to remove double gate immediately.
- Request to imply guaranteed learning gains.
- Request to imply cloud sync/account backup.
- Request to change storage backend as part of opt-in.
- Request to expose UI before guardrails are validated.

## What Phase 19A explicitly does not implement

- No public FSRS opt-in UI or settings toggle.
- No active FSRS scheduling behavior changes.
- No production `ts-fsrs.next()` call sites added.
- No storage behavior changes.
- No production IndexedDBAdapter.
- No production storage registry switch.
- No runtime migration.
- No sync, cloud, account, auth, or backend.
- No backup/export format changes.
- No restore behavior changes.
- No test changes.
- No package changes.

## Future sequencing

Phase 19A closes the sequencing gate for FSRS public opt-in. Future phases must satisfy all preconditions listed in this document before implementing public FSRS opt-in. Suggested future sequencing:

1. Phase 19B: Internal dogfood FSRS opt-in (internal/test-only, not user-visible).
2. Phase 19C: Copy review and user-facing opt-in copy approval in Vietnamese.
3. Phase 19D: Rollback and exit path implementation and validation.
4. Phase 19E: Metrics/evidence requirements definition and approval.
5. Phase 20A: Public FSRS opt-in implementation (only if all preconditions are met and CI is green).

## Acceptance criteria

- `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md` exists and contains all required sections.
- `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js` exists and passes.
- `.github/workflows/e2e-smoke.yml` registers Phase 19A validator after Phase 18E.
- No `src/` changes.
- No `tests/` changes.
- No `e2e/` changes.
- No package file changes.
- No FSRS runtime file changes.
- No storage/migration runtime file changes.
- No backup/export/restore runtime file changes.
- Phase 18E validator is updated with Phase 19A forward-compat entries only.
- Full validator chain passes with FINAL_STATUS=0.
