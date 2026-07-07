# Device Bridge Transports

This folder contains inactive transport contract scaffolding only.

- `MockTransport.js` is the current app-facing debug transport.
- `NoopTransport.js` is a disabled transport for safe fallback behavior.
- `LoopbackTransport.js` is memory-only and intended for local tests.
- `TransportContract.js` defines pure validation helpers and envelope helpers.

There is no real device transport in this folder. Nothing here opens a connection, stores settings, or changes StudyRoom behavior.

