# Beta Phase 3 Redaction Baseline

Baseline time: 2026-06-26T23:23:45+07:00

## What Changed

- Added `src/deviceBridge/redactionPolicy.js`.
  - Defines `FORBIDDEN_DEVICE_EVENT_KEYS`.
  - Defines `ALLOWED_DEVICE_PAYLOAD_KEYS`.
  - Recursively detects forbidden sensitive keys.
  - Sanitizes payloads without mutating caller input.
  - Strictly rejects unknown top-level payload fields to match the Phase 2 runtime schema.
  - Returns privacy-safe failure objects without embedding rejected payload content.
- Added `src/deviceBridge/studyEventFactories.js`.
  - Creates privacy-safe events for `session_started`, `question_presented`, `answer_correct`, `answer_wrong`, `review_due`, `session_complete`, and `bridge_error`.
  - Calls `createDeviceEvent()` internally.
  - Sanitizes and validates payloads before returning events.
  - Returns `{ ok: true, event }` or `{ ok: false, reason, message, issues }`.
- Updated `src/deviceBridge/deviceEventSchema.js`.
  - Reuses the shared redaction policy for payload validation.
- Updated `src/deviceBridge/index.js`.
  - Exports the redaction policy helpers and safe event factories.
- Added unit tests for redaction policy and event factories.
- Clarified `docs/device-bridge-event-schema.md` with the Phase 3 runtime payload allow-list and strict unknown-field behavior.

## Redaction Rules

Allowed payload keys:

- `itemIndex`
- `itemType`
- `progressCount`
- `totalCount`
- `status`
- `scoreBucket`
- `accuracyBucket`
- `dueCountBucket`
- `bridgeStatus`
- `transportStatus`
- `command`
- `reasonCode`
- `message`

Forbidden payload keys include:

- `prompt`
- `question`
- `front`
- `back`
- `correctAnswer`
- `answer`
- `acceptableAnswers`
- `explanation`
- `userAnswer`
- `typedAnswer`
- `sourceMetadata`
- `sourceName`
- `importedFileName`
- `importedDocumentName`
- `rawText`
- `cleanedText`
- `backupPayload`
- `settings`
- `studyHistory`
- `fullHistory`

Unknown top-level payload fields are rejected rather than silently dropped. This preserves the Phase 2 schema behavior and avoids accidentally expanding what can be emitted later.

## What Was Not Implemented

- No StudyRoom integration.
- No UI changes.
- No Device Bridge auto-emission.
- No real transport.
- No WebSocket, MQTT, BLE, Web Serial, backend, cloud, auth, or AI API calls.
- No scheduler, FSRS, review schedule, study history, storage, import, backup, learning-data, EduGen, or service changes.

## Files Changed

- `src/deviceBridge/redactionPolicy.js`
- `src/deviceBridge/studyEventFactories.js`
- `src/deviceBridge/deviceEventSchema.js`
- `src/deviceBridge/index.js`
- `tests/unit/deviceBridgeRedactionPolicy.test.js`
- `tests/unit/deviceBridgeStudyEventFactories.test.js`
- `docs/device-bridge-event-schema.md`
- `docs/beta-phase-3-redaction.md`

## Commands Run

- `npx vitest run tests/unit/deviceBridgeRedactionPolicy.test.js tests/unit/deviceBridgeStudyEventFactories.test.js`
- `npx vitest run tests/unit/deviceBridgeEventSchema.test.js tests/unit/deviceBridgeMockTransport.test.js tests/unit/deviceBridgeRuntime.test.js tests/unit/deviceBridgeRedactionPolicy.test.js tests/unit/deviceBridgeStudyEventFactories.test.js`
- `npm run build`
- `npm run test:unit`

## Test Results

- Initial targeted Phase 3 test run: failed because one test asserted that the serialized event must not contain the substring `answer`; valid event type `answer_wrong` contains that schema term. The assertion was narrowed to payload keys.
- Targeted Phase 3 tests after correction: PASS, 2 files / 17 tests.
- Full Device Bridge tests: PASS, 5 files / 37 tests.
- Build: PASS. Vite reported the existing large chunk warning for `dist/assets/index-9byO3eFa.js`; no build failure.
- Full unit suite: PASS, 74 files / 2767 tests.

## Phase 4 Readiness

Phase 4 can safely start only as an optional local-only integration layer that consumes the safe factories. It should not pass raw StudyRoom item data, raw answers, source metadata, storage records, or backup data into Device Bridge.

Recommendation: `SAFE_FOR_PHASE_4`.
