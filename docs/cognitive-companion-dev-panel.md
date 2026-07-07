# Cognitive Companion Dev Panel

Date: 2026-06-27 07:55:59 +07

## Purpose

The Companion Dev Panel is a developer-only visualization surface for the Companion Kernel. It lets developers replay fake, redacted/coarse scenarios and inspect how the kernel converts safe learning signals into companion intent, tone, safety outcome, planned robot command labels, reason codes, privacy status, and transcript summary.

## Fake-Only Boundary

The panel is fake-facade/scenario playback only. It does not subscribe to StudyRoom, the production Device Bridge runtime, WebSocket transport, ESP32 firmware, backend services, or external robot projects.

It is mounted in Settings as a dev-only diagnostic panel, but it starts disabled and requires an explicit click before any scenario playback runs.

## What It Shows

- Enabled/disabled state.
- Observed, accepted, rejected, and blocked-sensitive counts.
- Last companion intent.
- Last planned robot command label.
- Last safety governor outcome.
- Transcript rows with step, event type, accepted/rejected status, companion intent, tone, safety outcome, planned command label, reason codes, and privacy status.

## What It Never Does

- No production Device Bridge subscription.
- No live StudyRoom event subscription.
- No robot command sending.
- No ESP32/WebSocket/MQTT/BLE/Web Serial connection.
- No storage or URL persistence.
- No AI, cloud, backend, auth, telemetry, camera, or microphone behavior.
- No robot motion.
- No raw quiz content display.

## Privacy Protection

Valid scenarios only use redacted/coarse fields such as event type, temporary session id, item index, item type, progress count, total count, coarse correctness status, score/accuracy bucket, due-count bucket, transport status, and reason code.

The sensitive attack scenario intentionally contains forbidden keys inside the local test fixture so the privacy guard can prove it blocks them. The panel display receives only sanitized transcript entries and never renders the unsafe fixture values.

## Not Production Integration

This panel is not the premium companion UI, not a live robot control UI, and not a production integration. It is a visualization harness for reviewing the kernel's decisions before any future live companion panel or robot behavior is considered.

## Future Premium UX Preparation

The panel helps validate the shape of future premium UX states: calm encouragement, focus cues, celebration, error handling, safety blocks, and privacy status. Future UI work should continue to consume only redacted/coarse decision summaries and keep command sending behind separate explicit gates.

