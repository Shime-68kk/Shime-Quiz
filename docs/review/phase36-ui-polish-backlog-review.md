# Phase 36 — UI Polish Backlog Review
## Status tokens
PHASE36_UI_POLISH_BACKLOG_REVIEW_STATUS: COMPLETED_UI_POLISH_BACKLOG_REVIEW

PHASE36_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE36_UI_POLISH_BACKLOG_REVIEW_DECISION: PASS_TO_PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_GATE

PHASE36_REVIEW_SCOPE: UI_POLISH_BACKLOG_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE36_SELECTED_BACKLOG_CANDIDATE: MOBILE_TOUCH_POLISH_SCOPE_GATE

PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_SEED_STATUS: PREPARED_SCOPE_SEED

## Scope
Phase 36 is docs/review/release/planning/static-validator/CI-only. It reviews the remaining UI polish backlog after Phase 35P and chooses exactly one small next scope-gate candidate.

No runtime UI, route, data, package, storage, backup, restore, import, parser, scheduler, FSRS, sync, cloud, backend, auth, telemetry, or Study Room answer logic changes are part of this phase.

## Inputs from Phase 35P
Inputs reviewed:
- `docs/review/phase35p-core-ui-plan-completion-review.md`
- `docs/release/phase35p-core-ui-plan-completion-review-summary.md`
- `docs/planning/phase36-ui-polish-backlog-review-seed.md`
- `scripts/validate-phase35p-core-ui-plan-completion-review.js`
- merged Phase 35P history on `origin/main`

Phase 35P closed the safe core UI plan completion review for Library Bookshelf Tabs, Dashboard Calm Home, Hybrid Navigation Indicator, Elastic Button Compression Pilot, and Study Room Answer Feedback Polish while preserving the limited-beta readiness boundary.

## Review method
The review compared ten backlog candidates against user value, expected implementation size, risk, and mobile/accessibility impact. The selected candidate had to be narrow enough for a follow-up scope gate and could not authorize runtime work in Phase 36.

## Backlog candidate comparison table
| Candidate | User value | Expected implementation size | Risk | Mobile/accessibility impact | Decision |
| --- | --- | --- | --- | --- | --- |
| Mobile Touch Polish Scope Gate | High: directly targets phone smoothness after core UI polish. | Small as a scope gate; implementation remains future-gated. | Low in Phase 36 because this is review-only. | High mobile impact with touch targets, overflow, safe-area, density, reduced-motion, and focus/touch affordance review. | Selected for Phase 36A scope gate. |
| Accessibility Focus Polish Scope Gate | High for keyboard and focus confidence. | Small to medium as a scope gate. | Low in Phase 36; future runtime changes need careful evidence. | High accessibility impact, medium mobile impact. | Deferred after mobile touch scope selection. |
| Dynamic Canvas Themes Design Gate | Medium as optional expressive polish. | Medium to large if later implemented. | Medium due to visual complexity, performance, and reduced-motion risk. | Medium; may affect motion and contrast. | Deferred; no implementation approval. |
| Streak Fire Ignition Design Gate | Medium for motivation polish. | Medium if later implemented. | Medium due to pressure, motion, and claim risk. | Medium; needs reduced-motion and non-coercive UX review. | Deferred; no implementation approval. |
| Collapsible Header Scope Gate | Medium for space efficiency. | Medium if later implemented. | Medium due to layout, navigation, and route-surface interaction risk. | Medium mobile impact; accessibility needs careful focus behavior review. | Deferred; no implementation approval. |
| Library Bookshelf Follow-up Fixes | Medium if evidence reveals remaining roughness. | Small if scoped to known defects. | Medium if it touches import, storage, or workshop behavior. | Medium mobile/accessibility impact. | Deferred unless Phase 36A evidence identifies a narrow issue. |
| Dashboard Calm Home Follow-up Fixes | Medium if density or touch problems remain. | Small if scoped to layout polish. | Medium if it drifts into dashboard behavior or route changes. | High mobile impact. | Deferred into mobile touch review evidence. |
| Hybrid Navigation Indicator Follow-up Fixes | Medium for orientation polish. | Small if visual-only. | Medium if route behavior is touched. | High mobile navigation impact. | Deferred into mobile touch review evidence. |
| Elastic Button Compression Follow-up Fixes | Medium for tactile polish. | Small if scoped to existing pilot surfaces. | Medium if expanded globally without evidence. | High touch impact and reduced-motion relevance. | Deferred into mobile touch review evidence. |
| Study Room Answer Feedback Follow-up Fixes | Medium for study clarity. | Small if visual-only. | High if correctness, scoring, scheduler, queue, or data logic is touched. | High mobile readability impact. | Deferred into mobile touch review evidence. |

