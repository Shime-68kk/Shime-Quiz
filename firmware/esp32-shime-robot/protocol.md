# Shime ESP32 Expression Log-only Protocol

Firmware parser protocol: `shime_robot_expression` / `1.0.0`

This firmware phase accepts one newline-delimited JSON expression envelope per USB Serial line and prints one compact log-only JSON line per input line.

It does not execute robot commands, open Wi-Fi/BLE/WebSocket transport, store credentials, mutate app data, or move pins, motors, servos, wheels, LEDs, or other physical outputs.

## Accepted envelope

Required safe fields:

- `protocol`: `shime_robot_expression`
- `protocolVersion`: `1.0.0`
- `source`: `shime_quiz`
- `target`: `shime_robot`
- `messageType`: `expression_preview`
- `expressionFamily`
- `allowedChannels`
- `displayExpression`
- `ledPattern`
- `soundCue`
- `motionPolicy`: `locked`
- `intensityBucket`
- `safetyStatus`: `allowed_dry_run`
- `privacyStatus`: `redacted_coarse_only`
- `dryRunOnly`: `true`
- `sendStatus`: `not_sent`
- `reasonCodes`

Allowed expression families:

- `neutral_presence`
- `focus_ritual`
- `review_due_nudge`
- `memory_risk_nudge`
- `gentle_encourage`
- `recovery_praise`
- `celebrate_stability_gain`
- `celebrate_session_complete`
- `suggest_break_soft`
- `reconnect_hint`
- `calm_error`
- `do_nothing`

Allowed channels:

- `display_expression`
- `led_expression`
- `sound_cue`
- `idle_presence`
- `attention_hint`
- `no_op`

## Log-only output

Accepted input prints:

```json
{"logProtocol":"shime_esp32_expression_log","protocolVersion":"1.0.0","accepted":true,"expressionFamily":"neutral_presence","displayExpression":"neutral_presence_display","ledPattern":"neutral_presence_soft_led","soundCue":"none","motionPolicy":"locked","dryRunOnly":true,"sendStatus":"not_sent","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","reasonCodes":["firmware_expression_accepted"]}
```

Rejected input prints:

```json
{"logProtocol":"shime_esp32_expression_log","protocolVersion":"1.0.0","accepted":false,"rejectedReason":"malformed_json","motionPolicy":"locked","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["firmware_expression_rejected","malformed_json"]}
```

Rejected logs never echo raw input.

## Serial QA fixtures

- `fixtures/expression-valid.ndjson`
- `fixtures/expression-invalid.ndjson`
- `fixtures/expression-realworld-invalid.ndjson`
- `fixtures/expression-expected-logs.ndjson`

Build only:

```bash
pio run
```

Do not upload or flash unless a human explicitly requests it.

