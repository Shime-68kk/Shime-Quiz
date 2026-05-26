# Phase 35D — Dashboard Deconstruction Research Scope Seed

## Status token

```text
PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_SEED_STATUS: PREPARED_RESEARCH_SCOPE_SEED
```

## Purpose

Phase 35D should research and scope Dashboard deconstruction before any runtime implementation. The phase should decide what a calmer Dashboard home can safely become after the Library Bookshelf tab segmentation has been reviewed.

## Inputs from Phase 35C

- Phase 35C reviewed and carried forward the Phase 35B Library Bookshelf tab system.
- `/library` defaults to `Kệ sách của tôi`.
- Import/configuration/backup/admin tooling remains behind `Xưởng nạp tài liệu`.
- Raw input/text state preservation during tab switches was reviewed.
- Current readiness remains `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`.

## Why research/scope before runtime

The Dashboard is a primary app surface with navigation, study flow, progress interpretation, and readiness-claim risk. A research/scope gate is required to identify which Dashboard information should stay, move, collapse, or wait before any later implementation decision.

## Candidate surfaces to inspect

- Current Dashboard first viewport hierarchy
- Continue-study entry points
- Library entry points after Phase 35B
- Progress, streak, and status messaging
- Empty and first-run Dashboard states
- Navigation relationships between Dashboard, Library, Study Room, and Settings
- Existing copy that could imply broader readiness than approved

## Research questions

- What is the minimum Dashboard content needed for a calm home experience?
- Which Dashboard elements duplicate the now-reviewed Library shelf/workshop split?
- Which actions must remain immediately reachable for learners?
- Which administrative or setup actions should move away from the primary Dashboard path?
- Which claims or labels could imply `BETA_READY`, public production readiness, broad validation, or stress-tested readiness?
- What evidence is required before any Dashboard runtime change is allowed?

## Evidence plan

- Inventory current Dashboard surfaces and user-visible claims.
- Map learner-first flows from Dashboard to Library and Study Room.
- Identify elements that should remain, be demoted, be deferred, or require new evidence.
- Produce a scoped implementation seed only after research findings are documented.

## Non-goals

- No Dashboard runtime implementation by default.
- No navigation runtime changes.
- No storage, sync, backend, auth, telemetry, import, backup, scheduler, FSRS, or route behavior changes.
- No Dynamic Canvas Themes implementation.
- No approval of `BETA_READY`, public production readiness, broad validation, or stress-tested readiness.

## Decision options

```text
HOLD_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE
NEEDS_DASHBOARD_SCOPE_REWORK
PASS_TO_PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION
```

## Forbidden default approvals

Phase 35D must not automatically approve Dashboard runtime implementation, Dynamic Canvas Themes, Navigation indicator work, Elastic Button Compression, Study Room polish, Streak Fire, Collapsible Header, storage/sync/backend/auth behavior, telemetry, `BETA_READY`, public production readiness, broad validation, or stress-tested readiness.

## Recommended next step

Open Phase 35D as Dashboard Deconstruction Research/Scope Gate and require documented findings before any Phase 35E runtime implementation decision.
