# BIG-UPDATE-3 Safe Capsule Export Vault

Status: manual handoff only / bàn giao thủ công / mock-only / chỉ mô phỏng.

This phase adds a browser-visible Safe Capsule Export Vault that builds a safe JSONL handoff pack for human-controlled transfer to the R5X19.2 mock import folder.

It is not Beta Ready, not a real robot bridge, and not an ESP32 live connection. It adds no Serial/WebSocket/BLE/Wi-Fi/cloud/backend/AI/API, no automatic sending, no browser persistence, and no send/connect robot controls.

The browser export is an explicit user action. The app builds a safe preview in memory; download happens only when the user presses `Tải JSONL`. The user must manually copy the file to `/SHIME_EXTERNAL_CAPSULE_MOCK/imports.jsonl`.

No raw quiz/study/history export is allowed. The handoff pack contains only safe mock robot import package lines, manifest data, checksum verification, and privacy evidence counts/codes.

Future work may add a hardware-gated bridge, but not in this phase.
