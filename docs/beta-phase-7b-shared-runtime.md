# Beta Phase 7B Shared Runtime

Baseline time: 2026-06-27T00:48:39+07:00

## What Was Implemented

- Added `src/deviceBridge/deviceBridgeRuntime.js`.
  - Exports `getSharedDeviceBridgeFacade()`.
  - Exports `resetSharedDeviceBridgeFacadeForTests()`.
  - Lazily creates one shared facade with `createDeviceBridgeFacade()`.
  - Defaults disabled and disconnected.
  - Does not enable, connect, persist, or talk to network/device APIs.
- Updated `src/deviceBridge/index.js`.
  - Exports the shared runtime helpers through the public barrel.
- Updated `src/components/settings/DeviceBridgeUiConcept.jsx`.
  - Replaced the local `createDeviceBridgeFacade()` instance with `getSharedDeviceBridgeFacade()`.
  - Continues importing only from `src/deviceBridge/index.js`.
  - Still does not call `emitStudyEvent()`.
  - Still does not create demo event payloads.
- Updated `src/deviceBridge/studyRoomBridgeAdapter.js`.
  - Default adapter construction now uses the shared facade.
  - Explicit test options still create isolated facades so existing adapter tests do not leak state.
  - Injected `options.facade` remains supported.
- Added `tests/unit/deviceBridgeRuntimeShared.test.js`.
  - Covers shared instance behavior, reset behavior, disabled default, no auto-connect, adapter emission through shared facade, disabled safe failure, sensitive input rejection, and source scans.
- Updated `tests/unit/deviceBridgeUiConcept.test.jsx`.
  - Verifies the UI uses `getSharedDeviceBridgeFacade()`.
  - Verifies the UI still does not use `createDeviceBridgeFacade()` or `emitStudyEvent()`.

## Files Changed

- `src/deviceBridge/deviceBridgeRuntime.js`
- `src/deviceBridge/index.js`
- `src/deviceBridge/studyRoomBridgeAdapter.js`
- `src/components/settings/DeviceBridgeUiConcept.jsx`
- `tests/unit/deviceBridgeRuntimeShared.test.js`
- `tests/unit/deviceBridgeUiConcept.test.jsx`
- `docs/beta-phase-7b-shared-runtime.md`

## Why This Is Runtime-Only

The shared facade is an in-memory module-level runtime. It is recreated on page load and can be reset in tests.

It does not use:

- `localStorage`
- `sessionStorage`
- `indexedDB`
- settings persistence
- backend/cloud/auth
- network APIs
- hardware APIs
- real transports

## Disabled By Default

`getSharedDeviceBridgeFacade()` lazily creates `createDeviceBridgeFacade()` with no options. The facade therefore starts disabled and disconnected.

The UI may manually call:

- `enable()`
- `disable()`
- `connectMock()`
- `disconnect()`
- `clearDebugEvents()`

There is no auto-enable and no auto-connect.

## What Was Intentionally Not Implemented

- No real ESP32 integration.
- No real transport.
- No WebSocket, MQTT, BLE, Web Serial, HTTP bridge, backend, cloud, auth, sync, or AI API calls.
- No settings persistence.
- No storage changes.
- No scheduler, FSRS, review schedule, study history, import, export, backup, learning-data, EduGen, or service changes.
- No new StudyRoom payload fields.
- No raw prompt/question/answer/explanation/userAnswer/sourceMetadata payloads.

## Commands Run

- `npx vitest run tests/unit/deviceBridgeRuntimeShared.test.js`
- `npx vitest run tests/unit/deviceBridgeStudyRoomAdapter.test.js tests/unit/deviceBridgeUiConcept.test.jsx tests/unit/deviceBridgeRuntimeShared.test.js`
- `rg -n "localStorage|sessionStorage|indexedDB|fetch\\s*\\(|XMLHttpRequest|WebSocket|Bluetooth|bluetooth|Serial|serial|MQTT|mqtt|ESP32|esp32" src/deviceBridge src/components/settings/DeviceBridgeUiConcept.jsx src/routes/StudyRoom.jsx`
- `npm run build`
- `npm run test:unit`

## Test Results

- Shared runtime test: PASS, 1 file / 9 tests.
- Adapter/UI/shared runtime subset: PASS, 3 files / 29 tests.
- Forbidden API scan: PASS, no matches.
- Build: PASS. Vite reported the existing large chunk warning for `dist/assets/index-C4yk0VrR.js`; no build failure.
- Full unit suite: PASS, 78 files / 2805 tests.

## Risk Notes

- The shared runtime is a module singleton. Unit tests must use `resetSharedDeviceBridgeFacadeForTests()` when they depend on a clean state.
- UI enable/connect now affects the facade used by the default StudyRoom adapter. This is intended for mock-only runtime visibility, but it means future tests should explicitly reset shared runtime state.
- Debug events remain redacted by existing factories/redaction policy, but UI should continue displaying only event type and redacted payload.

## Recommendation

`SAFE_FOR_PHASE_8`.
