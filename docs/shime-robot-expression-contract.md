# Shime Robot Expression Contract

## Purpose

The robot expression contract defines what Shime Robot may do in a future expression-only phase. It keeps the robot as an embodiment endpoint, not a learning-data owner or command authority.

## Current Safe Scope

- Schema and validation only.
- Dry-run only.
- No robot command sending.
- No transport connection.
- No motion.
- No StudyRoom, DeviceBridge runtime, firmware, scheduler, storage, import, backup, or EduGen changes.

## Allowed Channels

- `display_expression`
- `led_expression`
- `sound_cue`
- `idle_presence`
- `attention_hint`
- `no_op`

## Forbidden Channels

- Motor, wheel, or servo motion.
- Physical pushing or autonomous navigation.
- Camera or microphone capture.
- Raw data display or speech from raw content.
- Schedule mutation.
- Notification sending.
- Robot command sending.

## Safety Model

Every valid expression contract requires `motionPolicy: locked`, `dryRunOnly: true`, `sendStatus: not_sent`, safe privacy status, and reason codes.

## Manual QA Guidance

Verify generated expression previews show labels only and never expose raw learning content or a send/control path.
