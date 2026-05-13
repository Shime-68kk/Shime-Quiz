# Phase 14H — FSRS Experimental Toggle UI

## Summary

Phase 14H adds the first user-visible FSRS settings surface to Shime Quiz /
ShimeChamhoc v2. It exposes an experimental FSRS toggle in a new `/settings`
route. The toggle is framed as **Preparation Phase Only** and writes only
`fsrsExperimentalEnabled` to `settingsStorage`. No enrollment runtime, no
production FSRS route, and no schedulerKind assignment are introduced.

---

## Baseline

Phase 14G delivered `src/state/settingsStorage.js` with a lazy settings storage
scaffold, `fsrsExperimentalEnabled: false` as the default, and no visible UI.
Phase 14H builds directly on top of Phase 14G; Phase 14G files are unchanged.

---

## What This Phase Adds

- `src/routes/Settings.jsx` — New `/settings` page route
- `src/components/settings/FsrsExperimentalSettingsPanel.jsx` — Toggle UI panel
- `src/routes/routeConfig.js` — Adds Settings to the navigation and route registry
- `tests/unit/fsrsExperimentalSettingsPanel.test.jsx` — Unit tests
- `scripts/validate-phase14h-fsrs-toggle-ui.js` — Static validator
- `docs/phase14h-fsrs-experimental-toggle-ui.md` — This document
- `.github/workflows/e2e-smoke.yml` — Phase 14H validator step added

---

## UX Policy: Preparation Phase Only

The toggle is enabled and usable, but is heavily framed as preparation-only.

### Toggle label

> Enable FSRS Memory Model (Experimental)

### Helper copy

> Preparation Phase Only. Turning this on prepares your device for the advanced DSR (Difficulty, Stability, Retrievability) scheduling engine. It only applies to future new cards in a later phase. It does not migrate existing cards. It does not change your current due dates or study screens today. Study Room four-rating FSRS review UI is not available yet.

### ON status

> Status: Dormant (Awaiting future update)

### Disabling copy (shown when ON)

> Disabling this pauses FSRS preparation. Future FSRS metadata, if generated in
> later phases, will be kept safely on this device and will not be deleted.

### Confirmation modal (shown when enabling)

> You are enabling the scaffold for the experimental FSRS memory model. Your
> reviews will continue using the current system until the full FSRS update is
> released. This does not migrate existing cards and does not change current due
> dates. Proceed?

Confirm button: **Enable preparation**

---

## Toggle Behavior Invariants

| Action | Effect |
|--------|--------|
| Page load / render | Reads `getSettings().fsrsExperimentalEnabled`; does NOT write |
| Missing settings key | Renders OFF (default) |
| Invalid settings JSON | Renders OFF (default); no crash |
| Clicking ON | Opens confirmation modal; does NOT write |
| Modal: Cancel | Closes modal; does NOT write |
| Modal: Confirm | Calls `updateSettings({ fsrsExperimentalEnabled: true })` |
| Clicking OFF | Calls `updateSettings({ fsrsExperimentalEnabled: false })` |

---

## Scope Control

This phase does NOT implement or change:

- no enrollment runtime
- no production FSRS route
- no schedulerKind assignment in any UI component
- no Study Room four-rating FSRS review UI (Again / Hard / Good / Easy)
- no Dashboard mixed scheduler due count
- no migration of existing study records
- no claims that FSRS scheduling is active for users
- `src/quiz/reviewSchedulerAdapter.js` — unchanged, not changed
- `src/quiz/fsrsWrapper.js` — unchanged, not changed
- `src/state/reviewScheduleStorage.js` — unchanged, not changed
- `src/quiz/dataBackup.js` — unchanged, not changed
- `package.json` — unchanged, not changed
- `package-lock.json` — unchanged, not changed
- `src/routes/Dashboard.jsx` — unchanged
- `src/routes/StudyRoom.jsx` — unchanged
- Study Room answer/rating flow — unchanged

---

## Settings Storage

The toggle reads and writes only `fsrsExperimentalEnabled` via the
`settingsStorage` module (`src/state/settingsStorage.js`) introduced in
Phase 14G:

- `getSettings()` — lazy read, never writes on render
- `updateSettings({ fsrsExperimentalEnabled: true|false })` — only write path

The storage key is `shimeV2SettingsV1`. Schema version is `shime-v2-settings-v1`.

Default value: `fsrsExperimentalEnabled: false` (OFF).

`fsrsEnabledAt` is set write-once by `updateSettings` when transitioning
false→true. Disabling does not clear it.

---

## Safety Invariants

- Rendering the settings UI does not write localStorage
- Toggle ON requires explicit user confirmation in a modal
- Toggle OFF writes immediately (no confirmation required)
- No scheduler route changes
- No card enrollment
- Study Room and Dashboard are not changed
- FSRS scheduling is not user-facing in this phase — it is deferred to a later phase

---

## Relationship to Prior Phases

| Phase | What it delivered |
|-------|------------------|
| 14B | FSRS wrapper test prototype |
| 14C | FSRS persistence backup harness |
| 14D | Developer-gated FSRS adapter routing |
| 14E | FSRS user-facing entry decision |
| 14F | FSRS experimental toggle plan document |
| 14F-HF1 | Baseline validation recovery |
| 14G | Lazy settings storage scaffold (no UI) |
| **14H** | **This phase — visible toggle UI, Preparation Phase Only** |

---

## Not Implemented (Deferred)

The following are explicitly **not implemented** in Phase 14H and are deferred
to a later phase:

- Production FSRS scheduling (not implemented, not enabled)
- New-card enrollment runtime (not implemented)
- Study Room four-rating UI (not implemented)
- Dashboard mixed FSRS/SM-2 due count (not implemented)
- Per-card or per-quiz FSRS settings (not implemented)
- Migration or conversion of existing SM-2 records (not implemented)
- FSRS desiredRetention or maximumInterval UI sliders (not implemented)

These items are planned for future phases. The current FSRS status for users
is Dormant (Awaiting future update) — the current scheduling system remains
fully active and unchanged.
