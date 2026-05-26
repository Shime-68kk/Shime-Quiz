# Phase 35K — Elastic Button Compression Pilot Evidence

## Status tokens

PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_STATUS: COMPLETED_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION

PHASE35K_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_DECISION: READY_FOR_PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW

PHASE35K_RUNTIME_SCOPE: ELASTIC_BUTTON_COMPRESSION_PILOT_ONLY_NO_HANDLER_OR_DATA_CHANGES

PHASE35K_SELECTED_EFFECT: ELASTIC_BUTTON_COMPRESSION_PILOT

PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED

## Scope

Phase 35K implements a narrow Elastic Button Compression Pilot on selected existing Button surfaces only. It is CSS-only and does not alter handlers, submit behavior, pointer event routing, routes, data behavior, storage/import/scheduler/FSRS behavior, or Study Room answer correctness logic.

## Inputs from Phase 35J

PHASE35J_SELECTED_CANDIDATE: ELASTIC_BUTTON_COMPRESSION_PILOT

PHASE35J_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION

## Pilot target selection

Static inspection found a shared `src/components/Button.jsx` component and global `.button` styles, so no component markup changes were required. The selected pilot surfaces are Dashboard `Học tiếp`, Library workshop `Nạp JSON/CSV`, and Library sample `Dùng quiz mẫu`. Study Room buttons were skipped to avoid any contact with answer correctness or progression logic.

## Implementation summary

`src/styles/global.css` adds scoped selectors for selected Dashboard and Library primary action surfaces. Active press uses `scale(0.975)`, a tighter shadow, and a 125ms transition. Reduced motion disables the scale transform and uses opacity/shadow feedback only.

## Changed files

- `src/styles/global.css`
- `tests/unit/elasticButtonCompressionPilot.test.jsx`
- `docs/testing/phase35k-elastic-button-compression-pilot-evidence.md`
- `docs/release/phase35k-elastic-button-compression-pilot-summary.md`
- `docs/planning/phase35l-elastic-button-compression-pilot-evidence-review-seed.md`
- `scripts/validate-phase35k-elastic-button-compression-pilot.js`
- `.github/workflows/e2e-smoke.yml`

## Targeted button surfaces

- Dashboard page header primary action: `Học tiếp`
- Library workshop secondary action: `Nạp JSON/CSV`
- Library demo sample secondary action: `Dùng quiz mẫu`

## Handler and behavior preservation

No JSX event handlers were edited. No route calls, submit types, pointer routing, data reads/writes, storage/import/scheduler/FSRS code, Study Room answer correctness logic, package files, dependencies, or E2E specs were changed.

## Desktop browser evidence

Playwright desktop verification on `http://127.0.0.1:4173/` confirmed the Library `Dùng quiz mẫu` pilot button compressed on press with computed transform `matrix(0.976873, 0, 0, 0.976873, 0, 0)` and a tightened RGB box shadow. On release it returned to the resting hover transform `matrix(1, 0, 0, 1, 0, -1)` without flicker. Layout metrics stayed stable during press: `offsetWidth` 164, `offsetHeight` 46, `offsetLeft` 351, and `offsetTop` 843 before and during press.

## Mobile 375px evidence

Playwright mobile verification at 375px width on the Library workshop found `documentElement.scrollWidth > clientWidth` was `false`, so the selected surfaces did not create horizontal overflow.

## Quick press and release evidence

Quick press/release on `Dùng quiz mẫu` returned from compressed active transform to resting hover transform after mouse release. The effect is CSS active state only and uses transform/shadow/opacity transitions.

## Keyboard and focus evidence

Existing `.button:focus-visible` outline remains unchanged. Playwright focus on Dashboard `Học tiếp` reported computed outline style `solid`. The pilot does not add keyboard handlers or alter focusability.

## Reduced-motion evidence

The pilot includes `@media (prefers-reduced-motion: reduce)` and disables scale transform with `transform: none` while retaining non-spatial opacity/shadow feedback. Playwright reduced-motion press evidence reported computed transform `none` and opacity `0.88`.

## Disabled state evidence

Pilot active selectors exclude `:disabled` and `[aria-busy='true']`, preserving existing disabled and loading behavior. Browser inspection found disabled/loading controls retained transform `none` when present.

## E2E impact

E2E specs were not modified. `npm run test:e2e:smoke` passed 7 tests, including Dashboard `Học tiếp` navigation, Study Room answer flow, backup controls, and keyboard focus. `npm run test:e2e:onboarding` passed 3 tests, including Library onboarding and sample quickstart.

## Forbidden system change review

Phase 35K does not approve storage/backup/restore behavior changes. Phase 35K does not approve sync/cloud/account/auth/backend. Phase 35K does not approve telemetry/network calls. Phase 35K does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 35K does not approve route behavior changes. Phase 35K does not approve package/dependency changes. Phase 35K does not approve handler changes. Phase 35K does not approve submit behavior changes. Phase 35K does not approve pointer event routing changes. Phase 35K does not approve data behavior changes.

## Claim guardrail review

Phase 35K confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 35K does not approve BETA_READY. Phase 35K does not approve public production readiness. Phase 35K does not approve broad validation or stress-tested readiness. Phase 35K does not approve guaranteed data-loss prevention. Phase 35K does not approve app-wide Elastic Button Compression. Phase 35K does not approve Study Room answer feedback implementation. Phase 35K does not approve Streak Fire. Phase 35K does not approve Collapsible Header. Phase 35K does not approve Dynamic Canvas Themes implementation.

## Validation summary

Completed validation so far: `node scripts/validate-phase35k-elastic-button-compression-pilot.js` passed in `pr-diff` mode, `npm run build` passed with the existing Vite chunk-size warning, `npm run test:unit` passed 55 files / 2654 tests, `npm run test:e2e:smoke` passed 7 tests, and `npm run test:e2e:onboarding` passed 3 tests.

## Risks and follow-up

The pilot is intentionally narrow. Phase 35L should review manual evidence before deciding whether to keep, adjust, or expand the interaction.

## Decision

PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_DECISION: READY_FOR_PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW

## What Phase 35K supports

Phase 35K supports a scoped CSS-only tactile compression pilot on selected Dashboard and Library Button surfaces.

## What Phase 35K does not approve

Phase 35K does not approve app-wide Elastic Button Compression, BETA_READY, public production readiness, broad validation, stress-tested readiness, guaranteed data-loss prevention, Study Room answer feedback implementation, Streak Fire, Collapsible Header, Dynamic Canvas Themes implementation, package/dependency changes, handler changes, submit behavior changes, pointer event routing changes, route behavior changes, data behavior changes, storage/backup/restore behavior changes, sync/cloud/account/auth/backend, telemetry/network calls, or built-in AI/OCR/API-key/BYOK behavior.

## Next recommended phase

Next recommended phase: Phase 35L — Elastic Button Compression Pilot Evidence Review. Phase 35L is an evidence review and is not automatic next runtime implementation.
