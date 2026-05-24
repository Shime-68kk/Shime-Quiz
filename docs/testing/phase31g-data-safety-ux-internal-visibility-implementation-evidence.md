# Phase 31G — Data Safety UX Internal Visibility Implementation Evidence

## Status tokens

```text
PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_STATUS: COMPLETED_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
PHASE31G_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_DECISION: PASS_TO_PHASE31H_INTERNAL_VISIBILITY_EVIDENCE_REVIEW
PHASE31G_IMPLEMENTATION_SCOPE: DEFAULT_OFF_INTERNAL_VISIBILITY_ONLY_NO_USER_VISIBLE_TOGGLE_NO_STORAGE_WRITES
PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 31G implements a minimal default-off internal visibility control for the Phase 31C Data Safety UX prototype. The implementation is for internal/dev/test opt-in only. No user-visible toggle is added. No state is persisted. No backend or config fetch is performed. No backup/export/restore behavior is changed.

## Implementation

### New files

- `src/features/dataSafety/dataSafetyInternalVisibility.js` — pure helper module
- `tests/unit/dataSafetyInternalVisibility.test.js` — unit tests
- `docs/testing/phase31g-data-safety-ux-internal-visibility-implementation-evidence.md` — this file
- `docs/release/phase31g-data-safety-ux-internal-visibility-implementation-summary.md` — release summary
- `docs/planning/phase31h-data-safety-ux-internal-visibility-evidence-review-seed.md` — Phase 31H seed
- `scripts/validate-phase31g-data-safety-ux-internal-visibility-implementation.js` — validator

### Modified files

- `.github/workflows/e2e-smoke.yml` — active validator updated to Phase 31G
- `src/routes/Settings.jsx` — prototype config wired to internal visibility helper

## Helper module

`src/features/dataSafety/dataSafetyInternalVisibility.js` exports:

| Export | Type | Description |
|---|---|---|
| `DATA_SAFETY_INTERNAL_VISIBILITY_DEFAULT_ENABLED` | `false` | Default is OFF; never true in production |
| `DATA_SAFETY_INTERNAL_VISIBILITY_ENV_FLAG` | `string` | `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY` |
| `normalizeDataSafetyInternalVisibilityEnv(env)` | function | Normalizes raw env value to lowercase string |
| `shouldEnableDataSafetyInternalVisibility(env)` | function | Returns true only for accepted values: `1`, `true`, `enabled` |
| `createDataSafetyInternalVisibilityConfig(env)` | function | Builds config compatible with `shouldShowDataSafetyCenterPrototype` |

**Default behavior (no env flag):** returns `{ enabled: false, mode: 'default' }` — prototype hidden.

**Explicit internal flag + development/test MODE:** returns `{ enabled: true, mode: 'development'|'test' }` — visible for internal builds only.

**No localStorage. No sessionStorage. No IndexedDB. No cookies. No fetch. No XMLHttpRequest. No WebSocket. No sendBeacon. No user-visible toggle. No backend/config fetch.**

## Settings integration

`src/routes/Settings.jsx` is updated to derive its `PHASE31C_PROTOTYPE_CONFIG` from `createDataSafetyInternalVisibilityConfig(import.meta.env)` instead of the previous empty `{}`.

- With default/production env (no flag): config is `{ enabled: false, mode: 'default' }` — prototype remains hidden exactly as before.
- With `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=1` in dev/test builds: config enables the prototype for internal visibility only.
- `shouldShowDataSafetyCenterPrototype` from Phase 31C is preserved without modification.
- No route additions. No new imports beyond the helper.

## Test coverage

`tests/unit/dataSafetyInternalVisibility.test.js` covers:

- `DATA_SAFETY_INTERNAL_VISIBILITY_DEFAULT_ENABLED` is `false`
- `normalizeDataSafetyInternalVisibilityEnv`: undefined, null, empty, case/whitespace normalization
- `shouldEnableDataSafetyInternalVisibility`: false for undefined, null, empty, "false", "0", "yes", "on", "production", random junk; true for "1", "true", "enabled", case variants
- `createDataSafetyInternalVisibilityConfig`: disabled for null/undefined/empty/missing flag/invalid flag; enabled for "1"+"development", "true"+"development", "enabled"+"test"; "dev" fallback for production MODE
- Phase 31C compatibility: default config hides prototype; invalid/missing flag hides; explicit "1"+dev shows; explicit "true"+"test" shows
- Source-level static checks: no storage APIs, no network APIs, no forbidden imports in helper or Settings
- No persisted/user-visible state: pure functions, no side effects, idempotent

## Constraint verification

| Constraint | Status |
|---|---|
| Default-off | PASS — `DATA_SAFETY_INTERNAL_VISIBILITY_DEFAULT_ENABLED = false` |
| Internal opt-in only | PASS — requires `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY` flag |
| No user-visible toggle | PASS — no UI toggle added |
| No persistence | PASS — pure function, no storage write |
| No backend/config fetch | PASS — no network call |
| No localStorage/sessionStorage/indexedDB/cookie | PASS — verified by static test |
| No fetch/XMLHttpRequest/WebSocket/sendBeacon | PASS — verified by static test |
| No backup/export/restore behavior changes | PASS — no such modules touched |
| No ordinary-user visibility approval | PASS — internal flag only |
| No route additions | PASS — only Settings.jsx modified |
| No dependency changes | PASS — no package.json/package-lock.json changes |
| Easy rollback | PASS — revert Settings.jsx one-liner + remove helper |

## What Phase 31G supports

- Default-off internal visibility control for the Phase 31C Data Safety UX prototype
- Explicit internal/dev/test opt-in via `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY` env flag
- Pure helper module with unit/static tests
- Phase 31H evidence review seed preparation
- `LIMITED_BETA_CANDIDATE` remains the highest approved readiness status

## What Phase 31G does not approve

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

## Next recommended phase

Next recommended phase: Phase 31H — Data Safety UX Internal Visibility Evidence Review

Phase 31H is a separate evidence review gate and is not automatically approved.
Phase 31G confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31G does not approve BETA_READY.
Phase 31G does not approve public production readiness.
