# Phase 25M — Backup Health Limited Default-Off UI View-Model Prototype

## Status token

```
PHASE25M_BACKUP_HEALTH_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_UI_VIEW_MODEL_PROTOTYPE
```

## Runtime scope token

```
PHASE25M_BACKUP_HEALTH_UI_SCOPE: DEFAULT_OFF_READ_ONLY_VIEW_MODEL_NO_ROUTE_NO_WRITES
```

## Decision token

```
PHASE25M_BACKUP_HEALTH_UI_DECISION: PASS_TO_PHASE25N_MANUAL_EVIDENCE_AND_PHASE25_CLOSURE_GATE
```

## Phase type

Small runtime source helper + unit tests + docs/static-validator/CI + evidence run-pack preparation.

## Implementation scope

Phase 25M is a limited default-off UI view-model prototype.
Phase 25M does not expose production-visible Backup Health UI.
Phase 25M does not create React/JSX UI components.
Phase 25M does not wire the view model into routes/navigation/settings/library/dashboard.
Phase 25M does not write backup health state.
Phase 25M does not change production backup/export/restore behavior.
Phase 25M does not change backup file format.
Phase 25M does not change restore overwrite behavior.
Phase 25M does not implement production adapter-aware backup/export/restore.
Phase 25M does not add sync/cloud/account/auth/backend.
Phase 25M does not add telemetry/analytics.
Phase 25M does not add dependencies.
Phase 25M does not perform storage migration.
Phase 25M does not claim BETA_READY.

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
Full historical scripts/validate-*.js chain is not used as a Phase 25M merge-blocking requirement.

## Baseline tokens

Phase 25L baseline:

```
PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DESIGN_STATUS: COMPLETED_DESIGN_GATE
PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DECISION: PASS_TO_PHASE25M_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_WITH_STRICT_GATES
```

Phase 25K baseline:

```
PHASE25K_BACKUP_HEALTH_TEST_ONLY_DEFAULT_OFF_INTEGRATION_STATUS: COMPLETED_TEST_ONLY_DEFAULT_OFF_PROTOTYPE
PHASE25K_BACKUP_HEALTH_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_UI_NO_WRITES
PHASE25K_BACKUP_HEALTH_INTEGRATION_DECISION: PASS_TO_PHASE25L_PRODUCTION_UI_DESIGN_GATE_ONLY
```

Phase 25I baseline:

```
PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_LAYER_STATUS: COMPLETED_THIN_READ_ONLY_SIGNAL_LAYER
PHASE25I_BACKUP_HEALTH_RUNTIME_SCOPE: READ_ONLY_NO_UI_NO_WRITES_NO_BACKUP_RESTORE_CHANGES
PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_DECISION: PASS_TO_PHASE25J_READ_ONLY_INTEGRATION_DESIGN_GATE
```

Phase 25I-HF1 fixed the post-merge main validator context awareness. This phase inherits that fix.

## Changed files

New files:
- `src/state/backupHealthUiPrototype.js`
- `tests/unit/backupHealthUiPrototype.test.js`
- `docs/testing/phase25m-backup-health-limited-default-off-ui-prototype.md`
- `docs/release/phase25m-backup-health-limited-default-off-ui-prototype-summary.md`
- `scripts/validate-phase25m-backup-health-limited-default-off-ui-prototype.js`

Modified files:
- `.github/workflows/e2e-smoke.yml` — Phase 25M validator registered as current-phase gate

No other files are modified.

## Default-off gate behavior

The UI view-model is disabled by default. Only an explicit test/default-off opt-in enables it.

```
isBackupHealthUiPrototypeEnabled(undefined)                              -> false
isBackupHealthUiPrototypeEnabled({})                                     -> false
isBackupHealthUiPrototypeEnabled({ enabled: false })                     -> false
isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'production' })  -> false
isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'live' })        -> false
isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'test' })        -> true
isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'default-off' }) -> true
```

When disabled, `createBackupHealthUiModel` returns a conservative hidden result:

```json
{
  "enabled": false,
  "visible": false,
  "stateId": "unknown",
  "source": "phase25m_disabled"
}
```

