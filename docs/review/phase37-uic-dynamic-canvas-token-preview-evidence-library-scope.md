# Phase 37-uiC — Dynamic Canvas Token Preview Evidence Review and Library Shelf Modern Cards Scope Gate
## Status tokens
PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW_STATUS: COMPLETED_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW_AND_LIBRARY_SCOPE_GATE
PHASE37UIC_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_IMPLEMENTATION
PHASE37UIC_REVIEW_SCOPE: DYNAMIC_CANVAS_TOKEN_PREVIEW_EVIDENCE_REVIEW_AND_LIBRARY_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37UIC_SELECTED_CANDIDATE: LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT
PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope
Phase 37-uiC is docs/review/research/release/planning/static-validator/CI-only. It reviews the merged Phase 37-uiB Dashboard Dynamic Canvas token preview evidence and gates the next safe visual UI pilot. It makes no runtime behavior changes.

## Inputs from Phase 37-uiB
Inputs reviewed: `docs/testing/phase37-uib-dynamic-canvas-theme-token-preview-pilot-evidence.md`, `docs/release/phase37-uib-dynamic-canvas-theme-token-preview-pilot-summary.md`, the merged Dashboard host class `phase37uib-dynamic-canvas-token-preview`, scoped CSS evidence, unit guard evidence, smoke/onboarding evidence, and the Phase 37-uiB workflow/validator registration.

## UI leadership direction
The product direction is to make the app less boring, more modern, more distinctive, and visually fresher. Phase 37-uiC accepts that direction while preserving the established sequence: scope gate -> small runtime pilot -> evidence review.

## Review method
This review uses Phase 37-uiB docs and static containment evidence, then records a next-candidate comparison. It does not rerun or expand runtime implementation, does not alter source code, and does not treat UI ambition as approval for broad redesign.

## Phase 37-uiB evidence review table
| Review surface | Phase 37-uiB evidence | Review finding | Remaining limitation | Decision impact |
| --- | --- | --- | --- | --- |
| Dashboard scoped host class | `phase37uib-dynamic-canvas-token-preview` exists on the Dashboard top-level `pageStack`. | Accepted as one-surface host containment. | Host is Dashboard-only and does not validate any other surface. | Supports passing uiB evidence. |
| Dashboard-only CSS selector containment | New visual selectors are scoped below `.phase37uib-dynamic-canvas-token-preview`. | Accepted; CSS is not a global theme system. | Future surfaces need separate scoped pilots. | Supports selecting a new Library-only candidate. |
| Visual token-preview treatment | Evidence records canvas wash, panel depth, tab accent, and tokenized preview treatment. | Accepted as visibly stronger than micro-polish while still bounded. | It remains a preview, not full Dynamic Canvas Themes. | Supports modern visual direction. |
| No localStorage writes | Evidence states no `localStorage` writes and the validator checks runtime boundaries. | Accepted. | Future pilots must repeat persistence checks. | Blocks persisted preference scope. |
| No existing theme key mutation | Evidence states no existing `theme` key mutation and no `data-theme` mutation. | Accepted. | Theme ownership remains separate. | Blocks theme persistence expansion. |
| No full theme picker | Evidence states no picker or preference UI was added. | Accepted. | User theme selection remains unapproved. | Blocks full picker work. |
| No persisted preferences | Evidence states no persisted preference, account sync, or storage behavior. | Accepted. | No long-term user preference behavior is proven. | Keeps next pilot non-persistent. |
| No global theme system | Evidence states no global theme system was added. | Accepted. | Dynamic Canvas Themes remain backlog/research only. | Blocks global theme system. |
| Theme ownership files unchanged | `src/ui/theme.js`, `src/boot-guard.js`, and `src/design-system/tokens.css` were unchanged. | Accepted. | Token ownership still needs separate design if expanded later. | Keeps next pilot scoped CSS only. |
| Contrast/readability | Playwright inspection found Dashboard text readable against the new backgrounds. | Accepted for Dashboard pilot evidence. | Not broad contrast certification. | Requires contrast/readability evidence in uiD. |
| Focus-visible | Evidence records visible Dashboard tab focus outline and scoped accent shadow. | Accepted. | Only Dashboard pilot focus was reviewed. | Requires Library focus-visible evidence in uiD. |
| Reduced-motion | Pilot adds no animation; reduced-motion inspection reported near-zero tab transition duration. | Accepted. | Library card effects must include reduced-motion evidence if implemented. | Requires reduced-motion guardrails. |
| 375px Dashboard no-overflow | Mobile 375px inspection reported zero horizontal overflow. | Accepted for Dashboard. | Does not prove Library mobile layout. | Requires 375px Library evidence in uiD. |
| Desktop Dashboard | Desktop inspection found the treatment visible and contained. | Accepted. | Does not prove desktop Library card layout. | Requires desktop Library evidence in uiD. |
| E2E smoke | Phase 37-uiB evidence records smoke e2e passing. | Accepted as no broad route break evidence. | Not release-readiness proof. | Supports continuing UI track. |
| E2E onboarding | Phase 37-uiB evidence records onboarding e2e passing. | Accepted as onboarding unaffected evidence. | Not broad validation. | Supports continuing UI track. |
| Phase 37C separation | Phase 37-uiB states it does not replace Phase 37C Limited Release Readiness Gap Review. | Accepted. | Release-readiness work remains separate. | Prevents readiness upgrade. |
| No readiness upgrade | Phase 37-uiB confirms LIMITED_BETA_CANDIDATE remains highest approved status. | Accepted. | BETA_READY remains unapproved. | Keeps uiC as scope gate only. |

