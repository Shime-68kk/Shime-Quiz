# Phase 36B — Bottom Navigation Touch Comfort and Safe-Area Pilot Implementation Seed
## Status token
PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Purpose
Prepare Phase 36B as a small runtime pilot for mobile bottom navigation touch comfort and safe-area behavior only.

Phase 36B is a small runtime pilot and is not approval for broad mobile redesign.

## Inputs from Phase 36A
Inputs:
- `docs/research/phase36a-mobile-touch-polish-scope.md`
- `docs/release/phase36a-mobile-touch-polish-scope-summary.md`
- `scripts/validate-phase36a-mobile-touch-polish-scope.js`
- Phase 36A decision token: PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_DECISION: PASS_TO_PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION
- Phase 36A selected candidate token: PHASE36A_SELECTED_CANDIDATE: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT

## Runtime candidate
Runtime candidate: Bottom Navigation Touch Comfort and Safe-Area Pilot.

Phase 36B should target mobile `BottomNav` touch comfort and safe-area behavior only. It should preserve all route behavior and all `NavLink` destinations.

## User-facing intent
Improve phone comfort for the bottom navigation by reviewing tap target comfort, spacing, active/pressed feedback, focus-visible behavior, reduced-motion support, and safe-area padding/fallback behavior.

## Allowed files / expected areas
Allowed runtime areas should be narrow:
- `BottomNav` component-local class/markup adjustments only if needed.
- CSS for bottom navigation spacing, target comfort, active/pressed affordance, safe-area padding/fallbacks, focus-visible preservation, and reduced-motion handling.
- Phase 36B evidence, release summary, planning seed, static validator, and workflow registration.

## Forbidden areas
Phase 36B must not change route definitions, `NavLink` destinations, click handlers, active-route logic, page rendering outside bottom navigation, storage, data, scheduler/FSRS, import, sync, backend, auth, telemetry, package files, or dependencies.

Phase 36B must not implement Library, Dashboard, Study Room, Dynamic Canvas Themes, Streak Fire, or Collapsible Header changes.

## Implementation guidance
Prefer CSS/class adjustments and minimal component-local changes. Preserve current navigation semantics and avoid broad UI rewrites, global behavior changes, package changes, or route changes.

The implementation should be small enough to revert by reverting the touched bottom navigation component/CSS and Phase 36B docs/validator only.

## Accessibility and reduced-motion requirements
Phase 36B must preserve keyboard/focus-visible behavior.

Phase 36B must include reduced-motion support for any transition, transform, active, pressed, or animated affordance.

Focus visibility must remain clear on keyboard navigation, and touch feedback must not be the only visible state.

## Mobile and touch requirements
Phase 36B must include 375px mobile evidence, safe-area evidence or fallback notes, tap-target/touch comfort evidence, no-horizontal-overflow evidence, and E2E smoke/onboarding evidence.

## Validation required
Expected validation should include:
- Phase 36B validator
- `npm run build`
- `npm run test:unit`
- `npm run test:e2e:smoke`
- `npm run test:e2e:onboarding`
- `git diff --check`

## Evidence required
Evidence must cover:
- 375px viewport behavior.
- Safe-area behavior or fallback notes.
- Tap-target and touch comfort review.
- No horizontal overflow.
- Active/pressed/focus-visible behavior.
- Reduced-motion behavior.
- E2E smoke and onboarding results.

## Rollback plan
Rollback should revert only the bottom navigation component/CSS changes and Phase 36B documentation/validator changes. Rollback must not require data, storage, scheduler, FSRS, route, package, backend, sync, auth, telemetry, import, or Study Room answer-flow changes.

## Decision options
HOLD_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION

NEEDS_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_REWORK

PASS_TO_PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW

## Forbidden default approvals
Phase 36A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

Phase 36A does not approve BETA_READY.

Phase 36A does not approve public production readiness.

Phase 36A does not approve broad validation or stress-tested readiness.

Phase 36A does not approve guaranteed data-loss prevention.

Phase 36A does not approve storage/backup/restore behavior changes.

Phase 36A does not approve sync/cloud/account/auth/backend.

Phase 36A does not approve telemetry/network calls.

Phase 36A does not approve built-in AI/OCR/API-key/BYOK behavior.

Phase 36A does not approve route behavior changes.

Phase 36A does not approve package/dependency changes.

Phase 36A does not approve Study Room correctness/scoring/scheduler/queue/data changes.

Phase 36A does not approve Dynamic Canvas Themes implementation.

Phase 36A does not approve Streak Fire.

Phase 36A does not approve Collapsible Header.

Phase 36A does not approve broad UI redesign.

Phase 36A does not approve new runtime UI implementation.

Phase 36A does not approve mobile runtime changes.

## Recommended next step
Next recommended phase: Phase 36B — Bottom Navigation Touch Comfort and Safe-Area Pilot Implementation
