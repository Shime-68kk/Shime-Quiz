# Beta Phase 27: Live DeviceBridge Companion Tap

Date: 2026-06-27 08:16:59 +07

## What Was Implemented

- Added live observe-only model helpers for the Companion Dev Panel.
- Added a `Live DeviceBridge observe-only dev mode` section to the Companion Brain Panel.
- Wired live tap creation to the explicit `Enable live dev tap` button only.
- Added clean disable/unsubscribe behavior and unmount cleanup.
- Added live transcript clearing.
- Added runtime update callback support for in-memory UI refresh.
- Added focused live tap and privacy tests.

## Files Changed

- `src/components/settings/CompanionDevPanel.jsx`
- `src/components/settings/companionDevPanelModel.js`
- `src/companion/companionDevTapRuntime.js`
- `tests/unit/companionDevPanel.test.jsx`
- `tests/unit/companionDevPanelModel.test.js`
- `tests/unit/companionDevTapRuntime.test.js`
- `tests/unit/companionLiveDeviceBridgeTap.test.jsx`
- `tests/unit/companionLiveDeviceBridgeTapPrivacy.test.js`
- `docs/cognitive-companion-live-dev-tap.md`
- `docs/cognitive-companion-live-dev-tap-manual-qa.md`
- `docs/beta-phase-27-live-devicebridge-companion-tap.md`

## Boundary Results

- Live tap mounted: yes.
- App runtime behavior changed: no.
- StudyRoom changed: no.
- UI changed: yes, Companion Dev Panel only.
- DeviceBridge runtime changed: no.
- ESP32 firmware changed: no.
- External robot project changed: no.
- AI API added: no.
- Storage/network added: no.
- Robot command sending added: no.
- Live tap disabled by default: yes.
- Live tap observe-only: yes.
- Live tap auto-subscribes: no.

## Validation Results

```bash
npm run build
npm run test:unit
npx vitest run tests/unit/companionLiveDeviceBridgeTap.test.jsx tests/unit/companionLiveDeviceBridgeTapPrivacy.test.js
npx vitest run tests/unit/companionDevPanelModel.test.js tests/unit/companionDevPanel.test.jsx
npx vitest run tests/unit/companionDevTap.test.js tests/unit/companionDevTapRuntime.test.js tests/unit/companionDevTapPrivacy.test.js tests/unit/companionDevTapDeviceBridgeIntegration.test.js
npx vitest run tests/unit/companionBridgePipeline.test.js tests/unit/companionEndToEndPrivacy.test.js tests/unit/companionEndToEndRegression.test.js
npx vitest run tests/unit/deviceBridgeWebSocketSafety.test.js tests/unit/deviceBridgeFirmwareSafety.test.js tests/unit/deviceBridgeWebSocketHardening.test.js
```

- Build: PASS.
- Full unit suite: PASS, 121 files / 3031 tests.
- Focused live tap tests: PASS, 2 files / 11 tests.
- Focused dev panel tests: PASS, 2 files / 18 tests.
- Existing dev tap tests: PASS, 4 files / 16 tests.
- Existing companion simulation/privacy tests: PASS, 3 files / 10 tests.
- Existing Device Bridge WebSocket/firmware safety tests: PASS, 3 files / 21 tests.

## Safety Scan Result

- No Phase 27 `localStorage`, `sessionStorage`, `indexedDB`, `fetch`, `XMLHttpRequest`, MQTT, Bluetooth, Serial, ESP32, camera, microphone, AI API, credential, or telemetry behavior was added.
- `CompanionDevPanel.jsx` imports Device Bridge only through `src/deviceBridge/index.js`.
- `CompanionDevPanel.jsx` does not import `WebSocketTransport`, StudyRoom, storage, services, or raw learning data modules.
- The live tap does not call Device Bridge connect, emit, or robot send APIs.
- Existing WebSocket credential rejection code remains outside this phase's changed files.

## Payload Privacy Result

- Live transcript rows are formatted from the companion dev tap's redacted transcript only.
- The panel never renders raw event payload JSON.
- Sensitive matches in Phase 27 files are limited to forbidden-key lists, invalid attack fixtures/tests, docs, and warning text.
- Existing raw quiz terms in `src/routes/StudyRoom.jsx` are pre-existing StudyRoom quiz logic and were not modified in this phase.

## Recommendation

SAFE_FOR_PHASE_28_LIVE_TAP_MANUAL_QA
