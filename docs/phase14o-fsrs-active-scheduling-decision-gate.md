# Phase 14O — FSRS Active Scheduling Rollout Decision Gate

## Subtitle: Docs / Static Validator / CI Only

---

## Summary

Phase 14O is a **docs/static-validator/CI-only** safety decision gate before any future active FSRS scheduling phase. It does not implement active FSRS scheduling, does not call production `ts-fsrs.next()`, and makes no changes to Study Room, Dashboard, or any runtime source files. Existing SM-2-like heuristic scheduling remains the only active production scheduler.

---

## What Phase 14O Does NOT Do

- Phase 14O does **not** activate FSRS scheduling.
- Phase 14O does **not** call production `ts-fsrs.next()`.
- Phase 14O does **not** modify `src/routes/StudyRoom.jsx`.
- Phase 14O does **not** modify `src/routes/Dashboard.jsx`.
- Phase 14O does **not** modify `reviewSchedulerAdapter.js`, `reviewScheduleStorage.js`, `fsrsWrapper.js`, or `settingsStorage.js`.
- Phase 14O does **not** change `package.json` or `package-lock.json`.
- Phase 14O does **not** add dependencies.
- Phase 14O does **not** claim that active FSRS scheduling is live for users.

---

## Current State After Phase 14N

- **Active scheduler**: Existing SM-2-like heuristic scheduling remains the only active production scheduler.
- **Dormant `fsrs-planned` records**: Enrolled via Phase 14L; metadata preserved by Phase 14M; remain inert and do not drive scheduling.
- **Phase 14N memory ratings**: Inert logs only. Written to `fsrsReviewLogs` by `appendFsrsReviewLog` but not read back by the scheduler. Do not affect `dueAt`, `intervalDays`, `easeFactor`, `repetitionCount`, `correctStreak`, or `wrongCount`.
- **Production `ts-fsrs.next()`**: Remains forbidden. Not called in any production code path.
- **Dashboard mixed scheduler due-count**: Deferred. Dashboard mixed scheduler due-count display remains deferred in Phase 14O.
- **Toggle OFF behavior**: Toggle OFF preserves dormant `fsrs-planned` metadata; bridge is hidden; SM-2 flow runs normally.
- **Backup/restore**: `fsrsReviewLogs` (including Phase 14N bridge logs) survive export/import cycles via the Phase 14M backup guarantee.
- **`/dev/fsrs-ui-fixture`**: Fixture remains separate and unchanged.
- **No migration or backfill**: No import-time, app-boot, or session-start enrollment occurs.
- **No user-facing active FSRS scheduling claim** is made or implied.

---

## Phase 14O Scope

### Files created in Phase 14O:
- `docs/phase14o-fsrs-active-scheduling-decision-gate.md` — this file
- `scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js` — static validator
- `.github/workflows/e2e-smoke.yml` — Phase 14O validator registered in CI after Phase 14N

### Files NOT modified in Phase 14O:
- `src/routes/StudyRoom.jsx`
- `src/routes/Dashboard.jsx`
- `src/quiz/reviewSchedulerAdapter.js`
- `src/state/reviewScheduleStorage.js`
- `src/quiz/fsrsWrapper.js`
- `src/state/settingsStorage.js`
- `src/quiz/dataBackup.js`
- `src/state/v2BackupRestore.js`
- `package.json`
- `package-lock.json`
- E2E tests

---

## Required Future Gates Before Active Scheduling Can Ship

The following ten gates **must all be satisfied** before any future phase may call production `ts-fsrs.next()` or make FSRS the active scheduler:

### Gate 1: Explicit active-scheduling phase scope and rollback plan
Define the exact scope of the active-scheduling phase. Include a tested rollback procedure: what happens when the toggle is turned OFF or when the active-scheduling phase must be reverted, including how `fsrs-planned` records are handled on rollback.

### Gate 2: Exact mapping from Objective Correctness + Memory Rating to FSRS rating
Document and validate the exact mapping: which `fsrsReviewLog.rating` value (`Again`, `Hard`, `Good`, `Easy`) is passed to `ts-fsrs.next()`, and how Objective Correctness determines the rating when no Memory Rating log exists (e.g., wrong → `Again`, no log → fallback rating).

