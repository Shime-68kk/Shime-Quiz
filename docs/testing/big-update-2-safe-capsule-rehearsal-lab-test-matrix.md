# BIG-UPDATE-2 Test Matrix

Scope: Safe Capsule Rehearsal Lab, privacy evidence, scoring, and offline mock import script.

## Validators

- `node scripts/validate-app-h1-safe-learning-capsule-contract.js`
- `node scripts/validate-app-h2h3-safe-capsule-export-adapter.js`
- `node scripts/validate-big-update-1-safe-capsule-control-center.js`
- `node scripts/validate-big-update-2-safe-capsule-rehearsal-lab.js`

## Targeted Unit Tests

- `tests/unit/safeCapsuleRehearsalLabModel.test.js`
- `tests/unit/safeCapsulePrivacyEvidence.test.js`
- `tests/unit/createSafeCapsuleMockImportPackageScript.test.js`
- `tests/unit/SafeCapsuleRehearsalLab.test.jsx`

## Regression Unit Tests

- `tests/unit/SafeCapsuleControlCenter.test.jsx`
- `tests/unit/safeCapsuleControlCenterModel.test.js`
- `tests/unit/studyRoomDerivedSummary.test.js`
- `tests/unit/mockRobotImportPackage.test.js`
- `tests/unit/settingsSafeCapsuleControlCenterIntegration.test.jsx`

## E2E

- `npm run test:e2e:onboarding`
- `npm run test:e2e:smoke`
- `npm run test:e2e:safe-capsule`
- `npm run test:e2e:safe-capsule-rehearsal`

## Safety Assertions

- Mock-only / chỉ mô phỏng / diễn tập mock.
- No real bridge.
- No ESP32 live connection.
- No Serial/WebSocket/BLE/Wi-Fi/cloud/backend/AI/API.
- No raw quiz/study/history export.
- No send/connect robot controls.
- Offline script is developer-only and writes only explicit safe output.
- R5X19.2 mock import rehearsal compatibility is preserved.
