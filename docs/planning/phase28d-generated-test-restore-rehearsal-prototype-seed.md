# Phase 28D — Generated/Test Restore Rehearsal Prototype Seed

## Status token

```text
PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 28D will implement `src/state/generatedTestRestoreRehearsalPrototype.js` as a test-only/no-write pure function layer on top of the Phase 28B restore rehearsal planner. It will add structured generated/test input normalization, outcome derivation, and summary functions that extend the unit/static evidence base without introducing any new risk.

Phase 28D is not automatically approved. It requires passing the Phase 28C validator and confirming all gates before implementation begins.

## Planning constraints

Phase 28D must observe the following constraints:

- Test-only: `src/state/generatedTestRestoreRehearsalPrototype.js` must not be imported by any production module.
- No-write: no localStorage write, IndexedDB write transaction, fetch, XMLHttpRequest, or sendBeacon.
- Generated/test data only: all inputs must be synthetic. `generatedTestData: true` required for any ready state.
- No restore execution: no call to any restore/import function. `canExecuteRestore` hardcoded to `false`.
- No backup/export/restore imports: no import of production backup, export, or restore modules.
- No storage driver imports: no import of StorageAdapter, IndexedDB adapter, or localStorage wrapper.
- No browser APIs: no Date.now, process.env, import.meta.env, window, document, navigator.
- No production state writes: `canWriteProductionState` always false.
- No restore overwrite: `canOverwriteRestoreTarget` always false.
- No real learner data: `canUseRealLearnerData` always false.
- No backup format changes: `canChangeBackupFormat` always false.
- No data-loss prevention claims: `canClaimDataLossPrevention` always false.
- No production safety claims: `canClaimProductionSafety` always false.
- Do not import `src/state/restoreRehearsalPlanner.js` from anywhere except the new prototype module and its test.

## Candidate prototype functions

The following function names are candidates only. Do not implement these in Phase 28C.

- `normalizeGeneratedTestRestoreRehearsalInput` — normalizes generated/test input for the prototype
- `createGeneratedTestRestoreRehearsal` — creates a generated/test restore rehearsal result object
- `deriveGeneratedTestRestoreRehearsalOutcome` — derives an outcome ID from the planner state and prototype input
- `summarizeGeneratedTestRestoreRehearsal` — produces a Vietnamese-first summary with evidence level

Each function must be a pure function over explicit inputs only. No side effects. No storage access. No network access.

## Required gates before implementation

Before Phase 28D implementation may begin:

1. Phase 28C validator must pass (all tokens, headings, candidate names, changed-file set verified).
2. The prototype must conform to the design in `docs/planning/phase28c-generated-test-restore-rehearsal-prototype-design.md`.
3. No new production imports may be introduced.
4. No browser/manual evidence may be collected in Phase 28D.
5. All safety capability flags must be hardcoded to false.
6. Unit tests must cover all exported functions, all safety flags, input tolerance, immutability, conservative priority integration with Phase 28B planner, and Vietnamese-first copy.

## Forbidden default approvals

Phase 28D does NOT automatically approve:
- Restore execution
- Production restore rehearsal
- Real learner data restore rehearsal
- Runtime backup/export/restore changes
- Backup file format changes
- Restore overwrite behavior changes
- Storage migration
- Production adapter-aware backup/export/restore
- BETA_READY
- Local-first hybrid readiness
- Browser/manual evidence collection

## Evidence needed before stronger claims

Before any stronger claim (production integration, browser evidence, restore execution) may be considered:
- A separate design gate doc defining the scope, inputs, outputs, and safety boundaries
- Unit/static evidence from Phase 28D passing
- A specific re-decision token from the evidence review for that gate
- No automatic promotion from Phase 28D passing

## Recommended next step

```text
Proceed to Phase 28D: implement src/state/generatedTestRestoreRehearsalPrototype.js as test-only/no-write pure functions, add unit tests, add static validator, update CI. Do not implement restore execution. Do not import backup/export/restore modules. Do not use real learner data.
```
