# Cognitive Companion Fake Facade QA

Date: 2026-06-27 07:48:04 +07

## Purpose

This QA harness validates the dev-only Companion Tap path without using the production Device Bridge runtime, StudyRoom, Settings UI, ESP32 firmware, WebSocket transport, storage, cloud, or robot hardware.

The harness exists to prove that a simulated Device Bridge facade can feed redacted/coarse learning events into the Companion Tap pipeline while preserving the current safety boundaries:

- The tap is disabled by default.
- Manual enable is required before events are observed.
- Pre-enable events are ignored.
- Sensitive payload keys are rejected by the companion privacy guard.
- Transcript output is bounded and redacted.
- Robot commands are only simulated as intent labels.
- No external send path is used.

## Architecture Under Test

```text
tools/deviceBridge/fakeCompanionFacade.mjs
  -> src/companion/companionDevTapRuntime.js
  -> src/companion/companionDevTap.js
  -> src/companion/companionBridgePipeline.js
  -> bounded redacted transcript
```

This is a dev/test harness only. It does not wire the real shared Device Bridge facade, Settings panel, StudyRoom route, WebSocket transport, ESP32 parser, or external robot project.

## Commands

Run the fake facade QA harness:

```bash
node tools/deviceBridge/companionDevTapQaHarness.mjs
```

Run the product-readable transcript:

```bash
node tools/deviceBridge/companionDevTapQaTranscript.mjs
```

Run focused Phase 24 tests:

```bash
npx vitest run tests/unit/companionDevTapFakeFacade.test.js tests/unit/companionDevTapQaFixtures.test.js tests/unit/companionDevTapQaHarness.test.js tests/unit/companionDevTapManualQaEvidence.test.js
```

## PASS Criteria

- Harness result is `PASS`.
- `disabledByDefault=yes`.
- `preEnableIgnored=yes`.
- `manualEnableRequired=yes`.
- `noExternalSend=yes`.
- `noPersistence=yes`.
- `unsubscribeWorks=yes`.
- At least one safe event is accepted.
- At least one sensitive attack event is blocked.
- Transcript does not include raw prompt/question/answer/source/settings/history/backup content.

## What This Does Not Prove

This harness does not prove production UI behavior, live StudyRoom behavior, real Device Bridge transport behavior, WebSocket compatibility, ESP32 firmware compatibility, robot motion behavior, or any cloud/AI behavior. Those remain separate gates.

