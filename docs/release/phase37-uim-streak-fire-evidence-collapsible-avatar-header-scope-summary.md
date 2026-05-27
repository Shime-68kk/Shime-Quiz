# Phase 37-uiM — Streak Fire Evidence and Collapsible Avatar Header Scope Summary
## Status tokens
PHASE37UIM_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW_STATUS: COMPLETED_STREAK_FIRE_EVIDENCE_REVIEW_AND_COLLAPSIBLE_AVATAR_HEADER_SCOPE_GATE
PHASE37UIM_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIM_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_IMPLEMENTATION
PHASE37UIM_REVIEW_SCOPE: STREAK_FIRE_EVIDENCE_REVIEW_AND_COLLAPSIBLE_AVATAR_HEADER_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37UIM_SELECTED_CANDIDATE: COLLAPSIBLE_AVATAR_HEADER_PILOT
PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED
## Scope
Phase 37-uiM is docs/review/research/release/planning/static-validator/CI-only. No runtime source, tests, packages, generated artifacts, storage, scheduler, auth, backend, telemetry, route, handler, form, disabled, scoring, daily goal, streak, or completion logic is changed.
## Current readiness
LIMITED_BETA_CANDIDATE remains the highest approved readiness status. BETA_READY, public production readiness, and release-readiness upgrade are not approved.
## Review result
Phase 37-uiL Streak Fire Ignition Micro-Moment evidence passes for a bounded one-surface visual pilot on the existing Study Room result summary.
## Chosen decision
PHASE37UIM_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_IMPLEMENTATION
## Selected candidate
PHASE37UIM_SELECTED_CANDIDATE: COLLAPSIBLE_AVATAR_HEADER_PILOT
## Evidence accepted
Accepted evidence covers exact success/completion attachment, one-surface containment, passive marker, CSS-only treatment, no new completion state, no streak calculation changes, no daily goal logic changes, no completion logic changes, no scoring/correctness/scheduler/queue/data changes, no storage/localStorage/telemetry writes, no route/navigation changes, no handlers or form submission changes, no disabled behavior changes, reduced-motion fallback, focus-visible preservation, mobile 375px review, desktop review, E2E smoke, E2E onboarding, Phase 37C separation, and no readiness upgrade.
## Limitations carried forward
The Streak Fire pilot remains a narrow visual micro-moment. It does not approve Streak Fire expansion, streak engines, daily goal engines, pressure loops, persistence, telemetry, release readiness, or broad UI redesign.
## Next visual direction
The next visual direction is Collapsible Avatar Header Pilot as a modern app-shell/header identity visual pilot only.
## Collapsible Avatar Header scope
The candidate may explore a compact header/avatar identity visual, app-shell hierarchy polish, or responsive header treatment around existing surfaces. It must remain visual-only and must not become auth, account, profile backend, cloud sync, avatar upload, identity persistence, navigation rewrite, telemetry, or storage work.
## App-shell/header identity guardrails
Any Phase 37-uiN implementation must preserve existing route destinations, navigation semantics, handlers, form behavior, disabled behavior, localStorage, package files, storage/import/parser/scheduler/FSRS/sync/auth/backend/telemetry boundaries, daily goal logic, streak calculation, completion logic, scoring, queue, and data behavior.
## What is supported
Phase 37-uiM supports completed Streak Fire evidence review, a Collapsible Avatar Header scope gate, exact changed-file allowlist validation, no generated artifacts, no active historical validator chain, and validator support for pr-diff, post-merge-main, and validator-hotfix.
## What remains not approved
Phase 37-uiM does not approve BETA_READY, public production readiness, release-readiness upgrade, runtime implementation in Phase 37-uiM, broad UI redesign, Streak Fire expansion, streak calculation changes, daily goal logic changes, completion logic changes, scoring/correctness/scheduler/queue/data changes, route behavior changes, navigation destination changes, event handler changes, button handler changes, form submission changes, disabled state behavior changes, package/dependency changes, storage/backup/restore changes, import/parser changes, scheduler/FSRS changes, sync/cloud/account/auth/backend, profile backend, avatar upload, telemetry/network calls, full Dynamic Canvas Themes, full theme picker, persisted preferences, localStorage writes, Collapsible Avatar Header implementation, or replacement of Phase 37C.
## Validation summary
Required validation for this phase: install, Phase 37-uiM validator, production build, unit tests, E2E smoke, onboarding E2E, and `git diff --check`.
## Validator post-merge safety
The validator supports `pr-diff`, `post-merge-main`, and `validator-hotfix`; it verifies `origin/main` availability, enforces an exact changed-file allowlist, rejects generated artifacts, and does not execute internal git fetch or pull.
## Guardrails
Phase 37C Limited Release Readiness Gap Review remains separate. Phase 37-uiM does not replace release-readiness work and does not approve automatic next runtime implementation beyond the scoped Phase 37-uiN seed.
## Next recommended phase
Phase 37-uiN — Collapsible Avatar Header Pilot.
