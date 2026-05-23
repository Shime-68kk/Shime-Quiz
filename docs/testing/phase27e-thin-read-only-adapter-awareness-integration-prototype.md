# Phase 27E — Thin Read-Only Adapter-Awareness Integration Prototype

## Status tokens

```text
PHASE27E_THIN_READ_ONLY_INTEGRATION_STATUS: IMPLEMENTED_TEST_ONLY_DEFAULT_OFF_READ_ONLY_PROTOTYPE
PHASE27E_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES
PHASE27E_INTEGRATION_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_PRODUCTION_INTEGRATION
PHASE27E_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_BROWSER_OR_BACKUP_RESTORE_BEHAVIOR_CLAIM
```

## Scope

Phase 27E implements a thin read-only adapter-awareness integration prototype as test-only / default-off. The prototype wraps the Phase 27C pure-function model (`src/state/adapterAwarenessModel.js`) behind an enablement gate.

This phase covers:
- A new source file: `src/state/adapterAwarenessIntegrationPrototype.js`
- Unit tests: `tests/unit/adapterAwarenessIntegrationPrototype.test.js`
- Validator: `scripts/validate-phase27e-thin-read-only-adapter-awareness-integration-prototype.js`
- CI gate update: `.github/workflows/e2e-smoke.yml`

This phase does **not** cover:
- Production integration
- Backup/export/restore behavior changes
- Backup file format changes
- Restore overwrite behavior changes
- Storage migration
- UI wiring
- Browser/user-facing behavior

## Inputs from Phase 27D

Phase 27D delivered:
- Evidence review of Phase 27C pure model (`docs/testing/phase27d-adapter-awareness-model-evidence-review.md`)
- Thin read-only integration design (`docs/planning/phase27d-thin-read-only-integration-design.md`)
- Phase 27E planning seed (`docs/planning/phase27e-thin-read-only-integration-prototype-seed.md`)
- Decision: PASS_TO_PHASE27E_THIN_READ_ONLY_INTEGRATION_PROTOTYPE_WITH_STRICT_GATES

