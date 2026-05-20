# Phase 24A — Residual Direct-Storage Audit Summary

## Status token

PHASE24A_RESIDUAL_DIRECT_STORAGE_AUDIT_STATUS: COMPLETED_AUDIT_ONLY

## Scope

Phase 24A is audit-only.
Phase 24A reads/searches code but does not change runtime behavior.
Phase 24A does not implement StorageAdapter expansion.
Phase 24A does not implement IndexedDB.
Phase 24A does not implement storage migration.
Phase 24A does not make backup/export/restore adapter-aware.
Phase 24A does not add sync, cloud, account, auth, or backend behavior.
Phase 24A does not make Shime BETA_READY.
Phase 24A only informs Phase 24B boundary planning.

## Audit summary

Residual direct-storage usage has been audited.
Direct-storage findings have been classified.
Phase 24B can use the audit to plan StorageAdapter boundaries.

The audit used static code-reading and targeted searches for localStorage, sessionStorage, indexedDB, window.localStorage, window.sessionStorage, globalThis.localStorage, Storage API usage, custom storage wrappers, backup/export/import/restore storage touchpoints, migration/journal/storage adapter touchpoints, FSRS storage touchpoints, settings/preferences persistence, Study Room or review scheduler persistence touchpoints, EduGen/import draft persistence touchpoints, and service worker/cache references if relevant.

## Key findings

- Most learner-owned data still flows through localStorage helpers or direct `getLocalStorage()` calls.
- `src/state/recommendationFeedbackStorage.js` is already adapter-backed through the existing StorageAdapter registry, but the default driver remains localStorage.
- Backup/export/restore paths in `src/state/v2BackupRestore.js` and legacy `src/quiz/dataBackup.js` are sensitive and must be kept out of Phase 24A implementation scope.
- Review scheduling and FSRS metadata persistence are sensitive because scheduler records preserve FSRS fields and interact with settings.
- `src/storage/indexedDbDryRunHarness.js` is a dry-run harness only; it is not production IndexedDB app persistence.
- Service worker Cache API usage is not learner data persistence in this audit.
- `sessionStorage`, `window.sessionStorage`, and `globalThis.localStorage` app persistence were not found in this audit.

## Sensitive touchpoints

- backup/export: direct storage reads for backup assembly and direct writes for restore remain present.
- restore: preflight, snapshot, rollback, and verification paths are backup/export/restore sensitive.
- import: library import, backup import, and EduGen draft import boundaries were inspected.
- settings/preferences: settings, theme, tour, and onboarding persistence remain local browser storage.
- review scheduling: v2 scheduler storage and legacy spaced repetition storage remain direct-storage touchpoints.
- FSRS metadata: preserved in scheduler records; no runtime change is approved.
- EduGen/import draft data: EduGen draft parser/import modules do not directly write storage in this audit.
- service worker or cache behavior: Cache API is present but classified as false positive / not app persistence.
- migration or journal references: IndexedDB dry-run harness is migration sensitive; journal-specific app persistence was not found in this audit.

## What Phase 24A can claim

- Residual direct-storage usage has been audited.
- Direct-storage findings have been classified.
- Phase 24B can use the audit to plan StorageAdapter boundaries.

## What Phase 24A must not claim

- BETA_READY
- local-first hybrid beta ready
- production IndexedDB storage exists
- StorageAdapter expansion implemented
- storage migration complete
- backup/export adapter-aware
- restore adapter-aware
- sync exists
- cloud sync exists
- account/auth/backend exists
- production sync ready
- guaranteed data-loss prevention
- platform backup will preserve user data
- built-in AI
- AI quiz generation
- OCR
- external AI/API integration
- beta-ai public naming acceptable
- Phase 24B through 24F are automatically approved
- runtime storage changes are approved
- IndexedDB pilot is approved
- backup/restore adapter-awareness runtime work is approved

## Guardrails

Phase 24A preserves runtime gates. No `src/**`, `tests/**`, `e2e/**`, package files, `sw.js`, runtime/import/storage/backup/restore behavior, FSRS runtime behavior, sync/cloud/account/auth/backend files, dependencies, telemetry/analytics, or `docs/adr/**` behavior was changed.

Phase 24B is a separate gate.
Phase 24A does not approve runtime storage changes.
Phase 24A does not approve StorageAdapter implementation.
Phase 24A does not approve IndexedDB.
Phase 24A does not approve adapter-aware backup/export/restore implementation.

## Next recommended phase

Next recommended phase: Phase 24B — StorageAdapter Coverage Plan / Boundary Decision
