# Phase 36A — Mobile Touch Polish Scope Gate
## Status tokens
PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_STATUS: COMPLETED_MOBILE_TOUCH_POLISH_SCOPE_GATE

PHASE36A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_DECISION: PASS_TO_PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION

PHASE36A_REVIEW_SCOPE: MOBILE_TOUCH_POLISH_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE36A_SELECTED_CANDIDATE: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT

PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope
Phase 36A is docs/research/scope/planning/static-validator/CI-only. It compares mobile and touch polish opportunities across completed UI surfaces and chooses exactly one small runtime candidate for Phase 36B.

No runtime source, CSS, route, data model, package, storage, backup, restore, import, parser, scheduler, FSRS, sync, cloud, backend, auth, telemetry, E2E, unit test, or Study Room answer logic changes are part of Phase 36A.

## Inputs from Phase 36
Phase 36 selected Mobile Touch Polish Scope Gate as the next backlog candidate.

Input tokens:
- PHASE36_SELECTED_BACKLOG_CANDIDATE: MOBILE_TOUCH_POLISH_SCOPE_GATE
- PHASE36_UI_POLISH_BACKLOG_REVIEW_DECISION: PASS_TO_PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_GATE

Reviewed inputs:
- `docs/review/phase36-ui-polish-backlog-review.md`
- `docs/release/phase36-ui-polish-backlog-review-summary.md`
- `docs/planning/phase36a-mobile-touch-polish-scope-seed.md`
- `scripts/validate-phase36-ui-polish-backlog-review.js`
- merged Phase 36 history on `origin/main`

## Mobile touch review method
The scope gate compared candidate surfaces by user value, expected implementation size, risk, and mobile/accessibility impact. The selected candidate had to be small enough for a Phase 36B runtime pilot, avoid route and learning logic changes, and produce evidence around 375px behavior, touch comfort, safe-area handling, focus-visible behavior, and reduced-motion support.

## Candidate comparison table
| Candidate | User value | Expected implementation size | Risk | Mobile/accessibility impact | Decision |
| --- | --- | --- | --- | --- | --- |
| Bottom Navigation Touch Comfort and Safe-Area Pilot | High: frequent phone navigation benefits from comfortable targets and safe-area spacing. | Small if limited to `BottomNav` and CSS/class adjustments. | Low to medium; route behavior must remain unchanged. | High mobile impact with direct touch, focus, pressed-state, and safe-area evidence. | Selected for Phase 36B seed. |
| Library Bookshelf Mobile Tabs / Workshop Touch Polish | Medium: improves a completed surface used during library/workshop flows. | Small to medium depending on tabs and workshop layout reach. | Medium because it can drift toward import or workshop behavior. | Medium to high mobile impact. | Deferred; no implementation approval. |
| Dashboard Calm Home Mobile Density Polish | Medium: improves daily home scanning on phones. | Small to medium depending on density changes. | Medium because dashboard behavior and route assumptions must remain stable. | High mobile impact. | Deferred; no implementation approval. |
| Study Room Mobile Answer Feedback Readability Polish | Medium: may improve answer feedback readability. | Small if visual-only. | High if it touches correctness, scoring, queue, scheduler, FSRS, or data behavior. | High mobile/accessibility impact but riskier than bottom navigation. | Deferred; no implementation approval. |
| Elastic Button Compression Mobile Touch Follow-up | Medium: could tune touch feedback on existing button surfaces. | Small if scoped to the prior pilot. | Medium because global button changes can expand quickly. | Medium to high touch impact with reduced-motion requirements. | Deferred; no implementation approval. |
| Accessibility Focus Polish Scope Gate | High accessibility value across keyboard and focus states. | Medium as a scope gate and potentially broad later. | Medium because cross-surface focus work can broaden beyond one runtime pilot. | High accessibility impact. | Deferred; no implementation approval. |
| 375px No-Overflow Audit / Fix Candidate | High confidence value for narrow mobile screens. | Medium because findings may span many surfaces. | Medium to high due to broad surface area. | High mobile impact. | Deferred; require focused evidence before implementation. |
| Dynamic Canvas Themes Design Gate | Medium optional expression value. | Medium to large if later implemented. | Medium to high due to visual complexity, motion, and performance. | Medium; needs contrast and reduced-motion review. | Deferred; no implementation approval. |
| Streak Fire Ignition Design Gate | Medium motivation polish value. | Medium if later implemented. | Medium due to pressure, motion, and claim risk. | Medium; requires non-coercive UX and reduced-motion review. | Deferred; no implementation approval. |
| Collapsible Header Scope Gate | Medium space-efficiency value. | Medium because header behavior can affect routes and focus. | Medium to high due to navigation, layout, and scroll-state risk. | Medium mobile impact with accessibility risk. | Deferred; no implementation approval. |

