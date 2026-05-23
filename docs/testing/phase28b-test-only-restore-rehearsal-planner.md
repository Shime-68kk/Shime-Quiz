# Phase 28B — Test-Only Restore Rehearsal Planner

## Status tokens

```text
PHASE28B_RESTORE_REHEARSAL_PLANNER_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_PLANNER
PHASE28B_RESTORE_REHEARSAL_PLANNER_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_WRITES
PHASE28B_RESTORE_REHEARSAL_PLANNER_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_REHEARSAL_EXECUTION
PHASE28B_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RESTORE_EXECUTION_CLAIM
```

## Scope

Phase 28B implements a test-only/no-write restore rehearsal planner as pure functions.

Phase 28B is **not** production integrated. The planner is never imported by production modules. It operates exclusively on generated/test data.

This phase does not combine:
- Restore execution
- Production backup/export/restore module changes
- Backup file format changes
- Restore overwrite behavior changes
- Storage driver changes
- Storage migration
- Telemetry or analytics
- Sync/cloud/account/auth/backend changes
- Production-visible UI changes
- Route/navigation/settings/library/dashboard changes
- Browser/manual evidence
- BETA_READY claims
- Local-first hybrid readiness claims

## Inputs from Phase 28A

Phase 28A completed the generated/test restore rehearsal design gate with the following tokens:

