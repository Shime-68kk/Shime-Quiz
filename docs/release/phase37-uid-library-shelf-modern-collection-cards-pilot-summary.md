# Phase 37-uiD — Library Shelf Modern Collection Cards Pilot Summary
## Status tokens
PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_STATUS: COMPLETED_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_IMPLEMENTATION
PHASE37UID_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_DECISION: READY_FOR_PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW
PHASE37UID_RUNTIME_SCOPE: LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_ONLY_NO_IMPORT_OR_STORAGE_BEHAVIOR_CHANGES
PHASE37UID_SELECTED_EFFECT: LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT
PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED
## Scope
Runtime visual pilot for Library shelf view / Kệ sách của tôi only.
## Current readiness
LIMITED_BETA_CANDIDATE remains the highest approved readiness status. BETA_READY and public production readiness are not approved.
## Runtime result
The Library route gained one passive host class. Scoped CSS gives the shelf a modern collection-card treatment with bookshelf/editorial atmosphere, stronger depth, subtle gradients, borders, glow tokens, hover affordances, focus-visible support, and reduced-motion handling.
## Chosen decision
PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_DECISION: READY_FOR_PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW
## User-facing visual change
The shelf cards now read more like premium learning collections: warmer paper surfaces, calm moss and warm accent gradients, book-spine card accents, elevated stat wells, and clearer topic-pill affordances.
## Evidence summary
Static discovery confirmed `src/routes/Library.jsx` owns the shelf, card grid, tab panels, importStatus toast, raw input state, and workshop tools. The implementation changed only allowed files plus the single Library runtime file.
## Limitations carried forward
No manual screenshot evidence is claimed in this summary. Phase 37-uiE should review actual desktop and 375px mobile rendering.
## What is supported
The scoped Library shelf visual pilot, unit/static checks, CI workflow registration, and validator modes `pr-diff`, `post-merge-main`, and `validator-hotfix`.
## What remains not approved
Phase 37-uiD does not approve BETA_READY. Phase 37-uiD does not approve public production readiness. Phase 37-uiD does not approve broad UI redesign. Phase 37-uiD does not approve full Dynamic Canvas Themes. Phase 37-uiD does not approve a full theme picker. Phase 37-uiD does not approve persisted theme preferences. Phase 37-uiD does not approve localStorage writes. Phase 37-uiD does not approve mutation of the existing theme key. Phase 37-uiD does not approve account-synced preferences. Phase 37-uiD does not approve a global theme system. Phase 37-uiD does not approve sync/cloud/account/auth/backend. Phase 37-uiD does not approve telemetry/network calls. Phase 37-uiD does not approve storage/backup/restore behavior changes. Phase 37-uiD does not approve import/parser behavior changes. Phase 37-uiD does not approve scheduler/FSRS behavior changes. Phase 37-uiD does not approve route behavior changes. Phase 37-uiD does not approve event handler changes. Phase 37-uiD does not approve package/dependency changes. Phase 37-uiD does not change Dashboard, Study Room, BottomNav, Sidebar, App, or main. Phase 37-uiD does not replace Phase 37C Limited Release Readiness Gap Review.
## Validation summary
Validation completed: dependency install passed, Phase 37-uiD validator passed in `pr-diff` mode, build passed with the existing Vite chunk-size warning, unit tests passed with 61 files and 2685 tests, onboarding E2E passed with 3 tests, smoke E2E passed with 7 tests on isolated rerun after a concurrent-port-conflict attempt, and `git diff --check` passed.
## Validator post-merge safety
The validator is post-merge-main-safe from initial implementation. `pr-diff` requires exactly the Phase 37-uiD allowed files, `post-merge-main` allows an empty diff while content checks still run, and `validator-hotfix` allows only the validator file to change.
## Guardrails
No Library tabs, labels, roles, `aria-selected`, `aria-controls`, panel mounting, raw input preservation, `importStatus` visibility, import/workshop tools, parser/import/storage/backup/restore behavior, routes/navigation, event handlers, data model, package/dependency files, sync/backend/auth/telemetry, Dashboard, Study Room, BottomNav, Sidebar, App, main, theme persistence files, or Phase 37C separation were changed.
## Next recommended phase
Next recommended phase: Phase 37-uiE — Library Shelf Modern Collection Cards Evidence Review. Phase 37-uiE is evidence review only and is not automatic runtime implementation.