## Dashboard token preview containment review
Phase 37-uiB contained the token preview to Dashboard through the `phase37uib-dynamic-canvas-token-preview` host and scoped CSS. Phase 37-uiC accepts that containment as sufficient for the Dashboard pilot evidence review.

## Persistence and theme-key boundary review
Phase 37-uiB did not add localStorage writes, did not mutate the existing `theme` key, did not set `data-theme`, did not create persisted preferences, and did not add account-synced preferences. Phase 37-uiC carries those boundaries forward.

## Theme ownership boundary review
Theme ownership remains with `src/ui/theme.js`, `src/boot-guard.js`, and `src/design-system/tokens.css`; those files were not changed by Phase 37-uiB. Phase 37-uiC does not approve ownership changes.

## Visual difference review
Phase 37-uiB produced a visible Dashboard change: canvas-like wash, panel separation, tab accenting, and modernized token preview treatment. The review accepts the visual direction as useful, but only as a one-surface pilot result.

## Accessibility, contrast, and focus-visible review
Phase 37-uiB evidence supports Dashboard readability and focus-visible preservation. Phase 37-uiC does not convert that evidence into app-wide accessibility approval; Phase 37-uiD must collect Library-specific contrast/readability and focus-visible evidence.

## Reduced-motion review
Phase 37-uiB did not add animation and preserved reduced-motion safety. Any Phase 37-uiD Library card hover, glow, or depth treatment must include reduced-motion behavior and evidence.

## Mobile 375px and desktop review
Dashboard 375px evidence showed no horizontal overflow, and desktop evidence showed acceptable containment. Phase 37-uiD must repeat 375px and desktop evidence on Library.

## E2E smoke and onboarding review
Phase 37-uiB smoke and onboarding suites passed. Phase 37-uiC accepts this as compatibility evidence for the Dashboard pilot only, not as release-readiness evidence.

## Phase 37C release-readiness separation review
Phase 37C Limited Release Readiness Gap Review remains separate. Phase 37-uiC does not replace Phase 37C and does not approve release-readiness upgrade.

## Next visual candidate comparison table
| Candidate | Visual impact | Risk | Expected implementation size | Decision |
| --- | --- | --- | --- | --- |
| Library Shelf Modern Collection Cards Pilot | High: visible modernization of a core user-facing surface. | Bounded if scoped to Library shelf card visuals only. | Small to medium scoped CSS/runtime host work. | Selected for Phase 37-uiD. |
| Study Room Modern Answer Surface Pilot | High. | Higher because answer correctness, scoring, queue, and scheduler risk are near the surface. | Medium. | Defer. |
| Dashboard Token Preview Expansion | Medium. | Risks widening before evidence cadence finishes. | Medium. | Defer. |
| Library Workshop Import Surface Visual Refresh | Medium. | Higher because import tools, raw input, parser flow, and status states are adjacent. | Medium. | Defer. |
| BottomNav Visual Identity Follow-up | Medium. | Moderate due navigation affordance risk. | Small. | Defer. |
| Full Dynamic Canvas Themes | Very high. | Too high; global theme system and ownership risks. | Large. | Not approved. |
| Full Theme Picker | High. | Too high; preferences and persistence risk. | Large. | Not approved. |
| Persisted Theme Preferences | Medium. | Too high; localStorage/account preference ownership risk. | Medium to large. | Not approved. |
| Streak Fire | Medium. | Product/system meaning unclear and could imply gamification. | Unknown. | Not approved. |
| Collapsible Header | Medium. | Route/layout behavior risk. | Medium. | Not approved. |
| Return To Phase 37C Gap Review First | Low visual impact. | Low. | Docs/review only. | Keep separate, not selected for UI pilot. |

