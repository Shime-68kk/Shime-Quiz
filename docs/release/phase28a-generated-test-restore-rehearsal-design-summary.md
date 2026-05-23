# Phase 28A — Generated/Test Restore Rehearsal Design Summary

## Status tokens

```text
PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DESIGN_STATUS: COMPLETED_DESIGN_GATE
PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DECISION: PASS_TO_PHASE28B_TEST_ONLY_NO_WRITE_RESTORE_REHEARSAL_PLANNER
PHASE28A_RESTORE_REHEARSAL_SCOPE: DESIGN_ONLY_GENERATED_TEST_DATA_NO_REAL_LEARNER_DATA_NO_WRITES
PHASE28A_RESTORE_REHEARSAL_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
PHASE28B_TEST_ONLY_RESTORE_REHEARSAL_PLANNER_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 28A is a docs/design/planning/static-validator/CI-only gate.

No runtime source changes.
No unit test changes.
No e2e changes.
No production imports.
No backup/export/restore behavior changes.
No backup file format changes.
No restore overwrite behavior changes.
No storage driver changes.
No migrations.
No telemetry/analytics.
No sync/cloud/account/auth/backend.
No production-visible UI changes.
No route/navigation/settings/library/dashboard changes.
No browser/manual evidence claim.
No BETA_READY or local-first hybrid readiness claim.

## Direction choice

Phase 28A chose: **generated/test restore rehearsal design**

This direction was selected because:

- Phase 27 delivered a test-only/default-off/read-only adapter-awareness model and integration prototype.
- The adapter-awareness state `restore_rehearsal_verified_generated_data` was designed for generated/test restore rehearsal.
- The next safer evidence gap is a design gate for what a generated/test restore rehearsal means, what evidence it produces, and what claims it may support.
- This direction does not require production integration, backup/export/restore behavior changes, or browser evidence.

## Design decision

```text
PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DECISION: PASS_TO_PHASE28B_TEST_ONLY_NO_WRITE_RESTORE_REHEARSAL_PLANNER
```

Phase 28A does not approve runtime restore rehearsal execution. It only permits a future test-only/no-write planner/model in Phase 28B, subject to strict gates passing.

The following boundaries are established:

- Generated/test data only (no real learner data).
- No production state writes (no localStorage, no IndexedDB writes).
- No backup file format changes.
- No restore overwrite behavior changes.
- No production imports of the planner.
- No browser/manual evidence claim.

## Run-pack status

```text
PHASE28A_RESTORE_REHEARSAL_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

The evidence matrix has been defined in `docs/testing/phase28a-generated-test-restore-rehearsal-run-pack.md`. It contains 14 evidence rows covering:

- Generated/test data fixture definition
- No real learner data
- No production state writes
- No restore overwrite behavior
- Backup file format unchanged
- Restore/import behavior unchanged
- Storage driver behavior unchanged
- Adapter-awareness signal compatibility
- Test-only planner boundary
- Manual/browser evidence plan
- Failure/anomaly recording
- Rollback/removal plan
- No telemetry/analytics
- No sync/cloud/account/auth/backend

All observed results are `NOT_RUN_PHASE28A_PREPARED_ONLY`. Execution is Phase 28B's responsibility.

## Phase 28B seed

A Phase 28B planning seed has been prepared at `docs/planning/phase28b-test-only-restore-rehearsal-planner-seed.md`.

```text
PHASE28B_TEST_ONLY_RESTORE_REHEARSAL_PLANNER_SEED_STATUS: PREPARED_PLANNING_SEED
```

The seed names candidate planner functions for Phase 28B design consideration:

```text
normalizeRestoreRehearsalPlanInput
createGeneratedTestRestoreRehearsalPlan
deriveRestoreRehearsalSafetyState
summarizeRestoreRehearsalPlan
```

These are design names only. Phase 28B must not implement any of these without its own design gate and go/no-go decision.

## What is allowed next

- Phase 28B may design and implement a test-only/no-write restore rehearsal planner.
- Phase 28B must satisfy all gates defined in the Phase 28A run pack.
- Phase 28B must use only synthetically generated test data.
- Phase 28B must produce zero production state writes.
- Phase 28B must confirm no backup/restore/storage driver source changes.
- Phase 28B must have its own separate design gate, validator, and CI registration.

## What is not approved

- Production restore rehearsal is not approved.
- Real learner data restore rehearsal is not approved.
- Runtime backup/export/restore changes are not approved.
- Backup file format changes are not approved.
- Restore overwrite behavior changes are not approved.
- Storage migration is not approved.
- Production adapter-aware backup/export/restore is not approved.
- BETA_READY is not approved.
- Local-first hybrid readiness is not approved.
- Browser/manual evidence is not claimed.
- Phase 28B implementation does not exist (it is a planning seed only).

## Validation summary

The Phase 28A validator at `scripts/validate-phase28a-generated-test-restore-rehearsal-design.js` checks:

- All required docs exist.
- All required tokens are present.
- All required headings are present.
- Direction choice is explicit.
- No-real-learner-data boundary is stated.
- No-write/no-overwrite boundary is stated.
- Run pack is PREPARED_NOT_EXECUTED and does not claim execution.
- Evidence matrix rows and columns are present.
- Phase 28B seed exists with required token, headings, and candidate function names.
- Phase 28B is framed as test-only/no-write.
- Exact changed files match the allowed set (checked via `git diff origin/main..HEAD`).
- No package/dependency changes.
- No generated artifacts.
- No telemetry/analytics added.
- No sync/cloud/account/auth/backend files changed.
- Production backup/export/restore files unchanged.
- Storage drivers unchanged.
- No runtime/source/test/e2e/ADR files changed.
- Prior phase files not modified.
- Docs do not claim forbidden terms.

## Guardrails

- Production backup/export/restore behavior remains unchanged by this phase.
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
- Full historical scripts/validate-*.js chain is not used as a Phase 28A merge-blocking requirement.
- Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.

## Next recommended phase

```text
Next recommended phase: Phase 28B — Test-Only No-Write Restore Rehearsal Planner
Phase 28B is a separate test-only/no-write implementation gate and is not automatically approved.
Phase 28A does not approve production restore rehearsal.
Phase 28A does not approve real learner data restore rehearsal.
Phase 28A does not approve runtime backup/export/restore changes.
Phase 28A does not approve backup file format changes.
Phase 28A does not approve restore overwrite behavior changes.
Phase 28A does not approve storage migration.
Phase 28A does not approve production adapter-aware backup/export/restore.
Phase 28A does not approve BETA_READY.
Phase 28A does not claim local-first hybrid readiness.
```