Phase 27D tokens confirmed:
```text
PHASE27D_ADAPTER_AWARENESS_MODEL_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_MODEL_EVIDENCE_REVIEW
PHASE27D_THIN_READ_ONLY_INTEGRATION_DESIGN_STATUS: COMPLETED_DESIGN_GATE
PHASE27D_THIN_READ_ONLY_INTEGRATION_DECISION: PASS_TO_PHASE27E_THIN_READ_ONLY_INTEGRATION_PROTOTYPE_WITH_STRICT_GATES
PHASE27D_INTEGRATION_SCOPE: DESIGN_ONLY_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES
PHASE27E_THIN_READ_ONLY_INTEGRATION_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Implementation summary

`src/state/adapterAwarenessIntegrationPrototype.js` exports four pure functions:

- `normalizeAdapterAwarenessSignalInput(rawInput, options)` — normalizes input using Phase 27C `normalizeAdapterAwarenessInput` and resolves `integrationEnabled`/`integrationMode` from options
- `createAdapterAwarenessSignal(rawInput, options)` — returns signal object; disabled path returns conservative defaults with `adapter_integration_disabled`; enabled path delegates to Phase 27C model
- `deriveAdapterAwarenessFromSignals(rawInput, options)` — returns state ID string; covers all Phase 27C state IDs plus `adapter_integration_disabled`
- `summarizeAdapterAwarenessIntegration(rawInput, options)` — returns summary object with `integrationEnabled`/`integrationMode`; `canClaimProductionSafety` always false

Enablement: `{ enabled: true, mode: 'test' }` or `{ enabled: true, mode: 'default-off' }` only. All other options (including missing, `enabled: false`, `production`, `live`, `staging`, `beta`, unknown modes) produce the disabled path.

## Integration API

### normalizeAdapterAwarenessSignalInput(rawInput, options)

Normalizes fields: `sourceAdapterId`, `targetAdapterId`, `exportAdapterId`, `restoreAdapterId`, `adapterStatusUnavailable`, `generatedTestData`, `restoreRehearsalVerified`. Returns `integrationEnabled` and `integrationMode`.

Never mutates input or options. Trims strings. Normalizes empty strings to `undefined`.

### createAdapterAwarenessSignal(rawInput, options)

Returns:
- `integrationEnabled` — boolean
- `integrationMode` — `'test'`, `'default-off'`, or `'disabled'`
- `stateId` — state ID string
- `severity` — `'info'`, `'caution'`, or `'unavailable'`
- `messageVi` — Vietnamese-first conservative message
- `claimBoundary` — claim boundary token
- `canClaimProductionSafety` — always `false`
- `evidenceLevel` — `'unit_static_only'`, `'generated_test_rehearsal_only'`, or `'unknown'`

### deriveAdapterAwarenessFromSignals(rawInput, options)

Returns a state ID string. Possible values:
- `adapter_integration_disabled` (disabled path)
- `adapter_status_unavailable`
- `restore_rehearsal_verified_generated_data`
- `missing_source_adapter`
- `missing_target_adapter`
- `different_adapter_context`
- `same_adapter_context`
- `unknown_adapter_state`

### summarizeAdapterAwarenessIntegration(rawInput, options)

Returns:
- `stateId`, `severity`, `labelVi`, `detailVi`
- `integrationEnabled`, `integrationMode`
- `canClaimProductionSafety` — always `false`
- `evidenceLevel`

## Unit/static evidence

Unit tests cover:
- All four exported functions exist
- Default-off without options
- `enabled: false` disables
- Only `test` and `default-off` modes enable
- `production`, `live`, `staging`, `beta`, `unknown` modes rejected
- `null`, `undefined`, and non-object input tolerance
- Input and options immutability
- String trimming and empty string normalization
- Alias passthrough (`exportAdapterId`, `restoreAdapterId`)
- Disabled state ID `adapter_integration_disabled`
- All Phase 27C state IDs through enabled path
- Signal and summary object shapes
- `canClaimProductionSafety` always false
- Evidence levels
- Vietnamese-first copy
- Forbidden claim strings absent
- No storage/write/network/telemetry APIs in source (static)
- No backup/export/restore imports in source (static)
- No href/route/navigation strings in source (static)
- No production module imports integration prototype (static)
- Generated/test data boundary

## Evidence interpretation

Evidence is unit/static only. No browser evidence collected. No backup file evidence collected. No real learner data used.

Unit tests use generated/synthetic inputs. Static checks confirm absence of forbidden APIs and import patterns.

This evidence does not prove:
- Production runtime adapter-aware backup/export/restore behavior
- Browser-visible adapter-awareness UI behavior
- Cross-adapter restore safety in production
- Backup file format compatibility in real environments
- Restore overwrite behavior correctness

## Default-off behavior

The prototype is disabled unless called with `{ enabled: true, mode: 'test' }` or `{ enabled: true, mode: 'default-off' }`. The disabled path returns `adapter_integration_disabled` with `severity: 'unavailable'` and `canClaimProductionSafety: false`.

No production module imports this prototype. It is not wired into any backup/export/restore flow, route, setting, library, or dashboard by default.

## No-write proof

All four exported functions are pure. They return output values only. No side effects. No writes to localStorage, IndexedDB, files, network, or any external state. Static check in unit tests confirms absence of `localStorage`, `indexedDB`, `fetch(`, `XMLHttpRequest`, `sendBeacon`, `Date.now`, `process.env`, `import.meta.env`, telemetry, and analytics in source.

## Backup/export/restore boundary

This prototype does not import production backup/export/restore modules. It does not call any backup/export/restore functions. It does not write to any backup file. It does not change the backup file format. It does not change restore overwrite behavior.

Production backup/export/restore behavior remains unchanged by this patch.
Backup file format remains unchanged.
Restore overwrite behavior remains unchanged.
Current localStorage backup compatibility remains unchanged.

## Storage driver boundary

This prototype does not import or call any storage driver. It does not call IndexedDB, localStorage, or any platform storage API. Default storage driver remains unchanged. No storage migration.

## Data safety boundary

No real learner data is read or processed. All inputs must be caller-supplied generated/test values. The prototype has no access path to stored learner content, stored backup files, or stored quiz data.

## Generated/test data only rule

All inputs accepted by this prototype must be generated/test data supplied by the caller. The prototype does not read from storage, files, or browser APIs to obtain input. It does not scan learner content. It does not read real backup files. It does not read real localStorage or IndexedDB data.

## Claim boundary

This prototype may claim:
- Unit/static evidence that pure integration functions behave correctly for generated/test inputs
- That the disabled path correctly returns `adapter_integration_disabled`
- That `canClaimProductionSafety` is always false

This prototype must not claim:
- Production adapter-aware backup/export/restore behavior
- Browser-visible behavior
- Cross-adapter restore safety
- Backup file format compatibility
- Restore overwrite correctness
- BETA_READY

## Rollback/removal plan

Removing `src/state/adapterAwarenessIntegrationPrototype.js` and its test file requires no changes to production modules, backup/export/restore flows, storage drivers, or routing. The prototype is isolated. No production code depends on it.

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
- Full historical scripts/validate-*.js chain is not used as a Phase 27E merge-blocking requirement.
- Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.

## Next recommended phase

```text
Next recommended phase: Phase 27F — Adapter-Awareness Integration Evidence Review and Closure/Re-Decision
Phase 27F is a separate evidence/re-decision gate and is not automatically approved.
Phase 27E does not approve production integration.
Phase 27E does not approve runtime backup/export/restore changes.
Phase 27E does not approve backup file format changes.
Phase 27E does not approve restore overwrite behavior changes.
Phase 27E does not approve storage migration.
Phase 27E does not approve production adapter-aware backup/export/restore.
Phase 27E does not approve BETA_READY.
```
