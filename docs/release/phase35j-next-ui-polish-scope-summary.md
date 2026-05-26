# Phase 35J — Next UI Polish Scope Summary

## Status tokens

PHASE35J_NEXT_UI_POLISH_SCOPE_STATUS: COMPLETED_NEXT_UI_POLISH_SCOPE_GATE

PHASE35J_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE35J_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION

PHASE35J_REVIEW_SCOPE: NEXT_UI_POLISH_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE35J_SELECTED_CANDIDATE: ELASTIC_BUTTON_COMPRESSION_PILOT

PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope

Phase 35J is docs/research/scope/planning/static-validator/CI-only. It selects one next UI polish candidate for a later implementation phase and does not implement runtime changes.

## Current readiness

Phase 35J confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 35J does not approve BETA_READY. Phase 35J does not approve public production readiness.

## Scope result

Phase 35J compared nine remaining UI polish candidates and selected Elastic Button Compression Pilot as the next small implementation candidate.

## Chosen decision

PHASE35J_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION

## Selected candidate

PHASE35J_SELECTED_CANDIDATE: ELASTIC_BUTTON_COMPRESSION_PILOT

## Decision rationale

Elastic Button Compression Pilot offers visible tactile polish with a small expected implementation surface. It can be scoped to existing primary action/button surfaces, remain dependency-free, avoid behavior-handler and route changes, respect reduced motion, and stay reversible.

## Candidates deferred

Study Room Answer Feedback Polish, Mobile Touch Polish, Accessibility Focus Polish, Dashboard Calm Home Evidence Follow-up Fixes, Hybrid Navigation Indicator Follow-up Fixes, Streak Fire Ignition, Collapsible Header, and Dynamic Canvas Themes are deferred. They are not rejected, but each needs a narrower future scope, additional evidence, or a separate gate before implementation.

## Limitations carried forward

Phase 35J does not add runtime evidence, browser screenshots, broad validation, stress testing, production readiness, data-loss guarantees, cloud/backend/account/sync evidence, telemetry/network evidence, built-in AI/OCR/API-key/BYOK behavior, or package/dependency evidence.

## What is supported

Phase 35J supports a separate Phase 35K implementation candidate for Elastic Button Compression Pilot with narrow target surfaces, no packages, no handler changes, no route changes, no submit behavior changes, no data behavior changes, no pointer event routing changes, reduced-motion fallback, desktop evidence, 375px mobile evidence, quick press/release evidence where practical, and rollback requirements.

## What remains not approved

Phase 35J does not approve broad validation or stress-tested readiness. Phase 35J does not approve guaranteed data-loss prevention. Phase 35J does not approve storage/backup/restore behavior changes. Phase 35J does not approve sync/cloud/account/auth/backend. Phase 35J does not approve telemetry/network calls. Phase 35J does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 35J does not approve route behavior changes. Phase 35J does not approve package/dependency changes. Phase 35J does not approve app-wide Elastic Button Compression. Phase 35J does not approve Study Room answer feedback implementation. Phase 35J does not approve Streak Fire. Phase 35J does not approve Collapsible Header. Phase 35J does not approve Dynamic Canvas Themes implementation.

## Validation summary

Required validation for Phase 35J is `npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false`, `node scripts/validate-phase35j-next-ui-polish-scope.js`, `npm run build`, `npm run test:unit`, `npm run test:e2e:smoke`, `npm run test:e2e:onboarding`, `git diff --check`, and patch apply check against clean `origin/main`.

## Validator post-merge safety

The Phase 35J validator supports `pr-diff`, `post-merge-main`, and `validator-hotfix` modes from initial implementation. It verifies `origin/main` availability but does not run internal `git fetch`, and keeps content, token, claim, workflow, and changed-file checks active.

## Guardrails

No source, test, E2E, route/navigation implementation, storage, backup, restore, import parser, scheduler, FSRS, sync, cloud, account, auth, backend, telemetry, network, data model, Study Room answer logic, or package behavior is changed or approved by Phase 35J.

## Next recommended phase

Next recommended phase: Phase 35K — Elastic Button Compression Pilot Implementation. Phase 35K is a small runtime pilot and is not approval for an app-wide interaction rewrite.
