# Phase 37-uiH — Hybrid Sliding Navigation Indicator Pilot Seed

## Status token
PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Purpose
Phase 37-uiH is a runtime pilot only if scoped to the existing navigation active indicator. It should create a modern sliding active-pill indicator without changing navigation behavior.

## Inputs from Phase 37-uiG
Phase 37-uiG selected `HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT` after passing the Study Room Modern Answer Surface evidence review and confirming readiness remains LIMITED_BETA_CANDIDATE.

## Runtime candidate
Hybrid Sliding Navigation Indicator Pilot: a modern sliding active-pill indicator for existing desktop and mobile navigation.

## User-facing intent
The navigation should feel spatially coherent, premium, calm, and easy to scan while preserving Shime's current route model and Vietnamese-first product identity.

## Allowed files / expected areas
Expected areas are the existing navigation presentation surfaces for Sidebar and BottomNav plus the minimum scoped CSS needed for the active indicator. Exact files must be defined by the Phase 37-uiH task before implementation.

## Forbidden areas
Phase 37-uiH must not add dependencies, change routes, router config, `NavLink` destinations, click handlers, active route logic, page rendering, BottomNav behavior, Sidebar behavior, focus-visible behavior, reduced-motion behavior, mobile safe-area behavior, data, storage/import/parser, scheduler/FSRS, sync/backend/auth/telemetry, package files, localStorage, Study Room scoring/queue/scheduler/data logic, generated artifacts, or persisted preferences.

## Implementation guidance
Keep the pilot visual-only. Prefer a scoped passive class or data marker on existing navigation surfaces, then use CSS for the sliding active-pill treatment. Preserve route definitions, `NavLink` destinations, click handlers, active route logic, page rendering, BottomNav behavior, Sidebar behavior, focus-visible, reduced-motion, and mobile safe-area behavior.

## Responsive and motion requirements
The indicator must work on desktop navigation and mobile bottom navigation, avoid 375px overflow, preserve safe-area spacing, and disable or simplify motion under `prefers-reduced-motion: reduce`.

## Accessibility, contrast, and reduced-motion requirements
Preserve keyboard focus-visible visibility, maintain readable active text/icon contrast, avoid relying on motion alone to communicate active state, and include reduced-motion evidence.

## Navigation routing, active-state, and event-handler restrictions
Do not change route definitions, router configuration, active route logic, active page rendering, `NavLink` destinations, click handlers, or event-handler semantics.

## Evidence required
Phase 37-uiH must include desktop navigation evidence, mobile bottom navigation evidence, active indicator movement evidence, active text/icon color evidence, focus-visible evidence, reduced-motion evidence, 375px no-overflow evidence, E2E smoke/onboarding results, and rollback notes.

## Rollback plan
Rollback should remove only the scoped active-indicator marker/CSS and restore the previous static active styling without touching routes, handlers, storage, data, or package files.

## Decision options
- HOLD_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT
- NEEDS_HYBRID_SLIDING_NAVIGATION_INDICATOR_REWORK
- PASS_TO_PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW
- PASS_TO_HYBRID_NAVIGATION_RESEARCH_ONLY

## Forbidden default approvals
Phase 37-uiH must not approve BETA_READY, public production readiness, release-readiness upgrade, broad UI redesign, route behavior changes, event handler changes, NavLink destination changes, router configuration changes, active page rendering changes, package/dependency changes, storage/import/parser behavior changes, scheduler/FSRS behavior changes, sync/cloud/account/auth/backend, telemetry/network calls, full Dynamic Canvas Themes, full theme picker, persisted preferences, localStorage writes, Streak Fire, Collapsible Header, or replacement of Phase 37C.

## Recommended next step
Implement only the scoped Hybrid Sliding Navigation Indicator Pilot and gather the required desktop, mobile, accessibility, reduced-motion, E2E, and rollback evidence.
