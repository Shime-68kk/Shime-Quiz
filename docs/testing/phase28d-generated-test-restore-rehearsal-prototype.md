# Phase 28D — Generated/Test Restore Rehearsal Prototype

## Status tokens

```
PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE
PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_RESTORE_EXECUTION_NO_WRITES
PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_RESTORE_REHEARSAL_EXECUTION
PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_RESTORE_CLAIM
```

## Scope

Phase 28D implements a test-only/no-write generated/test restore rehearsal prototype as pure functions. It is not production integrated. It does not execute restore operations. It does not write to storage. It does not read real learner data. All inputs must be generated or test data.

Phase 28D is a small runtime source + unit tests + docs/static-validator/CI phase.

No restore execution.
No production integration.
No real learner data.
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

## Inputs from Phase 28C

Phase 28C provided:
- Evidence review of the Phase 28B restore rehearsal planner (unit/static only)
- Decision: keep test-only/no-write planner, no restore execution approval
- Generated/test restore rehearsal prototype design gate
- Decision: pass to Phase 28D test-only/no-write generated/test prototype with strict gates
- Phase 28D planning seed: candidate function names, required guardrails, forbidden approvals

Phase 28C tokens carried into Phase 28D:
- `PHASE28C_RESTORE_REHEARSAL_PLANNER_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_PLANNER_EVIDENCE_REVIEW`
- `PHASE28C_RESTORE_REHEARSAL_PLANNER_REDECISION: KEEP_TEST_ONLY_NO_WRITE_PLANNER_NO_RESTORE_EXECUTION_APPROVAL`
- `PHASE28C_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_DESIGN_STATUS: COMPLETED_DESIGN_GATE`
- `PHASE28C_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_DECISION: PASS_TO_PHASE28D_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_WITH_STRICT_GATES`
- `PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED`

## Implementation summary

### New file: `src/state/generatedTestRestoreRehearsalPrototype.js`

Pure functions only. Imports only `createGeneratedTestRestoreRehearsalPlan` and `deriveRestoreRehearsalSafetyState` from `./restoreRehearsalPlanner.js`. No other imports.

Exports:
- `normalizeGeneratedTestRestoreRehearsalInput(rawInput)` — normalizes generated/test input
- `deriveGeneratedTestRestoreRehearsalOutcome(rawInput)` — returns one of 11 outcome state IDs
- `createGeneratedTestRestoreRehearsal(rawInput)` — returns non-executable rehearsal object
- `summarizeGeneratedTestRestoreRehearsal(rawInput)` — returns summary with Vietnamese-first copy

Also exports `GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME` constants object.

### New file: `tests/unit/generatedTestRestoreRehearsalPrototype.test.js`

Unit tests covering all exported functions, all outcome state IDs, conservative priority order, always-false safety fields, Vietnamese-first copy, evidence levels, forbidden API absence, and no production module imports.

## Prototype API

### `normalizeGeneratedTestRestoreRehearsalInput(rawInput)`

- Never mutates input
- Tolerates null/undefined/non-object input (returns `{ syntheticAnomalies: [] }`)
- Trims string fields; normalizes empty strings to undefined
- Normalizes booleans conservatively (only true if === true)
- Normalizes `syntheticAnomalies` to array of trimmed non-empty strings, capped at 10

### `deriveGeneratedTestRestoreRehearsalOutcome(rawInput)`

Returns one of the following outcome state IDs in conservative priority order:

| Priority | State ID |
|----------|----------|
| 1 (highest) | `telemetry_or_sync_blocked` |
| 2 | `storage_migration_blocked` |
| 3 | `backup_format_change_blocked` |
| 4 | `external_backup_file_blocked` |
| 5 | `restore_overwrite_blocked` |
| 6 | `production_state_write_blocked` |
| 7 | `real_learner_data_blocked` |
| 8 | `planner_not_ready` |
| 9 | `synthetic_anomaly_detected` |
| 10 | `generated_test_restore_rehearsal_ready` |
| 11 (lowest) | `generated_test_restore_rehearsal_unavailable` |

Ready state requires `generatedTestData: true` and planner returning `generated_test_rehearsal_plan_ready`. If `syntheticAnomalies` are present, `synthetic_anomaly_detected` is returned instead.

### `createGeneratedTestRestoreRehearsal(rawInput)`

Returns object with:
- `stateId`, `severity`, `fixtureId`, `plannerStateId`
- `usesGeneratedTestData`, `syntheticAnomalies`, `expectedItemCount`
- `canExecuteRestore: false` (always)
- `canWriteProductionState: false` (always)
- `canUseRealLearnerData: false` (always)
- `canChangeBackupFormat: false` (always)
- `canOverwriteRestoreTarget: false` (always)
- `canClaimDataLossPrevention: false` (always)
- `steps` (descriptive strings, not executable actions)
- `claimBoundary: 'UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_RESTORE_CLAIM'`

### `summarizeGeneratedTestRestoreRehearsal(rawInput)`

