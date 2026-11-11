# Scene 01 — Poetic Butterfly Chase: Motion Spec
## BIG-UPDATE-14.8

### 1. Overview
Total duration: ~7.8s. A short, poetic animation opening. Shime chases a butterfly across a lavender meadow, hits a boulder, and blacks out.

### 2. Story Beats

| Beat | Time | Action | Expression |
|------|------|--------|------------|
| Establishing | 0.00–0.75s | Environment fades in. Boulder visible. No robot. | — |
| Butterfly Enters | 0.75–1.35s | Butterfly flies in from upper-right, hovers gently. | — |
| A: Slow Happy Bob | 1.35–2.15s | Shime appears from left. Slow, curious approach. Body bobs. | CURIOUS |
| B: Small Hop | 2.15–2.75s | First hop. Compress → lift → apex → land → settle. | CURIOUS |
| C: Slow Follow | 2.75–3.35s | Slow advance. Head tilts toward butterfly. Rest beat. | ATTENTION |
| D: Playful Hop | 3.35–4.05s | Higher hop. More excitement. Faster horizontal speed. | ATTENTION |
| Slow Follow 2 | 4.05–4.55s | Brief advance and pause. | ATTENTION |
| E: Final Jump | 4.55–5.25s | Biggest jump. Shime watches butterfly rounding boulder. | ATTENTION |
| Late SCARED | 5.25–5.37s | Eyes widen briefly. Still open. No blink yet. | SCARED |
| Contact | 5.37–5.46s | Shell front touches boulder. BLINK_FAST. Shell deforms. | BLINK_FAST |
| Rebound | 5.46–6.05s | Short arc left+up. Eyes shut. Rotation ≤18°. | BLINK_FAST |
| Landing | 6.05–6.38s | Corner-first ground contact. Compress. Tiny slide. Settle. | BLINK_FAST |
| Blackout | 6.38–6.82s | OLED fades 100ms → hold dark 340ms. | OFF |
| Electrical Crackle | 6.82–7.48s | 2–3 tiny sparks. OLED scanline flicker 40ms. | OFF |
| Scene End | 7.48–7.80s | Last spark fades. Scene 01 complete. | OFF |

### 3. Shime Movement (No Legs)
Shime moves by bouncing its whole spherical body:
- **Bob**: Body rises 4–8 units, descends, slight horizontal advance
- **Hop**: Compress bottom 6–10%, lift off ground, arc, land with shell compression
- **Each hop differs**: vary amplitude (small → medium → large), speed, and follow-through
- **Gaze leads body**: Eyes track butterfly before body turns

### 4. Butterfly
- 4-wing silhouette (2 upper, 2 smaller lower)
- Wing beat: 2–3 fast flaps → glide → hover → repeat
- Path: gentle S-curve, altitude varies 180–250 world units
- Rounds boulder at t≈4.80s (motivates Shime's distracted final jump)

### 5. Boulder
- Natural, moss-covered, irregular shape
- Width: 70–95% of robot width. Height: 65–90% of robot height
- Contact surface at world X≈623, angled 8° from vertical
- At impact: translate max 1.5px desktop, rotate max 0.5°, single damped settle
- Stands completely still before impact

### 6. Contact Physics
- **Pre-contact gap** (1 frame before): 4–7px desktop, 3–5px mobile
- **Contact onset**: tangent touch, penetration ≈0
- **Max overlap**: ≤1.5px desktop, ≤1.0px mobile
- **Transform origin**: 94% 52% (near contact edge, not center)
- **Shell deformation phases** (88ms total):
  - 0–16ms: onset, scaleX→0.99, scaleY→1.01
  - 16–42ms: compression, scaleX→0.93, scaleY→1.05
  - 42–66ms: max compression hold
  - 66–88ms: recovery, scaleX→0.96, scaleY→1.02
- **OLED lags shell by 16ms**
- No pause in normal playback. Debug-only 300ms pause.

### 7. Rebound
- Direction: left + slightly upward
- Arc length: 65–95% of robot width
- Vertical: 25–40% of robot height
- Rotation: starts at 6–12°, peaks ~18°, not a coin spin
- Pivot transitions from contact-side to center over 100ms
- Not the reversed entry path

### 8. Landing
1. Bottom-corner of shell touches ground
2. Shell compresses 4–6%
3. Robot tilts and slides ≤5 world units
4. Settle over 200ms
5. OLED begins fade only after settle

### 9. Blackout
- OLED brightness fades over 100ms (not instant)
- No X-eyes, no spiral, no dead face
- Hold dark for 340ms

### 10. Electrical Crackle
- Starts 60–100ms after blackout begins
- 3 sparks, staggered: 60ms, 45ms, 35ms duration
- Near shell top edge, ≤20% of robot width
- OLED: single 40ms scanline flicker at t≈7.08s
- Shell jitter: ≤1.0px
- No neon, no RGB glitch, no chromatic aberration

### 11. OLED Expression Rules
- Single persistent SVG, viewBox 0 0 128 64
- Base eyes: 32×36, gap 10, radius 8
- ATTENTION: 34×38
- SCARED: tired eyelids + sweat + flicker (H:3, V:3)
- BLINK_FAST: height→3 (eyes shut)
- Transitions: `current = (current + target) / 2` (firmware interpolation)
- No face remounting. No display:none swaps.

### 12. World Space
- Canvas: 1000×600 units
- Ground: y=480
- Both desktop and mobile use identical trajectory, timing, contact point
- Only camera crop/scale differs

### 13. Camera
| Viewport | Scale | Contact at |
|----------|-------|-----------|
| Desktop 1440×900 | 0.72x | 64% x, 48% y |
| Mobile 390×844 | 0.39x | 62% x, 45% y |

### 14. Themes
- **Lavender Field**: purple-pink dawn, cream warmth, gray-green grass, lavender flowers
- **Forest Dark**: teal-moss twilight, soft side lighting, subtle greens
- Same layout, trajectory, timing. Only palette + atmosphere differ.