### Gate 3: Backward compatibility for existing `fsrsReviewLogs`
Verify that all historical `fsrsReviewLogs` entries written by Phase 14N (`activeScheduling: false`, `source: 'phase14n-studyroom-bridge'`) are safe inputs to `ts-fsrs.next()` without migration or backfill. Confirm the FSRS card state can be reconstructed from these logs.

### Gate 4: Safe handling for cards with no memory rating logs
Define and implement behavior for `fsrs-planned` cards that have zero `fsrsReviewLogs` — for example, use the default FSRS new-card state as the starting point for `ts-fsrs.next()`.

### Gate 5: Dashboard due-count strategy before or alongside activation
Define and implement the Dashboard due-count display strategy for the mixed SM-2 + FSRS scheduler state. This should be resolved before or at the same time as active scheduling activation.

### Gate 6: Backup/restore compatibility retained
Confirm that the backup/restore path (Phase 14M) correctly round-trips all new FSRS scheduling fields introduced by the active-scheduling phase (e.g., `stability`, `difficulty`, FSRS-computed `dueAt`).

### Gate 7: Toggle OFF rollback behavior
Define and test toggle OFF behavior after active scheduling has already run: which fields revert, which fields are preserved, and whether a card can safely be rescheduled by SM-2 after FSRS has written scheduling fields.

### Gate 8: Manual/browser smoke requirements
Define the manual smoke test checklist: Study Room with `fsrs-planned` card, Dashboard due-count after activation, Settings toggle ON/OFF cycle, backup export/import, and the `/dev/fsrs-ui-fixture` fixture. Document passing evidence before shipping.

### Gate 9: Unit/static validator requirements
Write unit tests and static validators covering the active-scheduling path: `ts-fsrs.next()` output correctness, scheduling field mutation, FSRS log consumption, toggle guard, and rollback guard. All tests and validators must pass before shipping.

### Gate 10: Release/claim guardrails
Confirm that no user-facing copy claims active FSRS scheduling until the active-scheduling phase is fully validated and shipped. Update docs and validators to remove the "active scheduling disabled" guard only after activation is confirmed.

---

## Recommended Future Phase Split

- **Phase 14P or Phase 15A**: Active FSRS scheduling implementation behind the existing experimental toggle (`fsrsExperimentalEnabled`). Must satisfy all ten gates above before shipping.
- **Later**: Dashboard mixed scheduler due-count display alongside or after activation.
- **Later**: Rollout/rollback audit and release claim guardrails.

---

## Claim Boundaries

- Phase 14O does **not** claim active FSRS scheduling.
- Phase 14O does **not** claim production FSRS scheduling.
- Phase 14O does **not** claim Dashboard mixed scheduler due-count is implemented.
- Phase 14O does **not** perform migration, backfill, import-time, app-boot, or session-start enrollment.
- No user-facing active FSRS scheduling claim is made or implied in Phase 14O.

---

## No UI/Runtime Changes

Phase 14O makes no changes to any UI or runtime source files. Browser smoke for Phase 14O is not required. The existing Phase 14N browser smoke remains valid:
- App root loads normally.
- `/settings` loads; FSRS experimental toggle is visible and toggleable.
- `/dev/fsrs-ui-fixture` loads and works.
- Study Room loads; normal SM-2 flow works for non-`fsrs-planned` records.
- Study Room shows memory rating bridge for eligible `fsrs-planned` cards when toggle is ON.
- Dashboard loads.

---

## Validation

Run the Phase 14O static validator:

```bash
node scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js
```

Run the full validator chain:

```bash
for f in scripts/validate-*.js; do
  echo "== $f =="
  node "$f" || exit 1
done
```

---

## Next Phase

Phase 14P or Phase 15A may implement active FSRS scheduling by:

1. Reading `fsrsReviewLogs` from `fsrs-planned` records (logged by Phase 14N).
2. Mapping each log's `rating` field to a FSRS rating and calling `ts-fsrs.next()` to compute new scheduling fields (`stability`, `difficulty`, `due`).
3. Writing the computed scheduling fields back to the record's `fsrsPayload` and updating `dueAt`/`intervalDays` from the FSRS output.

All ten future gates above **must** be satisfied before that phase ships.
