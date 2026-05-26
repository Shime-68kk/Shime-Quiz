# Phase 35J — Next UI Polish Scope Gate

## Status tokens

PHASE35J_NEXT_UI_POLISH_SCOPE_STATUS: COMPLETED_NEXT_UI_POLISH_SCOPE_GATE

PHASE35J_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE35J_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION

PHASE35J_REVIEW_SCOPE: NEXT_UI_POLISH_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE35J_SELECTED_CANDIDATE: ELASTIC_BUTTON_COMPRESSION_PILOT

PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope

Phase 35J is docs/research/scope/planning/static-validator/CI-only. It compares remaining UI polish candidates, chooses exactly one small next runtime candidate for Phase 35K, and does not implement runtime behavior.

No runtime source, unit test source, E2E source, route/navigation implementation, package/dependency, storage, backup, restore, import parser, scheduler, FSRS, sync, cloud, account, auth, backend, telemetry, network, data model, or Study Room answer logic is changed or approved by this phase.

## Inputs from Phase 35I

Phase 35I reviewed the Hybrid Navigation Indicator evidence after Phase 35H and passed to a new UI polish scope gate. It carried forward the current readiness boundary, confirmed that LIMITED_BETA_CANDIDATE remains the highest approved readiness status, and did not approve BETA_READY, public production readiness, broad validation, route behavior changes, package/dependency changes, or broad navigation rewrite.

## Candidate comparison method

Candidates were compared for visible user value, expected implementation size, behavior risk, mobile and touch impact, accessibility and reduced-motion needs, rollback simplicity, dependency risk, and whether the candidate can be scoped as one small pilot without widening product readiness claims.

## Candidate comparison table

| Candidate | User value | Expected implementation size | Risk | Mobile/accessibility impact | Decision |
| --- | --- | --- | --- | --- | --- |
| Elastic Button Compression Pilot | Adds tactile feedback to common primary actions and can make the interface feel more responsive without changing flows. | Small if limited to a narrow set of existing primary action/button surfaces with CSS utility or class additions. | Low to medium; broad selectors could cause layout shifts, text rendering issues, or accidental behavior assumptions. | Positive for touch feel if tap targets remain stable, focus remains visible, and reduced-motion disables scale transform. | Selected for Phase 35K as a small pilot. |
| Study Room Answer Feedback Polish | Improves a high-value learning moment after answering. | Medium because answer states and learning-flow surfaces need careful review. | Medium to high because it can touch answer correctness, feedback timing, and scheduler-adjacent expectations. | Needs keyboard, screen reader, reduced-motion, and mobile evidence around answer states. | Deferred. |
| Mobile Touch Polish | Improves handheld ergonomics and touch confidence. | Medium because it can cross many surfaces unless narrowed. | Medium to high if treated as app-wide spacing, density, or gesture work. | Direct mobile value, but needs focused 375px evidence and no layout regressions. | Deferred pending narrower scope. |
| Accessibility Focus Polish | Improves keyboard and assistive technology confidence. | Medium because it should be audit-driven across specific controls. | Medium; beneficial but broad if not tied to concrete findings. | Direct accessibility value, but needs focused evidence and no visual focus regressions. | Deferred pending audit-specific scope. |
| Dashboard Calm Home Evidence Follow-up Fixes | Would resolve concrete findings from Dashboard Calm Home evidence if needed. | Unknown until a specific issue is identified. | Medium because it could reopen recent dashboard structure work. | Depends on issue; no current Phase 35I blocker requires it. | Deferred. |
| Hybrid Navigation Indicator Follow-up Fixes | Would address regressions if Phase 35I found blockers. | Unknown until a specific issue is documented. | Medium because it could reopen navigation polish. | Depends on issue; Phase 35I carried evidence forward without selecting a required fix lane. | Deferred. |
| Streak Fire Ignition | Adds celebratory motivation around streaks. | Medium to large because it introduces animation and learning-motivation state expectations. | Medium to high; needs separate behavior, copy, motion, and evidence boundaries. | Motion-heavy and must be carefully reduced-motion safe. | Deferred to a separate gate. |
| Collapsible Header | Improves vertical space and app shell density. | Medium because header behavior crosses routes and responsive states. | Medium to high due to route, scroll, focus, and layout interactions. | Could help mobile space but needs broad responsive evidence. | Deferred to a separate gate. |
| Dynamic Canvas Themes | Adds strong visual personalization and atmosphere. | Large because theme generation, rendering, persistence, and motion require substantial scope. | High; could affect performance, accessibility, theming, and claims around AI or generated visuals. | Needs contrast, reduced-motion, performance, and mobile evidence. | Deferred to a separate gate. |

