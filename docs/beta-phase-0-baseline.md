# Beta Phase 0 Baseline

Date/time: 2026-06-26T23:06:30+07:00

## Scope

Phase 0 safety baseline before Device Bridge, UI integration, ESP32, WebSocket, MQTT, BLE, backend, cloud, or hardware work.

No runtime feature work was added for this baseline. No StudyRoom, scheduler, FSRS, review schedule, storage, import, backup, or learning data logic was modified.

## Valid Scripts Confirmed

From `package.json`:

- `npm run build`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run test:e2e:smoke`
- `npm run test:e2e:onboarding`
- `npm run validate:import`
- `npm run dev`
- `npm run preview`

Phase 0 executed only the required build and unit-test commands.

## Commands Run

1. `npm run build`
   - Result: PASS.
   - Note: Vite reported the existing chunk-size warning for a JS chunk larger than 500 kB.

2. `npm run test:unit`
   - Initial result: FAIL.
   - Failure: `tests/unit/deviceBridgeUiConcept.test.jsx` expected the raw source to contain `tuyet doi khong gui noi dung cau hoi, dap an` as one contiguous string.
   - Cause: the source text in `src/components/settings/DeviceBridgeUiConcept.jsx` wraps `khong gui` in a `<strong>` tag, so the privacy copy exists visually but not as one contiguous raw-source string.
   - Fix: test-only assertion changed from exact `toContain` to a regex that allows JSX markup between the same privacy-warning terms.

3. `npm run build`
   - Final result: PASS.
   - Note: same Vite chunk-size warning.

4. `npm run test:unit`
   - Final result: PASS.
   - Result detail: 69 test files passed, 2730 tests passed.

## Files Changed

- `tests/unit/dynamicCanvasThemeTokenPreviewPilot.test.jsx`
  - Previous Phase 0 mismatch fix: removed over-broad `data-theme` check that falsely matched `data-phase...` attributes.

- `tests/unit/deviceBridgeUiConcept.test.jsx`
  - Changed one privacy-warning assertion to tolerate JSX markup while checking the same warning content.

- `docs/beta-phase-0-baseline.md`
  - Added this baseline record.

## Previous Unit Failure Status

Fixed.

The earlier dynamic canvas theme token preview mismatch is fixed. The subsequent DeviceBridge UI concept static assertion mismatch is also fixed with a test-only change.

## Phase 1 Readiness

SAFE_FOR_PHASE_1.

Reason: required Phase 0 commands pass after narrow test-only fixes. Remaining build warning is a non-blocking Vite bundle-size warning and is not related to Device Bridge safety.
