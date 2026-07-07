# Device Bridge Real Transport Architecture

## Current State

The active runtime remains mock-only. The Phase 11 transport contract skeleton is pure, memory-only, and not wired into the UI or StudyRoom.

## Options Compared

| Option | Browser support | ESP32 feasibility | Privacy risk | Setup complexity | Local-first fit | Testing complexity | Backend/broker required | Phase 12 candidate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WebSocket LAN | Good in modern browsers | Good with common ESP32 firmware libraries | Medium: LAN endpoint exposure | Medium | Strong | Medium | No | Best first prototype |
| HTTP LAN | Good in modern browsers | Good | Medium: request surface and polling temptation | Low-medium | Strong | Medium | No | Good fallback |
| MQTT via local broker | Browser support usually indirect | Good on ESP32 | Medium-high: broker routing and topics | High | Medium | High | Yes, broker | Avoid for now |
| Web Bluetooth | Limited and browser-specific | Possible with BLE firmware | Medium: permissions and pairing complexity | High | Medium | High | No | Later only |
| Web Serial | Limited and desktop-oriented | Possible through serial bridge | Medium: device permissions and physical cable | Medium-high | Medium | High | No | Later/dev only |
| No transport / mock only | Excellent | No hardware | Lowest | Low | Strongest | Low | No | Always keep |

## Recommended First Prototype

WebSocket LAN is the best first research target because it can remain local-first, does not require a broker or backend, and maps naturally to event messages. It must be disabled by default and only opened after explicit user action.

## Recommended Later Transport

HTTP LAN may be a simpler fallback for firmware experiments. BLE and serial should wait until the app has a stable transport gate and manual QA process.

## Avoid For Now

MQTT should be avoided for now because browser support normally adds a broker or gateway, increasing setup complexity and privacy review surface.

## Required Transport Boundary

Any future real transport must:

- Accept only redacted/coarse robot protocol messages.
- Refuse forbidden sensitive fields.
- Fail closed when disconnected.
- Never block StudyRoom.
- Never modify scoring, schedule, history, storage, import, backup, or library data.
- Stay optional and local-first.

