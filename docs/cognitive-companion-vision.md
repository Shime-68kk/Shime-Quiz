# Cognitive Companion Vision

Shime should become a premium local-first learning companion: the quiz app remains the learning brain, the companion kernel becomes the explainable interaction brain, and the robot body remains an optional embodied accessory.

The quiz app provides coarse learning context such as session phase, progress bucket, item type, accuracy bucket, review urgency, and transport status. The robot may later provide coarse presence context such as near, approaching, absent, sensor confidence, and availability. Neither side needs private quiz text to feel intelligent.

The robot does not need a camera to support a premium experience. Presence can come from distance trends, RF context, button/touch signals, or other non-identifying sensors. The robot must never become the scorer, scheduler, storage owner, import path, backup path, or source of truth.

## Brain Separation

- Learning brain: Shime Quiz learning model, scheduler, history, import, backup.
- Companion brain: local deterministic policy engine that consumes redacted/coarse signals only.
- Robot body: local expression, sensor, and optional future actuator layer that obeys safety locks.

## Roadmap

1. Deterministic companion kernel.
2. Scenario simulator.
3. USB parser and hardware QA.
4. WebSocket robot logging.
5. Safe expression-only robot.
6. Sensor-aware presence.
7. Optional local model research.
8. Optional cloud AI only with explicit future opt-in, never default.