Returns object with:
- `stateId`, `severity`, `labelVi`, `detailVi`
- `canExecuteRestore: false` (always)
- `canUseRealLearnerData: false` (always)
- `canWriteProductionState: false` (always)
- `canClaimProductionSafety: false` (always)
- `evidenceLevel`: one of `unit_static_only`, `generated_test_rehearsal_only`, `unknown`

## Unit/static evidence

| Evidence area | Evidence source | Observed result | Status | Limitations | Claim allowed | Claim not allowed |
|---|---|---|---|---|---|---|
| All 4 exported functions exist | Unit test: exports describe | PASS | PASS | Test-only | Functions exported correctly | Production use approved |
| All 11 outcome IDs exist | Unit test: outcome constants | PASS | PASS | Test-only | Constants defined | Runtime restore claim |
| null/undefined/non-object input tolerated | Unit test: null/undefined/array | PASS | PASS | Test-only | Input boundary robust | Real learner data safe |
| Input immutability | Unit test: JSON before/after | PASS | PASS | Test-only | No mutation observed | Mutation impossible proven |
| String trimming/empty-string normalization | Unit test: whitespace inputs | PASS | PASS | Test-only | Normalization works | Production data normalization |
| syntheticAnomalies normalization and cap | Unit test: array normalization | PASS | PASS | Test-only | Cap at 10 enforced | Unlimited anomalies approved |
| Conservative priority order | Unit test: priority combinations | PASS | PASS | Test-only | Priority enforced | Production priority proven |
| real_learner_data_blocked state | Unit test: realLearnerDataPresent | PASS | PASS | Test-only | State reachable | Real data allowed |
| production_state_write_blocked state | Unit test: productionStateTargeted | PASS | PASS | Test-only | State reachable | Production write allowed |
| restore_overwrite_blocked state | Unit test: restoreOverwriteRequested | PASS | PASS | Test-only | State reachable | Overwrite allowed |
| external_backup_file_blocked state | Unit test: externalBackupFileProvided | PASS | PASS | Test-only | State reachable | External backup allowed |
| backup_format_change_blocked state | Unit test: backupFormatChangeRequested | PASS | PASS | Test-only | State reachable | Format change allowed |
| storage_migration_blocked state | Unit test: storageMigrationRequested | PASS | PASS | Test-only | State reachable | Migration allowed |
| telemetry/sync/cloud/backend blocked state | Unit test: telemetryRequested/syncCloud | PASS | PASS | Test-only | State reachable | Telemetry/sync allowed |
| synthetic_anomaly_detected state | Unit test: syntheticAnomalies | PASS | PASS | Test-only | State reachable | Anomaly means safe |
| generated/test rehearsal ready state | Unit test: generatedTestData: true | PASS | PASS | Test-only | Ready state reachable | Production restore safe |
| canExecuteRestore always false | Unit test: all input variants | PASS | PASS | Test-only | Hardcoded false | Restore execution approved |
| canWriteProductionState always false | Unit test: all input variants | PASS | PASS | Test-only | Hardcoded false | Production write approved |
| canUseRealLearnerData always false | Unit test: all input variants | PASS | PASS | Test-only | Hardcoded false | Real learner data approved |
| canChangeBackupFormat always false | Unit test: all variants | PASS | PASS | Test-only | Hardcoded false | Format change approved |
| canOverwriteRestoreTarget always false | Unit test: all variants | PASS | PASS | Test-only | Hardcoded false | Overwrite approved |
| canClaimDataLossPrevention always false | Unit test: all variants | PASS | PASS | Test-only | Hardcoded false | Data loss prevention proven |
| canClaimProductionSafety always false | Unit test: all variants | PASS | PASS | Test-only | Hardcoded false | Production safety proven |
| evidence levels | Unit test: all three levels | PASS | PASS | Test-only | Levels correct | Evidence is production-grade |
| Vietnamese-first copy presence | Unit test: labelVi/detailVi | PASS | PASS | Test-only | Vietnamese present | UX complete |
| forbidden claim strings absent | Unit test: source scan | PASS | PASS | Test-only | No forbidden claims | All claims screened |
| no storage/write/network/telemetry APIs | Unit test: source scan | PASS | PASS | Test-only | No forbidden APIs | API-free proven at runtime |
| no backup/export/restore imports | Unit test: source scan | PASS | PASS | Test-only | Import boundary clean | Production boundary proven |
| no storage driver imports | Unit test: source scan | PASS | PASS | Test-only | Import boundary clean | Storage boundary proven |
| no Date.now direct usage | Unit test: source scan | PASS | PASS | Test-only | No Date.now | Deterministic at runtime |
| no environment reads | Unit test: source scan | PASS | PASS | Test-only | No env reads | Env-independent proven |
| no href/route/navigation strings | Unit test: source scan | PASS | PASS | Test-only | No routing | Production routing unchanged |
| no production module imports the prototype | Unit test: src/ file scan | PASS | PASS | Test-only | Import boundary clean | Production use gated |
| generated/test data only boundary | Unit test: usesGeneratedTestData | PASS | PASS | Test-only | Boundary enforced | Real data use approved |

## Evidence interpretation

Phase 28D evidence is unit/static only. It does not constitute browser evidence, runtime production evidence, or production safety proof.

