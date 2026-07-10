# BIG-UPDATE-12 Theme Contrast Matrix

## Verdict

**PASS for calculated critical pairs.** Ratios were calculated with the WCAG relative-luminance formula in `src/uiTheme/contrast.js`. No unmeasured LCP, INP, or CLS claim is made.

| Theme | Body / canvas | Muted / canvas | On brand | Safe status | Warning status |
| --- | ---: | ---: | ---: | ---: | ---: |
| Forest Calm | 14.69:1 | 5.12:1 | 6.27:1 | 5.97:1 | 5.99:1 |
| Forest Dark | 16.17:1 | 7.69:1 | 8.85:1 | 7.50:1 | 6.77:1 |
| Ocean Calm | 14.57:1 | 4.83:1 | 6.45:1 | 5.97:1 | 5.99:1 |
| Sunset Warm | 15.52:1 | 5.75:1 | 5.92:1 | 5.97:1 | 6.51:1 |
| Lavender Field | 15.76:1 | 6.10:1 | 7.03:1 | 5.97:1 | 5.99:1 |

All listed text pairs exceed 4.5:1. Focus rings and selected-control boundaries use dedicated semantic roles and were also reviewed visually; exact non-text contrast was not instrumented for every legacy diagnostic control.

## Semantic Contract

Every theme exposes all required page, text, brand, companion, border, interactive, status, progress, and chart roles. The canonical role list and five complete role maps live in `src/uiTheme/themeRuntime.js` and `src/uiTheme/themeDefinitions.js`.

Status usage:

- Mint/green: safe, positive, completed, healthy.
- Product brand/active role: primary actions, selected controls, active navigation.
- Amber: warning, caution, beta, preparation, review needed.
- Red: error and destructive action.
- Blue: neutral information.

## Forest Dark

- Active navigation uses lavender product roles, not success green.
- Beta and preparation surfaces use warning roles.
- Safe states remain green only when they mean safe or complete.
- Canvas, cards, inputs, helper text, and borders use dark semantic surfaces.
- Muted text ratio is 7.69:1 against the dark canvas.
- No intentional white card remains on the dark canvas.

## Persistence

- Theme storage key: `shime.ui.theme.v1`.
- Legacy `theme` values are read for compatibility but new writes use the versioned key.
- Invalid values fall back to Forest Calm.
- Theme is applied before React render without network or blocking initialization.
- Theme writes do not modify language, learning, scheduler, backup, or robot data.
