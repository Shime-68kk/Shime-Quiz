# Cognitive Companion Adaptive Policy

Date: 2026-06-27 09:35:19 +07

`companionAdaptivePolicy.js` maps safe context and session snapshots to deterministic companion decisions.

Examples:

- Correct streak -> `celebrate_small`.
- Repeated wrong -> `encourage`, then `suggest_break` after threshold.
- Recovery after repeated wrong -> `recovery_praise`.
- Low accuracy completion -> `encourage`.
- High accuracy completion -> `celebrate_small`.
- Disconnected transport -> `reconnect_hint`.
- Privacy block -> `calm_error`.

Motion remains false by default. Outputs are policy labels only; no robot command is sent.

