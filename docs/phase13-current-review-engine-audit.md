# Phase 13A — Current Review Engine Audit

Phase 13A is a docs/static-validator/CI-only audit of the current Shime Quiz / ShimeChamhoc v2 review engine after Phase 12J. It documents the existing browser-local scheduler and weighted practice behavior so that later Phase 13 work can plan a safe FSRS migration without changing runtime behavior in this phase.

## Scope statement

Phase 13A does not implement FSRS, does not add `ts-fsrs`, does not change package files, does not change storage schema, and does not change Study Room, Dashboard, scoring, mastery, recommendation, or review scheduling behavior.

The current implementation is SM-2-like / heuristic and not FSRS. FSRS is a future migration direction that requires separate architecture planning in Phase 13B and a later approved runtime phase before any public implementation claim.

## Current review engine location

The current review/scheduling and practice-selection behavior is spread across these implementation files:

- `src/quiz/spacedRepetition.js` — legacy/simple quiz review schedule helpers for `quizReviewScheduleV1`, including question key generation, schedule normalization, due-key lookup, and a SM-2-like interval/ease update routine.
- `src/state/reviewScheduleStorage.js` — v2 browser-local review schedule storage for `shimeV2ReviewScheduleV1`, including schedule envelope normalization, record updates from study history, due summary calculation, and local storage write/read behavior.
- `src/learning/weightedPracticeSelector.js` — deterministic weighted practice item selector for v2 learning items, using due status, history statistics, wrong count, low correct rate, unpracticed status, and optional filters.
- `src/quiz/weightedSelection.js` — quiz-question weighted sampling helper, using seeded/reproducible random selection, due review keys, wrong counts, bookmarks, mastery, and mode multipliers.
- `src/quiz/mastery.js` — quiz-level mastery helpers used by current analytics and recommendation signals.
- `src/analytics/masteryModel.js` — v2 mastery model and aggregation layer used by Dashboard/analytics surfaces.
- `src/routes/StudyRoom.jsx` — finishes study sessions, saves browser-local history, then calls `updateReviewScheduleFromHistoryRecord()` to update the review schedule.
- `src/routes/Dashboard.jsx` — displays learning-data summaries, review schedule panels, smart practice panels, and related dashboard cards without embedding scheduler logic directly.
- `src/utils/storage.js` — safe localStorage wrapper for browser-local JSON storage.
- `src/utils/storageQuotaEstimate.js` — storage quota estimation helper used by Phase 12 storage-pressure UX, not a scheduler itself but relevant to localStorage capacity risk.

Related UI components and study helpers, such as `src/components/study/ReviewSchedulePanel.jsx`, `src/components/study/SmartPracticePanel.jsx`, and `src/study/dueReviewSelector.js`, also consume review schedule data, but the files above are the required Phase 13A audit targets.

## Current scheduler model

The current scheduler is SM-2-like / heuristic. It is not FSRS.

Two scheduler/storage concepts currently exist:

1. `quizReviewScheduleV1` in `src/quiz/spacedRepetition.js`, keyed by `questionKey`.
2. `shimeV2ReviewScheduleV1` in `src/state/reviewScheduleStorage.js`, keyed by `itemId` and wrapped in an envelope with `schemaVersion` set to `v2-review-schedule-v1`.

The important current fields are:

- `questionKey` or `itemId` — stable identifier for the scheduled question/item.
- `schemaVersion` — present in the v2 schedule envelope for `shimeV2ReviewScheduleV1`.
- `easeFactor` — bounded ease value used to scale future intervals.
- `intervalDays` — current scheduled interval in days.
- `repetitionCount` — count of successful review repetitions in the current schedule model.
- `correctStreak` — consecutive correct count used as a mastery/review signal.
- `wrongCount` — accumulated wrong count used by scheduling and weighted practice.
- `dueAt` — ISO timestamp for when the item becomes due.
- `lastReviewedAt` — ISO timestamp for the last review/update.
- `subjectId` and `topicId` — v2 schedule metadata retained when available.

The current model does not store FSRS `difficulty`, `stability`, `retrievability`, FSRS card state (`New`, `Learning`, `Review`, `Relearning`), or rich four-grade review logs.

## Storage keys and local-first boundaries

