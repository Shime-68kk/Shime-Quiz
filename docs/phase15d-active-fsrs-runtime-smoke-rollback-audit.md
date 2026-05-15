# Phase 15D — Active FSRS Runtime Smoke / Rollback Audit

## Status

FINAL_STATUS=0 — Phase 15D PASS

## Scope

Phase 15D provides audit and hardening of the active FSRS runtime path and rollback/fallback behavior after Phase 15B/15C. It does **not** add new scheduling behavior.

## What This Phase Does

- Adds `docs/phase15d-active-fsrs-runtime-smoke-rollback-audit.md` (this file).
- Adds `tests/unit/fsrsActiveRuntimeRollbackAudit.test.js` (14 new tests).
- Adds `scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js` (static validator).
- Registers Phase 15D validator in `.github/workflows/e2e-smoke.yml` after Phase 15C.

## What This Phase Does NOT Do

- It does **not** add new scheduling behavior or features.
- It does **not** add new UI.
- It does **not** add new `ts-fsrs.next()` call sites.
- It does **not** change `StudyRoom.jsx`.
- It does **not** change `Dashboard.jsx`.
- It does **not** change `FsrsProductionMemoryRatingBridge.jsx`.
- It does **not** change backup/import runtime (`dataBackup.js`, `v2BackupRestore.js`).
- It does **not** expose `fsrsActiveSchedulingEnabled` in any UI or settings panel.
- It does **not** implement hybrid local-first/sync.
- It does **not** add dependencies or modify `package.json`/`package-lock.json`.
- It does **not** add Dashboard display expansion beyond Phase 15C.
- It does **not** make broad public claims that FSRS scheduling is active for everyone.

## Active FSRS Scheduling Status

Active FSRS scheduling remains **double-gated** and **default OFF** from Phase 15B:

- Gate 1: `fsrsExperimentalEnabled === true` (user-controlled toggle)
- Gate 2: `fsrsActiveSchedulingEnabled === true` (internal flag, default false, not user-visible)
- Gate 3: `validateFsrsPayload` passes (payload present and stability valid)
- Gate 4: `scheduleFsrsReview` does not throw (ts-fsrs internal gate)
- Gate 5: `resolveMemoryRatingFromLogs` returns non-null (session log present)
- Gate 6: `continueWithoutRating` must not be set (SM-2 fallback otherwise)

`fsrsActiveSchedulingEnabled` is **internal-only**: not in the settings UI, not user-visible. Default `false` in `getDefaultSettings()` and `normalizeSettings()`.

## Default OFF Safety

- `getDefaultSettings()` sets `fsrsActiveSchedulingEnabled: false`.
- Missing stored settings default to `false` (lazy read, no write on miss).
- Invalid stored values (`"true"`, `1`, `null`) normalize to `false` — only boolean `true` passes.
- Active scheduler does not run unless both `fsrsExperimentalEnabled === true` AND `fsrsActiveSchedulingEnabled === true`.

## Rollback / Fallback Policy

**Toggle OFF rollback:**
- Setting `fsrsExperimentalEnabled: false` stops future active scheduling immediately.
- Setting `fsrsActiveSchedulingEnabled: false` (internal default) stops future active scheduling.
- Existing `fsrs-active` records keep their `fsrsPayload`, `fsrsReviewLogs`, and `schedulerKind`.
- No mass reschedule of existing records.
- The next review for any FSRS-family record falls back to SM-2-like intervals via `scheduleCurrentReviewPreservingFsrs`.

**Fallback conditions (SM-2 path, no crash):**
- `fsrsPayload` malformed → `validateFsrsPayload` throws → SM-2 fallback, payload preserved if present.
- `fsrsPayload` missing (null/undefined) → `validateFsrsPayload` throws → SM-2 fallback.
- `scheduleFsrsReview` throws (ts-fsrs internal error) → catch → SM-2 fallback, metadata preserved.
- `continueWithoutRating: true` → `resolveActiveSchedulingRating` returns `useSm2Fallback: true` → SM-2 fallback.
- `resolveMemoryRatingFromLogs` returns null (no session-valid log) → `continueWithoutRating: true` → SM-2 fallback.
- Unknown `schedulerKind` → normalized to current (SM-2) by `getSchedulerKind` → SM-2 path.

**SM-2 fallback invariants:**
- `scheduleCurrentReviewPreservingFsrs` applies SM-2 intervals.
- `schedulerKind` is preserved as-is (no demotion from `fsrs-planned` or `fsrs-active`).
- `fsrsPayload` is deep-copied into result unchanged.
- `fsrsReviewLogs` are carried forward unchanged.
- Dashboard `computeMixedSchedulerDueSummary` continues to count fallback records by their persisted `schedulerKind`.

