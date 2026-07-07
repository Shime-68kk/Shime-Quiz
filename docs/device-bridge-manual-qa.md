# Device Bridge Manual QA

This checklist verifies the current mock-only Device Bridge behavior before any future real transport, ESP32, WebSocket, MQTT, BLE, Web Serial, backend, cloud, auth, or settings persistence work.

## Scope

- Runtime: shared memory-only mock Device Bridge facade.
- UI: Device Bridge mock/debug panel in Settings.
- Study flow: StudyRoom emits sanitized events through the StudyRoom bridge adapter.
- Persistence: none. Refreshing the app may reset bridge state and debug events.
- Transport: mock-only. No real device connection is expected.

## Required Pre-Checks

Run these before manual QA:

```bash
npm run build
npm run test:unit
rg -n "localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|WebSocket|Bluetooth|Serial|MQTT|ESP32" src/deviceBridge src/components/settings/DeviceBridgeUiConcept.jsx src/routes/StudyRoom.jsx
```

Expected result:

- Build passes.
- Unit tests pass.
- Forbidden API scan returns no matches in the checked runtime/UI files.

## Forbidden Sensitive Fields

These fields must not appear in Device Bridge debug payloads, UI event previews, mock transport event records, or future emitted payloads by default:

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

## 1. Baseline Disabled Behavior

1. Open the app.
2. Open Settings.
3. Find the Device Bridge mock/debug section.
4. Confirm the bridge shows disabled or disconnected by default.
5. Do not press enable or connect.
6. Start or resume a study session.
7. Answer at least one question.
8. Return to Settings and inspect the Device Bridge event/debug area.

Expected result:

- The app works normally.
- StudyRoom is not blocked by the bridge.
- No mock device connection happens automatically.
- No event payload is sent to mock transport while disabled.
- No error interrupts the study flow.

## 2. Mock Enable And Connect Behavior

1. Open Settings.
2. Press the manual enable control.
3. Confirm the status changes to enabled.
4. Press the manual connect mock control.
5. Confirm the status changes to mock connected.
6. Confirm there is still no real device, network, serial, Bluetooth, or ESP32 connection prompt.

Expected result:

- Enabling is manual only.
- Connecting mock transport is manual only.
- No browser permission prompt appears.
- No network request is made.
- The UI does not create demo study events.

## 3. StudyRoom Event Visibility

With the mock bridge enabled and mock transport connected:

1. Start a study session.
2. Confirm a session start event appears in the mock/debug event list.
3. Move through at least two questions.
4. Answer one question correctly if possible.
5. Answer one question incorrectly if possible.
6. Complete or exit the session in a normal supported path.
7. Return to Settings and inspect debug events.

Expected event types may include:

- `session_started`
- `review_due`
- `question_presented`
- `answer_correct`
- `answer_wrong`
- `session_complete`

Expected payload content is limited to redacted/coarse data only:

- Temporary session id.
- Item index.
- Item type.
- Progress count.
- Total count.
- Coarse correctness status.
- Coarse score bucket.
- Due count bucket.
- Bridge or transport status.

Expected privacy behavior:

- Payloads are dữ liệu đã redacted/coarse, not raw quiz payloads.
- Payloads are dữ liệu đã làm mờ/an toàn for mock accessory behavior only.
- No prompt text.
- No answer text.
- No explanation text.
- No imported content.
- No source metadata.
- No settings payload.
- No full study history.
- No backup payload.

## 4. Privacy Inspection Procedure

Inspect each visible debug event payload and, if available, browser devtools console output.

For every event:

1. Search for the forbidden sensitive field names listed above.
2. Search for recognizable quiz prompt text from the current study item.
3. Search for recognizable correct answer text.
4. Search for the typed answer, if any.
5. Search for imported document names or source names.

Expected result:

- None of those values or field names appear.
- Event payloads remain coarse and redacted.
- Payloads are useful only for accessory behavior, not content reconstruction.

## 5. Disconnect And Disable Behavior

1. While mock transport is connected, press disconnect.
2. Confirm the UI shows disconnected.
3. Continue a study session and answer a question.
4. Confirm study flow still works.
5. Press disable.
6. Confirm the UI shows disabled.
7. Continue study flow again.

Expected result:

- Disconnect does not break StudyRoom.
- Disable does not break StudyRoom.
- Bridge failure or disabled status is non-blocking.
- Study results, history, schedule, and scoring continue through the existing app logic.

## 6. Negative Checks

Perform these checks during the same session:

- Reload the page and confirm the bridge does not auto-connect.
- Navigate away from Settings and back; confirm no connection is started without user action.
- Start study while the bridge is disabled; confirm no bridge error is shown to the learner.
- Try repeated enable/connect/disconnect/disable actions; confirm no duplicate UI crash or study blocker.
- Confirm no new settings persistence controls were added.
- Confirm no hardware, ESP32, Bluetooth, serial, or network wording appears as an active connection feature.

## 7. Manual QA Pass Criteria

Manual QA passes only if all are true:

- Build passes.
- Unit tests pass.
- Forbidden API scan has no runtime/UI matches.
- Bridge is disabled by default.
- Mock connection requires explicit user action.
- StudyRoom works when bridge is disabled, disconnected, connected, or disabled again.
- Mock debug events appear only after manual enable and mock connect.
- No forbidden sensitive fields or content appear in emitted event payloads.
- No real transport or network behavior exists.
