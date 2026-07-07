# Shime Expression Fake Transport Transcript

The fake expression transcript is an in-memory dry-run transcript for protocol QA. It is not a WebSocket, BLE, serial, MQTT, Device Bridge, or hardware transport.

Rows are limited and contain only:

- step
- direction
- envelope summary
- validation status
- acknowledgement status
- dry-run status
- send status
- reason codes

Valid envelopes produce an accepted dry-run acknowledgement. Invalid envelopes produce a rejected acknowledgement. No external send path exists.

