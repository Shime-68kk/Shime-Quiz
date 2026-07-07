# Beta Phase 24: Fake Facade Companion Tap QA

Date: 2026-06-27 07:48:04 +07

## What Was Done

- Added a dev/test-only fake companion facade for simulated Device Bridge updates.
- Added redacted/coarse QA fixtures, including valid session events and an invalid sensitive attack fixture.
- Added a QA harness that proves disabled-by-default behavior, manual enable, pre-enable ignore, sensitive block, disable/unsubscribe, and no external send.
- Added a product-readable transcript generator that avoids raw payload output.
- Added focused unit tests for the fake facade, fixtures, harness, and manual QA evidence.
- Added documentation for how to run and interpret the fake facade QA.

## Files Changed

- `tools/deviceBridge/fakeCompanionFacade.mjs`
- `tools/deviceBridge/companionDevTapQaFixtures.mjs`
- `tools/deviceBridge/companionDevTapQaHarness.mjs`
- `tools/deviceBridge/companionDevTapQaTranscript.mjs`
- `tests/unit/companionDevTapFakeFacade.test.js`
- `tests/unit/companionDevTapQaFixtures.test.js`
- `tests/unit/companionDevTapQaHarness.test.js`
- `tests/unit/companionDevTapManualQaEvidence.test.js`
- `docs/cognitive-companion-fake-facade-qa.md`
- `docs/cognitive-companion-fake-facade-manual-qa-result.md`
- `docs/beta-phase-24-fake-facade-companion-tap-qa.md`

## What Was Not Done

- No StudyRoom changes.
- No Settings UI changes.
- No production Device Bridge runtime changes.
- No ESP32 firmware changes.
- No external robot project changes.
- No package or lockfile changes.
- No network, storage, telemetry, cloud, auth, or AI API code.
- No robot command sending to WebSocket, ESP32, or hardware.
- No persistence or auto-subscribe behavior.

## Validation Commands

```bash
node tools/deviceBridge/companionDevTapQaHarness.mjs
node tools/deviceBridge/companionDevTapQaTranscript.mjs
npx vitest run tests/unit/companionDevTapFakeFacade.test.js tests/unit/companionDevTapQaFixtures.test.js tests/unit/companionDevTapQaHarness.test.js tests/unit/companionDevTapManualQaEvidence.test.js
npx vitest run tests/unit/companionDevTap.test.js tests/unit/companionDevTapRuntime.test.js tests/unit/companionDevTapPrivacy.test.js tests/unit/companionDevTapDeviceBridgeIntegration.test.js
npx vitest run tests/unit/companionBridgePipeline.test.js tests/unit/companionEndToEndPrivacy.test.js tests/unit/companionEndToEndRegression.test.js
npx vitest run tests/unit/deviceBridgeSerialParserQaFixtures.test.js tests/unit/deviceBridgeFirmwareSafety.test.js tests/unit/deviceBridgeWebSocketHardening.test.js
npm run build
npm run test:unit
```

## Validation Results

- Fake facade QA harness: PASS.
- Product-readable transcript: PASS; redacted/coarse output only.
- Focused Phase 24 tests: PASS, 4 files / 10 tests.
- Existing Companion Dev Tap tests: PASS, 4 files / 15 tests.
- Existing Companion simulation/privacy tests: PASS, 3 files / 10 tests.
- Existing Device Bridge firmware/WebSocket safety tests: PASS, 3 files / 21 tests.
- Build: PASS.
- Full unit suite: PASS, 117 files / 3001 tests.

Harness summary:

```text
[COMPANION TAP QA] disabledByDefault=yes
[COMPANION TAP QA] preEnableIgnored=yes
[COMPANION TAP QA] manualEnableRequired=yes
[COMPANION TAP QA] observed=5 accepted=4 rejected=1 transcript=5
[COMPANION TAP QA] blockedSensitive=1
[COMPANION TAP QA] noExternalSend=yes noPersistence=yes unsubscribeWorks=yes
[COMPANION TAP QA] result=PASS
```

Safety scan result:

- No Phase 24 network, storage, telemetry, cloud, auth, AI API, or robot send path was added.
- Sensitive terms appear only in forbidden-key lists, negative test fixtures, negative assertions, docs, or allowed event type names such as `question_presented`, `answer_correct`, and `answer_wrong`.
- Existing WebSocket credential rejection code remains outside this phase's changed files.

## Safety Gate

Recommendation: SAFE_FOR_PHASE_25_DEV_COMPANION_PANEL
