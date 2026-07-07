# Device Bridge Event Schema

This document defines the first Device Bridge event contract. It is documentation-only for Phase 1 and does not implement runtime code, UI integration, transport, hardware, or network behavior.

## Global Envelope

All future Device Bridge events must use this envelope:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventId": "evt_ephemeral_01",
  "eventType": "session_started",
  "emittedAt": "2026-06-26T16:10:54.000Z",
  "sessionId": "session_ephemeral_01",
  "source": "shime-quiz",
  "payload": {}
}
```

Required envelope fields:

- `schemaVersion`: exactly `shime-device-event-v1`.
- `eventId`: ephemeral event identifier.
- `eventType`: one of the event types defined below.
- `emittedAt`: ISO timestamp.
- `sessionId`: temporary session identifier. It must not be a persistent user or device id.
- `source`: `shime-quiz`.
- `payload`: event-specific object.

Allowed payload data by default:

- Event type.
- Temporary session id.
- Item index.
- Item type.
- Progress count.
- Total count.
- Coarse correctness status.
- Coarse score bucket.
- Coarse accuracy bucket.
- Due count bucket.
- Bridge status.
- Transport status.
- Mock command name.
- Redacted reason code.
- Redacted status message.

Phase 3 runtime allow-list:

- `itemIndex`
- `itemType`
- `progressCount`
- `totalCount`
- `status`
- `scoreBucket`
- `accuracyBucket`
- `dueCountBucket`
- `bridgeStatus`
- `transportStatus`
- `command`
- `reasonCode`
- `message`

Phase 3 strictness note: runtime validation rejects unknown top-level payload fields. Earlier examples in this document that mention `studyMode`, `correctness`, `correctCount`, `wrongCount`, `unansweredCount`, `unscoredCount`, `reason`, `errorCode`, or nested raw event data should be treated as pre-runtime planning examples, not allowed Phase 3 runtime payload fields.

Forbidden payload data by default:

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

## Common Values

Allowed `itemType` values:

- `multiple_choice`
- `short_answer`
- `flashcard`
- `unknown`

Allowed `studyMode` values:

- `standard`
- `due-review`
- `smart-practice`

Allowed `scoreBucket` values:

- `0-49`
- `50-59`
- `60-69`
- `70-79`
- `80-89`
- `90-100`
- `unscored`

Allowed `dueCountBucket` values:

- `0`
- `1-5`
- `6-10`
- `11-25`
- `26-plus`

Privacy levels:

- `low`: no learning content, only operational bridge status.
- `medium`: redacted learning progress or result summary.
- `high`: forbidden for default Device Bridge events.

## Event Types

### `session_started`

Purpose: announce that a study session started.

Required fields:

- Envelope fields.
- `payload.studyMode`.
- `payload.totalCount`.

Optional fields:

- `payload.progressCount`.

Example:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventId": "evt_001",
  "eventType": "session_started",
  "emittedAt": "2026-06-26T16:10:54.000Z",
  "sessionId": "session_abc",
  "source": "shime-quiz",
  "payload": {
    "studyMode": "smart-practice",
    "progressCount": 0,
    "totalCount": 10
  }
}
```

Forbidden fields: prompt, answers, choices, explanation, user answer, source metadata, full library, history, schedule, backup, settings.

Privacy level: medium.

Future mock default: may be emitted by default when mock bridge is explicitly enabled.

### `question_presented`

Purpose: announce that an item/question is shown. It must not include question text.

Required fields:

- Envelope fields.
- `payload.itemIndex`.
- `payload.totalCount`.
- `payload.itemType`.

Optional fields:

- `payload.studyMode`.
- `payload.progressCount`.

Example:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventId": "evt_002",
  "eventType": "question_presented",
  "emittedAt": "2026-06-26T16:11:02.000Z",
  "sessionId": "session_abc",
  "source": "shime-quiz",
  "payload": {
    "studyMode": "smart-practice",
    "itemIndex": 0,
    "progressCount": 0,
    "totalCount": 10,
    "itemType": "multiple_choice"
  }
}
```

Forbidden fields: prompt, question text, choices, answers, explanation, user answer, source metadata.

Privacy level: medium.

Future mock default: may be emitted by default when mock bridge is explicitly enabled.

### `answer_correct`

Purpose: announce a coarse correct result after local scoring/checking.

Required fields:

- Envelope fields.
- `payload.itemIndex`.
- `payload.totalCount`.
- `payload.itemType`.
- `payload.correctness`.

Optional fields:

- `payload.studyMode`.
- `payload.progressCount`.

Example:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventId": "evt_003",
  "eventType": "answer_correct",
  "emittedAt": "2026-06-26T16:11:28.000Z",
  "sessionId": "session_abc",
  "source": "shime-quiz",
  "payload": {
    "studyMode": "smart-practice",
    "itemIndex": 0,
    "progressCount": 1,
    "totalCount": 10,
    "itemType": "multiple_choice",
    "correctness": "correct"
  }
}
```

Forbidden fields: prompt, correct answer, acceptable answers, explanation, user typed answer, choices.

Privacy level: medium.

Future mock default: may be emitted by default when mock bridge is explicitly enabled.

### `answer_wrong`

Purpose: announce a coarse wrong/unanswered result after local scoring/checking.

Required fields:

- Envelope fields.
- `payload.itemIndex`.
- `payload.totalCount`.
- `payload.itemType`.
- `payload.correctness`.