## Selected candidate

PHASE35J_SELECTED_CANDIDATE: ELASTIC_BUTTON_COMPRESSION_PILOT

The selected candidate is Elastic Button Compression Pilot for Phase 35K.

## Why Elastic Button Compression Pilot first

Elastic Button Compression Pilot follows the UI architecture backlog after Hybrid Sliding Indicator and offers visible, tactile polish without requiring learning-logic, route, storage, scheduler, sync, backend, telemetry, package, or data model changes. It is suitable only as a pilot because the expected implementation can stay dependency-free, reversible, CSS-oriented, and limited to a narrow set of existing primary action/button surfaces.

## Why this is a pilot, not an app-wide sweep

Phase 35K is a small runtime pilot and is not approval for an app-wide interaction rewrite. App-wide compression could create inconsistent active states, text rendering issues, layout shifts, motion discomfort, and unclear evidence boundaries. Phase 35K must test the interaction on a narrow target set before any broader adoption is considered.

## Phase 35K allowed files / expected areas

Phase 35K may inspect and narrowly modify existing button or primary-action styling surfaces and directly related component class usage only where needed for the pilot. Expected areas are existing CSS utility/class definitions, narrow button class additions, active/pressed visual styling, focus-state preservation, touch behavior verification, and reduced-motion override.

## Phase 35K forbidden areas

Phase 35K must not add packages, change event handlers, change route behavior, change submit behavior, change data behavior, change pointer event routing, modify storage/backup/restore/import/parser/scheduler/FSRS/sync/cloud/account/auth/backend/telemetry systems, touch Study Room answer correctness logic, or convert Elastic Button Compression into an app-wide sweep.

## Accessibility and reduced-motion requirements

Phase 35K must preserve keyboard focus visibility, accessible names, tab order, button semantics, disabled behavior, and screen-reader expectations. It must include reduced-motion fallback: no scale transform under `prefers-reduced-motion: reduce`.

## Mobile and touch requirements

Phase 35K must include 375px mobile evidence, desktop evidence, and quick press/release evidence where practical. The pilot must not shrink touch targets, cause horizontal overflow, clip focus rings, overlap text, shift layout, or make pressed states difficult to release on touch devices.

## Risk assessment

The main risk is expanding a tactile micro-interaction into a broad selector change that affects unrelated controls. Additional risks are motion discomfort, unstable layout, clipped text, inconsistent focus styling, and accidental behavior changes if implementation touches handlers or pointer routing. These risks are acceptable only for a narrow CSS/class pilot with explicit rollback.

## Rollback plan for Phase 35K

Rollback should remove the pilot class usage and related CSS rules while leaving button behavior, handlers, routes, data flow, and dependencies unchanged. Because Phase 35K must not add packages or data migrations, rollback should be a small code revert.

## Chosen scope decision

PHASE35J_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION

## Decision rationale

Elastic Button Compression Pilot has the best balance of user-visible polish, small expected implementation size, no dependency need, no data or route risk, and clear evidence requirements. Study Room feedback, mobile touch, accessibility focus, Streak Fire, Collapsible Header, and Dynamic Canvas Themes remain useful but need narrower gates or carry higher behavioral, motion, or implementation risk.

## What Phase 35J supports

Phase 35J supports moving to Phase 35K — Elastic Button Compression Pilot Implementation, with a narrow pilot scope, no package changes, no behavior-handler changes, no route behavior changes, no submit behavior changes, no data behavior changes, no pointer event routing changes, reduced-motion protection, desktop evidence, 375px mobile evidence, quick press/release evidence where practical, and rollback evidence.

## What Phase 35J does not approve

Phase 35J confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 35J does not approve BETA_READY. Phase 35J does not approve public production readiness. Phase 35J does not approve broad validation or stress-tested readiness. Phase 35J does not approve guaranteed data-loss prevention. Phase 35J does not approve storage/backup/restore behavior changes. Phase 35J does not approve sync/cloud/account/auth/backend. Phase 35J does not approve telemetry/network calls. Phase 35J does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 35J does not approve route behavior changes. Phase 35J does not approve package/dependency changes. Phase 35J does not approve app-wide Elastic Button Compression. Phase 35J does not approve Study Room answer feedback implementation. Phase 35J does not approve Streak Fire. Phase 35J does not approve Collapsible Header. Phase 35J does not approve Dynamic Canvas Themes implementation.

## Next recommended phase

Next recommended phase: Phase 35K — Elastic Button Compression Pilot Implementation. Phase 35K is a small runtime pilot and is not approval for an app-wide interaction rewrite.
