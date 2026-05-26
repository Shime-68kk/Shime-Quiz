# Phase 35H — Hybrid Navigation Indicator Evidence

## Status tokens

PHASE35H_HYBRID_NAVIGATION_INDICATOR_STATUS: COMPLETED_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION
PHASE35H_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE35H_HYBRID_NAVIGATION_INDICATOR_DECISION: READY_FOR_PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW
PHASE35H_RUNTIME_SCOPE: PRIMARY_NAVIGATION_VISUAL_INDICATOR_ONLY_NO_ROUTE_BEHAVIOR_CHANGES
PHASE35H_SELECTED_EFFECT: HYBRID_SLIDING_NAVIGATION_INDICATOR
PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED

## Scope

Phase 35H implements only the selected Hybrid Sliding Navigation Indicator. It is a primary navigation visual indicator only and does not change route definitions, destinations, click semantics, page rendering logic, package dependencies, storage, backup, restore, import, parser, scheduler, FSRS, sync, cloud, backend, auth, telemetry, or unrelated UI surfaces.

## Inputs from Phase 35G

Phase 35G selected `PHASE35G_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR` and passed that selected candidate to Phase 35H for implementation.

## Implementation summary

The implementation adds a single `primaryNavSlidingIndicator` visual element to each existing primary navigation surface. `Sidebar.jsx` covers desktop navigation and `BottomNav.jsx` covers mobile navigation. Both use the current `useLocation()` pathname and the existing `navRoutes` array to calculate the active index. CSS variables move the indicator with transform-based transitions.

## Changed files

- `.github/workflows/e2e-smoke.yml`
- `docs/planning/phase35i-hybrid-navigation-indicator-evidence-review-seed.md`
- `docs/release/phase35h-hybrid-navigation-indicator-summary.md`
- `docs/testing/phase35h-hybrid-navigation-indicator-evidence.md`
- `scripts/validate-phase35h-hybrid-navigation-indicator.js`
- `src/layout/BottomNav.jsx`
- `src/layout/Sidebar.jsx`
- `src/styles/global.css`
- `tests/unit/hybridNavigationIndicator.test.jsx`

## Navigation component ownership

Selected runtime files: `src/layout/Sidebar.jsx` and `src/layout/BottomNav.jsx`. Static inspection found that the primary navigation is split between desktop sidebar and mobile bottom navigation, both rendering `navRoutes` from `src/routes/routeConfig.js`.

## Active route detection

Both runtime nav files compute `activeIndex` from `navRoutes.findIndex(item => item.path === location.pathname)`. The existing `NavLink` `to={item.path}` destinations and active class callbacks are preserved.

## Indicator behavior

The indicator is a calm pill behind the active nav item. Desktop uses `--nav-active-offset` and `translate3d(0, var(--nav-active-offset), 0)`. Mobile uses `--nav-active-index`, `--nav-item-count`, and horizontal `translate3d(...)`. The animation uses transform, opacity, color, border, and shadow transitions only.

## Route behavior preservation

No route definition file was changed. The nav links still render from the existing `navRoutes` list and still pass `to={item.path}` into `NavLink`. No click handler, destination, or page rendering logic was added or changed.

## Desktop browser evidence

Manual browser evidence run against local preview at `http://127.0.0.1:4173` with a 1280x900 viewport. Active indicator appeared behind the current sidebar nav item and matched the active link bounds:

- `/dashboard`: indicator `x=20 y=106 width=239 height=50`, active link `aria-current="page"`.
- `/library`: indicator `x=20 y=164 width=239 height=50`, active link `aria-current="page"`.
- `/settings`: indicator `x=20 y=280 width=239 height=50`, active link `aria-current="page"`.

Clicking the existing Phòng học nav link still routed to `/study-room` and rendered the Phòng học tập trung heading. The existing `focusMode` page rendering hides primary navigation on `/study-room`; Phase 35H preserved that behavior instead of changing page rendering logic. Desktop document overflow check: `scrollWidth=1280`, `clientWidth=1280`, `bodyScrollWidth=1280`.

## Mobile 375px evidence

Manual browser evidence run against local preview with a 375x812 mobile viewport. Active indicator appeared in the bottom nav and matched active link bounds:

- `/dashboard`: indicator `x=17 y=741 width=85.25 height=48`, active link `aria-current="page"`.
- `/library`: indicator `x=102.25 y=741 width=85.25 height=48`, active link `aria-current="page"`.
- `/settings`: indicator `x=272.75 y=741 width=85.25 height=48`, active link `aria-current="page"`.

Clicking the existing Học bottom-nav link still routed to `/study-room` and rendered the Phòng học tập trung heading. The existing `focusMode` page rendering hides bottom navigation on `/study-room`; Phase 35H preserved that behavior. Mobile overflow checks reported `scrollWidth=375`, `clientWidth=375`, and `bodyScrollWidth=375` on nav-visible routes and on `/study-room`.

## Keyboard and focus evidence

Existing `.navItem:focus-visible` and `.bottomNav__item:focus-visible` outline styling remains in `global.css`. The indicator has `pointer-events: none` and `aria-hidden="true"`, so it does not alter focus order or accessible names. Browser evidence after pressing Tab on desktop focused the active nav link and reported `outlineStyle=solid` and `outlineWidth=3px`.

## Reduced-motion evidence

`@media (prefers-reduced-motion: reduce)` disables transitions on `.primaryNavSlidingIndicator`, `.navItem`, and `.bottomNav__item`. Browser evidence with reduced motion enabled reported computed indicator transition duration as `1e-05s`, matching the existing global reduced-motion instant-transition guard.

## E2E impact

No E2E specs were changed. Existing smoke and onboarding E2E paths are expected to continue exercising the same route destinations.

## Forbidden system change review

Phase 35H does not approve storage/backup/restore behavior changes. Phase 35H does not approve sync/cloud/account/auth/backend. Phase 35H does not approve telemetry/network calls. Phase 35H does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 35H does not approve route behavior changes. Phase 35H does not approve package/dependency changes. Phase 35H does not approve broad navigation rewrite.

## Claim guardrail review

Phase 35H confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 35H does not approve BETA_READY. Phase 35H does not approve public production readiness. Phase 35H does not approve broad validation or stress-tested readiness. Phase 35H does not approve guaranteed data-loss prevention.

## Validation summary

Required validation targets: Phase 35H validator, build, unit tests, E2E smoke, E2E onboarding, `git diff --check`, manual/browser evidence, patch apply check, and generated-artifact cleanup.

## Risks and follow-up

The indicator uses fixed desktop item height assumptions matching the current nav styling. If a future phase changes nav density, the indicator offset should be reviewed with browser evidence.

## Decision

PHASE35H_HYBRID_NAVIGATION_INDICATOR_DECISION: READY_FOR_PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW

## What Phase 35H supports

Phase 35H supports a small Hybrid Sliding Navigation Indicator visual layer for existing primary navigation only.

## What Phase 35H does not approve

Phase 35H does not approve Elastic Button Compression implementation. Phase 35H does not approve Study Room polish. Phase 35H does not approve Streak Fire. Phase 35H does not approve Collapsible Header. Phase 35H does not approve Dynamic Canvas Themes implementation.

## Next recommended phase

Next recommended phase: Phase 35I — Hybrid Navigation Indicator Evidence Review. Phase 35I is an evidence review and is not automatic next runtime implementation.
