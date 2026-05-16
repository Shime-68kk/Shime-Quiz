# Phase 16K — Storage Quota & Backup-Before-Import Runtime Hardening

## Phase goal

Make Shime safer before large imports and future local-first hybrid work by improving storage quota awareness, adding backup-before-import warnings, and improving large import guardrails.

This phase is a bounded runtime-safety phase. It improves user trust around storage quota, large imports, and backup-before-import warnings **without** starting IndexedDB migration, sync, accounts, cloud, or local-first hybrid runtime implementation.

## User-facing safety improvements

### Backup-before-import reminder (new)

A `BackupBeforeImportNotice` component now appears in the import preview flow before the user confirms an import. The notice:

- Explains that Shime stores data locally in the browser.
- Advises the learner to export/backup the library before confirming a large import.
- Highlights even more strongly when the import has ≥ 50 items (the large-import threshold).
- Reminds that EduGen drafts require human review before trust.
- Is **advisory only** — it does not block, prevent, or gate the import action.

### Storage quota awareness (existing, improved)

The existing `navigator.storage.estimate()` helper (`src/utils/storageQuotaEstimate.js`) is extended with:

- `getLargeImportItemCountWarning(itemCount)` — returns `{ isLarge, itemCount }` so the UI can show a stronger advisory when the import is large.
- `LARGE_IMPORT_ITEM_THRESHOLD = 50` — exported constant for testability.

Both functions are safe if the browser API is missing. The quota state is already surfaced in the V2BackupRestorePanel (Phase 12C baseline).

## Storage quota behavior and fallback

- Uses `navigator.storage?.estimate?.()` where available.
- Returns `{ available: false, shouldWarn: false }` when the API is missing.
- Catches all errors gracefully; never blocks usage on quota unavailability.
- Does not make browser-specific or platform-specific guarantees.
- Warnings remain advisory, not alarming.

## Backup-before-import behavior

- Appears in `ImportPreview` before the confirm button.
- Always visible when a preview is shown (low-friction advisory).
- Stronger wording when `summary.itemCount >= 50`.
- Does **not** disable or block the import confirmation button.
- Does **not** add cloud, sync, or server-side backup logic.
- Encourages use of existing export/backup features (V2BackupRestorePanel, Xuất thư viện).

## Large import guardrails

- `getLargeImportItemCountWarning(itemCount)` is a pure function with no side effects.
- The `BackupBeforeImportNotice` uses this threshold to adjust warning intensity.
- No parser or import semantic change; import behavior is unchanged.
- Item count threshold is 50 items (exported as `LARGE_IMPORT_ITEM_THRESHOLD`).

## Scope boundary confirmations

### No IndexedDB migration

Phase 16K does not implement IndexedDB, open any IDB databases, or migrate localStorage to IndexedDB. All data remains in `localStorage` as before.

### No cloud / no sync / account / auth

No cloud sync, no cloud backend, no sync adapter, no account system, and no authentication is added. No network requests are introduced in the storage/import safety layer.

### No storage schema migration

The localStorage schema for library, study history, review schedule, and backup data is unchanged.

### No scheduler / FSRS / EduGen runtime expansion

- `src/quiz/reviewSchedulerAdapter.js` — unchanged.
- `src/quiz/fsrsWrapper.js` — unchanged.
- `src/state/reviewScheduleStorage.js` — unchanged.
- `src/state/settingsStorage.js` — unchanged.
- `src/edugen/` and `src/components/edugen/` — unchanged.
- No new FSRS call sites. No public FSRS rollout.

### No StorageAdapter / SyncAdapter / EventLog runtime

These remain planned-only. Phase 16L will conduct the research and planning for StorageAdapter. Phase 16K does not implement any of these.

## Changed files

| File | Change |
|---|---|
| `src/utils/storageQuotaEstimate.js` | Added `getLargeImportItemCountWarning`, `LARGE_IMPORT_ITEM_THRESHOLD` |
| `src/components/learning/BackupBeforeImportNotice.jsx` | New advisory component |
| `src/routes/Library.jsx` | Import and render `BackupBeforeImportNotice` in preview |
| `tests/unit/storageQuotaEstimate.test.js` | Extended with large import warning helper tests |
| `tests/unit/storageQuotaBackupBeforeImport.test.jsx` | New component tests |
| `docs/phase16k-storage-quota-backup-before-import-hardening.md` | This doc |
| `scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js` | New validator |
| `.github/workflows/e2e-smoke.yml` | Phase 16K validator registered after Phase 16J |

## Validation evidence expected

- `npm run build` — passes with no new warnings.
- `npm run test:unit` — all unit tests pass including new Phase 16K tests.
- `node scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js` — passes.
- Full validator chain `FINAL_STATUS=0`.

## Suggested next phase

**Phase 16L — Local-First Hybrid Research / StorageAdapter Plan**

Research and document the StorageAdapter interface for future local-first hybrid architecture. No runtime implementation yet.
