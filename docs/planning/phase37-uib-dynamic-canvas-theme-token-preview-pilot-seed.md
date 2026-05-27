# Phase 37-uiB — Dynamic Canvas Theme Token Preview Pilot Seed

## Status token

PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Purpose

Prepare the next UI phase as a small runtime pilot only if discovery supports a safe one-surface Dynamic Canvas Theme Token Preview Pilot. Phase 37-uiB may be a small runtime pilot only if discovery supports it. This seed does not approve implementation by default.

## Inputs from Phase 37-uiA

Phase 37-uiA found existing `data-theme` and localStorage-backed light/dark theme behavior, broad CSS custom property usage, and no clear existing Dynamic Canvas runtime surface. Phase 37-uiA selected DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT as the recommended next candidate while forbidding a full theme picker, persisted theme preferences, localStorage writes, account-synced preferences, global theme system, and broad UI redesign.

## Runtime candidate

The runtime candidate is a one-surface, non-persisted Dynamic Canvas Theme Token Preview Pilot. It should prefer one scoped CSS/token preview and must hold or switch to research-only if a safe target cannot be identified.

## User-facing intent

Let reviewers evaluate whether a small themed token preview improves visual clarity or product feel without changing the app's durable theme preference, storage behavior, global theme architecture, or readiness status.

## Allowed files / expected areas

Phase 37-uiB may touch only files explicitly allowed by its own future implementation spec. Expected areas should be one UI surface, one scoped style/token preview, focused evidence docs, and a phase validator. It should not assume the existing `theme` localStorage key is available for new behavior.

## Forbidden areas

Phase 37-uiB must not implement a full theme picker. It must not implement persisted theme preferences. It must not write localStorage. It must not sync preferences or require account/auth/backend. It must not change storage/backup/restore behavior. It must not change import/parser/scheduler/data behavior. It must not add packages or dependencies. It must not change Study Room correctness/scoring/scheduler/queue/data behavior. It must not implement Streak Fire, Collapsible Header, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, route behavior changes, event handler changes outside its scoped surface, or broad UI redesign.

## Implementation guidance

Prefer one surface and one scoped CSS/token preview. Avoid global token rewrites unless the future spec explicitly limits and validates them. Do not add new preference UI, new settings storage, new localStorage keys, or changes to the existing theme toggle. Keep rollback simple: remove the scoped preview and return to the current token behavior.

## Accessibility, contrast, and reduced-motion requirements

Phase 37-uiB must include contrast evidence, 375px evidence, focus-visible evidence, reduced-motion evidence, desktop evidence, and rollback notes. Status colors, focus rings, selected/active states, muted text, and borders must remain legible. If a canvas-like visual treatment includes motion, reduced-motion must disable or simplify it.

## Persistence and localStorage restrictions

Phase 37-uiB must not implement persisted theme preferences. Phase 37-uiB must not write localStorage. Phase 37-uiB must not add, mutate, clear, or migrate the existing `theme` key. Phase 37-uiB must not account-sync preferences.

## Evidence required

Evidence must include the selected surface, implementation scope, desktop screenshot/manual review, mobile 375px screenshot/manual review, contrast review, focus-visible review, reduced-motion review, no-localStorage-write review, no storage/backup/restore impact review, no import/parser/scheduler/data impact review, validation commands, and rollback notes.

## Rollback plan

Remove the scoped token preview and any pilot-only styles or UI wiring. Because the pilot must not persist preferences or write localStorage, rollback must not require storage migration, backup repair, account changes, or data cleanup.

## Decision options

HOLD_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT

NEEDS_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_REWORK

PASS_TO_PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW

PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY

## Forbidden default approvals

Phase 37-uiB must not approve Beta Ready, public production readiness, broad validation, stress-tested readiness, guaranteed data-loss prevention, Dynamic Canvas Themes full implementation, a full theme picker, persisted theme preferences, localStorage writes, account-synced preferences, sync/cloud/account/auth/backend, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, storage/backup/restore behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, route behavior changes, package/dependency changes, Study Room correctness/scoring/scheduler/queue/data changes, Streak Fire, Collapsible Header, broad UI redesign, or automatic next runtime implementation beyond the scoped pilot.

## Recommended next step

Next recommended phase: Phase 37-uiB — Dynamic Canvas Theme Token Preview Pilot. Phase 37-uiB is a small runtime pilot only if discovery supports it. If a safe one-surface target cannot be identified, Phase 37-uiB must HOLD_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT or PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY.
