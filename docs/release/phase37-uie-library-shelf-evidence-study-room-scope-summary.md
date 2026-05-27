# Phase 37-uiE — Library Shelf Evidence Review and Study Room Scope Summary
## Status tokens
PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_STATUS: COMPLETED_LIBRARY_SHELF_EVIDENCE_REVIEW_AND_STUDY_ROOM_SCOPE_GATE
PHASE37UIE_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_IMPLEMENTATION
PHASE37UIE_REVIEW_SCOPE: LIBRARY_SHELF_EVIDENCE_REVIEW_AND_STUDY_ROOM_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37UIE_SELECTED_CANDIDATE: STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT
PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED
## Scope
Phase 37-uiE is docs/review/research/release/planning/static-validator/CI-only with no runtime behavior changes.
## Current readiness
PHASE37UIE_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
## Review result
Phase 37-uiD Library shelf evidence is accepted for the scoped modern collection cards pilot. Phase 37C Limited Release Readiness Gap Review remains separate.
## Chosen decision
PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_IMPLEMENTATION
## Selected candidate
PHASE37UIE_SELECTED_CANDIDATE: STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT
## Evidence accepted
Accepted evidence includes Library passive host class, scoped shelf CSS containment, modern collection-card treatment, one-surface containment, tab labels and roles, `aria-selected`, `aria-controls`, panel mounting, raw input preservation, `importStatus` visibility, Workshop/import reachability, parser and storage boundaries, contrast/readability, focus-visible, reduced-motion, 375px and desktop rendering, populated and empty Library states, E2E smoke, onboarding E2E, Phase 37C separation, and no readiness upgrade.
## Limitations carried forward
Library evidence does not approve broad Library redesign, app-wide accessibility approval, production readiness, Study Room behavior changes, import/parser/storage changes, or route/navigation changes.
## Next visual direction
Study Room answer cards and feedback should feel more modern, calm, and supportive, with guided explanation reveal and no scoring, scheduler, queue, data, or correctness changes.
## What is supported
Phase 37-uiE supports the Library shelf evidence review, Study Room Modern Answer Surface Pilot seed, workflow registration, and post-merge-safe static validation.
## What remains not approved
Phase 37-uiE confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 37-uiE does not approve BETA_READY. Phase 37-uiE does not approve public production readiness. Phase 37-uiE does not approve release-readiness upgrade. Phase 37-uiE does not approve broad UI redesign. Phase 37-uiE does not approve full Dynamic Canvas Themes. Phase 37-uiE does not approve theme picker. Phase 37-uiE does not approve persisted preferences. Phase 37-uiE does not approve localStorage writes. Phase 37-uiE does not approve existing theme key mutation. Phase 37-uiE does not approve account-synced preferences. Phase 37-uiE does not approve global theme system. Phase 37-uiE does not approve storage/backup/restore changes. Phase 37-uiE does not approve import/parser changes. Phase 37-uiE does not approve scheduler/FSRS changes. Phase 37-uiE does not approve Study Room correctness/scoring/scheduler/queue/data changes. Phase 37-uiE does not approve sync/cloud/account/auth/backend. Phase 37-uiE does not approve telemetry. Phase 37-uiE does not approve route behavior changes. Phase 37-uiE does not approve event handler changes. Phase 37-uiE does not approve package/dependency changes. Phase 37-uiE does not approve Streak Fire. Phase 37-uiE does not approve Collapsible Header. Phase 37-uiE does not replace Phase 37C.
## Validation summary
Required validation for handoff: dependency install, Phase 37-uiE validator, build, unit tests, smoke E2E, onboarding E2E, and `git diff --check`.
## Validator post-merge safety
The validator supports `pr-diff`, `post-merge-main`, and `validator-hotfix`. It checks `origin/main` availability, changed-file allowlist, forbidden paths, required docs, tokens, headings, evidence rows, candidate rows, seed content, guardrails, workflow registration, no generated artifacts, no full historical validator chain, and no internal remote update.
## Guardrails
No runtime files, source tests, E2E files, package files, generated artifacts, import/parser/storage/scheduler/FSRS/sync/auth/backend/telemetry code, route/navigation implementation, or Study Room answer/scoring/queue/scheduler/data logic are approved by this phase.
## Next recommended phase
Next recommended phase: Phase 37-uiF — Study Room Modern Answer Surface Pilot.
