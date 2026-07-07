# Device Bridge Architecture

This document defines the Phase 1 contract architecture for a future optional Device Bridge. Phase 1 is documentation-only: no runtime bridge code, no UI integration, no transport, no hardware support, and no StudyRoom wiring.

## Purpose

Device Bridge is a future optional accessory boundary that may let Shime-Quiz emit redacted study-status events to a mock transport first, and later to a user-approved local device transport.

The bridge is intended for lightweight external feedback such as progress indicators, simple encouragement, or robot accessory reactions. It is not part of the learning engine and must never become required for study, scoring, scheduling, importing, backup, restore, or analytics.

## Non-Goals

Phase 1 does not add:

- DeviceBridge runtime code.
- `src/deviceBridge/**`.
- StudyRoom event emission.
- Settings UI or debug panels.
- ESP32 integration.
- Robot control.
- WebSocket, MQTT, BLE, Web Bluetooth, Web Serial, or any other real transport.
- Backend, cloud, auth, account, sync, or AI API calls.
- Storage, scheduler, FSRS, review schedule, study history, import, backup, or learning-data changes.

Future Device Bridge work must not send quiz content, answers, imported documents, backups, or private learning records to a device by default.

## Local-First Constraints

Shime-Quiz remains local-first. Device Bridge must be optional, default-off, user-initiated, and removable without migration.

The local app remains the source of truth. A bridge transport is only a consumer of redacted event summaries. It must not write study state, schedule state, history state, backup data, library data, or settings data unless a later phase explicitly introduces a reviewed local-only setting boundary.

Bridge failure must never break study flow. A failed emit should return or record a non-fatal bridge error. It must not change scoring, scheduling, persistence, import, backup, or restore behavior.

## Why Phase 1 Is Docs-Only

Device integration has privacy and architecture risk. The contract must be stable before any UI or runtime code consumes it.

Phase 1 therefore defines:

- Event envelope.
- Event types.
- Allowed payload data.
- Forbidden payload data.
- Privacy/redaction rules.
- Error and failure behavior.
- Future extension boundaries.

Runtime code starts only in Phase 2, with an isolated mock bridge and unit tests.

## Future Architecture

Future phases should follow this direction:

```text
Study flow
  -> sanitized learning event
  -> DeviceBridge
  -> MockTransport
  -> optional future real transport
```

Layer responsibilities:

- Study flow: produces learning state internally, but does not know device details.
- Sanitized learning event: strips private fields and uses the schema in `docs/device-bridge-event-schema.md`.
- DeviceBridge: validates envelope and payload, enforces default-off behavior, contains failures.
- MockTransport: in-memory test/development transport only.
- Optional future real transport: explicitly approved later, user-initiated, and never default.

## ESP32 / Robot Boundary

ESP32 or robot integration is future optional accessory behavior. It is not core learning logic.

Allowed future robot behavior should be limited to redacted status reactions such as:

- Celebrate correct answer.
- Encourage after wrong answer.
- Show due-review indicator.
- Show session-complete status.

Forbidden default robot behavior:

- Receive prompts.
- Receive correct answers.
- Receive user typed answers.
- Store study history.
- Influence scheduler decisions.
- Influence scoring.
- Import, export, backup, restore, or sync data.

## Failure Safety

Every future bridge emit should be safe to ignore. If bridge validation or transport fails:

- Study continues.
- The user answer remains unchanged.
- Scoring remains unchanged.
- Scheduler remains unchanged.
- Local persistence remains unchanged.
- Backup/import/export remain unchanged.
- A redacted `bridge_error` event may be generated for mock diagnostics.

## Phase Boundaries

Phase 1: docs and schema only.

Phase 2: isolated mock DeviceBridge modules and unit tests. No StudyRoom integration.

Phase 3: UI mock integration consuming public DeviceBridge API only.

Real transport: future phase only, after explicit human approval.
