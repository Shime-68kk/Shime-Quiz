# Cognitive Companion Dev Tap Manual QA

Manual QA is dev/test only.

- [ ] Create a fake facade with `subscribe(listener)`.
- [ ] Create `createCompanionDevTapRuntime({ facade })`.
- [ ] Confirm listener count is zero before `enable()`.
- [ ] Call `enable()`.
- [ ] Emit a safe `facade_event_sent` update.
- [ ] Confirm transcript entry appears.
- [ ] Emit a sensitive event.
- [ ] Confirm it is blocked and command is neutral.
- [ ] Call `disable()`.
- [ ] Emit another event.
- [ ] Confirm transcript does not change.
- [ ] Confirm no robot send API was called.
- [ ] Confirm no persistence exists.

PASS only if the tap remains disabled until explicitly enabled and never sends robot commands externally.
