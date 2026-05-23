# Phase 27C — Test-Only Adapter-Awareness Model

## Status tokens

```text
PHASE27C_ADAPTER_AWARENESS_MODEL_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_MODEL
PHASE27C_ADAPTER_AWARENESS_MODEL_SCOPE: PURE_FUNCTIONS_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES
PHASE27C_ADAPTER_AWARENESS_MODEL_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_INTEGRATION
PHASE27C_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM
```

## Scope

Phase 27C implements a test-only/no-write pure-function adapter-awareness model.

Phase 27C is test-only. Phase 27C is not production integrated. Phase 27C does not change any production backup/export/restore module, storage driver, backup file format, restore overwrite behavior, migration, sync/cloud/account/auth/backend, production UI, route, navigation, settings, library, or dashboard.

The model exists purely to demonstrate that the adapter-awareness state logic can be expressed as pure functions with deterministic, side-effect-free behavior, tested with generated/synthetic data only.

## Inputs from Phase 27B

Phase 27B completed:
- Adapter-awareness evidence review (static/local checks only)
- Runtime design review
- Phase 27C planning seed

Phase 27B tokens confirmed present:
- `PHASE27B_ADAPTER_AWARENESS_EVIDENCE_STATUS: COMPLETED_STATIC_LOCAL_EVIDENCE_REVIEW`
- `PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_STATUS: COMPLETED_RUNTIME_DESIGN_REVIEW`
- `PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_DECISION: PASS_TO_PHASE27C_TEST_ONLY_NO_WRITE_ADAPTER_AWARENESS_MODEL`
- `PHASE27B_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: STATIC_LOCAL_DESIGN_EVIDENCE_NO_RUNTIME_BEHAVIOR_CLAIM`
- `PHASE27C_TEST_ONLY_ADAPTER_AWARENESS_MODEL_SEED_STATUS: PREPARED_PLANNING_SEED`

Phase 27B permits only a test-only/no-write pure-function adapter-awareness model. It does not approve production runtime backup/export/restore changes.

## Implementation summary

New files added in Phase 27C:

- `src/state/adapterAwarenessModel.js` — pure function model, no imports, no storage, no side effects
- `tests/unit/adapterAwarenessModel.test.js` — unit tests using generated/synthetic data only
- `docs/testing/phase27c-test-only-adapter-awareness-model.md` — this document
- `docs/release/phase27c-test-only-adapter-awareness-model-summary.md` — release summary
- `scripts/validate-phase27c-test-only-adapter-awareness-model.js` — static validator

Modified file:
- `.github/workflows/e2e-smoke.yml` — registers Phase 27C validator as current-phase merge-blocking gate

## Model API

### `normalizeAdapterAwarenessInput(rawInput)`

Pure function. Normalizes raw input object. Tolerates null/undefined/non-object. Trims strings. Normalizes empty strings to undefined. Resolves field aliases (exportAdapterId → sourceAdapterId, restoreAdapterId → targetAdapterId, adapterId fallback). Never mutates input. No storage reads. No side effects.

### `deriveAdapterAwarenessState(input)`

Pure function. Returns one of seven required state IDs using conservative priority order:

1. `adapter_status_unavailable` (highest priority — most conservative)
2. `restore_rehearsal_verified_generated_data`
3. `missing_source_adapter`
4. `missing_target_adapter`
5. `different_adapter_context`
6. `same_adapter_context`
7. `unknown_adapter_state` (lowest priority — default fallback)

### `createAdapterCompatibilityWarning(input)`

Pure function. Returns `{ stateId, severity, messageVi, claimBoundary }`. Message is Vietnamese-first and conservative. Severity is one of: `info`, `caution`, `unavailable`.

### `summarizeAdapterAwarenessForBackupHealth(input)`

Pure function. Returns `{ stateId, severity, labelVi, detailVi, canClaimProductionSafety, evidenceLevel }`. `canClaimProductionSafety` is always `false` in Phase 27C. `evidenceLevel` is one of: `unit_static_only`, `generated_test_rehearsal_only`, `unknown`.

## Unit/static evidence

Evidence type: unit tests and static code analysis only.

