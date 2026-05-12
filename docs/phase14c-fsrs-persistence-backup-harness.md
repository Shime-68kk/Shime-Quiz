# Phase 14C - FSRS Persistence And Backup Compatibility Harness

## Purpose And Scope

Phase 14C is a storage/persistence safety harness for future FSRS-shaped review data. It is not user-facing FSRS, it does not enable production FSRS scheduling, and it makes no Study Room UI change, no Dashboard UI change, and no scoring, mastery, weighted practice, recommendation, or backup UI behavior change.

The phase verifies that future scheduler metadata can be preserved safely at storage and backup boundaries before any opt-in FSRS runtime path exists. It keeps Phase 14A's scheduler adapter boundary and Phase 14B's internal/test-only wrapper separated from production review scheduling.

Phase 14C does not add a new dependency, does not change package files, does not add a developer routing flag, does not add Again / Hard / Good / Easy Study Room controls, and does not migrate existing records.

Scope lock: no production FSRS route, no existing record migration, no new dependency, no package changes, and no backup format rewrite are part of the Phase 14C boundary.

## Real Repo Finding

The current review schedule storage envelope is `shimeV2ReviewScheduleV1` with `schemaVersion: v2-review-schedule-v1`. Existing records are SM-2-like / heuristic records with fields such as `easeFactor`, `intervalDays`, `repetitionCount`, `correctStreak`, `wrongCount`, `dueAt`, and `lastReviewedAt`.

Inspection found that `src/state/reviewScheduleStorage.js` normalized records by returning an explicit object literal. That protected the current schema, but it also meant future-shaped fields could be stripped on a read/normalize/write path. Phase 14C adds a narrow preservation helper for explicitly named FSRS-shaped metadata only; it does not add scheduling behavior to storage.

## Preservation Behavior

`normalizeScheduleRecord()` still normalizes the current SM-2-like fields exactly as before. In addition, it preserves these optional future fields when already present:

- `schedulerKind`, only when it is present and is not the implied current `sm2-heuristic` scheduler kind.
- `schedulerVersion`, only when it is present as a string.
- `fsrsPayload`, only when it is a JSON-serializable plain object.
- `fsrsReviewLogs`, only when it is an array of JSON-serializable plain objects.

Review logs are capped at `FSRS_REVIEW_LOG_CAP = 20`. `fsrsReviewLogs` keep the latest entries with FIFO behavior through `slice(-FSRS_REVIEW_LOG_CAP)`, and invalid review log entries are filtered out.

The preservation path does not write `schedulerKind: "sm2-heuristic"` into legacy records, does not add FSRS fields to records that lack them, and does not rewrite localStorage on a plain read. Existing SM-2 records remain unchanged.

FSRS-shaped fields are preservation-only in Phase 14C. They are not used for due calculation, scoring, mastery, weighted practice, recommendation, Study Room UI, or Dashboard UI.

## Backup, Import, And Export Boundary

Phase 14C does not rewrite the backup format. The v2 backup path already preserves the raw review schedule section when the section schema version matches, and Phase 14C adds unit coverage proving FSRS-shaped fields survive backup payload creation, validation, and restore.

The compatibility claim is limited to tested preservation of explicitly named future-shaped metadata. It is not a user-facing FSRS backup/import claim, and it is not a claim that production FSRS scheduling exists.

## Production Routing Boundary

Production scheduling still routes through the current scheduler behavior. `reviewSchedulerAdapter.js` continues to reject the reserved future FSRS scheduler kind. `fsrsWrapper.js` remains internal/test-only and is not imported by Study Room, Dashboard, storage, or the production adapter.

Phase 14C does not add `SHIME_DEV_FSRS_ENABLED` or any other developer flag. Developer-flag routing is deferred to Phase 14D or later after the persistence boundary, rollback expectations, and test-only wrapper behavior are stable.

## Claim Boundaries

After Phase 14C it is accurate to claim:

- Future-shaped FSRS metadata has a tested preservation path through review schedule normalization.
- Review log retention is capped at 20 entries.
- V2 backup validation and restore preserve the tested future-shaped review schedule fields.
- Current SM-2-like records remain unchanged when they do not contain future FSRS-shaped metadata.

After Phase 14C it must not be claimed that:

- `FSRS is user-facing` must not be claimed.
- `FSRS production scheduling is enabled` must not be claimed.
- `Study Room supports FSRS ratings` must not be claimed.
- `Dashboard supports mixed FSRS due counts` must not be claimed.
- `Existing records are migrated to FSRS` must not be claimed.
- `Backup/import fully supports a user-facing FSRS feature beyond the tested preservation harness` must not be claimed.

## Phase 14D Prerequisites

Phase 14D or later may evaluate developer-gated FSRS routing only after these gates are met:

- The production adapter still rejects FSRS unless an explicit later phase changes that behavior.
- The preservation harness remains green for legacy records and future-shaped records.
- Backup/import preservation remains tested without a backup format rewrite.
- Study Room and Dashboard UI changes remain out of scope unless a later phase explicitly owns them.
- The team defines rollback behavior before any user-facing FSRS path writes new scheduler data.
