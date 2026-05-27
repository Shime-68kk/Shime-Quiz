# Phase 37-uiE — Library Shelf Evidence Review and Study Room Modern Answer Surface Scope Gate
## Status tokens
PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_STATUS: COMPLETED_LIBRARY_SHELF_EVIDENCE_REVIEW_AND_STUDY_ROOM_SCOPE_GATE
PHASE37UIE_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_IMPLEMENTATION
PHASE37UIE_REVIEW_SCOPE: LIBRARY_SHELF_EVIDENCE_REVIEW_AND_STUDY_ROOM_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37UIE_SELECTED_CANDIDATE: STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT
PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED
## Scope
Phase 37-uiE is docs/review/research/release/planning/static-validator/CI-only with no runtime behavior changes. It reviews Phase 37-uiD Library shelf evidence and gates one next visual candidate.
## Inputs from Phase 37-uiD and UI plan
Inputs are the Phase 37-uiD evidence doc, release summary, validator, workflow registration, and scoped Library shelf runtime/CSS pilot. The UI plan asks for visible, premium, modern improvements that stay calm, Vietnamese-first, learner-owned, and bounded.
## UI leadership direction
The next pilot should be visibly meaningful, not incremental polish, while avoiding flashy/casino-like interaction. It must preserve logic, data, routing, import, storage, scheduler, FSRS, sync, auth, backend, and telemetry safety.
## Review method
Phase 37-uiE compares Phase 37-uiD evidence against its scope gate, checks containment and guardrails, preserves Phase 37C release-readiness separation, then selects exactly one next bounded visual pilot.
## Phase 37-uiD evidence review table
| Evidence row | Review result |
| --- | --- |
| Library passive host class | Accepted: Phase 37-uiD used one passive Library host class for scoped visual treatment. |
| Library shelf scoped CSS containment | Accepted: selectors were scoped under the uiD host and `#library-panel-shelf`. |
| Modern collection-card visual treatment | Accepted: stronger card depth, editorial shelf atmosphere, spine treatment, and calm accent tokens were documented. |
| One-surface containment | Accepted: the change stayed on the Library shelf surface. |
| Library tab labels | Accepted: `Kệ sách của tôi` and `Xưởng nạp tài liệu` were preserved. |
| Library tab roles | Accepted: tab roles and tablist structure were preserved. |
| aria-selected | Accepted: selected-state semantics were preserved. |
| aria-controls | Accepted: tab-to-panel relationships were preserved. |
| panel mounting | Accepted: both panels remained mounted with hidden-state behavior. |
| raw input preservation | Accepted: raw draft state was not changed. |
| importStatus visibility | Accepted: import status remained outside the panels. |
| Workshop/import reachability | Accepted: Workshop import reachability stayed available. |
| parser behavior | Accepted: no parser behavior changes were included. |
| storage/backup/restore boundary | Accepted: no storage, backup, or restore behavior changes were included. |
| contrast/readability | Accepted for limited beta evidence review; manual visual review remains useful before broader rollout. |
| focus-visible | Accepted: scoped focus-visible treatment and existing global focus behavior were preserved. |
| reduced-motion | Accepted: reduced-motion handling was documented for new transitions. |
| 375px Library rendering | Accepted: mobile containment evidence was documented. |
| desktop Library rendering | Accepted: desktop two-column shelf evidence was documented. |
| populated Library state | Accepted: populated collection-card state was covered. |
| empty Library state | Accepted: empty onboarding card treatment was covered. |
| E2E smoke | Accepted: smoke E2E passed on isolated rerun after a concurrent port conflict. |
| E2E onboarding | Accepted: onboarding E2E passed. |
| Phase 37C separation | Accepted: Phase 37C Limited Release Readiness Gap Review remains separate. |
| no readiness upgrade | Accepted: no BETA_READY or public production readiness upgrade was approved. |
## Library shelf visual quality review
Phase 37-uiD produced a visible modern Library shelf improvement with calmer premium card treatment, editorial depth, and restrained accents. The evidence supports keeping the pilot while avoiding wider Library redesign.
## One-surface containment review
The accepted evidence is limited to Library shelf visual presentation. It does not authorize Workshop/import redesign, navigation changes, or global design-system ownership changes.
## Library tab semantics review
Library tab labels, roles, `aria-selected`, and `aria-controls` remain part of the accepted boundary. Phase 37-uiE does not approve any tab behavior changes.
## Panel mounting, raw input, and importStatus review
Panel mounting, raw input preservation, and `importStatus` placement remain intact according to uiD evidence. These are carried forward as non-negotiable constraints.
## Import, parser, and storage boundary review
Phase 37-uiD evidence shows no import, parser, storage, backup, or restore behavior changes. Phase 37-uiE keeps those areas forbidden.
## Accessibility, contrast, and focus-visible review
The evidence is sufficient for a limited beta candidate review because focus-visible and readable card surfaces were documented. It is not an app-wide accessibility approval.
## Reduced-motion review
Reduced-motion support was documented for the new Library card transitions. Any next pilot must repeat reduced-motion evidence for its own surface.
## Mobile 375px and desktop review
The Library shelf evidence covers both 375px and desktop rendering. Phase 37-uiE does not generalize that evidence to Study Room.
## Workshop import reachability review
Workshop/import reachability remains accepted and unchanged. Phase 37-uiE does not approve import workflow changes.
## E2E smoke and onboarding review
Smoke and onboarding E2E evidence are accepted as merge-gate support for the uiD pilot. Future runtime pilots must provide their own evidence.
## Phase 37C release-readiness separation review
Phase 37C Limited Release Readiness Gap Review remains separate. Phase 37-uiE does not replace Phase 37C and does not approve a release-readiness upgrade.
## Next visual candidate comparison table
| Candidate | Impact | Scope safety | Decision |
| --- | --- | --- | --- |
| Study Room Modern Answer Surface Pilot | High: improves the core learning moment. | Bounded if visual-only on answer surface. | Selected. |
| Study Room Explanation Reveal Polish | Medium-high. | Safe, but narrower than answer surface. | Defer behind selected pilot. |
| Premium Elastic Tap Compression | Medium. | Safe but less visible. | Defer. |
| Hybrid Sliding Navigation Indicator | Medium. | Navigation risk is higher. | Hold. |
| Library Visual Backlog Review | Medium. | Safe but repeats Library focus. | Defer. |
| Dashboard Token Preview Expansion | Medium. | Could drift toward theme system. | Hold. |
| Full Dynamic Canvas Themes | High but broad. | Too much storage/theme risk. | Not approved. |
| Streak Fire Ignition | High pressure. | Conflicts with calm learning direction. | Not approved. |
| Collapsible Header | Medium. | Route/layout risk. | Hold. |
| Return To Phase 37C Gap Review First | Release-focused. | Separate track. | Not selected. |
## Selected candidate
PHASE37UIE_SELECTED_CANDIDATE: STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT
## Why Study Room Modern Answer Surface Pilot next
Study Room is the highest-impact learning surface after Library. A modern answer surface can make answer cards, selection, checking, feedback, and explanation reveal feel more supportive without changing correctness, scoring, queue, scheduler, or data behavior.
## Why this is a scope gate, not runtime implementation
Phase 37-uiE only records the evidence review, decision, release summary, planning seed, validator, and CI gate. It makes no runtime behavior changes.
## Phase 37-uiF allowed files / expected areas
Phase 37-uiF may be a runtime pilot only if scoped to Study Room answer surface visuals and separately allowed by its task. Expected areas may include Study Room answer-card presentation, feedback surface styling, explanation reveal framing, focused evidence, release summary, planning seed, validator, and CI registration.
## Phase 37-uiF forbidden areas
Phase 37-uiF must preserve scoring correctness, answer evaluation, scheduler/FSRS, queue logic, question data, stored progress, routes/navigation, event handlers, package files, sync/backend/auth/telemetry, import/parser/storage, localStorage writes, and persisted preferences.
## Evidence requirements for Phase 37-uiF
Phase 37-uiF evidence must include visual difference, answer-card containment, selected/check/reveal states, explanation reveal framing, scoring preservation, queue/scheduler/data preservation, focus-visible, contrast/readability, reduced-motion, 375px mobile, desktop, E2E smoke, onboarding E2E, and rollback notes.
## Rollback / hold plan
If Study Room answer surface visuals cannot remain visual-only or cannot preserve scoring, queue, scheduler, and data behavior, hold the pilot and return to research-only planning.
## Chosen review decision
PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_IMPLEMENTATION
## Decision rationale
The Library shelf pilot evidence is sufficient for limited beta continuation, and Study Room answer surface is the next highest-impact bounded visual surface.
## What Phase 37-uiE supports
Phase 37-uiE supports the completed Library shelf evidence review, the Study Room Modern Answer Surface Pilot scope gate, static CI validation, and validator modes `pr-diff`, `post-merge-main`, and `validator-hotfix`.
## What Phase 37-uiE does not approve
Phase 37-uiE confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 37-uiE does not approve BETA_READY. Phase 37-uiE does not approve public production readiness. Phase 37-uiE does not approve broad UI redesign. Phase 37-uiE does not approve full Dynamic Canvas Themes. Phase 37-uiE does not approve theme picker. Phase 37-uiE does not approve persisted preferences. Phase 37-uiE does not approve localStorage writes. Phase 37-uiE does not approve existing theme key mutation. Phase 37-uiE does not approve account-synced preferences. Phase 37-uiE does not approve global theme system. Phase 37-uiE does not approve storage/backup/restore changes. Phase 37-uiE does not approve import/parser changes. Phase 37-uiE does not approve scheduler/FSRS changes. Phase 37-uiE does not approve Study Room correctness/scoring/scheduler/queue/data changes. Phase 37-uiE does not approve sync/cloud/account/auth/backend. Phase 37-uiE does not approve telemetry. Phase 37-uiE does not approve route behavior changes. Phase 37-uiE does not approve event handler changes. Phase 37-uiE does not approve package/dependency changes. Phase 37-uiE does not approve Streak Fire. Phase 37-uiE does not approve Collapsible Header. Phase 37-uiE does not replace Phase 37C.
## Next recommended phase
Next recommended phase: Phase 37-uiF — Study Room Modern Answer Surface Pilot.
