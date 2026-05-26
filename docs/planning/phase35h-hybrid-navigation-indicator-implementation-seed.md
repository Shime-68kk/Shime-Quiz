# Phase 35H — Hybrid Navigation Indicator Implementation Seed

## Status token

PHASE35H_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Purpose

Prepare a narrow implementation phase for Hybrid Sliding Navigation Indicator after Phase 35G selected it as the next UI polish candidate.

## Inputs from Phase 35G

- PHASE35G_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35H_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION
- PHASE35G_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR
- Phase 35G candidate comparison and guardrails.
- Phase 35F Dashboard Calm Home evidence carry-forward.

## Runtime candidate

Phase 35H should be a small runtime candidate only. Hybrid Sliding Navigation Indicator should add a visual active navigation indicator using existing navigation state, without changing routes, data behavior, or navigation semantics.

## User-facing intent

The intent is to make the current app location easier to perceive and make the app shell feel more polished across desktop and mobile without changing where navigation items go or how users activate them.

## Allowed files / expected areas

Expected implementation areas are the existing navigation/sidebar component and its local styles or app shell styles. Allowed changes should be limited to visual indicator markup/styling hooks, active visual state, transitions, responsive sizing, focus preservation, and reduced-motion behavior.

## Forbidden areas

Phase 35H must not change route behavior, route definitions, navigation click handlers, navigation item destinations, page rendering logic, package files, storage, backup, restore, import parser, scheduler, FSRS, sync, cloud, account, auth, backend, telemetry, network behavior, data models, or unrelated UI surfaces. It must not add packages. It must not alter sidebar/nav item semantics beyond visual active/transition polish.

## Implementation guidance

Reuse existing active route/nav state. Keep the indicator visually subordinate to nav labels and icons. Prefer CSS transforms or position transitions over layout-changing animation. Keep the implementation reversible by isolating the visual layer from routing and page state.

## Accessibility and reduced-motion requirements

Preserve keyboard focus, tab order, accessible names, active state meaning, and existing nav semantics. Focus rings must remain visible with the indicator present. `prefers-reduced-motion: reduce` must disable or make instant any sliding transition.

## Mobile and responsive requirements

Include desktop and 375px mobile evidence. The indicator must not cause horizontal overflow, clipped text, overlapping icons, unstable nav height, touch-target shrinkage, or clipped focus rings.

## Validation required

Run the scoped Phase 35H validator, build, unit tests, smoke e2e, onboarding e2e, focused browser evidence checks, and whitespace checks. Do not add packages to satisfy the implementation.

## Evidence required

Evidence must include desktop and 375px mobile screenshots or equivalent browser observations, keyboard focus verification, active route verification, reduced-motion verification, and confirmation that route behavior did not change.

## Rollback plan

Rollback should remove only the indicator visual layer and related styles while leaving existing navigation items, route behavior, data behavior, and tests unchanged.

## Decision options

HOLD_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION

NEEDS_HYBRID_NAVIGATION_INDICATOR_REWORK

PASS_TO_PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW

## Forbidden default approvals

Phase 35H must not default-approve BETA_READY, public production readiness, broad validation, stress-tested readiness, guaranteed data-loss prevention, storage/backup/restore behavior changes, sync/cloud/account/auth/backend behavior, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, route behavior changes, package/dependency changes, broad navigation rewrite, or unrelated UI polish.

## Recommended next step

Next recommended phase: Phase 35H — Hybrid Navigation Indicator Implementation. Phase 35H is a small runtime candidate and is not approval for broad navigation rewrite.