Unit tests cover:
- All exported functions exist
- null/undefined/non-object input is tolerated
- Input immutability confirmed
- String trimming and empty-string normalization
- Alias handling (exportAdapterId, restoreAdapterId, adapterId fallback)
- All seven required state IDs produced
- Conservative priority order verified
- Same adapter context
- Different adapter context
- Missing source adapter
- Missing target adapter
- Adapter status unavailable
- Generated/test restore rehearsal state
- Warning object shape (stateId, severity, messageVi, claimBoundary)
- Summary object shape (stateId, severity, labelVi, detailVi, canClaimProductionSafety, evidenceLevel)
- `canClaimProductionSafety` always false in all states
- Evidence levels (unit_static_only, generated_test_rehearsal_only, unknown)
- Vietnamese-first copy presence
- Forbidden claim strings absent
- No storage/write/network/telemetry APIs in source (static read)
- No backup/export/restore imports in source (static read)
- No Date.now usage in source (static read)
- Generated/test data only boundary enforced

## Evidence interpretation

`PHASE27C_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM`

Unit and static evidence demonstrates that the pure-function model:
- Is deterministic
- Has no side effects by construction (no storage/network/browser APIs in source)
- Handles all specified inputs correctly per the conservative priority rules
- Does not import production modules

Unit/static evidence does NOT prove:
- Production runtime adapter-aware backup/export/restore safety
- Real backup file compatibility across different adapters
- Real restore safety or correctness in a browser environment
- That production modules will ever correctly use this model
- Any browser/manual execution result
- BETA_READY status

## No-write proof

`src/state/adapterAwarenessModel.js` contains no imports. It does not reference `localStorage`, `indexedDB`, `fetch`, `XMLHttpRequest`, `sendBeacon`, `telemetry`, `analytics`, `Date.now`, or any file/storage/network API. The unit tests verify these absences via static string checks against the source file content.

The model never writes to any storage. It is a pure computation layer.

## Backup/export/restore boundary

Production backup/export/restore behavior remains unchanged by this patch.

Phase 27C does not change any production backup/export/restore module. No production backup/export/restore module imports `adapterAwarenessModel.js`. Backup file format remains unchanged. No restore overwrite behavior change. The Phase 27C model is test-only and not wired into any production path.

## Storage driver boundary

Default storage driver remains unchanged. No IndexedDB. No storage migration. No storage driver imports `adapterAwarenessModel.js`.

## Data safety boundary

No learner data is read, processed, or written by Phase 27C. The model accepts only generated/test data input. No real backup files. No external file reads. No platform backup access.

## Generated/test data only rule

All inputs to the model functions must be generated or test data. `restore_rehearsal_verified_generated_data` state may be produced by test rehearsal, but this does not imply production restore safety. `canClaimProductionSafety` is always `false`.

## Claim boundary

Phase 27C claims:
- The pure-function model is implemented and unit-tested with generated/test data

Phase 27C does NOT claim:
- Production runtime adapter-aware backup/export/restore safety
- Backup file format compatibility proven at runtime
- Restore safety or correctness proven at runtime
- Browser/manual evidence
- BETA_READY

## Rollback/removal plan

To remove Phase 27C: delete `src/state/adapterAwarenessModel.js`, `tests/unit/adapterAwarenessModel.test.js`, and this doc. Revert `.github/workflows/e2e-smoke.yml` to Phase 27B validator. No production code path is affected because no production module imports `adapterAwarenessModel.js`.

## Guardrails

- Phase 27C is test-only/no-write. It is not production integrated.
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
- Full historical scripts/validate-*.js chain is not used as a Phase 27C merge-blocking requirement.
- Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.
- `canClaimProductionSafety` is always false in Phase 27C.

## Next recommended phase

```text
Next recommended phase: Phase 27D — Adapter-Awareness Model Evidence Review and Thin Read-Only Integration Design
Phase 27D is a separate evidence/design review gate and is not automatically approved.
Phase 27C does not approve production integration.
Phase 27C does not approve runtime backup/export/restore changes.
Phase 27C does not approve backup file format changes.
Phase 27C does not approve restore overwrite behavior changes.
Phase 27C does not approve storage migration.
Phase 27C does not approve production adapter-aware backup/export/restore.
Phase 27C does not approve BETA_READY.
```
