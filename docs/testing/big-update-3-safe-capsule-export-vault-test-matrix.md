# BIG-UPDATE-3 Test Matrix

Validators:
- `node scripts/validate-app-h1-safe-learning-capsule-contract.js`
- `node scripts/validate-app-h2h3-safe-capsule-export-adapter.js`
- `node scripts/validate-big-update-1-safe-capsule-control-center.js`
- `node scripts/validate-big-update-2-safe-capsule-rehearsal-lab.js`
- `node scripts/validate-big-update-3-safe-capsule-export-vault.js`

Targeted unit tests:
- `tests/unit/safeCapsuleManualExportPackage.test.js`
- `tests/unit/safeCapsuleExportVaultModel.test.js`
- `tests/unit/SafeCapsuleExportVault.test.jsx`
- `tests/unit/createSafeCapsuleManualHandoffScript.test.js`

E2E:
- `npm run test:e2e:safe-capsule-export`

Safety assertions:
- manual handoff / bàn giao thủ công
- mock-only / chỉ mô phỏng
- no real bridge
- no raw quiz/study/history export
- no Serial/WebSocket/BLE/Wi-Fi/cloud/backend/AI/API
- no browser persistence
- no automatic sending
- no send/connect robot controls
- compatible with R5X19.2 mock import rehearsal
