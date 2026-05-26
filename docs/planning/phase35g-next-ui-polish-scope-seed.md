# Phase 35G — Next UI Polish Scope Seed

## Status token

PHASE35G_NEXT_UI_POLISH_SCOPE_SEED_STATUS: PREPARED_SCOPE_SEED

## Purpose

Prepare a planning-only scope gate for selecting at most one small next UI polish candidate after Phase 35F evidence review.

## Inputs from Phase 35F

- Phase 35F Dashboard Calm Home evidence review.
- Phase 35F release summary.
- Phase 35F validator result.
- Carry-forward guardrails that keep LIMITED_BETA_CANDIDATE as the highest approved readiness status.

## Candidate polish backlog

- Hybrid Sliding Navigation Indicator
- Elastic Button Compression
- Study Room Answer Feedback Polish
- Dashboard Calm Home Evidence Follow-up Fixes
- Mobile Touch Polish
- Accessibility Focus Polish

## Selection rules

Select only one small candidate for a later implementation phase, or hold. Require documented user-facing intent, affected files, rollback plan, accessibility evidence, mobile evidence, reduced-motion evidence, and test impact before implementation approval.

## Evidence required before implementation

Any selected candidate needs a scoped implementation brief, explicit allowed files, forbidden areas, focused validation commands, and claim guardrails. Evidence must be gathered before claiming readiness beyond LIMITED_BETA_CANDIDATE.

## Non-goals

Phase 35G is a scope gate and is not automatic runtime implementation. It does not approve broad Dashboard redesign, Navigation indicator implementation, Elastic Button Compression implementation, Study Room polish, Streak Fire, Collapsible Header, Dynamic Canvas Themes implementation, storage/backup/restore behavior changes, sync/cloud/account/auth/backend, telemetry/network calls, or built-in AI/OCR/API-key/BYOK behavior.

## Decision options

HOLD_NEXT_UI_POLISH_SCOPE

NEEDS_NEXT_UI_POLISH_RESEARCH

PASS_TO_ONE_SMALL_UI_POLISH_IMPLEMENTATION

## Forbidden default approvals

Phase 35G must not default-approve BETA_READY, public production readiness, broad validation, stress-tested readiness, guaranteed data-loss prevention, storage/backup/restore behavior changes, sync/cloud/account/auth/backend behavior, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, or any runtime polish candidate without a separate scoped implementation phase.

## Recommended next step

Next recommended phase: Phase 35G — Next UI Polish Scope Gate. Choose hold, research, or one small UI polish candidate; do not implement runtime changes in the scope gate itself.
