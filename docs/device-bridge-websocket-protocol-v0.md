# Device Bridge WebSocket Protocol v0

Protocol version: `shime-ws-robot-v0`

This protocol is for optional local accessory behavior only. It is not a learning data sync protocol.

## Common Envelope

Every message includes:

- `protocolVersion`
- `messageId`
- `messageType`
- `emittedAt`
- `source`
- `payload`

## App To ESP32 Message Types

- `hello`
- `robot_event`
- `robot_command`
- `ping`
- `disconnect`

## ESP32 To App Message Types

- `hello_ack`
- `ack`
- `status`
- `error`
- `pong`

## Allowed Event Names

- `session_started`
- `question_presented`
- `answer_correct`
- `answer_wrong`
- `review_due`
- `session_complete`
- `bridge_error`

## Allowed Robot Commands

- `celebrate`
- `encourage`
- `neutral`
- `focus`
- `session_complete`
- `due_review`
- `error_signal`

## Forbidden Payload Fields

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
- imported document text
- library item content
- raw quiz payload

## Examples

### Hello

```json
{
  "protocolVersion": "shime-ws-robot-v0",
  "messageId": "msg_hello_001",
  "messageType": "hello",
  "emittedAt": "2026-06-27T00:00:00.000Z",
  "source": "shime-quiz",
  "payload": {
    "bridgeStatus": "enabled",
    "transportStatus": "connecting"
  }
}
```

### Hello Ack

```json
{
  "protocolVersion": "shime-ws-robot-v0",
  "messageId": "msg_hello_ack_001",
  "messageType": "hello_ack",
  "emittedAt": "2026-06-27T00:00:01.000Z",
  "source": "shime-esp32",
  "payload": {
    "transportStatus": "connected",
    "message": "protocol_ready"
  }
}
```

### Answer Correct To Celebrate

```json
{
  "protocolVersion": "shime-ws-robot-v0",
  "messageId": "msg_correct_001",
  "messageType": "robot_event",
  "emittedAt": "2026-06-27T00:00:02.000Z",
  "source": "shime-quiz",
  "payload": {
    "eventType": "answer_correct",
    "sessionId": "studyroom_session_local",
    "itemIndex": 2,
    "itemType": "multiple_choice",
    "progressCount": 3,
    "totalCount": 10,
    "status": "correct",
    "command": "celebrate"
  }
}
```

### Answer Wrong To Encourage

```json
{
  "protocolVersion": "shime-ws-robot-v0",
  "messageId": "msg_wrong_001",
  "messageType": "robot_event",
  "emittedAt": "2026-06-27T00:00:03.000Z",
  "source": "shime-quiz",
  "payload": {
    "eventType": "answer_wrong",
    "sessionId": "studyroom_session_local",
    "itemIndex": 3,
    "itemType": "short_answer",
    "progressCount": 4,
    "totalCount": 10,
    "status": "wrong",
    "command": "encourage"
  }
}
```

### Session Complete

```json
{
  "protocolVersion": "shime-ws-robot-v0",
  "messageId": "msg_complete_001",
  "messageType": "robot_command",
  "emittedAt": "2026-06-27T00:00:04.000Z",
  "source": "shime-quiz",
  "payload": {
    "command": "session_complete",
    "progressCount": 10,
    "totalCount": 10,
    "scoreBucket": "80_100",
    "accuracyBucket": "80_100"
  }
}
```

### Review Due

```json
{
  "protocolVersion": "shime-ws-robot-v0",
  "messageId": "msg_due_001",
  "messageType": "robot_command",
  "emittedAt": "2026-06-27T00:00:05.000Z",
  "source": "shime-quiz",
  "payload": {
    "command": "due_review",
    "dueCountBucket": "1_5"
  }
}
```

### Bridge Error

```json
{
  "protocolVersion": "shime-ws-robot-v0",
  "messageId": "msg_error_signal_001",
  "messageType": "robot_command",
  "emittedAt": "2026-06-27T00:00:06.000Z",
  "source": "shime-quiz",
  "payload": {
    "command": "error_signal",
    "reasonCode": "transport_disconnected",
    "transportStatus": "disconnected"
  }
}
```

### Invalid Message Rejection

```json
{
  "protocolVersion": "shime-ws-robot-v0",
  "messageId": "msg_reject_001",
  "messageType": "error",
  "emittedAt": "2026-06-27T00:00:07.000Z",
  "source": "shime-esp32",
  "payload": {
    "reasonCode": "invalid_payload",
    "message": "message_rejected"
  }
}
```

## Rules

- Unknown message types are ignored or rejected with `error`.
- Robot inbound messages never change scoring, history, schedule, import, backup, settings, or library data.
- The app validates and redacts before sending.
- The ESP32 never requests sensitive content.

