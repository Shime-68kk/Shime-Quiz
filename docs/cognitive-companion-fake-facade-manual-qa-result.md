# Cognitive Companion Fake Facade Manual QA Result

Date: 2026-06-27 07:48:04 +07

## Scope

Manual QA scope is limited to the dev-only fake facade harness:

- `tools/deviceBridge/fakeCompanionFacade.mjs`
- `tools/deviceBridge/companionDevTapQaHarness.mjs`
- `tools/deviceBridge/companionDevTapQaTranscript.mjs`

No production UI, StudyRoom integration, real Device Bridge runtime, ESP32 firmware, WebSocket transport, storage, cloud, or robot hardware is part of this QA result.

## Expected Evidence

- Fake facade starts with no external send capability.
- Companion Dev Tap runtime starts disabled.
- Event emitted before enable is ignored.
- Runtime only observes events after explicit `enable()`.
- Redacted/coarse fixture events are accepted.
- Sensitive attack fixture is rejected.
- Runtime unsubscribes on disable.
- Event emitted after disable is ignored.
- Transcript is bounded and redacted.
- No robot command is sent externally.
- No persistence is used.

## Result

Result: PASS

Observed by command:

```bash
node tools/deviceBridge/companionDevTapQaHarness.mjs
```

Expected harness summary:

```text
[COMPANION TAP QA] result=PASS
```

## Privacy Evidence

The transcript must only show event type, accept/reject status, companion intent, tone/safety labels, robot command intent label, reason codes, and privacy status.

It must not include raw prompt, question, answer, correct answer, explanation, user answer, source metadata, settings, study history, backup payload, imported document text, library item content, raw quiz payload, camera frames, audio recording, or biometric identity.

## Remaining Limits

This PASS result is only for the fake facade harness. It does not authorize production companion UI, robot motion, WebSocket-to-robot command sending, real ESP32 behavior, AI API calls, storage persistence, or automatic subscription.

