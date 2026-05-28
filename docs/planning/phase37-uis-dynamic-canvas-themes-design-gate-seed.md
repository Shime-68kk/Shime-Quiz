# Phase 37-uiS — Dynamic Canvas Themes Design Gate Seed
## Status token
PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_SEED_STATUS: PREPARED_DESIGN_GATE_SEED

## Purpose
Phase 37-uiS is design gate only. Phase 37-uiS is not runtime implementation. It defines safe boundaries for Dynamic Canvas Themes before any runtime implementation is considered.

## Inputs from Phase 37-uiR
Inputs include `PHASE37UIR_UI_BACKLOG_CLOSURE_REVIEW_DECISION: PASS_TO_PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_ONLY`, completed UI backlog closure review, carried-forward evidence gaps, and guardrails that keep readiness unchanged.

## Design gate candidate
The candidate is Dynamic Canvas Themes Design Gate Only. It is not Dynamic Canvas Themes runtime and not a full theme picker runtime.

## User-facing intent
The intended future user benefit is a more distinctive, premium, and cohesive visual experience that can respond to learning context without weakening clarity, accessibility, local-first trust, storage safety, or route predictability.

## Allowed files / expected areas
Phase 37-uiS should be docs/review/research/release/planning/static-validator/CI-only. It may define candidate theme tokens, allowed surfaces, contrast targets, reduced-motion requirements, rollback plan, and evidence checklist.

## Forbidden areas
Phase 37-uiS must not add theme picker, persistence, localStorage/sessionStorage writes, account-synced preferences, CSS variable theme engine, route changes, storage/import/parser/scheduler/data changes, packages, telemetry, backend work, Dynamic Canvas Themes runtime, full theme picker runtime, or runtime implementation.

## Design questions
Which tokens are safe to define on paper only? Which surfaces can be considered low-risk? Which states must remain fixed? Which contrast targets are required? Which motion states need reduced-motion alternatives? Which screenshots and browser checks are required? What is the smallest future pilot smaller than full Dynamic Canvas Themes?

## Theme-state and persistence restrictions
No theme state implementation is approved. No persisted theme preferences are approved. No localStorage writes are approved. No sessionStorage writes are approved. No account-synced preferences are approved. No CSS variable theme engine is approved. Any future runtime pilot must start without persistence unless a later gate explicitly approves a smaller bounded persistence plan.

## Accessibility, contrast, and reduced-motion requirements
The gate must require readable contrast in all candidate palettes, focus-visible preservation, reduced-motion behavior for any animated theme concept, 375px mobile evidence, desktop evidence, and proof that visual changes do not obscure learning clarity or answer feedback.

## Evidence required
Required evidence includes candidate token documentation, allowed/forbidden surface list, contrast/readability matrix, reduced-motion notes, focus-visible notes, mobile 375px screenshot plan, desktop browser screenshot plan, rollback criteria, no-storage/no-persistence proof, and no route/handler/data/scheduler/import behavior proof.

## Rollback plan
If the gate cannot prove safe boundaries, hold with `HOLD_DYNAMIC_CANVAS_THEMES_DESIGN_GATE` or `NEEDS_DYNAMIC_CANVAS_THEMES_RESEARCH`. If it is safe, pass only to a smaller future scope gate, not full runtime.

## Decision options
HOLD_DYNAMIC_CANVAS_THEMES_DESIGN_GATE
NEEDS_DYNAMIC_CANVAS_THEMES_RESEARCH
PASS_TO_PHASE37UIT_DYNAMIC_CANVAS_THEMES_SCOPE_GATE
PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW
PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF

## Forbidden default approvals
Phase 37-uiS must not default-approve BETA_READY, public production readiness, release-readiness upgrade, runtime implementation, Dynamic Canvas Themes runtime, full theme picker runtime, persisted theme preferences, CSS variable theme engine, localStorage writes, sessionStorage writes, account-synced preferences, route behavior changes, event handler changes, package/dependency changes, storage/backup/restore behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, scoring/correctness/scheduler/queue/data changes, telemetry/network calls, sync/cloud/account/auth/backend, or replacement of Phase 37C.

## Recommended next step
Run Phase 37-uiS as Dynamic Canvas Themes Design Gate Only. Any future runtime pilot must be smaller than full Dynamic Canvas Themes and must start with one low-risk surface.