Current review schedule storage keys include:

- `quizReviewScheduleV1`
- `shimeV2ReviewScheduleV1`

The review schedule is browser-local. Core study/review data is stored in browser storage through local storage wrappers and does not automatically sync to a backend or cloud account. There is no automatic cloud sync, no account sync, no hidden upload of study data, and no required account for the current core review engine.

`src/utils/storage.js` provides safe `getJSON`, `setJSON`, and related helpers around localStorage. `src/state/reviewScheduleStorage.js` uses `getLocalStorage()` directly to read/write the v2 review schedule envelope and publish local storage change events.

`src/utils/storageQuotaEstimate.js` is relevant because localStorage capacity remains a limitation for long-lived study data. Phase 12 documented storage pressure and future IndexedDB planning, but Phase 13A does not implement IndexedDB.

## Schedule update behavior

### Legacy/simple schedule in `src/quiz/spacedRepetition.js`

The legacy/simple helper normalizes records from `quizReviewScheduleV1` and caps serialized records with `MAX_REVIEW_ITEMS`.

Correct answer behavior:

- `lastReviewedAt` is set to the current timestamp.
- `repetitionCount` increases by 1.
- `correctStreak` increases by 1.
- `easeFactor` increases by `0.05`, clamped between `1.3` and `3.0`.
- `intervalDays` progresses from `1`, then `3`, then approximately `previous intervalDays * easeFactor` with a minimum of `4` for later repetitions.
- `dueAt` is moved forward by `intervalDays`.

Wrong answer behavior:

- `lastReviewedAt` is set to the current timestamp.
- `repetitionCount` resets to `0`.
- `correctStreak` resets to `0`.
- `wrongCount` increases by 1.
- `easeFactor` decreases by `0.2`, clamped between `1.3` and `3.0`.
- `intervalDays` resets to `0`.
- `dueAt` is moved forward by `WRONG_REVIEW_DELAY_HOURS`, currently 6 hours.

Unanswered behavior:

- In `updateReviewScheduleFromAttempt()`, unanswered values are skipped and do not update `quizReviewScheduleV1`.

Due review calculation:

- Due keys/counts are based on `dueAt <= Date.now()`.
- `findDueReviewQuestions()` maps due `questionKey` values back to quiz questions.

### V2 schedule in `src/state/reviewScheduleStorage.js`

The v2 review schedule normalizes all records before reading/writing and stores an envelope under `shimeV2ReviewScheduleV1` with `schemaVersion`, `updatedAt`, and `records`.

Correct result behavior:

- Uses `getNextCorrectIntervalDays()`.
- First correct interval is `1` day.
- Second correct interval is `3` days.
- Later correct intervals are rounded from `previousInterval * easeFactor`.
- `repetitionCount` increases by 1.
- `correctStreak` increases by 1.
- `wrongCount` is preserved.
- `easeFactor` increases by `0.05`, clamped between `MIN_EASE_FACTOR` (`1.3`) and `MAX_EASE_FACTOR` (`2.8`).
- `dueAt` is moved forward by the computed interval.

Wrong result behavior:

- `lastReviewedAt` is updated.
- `dueAt` is set to 1 day after the reviewed timestamp.
- `intervalDays` is set to `1`.
- `repetitionCount` is preserved rather than reset.
- `easeFactor` decreases by `0.2`, clamped between `1.3` and `2.8`.
- `correctStreak` resets to `0`.
- `wrongCount` increases by 1.

Unanswered behavior:

- Unanswered scorable items are made due soon without increasing `wrongCount`.
- `dueAt` is set to 1 day after the reviewed timestamp.
- `intervalDays` is set to `1`.
- `repetitionCount` is preserved.
- `easeFactor` is preserved.
- `correctStreak` resets to `0`.

Due review calculation:

- `getReviewScheduleSummary()` counts due records where `dueAt <= now`.
- It also returns future count, next due date, due record samples, and next record samples.

Schedule normalization and record limits:

- Records are normalized through `normalizeScheduleRecord()` before use.
- Invalid or corrupt localStorage payloads are discarded safely and replaced with an empty envelope.
- Duplicate records are de-duplicated by `itemId`.
- The v2 storage module does not document the same explicit `MAX_REVIEW_ITEMS` cap as the legacy `quizReviewScheduleV1` helper.

