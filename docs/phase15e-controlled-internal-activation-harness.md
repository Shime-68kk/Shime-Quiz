# Phase 15E — Controlled Internal Activation Harness

## Status

FINAL_STATUS=0 — Phase 15E PASS

## Scope

Phase 15E adds a **controlled internal/test activation harness** for active FSRS scheduling.
It does **not** publicly expose active FSRS scheduling to normal users.

## What This Phase Does

- Adds `docs/phase15e-controlled-internal-activation-harness.md` (this file).
- Adds `tests/unit/fsrsControlledInternalActivationHarness.test.js` (14 new tests).
- Adds `scripts/validate-phase15e-controlled-internal-activation-harness.js` (static validator).
- Adds three internal/test-only helper functions to `src/state/settingsStorage.js`:
  - `setFsrsActiveSchedulingForInternalTest(enabled)` — sets `fsrsActiveSchedulingEnabled` explicitly.
  - `enableFsrsActiveSchedulingForInternalTest()` — convenience: sets active flag true.
  - `disableFsrsActiveSchedulingForInternalTest()` — convenience: sets active flag false.
- Registers Phase 15E validator in `.github/workflows/e2e-smoke.yml` after Phase 15D.

## What This Phase Does NOT Do

- It does **not** publicly expose active FSRS scheduling. There is no public rollout.
- It does **not** change `StudyRoom.jsx`.
- It does **not** change `Dashboard.jsx`.
- It does **not** change `FsrsProductionMemoryRatingBridge.jsx`.
- It does **not** change backup/import runtime (`dataBackup.js`, `v2BackupRestore.js`).
- It does **not** change scheduling logic or rating mapping.
- It does **not** change the `fsrs-planned → fsrs-active` transition or SM-2 fallback.
- It does **not** add new `ts-fsrs.next()` call sites.
- It does **not** add Dashboard display expansion beyond Phase 15C.
- It does **not** implement hybrid local-first/sync.
- It does **not** add dependencies or modify `package.json`/`package-lock.json`.
- It does **not** expose `fsrsActiveSchedulingEnabled` as a visible toggle or label in the Settings UI.
- It does **not** activate active scheduling from import/restore/app-boot/session-start.
- It does **not** make broad public claims that FSRS scheduling is active for all users.

## Harness Design

### Internal Helpers (settingsStorage.js)

Three functions are exported from `src/state/settingsStorage.js` for internal/test/dev use only:

```js
setFsrsActiveSchedulingForInternalTest(enabled)   // sets fsrsActiveSchedulingEnabled explicitly
enableFsrsActiveSchedulingForInternalTest()        // sets active flag true
disableFsrsActiveSchedulingForInternalTest()       // sets active flag false
```

**Properties:**
- Names clearly indicate internal/test-only scope — no user-facing language.
- `setFsrsActiveSchedulingForInternalTest(enabled)` normalizes boolean: only strict `true` → `true`; all other values → `false`.
- Delegates to `updateSettings()`, so all existing settings fields are preserved.
- Never called by production UI or any user-facing code path.
- Not exposed in Settings route (`/settings`), Dashboard, or StudyRoom.

### No Automatic Activation

Active scheduling is never activated automatically by:
- Import/restore flows (`v2BackupRestore.js`, `dataBackup.js`)
- App boot / session start
- Enabling the normal experimental FSRS toggle alone

Normal users cannot accidentally enable `fsrsActiveSchedulingEnabled` through any UI path.

## Active FSRS Scheduling Status

Active FSRS scheduling remains **double-gated** and **default OFF** from Phase 15B:

- Gate 1: `fsrsExperimentalEnabled === true` (user-controlled toggle)
- Gate 2: `fsrsActiveSchedulingEnabled === true` (internal flag, default false, not user-visible)
- Gate 3: `validateFsrsPayload` passes (payload present and stability valid)
- Gate 4: `scheduleFsrsReview` does not throw (ts-fsrs internal gate)

