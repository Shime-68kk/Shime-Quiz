# Phase 37-uiD — Library Shelf Modern Collection Cards Pilot Seed
## Status token
PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Purpose
Seed a small, scoped runtime pilot for Library shelf modern collection cards after Phase 37-uiC evidence review. Phase 37-uiD is a runtime pilot only if scoped to Library shelf visual cards.

## Inputs from Phase 37-uiC
Phase 37-uiC accepted Phase 37-uiB Dashboard token preview evidence and selected `LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT` as the next bounded visual candidate.

## Runtime candidate
Library Shelf Modern Collection Cards Pilot.

## User-facing intent
Make Library visually fresher and more modern than previous Library polish while preserving all existing Library behavior and data flow.

## Allowed files / expected areas
Expected Phase 37-uiD areas should be limited to Library shelf visual card rendering, scoped Library shelf CSS/class treatment, focused tests if allowed, evidence docs, release summary, planning seed, validator, and CI registration.

## Forbidden areas
Phase 37-uiD must preserve Library tabs, labels, roles, `aria-selected`, `aria-controls`, panel mounting, raw input preservation, `importStatus`, import tools, parser behavior, file import behavior, storage/backup/restore behavior, routes/navigation, data, package files, sync/backend/auth/telemetry.

It must not touch Study Room, Dashboard, BottomNav, Sidebar, App, main, theme persistence files, or design-system token ownership files unless separately scoped.

It must not implement Dynamic Canvas full theme system, theme picker, persisted preferences, localStorage writes, or global theme system.

## Implementation guidance
The pilot may use stronger card treatment, shelf atmosphere, collection-card depth, subtle gradients, border/glow tokens, modern empty-state framing, and hover/focus affordances. Keep the treatment scoped, reversible, Vietnamese-first, readable, and non-persistent.

## Accessibility, contrast, and reduced-motion requirements
Maintain readable text contrast, visible keyboard focus, and reduced-motion safety. Any hover, shadow, glow, or transition treatment must be acceptable with reduced motion and must not hide focus-visible indicators.

## Mobile and desktop requirements
Collect 375px Library evidence for no horizontal overflow and desktop evidence for clear visual improvement without layout breakage.

## Import, parser, storage, and Library tab restrictions
Do not alter import/workshop reachability, raw input preservation, `importStatus`, import tools, parser behavior, file import behavior, storage/backup/restore behavior, tabs, labels, roles, `aria-selected`, `aria-controls`, or panel mounting.

## Evidence required
Required evidence: 375px Library evidence, desktop evidence, focus-visible evidence, reduced-motion evidence, contrast/readability evidence, import/workshop reachability evidence, e2e smoke, onboarding e2e, and rollback notes.

## Rollback plan
Rollback should remove the scoped Library shelf card host/treatment and restore the previous Library visual presentation without touching data, imports, routes, or storage.

## Decision options
HOLD_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT
NEEDS_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_REWORK
PASS_TO_PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW
PASS_TO_LIBRARY_SHELF_VISUAL_RESEARCH_ONLY

## Forbidden default approvals
Phase 37-uiD must not approve BETA_READY, public production readiness, full Dynamic Canvas Themes, full theme picker, persisted theme preferences, localStorage writes, mutation of the existing theme key, account-synced preferences, global theme system, storage/backup/restore changes, import/parser changes, scheduler/FSRS changes, sync/cloud/account/auth/backend, telemetry/network calls, route behavior changes, event handler changes, package/dependency changes, Study Room correctness/scoring/scheduler/queue/data changes, Streak Fire, Collapsible Header, or release-readiness upgrade.

## Recommended next step
Next recommended phase: Phase 37-uiD — Library Shelf Modern Collection Cards Pilot.
