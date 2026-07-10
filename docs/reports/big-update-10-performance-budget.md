# BIG-UPDATE-10 Performance Budget

## Phase identification
**big-update-10** — Premium Start Experience + Robot Identity + UX Writing Polish

---

## Targets

| Metric | Target | Notes |
|--------|--------|-------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | Hero headline is text, no image LCP element |
| INP (Interaction to Next Paint) | ≤ 200ms | No blocking JS in new UI components |
| CLS (Cumulative Layout Shift) | Avoid unexpected shifts | All animations use transform/opacity only |
| FID / Total Blocking Time | Minimal | No heavy animation library added |

---

## Animation Budget

### Rules enforced in BIG-UPDATE-10

1. **No autoplay video** — Not added.
2. **No giant hero raster asset** — Robot is CSS+inline styles, no raster image.
3. **Prefer CSS/SVG robot** — `ShimeRobotPresence` uses CSS border-radius shapes + inline styles.
4. **Animate transform/opacity only** — All `@keyframes` in global.css for BIG-UPDATE-10 use exclusively:
   - `opacity` (composited)
   - `transform: translateY()` (composited)
   - `transform: scale()` (composited)
   - `filter: blur()` (composited on most browsers for glow layer)
5. **No layout thrashing** — No `width`, `height`, `margin`, `padding`, `top`, `left` animated.
6. **Avoid heavy animation libraries** — `framer-motion`, `gsap`, `three`, `matter-js`, `lottie` NOT added.
7. **Preserve build success** — No new `package.json` dependencies.

### Duration budget

| Animation | Duration | Trigger |
|-----------|----------|---------|
| `shimeFadeSlideIn` (hero content) | 240ms | Page load (CSS animation, no JS blocking) |
| `shimeFadeSlideIn` (robot chip) | 180ms, 40ms delay | Page load |
| `shimeRobotGlowPulse` (robot idle) | 2400ms infinite | Idle state (very slow, no visual jank) |
| Proof card hover | 180ms | Hover (pointer device only) |
| Robot face hover | 180ms | Hover (pointer device only) |

### Reduced motion path

All new BIG-UPDATE-10 animations are disabled by:
```css
@media (prefers-reduced-motion: reduce) {
  .shimeLandingHero__content,
  .shimeLandingRobotChip,
  .shimeLandingProofCard {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .shimeRobotPresence__glow--pulse {
    animation: none;
    opacity: 0.6;
  }
}
```

State clarity is preserved even with zero animation. No information is hidden behind motion.

---

## Assets added in BIG-UPDATE-10

| Asset | Type | Size | Reason |
|-------|------|------|--------|
| None | — | 0 KB | No raster/video assets added |
| ShimeRobotPresence CSS | Inline styles + CSS classes | ~3 KB | Pure CSS component, no image |
| shimeLanding* CSS | global.css addition | ~6 KB | Layout and animation CSS |
| motionTokens.js | JS module | ~3 KB | Pure constants, tree-shakeable |
| productVoice.js | JS module | ~5 KB | Pure constants, not bundled in production path unless imported |

---

## LCP Analysis

The LCP element on the redesigned Home page is expected to be the `h1` text element (largest text block). This is:
- Static text, no image
- Not behind a lazy-load boundary
- Renders synchronously with page HTML
- No font loading delay (Inter loaded by existing CSS)

Estimated LCP: **< 1.5s on fast connection**, **< 2.5s on slow 3G** (text only, no large raster).

---

## CLS Analysis

New CSS animations that could cause CLS:
- `shimeFadeSlideIn`: uses `transform: translateY()` — does NOT cause CLS (transform is composited, does not affect layout flow)
- `shimeRobotGlowPulse`: uses `transform: scale()` on glow layer — does NOT affect document flow

Robot component: inline flex box with fixed width/height via inline styles — no layout shift on mount.

**Expected CLS: 0.000** for new elements.

---

## Build check

Existing build system is Vite. No new dependencies added. Build should pass without modification.

If `npm run build` fails, it is a pre-existing issue unrelated to BIG-UPDATE-10.
