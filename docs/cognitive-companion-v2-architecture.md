# Cognitive Companion V2 Architecture

Date: 2026-06-27 09:35:19 +07

V2 exists to improve local companion decision quality without changing production study behavior.

Flow:

```text
redacted/coarse event
  -> companionSessionModel
  -> companionAdaptivePolicy
  -> companionHysteresis + behavior memory
  -> decision audit
  -> quality scoring
  -> replay benchmark
```

All modules are deterministic and local. They do not use storage, network, AI APIs, telemetry, robot transport, StudyRoom imports, Device Bridge runtime mutation, or ESP32 firmware.

## Modules

- `companionSessionModel.js`: bounded session state from coarse signals.
- `companionBehaviorMemory.js`: short-lived anti-spam memory.
- `companionHysteresis.js`: smooths overreactions and repeated behavior.
- `companionAdaptivePolicy.js`: session-aware intent/tone/action-family policy.
- `companionQualityScoring.js`: privacy, safety, calmness, helpfulness, non-spam, determinism, robot safety, and premium-feel scoring.
- `companionReplayBenchmark.js`: scenario benchmark runner.
- `companionDecisionAudit.js`: dry-run audit records without payloads.

## Safety Boundaries

V2 is simulation-only. It does not send robot commands and does not alter StudyRoom, scoring, storage, import, backup, review scheduling, Device Bridge transport, or firmware behavior.

