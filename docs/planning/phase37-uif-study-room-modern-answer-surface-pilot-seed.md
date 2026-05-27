# Phase 37-uiF — Study Room Modern Answer Surface Pilot Seed
## Status token
PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED
## Purpose
Seed a bounded runtime visual pilot for Study Room answer surface modernization after Phase 37-uiE evidence review and scope gate.
## Inputs from Phase 37-uiE
Phase 37-uiE accepted the Phase 37-uiD Library shelf evidence and selected `STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT` as the next high-impact visual candidate.
## Runtime candidate
Study Room Modern Answer Surface Pilot.
## User-facing intent
Make answer cards, feedback, selected/check/reveal states, and explanation reveal feel more modern, calm, supportive, and premium without gamification pressure.
## Allowed files / expected areas
Phase 37-uiF is a runtime pilot only if scoped to Study Room answer surface visuals. Expected areas may include stronger answer-card treatment, calm selected/check/reveal states, explanation reveal framing, subtle feedback surfaces, depth/border/glow tokens, hover/focus affordances, reduced-motion-safe transitions, evidence docs, release summary, planning seed, validator, and CI registration if separately allowed by the Phase 37-uiF task.
## Forbidden areas
Phase 37-uiF must preserve scoring correctness, answer evaluation, scheduler/FSRS, queue logic, question data, stored progress, routes/navigation, event handlers, package files, sync/backend/auth/telemetry, import/parser/storage, localStorage writes, persisted preferences, account-synced preferences, and global theme ownership.
## Implementation guidance
Prefer scoped visual host classes and contained CSS. Keep Vietnamese-first copy and calm learner-owned identity. Avoid casino-like effects, loud motion, or pressure-based reward treatment.
## Accessibility, contrast, and reduced-motion requirements
Phase 37-uiF must provide focus-visible evidence, contrast/readability evidence, and reduced-motion evidence for every new answer-surface transition or visual state.
## Mobile and desktop requirements
Phase 37-uiF must include 375px mobile evidence and desktop evidence for default, selected, checked, feedback, and explanation states.
## Study Room scoring, queue, scheduler, and data restrictions
Phase 37-uiF must not change correctness behavior, scoring, answer evaluation, scheduler/FSRS, queue logic, question data, stored progress, persisted data, routes/navigation, event handlers, package files, sync/backend/auth/telemetry, import/parser/storage, or localStorage writes.
## Evidence required
Required evidence includes visual difference, answer-card containment, selected/check/reveal states, explanation reveal framing, feedback surface behavior, no scoring changes, no queue/scheduler/data changes, focus-visible, contrast/readability, reduced-motion, 375px mobile, desktop, E2E smoke, onboarding E2E, and rollback notes.
## Rollback plan
If the pilot cannot stay scoped to Study Room answer surface visuals or cannot preserve scoring, queue, scheduler, and data behavior, hold implementation and return to Study Room answer surface research only.
## Decision options
HOLD_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT
NEEDS_STUDY_ROOM_MODERN_ANSWER_SURFACE_REWORK
PASS_TO_PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW
PASS_TO_STUDY_ROOM_ANSWER_SURFACE_RESEARCH_ONLY
## Forbidden default approvals
Phase 37-uiF must not add gamification pressure, confetti, sound, casino-like effects, Streak Fire, Collapsible Header, full Dynamic Canvas themes, theme picker, persisted preferences, or localStorage writes. It must not approve BETA_READY, public production readiness, release-readiness upgrade, broad UI redesign, route behavior changes, event handler changes, package/dependency changes, scheduler/FSRS changes, sync/cloud/account/auth/backend, telemetry, or replacement of Phase 37C.
## Recommended next step
Next recommended phase: Phase 37-uiF — Study Room Modern Answer Surface Pilot implementation, only under a separately scoped runtime task.
