# Device Bridge Robot Protocol

Protocol version: `shime-robot-protocol-v0`

The robot protocol is an accessory protocol. It is not a learning data protocol.

## Outbound App To Robot Envelope

```json
{
  "protocolVersion": "shime-robot-protocol-v0",
  "messageId": "robot_msg_example",
  "messageType": "robot_event",
  "emittedAt": "2026-06-27T00:00:00.000Z",
  "source": "shime-quiz",
  "payload": {
    "eventType": "answer_correct",
    "sessionId": "studyroom_session_example",
    "data": {
      "itemIndex": 2,
      "itemType": "multiple_choice",
      "progressCount": 3,
      "totalCount": 10,
      "status": "correct"
    }
  }
}
```

## Allowed Message Types

- `robot_event`
- `robot_command`
- `robot_status_request`
- `robot_disconnect`
- `robot_ping`

## Allowed Robot Event Names

- `session_started`
- `question_presented`
- `answer_correct`
- `answer_wrong`
- `review_due`
- `session_complete`
- `bridge_error`

## Allowed Robot Command Names

- `celebrate`
- `encourage`
- `neutral`
- `focus`
- `session_complete`
- `due_review`
- `error_signal`

## Inbound Robot To App

Allowed inbound message types for future research:

- `ack`
- `status`
- `error`
- `pong`

Inbound robot messages must never modify scoring, review schedule, study history, imports, backup, settings, or the library. At most, they may update connection/debug status.

## Forbidden By Default

These must not be sent to a robot by default:

- prompt
- question
- answer
- correctAnswer
- explanation
- userAnswer
- sourceMetadata
- settings
- studyHistory
- backupPayload
- imported file names
- document text

## Rate Guidance

Phase 11 does not implement rate limiting. A future real transport must include a small rate guard before any physical robot behavior is enabled, especially for repeated question and answer events.

