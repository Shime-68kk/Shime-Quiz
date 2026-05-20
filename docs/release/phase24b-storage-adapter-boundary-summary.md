# Phase 24B — StorageAdapter Boundary Summary

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

Phase 23F remains the prior runtime gate: `PHASE23_DATA_SURVIVAL_RESEARCH_DECISION: PASS_TO_PHASE24A_AUDIT_ONLY_WITH_RUNTIME_GATES`.
Phase 24A remains audit-only: `PHASE24A_RESIDUAL_DIRECT_STORAGE_AUDIT_STATUS: COMPLETED_AUDIT_ONLY`.
Phase 24B interprets Phase 24A as completed audit-only evidence, not approval for runtime storage work.

## Boundary summary

StorageAdapter coverage boundaries have been planned.
Low-risk candidate areas have been identified.
Backup/export/restore sensitive areas remain gated.
Phase 24C can be scoped separately if the boundary decision passes.

The Phase 24A audit covered legacy quiz modules, v2 library/state modules, settings/preferences, Study Room drafts, review scheduling, the recommendationFeedbackStorage adapter-backed reference path, backup/export, restore, import, FSRS metadata, EduGen/import draft data, migration/journal references, IndexedDB dry-run/test-only references, service worker Cache API references, and UI preference flags.

## Low-risk candidate recommendation

The preferred Phase 24C planning target is one isolated settings/preferences or UI preference flag boundary, using `src/state/recommendationFeedbackStorage.js` as a reference for adapter-backed shape only.

This does not approve broad runtime work, core learner data movement, default driver changes, IndexedDB, migration, or backup/export/restore adapter work.

## Sensitive areas that remain gated

Backup/export/restore sensitive areas remain gated, including `src/state/v2BackupRestore.js`, legacy `src/quiz/dataBackup.js`, restore preflight, snapshots, rollback, verification, import overwrite paths, and backup payload shape.

Review scheduling, FSRS metadata, migration/journal references, IndexedDB production storage, legacy/v2 coexistence, and core learner library/state persistence remain do-not-touch until a later dedicated gate.

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
