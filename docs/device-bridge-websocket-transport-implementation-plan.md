# Device Bridge WebSocket Transport Implementation Plan

This is a future implementation plan only. Phase 12 does not add `WebSocketTransport` code.

## Future Files

- `src/deviceBridge/transports/WebSocketTransport.js`
- `tests/unit/deviceBridgeWebSocketTransport.test.js`
- `tests/unit/deviceBridgeWebSocketProtocol.test.js`
- `tests/unit/deviceBridgeWebSocketSafety.test.js`
- `docs/beta-phase-13-websocket-prototype.md`

## Required Behavior

`WebSocketTransport` must:

- Be disabled by default.
- Never auto-connect.
- Require explicit user action.
- Accept URL only from caller.
- Reject non-local URLs unless explicitly allowed by a future setting.
- Not persist URL.
- Not send raw event objects without validation.
- Validate/redact before sending.
- Rate-limit outgoing events.
- Timeout handshake.
- Close cleanly.
- Isolate errors.
- Never crash StudyRoom.
- Expose safe status only.

## Connection Lifecycle

- `idle`
- `connecting`
- `connected`
- `degraded`
- `disconnected`
- `error`

## Failure Behavior

- ESP32 offline: connection fails with safe status; no retry unless user acts.
- Invalid protocol response: close or degrade; do not send more events.
- Invalid ack: mark degraded and log safe reason code.
- Send timeout: fail that send only; StudyRoom continues.
- Socket close: mark disconnected.
- Malformed inbound message: ignore and optionally record redacted error.
- Robot reports error: show safe status only.
- Network reconnect attempt: denied by default.

## URL Rules

Allowed by default:

- `ws://localhost:<port>`
- `ws://127.0.0.1:<port>`
- `ws://192.168.x.x:<port>`
- `ws://10.x.x.x:<port>`
- `ws://172.16.x.x` through `ws://172.31.x.x`
- `.local` hostnames only after explicit future decision and tests.

Rejected by default:

- Public internet hosts.
- `wss://` cloud endpoints.
- URLs with embedded credentials.
- Empty or malformed URLs.

## Rollback

Remove the future `WebSocketTransport.js` and its tests. Mock runtime and StudyRoom adapter must continue working unchanged.

