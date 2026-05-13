# Phase 14I — Study Room Two-Step FSRS Rating UI Fixture

## Summary

Phase 14I adds a standalone developer/test fixture component that validates the Two-Step FSRS Rating UX before any production hookup. The fixture is mounted on a hidden developer route (`/dev/fsrs-ui-fixture`) that does not appear in main navigation.

**Baseline**: Phase 14G (settings storage schema) and Phase 14H (FSRS experimental toggle UI) are both merged to `main`.

---

## What Phase 14I Adds

| File | Purpose |
|---|---|
| `src/components/study/FsrsTwoStepScaffold.jsx` | Standalone fixture component — state machine + mock data |
| `src/routes/FsrsUiFixture.jsx` | Page wrapper for the fixture route |
| `src/routes/routeConfig.js` | Hidden `/dev/fsrs-ui-fixture` route (showInNav: false) |
| `docs/phase14i-fsrs-two-step-rating-ui-fixture.md` | This document |
| `tests/unit/fsrsTwoStepScaffold.test.jsx` | Vitest unit tests |
| `scripts/validate-phase14i-fsrs-two-step-fixture.js` | Static validator |

---

## What Phase 14I Does NOT Change

- `src/routes/StudyRoom.jsx` — **not changed**. Production Study Room is unchanged.
- `src/quiz/reviewSchedulerAdapter.js` — **not changed**. No adapter routing.
- `src/quiz/fsrsWrapper.js` — **not changed**. No scheduling logic.
- `src/state/reviewScheduleStorage.js` — **not changed**. No review records.
- `src/state/settingsStorage.js` — **not changed**. No settings writes.
- `src/quiz/dataBackup.js` — **not changed**.
- `src/state/v2BackupRestore.js` — **not changed**.
- `package.json` / `package-lock.json` — **not changed**. No new dependencies.

---

## Isolation Invariants

- **No data is saved.** The fixture emits a fixture-only log object in memory only. No localStorage writes. No review records written.
- **No scheduling occurs.** The fixture component does not import `reviewSchedulerAdapter.js` or `fsrsWrapper.js`. No FSRS scheduling calls are made.
- **No enrollment runtime.** No `schedulerKind` assignment. No new-card enrollment logic.
- **No adapter routing.** `reviewSchedulerAdapter.js` is not changed and does not reference the fixture route.
- **No production FSRS route.** `/dev/fsrs-ui-fixture` is a developer fixture only; it does not appear in `navRoutes`.
- **Wrong auto-maps to Again only inside fixture.** When the user selects "Wrong" in objective correctness, the fixture assigns `rating=Again` automatically and skips Hard/Good/Easy. Hard/Good/Easy are not rendered on the wrong path.
- **Right unlocks Hard/Good/Easy only inside fixture.** The subjective effort buttons appear only after "Right" is selected.
- Safety banner is always visible: `FSRS UI FIXTURE: TEST MODE ONLY — NO DATA IS SAVED OR SCHEDULED.`

---

## State Machine

```
question ──[Reveal answer]──▶ objective
                               │
                    [Wrong]────┘  ──▶ result  (memoryRating = Again)
                    [Right]────┘  ──▶ effort
                                         │
                              [Hard]─────┘  ──▶ result (memoryRating = Hard)
                              [Good]─────┘  ──▶ result (memoryRating = Good)
                              [Easy]─────┘  ──▶ result (memoryRating = Easy)
                                                    │
                                         [Try again]┘  ──▶ question
```

**Rating copy**:
- Again: Failed to recall / Complete blackout.
- Hard: Recalled with severe mental effort or hesitation.
- Good: Recalled smoothly with normal effort.
- Easy: Instant recall; too simple.

---

## Scope Control

Phase 14I is an isolated fixture only. No production Study Room changes are made. No user-facing FSRS scheduling claim. No misleading copy suggesting FSRS is active for users.

Phase 14J may decide production hookup — connecting the fixture UI to live production data, the scheduler adapter, and new-card enrollment runtime. That decision is deferred.

Phase 14H settings storage (fsrsExperimentalEnabled, settingsStorage, localStorageSync) are not changed and remain the authoritative FSRS toggle state.

Phase 14G settings storage schema (`shimeV2SettingsV1`) is not changed.

---

## FSRS Background

The two-step separation enforces:
1. **Objective correctness** (Wrong / Right) — feeds scoring and mastery in the future, separate from memory rating
2. **Subjective effort rating** (Hard / Good / Easy) — feeds FSRS scheduling in the future, only available after a correct recall

This prevents "Ease Hell" (users pressing Hard when they actually failed), consistent with the FSRS mathematical requirement that stability resets on failed recall (rating=Again).

---

## Claim Boundaries

- FSRS scheduling is **not active** for users.
- The fixture does not migrate existing SM-2 cards.
- The fixture does not change current due dates.
- The production Study Room continues to use the existing SM-2-based scheduler.
- No Dashboard mixed-scheduler due count is added.
