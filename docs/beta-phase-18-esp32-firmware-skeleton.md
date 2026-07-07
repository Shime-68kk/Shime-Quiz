# Beta Phase 18 ESP32 Firmware Skeleton

## What Was Done

- Added Phase 17 retry result documentation.
- Added passive ESP32 firmware skeleton.
- Added robot action map and safety docs.
- Added ESP32 staged bring-up plan and hardware QA checklist.
- Added protocol fixtures and fake robot transcript tool.
- Added protocol fixture, transcript, and hardening tests.
- Phase 18.5 fix: updated the ESP32 skeleton parser to detect forbidden JSON property names instead of raw substrings, so allowed event names like `question_presented`, `answer_correct`, and `answer_wrong` are not falsely rejected.
- Phase 18.5 fix: added `messageId` and `emittedAt` fields to skeleton response envelopes. The emitted timestamp is a static valid placeholder because the skeleton has no clock synchronization.

## Files Changed

- `firmware/esp32-shime-robot/README.md`
- `firmware/esp32-shime-robot/protocol.md`
- `firmware/esp32-shime-robot/platformio.ini`
- `firmware/esp32-shime-robot/src/main.cpp`
- `firmware/esp32-shime-robot/include/ShimeProtocol.h`
- `firmware/esp32-shime-robot/src/ShimeProtocol.cpp`
- `firmware/esp32-shime-robot/include/ShimeRobotActions.h`
- `firmware/esp32-shime-robot/src/ShimeRobotActions.cpp`
- `tools/deviceBridge/protocolFixtures.mjs`
- `tools/deviceBridge/fakeRobotTranscript.mjs`
- `tools/deviceBridge/README.md`
- `tests/unit/deviceBridgeRobotProtocolFixtures.test.js`
- `tests/unit/deviceBridgeFakeRobotTranscript.test.js`
- `tests/unit/deviceBridgeWebSocketHardening.test.js`
- `docs/device-bridge-phase-17-manual-qa-result.md`
- `docs/device-bridge-esp32-bringup-plan.md`
- `docs/device-bridge-robot-action-map.md`
- `docs/device-bridge-esp32-safety-limits.md`
- `docs/device-bridge-hardware-qa-checklist.md`
- `docs/beta-phase-18-esp32-firmware-skeleton.md`

## App Runtime Source Changed

No.

## UI Changed

No.

## StudyRoom Changed

No.

## Firmware Skeleton Added

Yes.

## Hardware Required

No.

## Robot Motion Enabled

No.

## package.json Changed

No.

## URL Persistence

No.

## Auto-Connect

No.

## Test Results

- `npx vitest run tests/unit/deviceBridgeRobotProtocolFixtures.test.js tests/unit/deviceBridgeFakeRobotTranscript.test.js tests/unit/deviceBridgeWebSocketHardening.test.js`: PASS, 3 files / 16 tests.
- `npx vitest run tests/unit/deviceBridgeFakeWebSocketServer.test.js tests/unit/deviceBridgeWebSocketTransport.test.js tests/unit/deviceBridgeWebSocketProtocol.test.js tests/unit/deviceBridgeWebSocketSafety.test.js`: PASS, 4 files / 40 tests.
- `npx vitest run tests/unit/deviceBridgeRealTransportUiGate.test.jsx tests/unit/deviceBridgeUiConcept.test.jsx`: PASS, 2 files / 33 tests.
- `npm run build`: PASS.
- `npm run test:unit`: PASS, 89 files / 2907 tests.
- Phase 18.5 focused parser tests, `npx vitest run tests/unit/deviceBridgeRobotProtocolFixtures.test.js tests/unit/deviceBridgeWebSocketHardening.test.js`: PASS, 2 files / 16 tests.
- Phase 18.5 optional firmware compile, `pio run -d firmware/esp32-shime-robot`: PASS.

## Safety Scan Results

- App runtime scan for `localStorage`, `sessionStorage`, `indexedDB`, `fetch`, `XMLHttpRequest`, `MQTT`, `Bluetooth`, `Serial`, and `ESP32`: PASS, no matches in `src/deviceBridge`, `src/components/settings/DeviceBridgeUiConcept.jsx`, or `src/routes/StudyRoom.jsx`.
- WebSocket isolation scan: PASS. WebSocket transport references remain in `src/deviceBridge/transports/WebSocketTransport.js` and facade wiring only; StudyRoom and UI do not import transport internals.
- Firmware no-motion scan: PASS. The skeleton does not call pin, PWM, servo, tone, or actuator write APIs.

## Payload Privacy Result

- PASS. Protocol fixtures and fake transcript contain only redacted/coarse protocol fields.
- Sensitive-field matches are intentional guard lists, tests, docs, fixture rejection cases, firmware rejection tokens, or existing StudyRoom learning logic. No new Phase 18 app runtime path sends raw quiz content.
- PASS. Firmware-sensitive key detection now looks for JSON property names such as `"question":`, `"answer":`, and `"correctAnswer":`, including nested properties, without rejecting allowed event name values.

## Remaining Risks

- Firmware is a skeleton and has not been compiled or flashed.
- Serial parser QA still needs human execution.
- No physical safety has been verified on hardware.
- The firmware parser is deliberately simple and property-name based for skeleton QA; it is not a production JSON parser.
- Response envelopes are structurally app-compatible, but the skeleton uses a static emitted timestamp because there is no firmware clock setup yet. Treat Phase 19 as serial parser QA, not full app-compatible WebSocket hardware QA.

## Recommendation

SAFE_FOR_PHASE_19_ESP32_SERIAL_PARSER_QA.
