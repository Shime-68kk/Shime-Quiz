# Phase 13B - FSRS Data Model Plan

Phase 13B defines a future data model plan for an FSRS migration. It is not a runtime storage schema change. No localStorage keys, backup format, import runtime, Study Room flow, or scheduler behavior are changed in this phase.

## Current Browser-Local Schedule Records

Phase 13A identified two current browser-local schedule stores:

- `quizReviewScheduleV1`, used by `src/quiz/spacedRepetition.js` and keyed by `questionKey`.
- `shimeV2ReviewScheduleV1`, used by `src/state/reviewScheduleStorage.js` and keyed by v2 item identity.

Current Shime records contain SM-2-like / heuristic scheduling fields:

- `questionKey` or item key, such as `itemId`, for card/question identity mapping.
- `easeFactor`, the current ease multiplier.
- `intervalDays`, the current scheduled interval in days.
- `repetitionCount`, the current successful repetition count.
- `correctStreak`, the current consecutive correct count.
- `wrongCount`, the accumulated wrong count.
- `dueAt`, the current due timestamp.
- `lastReviewedAt`, the last review timestamp.
- `subjectId` and `topicId` when available in v2 records.

These records are enough for the current scheduler and weighted practice signals. They are not FSRS card records and do not contain full historical review-log data.

## Future FSRS Card-Like Fields

A future Phase 14 or later runtime schema should define FSRS card-like records behind a scheduler adapter. Candidate fields include:

- `schedulerVersion` or `schedulerKind`, for routing each record to the current scheduler or future FSRS scheduler.
- `cardId` or stable item identity mapped from `questionKey`, `itemId`, or another item key.
- `due`, the next due timestamp for the card.
- `stability`, the FSRS memory-stability estimate.
- `difficulty`, the FSRS item difficulty estimate.
- `retrievability`, the estimated recall probability when computed for display or selection.
- `scheduledDays` or `scheduled_days`, the interval selected by the scheduler.
- `reps`, the number of recorded reviews.
- `lapses`, the number of relearning lapses.
- `state`, using `New`, `Learning`, `Review`, or `Relearning`.
- `lastReview` or `last_review`, the latest review timestamp.
- `createdAt` and `updatedAt` if needed for migration evidence, debugging, or compaction.

The adapter should expose a normalized due value to Dashboard and weighted practice consumers so those modules do not need to know whether the underlying record is current-scheduler data or future FSRS data.

## Future FSRS Review-Log-Like Fields

A future FSRS review log should be compact and local-first. Candidate review-log fields include:

- Review log identity, such as `reviewId` if needed.
- Card/question identity, mapped from `questionKey`, `itemId`, or the current item key.
- Review timestamp.
- `rating`, using `Again`, `Hard`, `Good`, or `Easy`.
- Prior state.
- Resulting state.
- Prior due.
- Resulting due.
- Prior `stability` and `difficulty` if needed for debugging or rollback.
- Resulting `stability` and `difficulty`.
- Scheduled days.
- Elapsed days if needed by the future scheduler adapter.
- Source session/question id if needed to trace a Study Room session.

Review log storage should be compact. A future implementation should define retention rules, compression or summarization options, and per-card log limits before enabling large-scale history storage.

## Migration Mapping

Some current fields can seed future FSRS cards approximately:

- `dueAt` can seed the future `due` field.
- `lastReviewedAt` can seed `lastReview` or `last_review`.
- `intervalDays` can seed `scheduledDays` or `scheduled_days`.
- `repetitionCount` can seed `reps` only as an approximation.
- `wrongCount` can seed `lapses` only as an approximation.
- `questionKey`, `itemId`, or another item key can map current records to card/question identity.
- `correctStreak` and `easeFactor` may help decide a cautious initial state, but they are not FSRS memory-state fields.

Several FSRS fields cannot be safely reconstructed automatically from current records:

- `stability` cannot be reliably reconstructed from `easeFactor` and `intervalDays`.
- `difficulty` cannot be reliably reconstructed from binary correct/wrong history.
- `retrievability` at a specific moment cannot be known without a validated FSRS state.
- The exact prior state and resulting state transitions cannot be derived from current aggregate records.
- A true four-rating review log cannot be recreated from binary `correct`, `wrong`, and `unanswered` outcomes.

Binary correct/wrong history cannot fully produce reliable FSRS review logs because FSRS expects review ratings such as `Again`, `Hard`, `Good`, and `Easy`. Current Shime history does not distinguish all four ratings, does not always store elapsed days in an FSRS-ready form, and may not include all prior state needed to replay the scheduler.

## Initialization Strategy For Existing Items

A future runtime phase should initialize FSRS cards for existing items conservatively:

- Preserve the existing current-scheduler schedule record.
- Create an FSRS card only after an explicit opt-in or migration action.
- Use `dueAt`, `lastReviewedAt`, `intervalDays`, `repetitionCount`, and `wrongCount` as approximate seed inputs.
- Mark the card with `schedulerVersion` or `schedulerKind`.
- Record the source schedule version and migration timestamp if needed.
- Avoid generating fake historical review logs.
- Keep rollback data so the current scheduler can resume if needed.

This avoids breaking users with existing local data and keeps current due schedules intact unless a later approved runtime flow changes them.

## Phase 14 Data Model Scaffolding Recommendation

Phase 14 should add only the smallest data model scaffolding needed before enabling FSRS scheduling:

- Introduce `schedulerVersion` or `schedulerKind` semantics behind the scheduler adapter.
- Preserve current `quizReviewScheduleV1` and `shimeV2ReviewScheduleV1` records.
- Define a future FSRS card shape and review-log shape without forcing existing records into that shape at app startup.
- Validate backup/export/import preservation for current-only and mixed scheduler payloads.
- Validate rollback before converting any existing local record.

FSRS runtime should come after this scaffolding and should start with opt-in/new-card records, not destructive automatic migration.

## Rollback And Compatibility

Rollback requires both record-level and backup-level compatibility:

- Current schedule records should be preserved during any future FSRS migration.
- Mixed current/FSRS records should be self-describing through scheduler versioning.
- Backup/export/import should preserve both current and future scheduler fields.
- Import should not destructively convert old records.
- Unknown scheduler-specific fields should be retained where possible.
- Users with existing local data should not lose current due schedules when opening the app after an update.

Phase 13B does not change backup/export/import runtime behavior and does not change storage schema.

## Storage Considerations

Current review schedules are browser-local and localStorage-based. localStorage has practical capacity limits, and future review logs could increase storage pressure if every Study Room interaction stores detailed state transitions.

Future storage considerations:

- Keep FSRS card records compact.
- Store review logs only when needed for optimization, rollback, debugging, or user-visible history.
- Define compact review log retention before implementation.
- Consider per-card log caps, aggregate summaries, or pruning rules.
- Estimate worst-case localStorage growth from review logs.
- Treat IndexedDB as a future/planned consideration only.
- No IndexedDB runtime migration is implemented in Phase 13B.

If Phase 14 or later needs larger review-log retention, the team should revisit the Phase 12 storage-capacity planning and decide whether a future IndexedDB migration is justified before expanding localStorage usage.

## Non-Goals In Phase 13B

Phase 13B does not:

- Add FSRS runtime.
- Add `ts-fsrs`.
- Change `quizReviewScheduleV1`.
- Change `shimeV2ReviewScheduleV1`.
- Change Study Room rating input.
- Change Dashboard due-count logic.
- Change weighted practice selection.
- Change backup/export/import compatibility.
- Change localStorage schema.
- Implement IndexedDB migration.
