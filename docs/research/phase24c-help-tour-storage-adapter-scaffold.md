# Phase 24C — Help Tour StorageAdapter Scaffold

## Status token

PHASE24C_HELP_TOUR_STORAGE_ADAPTER_SCAFFOLD_STATUS: COMPLETED_LOW_RISK_RUNTIME_SCAFFOLD

PHASE24B_STORAGE_ADAPTER_BOUNDARY_DECISION: PASS_TO_PHASE24C_LOW_RISK_SCAFFOLD_PLANNING_WITH_RUNTIME_GATES

## Scope

Phase 24C implements one low-risk Help Tour completion flag StorageAdapter scaffold.
Phase 24C does not change the default storage driver.
Phase 24C does not migrate data.
Phase 24C does not implement IndexedDB.
Phase 24C does not touch backup/export/restore runtime.
Phase 24C does not make backup/export/restore adapter-aware.
Phase 24C does not change learner data persistence.
Phase 24C does not change scheduler or FSRS runtime behavior.
Phase 24C does not add sync, cloud, account, auth, or backend behavior.
Phase 24C does not make Shime BETA_READY.

## Inputs

Phase 24A completed the residual direct-storage audit.
Phase 24B selected a narrow low-risk runtime scaffold path and required Phase 24C to choose exactly one isolated storage boundary with runtime gates.

## Selected low-risk boundary

The selected boundary is Help Tour completion persistence for the unchanged `shime_tour_done` key in `src/ui/helpTour.js`.

This boundary was selected because it is a non-core UI preference flag, does not own learner content, is isolated from quiz data and review scheduling, and can be tested with an in-memory StorageAdapter override.

## Implementation summary

`src/ui/helpTourStorage.js` owns the Help Tour completion key and exposes `readHelpTourDone()`, `markHelpTourDone()`, and `clearHelpTourDoneForTests()` through the active StorageAdapter.

`src/ui/helpTour.js` now calls the helper instead of directly reading or writing `localStorage` for the Help Tour completion flag. The production default remains LocalStorageAdapter, the key remains `shime_tour_done`, and no data migration was performed.

## Files changed

- `src/ui/helpTourStorage.js`
- `src/ui/helpTour.js`
- `tests/unit/helpTourStorageAdapterScaffold.test.js`
- `docs/research/phase24c-help-tour-storage-adapter-scaffold.md`
- `docs/release/phase24c-help-tour-storage-adapter-scaffold-summary.md`
- `scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`
- `.github/workflows/e2e-smoke.yml`

## Rollback plan

Revert src/ui/helpTour.js to direct Help Tour completion flag persistence.
Remove src/ui/helpTourStorage.js.
Remove tests/unit/helpTourStorageAdapterScaffold.test.js.
Keep the storage key shime_tour_done unchanged during rollback.
No learner data migration or cleanup is required because the same key and default LocalStorageAdapter are used.

## Evidence plan

Unit test the helper with an in-memory StorageAdapter.
Run Phase 24B validator.
Run Phase 24C validator.
Run full scripts/validate-*.js chain.
Run npm ci.
Run npm run build.
Run npm run test:unit.
Optional local browser smoke: Help Tour can be dismissed and does not re-open after reload with the same local storage.

## Validation results

Validation is recorded in the Phase 24C handoff artifact after local execution of the targeted unit test, Phase 24B validator, Phase 24C validator, full validator chain, npm ci, build, and full unit suite.

## What Phase 24C can claim

- One low-risk Help Tour completion flag now uses the active StorageAdapter.
- The production default remains LocalStorageAdapter.
- The shime_tour_done key remains unchanged.
- No data migration was performed.
- Backup/export/restore remains gated.

## What Phase 24C must not claim

- BETA_READY
- local-first hybrid beta ready
- production IndexedDB storage exists
- StorageAdapter expansion broadly implemented
- storage migration complete
- backup/export adapter-aware
- restore adapter-aware
- sync exists
- cloud sync exists
- account/auth/backend exists
- production sync ready
- guaranteed data-loss prevention
- platform backup will preserve user data
- built-in AI
- AI quiz generation
- OCR
- external AI/API integration
- beta-ai public naming acceptable
- Phase 24D through 24F are automatically approved
- runtime storage changes are broadly approved
- IndexedDB pilot is approved
- backup/restore adapter-awareness runtime work is approved

## Guardrails

Backup/export/restore, IndexedDB, migration, scheduler/FSRS, import behavior, theme persistence, Study Room drafts, library data, learner data persistence, service worker behavior, dependencies, telemetry, analytics, sync, cloud, account, auth, and backend behavior are untouched.

## Next recommended phase

Next recommended phase: Phase 24D — Backup/Export/Restore Adapter-Awareness Design Gate

Phase 24D is a separate design gate.
Phase 24C does not approve adapter-aware backup/export/restore runtime work.