`fsrsActiveSchedulingEnabled` is **internal-only**: not in the settings UI, not user-visible.
Default `false` in `getDefaultSettings()` and `normalizeSettings()`.

## Default OFF Safety

- `getDefaultSettings()` sets `fsrsActiveSchedulingEnabled: false`.
- Missing stored settings default to `false` (lazy read, no write on miss).
- Invalid stored values (`"true"`, `1`, `null`) normalize to `false` — only boolean `true` passes.
- Active scheduler does not run unless both `fsrsExperimentalEnabled === true` AND `fsrsActiveSchedulingEnabled === true`.
- Enabling `fsrsExperimentalEnabled` alone (the normal user toggle) does NOT enable active scheduling.
- Setting `fsrsActiveSchedulingEnabled` alone (without `fsrsExperimentalEnabled`) does NOT enable active scheduling.

## No Public Settings UI Exposure

The `/settings` route and `FsrsExperimentalSettingsPanel` do **not** expose `fsrsActiveSchedulingEnabled` as a toggle, label, or any visible control. Normal users see only the experimental FSRS toggle (`fsrsExperimentalEnabled`).

## File Scope

### New/modified files (5)

- `docs/phase15e-controlled-internal-activation-harness.md` — this file
- `tests/unit/fsrsControlledInternalActivationHarness.test.js` — 14 new tests
- `scripts/validate-phase15e-controlled-internal-activation-harness.js` — static validator
- `src/state/settingsStorage.js` — 3 internal/test-only helpers added at the bottom
- `.github/workflows/e2e-smoke.yml` — Phase 15E validator step added after Phase 15D

### Historical validators updated (forward-compatibility allowlist entries only)

All historical validators that have scope guards have been updated with exact Phase 15E allowlist entries only.

### Runtime files — minimal and justified

- `src/state/settingsStorage.js` — adds internal/test-only harness helpers (not production UI)

### Protected files — unchanged

- `src/routes/StudyRoom.jsx`
- `src/routes/Dashboard.jsx`
- `src/components/study/FsrsProductionMemoryRatingBridge.jsx`
- `src/quiz/dataBackup.js`
- `src/state/v2BackupRestore.js`
- `src/quiz/fsrsWrapper.js`
- `src/quiz/reviewSchedulerAdapter.js`
- `src/state/reviewScheduleStorage.js`
- `package.json` / `package-lock.json`

## Manual Smoke Checklist

The following smoke scenarios should be verified manually when feasible:

1. **App/root loads** — no crash.
2. **Settings route loads** — `/settings` renders; experimental FSRS toggle is visible; **no** `fsrsActiveSchedulingEnabled` toggle/label visible.
3. **Dashboard loads** — normal due count shown; no broad active FSRS claim.
4. **Study Room normal flow** — study a card; SM-2 intervals apply; no crash.
5. **No visible active FSRS scheduling toggle** — normal users cannot find or enable `fsrsActiveSchedulingEnabled` from any UI.
6. **No broad active FSRS claim** — app does not make any broad overclaim that active FSRS scheduling has been rolled out to all users.

**Browser-only feasibility note:** Automated browser E2E cannot run without Playwright setup. Manual browser smoke should be performed before public promotion.

## Claim Guardrails

This phase and all its docs/validators ensure:
- No broad public overclaim that FSRS active scheduling is broadly live.
- No overclaim that Dashboard handles all future schedulers.
- No cloud/sync overclaim.
- No AI scheduling overclaim.
- No guaranteed-better-scheduling overclaim.
- No claim that normal users have access to `fsrsActiveSchedulingEnabled`.

## Handoff

- Phase 15F (future): may add copy/UX alignment before broader exposure of active FSRS scheduling.
- Phase 16: Hybrid local-first/sync — deferred, not part of Phase 15.
- All Phase 15B, 15C, and 15D invariants remain intact: double gate, SM-2 fallback policy, no demotion, `ts-fsrs.next()` only via `scheduleFsrsReview`.
