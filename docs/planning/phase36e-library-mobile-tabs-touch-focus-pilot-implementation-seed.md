# Phase 36E — Library Mobile Tabs Touch and Focus Pilot Implementation Seed

## Status token
PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Purpose
Seed the next phase as a small runtime pilot for Library mobile tab switcher touch comfort and focus-visible behavior only.

## Inputs from Phase 36D
PHASE36D_MOBILE_TOUCH_LIBRARY_TABS_SCOPE_DECISION: PASS_TO_PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION

PHASE36D_SELECTED_CANDIDATE: LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT

Phase 36D selected exactly one next candidate and did not implement runtime changes.

## Runtime candidate
Library Mobile Tabs Touch and Focus Pilot.

Phase 36E is a small runtime pilot only.

## User-facing intent
Improve mobile Library tab switcher tap comfort, visible keyboard focus, and 375px layout confidence while preserving existing Library behavior.

## Allowed files / expected areas
Phase 36E should target Library mobile tab switcher touch comfort and focus-visible behavior only.

It should target Library mobile tab switcher touch comfort and focus-visible behavior only.

Expected areas may include the Library tab switcher component or adjacent Library styling, focused tests or E2E evidence required by the implementation, Phase 36E evidence/release/planning docs, a Phase 36E validator, and smoke workflow registration.

Implementation should prefer CSS/class adjustments and minimal component-local changes.

## Forbidden areas
Phase 36E must not change import tools, parser logic, file import behavior, backup/restore behavior, schema behavior, demo sample behavior, EduGen/draft workshop logic, stored data, routes, navigation, sync/backend/auth/telemetry, package files, or dependencies.

Phase 36E must not change Study Room correctness, scoring, scheduler, queue, FSRS, or data model behavior.

Phase 36E must not implement Dashboard, Study Room, Dynamic Canvas Themes, Streak Fire, Collapsible Header, or broad mobile redesign changes.

## Implementation guidance
Keep the pilot narrow, reversible, and Library-tab-specific.

Preserve tab roles, labels, `aria-selected`, `aria-controls`, panel mounting behavior, raw input preservation, and importStatus visibility.

Do not change route definitions, route matching, `NavLink` destinations, navigation handlers, import parser behavior, or storage behavior.

## Accessibility and reduced-motion requirements
Phase 36E must include focus-visible evidence for keyboard use on the Library tab switcher.

Phase 36E must include reduced-motion evidence for any affected tab transition or focus styling.

## Mobile and touch requirements
Phase 36E must include 375px mobile evidence, touch target/tap comfort evidence, and no-horizontal-overflow evidence.

Physical-device safe-area validation remains unproven unless a later phase documents physical safe-area device evidence.

## Validation required
Phase 36E should run dependency installation, the Phase 36E validator, build, unit tests, E2E smoke, E2E onboarding, and diff whitespace checks before handoff.

## Evidence required
Evidence should include before/after implementation scope, 375px viewport measurements, touch target/tap comfort measurements, focus-visible behavior, reduced-motion behavior, no-horizontal-overflow results, smoke/onboarding E2E results, and rollback notes.

## Rollback plan
Rollback should remove only the Phase 36E Library tab touch/focus runtime adjustments, focused tests or evidence, Phase 36E docs, validator, and workflow registration.

Rollback must not require data migration, route changes, storage changes, package changes, or import/parser changes.

## Decision options
HOLD_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION

NEEDS_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_REWORK

PASS_TO_PHASE36F_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW

## Forbidden default approvals
Phase 36E is a small runtime pilot and is not approval for broad mobile redesign.

Phase 36D confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

Phase 36D does not approve BETA_READY.

Phase 36D does not approve public production readiness.

Phase 36D does not approve broad validation or stress-tested readiness.

Phase 36D does not approve guaranteed data-loss prevention.

Phase 36D does not approve storage/backup/restore behavior changes.

Phase 36D does not approve import/parser behavior changes.

Phase 36D does not approve sync/cloud/account/auth/backend.

Phase 36D does not approve telemetry/network calls.

Phase 36D does not approve built-in AI/OCR/API-key/BYOK behavior.

Phase 36D does not approve route behavior changes.

Phase 36D does not approve package/dependency changes.

Phase 36D does not approve Study Room correctness/scoring/scheduler/queue/data changes.

Phase 36D does not approve Dynamic Canvas Themes implementation.

Phase 36D does not approve Streak Fire.

Phase 36D does not approve Collapsible Header.

Phase 36D does not approve broad UI redesign.

Phase 36D does not approve new runtime UI implementation.

Phase 36D does not approve broader mobile runtime changes.

## Recommended next step
Next recommended phase: Phase 36E — Library Mobile Tabs Touch and Focus Pilot Implementation
