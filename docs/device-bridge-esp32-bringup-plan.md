# Device Bridge ESP32 Bring-Up Plan

## Stage 1: Fake Server PASS

- Goal: prove browser Real LAN flow against local fake server.
- Evidence: hello, robot_event, session_complete, redacted/coarse payloads only.
- Stop conditions: sensitive fields, auto-connect, URL persistence.
- Rollback: disable Real LAN and return to mock.
- Tests: fake server and WebSocket unit suites.
- Safety: no hardware.

## Stage 2: ESP32 Serial-Only Parser Test

- Goal: paste protocol messages over serial and verify parser result.
- Evidence: accepted safe messages, rejected sensitive/unknown messages.
- Stop conditions: parser accepts forbidden fields.
- Rollback: keep firmware skeleton logs only.
- Tests: fixture tests and serial transcript.
- Safety: no motion.

## Stage 3: ESP32 Local Hello/Hello Ack Only

- Goal: local WebSocket handshake only.
- Evidence: app sends hello, ESP32 replies hello_ack.
- Stop conditions: reconnect loop, malformed ack, app crash.
- Rollback: fake server.
- Tests: manual QA and transport logs.
- Safety: no robot action.

## Stage 4: ESP32 Receives Robot Event And Logs Only

- Goal: receive redacted/coarse events and log mapped action.
- Evidence: event-to-action mapping in serial logs.
- Stop conditions: sensitive data appears in logs.
- Rollback: hello-only firmware.
- Tests: StudyRoom session and serial output.
- Safety: no physical output.

## Stage 5: Safe LED-Only Prototype

- Goal: enable one safe LED cue after review.
- Evidence: bounded LED action and neutral fallback.
- Stop conditions: overheating, rapid blinking, privacy issue.
- Rollback: log-only.
- Tests: hardware QA checklist.
- Safety: LED-only, rate-limited.

## Stage 6: Optional Servo/Motion Prototype

- Goal: motion only after separate safety review.
- Evidence: strict duration, bounds, power safety, emergency neutral.
- Stop conditions: any uncontrolled motion.
- Rollback: LED-only or log-only.
- Tests: dedicated motion QA.
- Safety: explicit review required.

