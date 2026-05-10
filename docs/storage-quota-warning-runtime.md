# Phase 12C — Storage Quota Warning Runtime

## 1. Purpose

Phase 12C adds a small advisory storage quota warning runtime for Shime Quiz. The warning uses browser storage estimate APIs where available to detect high estimated browser-local storage usage and encourage the user to create a manual backup.

This phase is a narrow runtime safety/UX improvement. It does not implement IndexedDB, does not migrate localStorage, does not change storage schema, does not change backup format, does not change import/restore behavior, does not add dependencies, and does not change package version.

## 2. Baseline

The project is completed/merged through Phase 12B. Phase 12B documented storage capacity risk and future IndexedDB migration planning, including backup/restore compatibility requirements, rollback/fallback requirements, and testing/evidence expectations.

The current app remains local-first and browser-local. Manual backup/export/import remains the portability model. There is no backend/cloud/account sync, no automatic sync, and no hidden upload of user study data.

## 3. Runtime behavior

The Phase 12C warning uses `navigator.storage.estimate()` when that API is available. The runtime calculates an estimated storage usage/quota ratio only when `usage` and `quota` are valid positive numbers. When the estimated usage is high, the backup/restore surface shows a non-blocking warning that encourages manual backup.

If the browser API is unavailable, throws, or returns missing, zero, NaN, or otherwise invalid values, the app gracefully does nothing and shows no false warning. The warning does not block app usage, studying, backup, restore, import, or navigation.

The warning is advisory only. It does not delete data, upload data, migrate data, write storage state, trigger automatic backup, or require an account/cloud service.

## 4. Safety boundaries

Phase 12C:

- no IndexedDB implementation;
- no localStorage migration;
- no storage schema change;
- no backup format change;
- no import/restore behavior change;
- no encryption;
- no data-loss guarantee;
- does not implement IndexedDB;
- does not migrate localStorage;
- does not change storage schema;
- does not change backup format;
- does not change import/restore behavior;
- does not add cloud/account sync;
- does not add automatic sync;
- does not add encryption;
- does not guarantee data-loss prevention;
- does not upload user data.

## 5. User-facing claim boundaries

Allowed claims after Phase 12C:

- Storage quota warning runtime exists where browser storage estimate data is available.
- The warning encourages manual backup when estimated usage is high.
- The app remains local-first and browser-local.
- Manual backup/export/import remains the portability model.

Forbidden claims after Phase 12C:

- storage capacity problem solved;
- IndexedDB implemented;
- migration implemented;
- backup format changed;
- storage schema changed;
- automatic backup implemented;
- cloud/account sync implemented;
- encryption implemented;
- guaranteed data-loss prevention.

## 6. Recommended next phase

Recommended next phase: **Phase 12D — Dashboard Today Card UX Plan**.
