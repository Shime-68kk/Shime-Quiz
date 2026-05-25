# Phase 35B — Leader UI Library Bookshelf Tab System Seed

## Status token

```text
PHASE35B_LIBRARY_BOOKSHELF_SEED_STATUS: PREPARED_SMALL_IMPLEMENTATION_SEED
```

This seed is for internal planning only. Not for public use.

---

## Purpose

Phase 35B implements the Library Bookshelf Tab System — a local-UI-state tab split that separates the learner-facing study shelf from the import/configuration workshop in the Library screen.

This is the first small runtime UI implementation of the Leader UI roadmap established in Phase 35A.

---

## Inputs from Phase 35A

```text
PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_STATUS: COMPLETED_LEADER_UI_SCOPE_GATE
PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_DECISION: PASS_TO_PHASE35B_SMALL_UI_IMPLEMENTATION
PHASE35A_SCOPE_TYPE: DESIGN_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE35A_UI_PLAN_HANDLING: STRATEGIC_REFERENCE_NOT_FULL_IMPLEMENTATION
PHASE35A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
```

Phase 35A identified Library cognitive overload as the highest-urgency structural problem. The Bookshelf Tab System was selected as the first implementation candidate because it is the highest-value, lowest-risk structural fix available.

Inherited limitations: All 10 limitations from Phase 32F are carried forward and unresolved. Phase 35B operates within LIMITED_BETA_CANDIDATE constraints.

---

## Implementation candidate

```text
Library Bookshelf Tab System
```

This is the only candidate for Phase 35B. Do not combine with Dashboard deconstruction, navigation indicator, or any other candidate from the roadmap.

---

## User-facing intent

The Library screen currently places import/configuration tools on the same visual plane as the study topic shelf. Users opening the Library to start a daily study session must scroll past EduGen configuration, JSON/CSV import controls, and raw text paste areas before reaching their subject books.

The Bookshelf Tab System resolves this by:

- Making `Kệ sách của tôi` (My Bookshelf) the default tab — showing only the study topic catalog, clean and focused.
- Moving all import/configuration tools into `Xưởng nạp tài liệu` (Import Workshop) — accessible via an explicit tab click.
- Keep import/configuration tools away from default learner-facing shelf.

The learner's default experience is a calm, uncluttered study shelf. The power-user import workflow remains fully accessible one tab click away.

---

## Strict scope

Phase 35B implements ONLY:

1. A minimal tab header bar at the top of the Library screen with two tab labels:
   - `Kệ sách của tôi` (default, active on entry)
   - `Xưởng nạp tài liệu`

2. Local `useState` tab controller: `const [libraryTab, setLibraryTab] = useState('shelf')`.

3. Conditional rendering:
   - When `libraryTab === 'shelf'`: render the subject/book catalog grid. Hide import/configuration tools.
   - When `libraryTab === 'import'`: render import/configuration panels. Hide the book catalog grid.

4. Tab styling: minimal horizontal text selection switch. No complex animation. No new icon libraries.

5. One small CSS block for tab header visual state (active/inactive tab indicator). Must include `prefers-reduced-motion` check — instant switch if motion is reduced.

This scope is intentionally minimal. Do not add accordion book cards, book-spine visual redesign, color-per-subject system, or any other feature from the UI plan in Phase 35B. Those belong in later phases.

---

## Non-goals

Phase 35B explicitly does not:

- Change import parsers.
- Change local database query pipelines.
- Change prompt builders.
- Change file drop-zone lifecycles.
- Change backup/restore behavior.
- Change study entry behavior or study data queries.
- Change routing behavior.
- Add 3D card flip, confetti, casino-like effects, or complex animations.
- Implement the accordion book-spine visual redesign from the UI plan.
- Implement Dynamic Canvas Themes.
- Add Dashboard deconstruction.
- Add Hybrid Sliding Navigation Indicator.
- Add Elastic Button Compression.
- Add Streak Fire Ignition.
- Add Collapsible Header.
- Approve BETA_READY or public production readiness.
- Lift the Phase 30C Beta Ready hold.

---

## Allowed files / expected areas for Phase 35B

Phase 35B is expected to modify only:

```text
src/components/Library.jsx  (or equivalent Library container component)
src/styles/phase35b-leader-ui-library-bookshelf.css  (new small CSS block, if needed)
```

If the Library component is named differently (e.g., `LibraryView.jsx`, `LibraryPage.jsx`, `Library.tsx`), the coder must identify the correct component file from the project structure before implementing.

If the CSS can be cleanly scoped within the component's existing Tailwind utilities without a new CSS file, a separate CSS file is not required. The coder should choose the simplest approach.

