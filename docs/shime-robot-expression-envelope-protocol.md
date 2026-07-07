# Shime Robot Expression Envelope Protocol

Phase 39X defines protocol readiness only. It is not real robot send, not firmware behavior, and not production transport.

The v1 envelope uses `protocol: shime_robot_expression` and `protocolVersion: 1.0.0`. It carries only expression family, safe channels, display/LED/sound labels, locked motion policy, redacted/coarse privacy status, dry-run status, and reason codes.

Required invariants:

- `dryRunOnly` is always `true`.
- `sendStatus` is always `not_sent`.
- `motionPolicy` is always `locked`.
- Raw learning content is not allowed.
- Secret material and network addressing are not allowed.
- Schedule, notification, and OS calendar mutation fields are not allowed.

Allowed channels are expression-only: display expression, LED expression, sound cue, idle presence, attention hint, or no-op. Physical movement and command-send channels are rejected.

