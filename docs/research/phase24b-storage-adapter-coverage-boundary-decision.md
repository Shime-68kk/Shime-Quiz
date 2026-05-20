# Phase 24B — StorageAdapter Coverage Plan / Boundary Decision

## Decision token

PHASE24B_STORAGE_ADAPTER_BOUNDARY_DECISION: PASS_TO_PHASE24C_LOW_RISK_SCAFFOLD_PLANNING_WITH_RUNTIME_GATES

## Scope

Phase 24B is docs/design/static-validator/CI-only.
Phase 24B does not change runtime behavior.
Phase 24B does not implement StorageAdapter expansion.
Phase 24B does not implement IndexedDB.
Phase 24B does not implement storage migration.
Phase 24B does not make backup/export/restore adapter-aware.
Phase 24B does not add sync, cloud, account, auth, or backend behavior.
Phase 24B does not make Shime BETA_READY.
Phase 24B only defines future StorageAdapter coverage boundaries.

## Inputs

- Phase 23F decision token: `PHASE23_DATA_SURVIVAL_RESEARCH_DECISION: PASS_TO_PHASE24A_AUDIT_ONLY_WITH_RUNTIME_GATES`
- Phase 24A status token: `PHASE24A_RESIDUAL_DIRECT_STORAGE_AUDIT_STATUS: COMPLETED_AUDIT_ONLY`
- Phase 24A interpretation: completed audit-only means residual direct-storage usage was classified, but runtime storage changes, StorageAdapter expansion, IndexedDB, storage migration, and backup/export/restore adapter work were not approved.

## Phase 24A audit interpretation

Phase 24A found residual direct-storage usage across legacy quiz modules, v2 library/state modules, settings/preferences, Study Room drafts, review scheduling, backup/export/restore, and UI preference flags.

The existing adapter-backed reference path is `src/state/recommendationFeedbackStorage.js`, which uses `getStorageAdapter()` while the production default remains localStorage passthrough. IndexedDB remains dry-run/test-only, and service worker Cache API references are not app data persistence.

Phase 24B interprets that audit as a boundary-planning input only. It does not authorize broad runtime work. The safest next runtime planning target is one narrow, low-risk storage module or boundary that can be reviewed, rolled back, and validated independently in Phase 24C.

## Boundary categories

- safe low-risk adapter candidate: narrow persistence with low backup, migration, and scheduling coupling.
- explicitly whitelisted direct-storage usage: current behavior intentionally left as-is for now.
- needs design review before implementation: storage whose product semantics, ownership, or user expectations must be settled first.
- backup/export/restore sensitive: backup, export, import, restore, snapshot, rollback, or verification paths.
- migration sensitive: legacy/v2 coexistence, schema movement, IndexedDB, journal, or rollback assumptions.
- do-not-touch until later phase: areas reserved for a dedicated gated phase.
- false positive / not app persistence: storage-related APIs that do not persist learner-owned app data.

## Boundary matrix

