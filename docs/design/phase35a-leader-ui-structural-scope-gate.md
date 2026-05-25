# Phase 35A — Leader UI Structural Scope Gate

## Status tokens

```text
PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_STATUS: COMPLETED_LEADER_UI_SCOPE_GATE
PHASE35A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_DECISION: PASS_TO_PHASE35B_SMALL_UI_IMPLEMENTATION
PHASE35A_SCOPE_TYPE: DESIGN_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE35A_UI_PLAN_HANDLING: STRATEGIC_REFERENCE_NOT_FULL_IMPLEMENTATION
PHASE35B_LIBRARY_BOOKSHELF_SEED_STATUS: PREPARED_SMALL_IMPLEMENTATION_SEED
```

This document is for internal review only. Not for public use.

Phase 35A is a structural scope gate and does not implement runtime UI changes.
Phase 35A treats shime-ui-plan.md as strategic reference, not a full implementation mandate.
Phase 35A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 35A does not approve BETA_READY.
Phase 35A does not approve public production readiness.
Phase 35A does not approve broad validation or stress-tested readiness.
Phase 35A does not approve guaranteed data-loss prevention.
Phase 35A does not approve storage, backup, restore, sync, cloud, backend, account, auth, telemetry, or network changes.
Phase 35A does not approve import parser, local database pipeline, prompt builder, file drop-zone lifecycle, scheduler, FSRS, data model, or route behavior changes.
Phase 35A does not approve Dynamic Canvas Themes implementation.
Phase 35A does not approve 3D card flip, confetti, casino-like effects, sound, or distracting animation.

---

## Scope

Phase 35A is the Leader UI Structural Scope Gate. Its role is to:

- Convert `shime-ui-plan.md` from a broad strategic design document into a safe, staged UI roadmap.
- Summarize the current UI evidence available for Landing, Overview, Library, Study Room, and Settings.
- Frame the core UX problems without expanding scope beyond visual/structural UI concerns.
- Compare candidate first-implementation ideas for Phase 35B.
- Select exactly one small implementation candidate for Phase 35B.
- Prepare a Phase 35B implementation seed for the chosen candidate.
- Preserve all beta readiness guardrails and data-safety boundaries.

Phase 35A does not implement any runtime UI changes. It is docs/design/testing/release/planning/static-validator/CI-only.

---

## Current readiness boundary

```text
Controlled limited beta:    GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS
Highest approved readiness: LIMITED_BETA_CANDIDATE
BETA_READY:                 NOT APPROVED
Public production:          NOT APPROVED
Phase 30C Beta Ready hold:  NOT LIFTED
```

All 10 inherited limitations from Phase 32F remain unresolved through Phase 34C:

| # | Limitation | Status |
|---|---|---|
| 1 | Restore rehearsal browser lane | BLOCKED_DEFAULT_OFF — not production restore proof |
| 2 | Adapter-awareness browser lane | BLOCKED_DEFAULT_OFF — not production adapter proof |
| 3 | Generated/test stress evidence | smoke-level only — not production-grade |
| 4 | Rollback/removal evidence | simulation-only — not a guaranteed rollback proof |
| 5 | No real learner data evidence | no real learner data present |
| 6 | No public production readiness evidence | not intended |
| 7 | No guaranteed data-loss prevention | participants must maintain independent backups |
| 8 | Ordinary-user Data Safety UX visibility | not approved — internal only |
| 9 | No sync/cloud/account/auth/backend evidence | not present or intended |
| 10 | Phase 30C Beta Ready hold not lifted | BETA_READY not approved |

Phase 35A does not resolve any of these limitations. All future UI phases must operate within LIMITED_BETA_CANDIDATE constraints subject to all 10 limitations.

---

## Inputs reviewed

- `leader-ui-shime-quiz-handoff.md` — Post-34C context, guardrails, and recommended next-step plan for Leader UI.
- `shime-ui-plan.md` — Strategic UI research document identifying three core UX problems and eight upgrade ideas.
- Phase 34A, 34B, 34C documentation — design gate, implementation scope, and evidence review for Leader UI effects E01–E04.
- `docs/design/phase34a-leader-ui-effects-design-spec.md` — boundaries established for effects track.
- `docs/testing/phase34c-leader-ui-effects-evidence-review.md` — decision: PASS_LEADER_UI_EFFECTS_WITH_LIMITED_EVIDENCE.
- Screenshot observations described below.