When enabled via test/default-off mode, it calls the Phase 25K integration prototype and returns a view model:

```json
{
  "enabled": true,
  "visible": true,
  "stateId": "recent_manual_backup",
  "tone": "calm",
  "titleVi": "Đã sao lưu gần đây",
  "bodyVi": "Bạn đã xuất bản sao lưu thủ công gần đây. Hãy tiếp tục duy trì thói quen này.",
  "actionLabelVi": "Xem hướng dẫn sao lưu",
  "source": "phase25k_integration_prototype"
}
```

## Read-only UI view-model boundary

The view model:
- is a pure, read-only mapping from integration state to display metadata
- does not write localStorage, IndexedDB, or any storage
- does not use Date.now() directly (time is injected through Phase 25K/25I options)
- does not call fetch, XMLHttpRequest, or any network API
- does not use navigator.sendBeacon, analytics, or telemetry
- does not import UI/router/storage/backup/export/restore modules
- does not contain JSX or React component exports
- returns plain objects only

## Phase 25K prototype import gate

The Phase 25M UI prototype imports the Phase 25K integration prototype only from the allowed path:

```js
import { ... } from './backupHealthIntegrationPrototype.js';
```

No UI/routes/settings/library/dashboard/backup/restore/entry-point file imports the Phase 25M view model.

The import gate is enforced by the Phase 25M validator and unit tests.

## No production UI proof

Phase 25M does not create any React/JSX components. There are no `.jsx`, `.tsx`, or component files in Phase 25M. The view model is a plain object factory, not a component.

No production entry point, route, navigation, settings, library, or dashboard module imports `backupHealthUiPrototype.js`.

The Phase 25M validator scans all `src/` files (excluding the prototype itself) and confirms none import the view model.

## No route/navigation/settings/library/dashboard proof

The view model result does not contain `/settings`, `/dashboard`, or `/library` strings.

Unit tests verify:
- `result.navigate === undefined`
- `result.render === undefined`
- `result.open === undefined`
- `JSON.stringify(result)` does not contain `/settings`, `/dashboard`, or `/library`

## No write proof

The view model:
- does not expose `write`, `persist`, `save`, `store`, or `export` methods on the result
- does not call `localStorage.setItem`, `IndexedDB`, or any write API internally
- does not modify backup files or state

Unit tests verify that no write methods appear on the result object.

## No backup/export/restore behavior change proof

Phase 25M does not modify:
- `src/state/backupHealthIntegrationPrototype.js`
- `src/state/backupHealthSignal.js`
- `src/state/backupHealthTestOnlyPrototype.js`
- Any backup, export, or restore module

The Phase 25M validator verifies that prior phase files are unchanged via git diff.

## Vietnamese-first copy review

All display copy is Vietnamese-first and calm.

Required copy tones by state:
- `recent_manual_backup` → `calm` — acknowledges recent backup without overclaiming
- `backup_may_be_stale` → `reminder` — gentle, non-alarmist reminder to re-export
- `restore_verified_test_data` → `limited-evidence` — states verification used test data only
- `status_unavailable` → `conservative` — neutral unavailability message
- `no_backup_recorded` → `conservative` — non-alarmist reminder to back up
- `unknown` → `conservative` — neutral unknown message

Forbidden copy verified absent (tested across all state inputs):
- "đảm bảo không mất dữ liệu" — no guaranteed data-loss prevention
- "tự động sao lưu" — no automatic backup
- "đã an toàn tuyệt đối" — no absolute safety claim
- "được bảo vệ trên mọi thiết bị" — no cross-device protection claim
- "khôi phục chắc chắn" — no guaranteed restore claim
- "đồng bộ đám mây" — no cloud sync claim
- "guaranteed data-loss prevention" — no English equivalent
- "automatic backup" — no English equivalent
- "cloud sync" — no English equivalent
- "account recovery" — no English equivalent

## Accessibility considerations

Phase 25M implements a view model only, not a rendered component. Accessibility concerns are deferred to Phase 25N.

Recommended considerations for Phase 25N:
- `titleVi` should map to a heading or aria-label
- `bodyVi` should be readable without color context
- `actionLabelVi` should map to a visible, focusable action
- Tone indicators (`calm`, `reminder`, `conservative`) must not rely on color alone

