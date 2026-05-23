# Phase 27B — Adapter-Awareness Runtime Design Review

## Status tokens

```
PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_STATUS: COMPLETED_RUNTIME_DESIGN_REVIEW
PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_DECISION: PASS_TO_PHASE27C_TEST_ONLY_NO_WRITE_ADAPTER_AWARENESS_MODEL
PHASE27B_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: STATIC_LOCAL_DESIGN_EVIDENCE_NO_RUNTIME_BEHAVIOR_CLAIM
```

## Scope

Phase 27B reviews the runtime design for future adapter-aware backup/export/restore.

This review defines what a future Phase 27C test-only/no-write model may implement, what it must not implement, and what gates must pass before any production backup/export/restore runtime changes are allowed.

This document does not authorize production backup/export/restore changes. It does not authorize backup file format changes. It does not authorize restore overwrite behavior changes. It does not authorize storage migration. It does not authorize production adapter-aware backup/export/restore. It does not claim BETA_READY.

## Inputs

Phase 27A inputs:
- Adapter-awareness problem statement.
- Allowed future signal candidates.
- Forbidden future signals.
- Evidence gate for Phase 27B.

Phase 27B evidence review inputs:
- Static/local evidence review confirms no source files changed.
- All Phase 27A tokens verified.
- Design candidates are bounded and reasonable.

`PHASE27B_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: STATIC_LOCAL_DESIGN_EVIDENCE_NO_RUNTIME_BEHAVIOR_CLAIM`

## Runtime design purpose

The purpose of this runtime design review is to:

1. Define the expected behavior of future adapter-aware backup/export/restore functions.
2. Define which pure functions are candidates for a Phase 27C test-only model.
3. Define all boundaries that Phase 27C must respect.
4. Make a conservative implementation decision.
5. Prepare a safe Phase 27C candidate scope.

This review is a design document only. No code is written here. No functions are implemented here. No runtime imports are added here.

## Design decision

```
PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_DECISION: PASS_TO_PHASE27C_TEST_ONLY_NO_WRITE_ADAPTER_AWARENESS_MODEL
```

Phase 27B approves Phase 27C to create a test-only, no-write, pure-function adapter-awareness model subject to all gates below. Phase 27B does not approve production runtime implementation.

Rationale:
- Static/local evidence review confirms Phase 27A design is well-bounded.
- The adapter-awareness problem is clearly defined with safe candidate signals.
- A test-only/no-write model is the minimum safe step before any production implementation.
- Pure functions with no side effects and generated/test data only can be safely implemented and validated without risk to production behavior.
- Production backup/export/restore behavior remains unchanged until a future phase with full runtime evidence.

## Future Phase 27C model boundary

Phase 27C is permitted to implement only:

- Pure functions that derive adapter identity state from input parameters only.
- Pure functions that create compatibility warning data structures from input parameters only.
- Pure functions that summarize adapter-awareness state for backup health display.
- Unit tests using generated/test data only (no real backup files, no real localStorage reads, no real IndexedDB reads).

Phase 27C must not implement:
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

## Adapter identity model

The adapter identity model defines how a future adapter-aware system knows which storage adapter is active.

Design candidate:

```
AdapterIdentity = {
  type: 'localStorage' | 'indexedDB' | 'unknown',
  version: string | null,
  available: boolean,
}
```

Constraints:
- Adapter identity must be derived from a caller-supplied input parameter, not from reading live storage.
- Adapter identity must default to `{ type: 'unknown', available: false }` if input is unavailable or invalid.
- Adapter identity must not be read from OS or platform backup state.
- Adapter identity must not require telemetry or persistent tracking.
- Adapter identity must not be inferred from learner content.

Phase 27C candidate function: `deriveAdapterAwarenessState(input)` — pure function, takes input struct, returns AdapterIdentity candidate.

## Export metadata model

The export metadata model defines what adapter-awareness metadata may be included in a future backup/export envelope.

Design candidate:

```
ExportAdapterMetadata = {
  sourceAdapterType: 'localStorage' | 'indexedDB' | 'unknown',
  exportTimestamp: string,
  schemaVersion: string,
}
```

Constraints:
- Export metadata must be generated from caller-supplied input, not from reading backup files.
- Export metadata must not change the current backup file format (Phase 27C uses generated test data only).
- Export metadata must not be written to localStorage or IndexedDB in Phase 27C.
- Export metadata must be a pure transformation of input parameters.

Phase 27C candidate function: `normalizeAdapterAwarenessInput(rawInput)` — pure function, takes raw caller input, returns normalized ExportAdapterMetadata candidate.

## Restore compatibility warning model

The restore compatibility warning model defines how a future adapter-aware restore detects cross-adapter mismatch and generates a user-understandable warning.

Design candidate:

```
RestoreCompatibilityWarning = {
  isCompatible: boolean,
  sourceAdapterType: string,
  targetAdapterType: string,
  warningMessage: string | null,
  requiresUserConfirmation: boolean,
}
```

Constraints:
- Compatibility warning must be derived from caller-supplied source and target adapter identity inputs only.
- Compatibility warning must not trigger a real restore operation.
- Compatibility warning must not write to localStorage or IndexedDB.
- Compatibility warning must not be surfaced in production UI in Phase 27C.
- Compatibility warning must not claim to prevent data loss.

