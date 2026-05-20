# Phase 24A — Residual Direct-Storage Audit

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

## Inputs

- Phase 23F decision token: `PHASE23_DATA_SURVIVAL_RESEARCH_DECISION: PASS_TO_PHASE24A_AUDIT_ONLY_WITH_RUNTIME_GATES`
- Baseline: `origin/main` after Phase 23F merge.
- Source inspected by code-reading only: `src/**`, `sw.js`, `.github/workflows/e2e-smoke.yml`, and existing validator patterns.

## Audit methodology

Commands and patterns used:

```bash
git fetch origin --prune
git checkout main
git reset --hard origin/main
git clean -fd
git log --oneline -10
git checkout -B phase24a-residual-direct-storage-audit origin/main
rg -l "localStorage|sessionStorage|indexedDB|window\.localStorage|window\.sessionStorage|globalThis\.localStorage|navigator\.storage|caches\.|CacheStorage|serviceWorker|StorageAdapter|getLocalStorage|setItem|getItem|removeItem|storage\b" src sw.js
rg -n "STORAGE_KEY|_KEY\s*=|storageKey|localStorage\.setItem|localStorage\.getItem|localStorage\.removeItem|getJSON\(|setJSON\(|removeStorageItem\(|getStorageItem\(|setStorageItem\(" src sw.js
rg -n "backup|export|import|restore|migration|journal|fsrs|FSRS|settings|preferences|Study Room|study room|review scheduler|EduGen|draft" src sw.js
```

False-positive handling:

- Matches in comments or planning text were recorded only when they identify a relevant boundary.
- Storage API quota estimation was separated from app persistence.
- Service worker Cache API was separated from learner data persistence.
- Pure parser/import modules that say they do not write storage were recorded as import touchpoints, not direct persistence owners.

Known limitations:

- This is a static code-reading audit, not runtime tracing.
- It does not prove every execution path, quota failure path, or browser-specific storage behavior.
- It does not approve any migration, IndexedDB driver, backup rewrite, or StorageAdapter implementation.

## Search patterns and areas inspected

Minimum concepts considered: localStorage, sessionStorage, indexedDB, window.localStorage, window.sessionStorage, globalThis.localStorage, Storage API usage, custom storage wrappers, backup/export/import/restore storage touchpoints, migration/journal/storage adapter touchpoints, FSRS storage touchpoints, settings/preferences persistence, Study Room or review scheduler persistence touchpoints, EduGen/import draft persistence touchpoints, and service worker/cache references if relevant.

Inspected areas included `src/utils/storage.js`, `src/storage/*`, `src/data/learningDataStore.js`, `src/state/*Storage.js`, `src/state/v2BackupRestore.js`, legacy `src/quiz/*` persistence modules, `src/ui/theme.js`, `src/ui/helpTour.js`, `src/ui/onboarding.js`, `src/boot-guard.js`, `src/utils/storageQuotaEstimate.js`, EduGen import modules, and `sw.js`.

## Classification rules

- adapter candidate: user data or app state currently tied to localStorage wrappers or direct storage calls and plausible for future adapter boundary planning.
- explicitly whitelisted: existing adapter scaffold or planned localStorage passthrough that is already the intentional current boundary.
- needs design review: persistence that crosses UX/runtime ownership or has unclear future adapter semantics.
- backup/export/restore sensitive: reads or writes backup, export, import, restore, rollback, or data-transfer state.
- migration sensitive: code adjacent to IndexedDB, migration rehearsal, schema movement, journal, or rollback assumptions.
- do-not-touch until later phase: sensitive runtime area that Phase 24A must not change and Phase 24B must gate before implementation.
- false positive / not app persistence: Cache API, quota estimate, storage events, or comments that do not persist learner-owned app data.

## Residual direct-storage findings

