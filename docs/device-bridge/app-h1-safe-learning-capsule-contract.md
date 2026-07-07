# APP-H1 — Safe Learning Capsule Contract

## Status token
APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_STATUS: APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_DEFINED

## Purpose
APP-H1 defines the app-side Safe Learning Capsule contract for future local-first, privacy-preserving mock import or bridge paths. It does not enable a real app bridge, robot connection, firmware path, cloud/backend sync, telemetry, AI calls, or production runtime integration.

## Current boundary
Phase 37F remains the current limited release decision boundary: `LIMITED_BETA_NOT_APPROVED_EVIDENCE_GAPS_REMAIN`.

APP-H1 is a contract and pure utility phase only. It does not approve Beta Ready and does not change StudyRoom runtime behavior.

## Robot compatibility context
The ESP32 robot side has safe mock import expectations: safe derived capsule fields are accepted, raw quiz data is rejected, raw RF identifiers are rejected, secrets are rejected, malformed payloads are rejected, unknown fields are rejected, real app bridge remains disabled, real capsule writes remain disabled, persistent writes remain disabled, and motion remains locked.

APP-H1 mirrors that boundary on the app side before any real bridge work.

## Allowed capsule fields
The Safe Learning Capsule contains only these top-level fields:

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

Unknown fields are invalid.

## Required checksum
The app checksum rule matches the robot-side rule:

`checksum32(capsuleId|sourceType|safeSummaryCode)`

APP-H1 represents the checksum as an 8-character lowercase hexadecimal `checksum32` value.

## Required privacy class
The only allowed `privacyClass` in APP-H1 is:

`redacted_coarse_only`

## Forbidden fields and content
The capsule must not include raw quiz, raw study, raw RF, credential, or secret material.

Forbidden fields include:

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
- `documentText`
- `document text`
- `rawFsrsReviewLogs`
- per-card identifiers such as `cardId`, `itemId`, and `perCardId`
- `SSID`
- `BSSID`
- `MAC`
- `rawAPLists`
- `credentials`
- `tokens`
- `secrets`
- `passwords`

The capsule must not contain raw prompts, answer text, explanations, imported document text, exact study history, raw FSRS review logs, RF identifiers, credentials, tokens, secrets, or passwords in any field value.

## App utility
The pure utility lives in `src/deviceBridge/safeLearningCapsule.js`.

It provides:

- `checksum32(value)`
- `formatChecksum32(value)`
- `computeSafeLearningCapsuleChecksum(capsule)`
- `validateSafeLearningCapsule(capsule)`
- `createSafeLearningCapsule(input)`

The utility is intentionally pure. It does not call storage APIs, network APIs, WebSocket, Bluetooth, serial, MQTT, firmware, robot runtime, or StudyRoom runtime code.

## Fixtures
APP-H1 fixtures live in `tests/fixtures/safe-learning-capsule/`:

- `valid-safe-capsule.json`
- `invalid-raw-quiz-fields.json`
- `invalid-raw-rf-identifiers.json`
- `invalid-secret-credential-fields.json`
- `invalid-unknown-fields.json`
- `invalid-checksum.json`

## Validation coverage
APP-H1 tests verify:

- valid safe capsule passes
- checksum matches `checksum32(capsuleId|sourceType|safeSummaryCode)`
- raw quiz/app fields fail
- raw RF identifiers fail
- secrets and credentials fail
- unknown fields fail
- malformed input fails
- generated safe capsules do not export raw user study content
- the utility does not reference storage, network, transport, or device APIs

## Explicit non-enablement
APP-H1 does not enable real app bridge writes.

APP-H1 does not enable robot writes.

APP-H1 does not enable persistent writes.

APP-H1 does not enable motion.

APP-H1 does not add firmware.

APP-H1 does not modify StudyRoom runtime integration.

APP-H1 does not export raw quiz, answer, document, study history, RF, credential, token, secret, or password data.

## Next step
Future work may use this contract for a safe mock import or bridge review phase, but only after a separate phase explicitly authorizes that work and repeats the privacy checks.
