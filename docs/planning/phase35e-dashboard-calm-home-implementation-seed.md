# Phase 35E — Dashboard Calm Home Implementation Seed

## Status token

```text
PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED
```

## Purpose

Phase 35E should implement a small Dashboard Calm Home candidate based on Phase 35D research. It should reduce Dashboard first-screen overload while preserving access to progress details.

## Inputs from Phase 35D

Phase 35D found that Dashboard currently mixes learner home, next-action guidance, goals, analytics, mastery, review schedule, smart practice, study history, and technical/library summary surfaces. Phase 35D chose:

```text
PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_DECISION: PASS_TO_PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION
```

## Runtime candidate

Dashboard Calm Home / Progress Journal Split.

## User-facing intent

The first Dashboard viewport should answer what the learner can do next today. Detailed analytics, mastery, schedule, history, and technical status should remain reachable without dominating the calm-home entry point.

## Allowed files / expected areas

Expected Phase 35E areas may include:

- `src/routes/Dashboard.jsx`
- Dashboard-only learning components under `src/components/learning/**`
- Dashboard-only analytics/study panel placement under `src/components/analytics/**` and `src/components/study/**` if necessary
- Dashboard-specific CSS in an existing style file or a narrowly scoped new style file if approved in the Phase 35E task
- Focused unit/e2e tests for Dashboard presentation assumptions
- Phase 35E docs, release summary, and validator

## Forbidden areas

Phase 35E must not modify package/dependency files, storage/backup/restore modules, import parsers, database/query pipelines, prompt builders, file drop-zone lifecycle implementation, scheduler/FSRS runtime behavior, sync/cloud/account/auth/backend files, telemetry/analytics, data model files, or unrelated route/navigation/settings/library wiring.

Phase 35E must not implement Navigation indicator, Elastic Button Compression, Study Room polish, Streak Fire, Collapsible Header, or Dynamic Canvas Themes.

## Implementation guidance

- Keep `Chào mừng quay lại` and `Học tiếp` assumptions unless tests are deliberately and narrowly updated.
- Keep Dashboard first-run onboarding safe-start copy and Library path.
- Treat `DashboardTodayCard` and due/smart-practice action summaries as calm-home anchors.
- Move, group, or demote detailed analytics/history/mastery/schedule sections without changing their underlying calculations.
- Avoid changing study scoring, recommendation, mastery, scheduler, storage, import, backup, restore, sync, cloud, auth, backend, or telemetry behavior.

## Accessibility and mobile requirements

Preserve semantic headings, keyboard navigation, stable accessible names, visible focus, `role="status"` status messages, and readable mobile layout at 375px. Avoid first-viewport long lists, destructive controls, and dense metric grids.

## Validation required

Run the Phase 35E validator, build, unit tests, e2e smoke, e2e onboarding, `git diff --check`, and any focused Dashboard tests added in Phase 35E.

## Evidence required

Phase 35E evidence must record changed files, browser or screenshot evidence if visual claims are made, mobile/accessibility notes, test output, rollback notes, and confirmation that forbidden systems were untouched.

## Rollback plan

Revert Phase 35E Dashboard presentation edits plus matching focused tests/docs/validator changes. No data migration should be needed because Phase 35E must not change storage schema, data model, scheduler behavior, import behavior, or backup/restore behavior.

## Decision options

```text
HOLD_DASHBOARD_CALM_HOME_IMPLEMENTATION
NEEDS_DASHBOARD_IMPLEMENTATION_REWORK
PASS_TO_PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW
```

## Forbidden default approvals

Phase 35D confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
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

## Recommended next step

Next recommended phase: Phase 35E — Dashboard Calm Home Implementation

Phase 35E is a small runtime candidate and is not approval for a broad Dashboard redesign.
