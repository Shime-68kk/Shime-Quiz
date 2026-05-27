# Phase 37-uiG — Study Room Answer Surface Evidence Review and Hybrid Sliding Navigation Scope Gate

## Status tokens
PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW_STATUS: COMPLETED_STUDY_ROOM_EVIDENCE_REVIEW_AND_HYBRID_NAV_SCOPE_GATE

PHASE37UIG_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_IMPLEMENTATION

PHASE37UIG_REVIEW_SCOPE: STUDY_ROOM_EVIDENCE_REVIEW_AND_HYBRID_NAV_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE37UIG_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT

PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope
Phase 37-uiG is docs/review/research/release/planning/static-validator/CI-only. It reviews the Phase 37-uiF Study Room Modern Answer Surface Pilot and gates one next visual candidate without runtime behavior changes.

## Inputs from Phase 37-uiF and UI plan
Phase 37-uiF merged as a Study Room answer-surface visual pilot with one passive host class, one state data marker, scoped CSS, answer-card state polish, explanation framing, focus-visible support, and reduced-motion support. The UI plan continues to prioritize visible product quality through safe scope gate, small runtime pilot, and evidence review phases.

## UI leadership direction
Every UI phase should improve visible product quality while preserving Shime's calm, Vietnamese-first, learner-owned identity. Runtime expansion must avoid flashy or casino-like effects and must stay scoped to the approved surface.

## Review method
The review used static inspection of Phase 37-uiF files, release evidence, validator coverage, workflow registration, and boundary statements. This phase does not add screenshots or runtime implementation.

## Phase 37-uiF evidence review table
| Evidence row | Phase 37-uiG review |
| --- | --- |
| Study Room passive host class | Accepted: `phase37uif-study-room-modern-answer-surface-pilot` is a passive class on the Study Room answer feedback wrapper. |
| Study Room scoped CSS containment | Accepted: new visual selectors are scoped under `.phase37uif-study-room-modern-answer-surface-pilot`. |
| Modern answer-card visual treatment | Accepted: answer cards, short-answer input, flashcard, and feedback surfaces received scoped modern card treatment. |
| selected answer state | Accepted: selected answer state remains the existing radio/answer path with scoped visual styling only. |
| correct feedback state | Accepted: correct state uses existing feedback state and scoped success surface styling. |
| incorrect feedback state | Accepted: incorrect state uses existing feedback state and scoped danger surface styling. |
| flashcard reveal state | Accepted: reveal state remains owned by existing flashcard reveal logic with scoped visual treatment. |
| explanation visibility | Accepted: explanations remain rendered by existing checked/revealed feedback blocks. |
| scoring correctness preservation | Accepted by patch inspection: scoring helpers and correctness logic were not changed. |
| answer evaluation preservation | Accepted by patch inspection: answer evaluation and checking flow were not changed. |
| queue logic boundary | Accepted by patch inspection: Study Room queue selection was not changed. |
| scheduler/FSRS boundary | Accepted by patch inspection: scheduler and FSRS areas were not changed. |
| question data and stored progress boundary | Accepted by patch inspection: question data and stored progress schema were not changed. |
| contrast/readability | Accepted for static scope: colors remain restrained; Phase 37-uiH should continue visible contrast checks for the next pilot. |
| focus-visible | Accepted: focus-within and focus-visible rules remain explicit in the scoped answer surface. |
| reduced-motion | Accepted: scoped reduced-motion handling is present. |
| 375px Study Room rendering | Accepted as static evidence only: no fixed width was introduced; visual screenshot review remains a carried-forward limitation. |
| desktop Study Room rendering | Accepted as static evidence only: desktop layout remains the existing Study Room stack. |
| E2E smoke | Accepted as required validation path; no E2E specs were changed. |
| E2E onboarding | Accepted as required validation path; no onboarding route behavior was changed. |
| Phase 37C separation | Accepted: Phase 37C Limited Release Readiness Gap Review remains separate. |
| no readiness upgrade | Accepted: LIMITED_BETA_CANDIDATE remains the highest approved readiness status. |

## Study Room visual quality review
The Study Room answer surface has a more premium, calmer card treatment while preserving the existing Study Room structure. The improvement is meaningful enough to pass to the next UI scope gate.

## One-surface containment review
The Phase 37-uiF runtime change is contained to Study Room answer-surface markup and scoped CSS. Phase 37-uiG does not expand that runtime surface.

## Answer state preservation review
Selected, checked, correct, incorrect, and revealed states remain owned by existing Study Room state and handlers. Phase 37-uiG approves no behavior changes.

## Scoring, queue, scheduler, and data boundary review
No scoring/correctness/scheduler/queue/data changes are approved. The evidence supports that Phase 37-uiF stayed visual-only for these boundaries.

## Explanation visibility review
Explanation visibility remains tied to existing checked/revealed feedback rendering. Phase 37-uiG does not approve changes to when explanation content appears.

## Accessibility, contrast, and focus-visible review
Static evidence supports preserved focus-visible affordance and readable state styling. Actual screenshot-based contrast review remains useful for later runtime pilots.

