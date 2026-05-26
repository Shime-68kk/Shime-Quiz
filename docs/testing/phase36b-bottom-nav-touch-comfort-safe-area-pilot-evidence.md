# Phase 36B — Bottom Navigation Touch Comfort and Safe-Area Pilot Evidence

## Status tokens
PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_STATUS: COMPLETED_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION

PHASE36B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_DECISION: READY_FOR_PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW

PHASE36B_RUNTIME_SCOPE: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_ONLY_NO_ROUTE_OR_HANDLER_CHANGES

PHASE36B_SELECTED_EFFECT: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT

PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED

## Scope
Phase 36B implements a narrow mobile Bottom Navigation Touch Comfort and Safe-Area Pilot only.

## Inputs from Phase 36A
Phase 36A selected exactly `PHASE36A_SELECTED_CANDIDATE: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT`.

## BottomNav ownership discovery
Static inspection found the exact BottomNav runtime file at `src/layout/BottomNav.jsx`. It renders `navRoutes` from `src/routes/routeConfig.js`, uses `NavLink`, and derives the active indicator from `navRoutes.findIndex(item => item.path === location.pathname)`.

Existing bottom navigation CSS is in `src/styles/global.css` with `.bottomNav`, `.bottomNav__item`, `.bottomNav__item--active`, `.bottomNav .primaryNavSlidingIndicator`, and existing `env(safe-area-inset-bottom, 0px)` token use through `--bottom-nav-safe-area`.

Existing tests touching bottom navigation include `tests/unit/hybridNavigationIndicator.test.jsx`.

## Implementation summary
Added the `phase36b-bottom-nav-touch-pilot` class to the existing BottomNav host and scoped CSS to that class for slightly larger item targets, stable spacing, safe-area padding, indicator bounds, tap feedback, and focus-visible offset.

## Changed files
`src/layout/BottomNav.jsx`

`src/styles/global.css`

`tests/unit/bottomNavTouchComfortSafeAreaPilot.test.jsx`

`docs/testing/phase36b-bottom-nav-touch-comfort-safe-area-pilot-evidence.md`

`docs/release/phase36b-bottom-nav-touch-comfort-safe-area-pilot-summary.md`

`docs/planning/phase36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review-seed.md`

`scripts/validate-phase36b-bottom-nav-touch-comfort-safe-area-pilot.js`

`.github/workflows/e2e-smoke.yml`

## Targeted bottom navigation surfaces
The only runtime component file selected for Phase 36B is `src/layout/BottomNav.jsx`.

The only runtime style file selected for Phase 36B is `src/styles/global.css`.

## Route and navigation behavior preservation
Route definitions were not changed. `NavLink` destinations still use `to={item.path}`. No click handler was added. Active-route logic still uses `navRoutes.findIndex(item => item.path === location.pathname)`.

## Safe-area behavior evidence
The pilot uses `--phase36b-bottom-nav-safe-area: var(--bottom-nav-safe-area, 0px)` and applies it to bottom nav padding and indicator bounds. The existing token resolves to `env(safe-area-inset-bottom, 0px)`, so non-safe-area devices fall back to `0px`.

Playwright Chromium at 375x812 reported `navBottom: 14px` and `navPaddingBottom: 10px` on the fallback path.

## 375px mobile evidence
The bottom nav remains fixed between left and right viewport offsets. At the existing `max-width: 380px` rule, the offsets are `8px`, leaving a 359px container at 375px. Items use `minmax(0, 1fr)`, constrained labels, and no fixed item width.

Playwright Chromium at 375x812 reported document horizontal overflow `0`, bottom nav rect `x: 8`, `width: 359`, `height: 74`, and `bottom: 798`.

## Touch comfort and tap target evidence
The Phase 36B item rule raises bottom nav item minimum height to `52px` and uses padding `7px 4px` while preserving four equal grid columns.

Playwright Chromium at 375x812 reported four bottom nav item rects of `83x52`.

## Active and pressed state evidence
The existing active class and sliding indicator remain. The pilot only adjusts the indicator inset to match the new padding. Pressed state remains transform-based through `.bottomNav__item:active`.