| Area | File or pattern | Storage usage | Current role | Classification | Risk | Phase 24B follow-up |
|---|---|---|---|---|---|---|
| Storage helper wrapper | `src/utils/storage.js` | `window.localStorage`, `getItem`, `setItem`, `removeItem`, `getJSON`, `setJSON` | Central localStorage helper for many legacy modules | adapter candidate | Broad dependency surface; parse errors remove corrupt keys | Decide whether this helper becomes adapter-backed or remains a compatibility layer |
| Existing StorageAdapter scaffold | `src/storage/StorageAdapter.js`, `src/storage/LocalStorageAdapter.js`, `src/storage/storageAdapterRegistry.js` | Adapter contract wrapping localStorage passthrough | Current production default and test override registry | explicitly whitelisted | Boundary is narrow; only current migrated caller is limited | Define exact coverage target before expanding |
| Library import persistence | `src/data/learningDataStore.js` | `getLocalStorage().getItem/setItem/removeItem` on `shimeV2LibraryDataV1` | Saves imported library data and fallback metadata | adapter candidate; backup/export/restore sensitive | Core learner content; import failure or adapter mismatch could affect data survival | Treat as high-priority boundary candidate with backup compatibility requirements |
| V2 study history | `src/state/studyHistoryStorage.js` | `getLocalStorage().getItem/setItem/removeItem` on `shimeV2StudyHistoryV1` | Persists Study Room completion records | adapter candidate; backup/export/restore sensitive | Learner progress history; direct write and cleanup paths need adapter policy | Plan migration order with backup coverage |
| V2 review schedule | `src/state/reviewScheduleStorage.js` | `getLocalStorage().getItem/setItem/removeItem` on `shimeV2ReviewScheduleV1` | Persists review scheduling, including preserved FSRS fields | adapter candidate; migration sensitive; do-not-touch until later phase | Scheduler and FSRS metadata are sensitive to schema and rollback assumptions | Require separate scheduler/FSRS boundary decision |
| V2 settings/preferences | `src/state/settingsStorage.js` | `getLocalStorage().getItem/setItem/removeItem` on `shimeV2SettingsV1` | Persists settings including FSRS flags and EduGen service URL | adapter candidate; backup/export/restore sensitive | Settings are restored non-fatally; adapter changes may alter opt-in semantics | Decide whether settings move with data adapter or remain browser preference storage |
| V2 recommendation feedback | `src/state/recommendationFeedbackStorage.js` | `getStorageAdapter().readRaw/writeRaw/removeRaw` | Existing adapter-backed feedback persistence | explicitly whitelisted | Already on adapter path; still localStorage by default | Use as reference case, not proof of full coverage |
| V2 goals and plan progress | `src/state/studyGoalStorage.js`, `src/state/studyPlanProgressStorage.js` | `getLocalStorage().getItem/setItem/removeItem` | Persists study goal and plan progress | adapter candidate; backup/export/restore sensitive | Progress continuity and backup sections depend on these keys | Include in adapter coverage matrix |
| Study draft | `src/state/studyDraftStorage.js` | `getLocalStorage().getItem/setItem/removeItem` on `shimeV2StudyDraftV1` | Persists in-progress Study Room draft only | needs design review | Backup intentionally excludes drafts; adapter migration could preserve stale session data unexpectedly | Decide whether drafts are adapter-owned, ephemeral, or browser-only |
| V2 backup/export/restore | `src/state/v2BackupRestore.js` | Direct localStorage reads/writes, restore preflight probe, snapshots, rollback, settings import | Creates backup payloads and writes restored sections | backup/export/restore sensitive; do-not-touch until later phase | Central data-survival path; adapter-aware behavior is explicitly not approved | Phase 24D must gate design before any implementation |
| Legacy quiz persistence | `src/quiz/progress.js`, `history.js`, `spacedRepetition.js`, `bookmarks.js`, `collections.js`, `recommendationFeedback.js`, `studyGoal.js`, `studySession.js`, `mistakeNotebook.js` | `getJSON`, `setJSON`, `removeStorageItem` legacy keys | Persists older quiz progress, schedule, bookmarks, sessions, mistakes | adapter candidate; migration sensitive | Legacy and v2 stores coexist; adapter decisions could strand old keys | Inventory key ownership and retirement/migration policy in Phase 24B |
| Legacy backup/restore | `src/quiz/dataBackup.js` | Reads/writes legacy keys through storage helpers | Legacy backup import/export path | backup/export/restore sensitive; do-not-touch until later phase | Multiple backup systems may diverge during adapter work | Include compatibility decision in Phase 24B/24D |
| Onboarding flags | `src/ui/onboarding.js` | `getJSON`, `getStorageItem`, `setStorageItem` | Persists onboarding dismissal and imported-data flags | needs design review | User-facing state but not core learning data | Decide whether UI flags belong in adapter scope |
| Theme and help tour | `src/ui/theme.js`, `src/ui/helpTour.js`, `src/boot-guard.js` | Direct `localStorage.getItem/setItem` on `theme` and `shime_tour_done` | Browser preference and tour completion | needs design review | Direct storage is small but bypasses helper and try/catch varies | Decide if preferences remain localStorage-only or use shared helper/adapter later |
| Cross-tab storage sync | `src/state/localStorageSync.js` | `storage` event, `BroadcastChannel`, key section map | Synchronizes local mutations across tabs | false positive / not app persistence; migration sensitive | Event semantics may change if adapter backend changes | Phase 24B must account for cross-tab notifications |
| Storage quota estimate | `src/utils/storageQuotaEstimate.js` | `navigator.storage.estimate()` | Advisory quota/readiness checks | false positive / not app persistence | Not a persistence backend | Keep as capacity signal; reassess if IndexedDB is later approved |
| IndexedDB dry-run harness | `src/storage/indexedDbDryRunHarness.js` | `globalThis.indexedDB.open/deleteDatabase` on dry-run probe DB | Test-only rehearsal, no app data | migration sensitive; explicitly whitelisted | Could be mistaken for production IndexedDB | Keep out of runtime claims; require later gate for production use |
| EduGen/import draft modules | `src/edugen/edugenConnector.js`, `src/edugen/edugenDraftParser.js`, `src/edugen/edugenDraftImport.js` | No direct storage write found; import result flows to library save elsewhere | Draft parsing/import connector boundary | false positive / not app persistence; needs design review | Import touchpoint can lead to library persistence after user confirmation | Phase 24B should document import-to-storage boundary |
| Service worker/cache | `sw.js`, `src/boot-guard.js` | Cache API and `navigator.serviceWorker` controller checks | Offline shell caching and boot diagnostics | false positive / not app persistence | Cache does not store learner data in this audit | Exclude from StorageAdapter data scope unless offline data caching is later proposed |
| sessionStorage | searched pattern | not found in this audit | No direct app persistence found | false positive / not app persistence | None from current scan | No Phase 24B action unless new usage appears |
| window.sessionStorage | searched pattern | not found in this audit | No direct app persistence found | false positive / not app persistence | None from current scan | No Phase 24B action unless new usage appears |
| globalThis.localStorage | searched pattern | not found in this audit | No direct app persistence found | false positive / not app persistence | None from current scan | No Phase 24B action unless new usage appears |

