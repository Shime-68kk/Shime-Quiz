# APP-H2/H3 — StudyRoom Safe Capsule Export Adapter + Mock Export Preview Pipeline

## Status token
APP_H2H3_SAFE_CAPSULE_EXPORT_ADAPTER_STATUS: APP_H2H3_SAFE_CAPSULE_EXPORT_ADAPTER_DEFINED

## Purpose
APP-H2/H3 prepares a mock-only app-side capsule export path. It converts sanitized StudyRoom-derived summaries into APP-H1 Safe Learning Capsules, serializes valid capsules into mock export envelopes, and builds display-safe preview models.

This phase does not approve Beta Ready.

This phase does not enable a real robot bridge.

This phase does not send data to ESP32.

This phase does not change firmware.

This phase does not export raw quiz, app, study, source, document, RF, credential, token, secret, password, email, username, or local file path data.

This phase prepares mock-only safe capsule export. Real bridge work must be a later gated/manual phase.

## APP-H1 dependency
APP-H2/H3 depends on `src/deviceBridge/safeLearningCapsule.js` and preserves the APP-H1/robot checksum rule:

`checksum32(capsuleId|sourceType|safeSummaryCode)`

The capsule output uses APP-H1 allowed fields only.

## Robot compatibility
APP-H2/H3 is compatible with R5X19.2 safe mock import expectations:

- safe derived capsule fields only
- raw quiz fields rejected
- raw RF identifiers rejected
- secrets rejected
- malformed input rejected
- unknown fields rejected
- real app bridge disabled
- real capsule writes disabled
- persistent writes disabled
- motion locked

## Allowed capsule output fields
The adapter, mock export pipeline, and preview model do not add capsule fields. Output capsules may contain only:

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

Adding a new allowed output field is out of scope and must fail this phase.

## StudyRoom safe adapter
The adapter lives in `src/deviceBridge/studyRoomSafeCapsuleAdapter.js`.

Allowed input is sanitized and derived only:

- `sessionIdBucket`
- `correctCount`
- `incorrectCount`
- `skippedCount`
- `totalCount`
- `recentAccuracyBucket`
- `sessionDurationBucket`
- `dueReviewCountBucket`
- `overdueReviewPressureBucket`
- `consecutiveErrorsBucket`
- `hesitationBucket`
- `focusNeedSignalBucket`
- `userEnergySelfReportBucket`
- `monotonicImportId`
- `nowBucket`

The adapter rejects unknown input fields.

The adapter rejects forbidden input deeply and reports only safe diagnostic categories:

- `app_quiz_field`
- `app_history_field`
- `document_text_field`
- `raw_identifier`
- `rf_identifier`
- `credential_or_secret`
- `unknown_unsafe_field`

Diagnostics must not echo raw forbidden values.

## Derived mapping
The adapter uses bucketed values only:

- high correct ratio and low pressure maps to `learningStateBucket="steady"`, `recommendedCompanionAction="quiet_presence"`, and `companionTone="calm"`.
- low accuracy and high consecutive errors maps to `learningStateBucket="struggling"`, `recommendedCompanionAction="encourage_break_or_review"`, and `companionTone="gentle"`.
- high due or overdue pressure maps to `reviewUrgencyBucket="high"` and `recommendedCompanionAction="suggest_review_focus"`.
- long duration and low energy maps to `focusNeedBucket="rest_or_light_review"` and `sessionEnergyBucket="low"`.
- short normal sessions map to `studyLoadBucket="light"`.
- medium sessions map to `studyLoadBucket="moderate"`.
- long or high-pressure sessions map to `studyLoadBucket="heavy"`.

Capsule IDs are non-reversible safe IDs derived from bucketed session data and monotonic import id. They do not equal raw session IDs.

## Mock export pipeline
The mock export pipeline lives in `src/deviceBridge/safeCapsuleMockExport.js`.

It accepts a valid APP-H1 Safe Learning Capsule, validates it, serializes it to safe JSON, and returns a mock-only envelope:

- `exportMode="mock_only"`
- `destination="robot_mock_import"`
- `realBridgeEnabled=false`
- `transportEnabled=false`
- `capsule`
- safe export `summary`

The summary contains:

- `capsuleFieldCount`
- `privacyClass`
- `checksum`
- `safeSummaryCode`
- `blockedRawFieldCount`
- `exportReadyForMockRobotImport`

The runtime module performs no filesystem writes and no transport calls.

## Preview model
The preview model lives in `src/deviceBridge/safeCapsulePreviewModel.js`.

It returns display-safe preview fields:

- `learningStateBucket`
- `studyLoadBucket`
- `reviewUrgencyBucket`
- `sessionMoodBucket`
- `sessionEnergyBucket`
- `focusNeedBucket`
- `recommendedCompanionAction`
- `companionTone`
- `safeSummaryCode`
- `privacyClass`
- `checksumStatus`
- `bridgeStatus="mock_only_not_connected"`

The preview model does not show raw question, answer, topic, source document, history, or identifiers.

## Forbidden data
The adapter and export pipeline must not export, store, log, preview, serialize, or pass through:

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
- per-card IDs
- deck IDs if they can reconstruct study history
- imported file names
- `SSID`
- `BSSID`
- `MAC`
- raw AP lists
- `credentials`
- `tokens`
- `secrets`
- `passwords`
- emails
- usernames
- local file paths

## Explicit non-enablement
No real bridge is enabled.

No serial or WebSocket transport is enabled.

No cloud, backend, sync, telemetry, or AI API call is enabled.

No robot firmware is changed.

No StudyRoom runtime integration is changed.

No UI is changed.

No data is sent to ESP32.
