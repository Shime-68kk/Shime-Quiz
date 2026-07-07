# Device Bridge ESP32 Readiness

## Feasibility

Shime Quiz can support a future ESP32 or robot accessory, but only as an optional local-first companion. The current app already has the important safety shape: StudyRoom emits redacted/coarse events through a bridge adapter, the bridge is disabled by default, and the UI uses a shared in-memory facade with manual mock controls.

The robot idea is technically feasible, but not ready for real hardware until manual QA is confirmed and a separate transport phase is approved.

## Correct Role For ESP32 Or Robot

The device should be:

- Accessory feedback only.
- Mascot or companion behavior only.
- A display, sound, light, or simple motion reaction target.
- Optional and removable without affecting study.

The device must not be:

- Storage.
- Scoring authority.
- Scheduler.
- Study history writer.
- Library importer.
- Source of truth.
- Required for any learning workflow.

## Recommended Future Behaviors

- Correct answer: celebrate.
- Wrong answer: encourage.
- Session complete: celebration.
- Due review: gentle reminder.
- Disconnected or error: neutral state.
- Idle or disabled: no action.

## Constraints

- Local network only should be researched first.
- No cloud by default.
- No backend requirement.
- No account or auth requirement.
- No AI API requirement.
- User-triggered connect only.
- Obvious disconnect control.
- No auto-connect.
- No settings persistence until separately approved.
- No prompt, answer, explanation, typed answer, source metadata, settings, study history, or backup payload may leave the app.

## Readiness Conclusion

SAFE_FOR_PHASE_12_TRANSPORT_RESEARCH after human manual QA confirmation.

Not yet safe to ship a real transport or connect real hardware from the app.

