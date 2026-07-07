# Beta Phase 5A StudyRoom Plan

Baseline time: 2026-06-26, Asia/Ho_Chi_Minh.

## What Was Inspected

- `git status --short`
- `src/routes/StudyRoom.jsx`
- Existing Device Bridge phase outputs were considered only through the public contract already documented in earlier phases.

## Initial Git Status Summary

The working tree was already dirty before Phase 5A. Pre-existing dirty paths included:

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
- existing Device Bridge unit tests
- `tests/unit/deviceBridgeUiConcept.test.jsx`

`src/routes/StudyRoom.jsx` was dirty before this phase and was not modified.

## What Was Changed

Documentation only:

- Added `docs/device-bridge-studyroom-integration-plan.md`.
- Added `docs/beta-phase-5a-studyroom-plan.md`.

No runtime source files, tests, package scripts, UI files, StudyRoom files, scheduler/storage/import/backup/FSRS files, or Device Bridge source files were modified.

## Files Changed

- `docs/device-bridge-studyroom-integration-plan.md`
- `docs/beta-phase-5a-studyroom-plan.md`

## Commands Run

- `git status --short`
- Read-only inspection of `src/routes/StudyRoom.jsx` with line numbers.
- `npm run build`
- `npm run test:unit`

## Proposed Phase 5B Files

- `src/deviceBridge/studyRoomBridgeAdapter.js`
- `tests/unit/deviceBridgeStudyRoomAdapter.test.js`
- `src/routes/StudyRoom.jsx`
- optionally `docs/beta-phase-5b-studyroom-integration.md`

## Proposed StudyRoom Attachment Points

- `session_started`: session reset/restore effect around `src/routes/StudyRoom.jsx` lines 294-349.
- `question_presented`: new guarded effect based on current item derivation around lines 220-228, avoiding direct calls in every navigation path.
- `answer_correct`: `checkCurrentAnswer()` around lines 413-419 when `isDisplayOnlyAnswerCorrect()` returns `true`.
- `answer_wrong`: `checkCurrentAnswer()` around lines 413-419 when `isDisplayOnlyAnswerCorrect()` returns `false`.
- `review_due`: session lifecycle effect when `isDueReviewMode && items.length > 0`, using bucketed `items.length`.
- `session_complete`: `finishSession()` around lines 543-620 after duplicate guard and summary creation.
- `bridge_error`: future adapter failure wrapper, not StudyRoom learning logic.

## Phase 5B Safety

Phase 5B is safe if it:

- Uses a tiny `studyRoomBridgeAdapter`.
- Emits only through `deviceBridgeFacade.emitStudyEvent()`.
- Keeps Device Bridge default-off and mock-only.
- Does not add UI or storage.
- Does not pass raw `currentItem`, answers, choices, source metadata, history records, review schedule records, backup data, or settings data.
- Treats bridge failures as non-fatal.

## Test Results

- Build: PASS. Vite reported the existing large chunk warning for `dist/assets/index-9byO3eFa.js`; no build failure.
- Full unit suite: PASS, 76 files / 2784 tests.

## Recommendation

`SAFE_FOR_PHASE_5B`.
