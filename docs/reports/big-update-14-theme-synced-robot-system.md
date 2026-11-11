# BIG-UPDATE-14 Theme-Synced Robot System

## Identity Contract

Robot visual identity is controlled only by the active application theme. Correct, incorrect, attentive, revealed, and complete expressions alter eye geometry, pose, and glow intensity without assigning generic success or danger colors to the robot.

## Semantic Roles

Every theme defines:

- `--theme-robot-shell`
- `--theme-robot-shell-elevated`
- `--theme-robot-shell-border`
- `--theme-robot-eye`
- `--theme-robot-eye-soft`
- `--theme-robot-glow`
- `--theme-robot-shadow`
- `--theme-robot-message-surface`

Light uses forest green, Forest Dark uses luminous mint on deep green-black surfaces, Ocean Calm uses blue, Sunset Warm uses amber-brown, and Lavender Field uses lavender. These roles are part of `REQUIRED_THEME_ROLES`.

## Canonical Geometry

`ShimeRobotFace` remains the only face implementation. It preserves the hardware-eye metrics and dot fallback at `xs`, `sm`, `md`, and `lg`. `ShimeRobotPresence`, `ShimeBrandMark`, Home arrival, and StudyRoom compose that canonical face.

## Placement Rules

- Compact brand mark: `xs`, static, no float.
- Home companion chip: `sm`, idle blink, no float.
- Home arrival: `lg`, one-shot greeting then idle blink and 2px float.
- StudyRoom companion: `md`, idle blink and 2px float until feedback.

No fixed raster, SVG duplicate, canvas, WebGL, video, network, sensor, or hardware capability was added.
