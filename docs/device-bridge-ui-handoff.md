# Device Bridge UI Handoff

This handoff is for a future UI implementer or UI AI. The Device Bridge logic foundation is ready for mock-only UI work, but UI work must stay inside the contract below.

## Allowed UI Imports

Prefer imports from `src/deviceBridge/index.js`.

Future UI may use:

- `createDeviceBridgeFacade`
- `DEVICE_BRIDGE_UI_STATUSES`
- `DEVICE_BRIDGE_TRANSPORT_STATUSES`
- `DEVICE_BRIDGE_PRIVACY_MODE`
- `DEVICE_BRIDGE_TRANSPORT_KIND_MOCK`
- `getDeviceBridgeStatusLabel`
- `getDeviceBridgePrivacyWarning`

Future UI may call facade methods:

- `getSnapshot()`
- `enable()`
- `disable()`
- `connectMock()`
- `disconnect()`
- `getDebugEvents()`
- `clearDebugEvents()`
- `subscribe(listener)`

Use `emitStudyEvent()` only for test/debug tooling that already has redacted factory input. UI should not invent raw payloads.

## Forbidden UI Imports

Future UI must not import:

- `src/deviceBridge/deviceEventSchema.js`
- `src/deviceBridge/redactionPolicy.js`
- `src/deviceBridge/studyEventFactories.js`
- `src/deviceBridge/transports/MockTransport.js`
- `src/deviceBridge/DeviceBridge.js`
- `src/deviceBridge/studyRoomBridgeAdapter.js`
- Any StudyRoom internals for bridge control.

## Future UI Allowed Actions

Future UI may:

- Show disabled status.
- Show enabled status.
- Show mock connected/disconnected status.
- Show error status.
- Show event count.
- Show last event type.
- Show empty debug event list state.
- Show the privacy warning from `getDeviceBridgePrivacyWarning()`.
- Manually enable the runtime mock bridge if a future phase approves UI controls.
- Manually connect/disconnect mock bridge if a future phase approves UI controls.
- Clear in-memory debug events if a future phase approves it.

## Future UI Forbidden Actions

Future UI must not:

- Auto-enable Device Bridge.
- Auto-connect Device Bridge.
- Add real network transport.
- Add ESP32 transport.
- Add WebSocket, MQTT, BLE, Web Serial, HTTP bridge, backend, cloud, auth, sync, or AI API calls.
- Add settings persistence unless a future phase explicitly approves a storage boundary.
- Create raw event payloads.
- Display prompt/answer/explanation/user-answer content from device events.
- Mutate StudyRoom state directly.
- Modify scheduler, storage, import, backup, review schedule, FSRS, study history, learning data, EduGen, or services.
- Treat bridge failure as a study failure.

## UI States To Cover

- `disabled`: default state; no connection and no events sent.
- `enabled`: bridge is enabled but mock transport is not connected.
- `connected`: mock transport connected.
- `disconnected`: mock transport explicitly disconnected.
- `error`: facade has a redacted failure state.
- Empty debug events: no mock events recorded.
- Non-empty debug events: show count and last event type only by default.
- Privacy warning: always visible near enable/connect controls.

## Suggested Future UI File Locations

Suggestions only; future UI work should choose the smallest appropriate surface:

- `src/components/settings/DeviceBridgeMockPanel.jsx`
- `src/components/settings/DeviceBridgeStatusBadge.jsx`
- `src/components/settings/DeviceBridgeDebugEvents.jsx`
- `tests/unit/deviceBridgeMockPanel.test.jsx`

If there is already a settings concept component in the working tree, future UI should reconcile it with this handoff before adding new components.

## Ready-To-Copy Prompt For UI AI

```text
You are inside the Shime-Quiz project. Implement a minimal mock-only Device Bridge UI using the existing logic foundation.

Strict rules:
- Do not add real transport.
- Do not add WebSocket, MQTT, BLE, Web Serial, HTTP bridge, ESP32, backend, cloud, auth, sync, or AI API calls.
- Do not add settings persistence or localStorage.
- Do not auto-enable or auto-connect Device Bridge.
- Do not modify StudyRoom learning logic.
- Do not modify scheduler, FSRS, review schedule, study history, storage, import, backup, learning data, EduGen, or service logic.
- Do not create raw Device Bridge event payloads.
- Do not import Device Bridge internals.

Allowed imports:
- Import from src/deviceBridge/index.js only.
- Use createDeviceBridgeFacade().
- Use DEVICE_BRIDGE_UI_STATUSES and DEVICE_BRIDGE_TRANSPORT_STATUSES.
- Use getDeviceBridgeStatusLabel().
- Use getDeviceBridgePrivacyWarning().

UI scope:
- Show current bridge snapshot.
- Show disabled/enabled/connected/disconnected/error state.
- Show event count and last event type.
- Show privacy warning copy.
- Provide manual mock-only controls only: enable, disable, connect mock, disconnect, clear debug events.
- Keep UI small and reversible.

Verification:
- Run npm run build.
- Run npm run test:unit.
- Add focused unit tests for the UI component.
```
