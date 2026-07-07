# Shime Robot ESP32 Firmware Skeleton

This folder contains a passive ESP32 firmware skeleton for future Device Bridge hardware bring-up.

## Purpose

- Receive Shime Device Bridge protocol v0 messages on a future local LAN transport.
- Validate messages conservatively.
- Map safe, redacted/coarse events to accessory behavior stubs.
- Keep the robot as an optional companion only.

## Safety Scope

This skeleton does not:

- Store study data.
- Score answers.
- Schedule reviews.
- Import or export library content.
- Request prompts, answers, explanations, user answers, source metadata, settings, history, or backups.
- Enable motor, servo, or LED output by default.
- Include Wi-Fi credentials or secrets.
- Require cloud, backend, account, auth, or AI APIs.

## Build Assumptions

The included `platformio.ini` is a minimal starting point for an ESP32 Arduino-style build. Local PlatformIO/ESP32 toolchain setup is outside the app repository.

## Future Connection Shape

The intended first hardware bring-up is:

1. App user manually enters local `ws://` ESP32 address.
2. App sends `hello`.
3. ESP32 replies with `hello_ack`.
4. App sends redacted/coarse `robot_event` or `robot_command` messages.
5. ESP32 logs and maps them to safe stubs only.

## Action Mapping

- `session_started` -> neutral/focus.
- `question_presented` -> focus.
- `answer_correct` -> celebrate.
- `answer_wrong` -> encourage.
- `review_due` -> dueReview.
- `session_complete` -> sessionComplete.
- `bridge_error` -> errorSignal.

Physical behavior must remain disabled until a later safety-reviewed phase.

## Serial Parser QA

Phase 19 firmware reads one newline-delimited protocol JSON message from USB Serial, parses it, prints a parser result, prints the response envelope, and routes accepted event or command names to log-only action stubs.

Build:

```bash
pio run -d firmware/esp32-shime-robot
```

Open serial monitor after flashing:

```bash
pio device monitor -d firmware/esp32-shime-robot -b 115200
```

Copy sample one-line messages from `tools/deviceBridge/serialParserQaFixtures.mjs`. This mode does not start Wi-Fi, WebSocket, Bluetooth, MQTT, HTTP, storage, or physical output.
