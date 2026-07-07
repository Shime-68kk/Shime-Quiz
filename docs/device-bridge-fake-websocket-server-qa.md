# Device Bridge Fake WebSocket Server QA

This QA flow uses a dev-only local fake server to test the browser Real LAN / WS path without ESP32 hardware.

## Start The Fake Server

```bash
node tools/deviceBridge/fakeWebSocketServer.mjs
```

Default endpoint:

```text
ws://127.0.0.1:8787
```

Optional port:

```bash
node tools/deviceBridge/fakeWebSocketServer.mjs --host 127.0.0.1 --port 8787
```

Expected console prefix:

```text
[DEV FAKE SERVER]
```

## Manual QA Steps

1. Run the fake server.
2. Open the app in a browser.
3. Go to Settings -> Device Bridge.
4. Enable Device Bridge.
5. Select Real LAN / WS.
6. Enter `ws://127.0.0.1:8787`.
7. Click connect explicitly.
8. Confirm the fake server logs a `hello` message.
9. Confirm the fake server responds with `hello_ack`.
10. Go to StudyRoom.
11. Answer a few questions.
12. Confirm the fake server logs `robot_event` messages.
13. Confirm payloads are redacted/coarse only.
14. Confirm no prompt, answer, explanation, user answer, source metadata, history, settings, or backup data appears.
15. Disconnect from the Device Bridge panel.
16. Refresh the app.
17. Confirm no URL persistence and no auto-reconnect.

## Expected Safe Payload Fields

- `eventType`
- `sessionId`
- `itemIndex`
- `itemType`
- `progressCount`
- `totalCount`
- `status`
- `scoreBucket`
- `accuracyBucket`
- `dueCountBucket`
- `bridgeStatus`
- `transportStatus`
- `reasonCode`
- `message`

## Failure Criteria

FAIL if any of these occur:

- The app reconnects automatically.
- The URL persists after refresh.
- StudyRoom behavior changes or crashes.
- The fake server logs sensitive quiz content.
- The fake server writes payloads to disk.
- The fake server connects outward.

