# Device Bridge Dev Tools

## Fake WebSocket Server

Run a local dev-only fake server for Real LAN / WS manual QA:

```bash
node tools/deviceBridge/fakeWebSocketServer.mjs
```

Default endpoint:

```text
ws://127.0.0.1:8787
```

Optional flags:

```bash
node tools/deviceBridge/fakeWebSocketServer.mjs --host 127.0.0.1 --port 8787
```

The tool:

- Listens on localhost by default.
- Replies to `hello` with `hello_ack`.
- Replies to `robot_event` and `robot_command` with `ack`.
- Replies to `ping` with `pong`.
- Logs messages to the console only.
- Does not write files.
- Does not persist payloads.
- Does not connect outward.

## Protocol Fixtures And Transcript

Print a deterministic fake robot transcript:

```bash
node tools/deviceBridge/fakeRobotTranscript.mjs
```

Fixtures live in `tools/deviceBridge/protocolFixtures.mjs` and contain redacted/coarse protocol examples only.

## ESP32 Serial Parser QA Fixtures

Print deterministic host-side serial parser expectations:

```bash
node tools/deviceBridge/fakeSerialParserTranscript.mjs
```

Copy newline-delimited sample inputs from `tools/deviceBridge/serialParserQaFixtures.mjs` into the PlatformIO serial monitor after flashing the Phase 19 firmware. These fixtures are local-only, write no files, open no sockets, and include invalid sensitive-key cases only to prove rejection.