## Weighted practice selection

The current app has weighted practice selection foundations rather than a full FSRS scheduler.

### `src/learning/weightedPracticeSelector.js`

This v2 selector builds schedule and history maps, filters candidate items, scores each candidate, sorts by weight, and returns selected entries/items.

Important signals include:

- Due items: records with `dueAt <= now` receive extra weight.
- Unpracticed items: items with no practice history receive extra weight.
- `wrongCount`: previous wrong answers increase weight, capped to avoid runaway priority.
- Low correct rate: items below the current correct-rate threshold receive bonus weight.
- Mastered/correct items: items with several correct answers and no wrong history can receive lower weight if not due.
- Filters: subject/topic/type filters can constrain the candidate pool.

Selection is deterministic by sorted score rather than an FSRS retrievability model.

### `src/quiz/weightedSelection.js`

This quiz-level sampler uses weighted random sampling with seeded/reproducible RNG support. It accounts for:

- Due review keys and schedule records.
- Never-answered/unpracticed items.
- History `wrongCount` and wrong rate.
- Review `wrongCount`.
- Bookmarks.
- Mastery score from the mastery model.
- `correctStreak` and high-mastery penalties for items that are not due.
- Mode multipliers for `quickReview`, `mockExam`, `masteryBoost`, and default/custom mode.
- Seeded/reproducible selection through `createSeededRandom()`.

This is a heuristic prioritization system, not FSRS retrievability-based scheduling.

## Current strengths

- Local-first design with browser-local review schedule storage.
- No backend dependency for core study/review behavior.
- Simple explainable scheduler based on ease factor, intervals, streaks, wrong counts, and due dates.
- Safe normalization of schedule records and corrupt-storage fallback behavior.
- Weighted practice foundation that can prioritize due, weak, wrong, unpracticed, bookmarked, or low-mastery items.
- Existing unit/static validator foundation from earlier phases.
- Dashboard and Study Room consume schedule data through dedicated modules instead of embedding all scheduler logic directly in UI components.
- Current boundaries are understandable enough to audit before a future FSRS migration.

## Current limitations

- Review outcome signals are effectively binary/ternary (`correct`, `wrong`, `unanswered`) rather than FSRS four-grade ratings (`Again`, `Hard`, `Good`, `Easy`).
- No FSRS `difficulty`, `stability`, or `retrievability` model is stored or computed.
- No rich FSRS review logs exist for optimizer-quality migration.
- No per-card scheduler versioning is present in the current review schedule records.
- There may be duplicate scheduler concepts/storage keys between `quizReviewScheduleV1` and `shimeV2ReviewScheduleV1`.
- Migration and rollback semantics for changing schedulers are not yet designed.
- localStorage capacity remains a long-term risk for large libraries and long histories.
- No automatic cross-device sync exists, which is consistent with local-first boundaries but means schedule state is per browser unless manually exported/imported.
- Weighted selection can improve practice prioritization but is not the same as a memory-state model.

## Risks of changing the scheduler directly

Direct scheduler changes without a migration plan could:

- Corrupt existing review schedules.
- Break backup/restore compatibility or make exported data ambiguous.
- Change users' learning cadence unexpectedly.
- Break Study Room completion expectations or Dashboard due-review summaries.
- Break weighted selection in a non-obvious way by changing schedule fields or due semantics.
- Cause old records to be interpreted as FSRS records without required FSRS signals.
- Overclaim FSRS implementation when only heuristic scheduling exists.
- Create inconsistent behavior between `quizReviewScheduleV1` and `shimeV2ReviewScheduleV1`.
- Make rollback difficult if new scheduling behavior produces bad intervals.

## Phase 14 preparation notes

Phase 13A should feed Phase 13B, not replace it. Phase 13B should design the FSRS migration architecture, including scheduler versioning, data model, review logs, opt-in strategy, new-card strategy, migration rules, backup/export/import compatibility, rollback behavior, and public claim boundaries.

Phase 14 should not start until Phase 13B/13C/13D have produced and accepted a safe runtime entry decision. Any future FSRS implementation must remain local-first unless a separate, explicit, user-approved phase changes that boundary.
