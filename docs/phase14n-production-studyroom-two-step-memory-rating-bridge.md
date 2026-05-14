# Phase 14N — Production Study Room Two-Step Memory Rating Bridge

## Subtitle: Inert Log Only, No Active Scheduling

---

## Summary

Phase 14N adds a production Study Room memory rating bridge for cards that already carry dormant `fsrs-planned` metadata (set by Phase 14L). The bridge is gated strictly and records an inert, write-only subjective memory rating log. It does not activate FSRS scheduling, does not call `ts-fsrs.next()`, and does not affect scoring, mastery, progress, or due/interval math.

---

## UI Gate (all must be true)

```
settings.fsrsExperimentalEnabled === true
AND record.schedulerKind === 'fsrs-planned'
AND record.fsrsPayload exists (isPlainObject)
AND current item is in post-answer/result state (checked or flashcard revealed)
```

The bridge **must not show** for:
- SM-2 / heuristic records without `fsrs-planned` metadata
- Cards without `fsrsPayload`
- Toggle OFF
- Before answer check or flashcard reveal
- Dashboard, Library, Settings, `/dev/fsrs-ui-fixture`

---

## State Machine

```
question → result(correct | wrong | unanswered)
         │
         ├─ gate=false → continue (unchanged today's path)
         │
         └─ gate=true
              │
              ├─ wrong/unanswered → auto-log Again → continue
              │
              └─ correct
                   │
                   ├─ Hard / Good / Easy (user selects) → log → continue
                   └─ Continue without rating → no log → continue
```

---

## Data Persistence Policy

- **Wrong/unanswered**: append inert `{ rating: 'Again', source: 'phase14n-studyroom-bridge', activeScheduling: false, reviewedAt, objectiveCorrect: false }` to `fsrsReviewLogs`.
- **Correct + rating selected**: append inert `{ rating, source: 'phase14n-studyroom-bridge', activeScheduling: false, reviewedAt, objectiveCorrect: true }`.
- **Continue without rating**: no log appended.
- All appended logs are write-only in Phase 14N. Nothing reads them back into scheduling.
- Existing `FSRS_REVIEW_LOG_CAP = 20` is respected. Oldest logs are dropped on overflow.

---

## Correctness/Scoring/Scheduling Boundary

- The bridge fires **after** objective correctness is finalized. The bridge cannot change:
  - correctness
  - score
  - mastery
  - recommendation
  - due date (`dueAt`)
  - interval (`intervalDays`)
  - SM-2 fields (`easeFactor`, `repetitionCount`, `correctStreak`, `wrongCount`)
  - `schedulerKind` or `schedulerVersion`
- `updateReviewScheduleFromHistoryRecord()` is called at session end as before; it does not read the Phase 14N bridge logs.
- `scheduleDormantFsrsReview()` (Phase 14L enrollment) is unchanged.

---

## Toggle Policy

- Toggle is re-read at the point of bridge gate evaluation, never cached for a session.
- Toggle OFF mid-session: subsequent items show no bridge; previously appended logs remain in storage.
- Toggle ON but no `fsrs-planned` record: bridge does not show. Toggle does not retroactively enroll SM-2 cards.
- Toggle OFF with `fsrs-planned` record: bridge is hidden; SM-2 flow runs normally; dormant metadata is preserved untouched (Phase 14M guarantee).

---

## Metadata Preservation Policy

- `appendFsrsReviewLog` only modifies `fsrsReviewLogs`. It does not touch `dueAt`, `intervalDays`, `easeFactor`, `repetitionCount`, `correctStreak`, `wrongCount`, `schedulerKind`, or `schedulerVersion`.
- `fsrsPayload` is preserved by the existing `normalizeScheduleRecord` → `getPreservedFsrsFields` path on every write.
- Phase 14M backup/restore preservation of `fsrsReviewLogs` guarantees that bridge logs survive export/import cycles.

---

## Active Scheduling Disabled

