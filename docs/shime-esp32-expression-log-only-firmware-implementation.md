# Shime ESP32 Expression Log-only Firmware Implementation

The firmware parser accepts one expression envelope JSON object per USB Serial line and emits one compact log-only JSON response.

This is not a robot behavior phase. It does not move hardware, open radio transport, store credentials, or connect to the app runtime. Accepted logs contain only expression labels and safety status. Rejected logs contain only a rejection reason and never echo raw input.

## Implemented Contract

- Protocol: `shime_robot_expression`.
- Protocol version: `1.0.0`.
- Message type: `expression_preview`.
- Input: one newline-delimited JSON object over USB Serial.
- Output: one compact JSON log line per input line.
- Maximum serial line length: 2048 bytes.
- Motion policy: only `locked`.
- Dry-run policy: only `dryRunOnly: true`.
- Send policy: only `sendStatus: "not_sent"`.
- Privacy policy: only `privacyStatus: "redacted_coarse_only"`.
- Safety policy: only `safetyStatus: "allowed_dry_run"`.

## Rejection Coverage

The parser rejects malformed JSON shape, multiple pasted objects on one line, oversized lines, unsupported protocol fields, unknown expression families, missing or malformed allowed channels, forbidden channels, unlocked motion, non-dry-run payloads, sent payloads, unsafe privacy/safety status, empty reason codes, sensitive quiz keys, credential-like keys, network/connectivity keys, dangerous hardware intent keys, schedule/calendar mutation keys, notification keys, and robot command send keys.

Rejected logs never include the raw input payload.

## Validation

- `npm run build`: PASS.
- `npm run test:unit`: PASS, 230 files / 3233 tests.
- `npx vitest run tests/unit/shimeIntelligence/*.test.js`: PASS.
- Focused Device Bridge firmware/network safety tests: PASS.
- Expression protocol benchmark: PASS, 30000 scenarios / 3000 attacks.
- Firmware implementation report: PASS, 12 valid / 25 invalid / 13 real-world lines.
- PlatformIO firmware compile: PASS.
- Valid fixture and accepted-log JSON-key privacy scan: PASS.
- Active firmware unsafe-call scan: PASS.

Codex did not upload or flash firmware.
