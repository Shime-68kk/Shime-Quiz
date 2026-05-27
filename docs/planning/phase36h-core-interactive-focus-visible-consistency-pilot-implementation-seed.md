# Phase 36H — Core Interactive Focus Visible Consistency Pilot Implementation Seed

## Status token

PHASE36H_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Purpose

Prepare Phase 36H as a small runtime pilot for focus-visible consistency on existing core interactive controls only.

## Inputs from Phase 36G

Phase 36G closes the current mobile/touch track as sufficient for now and selects Core Interactive Focus Visible Consistency Pilot as the single next candidate.

## Runtime candidate

Core Interactive Focus Visible Consistency Pilot.

## User-facing intent

Keyboard users should receive more consistent visible focus feedback on existing core interactive controls without changing page content, navigation, business logic, data behavior, or interaction semantics.

## Allowed files / expected areas

Phase 36H is a small runtime pilot only. It should target focus-visible consistency for existing core interactive controls only and should prefer CSS-only or CSS/class-only changes.

Expected areas are existing styling/class surfaces for core buttons, links, controls, tabs where already present, and other existing interactive elements that can be improved without behavior changes.

## Forbidden areas

Phase 36H must not change event handlers, routing, tab state, import behavior, storage, scheduler/FSRS, data, sync/backend/auth, telemetry, package files, dependencies, or page content.

Phase 36H must not implement Dynamic Canvas Themes, Streak Fire, Collapsible Header, broad mobile redesign, broad accessibility redesign, accessibility certification, or assistive technology review completion.

## Implementation guidance

Prefer existing style patterns and smallest possible CSS-only or CSS/class-only changes. Do not remove browser default focus semantics. Do not add logic that changes click, keyboard, routing, tab, import, storage, scheduler, sync, auth, backend, telemetry, or data behavior.

## Accessibility and reduced-motion requirements

Phase 36H must preserve reduced-motion behavior. Focus-visible treatment must remain visible in keyboard flows and must not depend on animation or motion.

## Mobile and keyboard requirements

Phase 36H must preserve 375px mobile behavior, desktop behavior, pointer/touch behavior, and keyboard tab order.

## Validation required

Run the Phase 36H validator, build, unit tests, E2E smoke, E2E onboarding, and `git diff --check`.

## Evidence required

Phase 36H must include keyboard tab evidence, focus-visible evidence, 375px mobile evidence, reduced-motion evidence, desktop evidence, E2E smoke evidence, E2E onboarding evidence, and rollback notes.

## Rollback plan

Rollback should revert only the Phase 36H focus-visible CSS/class changes and validator or documentation updates. Rollback must not require data migration, storage cleanup, route repair, import repair, scheduler repair, dependency changes, backend cleanup, telemetry cleanup, or user data changes.

## Decision options

HOLD_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION

NEEDS_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_REWORK

PASS_TO_PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW

## Forbidden default approvals

Phase 36H must not default to BETA_READY, public production readiness, broad validation, stress-tested readiness, guaranteed data-loss prevention, accessibility certification, assistive technology review completion, broad UI redesign, broader mobile/accessibility runtime changes, Dynamic Canvas Themes, Streak Fire, Collapsible Header, sync/cloud/account/auth/backend, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, package/dependency changes, route behavior changes, storage/backup/restore behavior changes, import/parser behavior changes, or Study Room correctness/scoring/scheduler/queue/data changes.

## Recommended next step

Next recommended phase: Phase 36H — Core Interactive Focus Visible Consistency Pilot Implementation.

Phase 36H is a small runtime pilot and is not approval for broad accessibility redesign.
