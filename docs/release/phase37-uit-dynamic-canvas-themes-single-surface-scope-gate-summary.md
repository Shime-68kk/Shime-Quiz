# Phase 37-uiT — Dynamic Canvas Themes Single-Surface Scope Gate Summary
## Status tokens
PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_STATUS: COMPLETED_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE
PHASE37UIT_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_DECISION: PASS_TO_PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT
PHASE37UIT_REVIEW_SCOPE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37UIT_SELECTED_SURFACE: DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW
PHASE37UIT_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT
PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope
Phase 37-uiT is docs/review/research/release/planning/static-validator/CI-only and changes no runtime behavior, CSS source, tests, E2E specs, package files, storage, import, parser, scheduler, FSRS, sync, auth, backend, telemetry, route/navigation implementation, handlers, scoring, queue, data, localStorage, sessionStorage, theme files, or generated artifacts.

## Current readiness
The current readiness remains `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`. Phase 37-uiT does not approve `BETA_READY`, public production readiness, or release-readiness upgrade.

## Scope gate result
The gate selects exactly one low-risk Dynamic Canvas Themes candidate surface for a future pilot: `DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW`.

## Chosen decision
PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_DECISION: PASS_TO_PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT.

## Selected surface
PHASE37UIT_SELECTED_SURFACE: DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW.

## Selected candidate
PHASE37UIT_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT.

## Why this surface is safest
The Dashboard preview surface is visible, modern, and connected to the existing Dynamic Canvas token preview concept while staying away from global app theme state, body/html, routing shell, all pages, Study Room answer state, storage, import, parser, scheduler, scoring, preferences, account sync, backend, and telemetry.

## Why this is not runtime
Phase 37-uiT only records the selected surface, decision, constraints, evidence requirements, Phase 37-uiU seed, validator, and workflow registration. It does not implement Dynamic Canvas Themes runtime, full theme picker runtime, persisted theme preferences, account-synced preferences, CSS variable theme engine implementation, global app theme implementation, body/html global theme changes, or app root theme changes.

## Future runtime pilot direction
Phase 37-uiU may proceed only as a Dashboard-only, non-persistent, single-surface preview pilot. It must not change route behavior or page rendering, must not touch Study Room scoring/answer state, and must not touch storage/import/parser/scheduler/data.

## Theme-state and persistence policy
The future pilot must be non-persistent, must not become a theme picker, must not write localStorage or sessionStorage, must not implement account-synced preferences, must not mutate global app theme, and must not change body/html or app root theme.

## Evidence required before runtime merge
Required evidence includes contrast/readability proof, focus-visible proof, reduced-motion proof, 375px mobile proof, desktop proof, storage and persistence non-touch proof, route and handler non-touch proof, no telemetry proof, E2E smoke/onboarding results, and rollback steps.

## What is supported
Phase 37-uiT supports `pr-diff`, `post-merge-main`, and `validator-hotfix` validation modes; one selected surface; one selected next candidate; a Phase 37-uiU seed; release summary; CI workflow registration; and static guardrails.

## What remains not approved
Not approved: `BETA_READY`, public production readiness, release-readiness upgrade, runtime implementation in Phase 37-uiT, Dynamic Canvas Themes runtime in Phase 37-uiT, full Dynamic Canvas Themes runtime, full theme picker runtime, persisted theme preferences, account-synced preferences, CSS variable theme engine implementation, global app theme implementation, body/html global theme changes, app root theme changes, route-dependent theme state, storage/backup/restore behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, scoring/correctness/scheduler/queue/data changes, streak calculation changes, daily goal logic changes, completion logic changes, route behavior changes, event handler changes, NavLink destination changes, router configuration changes, active page rendering changes, package/dependency changes, localStorage writes, sessionStorage writes, sync/cloud/account/auth/backend, telemetry/network calls, AI-generated themes, or replacement of Phase 37C.

## Validation summary
Validation requires `node scripts/validate-phase37-uit-dynamic-canvas-themes-single-surface-scope-gate.js`, `npm run build`, `npm run test:unit`, `npm run test:e2e:smoke`, `npm run test:e2e:onboarding`, and `git diff --check`.

## Validator post-merge safety
The Phase 37-uiT validator is post-merge-main-safe from initial implementation. It supports `pr-diff`, `post-merge-main`, and `validator-hotfix`, does not run an internal git fetch, and allows a clean post-merge checkout with empty diff when required content is present.

## Guardrails
The guardrails keep Dynamic Canvas Themes behind a single-surface preview path and preserve Phase 37C release-readiness separation.

## Next recommended phase
Phase 37-uiU — Dynamic Canvas Themes Single-Surface Preview Pilot.
