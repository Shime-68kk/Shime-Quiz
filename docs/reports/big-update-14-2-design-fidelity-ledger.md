# BIG-UPDATE-14.2 Design Fidelity Ledger

## Verdict

**PASS FOR DESIGN APPROVAL.** The browser animatic materially improves the confirmed BIG-UPDATE-14.1 weaknesses: it establishes anticipation, contact, shadows, long legs, a persistent marked pillar, a 1.5-second return, explicit emotional silhouettes, staggered title assembly, and a two-second final hold. It is a timing and staging specification, not production polish.

## Evidence map

- Generated concepts: `docs/design/assets/big-update-14-2/`
- Timed browser animatic: `docs/design/big-update-14-2-animatic.html`
- Expression sheet: `docs/design/big-update-14-2-expression-sheet.html`
- Physicality, pillar, 2.5D, and timing sheet: `docs/design/big-update-14-2-physicality-spec.html`
- Videos and key frames: `output/playwright/big-update-14-2-design-gate/`

## Comparison ledger

| Area | BIG-UPDATE-14.1 | Generated concept evidence | Timed animatic evidence | Required Stage 2 repair / lock |
|---|---|---|---|---|
| 1. Entry expression | Neutral/attention geometry; insufficient excitement. | `01-turbo-entry.png` preserves large physical eye area with forward intent. | `key-01-entry.png`, desktop video 0.55–1.55s use explicit `TURBO_EXCITED`. | Port the explicit SVG state; do not approximate with shell rotation. |
| 2. Entry speed | Linear travel with no visible anticipation or depth shadow. | Turbo concept shows opposing head tilt, travel trail, and stretched shadow. | Master timeline adds backward anticipation at 0.55–0.72s, acceleration, shell lag, and stretched shadow. | Preserve the anticipation pause and authored acceleration curve. |
| 3. First impact | One scale change, 3px pillar shift, two particles. | `08-lavender-field.png` establishes rebound, retained crack, and contact ring. | `key-02-impact.png` holds contact for 70ms, adds squash, base drag, four chips, and shock state. | Keep the 70ms silhouette; tune only after slow-motion review. |
| 4. Rebound weight | Immediate reposition toward center. | Lavender concept uses airborne separation and grounded shadow. | 2.10–2.95s uses rotational travel, stretched shadow, landing compression, and overshoot. | Keep shell/OLED lag separated by 35–55ms. |
| 5. Dizzy readability | Tired mask and brief wobble; visually close to annoyed. | Second-impact concept supports a separate dazed vocabulary. | `key-03-dizzy.png` and 2.95–3.70s hold explicit spiral eyes for about 560ms after landing. | Preserve at least 450ms of fully readable spiral state. |
| 6. Leg length | 27px stick legs, no joints or feet. | `02-long-leg-kick.png` proves telescoping reach and grounded planted foot. | `leg-kick-silhouette-sheet.png` locks 65% planted leg, 90% kick leg, and 28% head-width foot. | Implement rounded two-segment legs and pivots as persistent launch actors. |
| 7. Kick contact | Foot tap cannot reach pillar mass. | Long-leg concept shows foot at lower-middle pillar zone and head counter-rotation. | `key-04-kick.png`, 5.48–5.55s hold extended foot contact for 70ms. | Align production geometry from measured bounding boxes at desktop/mobile. |
| 8. Pillar identity | One DOM actor but generic appearance and an opacity teleport. | `03-same-pillar-return.png` and `02-long-leg-kick.png` retain band, cap, crack, and dent. | One persistent pillar carries all marks from first impact through departure, arc, and drop. | Never remount, replace, or clear the marks after first impact. |
| 9. Pillar return readability | Invisible transform discontinuity; return too compressed. | Return concept makes depth scale, path, marks, and robot notice explicit. | `key-05-return.png`, `key-05b-apex.png`, and videos show visible re-entry, arc, apex, then drop over 1.5s. | Keep at least 700ms visible before drop and the 190ms apex slowdown. |
| 10. Second impact | Fast ambiguous crossing; object not clearly on robot. | `04-second-impact-tumble.png` establishes vertical contact and controlled modules. | `key-06-second-impact.png` uses upright pillar, converged shadow, panic-to-impact expression, and shell compression. | Recheck exact cap/base orientation and shell contact in production slow motion. |
| 11. Tumble | High rotation but limited causal parts. | Second-impact concept ties modules to physical contact. | `key-07-tumble.png`, 9.05–9.95s use right-to-left tumble, leg recoil, selected chips, and nine glyph actors. | Keep debris count restrained and make each title glyph causally emerge from the tumble. |
| 12. Brand centering | Mathematically centered but all glyphs share one arrival curve. | `05-centered-final-hold.png` confirms viewport-centered title independent of robot. | `key-08-assembly.png` uses individual letters with 45ms stagger; final title remains at `50% / 50%`. | Validate optical center at 390, 768, 1280, and 1440px widths. |
| 13. Final expression | Happy mask plus wink; little side-gaze acting. | Final concept places Shime to one side, looking toward exact title. | `key-09-final-hold.png` transitions `FINAL_SIDE_GAZE` to `FINAL_DELIGHT`. | Port both vector states and use only one soft final settle/blink. |
| 14. Final two-second hold | Title about 0.61s; subtitle about 0.22s. | Final concept provides a calm complete composition. | 10.65–12.65s holds exact title, localized subtitle, robot side gaze/delight for 2.00s. | Treat this duration as locked; do not shorten to optimize total runtime. |
| 15. Mobile composition | Squeezed desktop transforms and edge pressure. | `06-mobile-composition.png` proves a vertical return/drop composition. | `key-10-mobile-return.png` and `mobile-animatic.webm` keep actors within 390×844 bounds and reserve title center. | Author mobile travel distances from viewport-relative measured targets, not desktop constants alone. |

## Concept-to-animatic mismatches accepted at the gate

1. Generated images use richer material rendering than the vector animatic. Stage 2 should reproduce depth through gradients, edge highlights, and shadows without raster assets.
2. Some generated concepts exaggerate pillar texture or mechanical joint detail. The deterministic physicality sheet, not the raster texture, is authoritative for production geometry.
3. The animatic uses simplified chips and no heavy motion blur. This is intentional for performance and implementation clarity.
4. The design badge and timeline note are animatic-only and must not appear in production.

## Design gate decision

The accepted specification is the combination of the deterministic HTML sheets and timed videos. Generated concepts provide material and lighting intent; where raster geometry conflicts, the canonical OLED and physicality sheets win.

**Recommendation: APPROVE STAGE 2, pending explicit user response `DESIGN APPROVED — CONTINUE BIG-UPDATE-14.2`.**
