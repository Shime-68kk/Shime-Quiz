# Phase 28C — Generated/Test Restore Rehearsal Prototype Design

## Status tokens

```text
PHASE28C_RESTORE_REHEARSAL_PLANNER_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_PLANNER_EVIDENCE_REVIEW
PHASE28C_RESTORE_REHEARSAL_PLANNER_REDECISION: KEEP_TEST_ONLY_NO_WRITE_PLANNER_NO_RESTORE_EXECUTION_APPROVAL
PHASE28C_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_DESIGN_STATUS: COMPLETED_DESIGN_GATE
PHASE28C_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_DECISION: PASS_TO_PHASE28D_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_WITH_STRICT_GATES
PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 28C is a design/docs-only gate. It designs the shape of the future Phase 28D generated/test restore rehearsal prototype.

Phase 28C does not implement any new source code. Phase 28C does not implement restore execution. Phase 28C does not approve production restore rehearsal. Phase 28C does not approve real learner data restore rehearsal. Phase 28C does not change backup/export/restore behavior. Phase 28C does not change backup file formats. Phase 28C does not change restore overwrite behavior. Phase 28C does not add storage drivers. Phase 28C does not run storage migration. Phase 28C does not add telemetry or analytics. Phase 28C does not touch sync/cloud/account/auth/backend. Phase 28C does not add production-visible UI changes or routes. Phase 28C does not collect browser/manual evidence. Phase 28C does not claim BETA_READY. Phase 28C does not claim local-first hybrid readiness.

## Inputs

Phase 28B token:

```text
PHASE28B_RESTORE_REHEARSAL_PLANNER_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_PLANNER
PHASE28B_RESTORE_REHEARSAL_PLANNER_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_WRITES
PHASE28B_RESTORE_REHEARSAL_PLANNER_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_REHEARSAL_EXECUTION
PHASE28B_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RESTORE_EXECUTION_CLAIM
```

Phase 28C evidence review token:

```text
PHASE28C_RESTORE_REHEARSAL_PLANNER_REDECISION: KEEP_TEST_ONLY_NO_WRITE_PLANNER_NO_RESTORE_EXECUTION_APPROVAL
```

## Prototype purpose

The Phase 28D generated/test restore rehearsal prototype extends the Phase 28B planner with a layer that:
1. Accepts generated/test input in a structured prototype shape
2. Normalizes and validates the input against the planner
3. Derives a rehearsal outcome from planner output
4. Produces a summary for unit/static verification

The prototype does **not** execute restore operations. The prototype does **not** write to storage. The prototype does **not** use real learner data. The prototype does **not** import production backup/export/restore modules.

## Design decision

```text
PHASE28C_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_DECISION: PASS_TO_PHASE28D_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_WITH_STRICT_GATES
```

Decision: proceed to Phase 28D to implement `src/state/generatedTestRestoreRehearsalPrototype.js` as a test-only/no-write pure function layer on top of the Phase 28B planner.

Rationale:
- Phase 28B unit/static evidence confirms the planner safety state model is correct.
- A prototype layer adds structured generated/test input normalization and outcome derivation, which extends the evidence base without introducing any new risk.
- The prototype will remain strictly test-only: no production imports, no write APIs, no real learner data.
- All safety capability flags will be hardcoded to false in the prototype.
- The evidence level will be `unit_static_only` until browser/manual evidence is collected.

This decision does not approve restore execution. This decision does not approve production integration. This decision does not approve real learner data. This decision does not approve browser/manual evidence collection.

## Future Phase 28D prototype boundary

The Phase 28D prototype is bounded by:
- Test-only: not imported by any production module
- No-write: no localStorage, IndexedDB, fetch, XMLHttpRequest, or sendBeacon
- Generated/test data only: all inputs must be synthetic
- No restore execution: no call to any restore/import function
- No backup/export/restore imports: no import of production backup, export, or restore modules
- No storage driver imports: no import of StorageAdapter, IndexedDB adapter
- No browser APIs: no Date.now, process.env, import.meta.env, window, document, navigator
- No production state writes: canWriteProductionState always false
- No restore overwrite: canOverwriteRestoreTarget always false
- No real learner data: canUseRealLearnerData always false
- No backup format changes: canChangeBackupFormat always false
- No data-loss prevention claims: canClaimDataLossPrevention always false
- No production safety claims: canClaimProductionSafety always false

## Candidate prototype layer

```text
src/state/generatedTestRestoreRehearsalPrototype.js
```

This module will export pure functions that wrap the Phase 28B planner. It is the only new source file permitted in Phase 28D.

## Allowed future generated/test inputs

The Phase 28D prototype may accept the following as passive metadata only:
- `generatedTestData` — boolean gate, must be true for any ready state
- `fixtureId` — string identifier for the generated/test fixture
- `sourceAdapterId` — string identifier for the source adapter type (metadata only, no real adapter call)
- `targetAdapterId` — string identifier for the target adapter type (metadata only, no real adapter call)
- `adapterStateId` — string from Phase 27E adapter-awareness model (read as metadata, no adapter invocation)
- `backupFormatVersion` — passive metadata string, no format change behavior
- `expectedItemCount` — integer, used for descriptive output only
- planner state from Phase 28B planner output — passed as computed input, not read from storage
- synthetic restore rehearsal anomaly list — generated strings, not real anomalies

All inputs are passed explicitly by the test caller. None are read from storage, files, or browser APIs.

## Forbidden future inputs

The Phase 28D prototype must NOT accept or use:
- Real learner data of any kind
- Production state as a target
- Restore overwrite requests
- External backup file contents
- Automatic file reads
- OS/platform backup inspection
- Backup file format changes
- Restore/import behavior changes
- Storage driver writes
- Storage migration
- Telemetry or analytics
- Sync/cloud/account/auth/backend
- Browser/user-facing execution

## No-restore-execution boundary

The prototype does not call any restore import function. The prototype does not trigger any actual restore operation. The `canExecuteRestore` flag must be hardcoded to `false` in the prototype. Outcome objects will contain descriptive strings only, not executable operations.

## No-write and no-overwrite boundary

The prototype must NOT:
- Use `localStorage.setItem`, `localStorage.removeItem`, `localStorage.clear`
- Use any IndexedDB write transaction
- Use `fetch`, `XMLHttpRequest`, or `sendBeacon`
- Set `canWriteProductionState: true`
- Set `canOverwriteRestoreTarget: true`

## No-real-learner-data boundary

The prototype operates only on generated/test inputs passed explicitly by the caller. The `generatedTestData: true` flag must be required for any ready state. The prototype does not scan learner content, read real storage, or access real user data. `canUseRealLearnerData` must be hardcoded to `false`.

## Backup/export boundary

The prototype does not import production backup or export modules. It does not read backup file contents. It does not change backup file format. It does not trigger backup creation.

## Restore/import boundary

The prototype does not import production restore or import modules. It does not call restore functions. It does not trigger import operations. It does not write to any storage target that a restore would write to.

## Storage driver boundary

The prototype does not import StorageAdapter, IndexedDB adapter, localStorage wrapper, or any other storage driver. It does not call storage APIs directly.

## Adapter-awareness relationship

The prototype may use `adapterStateId` as passive metadata — a string that identifies which adapter-awareness state (from the Phase 27E model) was active. It does NOT call adapter functions, invoke adapters, or integrate with the live adapter-awareness system. The adapter-awareness system remains test-only/default-off/read-only as established by Phase 27E.

## Data safety and rollback plan

The prototype is a pure computation over generated/test inputs. It writes no data. To remove it:
1. Delete `src/state/generatedTestRestoreRehearsalPrototype.js`
2. Delete its unit test file
3. Delete Phase 28D docs
4. Delete Phase 28D validator
5. Revert CI to Phase 28C validator

No production code changes. No storage migration needed. No backup format migration needed.

## Unit/static evidence plan for Phase 28D

Phase 28D must provide unit/static evidence covering:
- All exported functions exist
- Null/undefined/non-object input tolerance
- Input immutability
- String trimming and empty-string normalization
- Boolean normalization (conservative)
- All required outcome IDs
- All always-false safety capability flags
- Planner integration (passes generated/test input through Phase 28B planner)
- Evidence level: `unit_static_only`
- Vietnamese-first copy presence in outcome/summary
- Forbidden claim strings absent
- No storage/write/network/telemetry APIs in prototype source (static)
- No backup/export/restore imports in prototype source (static)
- No storage driver imports in prototype source (static)
- Generated/test data boundary

## Manual/browser evidence boundary

Phase 28D does not collect browser/manual evidence. The prototype is a pure function module only. No Playwright tests, no UI route, no production integration. Manual/browser evidence for generated/test restore rehearsal is deferred to a future phase.

## Go/no-go criteria

Phase 28D may proceed only if:
1. Phase 28C validator passes (docs/tokens/headings/candidate names verified)
2. All allowed files for Phase 28D are consistent with the design in this document
3. No new production imports are introduced
4. No browser/manual evidence is collected
5. All safety capability flags remain hardcoded to false

## What Phase 28C can claim

- Phase 28B unit/static evidence reviewed and confirmed
- Planner kept test-only/no-write with no restore execution approval
- Prototype design gate for Phase 28D completed
- Phase 28D candidate layer identified: `src/state/generatedTestRestoreRehearsalPrototype.js`
- Phase 28D candidate function names identified
- Phase 28D seed prepared

## What Phase 28C must not claim

- Phase 28C does not approve restore execution.
- Phase 28C does not approve production restore rehearsal.
- Phase 28C does not approve real learner data restore rehearsal.
- Phase 28C does not approve runtime backup/export/restore changes.
- Phase 28C does not approve backup file format changes.
- Phase 28C does not approve restore overwrite behavior changes.
- Phase 28C does not approve storage migration.
- Phase 28C does not approve production adapter-aware backup/export/restore.
- Phase 28C does not approve BETA_READY.
- Phase 28C does not claim local-first hybrid readiness.

## Guardrails

- Phase 28C is docs/validator/CI-only. No runtime source changes.
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
Next recommended phase: Phase 28D — Test-Only No-Write Generated/Test Restore Rehearsal Prototype
Phase 28D is a separate test-only/no-write implementation gate and is not automatically approved.
Phase 28C does not approve restore execution.
Phase 28C does not approve production restore rehearsal.
Phase 28C does not approve real learner data restore rehearsal.
Phase 28C does not approve runtime backup/export/restore changes.
Phase 28C does not approve backup file format changes.
Phase 28C does not approve restore overwrite behavior changes.
Phase 28C does not approve storage migration.
Phase 28C does not approve production adapter-aware backup/export/restore.
Phase 28C does not approve BETA_READY.
Phase 28C does not claim local-first hybrid readiness.
```
