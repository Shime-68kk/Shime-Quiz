# BIG-UPDATE-13 Radius and Surface System

## Decision

PASS. Existing numeric radii remain unchanged and now feed semantic roles:

| Role | Alias | Use |
| --- | --- | --- |
| Shell | `--radius-shell` → `--radius-2xl` | Large route/workflow shells |
| Panel | `--radius-panel` → `--radius-xl` | Nested sections and disclosures |
| Card | `--radius-card` → `--radius-lg` | Repeated content cards |
| Control | `--radius-control` → `--radius-md` | Inputs, strips, compact controls |
| Small | `--radius-small` → `--radius-sm` | Small supporting surfaces |
| Pill | `--radius-pill` | Badges and pill controls |

The hierarchy is `shell > panel > card > control > small`, with pill reserved for fully rounded elements.

## Confirmed Fixes

- Library material detail: `.subjectDetailContainer` uses shell radius; its inset `.subjectDetailHeader` uses panel radius, semantic border, surface, and padding. Search, topic filtering, item rendering, and study actions are unchanged.
- Settings FSRS preparation strip: `.settingsPanel__warningBlock` uses control radius, warning semantics, balanced padding, and the existing left accent. Toggle callbacks and FSRS gating are unchanged.
- Settings disclosures: `.settingsGroup` uses panel radius with visible overflow; toggle/content children use coordinated radii.
- Library shelf: interactive shelf overflow is visible, so keyboard focus is not clipped. Its decorative pseudo-element remains inset.

## Browser Evidence

- Library detail computed radii: outer `36px`, header `28px`.
- Settings warning computed radius: `16px`.
- Settings disclosure computed overflow: `visible`.
- Forest Calm, Forest Dark, Ocean Calm, Sunset Warm, and Lavender Field: coherent warning/surface semantics and no horizontal overflow.

No large interactive container received `overflow: hidden` or `overflow: clip` in this phase.
