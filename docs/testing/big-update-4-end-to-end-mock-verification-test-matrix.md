# BIG-UPDATE-4 Test Matrix

Validators:
- `node scripts/validate-app-h1-safe-learning-capsule-contract.js`
- `node scripts/validate-app-h2h3-safe-capsule-export-adapter.js`
- `node scripts/validate-big-update-1-safe-capsule-control-center.js`
- `node scripts/validate-big-update-2-safe-capsule-rehearsal-lab.js`
- `node scripts/validate-big-update-3-safe-capsule-export-vault.js`
- `node scripts/validate-big-update-4-end-to-end-mock-verification.js`

Targeted units:
- `tests/unit/robotMockImportReport.test.js`
- `tests/unit/safeCapsuleEndToEndVerificationModel.test.js`
- `tests/unit/hardwareReadinessGate.test.js`
- `tests/unit/SafeCapsuleEndToEndVerificationPanel.test.jsx`
- `tests/unit/verifySafeCapsuleMockHandoffScript.test.js`

E2E:
- `npm run test:e2e:safe-capsule-e2e-verify`

Safety: mock verification only, no real bridge, no Serial/WebSocket/BLE/Wi-Fi/cloud/backend/AI/API, no raw quiz/study/history export, no send/connect controls.
