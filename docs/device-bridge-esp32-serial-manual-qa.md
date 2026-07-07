# Device Bridge ESP32 Serial Manual QA

Result options: PASS, FAIL, BLOCKED.

## Setup

- [ ] Firmware builds with `pio run -d firmware/esp32-shime-robot`.
- [ ] Board is disconnected from motors, servos, LEDs, relays, or other actuators.
- [ ] Firmware flashes if hardware is available.
- [ ] Serial monitor opens at 115200 baud.
- [ ] Boot logs say no Wi-Fi credentials are configured.
- [ ] Boot logs say no pins, motors, servos, or LEDs are controlled by default.

## Accepted Parser Cases

- [ ] `hello` is accepted.
- [ ] `ping` is accepted.
- [ ] `disconnect` is accepted.
- [ ] `session_started` is accepted.
- [ ] `question_presented` is accepted.
- [ ] `answer_correct` is accepted.
- [ ] `answer_wrong` is accepted.
- [ ] `review_due` is accepted.
- [ ] `session_complete` is accepted.
- [ ] `bridge_error` is accepted.
- [ ] `robot_command celebrate` is accepted.
- [ ] `robot_command encourage` is accepted.

## Rejected Parser Cases

- [ ] Unknown event is rejected.
- [ ] Unknown command is rejected.
- [ ] Sensitive `"question":` key is rejected.
- [ ] Sensitive `"answer":` key is rejected.
- [ ] Sensitive `"correctAnswer":` key is rejected.
- [ ] Malformed input is rejected.
- [ ] Missing protocol version is rejected.

## Safety Checks

- [ ] No reset or crash occurs after invalid input.
- [ ] Action stubs print logs only.
- [ ] No physical output occurs.
- [ ] No payload is persisted.
- [ ] No Wi-Fi, WebSocket, Bluetooth, MQTT, or HTTP activity occurs.

## PASS Criteria

PASS only if all accepted cases are accepted, all rejected cases are rejected, no sensitive payload is accepted, and no physical output occurs.
