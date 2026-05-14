# Phase 14J — FSRS Enrollment Guard and Production Readiness Harness

## Status

COMPLETE — Inert Enrollment Readiness Harness only. Active FSRS scheduling remains DISABLED.

## Purpose

Phase 14J prepares the runtime data boundary for future FSRS scheduling without changing active interval calculations. It adds an unbreakable new-card-only enrollment gate, dormant FSRS metadata scaffolding, and a dormant scheduler fallback. The harness proves that enrollment, metadata preservation, and toggle-off safety all work correctly before Phase 14K wires them into production.

## What Phase 14J Does

- Adds `isFsrsNewCardEnrollmentEligible()` — a strict six-condition gate for new-card inert enrollment
- Adds `scheduleDormantFsrsReview()` — a dormant FSRS scheduler that computes SM-2 intervals while preserving FSRS metadata
- Adds `FSRS_DORMANT_SCHEDULER_VERSION = 'phase14j-dormant-readiness'` constant
- Exports these from `reviewSchedulerAdapter.js` for Phase 14K to wire into production
- Adds comprehensive tests and a static validator
- Updates CI workflow to run the Phase 14J validator

## What Phase 14J Does NOT Do

- Active FSRS scheduling remains disabled. Intervals still use proven SM-2-like heuristic logic.
- No production `ts-fsrs.next()` call anywhere in production scheduling paths.
- No Production Study Room UI change. StudyRoom.jsx is unchanged.
- No Dashboard mixed-scheduler UI change. Dashboard.jsx is unchanged.
- No enrollment at import time, app boot, or session start.
- No migration or backfill of existing SM-2 cards.
- No deletion of `fsrsPayload` or `fsrsReviewLogs` on toggle OFF.
- No user-facing claim that FSRS scheduling is active.

## New-Card Eligibility Gate

A card is eligible for Phase 14J inert enrollment only if ALL conditions are true:

1. FSRS toggle is ON (caller passes `settings.fsrsExperimentalEnabled` as `toggleEnabled`)
2. No existing review schedule record for the item (`priorRecord` is null/undefined)
3. itemId is non-empty
4. No prior study history item result exists for the item in `studyHistoryRecords`

The caller is responsible for reading settings and study history from storage and passing them as arguments. The adapter function itself does not read localStorage or process.env, consistent with Phase 14D isolation policy.

Enrollment must only occur during processing of the first completed review result. It must not occur at:
- import time
- app boot
- session start
- from Dashboard
- from Library
- from the Settings toggle

## Dormant Scheduler Behavior

`scheduleDormantFsrsReview(record, outcome, context)`:

1. Computes the SM-2-like interval using the existing `createReviewScheduleRecordFromResult()` — no FSRS math
2. Preserves `record.fsrsPayload` if it already exists; creates a dormant placeholder `{ state: 'New', difficulty: 5.0, stability: 1.0, retrievability: 1.0, reps: 0, phase: 'phase14j-dormant-readiness' }` if absent
3. Appends an inert log entry to `fsrsReviewLogs` (FIFO, capped at `FSRS_REVIEW_LOG_CAP = 20`)
4. Sets `schedulerKind: 'fsrs-planned'` and `schedulerVersion: 'phase14j-dormant-readiness'`

The dormant scheduler is NOT wired into `scheduleReview()`. The existing `scheduleReview()` gateway still throws for `fsrs-planned` records without `enableFsrsTestRoute`. Phase 14K will wire the dormant scheduler into production.

## Toggle OFF Behavior

When the FSRS toggle is OFF (`fsrsExperimentalEnabled: false`):

- No new cards receive enrollment metadata
- Existing dormant FSRS metadata (`fsrsPayload`, `fsrsReviewLogs`) is preserved — never deleted
- Scheduling intervals remain SM-2-like heuristic behavior
- If the toggle is re-enabled, dormant FSRS state resumes from the saved data

## schedulerKind Assignment

`schedulerKind: 'fsrs-planned'` is set only by `scheduleDormantFsrsReview()` in `reviewSchedulerAdapter.js`. It is never assigned from:
- Library.jsx
- Dashboard.jsx
- Settings toggle
- import/restore paths

## Existing SM-2 Records

Existing SM-2 records are never migrated or backfilled. Only true new cards (no prior review schedule, no prior study history) may receive dormant FSRS metadata, and only while the toggle is ON.

## Phase 14D Compatibility

The existing developer test gate (`context.enableFsrsTestRoute === true`) in `scheduleReview()` remains intact and unchanged. Phase 14J does not modify `scheduleReview()`.

## Claim Boundaries

Phase 14J does NOT claim:
- FSRS scheduling is active for users
- Intervals are computed by FSRS
- StudyRoom has FSRS rating UI

Phase 14J documents only:
- Enrollment readiness harness is in place
- Dormant FSRS metadata can be minted for eligible new cards
- SM-2-like intervals continue to govern all actual scheduling

## Deferred to Phase 14K or Later

- Live production Two-Step UI hookup in StudyRoom.jsx
- Active FSRS interval scheduling using `ts-fsrs.next()`
- Dashboard mixed-scheduler due count analytics
- Production enrollment wiring into `updateReviewScheduleFromHistoryRecord()`

## Files Changed

### New
- `docs/phase14j-fsrs-enrollment-readiness-harness.md` (this file)
- `scripts/validate-phase14j-fsrs-enrollment-readiness.js`
- `tests/unit/fsrsEnrollmentReadinessHarness.test.js`

### Modified
- `src/quiz/reviewSchedulerAdapter.js` — new-card enrollment gate + dormant scheduler
- `.github/workflows/e2e-smoke.yml` — add Phase 14J validator step
- `scripts/validate-phase14g-settings-storage.js` — expand allowedChangedFiles for Phase 14J
- `scripts/validate-phase14h-fsrs-toggle-ui.js` — expand allowedChangedFiles for Phase 14J
- `scripts/validate-phase14i-fsrs-two-step-fixture.js` — expand allowedChangedFiles for Phase 14J

## Related Phases

- Phase 14I: FSRS Two-Step Rating UI Fixture (developer-only, no data saved) — prerequisite
- Phase 14J: This phase — inert enrollment readiness harness
- Phase 14K: Production FSRS hookup (active scheduling + StudyRoom UI integration) — deferred
- Phase 14L: Dashboard mixed-scheduler analytics and Phase 14 closure — deferred
