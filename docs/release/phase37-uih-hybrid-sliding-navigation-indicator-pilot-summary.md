# Phase 37-uiH — Hybrid Sliding Navigation Indicator Pilot Summary
## Status tokens
PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_STATUS: COMPLETED_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_IMPLEMENTATION
PHASE37UIH_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_DECISION: READY_FOR_PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW
PHASE37UIH_RUNTIME_SCOPE: HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_ONLY_NO_ROUTE_OR_HANDLER_BEHAVIOR_CHANGES
PHASE37UIH_SELECTED_EFFECT: HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT
PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED
## Scope
Runtime visual pilot for the existing Desktop Sidebar and Mobile BottomNav active indicators only.
## Current readiness
Phase 37-uiH confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
## Runtime result
The active navigation item receives a sliding active-pill indicator with calm cream/moss treatment and active icon/text cross-fade.
## Chosen decision
READY_FOR_PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW.
## User-facing visual change
Navigation now moves the active indicator spatially instead of relying on a hard-cut active state.
## Evidence summary
Evidence covers desktop vertical movement, mobile horizontal movement, active readability, focus-visible, reduced-motion, safe-area preservation, 375px no-overflow, and E2E impact.
## Limitations carried forward
Phase 37-uiI must perform evidence review before accepting the pilot as complete for future planning.
## What is supported
Scoped active indicator visual motion and color cross-fade on existing navigation.
## What remains not approved
Phase 37-uiH does not approve BETA_READY.
Phase 37-uiH does not approve public production readiness.
Phase 37-uiH does not approve release-readiness upgrade.
Phase 37-uiH does not approve broad UI redesign.
Phase 37-uiH does not approve broad navigation rewrite.
Phase 37-uiH does not approve route behavior changes.
Phase 37-uiH does not approve event handler changes.
Phase 37-uiH does not approve `NavLink` destination changes.
Phase 37-uiH does not approve router configuration changes.
Phase 37-uiH does not approve active page rendering changes.
Phase 37-uiH does not approve package/dependency changes.
Phase 37-uiH does not approve storage/backup/restore behavior changes.
Phase 37-uiH does not approve import/parser behavior changes.
Phase 37-uiH does not approve scheduler/FSRS behavior changes.
Phase 37-uiH does not approve Study Room scoring/correctness/scheduler/queue/data changes.
Phase 37-uiH does not approve sync/cloud/account/auth/backend.
Phase 37-uiH does not approve telemetry/network calls.
Phase 37-uiH does not approve full Dynamic Canvas Themes.
Phase 37-uiH does not approve full theme picker.
Phase 37-uiH does not approve persisted theme preferences.
Phase 37-uiH does not approve localStorage writes.
Phase 37-uiH does not approve Streak Fire.
Phase 37-uiH does not approve Collapsible Header.
Phase 37-uiH does not replace Phase 37C Limited Release Readiness Gap Review.
## Validation summary
Required validation includes install, Phase 37-uiH validator, build, unit tests, E2E smoke, E2E onboarding, and `git diff --check`.
## Validator post-merge safety
The validator supports `pr-diff`, `post-merge-main`, and `validator-hotfix`, verifies `origin/main` availability, uses an exact changed-file allowlist, has no generated artifacts allowance, has no active historical validator chain, and performs no internal git fetch.
## Guardrails
Phase 37C Limited Release Readiness Gap Review remains separate. Phase 37-uiI is evidence review only and is not automatic runtime implementation.
## Next recommended phase
Next recommended phase: Phase 37-uiI — Hybrid Sliding Navigation Indicator Evidence Review.
