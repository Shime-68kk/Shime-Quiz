# Beta Phase 8 Shared Runtime Validation

Baseline time: 2026-06-27T00:54:31+07:00

## What Was Validated

- Shared facade defaults disabled and disconnected.
- Shared facade does not auto-connect.
- Shared facade reset helper prevents unit test leakage.
- StudyRoom adapter default path uses the shared facade.
- Disabled shared facade returns safe failures and stores no events.
- Enabled and mock-connected shared facade receives StudyRoom adapter events.
- Shared debug events validate against the Device Bridge schema.
- Shared debug events contain only approved coarse payload keys.
- Shared debug events do not contain forbidden sensitive payload keys.
- Device Bridge UI keeps enable/connect actions manual.
- Device Bridge UI does not call `emitStudyEvent()`.
- Device Bridge UI does not create demo event payloads.
- No forbidden storage, network, or hardware APIs are present in the Device Bridge runtime path.

## Files Changed

- `tests/unit/deviceBridgeRuntimeShared.test.js`
- `tests/unit/deviceBridgeUiConcept.test.jsx`
- `docs/beta-phase-8-shared-runtime-validation.md`

No runtime source files were modified in Phase 8.

## Commands Run

- `npx vitest run tests/unit/deviceBridgeRuntimeShared.test.js tests/unit/deviceBridgeStudyRoomAdapter.test.js tests/unit/deviceBridgeUiConcept.test.jsx`
- `rg -n "localStorage|sessionStorage|indexedDB|fetch\\s*\\(|XMLHttpRequest|WebSocket|Bluetooth|bluetooth|Serial|serial|MQTT|mqtt|ESP32|esp32" src/deviceBridge src/components/settings/DeviceBridgeUiConcept.jsx src/routes/StudyRoom.jsx`
- `npm run build`
- `npm run test:unit`

## Test Results

- Focused shared runtime/UI/adapter suite: PASS, 3 files / 32 tests.
- Forbidden API scan: PASS, no matches.
- Build: PASS. Vite reported the existing large chunk warning for `dist/assets/index-C4yk0VrR.js`; no build failure.
- Full unit suite: PASS, 78 files / 2808 tests.

## Source Changes

None.

## Disabled By Default

The shared runtime remains disabled by default. `getSharedDeviceBridgeFacade()` creates the facade without options, so it starts disabled and disconnected.

## Shared Runtime

UI and StudyRoom share runtime through the Phase 7B path:

- Device Bridge UI uses `getSharedDeviceBridgeFacade()`.
- StudyRoom still calls `createStudyRoomBridgeAdapter()`.
- The adapter default path uses `getSharedDeviceBridgeFacade()`.

## Sensitive Data Validation

Focused tests verify emitted shared debug events do not include forbidden sensitive keys:

- `prompt`
- `question`
- `front`
- `back`
- `correctAnswer`
- `answer`
- `acceptableAnswers`
- `explanation`
- `userAnswer`
- `typedAnswer`
- `sourceMetadata`
- `sourceName`
- `importedFileName`
- `importedDocumentName`
- `rawText`
- `cleanedText`
- `backupPayload`
- `settings`
- `studyHistory`
- `fullHistory`

## Real Transport / Network / Storage

Still absent:

- real transport
- ESP32
- WebSocket
- MQTT
- BLE
- Web Serial
- HTTP bridge
- backend/cloud/auth
- AI API calls
- settings persistence
- `localStorage`
- `sessionStorage`
- `indexedDB`

## Known Risks

- The shared runtime is a module singleton. Tests and future debug tooling should reset it when they need a clean state.
- Device Bridge UI displays `JSON.stringify(evt.payload)` for debug events. Current payloads are redacted and schema-validated, but future event additions must preserve the redaction contract.
- Future UI interaction tests may need a browser/React test harness if the project adds one.

## Recommendation

`SAFE_FOR_PHASE_9`.