Phase 27C candidate function: `createAdapterCompatibilityWarning(source, target)` — pure function, takes source/target adapter identity, returns RestoreCompatibilityWarning candidate.

## Unknown/unavailable adapter state

If adapter identity cannot be determined (adapter type is `unknown` or `available` is false):

- All compatibility warnings must default to `isCompatible: false` and `requiresUserConfirmation: true`.
- Export metadata must record `sourceAdapterType: 'unknown'`.
- No silent pass-through is allowed for unknown adapter state.
- Unknown adapter state must be testable with generated/test data.

Phase 27C candidate function: `summarizeAdapterAwarenessForBackupHealth(state)` — pure function, takes adapter awareness state, returns summary for backup health display.

## No-write boundary

Phase 27C must not write to:
- localStorage.
- IndexedDB.
- Any persistent storage.
- Any backup file.
- Any restore target.

Phase 27C pure functions must only:
- Accept input parameters.
- Return output values.
- Have no side effects.

## Backup file format boundary

Phase 27B does not approve backup file format changes.
Phase 27C must not change the backup file format.
Backup file format changes require a separate design gate with full runtime evidence and Strict Reviewer approval.

## Restore overwrite boundary

Phase 27B does not approve restore overwrite behavior changes.
Phase 27C must not change restore overwrite behavior.
Restore overwrite behavior changes require a separate design gate with full runtime evidence and Strict Reviewer approval.

## Storage migration boundary

Phase 27B does not approve storage migration.
Phase 27C must not implement or trigger storage migration.
Storage migration requires a separate design gate with full runtime evidence and Strict Reviewer approval.

## Data safety and rollback plan

If Phase 27C is found to violate any boundary:
1. Immediately stop Phase 27C implementation.
2. Revert all Phase 27C changes.
3. Return to Phase 27B design review for re-scoping.

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
Full historical scripts/validate-*.js chain is not used as a Phase 27B merge-blocking requirement.
Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.

## Unit/static evidence plan for Phase 27C

Phase 27C must collect the following evidence before its gate passes:

1. Unit tests for `normalizeAdapterAwarenessInput` covering: known adapter types, unknown/null input, missing fields.
2. Unit tests for `deriveAdapterAwarenessState` covering: localStorage, indexedDB, unknown, unavailable.
3. Unit tests for `createAdapterCompatibilityWarning` covering: same-adapter, cross-adapter, unknown source, unknown target.
4. Unit tests for `summarizeAdapterAwarenessForBackupHealth` covering: all state combinations.
5. Static validator confirming: no src/ changes beyond new pure-function files, no backup/restore production imports, no localStorage/IndexedDB writes, no backup file format changes, no restore overwrite changes.

All tests must use generated/test data only. No real backup files. No real localStorage reads.

## Manual/browser evidence plan for future UI or restore behavior

Manual/browser evidence is NOT required for Phase 27C (test-only/no-write).

Manual/browser evidence IS required before any of the following may be claimed in a future phase:
- Adapter-aware backup/export is working in a browser.
- Restore compatibility warning is shown to users.
- Cross-adapter restore produces a correct result.
- Backup file format change is safe.
- Restore overwrite behavior change is safe.

## Go/no-go criteria

Phase 27C may proceed if:
- All Phase 27B tokens are present and verified.
- All Phase 27B docs contain required headings and boundary statements.
- Phase 27B validator passes.
- Phase 27B CI gate passes.
- No runtime source files were changed by Phase 27B.
- Phase 27C plan is confirmed as test-only/no-write.

Phase 27C must STOP if:
- Any production backup/export/restore import is required.
- Any backup file format change is required.
- Any restore overwrite behavior change is required.
- Any storage migration is required.
- Any localStorage or IndexedDB write is required.
- Any telemetry or analytics is required.
- Any production UI wiring is required.

## What Phase 27B can claim

- Static/local design evidence review is complete.
- Phase 27A design artifacts are well-bounded and correctly documented.
- The runtime design defines safe Phase 27C candidate functions.
- Phase 27C is approved as a test-only/no-write model with strict gates.
- No production backup/export/restore, storage, or source files were changed.

## What Phase 27B must not claim

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
- Phase 27C has been implemented (Phase 27C is a planning seed only).

## Guardrails

- Phase 27B does not approve BETA_READY.
- Phase 27B does not approve production adapter-aware backup/export/restore.
- Phase 27B does not approve changes to the backup file format.
- Phase 27B does not approve changes to restore overwrite behavior.
- Phase 27B does not approve storage migration.
- Phase 27B makes no claim of guaranteed data-loss prevention.
- Phase 27B makes no claim of broad backup reliability.
- Phase 27B makes no claim of local-first hybrid readiness.
- Phase 27B does not introduce runtime adapter-awareness in production code.
- Phase 27C planning seed is not an implementation; Phase 27C code does not exist.
- No production backup/restore/export modules modified.
- No storage drivers modified.
- No runtime/source/test/e2e/ADR files changed.

## Next recommended phase

Next recommended phase: Phase 27C — Test-Only No-Write Adapter-Awareness Model
Phase 27C is a separate test-only implementation gate and is not automatically approved.
Phase 27B does not approve production runtime backup/export/restore changes.
Phase 27B does not approve backup file format changes.
Phase 27B does not approve restore overwrite behavior changes.
Phase 27B does not approve storage migration.
Phase 27B does not approve production adapter-aware backup/export/restore.
Phase 27B does not approve BETA_READY.
