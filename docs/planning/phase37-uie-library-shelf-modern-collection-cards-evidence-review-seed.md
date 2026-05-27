# Phase 37-uiE — Library Shelf Modern Collection Cards Evidence Review Seed
## Status token
PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED
## Purpose
Review Phase 37-uiD evidence for the Library shelf modern collection cards pilot before deciding whether to keep, adjust, hold, or backlog follow-up visual work.
## Inputs from Phase 37-uiD
Use the Phase 37-uiD patch, evidence doc, release summary, validator, unit test, workflow registration, and scoped runtime/CSS changes. Confirm the target remains Library shelf view / Kệ sách của tôi with modern collection cards and a bookshelf/editorial atmosphere.
## Review surfaces
Review the Library shelf panel, populated subject cards, empty shelf onboarding state, topic pills, stats, focus-visible states, hover states, mobile 375px layout, desktop layout, reduced-motion behavior, and Workshop import reachability.
## Evidence required
Evidence must cover one-surface containment, no Library tab behavior changes, no panel mounting changes, no raw input preservation changes, importStatus remains visible outside panels, no import/parser/storage behavior changes, contrast/readability, mobile 375px, desktop behavior, reduced-motion, focus-visible, Workshop import reachability, and Phase 37C separation.
## Non-goals
Phase 37-uiE is evidence review only. Phase 37-uiE is not automatic runtime implementation. Do not approve broad UI redesign, Library workshop redesign, import/parser/storage changes, routes/navigation changes, event-handler changes, package/dependency changes, theme persistence, full Dynamic Canvas Themes, full theme picker, BETA_READY, or public production readiness.
## Decision options
- PASS_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_WITH_EVIDENCE
- NEEDS_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_VISUAL_FIXES
- HOLD_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT
- PASS_TO_LIBRARY_VISUAL_BACKLOG_REVIEW
## Forbidden default approvals
Do not default-approve BETA_READY, public production readiness, broad UI redesign, full Dynamic Canvas Themes, theme picker, persisted preferences, localStorage writes, account-synced preferences, sync/cloud/account/auth/backend, telemetry/network calls, storage/backup/restore behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, route behavior changes, event handler changes, package/dependency changes, or Phase 37C replacement.
## Recommended next step
Run Phase 37-uiE as a focused evidence review with actual visual inspection before any next runtime pilot.
