# Phase 35M — Next UI Polish Scope Gate

## Status tokens

PHASE35M_NEXT_UI_POLISH_SCOPE_STATUS: COMPLETED_NEXT_UI_POLISH_SCOPE_GATE

PHASE35M_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE35M_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35N_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_IMPLEMENTATION

PHASE35M_REVIEW_SCOPE: NEXT_UI_POLISH_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE35M_SELECTED_CANDIDATE: STUDY_ROOM_ANSWER_FEEDBACK_POLISH

PHASE35N_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope

Phase 35M is a docs/research/scope/planning/static-validator/CI-only scope gate. It compares remaining UI polish candidates and selects exactly one small next runtime candidate for Phase 35N. It does not implement runtime UI, source code, unit tests, E2E specs, package changes, storage/backup/restore behavior, import/parser behavior, scheduler/FSRS behavior, sync/cloud/account/auth/backend behavior, telemetry, route behavior, data model changes, or Study Room answer logic changes.

## Inputs from Phase 35L

PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW_STATUS: COMPLETED_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW

PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE35M_NEXT_UI_POLISH_SCOPE

PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_SCOPE_STATUS: ELASTIC_BUTTON_COMPRESSION_PILOT_REVIEWED_AND_CARRIED_FORWARD

PHASE35L_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

Phase 35L confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

## Candidate comparison method

The comparison favors a small, reversible, dependency-free UI polish candidate with high learner value, narrow implementation surface, explicit accessibility and reduced-motion constraints, mobile evidence requirements, and clear exclusions for learning-critical logic.

## Candidate comparison table

| Candidate | User value | Expected implementation size | Risk | Mobile/accessibility impact | Decision |
| --- | --- | --- | --- | --- | --- |
| Study Room Answer Feedback Polish | High: improves clarity at the learning moment. | Small if limited to existing answer-result visuals. | Medium because Study Room logic is learning-critical. | High positive impact if feedback remains readable, calm, keyboard-safe, and reduced-motion aware. | Selected for Phase 35N as visual feedback only. |
| Mobile Touch Polish | Medium: improves comfort on smaller screens. | Medium because it can span multiple surfaces. | Medium due to broad touch target and layout interactions. | High, but needs separate inventory before edits. | Deferred. |
| Accessibility Focus Polish | Medium-high: improves keyboard and visible focus clarity. | Medium because it can span app-wide controls. | Medium due to possible style regressions across surfaces. | High, but needs dedicated focus inventory. | Deferred. |
| Elastic Button Compression Pilot Follow-up Fixes | Medium if Phase 35L evidence reveals defects. | Small if fixes are targeted. | Low-medium. | Medium. | Deferred because Phase 35L carried the pilot forward without requiring immediate fixes. |
| Hybrid Navigation Indicator Follow-up Fixes | Medium if evidence reveals defects. | Small-medium. | Medium due to navigation surface sensitivity. | Medium. | Deferred; no immediate follow-up is selected. |
| Dashboard Calm Home Evidence Follow-up Fixes | Medium if evidence reveals defects. | Small-medium. | Low-medium. | Medium. | Deferred; no immediate follow-up is selected. |
| Streak Fire Ignition | Low-medium near term; may increase pressure. | Medium. | High due to gamified pressure and possible attention cost. | Medium, with reduced-motion and distraction risks. | Deferred. |
| Collapsible Header | Medium. | Medium-high because it may affect layout and navigation rhythm. | High due to scroll/layout interactions. | Medium-high. | Deferred. |
| Dynamic Canvas Themes | Low-medium near term personalization value. | High due to state/theme safety. | High due to persistent preference and broad visual changes. | Medium-high. | Deferred. |

## Selected candidate

PHASE35M_SELECTED_CANDIDATE: STUDY_ROOM_ANSWER_FEEDBACK_POLISH

The selected Phase 35N candidate is Study Room Answer Feedback Polish.

## Why Study Room Answer Feedback Polish first

