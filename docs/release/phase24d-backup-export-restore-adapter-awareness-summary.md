# Phase 24D — Backup/Export/Restore Adapter-Awareness Summary

## Decision token

PHASE24D_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_DECISION: PASS_TO_PHASE24E_TEST_ONLY_SCAFFOLD_WITH_ROLLBACK_GATES

## Scope

Phase 24D is docs/design/static-validator/CI-only.
Phase 24D does not change runtime behavior.
Phase 24D does not implement adapter-aware backup/export/restore.
Phase 24D does not change backup/export/restore file formats.
Phase 24D does not change restore overwrite behavior.
Phase 24D does not implement IndexedDB.
Phase 24D does not implement storage migration.
Phase 24D does not change the default storage driver.
Phase 24D does not add sync, cloud, account, auth, or backend behavior.
Phase 24D does not make Shime BETA_READY.
Phase 24D only defines a future backup/export/restore adapter-awareness design gate.

PHASE24A_RESIDUAL_DIRECT_STORAGE_AUDIT_STATUS: COMPLETED_AUDIT_ONLY
Phase 24A remains an audit-only input.

PHASE24B_STORAGE_ADAPTER_BOUNDARY_DECISION: PASS_TO_PHASE24C_LOW_RISK_SCAFFOLD_PLANNING_WITH_RUNTIME_GATES
Phase 24B allowed narrow scaffold planning only.

PHASE24C_HELP_TOUR_STORAGE_ADAPTER_SCAFFOLD_STATUS: COMPLETED_LOW_RISK_RUNTIME_SCAFFOLD
Phase 24C completed one isolated Help Tour flag scaffold and did not touch backup/export/restore runtime.

## Design summary

Backup/export/restore adapter-awareness design direction exists.
The future adapter-aware backup/export purpose is to read complete learner-owned data through the active StorageAdapter boundary when applicable while preserving backup file format compatibility and localStorage default driver compatibility.
The future adapter-aware restore purpose is to prevent data-loss traps across adapter boundaries by requiring restore preview, restore overwrite confirmation, dry-run restore requirement, rollback snapshot requirement, and post-restore verification requirement.
The design covers future StorageAdapter read boundary, future StorageAdapter write boundary, backup payload versioning, manifest or metadata boundary, same-adapter round trip, cross-adapter round trip, unknown adapter state handling, corrupt backup file handling, large backup/import risk, IndexedDB future-driver risk, partial restore failure handling, manual backup/export is not sync, user-controlled backup file remains required, platform backup is not guaranteed, no-cloud/default-off trust boundary, privacy and local-only constraints, and Phase 24E scaffold limits.

## Restore safety requirements

Restore preview, rollback, dry-run, and verification requirements have been defined.
Restore preview requirement must describe affected data before writes.
Restore overwrite confirmation must be preserved.
Dry-run restore requirement must validate payload, manifest or metadata boundary, and adapter support before writes.
Rollback snapshot requirement must capture pre-restore state.
Post-restore verification requirement must compare restored state with expected state.
Partial restore failure handling must stop, report, and preserve rollback or recoverability evidence.

## Backup/export compatibility requirements

Backup file format compatibility must be preserved unless a later compatibility plan is approved.
Backup payload versioning must be explicit before metadata expands.
Existing localStorage backup compatibility must remain intact.
Same-adapter round-trip evidence required.
Cross-adapter compatibility evidence required before broader claims.
Backup file compatibility evidence required.
Manual backup/export is not sync, a user-controlled backup file remains required, and platform backup is not guaranteed.

## Phase 24E gate conditions

Phase 24E must be default OFF or test-only.
Phase 24E must not change production backup/export/restore behavior by default.
Phase 24E must not change backup file format without a compatibility plan.
Phase 24E must not remove existing localStorage backup compatibility.
Phase 24E must not implement IndexedDB production storage.
Phase 24E must not migrate data.
Phase 24E must include rollback snapshot design.
Phase 24E must include restore preview or explicit overwrite confirmation preservation.
Phase 24E must include post-restore verification.
Phase 24E must include strict changed-file ownership.
Phase 24E must include reviewer before push/PR.
Phase 24E must include tester/local validation.

rollback plan required before runtime scaffold
dry-run or test-only mode required before production behavior
same-adapter round-trip evidence required
cross-adapter compatibility evidence required before broader claims
restore overwrite safety evidence required
backup file compatibility evidence required
no data-loss guarantee may be claimed

## What Phase 24D can claim

Backup/export/restore adapter-awareness design direction exists.
Restore preview, rollback, dry-run, and verification requirements have been defined.
Phase 24E can be scoped separately as default-OFF or test-only scaffold if the design passes.
Production adapter-aware backup/export/restore is not implemented.

## What Phase 24D must not claim

BETA_READY
local-first hybrid beta ready
production IndexedDB storage exists
StorageAdapter expansion broadly implemented
storage migration complete
backup/export adapter-aware
restore adapter-aware
adapter-aware backup/export/restore implemented
sync exists
cloud sync exists
account/auth/backend exists
production sync ready
guaranteed data-loss prevention
platform backup will preserve user data
built-in AI
AI quiz generation
OCR
external AI/API integration
beta-ai public naming acceptable
Phase 24E through 24F are automatically approved
runtime backup/export/restore changes are broadly approved
IndexedDB pilot is approved

## Guardrails

Phase 24D remains docs/design/static-validator/CI-only and does not approve runtime backup/export/restore changes. Runtime import/storage/backup/restore behavior, FSRS runtime, sync/cloud/account/auth/backend behavior, dependencies, telemetry/analytics, package files, service worker files, boot guard files, tests, e2e files, source files, and ADR files remain unchanged.

Phase 24E is a separate runtime gate.
Phase 24D does not approve production adapter-aware backup/export/restore.

## Next recommended phase

Next recommended phase: Phase 24E — Adapter-Aware Backup/Export/Restore Scaffold, default OFF or test-only
