# Phase 14A - Scheduler Adapter Boundary

## Scope

Phase 14A is runtime-safe scaffolding for a scheduler adapter boundary. It adds a small adapter around the current SM-2-like / heuristic review scheduler so later FSRS work can be introduced without globally replacing current scheduling or corrupting existing browser-local data.

Phase 14A changes no Study Room UI, Dashboard UI, backup/export/import format, localStorage key names, package files, package version, dependencies, scoring behavior, mastery behavior, weighted practice behavior, recommendation behavior, or E2E tests.

## Adapter Boundary Purpose

The adapter module is `src/quiz/reviewSchedulerAdapter.js`. It provides one place for future scheduler routing while preserving current scheduler behavior. The current scheduler remains the only active scheduling path in Phase 14A.

The adapter exposes:

- `SCHEDULER_KIND_CURRENT` for the current `sm2-heuristic` scheduler.
- `SCHEDULER_KIND_FSRS_PLANNED` as a reserved future FSRS kind.
- `getSchedulerKind(record)` and `getSchedulerVersion(record)` for read-time scaffolding.
- `getDueStatus(record, now)` for normalized due status.
- `getDueSummary(records, now)` for normalized aggregate due summary.
- `scheduleReview(record, outcome, context)` for scheduler dispatch.
- `scheduleCurrentReview(record, outcome, context)` for the current scheduler path.
- `preserveCurrentRecord(record)` for non-destructive record copies.

## Current Scheduler Preservation

The current v2 scheduler behavior remains in `src/state/reviewScheduleStorage.js`. Phase 14A exports a pure helper from that module so the adapter can reuse the existing current-scheduler update logic instead of copying interval/ease math. Study Room still calls the existing review schedule storage path, and Dashboard still reads its existing learning data panels.

Current records without `schedulerKind` continue to work. The adapter defaults missing `schedulerKind` or `schedulerVersion` to the current scheduler at read time only. It does not write `schedulerKind` into existing localStorage records on app boot and does not perform an automatic migration.

## Scheduler Kind And Version Scaffolding

Phase 14A reserves scheduler identity values for routing:

- Current scheduler kind: `sm2-heuristic`
- Current scheduler version: `v2-review-schedule-v1`
- Future reserved FSRS kind: `fsrs-planned`
- Future reserved FSRS version: `fsrs-planned-v1`

This is scaffolding only. `fsrs-planned` records are visible to due-summary reads, but `scheduleReview()` rejects them with a safe error because FSRS scheduling is not implemented in Phase 14A.

## Normalized Due Status And Due Summary

`getDueStatus(record, now)` reads the shared `dueAt` field and returns whether a record is due, its scheduler kind, and its scheduler version. `getDueSummary(records, now)` counts due and not-due records, reports current versus reserved future FSRS records, and returns next due samples without requiring consumers to know scheduler internals.

Phase 14A does not route Dashboard or weighted practice through the adapter yet. The adapter is introduced and tested first so later Phase 14 work can adopt it deliberately.

## No FSRS Runtime Or Dependency

Phase 14A does not install `ts-fsrs`, does not import `ts-fsrs`, and does not implement FSRS runtime. It does not calculate FSRS `difficulty`, `stability`, `retrievability`, card state, or review logs.

The reserved FSRS scheduler kind exists only to prevent silent misuse. Calls that try to schedule a reserved future FSRS record fail with an explicit Phase 14A error.

## No Study Room Four-Rating UI

Phase 14A does not add Again / Hard / Good / Easy buttons or any other Study Room rating UI. The current binary/ternary Study Room completion path remains unchanged.

## No Migration Or Backup Format Change

Phase 14A does not migrate `quizReviewScheduleV1` or `shimeV2ReviewScheduleV1`, does not introduce a new localStorage key, and makes no backup format change. Existing records are interpreted through read-time defaults only.

## Why Ease Cannot Directly Become FSRS Difficulty

The current scheduler's `easeFactor` is an interval multiplier in an SM-2-like heuristic. FSRS `difficulty` is a memory-model state used with stability and retrievability updates. They are different mathematical states, so converting `easeFactor` to FSRS difficulty by scaling a number would be unreliable and unsafe.

## Why Binary Correct/Wrong Cannot Reconstruct FSRS Logs

Current Shime outcomes are `correct`, `wrong`, and `unanswered`. FSRS expects richer ratings such as Again, Hard, Good, and Easy plus review-log state transitions. A current `correct` result could represent different FSRS ratings, and aggregate schedule fields cannot reconstruct prior stability, difficulty, or retrievability. Phase 14A does not fabricate FSRS review logs.

## Public Claim Boundary

Phase 14A makes no public FSRS claim.

After Phase 14A, Shime may claim that a scheduler adapter boundary and scheduler kind scaffolding exist. Shime must not claim that FSRS is implemented, FSRS is available, `ts-fsrs` is installed, existing records are migrated, adaptive learning is implemented, AI is implemented, sync is implemented, IndexedDB migration is implemented, encryption is implemented, or OCR is implemented.

## Phase 14B And Later

Phase 14B may introduce FSRS runtime only after Phase 14A adapter tests and static validators pass. A later approved phase must separately review any `ts-fsrs` dependency, define opt-in or new-card behavior, preserve rollback, verify backup/export/import compatibility, and add Study Room rating UI only if the FSRS path requires it.
