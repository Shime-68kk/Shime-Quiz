# Beta Phase 16 Fake WebSocket Server QA

## Phase 15 Status

Phase 15 manual QA is carried forward as PASS.

## What Was Implemented

- Added a dev-only fake WebSocket server tool under `tools/deviceBridge`.
- Added pure helper exports for message parsing, classification, sensitive key detection, and response generation.
- Added focused unit tests that do not open a network port.
- Added manual QA documentation for testing the Real LAN / WS browser flow without hardware.

## Files Changed

- `tools/deviceBridge/fakeWebSocketServer.mjs`
- `tools/deviceBridge/README.md`
- `tests/unit/deviceBridgeFakeWebSocketServer.test.js`
- `docs/device-bridge-fake-websocket-server-qa.md`
- `docs/beta-phase-16-fake-websocket-server-qa.md`

## App Runtime Source Changed

No.

## UI Changed

No.

## StudyRoom Changed

No.

## ESP32 Firmware Added

No.

## package.json Changed

No.

## How To Run The Fake Server

```bash
node tools/deviceBridge/fakeWebSocketServer.mjs
```

Then connect the app manually to:

```text
ws://127.0.0.1:8787
```

## Manual QA Steps

See `docs/device-bridge-fake-websocket-server-qa.md`.

## Test Results

- `npm run build`: PASS.
  - Existing Vite chunk-size warning remains informational.
- `npm run test:unit`: PASS.
  - 86 test files passed.
  - 2882 tests passed.
- Focused fake server test: PASS.
  - 1 test file passed.
  - 8 tests passed.
- Focused WebSocket suite: PASS.
  - 3 test files passed.
  - 31 tests passed.

## Forbidden API Scan

PASS.

No matches were found for `localStorage`, `sessionStorage`, `indexedDB`, `fetch`, `XMLHttpRequest`, `MQTT`, `Bluetooth`, `Serial`, or `ESP32` in:

- `tools/deviceBridge`
- `src/deviceBridge`
- `src/components/settings/DeviceBridgeUiConcept.jsx`
- `src/routes/StudyRoom.jsx`

WebSocket protocol code appears in the existing isolated app transport and the dev-only fake server tool. No WebSocket code was added to StudyRoom or directly to the UI.

## Payload Privacy Scan

PASS.

The scan found only:

- Existing StudyRoom answer/scoring logic.
- The fake server forbidden-key detector list.

No new app runtime outgoing payload fields were added. The fake server rejects sensitive keys recursively and responds with a safe error instead of crashing.

## Risks

- This is a fake local QA tool, not ESP32 firmware.
- It validates protocol behavior but does not prove physical robot behavior.
- It logs payloads to console for QA, so testers must still verify no sensitive data appears.

## Recommendation

SAFE_FOR_PHASE_17_FAKE_SERVER_MANUAL_QA.
