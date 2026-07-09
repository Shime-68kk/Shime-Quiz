# BIG-UPDATE-9 UI Foundation Audit

## Scope

This audit checks the UI foundation before a future premium visual phase. It does not approve a broad redesign.

Boundary commitments:

- SM2 remains default.
- FSRS remains beta opt-in.
- No real robot bridge.
- No cloud/backend/network.
- Raw question/answer must not cross robot-safe boundary.
- StudyRoom needs future decomposition.
- Mobile UI future polish should be done after foundation hardening.

## Findings

### Global CSS size and responsibility

`src/styles/global.css` is 6123 lines. It contains global reset/theme/layout rules, route-specific surfaces, StudyRoom styles, mobile touch rules, animation rules, pilot styles, mascot styles, and several broad overrides. Risk level: high.

Recommended split:

- Keep global: reset, typography base, app shell layout, design tokens import, focus-visible defaults, reduced-motion defaults, core button/card primitives if they are truly shared.
- Move component-level: StudyRoom subject spaces, StudyRoom stepper, mascot, Library subject detail, route-specific card grids, chips, tabs, and one-off phase pilot effects.

### Repeated card/button/chip styles

Cards, buttons, chips, tabs, callouts, and rails are styled repeatedly in global CSS. Existing `Button`, `Card`, `Badge`, and `ProgressBar` components help, but global selectors still re-skin the same patterns.

Recommendation: add a small design-system layer before premium polish:

- `Panel` or stricter `Card` variants for framed repeated items.
- `Chip` for subject, topic, and status chips.
- `SegmentedControl` for route tabs.
- `StatusCallout` for feedback, persistence, safety, and warning states.
- `Rail` or `TabRail` for horizontal mobile rails.

### Mobile breakpoints

Mobile breakpoints are spread throughout global CSS. StudyRoom and Library each add local mobile behavior through global selectors. Some mobile polish is well guarded by `touch-action: pan-y`, proximity snap, and reduced-motion rules, but the overall breakpoint inventory is hard to reason about.

Recommendation: centralize breakpoint tokens or document canonical widths, then migrate component styles gradually.

### Subject-space layout classes

Affected classes include `.studySubjectSpaces`, `.studySubjectSpaces__header`, `.studySubjectSpaces__nav`, `.studySubjectSpaces__rail`, `.studySubjectChip`, and `.studySubjectPanel`.

Risk: medium. The component is small and semantic, but the styles are route-specific and should eventually live closer to `StudyRoomSubjectSpaces`.

### Quiz card mobile readability

StudyRoom answer surfaces rely on global card, choice, feedback, and stepper styles. Existing smoke tests check mobile route overflow, and gesture tests preserve vertical scroll. Future polish should verify long prompts, long answer choices, and mixed Vietnamese/English copy at narrow widths.

Recommendation: add visual checks before premium UI changes, especially for 360px and 390px widths.

### Animation/reduced-motion consistency

There are multiple `prefers-reduced-motion: reduce` blocks, which is good. The risk is fragmentation: new animations can be added far away from the relevant reduced-motion block.

Recommendation: keep route animation rules adjacent to their reduced-motion override when styles are moved out of global CSS.

### Touch target consistency

Buttons and navigation controls generally use component primitives. Global `touch-action: manipulation` and StudyRoom `touch-action: pan-y` are present. The remaining risk is small chip/tab controls in horizontal rails.

Recommendation: standardize minimum touch target height and gap through a shared chip/tab primitive.

### Design token usage

The app uses `src/design-system/tokens.css`, but later global additions include direct colors, broad `!important`, and phase-specific effects. This makes future premium redesign risky because some visuals bypass tokens.

Recommendation: migrate direct colors and one-off radii/shadows to tokens or component variants during BIG-UPDATE-10.

### Future UI redesign risk areas

- `src/styles/global.css` size and override density.
- StudyRoom route size and mixed responsibilities.
- Broad selectors affecting all headings/cards/buttons.
- Phase-specific class names remaining in production selectors.
- Mascot and StudyRoom premium liquid styles living globally.
- Subject detail and StudyRoom styles mixed into one global file.

## BIG-UPDATE-10 Recommended Scope

Future BIG-UPDATE-10 UI polish should be foundation-first:

- Decompose StudyRoom before major visual changes.
- Extract component-level CSS for StudyRoom subject spaces, mascot, and stepper.
- Introduce a small design-system layer for chips, panels, status callouts, rails, and segmented controls.
- Keep SM2 default and FSRS beta opt-in unchanged.
- Keep no real robot bridge and no cloud/backend/network.
- Keep robot-safe summaries coarse and raw-content-free.
- Add screenshot or Playwright visual smoke checks for mobile StudyRoom readability.
