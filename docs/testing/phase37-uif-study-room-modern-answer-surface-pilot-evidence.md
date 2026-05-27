# Phase 37-uiF — Study Room Modern Answer Surface Pilot Evidence

## Status tokens
PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_STATUS: COMPLETED_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_IMPLEMENTATION

PHASE37UIF_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_DECISION: READY_FOR_PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW

PHASE37UIF_RUNTIME_SCOPE: STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_ONLY_NO_SCORING_OR_QUEUE_BEHAVIOR_CHANGES

PHASE37UIF_SELECTED_EFFECT: STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT

PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED

## Scope
Phase 37-uiF implements one runtime visual pilot only: Study Room answer surface / answer cards / selected state / check or reveal feedback / explanation framing.

## Study Room discovery
`src/routes/StudyRoom.jsx` owns the current item state and passes it into `StudyItemRenderer`. The selected Study Room runtime file is `src/routes/StudyRoom.jsx`, and the implementation adds only a passive class and data marker to the existing answer feedback wrapper.

## Scoring/queue/scheduler boundaries
No scoring correctness, answer evaluation, selected answer behavior, check/reveal behavior, next/continue behavior, scheduler/FSRS, queue logic, question data, stored progress, routes/navigation, event handlers, storage/import/parser, packages, sync/backend/auth/telemetry, localStorage, or Phase 37C separation changed.

Boundary shorthand for static review: no scoring correctness changes, no localStorage writes, no scheduler/FSRS changes, no queue logic changes, and no question data changes.

## Implementation summary
The pilot adds the scoped host class `phase37uif-study-room-modern-answer-surface-pilot`, the data marker `data-phase37uif-answer-surface-state`, and scoped CSS tokens for answer-card depth, border, glow, selected/check/reveal states, feedback panels, explanation framing, focus affordances, and reduced-motion-safe transitions.

## Changed files
- `.github/workflows/e2e-smoke.yml`
- `src/routes/StudyRoom.jsx`
- `src/styles/global.css`
- `tests/unit/studyRoomModernAnswerSurfacePilot.test.jsx`
- `docs/testing/phase37-uif-study-room-modern-answer-surface-pilot-evidence.md`
- `docs/release/phase37-uif-study-room-modern-answer-surface-pilot-summary.md`
- `docs/planning/phase37-uig-study-room-modern-answer-surface-evidence-review-seed.md`
- `scripts/validate-phase37-uif-study-room-modern-answer-surface-pilot.js`

## Visual difference
Answer cards now have a stronger premium card treatment with layered white surfaces, calmer selected/correct/wrong/revealed tinting, subtle shadows, and stronger borders while staying inside the existing Study Room answer surface.

## One-surface containment
All new visual selectors are scoped under `.phase37uif-study-room-modern-answer-surface-pilot`. Dashboard, Library, BottomNav, Sidebar, App, main, routes, package files, E2E specs, theme persistence, storage/import/parser/database/scheduler/FSRS/sync/auth/backend/telemetry files remain unchanged.

## Answer-card states
The pilot covers `.choiceOption`, `.choiceOption--selected`, `.choiceOption--correct`, `.choiceOption--wrong`, `.shortAnswerField input`, `.flashcard`, `.flashcard--revealed`, and feedback panels under the scoped host.

## Selected/check/reveal preservation
Selected answer behavior remains owned by the existing radio input and `onAnswerChange` path. Check behavior remains owned by `checkCurrentAnswer`. Reveal behavior remains owned by `toggleCurrentFlashcard`. Phase 37-uiF changes only passive class/data markers and CSS.

## Explanation visibility
Multiple-choice and short-answer explanations still render only through the existing checked feedback blocks. Phase 37-uiF changes the visual framing of those blocks without changing when explanations appear or what text is shown.

## Scoring preservation
Patch inspection confirms no changes to `getItemCorrectness`, `getCheckedAnswerFeedback`, `checkCurrentAnswer`, attempt summary generation, result summary persistence, or scoring helpers.

## Queue/scheduler/data preservation
Patch inspection confirms no changes to queue selection, scheduler/FSRS files, study history/storage files, item data, parser/import files, or stored progress schemas.

## Contrast
The new state colors use restrained tinted surfaces with existing text colors and existing success/danger tokens. Phase 37-uiG should verify actual desktop and 375px screenshots.

## Focus-visible
Focus-visible and focus-within outlines remain explicit and stronger on choice cards and short-answer input. The existing keyboard path remains unchanged.

## Reduced-motion
The CSS includes `@media (prefers-reduced-motion: reduce)` to disable the new scoped transitions and animation effects for the answer surface pilot.

## Mobile 375px
The pilot does not add fixed widths. Choice cards and feedback surfaces keep existing grid/min-width containment. Phase 37-uiG should capture 375px Study Room evidence and confirm no horizontal overflow.

## Desktop
Desktop Study Room remains in the existing Study Room layout. The visual change is limited to answer-card and feedback surfaces inside the current session stack.

## E2E impact
No E2E specs were modified. Existing smoke and onboarding flows remain the validation path.

## Phase 37C separation
Phase 37C Limited Release Readiness Gap Review remains separate. Phase 37-uiF does not replace Phase 37C and does not upgrade release readiness.

## Validation
Required validation: dependency install, Phase 37-uiF validator, build, unit tests, smoke E2E, onboarding E2E, `git diff --check`, and patch apply check against clean `origin/main`.

## Risks
The main residual risk is visual: actual screenshots may identify contrast, spacing, or overflow refinements for Phase 37-uiG. Behavioral risk is limited by passive runtime changes and static validation.

## Decision
PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_DECISION: READY_FOR_PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW

## Supported claims
Phase 37-uiF supports the scoped Study Room Modern Answer Surface Pilot, static/unit validation, CI registration, and validator modes `pr-diff`, `post-merge-main`, and `validator-hotfix`.

## Not-approved claims
Phase 37-uiF does not approve BETA_READY, public production readiness, release-readiness upgrade, broad UI redesign, Study Room scoring/correctness/scheduler/queue/data changes, storage/import/parser changes, sync/cloud/account/auth/backend, telemetry, route/event-handler changes, package changes, full Dynamic Canvas themes, theme picker, persisted preferences, localStorage writes, Streak Fire, Collapsible Header, or replacement of Phase 37C.

## Next phase
Next recommended phase: Phase 37-uiG — Study Room Modern Answer Surface Evidence Review.
