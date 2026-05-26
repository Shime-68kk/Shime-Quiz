# Phase 35G — Next UI Polish Scope Gate

## Status tokens

PHASE35G_NEXT_UI_POLISH_SCOPE_STATUS: COMPLETED_NEXT_UI_POLISH_SCOPE_GATE

PHASE35G_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE35G_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35H_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION

PHASE35G_REVIEW_SCOPE: NEXT_UI_POLISH_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE35G_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR

PHASE35H_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope

Phase 35G is a docs, research, release, planning, static-validator, and CI-only scope gate. It chooses one small next UI polish candidate for a later implementation phase and does not implement runtime behavior.

No runtime source, unit test source, E2E source, route/navigation implementation, package/dependency, storage, backup, restore, import parser, scheduler, FSRS, sync, cloud, account, auth, backend, telemetry, network, or data model behavior is changed or approved by this phase.

## Inputs from Phase 35F

- Phase 35F Dashboard Calm Home evidence review.
- Phase 35F release summary.
- Phase 35F validator result and post-merge safety pattern.
- Phase 35G next UI polish scope seed prepared by Phase 35F.
- Carry-forward readiness boundary that keeps LIMITED_BETA_CANDIDATE as the highest approved readiness status.

## Candidate comparison method

Candidates were compared for visible user value, expected implementation size, route and data risk, mobile behavior, accessibility impact, reduced-motion requirements, rollback simplicity, and whether the candidate can be handled as a small follow-up without changing product readiness claims.

## Candidate comparison table

| Candidate | User value | Expected implementation size | Risk | Mobile/accessibility impact | Decision |
| --- | --- | --- | --- | --- | --- |
| Hybrid Sliding Navigation Indicator | Improves active navigation clarity and gives the app shell a more polished desktop/mobile hybrid feel. | Small component-local visual layer plus CSS transition, if existing navigation state can be reused. | Low to medium; must not change route behavior, nav semantics, or click handling. | Positive if focus remains visible, reduced-motion disables movement, and 375px mobile layout is verified. | Selected for Phase 35H. |
| Elastic Button Compression | Adds tactile response to common button interactions. | Small CSS-only pass if scoped to existing button classes. | Low, but broad selector changes could create inconsistent active states. | Must preserve focus states and avoid motion discomfort. | Deferred. |
| Study Room Answer Feedback Polish | Improves a high-use learning moment after answering. | Medium because Study Room state and answer feedback surfaces need careful review. | Medium; risks touching learning flow behavior. | Needs keyboard, screen reader, reduced-motion, and mobile evidence around answer states. | Deferred. |
| Dashboard Calm Home Evidence Follow-up Fixes | Would address issues if Phase 35F found blockers. | Unknown until a concrete issue is documented. | Medium because Dashboard changes could reopen recent structural work. | Depends on issue; no immediate Phase 35F blocker exists. | Deferred because Phase 35F found no required fix. |
| Mobile Touch Polish | Improves handheld interaction density and tap ergonomics. | Medium because it can cross many surfaces. | Medium to high unless narrowed to one component. | Direct mobile benefit, but broad scope risks regressions. | Deferred pending narrower scope. |
| Accessibility Focus Polish | Improves keyboard and assistive technology confidence. | Medium because it may span many components. | Medium; beneficial but needs audit-driven targeting. | Direct accessibility benefit, but broad pass needs focused evidence. | Deferred pending audit-specific scope. |

## Selected candidate

PHASE35G_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR

The selected candidate is Hybrid Sliding Navigation Indicator for Phase 35H.

## Why Hybrid Sliding Navigation Indicator first

Hybrid Sliding Navigation Indicator is the best next small UI polish candidate because it is visible, contained, reversible, and follows the Phase 35A roadmap after Library and Dashboard structural work. It can likely attach to existing active navigation state without changing route behavior, page rendering, data access, storage, scheduler, FSRS, import, sync, auth, backend, telemetry, or package dependencies.

## Phase 35H allowed files / expected areas

Phase 35H may inspect and narrowly modify the existing navigation/sidebar component and related app shell CSS only if implementation evidence confirms the active state can be reused without route behavior changes. Expected areas are component-local navigation markup styling hooks and CSS for the indicator, active state, transitions, responsive behavior, focus state preservation, and reduced-motion override.

## Phase 35H forbidden areas

Phase 35H must not change route behavior, route definitions, navigation click semantics, page rendering logic, data models, package files, storage, backup, restore, import parser, scheduler, FSRS, sync, cloud, account, auth, backend, telemetry, network behavior, or unrelated UI surfaces. Phase 35H is a small runtime candidate and is not approval for broad navigation rewrite.

## Accessibility and reduced-motion requirements

Phase 35H must preserve keyboard focus visibility, nav item semantics, active state meaning, tab order, and screen-reader accessible labels. Motion must respect `prefers-reduced-motion: reduce`; the indicator should become instant or non-animated when reduced motion is requested.

## Mobile and responsive requirements

Phase 35H must include desktop and 375px mobile evidence. The indicator must not introduce horizontal overflow, overlapping nav text, touch-target shrinkage, clipped focus rings, or unstable layout when the active route changes.

## Risk assessment

The main risk is accidentally changing navigation semantics while adding a visual polish layer. The risk is acceptable for a later scoped implementation only if Phase 35H keeps the change component-local, avoids route logic changes, preserves keyboard and reduced-motion behavior, and has clear rollback.

## Rollback plan for Phase 35H

Rollback should remove the indicator markup or styling hooks and the related CSS while leaving existing navigation structure and route behavior unchanged. Because the candidate should not add dependencies or data changes, rollback should be a small code revert.

## Chosen scope decision

PHASE35G_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35H_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION

## Decision rationale

Hybrid Sliding Navigation Indicator has the strongest balance of visible user value, small expected implementation size, low system risk, mobile usefulness, and accessibility guardrails. The other candidates remain useful but are broader, less defined, or better handled after a focused audit.

## What Phase 35G supports

Phase 35G supports moving to a separate Phase 35H Hybrid Navigation Indicator Implementation candidate with narrow allowed files, explicit forbidden areas, desktop and 375px evidence, reduced-motion evidence, and rollback evidence.

## What Phase 35G does not approve

Phase 35G confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 35G does not approve BETA_READY. Phase 35G does not approve public production readiness. Phase 35G does not approve broad validation or stress-tested readiness. Phase 35G does not approve guaranteed data-loss prevention. Phase 35G does not approve storage/backup/restore behavior changes. Phase 35G does not approve sync/cloud/account/auth/backend. Phase 35G does not approve telemetry/network calls. Phase 35G does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 35G does not approve route behavior changes. Phase 35G does not approve package/dependency changes. Phase 35G does not approve Elastic Button Compression implementation. Phase 35G does not approve Study Room polish. Phase 35G does not approve Streak Fire. Phase 35G does not approve Collapsible Header. Phase 35G does not approve Dynamic Canvas Themes implementation.

## Next recommended phase

Next recommended phase: Phase 35H — Hybrid Navigation Indicator Implementation. Phase 35H is a small runtime candidate and is not approval for broad navigation rewrite.
