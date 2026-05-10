# Phase 12B — Storage Capacity / IndexedDB Migration Plan

## 1. Purpose

Phase 12B documents storage capacity risk and plans a future IndexedDB migration path for Shime Quiz.

Phase 12B is docs/static-validator/CI-only. Phase 12B does not implement IndexedDB, does not migrate localStorage data, does not change storage schema, does not change backup format, does not add encryption, does not add dependencies, and does not change runtime behavior.

This plan exists so a later runtime phase can make storage decisions with clear compatibility, backup/restore, rollback, fallback, testing, and evidence requirements before any user data is moved.

## 2. Baseline

The project is completed/merged through Phase 12A. The Phase 12 roadmap/risk register/scope lock exists and defines Phase 12 as a Stability + UX + Performance + Data Safety track.

The current app remains local-first and browser-local. Current portability remains manual backup/export/import. Normal backup file download remains the fallback. Restore from backup remains manual and user-initiated. The Web Share runtime prototype exists where supported, but Web Share is a sharing convenience and is not sync. There is no backend, cloud, account sync, or automatic sync.

## 3. Current storage model

The current conceptual storage model is browser-local persistence. Where applicable, app state is localStorage-backed and remains on the user's device/browser profile. This document does not change any implementation files, keys, storage schema, or backup payload shape.

Storage categories that may grow over time include:

- quiz library data
- imported question sets
- review schedule data
- study history
- mastery/progress data
- user preferences/settings
- backup/export payloads

Exact byte sizes are not asserted here because Phase 12B does not run a runtime storage measurement audit. Any exact key or file-level reference in a later phase should be marked as an implementation reference based on current repository inspection, not as a migration change.

## 4. Storage capacity risk

Browser-local persistence has practical capacity and reliability limits that vary by browser, profile type, operating system, and storage pressure. localStorage also has size limits that are commonly lower than IndexedDB and can fail when a write exceeds available quota.

Important risks include browser quota differences, localStorage size limits, possible write failures, growing history/progress data, large imported quiz sets, user confusion if storage fails silently, and risk of data loss perception even when the product remains local-first.

Phase 12B documents these risks only. It does not claim storage capacity is solved. Phase 12B does not add storage quota warning UI or runtime.

## 5. Failure modes

| Failure mode | User impact | Detection strategy | Mitigation strategy | Future phase |
|---|---|---|---|---|
| Quota exceeded on write | New quiz, progress, schedule, or settings data may not be saved. | Catch storage write errors and inspect quota/storage estimates where available. | Add user-visible warning and keep existing data intact. | Phase 12C for warning runtime; later migration phase for adapter behavior. |
| Partial write/update failure | User may see inconsistent progress or an incomplete update. | Validate read-after-write where feasible and use transaction-like boundaries in future storage adapters. | Avoid destructive multi-step writes without verification; retry safely. | Future storage adapter/migration phase. |
| Corrupt or malformed stored payload | App may fail to load a section or may ignore damaged state. | Schema validation and guarded parsing before using stored state. | Preserve source data, show recovery guidance, and encourage backup before risky changes. | Future storage hardening phase. |
| Oversized imported content | Import may exceed available browser-local storage after validation. | Estimate import payload size before write and catch quota errors. | Warn before saving oversized imports; avoid silently discarding existing data. | Phase 12C or later import/storage hardening. |
| Backup from corrupted state | Backup may preserve already-damaged local state. | Validate local state before export where feasible. | Communicate limitations and consider compatibility/checksum evidence before future format changes. | Future backup evidence phase. |
| Restore into an existing data/profile | Existing data may be overwritten or merged unexpectedly. | Pre-restore summary and validation of incoming payload. | Keep restore user-initiated; avoid partial destructive writes where possible. | Future restore hardening phase. |
| Private/incognito storage clearing | User may lose browser-local data after session/profile cleanup. | Detect limited persistence where browser APIs expose it; document browser behavior. | Warn that local/private browsing storage can be cleared by browser policy. | Future storage warning/help phase. |
| User clearing site data | User may remove all browser-local app data. | Cannot always detect after clearing; document clearly. | Encourage manual backups before clearing browser data or switching profiles. | Documentation and future onboarding/help polish. |
| Browser-specific quota differences | Same data volume may work in one browser and fail in another. | Browser-specific manual checks and quota/error simulation where feasible. | Keep fallback/rollback strategy and avoid claims of guaranteed capacity. | Future migration test phase. |

## 6. Why IndexedDB may be considered

IndexedDB may be considered in a future runtime phase because it generally offers larger practical storage capacity than localStorage, uses an asynchronous storage model, supports structured records/object stores, provides transaction support, better fits larger history/progress data, and may support a future migration path for large quiz libraries.

