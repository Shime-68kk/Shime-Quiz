# Phase 14G — FSRS Settings Storage Schema and Backup Integration

## Status

Phase 14G creates the lazy settings storage scaffold (`shimeV2SettingsV1`) and narrow v2 backup/settings preservation. It does not add a visible FSRS toggle, new-card enrollment runtime, or production FSRS routing.

## Scope

Phase 14G is a **runtime settings storage scaffold + narrow v2 backup/settings preservation + unit tests + docs/static-validator/CI** phase only.

Summary of what this phase does NOT do:
- **No UI changes** — no visible FSRS toggle or settings UI added.
- **No new-card enrollment runtime** — enrollment logic is not implemented.
- **No adapter production routing** — reviewSchedulerAdapter.js is not changed.
- **No Study Room changes** — Study Room is unchanged.
- **No Dashboard changes** — Dashboard is unchanged.
- **No package changes** — package.json and package-lock.json are unchanged.
- **No dependency additions** — no new npm dependencies added.

Full detail:
- Does not change runtime behavior beyond adding the settings storage module.
- Does not create a visible FSRS toggle.
- Does not add new-card enrollment runtime.
- Does not add production FSRS adapter routing.
- Does not change Study Room or Dashboard.
- Does not change `reviewSchedulerAdapter.js`.
- Does not change `fsrsWrapper.js`.
- Does not change `reviewScheduleStorage.js`.
- Does not change legacy `src/quiz/dataBackup.js`.
- Does not change `package.json` or `package-lock.json`.
- Does not add new dependencies.

## Settings Storage

### Storage key

`shimeV2SettingsV1`

### Schema version

`shime-v2-settings-v1`

### Schema fields

```json
{
  "schemaVersion": "shime-v2-settings-v1",
  "updatedAt": "<ISO string or empty string>",
  "fsrsExperimentalEnabled": false,
  "fsrsEnrollmentMode": "new-cards-only",
  "fsrsEnabledAt": null,
  "fsrsDesiredRetention": 0.90,
  "fsrsMaximumInterval": 36500
}
```

### Field policies

- `fsrsExperimentalEnabled`: Boolean, default `false`. Master gate for FSRS experimental mode.
- `fsrsEnrollmentMode`: Locked to `"new-cards-only"` in Phase 14G. Any other value is normalized back to the locked value.
- `fsrsEnabledAt`: ISO string or `null`. Write-once: set when transitioning from `false` to `true`. Never cleared on disable. Used as FSRS optimizer cutoff timestamp.
- `fsrsDesiredRetention`: Clamped to `[0.70, 0.97]`, default `0.90`.
- `fsrsMaximumInterval`: Clamped to `[1, 36500]` (days), default `36500`.
- `updatedAt`: Set on each explicit `updateSettings()` or `importSettings()` call.

### Fields excluded from settings

- `schedulerKind` — per-card field only, must not appear in settings.
- `fsrsPayload` — per-card field only.
- `fsrsReviewLogs` — per-card/review-schedule field only.
- `fsrsWeights` — deferred to a future phase.
- Per-deck or per-quiz settings — deferred.

### Lazy read (default OFF)

`getSettings()` does not write to `localStorage` under any circumstances.

- Missing key → returns default OFF in memory (no write, no create).
- Invalid JSON → returns default OFF in memory (no write, no remove).
- Only `updateSettings()` and `importSettings()` may write the key.
- `clearSettings()` is for tests and explicit user data-clear flows only.

### Cross-tab sync

`shimeV2SettingsV1` is registered in `LEARNING_STORAGE_KEY_SECTIONS` in `src/state/localStorageSync.js` (section: `'settings'`). `updateSettings()` and `importSettings()` emit both a `CustomEvent` and `publishLearningStorageChanged()` after each successful write.

## Backup Integration

### v2 backup path

Settings are preserved through the v2 backup/import/export pipeline via `src/state/v2BackupRestore.js`. The legacy `src/quiz/dataBackup.js` is unchanged by Phase 14G.

### Backup payload shape

`payload.settings` is a top-level key, a sibling of `payload.data`. It is NOT stored under `payload.data`.

```json
{
  "schemaVersion": "shime-v2-backup-v1",
  "backupMode": "full",
  "data": { ... },
  "settings": {
    "schemaVersion": "shime-v2-settings-v1",
    "fsrsExperimentalEnabled": false,
    ...
  }
}
```

### Old backup compatibility

Missing `payload.settings` is not an error or warning. Validating or restoring an old backup that has no `settings` key succeeds normally. Existing settings are left unchanged by such a restore.

### Restore behavior

- If `payload.settings` is present and valid, `importSettings()` is called after the main restore succeeds.
- Settings restore failure is non-fatal and does not undo the main restore.
- `fsrsEnabledAt` is preserved: if existing storage has a value and the incoming backup lacks it, the existing value is kept.

## No-claim boundaries

Phase 14G must not claim, and does not claim, any of the following:

- The FSRS toggle is visible to users, because it is not implemented.
- The FSRS toggle is enabled, because it is not enabled.
- FSRS is user-facing, because it is not user-facing.
- FSRS production scheduling is enabled, because it is not enabled.
- New-card enrollment is active, because the runtime is not implemented.
- Study Room supports FSRS ratings, because it is not implemented.
- Study Room supports Two-Step Evaluation, because it is not implemented.
- Dashboard supports mixed scheduler due counts, because it is not implemented.
- Existing SM-2 records are migrated, because migration is not implemented.
- `shimeV2SettingsV1` is created on app boot or ordinary read, because it is not created lazily.
- `fsrsWeights` is configured, because it is deferred.
- Backup/import/export support for FSRS settings is complete, because only the narrow v2 backup path is covered.

## Future Phase Split

- **Phase 14G** (this phase): Settings storage scaffold + narrow v2 backup settings preservation.
- **Phase 14H**: Visible experimental FSRS toggle UI (default OFF).
- **Phase 14I**: Study Room Two-Step FSRS rating UI.
- **Phase 14J**: Guarded new-card enrollment and production adapter routing.
- **Phase 14K**: Dashboard mixed scheduler analytics.
- **Phase 14L+**: Closure and Phase 15 readiness.

## Dependency and package status

- No new npm dependencies added.
- `ts-fsrs` remains pinned at `5.3.3`.
- `package.json` and `package-lock.json` are unchanged.