Phase 35B must also produce:

```text
tests/unit/leader-ui-library-bookshelf.test.js  (unit tests for tab state behavior)
scripts/validate-phase35b-leader-ui-library-bookshelf.js  (static validator)
```

And update:

```text
.github/workflows/e2e-smoke.yml  (register Phase 35B validator as active)
```

The exact file set for Phase 35B may be further refined by the coder after reading the Library component source. The coder must not touch files outside the allowed set.

---

## Forbidden areas for Phase 35B

Do not modify:

```text
src/parsers/**
src/database/**
src/storage/**
src/backup/**
src/restore/**
src/migration/**
src/prompts/**
src/scheduler/**
src/fsrs/**
src/routes/**  (routing configuration)
src/main.jsx  (unless only adding the new CSS import)
tests/**  (except the new Phase 35B unit test file)
e2e/**
package.json
package-lock.json
sw.js
boot-guard.js
docs/adr/**
RELEASE_NOTES.md
RELEASE_NOTES_V2.md
prior phase files
historical scripts/validate-*.js files
production backup/export/restore modules
storage drivers
data model files
import parsers
prompt builders
file drop-zone lifecycle code
FSRS runtime behavior
scheduler behavior
sync/cloud/account/auth/backend files
telemetry/analytics
```

---

## Implementation guidance

1. **Find the Library container component.** Read the source to understand how the Library renders its book catalog and import panels. Identify which elements belong to the shelf view and which belong to the import workshop.

2. **Add a `useState` tab controller.** Insert `const [libraryTab, setLibraryTab] = useState('shelf')` at the top of the Library component function.

