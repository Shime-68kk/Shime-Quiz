# Phase 14K — FSRS Readiness Audit / Regression Hardening

## Status

COMPLETE — Readiness Audit and Regression Hardening only. Active FSRS scheduling remains DISABLED.

## Purpose

Phase 14K is a light safety-lock phase after the Phase 14J enrollment readiness harness. It locks the project boundary with a docs audit, a static validator, and a CI registration step before any future heavy runtime work. Phase 14J readiness remains dormant/inert. No new FSRS runtime capability is introduced.

## What Phase 14K Does

- Adds `docs/phase14k-fsrs-readiness-audit.md` (this file) — audits and documents the Phase 14J boundary
- Adds `scripts/validate-phase14k-fsrs-readiness-audit.js` — static validator enforcing all Phase 14K safety boundaries
- Updates `.github/workflows/e2e-smoke.yml` — registers Phase 14K validator in CI after Phase 14J validator
- Updates historical validators (Phase 14G–14J) — adds Phase 14K exact allowlist entries for cascade safety

## What Phase 14K Does NOT Do

- Active FSRS scheduling remains disabled. Intervals still use proven SM-2-like heuristic logic.
- No production `ts-fsrs.next()` call anywhere in production scheduling paths.
- No Production Study Room Two-Step UI change. StudyRoom.jsx is unchanged.
- No Dashboard mixed-scheduler UI change. Dashboard.jsx is unchanged.
- No enrollment at import time, app boot, or session start.
- No migration or backfill of existing SM-2 cards.
- No deletion of `fsrsPayload` or `fsrsReviewLogs` on toggle OFF.
- No new source files under `src/`.
- No new test files under `tests/`.
- No dependency changes to `package.json` or `package-lock.json`.
- No user-facing claim that FSRS scheduling is active.

## Audit Scope

Phase 14K audits and locks the following Phase 14J invariants:

### Enrollment Gate Invariants
- `isFsrsNewCardEnrollmentEligible()` is exported from `reviewSchedulerAdapter.js`
- Gate requires: toggle ON, no priorRecord, valid itemId, no prior study history
- No enrollment at import time, app boot, or session start

### Dormant Scheduler Invariants
- `scheduleDormantFsrsReview()` is exported from `reviewSchedulerAdapter.js`
- `FSRS_DORMANT_SCHEDULER_VERSION = 'phase14j-dormant-readiness'` is defined
- Dormant scheduler is NOT wired into `scheduleReview()` — it still throws for fsrs-planned records without `enableFsrsTestRoute`
- Phase 14D test gate (`context.enableFsrsTestRoute === true`) remains intact

### Metadata Preservation Invariants
- `fsrsPayload` and `fsrsReviewLogs` are preserved through storage reads/writes
- toggle OFF does NOT delete existing FSRS metadata
- Existing `fsrsPayload` is preserved by `scheduleDormantFsrsReview()`

### Isolation Invariants
- `reviewSchedulerAdapter.js` does not reference `localStorage` or `process.env`
- `reviewSchedulerAdapter.js` does not reference `fsrsExperimentalEnabled` (callers pass `toggleEnabled`)
- StudyRoom.jsx has no four-rating FSRS rating UI and no dormant scheduler references
- Dashboard.jsx has no dormant scheduler or enrollment references

## Scope Boundaries

Phase 14K is docs/static-validator/CI only. The following files must NOT change:

- `src/quiz/reviewSchedulerAdapter.js`
- `src/quiz/fsrsWrapper.js`
- `src/state/reviewScheduleStorage.js`
- `src/state/settingsStorage.js`
- `src/quiz/dataBackup.js`
- `src/state/v2BackupRestore.js`
- `src/routes/StudyRoom.jsx`
- `src/routes/Dashboard.jsx`
- `package.json`
- `package-lock.json`

## Toggle OFF Behavior

When the FSRS toggle is OFF (`fsrsExperimentalEnabled: false`):

- No new cards receive enrollment metadata
- Existing dormant FSRS metadata (`fsrsPayload`, `fsrsReviewLogs`) is preserved — never deleted
- Scheduling intervals remain SM-2-like heuristic behavior
- If the toggle is re-enabled, dormant FSRS state resumes from the saved data

## schedulerKind Assignment

`schedulerKind: 'fsrs-planned'` is set only by `scheduleDormantFsrsReview()`. It is never assigned from:
- StudyRoom.jsx
- Dashboard.jsx
- Settings toggle
- import/restore paths

`scheduleDormantFsrsReview()` is NOT yet called from any production path in Phase 14K.

## Claim Boundaries

Phase 14K does NOT claim:
- FSRS scheduling is active for users
- Intervals are computed by FSRS
- StudyRoom.jsx has FSRS rating UI
- Dashboard.jsx shows mixed scheduler due counts

Phase 14K documents only:
- Phase 14J enrollment readiness harness is in place and audited
- Dormant FSRS metadata scaffolding is in place
- SM-2-like intervals continue to govern all actual scheduling
- Phase 14J invariants are validated by static checks in CI

## Deferred to Phase 14L or Later

- Live production Two-Step UI hookup in StudyRoom.jsx
- Active FSRS interval scheduling using `ts-fsrs.next()`
- Dashboard mixed-scheduler due count analytics
- Production enrollment wiring into `updateReviewScheduleFromHistoryRecord()`
- Any import/session-start enrollment path

## Files Changed

### New
- `docs/phase14k-fsrs-readiness-audit.md` (this file)
- `scripts/validate-phase14k-fsrs-readiness-audit.js`

### Modified
- `.github/workflows/e2e-smoke.yml` — add Phase 14K validator step
- `scripts/validate-phase14j-fsrs-enrollment-readiness.js` — expand allowedChangedFiles for Phase 14K
- `scripts/validate-phase14i-fsrs-two-step-fixture.js` — expand allowedChangedFiles for Phase 14K
- `scripts/validate-phase14h-fsrs-toggle-ui.js` — expand allowedChangedFiles for Phase 14K
- `scripts/validate-phase14g-settings-storage.js` — expand allowedChangedFiles for Phase 14K

## Related Phases

- Phase 14J: FSRS Enrollment Guard and Production Readiness Harness — prerequisite
- Phase 14K: This phase — readiness audit / regression hardening
- Phase 14L: Production FSRS hookup (active scheduling + StudyRoom UI integration) — deferred
- Phase 15: Dashboard mixed-scheduler analytics and Phase 14 closure — deferred
