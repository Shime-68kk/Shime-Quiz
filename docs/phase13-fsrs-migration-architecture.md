# Phase 13B - FSRS Migration Architecture

Phase 13B is a docs/static-validator/CI-only architecture plan for a future migration from Shime Quiz / ShimeChamhoc v2's current browser-local review scheduler to an FSRS-based review engine. It does not implement FSRS runtime, does not add a `ts-fsrs` dependency, does not change package files, does not change `src/`, does not change the Study Room UI, does not change storage schema, and does not change backup format.

## Scope Lock

This phase is an architecture plan only:

- No runtime implementation is added in Phase 13B.
- No ts-fsrs dependency is added in Phase 13B.
- No Study Room UI change is made in Phase 13B.
- No storage schema change is made in Phase 13B.
- No backup format change is made in Phase 13B.
- No scoring, SRT, mastery, weighted selection, recommendation, Dashboard, backup/import, or review scheduling behavior is changed in Phase 13B.
- FSRS remains a future runtime target and must not be publicly claimed as available until a later runtime phase implements and verifies it.

## Current Scheduler Summary

Phase 13A audited the current review engine and found that Shime currently uses browser-local SM-2-like / heuristic scheduling. The current scheduler is not FSRS.

The current scheduler surface includes:

- `src/quiz/spacedRepetition.js`, which manages `quizReviewScheduleV1` records keyed by `questionKey`.
- `src/state/reviewScheduleStorage.js`, which manages `shimeV2ReviewScheduleV1` records keyed by v2 item identity.
- `src/learning/weightedPracticeSelector.js` and `src/quiz/weightedSelection.js`, which prioritize due, weak, wrong, low-mastery, bookmarked, or unpracticed items through heuristic weighting.
- `src/quiz/mastery.js` and `src/analytics/masteryModel.js`, which compute mastery and Dashboard-facing learning signals from history and schedule records.

Current schedule records store fields such as `easeFactor`, `intervalDays`, `repetitionCount`, `correctStreak`, `wrongCount`, `dueAt`, and `lastReviewedAt`. These fields support the current SM-2-like / heuristic scheduler. They do not store FSRS `difficulty`, `stability`, `retrievability`, FSRS card state, or four-rating review logs.

## Why Not Replace Globally

The current scheduler should not be globally replaced in one step because existing local schedules already encode user-specific due dates, streaks, wrong counts, and cadence. A single global replacement would create several avoidable risks:

- Existing records could be interpreted as FSRS cards without the required FSRS memory state.
- Existing due dates could be lost or shifted without user intent.
- Dashboard due counts and weighted practice selection could drift suddenly.
- Backup/export/import compatibility could become ambiguous if old and new records share one shape without versioning.
- Rollback could become impossible if current records are overwritten destructively.
- Users could experience a learning cadence change without an opt-in or recovery path.

The safer migration architecture preserves the current scheduler for existing records unless a later runtime phase explicitly migrates them with tested rules and user-visible safeguards.

## Why FSRS Is The Preferred Near-Term Upgrade

FSRS is the preferred near-term review-engine upgrade because it models card memory state through `difficulty`, `stability`, `retrievability`, scheduled intervals, and rating outcomes. That gives Shime a clearer path toward adaptive recall scheduling than the current ease-factor heuristic while still fitting a local-first browser app.

FSRS is only a future runtime direction in Phase 13B. The current app remains a browser-local SM-2-like / heuristic scheduler, and the product should not publicly claim FSRS until runtime work and tests are complete in Phase 14 or later.

## Scheduler Adapter Boundary

A future runtime phase should introduce a constrained local scheduler adapter instead of calling `ts-fsrs` directly throughout app code. The adapter should be the only boundary that Study Room completion, Dashboard summaries, weighted practice selection, backup/import code, and future scheduler implementations depend on.

Recommended adapter responsibilities for Phase 14 or later:

- Read a card or current schedule record by stable item identity.
- Compute the next schedule from an explicit review outcome.
- Return a normalized schedule result with due date, scheduler kind, and scheduler-owned fields.
- Preserve current scheduler behavior through a current-scheduler adapter path.
- Place future FSRS behavior behind an FSRS adapter path.
- Hide third-party library details from UI and storage callers.
- Enforce local-first behavior and avoid sync, cloud, or account assumptions.

Recommended adapter shape for later runtime work:

```text
SchedulerAdapter
  kind: current | fsrs
  version: schedulerVersion or schedulerKind
  schedule(record, reviewInput) -> scheduleResult
  summarize(records, now) -> dueSummary
  serialize(record) -> storage-safe record
  canRollback(record) -> boolean
```

The future FSRS scheduler may use `ts-fsrs` directly inside this adapter if Phase 14 approves the dependency and validates bundle, storage, and behavior impact. App code outside the adapter should not depend on `ts-fsrs` types.

## Dual Scheduler Support

Phase 14 or later should support dual scheduler records:

