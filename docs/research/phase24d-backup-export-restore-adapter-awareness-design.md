# Phase 24D — Backup/Export/Restore Adapter-Awareness Design Gate

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

## Inputs

PHASE24A_RESIDUAL_DIRECT_STORAGE_AUDIT_STATUS: COMPLETED_AUDIT_ONLY
Phase 24A is interpreted as an audit input only; it found direct-storage boundaries but did not approve backup/export/restore runtime changes.

PHASE24B_STORAGE_ADAPTER_BOUNDARY_DECISION: PASS_TO_PHASE24C_LOW_RISK_SCAFFOLD_PLANNING_WITH_RUNTIME_GATES
Phase 24B is interpreted as a boundary decision that allowed one low-risk scaffold path, not broad StorageAdapter expansion.

PHASE24C_HELP_TOUR_STORAGE_ADAPTER_SCAFFOLD_STATUS: COMPLETED_LOW_RISK_RUNTIME_SCAFFOLD
Phase 24C is interpreted as one isolated Help Tour flag scaffold; it did not change learner data persistence, backup/export/restore, IndexedDB, migration, or the default storage driver.

## Design goals

The adapter-aware backup/export purpose is to ensure a future export reads the complete learner-owned dataset through the active storage boundary when data may no longer be fully represented by direct localStorage reads.

The adapter-aware restore purpose is to ensure a future restore writes only through an explicit, verified boundary that can preview impact, preserve overwrite confirmation, take rollback snapshots, and verify post-restore state before broader claims are made.

manual backup/export is not sync. A user-controlled backup file remains required. platform backup is not guaranteed. The no-cloud/default-off trust boundary remains in force, with privacy and local-only constraints preserved.
Phase 24E scaffold limits are default-OFF or test-only scope, compatibility preservation, rollback evidence, and no production adapter-aware backup/export/restore approval.

## Current boundary

The current local-first backup boundary remains the existing production backup/export/restore behavior and file compatibility. Phase 24D does not change that behavior, does not change restore overwrite behavior, and does not change backup file format compatibility.

## Future adapter-aware boundaries

A future StorageAdapter read boundary must define which adapter keys or records are included, how manifest or metadata boundary information is represented, how backup payload versioning remains compatible, and how unknown adapter state is handled without silent omission.

A future StorageAdapter write boundary must define dry-run restore requirement, restore preview requirement, restore overwrite confirmation, rollback snapshot requirement, post-restore verification requirement, and partial restore failure handling before any production path is considered.

## Design matrix

