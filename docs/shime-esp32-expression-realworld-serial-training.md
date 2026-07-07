# Shime ESP32 Expression Real-world Serial Training

The real-world serial training fixtures cover malformed lines, copy/paste mistakes, split payloads, timestamp prefixes, empty input, non-JSON text, repeated valid payloads, mixed valid/invalid sequences, harmless extra fields, dangerous extra fields, and duplicate-key cases.

The firmware must handle these inputs without crashing, without raw input echo, without app data mutation, and without motion.

## Fixture Set

- `firmware/esp32-shime-robot/fixtures/expression-valid.ndjson`: 12 valid expression envelopes.
- `firmware/esp32-shime-robot/fixtures/expression-invalid.ndjson`: 25 invalid expression envelopes.
- `firmware/esp32-shime-robot/fixtures/expression-realworld-invalid.ndjson`: 13 real-world invalid or malformed serial inputs.
- `firmware/esp32-shime-robot/fixtures/expression-expected-logs.ndjson`: 37 expected accepted/rejected log envelopes.

## Manual QA Boundary

Phase 42X prepares serial log-only hardware QA. The expected operator action is paste-one-line-over-USB-Serial testing. It is not app-compatible WebSocket hardware QA, not Wi-Fi/BLE transport QA, and not motion/LED/servo QA.

## Required Checks During Hardware QA

- Every accepted valid fixture produces a compact accepted log.
- Every invalid or real-world malformed line produces a compact rejected log.
- Rejected logs do not echo the raw input line.
- Valid accepted logs contain only expression labels and safety status.
- No pins, motors, servos, LEDs, Wi-Fi, BLE, WebSocket, MQTT, storage, or app runtime path is used.