## Unit test evidence

Unit test file: `tests/unit/backupHealthUiPrototype.test.js`

Coverage includes:
- default disabled with undefined options
- default disabled with empty options
- disabled when enabled false
- enabled only for explicit test/default-off mode
- rejects unsupported production/live modes
- disabled path does not require signal input
- enabled path derives view model from Phase 25K integration prototype
- recent manual backup maps to calm Vietnamese copy
- stale backup maps to non-alarmist reminder copy
- generated/test restore verification maps to limited evidence copy
- real/user restore verification does not count as verified
- unavailable/error maps conservatively
- unknown/no-backup states map conservatively
- copy does not contain forbidden guarantee/automatic/cloud/account language
- does not mutate inputs or options
- does not use write APIs
- does not expose render/show/open/navigate methods
- does not expose route/href strings
- Vietnamese-first copy is non-empty for all enabled states

All tests pass: 1754 total.

## Validator evidence

Validator: `scripts/validate-phase25m-backup-health-limited-default-off-ui-prototype.js`

Checks:
- Required docs, source, test, validator files exist
- CI registers Phase 25M validator and fetch step
- CI does not run prior validators as merge-blocking steps
- Required status/scope/decision tokens in both docs
- Required guardrail statements in docs
- Manual evidence run pack token `PHASE25M_MANUAL_BROWSER_EVIDENCE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED` present
- Changed files are exact allowed files only (via git diff origin/main..HEAD)
- Post-merge main safe (empty diff on main passes; empty diff on non-main fails)
- No package/dependency changes
- No generated artifacts in changed files
- No telemetry/analytics strings added
- No sync/cloud/account/auth/backend files changed
- Production backup/export/restore files unchanged
- Storage drivers unchanged
- UI prototype imports Phase 25K integration prototype only from allowed path
- UI prototype does not use forbidden runtime APIs
- UI prototype does not contain JSX/React exports
- No src file (besides prototype itself) imports the view model
- Unit tests cover required patterns
- Docs do not claim production-visible UI, browser evidence, guaranteed data-loss prevention, broad backup reliability
- Prior Phase 25I/25J/25K/25L files are not modified

## Manual/browser evidence status

No browser/manual evidence claimed because no production-visible UI or browser/user-facing behavior is exposed.
Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.

## Manual/browser evidence run pack