Study Room Answer Feedback Polish completes the core UI plan after Library structure, Dashboard calm home, Hybrid Sliding Navigation Indicator, and Elastic Button Compression Pilot work. It targets the learning moment directly, where calm visual clarity can help learners understand the current answer result without changing correctness, scoring, scheduling, queue progression, persistence, card selection, routing, or submission behavior.

## Why this is visual feedback only

Phase 35N must only polish how existing answer states are visually presented. It must preserve existing answer submission handlers, existing result data, answer correctness, scoring, scheduler/FSRS behavior, queue progression, data persistence, card selection, and Study Room routing. It must not introduce confetti, sound, particles, 3D card flip, casino-like feedback, telemetry, packages, or persistence changes.

## Phase 35N allowed files / expected areas

Phase 35N may inspect Study Room UI implementation files and may make a narrow runtime visual feedback change only if its own phase scope explicitly permits those files. Expected areas are component-local Study Room rendering and CSS/class additions around existing answer result states. Any Phase 35N implementation must document the exact file allowlist before runtime work begins.

## Phase 35N forbidden areas

Phase 35N must not change answer correctness, scoring, scheduler/FSRS, queue progression, data persistence, card selection, Study Room routing, answer submission handlers, storage/backup/restore, import/parser/database/prompt systems, sync/cloud/account/auth/backend, telemetry/network calls, package files, data model files, or built-in AI/OCR/API-key/BYOK behavior.

## Accessibility and reduced-motion requirements

Phase 35N must preserve keyboard operation and focus visibility. Any visual feedback must remain legible without relying on color alone and must include reduced-motion fallback. Motion, if any, must be subtle, brief, and disabled or replaced with non-spatial feedback under `prefers-reduced-motion: reduce`.

## Mobile and touch requirements

Phase 35N must include 375px mobile evidence. Visual feedback must not cause horizontal overflow, layout jumping, clipped answer text, blocked controls, or smaller touch targets.

## Risk assessment

The main risk is accidentally changing Study Room learning logic while polishing answer feedback. The Phase 35N scope must therefore be limited to visual presentation around existing states and must include evidence that correctness, scoring, scheduler/FSRS behavior, queue progression, persistence, card selection, routing, and answer submission handlers remain unchanged.

## Rollback plan for Phase 35N

Phase 35N rollback should remove only the visual feedback CSS/class/rendering additions and restore prior Study Room presentation. Because Phase 35N must avoid data and logic changes, rollback should not require storage migration, dependency rollback, scheduler changes, or data repair.

## Chosen scope decision

PHASE35M_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35N_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_IMPLEMENTATION

## Decision rationale

Study Room Answer Feedback Polish has the strongest learner-facing value among remaining small candidates and can be constrained as a calm visual feedback improvement. Broader mobile, accessibility, header, theme, and gamified polish candidates remain deferred because they require larger inventories or carry higher cross-surface risk.

## What Phase 35M supports

Phase 35M supports preparing Phase 35N as a small runtime visual feedback candidate only. Next recommended phase: Phase 35N — Study Room Answer Feedback Polish Implementation.

Phase 35N is a small runtime visual feedback candidate and is not approval for Study Room logic changes.

## What Phase 35M does not approve

Phase 35M does not approve BETA_READY. Phase 35M does not approve public production readiness. Phase 35M does not approve broad validation or stress-tested readiness. Phase 35M does not approve guaranteed data-loss prevention. Phase 35M does not approve storage/backup/restore behavior changes. Phase 35M does not approve sync/cloud/account/auth/backend. Phase 35M does not approve telemetry/network calls. Phase 35M does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 35M does not approve route behavior changes. Phase 35M does not approve package/dependency changes. Phase 35M does not approve Study Room answer correctness changes. Phase 35M does not approve Study Room scoring changes. Phase 35M does not approve scheduler/FSRS behavior changes. Phase 35M does not approve queue progression changes. Phase 35M does not approve data persistence changes. Phase 35M does not approve confetti/sound/particle/3D card flip feedback. Phase 35M does not approve Streak Fire. Phase 35M does not approve Collapsible Header. Phase 35M does not approve Dynamic Canvas Themes implementation.

## Next recommended phase

Next recommended phase: Phase 35N — Study Room Answer Feedback Polish Implementation.
