# Beta Phase 23 Dev-Only Companion Tap

## What Was Implemented

- Added dev-only Companion Tap contract.
- Added disabled-by-default in-memory tap core.
- Added dependency-injected runtime adapter for fake/dev facade subscription.
- Added dev tap privacy, runtime, Device Bridge factory integration, and core behavior tests.
- Added dev tap documentation and manual QA checklist.

## Files Changed

- `src/companion/companionDevTapContract.js`
- `src/companion/companionDevTap.js`
- `src/companion/companionDevTapRuntime.js`
- `src/companion/index.js`
- `tests/unit/companionDevTap.test.js`
- `tests/unit/companionDevTapRuntime.test.js`
- `tests/unit/companionDevTapPrivacy.test.js`
- `tests/unit/companionDevTapDeviceBridgeIntegration.test.js`
- `docs/cognitive-companion-dev-tap.md`
- `docs/cognitive-companion-dev-tap-manual-qa.md`
- `docs/beta-phase-23-dev-only-companion-tap.md`

## Boundary Results

- App runtime wired: no.
- StudyRoom changed: no.
- UI changed: no.
- DeviceBridge runtime changed: no.
- ESP32 firmware changed: no.
- External robot project changed: no.
- AI API added: no.
- Storage/network added: no.
- Robot command sending added: no.
- Dev tap disabled by default: yes.
- Dev tap auto-subscribes: no.

## Test Results

- `npx vitest run tests/unit/companionDevTap.test.js tests/unit/companionDevTapRuntime.test.js tests/unit/companionDevTapPrivacy.test.js tests/unit/companionDevTapDeviceBridgeIntegration.test.js`: PASS, 4 files / 15 tests.
- `npx vitest run tests/unit/companionBridgePipeline.test.js tests/unit/companionEndToEndPrivacy.test.js tests/unit/companionEndToEndRegression.test.js`: PASS, 3 files / 10 tests.
- `npx vitest run tests/unit/deviceBridgeSerialParserQaFixtures.test.js tests/unit/deviceBridgeFirmwareSafety.test.js tests/unit/deviceBridgeWebSocketHardening.test.js`: PASS, 3 files / 21 tests.
- `npm run build`: PASS.
- `npm run test:unit`: PASS, 113 files / 2991 tests.

## Safety Scan Results

- PASS. No new storage, network, AI provider, camera/microphone access, credentials, StudyRoom wiring, Settings UI wiring, DeviceBridge runtime wiring, ESP32 firmware changes, auto-connect, URL persistence, telemetry, or robot motion.
- Expected matches only: `cameraFrames` in the companion forbidden-key list and existing WebSocket URL credential rejection in `WebSocketTransport.js`.

## Payload Privacy Result

- PASS. The tap observes only supplied Device Bridge event objects, rejects forbidden sensitive keys, records bounded redacted transcript entries only, and never stores raw event payloads in transcript output.
- Sensitive scan matches are limited to forbidden-key lists, docs, tests, approved event names, and attack fixtures.

## Recommendation

SAFE_FOR_PHASE_24_FAKE_FACADE_MANUAL_QA.
