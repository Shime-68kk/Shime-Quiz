# Cognitive Companion Dev Tap

## Purpose

The Companion Dev Tap is a disabled-by-default developer/test observer for already-redacted Device Bridge events. It runs safe events through the Companion Kernel and keeps a bounded in-memory transcript for debugging.

## Architecture

```text
Device Bridge facade update
  -> injected dev tap runtime
  -> companion dev tap
  -> companion bridge pipeline
  -> redacted transcript snapshot
```

## Defaults

- Disabled by default.
- Does not subscribe on construction.
- Does not auto-connect.
- Does not persist transcripts.
- Does not send robot commands.
- Does not modify Device Bridge events.

## Observes

Only already-redacted/coarse Device Bridge event objects such as session started, question presented, answer correct/wrong, review due, session complete, and bridge error.

## Never Observes

Prompt text, question text, answer text, explanation, typed user answer, source metadata, settings, study history, backups, imported content, credentials, camera, audio, identity, or raw quiz payloads.

## Rollback

Remove the dev tap module and tests. No production runtime depends on it.
