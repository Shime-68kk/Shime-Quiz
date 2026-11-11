# BIG-UPDATE-14.2 Current Motion Forensics

## 1. Executive Verdict

The BIG-UPDATE-14.1 runtime is technically safe but visually **NOT PASS** for production approval. Its actors are deterministic and persistent, but the motion system reads as parallel CSS interpolation rather than physical cause and effect. The redesign can remain lightweight 2.5D; Three.js is not justified at this gate.

## 2. Current Timeline Architecture

- `ShimeLaunchGate.jsx` owns the Home-only, once-per-document lifecycle, Skip, Escape, inert app, and completion boundary.
- `ShimeLaunchIntro.jsx` renders one persistent robot, one persistent pillar, two particles, two temporary legs, nine glyph fragments, and the final title.
- `launchLifecycle.js` defines 9,200ms full motion and 700ms reduced motion.
- Every animated actor runs a separate CSS animation with the same 9,200ms duration.
- Actor keyframes are synchronized only by matching percentages. There is no master animation object, shared playback control, phase model, or completion promise.
- Most actor animations use `linear`; physical acceleration is approximated only through keyframe spacing.

## 3. Actor and Layer Map

1. Fixed launch overlay and Skip control.
2. Flat scene plane and single horizontal stage line.
3. One persistent pillar actor with a base pseudo-element.
4. One persistent robot-head actor containing the canonical OLED SVG.
5. Two launch-only 27px leg elements without explicit feet or joints.
6. One impact ring and two small particle actors.
7. Nine persistent title glyph actors.
8. Final exact title and localized subtitle.

There are no robot or pillar contact-shadow actors, no floor-depth layer, no foreground occlusion layer, and no independently lagging shell/display layers.

## 4. Entry Motion Findings

**NOT PASS.** The robot starts offscreen and crosses quickly, but there is no visible anticipation pose, shell lag, travel-depth scale, stretched shadow, or speed-compressed excited OLED state. A whole-head rotation and linear position change communicate movement, not momentum.

## 5. Collision Findings

**NOT PASS.** Contact uses one scale deformation and a 3px pillar shift. There is no 50–90ms held contact pose, contact shadow convergence, separate shell/display inertia, base drag, depth punch, or readable rebound tangent. The two particles do not establish mass.

## 6. Leg and Kick Findings

**NOT PASS.** Each leg is 27px tall, far below the requested 55%–95% head-height range. There are no telescoping sections, pivot housings, feet, planted-foot compression, or readable contact silhouette. The kicking leg rotates but cannot physically reach and drive the pillar center of mass.

## 7. Pillar Continuity Findings

**NOT PASS.** The DOM actor is correctly persistent, but its visual identity is generic. It has no cap ring, retained crack, band, or dent. It exits at 58vw, becomes invisible, then reappears one tenth of a percent later at a different transform. That opacity/position discontinuity reads as teleportation. The return has no readable distant re-entry, apex hold, shadow path, or near-vertical drop.

## 8. Expression Findings

**NOT PASS.** The canonical `0 0 128 64` OLED and physical eye rectangles are preserved. Acting is limited to neutral/attention geometry plus tired, angry, and happy masks and one final wink. Several narrative states therefore share silhouettes. Turbo excitement, impact shock, return panic, determined kick preparation, tumble daze, side gaze, and final delight are not explicit vector poses.

## 9. Brand Reveal Findings

**PARTIAL PASS.** Nine deterministic glyphs assemble into exact `Shime Quiz`, and both glyph group and final title use viewport `50% / 50%` centering. All letters share one animation curve and arrive simultaneously rather than with a 35–70ms stagger. Their scatter is legible but not tied to detachable robot/pillar modules.

## 10. Final Hold Findings

**NOT PASS.** The final title is visible from approximately 8.19s to 8.80s, around 0.61s. The localized welcome is fully introduced only around 8.80s and begins leaving by 9.02s, around 0.22s of useful display. This is materially below the required two-second final composition hold.

## 11. Performance Findings

The current implementation is performance-conservative: transform/opacity dominate, there are no timers, frame loops, canvas, video, WebGL, network calls, or animation dependencies. The actor count is small. The redesign should preserve these properties and can use the Web Animations API without adding a package.

## 12. Root Causes of the Plastic Feeling

1. Independent percentage-based CSS animations instead of one controllable master timeline.
2. Linear interpolation across major actions and no authored acceleration/deceleration curves per phase.
3. No anticipation before entry or kick.
4. No contact hold, ground compression, contact shadow, or depth cue.
5. Whole-head motion with no shell, OLED, leg, or accessory overlap and lag.
6. Undersized legs with no joints or feet.
7. A generic pillar with an opacity/transform discontinuity during return.
8. Too few distinct OLED silhouettes for the narrative states.
9. Minimal secondary debris and no causal relationship between pieces and title fragments.
10. Simultaneous letter settlement and a final hold too short to read emotionally.
11. Flat staging: one line, no floor plane, perspective scale, occlusion, or transformable shadows.

## 13. Safe Redesign Strategy

- Keep the launch gate, replay rules, canonical OLED geometry, localization, and theme tokens unchanged.
- Prototype outside `src/` in a standalone design animatic.
- Use one 13.1-second Web Animations API clock with persistent actors and explicit offsets.
- Add 2.5D floor perspective, robot and pillar shadows, shell/display lag, telescoping mechanical legs, a marked persistent pillar, and restrained chips.
- Author twelve explicit OLED states in the fixed viewBox.
- Give the pillar a continuous departure/re-entry/arc/apex/drop path lasting 1.5 seconds.
- Stagger glyph settlement and hold the complete final composition for two seconds.
- Keep the reduced-motion production target at 600–800ms with physical gags bypassed.
- Add no dependency. Escalate to Three.js only if the browser animatic cannot demonstrate readable depth.

## 14. PASS / NOT PASS to Continue Design

**PASS TO CONTINUE DESIGN.** The failure causes are identifiable and repairable with layered SVG, CSS perspective, transform shadows, and one Web Animations API timeline. Production implementation remains blocked pending explicit design approval.