IndexedDB is only planned/evaluated in Phase 12B. IndexedDB is not implemented in Phase 12B. No user data is migrated in Phase 12B.

## 7. Future IndexedDB migration requirements

Any future IndexedDB migration phase must meet these requirements before rollout:

- preserve existing localStorage data
- never delete source data until migration is verified
- encourage backup before migration
- make migration idempotent
- make migration resumable or safely retryable after interruption
- support rollback/fallback
- preserve backup/restore compatibility
- not break manual backup/export/import
- handle partial or corrupt records safely
- include user-visible error states
- include test coverage before rollout

## 8. Compatibility requirements

Existing localStorage users must continue working. Existing backups must remain restorable. A new storage model must not make old backups unusable without a documented compatibility path.

Export format compatibility must be explicitly decided before migration. Import/restore flow must remain user-initiated. No backend, cloud, account sync, or automatic sync should be introduced. Web Share must remain optional file-sharing convenience only. A browser fallback strategy must exist for IndexedDB failure or unavailable storage.

## 9. Backup/restore compatibility plan

Future storage migration must preserve backup/restore behavior:

- backup payload content must be versioned or compatibility-checked before any format change
- restore must validate incoming payloads before writing
- restore should avoid partial destructive writes where possible
- restore should communicate risk to the user
- old backups should remain supported or have a documented migration path
- backup privacy warning must remain clear because backups may include quiz content, answers, progress, and study history

Phase 12B does not change backup format. Phase 12B does not change restore behavior. Phase 12B does not implement backup checksum. Phase 12B does not implement partial restore.

## 10. Rollback and fallback strategy

A future migration should keep the localStorage source copy until migration verification succeeds, mark migration state separately, allow retry after interruption, never silently delete user data, provide user-facing recovery instructions, keep manual backup/export/import available, and document fallback if IndexedDB is unavailable or blocked.

Rollback/fallback must be treated as a product requirement, not a post-release cleanup task.

## 11. Testing and evidence requirements

Before any future runtime migration, the project should collect evidence from:

- unit tests for storage adapters/helpers
- migration fixture tests
- corrupt payload tests
- quota/error simulation tests where feasible
- backup/restore regression tests
- import/export compatibility tests
- manual clean-profile restore smoke
- E2E smoke/onboarding unaffected checks
- browser-specific manual checks if needed

Phase 12B only documents these requirements and does not add tests.

## 12. Non-goals for Phase 12B

Phase 12B does not:

- implement IndexedDB
- migrate localStorage data
- change storage schema
- change backup format
- change restore behavior
- add storage quota warning UI or runtime; storage quota warning runtime is not implemented by Phase 12B
- add storage compression
- add TTL/LRU eviction
- add backup checksum
- add partial restore
- add incremental sync
- add cloud/account sync
- add automatic sync
- add encryption
- add dependencies
- change package version
- add tests
- change runtime app code
- create release package
- create release tag
- publish GitHub Release

## 13. Allowed claims after Phase 12B

Allowed claims:

- Storage capacity risk is documented in a dedicated Phase 12B plan.
- IndexedDB migration path is planned/evaluated, not implemented.
- Backup/restore compatibility requirements for future storage migration are documented.
- Rollback/fallback requirements for future storage migration are documented.
- Testing/evidence requirements for future storage migration are documented.
- No storage schema or backup format changes were made by Phase 12B.

## 14. Forbidden claims after Phase 12B

Forbidden claims:

- Forbidden claim: IndexedDB implemented
- Forbidden claim: localStorage migrated to IndexedDB
- Forbidden claim: storage quota warning implemented
- Forbidden claim: storage capacity problem solved
- Forbidden claim: storage schema changed
- Forbidden claim: backup format changed
- Forbidden claim: restore behavior changed
- Forbidden claim: backup checksum implemented
- Forbidden claim: partial restore implemented
- Forbidden claim: incremental sync implemented
- Forbidden claim: cloud/account sync implemented
- Forbidden claim: automatic sync implemented
- Forbidden claim: encryption implemented
- Forbidden claim: data-loss prevention guaranteed
- Forbidden claim: production storage reliability certified
- Forbidden claim: package version changed
- Forbidden claim: dependencies changed
- Forbidden claim: release package created
- Forbidden claim: release tag created
- Forbidden claim: GitHub Release published

## 15. Recommended next phase

Recommended next phase: Phase 12C — Storage Quota Warning Runtime.

Phase 12C should be a small runtime phase using browser storage estimate APIs if available, with graceful fallback, no schema migration, and no backup format change.
