# Phase 14D - Developer-Gated FSRS Adapter Routing

## Purpose And Scope

Phase 14D is a developer/test-only adapter routing harness. It connects the Phase 14A scheduler adapter to the Phase 14B `fsrsWrapper` only when the caller passes the explicit context gate `context.enableFsrsTestRoute === true`.

This is not user-facing FSRS. Phase 14D adds no UI toggle, no Study Room change, no Dashboard change, no package change, no new dependency, no backup/import/export change, no storage migration, no automatic migration of existing records, and no production FSRS route by default.

## Gate Design

The only allowed gate is:

```js
context.enableFsrsTestRoute === true
```

The adapter must not use a localStorage gate, an environment variable gate, a build flag, `SHIME_DEV_FSRS_ENABLED`, or any truthy value check. `false`, `1`, and `"true"` must not open the gate.

The gate is a test harness control for direct developer/unit-test calls to `scheduleReview()`. It is not persisted, not read from browser storage, and not connected to Study Room, Dashboard, backup/import/export, or any user-facing flow.

## Current Scheduler Default

The current SM-2-like / heuristic scheduler remains the default behavior. Records with no `schedulerKind` and records with `schedulerKind: "sm2-heuristic"` stay on the current scheduler even if the context includes `enableFsrsTestRoute: true`.

`scheduleCurrentReview()`, `getDueStatus()`, `getDueSummary()`, `preserveCurrentRecord()`, `getSchedulerVersion()`, and current scheduler field calculations remain unchanged. The production firewall text from Phase 14A remains for FSRS-kind records when the gate is absent, false, or not strictly boolean `true`.

## FSRS Test Route

When an FSRS test-kind record is scheduled with `context.enableFsrsTestRoute === true`, the adapter delegates to `scheduleFsrsReviewForTest()` from the Phase 14B wrapper. This route does not call storage and does not mutate the input record.

Phase 14D recognizes the Phase 14B test kinds:

- `fsrs-v4-test`
- `ts-fsrs-5.3.3-test`

Those test kinds route to the FSRS branch only for the gated developer/test path. The default production path still rejects them with the Phase 14A safe error.

## Outcome Mapping

Phase 14D includes a narrow test-only binary outcome mapping:

- `correct` -> `Good`
- `wrong` -> `Again`
- `unanswered` -> `Again`

This mapping exists only to exercise adapter-to-wrapper wiring in unit tests. It is not a production rating model and must not be presented as the final FSRS review UI. A later phase must define real Again / Hard / Good / Easy UX, learner intent, rollback, and production opt-in before user-facing FSRS exists.

## Boundaries

Phase 14D does not change `fsrsWrapper.js`, `reviewScheduleStorage.js`, Study Room, Dashboard, package files, dependencies, scoring, mastery, weighted practice, recommendation, E2E tests, or backup/import/export runtime behavior.

No existing records are migrated. No localStorage key, backup format, or storage schema changes. No adaptive learning, Glicko/IRT, local AI, sync, IndexedDB migration, encryption, OCR, external AI/API, BYOK, or cloud feature is implemented.

## Phase 14E And Later

Phase 14E+ must define the production product rules before any user-facing FSRS claim:

- real four-rating Study Room flow if needed
- explicit user opt-in or new-card policy
- Dashboard due-count behavior for mixed scheduler records
- backup/import/export and rollback behavior for user-facing FSRS records
- storage capacity and migration limits
- public claim boundaries and regression tests

Until those later gates pass, FSRS remains developer/test-only and production FSRS scheduling is not enabled.
