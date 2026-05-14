# Phase 14L — Production Enrollment Wiring (Dormant, No UI)

## Summary

Phase 14L wires the dormant FSRS enrollment helpers from Phase 14J into the
production review schedule update funnel.

The only call site is `updateReviewScheduleFromHistoryRecord()` in
`src/state/reviewScheduleStorage.js`. No UI files are modified.

---

## What Phase 14L does

- Calls `isFsrsNewCardEnrollmentEligible()` and `scheduleDormantFsrsReview()`
  from `src/quiz/reviewSchedulerAdapter.js` inside
  `updateReviewScheduleFromHistoryRecord()`.
- Eligible items receive dormant FSRS metadata
  (`schedulerKind: 'fsrs-planned'`, `schedulerVersion: 'phase14j-dormant-readiness'`,
  `fsrsPayload`, `fsrsReviewLogs`).
- All other items continue to receive normal SM-2-like heuristic scheduling.

---

## What Phase 14L does NOT do

- Phase 14L does not modify `src/routes/StudyRoom.jsx`.
- Phase 14L does not modify `src/routes/Dashboard.jsx`.
- Active FSRS scheduling remains disabled.
- Production `ts-fsrs.next()` is not used anywhere.
- Intervals and due dates remain SM-2-like for all items, including dormant
  FSRS-enrolled items.
- No production Two-Step UI (Again / Hard / Good / Easy) is added.
- No migration or backfill of existing cards occurs.
- No enrollment at import, no enrollment at app boot, no enrollment at session start.
- No enrollment happens in the Library, Settings toggle, Dashboard, or on route
  mount.

---

## Eligibility gate (strict)

Dormant enrollment may happen only when all of the following are true at the
time `updateReviewScheduleFromHistoryRecord()` processes a result:

1. `settings.fsrsExperimentalEnabled === true` (toggle re-read at processing
   time, never cached from session start).
2. The current event is a completed review result (status is `correct`, `wrong`,
   or `unanswered`).
3. `itemId` is non-empty.
4. No existing review schedule record exists for the item before this result.
5. No prior study history exists for the item before this result (the current
   session is excluded from the prior-history check by session id).
6. No existing `schedulerKind` exists for this item (covered by condition 4).
7. No existing `fsrsPayload` exists for this item (covered by condition 4).

---

## Toggle policy

- Toggle ON enables new dormant enrollment for strictly eligible items.
- Toggle OFF blocks all new dormant enrollment.
- Toggle OFF does not delete or modify existing `fsrsPayload` or
  `fsrsReviewLogs` on already-enrolled items.
- The toggle is re-read from `getSettings()` at the start of each
  `updateReviewScheduleFromHistoryRecord()` call.

---

## Prior-history policy

- `readStudyHistory()` is called at processing time to obtain the full study
  history.
- The current session (identified by `historyRecord.id`) is filtered out before
  the prior-history check, because the session may already be saved to storage
  by the time the schedule update runs.
- Any other session that contains the item blocks enrollment.

---

## Dormant scheduling policy

- `scheduleDormantFsrsReview()` computes SM-2-like intervals and due dates.
- It stamps inert FSRS metadata (`schedulerKind`, `schedulerVersion`,
  `fsrsPayload`, `fsrsReviewLogs`) on the resulting record.
- It does not call `ts-fsrs.next()`.
- It does not claim active FSRS scheduling.

---

## Metadata preservation policy

- `normalizeScheduleRecord()` / `getPreservedFsrsFields()` in storage preserves
  `schedulerKind`, `schedulerVersion`, `fsrsPayload`, and `fsrsReviewLogs`
  through every subsequent read/write/normalize cycle.
- `fsrsReviewLogs` is capped at `FSRS_REVIEW_LOG_CAP = 20` entries.
- Existing dormant metadata is never deleted when the toggle is OFF.

---

## Active scheduling disabled

- `ts-fsrs.next()` is not called in `reviewScheduleStorage.js`,
  `reviewSchedulerAdapter.js`, or any production path touched by Phase 14L.
- `scheduleReview()` in the adapter still throws for `fsrs-planned` records
  without `enableFsrsTestRoute === true` (Phase 14A invariant preserved).

---

## Claim boundaries

- Phase 14L does not claim that FSRS scheduling is active.
- Phase 14L does not claim that study intervals are FSRS-computed.
- Phase 14L only claims: eligible new-card first-review events receive dormant
  FSRS metadata for future readiness.

---

## Deferred work

- Phase 14N or later: production Two-Step UI (Again / Hard / Good / Easy)
  integrated into StudyRoom.
- Phase 14O or later: active FSRS scheduling via `ts-fsrs.next()`.
- Phase 14P or later: Dashboard mixed-scheduler due count.
- No migration or backfill of existing cards is planned in Phase 14L, 14M, or
  14N.

---

## Files changed

| File | Change |
|---|---|
| `src/state/reviewScheduleStorage.js` | Wires dormant enrollment in `updateReviewScheduleFromHistoryRecord()` |
| `src/quiz/reviewSchedulerAdapter.js` | Minimal circular-dep fix: hardcodes `SCHEDULER_VERSION_CURRENT` literal |
| `tests/unit/fsrsProductionEnrollmentWiring.test.js` | New unit tests (15 cases) |
| `docs/phase14l-production-enrollment-wiring-dormant-no-ui.md` | This doc |
| `scripts/validate-phase14l-production-enrollment-wiring.js` | New static validator |
| `.github/workflows/e2e-smoke.yml` | Adds Phase 14L validator step |
| `scripts/validate-phase14k-fsrs-readiness-audit.js` | Adds Phase 14L allowlist entries |
| `scripts/validate-phase14j-fsrs-enrollment-readiness.js` | Adds Phase 14L allowlist entries |
