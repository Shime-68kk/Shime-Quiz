# BIG-UPDATE-2 Safe Capsule Rehearsal Lab

Status: mock-only / chỉ mô phỏng / diễn tập mock.

This update adds a Safe Capsule Rehearsal Lab for replaying safe learning-state scenarios before any real Shime Robot bridge exists.

## What It Adds

- Settings-visible `Safe Capsule Rehearsal Lab — diễn tập mock`.
- Deterministic scenario replay suite for steady, struggling, high review pressure, low energy, disconnected context, and adversarial privacy cases.
- Privacy evidence recorder that produces category counts and reason codes only.
- Quality, compatibility, actionability, privacy, and freshness scoring.
- Node-only offline mock import script for developer rehearsal with robot-side `R5X19.2_SAFE_MOCK_IMPORT`.

## Safety Boundary

- Not Beta Ready.
- Not a real robot bridge.
- Not an ESP32 live connection.
- No Serial/WebSocket/BLE/Wi-Fi/cloud/backend/AI/API.
- No raw quiz/study/history export.
- No raw question, answer, explanation, user answer, document text, source metadata, card/deck IDs, RF identifiers, credentials, or secrets are shown or exported.
- No send/connect robot controls.

## Offline Script

`scripts/create-safe-capsule-mock-import-package.js` is developer-only and Node-only.

- Default mode prints a safe summary to stdout and writes no files.
- `--out` writes only when the path is under the system temp directory or `docs/generated/safe-capsule/`.
- The script does not call network APIs, serial APIs, WebSocket, Bluetooth, Wi-Fi, firmware tools, package installers, or external commands.

Future work may add a manual downloadable file flow, but this phase does not add a real bridge.