`shime-ui-plan.md` is treated as a strategic reference, not as a mandate to implement all its contents at once. The UI plan contains high-quality design thinking that must be staged carefully to match the app's current LIMITED_BETA_CANDIDATE status and controlled limited beta constraints.

---

## Screenshot evidence summary

The following observations are based on the current production UI state of Shime Quiz v2.0.0-beta.1. Screenshots were reviewed for five screens: Landing, Overview (Dashboard), Library, Study Room, and Settings.

### Landing

- Clean cream/stone palette with a calm centered hero layout.
- App identity and tagline are immediately visible.
- Navigation to the app starts from a clear entry point.
- No observable cognitive overload on the landing screen.
- Evidence status: Satisfactory. No structural UI problem requiring immediate fix.

### Overview (Dashboard)

- The Dashboard contains a multi-widget layout: due-count summary, session trend widgets, recent accuracy metrics, and wrong-answer lists.
- Heavy analytics widgets stack vertically, creating a dense information wall on initial load.
- The daily progress signal is present but not visually prioritized over the analytical data.
- Cognitive overload risk: PRESENT. Users opening the app see a complex metrics dashboard before reaching the core study action.
- The study action entry point is buried below analytics widgets.
- Structural problem confirmed: Dashboard currently mixes deep analytical context with the primary daily action goal.

### Library

- The Library screen presents both the subject/book catalog and import/configuration tools on the same visual plane.
- JSON/CSV import controls, EduGen configuration panels, and raw text paste areas appear alongside the study topic list.
- Users who only want to select a topic to study must scroll past configuration tooling.
- Cognitive overload risk: HIGH. The tool-oriented import surface dominates the learner-facing study selection surface.
- Structural problem confirmed: Library needs separation between the study shelf and the import workshop.

### Study Room

- The Study Room has a clean single-focus question display layout.
- Answer choice buttons are visible and appropriately spaced.
- Feedback reveal uses color transitions already implemented in Phase 34B (E01–E02).
- No major structural problem observed. The current layout correctly focuses the learner on the question.
- Minor visual polish opportunities exist (button rounding, answer feedback reveal animation refinement) but these are not blocking.
- E04 (ProgressTickEffect) remains inactive and deferred.

### Settings

- The Settings screen contains toggle controls (FSRS), text input areas (EduGen URL, API key), and the Data Safety UX section.
- Text input areas are functional but the JSON paste textarea may expand vertically during large paste, potentially disrupting layout.
- FSRS toggle is present but gated behind internal visibility rules.
- Data Safety UX panel is present (default-off, internal visibility only per Phase 31G).
- No critical structural problem in Settings. Refinements can be phased.

### Summary

Two screens have confirmed structural problems requiring near-term attention:
1. **Library** — HIGH urgency: study shelf and import workshop overlap creates immediate cognitive overload for daily learners.
2. **Dashboard** — MODERATE urgency: deep analytics dominate first impression; daily action is not the primary visual signal.

Three screens (Landing, Study Room, Settings) have no structural blocker and can receive polish in later phases.

---

## UI problem framing

Three core problems are identified from the UI plan and current screenshot evidence:

### Problem 1: Library cognitive overload (HIGH)

The Library screen conflates two distinct user contexts:
- **Learner context**: choosing what to study from an organized shelf of subjects.
- **Configuration context**: importing files, configuring prompts, setting up EduGen.

Learners who open the Library to begin a session must navigate past heavy import/configuration tooling. This is the highest-impact structural problem to fix because it affects every daily study workflow.

### Problem 2: Dashboard cognitive overload (MODERATE)

The Dashboard opens with analytics-first content (trend data, accuracy history, wrong-answer lists) rather than leading with the core daily action. This creates cognitive friction at app-open time. The daily study action should be the most visually prominent element; analytics should be accessible but not dominant.

### Problem 3: Navigation lacks fluid micro-interaction (LOW for now)

The navigation sidebar uses hard-cut tab switching. While functional, it lacks the premium spatial continuity that would support a future mobile-hybrid layout. This is a low-risk micro-interaction improvement but does not need to be the first structural change.

