# Phase 31C — Data Safety UX Prototype Evidence

## Status tokens

```text
PHASE31C_DATA_SAFETY_UX_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE
PHASE31C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31C_DATA_SAFETY_UX_PROTOTYPE_DECISION: PASS_TO_PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW
PHASE31C_PROTOTYPE_SCOPE: DEFAULT_OFF_UI_ONLY_NO_STORAGE_WRITES_NO_BACKUP_RESTORE_BEHAVIOR_CHANGES
PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 31C implements a small default-off Data Safety Center prototype as a settings panel section.

Scope is strictly limited to:
- Static/descriptive UI only.
- Default-off prototype flag.
- No storage writes.
- No backup/export/restore behavior changes.
- No backup file format changes.
- No restore overwrite behavior changes.
- No storage migration.
- No sync/cloud/account/auth/backend.
- No telemetry/analytics.
- No BYOC/WebDAV/P2P/device-transfer implementation.
- No BETA_READY.
- No public production readiness.

## Inputs from Phase 31B

From Phase 31B:
- Design gate doc: `docs/planning/phase31b-data-safety-ux-design-gate.md`
- UX spec: `docs/design/phase31b-data-safety-center-ux-spec.md`
- Release summary: `docs/release/phase31b-data-safety-ux-design-gate-summary.md`
- Phase 31C seed: `docs/planning/phase31c-data-safety-ux-prototype-seed.md`

Phase 31B decision:
```text
PHASE31B_DATA_SAFETY_UX_DESIGN_DECISION: PASS_TO_PHASE31C_DATA_SAFETY_UX_PROTOTYPE
```

Phase 31B selected Surface A (settings panel section) as primary prototype surface.

## Prototype summary

Phase 31C delivers:

1. `src/features/dataSafety/dataSafetyCenterPrototype.js` — pure function module with default-off flag, config normalizer, mount guard, and view model builder.
2. `src/features/dataSafety/DataSafetyCenterPrototype.jsx` — static/descriptive JSX component with all required sections; all action controls disabled/placeholder/inert.
3. `src/routes/Settings.jsx` (modified) — single mounting line behind `shouldShowDataSafetyCenterPrototype({})` guard, which returns false by default.
4. `tests/unit/dataSafetyCenterPrototype.test.js` — unit tests covering all required boundaries.
5. `scripts/validate-phase31c-data-safety-ux-prototype.js` — static validator.
6. This evidence doc, release summary, and Phase 31D seed.

## File ownership

New files created by Phase 31C:
- `src/features/dataSafety/dataSafetyCenterPrototype.js`
- `src/features/dataSafety/DataSafetyCenterPrototype.jsx`
- `tests/unit/dataSafetyCenterPrototype.test.js`
- `docs/testing/phase31c-data-safety-ux-prototype-evidence.md`
- `docs/release/phase31c-data-safety-ux-prototype-summary.md`
- `docs/planning/phase31d-data-safety-ux-evidence-review-seed.md`
- `scripts/validate-phase31c-data-safety-ux-prototype.js`

Modified files:
- `.github/workflows/e2e-smoke.yml` — Phase 31C validator registered; Phase 31B validator moved to comment.
- `src/routes/Settings.jsx` — one import + one conditional render added.

## Default-off behavior

The prototype is controlled by `shouldShowDataSafetyCenterPrototype(config)` in `dataSafetyCenterPrototype.js`.

- `DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED = false` — export constant is false.
- `shouldShowDataSafetyCenterPrototype({})` returns `false` — the production mount config is `{}` (empty), which has no `enabled: true`, so nothing renders.
- The prototype can only be enabled in tests/dev by passing `{ enabled: true, mode: 'test' }` or `{ enabled: true, mode: 'dev' }`.
- The prototype flag is not persisted to localStorage or IndexedDB.
- The prototype flag is not user-visible as a public setting.
- The prototype flag does not require backend/config fetch.

## UI sections implemented

All required sections are present in `DataSafetyCenterPrototype.jsx`:

| Section | data-testid |
|---|---|
| Readiness / status summary | `dsc-readiness-summary` |
| Local data explanation | `dsc-local-data` |
| Export backup placeholder | `dsc-export-backup` |
| Import preview placeholder | `dsc-import-preview` |
| Restore caution block | `dsc-restore-caution` |
| Backup reminder concept | `dsc-backup-reminder` |
| Browser / storage limitation | `dsc-browser-storage-limit` |
| Evidence gaps / beta limitations | `dsc-evidence-gaps` |
| Help / FAQ block | `dsc-help-faq` |

## Copy boundary review

Required copy boundaries verified in view model and component:

- Local-first / browser-local wording: PASS — all sections reference cục bộ (local) storage.
- No account required: PASS — `noAccountRequired: true` in view model.
- No cloud sync claim: PASS — `noCloudSync: true`; copy explicitly states "Không có đồng bộ đám mây".
- No automatic backup claim: PASS — `noAutomaticBackup: true`; copy explicitly states "Không có sao lưu tự động".
- No restore safety guarantee: PASS — `noRestoreSafetyGuarantee: true`; restore caution explicitly states no guarantee.
- No production readiness claim: PASS — evidence gaps section labels prototype as not production ready.
- No BETA_READY claim: PASS — `noBetaReadyClaim: true`; evidence gaps section states BETA_READY not approved.
- No real backup/export/restore behavior claim: PASS — all action controls are disabled/placeholder.
- No telemetry claim: PASS — `noTelemetryClaim: true`.
- No AI/OCR/API-key/BYOK claim: PASS — `noAiOcrApiKeyByokClaim: true`.

## Storage and network boundary review

Verified in unit tests (static source analysis):

- `dataSafetyCenterPrototype.js`: no localStorage, no sessionStorage, no IndexedDB, no fetch, no XMLHttpRequest, no WebSocket, no navigator.sendBeacon references.
- `DataSafetyCenterPrototype.jsx`: no localStorage, no IndexedDB, no fetch, no XMLHttpRequest references.
- No import of backup/restore/storage/sync/cloud/backend/account/auth modules.
- No click handler writes storage.
- No network calls.

## Rollback plan

Rollback removes:
- One new feature folder: `src/features/dataSafety/`
- Two import lines + one conditional render in `src/routes/Settings.jsx`
- Test file, docs, validator script, CI step

No storage migration is needed for rollback. No backup/export/restore code was modified. No route changes. No package/dependency changes. Data is not affected by removing the prototype.

## Test evidence

Unit tests in `tests/unit/dataSafetyCenterPrototype.test.js` cover:

- Default flag is OFF.
- Disabled config `{}` hides prototype.
- Enabled config `{ enabled: true, mode: 'test' }` shows prototype.
- Unknown/invalid config remains conservative (false).
- View model includes all required sections.
- Copy includes local-first and no-cloud/no-backend boundaries.
- Copy does not include BETA_READY/public production/safety guarantee claims.
- Placeholder actions are inert/disabled.
- No storage write APIs referenced in pure module source.
- Component source does not import backup/export/restore/storage/sync/cloud/backend modules.
- Default-off mounting behavior verifiable from pure function/config.

## Build evidence

Build run: `npm run build` — PASS (no TypeScript/JSX compilation errors).

Unit tests run: `npm run test:unit` — PASS (all tests pass including new Phase 31C tests).

Validator run: `node scripts/validate-phase31c-data-safety-ux-prototype.js` — PASS.

## Open limitations

- Manual browser evidence (rendering the prototype in a real browser with `{ enabled: true, mode: 'dev' }`) has not been collected in Phase 31C. Phase 31D is the separate evidence review gate.
- No real user testing has been conducted.
- The prototype is default-off and not visible in production.
- No evidence with real learner data.
- No restore rehearsal with real data.

## Chosen prototype decision

```text
PHASE31C_DATA_SAFETY_UX_PROTOTYPE_DECISION: PASS_TO_PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW
```

Rationale: Prototype is complete, default-off, covers all required sections, passes static/unit evidence, and meets all constraints. Proceeding to Phase 31D for a separately-gated evidence review.

## What Phase 31C supports

- A default-off static/descriptive Data Safety Center prototype in Settings.
- Pure function module with all required boundaries.
- Unit test coverage of default-off behavior and copy boundaries.
- Static validator for all Phase 31C constraints.
- Phase 31D seed prepared for a separate evidence review gate.

## What Phase 31C does not approve

Phase 31C does not approve BETA_READY.
Phase 31C does not approve public production readiness.
Phase 31C does not approve guaranteed data-loss prevention.
Phase 31C does not approve restore execution.
Phase 31C does not approve production restore rehearsal.
Phase 31C does not approve real learner data restore rehearsal.
Phase 31C does not approve runtime backup/export/restore behavior changes.
Phase 31C does not approve backup file format changes.
Phase 31C does not approve restore overwrite behavior changes.
Phase 31C does not approve storage migration.
Phase 31C does not approve sync/cloud/account/auth/backend.
Phase 31C does not approve telemetry/analytics.
Phase 31C does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31C does not approve BYOC/WebDAV/P2P/device-transfer implementation.

## Claim boundary

Phase 31C confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31C does not expand the claim boundary beyond what Phase 31B established.
No broad validation has been performed. No stress-tested readiness has been claimed.

## Next recommended phase

Next recommended phase: Phase 31D — Data Safety UX Evidence Review
Phase 31D is a separate evidence review gate and is not automatically approved.
