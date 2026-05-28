# Phase 37-uiU — Dynamic Canvas Themes Single-Surface Preview Pilot Seed
## Status token
PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Purpose
Phase 37-uiU is a runtime preview pilot only if scoped to the selected Dashboard Dynamic Canvas token preview surface. It must remain smaller than full Dynamic Canvas Themes runtime.

## Inputs from Phase 37-uiT
Inputs are `PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_DECISION: PASS_TO_PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT`, `PHASE37UIT_SELECTED_SURFACE: DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW`, and `PHASE37UIT_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT`.

## Runtime candidate
The runtime candidate is `DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT`.

## Selected surface
The selected surface is `DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW`.

## User-facing intent
The pilot should make the Dashboard feel more modern and distinctive while preserving a calm, Vietnamese-first, learner-owned, trustworthy, lightweight, local-first study experience.

## Allowed files / expected areas
Allowed areas should be the smallest necessary Dashboard preview component or scoped style surface, static evidence docs, release summary, validator, and workflow registration. scoped CSS tokens/classes may be used only within the selected preview surface.

## Forbidden areas
Phase 37-uiU must not implement a theme picker, write localStorage/sessionStorage, implement account-synced preferences, implement global app theme or body/html theme, add a CSS variable theme engine, change routing, change handlers, touch storage/import/parser/scheduler/scoring/queue/data/streak/completion logic, change packages, add telemetry, change auth/backend, or replace Phase 37C.

## Implementation guidance
Keep the implementation Dashboard-only and reversible. Prefer static, scoped preview tokens and avoid app-level state, preference state, route state, account state, backend state, or generated theme behavior.

## Theme-token restrictions
The pilot may use scoped surface color tokens, subtle border tokens, shadow depth tokens, focus ring tokens, non-persistent preview tokens, and reduced-motion-safe accent tokens within the selected preview surface only. It must not use persisted user preference tokens, account-synced preference tokens, localStorage/sessionStorage-backed theme tokens, route-dependent theme state, import/scheduler/scoring state tokens, telemetry-driven personalization, or AI-generated theme tokens.

## Theme-state and persistence restrictions
The pilot must be non-persistent. It must not become a theme picker, must not write localStorage or sessionStorage, must not implement account-synced preferences, must not mutate global app theme, must not change body/html or app root theme, and must not add a CSS variable theme engine.

## Accessibility, contrast, and reduced-motion requirements
The pilot must include contrast and readability evidence for Vietnamese text, numeric data, disabled states, hover states, selected states, error states, and focus states. It must include reduced-motion behavior and must not rely on motion to communicate required state.

## Focus-visible requirements
Focus-visible evidence must show keyboard focus remains clear on and around the selected Dashboard preview surface.

## Mobile and desktop requirements
The pilot must include 375px mobile no-overflow evidence and desktop rendering evidence. Text and controls must not overlap or hide primary learning content.

## Evidence required
Required evidence includes scoped file list, token inventory, contrast/readability proof, focus-visible proof, reduced-motion proof, 375px proof, desktop proof, E2E smoke/onboarding results, storage/import/parser/scheduler/scoring/queue/data non-touch proof, localStorage/sessionStorage non-touch proof, route and handler non-touch proof, no telemetry proof, and rollback proof.

## Rollback plan
Rollback must be a small revert of the preview surface and evidence files with no storage cleanup, preference migration, account cleanup, route cleanup, backend cleanup, or telemetry cleanup.

## Decision options
- HOLD_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT
- NEEDS_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_REWORK
- PASS_TO_PHASE37UIV_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_EVIDENCE_REVIEW
- PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW
- PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY

## Forbidden default approvals
Phase 37-uiU must not default-approve `BETA_READY`, public production readiness, release-readiness upgrade, full Dynamic Canvas Themes runtime, full theme picker runtime, persisted theme preferences, account-synced preferences, CSS variable theme engine implementation, global app theme implementation, body/html global theme changes, app root theme changes, route-dependent theme state, storage/backup/restore behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, scoring/correctness/scheduler/queue/data changes, streak calculation changes, daily goal logic changes, completion logic changes, route behavior changes, event handler changes, NavLink destination changes, router configuration changes, active page rendering changes, package/dependency changes, localStorage writes, sessionStorage writes, sync/cloud/account/auth/backend, telemetry/network calls, AI-generated themes, or replacement of Phase 37C.

## Recommended next step
Implement only the Dashboard Dynamic Canvas token preview as a non-persistent single-surface runtime preview pilot, then pass to Phase 37-uiV evidence review only if all evidence requirements pass.