---

## Strategic interpretation of shime-ui-plan.md

`shime-ui-plan.md` presents eight upgrade candidates rated by business value and implementation risk. The document is a well-structured strategic design input. However, it was not written as a phased implementation plan for a limited-beta-candidate product with 10 open limitations.

**Key interpretation decisions for Phase 35A:**

1. The plan's scoring of "35/35 — KEEP (Ưu tiên 1)" for Bookshelf Tab System and Hybrid Sliding Indicator does not mean both must be implemented together in a single phase.

2. The plan's detailed Tailwind/React implementation guidance in Section 7 (Tasks 1–5) is reference-quality guidance for future phases, not a mandate to implement all tasks at once.

3. Dynamic Canvas Themes (Section 2.3) involves LocalStorage state and CSS variable management. It requires a separate data-safety and theme-state design gate before implementation. It is explicitly deferred.

4. Rejected effects from the plan (3D card flip, Ambient Particle Confetti) remain rejected and must not be added to any future phase scope.

5. The plan's three-phase strategic recommendation (Structural → Micro-interactions → Smart Adaptive Polish) aligns with the staged roadmap below.

**Safe restatement of plan priorities for Phase 35A:**
- Phase 35B: Library Bookshelf Tab System (structural, local UI state).
- Phase 35D/35E: Dashboard deconstruction (after Bookshelf is stable).
- Phase 35F: Hybrid Sliding Navigation Indicator.
- Phase 35G: Elastic Button Compression.
- Phase 35H: Study Room answer feedback polish.
- Phase 35I+: Settings polish, Streak Fire, Collapsible Header, Themes — each with its own gate.

---

## Candidate comparison table

| Candidate | Screen/area | User value | Implementation risk | Data/logic risk | Expected changed areas in future phase | Why now / why later | Decision |
|---|---|---|---|---|---|---|---|
| Library Bookshelf Tab System | Library | HIGH — separates import tools from daily study selection; fixes highest-impact cognitive overload | LOW — local React `useState` tab controller; no data model change required | VERY LOW — must not change import parsers, pipelines, prompt builders, drop-zone lifecycles | Library container component, tab header CSS, conditional visibility blocks | NOW — addresses highest-urgency Library problem; local UI state only; rollback by removing component/CSS diff | **CHOSEN for Phase 35B** |
| Dashboard simplification / Progress Journal split | Overview | HIGH — removes analytics overload from first impression; calms app-open experience | MODERATE — requires identifying and re-routing analytics widgets; Progress Journal is a new sub-view | MODERATE — must not change study data queries, scheduler outputs, or any persistence layer | Dashboard container, widget layout, new Progress Journal sub-view | LATER — important but structurally larger than Bookshelf; Library fix is more urgent and lower risk | Defer to Phase 35D/35E |
| Hybrid Sliding Navigation Indicator | Navigation | MEDIUM — improves spatial feel and future mobile-hybrid readiness | LOW — absolute positioned pill div + CSS transition; routing behavior unchanged | VERY LOW — must not change routing hooks, click handlers, or page rendering logic | Navigation/Sidebar component, CSS | LATER — micro-interaction polish; deferred until structural screens are resolved | Defer to Phase 35F |
| Elastic Button Compression | All action buttons | MEDIUM — tactile press feedback; improves interaction quality | VERY LOW — CSS-only active/hover transforms; no logic change | NONE — purely visual | Global button CSS or utility class | LATER — CSS-first micro-interaction; can be added as a small pass after structural fixes | Defer to Phase 35G |
| Study Room answer/feedback polish | Study Room | LOW-MEDIUM — incremental improvement to existing E01–E02 effects | LOW — CSS/animation refinement only | LOW — must not change answer checking, review logic, or scheduler behavior | Study Room component, phase34b effects CSS | LATER — current Study Room is functional; E04 still deferred | Defer to Phase 35H |
| Streak Fire Ignition | Header/TopBar | MEDIUM — motivational visual feedback on day completion | LOW — SVG icon + CSS transition; tied to isDayCompleted flag | LOW — must not change scheduler, score, review sequence, or persistence | TopBar component, streak widget CSS | LATER — motivational polish; deferred until structural screens are resolved | Defer to Phase 35J |
| Collapsible Header | Header/TopBar | MEDIUM — maximizes Study Room reading space on scroll | MODERATE — requires scroll-direction detection and header state controller | MODERATE — must not disrupt viewport scroll, input pointer events, or routing | GlobalHeader component, scroll listener | LATER — requires separate navigation/header ownership gate before implementation | Defer to Phase 35K |
| Dynamic Canvas Themes | Settings/Global | LOW-MEDIUM — personalization of study environment | HIGH — requires LocalStorage theme state, CSS variables, context provider | HIGH — separate data-safety and theme-state design gate required | Settings screen, global CSS variables, theme context | MUCH LATER — deferred; requires explicit design gate before any implementation | Defer to Phase 35L+ (gate only if approved) |

