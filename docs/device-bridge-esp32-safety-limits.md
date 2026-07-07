# Device Bridge ESP32 Safety Limits

## Default Policy

- No physical motion by default.
- No servo movement by default.
- No motor movement by default.
- No LED pin control unless a later phase explicitly enables a safe pin.
- All actions are log/stub actions in Phase 18.

## Rate Limiting

- Limit event-driven actions to visible state transitions.
- Ignore duplicate events for the same item/action window.
- Add firmware-side debounce before any physical output.

## Action Duration

- Future LED-only cues should be short and interruptible.
- Future motion cues need a strict maximum duration and emergency neutral fallback.

## Fallbacks

- Disconnect -> neutral.
- Error -> errorSignal then neutral.
- Unknown event -> errorSignal or neutral.
- Malformed payload -> safe error response, no action.

## Hardware Caution

- Check power limits before LEDs, motors, buzzers, or servos.
- Avoid heat-producing continuous actions.
- Keep classroom and child/student safety as the main constraint.

## Privacy

- Local network only.
- Never request or store learning content.
- Never trust robot input for scoring, history, scheduling, settings, import, backup, or library state.

