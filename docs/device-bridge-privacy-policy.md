# Device Bridge Privacy Policy

This document defines privacy rules for future Device Bridge work. Phase 1 is documentation-only and adds no runtime bridge behavior.

## Data Minimization

Device Bridge events must contain the smallest useful payload. The default payload should describe coarse study status, not study content.

Allowed by default:

- Temporary session id.
- Event type.
- Item index.
- Item type.
- Progress count.
- Total count.
- Coarse correctness status.
- Coarse score bucket.
- Due count bucket.
- Bridge status.
- Transport status.

Not allowed by default:

- Full prompt.
- Correct answer.
- Acceptable answers.
- Explanation.
- User typed answer.
- Imported document content.
- Imported file names.
- Source metadata.
- Full study history.
- Backup payload.
- Settings payload.
- Exact private library content.

## Default-Off Rule

The bridge must be off by default. Installing or opening Shime-Quiz must not enable bridge behavior.

Future UI may expose a mock toggle only after runtime contract tests exist. Real transport requires a separate future approval.

## No Auto-Connect

The bridge must not auto-connect when the app opens. Any future real transport must require explicit user action.

No hidden pairing, automatic device discovery, or automatic reconnect loop is allowed by default.

## No Background Polling

Device Bridge must not poll devices or services in the background. Mock transport may record in-memory events during tests only.

Future real transport must define user-visible connection state and disconnect behavior before it can be considered.

## No Network By Default

Phase 1 and Phase 2 must not add network code.

Forbidden by default:

- WebSocket.
- MQTT.
- Web Bluetooth / BLE.
- Web Serial.
- HTTP bridge calls.
- Backend API calls.
- Cloud sync.
- Account/auth calls.
- AI API calls.

## Explicit User Action For Future Real Transport

Any future real transport must be:

- Optional.
- User-initiated.
- Permission-based where the browser/platform supports it.
- Clearly labeled as sending redacted status events to a device.
- Disconnectable.
- Non-fatal if it fails.

## Redacted Event Payload Examples

Correct answer event:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventType": "answer_correct",
  "sessionId": "session_ephemeral",
  "payload": {
    "itemIndex": 2,
    "itemType": "multiple_choice",
    "progressCount": 3,
    "totalCount": 10,
    "correctness": "correct"
  }
}
```

Due review event:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventType": "review_due",
  "sessionId": "session_ephemeral",
  "payload": {
    "dueCountBucket": "1-5"
  }
}
```

Session complete event:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventType": "session_complete",
  "sessionId": "session_ephemeral",
  "payload": {
    "progressCount": 10,
    "totalCount": 10,
    "scoreBucket": "80-89"
  }
}
```

## Data That Must Never Leave By Default

- Quiz prompts.
- Choice text.
- Correct answers.
- Acceptable answers.
- Explanations.
- User typed answers.
- Flashcard front/back content.
- Imported document text.
- Imported file names.
- EduGen/source metadata.
- Full library exports.
- Backup files.
- Settings payloads.
- Full history records.
- Full review schedule records.
- Any persistent user identifier.

## Transport Failure Safety

Bridge failure must never break study flow.

If future bridge validation or transport fails:

- Continue the study session.
- Do not alter answers.
- Do not alter scoring.
- Do not alter review scheduling.
- Do not alter FSRS state.
- Do not alter storage.
- Do not alter import/export/backup behavior.
- Optionally record a redacted `bridge_error` event in mock diagnostics.

## Future Real Device Warning Copy

Future UI copy should communicate this before any real transport is enabled:

> Device Bridge is optional. It sends only redacted study status such as progress, item type, and coarse correctness to your selected device. It does not send question text, answers, your typed responses, imported documents, backups, or full study history. Turn it off or disconnect anytime.

Future real transport must not be presented as required for learning. It is an accessory feature only.