Optional fields:

- `payload.studyMode`.
- `payload.progressCount`.

Example:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventId": "evt_004",
  "eventType": "answer_wrong",
  "emittedAt": "2026-06-26T16:12:10.000Z",
  "sessionId": "session_abc",
  "source": "shime-quiz",
  "payload": {
    "studyMode": "standard",
    "itemIndex": 1,
    "progressCount": 2,
    "totalCount": 10,
    "itemType": "short_answer",
    "correctness": "wrong"
  }
}
```

Forbidden fields: prompt, correct answer, acceptable answers, explanation, user typed answer, choices.

Privacy level: medium.

Future mock default: may be emitted by default when mock bridge is explicitly enabled.

### `review_due`

Purpose: announce a coarse due-review status. It must not include schedule records.

Required fields:

- Envelope fields.
- `payload.dueCountBucket`.

Optional fields:

- `payload.bridgeStatus`.

Example:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventId": "evt_005",
  "eventType": "review_due",
  "emittedAt": "2026-06-26T16:13:00.000Z",
  "sessionId": "session_abc",
  "source": "shime-quiz",
  "payload": {
    "dueCountBucket": "1-5",
    "bridgeStatus": "mock_enabled"
  }
}
```

Forbidden fields: review schedule records, item ids, prompts, answers, due timestamps for individual items.

Privacy level: medium.

Future mock default: may be emitted by default when mock bridge is explicitly enabled.

### `session_complete`

Purpose: announce a redacted session summary.

Required fields:

- Envelope fields.
- `payload.studyMode`.
- `payload.progressCount`.
- `payload.totalCount`.
- `payload.scoreBucket`.

Optional fields:

- `payload.correctCount`.
- `payload.wrongCount`.
- `payload.unansweredCount`.
- `payload.unscoredCount`.

Example:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventId": "evt_006",
  "eventType": "session_complete",
  "emittedAt": "2026-06-26T16:20:00.000Z",
  "sessionId": "session_abc",
  "source": "shime-quiz",
  "payload": {
    "studyMode": "smart-practice",
    "progressCount": 10,
    "totalCount": 10,
    "correctCount": 8,
    "wrongCount": 2,
    "unansweredCount": 0,
    "unscoredCount": 0,
    "scoreBucket": "80-89"
  }
}
```

Forbidden fields: full item results, prompts, answers, explanations, user typed answers, history records.

Privacy level: medium.

Future mock default: may be emitted by default when mock bridge is explicitly enabled.

### `robot_command_requested`

Purpose: record that the app requested a mock accessory action. In Phase 2 this is mock-only and must not control real hardware.

Required fields:

- Envelope fields.
- `payload.command`.

Optional fields:

- `payload.reason`.
- `payload.bridgeStatus`.

Example:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventId": "evt_007",
  "eventType": "robot_command_requested",
  "emittedAt": "2026-06-26T16:20:02.000Z",
  "sessionId": "session_abc",
  "source": "shime-quiz",
  "payload": {
    "command": "celebrate",
    "reason": "answer_correct",
    "bridgeStatus": "mock_enabled"
  }
}
```

Forbidden fields: prompt, answer, user answer, device address, endpoint, token, hardware id.

Privacy level: low.

Future mock default: must not be emitted automatically unless a future mock policy explicitly maps redacted study events to mock commands.

### `robot_command_acknowledged`

Purpose: record that mock transport acknowledged a requested command. This is not proof of real hardware execution.

Required fields:

- Envelope fields.
- `payload.command`.
- `payload.transportStatus`.

Optional fields:

- `payload.bridgeStatus`.

Example:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventId": "evt_008",
  "eventType": "robot_command_acknowledged",
  "emittedAt": "2026-06-26T16:20:03.000Z",
  "sessionId": "session_abc",
  "source": "shime-quiz",
  "payload": {
    "command": "celebrate",
    "bridgeStatus": "mock_enabled",
    "transportStatus": "mock_acknowledged"
  }
}
```

Forbidden fields: device address, endpoint, token, hardware id, prompt, answer, user answer.

Privacy level: low.

Future mock default: may be emitted by mock transport only in response to a mock request.

### `bridge_error`

Purpose: record a non-fatal bridge validation or transport error. It must be redacted and must not interrupt study flow.

Required fields:

- Envelope fields.
- `payload.bridgeStatus`.
- `payload.transportStatus`.
- `payload.errorCode`.

Optional fields:

- `payload.eventType`.

Example:

```json
{
  "schemaVersion": "shime-device-event-v1",
  "eventId": "evt_009",
  "eventType": "bridge_error",
  "emittedAt": "2026-06-26T16:21:00.000Z",
  "sessionId": "session_abc",
  "source": "shime-quiz",
  "payload": {
    "bridgeStatus": "mock_enabled",
    "transportStatus": "mock_failed",
    "errorCode": "invalid_event",
    "eventType": "answer_correct"
  }
}
```

Forbidden fields: raw failed payload, prompt, answers, user answers, stack traces containing private data, endpoints, tokens.

Privacy level: low.

Future mock default: may be emitted by mock bridge only when needed for diagnostics.

## Default Emission Rule

No event is emitted unless a future bridge is explicitly enabled. Phase 1 emits nothing because it contains docs only.

In future mock mode, events marked as "may be emitted by default" may be emitted only after explicit mock enablement and only through the redaction policy.
