# Beta Phase 13 WebSocket Prototype

## What Was Implemented

- Added an isolated disabled-by-default `WebSocketTransport` prototype.
- Added WebSocket protocol v0 envelope helpers.
- Added local/LAN URL validation.
- Added fake-socket unit tests for connection lifecycle, protocol validation, and safety boundaries.

## What Was Intentionally Not Implemented

- No UI wiring.
- No StudyRoom wiring.
- No Device Bridge facade/runtime wiring.
- No public export from `src/deviceBridge/index.js`.
- No auto-connect.
- No URL persistence.
- No settings persistence.
- No firmware.
- No backend, cloud, account, auth, sync, or AI API.
- No MQTT, BLE, Serial, or other transport.

## Files Changed

- `src/deviceBridge/transports/WebSocketTransport.js`
- `tests/unit/deviceBridgeWebSocketTransport.test.js`
- `tests/unit/deviceBridgeWebSocketProtocol.test.js`
- `tests/unit/deviceBridgeWebSocketSafety.test.js`
- `docs/beta-phase-13-websocket-prototype.md`

## Runtime Source Changed

Yes. One isolated transport file was added under `src/deviceBridge/transports`.

## WebSocket Code Added

Yes. It is isolated to `src/deviceBridge/transports/WebSocketTransport.js` and related unit tests.

## App Wiring

Not wired into app runtime.

- UI: not wired.
- StudyRoom: not wired.
- Device Bridge facade: not wired.
- Public Device Bridge index: not exported.

## Auto-Connect

No. The constructor does not create a socket. A socket can be created only by calling `connect()`.

## URL Persistence

No. URL is accepted from constructor options or `connect({ url })`, validated, redacted for snapshots, and never persisted.

## Safety Model

- Accepts only `ws://` local/LAN URLs by default.
- Rejects `http://`, `https://`, non-local hosts, credentials, malformed URLs, and empty URLs.
- Sends `hello` only after explicit connect and socket open.
- Requires safe protocol messages.
- Validates Device Bridge events before serialization.
- Validates robot command names.
- Rejects sensitive keys recursively through existing Device Bridge privacy validation.
- Rate-limits outgoing messages.
- Handles malformed inbound messages without throwing.
- Does not modify StudyRoom, scoring, history, schedule, library, settings, import, backup, storage, or UI state.

## Test Results

- `npm run build`: PASS.
  - Existing Vite chunk-size warning remains informational.
- `npm run test:unit`: PASS.
  - 84 test files passed.
  - 2858 tests passed.
- Focused WebSocket suite: PASS.
  - 3 test files passed.
  - 31 tests passed.

## Forbidden API Scan Results

PASS.

No matches were found in runtime source scan for:

- `localStorage`
- `sessionStorage`
- `indexedDB`
- `fetch`
- `XMLHttpRequest`
- `MQTT`
- `Bluetooth`
- `Serial`
- `ESP32`

`WebSocket` appears only in the isolated transport prototype, focused WebSocket tests, and Phase 13 docs.

## Payload Privacy Results

PASS.

- `sendDeviceEvent(event)` validates existing Device Bridge events before serialization.
- `sendRobotCommand(command)` validates allowed robot command names.
- Sensitive payload keys are rejected recursively through existing Device Bridge privacy validation.
- `src/deviceBridge/transports/WebSocketTransport.js` does not contain raw quiz field names such as `prompt`, `question`, `correctAnswer`, `explanation`, `userAnswer`, `sourceMetadata`, `settings`, `studyHistory`, or `backupPayload`.

## Remaining Risks

- No real device QA yet.
- No browser UI gate yet.
- No physical safety testing yet.
- No URL entry UX yet.
- No real LAN handshake test yet.

## Recommendation

SAFE_FOR_PHASE_14_REAL_TRANSPORT_UI_GATE.

Reason: the prototype is isolated, disabled-by-default, not wired into UI/StudyRoom/facade, has no auto-connect or persistence, uses fake-socket tests only, and passed build, full unit tests, focused WebSocket tests, forbidden API scans, isolation checks, and payload privacy checks.