Evidence supports:
- The prototype compiles and exports the required functions
- All 11 outcome state IDs are reachable with appropriate generated/test inputs
- Conservative priority order is enforced
- All safety capability fields are hardcoded to false
- No forbidden APIs, imports, or claims appear in the source

Evidence does not prove:
- Restore execution is safe in production
- Production restore rehearsal is ready
- Real learner data is safe to use
- Storage migration is safe
- Local-first hybrid readiness

## No-restore-execution proof

- `canExecuteRestore` is hardcoded to `false` in `createGeneratedTestRestoreRehearsal` — no path returns `true`
- No import from production restore modules
- `steps` array contains descriptive strings only — no executable restore calls
- The planner's `createGeneratedTestRestoreRehearsalPlan` also returns `canExecuteRestore: false`
- Unit tests verify `canExecuteRestore` is false for all tested input variants
- Validator verifies no forbidden restore-execution claims in source

## No-write and no-overwrite proof

- `canWriteProductionState` is hardcoded to `false` in all return paths
- `canOverwriteRestoreTarget` is hardcoded to `false` in all return paths
- No `localStorage`, `IndexedDB`, `fetch`, `XMLHttpRequest`, or `sendBeacon` calls in source
- No `fs` module used at runtime
- Unit tests verify both fields false for all input variants
- Validator scans source for forbidden write APIs

## No-real-learner-data proof

- `canUseRealLearnerData` is hardcoded to `false` in all return paths
- `realLearnerDataPresent: true` returns `real_learner_data_blocked` — cannot reach ready state
- No learner content scanning in source
- Unit tests verify `canUseRealLearnerData` false for all input variants

## Backup/export/restore boundary

The prototype imports only from `./restoreRehearsalPlanner.js` (Phase 28B test-only planner). It does not import from:
- Production backup modules
- Production export modules
- Production restore modules (other than restoreRehearsalPlanner.js)

Validator and unit tests both verify no production backup/export/restore imports.

## Storage driver boundary

The prototype does not import from:
- IndexedDB adapter
- StorageAdapter
- storage/driver modules

Validator and unit tests verify no storage driver imports.

## Data safety boundary

- No reads from localStorage, IndexedDB, or external files
- No writes to any storage
- No network calls
- No telemetry or analytics
- No Date.now usage
- No process.env or import.meta.env reads

## Generated/test data only rule

All inputs to the prototype must be generated or test data. The prototype enforces this via:
- `generatedTestData` boolean field normalization (must be === true)
- Conservative `planner_not_ready` when generatedTestData is missing
- `realLearnerDataPresent: true` triggers `real_learner_data_blocked`
- No mechanism to read real learner data from storage

## Claim boundary

- Evidence level: `unit_static_only` or `generated_test_rehearsal_only` only
- `claimBoundary: 'UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_RESTORE_CLAIM'`
- `canClaimProductionSafety: false` always
- `canClaimDataLossPrevention: false` always

Phase 28D does not claim:
- Restore execution safety
- Production restore rehearsal readiness
- Real learner data rehearsal approval
- Backup file format safety
- Storage migration safety
- Local-first hybrid readiness
- BETA_READY
- Browser or manual evidence

## Rollback/removal plan

To remove Phase 28D:
1. Delete `src/state/generatedTestRestoreRehearsalPrototype.js`
2. Delete `tests/unit/generatedTestRestoreRehearsalPrototype.test.js`
3. Delete `docs/testing/phase28d-generated-test-restore-rehearsal-prototype.md`
4. Delete `docs/release/phase28d-generated-test-restore-rehearsal-prototype-summary.md`
5. Delete `scripts/validate-phase28d-generated-test-restore-rehearsal-prototype.js`
6. Revert `.github/workflows/e2e-smoke.yml` to re-enable Phase 28C as active validator

No production state is affected. No learner data is affected. No backup files are affected.

## Guardrails

- Phase 28D is test-only and not production integrated.
- Do not import `generatedTestRestoreRehearsalPrototype.js` from production modules.
- Do not use real learner data with this prototype.
- Do not execute restore operations based on this prototype.
- Do not claim production safety based on unit/static evidence alone.
- No telemetry/analytics.
- No sync/cloud/account/auth/backend.
- No backup file format changes.
- No restore overwrite behavior changes.
- No storage migration.
- No production-visible UI changes.

## Next recommended phase

Next recommended phase: Phase 28E — Generated/Test Restore Rehearsal Evidence Review and Closure/Re-Decision

Phase 28E is a separate evidence/re-decision gate and is not automatically approved.
Phase 28D does not approve restore execution.
Phase 28D does not approve production restore rehearsal.
Phase 28D does not approve real learner data restore rehearsal.
Phase 28D does not approve runtime backup/export/restore changes.
Phase 28D does not approve backup file format changes.
Phase 28D does not approve restore overwrite behavior changes.
Phase 28D does not approve storage migration.
Phase 28D does not approve production adapter-aware backup/export/restore.
Phase 28D does not approve BETA_READY.
Phase 28D does not claim local-first hybrid readiness.
