# Beta Phase 14 Real Transport UI Gate

## What Was Implemented

- Added facade-level real LAN transport mode selection.
- Added explicit real LAN connect/disconnect methods behind the facade.
- Wired the isolated WebSocket transport prototype into the facade layer only.
- Added a Settings Device Bridge UI gate for Real LAN / WS mode.
- Added URL entry for a local `ws://` target.
- Added clear privacy and local-network warning copy.
- Added focused facade/UI gate tests.

## Files Changed

- `src/deviceBridge/deviceBridgeFacade.js`
- `src/deviceBridge/index.js`
- `src/deviceBridge/transports/WebSocketTransport.js`
- `src/components/settings/DeviceBridgeUiConcept.jsx`
- `tests/unit/deviceBridgeFacade.test.js`
- `tests/unit/deviceBridgeRealTransportUiGate.test.jsx`
- `tests/unit/deviceBridgeWebSocketSafety.test.js`
- `docs/beta-phase-14-real-transport-ui-gate.md`

## Real WebSocket Manual Connect

Real LAN can now be manually selected in the Device Bridge panel and manually connected through the facade. It still requires:

- Device Bridge enabled by user action.
- Real LAN / WS mode selected by user action.
- URL typed by user.
- Explicit connect button click.

## Auto-Connect

No auto-connect exists.

## URL Persistence

No URL persistence exists.

## StudyRoom

StudyRoom was not modified in this phase.

## UI Import Boundary

The UI imports Device Bridge only from `src/deviceBridge/index.js`. It does not import `WebSocketTransport` directly.

## Mock Compatibility

Mock mode remains available and continues to use the existing mock connect/debug flow.

## Safety Warnings Added

The UI warns that Real LAN is:

- Local network only.
- Trusted-device only.
- Accessory-only.
- Redacted/coarse data only.
- Not for prompts, answers, explanations, user answers, source data, history, settings, or backups.

## Test Results

- `npm run build`: PASS.
  - Existing Vite chunk-size warning remains informational.
- `npm run test:unit`: PASS.
  - 85 test files passed.
  - 2874 tests passed.
- Focused WebSocket suite: PASS.
  - 3 test files passed.
  - 31 tests passed.
- Focused real transport UI gate suite: PASS.
  - 2 test files passed.
  - 29 tests passed.

## Forbidden API Scan Result

PASS.

No matches were found in the requested runtime/UI/StudyRoom scan for:

- `localStorage`
- `sessionStorage`
- `indexedDB`
- `fetch`
- `XMLHttpRequest`
- `MQTT`
- `Bluetooth`
- `Serial`
- `ESP32`

## WebSocket Isolation Result

PASS.

- Raw socket construction remains isolated to `src/deviceBridge/transports/WebSocketTransport.js`.
- UI does not import `WebSocketTransport` directly.
- StudyRoom does not import or reference `WebSocketTransport`.
- `src/deviceBridge/index.js` does not export `WebSocketTransport`.
- Facade imports the transport for the explicit real LAN gate only.

## Payload Privacy Result

PASS.

- StudyRoom bridge emissions still pass only `sessionId`, progress counts, total counts, item index/type, due bucket, score bucket, and accuracy bucket.
- `WebSocketTransport.js` contains no sensitive field names such as prompt, answer, correct answer, explanation, user answer, source metadata, settings, study history, or backup payload.
- UI does not create raw event payloads or call `emitStudyEvent`.

## Risks

- No physical ESP32 manual QA yet.
- No real LAN browser/device handshake has been manually verified.
- UI now exposes a manual connection path, so Phase 15 must test invalid URLs, offline devices, disconnects, and privacy copy in the browser.

## Manual QA Instructions For Phase 14

1. Open Settings.
2. Confirm Device Bridge starts disabled.
3. Enable Device Bridge.
4. Confirm Mock mode still works.
5. Select Real LAN / WS mode.
6. Confirm selecting the mode does not connect.
7. Type an invalid URL and click connect; confirm safe error.
8. Type a non-local URL and click connect; confirm rejection.
9. Type a local `ws://` URL for a test device or fake LAN endpoint.
10. Click connect explicitly.
11. Confirm no URL is saved after reload.
12. Confirm StudyRoom still works if the real transport is disconnected/error.
13. Confirm debug payloads remain redacted/coarse.

## Recommendation

SAFE_FOR_PHASE_15_REAL_LAN_MANUAL_QA.
