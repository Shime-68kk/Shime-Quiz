# Phase 37-uiH — Hybrid Sliding Navigation Indicator Pilot Evidence
## Status tokens
PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_STATUS: COMPLETED_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_IMPLEMENTATION
PHASE37UIH_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_DECISION: READY_FOR_PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW
PHASE37UIH_RUNTIME_SCOPE: HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_ONLY_NO_ROUTE_OR_HANDLER_BEHAVIOR_CHANGES
PHASE37UIH_SELECTED_EFFECT: HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT
PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED
## Scope
Phase 37-uiH is a runtime visual pilot for the existing navigation active indicator only: Desktop Sidebar active item indicator and Mobile BottomNav active item indicator.
## Inputs from Phase 37-uiG and UI plan
Phase 37-uiG selected HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT and passed it to Phase 37-uiH implementation.
## Navigation ownership discovery
Navigation ownership is `src/layout/Sidebar.jsx`, `src/layout/BottomNav.jsx`, `src/routes/routeConfig.js`, and `src/styles/global.css`. Runtime files selected: `src/layout/Sidebar.jsx` and `src/layout/BottomNav.jsx`.
## Route and active-state boundary discovery
Route order remains `/dashboard`, `/library`, `/study-room`, `/settings`. Visual active index is read from `useLocation()` and `navRoutes.findIndex(item => item.path === location.pathname)` only for CSS variables.
## Implementation summary
The pilot adds Phase 37-uiH host classes and a cream/moss sliding active-pill treatment while preserving existing `NavLink` semantics.
## Changed files
Changed files are `.github/workflows/e2e-smoke.yml`, `src/layout/Sidebar.jsx`, `src/layout/BottomNav.jsx`, `src/styles/global.css`, `tests/unit/hybridSlidingNavigationIndicatorPilot.test.jsx`, this evidence file, the release summary, the Phase 37-uiI seed, and `scripts/validate-phase37-uih-hybrid-sliding-navigation-indicator-pilot.js`.
## Targeted surfaces
Targeted surfaces are Desktop Sidebar active item indicator and Mobile BottomNav active item indicator.
## Visual difference summary
The active state now reads as a sliding active-pill with a calm cream/moss editorial surface, soft border, and active icon/text cross-fade.
## Desktop Sidebar indicator evidence
Desktop uses vertical movement through `--phase37uih-active-index` and `--nav-item-step` on `.sideNav .primaryNavSlidingIndicator`.
## Mobile BottomNav indicator evidence
Mobile uses horizontal movement through `--phase37uih-active-index` on `.bottomNav.phase36b-bottom-nav-touch-pilot .primaryNavSlidingIndicator`.
## Active route and NavLink preservation
`NavLink to={item.path}` remains unchanged and page active semantics still come from React Router.
## Click handler and page rendering preservation
Click handlers, route definitions, router config, active page rendering, and navigation order remain preserved.
## Focus-visible evidence
Existing `.navItem:focus-visible` and `.bottomNav__item:focus-visible` rules remain in place, including the Phase 36H focus-visible enhancement.
## Reduced-motion evidence
`@media (prefers-reduced-motion: reduce)` disables transitions for `.primaryNavSlidingIndicator`, `.navItem`, and `.bottomNav__item`.
## Mobile 375px evidence
The existing `@media (max-width: 380px)` bottom nav sizing remains active for 375px no-overflow review.
## Safe-area evidence
The Phase 36B safe-area variable `--phase36b-bottom-nav-safe-area` and bottom padding remain preserved.
## Desktop evidence
Desktop layout keeps the Sidebar grid, sticky behavior, and existing item height.
## E2E impact
Smoke and onboarding tests are expected to exercise the same destinations because routes and click behavior are unchanged.
## Forbidden system change review
Package/dependency, storage, import/parser, scheduler/FSRS, sync/backend/auth, telemetry, Study Room scoring/queue/data, localStorage, route, router, and page rendering files remain outside this pilot.
## Phase 37C separation review
Phase 37C Limited Release Readiness Gap Review remains separate.
## Claim guardrail review
Phase 37-uiH confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 37-uiH does not approve BETA_READY.
Phase 37-uiH does not approve public production readiness.
Phase 37-uiH does not approve release-readiness upgrade.
Phase 37-uiH does not approve broad UI redesign.
Phase 37-uiH does not approve broad navigation rewrite.
Phase 37-uiH does not approve route behavior changes.
Phase 37-uiH does not approve event handler changes.
Phase 37-uiH does not approve `NavLink` destination changes.
Phase 37-uiH does not approve router configuration changes.
Phase 37-uiH does not approve active page rendering changes.
Phase 37-uiH does not approve package/dependency changes.
Phase 37-uiH does not approve storage/backup/restore behavior changes.
Phase 37-uiH does not approve import/parser behavior changes.
Phase 37-uiH does not approve scheduler/FSRS behavior changes.
Phase 37-uiH does not approve Study Room scoring/correctness/scheduler/queue/data changes.
Phase 37-uiH does not approve sync/cloud/account/auth/backend.
Phase 37-uiH does not approve telemetry/network calls.
Phase 37-uiH does not approve full Dynamic Canvas Themes.
Phase 37-uiH does not approve full theme picker.
Phase 37-uiH does not approve persisted theme preferences.
Phase 37-uiH does not approve localStorage writes.
Phase 37-uiH does not approve Streak Fire.
Phase 37-uiH does not approve Collapsible Header.
Phase 37-uiH does not replace Phase 37C Limited Release Readiness Gap Review.
## Validation summary
Validation commands: `npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false`, `node scripts/validate-phase37-uih-hybrid-sliding-navigation-indicator-pilot.js`, `npm run build`, `npm run test:unit`, `npm run test:e2e:smoke`, `npm run test:e2e:onboarding`, and `git diff --check`.
## Risks and follow-up
Browser evidence should verify active item readability, reduced-motion fallback, mobile safe-area, and 375px no-overflow before evidence review acceptance.
## Decision
PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_DECISION: READY_FOR_PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW
## What Phase 37-uiH supports
Phase 37-uiH supports a scoped runtime visual pilot for the existing navigation active indicator.
## What Phase 37-uiH does not approve
Phase 37-uiH does not approve broad navigation rewrite, route changes, release readiness, or Beta Ready.
## Next recommended phase
Next recommended phase: Phase 37-uiI — Hybrid Sliding Navigation Indicator Evidence Review. Phase 37-uiI is evidence review only and is not automatic runtime implementation.
