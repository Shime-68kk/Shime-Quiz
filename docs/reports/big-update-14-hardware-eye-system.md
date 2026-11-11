# BIG-UPDATE-14 Hardware Eye System

## Direction

The selected direction is **hardware-inspired calm companion**: a compact rounded electronic face with large rounded-square display eyes, restrained semantic color, and no continuously animated mascot behavior.

## Canonical Architecture

`ShimeRobotFace` is the single face/eye implementation. It supports:

- sizes: `xs`, `sm`, `md`, `lg`;
- eye variants: `hardware` (default) and `dot` (internal legacy fallback);
- expression data hooks;
- one-shot arrival/wink/gaze state;
- decorative or informative accessibility mode;
- optional compact signal detail.

`ShimeRobotPresence` owns outer state, accessible label, glow, and placement. `ShimeBrandMark` and `ShimeRobotPresence` both compose the canonical face. `ShimeArrivalGreeting` composes Presence and localized copy. No duplicate SVG/circle face remains.

## Geometry

| Size | Face | Hardware eye | Legacy dot | Hardware gap | Eye/face ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| `xs` | 24px | 5.5px | 3.5px | 4px | 22.9% |
| `sm` | 36px | 8.5px | 7px | 5.5px | 23.6% |
| `md` | 56px | 13px | 10px | 8px | 23.2% |
| `lg` | 80px | 19px | 14px | 11px | 23.8% |

Hardware eyes use `38%` corner radius; dot fallback uses `50%`. Both eyes plus gap remain inside every face bound. The large eyes grow 21%–57% over the corresponding dot fallback by size and remain visually balanced.

## Motion

The canonical base face has no continuous animation. Historical keyframes remain inert for older validator compatibility. BIG-UPDATE-13 arrival remains one 1,100ms sequence: only the left eye winks, both eyes share a 1px gaze, no dimensions change, and no timer is used. Reduced motion computes to no eye/arrival animation and static resting geometry.

## Theme Semantics

Eyes use `--theme-companion` by default, `--theme-status-safe` for success, and `--theme-status-warning` for warning. Shell, border, and glow use companion/surface/border roles. No fixed color exists in the face or Presence component. Browser verification covers Forest Calm, Forest Dark, Ocean Calm, Sunset Warm, and Lavender Field.

## Placements

- Home safe-signal chip: explicit `sm` hardware face.
- Home arrival: explicit `lg` hardware face.
- Sidebar: compact `xs` hardware face through BrandMark.
- StudyRoom companion: existing `sm` Presence automatically receives the hardware default.

No user-facing selector or persisted eye preference was added.
