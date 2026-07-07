# Beta Phase 19 ESP32 Serial Parser QA

## What Was Implemented

- Added safe newline-delimited USB Serial parser QA mode to ESP32 firmware.
- Added bounded serial line handling with `MAX_SERIAL_LINE_LENGTH`.
- Added accepted/rejected serial logs and response envelope printing.
- Routed accepted robot events and commands to existing log-only `ShimeRobotActions` stubs.
- Added serial parser QA fixtures and fake transcript tooling.
- Added unit tests for serial fixtures, fake serial transcript, and firmware safety boundaries.
- Added serial parser QA and manual QA documentation.

## Files Changed

- `firmware/esp32-shime-robot/src/main.cpp`
- `firmware/esp32-shime-robot/src/ShimeProtocol.cpp`
- `tools/deviceBridge/serialParserQaFixtures.mjs`
- `tools/deviceBridge/fakeSerialParserTranscript.mjs`
- `tools/deviceBridge/README.md`
- `tests/unit/deviceBridgeSerialParserQaFixtures.test.js`
- `tests/unit/deviceBridgeFakeSerialParserTranscript.test.js`
- `tests/unit/deviceBridgeFirmwareSafety.test.js`
- `docs/device-bridge-esp32-serial-parser-qa.md`
- `docs/device-bridge-esp32-serial-manual-qa.md`
- `docs/beta-phase-19-esp32-serial-parser-qa.md`

## Runtime Boundaries

- App runtime changed: no.
- UI changed: no.
- StudyRoom changed: no.
- Wi-Fi firmware added: no.
- WebSocket firmware added: no.
- Bluetooth/MQTT/HTTP firmware added: no.
- Robot motion enabled: no.
- `package.json` changed: no.

## Test Results

- `npx vitest run tests/unit/deviceBridgeSerialParserQaFixtures.test.js tests/unit/deviceBridgeFakeSerialParserTranscript.test.js tests/unit/deviceBridgeFirmwareSafety.test.js`: PASS, 3 files / 16 tests.
- `npx vitest run tests/unit/deviceBridgeRobotProtocolFixtures.test.js tests/unit/deviceBridgeWebSocketHardening.test.js`: PASS, 2 files / 16 tests.
- `npm run build`: PASS.
- `npm run test:unit`: PASS, 92 files / 2923 tests.
- `pio run -d firmware/esp32-shime-robot`: PASS.

## Safety Scan Results

- App runtime scan for `localStorage`, `sessionStorage`, `indexedDB`, `fetch`, `XMLHttpRequest`, `MQTT`, `Bluetooth`, `Serial`, and `ESP32`: PASS, no matches in `src/deviceBridge`, `src/components/settings/DeviceBridgeUiConcept.jsx`, or `src/routes/StudyRoom.jsx`.
- WebSocket isolation scan: PASS. `globalThis.WebSocket` remains isolated to `src/deviceBridge/transports/WebSocketTransport.js`; UI and StudyRoom do not import transport internals.
- Firmware broad scan: PASS with allowed disabled-only mentions in comments, docs, and boot logs.
- Firmware active behavior scan for `WiFi.begin`, WebSocket server/client libraries, MQTT/HTTP clients, pin writes, PWM, servo attach/write, and tone: PASS, no matches.
- Payload privacy scan: PASS. Valid serial fixtures contain no forbidden sensitive JSON property keys; invalid sensitive fixtures intentionally contain `"question":`, `"answer":`, and nested `"correctAnswer":` to prove rejection.

## Manual QA Instructions

Follow `docs/device-bridge-esp32-serial-manual-qa.md`. Use sample messages from `tools/deviceBridge/serialParserQaFixtures.mjs` and compare output with `node tools/deviceBridge/fakeSerialParserTranscript.mjs`.

## Remaining Risks

- Hardware flash/manual serial QA has not been performed yet.
- The parser remains a conservative skeleton parser, not a production JSON parser.
- The response timestamp remains a static valid placeholder until a later clock/time phase.

## Recommendation

SAFE_FOR_PHASE_20_ESP32_SERIAL_HARDWARE_QA.
