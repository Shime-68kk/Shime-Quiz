# Phase 37-uiG — Study Room Evidence Review and Hybrid Navigation Scope Summary

## Status tokens
PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW_STATUS: COMPLETED_STUDY_ROOM_EVIDENCE_REVIEW_AND_HYBRID_NAV_SCOPE_GATE

PHASE37UIG_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_IMPLEMENTATION

PHASE37UIG_REVIEW_SCOPE: STUDY_ROOM_EVIDENCE_REVIEW_AND_HYBRID_NAV_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE37UIG_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT

PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope
Phase 37-uiG is docs/review/research/release/planning/static-validator/CI-only and makes no runtime behavior changes.

## Current readiness
PHASE37UIG_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

## Review result
Phase 37-uiF Study Room Modern Answer Surface Pilot evidence passes for the limited visual scope documented by that phase.

## Chosen decision
PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_IMPLEMENTATION

## Selected candidate
PHASE37UIG_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT

## Evidence accepted
Accepted evidence covers Study Room passive host class, scoped CSS containment, answer-card visual treatment, selected/correct/incorrect/revealed states, explanation visibility, scoring correctness preservation, answer evaluation preservation, queue and scheduler/FSRS boundaries, data boundary, contrast/readability, focus-visible, reduced-motion, 375px and desktop static layout review, E2E smoke path, E2E onboarding path, Phase 37C separation, and no readiness upgrade.

## Limitations carried forward
Phase 37-uiG does not add fresh screenshots, does not approve runtime changes, and does not upgrade release readiness. Actual visual inspection remains required for Phase 37-uiH after runtime implementation.

## Next visual direction
The next visual direction is a tightly scoped Hybrid Sliding Navigation Indicator Pilot focused on a modern sliding active-pill indicator for existing navigation.

## What is supported
Phase 37-uiG supports the Study Room evidence review pass, the Hybrid Sliding Navigation Indicator Pilot seed, workflow registration, and validator modes `pr-diff`, `post-merge-main`, and `validator-hotfix`.

## What remains not approved
Phase 37-uiG does not approve BETA_READY, public production readiness, release-readiness upgrade, runtime implementation in Phase 37-uiG, broad UI redesign, route behavior changes, event handler changes, NavLink destination changes, router configuration changes, active page rendering changes, package/dependency changes, storage/backup/restore behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, Study Room scoring/correctness/scheduler/queue/data changes, sync/cloud/account/auth/backend, telemetry/network calls, full Dynamic Canvas Themes, full theme picker, persisted preferences, localStorage writes, Streak Fire, Collapsible Header, replacement of Phase 37C, or generated artifacts.

## Validation summary
Required validation for handoff: `npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false`, `node scripts/validate-phase37-uig-study-room-evidence-hybrid-nav-scope.js`, `npm run build`, `npm run test:unit`, `npm run test:e2e:smoke`, `npm run test:e2e:onboarding`, and `git diff --check`.

## Validator post-merge safety
The Phase 37-uiG validator is post-merge-main-safe from initial implementation. `pr-diff` requires exactly the Phase 37-uiG allowlisted files, `post-merge-main` allows an empty diff while content checks still run, and `validator-hotfix` allows only the Phase 37-uiG validator file to change.

## Guardrails
The validator checks required files, tokens, allowed decisions, headings, evidence rows, candidate rows, Phase 37-uiH seed content, guardrail statements, workflow registration, exact changed-file allowlist, forbidden paths, no generated artifacts, no active historical validator chain, no internal remote updates, origin/main availability, and the three supported modes.

## Next recommended phase
Phase 37-uiH — Hybrid Sliding Navigation Indicator Pilot.
