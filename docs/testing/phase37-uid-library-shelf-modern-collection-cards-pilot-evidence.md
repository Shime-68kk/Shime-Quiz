# Phase 37-uiD — Library Shelf Modern Collection Cards Pilot Evidence
## Status tokens
PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_STATUS: COMPLETED_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_IMPLEMENTATION
PHASE37UID_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_DECISION: READY_FOR_PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW
PHASE37UID_RUNTIME_SCOPE: LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_ONLY_NO_IMPORT_OR_STORAGE_BEHAVIOR_CHANGES
PHASE37UID_SELECTED_EFFECT: LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT
PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED
## Scope
Phase 37-uiD implements a runtime visual pilot for one surface only: Library shelf view / Kệ sách của tôi. It is not a broad UI redesign and it does not change import/parser/storage behavior.
## Inputs from Phase 37-uiC and UI plan
Phase 37-uiC selected `LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT` and passed it to Phase 37-uiD. The UI plan asked for a visible, modern, premium Library treatment with modern collection cards and a bookshelf/editorial atmosphere.
## Library ownership discovery
`src/routes/Library.jsx` owns the Library route, the `libraryTab` state, both tab panels, raw input state, import handlers, workshop tools, subject cards, empty shelf onboarding card, and the `importStatus` toast. Shelf/card host classes are `librarySubjectGrid`, `libraryCardBody`, `libraryStats`, `topicPill`, and `libraryEmptyOnboardingCard`. CSS-only was enough for most treatment; one passive host class was added to `src/routes/Library.jsx`.
## Implementation summary
Added `phase37uid-library-shelf-modern-collection-cards-pilot` to the Library `pageStack`. Added scoped CSS tokens and selectors in `src/styles/global.css` for shelf-panel depth, editorial paper gradients, collection-card spines, improved stat surfaces, topic-pill affordances, focus-visible shadow, mobile containment, and reduced-motion handling.
## Changed files
- `.github/workflows/e2e-smoke.yml`
- `src/routes/Library.jsx`
- `src/styles/global.css`
- `tests/unit/libraryShelfModernCollectionCardsPilot.test.jsx`
- `docs/testing/phase37-uid-library-shelf-modern-collection-cards-pilot-evidence.md`
- `docs/release/phase37-uid-library-shelf-modern-collection-cards-pilot-summary.md`
- `docs/planning/phase37-uie-library-shelf-modern-collection-cards-evidence-review-seed.md`
- `scripts/validate-phase37-uid-library-shelf-modern-collection-cards-pilot.js`
## Targeted surface
Only `#library-panel-shelf` under the Phase 37-uiD Library host class is visually reframed. Workshop/import panels remain reachable and structurally unchanged.
## Visual difference summary
The shelf now has a warmer editorial container, subtle moss/warm accent gradients, deeper collection-card shadows, a book-spine accent, calmer elevated stats, and clearer hover/focus affordances. The effect is stronger than micro-polish but remains restrained.
## One-surface containment review
All new selectors are scoped under `.phase37uid-library-shelf-modern-collection-cards-pilot`. No Dashboard, Study Room, BottomNav, Sidebar, App, main, route, or navigation behavior was changed.
## Library tab semantics preservation
Tabs keep the same labels, roles, `aria-selected`, `aria-controls`, `libraryTabList phase36e-library-tabs-touch-pilot` class, and click handlers.
## Panel mounting and raw input preservation
Both `libraryTabPanel` nodes remain mounted with the same `hidden={libraryTab !== ...}` behavior. `textDraft` and `aiPromptSource` remain in `Library.jsx`.
## importStatus visibility review
`importStatus ? <Toast ... />` remains outside both tab panels and after the workshop panel, preserving visibility after import actions.
## Import, parser, and storage preservation
No import handlers, parser modules, storage modules, backup/restore modules, data model code, or package/dependency files were changed.
## Accessibility and contrast evidence
The card treatment keeps dark moss text on light paper surfaces, uses borders plus shadow rather than color-only distinction, and preserves existing button, badge, and tab semantics.
## Focus-visible evidence
The pilot adds scoped `topicPill:focus-visible` shadow while preserving the global Phase 36H focus-visible outline rules.
## Reduced-motion evidence
The CSS includes a scoped reduced-motion rule that disables new card and topic-pill transitions when `prefers-reduced-motion: reduce` is active.
## Mobile 375px evidence
The scoped mobile rule at `max-width: 560px` reduces shelf padding and card radius. Existing one-column grid behavior at smaller widths remains unchanged.
## Desktop evidence
The desktop shelf keeps the existing two-column `librarySubjectGrid` and adds depth, card spine, hover lift, and editorial panel atmosphere under the scoped host class.
## Workshop import reachability evidence
The workshop tab remains mounted with the same label and click handler. Existing import buttons and file inputs were not edited.
## E2E impact
The workflow now runs the Phase 37-uiD validator as the active phase gate while retaining Phase 37-uiC as historical reference. Existing smoke and onboarding E2E commands remain unchanged.
## Forbidden system change review
No package files, e2e files, parser/import/storage/backup/restore/scheduler/FSRS/sync/auth/backend/telemetry files, theme persistence files, Dashboard, Study Room, BottomNav, Sidebar, App, or main were changed.
## Phase 37C separation review
Phase 37C Limited Release Readiness Gap Review remains separate. Phase 37-uiD does not upgrade readiness.
## Claim guardrail review
Phase 37-uiD confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 37-uiD does not approve BETA_READY. Phase 37-uiD does not approve public production readiness. Phase 37-uiD does not approve broad UI redesign. Phase 37-uiD does not approve full Dynamic Canvas Themes. Phase 37-uiD does not approve a full theme picker. Phase 37-uiD does not approve persisted theme preferences. Phase 37-uiD does not approve localStorage writes. Phase 37-uiD does not approve mutation of the existing theme key. Phase 37-uiD does not approve account-synced preferences. Phase 37-uiD does not approve a global theme system. Phase 37-uiD does not approve sync/cloud/account/auth/backend. Phase 37-uiD does not approve telemetry/network calls. Phase 37-uiD does not approve storage/backup/restore behavior changes. Phase 37-uiD does not approve import/parser behavior changes. Phase 37-uiD does not approve scheduler/FSRS behavior changes. Phase 37-uiD does not approve route behavior changes. Phase 37-uiD does not approve event handler changes. Phase 37-uiD does not approve package/dependency changes. Phase 37-uiD does not change Dashboard, Study Room, BottomNav, Sidebar, App, or main. Phase 37-uiD does not replace Phase 37C Limited Release Readiness Gap Review.
## Validation summary
Validation completed: `npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false` passed, `node scripts/validate-phase37-uid-library-shelf-modern-collection-cards-pilot.js` passed in `pr-diff` mode, `npm run build` passed with the existing Vite chunk-size warning, `npm run test:unit` passed with 61 files and 2685 tests, `npm run test:e2e:onboarding` passed with 3 tests, `npm run test:e2e:smoke` passed with 7 tests on isolated rerun after a concurrent-port-conflict attempt, and `git diff --check` passed.
## Risks and follow-up
Risk remains that visual evidence should be reviewed manually for exact perceived premium quality, contrast, and mobile density before any follow-up visual expansion.
## Decision
PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_DECISION: READY_FOR_PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW
## What Phase 37-uiD supports
Phase 37-uiD supports the scoped Library shelf modern collection cards pilot, static/unit validation, CI registration, and validator modes `pr-diff`, `post-merge-main`, and `validator-hotfix`.
## What Phase 37-uiD does not approve
Phase 37-uiD does not approve broader Library redesign, workshop/import redesign, route or event-handler changes, import/parser/storage changes, theme persistence, full Dynamic Canvas Themes, BETA_READY, or public production readiness.
## Next recommended phase
Next recommended phase: Phase 37-uiE — Library Shelf Modern Collection Cards Evidence Review. Phase 37-uiE is evidence review only and is not automatic runtime implementation.
