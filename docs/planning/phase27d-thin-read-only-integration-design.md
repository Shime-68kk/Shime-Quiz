# Phase 27D — Thin Read-Only Integration Design

## Status tokens

```text
PHASE27D_ADAPTER_AWARENESS_MODEL_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_MODEL_EVIDENCE_REVIEW
PHASE27D_THIN_READ_ONLY_INTEGRATION_DESIGN_STATUS: COMPLETED_DESIGN_GATE
PHASE27D_THIN_READ_ONLY_INTEGRATION_DECISION: PASS_TO_PHASE27E_THIN_READ_ONLY_INTEGRATION_PROTOTYPE_WITH_STRICT_GATES
PHASE27D_INTEGRATION_SCOPE: DESIGN_ONLY_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES
PHASE27E_THIN_READ_ONLY_INTEGRATION_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

This document defines the design scope for a future thin read-only adapter-awareness integration.

Phase 27D is a design gate only. No code is written here. No functions are implemented here. No runtime imports are added here. No production backup/export/restore modules are changed. No storage drivers are changed. No `src/state/adapterAwarenessModel.js` is imported in Phase 27D.

Phase 27D reviews the unit/static evidence from Phase 27C and defines what a future Phase 27E test-only/default-off/read-only prototype may implement, what it must not implement, and what gates must pass before any further integration is allowed.

## Inputs

Phase 27C inputs:
- Pure-function adapter-awareness model (`src/state/adapterAwarenessModel.js`).
- Unit tests confirming all seven state IDs, four exports, conservative priority, Vietnamese-first copy, `canClaimProductionSafety: false`.
- Phase 27C evidence interpretation: `UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM`.
- Phase 27C decision: `HOLD_FOR_REVIEW_BEFORE_ANY_INTEGRATION`.

Phase 27D evidence review (companion doc) inputs:
- All Phase 27C tokens verified present.
- Evidence table confirms unit/static checks pass.
- No production source files changed by Phase 27C.
- No backup/export/restore modules changed.
- `canClaimProductionSafety` structurally enforced as always `false`.

`PHASE27D_ADAPTER_AWARENESS_MODEL_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_MODEL_EVIDENCE_REVIEW`

## Integration purpose

The purpose of this thin read-only integration design is to:

1. Define the minimum safe surface for a future Phase 27E prototype.
2. Define which integration functions are candidates for Phase 27E.
3. Define all boundaries that Phase 27E must respect.
4. Make a conservative design decision.
5. Prepare a safe Phase 27E candidate scope.

This design is conservative. Integration must remain read-only. It must not write to any storage. It must not change any backup/export/restore behavior. It must not change any backup file format. It must not change any restore overwrite behavior.

## Design decision

```text
PHASE27D_THIN_READ_ONLY_INTEGRATION_DECISION: PASS_TO_PHASE27E_THIN_READ_ONLY_INTEGRATION_PROTOTYPE_WITH_STRICT_GATES
```

Phase 27D approves Phase 27E to create a test-only, default-off, read-only thin integration prototype subject to all gates below. Phase 27D does not approve production runtime implementation.

Rationale:
- Unit/static evidence review confirms Phase 27C model is well-bounded.
- The pure-function model is deterministic, has no side effects, and handles all required states.
- A thin read-only integration is the minimum safe next step before any production integration.
- The integration must accept only explicit generated/test inputs and return only read-only output values.
- No write operations, no production imports, and no backup/restore behavior changes are permitted.

## Future Phase 27E integration boundary

Phase 27E is permitted to implement only:

- A new file: `src/state/adapterAwarenessIntegrationPrototype.js`.
- Pure functions in that file that accept only explicit generated/test input objects.
- Functions that call into `src/state/adapterAwarenessModel.js` via import (read-only calls).
- Unit tests using generated/test data only.
- A Phase 27E static validator.
- A Phase 27E CI gate.

Phase 27E must not implement:
- Production backup/export/restore imports or wiring.
- Backup file format changes.
- Restore overwrite behavior changes.
- Storage driver changes.
- Storage migration.
- localStorage writes.
- IndexedDB writes.
- Telemetry or analytics.
- Sync/cloud/account/auth/backend.
- Production UI wiring.
- Browser-facing features without separate runtime evidence gate.
- Reads from real backup files.
- Reads from real localStorage or IndexedDB data.

## Candidate integration layer

Phase 27E candidate file:

```text
src/state/adapterAwarenessIntegrationPrototype.js
```

This file is a candidate only. It does not exist in Phase 27D. It must not be created in Phase 27D.

The candidate integration layer would coordinate calls to the pure model functions from `src/state/adapterAwarenessModel.js` using only explicit generated/test inputs. It may not import or call any production backup/export/restore modules.

## Allowed future read-only inputs

Phase 27E integration functions may accept only the following explicit generated/test input objects:

- `sourceAdapterId` — caller-supplied adapter identity string (generated/test value only)
- `targetAdapterId` — caller-supplied target adapter identity string (generated/test value only)
- `exportAdapterId` — caller-supplied export adapter identity string (generated/test value only, alias for `sourceAdapterId`)
- `restoreAdapterId` — caller-supplied restore adapter identity string (generated/test value only, alias for `targetAdapterId`)
- adapter status/unavailable flag — caller-supplied boolean (generated/test value only)
- generated/test restore rehearsal flag — caller-supplied boolean indicating generated/test rehearsal context only

All inputs must be caller-supplied. Phase 27E must not derive inputs from live storage reads, real backup files, real user sessions, or OS/platform backup state.

## Forbidden future inputs

The following are forbidden as inputs to any Phase 27E function:

- Learner content scanning.
- Automatic file reads (backup file paths, storage files).
- External backup reads without explicit user action.
- OS/platform backup inspection.
- Cloud/account/backend access.
- Telemetry or analytics inputs.
- Persistent tracking added only to calculate adapter health.
- Any input derived from writing to backup/export/restore modules.
- Any input derived from writing to storage drivers.
- Any input involving backup file format changes.
- Any input involving restore overwrite changes.
- Any input involving storage migration.

## No-write boundary

Phase 27E must not write to:
- localStorage.
- IndexedDB.
- Any persistent storage.
- Any backup file.
- Any restore target.

Phase 27E integration functions must only:
- Accept explicit input parameters.
- Call pure model functions from `src/state/adapterAwarenessModel.js`.
- Return output values.
- Have no side effects beyond read-only model function calls.

## Production import boundary

Phase 27E must not import:
- Production backup/export/restore modules.
- Storage driver modules.
- Route/navigation/settings/library/dashboard modules.
- Any module not directly needed for pure function integration.

The only permitted new import in Phase 27E integration prototype:
- `src/state/adapterAwarenessModel.js` (read-only model calls).

## Backup/export boundary

Phase 27D does not approve backup/export changes.
Phase 27E must not change any production backup/export module.
Backup file format remains unchanged.
No backup file may be created, read, or deleted by Phase 27E prototype.
Adapter-aware backup/export metadata integration remains a future phase candidate beyond Phase 27E.

## Restore/import boundary

Phase 27D does not approve restore/import changes.
Phase 27E must not change any production restore/import module.
Restore overwrite behavior remains unchanged.
No restore operation may be executed by Phase 27E prototype.
Restore compatibility warnings remain a future phase candidate beyond Phase 27E.

## Storage driver boundary

Phase 27D does not approve storage driver changes.
Phase 27E must not change any storage driver module.
No IndexedDB may be written or read.
No localStorage may be written by Phase 27E prototype.
Storage adapter identity integration remains a future phase candidate beyond Phase 27E.

## Data safety and rollback plan

If Phase 27E is found to violate any boundary:
1. Immediately stop Phase 27E implementation.
2. Revert all Phase 27E changes.
3. Return to Phase 27D design review for re-scoping.

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
Full historical scripts/validate-*.js chain is not used as a Phase 27D merge-blocking requirement.
Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.

## Unit/static evidence plan for Phase 27E

Phase 27E must collect the following evidence before its gate passes:

1. Unit tests for `normalizeAdapterAwarenessSignalInput` covering: known adapter IDs, unknown/null input, missing fields, generated/test data only.
2. Unit tests for `createAdapterAwarenessSignal` covering: all seven state IDs, conservative priority, input aliases.
3. Unit tests for `deriveAdapterAwarenessFromSignals` covering: all state combinations, no-write boundary enforcement.
4. Unit tests for `summarizeAdapterAwarenessIntegration` covering: output shape, `canClaimProductionSafety: false`, evidence level.
5. Static validator confirming: no production imports beyond `adapterAwarenessModel.js`, no localStorage/IndexedDB writes, no backup/restore/export module imports, no backup file format changes, no restore overwrite changes.

All tests must use generated/test data only. No real backup files. No real localStorage reads.

## Manual/browser evidence boundary

Manual/browser evidence is NOT required for Phase 27E (test-only/default-off/read-only prototype).

Manual/browser evidence IS required before any of the following may be claimed in a future phase:
- Adapter-aware backup/export is working in a browser.
- Restore compatibility warning is shown to users.
- Cross-adapter restore produces a correct result.
- Backup file format change is safe.
- Restore overwrite behavior change is safe.
- Any user-facing adapter-awareness feature is ready.

## Go/no-go criteria

Phase 27E may proceed if:
- All Phase 27D tokens are present and verified.
- All Phase 27D docs contain required headings and boundary statements.
- Phase 27D validator passes.
- Phase 27D CI gate passes.
- No runtime source files were changed by Phase 27D.
- Phase 27E plan is confirmed as test-only/default-off/read-only.
- Phase 27E candidate functions are confirmed as pure integration wrappers only.

Phase 27E must STOP if:
- Any production backup/export/restore import is required.
- Any backup file format change is required.
- Any restore overwrite behavior change is required.
- Any storage migration is required.
- Any localStorage or IndexedDB write is required.
- Any telemetry or analytics is required.
- Any production UI wiring is required.
- Any real backup file read is required.

## What Phase 27D can claim

- Unit/static model evidence review of Phase 27C artifacts is complete.
- Phase 27C pure-function model is correctly implemented and evidence-bounded.
- The thin read-only integration design defines safe Phase 27E candidate functions and boundaries.
- Phase 27E is approved as a test-only/default-off/read-only prototype with strict gates.
- No production backup/export/restore, storage, or source files were changed.

## What Phase 27D must not claim

- Adapter-aware backup/export/restore is implemented.
- Backup file format changes were made or approved for production.
- Restore overwrite behavior changes were made or approved for production.
- Storage migration was approved.
- Production adapter-aware backup/export/restore is ready.
- BETA_READY.
- Broad backup reliability or guaranteed data-loss prevention.
- Local-first hybrid readiness.
- Manual/browser evidence was collected.
- Runtime adapter-awareness was observed or tested.
- Phase 27E has been implemented (Phase 27E is a planning seed only).

## Guardrails

- Phase 27D does not approve BETA_READY.
- Phase 27D does not approve production adapter-aware backup/export/restore.
- Phase 27D does not approve changes to the backup file format.
- Phase 27D does not approve changes to restore overwrite behavior.
- Phase 27D does not approve storage migration.
- Phase 27D makes no claim of guaranteed data-loss prevention.
- Phase 27D makes no claim of broad backup reliability.
- Phase 27D makes no claim of local-first hybrid readiness.
- Phase 27D does not introduce runtime adapter-awareness in production code.
- Phase 27D does not import `src/state/adapterAwarenessModel.js`.
- Phase 27E planning seed is not an implementation; Phase 27E code does not exist in Phase 27D.
- No production backup/restore/export modules modified.
- No storage drivers modified.
- No runtime/source/test/e2e/ADR files changed.
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
- Full historical scripts/validate-*.js chain is not used as a Phase 27D merge-blocking requirement.
- Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.

## Next recommended phase

```text
Next recommended phase: Phase 27E — Thin Read-Only Adapter-Awareness Integration Prototype
Phase 27E is a separate test-only/default-off/read-only implementation gate and is not automatically approved.
Phase 27D does not approve production integration.
Phase 27D does not approve runtime backup/export/restore changes.
Phase 27D does not approve backup file format changes.
Phase 27D does not approve restore overwrite behavior changes.
Phase 27D does not approve storage migration.
Phase 27D does not approve production adapter-aware backup/export/restore.
Phase 27D does not approve BETA_READY.
```
