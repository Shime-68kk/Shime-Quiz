# BIG-UPDATE-14 Shime Launch Runtime

## Conclusion

**PASS.** The approved storyboard is implemented as a dedicated, skippable launch gate before routed application content. The physical firmware repository remained read-only.

## Runtime Architecture

`ShimeLaunchGate` is mounted inside `BrowserRouter` and outside the route tree. It renders the existing app behind a fixed launch surface. While active, the app wrapper is `aria-hidden`, has the native `inert` attribute, and rejects pointer selection. Sidebar, BottomNav, and Home are therefore neither visible nor interactive during launch.

`launchLifecycle.js` captures the browser document's initial pathname once. A document opened on `/` is eligible; a document opened on any deep route is not. Completion is module-memory only. Hard refresh creates a new document and replays; SPA returns, theme changes, language changes, and rerenders do not.

## Canonical OLED Runtime

`ShimeRobotHead` owns the rounded hardware shell. `ShimeOledFace` owns one scalable SVG with `viewBox="0 0 128 64"`.

- Neutral left: `(27,14) 32×36 rx8`.
- Neutral right: `(69,14) 32×36 rx8`.
- Neutral gap: 10.
- Attention left: `(25,13) 34×38 rx8`.
- Attention right: `(69,13) 34×38 rx8`.
- Firmware-style happy bottom masks and tired top-triangle masks are included in the same SVG.

Launch, Home, compact brand, and StudyRoom compose this face. There is no eye selector, circle/dot fallback, persisted eye preference, canvas, or WebGL.

## Five-Second Timeline

- `0–450ms`: theme-aware stage and wall; Skip is visible.
- `450–1850ms`: head rolls from the left through 1.5 turns.
- `1850–2150ms`: 0.96×/1.03× impact squash, 2px wall response, restrained ring.
- `2150–2850ms`: tired OLED mask, ±2px confused shake, two rounded particles.
- `2850–3350ms`: recovery to attention geometry and center.
- `3350–3700ms`: one left-eye close/open; right eye remains stable.
- `3550–4450ms`: exact `Shime Quiz` brand and persisted-locale welcome copy.
- `4450–5000ms`: overlay fades; prepared Home is revealed without a white frame.

Completion is driven by CSS `animationend`, not a JavaScript timer. Skip and Escape invoke the same immediate completion path.

## Reduced Motion

`prefers-reduced-motion: reduce` disables roll, rotation, wall impact, particles, dizzy shake, wink, blink, gaze, float, nod, and feedback shake. A static attention face and localized brand remain for 700ms, then Home is exposed. Skip remains available.

## Home and StudyRoom

The embedded `ShimeArrivalGreeting` and `arrivalSession` were removed. Home retains only a small OLED safe-signal face and medium attentive idle companion.

StudyRoom still derives `mascotReaction` from its existing evaluator. `ShimeStudyCompanion` receives only reaction, localized message, and label. It renders a large OLED head with idle blink/gaze/float, one-shot HAPPY_EYES response for correct, and one-shot sympathetic shake plus stable tired mask for incorrect. No raw learning content reaches the component.

## Performance Comparison

| Metric | Before approved launch | After | Delta |
| --- | ---: | ---: | ---: |
| JS | 994.11kB | 996.76kB | +2.65kB |
| JS gzip | 276.00kB | 276.70kB | +0.70kB |
| CSS | 174.82kB | 186.81kB | +11.99kB |
| CSS gzip | 29.42kB | 31.62kB | +2.20kB |
| Modules | 301 | 303 | +2 |
| Latest build time | 2.77s reference | 5.22s | environment-variable |

The existing >500kB chunk warning remains. No dependency, asset, route chunk, React render loop, timer loop, broad `will-change`, blur animation, or frame-by-frame storage read was added. Runtime gzip growth is 2.90kB total and is not material.

## Evidence

All runtime videos are in `output/playwright/big-update-14-launch-runtime/`:

1. `01-hard-refresh-full-cinematic-vi.webm`
2. `02-roll-in-wall-impact.webm`
3. `03-dizzy-recovery-one-eye-wink.webm`
4. `04-vietnamese-branding.webm`
5. `05-english-branding.webm`
6. `06-skip-button-and-escape.webm`
7. `07-home-library-home-no-replay.webm`
8. `08-direct-library-no-launch.webm`
9. `09-studyroom-idle-oled.webm`
10. `10-studyroom-correct-expression.webm`
11. `11-studyroom-incorrect-expression.webm`
12. `12-reduced-motion-launch.webm`

Manual QA also passed at 360, 390, 428, 768, 1024, and 1440px with zero horizontal overflow and zero browser console errors.

## Locked Boundaries

Learning logic, answer evaluation, scoring, progression, storage, import/export, SM2, FSRS, scheduler gates, Safe Capsule checksum, device bridge, companion bridge, sensing, and firmware were not changed. `package-lock.json` is unchanged. No commit or push was performed.
