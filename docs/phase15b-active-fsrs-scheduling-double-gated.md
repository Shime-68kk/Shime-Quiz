# Phase 15B — Active FSRS Scheduling: Double-Gated, Default OFF, No Dashboard

## Status

FINAL_STATUS=0 — Phase 15B PASS

## Scope

Phase 15B activates production `ts-fsrs.next()` scheduling for FSRS-enrolled cards behind a strict double gate. No Dashboard changes. No user-visible settings change. No hybrid sync. Default OFF.

## Double Gate Contract

```
doubleGateOn = settings.fsrsExperimentalEnabled === true
            && settings.fsrsActiveSchedulingEnabled === true
```

Both flags must be boolean `true` at runtime. Either flag false → SM-2 fallback (no demotion).

`fsrsActiveSchedulingEnabled` is **internal-only**: not in the settings UI, not user-visible. Default `false` in `getDefaultSettings()` and `normalizeSettings()`.

## File Scope

### Source (4 files)

- `src/quiz/reviewSchedulerAdapter.js` — double-gate `scheduleReview`, `scheduleActiveFsrsOrFallback`, `resolveActiveSchedulingRating`, `scheduleCurrentReviewPreservingFsrs`; `fsrs-active` added to `FSRS_KIND_ALIASES`
- `src/quiz/fsrsWrapper.js` — `toRawFsrsCardFromPayload`, `scheduleFsrsReview` (only production `ts-fsrs.next()` call site), `FSRS_ACTIVE_SCHEDULER_KIND`, `FSRS_ACTIVE_SCHEDULER_VERSION`
- `src/state/settingsStorage.js` — `fsrsActiveSchedulingEnabled: false` in defaults and normalization
- `src/state/reviewScheduleStorage.js` — `resolveMemoryRatingFromLogs`, Phase 15B path in `updateReviewScheduleFromHistoryRecord`, `appendFsrsReviewLog` widened to include `fsrs-active`

### Tests (9 files)

- `tests/unit/fsrsActiveSchedulingDoubleGated.test.js` — 32 new tests (new file)
- 8 historical test files updated for Phase 15B invariant changes

### CI Gate

- `docs/phase15b-active-fsrs-scheduling-double-gated.md` — this file
- `scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js` — static validator
- `.github/workflows/e2e-smoke.yml` — Phase 15B validator step added after Phase 15A

## Rating Mapping

| Outcome / Context | FSRS Rating | Notes |
|---|---|---|
| `continueWithoutRating: true` | SM-2 fallback | Never calls `ts-fsrs.next()` |
| `memoryRating: 'Hard'` | Hard | Passthrough |
| `memoryRating: 'Good'` | Good | Passthrough |
| `memoryRating: 'Easy'` | Easy | Passthrough |
| `outcome: 'wrong'` | Again | |
| `outcome: 'unanswered'` | Again | |
| `outcome: 'correct'` (no memoryRating) | Good | Default |
| defensive fallback | Good | Unknown outcome |

## Session Log Detection

`resolveMemoryRatingFromLogs(record, sessionStartedAt)` scans `record.fsrsReviewLogs` for the most-recent log where `log.reviewedAt >= sessionStartedAt`. Returns the rating string or `null`. A `null` result → `continueWithoutRating: true` in context → SM-2 fallback.

## SM-2 Fallback Policy

When the double gate is off OR `continueWithoutRating: true` OR payload validation fails OR `scheduleFsrsReview` throws:
- `scheduleCurrentReviewPreservingFsrs` applies SM-2 intervals
- `schedulerKind` preserved (no demotion from `fsrs-planned` or `fsrs-active`)
- `fsrsPayload` deep-copied into result unchanged
- `fsrsReviewLogs` carried forward unchanged

## Dormant Record Policy

Phase 14L dormant-enrolled records (`schedulerKind: 'fsrs-planned'`) with minimal seeds `{state:'New', stability:1.0, difficulty:5.0, reps:0}` are compatible. `toRawFsrsCardFromPayload` zero-defaults absent fields except `stability` (required).

## Dashboard Policy

`Dashboard.jsx` is **unchanged** in Phase 15B. No mixed scheduler UX. No exposure of `fsrsActiveSchedulingEnabled` via settings UI.

## Production Call Site

`scheduleFsrsReview` in `src/quiz/fsrsWrapper.js` is the **only** approved production `ts-fsrs.next()` call site. The adapter delegates to it; the adapter itself never calls `.next()` directly.

## Backup

`fsrsPayload` and `fsrsReviewLogs` are preserved through all SM-2 fallback paths. Phase 14M backup/restore hardening is unaffected.

## Rollback

Set `fsrsActiveSchedulingEnabled: false` (default). All records fall back to SM-2. No data loss. No record demotion.

## Gates

- Gate 1: `fsrsExperimentalEnabled === true` (user-controlled toggle)
- Gate 2: `fsrsActiveSchedulingEnabled === true` (internal flag)
- Gate 3: `validateFsrsPayload` passes (payload present and stability valid)
- Gate 4: `scheduleFsrsReview` does not throw (ts-fsrs internal gate)
- Gate 5: `resolveMemoryRatingFromLogs` returns non-null (session log present)
- Gate 6: `continueWithoutRating` must not be set (SM-2 fallback otherwise)

## Protected Files — Unchanged

- `src/routes/StudyRoom.jsx`
- `src/routes/Dashboard.jsx`
- `src/components/study/FsrsProductionMemoryRatingBridge.jsx`
- `src/quiz/dataBackup.js`
- `src/state/v2BackupRestore.js`
- `package.json` / `package-lock.json`

## Handoff for Phase 15C

Phase 15C: Dashboard mixed scheduler UX.
- `Dashboard.jsx` may be modified
- Potentially expose `fsrsActiveSchedulingEnabled` via settings UI
- All Phase 15B invariants must be preserved: double gate, SM-2 fallback policy, no demotion, `ts-fsrs.next()` only via `scheduleFsrsReview`

Phase 16: Hybrid local-first/sync — deferred, not part of Phase 15.