At `/dashboard`, the active bottom nav text was `Tổng quan`. Tapping the mobile bottom nav Library link reached `/library`, rendered heading `Thư viện học liệu`, and moved the active bottom nav text to `Thư viện`.

## Keyboard and focus evidence
Existing `.bottomNav__item:focus-visible` outline remains active, with Phase 36B only narrowing the offset inside the taller mobile pilot surface.

After keyboard tabbing in the mobile viewport, Playwright reported focused element `A.bottomNav__item` with `outlineStyle: solid` and `outlineWidth: 3px`.

## Reduced-motion evidence
Existing `@media (prefers-reduced-motion: reduce)` coverage remains and includes `.bottomNav__item` and `.primaryNavSlidingIndicator` with `transition: none`.

Playwright Chromium with reduced motion reported the indicator transition duration as effectively disabled (`1e-05s`).

## Desktop and sidebar non-impact review
The pilot class is only added to `BottomNav`. The desktop `Sidebar` runtime file was not changed.

Playwright Chromium at 1200x800 reported bottom nav `display: none`, sidebar `display: block`, and no Phase 36B pilot class on the sidebar.

## E2E impact
Smoke and onboarding E2E specs were not changed. Required E2E commands are recorded in the handoff.

`npm run test:e2e:smoke` passed 7 tests. `npm run test:e2e:onboarding` passed 3 tests.

## Forbidden system change review
No storage, data, import, parser, database, scheduler, FSRS, sync, backend, auth, telemetry, Study Room answer logic, package, dependency, route, or E2E spec files were changed.

## Claim guardrail review
Next recommended phase: Phase 36C — Bottom Navigation Touch Comfort and Safe-Area Pilot Evidence Review

Phase 36C is an evidence review and is not automatic next runtime implementation.

Phase 36B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

Phase 36B does not approve BETA_READY.

Phase 36B does not approve public production readiness.

Phase 36B does not approve broad validation or stress-tested readiness.

Phase 36B does not approve guaranteed data-loss prevention.

Phase 36B does not approve storage/backup/restore behavior changes.

Phase 36B does not approve sync/cloud/account/auth/backend.

Phase 36B does not approve telemetry/network calls.

Phase 36B does not approve built-in AI/OCR/API-key/BYOK behavior.

Phase 36B does not approve route behavior changes.

Phase 36B does not approve NavLink destination changes.

Phase 36B does not approve click handler changes.

Phase 36B does not approve active-route logic changes.

Phase 36B does not approve page rendering changes outside bottom navigation.

Phase 36B does not approve package/dependency changes.

Phase 36B does not approve Study Room correctness/scoring/scheduler/queue/data changes.

Phase 36B does not approve Dynamic Canvas Themes implementation.

Phase 36B does not approve Streak Fire.

Phase 36B does not approve Collapsible Header.

Phase 36B does not approve broad UI redesign.

Phase 36B does not approve broader mobile runtime changes.

## Validation summary
`npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false` completed.

`node scripts/validate-phase36b-bottom-nav-touch-comfort-safe-area-pilot.js` passed in `pr-diff` mode.

`npm run build` passed with the existing Vite chunk-size warning.

`npm run test:unit` passed 57 files and 2664 tests.

`npm run test:e2e:smoke` passed 7 tests.

`npm run test:e2e:onboarding` passed 3 tests.

## Risks and follow-up
Safe-area behavior depends on browser support for `env(safe-area-inset-bottom, 0px)`, with `0px` fallback on devices without an inset.

## Decision
PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_DECISION: READY_FOR_PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW

## What Phase 36B supports
Phase 36B supports the scoped BottomNav touch comfort and safe-area pilot.

## What Phase 36B does not approve
Phase 36B does not approve broader runtime, route, package, data, storage, sync, auth, backend, telemetry, AI/OCR/API-key/BYOK, Study Room correctness, or production-readiness changes.

## Next recommended phase
Phase 36C — Bottom Navigation Touch Comfort and Safe-Area Pilot Evidence Review.
