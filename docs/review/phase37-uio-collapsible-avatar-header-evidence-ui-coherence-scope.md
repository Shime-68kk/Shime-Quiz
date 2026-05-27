# Phase 37-uiO — Collapsible Avatar Header Evidence Review and UI Modernization Coherence Scope Gate
## Status tokens
PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_STATUS: COMPLETED_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_AND_UI_COHERENCE_SCOPE_GATE
PHASE37UIO_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIP_UI_MODERNIZATION_COHERENCE_PASS_PILOT_IMPLEMENTATION
PHASE37UIO_REVIEW_SCOPE: COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_AND_UI_COHERENCE_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37UIO_SELECTED_CANDIDATE: UI_MODERNIZATION_COHERENCE_PASS_PILOT
PHASE37UIP_UI_MODERNIZATION_COHERENCE_PASS_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope
Phase 37-uiO is docs/review/research/release/planning/static-validator/CI-only. It reviews the merged Phase 37-uiN Collapsible Avatar Header Pilot and gates exactly one next visual candidate without runtime behavior changes.

## Inputs from Phase 37-uiN and UI plan
Inputs are the merged Phase 37-uiN pilot evidence, the Sidebar/header identity surface, the existing Phase 37 UI modernization sequence, and the carried Phase 37C separation.

## UI leadership direction
The selected direction is to make Dashboard, Library, Study Room, Navigation, tactile actions, completion micro-moment, and Sidebar/header identity feel like one intentional modern product system.

## Review method
The review checked evidence claims, containment, navigation preservation, storage/auth/backend exclusions, responsive behavior, accessibility guardrails, E2E coverage, and release-readiness separation.

## Phase 37-uiN evidence review table
| Evidence row | Result |
| --- | --- |
| Sidebar brand identity passive marker | Accepted as a passive visual marker only. |
| exact header/avatar/sidebar brand attachment | Accepted; attachment remains limited to the Sidebar brand identity surface. |
| scoped cream/moss paper-glass CSS containment | Accepted; treatment remains scoped and visual. |
| no collapse engine | Accepted; no collapse state machine is approved. |
| no scroll listener | Accepted; no scroll-driven behavior is approved. |
| no auth/account/profile backend | Accepted. |
| no account menu | Accepted. |
| no avatar upload | Accepted. |
| no persisted identity | Accepted. |
| no cloud sync | Accepted. |
| no storage/localStorage/sessionStorage writes | Accepted. |
| no telemetry/network calls | Accepted. |
| route definitions unchanged | Accepted. |
| NavLink destinations unchanged | Accepted. |
| active page rendering unchanged | Accepted. |
| Sidebar navigation semantics unchanged | Accepted. |
| BottomNav unchanged | Accepted. |
| package/dependency files unchanged | Accepted. |
| reduced-motion fallback | Accepted. |
| focus-visible unaffected | Accepted. |
| mobile sidebar-hidden behavior | Accepted. |
| 375px no-overflow | Accepted. |
| desktop rendering | Accepted. |
| E2E smoke | Accepted as required evidence. |
| E2E onboarding | Accepted as required evidence. |
| Phase 37C separation | Accepted. |
| no readiness upgrade | Accepted; no BETA_READY approval. |

## Collapsible avatar/header visual quality review
The Phase 37-uiN result adds identity polish without implying account ownership, sign-in, profile editing, cloud identity, or an avatar management flow.

## One-surface containment review
The pilot remains a one-surface containment change. It does not spread header/avatar behavior across Dashboard, Library, Study Room, routes, or global shell logic.

## Header/avatar surface attachment review
The accepted attachment is visual-only and tied to the existing Sidebar/header identity area.

## Route, NavLink, navigation, and page rendering preservation review
Route behavior changes, NavLink/router/page-rendering changes, navigation destination changes, active page rendering changes, event handler changes, and replacement route logic remain out of scope.

## Auth, account, profile, storage, localStorage, sessionStorage, and telemetry preservation review
The evidence preserves auth/account/profile backend boundaries, avatar upload exclusions, sync/cloud/account/auth/backend exclusions, telemetry/network calls exclusions, storage/backup/restore exclusions, and localStorage/sessionStorage writes exclusions.

## Accessibility, contrast, and focus-visible review
Phase 37-uiN remains visual-only and does not replace focus-visible behavior. Phase 37-uiP must preserve focus-visible, contrast, semantic navigation, and keyboard access.

## Reduced-motion review
Reduced-motion fallback remains required. Phase 37-uiP must align motion timing only where already visual and must keep reduced-motion behavior intact.

## Mobile 375px and sidebar-hidden behavior review
Mobile 375px no-overflow and sidebar-hidden behavior remain accepted evidence requirements and must not be regressed by Phase 37-uiP.

## Desktop layout review
Desktop rendering remains accepted. Phase 37-uiP may tune visual coherence but must not alter layout architecture.

## E2E smoke and onboarding review
E2E smoke and E2E onboarding remain required validation checks for the evidence chain.

