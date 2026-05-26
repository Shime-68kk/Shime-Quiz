# Phase 35D — Dashboard Deconstruction Research Scope Summary

## Status tokens

```text
PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_STATUS: COMPLETED_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE
PHASE35D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_DECISION: PASS_TO_PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION
PHASE35D_RESEARCH_SCOPE: DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE35D_DASHBOARD_SCOPE_STATUS: DASHBOARD_SURFACES_RESEARCHED_AND_PHASE35E_SEEDED
PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED
```

## Scope

Phase 35D is docs/research/scope/planning/static-validator/CI-only. No runtime behavior changed.

## Current readiness

Phase 35D confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

## Research result

Static research found that Dashboard currently combines calm-home, analytics, mastery, schedule, smart-practice, study-history, goal, and technical/library-status responsibilities. The surface is overloaded enough to justify a narrow Phase 35E calm-home implementation candidate.

## Chosen decision

```text
PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_DECISION: PASS_TO_PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION
```

## Decision rationale

Dashboard ownership and current test assumptions are clear enough to seed a bounded runtime phase. The recommended next step is presentation-level separation between learner next-action content and progress-journal detail.

## Dashboard surfaces reviewed

Reviewed surfaces include greeting / welcome header, daily progress summary, `Hành trình hôm nay`, goals/targets, statistics cards, trends/session analytics, weak/strong topics, mastery/detail sections, questions needing reinforcement, review schedule, smart practice, study history, and data model / technical status sections.

## Phase 35E candidate

Dashboard Calm Home / Progress Journal Split.

Phase 35E is a small runtime candidate and is not approval for a broad Dashboard redesign.

## Limitations carried forward

- Static research only; no new manual browser evidence was collected.
- No runtime Dashboard layout was implemented in Phase 35D.
- Phase 35E must still produce implementation evidence, test evidence, accessibility/mobile evidence, and rollback notes.
- Existing e2e assumptions around `/dashboard`, `Chào mừng quay lại`, `Học tiếp`, and Dashboard first-run onboarding must be protected.

## What is supported

Phase 35D supports Phase 35E planning for a small Dashboard Calm Home Implementation candidate that keeps learner next actions prominent and moves detailed progress surfaces into a secondary journal-style area.

Next recommended phase: Phase 35E — Dashboard Calm Home Implementation

## What remains not approved

Phase 35D does not approve BETA_READY.
Phase 35D does not approve public production readiness.
Phase 35D does not approve broad validation or stress-tested readiness.
Phase 35D does not approve guaranteed data-loss prevention.
Phase 35D does not approve storage/backup/restore behavior changes.
Phase 35D does not approve sync/cloud/account/auth/backend.
Phase 35D does not approve telemetry/network calls.
Phase 35D does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 35D does not approve Dashboard runtime redesign in this phase.
Phase 35D does not approve Navigation indicator implementation.
Phase 35D does not approve Elastic Button Compression implementation.
Phase 35D does not approve Study Room polish.
Phase 35D does not approve Streak Fire.
Phase 35D does not approve Collapsible Header.
Phase 35D does not approve Dynamic Canvas Themes implementation.

## Validation summary

Required validation for the final handoff: npm install, Phase 35D validator, build, unit tests, e2e smoke, e2e onboarding, diff check, patch apply check, and generated-artifact cleanup.

## Guardrails

No `src/**`, `tests/**`, `e2e/**`, package files, runtime data files, storage/backup/restore files, import parser files, scheduler/FSRS files, sync/cloud/backend/auth files, telemetry files, or Dashboard runtime wiring files were changed by this phase.

## Next recommended phase

Next recommended phase: Phase 35E — Dashboard Calm Home Implementation
