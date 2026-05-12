# Phase 14B - FSRS Wrapper Test Prototype

## Scope

Phase 14B introduces the first controlled `ts-fsrs` dependency and a Shime-native FSRS wrapper, but the wrapper is internal/test-only. This phase does not make FSRS user-facing, does not route production scheduling to FSRS, does not migrate existing records, and does not change Study Room, Dashboard, backup/export/import, localStorage persistence, scoring, mastery, weighted practice, or recommendations.

The goal is an isolated lab prototype: verify the package API, serialize FSRS card/log results into plain Shime-native objects, and keep all production review scheduling on the Phase 14A current scheduler adapter path. FSRS is not user-facing in Phase 14B.

## Dependency Boundary

`ts-fsrs` is installed as an exact-pinned direct dependency for Phase 14B. The native open-spaced-repetition binding package is not installed and must remain absent from package files.

The installed API was verified before wrapper implementation:

- `fsrs()` creates the scheduler.
- `createEmptyCard()` creates a new FSRS card.
- `generatorParameters()` normalizes scheduler parameters.
- `Rating` exposes Again, Hard, Good, and Easy.
- `State` exposes New, Learning, Review, and Relearning.
- `repeat()` previews all ratings.
- `next()` schedules one rating and returns a card/log pair.
- Returned card and log date fields are Date-like values and must be serialized before leaving the wrapper.

## Wrapper Boundary

The wrapper module is `src/quiz/fsrsWrapper.js`. It exports only explicitly internal/test-only functions:

- `createFsrsSeedCardForTest(now)`
- `scheduleFsrsReviewForTest(card, rating, now)`
- `serializeFsrsCard(card, now)`
- `serializeFsrsReviewLog(log)`
- `validateFsrsPayload(payload)`
- `getFsrsDueStatusForTest(card, now)`

The wrapper returns plain Shime-native objects with `schedulerKind: "fsrs-v4-test"` and `schedulerVersion: "ts-fsrs-5.3.3-test"`. It keeps raw package objects behind the wrapper and serializes Date fields to ISO strings.

## Internal Test Data Shape

The test-only card shape includes:

- `schedulerKind`
- `schedulerVersion`
- `dueAt`
- `stability`
- `difficulty`
- optional derived `retrievability`
- `scheduledDays`
- `elapsedDays`
- `reps`
- `lapses`
- `learningSteps`
- `state`
- `lastReviewedAt`
- `fsrsPayload`

The test-only review log shape includes:

- `rating`: Again, Hard, Good, or Easy
- prior `state`
- prior `dueAt`
- review timestamp as `reviewedAt`
- prior `stability` and `difficulty`
- `scheduledDays`
- `elapsedDays`
- `lastElapsedDays`
- `learningSteps`
- `fsrsPayload`

These records are test payloads only. They are not written to `quizReviewScheduleV1`, `shimeV2ReviewScheduleV1`, or any new localStorage key.

## No Production Routing

Phase 14B does not change `src/quiz/reviewSchedulerAdapter.js`. The production Phase 14A adapter still rejects the reserved planned FSRS scheduler kind and continues to preserve the current SM-2-like / heuristic scheduler behavior.

Phase 14B also does not change `src/state/reviewScheduleStorage.js`; the existing browser-local current scheduler storage remains unchanged. Study Room and Dashboard are not updated, and there is no Again / Hard / Good / Easy user interface in this phase.

## Migration Boundary

Existing current-scheduler records remain current-scheduler records. There is no existing-card migration in Phase 14B. Phase 14B does not convert current records to FSRS, does not add FSRS fields to existing stored records, does not alter backup payloads, and does not change import behavior.

Binary correct/wrong production outcomes are not mapped to FSRS in runtime. A `correct` result can mean different FSRS ratings depending on learner effort and memory state, and `wrong` or `unanswered` is not enough to reconstruct a reliable four-rating review history.

The current `easeFactor` cannot seed FSRS `difficulty` directly. SM-2-like ease and FSRS difficulty are different mathematical states, not a simple scaling conversion. Existing fields such as `intervalDays`, `repetitionCount`, and `wrongCount` may inform a future conservative seed strategy, but Phase 14B does not implement that migration.

## Backup And Local-First Boundary

Manual backup/export/import remains the current safe portability path. Phase 14B does not change backup format, does not add a storage migration, does not upload data, does not add account sync, and does not add automatic sync.

The wrapper is local code and does not introduce Glicko-2, IRT, local AI, semantic search, PowerSync, ElectricSQL, cloud sync, encryption, OCR, external AI/API integration, or BYOK/API key support.

## Public Claim Boundary

After Phase 14B, Shime may claim that an exact-pinned `ts-fsrs` dependency and an internal/test-only FSRS wrapper prototype exist.

Shime must not claim:

- FSRS is not user-facing.
- FSRS production scheduling is not enabled.
- Existing records are not migrated to FSRS.
- Study Room does not support FSRS ratings.
- Dashboard does not read mixed FSRS/current due counts.
- Backup/export/import does not support FSRS records.
- Adaptive learning, AI, sync, cloud sync, IndexedDB migration, encryption, OCR, and external AI/API integration are not implemented.

## Phase 14C And Later

Phase 14C+ should decide whether and how an opt-in or new-card FSRS path can be introduced. Before any user-facing runtime route, a later phase must define rating policy, rollback, backup/export/import compatibility, current/FSRS due-summary behavior, storage capacity limits, and Study Room/Dashboard compatibility tests.
