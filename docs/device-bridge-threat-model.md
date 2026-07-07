# Device Bridge Threat Model

## Scope

This model covers the optional Device Bridge path from redacted/coarse StudyRoom events to a future local robot transport. The current app has no real transport.

## Threats

| Threat | Risk | Mitigation | Current status | Future requirement |
| --- | --- | --- | --- | --- |
| Local network exposure | A device endpoint on the LAN may be visible to other local users. | Disabled by default, user-triggered connect, no sensitive payload. | No real transport exists. | Add explicit warnings and disconnect controls. |
| Accidental sensitive data leak | Prompt, answer, explanation, history, or source data could be sent by mistake. | Redaction policy rejects forbidden keys and allows coarse fields only. | Active in event/schema tests. | Keep transport tests scanning forbidden fields. |
| Malicious robot endpoint | A fake endpoint could receive events or return hostile status. | Send only redacted/coarse payloads; never trust inbound messages. | No real endpoint exists. | Inbound messages must be status-only. |
| Stale connection | App may think a robot is connected when it is not. | Heartbeat/status checks in future transport. | Not implemented. | Add timeout and visible disconnected state. |
| Replayed commands | Old commands may be repeated. | Message ids and timestamps. | Contract includes ids and timestamps. | Add nonce/window checks if real transport needs it. |
| Over-frequent events | Too many events could overwhelm UI or physical device. | Keep bridge non-blocking; future rate guard. | Not implemented. | Add rate limiting before hardware. |
| Denial of service / UI freeze | Transport failures could block learning. | Bridge failures must never throw into StudyRoom. | Existing adapter catches failures. | Keep real transport async and bounded. |
| Mock vs real confusion | User may not understand whether a real device is connected. | Separate labels and explicit manual connect. | Mock UI labels exist. | Real UI must clearly name transport type. |
| Unsafe physical motion | Robot motion could be distracting or unsafe. | Keep commands semantic and simple. | No hardware exists. | Firmware must enforce safe motion limits. |
| Child/student privacy | Student learning behavior is sensitive. | Local-first, redacted/coarse only, no cloud/account/backend. | Current bridge follows this. | Real transport warning copy must be explicit. |

## Current Gate

The current status is safe for research planning, not hardware activation.