```
PHASE25M_MANUAL_BROWSER_EVIDENCE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

This run pack is prepared for Phase 25N. It must not be claimed as executed in Phase 25M.

### Environment fields

| Field | Required value |
|---|---|
| Environment | Local dev browser only |
| Browser | Chrome/Chromium (latest stable) |
| Data | Generated/test fixture data only |
| Real learner data | MUST NOT be used |
| Phase gate | Phase 25M must be deployed with default-off flag |

### Manual smoke objective

Verify that when the Phase 25M UI view model is manually enabled via test/default-off mode in a test harness, it returns the expected view model shape without any production-visible UI appearing, any route/navigation change, any write to storage, or any backup/export/restore behavior change.

### Default-off verification

- [ ] Confirm `isBackupHealthUiPrototypeEnabled(undefined)` returns `false`
- [ ] Confirm `isBackupHealthUiPrototypeEnabled({})` returns `false`
- [ ] Confirm `createBackupHealthUiModel(null, undefined)` returns `{ enabled: false, visible: false, stateId: 'unknown', source: 'phase25m_disabled' }`
- [ ] Confirm no production UI appears when view model is disabled

### No-route/no-navigation verification

- [ ] Confirm the view model result does not contain `/settings`, `/dashboard`, or `/library`
- [ ] Confirm no navigation event fires when the view model is constructed
- [ ] Confirm no route change occurs when the view model is constructed

### No-write verification

- [ ] Confirm `localStorage` is not written during view model construction
- [ ] Confirm `IndexedDB` is not written during view model construction
- [ ] Confirm no backup file is created or modified

### No-backup/export/restore behavior change verification

- [ ] Confirm existing backup export produces identical output before and after Phase 25M
- [ ] Confirm existing restore flow is unaffected
- [ ] Confirm backup file format is unchanged

### Vietnamese copy review

For each state, verify the Vietnamese copy is:
- [ ] calm and non-alarmist for `recent_manual_backup`
- [ ] gentle reminder (not urgent) for `backup_may_be_stale`
- [ ] limited-evidence, not full-verification claim for `restore_verified_test_data`
- [ ] neutral/conservative for `status_unavailable`, `unknown`, `no_backup_recorded`
- [ ] free of: "đảm bảo", "tự động", "tuyệt đối", "mọi thiết bị", "chắc chắn", "đám mây"

### Accessibility quick check

- [ ] `titleVi` text is readable without relying on color
- [ ] `bodyVi` text is readable without relying on color
- [ ] `actionLabelVi` is a meaningful label (not "click here")
- [ ] Tone information (`calm`, `reminder`, `conservative`) is conveyed by text, not just color

### Failure/anomaly recording table

| # | Step | Expected | Observed | Pass/Fail |
|---|---|---|---|---|
| 1 | Default-off check | enabled: false | | |
| 2 | No-route check | no route strings | | |
| 3 | No-write check | no storage writes | | |
| 4 | Copy review — calm | tone: calm, no alarm | | |
| 5 | Copy review — reminder | gentle reminder copy | | |
| 6 | Accessibility quick check | readable without color | | |

### Pass/fail criteria

PASS if:
- All default-off checks return `false` for non-test/default-off modes
- View model construction produces no route/navigation side effects
- No storage writes occur
- Vietnamese copy is calm and non-alarmist for all states
- No forbidden phrases present

FAIL if:
- Any production UI appears unexpectedly
- Any route/navigation event fires
- Any write to localStorage, IndexedDB, or backup file occurs
- Any forbidden copy phrase is found

### Rollback/removal note

If any check fails during Phase 25N execution:
1. Remove `src/state/backupHealthUiPrototype.js`
2. Remove `tests/unit/backupHealthUiPrototype.test.js`
3. Revert `.github/workflows/e2e-smoke.yml` to Phase 25L state
4. No learner data cleanup is required

## Rollback/removal plan

Remove src/state/backupHealthUiPrototype.js.
Remove tests/unit/backupHealthUiPrototype.test.js.
Remove docs/testing/phase25m-backup-health-limited-default-off-ui-prototype.md.
Remove docs/release/phase25m-backup-health-limited-default-off-ui-prototype-summary.md.
Remove scripts/validate-phase25m-backup-health-limited-default-off-ui-prototype.js.
Remove Phase 25M CI registration.
No learner data migration or cleanup is required because Phase 25M does not migrate data or change backup/export/restore behavior.

## Known limitations

- The view model is not connected to any production UI entry point.
- The view model does not observe live backup signal changes.
- The `tone` field is informational only and does not drive UI color/icon selection in this phase.
- `actionLabelVi` is a label string only; no action handler is provided in this phase.
- Accessibility is not validated at the component level because no component is created.

## What Phase 25M can claim

- A limited, default-off, read-only UI view-model prototype has been implemented.
- The view model maps Phase 25K integration state to calm Vietnamese-first display copy.
- The view model is disabled by default and requires explicit test/default-off opt-in.
- Unit tests pass for all required coverage cases.
- The Phase 25M validator passes all static checks.
- A manual/browser evidence run pack is prepared for Phase 25N.

## What Phase 25M must not claim

- Phase 25M must not claim production-visible Backup Health UI is available.
- Phase 25M must not claim browser/manual evidence was executed.
- Phase 25M must not claim the backup health signal is reliable or covers all scenarios.
- Phase 25M must not claim production adapter-aware backup/export/restore.
- Phase 25M must not claim broad backup reliability or guaranteed data-loss prevention.
- Phase 25M must not claim BETA_READY.

## Next recommended phase

Next recommended phase: Phase 25N — Backup Health Manual Evidence and Phase 25 Closure Gate
Phase 25N is a separate evidence/closure gate and is not automatically approved.
Phase 25M does not approve production-visible Backup Health UI by default.
Phase 25M does not approve production adapter-aware backup/export/restore.
