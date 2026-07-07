# Device Bridge Real Transport UI Requirements

The future real transport UI must make mock and real device modes visually and behaviorally distinct.

## Modes To Show

- Mock mode.
- Real LAN mode.
- Disconnected.
- Connecting.
- Connected.
- Degraded.
- Error.
- Privacy locked/redacted.

## Requirements

- Never auto-connect.
- Show a clear warning before real device connect.
- Show target address before connect.
- Require explicit user action to connect.
- Show disconnect button.
- Show last safe status.
- Show safe debug log only.
- Never allow raw payload editing.
- Never allow demo raw events.
- Never show sensitive fields.
- Visually separate mock and real mode.
- Make clear the robot is an accessory only.
- Make clear StudyRoom, scoring, history, and schedule do not depend on robot status.

## Forbidden UI Behavior

- No saved URL unless a later phase explicitly approves persistence.
- No hidden reconnect.
- No background scanning.
- No IP/token/MQTT/WebSocket advanced fields unless the user has selected real LAN mode.
- No prompt/answer/explanation/userAnswer/source metadata display.