| Area | Current behavior / assumption | Future adapter-aware requirement | Data-loss risk | Required safety gate | Phase 24E allowed action | Phase 24E forbidden action |
| --- | --- | --- | --- | --- | --- | --- |
| backup/export read path | Existing backup/export reads current production storage boundary. | Future StorageAdapter read boundary must enumerate adapter-owned data before export. | Adapter-owned data could be omitted. | Test-only read comparison and manifest review. | Add default-OFF or test-only read scaffold. | Change production backup/export behavior by default. |
| backup file format | Existing backup file format stays compatible. | Backup file format compatibility and backup payload versioning must be explicit. | Users could receive files that older restore paths cannot understand. | Compatibility fixture evidence. | Document or test metadata handling. | Change backup file format without a compatibility plan. |
| restore preview | Existing behavior is not changed by this phase. | Restore preview requirement must show affected data before writes. | User may overwrite more than expected. | Preview gate before write path. | Add test-only preview scaffold. | Bypass preview for adapter-aware writes. |
| restore overwrite confirmation | Existing restore overwrite behavior is preserved. | Restore overwrite confirmation must remain explicit across adapters. | Accidental destructive restore. | Confirmation preservation evidence. | Assert existing confirmation remains reachable. | Weaken or remove overwrite confirmation. |
| rollback snapshot | No new snapshot is created by Phase 24D. | Rollback snapshot requirement must capture pre-restore state before writes. | Failed restore could leave unrecoverable partial state. | Snapshot created and verified in dry-run/test-only flow. | Design or test-only snapshot boundary. | Claim rollback protection without evidence. |
| post-restore verification | No new verification is added by Phase 24D. | Post-restore verification requirement must compare expected and actual restored state. | Silent mismatch after restore. | Verification report before success state. | Add test-only verification checks. | Mark restore successful without verification. |
| same-adapter round trip | Current localStorage default driver compatibility remains baseline. | Same-adapter round trip must export and restore through the same adapter with equivalent data. | Same-driver regressions could break existing users. | Same-adapter round-trip evidence required. | Add default-OFF or test-only round-trip fixture. | Claim production adapter-aware restore. |
| cross-adapter round trip | No production cross-adapter behavior is approved. | Cross-adapter round trip must define compatibility and unsupported states. | Data may map incorrectly across adapters. | Cross-adapter compatibility evidence required before broader claims. | Create test-only compatibility probes. | Approve production cross-adapter migration. |
| localStorage default driver | Production default remains localStorage-compatible. | localStorage default driver compatibility must remain intact. | Existing backups could stop working. | Existing compatibility fixtures and validators. | Preserve and test localStorage path. | Remove existing localStorage backup compatibility. |
| future IndexedDB driver | IndexedDB is not implemented. | IndexedDB future-driver risk must be isolated behind later gates. | Larger async storage can fail differently and partially. | Separate IndexedDB design and runtime gate. | Mention as risk only. | Implement IndexedDB production storage. |
| partial failure handling | Existing behavior is unchanged. | Partial restore failure handling must stop, report, and preserve rollback path. | Mixed old/new data could survive silently. | Atomicity or rollback evidence. | Add test-only failure fixture. | Ignore partial restore failures. |
| corrupt backup handling | Existing corrupt backup file handling is unchanged. | Corrupt backup file handling must reject before writes. | Bad input could overwrite valid data. | Parse validation before write boundary. | Add negative test-only fixture. | Write any data before validating payload. |
| large backup/import | Existing large backup/import risk remains a known risk. | Large backup/import risk must include size, memory, and timeout handling. | Large files can freeze or partially write. | Dry-run capacity and failure evidence. | Add test-only size guard design. | Claim large-file safety without evidence. |
| manual transfer | Manual backup/export remains the user-controlled transfer path. | Manual transfer must remain local-only and explicit. | Users may mistake export for sync or platform backup. | Copy and UI claims stay honest. | Preserve manual transfer wording in docs. | Claim manual transfer is sync or guaranteed backup. |

## Restore safety requirements

Restore preview requirement must show what will be overwritten before adapter-aware writes.
Restore overwrite confirmation must remain explicit and must not be weakened.
Dry-run restore requirement must validate payload shape, manifest or metadata boundary, and target adapter support before writes.
Rollback snapshot requirement must capture the pre-restore target state before any write.
Post-restore verification requirement must compare restored state with the accepted payload before reporting success.
unknown adapter state handling must stop with a clear blocked state rather than guessing.
Corrupt backup file handling must reject before writes.
Partial restore failure handling must either roll back or leave a clear recoverable state with evidence.

## Backup/export compatibility requirements

Backup file format compatibility must be preserved unless a later phase supplies a compatibility plan.
Backup payload versioning must identify future adapter-aware metadata without breaking existing localStorage backup compatibility.
The manifest or metadata boundary must describe storage driver, payload version, included domains, and unsupported domains without implying cloud or platform backup.
Same-adapter round trip evidence required.
Cross-adapter compatibility evidence required before broader claims.
Backup file compatibility evidence required.

## Rollback and evidence requirements

rollback plan required before runtime scaffold
dry-run or test-only mode required before production behavior
same-adapter round-trip evidence required
cross-adapter compatibility evidence required before broader claims
restore overwrite safety evidence required
backup file compatibility evidence required
no data-loss guarantee may be claimed

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

Phase 24D is limited to docs, static validation, and CI registration. Runtime import/storage/backup/restore behavior, FSRS runtime, sync/cloud/account/auth/backend behavior, dependencies, telemetry/analytics, package files, service worker files, boot guard files, tests, e2e files, source files, and ADR files remain unchanged.

Phase 24E is a separate runtime gate.
Phase 24D does not approve production adapter-aware backup/export/restore.

## Next recommended phase

Next recommended phase: Phase 24E — Adapter-Aware Backup/Export/Restore Scaffold, default OFF or test-only
