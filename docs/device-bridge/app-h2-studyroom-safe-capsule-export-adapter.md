# APP-H2 — StudyRoom Safe Capsule Export Adapter

## Status token
APP_H2_STUDYROOM_SAFE_CAPSULE_EXPORT_ADAPTER_STATUS: APP_H2_STUDYROOM_SAFE_CAPSULE_EXPORT_ADAPTER_DEFINED

## Purpose
APP-H2 defines a pure app-side adapter that converts sanitized, derived StudyRoom session summary metrics into an APP-H1 Safe Learning Capsule.

APP-H2 does not enable a real Device Bridge, serial transport, WebSocket transport, robot connection, firmware path, robot writes, motion, cloud/backend sync, telemetry, AI calls, UI changes, or production StudyRoom runtime wiring.

## APP-H1 dependency
APP-H2 depends on the APP-H1 contract in `src/deviceBridge/safeLearningCapsule.js` and preserves the APP-H1 checksum rule:

`checksum32(capsuleId|sourceType|safeSummaryCode)`

The adapter calls the APP-H1 capsule creation and validation utilities before returning output.

## Adapter file
The adapter lives in `src/deviceBridge/studyRoomSafeCapsuleAdapter.js`.

It exports:

- `STUDYROOM_SAFE_SUMMARY_ALLOWED_FIELDS`
- `validateStudyRoomSafeSummaryInput(summary)`
- `createStudyRoomSafeLearningCapsule(summary)`

## Allowed input shape
The adapter accepts only sanitized, abstract, derived StudyRoom metrics:

- `capsuleId`
- `sourceType`
- `createdAtBucket`
- `monotonicImportId`
- `correctCount`
- `incorrectCount`
- `totalCount`
- `dueReviewCount`
- `dueReviewCountBucket`
- `durationMs`
- `sessionDurationBucket`
- `recentAccuracyBucket`
- `userEnergySelfReportBucket`
- `focusNeedSignalBucket`

Unknown input fields are rejected.

## Allowed output fields
The adapter output must contain only the APP-H1 capsule fields:

- `schemaVersion`
- `capsuleId`
- `sourceType`
- `createdAtBucket`
- `monotonicImportId`
- `learningStateBucket`
- `studyLoadBucket`
- `reviewUrgencyBucket`
- `sessionMoodBucket`
- `sessionEnergyBucket`
- `focusNeedBucket`
- `recommendedCompanionAction`
- `companionTone`
- `safeSummaryCode`
- `expirationBucket`
- `privacyClass`
- `checksum`

## Derived bucket mapping
APP-H2 maps only coarse derived inputs into:

- `learningStateBucket`
- `studyLoadBucket`
- `reviewUrgencyBucket`
- `sessionMoodBucket`
- `sessionEnergyBucket`
- `focusNeedBucket`
- `recommendedCompanionAction`
- `companionTone`
- `safeSummaryCode`
- `expirationBucket`
- `privacyClass`

The adapter never needs raw quiz text, raw answers, raw explanations, source metadata, raw study history, raw FSRS logs, RF identifiers, credentials, tokens, secrets, or passwords.

## Forbidden input and output
The adapter rejects raw quiz, raw study, raw document, raw RF, credential, token, secret, password, and unknown fields before creating a capsule.

Forbidden examples include:

- `prompt`
- `question`
- `answer`
- `correctAnswer`
- `explanation`
- `userAnswer`
- `sourceMetadata`
- `settings`
- `studyHistory`
- `rawQuizPayload`
- `importedDocumentText`
- document text
- raw FSRS review logs
- per-card IDs that can reconstruct study history
- `SSID`
- `BSSID`
- `MAC`
- raw AP lists
- `credentials`
- `tokens`
- `secrets`
- `passwords`

## Fixtures
APP-H2 fixtures live in `tests/fixtures/studyroom-safe-capsule-adapter/`:

- `valid-derived-summary.json`
- `invalid-raw-question.json`
- `invalid-raw-answer.json`
- `invalid-study-history.json`
- `invalid-source-metadata.json`
- `invalid-document-text.json`
- `invalid-rf-fields.json`
- `invalid-secrets.json`
- `invalid-unknown-field.json`

## Validation coverage
`tests/unit/studyRoomSafeCapsuleAdapter.test.js` verifies:

- valid derived summary exports a valid APP-H1 capsule
- checksum matches the APP-H1 and robot rule
- raw question field is rejected
- raw answer field is rejected
- raw study history is rejected
- raw source metadata is rejected
- raw document text is rejected
- raw RF fields are rejected
- secrets and tokens are rejected
- unknown fields are rejected
- malformed input is rejected
- output contains only allowed capsule fields
- no per-card IDs are exported
- adapter source does not call network, serial, WebSocket, storage, or real bridge APIs

## Explicit non-enablement
APP-H2 does not wire into `src/routes/StudyRoom.jsx`.

APP-H2 does not export capsules to a device.

APP-H2 does not enable serial, WebSocket, Bluetooth, MQTT, or robot transport.

APP-H2 does not modify firmware.

APP-H2 does not enable robot writes, persistent writes, or motion.

APP-H2 does not add UI.

APP-H2 only defines a pure adapter that can be reviewed by a later bridge/mock-import phase.