```text
PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DESIGN_STATUS: COMPLETED_DESIGN_GATE
PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DECISION: PASS_TO_PHASE28B_TEST_ONLY_NO_WRITE_RESTORE_REHEARSAL_PLANNER
PHASE28A_RESTORE_REHEARSAL_SCOPE: DESIGN_ONLY_GENERATED_TEST_DATA_NO_REAL_LEARNER_DATA_NO_WRITES
PHASE28A_RESTORE_REHEARSAL_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
PHASE28B_TEST_ONLY_RESTORE_REHEARSAL_PLANNER_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 28A does not approve production restore rehearsal, real learner data restore rehearsal, runtime backup/export/restore changes, backup file format changes, restore overwrite behavior changes, storage migration, production adapter-aware backup/export/restore, BETA_READY, browser/manual evidence, or local-first hybrid readiness.

## Implementation summary

Phase 28B creates `src/state/restoreRehearsalPlanner.js` with four pure function exports:

- `normalizeRestoreRehearsalPlanInput` — normalizes generated/test input, tolerates null/undefined
- `deriveRestoreRehearsalSafetyState` — derives a safety state ID using conservative priority
- `createGeneratedTestRestoreRehearsalPlan` — creates a descriptive-only plan object (no execution)
- `summarizeRestoreRehearsalPlan` — produces a Vietnamese-first summary with evidence level

The module has zero production imports. It does not import backup/export/restore modules or storage drivers. It does not use localStorage, IndexedDB, fetch, XMLHttpRequest, sendBeacon, telemetry, analytics, Date.now, process.env, import.meta.env, or any browser/platform API.

All safety capability flags are hardcoded to false:
- `canExecuteRestore: false`
- `canWriteProductionState: false`
- `canUseRealLearnerData: false`
- `canChangeBackupFormat: false`
- `canOverwriteRestoreTarget: false`
- `canClaimDataLossPrevention: false`
- `canClaimProductionSafety: false`

## Planner API

### `normalizeRestoreRehearsalPlanInput(rawInput)`

Accepts generated/test data only. Tolerates null/undefined/non-object. Returns a normalized object.

- Never mutates input
- Trims string fields; normalizes empty strings to undefined
- Normalizes booleans conservatively (only sets `true` if `=== true`)
- Does not read storage, files, browser APIs, or platform state

### `deriveRestoreRehearsalSafetyState(input)`

Pure function. Returns one of these state IDs (in conservative priority order):

1. `telemetry_or_sync_blocked`
2. `storage_migration_blocked`
3. `backup_format_change_blocked`
4. `external_backup_file_blocked`
5. `restore_overwrite_blocked`
6. `production_state_write_blocked`
7. `real_learner_data_blocked`
8. `missing_generated_test_data`
9. `generated_test_rehearsal_plan_ready`
10. `restore_rehearsal_planner_unavailable`

### `createGeneratedTestRestoreRehearsalPlan(input)`

Pure function. Returns a plan object with descriptive-only steps. Does not execute restore.

Required fields: `stateId`, `severity`, `planId`, `fixtureId`, `usesGeneratedTestData`,
`canExecuteRestore` (always false), `canWriteProductionState` (always false),
`canUseRealLearnerData` (always false), `canChangeBackupFormat` (always false),
`canOverwriteRestoreTarget` (always false), `canClaimDataLossPrevention` (always false),
`steps`, `claimBoundary`.

### `summarizeRestoreRehearsalPlan(input)`

Pure function. Returns a summary with Vietnamese-first copy.

Required fields: `stateId`, `severity`, `labelVi`, `detailVi`,
`canExecuteRestore` (always false), `canUseRealLearnerData` (always false),
`canWriteProductionState` (always false), `canClaimProductionSafety` (always false),
`evidenceLevel` (one of `unit_static_only`, `generated_test_plan_only`, `unknown`).

## Unit/static evidence

Evidence is collected by running:

```bash
npm run test:unit -- tests/unit/restoreRehearsalPlanner.test.js
node scripts/validate-phase28b-test-only-restore-rehearsal-planner.js
```

The unit tests cover:
- All exported functions exist
- Null/undefined/non-object input tolerated
- Input immutability
- String trimming and empty-string normalization
- Boolean normalization (conservative)
- Generated/test data required for ready state
- All required state IDs
- Conservative priority order
- All blocked states
- Plan object shape
- Summary object shape
- Always-false safety fields
- Evidence levels
- Vietnamese-first copy presence
- Forbidden claim strings absent
- No storage/write/network/telemetry APIs in source
- No backup/export/restore imports in source
- No storage driver imports in source
- No Date.now usage in source
- No process.env/import.meta.env in source
- No href/route/navigation strings in source
- Generated/test data only boundary

## Evidence interpretation

```text
PHASE28B_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RESTORE_EXECUTION_CLAIM
```

Unit and static evidence from Phase 28B proves:
- Pure function behavior given generated/test inputs
- Conservative priority of safety state derivation
- Hardcoded always-false safety capability fields
- No storage writes or reads
- No production module imports

Unit and static evidence does **not** prove:
- Production restore safety
- Browser/runtime behavior
- Real learner data handling
- Backup file format compatibility
- Restore overwrite safety
- Local-first hybrid readiness
- BETA_READY

## No-restore-execution proof

The planner does not:
- Call any restore import function
- Write to localStorage or IndexedDB
- Read backup files
- Trigger any storage migration
- Execute any actual restore operation

The `canExecuteRestore` flag is hardcoded to `false` in Phase 28B.

Steps in plan objects are descriptive strings only, not executable operations.

Static analysis confirms: no import of production restore/backup modules.

## No-write and no-overwrite proof

The planner:
- Has zero write calls (no `localStorage.setItem`, `localStorage.removeItem`, `localStorage.clear`, no IndexedDB write transactions)
- Has no network calls (`fetch`, `XMLHttpRequest`, `sendBeacon`)
- `canWriteProductionState` is always false
- `canOverwriteRestoreTarget` is always false
- `productionStateTargeted: true` input triggers `production_state_write_blocked`
- `restoreOverwriteRequested: true` input triggers `restore_overwrite_blocked`

## No-real-learner-data proof

The planner:
- Only operates on input passed explicitly by the caller
- `generatedTestData: true` is required for `generated_test_rehearsal_plan_ready`
- `realLearnerDataPresent: true` triggers `real_learner_data_blocked` (higher priority than missing data)
- `canUseRealLearnerData` is always false

## Backup/export/restore boundary

The planner does not import, call, or reference production backup/export/restore modules.

Static analysis confirms: no `import` statements for backup, export, or restore modules.

Any future integration with backup/export/restore modules requires a separate phase with its own design gate, evidence review, and CI registration.

## Storage driver boundary

The planner does not import, call, or reference storage drivers (localStorage wrapper, IndexedDB adapter, StorageAdapter, etc.).

Static analysis confirms: no storage driver imports.

## Data safety boundary

Phase 28B does not change:
- Backup file format
- Restore overwrite behavior
- Storage migration behavior
- Default localStorage driver
- IndexedDB adapter
- Any production backup/export/restore runtime code

The planner is a pure computation over generated/test inputs only.

## Generated/test data only rule

All planner inputs must be generated or test data. The `generatedTestData: true` flag is required for the `generated_test_rehearsal_plan_ready` state.

Inputs with `realLearnerDataPresent: true` are blocked with `real_learner_data_blocked`.

The planner does not scan learner content, read storage, or access real user data.

## Claim boundary

Phase 28B may only claim:
- Unit/static evidence for pure function behavior
- Conservative priority of safety state derivation
- Hardcoded always-false safety capability fields

Phase 28B may not claim:
- Production restore safety
- Guaranteed data-loss prevention
- Browser/manual evidence
- BETA_READY
- Local-first hybrid readiness
- Production adapter-aware backup/export/restore
- Backup file format compatibility
- Restore overwrite safety
- Real learner data handling

## Rollback/removal plan

To remove Phase 28B:
1. Delete `src/state/restoreRehearsalPlanner.js`
2. Delete `tests/unit/restoreRehearsalPlanner.test.js`
3. Delete `docs/testing/phase28b-test-only-restore-rehearsal-planner.md`
4. Delete `docs/release/phase28b-test-only-restore-rehearsal-planner-summary.md`
5. Delete `scripts/validate-phase28b-test-only-restore-rehearsal-planner.js`
6. Revert `.github/workflows/e2e-smoke.yml` to Phase 28A active validator

No production code changes. No storage migration needed. No backup format migration needed.

## Guardrails

- Phase 28B is test-only/no-write and **not** production integrated.
- No restore execution.
- No production backup/export/restore changes.
- No backup file format changes.
- No restore overwrite behavior changes.
- No storage driver changes.
- No storage migration.
- No telemetry or analytics.
- No sync/cloud/account/auth/backend.
- No production-visible UI changes.
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
