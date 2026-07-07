# Device Bridge WebSocket Test Plan

Future Phase 13 WebSocket prototype tests must cover:

- Constructor does not connect.
- Explicit connect required.
- Invalid URL rejected.
- Non-local URL rejected.
- URL is not persisted.
- No storage API use.
- No auto-reconnect unless explicitly enabled in a later phase.
- Outgoing payload validated.
- Sensitive fields rejected.
- Only redacted/coarse fields sent.
- Malformed inbound messages ignored.
- `ack`, `status`, `error`, and `pong` parsed safely.
- Close/disconnect works.
- StudyRoom unaffected on transport failure.
- UI does not expose raw payload.
- Rate limiting works.
- Handshake timeout works.
- Send timeout works.
- Socket close updates safe status.
- Public Device Bridge API remains the UI boundary.

## Safety Fixture Requirements

Tests should include payloads containing forbidden fields:

- `prompt`
- `question`
- `answer`
- `correctAnswer`
- `explanation`
- `userAnswer`
- `sourceMetadata`
- `settings`
- `studyHistory`
- `backupPayload`

Every fixture with those fields must be rejected before any send call.

