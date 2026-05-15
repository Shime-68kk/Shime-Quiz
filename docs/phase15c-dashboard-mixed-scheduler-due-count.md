# Phase 15C — Dashboard Mixed Scheduler Due Count / Display

## Status

FINAL_STATUS=0 — Phase 15C PASS

## Scope

Phase 15C updates Dashboard due-count/display for mixed scheduler families. It does not change scheduling logic.

## What This Phase Does

- Adds `computeMixedSchedulerDueSummary` pure helper to `src/quiz/reviewSchedulerAdapter.js`. This helper counts due records across all scheduler families (SM-2/current-heuristic, `fsrs-planned`, `fsrs-active`) using the persisted `dueAt` field, never the scheduler label alone.
- Updates `src/routes/Dashboard.jsx` to import and use this helper. A narrow inline note is shown only when FSRS-family due records exist (`fsrsFamilyDueCount > 0`). Copy uses "experimental" language — no overclaim.

## What This Phase Does NOT Do

- It does **not** call `ts-fsrs.next()`.
- It does **not** change `scheduleReview`, `scheduleFsrsReview`, `scheduleFsrsReviewForTest`, or any scheduling interval logic.
- It does **not** modify `StudyRoom.jsx`.
- It does **not** modify `FsrsProductionMemoryRatingBridge.jsx`.
- It does **not** modify `fsrsWrapper.js`.
- It does **not** modify `settingsStorage.js`.
- It does **not** expose `fsrsActiveSchedulingEnabled` in the UI or settings.
- It does **not** change backup/import runtime (`dataBackup.js`, `v2BackupRestore.js`).
- It does **not** implement hybrid local-first/sync.
- It does **not** add dependencies or modify `package.json`/`package-lock.json`.

## Counting Policy

A record is due if its persisted `dueAt` timestamp ≤ now. Scheduler kind is not used as a filter — all records with a valid, past-due `dueAt` are counted regardless of whether they are SM-2, `fsrs-planned`, or `fsrs-active`. Unknown scheduler kinds are normalized to current/SM-2 by `getSchedulerKind` and are included in the due total.

Deduplication by `itemId` is performed inside `computeMixedSchedulerDueSummary` to prevent double-counting if the same item ID appears more than once in the record array.

## UI Copy Policy

The narrow breakdown note reads (Vietnamese + English):

> "Bao gồm N thẻ dùng lịch học bộ nhớ thử nghiệm trong tổng số câu đến hạn. Some cards may use experimental memory scheduling."

Shown **only** when `fsrsFamilyDueCount > 0`. Not shown for normal users who have no FSRS-family records. Does not mention `fsrsActiveSchedulingEnabled`. Does not overclaim: no "FSRS is broadly active", no "cloud sync is available", no AI guarantee language.

## Scheduler Family Definitions

| schedulerKind | Family | Counted by computeMixedSchedulerDueSummary |
|---|---|---|
| `sm2-heuristic`, `current-heuristic`, (default) | SM-2 | dueCount only |
| `fsrs-planned` | FSRS-family | dueCount + fsrsFamilyDueCount |
| `fsrs-active` | FSRS-family | dueCount + fsrsFamilyDueCount |
| unknown / future | SM-2 (normalized) | dueCount only |

## Active Scheduling Status

Active FSRS scheduling remains **double-gated** and **default OFF** from Phase 15B:
- Gate 1: `fsrsExperimentalEnabled === true` (user-controlled toggle)
- Gate 2: `fsrsActiveSchedulingEnabled === true` (internal flag, default false, not user-visible)

Phase 15C does not change these gates, does not expose Gate 2 in the UI, and does not claim active FSRS scheduling is generally live.

## SM-2/Current Records

Normal SM-2/current-heuristic records are fully supported. Due counts, display, and Study Room behavior are unchanged for users with no FSRS-family records.

## File Scope

### Source (2 files)

- `src/quiz/reviewSchedulerAdapter.js` — adds `computeMixedSchedulerDueSummary` pure export
- `src/routes/Dashboard.jsx` — imports helper, renders `MixedSchedulerDueNote` inline component

### Tests

- `tests/unit/dashboardMixedSchedulerDueCount.test.jsx` — 14 tests

### CI Gate

- `docs/phase15c-dashboard-mixed-scheduler-due-count.md` — this file
- `scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js` — static validator
- `.github/workflows/e2e-smoke.yml` — Phase 15C validator step added after Phase 15B

## Backup / Import

Backup and import runtime (`dataBackup.js`, `v2BackupRestore.js`) are unchanged. Phase 14M backup/restore hardening is unaffected.

## Handoff for Phase 16

Phase 16: Hybrid local-first/sync — deferred, not part of Phase 15.

Dashboard mixed scheduler display is now narrow and claim-safe. Future phases may broaden the breakdown if scheduler diversity grows.

## Protected Files — Unchanged

- `src/routes/StudyRoom.jsx`
- `src/components/study/FsrsProductionMemoryRatingBridge.jsx`
- `src/quiz/fsrsWrapper.js`
- `src/state/settingsStorage.js`
- `src/quiz/dataBackup.js`
- `src/state/v2BackupRestore.js`
- `package.json` / `package-lock.json`