## Production Call Site

`scheduleFsrsReview` in `src/quiz/fsrsWrapper.js` is the **only** approved production `ts-fsrs.next()` call site. The adapter (`reviewSchedulerAdapter.js`) delegates to it and never calls `.next()` directly.

## File Scope

### New files (4)

- `docs/phase15d-active-fsrs-runtime-smoke-rollback-audit.md` — this file
- `tests/unit/fsrsActiveRuntimeRollbackAudit.test.js` — 14 new tests
- `scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js` — static validator
- `.github/workflows/e2e-smoke.yml` — Phase 15D validator step added after Phase 15C

### Historical validators updated (forward-compatibility allowlist entries only)

- `scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js`
- `scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js`

### Runtime files — unchanged

- `src/quiz/reviewSchedulerAdapter.js`
- `src/quiz/fsrsWrapper.js`
- `src/state/reviewScheduleStorage.js`
- `src/state/settingsStorage.js`

### Protected files — unchanged

- `src/routes/StudyRoom.jsx`
- `src/routes/Dashboard.jsx`
- `src/components/study/FsrsProductionMemoryRatingBridge.jsx`
- `src/quiz/dataBackup.js`
- `src/state/v2BackupRestore.js`
- `package.json` / `package-lock.json`

## Manual Smoke Checklist

The following smoke scenarios should be verified manually when feasible:

1. **Normal SM-2 study flow with active flag default OFF**
   - Start app, study any card, confirm schedule updates normally (SM-2 intervals).
   - No FSRS active scheduling occurs (active flag is default OFF).

2. **Dashboard loads with mixed records**
   - Dashboard shows total due count.
   - If FSRS-family records exist and are due, experimental note is shown.
   - If no FSRS-family records exist, note is not shown.
   - No overclaim ("FSRS is active for everyone", "AI scheduling", "cloud sync").

3. **Settings route loads**
   - `/settings` renders without crash.
   - FSRS experimental toggle is visible to user.
   - `fsrsActiveSchedulingEnabled` is NOT exposed in any settings UI panel.

4. **Dev fixture loads**
   - `/dev/fsrs-ui-fixture` renders without crash.

5. **Study Room normal flow**
   - Study Room completes a session without crash.
   - `appendFsrsReviewLog` and `shouldShowFsrsTwoStepBridge` remain present.

6. **Internal active flag ON test path** (if feasible in dev console)
   - Set both gates true via dev console.
   - Study an fsrs-planned card.
   - Confirm `schedulerKind` transitions to `fsrs-active` in stored record.
   - Set active flag OFF, study again: `schedulerKind` preserved, SM-2 intervals applied.

7. **fsrs-planned → fsrs-active transition**
   - With both gates ON, study an fsrs-planned record.
   - Stored result has `schedulerKind: 'fsrs-active'`.

8. **fsrs-active → SM-2 fallback when flag OFF**
   - With gate OFF, study an existing fsrs-active record.
   - Result uses SM-2 intervals; `schedulerKind` preserved; `fsrsPayload` preserved.

9. **Backup/export/import not modified**
   - Export backup, re-import: all FSRS metadata preserved.
   - No changes to backup runtime in this phase.

10. **No visible claim overreach**
    - App does not display broad active FSRS claims (e.g., active for all users).
    - App does not display AI scheduling claims.
    - App does not display cloud sync claims.
    - App does not display guaranteed-better-scheduling claims.

## Claim Guardrails

This phase and all its docs/validators must ensure:
- No broad public overclaim that FSRS scheduling is broadly live.
- No overclaim that Dashboard handles all future schedulers completely.
- No cloud/sync overclaim.
- No AI scheduling overclaim.
- No guaranteed-better-scheduling overclaim.

## Dashboard Due Count Policy

`computeMixedSchedulerDueSummary` (Phase 15C) counts all FSRS-family records regardless of whether they currently use active or fallback scheduling. A record with `schedulerKind: 'fsrs-active'` that fell back to SM-2 intervals retains its kind label and is still counted in `fsrsFamilyDueCount`. This is intentional — the Dashboard reflects the enrolled family, not the scheduling path taken for the last review.

## Handoff

- Phase 15E (future): may add a controlled internal activation harness for structured testing of active FSRS scheduling.
- Phase 16: Hybrid local-first/sync — deferred, not part of Phase 15.
- All Phase 15B and Phase 15C invariants remain intact: double gate, SM-2 fallback policy, no demotion, `ts-fsrs.next()` only via `scheduleFsrsReview`.
