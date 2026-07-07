# Beta Phase 4 UI API Contract Baseline

Baseline time: 2026-06-26T23:29:28+07:00

## What Was Implemented

- Added `src/deviceBridge/deviceBridgeFacade.js`.
  - Provides a framework-agnostic UI-facing facade.
  - Keeps Device Bridge default disabled.
  - Exposes `getSnapshot()`, `enable()`, `disable()`, `connectMock()`, `disconnect()`, `emitStudyEvent()`, debug event helpers, and `subscribe()`.
  - Allows event emission only through named Phase 3 study event factories.
  - Rejects unknown factory names safely.
  - Keeps listener errors isolated.
  - Uses only the existing mock transport path.
- Added `src/deviceBridge/deviceBridgeUiContract.js`.
  - Defines UI status constants.
  - Defines transport status constants.
  - Defines redacted privacy mode and mock transport kind constants.
  - Provides status labels and privacy warning copy.
- Updated `src/deviceBridge/index.js` to export the facade and UI contract helpers.
- Added focused unit tests for the facade and UI contract.
- Added `docs/device-bridge-ui-contract.md` for future UI developers.

## What Was Intentionally Not Implemented

- No UI.
- No React components.
- No routes.
- No StudyRoom integration.
- No settings storage.
- No localStorage usage.
- No real transport.
- No WebSocket, MQTT, BLE, Web Serial, HTTP bridge calls, backend, cloud, auth, or AI API calls.
- No ESP32 or robot integration.
- No scheduler, FSRS, review schedule, study history, storage, import, backup, learning-data, EduGen, or service changes.

## Files Changed

- `src/deviceBridge/deviceBridgeFacade.js`
- `src/deviceBridge/deviceBridgeUiContract.js`
- `src/deviceBridge/index.js`
- `tests/unit/deviceBridgeFacade.test.js`
- `tests/unit/deviceBridgeUiContract.test.js`
- `docs/device-bridge-ui-contract.md`
- `docs/beta-phase-4-ui-api-contract.md`

## Commands Run

- `npx vitest run tests/unit/deviceBridgeFacade.test.js tests/unit/deviceBridgeUiContract.test.js`
- `npx vitest run tests/unit/deviceBridgeEventSchema.test.js tests/unit/deviceBridgeMockTransport.test.js tests/unit/deviceBridgeRuntime.test.js tests/unit/deviceBridgeRedactionPolicy.test.js tests/unit/deviceBridgeStudyEventFactories.test.js tests/unit/deviceBridgeFacade.test.js tests/unit/deviceBridgeUiContract.test.js`
- `npm run build`
- `npm run test:unit`

## Test Results

- Targeted Phase 4 tests: PASS, 2 files / 17 tests.
- Full Device Bridge tests: PASS, 7 files / 54 tests.
- Build: PASS. Vite reported the existing large chunk warning for `dist/assets/index-9byO3eFa.js`; no build failure.
- Full unit suite: PASS, 76 files / 2784 tests.

## Phase Boundary Clarification

Earlier planning docs described Phase 3 as UI mock integration. The actual completed sequence is:

- Phase 3: privacy redaction and safe event factories.
- Phase 4: UI-facing API contract with no UI.
- Phase 5: may introduce tightly scoped UI consumption of the facade, if approved.

## Phase 5 Readiness

Phase 5 is safe only if it consumes `createDeviceBridgeFacade()` and does not import bridge internals. Any future UI must remain default-off, mock-only unless separately approved, and must not pass raw study item content into `emitStudyEvent()`.

Recommendation: `SAFE_FOR_PHASE_5`.
