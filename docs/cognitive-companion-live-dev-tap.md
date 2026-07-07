# Cognitive Companion Live Dev Tap

Date: 2026-06-27 08:16:59 +07

## Purpose

The live dev tap lets developers manually observe already-redacted Device Bridge events through the Companion Brain Panel. It is a development diagnostic surface for checking Companion Kernel decisions against real in-app Device Bridge event flow.

This is not production companion integration.

## Architecture

```text
Settings -> CompanionDevPanel
  explicit Enable live dev tap click
    -> createCompanionDevTapRuntime({ facade: getSharedDeviceBridgeFacade() })
      -> facade.subscribe(listener)
        -> facade_event_sent only
          -> Companion Dev Tap
            -> Companion Bridge Pipeline
              -> sanitized in-memory transcript
```

The panel imports the shared facade getter only from `src/deviceBridge/index.js`. It does not import WebSocket transport internals, StudyRoom, storage, or service modules.

## Why Observe-Only

The live tap is intentionally one-way. It observes Device Bridge updates and derives Companion Kernel decisions for display. Planned robot command labels are shown only as internal decision output. Nothing is sent to ESP32, WebSocket, robot hardware, cloud, or any backend.

## How It Subscribes

The panel does not subscribe on mount. It creates and enables `createCompanionDevTapRuntime` only when the developer clicks `Enable live dev tap`.

The runtime unsubscribes when:

- `Disable live dev tap` is clicked.
- The panel unmounts.

## What It Observes

Only `facade_event_sent` updates from the shared Device Bridge facade are observed. Those events are expected to be Device Bridge events already constrained by the redaction/event-factory path.

## What It Never Observes

- Raw quiz prompts.
- Correct answers.
- User typed answers.
- Explanations.
- Source metadata.
- Study history.
- Backup payloads.
- Settings payloads.
- Imported document text.
- Camera, microphone, biometric, or raw sensor content.

## Robot Command Boundary

The Companion Kernel may produce a planned robot command label, such as focus, encourage, neutral, or session_complete. The live dev tap displays that label only. It does not call robot send APIs, WebSocket sends, ESP32 firmware, or motion controls.

## Privacy Boundary

Transcript rows contain only step, event type, accepted/rejected status, companion intent, tone, safety outcome, planned command label, reason codes, and privacy status. Event payload JSON is not rendered.

Sensitive events are rejected by the existing companion privacy guard and shown as blocked summaries only.

## Rollback Plan

Rollback is limited to removing the live section from `CompanionDevPanel.jsx`, the live model helpers from `companionDevPanelModel.js`, and the optional runtime callback from `companionDevTapRuntime.js`. No StudyRoom, Device Bridge runtime, storage, import, backup, scheduler, FSRS, ESP32, or external robot code is involved.