## Phase 37C release-readiness separation review
Phase 37-uiO does not replace Phase 37C and does not approve BETA_READY, public production readiness, release-readiness upgrade, or a limited release readiness decision.

## UI modernization coherence risk review
The main risk is broad UI redesign creep. Phase 37-uiP must stay visual coherence only and avoid theme system work, preference persistence, new flows, copy rewrites, or data behavior.

## Modernized surface inventory
| Surface | Phase 37 status |
| --- | --- |
| Dashboard visual refresh / Dynamic Canvas token preview | Modernized surface requiring coherence alignment. |
| Library shelf modern collection cards | Modernized surface requiring coherence alignment. |
| Study Room modern answer surface | Modernized surface requiring coherence alignment. |
| Hybrid sliding navigation indicator | Modernized navigation treatment requiring timing and density alignment. |
| Premium elastic tap compression | Modernized tactile action treatment requiring restraint and consistency. |
| Streak Fire ignition micro-moment | Modernized completion micro-moment requiring coherent motion language. |
| Collapsible avatar/header identity surface | Modernized Sidebar/header identity surface requiring product-system alignment. |

## Next visual candidate comparison table
| Candidate row | Decision |
| --- | --- |
| UI Modernization Coherence Pass Pilot | Selected for Phase 37-uiP. |
| UI Backlog Closure Review | Not selected; useful later after coherence pass evidence. |
| Dashboard Progress Motion Pilot | Not selected; narrower and higher motion risk. |
| Study Room Visual Backlog Review | Not selected; narrower than cross-surface coherence. |
| Navigation Visual Backlog Review | Not selected; navigation already has modern treatments to align first. |
| Full Dynamic Canvas Themes | Not selected; too broad and implies theme-system work. |
| Full Theme Picker | Not selected; implies persisted preferences and product scope. |
| Phase 37C Limited Release Readiness Gap Review First | Not selected; Phase 37C remains separate. |

## Selected candidate
PHASE37UIO_SELECTED_CANDIDATE: UI_MODERNIZATION_COHERENCE_PASS_PILOT

## Why UI Modernization Coherence Pass Pilot next
The app now has several strong modern surfaces. The next high-impact move is not another isolated flourish, but visual coherence across already-modernized Phase 37 surfaces.

## Why this is a scope gate, not runtime implementation
Phase 37-uiO does not implement runtime changes. It prepares the Phase 37-uiP implementation seed and static validator only.

## Phase 37-uiP allowed files / expected areas
Phase 37-uiP may touch CSS and at most two runtime files only if passive class alignment is necessary across already-modernized surfaces. Expected areas are visual coherence, surface language, density, border glow, shadow, and motion timing.

## Phase 37-uiP forbidden areas
Forbidden areas include src behavior outside the strict visual pilot, tests/e2e/package churn unless explicitly scoped by Phase 37-uiP, route/navigation implementation, handlers, form submission, disabled behavior, storage/import/parser/scheduler/FSRS/sync/auth/backend/telemetry code, scoring/queue/scheduler/data logic, daily goal logic, streak calculation, completion logic, localStorage/sessionStorage, avatar upload, account/profile backend, and Phase 37C replacement.

## Evidence requirements for Phase 37-uiP
Phase 37-uiP must provide before/after evidence for Dashboard, Library, Study Room, navigation, tactile actions, completion micro-moment, and Sidebar/header identity; mobile 375px; desktop; reduced-motion; focus-visible; contrast; E2E smoke; E2E onboarding; exact touched files; and rollback notes.

## Rollback / hold plan
Hold if coherence work requires route changes, data changes, new preferences, theme picker work, account identity, storage writes, package changes, or broad redesign. Roll back by removing Phase 37-uiP visual classes/CSS and any passive class alignment.

## Chosen review decision
PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIP_UI_MODERNIZATION_COHERENCE_PASS_PILOT_IMPLEMENTATION

## Decision rationale
Phase 37-uiN evidence is accepted and the product has enough modernized surfaces to justify a bounded coherence pass.

## What Phase 37-uiO supports
Phase 37-uiO supports pr-diff, post-merge-main, validator-hotfix, exact changed-file allowlist validation, no generated artifacts, no active historical validator chain, and a Phase 37-uiP visual coherence seed.

## What Phase 37-uiO does not approve
Phase 37-uiO does not approve BETA_READY, public production readiness, release-readiness upgrade, runtime implementation in Phase 37-uiO, broad UI redesign, broad design-system rewrite, full Dynamic Canvas Themes, full theme picker, persisted theme preferences, auth/account/profile backend, avatar upload, cloud identity, storage/backup/restore changes, import/parser changes, scheduler/FSRS changes, scoring/queue/data changes, streak/daily-goal/completion changes, route behavior changes, event handler changes, NavLink/router/page-rendering changes, package changes, localStorage/sessionStorage writes, sync/cloud/account/auth/backend, telemetry/network calls, or replacement of Phase 37C.

## Next recommended phase
Phase 37-uiP — UI Modernization Coherence Pass Pilot.
