# BIG-UPDATE-11 Brand System

## Purpose

BIG-UPDATE-11 defines stable product roles without removing the existing theme and compatibility tokens. The new roles are semantic: components refer to what a color means, not to a screen-specific color choice.

## Semantic roles

| Role | Tokens | Product use |
|---|---|---|
| Shime Purple | `--shime-action`, `--shime-action-strong`, `--shime-action-soft` | Primary actions, headline accent, active navigation, important focus |
| Shime Mint | `--shime-robot`, `--shime-robot-strong`, `--shime-robot-soft` | Robot identity, privacy-safe state, positive feedback |
| Warm Lavender / Off-white | `--shime-canvas`, `--shime-surface` | Page canvas and calm surfaces |
| Deep Ink | `--shime-ink`, `--shime-ink-muted` | Headline, body, and supporting text |
| Amber | `--shime-warning`, `--shime-warning-soft` | Caution, due review, beta/review-needed state |
| Focus | `--shime-focus-ring` | Keyboard-visible focus halo |

Dark-mode overrides are defined for the same roles. Ocean, sunset, and lavender theme tokens remain available; BIG-UPDATE-11 roles keep the core Shime identity stable across those themes.

## Components

- `ShimeBrandMark`: reusable static robot mark with decorative and informative accessibility modes.
- `ShimeNavigationIcon`: route-based inline SVG icon set shared by Sidebar and BottomNav.
- `ShimeRobotPresence`: retained for the larger Home identity; approved blink, ambient presence, and reduced-motion behavior remain unchanged.
- Success badges use mint; warning badges use amber; primary buttons and active navigation use purple.

## Shell rules

- Sidebar and BottomNav continue to derive destinations and active state from `navRoutes` and `NavLink`.
- The previous plain `S` mark is replaced by `ShimeBrandMark`.
- Icons are decorative because visible route labels remain the accessible names.
- Navigation animation never gates or delays route changes.
- Mobile safe-area, fixed position, and touch target behavior remain unchanged.

## Compatibility impact

Existing tokens such as `--color-primary`, `--brand`, surface tokens, spacing, radii, and motion durations were not removed or redefined. The semantic Shime layer is additive and is applied through the final BIG-UPDATE-11 CSS block. No runtime behavior, dependency, or asset was added.

## Accessibility

- Purple focus treatment is visible against lavender, off-white, and mint surfaces.
- Informative marks can expose `role="img"` and a label; decorative marks are `aria-hidden`.
- Inline navigation SVGs are decorative and do not duplicate route names.
- Reduced motion remains supported.