## Reduced-motion review
Phase 37-uiF includes reduced-motion handling for the scoped answer-surface visual treatment. Phase 37-uiH must preserve reduced-motion for any sliding navigation indicator.

## Mobile 375px and desktop review
The Study Room answer-surface pilot does not add fixed widths and remains inside existing layout boundaries. Phase 37-uiG records this as static review, not fresh screenshot proof.

## E2E smoke and onboarding review
Smoke and onboarding E2E suites remain the required end-to-end validation path. This phase changes no E2E specs and no app routes.

## Phase 37C release-readiness separation review
Phase 37C Limited Release Readiness Gap Review remains separate. Phase 37-uiG does not replace Phase 37C and does not upgrade release readiness.

## Hybrid navigation risk review
Hybrid Sliding Navigation Indicator Pilot is higher risk than a single-card surface because it touches global navigation presentation, active state, responsive layout, desktop sidebar orientation, mobile bottom navigation orientation, focus-visible, and reduced-motion. It must not change routes, route matching, `NavLink` destinations, click handlers, page rendering, storage, telemetry, or packages.

## Next visual candidate comparison table
| Candidate | Decision |
| --- | --- |
| Hybrid Sliding Navigation Indicator Pilot | Selected for Phase 37-uiH because it can improve cross-app spatial coherence while staying visual-only if tightly scoped. |
| Premium Elastic Tap Compression Token | Hold; useful, but less broadly visible than navigation. |
| Study Room Visual Backlog Review | Hold; Study Room just received a pilot and evidence review. |
| Dashboard Progress Motion Pilot | Hold; motion risk is higher and less urgent than navigation coherence. |
| Streak Fire Ignition Widget | Not selected; explicitly not approved by this phase. |
| Collapsible Header Scope Gate | Not selected; explicitly not approved by this phase. |
| Full Dynamic Canvas Themes | Not selected; broad theme work remains out of scope. |
| Full Theme Picker | Not selected; persisted preferences remain out of scope. |
| Return To Phase 37C Gap Review First | Not selected; Phase 37C remains separate and is not replaced by this UI gate. |

## Selected candidate
PHASE37UIG_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT

## Why Hybrid Sliding Navigation Indicator Pilot next
Dashboard, Library, and Study Room now have visible modern treatments, but navigation remains a cross-app feel surface. A sliding active-pill indicator can make the product feel more spatially coherent without changing routing when implemented as a scoped visual pilot.

## Why this is a scope gate, not runtime implementation
Phase 37-uiG is evidence review and planning only. The selected candidate needs a separate runtime pilot because navigation touches global UI surfaces and responsive behavior.

## Phase 37-uiH allowed files / expected areas
Phase 37-uiH may touch only the existing navigation presentation areas needed for a small active-indicator pilot, expected around Sidebar/BottomNav styling and the minimal runtime markers needed for the existing active navigation state. Exact files must be declared by the Phase 37-uiH task.

## Phase 37-uiH forbidden areas
Phase 37-uiH must not change route definitions, router config, `NavLink` destinations, click handlers, active route logic, page rendering, data, storage/import/parser, scheduler/FSRS, sync/backend/auth/telemetry, package files, localStorage, Study Room scoring/queue/scheduler/data logic, or generated artifacts.

## Evidence requirements for Phase 37-uiH
Phase 37-uiH must provide desktop navigation evidence, mobile bottom navigation evidence, active indicator movement evidence, active text/icon color evidence, focus-visible evidence, reduced-motion evidence, 375px no-overflow evidence, E2E smoke and onboarding results, and rollback notes.

## Rollback / hold plan
If navigation active-state behavior, route behavior, mobile safe-area behavior, focus-visible, reduced-motion, or 375px layout becomes uncertain, hold the runtime pilot or revert the visual marker/CSS only.

## Chosen review decision
PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_IMPLEMENTATION

## Decision rationale
The Study Room answer-surface pilot evidence is sufficient for a scoped pass, and Hybrid Sliding Navigation Indicator Pilot is the next highest-impact visual candidate that can remain visual-only with tight guardrails.

## What Phase 37-uiG supports
Phase 37-uiG supports `pr-diff`, `post-merge-main`, and `validator-hotfix` validator modes, a Study Room evidence review pass, and a Phase 37-uiH seed for the Hybrid Sliding Navigation Indicator Pilot.

## What Phase 37-uiG does not approve
Phase 37-uiG does not approve BETA_READY, public production readiness, release-readiness upgrade, runtime implementation in Phase 37-uiG, broad UI redesign, route behavior changes, event handler changes, NavLink destination changes, router configuration changes, active page rendering changes, package/dependency changes, storage/backup/restore behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, Study Room scoring/correctness/scheduler/queue/data changes, sync/cloud/account/auth/backend, telemetry/network calls, full Dynamic Canvas Themes, full theme picker, persisted preferences, localStorage writes, Streak Fire, Collapsible Header, replacement of Phase 37C, or generated artifacts.

## Next recommended phase
Phase 37-uiH — Hybrid Sliding Navigation Indicator Pilot.
