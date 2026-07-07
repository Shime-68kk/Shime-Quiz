# Device Bridge UI Contract

This document defines the UI-facing Device Bridge API for future UI work. Phase 4 adds no UI, no React components, no routes, no StudyRoom integration, no settings storage, and no real device transport.

## What Future UI May Import

Future UI may import only the stable facade and display helpers from `src/deviceBridge/index.js`:

- `createDeviceBridgeFacade`
- `DEVICE_BRIDGE_UI_STATUSES`
- `DEVICE_BRIDGE_TRANSPORT_STATUSES`
- `DEVICE_BRIDGE_PRIVACY_MODE`
- `DEVICE_BRIDGE_TRANSPORT_KIND_MOCK`
- `getDeviceBridgeStatusLabel`
- `getDeviceBridgePrivacyWarning`

Future UI may call these facade methods:

- `getSnapshot()`
- `enable()`
- `disable()`
- `connectMock()`
- `disconnect()`
- `emitStudyEvent(factoryName, input)`
- `getDebugEvents()`
- `clearDebugEvents()`
- `subscribe(listener)`

## What Future UI Must Not Import

Future UI must not import or call lower-level modules directly:

- `src/deviceBridge/DeviceBridge.js`
- `src/deviceBridge/deviceEventSchema.js`
- `src/deviceBridge/redactionPolicy.js`
- `src/deviceBridge/studyEventFactories.js`
- `src/deviceBridge/transports/MockTransport.js`

Those modules remain internal implementation boundaries. UI should not create raw event envelopes, bypass redaction, or access transport internals.

## Snapshot Shape

`getSnapshot()` returns:

```js
{
  enabled: false,
  connected: false,
  bridgeStatus: 'disabled',
  transportStatus: 'none',
  eventCount: 0,
  lastEventType: null,
  lastError: null,
  privacyMode: 'redacted',
  transportKind: 'mock'
}
```

Field contract:

- `enabled`: whether the facade is enabled.
- `connected`: whether the mock transport is connected.
- `bridgeStatus`: one of `disabled`, `enabled`, `connected`, `disconnected`, `error`.
- `transportStatus`: one of `none`, `mock_connected`, `mock_disconnected`, `error`.
- `eventCount`: number of mock debug events held in memory.
- `lastEventType`: last emitted event type, or `null`.
- `lastError`: `{ reason, message }`, or `null`.
- `privacyMode`: always `redacted`.
- `transportKind`: always `mock` in Phase 4.

## Allowed UI Actions

Future UI may:

- Show the current snapshot.
- Show the privacy warning from `getDeviceBridgePrivacyWarning()`.
- Enable or disable the mock bridge after explicit user action.
- Connect or disconnect the mock bridge after explicit user action.
- Clear in-memory mock debug events.
- Subscribe to facade updates and re-render from the snapshot.
- Emit named study events only through `emitStudyEvent(factoryName, input)`.

## Forbidden UI Actions

Future UI must not:

- Auto-enable the bridge.
- Auto-connect on app load.
- Store bridge settings in localStorage or any persistence layer in this phase.
- Build raw Device Bridge event payloads.
- Send prompts, answers, explanations, user answers, imported file names, source metadata, backups, settings, full history, or exact library content.
- Import transport internals.
- Add WebSocket, MQTT, BLE, Web Serial, HTTP bridge calls, backend calls, cloud sync, auth, or AI API calls.
- Treat bridge failure as a study failure.

## Privacy Warning Copy

Use `getDeviceBridgePrivacyWarning()` for future UI copy:

```text
Device Bridge is optional and redacted by default. It does not send prompt text, answers, explanations, user answers, imported document content, backups, or full study history by default.
```

## Future UI Pseudo-Code

This is pseudo-code only, not a UI implementation:

```js
import {
  createDeviceBridgeFacade,
  getDeviceBridgePrivacyWarning
} from '../deviceBridge/index.js';

const facade = createDeviceBridgeFacade();

const unsubscribe = facade.subscribe(update => {
  renderFromSnapshot(update.snapshot);
});

showWarning(getDeviceBridgePrivacyWarning());
renderFromSnapshot(facade.getSnapshot());

onUserEnable(() => facade.enable());
onUserConnectMock(() => facade.connectMock());
onUserDisconnect(() => facade.disconnect());

onSafeStudySignal(signal => {
  facade.emitStudyEvent(signal.factoryName, signal.redactedInput);
});

onCleanup(() => unsubscribe());
```

Future StudyRoom work must convert local study state into redacted factory input before calling this facade. It must not pass raw item data.