- Phase 14N does **not** call `ts-fsrs.next()`.
- Phase 14N does **not** import `fsrsWrapper.js`.
- Active FSRS scheduling remains disabled.
- No production FSRS scheduling claim may be made.
- User-facing copy must not say "FSRS"; it uses "memory rating" and "experimental".

---

## Copy Boundaries

Production Study Room copy uses:
- "Experimental: memory rating" (section header)
- "Your study schedule is not changed by this rating yet."
- "How did this recall feel?" (for correct items)
- "Needs another review. Your study schedule is not changed by this rating yet." (for wrong items)
- "Continue without rating" (explicit skip option)
- Rating descriptions: Hard — Recalled with serious effort. / Good — Recalled with normal effort. / Easy — Instant recall.

The word "FSRS" is forbidden in user-facing Study Room copy.

---

## Wrong/Unanswered Behavior

- Does not show Hard/Good/Easy rating buttons.
- Appends inert `Again` log for eligible dormant records.
- Shows: "Needs another review. Your study schedule is not changed by this rating yet."
- Normal continue/next flow is unaffected.

---

## Correct Behavior

- Shows Hard / Good / Easy buttons.
- Shows explicit "Continue without rating" option.
- No auto-default to Good.
- No auto-timeout.
- After rating: appends inert log, shows confirmation.
- After skip: no log, normal flow.

---

## Continue without Rating

- User may skip rating for correct answers.
- No log appended on skip.
- Normal flow continues.
- Scheduling unchanged.

---

## Scope

### Files modified:
- `src/routes/StudyRoom.jsx` — bridge rendering and rating handlers
- `src/quiz/reviewSchedulerAdapter.js` — `shouldShowFsrsTwoStepBridge` predicate
- `src/state/reviewScheduleStorage.js` — `appendFsrsReviewLog` write-only helper
- `.github/workflows/e2e-smoke.yml` — Phase 14N validator registration

### Files created:
- `src/components/study/FsrsProductionMemoryRatingBridge.jsx` — bridge UI component
- `docs/phase14n-production-studyroom-two-step-memory-rating-bridge.md` — this file
- `tests/unit/fsrsProductionStudyRoomTwoStepBridge.test.jsx` — unit tests
- `scripts/validate-phase14n-production-studyroom-two-step-bridge.js` — static validator

### Files NOT modified:
- `src/routes/Dashboard.jsx` — unchanged
- `src/quiz/fsrsWrapper.js` — unchanged
- `src/state/settingsStorage.js` — unchanged
- `src/quiz/dataBackup.js` — unchanged
- `src/state/v2BackupRestore.js` — unchanged
- `package.json` — unchanged
- `package-lock.json` — unchanged
- E2E tests — unchanged

---

## First-Review Timing Note

On the very first review of a brand new card with toggle ON, the bridge will **not** show, because the `fsrs-planned` record doesn't yet exist when the result is evaluated — it gets created at session end by Phase 14L's `updateReviewScheduleFromHistoryRecord()`. The bridge appears starting on the **second** review of that card. This is correct and expected behavior.

---

## Dashboard

Dashboard remains unchanged. No mixed-scheduler analytics in Phase 14N.

---

## Backup/Restore

Backup and restore are unchanged. Phase 14M guarantees that `fsrsReviewLogs` (including Phase 14N bridge logs) survive export/import cycles.

---

## Fixture

`/dev/fsrs-ui-fixture` and `FsrsTwoStepScaffold.jsx` remain unchanged and continue to work independently.

---

## Claim Boundaries

- Phase 14N does NOT claim active FSRS scheduling.
- Phase 14N does NOT claim production FSRS scheduling.
- Phase 14N does NOT claim Dashboard mixed-scheduler due counts.
- Phase 14N does NOT migrate or backfill existing SM-2 cards.
- Phase 14N does NOT perform import-time, app-boot, or session-start enrollment.

---

## Next Phase

Phase 14O or later may handle active FSRS scheduling by reading `fsrsReviewLogs` from Phase 14N into a scheduling decision and calling `ts-fsrs.next()` for `fsrs-planned` records.
