# Device Bridge ESP32 Serial Parser QA

## Purpose

Serial Parser QA verifies the ESP32 firmware protocol parser over USB Serial before any Wi-Fi, WebSocket, or physical-output phase.

This mode is intentionally local, manual, and log-only. It accepts one newline-delimited JSON message at a time, parses it with `ShimeProtocol::parseIncomingMessage`, prints the parser result, prints the response envelope, and routes accepted event or command names to `ShimeRobotActions` log stubs.

## Why Serial First

- It tests the firmware parser without network setup.
- It avoids app/runtime coupling while firmware behavior is still changing.
- It proves sensitive JSON property names are rejected before any robot transport is introduced.
- It keeps all robot behavior as serial logs only.

## Build

```bash
pio run -d firmware/esp32-shime-robot
```

## Flash

Only flash if an ESP32 dev board is available and disconnected from any actuator hardware:

```bash
pio run -d firmware/esp32-shime-robot -t upload
```

## Open Serial Monitor

```bash
pio device monitor -d firmware/esp32-shime-robot -b 115200
```

Expected boot logs:

```text
[SHIME ROBOT SKELETON] boot
[SHIME ROBOT SKELETON] No Wi-Fi credentials are configured in this skeleton.
[SHIME ROBOT SKELETON] Future WebSocket setup belongs here after safety review.
[SHIME ROBOT SKELETON] No pins, motors, servos, or LEDs are controlled by default.
[SHIME SERIAL QA] Paste one protocol JSON message per line.
```

## Sample Messages

Copy one line at a time from `tools/deviceBridge/serialParserQaFixtures.mjs`.

Useful accepted samples:

- `hello`
- `ping`
- `disconnect`
- `session_started`
- `question_presented`
- `answer_correct`
- `answer_wrong`
- `review_due`
- `session_complete`
- `bridge_error`
- `robot_command celebrate`
- `robot_command encourage`

Useful rejected samples:

- unknown event
- unknown command
- sensitive `"question":`
- sensitive `"answer":`
- sensitive `"correctAnswer":`
- malformed input
- missing protocol version

## Expected Accepted Output

```text
[SHIME SERIAL QA] received
[SHIME SERIAL QA] accepted robot_event question_presented
[SHIME ROBOT SKELETON] action stub: focus
[SHIME SERIAL QA] response {...}
```

## Expected Rejected Output

```text
[SHIME SERIAL QA] received
[SHIME SERIAL QA] rejected sensitive_payload_detected
[SHIME SERIAL QA] response {...}
```

## Stop Conditions

Stop and mark QA failed if:

- firmware resets or crashes on malformed input
- a sensitive key is accepted
- valid `question_presented`, `answer_correct`, or `answer_wrong` is rejected
- any physical output occurs
- Wi-Fi, WebSocket, Bluetooth, MQTT, or HTTP starts
- payloads are stored on the device

## Scope Limits

This phase is serial parser QA only. It is not app-compatible WebSocket hardware QA, and it does not prove real robot transport behavior.
