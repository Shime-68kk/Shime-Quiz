# Device Bridge Hardware QA Checklist

Use this only after fake-server QA is passing.

- [ ] App does not auto-connect.
- [ ] URL is not persisted.
- [ ] User must explicitly connect.
- [ ] ESP32 receives `hello`.
- [ ] ESP32 sends `hello_ack`.
- [ ] StudyRoom events are received.
- [ ] Payloads are redacted/coarse only.
- [ ] No sensitive fields appear.
- [ ] Disconnect works.
- [ ] Refresh does not reconnect.
- [ ] Robot remains neutral on error.
- [ ] No physical motion is enabled.
- [ ] Firmware does not store payloads.
- [ ] Firmware does not control scoring, history, schedule, settings, import, backup, or library state.

Result options:

- PASS
- FAIL
- BLOCKED

