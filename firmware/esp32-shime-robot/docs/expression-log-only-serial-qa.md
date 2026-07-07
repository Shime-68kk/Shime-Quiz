# Expression Log-only Serial QA

This firmware parser is log-only. It does not send robot commands, open radio transport, or move hardware.

Manual QA for a later hardware step:

1. Build firmware with PlatformIO.
2. Open the USB serial monitor.
3. Paste one line from `fixtures/expression-valid.ndjson`.
4. Confirm one ACCEPT JSON log line.
5. Paste one line from `fixtures/expression-invalid.ndjson`.
6. Confirm one REJECT JSON log line.
7. Try real-world malformed lines from `fixtures/expression-realworld-invalid.ndjson`.
8. Confirm no raw invalid payload is echoed.
9. Confirm no pins, motors, servos, radio transport, or app runtime path is used.

Codex must not upload or flash firmware unless explicitly asked by a human.