## Selected candidate
Selected candidate: Bottom Navigation Touch Comfort and Safe-Area Pilot.

PHASE36A_SELECTED_CANDIDATE: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT

## Why Bottom Navigation Touch Comfort and Safe-Area Pilot first
Bottom navigation is the narrowest mobile-first candidate with frequent user impact. It can be scoped to `BottomNav` and CSS only, preserving all `NavLink` destinations, active-route behavior, route definitions, page rendering, learning logic, storage, sync, backend, telemetry, package files, and dependencies.

The candidate can improve thumb comfort, tap-target spacing, active/pressed feedback, and safe-area fallback behavior without approving a broad mobile redesign.

## Why this is a scope gate, not runtime implementation
Phase 36A chooses a Phase 36B candidate and prepares evidence requirements only. It does not implement runtime UI, CSS, route behavior, page rendering, data model, tests, E2E specs, or package changes.

Phase 36A does not approve mobile runtime changes.

## Phase 36B allowed files / expected areas
Expected Phase 36B implementation areas should be limited to mobile `BottomNav` touch comfort and safe-area behavior only. Phase 36B should prefer CSS/class adjustments and minimal component-local changes.

Expected areas may include:
- `BottomNav` component-local markup/class refinements if needed.
- CSS for tap-target comfort, spacing, active/pressed states, focus-visible preservation, reduced-motion behavior, and safe-area padding/fallbacks.
- Phase 36B evidence, release summary, planning seed, static validator, and CI registration.

## Phase 36B forbidden areas
Phase 36B must not change route definitions, `NavLink` destinations, click handlers, active-route logic, page rendering outside bottom navigation, storage, data, scheduler, FSRS, import, sync, backend, auth, telemetry, package files, dependencies, Library, Dashboard, Study Room, Dynamic Canvas Themes, Streak Fire, or Collapsible Header behavior.

## Accessibility and reduced-motion requirements
Phase 36B must preserve keyboard and focus-visible behavior. Any active, hover, pressed, or transition behavior must include reduced-motion support and must not rely on motion as the only affordance.

The future pilot must keep visible focus states, maintain readable contrast, avoid touch-only hidden state, and avoid changes that make keyboard navigation less predictable.

## Mobile and touch evidence requirements
Phase 36B evidence must include:
- 375px mobile screenshots or equivalent direct browser evidence.
- Safe-area evidence or fallback notes for devices without safe-area inset simulation.
- Tap-target and touch comfort evidence.
- No-horizontal-overflow evidence.
- Active/pressed/focus-visible behavior evidence.
- Reduced-motion evidence.
- E2E smoke and onboarding evidence.

## Risk assessment
Phase 36A risk is low because it is static scope work only. Phase 36B risk is manageable if it stays limited to bottom navigation touch comfort and safe-area polish. The main risks are accidental route behavior changes, broad CSS effects, hidden horizontal overflow, weakened focus states, and motion changes without reduced-motion coverage.

## Rollback plan for Phase 36B
Phase 36B should be one small isolated runtime pilot with a simple revert path limited to the touched bottom navigation component/CSS and Phase 36B docs/validator. Rollback must not require storage, data, scheduler, route, package, backend, sync, auth, telemetry, or Study Room answer-flow changes.

## Chosen scope decision
PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_DECISION: PASS_TO_PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION

## Decision rationale
Bottom Navigation Touch Comfort and Safe-Area Pilot provides the clearest user value with the smallest expected runtime surface. It directly targets phone usage, can be evidenced at 375px, and can be constrained to touch comfort and safe-area polish while preserving navigation behavior.

## What Phase 36A supports
Phase 36A supports passing to Phase 36B — Bottom Navigation Touch Comfort and Safe-Area Pilot Implementation.

Phase 36B is a small runtime pilot and is not approval for broad mobile redesign.

Phase 36A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

## What Phase 36A does not approve
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

## Next recommended phase
Next recommended phase: Phase 36B — Bottom Navigation Touch Comfort and Safe-Area Pilot Implementation
