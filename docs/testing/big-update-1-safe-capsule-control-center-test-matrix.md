# BIG-UPDATE-1 Test Matrix

Scope: Safe Capsule Control Center mock-only preparation.

## Validators

- `node scripts/validate-app-h1-safe-learning-capsule-contract.js`
- `node scripts/validate-app-h2h3-safe-capsule-export-adapter.js`
- `node scripts/validate-big-update-1-safe-capsule-control-center.js`

## Targeted Unit Tests

- `tests/unit/safeLearningCapsule.test.js`
- `tests/unit/studyRoomSafeCapsuleAdapter.test.js`
- `tests/unit/safeCapsuleMockExport.test.js`
- `tests/unit/safeCapsulePreviewModel.test.js`
- `tests/unit/safeCapsuleControlCenterModel.test.js`
- `tests/unit/SafeCapsuleControlCenter.test.jsx`
- `tests/unit/studyRoomDerivedSummary.test.js`
- `tests/unit/mockRobotImportPackage.test.js`
- `tests/unit/settingsSafeCapsuleControlCenterIntegration.test.jsx`

## E2E

- `npm run test:e2e:onboarding`
- `npm run test:e2e:smoke`
- `npm run test:e2e:safe-capsule`

## Safety Assertions

- Mock only / chỉ mô phỏng.
- No real bridge.
- No ESP32 connection.
- No serial, WebSocket, BLE, Wi-Fi, cloud, backend, AI, or API calls.
- No raw quiz, question, answer, study history, source metadata, document text, credentials, or RF identifiers exported.
- R5X19.2 safe mock import compatibility markers are present.