## Sensitive touchpoint coverage

- backup/export: found in `src/state/v2BackupRestore.js` and legacy `src/quiz/dataBackup.js`; both are backup/export/restore sensitive and must not be changed in Phase 24A.
- restore: found in `restoreV2BackupPayload`, restore preflight, snapshot, rollback, verification, and settings restore paths; Phase 24A records risk only.
- import: found in `src/data/learningDataStore.js`, `src/state/v2BackupRestore.js`, legacy backup import, and EduGen draft import boundaries.
- settings/preferences: found in `src/state/settingsStorage.js`, `src/ui/theme.js`, `src/ui/helpTour.js`, `src/ui/onboarding.js`, and `src/boot-guard.js`.
- review scheduling: found in `src/state/reviewScheduleStorage.js`, legacy `src/quiz/spacedRepetition.js`, and Study Room scheduler flows.
- FSRS metadata: found preserved in `src/state/reviewScheduleStorage.js`; no StorageAdapter expansion is approved.
- EduGen/import draft data: no direct storage write found in EduGen parser/import modules; library persistence happens through later import confirmation.
- service worker or cache behavior: found in `sw.js` Cache API; classified as not app persistence.
- migration or journal references: dry-run IndexedDB harness found; migration journal runtime changes not approved. Journal-specific app persistence was not found in this audit.

## Unknowns and limitations

This audit does not trace browser execution, does not inspect production user devices, does not measure quota behavior, and does not validate backup restore outcomes. It records code-reading findings only.

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

## Phase 24B recommendation

Next recommended phase: Phase 24B — StorageAdapter Coverage Plan / Boundary Decision

Phase 24B is a separate gate.
Phase 24A does not approve runtime storage changes.
Phase 24A does not approve StorageAdapter implementation.
Phase 24A does not approve IndexedDB.
Phase 24A does not approve adapter-aware backup/export/restore implementation.

## Guardrails

Phase 24A preserves the Phase 23F runtime gates. It changes only docs, static validation, and CI registration. Runtime storage, backup/export/restore behavior, FSRS runtime behavior, sync/cloud/account/auth/backend behavior, dependencies, and package files remain untouched.

## Next recommended phase

Next recommended phase: Phase 24B — StorageAdapter Coverage Plan / Boundary Decision
