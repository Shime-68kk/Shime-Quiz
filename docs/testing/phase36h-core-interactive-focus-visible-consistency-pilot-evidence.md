# Phase 36H — Core Interactive Focus Visible Consistency Pilot Evidence

## Status tokens

PHASE36H_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_STATUS: COMPLETED_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION
PHASE36H_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE36H_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_DECISION: READY_FOR_PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW
PHASE36H_RUNTIME_SCOPE: CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_ONLY_NO_HANDLER_OR_ROUTING_CHANGES
PHASE36H_SELECTED_EFFECT: CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT

## Scope

Phase 36H is a narrow CSS-only runtime pilot for keyboard-visible focus consistency on existing core interactive controls. It is not accessibility certification, not assistive technology review completion, and not a broad redesign.

## Inputs from Phase 36G

Phase 36G selected `CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT` and passed it to Phase 36H implementation.

## Focus-visible ownership discovery

Static discovery found existing ownership in `src/styles/global.css`: `.button`, `.navItem`, `.bottomNav__item`, `.dashboardCalmTab`, `.libraryTab`, `.choiceOption`, short-answer inputs, study-goal inputs/selects, text-import fields, manual prompt controls, memory rating controls, settings toggles, and result summaries already had focus-visible or focus-within rules.

## Implementation summary

The implementation adds Phase 36H CSS custom properties and one consolidated focus-visible rule set in `src/styles/global.css`. No component file was needed.

## Changed files

- `.github/workflows/e2e-smoke.yml`
- `src/styles/global.css`
- `tests/unit/coreInteractiveFocusVisibleConsistencyPilot.test.jsx`
- `docs/testing/phase36h-core-interactive-focus-visible-consistency-pilot-evidence.md`
- `docs/release/phase36h-core-interactive-focus-visible-consistency-pilot-summary.md`
- `docs/planning/phase36i-core-interactive-focus-visible-consistency-pilot-evidence-review-seed.md`
- `scripts/validate-phase36h-core-interactive-focus-visible-consistency-pilot.js`

## Targeted interactive surfaces

Representative targets: primary buttons, desktop nav links, bottom navigation links, dashboard tabs, Library tabs, short-answer inputs, study-goal inputs/selects, text-import/manual prompt controls, memory rating buttons, settings toggles, and result summaries.

## Handler and routing preservation

No event handlers, routing code, route configuration, navigation implementation, or BottomNav route behavior were edited.

## State and data preservation

No tab state, import behavior, storage/data behavior, scheduler/FSRS behavior, sync/backend/auth/telemetry behavior, Study Room answer logic, or Library import/workshop behavior was edited.

## Keyboard tab evidence

Manual browser evidence with Playwright against `http://127.0.0.1:4173/`: keyboard Tab reached representative controls on desktop and mobile-sized viewports, including primary buttons, navigation links, Dashboard tabs, Library tabs, and form controls.

## Focus-visible evidence

Manual browser evidence: focus-visible rings were visible on a primary button (`Mở Tổng quan`), nav/link item (`Tổng quan`), Dashboard tab (`Hôm nay`), Library tab (`Kệ sách của tôi`), and form control (`textarea`). Pointer-only interaction did not require new event handling.

## 375px mobile evidence

Manual browser evidence: at a 375px viewport, `window.innerWidth`, `document.documentElement.scrollWidth`, and `document.body.scrollWidth` were all `375`; no horizontal document overflow was detected.

## Reduced-motion evidence

The pilot adds no keyframes or focus animation. Existing reduced-motion coverage remains, and the Phase 36H focus-visible rule disables transitions for representative button/nav/tab focus surfaces when reduced motion is requested. Playwright reduced-motion media emulation matched `(prefers-reduced-motion: reduce)`.

## Desktop evidence

Manual desktop evidence: focus rings remained visible on representative controls and did not cause layout shift.

## E2E impact

E2E specs were not edited. Smoke and onboarding E2E runs are recorded in the validation summary.

## Accessibility claim boundary

This is runtime focus-visible polish only. Phase 36H does not approve accessibility certification. Phase 36H does not approve assistive technology review completion.

## Forbidden system change review

Review confirmed no package/dependency files, E2E specs, event handlers, routing files, tab-state code, import/parser/storage/backup/restore code, scheduler/FSRS code, sync/auth/backend/telemetry code, or Study Room answer correctness code were edited.

## Claim guardrail review

Next recommended phase: Phase 36I — Core Interactive Focus Visible Consistency Pilot Evidence Review
Phase 36I is an evidence review and is not automatic next runtime implementation.
Phase 36H confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 36H does not approve BETA_READY.
Phase 36H does not approve public production readiness.
Phase 36H does not approve broad validation or stress-tested readiness.
Phase 36H does not approve guaranteed data-loss prevention.
Phase 36H does not approve accessibility certification.
Phase 36H does not approve assistive technology review completion.
Phase 36H does not approve storage/backup/restore behavior changes.
Phase 36H does not approve import/parser behavior changes.
Phase 36H does not approve sync/cloud/account/auth/backend.
Phase 36H does not approve telemetry/network calls.
Phase 36H does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 36H does not approve route behavior changes.
Phase 36H does not approve event handler changes.
Phase 36H does not approve tab-state changes.
Phase 36H does not approve package/dependency changes.
Phase 36H does not approve Study Room correctness/scoring/scheduler/queue/data changes.
Phase 36H does not approve Dynamic Canvas Themes implementation.
Phase 36H does not approve Streak Fire.
Phase 36H does not approve Collapsible Header.
Phase 36H does not approve broad UI redesign.
Phase 36H does not approve broader mobile/accessibility runtime changes.

## Validation summary

- `node scripts/validate-phase36h-core-interactive-focus-visible-consistency-pilot.js`: passed (`pr-diff`)
- `npm run build`: passed
- `npm run test:unit`: passed, 59 files and 2676 tests
- `npm run test:e2e:smoke`: passed, 7 tests
- `npm run test:e2e:onboarding`: passed, 3 tests
- `git diff --check`: passed

## Risks and follow-up

Phase 36I should review browser evidence quality and decide whether the pilot is sufficient or needs a targeted fix.

## Decision

READY_FOR_PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW

## What Phase 36H supports

Phase 36H supports the narrow CSS-only focus-visible consistency pilot on existing core interactive controls.

## What Phase 36H does not approve

Phase 36H does not approve broader runtime accessibility work, behavior changes, readiness upgrades, product certification claims, or any deferred visual concepts.
