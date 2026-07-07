# Device Bridge Safety Checklist

Use this checklist before changing Device Bridge, StudyRoom bridge emission, or future UI controls.

## Privacy Checks

- [ ] Does the change avoid prompt/question/front/back text?
- [ ] Does the change avoid correct answers and acceptable answers?
- [ ] Does the change avoid explanations?
- [ ] Does the change avoid user typed answers and selected choice ids?
- [ ] Does the change avoid source metadata, imported file names, and imported document content?
- [ ] Does the change avoid full history, schedule records, settings, backups, and exact library content?
- [ ] Are payloads still validated by the redaction policy?

## Local-First Checks

- [ ] Device Bridge is optional.
- [ ] Device Bridge remains default-off.
- [ ] Study flow works exactly the same when the bridge is disabled.
- [ ] Bridge failures are non-fatal.
- [ ] The app remains usable with no device, no account, no backend, and no network.

## No-Network Checks

- [ ] No `fetch`.
- [ ] No `XMLHttpRequest`.
- [ ] No `WebSocket`.
- [ ] No MQTT.
- [ ] No Web Bluetooth / BLE.
- [ ] No Web Serial.
- [ ] No HTTP bridge calls.
- [ ] No ESP32 or hardware transport code.
- [ ] No backend, cloud, auth, sync, or AI API calls.

## No-Storage Checks

- [ ] No new `localStorage`.
- [ ] No new `sessionStorage`.
- [ ] No new `indexedDB`.
- [ ] No new settings persistence.
- [ ] No history/schedule/import/backup writes added for Device Bridge.

## No-Raw-Payload Checks

- [ ] UI does not create raw event envelopes.
- [ ] StudyRoom does not pass raw `currentItem`.
- [ ] StudyRoom does not pass answer maps or draft payloads.
- [ ] StudyRoom does not pass `historyRecord`, review schedule records, or FSRS logs.
- [ ] Adapter inputs are explicit scalar/coarse fields only.

## UI Import Restrictions

- [ ] Future UI imports from `src/deviceBridge/index.js`.
- [ ] Future UI uses `createDeviceBridgeFacade()` for runtime state.
- [ ] Future UI uses `getDeviceBridgePrivacyWarning()` for privacy copy.
- [ ] Future UI does not import schema internals.
- [ ] Future UI does not import redaction internals.
- [ ] Future UI does not import factories directly.
- [ ] Future UI does not import `MockTransport` directly.
- [ ] Future UI does not import `DeviceBridge.js` directly.
- [ ] Future UI does not import `studyRoomBridgeAdapter.js`.

## StudyRoom Side-Effect Restrictions

- [ ] No scoring behavior changes.
- [ ] No answer-checking behavior changes.
- [ ] No scheduler/FSRS behavior changes.
- [ ] No study history write changes.
- [ ] No review schedule write changes.
- [ ] No study plan progress write changes.
- [ ] No import/export/backup/storage changes.
- [ ] Emission calls are best-effort and safely swallowed.

## Test Commands

Run the focused Device Bridge suite:

```bash
npx vitest run tests/unit/deviceBridgeEventSchema.test.js tests/unit/deviceBridgeMockTransport.test.js tests/unit/deviceBridgeRuntime.test.js tests/unit/deviceBridgeRedactionPolicy.test.js tests/unit/deviceBridgeStudyEventFactories.test.js tests/unit/deviceBridgeFacade.test.js tests/unit/deviceBridgeUiContract.test.js tests/unit/deviceBridgeStudyRoomAdapter.test.js
```

Run project verification:

```bash
npm run build
npm run test:unit
```

Recommended read-only scan:

```bash
rg -n "localStorage|sessionStorage|indexedDB|fetch\\s*\\(|XMLHttpRequest|WebSocket|navigator\\.bluetooth|navigator\\.serial|mqtt|ESP32" src/deviceBridge src/routes/StudyRoom.jsx
```
