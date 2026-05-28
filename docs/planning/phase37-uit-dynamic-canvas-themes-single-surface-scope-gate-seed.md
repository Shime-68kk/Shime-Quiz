# Phase 37-uiT — Dynamic Canvas Themes Single-Surface Scope Gate Seed
## Status token
PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_SEED_STATUS: PREPARED_SCOPE_GATE_SEED

## Purpose
Phase 37-uiT is scope gate only. It must choose at most one low-risk candidate surface for a possible future Dynamic Canvas Themes preview and must not implement runtime behavior.

## Inputs from Phase 37-uiS
Inputs are the Phase 37-uiS design gate, release summary, validator, and decision `PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_DECISION: PASS_TO_PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE`.

## Scope gate candidate
The candidate is `DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE`. It should decide whether one non-persistent preview surface is safe enough to hand to a later pilot.

## User-facing intent
The intent is to keep Shime Quiz visually ambitious and distinctive while preserving a calm, Vietnamese-first, learner-owned, trustworthy, lightweight, local-first study experience.

## Allowed files / expected areas
Expected areas are docs/review, docs/release, docs/planning, static validator, and workflow registration. The phase may document the selected surface, token restrictions, evidence checklist, contrast requirements, reduced-motion requirements, rollback plan, and decision options.

## Forbidden areas
No theme picker, persistence, localStorage/sessionStorage writes, account-synced preferences, CSS variable theme engine, global app theme, route changes, storage/import/parser/scheduler/data changes, packages, telemetry, or backend work is approved. Phase 37-uiT must not modify `src/**`, `tests/**`, `e2e/**`, package files, CSS source, theme files, generated artifacts, route/navigation implementation, handlers, form submission, disabled behavior, scoring/queue/scheduler/data logic, daily goal logic, streak calculation, completion logic, sync/cloud/account/auth/backend, telemetry, localStorage, or sessionStorage.

## Candidate surface selection rules
Phase 37-uiT must pick at most one low-risk candidate surface. Allowed candidates are Dashboard Dynamic Canvas token preview only, one static preview card, one documentation-only preview table, or one Storybook-like docs surface if it already exists. Forbidden candidates are global app root, body/html global theme, routing shell, all pages at once, Study Room scoring/answer state, storage/import/parser/scheduler surfaces, auth/account/profile surfaces, localStorage/sessionStorage, and backend/sync/cloud.

## Theme-token restrictions
Allowed token categories are surface color tokens, subtle border tokens, shadow depth tokens, focus ring tokens, non-persistent preview tokens, and reduced-motion-safe accent tokens. Forbidden token categories are persisted user preference tokens, account-synced preference tokens, localStorage/sessionStorage-backed theme tokens, route-dependent theme state, import/scheduler/scoring state tokens, telemetry-driven personalization, and AI-generated theme tokens.

## Theme-state and persistence restrictions
Phase 37-uiT is not runtime implementation and must not approve theme state. Future Phase 37-uiU, if approved, must be a non-persistent visual preview only. No theme picker, persistence, localStorage/sessionStorage writes, account-synced preferences, CSS variable theme engine, global app theme, route changes, storage/import/parser/scheduler/data changes, packages, telemetry, or backend work is approved.

## Accessibility, contrast, and reduced-motion requirements
The selected surface must require contrast and readability evidence, focus-visible evidence, reduced-motion evidence, 375px mobile proof, and desktop rendering proof before any future runtime pilot. Low-contrast directions must be treated as blocked until evidence proves readability.

## Evidence required
Required evidence includes selected-surface rationale, candidate token inventory, forbidden area confirmation, contrast proof, Vietnamese text readability proof, 375px mobile no-overflow proof, desktop proof, reduced-motion proof, focus-visible proof, localStorage/sessionStorage non-touch proof, storage/import/parser/scheduler/data non-touch proof, route and handler non-touch proof, no telemetry proof, and rollback steps.

## Rollback plan
The next phase must describe how the selected surface can be held or reverted without storage cleanup, preference migration, account cleanup, route cleanup, or backend cleanup.

## Decision options
- HOLD_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE
- NEEDS_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_RESEARCH
- PASS_TO_PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT
- PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW
- PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF

## Forbidden default approvals
Phase 37-uiT must not approve `BETA_READY`, public production readiness, release-readiness upgrade, Dynamic Canvas Themes runtime, full theme picker runtime, persisted theme preferences, account-synced preferences, CSS variable theme engine, global app theme, body/html global theme changes, storage/backup/restore behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, scoring/correctness/scheduler/queue/data changes, streak calculation changes, daily goal logic changes, completion logic changes, route behavior changes, event handler changes, NavLink destination changes, router configuration changes, active page rendering changes, package/dependency changes, localStorage writes, sessionStorage writes, sync/cloud/account/auth/backend, telemetry/network calls, AI-generated themes, or replacement of Phase 37C.

## Recommended next step
Prepare Phase 37-uiT as a scope gate only and decide whether a later Phase 37-uiU non-persistent single-surface visual preview pilot is safe.
