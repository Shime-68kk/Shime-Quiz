# Phase 31G — Data Safety UX Internal Visibility Implementation Summary

## Status tokens

```text
PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_STATUS: COMPLETED_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
PHASE31G_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_DECISION: PASS_TO_PHASE31H_INTERNAL_VISIBILITY_EVIDENCE_REVIEW
PHASE31G_IMPLEMENTATION_SCOPE: DEFAULT_OFF_INTERNAL_VISIBILITY_ONLY_NO_USER_VISIBLE_TOGGLE_NO_STORAGE_WRITES
PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 31G implements a minimal default-off internal visibility control for the Phase 31C Data Safety UX prototype. Implementation is internal/dev/test opt-in only. No user-visible toggle. No persistence. No backend or config fetch. No backup/export/restore behavior changes.

## Current readiness

`LIMITED_BETA_CANDIDATE` — confirmed. `BETA_READY` is not approved and is not claimed.

## Implementation result

A pure helper module (`dataSafetyInternalVisibility.js`) has been created. It provides three exported functions for deriving a Data Safety Center prototype config from the environment. The helper is default-off: without the explicit `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY` env flag, the prototype remains hidden exactly as in prior phases.

`src/routes/Settings.jsx` is updated to use the helper to derive its prototype config from `import.meta.env`. In default/production builds with no env flag, behavior is identical to Phase 31F. Only internal/dev/test builds with the env flag set may render the prototype.

## Chosen decision

```text
PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_DECISION: PASS_TO_PHASE31H_INTERNAL_VISIBILITY_EVIDENCE_REVIEW
```

## Decision rationale

The implementation satisfies all constraints:
- Default is off
- Only explicit narrow true values (`1`, `true`, `enabled`) via the internal env flag can enable
- No user-visible toggle, no storage writes, no network calls
- Pure functions only, easy rollback
- Unit tests verify default-off behavior, invalid env rejection, and internal enabling

Phase 31H will review the implementation evidence before any further visibility decisions.

## What is supported

- Default-off internal visibility control via `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY` env flag
- Pure helper module compatible with Phase 31C `shouldShowDataSafetyCenterPrototype`
- Unit/static tests covering default-off, invalid env, explicit internal enable, and boundary checks
- Phase 31H evidence review seed prepared

## What remains not approved

Phase 31G does not approve BETA_READY.
Phase 31G does not approve public production readiness.
Phase 31G does not approve guaranteed data-loss prevention.
Phase 31G does not approve restore execution.
Phase 31G does not approve production restore rehearsal.
Phase 31G does not approve real learner data restore rehearsal.
Phase 31G does not approve runtime backup/export/restore behavior changes.
Phase 31G does not approve backup file format changes.
Phase 31G does not approve restore overwrite behavior changes.
Phase 31G does not approve storage migration.
Phase 31G does not approve sync/cloud/account/auth/backend.
Phase 31G does not approve telemetry/analytics.
Phase 31G does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31G does not approve BYOC/WebDAV/P2P/device-transfer implementation.
Phase 31G does not approve limited settings visibility to ordinary users.

## Validation summary

| Check | Result |
|---|---|
| npm ci | PASS |
| Phase 31G validator | PASS |
| npm run build | PASS |
| npm run test:unit | PASS |
| Patch apply check | PASS |
| Generated artifacts absent | PASS |

## Guardrails

- No user-visible toggle was introduced.
- No state is persisted.
- No network call is made.
- No backup/export/restore module was modified.
- No dependency was changed.
- Helper is pure functions only; easy to rollback.
- `LIMITED_BETA_CANDIDATE` remains the highest approved readiness status.

## Next recommended phase

Next recommended phase: Phase 31H — Data Safety UX Internal Visibility Evidence Review

Phase 31H is a separate evidence review gate and is not automatically approved.
Phase 31G confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31G does not approve BETA_READY.
Phase 31G does not approve public production readiness.