---

## Staged Leader UI roadmap

This roadmap translates `shime-ui-plan.md` into small, safe implementation phases. Each phase is one focused scope. No phase combines structural refactoring with micro-interaction polish.

```text
Phase 35A — Leader UI Structural Scope Gate (this phase)
           Docs/design/testing/release/planning/static-validator/CI only.
           No runtime changes.

Phase 35B — Library Bookshelf Tab System
           Small runtime implementation: local UI tab controller for Library.
           Default tab: Kệ sách của tôi.
           Secondary tab: Xưởng nạp tài liệu.
           Local UI state only.
           No import parser / database / prompt builder / drop-zone changes.

Phase 35C — Library Bookshelf Evidence Review / Follow-up Fixes
           Review Phase 35B browser/manual evidence.
           Fix any regressions or edge cases identified.
           Decision gate only if no regressions found.

Phase 35D — Dashboard Deconstruction Scope Gate
           Design gate only.
           Define safe scope for Dashboard widget reorganization.
           Plan Progress Journal sub-view structure.

Phase 35E — Dashboard Calm Home / Progress Journal Split
           Small runtime implementation: Dashboard widget reorganization.
           Default view: greeting + today progress + today journey.
           Progress Journal: separate accessible sub-view.

Phase 35F — Hybrid Sliding Navigation Indicator
           Small runtime implementation: pill indicator behind active nav item.
           CSS transition only. No routing behavior changes.

Phase 35G — Elastic Button Compression
           Small runtime implementation: CSS-first active/hover press feedback.
           No logic changes. Reduced-motion fallback required.

Phase 35H — Study Room Answer Feedback Polish
           Small runtime implementation: incremental Study Room visual refinements.
           Must not change answer checking, review logic, or FSRS behavior.

Phase 35I — Advanced Settings UI Polish Scope Gate
           Design gate only for Settings UI refinements.

Phase 35J — Optional Streak Fire Ignition Gate
           Design gate + small implementation if approved.
           Must not change scheduler, score, review sequence, or persistence.

Phase 35K — Collapsible Header Research / Gate
           Research gate. Must not disrupt scroll, input, or routing behavior.
           Implementation only if gate passes.

Phase 35L+ — Dynamic Canvas Themes Design/Data-Safety Gate only if explicitly approved (deferred — gate-only, not approved for implementation)
           Gate only — implementation explicitly NOT approved in Phase 35A.
           Requires separate design-gate and data-safety review if ever pursued.
```

This roadmap does not combine all major UI changes into one runtime phase. Each phase is independently reversible. Every runtime phase must preserve prefers-reduced-motion, keyboard visibility, no layout shift, and short motion duration.

---

## Chosen Phase 35B candidate

```text
Library Bookshelf Tab System
```

Default tab: `Kệ sách của tôi`
Secondary tab: `Xưởng nạp tài liệu`

---

## Why Library Bookshelf goes first

1. **Highest-urgency structural problem.** The Library screen is where learners spend time selecting daily study topics. Cognitive overload at this point directly degrades the daily study workflow.

2. **Local UI state only.** The tab switch requires only a `useState` controller. No storage, no data model change, no import parser change is needed to implement the tab split safely.

3. **Rollback is simple.** Removing the tab component and its CSS diff restores the original Library layout without affecting any persistent data.

4. **Strict containment possible.** The forbidden areas (import parsers, database pipelines, prompt builders, drop-zone lifecycles) can all remain completely untouched. The tab simply shows/hides existing UI sections behind a state flag.

