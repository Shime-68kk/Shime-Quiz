# Phase 27A — Backup/Export/Restore Adapter-Awareness Design Gate

## Status tokens

```
PHASE27A_LOCAL_FIRST_HYBRID_DIRECTION_STATUS: COMPLETED_DIRECTION_CHOICE
PHASE27A_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_STATUS: COMPLETED_DESIGN_GATE
PHASE27A_BACKUP_RESTORE_ADAPTER_AWARENESS_DECISION: PASS_TO_PHASE27B_ADAPTER_AWARENESS_EVIDENCE_AND_RUNTIME_DESIGN_REVIEW
PHASE27A_ADAPTER_AWARENESS_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

## Scope

Phase 27A chooses backup/export/restore adapter-awareness design as the next local-first hybrid direction.
Phase 27A does not implement adapter-aware backup/export/restore.
Phase 27A does not approve production adapter-aware backup/export/restore.
Phase 27A only prepares a design and evidence gate for Phase 27B.

This is a docs/planning/testing/release/static-validator/CI-only phase. No runtime source changes. No test changes. No e2e changes. No package changes. No backup/export/restore behavior changes. No backup file format changes. No restore overwrite behavior changes. No storage driver changes. No storage migration. No telemetry. No sync/cloud/account/auth/backend. No production UI.

## Inputs from Phase 26E

Phase 26E closed Phase 26 conservatively and seeded Phase 27A as a planning-first gate.

Phase 26E tokens confirmed:
- `PHASE26E_TESTER_EVIDENCE_REVIEW_STATUS: COMPLETED_TESTER_EVIDENCE_REVIEW`
- `PHASE26E_UI_WIRING_REDECISION: KEEP_HIDDEN_DEFAULT_OFF_HARNESS_NO_PRODUCTION_UI_APPROVAL`
- `PHASE26E_PHASE26_CLOSURE_DECISION: CLOSED_WITH_HIDDEN_DEFAULT_OFF_HARNESS_AND_LIMITED_TESTER_EVIDENCE`
- `PHASE26E_NEXT_DIRECTION_DECISION: PASS_TO_PHASE27A_LOCAL_FIRST_HYBRID_NEXT_DIRECTION_PLANNING`
- `PHASE27A_LOCAL_FIRST_HYBRID_NEXT_DIRECTION_PLANNING_STATUS: PREPARED_PLANNING_SEED`

Phase 26E identified the highest-risk gap: adapter-aware backup/export/restore has no design gate, no evidence, and no safety analysis. This is the highest-priority unresolved item for local-first hybrid readiness.

Phase 26 delivered:
- A hidden/default-off developer/test Backup Health harness (`BackupHealthDevHarness`).
- Tester evidence confirming default-off behavior (blank/null route, no production nav, no storage writes).
- Conservative closure with KEEP_HIDDEN_DEFAULT_OFF_HARNESS_NO_PRODUCTION_UI_APPROVAL.

Phase 26 did NOT deliver:
- Adapter-aware backup/export/restore design or implementation.
- Production-visible Backup Health UI.
- Local-first hybrid readiness decision.
- BETA_READY.

## Direction choice

Phase 27A chooses: **backup/export/restore adapter-awareness design** (candidate direction #3 from the Phase 27A planning seed).

Reason: This directly addresses the highest-risk unresolved gap for local-first hybrid readiness. It is scoped as a design gate only — no runtime, no migration, no production behavior change in Phase 27A. It produces a concrete planning artifact that gates future runtime phases. It is reversible.

`PHASE27A_LOCAL_FIRST_HYBRID_DIRECTION_STATUS: COMPLETED_DIRECTION_CHOICE`

## Purpose

The purpose of this design gate is to define the problem space, identify safe future signal candidates, establish forbidden signals, and frame the evidence gate required before any runtime adapter-aware backup/export/restore implementation may begin.

Phase 27A does not produce or modify any runtime code. All design decisions recorded here are proposals subject to review in Phase 27B.

## Adapter-awareness problem statement

Current backup/export/restore operations are written for a single storage backend (localStorage). As local-first hybrid storage introduces multiple adapters (localStorage driver vs IndexedDB driver), backup/export/restore operations need to be aware of:

1. Which adapter is currently active when a backup/export is triggered.
2. Whether a restore/import target adapter is compatible with the backup source adapter.
3. What metadata, if any, should be included in the backup to identify the source adapter.
4. Whether a restore to a different adapter requires any transformation or warning.

Without adapter-awareness, a backup from an IndexedDB-based store restored into a localStorage-based store (or vice versa) may silently succeed while producing an inconsistent state, or may silently fail without a user-understandable error.

This problem must be designed before any runtime implementation. The design gate must define exact boundaries and forbidden shortcuts.

## Current evidence boundary

Phase 27A establishes no new runtime evidence. All evidence is from static analysis and prior-phase test coverage.

Current evidence from prior phases:
- Backup/export/restore modules are in `src/` and have unit test coverage.
- Storage adapter scaffold exists (Phase 17B) behind LocalStorage/no-op driver.
- IndexedDB dry-run harness exists (Phase 17C) as test-only.
- No production IndexedDB adapter is enabled.
- No adapter identity signal is currently exposed to backup/export/restore modules.

Current evidence boundary: `NOT_RUN_PHASE27A_PREPARED_ONLY`. No Phase 27A runtime commands were executed against production backup/export/restore modules.

## Future adapter-aware signal candidates

The following are design-level candidates for future runtime phases. None are implemented in Phase 27A.

1. **Storage adapter identity** — if already available from existing runtime state (e.g., the storage adapter type can be read from a runtime config already present without adding new persistent tracking), this can be used to annotate the export source. Requires design review to confirm no new tracking is added.

2. **Export source metadata** — if already generated without changing backup file format, the export could include a comment or non-breaking metadata field indicating the source adapter. Requires separate design/evidence gate before backup file format change.

3. **Restore target adapter compatibility warning** — if derived without scanning learner content (e.g., comparing adapter identity at restore time with adapter identity recorded in backup metadata), a warning could be shown if there is a mismatch. Requires design review to confirm no learner content scan.

4. **Generated/test restore rehearsal evidence** — using generated/synthetic test data only (never real learner content), restore rehearsals can be run to verify adapter-to-adapter restore behavior in test environments.

5. **Unavailable/unknown adapter state** — the adapter identity may not always be determinable (e.g., during migration, on an older client). The design must account for unknown/unavailable adapter identity gracefully.

## Allowed future signals

The following are allowed as design-level candidates for future phases, subject to full evidence review in Phase 27B:

- Storage adapter identity if already available from existing runtime state and no new persistent tracking is added.
- Export source metadata if already generated without changing backup file format and without a separate design gate.
- Restore target adapter compatibility warning if derived without scanning learner content.
- Generated/test data restore rehearsal evidence (synthetic data only).
- Unavailable/unknown adapter state handling.

No allowed future signal is approved for runtime implementation in Phase 27A. All require Phase 27B evidence review before any implementation.

## Forbidden future signals

The following are explicitly forbidden from any future adapter-awareness implementation and may not be proposed as candidates without a separate design gate:

- Scanning learner content to infer the storage adapter.
- Reading external backup files without explicit user action.
- Inspecting OS/platform backups.
- Cloud/account/backend access for adapter identity.
- Telemetry/analytics for adapter tracking.
- Persistent tracking added only to calculate health (no new tracking for its own sake).
- Automatic backup detection (without explicit user action).
- Platform backup preservation claim.
- Guaranteed data-loss prevention claim.
- Backup file format change without separate design/evidence gate.
- Restore overwrite behavior change without separate design/evidence gate.
- Storage migration without separate design/evidence gate.

## Backup/export boundary

The backup/export boundary for Phase 27A:

- Current backup/export behavior is unchanged by this patch.
- No backup file format change is introduced by Phase 27A.
- No new backup metadata is added to production files by Phase 27A.
- Export source metadata (adapter annotation) is a future candidate only, pending separate design gate.
- Phase 27A does not approve any backup/export behavior change.

## Restore/import boundary

The restore/import boundary for Phase 27A:

- Current restore/import behavior is unchanged by this patch.
- No restore overwrite behavior change is introduced by Phase 27A.
- No adapter compatibility warning is added to production restore flow by Phase 27A.
- Restore target adapter compatibility warning is a future candidate only, pending separate design gate.
- Phase 27A does not approve any restore/import behavior change.

## Storage driver boundary

The storage driver boundary for Phase 27A:

- No storage driver files are modified by Phase 27A.
- No IndexedDB production adapter is introduced or enabled by Phase 27A.
- No storage migration is performed or approved by Phase 27A.
- Storage adapter identity as a runtime signal is a future candidate only, pending Phase 27B evidence review.
- Default storage driver remains unchanged.

## Data safety and no-data-loss guardrails

Phase 27A establishes the following no-data-loss guardrails for future phases:

1. Any future runtime adapter-awareness implementation must not change restore overwrite behavior without a separate design/evidence gate.
2. Any future backup file format change must have a separate design/evidence gate with a migration plan.
3. Any future restore-to-different-adapter operation must show a clear user warning before overwriting existing data.
4. Generated/test data restore rehearsals must use synthetic data only — never real learner content.
5. Rollback must be possible for any adapter-aware backup/export/restore change: the previous behavior must be restorable by removing the new code path.

No data-loss guarantee claim may be made. No broad backup reliability claim may be made.

## Generated/test data only rule

Any restore rehearsal evidence collected for Phase 27B must use only generated/test data. Real learner content must never be used for automated rehearsal evidence. This rule is absolute and may not be relaxed.

## Manual/browser evidence boundary

Phase 27A does not require manual/browser evidence. Phase 27A is a design gate only.

Phase 27B must include a manual/browser evidence plan for any enabled adapter-aware behavior. No user-facing runtime UI or browser behavior claim may be made without manual/browser evidence.

## Runtime implementation boundary

Phase 27A does not implement any runtime adapter-awareness. No `src/` files are modified. No `tests/` files are modified. No `e2e/` files are modified.

Any runtime implementation requires:
1. Phase 27B evidence/design review gate (separate phase).
2. Strict reviewer sign-off.
3. Generated/test data rehearsal evidence.
4. Manual/browser evidence for any user-facing behavior.
5. Product/stakeholder sign-off for any production UI or behavioral change visible to learners.

## Rollback/removal plan for future runtime phases

If a future runtime phase introduces adapter-aware backup/export/restore and the implementation needs to be removed:

1. Remove the adapter identity check from the backup/export path.
2. Remove the adapter compatibility check from the restore/import path.
3. Remove any adapter metadata from new backup files (or provide a migration that strips it for old clients).
4. Restore the prior backup/export/restore behavior by reverting to the last known-good implementation.
5. Run all existing backup/export/restore unit tests to confirm no regression.
6. Confirm no new persistent tracking remains after rollback.

The rollback plan must be documented as part of any future runtime phase that implements adapter-awareness.

## Phase 27B framing

Next recommended phase: Phase 27B — Adapter-Awareness Evidence and Runtime Design Review.
Phase 27B is a separate evidence/design review gate and is not automatically approved.
Phase 27A does not approve runtime backup/export/restore changes.
Phase 27A does not approve backup file format changes.
Phase 27A does not approve restore overwrite behavior changes.
Phase 27A does not approve storage migration.
Phase 27A does not approve production adapter-aware backup/export/restore.
Phase 27A does not approve BETA_READY.

Phase 27B should:
1. Review the allowed future signal candidates from this design gate.
2. Collect generated/test data rehearsal evidence for adapter-to-adapter restore behavior.
3. Define an exact runtime design for adapter-aware backup/export/restore (if evidence supports it).
4. Require strict reviewer sign-off before any runtime implementation decision.
5. Not approve runtime implementation without completing the evidence matrix.

## What Phase 27A can claim

- Direction choice is complete: backup/export/restore adapter-awareness design.
- Design gate is complete: problem statement, boundaries, allowed/forbidden signals, guardrails documented.
- Phase 27B run pack is prepared.
- All Phase 26E and prior validators pass.
- No production behavior changed.
- No runtime code changed.
- No backup/export/restore behavior changed.
- No backup file format changed.
- No storage driver changed.

## What Phase 27A must not claim

- Runtime adapter-aware backup/export/restore is not claimed as implemented.
- Backup file format change is not approved by Phase 27A.
- Restore overwrite behavior change is not approved by Phase 27A.
- Storage migration is not approved by Phase 27A.
- Production adapter-aware backup/export/restore is not approved by Phase 27A.
- Local-first hybrid readiness has not been achieved and is not claimed.
- BETA_READY is not claimed.
- No guaranteed data-loss prevention is claimed.
- No broad backup reliability is claimed.
- No platform backup preservation is claimed.
- No automatic backup detection is claimed.

## Guardrails

Production backup/export/restore behavior remains unchanged by this patch.
Backup file format remains unchanged.
Restore overwrite behavior remains unchanged.
Current localStorage backup compatibility remains unchanged.
Default storage driver remains unchanged.
No IndexedDB.
No storage migration.
No sync/cloud/account/auth/backend.
No telemetry or analytics.
No BETA_READY.
Historical full-chain validators remain manual/local/scheduled audit guidance.
Full historical scripts/validate-*.js chain is not used as a Phase 27A merge-blocking requirement.
Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.

## Next recommended phase

Next recommended phase: Phase 27B — Adapter-Awareness Evidence and Runtime Design Review.
Phase 27B is a separate evidence/design review gate and is not automatically approved.
Phase 27A does not approve runtime backup/export/restore changes.
Phase 27A does not approve backup file format changes.
Phase 27A does not approve restore overwrite behavior changes.
Phase 27A does not approve storage migration.
Phase 27A does not approve production adapter-aware backup/export/restore.
Phase 27A does not approve BETA_READY.
