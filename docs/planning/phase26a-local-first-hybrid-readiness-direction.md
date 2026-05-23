# Phase 26A — Local-First Hybrid Readiness Direction

## Status token

```
PHASE26A_LOCAL_FIRST_HYBRID_READINESS_DIRECTION_STATUS: COMPLETED_DIRECTION_AND_RUN_PACK_GATE
PHASE26A_LOCAL_FIRST_HYBRID_DIRECTION_DECISION: PASS_TO_PHASE26B_BROADER_EVIDENCE_EXECUTION_BEFORE_RUNTIME
PHASE26A_LOCAL_FIRST_HYBRID_EVIDENCE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

## Scope

Phase 26A is a **docs/planning/testing/release/static-validator/CI-only** gate.

No runtime source changes. No unit test changes. No e2e. No browser or manual execution in this phase. No production-visible UI changes. No storage, backup, export, or restore behavior changes. No readiness claim beyond planning and run-pack preparation.

## Inputs

- Phase 25N closure tokens:
  - `PHASE25N_BACKUP_HEALTH_EVIDENCE_CLOSURE_STATUS: COMPLETED_LIMITED_EVIDENCE_AND_PHASE25_CLOSURE`
  - `PHASE25N_PHASE25_CLOSURE_DECISION: CLOSED_WITH_DEFAULT_OFF_VIEW_MODEL_AND_NO_PRODUCTION_UI_APPROVAL`
  - `PHASE25N_BACKUP_HEALTH_EVIDENCE_INTERPRETATION: LIMITED_STATIC_AND_LOCAL_AUTOMATED_EVIDENCE_NO_BROWSER_USER_FACING_CLAIM`
  - `PHASE26A_LOCAL_FIRST_HYBRID_READINESS_PLANNING_STATUS: PREPARED_PLANNING_SEED`
- Phase 26A planning seed: `docs/planning/phase26a-local-first-hybrid-readiness-planning-seed.md`
- Phase 25 baseline: default-off, read-only Backup Health view-model prototype only; no production UI; no browser evidence claimed.

## Purpose

Phase 25 closed conservatively with limited static and local automated evidence only. No browser or user-facing behavior was claimed. Before making stronger local-first hybrid readiness claims or starting runtime work, Phase 26 must broaden evidence and re-decide from measured results.

Phase 26A chooses exactly one direction before any runtime work begins.

## Direction decision

```
PHASE26A_LOCAL_FIRST_HYBRID_DIRECTION_DECISION: PASS_TO_PHASE26B_BROADER_EVIDENCE_EXECUTION_BEFORE_RUNTIME
```

Chosen direction: **broaden evidence matrix**

## Candidate directions considered

All four candidate directions from the Phase 26A planning seed were evaluated:

1. **broaden evidence matrix** — Execute a broader set of static, local automated, and (optionally) manual evidence checks before any runtime claim. This is the chosen direction.

2. **limited default-off UI wiring design** — Design a limited, default-off production UI wiring for Backup Health display. This direction is **deferred** and is not approved by default in Phase 26A.

3. **backup/export/restore adapter-awareness planning** — Plan production adapter-aware backup/export/restore changes. This direction is **deferred** and is not approved by default in Phase 26A.

4. **local-first hybrid closure/readiness decision** — Attempt a broad local-first hybrid readiness or closure decision. This direction is **deferred** and is not approved by default in Phase 26A.

## Chosen direction

**broaden evidence matrix**

Reason: Phase 25 closed with limited evidence. The evidence run pack prepared in Phase 26A (see `docs/testing/phase26a-local-first-hybrid-evidence-run-pack.md`) covers clean baseline, Phase 25K/25M default-off behavior, static boundary checks, and optional manual/browser smoke. Phase 26B executes those runs and re-decides.

## Deferred directions

The following directions were considered but are **deferred and not approved by default**:

- **limited default-off UI wiring design** — Not approved. Requires a separate design/evidence gate in a future phase.
- **backup/export/restore adapter-awareness planning** — Not approved. Requires a separate production adapter-aware design/evidence gate in a future phase.
- **local-first hybrid closure/readiness decision** — Not approved. Cannot be made without broader evidence execution first.

Deferred directions are not automatically activated. Each requires an explicit separate planning and approval gate before work begins.

## Why broaden evidence before runtime

- Phase 25 closed with only static and local automated evidence; no browser or user-facing behavior was proven.
- Making a readiness claim or starting runtime/storage/backup/restore changes without broader evidence risks undetected regressions.
- A broader evidence matrix (clean baseline + static boundary checks + optional manual smoke) gives a measured foundation for the re-decision in Phase 26B.
- Broadening evidence first is the lowest-risk path before any production UI or adapter changes.

## Evidence needed before stronger claims

Before any stronger local-first hybrid readiness claim or runtime work:

- Clean install, build, and full unit test baseline must pass.
- Phase 25K default-off integration behavior must be verified as unchanged.
- Phase 25M default-off view-model behavior must be verified as unchanged.
- Static boundary checks must confirm no production-visible UI wiring, no route/navigation/settings/library/dashboard wiring, no write APIs, no backup/export/restore behavior changes, no storage driver changes.
- Vietnamese-first copy boundary must be verified.
- Generated/test data only must be confirmed.
- Manual/browser smoke is optional only if user-facing behavior is later claimed.

## Runtime work boundary

Phase 26A does not approve runtime/storage/backup/restore changes.

No `src/**` files are changed. No `tests/**` files are changed. No `e2e/**` files are changed. No storage driver, no backup module, no export module, no restore module is modified.

## Storage and backup/export/restore boundary

Phase 26A does not approve production adapter-aware backup/export/restore.

Production backup/export/restore behavior remains unchanged by this patch. Backup file format remains unchanged. Restore overwrite behavior remains unchanged. Current localStorage backup compatibility remains unchanged. Default storage driver remains unchanged.

## Production UI boundary

Phase 26A does not approve production-visible Backup Health UI.

No route, navigation, settings, library, or dashboard wiring is added. No UI wiring is changed. No production Backup Health UI is activated.

## Local-first/no-cloud boundary

Phase 26A does not approve IndexedDB production storage. Phase 26A does not approve storage migration. No sync/cloud/account/auth/backend is added or changed.

## Claim boundary

Phase 26A does not approve:
- `BETA_READY`
- production-visible Backup Health UI
- broad dashboard/settings/library rollout
- production adapter-aware backup/export/restore
- backup file format changes
- restore overwrite behavior changes
- IndexedDB production storage
- storage migration
- sync/cloud/account/auth/backend
- telemetry/analytics
- guaranteed data-loss prevention
- platform backup preservation claims
- automatic backup claims
- broad backup reliability
- local-first hybrid readiness claim beyond planning

## Phase 26B framing

Next recommended phase: Phase 26B — Broader Local-First Hybrid Evidence Execution and Readiness Re-Decision

Phase 26B is a separate evidence execution/re-decision gate and is not automatically approved.

Phase 26A does not approve runtime/storage/backup/restore changes.

Phase 26A does not approve production-visible Backup Health UI.

Phase 26A does not approve production adapter-aware backup/export/restore.

Phase 26A does not approve BETA_READY.

Phase 26B must execute the evidence run pack prepared in Phase 26A and record observed results before making any readiness re-decision.

## Rollback/removal plan

To remove Phase 26A:

1. Remove `docs/planning/phase26a-local-first-hybrid-readiness-direction.md`.
2. Remove `docs/testing/phase26a-local-first-hybrid-evidence-run-pack.md`.
3. Remove `docs/release/phase26a-local-first-hybrid-readiness-direction-summary.md`.
4. Remove `scripts/validate-phase26a-local-first-hybrid-readiness-direction.js`.
5. Remove Phase 26A CI registration from `.github/workflows/e2e-smoke.yml`.
6. No learner data migration or cleanup is required because Phase 26A does not migrate data or change backup/export/restore behavior.

## Guardrails

- Production backup/export/restore behavior remains unchanged by this patch.
- Backup file format remains unchanged.
- Restore overwrite behavior remains unchanged.
- Current localStorage backup compatibility remains unchanged.
- Default storage driver remains unchanged.
- No IndexedDB.
- No storage migration.
- No sync/cloud/account/auth/backend.
- No telemetry or analytics.
- No BETA_READY.
- Historical full-chain validators remain manual/local/scheduled audit guidance.
- Full historical scripts/validate-*.js chain is not used as a Phase 26A merge-blocking requirement.
- No browser/manual evidence claimed because no production-visible UI or browser/user-facing behavior is exposed.
- Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.

## Next recommended phase

Next recommended phase: Phase 26B — Broader Local-First Hybrid Evidence Execution and Readiness Re-Decision

Phase 26B is a separate evidence execution/re-decision gate and is not automatically approved.
