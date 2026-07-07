# Device Bridge Implementation Summary

This document summarizes the Device Bridge logic foundation through Phase 6. It is for future maintainers and future UI work.

## Phase Timeline

- Phase 0: baseline safety check. Build and unit tests passed before Device Bridge work.
- Phase 1: contract documentation only. Defined architecture, privacy rules, and event schema.
- Phase 2: mock-only runtime foundation. Added schema validation, mock transport, and disabled-by-default bridge runtime.
- Phase 3: privacy redaction and safe study event factories.
- Phase 4: UI-facing facade and UI contract helpers, still no UI.
- Phase 5A: StudyRoom integration plan only.
- Phase 5B: minimal StudyRoom event emission through a tiny adapter, with bridge still disabled by default.
- Phase 6: final logic handoff pack and safety audit.

## What Exists Now

Runtime modules:

- `src/deviceBridge/deviceEventSchema.js`
  - Defines `shime-device-event-v1`.
  - Defines event types.
  - Creates and validates event envelopes.
  - Calls the redaction policy to validate payload safety.
- `src/deviceBridge/redactionPolicy.js`
  - Defines allowed payload keys.
  - Defines forbidden sensitive keys.
  - Recursively rejects forbidden sensitive keys.
  - Strictly rejects unknown top-level payload fields.
- `src/deviceBridge/studyEventFactories.js`
  - Creates safe events for study/session bridge signals.
  - Calls `createDeviceEvent()` internally.
  - Returns safe success/failure objects.
- `src/deviceBridge/transports/MockTransport.js`
  - In-memory mock transport only.
  - No real network, hardware, storage, or browser transport APIs.
- `src/deviceBridge/DeviceBridge.js`
  - Disabled by default.
  - Enables/disables the mock bridge.
  - Sends only validated events.
  - Isolates listener failures.
- `src/deviceBridge/deviceBridgeFacade.js`
  - Framework-agnostic UI-facing facade.
  - Exposes snapshots and named study-event emission.
  - Does not accept raw event payloads.
- `src/deviceBridge/deviceBridgeUiContract.js`
  - Provides UI status constants, labels, and privacy warning copy.
- `src/deviceBridge/studyRoomBridgeAdapter.js`
  - Tiny adapter for StudyRoom.
  - Accepts only coarse StudyRoom fields.
  - Does not expose raw `emitStudyEvent()`.
  - Defaults disabled.
- `src/deviceBridge/index.js`
  - Public export barrel for future UI/facade consumers.

Tests:

- `tests/unit/deviceBridgeEventSchema.test.js`
- `tests/unit/deviceBridgeMockTransport.test.js`
- `tests/unit/deviceBridgeRuntime.test.js`
- `tests/unit/deviceBridgeRedactionPolicy.test.js`
- `tests/unit/deviceBridgeStudyEventFactories.test.js`
- `tests/unit/deviceBridgeFacade.test.js`
- `tests/unit/deviceBridgeUiContract.test.js`
- `tests/unit/deviceBridgeStudyRoomAdapter.test.js`

## Public API

Future UI should import from `src/deviceBridge/index.js`.

Preferred exports:

- `createDeviceBridgeFacade`
- `DEVICE_BRIDGE_UI_STATUSES`
- `DEVICE_BRIDGE_TRANSPORT_STATUSES`
- `DEVICE_BRIDGE_PRIVACY_MODE`
- `DEVICE_BRIDGE_TRANSPORT_KIND_MOCK`
- `getDeviceBridgeStatusLabel`
- `getDeviceBridgePrivacyWarning`

Facade methods:

- `getSnapshot()`
- `enable()`
- `disable()`
- `connectMock()`
- `disconnect()`
- `emitStudyEvent(factoryName, input)`
- `getDebugEvents()`
- `clearDebugEvents()`
- `subscribe(listener)`

Snapshot shape:

```js
{
  enabled: false,
  connected: false,
  bridgeStatus: 'disabled',
  transportStatus: 'none',
  eventCount: 0,
  lastEventType: null,
  lastError: null,
  privacyMode: 'redacted',
  transportKind: 'mock'
}
```

## Internal Modules

Future UI must not import:

- `src/deviceBridge/deviceEventSchema.js`
- `src/deviceBridge/redactionPolicy.js`
- `src/deviceBridge/studyEventFactories.js`
- `src/deviceBridge/transports/MockTransport.js`
- `src/deviceBridge/DeviceBridge.js`
- `src/deviceBridge/studyRoomBridgeAdapter.js`

Those files are implementation boundaries for validation, privacy, mock transport, and StudyRoom integration.

## StudyRoom Integration Points

`src/routes/StudyRoom.jsx` now imports only `createStudyRoomBridgeAdapter`.

Current emission points:

- `sessionStarted`: session reset/restore effect.
- `reviewDue`: session reset/restore effect when due-review mode is active.
- `questionPresented`: guarded current-item effect.
- `answerCorrect`: `checkCurrentAnswer()` when display-only correctness is `true`.
- `answerWrong`: `checkCurrentAnswer()` when display-only correctness is `false`.
- `sessionComplete`: `finishSession()` after summary creation.

Safety properties:

- The adapter is constructed with no options, so it is disabled by default.
- StudyRoom does not enable or connect the bridge.
- StudyRoom uses only coarse fields.
- StudyRoom catches and swallows bridge failures.
- StudyRoom does not pass raw item, prompt, answer, explanation, source metadata, history, schedule, settings, or backup payloads.

## What Still Does Not Exist

- No production UI.
- No persisted settings.
- No auto-enable.
- No auto-connect.
- No real transport.
- No WebSocket, MQTT, BLE, Web Serial, HTTP bridge, ESP32, backend, cloud, auth, sync, or AI API calls.
- No device pairing.
- No hardware command execution.
- No scheduler/FSRS behavior owned by Device Bridge.

## Known Risks

- StudyRoom imports the adapter path, so the main bundle grew. Future optimization can lazy-load Device Bridge UI/runtime if needed.
- Existing dirty UI concept files are present in the working tree, but they are not part of this audited runtime foundation.
- If future UI enables the mock bridge, restored sessions and React effects should get focused tests for duplicate event behavior.
- Any future persistence for bridge settings needs a separate reviewed storage boundary.