- Current scheduler remains available for existing SM-2-like / heuristic records.
- Future FSRS scheduler is added behind the adapter for opt-in or newly created cards.
- Each scheduled record carries `schedulerVersion` or `schedulerKind` so the app knows which adapter owns it.
- Dashboard and weighted practice consumers read normalized due data rather than assuming one scheduler's internal fields.
- Backup/export/import preserves unknown scheduler-specific fields instead of stripping them.

Dual scheduler support lets Shime introduce FSRS without forcing existing local data through a destructive automatic conversion.

## Opt-In And New-Card Strategy

The recommended first runtime entry is opt-in/new-card FSRS:

- Existing records continue on the current scheduler unless the user explicitly opts into migration later.
- Newly created cards may use FSRS after Phase 14 implements and tests the adapter.
- A future setting can choose scheduler kind for new cards only.
- A future migration action can convert selected existing records only after backup and rollback behavior are validated.
- Study Room should not require a rating-flow UI change in Phase 13B.

This strategy limits blast radius and gives testers a clear path to compare current and FSRS scheduling without rewriting all user schedules.

## Migration Strategy

The future migration strategy should be explicit and conservative:

1. Read current records from `quizReviewScheduleV1` and `shimeV2ReviewScheduleV1`.
2. Preserve the original current-scheduler record.
3. Create a future FSRS card record only when the user or a later approved runtime flow opts in.
4. Initialize FSRS card fields from safe approximations where possible, not from invented historical logs.
5. Mark each new record with `schedulerVersion` or `schedulerKind`.
6. Keep an adapter-level rollback pointer or preserved current record so the app can return to current scheduling.
7. Preserve backup/export/import compatibility by retaining scheduler-specific payloads and version metadata.

Binary correct/wrong and unanswered history cannot fully reconstruct reliable FSRS four-rating review logs. Existing records can seed a card cautiously, but they should not be treated as complete FSRS history.

## Rollback Strategy

Rollback must be designed before runtime rollout:

- Current scheduler records remain available until the future migration is proven safe.
- Converted records should keep a copy of the prior due date and current-scheduler fields or a recoverable reference to the original record.
- If FSRS scheduling produces invalid data, the adapter should be able to resume the current scheduler path.
- Backup files should remain restorable even when they contain a mix of current and future FSRS records.
- No destructive automatic conversion should occur during app startup or import.

## Backup, Export, And Import Compatibility

Future FSRS runtime must preserve backup/export/import compatibility:

- Existing backup files with only current records must continue to import.
- Future backup files may contain mixed scheduler records and must remain self-describing.
- Unknown scheduler-specific fields should be retained where possible.
- Import should not silently rewrite current scheduler records into FSRS records.
- Manual export/import remains local-first and browser-local unless a separate phase explicitly changes that boundary.

Phase 13B changes no backup format and no backup/import runtime behavior.

## Local-First Preservation

The migration architecture must preserve Shime's local-first model:

- Review schedules remain browser-local unless a separate approved phase introduces a different storage or sync model.
- There is no automatic sync, no cloud/account sync, no PowerSync or ElectricSQL assumption, and no external AI/API dependency in this plan.
- FSRS scheduling should run locally in the browser after a later runtime phase approves implementation details.

## Phase 14 Runtime Ownership

Phase 14 or later owns runtime implementation decisions:

- Whether to add `ts-fsrs`.
- The exact local adapter API.
- The storage schema version and migration gate.
- The Study Room rating flow, if four-rating input is introduced.
- Dashboard due-count normalization.
- Weighted practice integration with normalized due state.
- Unit and E2E coverage for migration, rollback, backup/import, and local-first behavior.

Phase 13B only prepares the architecture plan and static validator coverage. It does not implement FSRS and does not add `ts-fsrs`.

## Phase 14 Entry Recommendation

Phase 13B should prepare Phase 14, not do Phase 14. The recommended Phase 14 entry sequence is:

1. Implement a small local scheduler adapter boundary that can route current scheduler records and future FSRS records without changing Study Room behavior first.
2. Add data model scaffolding for `schedulerVersion` or `schedulerKind`, normalized due summaries, and future FSRS card/review-log shapes behind the adapter.
3. Define backup/export/import compatibility and rollback rules before any runtime migration touches existing local data.
4. Introduce FSRS only behind an opt-in/new-card pathway after adapter behavior, data model compatibility, rollback, and backup safety are tested.

This sequence keeps the current SM-2-like / heuristic scheduler available, preserves local-first browser-local identity, and avoids presenting planned FSRS architecture as an implemented feature.

## Public Claim Boundary

Safe wording after Phase 13B:

- Shime currently uses a browser-local SM-2-like / heuristic scheduler.
- FSRS is a future migration direction.
- Phase 13B documents an FSRS migration architecture plan.
- FSRS runtime requires Phase 14 or later.
- `ts-fsrs` is not added in Phase 13B.

Unsafe wording remains forbidden unless a later runtime phase implements and verifies it:

- Claiming Shime supports FSRS scheduling today.
- Claiming a `ts-fsrs` dependency is installed.
- Claiming Study Room, Dashboard, storage schema, backup/import, weighted practice, scoring, mastery, SRT, or recommendation runtime changed in Phase 13B.