## Selected backlog candidate
Selected candidate: Mobile Touch Polish Scope Gate.

This selection prepares Phase 36A as a scope gate only. Phase 36 does not approve mobile runtime changes.

## Why Mobile Touch Polish Scope Gate first
Mobile touch polish is the best next review target because the completed Phase 35 surfaces are user-facing and phone-sensitive. A scope gate can inspect 375px overflow, safe-area behavior, hit targets, density, touch feedback, reduced-motion handling, and focus/touch affordances before any runtime work is considered.

## Why this is a scope gate, not runtime implementation
Phase 36 only selects a backlog candidate and prepares the next planning seed. Any later implementation must be separately scoped, evidence-driven, and limited to one small approved surface.

Phase 36A is a scope gate and is not automatic runtime implementation.

## Phase 36A allowed files / expected areas
Expected Phase 36A areas are review, release, planning, static-validator, CI registration, and evidence requirements for a future mobile touch polish candidate.

Phase 36A may review Dashboard Calm Home mobile density and touch targets, Library Bookshelf mobile tabs/workshop touch targets, bottom navigation touch comfort and safe-area behavior, Study Room mobile answer feedback readability, button compression on mobile touch surfaces, 375px no-overflow behavior, and reduced-motion plus focus/touch affordance requirements.

## Phase 36A forbidden areas
Phase 36A must not default to runtime implementation. It must not approve package/dependency changes, route behavior changes, storage/backup/restore behavior changes, sync/cloud/account/auth/backend work, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, Study Room correctness/scoring/scheduler/queue/data changes, Dynamic Canvas Themes implementation, Streak Fire, Collapsible Header, broad UI redesign, or mobile runtime changes.

## Accessibility and reduced-motion requirements
Any future mobile touch polish candidate must define keyboard/focus expectations, visible affordance expectations, touch target expectations, contrast/readability expectations, and reduced-motion behavior before implementation.

## Mobile and touch evidence requirements
Phase 36A should require desktop and 375px mobile evidence, with special attention to no horizontal overflow, comfortable touch targets, safe-area behavior, readable Study Room feedback, stable bottom navigation, and no accidental expansion beyond the selected surface.

## Risk assessment
Phase 36 risk is low because it is static review only. Future risk is concentrated around accidental broad UI rewrites, route changes, global component changes, motion behavior, and Study Room answer-flow logic. Those risks require explicit guardrails before runtime work.

## Rollback plan for future runtime work
Any future runtime mobile touch polish should be one small isolated patch with clear before/after evidence and a simple revert path limited to the touched UI surface. It must avoid data model, scheduler, storage, sync, auth, backend, telemetry, and package changes.

## Chosen backlog decision
PHASE36_UI_POLISH_BACKLOG_REVIEW_DECISION: PASS_TO_PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_GATE

## Decision rationale
Mobile Touch Polish Scope Gate provides the highest immediate user value after Phase 35 because it evaluates whether the completed core UI plan feels comfortable on phones. It is narrow enough to stay evidence/planning-only and broad enough to compare the completed surfaces without approving implementation.

## What Phase 36 supports
Phase 36 supports passing to Phase 36A — Mobile Touch Polish Scope Gate.

Phase 36 confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

## What Phase 36 does not approve
Phase 36 does not approve BETA_READY.

Phase 36 does not approve public production readiness.

Phase 36 does not approve broad validation or stress-tested readiness.

Phase 36 does not approve guaranteed data-loss prevention.

Phase 36 does not approve storage/backup/restore behavior changes.

Phase 36 does not approve sync/cloud/account/auth/backend.

Phase 36 does not approve telemetry/network calls.

Phase 36 does not approve built-in AI/OCR/API-key/BYOK behavior.

Phase 36 does not approve route behavior changes.

Phase 36 does not approve package/dependency changes.

Phase 36 does not approve Study Room correctness/scoring/scheduler/queue/data changes.

Phase 36 does not approve Dynamic Canvas Themes implementation.

Phase 36 does not approve Streak Fire.

Phase 36 does not approve Collapsible Header.

Phase 36 does not approve broad UI redesign.

Phase 36 does not approve new runtime UI implementation.

Phase 36 does not approve mobile runtime changes.

## Next recommended phase
Next recommended phase: Phase 36A — Mobile Touch Polish Scope Gate
