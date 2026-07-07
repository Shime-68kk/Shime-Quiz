# Device Bridge WebSocket LAN Research

## Summary

WebSocket LAN is the preferred first real transport candidate for Shime Quiz because it can stay local-first, can be initiated only by explicit user action, supports bidirectional status/ack messages, and does not require cloud, accounts, auth, or a backend.

Primary references checked:

- MDN WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- WHATWG WebSockets standard: https://websockets.spec.whatwg.org/
- Espressif ESP-IDF HTTP server WebSocket support and examples: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/protocols/esp_http_server.html

## Role Of ESP32

ESP32 should be an accessory only:

- Feedback device.
- Mascot behavior target.
- Local status endpoint.
- No scoring authority.
- No storage.
- No scheduler.
- No source of truth.
- No study history or library writer.

## Candidate Architectures

### Direct Browser To ESP32 WebSocket Server

Browser opens a WebSocket connection to a local ESP32 address after explicit user action. ESP32 receives only redacted/coarse protocol v0 messages.

Benefits:

- Simple local-first model.
- No broker or backend.
- Bidirectional ack/status/error path.
- Clear mental model for a first prototype.

Risks:

- User must know or discover the local device address.
- LAN exposure requires clear warning and no sensitive payload.
- Browser mixed-content and local network constraints must be tested in the actual deployment context.

Recommendation: best first prototype.

### Browser To Local Gateway To ESP32

A local desktop/mobile process talks to ESP32 and the browser talks to the gateway.

Benefits:

- Could centralize discovery, pairing, and retries.
- May simplify firmware.

Risks:

- Adds another app/process.
- Starts to resemble a backend requirement.
- Larger support surface.

Recommendation: not first.

### ESP32 Polling HTTP Endpoint

ESP32 polls an app or local endpoint for pending commands.

Benefits:

- Simple request/response firmware.

Risks:

- Browser apps do not naturally host a local HTTP endpoint.
- Polling encourages background behavior.
- Harder to keep no-backend.

Recommendation: avoid for browser-first app.

### MQTT Via Local Broker

Browser and ESP32 communicate through a local broker.

Benefits:

- Strong IoT ecosystem.
- ESP32 support is common.

Risks:

- Requires a broker/gateway for realistic browser use.
- More configuration.
- More privacy review surface.

Recommendation: avoid for now.

### Web Bluetooth

Browser connects to ESP32 BLE service.

Benefits:

- No LAN address needed.

Risks:

- Browser support and permission behavior vary.
- Firmware and testing complexity are higher.
- Pairing UX is more complex.

Recommendation: later only.

### Web Serial

Browser connects over USB serial.

Benefits:

- Useful for lab/dev testing.
- No LAN dependency.

Risks:

- Desktop-oriented.
- Requires cable and browser permission.
- Not a natural student experience.

Recommendation: dev/lab only later.

## Recommended First Prototype

Direct browser to ESP32 WebSocket server on the local LAN.

Required gates:

- Manual connect only.
- URL/address provided by caller/UI.
- Reject non-local URLs by default.
- No persistence.
- No auto-reconnect.
- Payload validation before send.
- Redacted/coarse payload only.
- Rate limit outgoing events.
- Timeout handshake.
- Clean disconnect.
- StudyRoom failure isolation.