3. **Render the tab header bar.** Place a minimal horizontal switch above the main content area with two clickable tab labels. The active tab should have a simple visual indicator (underline, slightly bolder weight, or a small border-bottom — choose the simplest approach consistent with the app's existing style). Do not add complex animation for the indicator; instant state is acceptable.

4. **Wrap existing content blocks.** Do not restructure the internal Library UI extensively. Instead, wrap existing import-tool sections with `{libraryTab === 'import' && ...}` and ensure the book catalog is wrapped with `{libraryTab === 'shelf' && ...}`. If some elements are shared between both tabs (e.g., a page title), leave them unwrapped.

5. **Reduced motion.** If any tab-switch animation is added (e.g., a fade), it must be gated with `@media (prefers-reduced-motion: no-preference)`. An instant switch is always acceptable.

6. **CSS-first preference.** Use Tailwind utilities where possible. Only add a separate CSS file if Tailwind alone cannot cleanly express the tab indicator state.

7. **No layout shift.** The tab header bar should not cause the main content area to shift or jump. Use fixed-height tab bar or ensure the bar height is consistent between active states.

8. **Verify state preservation.** Before completing implementation, manually test that toggling between tabs multiple times does not flush raw text/input state in the import panels. If any controlled input components reset on re-mount, wrap them in a visibility-toggle approach (`hidden` CSS class) rather than unmounting them.

---

## State preservation requirements

- Raw text/input state in the `Xưởng nạp tài liệu` tab (JSON paste textarea, EduGen URL field, etc.) must NOT be flushed when switching to `Kệ sách của tôi` and back.
- If conditional rendering (`{condition && <Component />}`) unmounts the import panel and resets controlled inputs, switch to CSS-based visibility toggling (`className={libraryTab === 'import' ? '' : 'hidden'}`) to preserve state.
- The book catalog in `Kệ sách của tôi` must behave identically to the current Library behavior. Study entry, topic selection, and session launch must be unaffected.

---

## Accessibility and reduced-motion requirements

- Tab controls must be keyboard-accessible. Use semantic `<button>` elements or a proper ARIA tab pattern.
- Active tab must have visible focus indicator.
- No animation that blocks interaction.
- `prefers-reduced-motion`: tab switch must be instant (no animation) when reduced motion is preferred.
- Minimum touch target: 44×44px for tab labels.
- Screen reader: tab state change should be announced. Consider `aria-selected` or equivalent role.

---

## Manual evidence plan

After Phase 35B implementation, the following manual evidence must be collected:

1. Open Library screen — confirm `Kệ sách của tôi` tab is active by default.
2. Click `Xưởng nạp tài liệu` — confirm import/configuration tools appear.
3. Enter text in import panels (e.g., type in JSON textarea).
4. Click back to `Kệ sách của tôi` — confirm text is preserved.
5. Click back to `Xưởng nạp tài liệu` — confirm text is still present.
6. Repeat tab switch 5 times — confirm no data loss or UI corruption.
7. Select a topic from the bookshelf and launch a study session — confirm correct behavior.
8. Test with `prefers-reduced-motion: reduce` in browser devtools — confirm instant tab switch.
9. Navigate via keyboard only — confirm both tabs are reachable.
10. Check browser console for errors during tab switches.
11. Screenshot: `Kệ sách của tôi` tab (clean bookshelf).
12. Screenshot: `Xưởng nạp tài liệu` tab (import workshop).

---

## Validation required

Phase 35B must pass:

```bash
npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false
node scripts/validate-phase35b-leader-ui-library-bookshelf.js
npm run build
npm run test:unit
```

The Phase 35B validator must check:

- Required files exist.
- CI registers Phase 35B validator.
- Required tokens exist.
- Unit tests exist for tab state behavior.
- No forbidden files changed.
- No import parsers, database pipelines, prompt builders, drop-zone lifecycles, backup/restore, FSRS, or scheduler files changed.
- State preservation requirement is documented.
- Reduced-motion requirement is documented.
- Rollback plan is documented.

---

## Coder deliverables

The Phase 35B coder must produce:

1. Updated Library container component with tab controller.
2. Minimal tab header rendering.
3. Conditional visibility for import tools and book catalog.
4. Small CSS block (if needed) for tab indicator.
5. Unit tests for tab state behavior.
6. Phase 35B static validator script.
7. Updated `e2e-smoke.yml` (Phase 35B validator as active check).
8. Patch file: `phase35b-leader-ui-library-bookshelf.patch`.
9. Handoff document: `phase35b-leader-ui-library-bookshelf-handoff.md`.

---

## Reviewer focus

A reviewer for Phase 35B should verify:

- Library Bookshelf Tab System only — no scope creep into other candidates.
- `Kệ sách của tôi` is the default tab.
- `Xưởng nạp tài liệu` contains all import/configuration tools.
- No import parser, database pipeline, prompt builder, or drop-zone lifecycle changes.
- No backup/restore behavior changes.
- State preservation during tab switches.
- Reduced-motion compliance.
- No new dependencies introduced.
- No package.json changes.
- No forbidden file changes.
- Build passes. Unit tests pass.
- Rollback is possible by removing the component/CSS diff.

---

## Tester focus

A tester for Phase 35B should verify:

- Default tab behavior on Library entry.
- Tab switch behavior (both directions, multiple times).
- State preservation (input text not flushed).
- Study session launch from bookshelf tab works correctly.
- No console errors.
- Keyboard navigation for tab controls.
- Reduced-motion behavior.
- No layout shift.
- Screenshots for both tabs.
- Rollback test: remove component/CSS diff, confirm Library returns to original layout.

---

## Rollback plan

Phase 35B rollback steps:

1. Remove the tab controller `useState` from the Library component.
2. Remove the tab header bar rendering.
3. Remove the conditional visibility wrappers from import tools and book catalog sections (restore original unconditional rendering).
4. Remove the Phase 35B CSS file import (if a separate CSS file was created).
5. Remove `src/styles/phase35b-leader-ui-library-bookshelf.css` (if created).

After rollback, the Library screen returns to its original layout with all content on a single visual plane. No persistent data is affected by rollback. No storage entries are written by the Bookshelf tab implementation.

---

## Decision options

```text
HOLD_LIBRARY_BOOKSHELF_IMPLEMENTATION
NEEDS_LIBRARY_BOOKSHELF_SCOPE_REWORK
PASS_TO_PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW
```

If implementation is clean, browser evidence is collected, and no regressions are found, the decision should be:

```text
PASS_TO_PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW
```

Phase 35C will review the Phase 35B implementation evidence and browser observations before confirming the bookshelf change as stable.

---

## Recommended next step

Implement Phase 35B: Library Bookshelf Tab System.

Required constraints (from Phase 35A seed spec):

- Library Bookshelf Tab System only.
- Default tab: `Kệ sách của tôi`.
- Secondary tab: `Xưởng nạp tài liệu`.
- Keep import/configuration tools away from default learner-facing shelf.
- Use local UI state only unless a later phase explicitly approves otherwise.
- Do not alter import parsers.
- Do not alter local database query pipelines.
- Do not alter prompt builders.
- Do not alter file drop-zone lifecycles.
- Do not alter backup/restore behavior.
- Preserve raw text/input state during tab switches.
- Preserve current Library data and study entry behavior.
- Reduced motion: instant or non-animated tab switch is acceptable.
- Rollback should be possible by removing the small component/CSS diff.

Additional steps:

- Collect manual browser evidence after implementation.
- Run build + unit + validator before producing patch.
