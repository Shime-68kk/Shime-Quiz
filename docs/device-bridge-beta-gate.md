# Device Bridge Beta Gate

This gate must pass before any future Device Bridge phase that considers ESP32, robot accessory behavior, WebSocket, MQTT, BLE, Web Serial, backend, cloud, auth, or other real transport research.

## Current Gate Position

The current system is mock-only, memory-only, disabled by default, and local-first. StudyRoom emits through the StudyRoom bridge adapter, and the Settings UI uses the shared public facade for manual mock controls.

The bridge remains an optional accessory path. It must never become required for study, scoring, scheduling, import, backup, storage, or review logic.

## Required Pass Criteria

Before future real transport work is approved, all criteria below must pass:

- `npm run build` passes.
- `npm run test:unit` passes.
- Manual QA in `docs/device-bridge-manual-qa.md` passes.
- Forbidden API scan passes for Device Bridge runtime, Device Bridge UI, and StudyRoom integration points.
- No sensitive payload data appears in mock event records.
- Bridge is disabled by default.
- Mock transport requires explicit enable and explicit connect action.
- No auto-connect behavior exists.
- No settings persistence exists for Device Bridge enable/connect state.
- No `localStorage`, `sessionStorage`, or `indexedDB` usage exists in Device Bridge runtime/UI.
- No `fetch`, `XMLHttpRequest`, `WebSocket`, Bluetooth, Serial, MQTT, ESP32, backend, cloud, auth, sync, or AI API path exists in Device Bridge runtime/UI.
- Bridge failure is non-blocking and never breaks the study flow.
- Rollback plan exists for the exact files changed in the next phase.
- User explicitly approves the next phase before real transport research starts.

## Privacy Gate

No Device Bridge event may send these fields or their values by default:

- `prompt`
- `question`
- `front`
- `back`
- `correctAnswer`
- `answer`
- `acceptableAnswers`
- `explanation`
- `userAnswer`
- `typedAnswer`
- `sourceMetadata`
- `sourceName`
- `importedFileName`
- `importedDocumentName`
- `rawText`
- `cleanedText`
- `backupPayload`
- `settings`
- `studyHistory`
- `fullHistory`

Allowed data remains limited to coarse event metadata:

- Event type.
- Temporary session id.
- Item index.
- Item type.
- Progress count.
- Total count.
- Coarse correctness status.
- Coarse score bucket.
- Due count bucket.
- Bridge status.
- Transport status.

## Future Real Transport Approval Gate

Real transport work may begin only after a separate planning phase confirms:

- The transport is optional and local-first.
- The transport never receives learning content by default.
- The transport has no account, cloud, backend, auth, sync, or AI API requirement.
- The transport is disabled by default.
- The transport requires explicit user action to connect.
- The transport has a clear disconnect path.
- The transport has a failure path that cannot interrupt learning.
- The transport has tests for disabled, disconnected, failure, and redaction behavior.
- The user explicitly approves the specific transport research.

## Stop Conditions

Stop and do not proceed if any condition below is found:

- Build fails because of Device Bridge changes.
- Unit tests fail because of Device Bridge changes.
- Mock events contain forbidden sensitive fields or values.
- Any source file adds real network or hardware APIs.
- Any source file adds Device Bridge persistence.
- StudyRoom becomes dependent on Device Bridge success.
- Device Bridge starts automatically without explicit user action.
- Any future proposal requires cloud, account, auth, backend, sync, or AI API calls as a mandatory path.

## Rollback Expectations

Every future implementation phase must identify:

- Exact files changed.
- Exact tests added or updated.
- How to disable the feature without affecting study.
- How to remove the transport while keeping the mock bridge and study flow intact.
- How to verify no private learning content was exposed.

