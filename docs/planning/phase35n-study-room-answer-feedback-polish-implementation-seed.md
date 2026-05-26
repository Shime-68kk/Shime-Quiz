# Phase 35N — Study Room Answer Feedback Polish Implementation Seed

## Status token

PHASE35N_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Purpose

Prepare a small runtime implementation phase for Study Room Answer Feedback Polish after the Phase 35M scope gate. Phase 35N is not automatic broad Study Room redesign and is not approval for Study Room logic changes.

## Inputs from Phase 35M

PHASE35M_NEXT_UI_POLISH_SCOPE_STATUS: COMPLETED_NEXT_UI_POLISH_SCOPE_GATE

PHASE35M_NEXT_UI_POLISH_SCOPE_DECISION: PASS_TO_PHASE35N_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_IMPLEMENTATION

PHASE35M_SELECTED_CANDIDATE: STUDY_ROOM_ANSWER_FEEDBACK_POLISH

PHASE35M_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

## Runtime candidate

Study Room Answer Feedback Polish.

## User-facing intent

Improve calm visual clarity around existing Study Room answer feedback so learners can understand correct, incorrect, neutral, and loading states where those states already exist.

## Allowed files / expected areas

Phase 35N should identify a narrow allowlist before implementation. Expected areas are Study Room component-local rendering and CSS/class additions around existing answer result states. Prefer CSS/class additions and narrow component-local state/read-only rendering if needed.

## Forbidden areas

Phase 35N must not change answer correctness, scoring, scheduler/FSRS, queue progression, data persistence, card selection, Study Room routing, answer submission handlers, storage/backup/restore, import/parser/database/prompt systems, sync/cloud/account/auth/backend, telemetry/network calls, package files, data model files, or built-in AI/OCR/API-key/BYOK behavior. It must not add packages. It must not add confetti, sound, particles, 3D card flip, or casino-like feedback.

It must not change answer correctness, scoring, scheduler/FSRS, queue progression, data persistence, card selection, or Study Room routing.

## Implementation guidance

Phase 35N is a small runtime visual feedback candidate only. It should preserve existing answer submission handlers and result data. It should enhance existing answer-state presentation without creating new scoring semantics, new progression triggers, new persistence behavior, or new route behavior.

It should preserve existing answer submission handlers and result data.

## Accessibility and reduced-motion requirements

Phase 35N must preserve keyboard/focus behavior and include keyboard/focus evidence. Feedback must remain understandable without color alone. It must include reduced-motion fallback, with no required spatial motion under `prefers-reduced-motion: reduce`.

## Mobile and touch requirements

Phase 35N must include desktop and 375px mobile evidence. Feedback must not create horizontal overflow, clipped text, blocked controls, layout jumps, or reduced touch target comfort.

It must include desktop and 375px mobile evidence.

## Validation required

Run the phase validator, build, unit tests, E2E smoke, E2E onboarding, and `git diff --check`. Add any phase-specific evidence required by the Phase 35N implementation scope.

## Evidence required

Phase 35N must include correct/incorrect/neutral/loading evidence where those states already exist. It must include reduced-motion fallback evidence, desktop evidence, 375px mobile evidence, and keyboard/focus evidence.

It must include correct/incorrect/neutral/loading evidence where those states already exist.

It must include reduced-motion fallback.

It must include keyboard/focus evidence.

## Rollback plan

Rollback should remove only the visual feedback CSS/class/rendering additions and restore prior Study Room presentation. No data repair, dependency rollback, scheduler change, storage migration, or route migration should be required.

## Decision options

HOLD_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_IMPLEMENTATION

NEEDS_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_REWORK

PASS_TO_PHASE35O_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_EVIDENCE_REVIEW

## Forbidden default approvals

Phase 35M confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 35M does not approve BETA_READY. Phase 35M does not approve public production readiness. Phase 35M does not approve broad validation or stress-tested readiness. Phase 35M does not approve guaranteed data-loss prevention. Phase 35M does not approve storage/backup/restore behavior changes. Phase 35M does not approve sync/cloud/account/auth/backend. Phase 35M does not approve telemetry/network calls. Phase 35M does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 35M does not approve route behavior changes. Phase 35M does not approve package/dependency changes. Phase 35M does not approve Study Room answer correctness changes. Phase 35M does not approve Study Room scoring changes. Phase 35M does not approve scheduler/FSRS behavior changes. Phase 35M does not approve queue progression changes. Phase 35M does not approve data persistence changes. Phase 35M does not approve confetti/sound/particle/3D card flip feedback. Phase 35M does not approve Streak Fire. Phase 35M does not approve Collapsible Header. Phase 35M does not approve Dynamic Canvas Themes implementation.

## Recommended next step

Next recommended phase: Phase 35N — Study Room Answer Feedback Polish Implementation.
