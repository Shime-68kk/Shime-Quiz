# BIG-UPDATE-1 Safe Capsule Control Center

Status: mock only / chỉ mô phỏng.

This update adds an app-side Safe Capsule Control Center for preparing the Shime Robot / Companion path without enabling a real bridge.

## What It Adds

- A Settings panel named `Safe Capsule Control Center — Mock Only`.
- Pure model logic for sample safe capsules, privacy audit state, and R5X19.2 mock import compatibility.
- A derived StudyRoom summary helper that accepts only coarse counters and buckets.
- A mock robot import package generator for `R5X19.2_SAFE_MOCK_IMPORT`.
- Unit, e2e, and validator coverage for the mock-only boundary.

## Safety Boundary

- Not Beta Ready approval.
- Not a real robot bridge.
- Not an ESP32 connection.
- No serial, WebSocket, BLE, Wi-Fi, cloud, backend, or account sync.
- No AI/API calls.
- No firmware mutation.
- No motor, motion, or action controls.
- No raw quiz, question, answer, explanation, user answer, study history, source metadata, document text, credentials, or RF identifiers are exported.

## Mock Package Compatibility

The mock package is compatible with the robot-side R5X19.2 safe mock import expectation:

- `packageType: shime_robot_mock_import_package`
- `target: R5X19.2_SAFE_MOCK_IMPORT`
- `bridgeMode: mock_only`
- `realBridgeEnabled: false`
- `transportEnabled: false`
- `persistentWritesEnabled: false`
- `motionLockedExpected: true`

The package is previewable/copyable data only. Runtime browser code does not write files, call filesystem APIs, use browser storage for the package, or open a device transport.

## Future Work

A later phase may add a manual file export or a separately gated bridge experiment. That future work must keep the same safe capsule contract and must remain optional.