| Area | Representative files or patterns | Phase 24A classification | Phase 24B boundary decision | Runtime risk | Allowed next action | Forbidden next action |
|---|---|---|---|---|---|---|
| legacy quiz modules | `src/quiz/progress.js`, `history.js`, `spacedRepetition.js`, `bookmarks.js`, `collections.js`, `recommendationFeedback.js`, `studyGoal.js`, `studySession.js`, `mistakeNotebook.js` | adapter candidate; migration sensitive | needs design review before implementation | Legacy and v2 stores coexist; adapter changes could strand old keys | Inventory key ownership and choose at most one isolated low-risk candidate later | Broad legacy migration or adapter conversion |
| v2 library/state modules | `src/data/learningDataStore.js`, `src/state/studyHistoryStorage.js`, `studyGoalStorage.js`, `studyPlanProgressStorage.js` | adapter candidate; backup/export/restore sensitive | needs design review before implementation | Core learner data and progress are backup-visible | Define ownership and evidence requirements before any runtime phase | Change storage driver or key layout |
| settings/preferences | `src/state/settingsStorage.js`, `src/ui/theme.js`, `src/ui/helpTour.js`, `src/ui/onboarding.js`, `src/boot-guard.js` | adapter candidate; needs design review before implementation | safe low-risk adapter candidate only for one non-core UI flag if separately scoped | Preference semantics may differ from learner-owned data | Consider one UI flag or settings helper boundary for Phase 24C only with rollback evidence | Move all settings/preferences into adapter scope |
| Study Room drafts | `src/state/studyDraftStorage.js` | needs design review before implementation | needs design review before implementation | Drafts are intentionally not backup-owned and may be ephemeral | Decide whether drafts are browser-only, ephemeral, or adapter-owned | Preserve or migrate drafts without product decision |
| review scheduling | `src/state/reviewScheduleStorage.js`, legacy `src/quiz/spacedRepetition.js` | adapter candidate; migration sensitive; do-not-touch until later phase | do-not-touch until later phase | Scheduling and FSRS metadata have rollback and schema risk | Document scheduler/FSRS ownership for a later gate | Modify scheduler persistence in Phase 24C |
| recommendationFeedbackStorage adapter-backed reference path | `src/state/recommendationFeedbackStorage.js`, `src/storage/StorageAdapter.js`, `LocalStorageAdapter.js`, `storageAdapterRegistry.js` | explicitly whitelisted direct-storage usage | explicitly whitelisted direct-storage usage | Already adapter-backed but still localStorage by default | Use as reference for adapter shape and evidence style | Treat as proof full StorageAdapter expansion is done |
| backup/export | `src/state/v2BackupRestore.js`, `src/quiz/dataBackup.js` | backup/export/restore sensitive; do-not-touch until later phase | backup/export/restore sensitive | Central data-survival path | Reserve for Phase 24D design gate | Add adapter routing to export or change payload contents |
| restore | `restoreV2BackupPayload`, restore preflight, snapshots, rollback, verification | backup/export/restore sensitive; do-not-touch until later phase | backup/export/restore sensitive | Restore failure can affect learner-owned data | Reserve for Phase 24D design gate | Add adapter routing to restore or change rollback behavior |
| import | `src/data/learningDataStore.js`, `src/state/v2BackupRestore.js`, legacy import paths | backup/export/restore sensitive; needs design review before implementation | needs design review before implementation | Imports create or overwrite learner data after confirmation | Define import-to-storage boundary in a later design gate | Change import write behavior |
| FSRS metadata | `src/state/reviewScheduleStorage.js` preserved FSRS fields | migration sensitive; do-not-touch until later phase | do-not-touch until later phase | FSRS fields affect review scheduling continuity | Keep FSRS runtime untouched until dedicated gate | Change FSRS storage, backup, or scheduling behavior |
| EduGen/import draft data | `src/edugen/edugenConnector.js`, `edugenDraftParser.js`, `edugenDraftImport.js` | false positive / not app persistence; needs design review before implementation | needs design review before implementation | Draft import can flow into library persistence later | Document handoff boundary from parsed draft to confirmed import | Add storage writes in EduGen draft modules |
| migration/journal references | migration/journal planning references, rollback assumptions | migration sensitive | do-not-touch until later phase | Migration affects reversibility and data survival evidence | Require later migration gate and rollback plan | Implement storage migration or journal runtime |
| IndexedDB dry-run/test-only references | `src/storage/indexedDbDryRunHarness.js` | explicitly whitelisted direct-storage usage; migration sensitive | explicitly whitelisted direct-storage usage | Could be mistaken for production IndexedDB | Keep dry-run/test-only framing | Approve production IndexedDB or default driver changes |
| service worker Cache API references | `sw.js`, service worker cache usage | false positive / not app persistence | false positive / not app persistence | Cache API does not store learner-owned app data in the audit | Exclude from StorageAdapter data scope | Treat Cache API as app data persistence |
| UI preference flags | `theme`, `shime_tour_done`, onboarding flags | needs design review before implementation | safe low-risk adapter candidate if exactly one isolated flag is chosen | Low data-survival risk but user expectation and boot timing matter | Candidate for Phase 24C if file ownership is strict | Touch boot/runtime storage broadly |

## Low-risk candidate recommendation

Low-risk candidate areas have been identified. Phase 24C may plan exactly one narrow scaffold around a non-core UI preference flag or similarly isolated settings/preferences boundary, using `src/state/recommendationFeedbackStorage.js` only as an adapter-backed reference path.

The recommended Phase 24C candidate is not backup/export/restore, not IndexedDB, not scheduler/FSRS, not migration, and not core learner library data. It should be selected only if Phase 24C can name exact changed-file ownership, rollback steps, reviewer before push/PR, and tester/local validation for any runtime behavior change.

## Sensitive and do-not-touch areas

Backup/export/restore sensitive areas remain gated. `src/state/v2BackupRestore.js`, legacy `src/quiz/dataBackup.js`, restore preflight, snapshots, rollback, verification, import overwrite paths, and backup payload shape must wait for Phase 24D or later.

Review scheduling, FSRS metadata, migration/journal references, IndexedDB production storage, legacy/v2 coexistence, and core learner library/state persistence are not approved for runtime changes by Phase 24B.

## Phase 24C gate conditions

Phase 24C must choose exactly one low-risk storage module or boundary.
Phase 24C must not touch backup/export/restore runtime.
Phase 24C must not touch IndexedDB.
Phase 24C must not change default storage driver.
Phase 24C must not migrate data.
Phase 24C must include rollback plan.
Phase 24C must include evidence plan.
Phase 24C must include strict changed-file ownership.
Phase 24C must include reviewer before push/PR.
Phase 24C must include tester/local validation if runtime behavior changes.

## What Phase 24B can claim

- StorageAdapter coverage boundaries have been planned.
- Low-risk candidate areas have been identified.
- Backup/export/restore sensitive areas remain gated.
- Phase 24C can be scoped separately if the boundary decision passes.

## What Phase 24B must not claim

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
- Phase 24C through 24F are automatically approved
- runtime storage changes are approved broadly
- IndexedDB pilot is approved
- backup/restore adapter-awareness runtime work is approved

## Guardrails

Phase 24B preserves the Phase 23F and Phase 24A runtime gates. It changes only docs, static validation, and CI registration. Runtime storage, backup/export/restore behavior, FSRS runtime behavior, sync/cloud/account/auth/backend behavior, dependencies, telemetry/analytics, package files, `sw.js`, `src/**`, `tests/**`, `e2e/**`, and `docs/adr/**` remain untouched.

## Next recommended phase

Next recommended phase: Phase 24C — One Low-Risk Storage Module Adapter Scaffold

Phase 24C is a separate runtime gate and is not automatically approved by Phase 24B.
