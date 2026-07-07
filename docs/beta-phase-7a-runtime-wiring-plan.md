# Beta Phase 7A Runtime Wiring Plan

Baseline time: 2026-06-26T23:58:08+07:00

## What Was Inspected

Read-only inspection:

- `src/deviceBridge/deviceBridgeFacade.js`
- `src/deviceBridge/studyRoomBridgeAdapter.js`
- `src/deviceBridge/index.js`
- `src/components/settings/DeviceBridgeUiConcept.jsx`
- `src/routes/Settings.jsx`
- `src/routes/StudyRoom.jsx`

## Initial Git Status Summary

The working tree was already dirty before Phase 7A. Pre-existing dirty paths included:

- `.github/workflows/e2e-smoke.yml`
- `docs/planning/phase37f-limited-release-evidence-review-seed.md`
- `docs/release/phase37e-manual-readiness-evidence-collection-summary.md`
- `docs/testing/phase37e-manual-readiness-evidence-collection.md`
- `scripts/validate-phase37e-manual-readiness-evidence-collection.js`
- `src/components/learning/DashboardTodayCard.jsx`
- `src/components/study/StudyHistoryPanel.jsx`
- `src/components/study/StudyResultSummary.jsx`
- `src/design-system/tokens.css`
- `src/main.jsx`
- `src/routes/Dashboard.jsx`
- `src/routes/Library.jsx`
- `src/routes/Settings.jsx`
- `src/routes/StudyRoom.jsx`
- `src/styles/global.css`
- `src/ui/theme.js`
- `tests/unit/dynamicCanvasThemeTokenPreviewPilot.test.jsx`
- `dist/`
- prior beta docs under `docs/`
- `node_modules/`
- `src/components/settings/DeviceBridgeUiConcept.jsx`
- `src/components/settings/ThemeSettingsPanel.jsx`
- `src/deviceBridge/`
- `test-results/`
- Device Bridge unit tests
- `tests/unit/deviceBridgeUiConcept.test.jsx`

## Current Runtime Isolation Finding

The UI and StudyRoom are isolated today.

- `DeviceBridgeUiConcept.jsx` creates its own module-scope facade with `createDeviceBridgeFacade()`.
- `StudyRoom.jsx` creates its own adapter with `createStudyRoomBridgeAdapter()`.
- `createStudyRoomBridgeAdapter()` creates a separate facade when no facade is passed.
- UI enable/connect affects only the UI facade.
- StudyRoom emits into its own disabled adapter/facade.

Therefore, enabling the UI mock panel cannot make StudyRoom events appear in the UI debug log right now.

## Files Changed

- `docs/device-bridge-runtime-wiring-plan.md`
- `docs/beta-phase-7a-runtime-wiring-plan.md`

No runtime source files were changed.

## Commands Run

- `git status --short`
- Read-only inspection of the files listed above.
- `npm run build`
- `npm run test:unit`

## Build/Test Results

- Build: PASS. Vite reported the existing large chunk warning for `dist/assets/index-CykFraoU.js`; no build failure.
- Full unit suite: PASS, 77 files / 2796 tests.

## Recommendation

Recommended Phase 7B architecture: add a runtime-only shared facade module exposed through public `src/deviceBridge/index.js`.

Why:

- Smallest change that makes UI and StudyRoom share one mock runtime.
- No storage required.
- No network required.
- No real transport required.
- Keeps bridge disabled by default.
- Keeps UI imports public.
- Keeps StudyRoom using adapter methods.

Recommendation: `SAFE_FOR_PHASE_7B`.
