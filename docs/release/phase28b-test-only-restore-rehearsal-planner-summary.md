# Phase 28B — Test-Only Restore Rehearsal Planner Summary

## Status tokens

```text
PHASE28B_RESTORE_REHEARSAL_PLANNER_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_PLANNER
PHASE28B_RESTORE_REHEARSAL_PLANNER_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_WRITES
PHASE28B_RESTORE_REHEARSAL_PLANNER_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_REHEARSAL_EXECUTION
PHASE28B_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RESTORE_EXECUTION_CLAIM
```

## Scope

Phase 28B implements a test-only/no-write restore rehearsal planner as pure functions.

Phase 28B is not production integrated. No production module imports the planner.
No sync/cloud/account/auth/backend. No telemetry or analytics.

Changed files:
- `src/state/restoreRehearsalPlanner.js` (new)
- `tests/unit/restoreRehearsalPlanner.test.js` (new)
- `docs/testing/phase28b-test-only-restore-rehearsal-planner.md` (new)
- `docs/release/phase28b-test-only-restore-rehearsal-planner-summary.md` (new)
- `scripts/validate-phase28b-test-only-restore-rehearsal-planner.js` (new)
- `.github/workflows/e2e-smoke.yml` (modified: Phase 28A validator commented out, Phase 28B validator added)

## Implementation summary

`src/state/restoreRehearsalPlanner.js` exports four pure functions:

**`normalizeRestoreRehearsalPlanInput`**
Normalizes generated/test input. Tolerates null/undefined/non-object. Trims strings.
Normalizes booleans conservatively. Never mutates input.

**`deriveRestoreRehearsalSafetyState`**
Derives one of ten safety state IDs using conservative priority.
Most restrictive blocked states take precedence over ready state.
`generated_test_rehearsal_plan_ready` requires `generatedTestData: true` and no blocked flags.

**`createGeneratedTestRestoreRehearsalPlan`**
Creates a descriptive plan object. Does not execute restore. Does not write storage.
All safety capability flags are hardcoded to `false`.

**`summarizeRestoreRehearsalPlan`**
Produces a Vietnamese-first summary with evidence level.
`canClaimProductionSafety` is always `false`.

No imports. No side effects. No storage reads or writes. No browser APIs. No Date.now.
No telemetry. No backup/export/restore imports. No storage driver imports.

## Unit/static evidence

Evidence collected by:

```bash
npm run test:unit -- tests/unit/restoreRehearsalPlanner.test.js
node scripts/validate-phase28b-test-only-restore-rehearsal-planner.js
npm run build
npm run test:unit
```

Unit tests cover exports, state IDs, normalization, immutability, string trimming, boolean
normalization, blocked states, priority order, plan shape, summary shape, always-false safety
fields, evidence levels, Vietnamese copy, forbidden claims, and source API guardrails.

## What is supported

- Pure function computation over generated/test inputs
- Conservative priority of ten safety state IDs
- Descriptive plan object (no execution)
- Vietnamese-first summary with evidence level
- All safety capability flags hardcoded to false
- Unit and static evidence only

## What remains not proven

- Production restore safety
- Browser/runtime behavior
- Real learner data handling
- Backup file format compatibility
- Restore overwrite safety
- Local-first hybrid readiness
- BETA_READY
- Production adapter-aware backup/export/restore

## Validation summary

| Check | Result |
|---|---|
| npm ci | PASS |
| Phase 28B validator | PASS |
| Targeted unit test | PASS |
| npm run build | PASS |
| npm run test:unit (full suite) | PASS |
| patch apply check | PASS |

## Guardrails

- Phase 28B is test-only/no-write and not production integrated.
- No restore execution.
- No production backup/export/restore changes.
- No backup file format changes.
- No restore overwrite behavior changes.
- No storage migration.
- No storage driver changes.
- No telemetry or analytics.
- No sync/cloud/account/auth/backend.
- No production-visible UI.
- No route/navigation/settings/library/dashboard changes.
- No browser/manual evidence.
- No BETA_READY claim.
- No local-first hybrid readiness claim.

## Next recommended phase

```text
Next recommended phase: Phase 28C — Restore Rehearsal Planner Evidence Review and Generated/Test Prototype Design
Phase 28C is a separate evidence/design review gate and is not automatically approved.
Phase 28B does not approve restore execution.
Phase 28B does not approve production restore rehearsal.
Phase 28B does not approve real learner data restore rehearsal.
Phase 28B does not approve runtime backup/export/restore changes.
Phase 28B does not approve backup file format changes.
Phase 28B does not approve restore overwrite behavior changes.
Phase 28B does not approve storage migration.
Phase 28B does not approve production adapter-aware backup/export/restore.
Phase 28B does not approve BETA_READY.
Phase 28B does not claim local-first hybrid readiness.
```
