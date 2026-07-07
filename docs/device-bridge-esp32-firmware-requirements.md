# Device Bridge ESP32 Firmware Requirements

No firmware is added in Phase 12.

## Expected Shape

The ESP32 should run a local LAN WebSocket server for the first prototype. It should accept a connection from the browser app only after the user explicitly enters/selects the device address in the app.

## Firmware Requirements

- Accept only protocol v0 messages.
- Ignore unknown message types or reply with safe `error`.
- Never request sensitive quiz content.
- Never store study data.
- Perform simple accessory behaviors only.
- Rate-limit physical actions.
- Provide safe neutral fallback.
- Handle disconnect.
- Expose status.
- Never control scoring, history, schedule, settings, imports, backups, or library data.
- Treat all app messages as untrusted until protocol/version/type are validated.
- Keep physical motion small, bounded, and interruptible.

## Suggested Behaviors

- `celebrate`: short LED/sound/motion burst.
- `encourage`: gentle animation.
- `neutral`: idle expression.
- `focus`: low-distraction cue.
- `session_complete`: short completion animation.
- `due_review`: gentle reminder cue.
- `error_signal`: neutral-safe error indication.

## Not Allowed

- Storing prompts, answers, history, source names, imported text, backups, or settings.
- Asking the app for full question content.
- Controlling study state.
- Requiring cloud or account access.

