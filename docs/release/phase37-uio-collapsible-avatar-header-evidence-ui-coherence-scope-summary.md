# Phase 37-uiO — Collapsible Avatar Header Evidence Review and UI Coherence Scope Summary
## Status tokens
PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_STATUS: COMPLETED_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_AND_UI_COHERENCE_SCOPE_GATE
PHASE37UIO_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIP_UI_MODERNIZATION_COHERENCE_PASS_PILOT_IMPLEMENTATION
PHASE37UIO_REVIEW_SCOPE: COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_AND_UI_COHERENCE_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37UIO_SELECTED_CANDIDATE: UI_MODERNIZATION_COHERENCE_PASS_PILOT
PHASE37UIP_UI_MODERNIZATION_COHERENCE_PASS_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope
Phase 37-uiO is docs/review/research/release/planning/static-validator/CI-only and contains no runtime behavior changes.

## Current readiness
The current readiness remains LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED.

## Review result
Phase 37-uiN Collapsible Avatar Header evidence is accepted with its visual-only boundaries intact.

## Chosen decision
PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIP_UI_MODERNIZATION_COHERENCE_PASS_PILOT_IMPLEMENTATION

## Selected candidate
UI_MODERNIZATION_COHERENCE_PASS_PILOT.

## Evidence accepted
Accepted evidence includes Sidebar brand identity passive marker, exact header/avatar/sidebar brand attachment, scoped cream/moss paper-glass CSS containment, no collapse engine, no scroll listener, no auth/account/profile backend, no account menu, no avatar upload, no persisted identity, no cloud sync, no storage/localStorage/sessionStorage writes, no telemetry/network calls, route definitions unchanged, NavLink destinations unchanged, active page rendering unchanged, Sidebar navigation semantics unchanged, BottomNav unchanged, package/dependency files unchanged, reduced-motion fallback, focus-visible unaffected, mobile sidebar-hidden behavior, 375px no-overflow, desktop rendering, E2E smoke, E2E onboarding, Phase 37C separation, and no readiness upgrade.

## Limitations carried forward
No runtime implementation, route behavior changes, handlers, form submission changes, disabled behavior changes, package changes, localStorage/sessionStorage writes, auth/profile/backend, telemetry/network calls, or Phase 37C replacement are approved.

## Next visual direction
The next visual direction is a bounded UI Modernization Coherence Pass Pilot across already-modernized Phase 37 surfaces.

## Modernized surface inventory
Dashboard visual refresh / Dynamic Canvas token preview; Library shelf modern collection cards; Study Room modern answer surface; Hybrid sliding navigation indicator; Premium elastic tap compression; Streak Fire ignition micro-moment; Collapsible avatar/header identity surface.

## UI coherence guardrails
Align surface language, density, border glow, shadow, and motion timing. Do not redesign flows, change copy, change layout architecture, add themes, add preferences, or create a broad design-system rewrite.

## What is supported
Phase 37-uiO supports pr-diff, post-merge-main, validator-hotfix, exact changed-file allowlist enforcement, workflow registration, and a Phase 37-uiP implementation seed.

## What remains not approved
Phase 37-uiO does not approve BETA_READY, public production readiness, release-readiness upgrade, runtime implementation in Phase 37-uiO, broad UI redesign, broad design-system rewrite, full Dynamic Canvas Themes, full theme picker, persisted theme preferences, auth/account/profile backend, avatar upload, cloud identity, storage/backup/restore changes, import/parser changes, scheduler/FSRS changes, scoring/queue/data changes, streak/daily-goal/completion changes, route behavior changes, event handler changes, NavLink/router/page-rendering changes, package changes, localStorage/sessionStorage writes, sync/cloud/account/auth/backend, telemetry/network calls, or replacement of Phase 37C.

## Validation summary
Required validation is npm ci, Phase 37-uiO validator, build, unit tests, E2E smoke, E2E onboarding, and git diff --check.

## Validator post-merge safety
The validator supports pr-diff, post-merge-main, and validator-hotfix modes, checks origin/main availability without internal git fetch, rejects generated artifacts, and rejects any active historical validator chain.

## Guardrails
Guardrails preserve docs-only scope, no generated artifacts, no full historical validator chain, no shell git fetch step in workflow, and exact changed-file allowlist behavior.

## Next recommended phase
Phase 37-uiP — UI Modernization Coherence Pass Pilot.
