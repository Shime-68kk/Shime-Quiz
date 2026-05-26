# Phase 35G — Next UI Polish Scope Summary

## Status tokens

PHASE35G_NEXT_UI_POLISH_SCOPE_STATUS: COMPLETED_NEXT_UI_POLISH_SCOPE_GATE

PHASE35G_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE35G_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35H_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION

PHASE35G_REVIEW_SCOPE: NEXT_UI_POLISH_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE35G_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR

PHASE35H_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope

Phase 35G is docs/research/scope/planning/static-validator/CI-only. It selects one next UI polish candidate for a later phase and does not implement runtime changes.

## Current readiness

Phase 35G confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

## Scope result

Phase 35G compared six candidate polish tracks and selected Hybrid Sliding Navigation Indicator as the next small implementation candidate.

## Chosen decision

PHASE35G_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35H_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION

## Selected candidate

PHASE35G_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR

## Decision rationale

Hybrid Sliding Navigation Indicator offers visible app shell polish with a small expected implementation surface. It can likely reuse existing active navigation state, avoid route behavior changes, preserve semantics, respect reduced motion, and remain reversible.

## Candidates deferred

Elastic Button Compression, Study Room Answer Feedback Polish, Dashboard Calm Home Evidence Follow-up Fixes, Mobile Touch Polish, and Accessibility Focus Polish are deferred. They are not rejected, but each needs a narrower future scope or additional evidence before implementation.

## Limitations carried forward

Phase 35G does not add runtime evidence, browser screenshots, broad validation, stress testing, production readiness, data-loss guarantees, cloud/backend/account/sync evidence, or package/dependency evidence.

## What is supported

Phase 35G supports a separate Phase 35H implementation candidate for Hybrid Sliding Navigation Indicator with focused desktop, 375px mobile, accessibility, reduced-motion, validation, evidence, and rollback requirements.

## What remains not approved

Phase 35G does not approve BETA_READY. Phase 35G does not approve public production readiness. Phase 35G does not approve broad validation or stress-tested readiness. Phase 35G does not approve guaranteed data-loss prevention. Phase 35G does not approve storage/backup/restore behavior changes. Phase 35G does not approve sync/cloud/account/auth/backend. Phase 35G does not approve telemetry/network calls. Phase 35G does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 35G does not approve route behavior changes. Phase 35G does not approve package/dependency changes. Phase 35G does not approve Elastic Button Compression implementation. Phase 35G does not approve Study Room polish. Phase 35G does not approve Streak Fire. Phase 35G does not approve Collapsible Header. Phase 35G does not approve Dynamic Canvas Themes implementation.

## Validation summary

Required validation for Phase 35G is the Phase 35G validator, build, unit tests, smoke e2e, onboarding e2e, whitespace check, and patch apply check against clean `origin/main`.

## Validator post-merge safety

The Phase 35G validator supports `pr-diff`, `post-merge-main`, and `validator-hotfix` modes from initial implementation. It verifies `origin/main` availability but does not run internal `git fetch`.

## Guardrails

No source, test, E2E, route/navigation implementation, storage, backup, restore, import parser, scheduler, FSRS, sync, cloud, account, auth, backend, telemetry, network, data model, or package behavior is changed or approved by Phase 35G.

## Next recommended phase

Next recommended phase: Phase 35H — Hybrid Navigation Indicator Implementation. Phase 35H is a small runtime candidate and is not approval for broad navigation rewrite.
