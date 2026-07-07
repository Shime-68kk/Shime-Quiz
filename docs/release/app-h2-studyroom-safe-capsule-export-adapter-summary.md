# APP-H2 — StudyRoom Safe Capsule Export Adapter Summary

## Status token
APP_H2_STUDYROOM_SAFE_CAPSULE_EXPORT_ADAPTER_STATUS: APP_H2_STUDYROOM_SAFE_CAPSULE_EXPORT_ADAPTER_DEFINED

## Root conclusion
APP-H2 adds a pure StudyRoom Safe Capsule Export Adapter that converts sanitized derived StudyRoom summary metrics into APP-H1 Safe Learning Capsules.

## Contract result
StudyRoom safe capsule adapter added: Yes.

Raw quiz fields rejected: Yes.

Raw study history rejected: Yes.

Raw document text rejected: Yes.

Raw RF identifiers rejected: Yes.

Secrets rejected: Yes.

Output allowed fields only: Yes.

Robot checksum rule preserved: Yes.

## Runtime boundary
Real device bridge enabled: No.

Serial/WebSocket enabled: No.

Robot firmware changed: No.

StudyRoom runtime changed: No.

Cloud/backend sync enabled: No.

Telemetry enabled: No.

AI API calls enabled: No.

## Files in this phase
- `docs/device-bridge/app-h2-studyroom-safe-capsule-export-adapter.md`
- `docs/release/app-h2-studyroom-safe-capsule-export-adapter-summary.md`
- `scripts/validate-app-h2-studyroom-safe-capsule-export-adapter.js`
- `src/deviceBridge/studyRoomSafeCapsuleAdapter.js`
- `tests/unit/studyRoomSafeCapsuleAdapter.test.js`
- `tests/fixtures/studyroom-safe-capsule-adapter/valid-derived-summary.json`
- `tests/fixtures/studyroom-safe-capsule-adapter/invalid-raw-question.json`
- `tests/fixtures/studyroom-safe-capsule-adapter/invalid-raw-answer.json`
- `tests/fixtures/studyroom-safe-capsule-adapter/invalid-study-history.json`
- `tests/fixtures/studyroom-safe-capsule-adapter/invalid-source-metadata.json`
- `tests/fixtures/studyroom-safe-capsule-adapter/invalid-document-text.json`
- `tests/fixtures/studyroom-safe-capsule-adapter/invalid-rf-fields.json`
- `tests/fixtures/studyroom-safe-capsule-adapter/invalid-secrets.json`
- `tests/fixtures/studyroom-safe-capsule-adapter/invalid-unknown-field.json`

## APP-H1 dependency
APP-H2 references and uses the APP-H1 Safe Learning Capsule contract. The checksum remains `checksum32(capsuleId|sourceType|safeSummaryCode)`.

## Out-of-scope dirty work
Existing dirty runtime/UI/Device Bridge/robot/generated work remains separate from APP-H2. APP-H2 does not approve or include StudyRoom runtime integration, real Device Bridge transport, robot connection, firmware, generated `dist/`, `node_modules/`, or `test-results/`.

## Recommendation
SAFE_TO_COMMIT_APP_H2_STUDYROOM_SAFE_CAPSULE_EXPORT_ADAPTER after the APP-H2 validator, targeted APP-H1/APP-H2 tests, and build checks pass.
