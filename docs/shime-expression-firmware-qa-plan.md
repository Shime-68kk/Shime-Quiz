# Shime Expression Firmware QA Plan

This plan is for a later firmware phase only. No firmware was changed in Phase 40X.

Future QA must flash log-only parser firmware, open a local log monitor, send valid golden envelopes, confirm ACCEPT logs, send invalid fixtures, confirm REJECT logs, and confirm no pins, motors, or servos move.

No robot command is sent from the app. No transport is opened by this phase. Motion remains locked.

