# Phase 37-uiG — Study Room Modern Answer Surface Evidence Review Seed

## Status token
PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED

## Purpose
Phase 37-uiG is evidence review only. It should review the Phase 37-uiF Study Room Modern Answer Surface Pilot and decide whether it is acceptable, needs visual rework, should hold, or should move to research only.

## Inputs from Phase 37-uiF
Phase 37-uiF implemented `STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT` with one passive Study Room runtime marker and scoped CSS for answer cards, selected state, check/reveal feedback, and explanation framing.

## Review surfaces
Review only the Study Room answer surface: answer cards, selected state, check or reveal feedback, explanation framing, short-answer field, and flashcard reveal.

## Evidence required
Phase 37-uiG should gather desktop and 375px Study Room evidence, selected-answer evidence, check/reveal evidence, explanation visibility evidence, scoring preservation by patch inspection, queue/scheduler/data preservation by patch inspection, contrast/readability review, focus-visible review, reduced-motion review, smoke E2E result, onboarding E2E result, and Phase 37C separation review.

## Non-goals
Phase 37-uiG must not approve scoring/correctness/scheduler/queue/data changes, broad redesign, release readiness, Beta Ready, storage/import/parser changes, sync/cloud/account/auth/backend, telemetry, route/event-handler changes, package changes, full Dynamic Canvas themes, theme picker, persisted preferences, localStorage writes, Streak Fire, Collapsible Header, or replacement of Phase 37C.

## Decision options
- PASS_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW
- NEEDS_STUDY_ROOM_MODERN_ANSWER_SURFACE_VISUAL_REWORK
- HOLD_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW
- PASS_TO_STUDY_ROOM_ANSWER_SURFACE_RESEARCH_ONLY

## Forbidden default approvals
Phase 37-uiG must not approve BETA_READY, public production readiness, release-readiness upgrade, broad UI redesign, Study Room scoring/correctness/scheduler/queue/data changes, storage/import/parser changes, sync/cloud/account/auth/backend, telemetry, route/event-handler changes, package changes, full Dynamic Canvas themes, theme picker, persisted preferences, localStorage writes, Streak Fire, Collapsible Header, or replacement of Phase 37C.

## Recommended next step
Run an evidence-only review against the Phase 37-uiF implementation and document the decision without implementing new runtime behavior.
