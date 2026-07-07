# Cognitive Companion Bridge Simulation

## Architecture

```text
Device Bridge event
  -> companion bridge pipeline
  -> learning reducer
  -> companion context
  -> policy engine
  -> safety governor
  -> robot intent planner
  -> robot protocol adapter
  -> transcript/report only
```

This is not live integration. It does not modify StudyRoom, Settings UI, Device Bridge runtime, ESP32 firmware, or the external robot project.

## Safe Inputs

- `eventType`
- `sessionId`
- `itemIndex`
- `itemType`
- `progressCount`
- `totalCount`
- `dueCountBucket`
- `scoreBucket`
- `accuracyBucket`
- `status`
- `transportStatus`
- coarse robot presence buckets

## Forbidden Inputs

Prompt/question/answer text, explanations, typed user answers, source metadata, settings, history, backups, imported document content, credentials, camera, audio, identity, and raw quiz payloads.

## Outputs

Outputs are deterministic transcript entries, reports, safe robot intents, and protocol-safe command envelopes. Nothing is sent.

## Run

```bash
node tools/deviceBridge/companionBridgeSimulator.mjs
```

Interpret transcript lines by reading event acceptance, companion intent, safety outcome, robot command, privacy status, and reason codes.
