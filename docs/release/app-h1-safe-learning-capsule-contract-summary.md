# APP-H1 — Safe Learning Capsule Contract Summary

## Status token
APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_STATUS: APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_DEFINED

## Root conclusion
APP-H1 defines an app-side Safe Learning Capsule contract and pure validation/generation utility for future mock import or bridge work.

## Safety decision
APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_DEFINED

## Contract status
Safe capsule contract defined: Yes.

Robot checksum rule matched: Yes. The checksum is computed as `checksum32(capsuleId|sourceType|safeSummaryCode)`.

Raw quiz fields rejected: Yes.

Raw RF identifiers rejected: Yes.

Secrets rejected: Yes.

Unknown fields rejected: Yes.

Malformed input rejected: Yes.

Raw study content exported: No.

## Runtime boundary
Real device bridge enabled: No.

Robot firmware changed: No.

Runtime StudyRoom integration changed: No.

Cloud/backend sync enabled: No.

Telemetry enabled: No.

AI API calls enabled: No.

## Files in this phase
- `docs/device-bridge/app-h1-safe-learning-capsule-contract.md`
- `docs/release/app-h1-safe-learning-capsule-contract-summary.md`
- `scripts/validate-app-h1-safe-learning-capsule-contract.js`
- `src/deviceBridge/safeLearningCapsule.js`
- `tests/unit/safeLearningCapsule.test.js`
- `tests/fixtures/safe-learning-capsule/valid-safe-capsule.json`
- `tests/fixtures/safe-learning-capsule/invalid-raw-quiz-fields.json`
- `tests/fixtures/safe-learning-capsule/invalid-raw-rf-identifiers.json`
- `tests/fixtures/safe-learning-capsule/invalid-secret-credential-fields.json`
- `tests/fixtures/safe-learning-capsule/invalid-unknown-fields.json`
- `tests/fixtures/safe-learning-capsule/invalid-checksum.json`

## Out-of-scope dirty work
Existing dirty runtime/UI/Device Bridge/robot/generated work remains separate from APP-H1. APP-H1 does not approve or include StudyRoom runtime integration, robot bridge runtime, firmware, generated `dist/`, `node_modules/`, or `test-results/`.

## Recommendation
SAFE_TO_COMMIT_APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT after the APP-H1 validator, targeted unit test, and build checks pass.
