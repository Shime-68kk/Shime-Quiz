# Device Bridge Phase 17 Manual QA Result

Final manual QA status: PENDING_HUMAN_RETRY_CONFIRMATION

## Confirmed Before Retry

- Fake server starts.
- Browser connects to `ws://127.0.0.1:8787`.
- App sends `hello`.
- StudyRoom `robot_event` messages are received.
- `session_complete` is received.
- Payloads are redacted/coarse only.
- No sensitive fields were observed.

## Live Status Bug

Observed issue:

- Settings UI could stay on `connecting` until route remount.

Cause:

- Async WebSocketTransport status updates did not notify facade subscribers.

Fix:

- `WebSocketTransport` now supports `onStatusChange`.
- Facade forwards transport status updates to existing subscribers.

Current status:

- SAFE_TO_RETRY_PHASE_17_FAKE_SERVER_MANUAL_QA.

Do not claim final Phase 17 PASS until the human browser retry after this fix is explicitly confirmed.

