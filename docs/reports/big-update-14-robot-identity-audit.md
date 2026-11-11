# BIG-UPDATE-14 Robot Identity Audit

## 1. Executive Verdict

**PASS to proceed.** The current BIG-UPDATE-13 worktree is intentionally uncommitted and fully classified as approved phase work. BIG-UPDATE-14 can be implemented within brand presentation, CSS, tests, validation, and reports without touching learning, scheduler, storage, Safe Capsule, bridge, sensing, data, or route behavior.

## 2. Current Robot Components

- `ShimeRobotPresence` owns the Home chip, Home arrival face, and StudyRoom companion face.
- `ShimeArrivalGreeting` composes `ShimeRobotPresence` and localized greeting copy.
- `ShimeBrandMark` independently draws a second robot face in SVG for the Sidebar brand.
- `ShimeNavigationIcon` contains route icons only; it does not draw a robot.

The visual system therefore has two eye implementations that can drift.

## 3. Current Eye Geometry

Presence eyes are CSS circles with `borderRadius: 50%`. BrandMark eyes are SVG `<circle>` elements. Both read as generic green dots. The face shell is a softly asymmetric square and does not need a major dimensional redesign, but its inline gradient, fixed shadows, and eye colors are less theme-semantic than the rest of the current system.

## 4. Current Eye Sizes

Presence eye diameters are `7px`, `10px`, and `14px` for `sm`, `md`, and `lg`, against face widths of `36px`, `56px`, and `80px`. Individual width ratios are approximately `19.4%`, `17.9%`, and `17.5%`. The compact SVG brand eyes are `3.4px` diameter inside a roughly `16px` face area. Absolute size, circular shape, glow, and surrounding whitespace make every placement read smaller than the ratios suggest.

## 5. Hardware Alignment Gaps

- No rounded-square hardware eye variant exists.
- Eye color and glow are hardcoded per state in JavaScript instead of using theme companion/status roles.
- Presence and BrandMark duplicate eye geometry.
- No internal eye-variant boundary exists for a legacy dot fallback.
- Larger arrival placement does not gain enough eye prominence.
- Existing ambient face and sparse blink loops make the visual feel more mascot-like than hardware-like.

## 6. Motion Compatibility

BIG-UPDATE-13 applies a one-shot 1,100ms left-eye wink and shared 1px gaze through stable eye elements and `scaleY`/`translateX`; this architecture is compatible with rounded-square eyes. General Presence currently also runs infinite ambient, glow, and sparse blink animations. BIG-UPDATE-14 should leave historical keyframes available for validator compatibility but stop applying continuous animations to the canonical hardware face.

## 7. Theme Compatibility

All five themes provide `--theme-companion`, `--theme-companion-soft`, `--theme-companion-glow`, surface, border, and status roles. The canonical face can use those roles without adding theme persistence or fixed eye colors. Forest Dark needs restrained glow; Sunset Warm and Lavender Field need companion color rather than inherited primary/action colors.

## 8. Accessibility

Presence and BrandMark already support decorative and informative modes. Arrival robot art is decorative while the greeting is ordinary text. The canonical face must keep eyes hidden as part of the parent visual, never announce wink/gaze, never add a live region, and render both eyes statically under reduced motion.

## 9. Duplicate Robot Implementations

The only confirmed duplicate is the SVG face and circle eyes inside `ShimeBrandMark`. It should compose the same canonical CSS face used by `ShimeRobotPresence`, with a compact size and signal detail. Home, StudyRoom, and arrival already share Presence and require no additional face implementation.

## 10. Settings Surface Findings

The BIG-UPDATE-13 warning strip now has a semantic control radius, but `.settingsSection--experimental .settingsPanel` still receives an opaque rectangular surface behind the rounded Card. That rectangular intermediate background is the remaining sharp nested panel reported by the user. The safe fix is to make the grid wrapper transparent and keep the actual Card/status strip rounded, inset, and theme-semantic. FSRS markup and callbacks do not need to change.

## 11. Logic Boundaries

Locked areas include scheduler/SM2/FSRS, settings storage, all data/import/export modules, StudyRoom answer and progression behavior, Safe Capsule/checksum, device/robot bridge, sensing, routes, callbacks, and business payloads. `package-lock.json` must remain unchanged and no dependency may be added.

## 12. Implementation Plan

1. Create `ShimeRobotFace` as the canonical face/eye boundary with `xs/sm/md/lg`, default `hardware`, internal `dot`, expression, arrival, gaze, and accessibility-safe data hooks.
2. Refactor `ShimeRobotPresence` to own only state, accessibility, container, and glow while composing the canonical face.
3. Refactor `ShimeBrandMark` to compose the `xs` canonical hardware face instead of separate SVG circles.
4. Move face geometry and state colors to CSS variables and semantic theme roles; adapt one-shot wink/gaze and reduced motion; remove active continuous face animation.
5. Remove the rectangular Settings wrapper surface while preserving the rounded Card, warning strip, toggle, focus, and scheduler behavior.
6. Add targeted tests, validator, reports, full regression gates, theme/mobile QA, screenshots, and a short Playwright-recorded arrival video.

## 13. PASS / NOT PASS to Proceed

**PASS.** Root causes are confirmed, the scope is presentation-only, and the canonical consolidation can preserve every locked behavior.