5. **Matches UI plan's top structural priority.** `shime-ui-plan.md` scores the Bookshelf Tab System at 35/35 and names it the first structural refactoring task.

6. **No prerequisite phases.** Unlike Dashboard deconstruction (which needs careful widget re-routing analysis) or the Hybrid Sliding Indicator (which needs responsive nav architecture review), the Bookshelf tab can be added to the existing Library component with minimal structural change.

---

## Why Dashboard deconstruction waits

1. The Dashboard requires identifying which analytics widgets to move and where to route them (Progress Journal sub-view). This is a larger change surface than a single tab controller.

2. Dashboard changes risk affecting the daily study action entry point, which is a critical user path. This requires a separate design gate (Phase 35D) before implementation.

3. Library fix is higher urgency (affects every daily study session) and lower risk. Dashboard fix should follow once Library is stable and evidence is collected.

---

## Why navigation polish waits

1. The Hybrid Sliding Navigation Indicator is a micro-interaction improvement, not a structural blocker. Navigation is functional today.

2. Implementing a sliding pill indicator requires careful absolute positioning within the nav component. This should be done after structural screens are resolved, not mixed with structural refactoring.

3. Future mobile-hybrid architecture (the full Tailwind responsive layout switch) is a larger scope than a simple pill indicator. Deferred until the app's mobile-hybrid direction is confirmed.

---

## Explicit non-goals

Phase 35A explicitly does not:

- Implement any runtime UI changes.
- Change any source files in `src/`.
- Change any test files in `tests/` or `e2e/`.
- Change `package.json` or `package-lock.json`.
- Change any existing docs, ADR, or release notes files.
- Change backup, restore, export, import, migration, storage, sync, cloud, backend, account, auth, telemetry, or network files.
- Change FSRS behavior, scheduling behavior, or study data models.
- Change navigation routing, settings routing, or Library data behavior.
- Approve BETA_READY, public production readiness, or broad validation.
- Lift the Phase 30C Beta Ready hold.
- Resolve any of the 10 inherited limitations.
- Implement Dynamic Canvas Themes.
- Add 3D card flip, confetti, casino-like effects, sound, or distracting animation.

---

## Forbidden claims and systems

Phase 35A must not claim:

- BETA_READY status.
- Public production readiness.
- Guaranteed data-loss prevention.
- Broad validation or stress-tested readiness.
- Sync, cloud, backend, account, auth, or telemetry availability.
- Restore behavior approval.
- Storage migration approval.
- Dashboard implementation completion (Dashboard deconstruction is deferred to Phase 35D/35E).
- Navigation indicator implementation completion (deferred to Phase 35F).
- Dynamic Canvas Themes implementation.

---

## Rollback strategy for future runtime phases

Every future runtime phase in the Leader UI roadmap must include a rollback plan. The standard rollback model is:

- Small component/CSS diff is the unit of implementation.
- Rollback = remove the component file, remove the CSS diff, remove the import.
- No persistent data should be modified in a way that prevents rollback.
- No storage schema changes in UI-only phases.
- No routing changes that require migration to undo.

Phase 35B (Library Bookshelf) specifically: rollback by removing the tab controller component and its conditional rendering wrapper from the Library component. The underlying import tools and book catalog remain untouched.

---

## Validation and evidence plan

Phase 35A validation:

- `scripts/validate-phase35a-leader-ui-structural-scope-gate.js` (Codex lane) checks required tokens, required headings, required candidate names, staged roadmap structure, and no-forbidden-file constraints.
- `.github/workflows/e2e-smoke.yml` registers Phase 35A validator as the active CI check.
- `git diff --name-only origin/main...HEAD` confirms only owned files are changed.

Phase 35A does not require browser evidence (no runtime changes). The validator is the primary evidence for this gate.

Note: The Phase 35A validator may not fully pass until the Codex lane is integrated. This lane (Claude docs/design) produces the docs only. The final integration must combine both lanes before running the full validator.

---

## Next recommended phase

```text
Next recommended phase: Phase 35B — Leader UI Library Bookshelf Tab System
```

Phase 35B will implement the Library Bookshelf tab split as a small, safe, local-UI-state runtime change.
See `docs/planning/phase35b-leader-ui-library-bookshelf-seed.md` for the full Phase 35B implementation seed.