## Selected candidate
PHASE37UIC_SELECTED_CANDIDATE: LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT

## Why Library Shelf Modern Collection Cards Pilot next
Library is a core user-facing surface that can visually catch up after Dashboard without touching import/parser/storage behavior. A shelf/card treatment can be distinctive and modern while remaining scoped, reversible, non-persistent, and evidence-backed.

## Why this is a scope gate, not runtime implementation
Phase 37-uiC creates docs, release summary, planning seed, validator, and workflow registration only. It does not change `src/**`, tests, e2e files, package files, runtime CSS, routes, handlers, storage, import/parser, scheduler, sync, backend, auth, telemetry, or preferences.

## Phase 37-uiD allowed files / expected areas
Phase 37-uiD may be a runtime pilot only if scoped to Library shelf visual cards. Expected areas should be limited to Library shelf rendering and scoped styling, plus focused tests/evidence if separately allowed by the Phase 37-uiD task.

## Phase 37-uiD forbidden areas
Phase 37-uiD must preserve Library tabs, labels, roles, `aria-selected`, `aria-controls`, panel mounting, raw input preservation, `importStatus`, import tools, parser behavior, file import behavior, storage/backup/restore behavior, routes/navigation, data, package files, sync/backend/auth/telemetry, Study Room, Dashboard, BottomNav, Sidebar, App, main, theme persistence files, and design-system token ownership files unless separately scoped.

## Evidence requirements for Phase 37-uiD
Phase 37-uiD evidence must include 375px Library evidence, desktop evidence, focus-visible evidence, reduced-motion evidence, contrast/readability evidence, import/workshop reachability evidence, e2e smoke, onboarding e2e, and rollback notes.

## Rollback / hold plan
If Phase 37-uiD cannot stay scoped to Library shelf cards or cannot preserve Library/import behavior, hold the pilot and return to Library visual research only.

## Chosen review decision
PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_IMPLEMENTATION

## Decision rationale
Phase 37-uiB evidence is sufficient for Dashboard-only containment and non-persistence. Library Shelf Modern Collection Cards is the strongest next bounded visual step because it improves a core surface without requiring storage, import/parser, route, preference, or global theme ownership changes.

## What Phase 37-uiC supports
Phase 37-uiC supports the completed Dashboard token preview evidence review, static CI validation, post-merge-main-safe validator modes `pr-diff`, `post-merge-main`, and `validator-hotfix`, and a Phase 37-uiD Library Shelf Modern Collection Cards Pilot seed.

## What Phase 37-uiC does not approve
Phase 37-uiC confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 37-uiC does not approve BETA_READY.
Phase 37-uiC does not approve public production readiness.
Phase 37-uiC does not approve full Dynamic Canvas Themes.
Phase 37-uiC does not approve full theme picker.
Phase 37-uiC does not approve persisted theme preferences.
Phase 37-uiC does not approve localStorage writes.
Phase 37-uiC does not approve mutation of the existing theme key.
Phase 37-uiC does not approve account-synced preferences.
Phase 37-uiC does not approve a global theme system.
Phase 37-uiC does not approve storage/backup/restore behavior changes.
Phase 37-uiC does not approve import/parser behavior changes.
Phase 37-uiC does not approve scheduler/FSRS behavior changes.
Phase 37-uiC does not approve sync/cloud/account/auth/backend.
Phase 37-uiC does not approve telemetry/network calls.
Phase 37-uiC does not approve route behavior changes.
Phase 37-uiC does not approve event handler changes.
Phase 37-uiC does not approve package/dependency changes.
Phase 37-uiC does not approve Study Room correctness/scoring/scheduler/queue/data changes.
Phase 37-uiC does not approve Streak Fire.
Phase 37-uiC does not approve Collapsible Header.
Phase 37-uiC does not approve release-readiness upgrade.
Phase 37-uiC does not replace Phase 37C Limited Release Readiness Gap Review.

## Next recommended phase
Next recommended phase: Phase 37-uiD — Library Shelf Modern Collection Cards Pilot. Phase 37-uiD is a small runtime pilot and is not automatic broad redesign.
