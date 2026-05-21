# Phase 24G-A — Backup/Restore Manual Smoke Run Pack
## Status token
PHASE24G_MANUAL_SMOKE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED

## Scope
Phase 24G-A is docs/testing/static-validator/CI-only.
Phase 24G-A prepares a manual smoke run pack but does not execute manual/browser smoke.
Phase 24G-A does not change runtime behavior.
Phase 24G-A does not modify Phase 24E scaffold behavior.
Phase 24G-A does not implement production adapter-aware backup/export/restore.
Production backup/export/restore behavior remains unchanged.
Backup file format remains unchanged.
Restore overwrite behavior remains unchanged.
Current localStorage backup compatibility remains unchanged.
Default storage driver remains unchanged.
No IndexedDB.
No storage migration.
No sync/cloud/account/auth/backend.
No BETA_READY.
Historical full-chain validators remain manual/local/scheduled audit guidance.
Full historical scripts/validate-*.js chain is not used as a Phase 24G-A merge-blocking requirement.

## Inputs
Phase 24D input: PHASE24D_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_DECISION: PASS_TO_PHASE24E_TEST_ONLY_SCAFFOLD_WITH_ROLLBACK_GATES
Phase 24D-HF2 input: PHASE24D_HF2_CI_VALIDATOR_STRATEGY_STATUS: COMPLETED_CURRENT_PHASE_GATE_RESET
Phase 24E input: PHASE24E_ADAPTER_AWARE_BACKUP_RESTORE_SCAFFOLD_STATUS: COMPLETED_TEST_ONLY_SCAFFOLD
Phase 24F input: PHASE24F_REGRESSION_EVIDENCE_AFTER_ADAPTER_CHANGES_STATUS: COMPLETED_EVIDENCE_GATE
Phase 24E added a test-only/default-off scaffold and did not approve production adapter-aware backup/export/restore.
Phase 24F recorded CLI/static regression evidence and did not run browser/manual smoke.
Phase 24G-A starts from clean origin/main after the Phase 24F merge.

## Purpose
Prepare a strict manual smoke checklist for future execution of existing production backup/export/restore behavior.
The checklist is for disposable evidence collection only.
If browser/manual smoke is not actually run, status remains PREPARED_NOT_EXECUTED.
Coverage labels: What can be claimed after execution; What cannot be claimed after execution; Follow-up action rules.

## Prerequisites
- Start from a clean branch based on origin/main after Phase 24F.
- Install dependencies with npm ci before running local validation.
- Run the app from the exact commit SHA recorded in the evidence table.
- Use generated/test data only.
- Do not use real learner data.
- Confirm the tester understands that backup is a user-controlled file flow, not sync.
- Confirm the tester understands that restore may overwrite current app data.

## Environment fields
Record browser, OS, app URL, commit SHA, date/time, tester name/handle, and observed result.
Record these fields before execution:
- tester name/handle
- date/time
- commit SHA
- app URL
- browser and browser version
- OS and OS version
- viewport or device class
- storage mode observed by the app
- existing data state before test setup
- observed result

## Data safety setup
Use a fresh browser profile, a disposable local app state, or an isolated test URL whenever possible.
Before restore testing, create a disposable test dataset.
Do not import, restore, upload, paste, or screenshot real learner data.
Create a backup file from generated/test data and keep it only long enough to complete the smoke run.
Delete disposable backup files and disposable browser state after evidence is recorded.

## Test data rules
The test dataset should contain generated/test-only quiz content with visible names and counts that are easy to verify after restore.
Include at least one generated library, one generated quiz item, and one visible progress or metadata field if the existing UI exposes it.
Use names that make accidental production use obvious, such as `phase24g-disposable-library`.
Do not use private study content, real class material, credentials, contact details, or identifying data.

## Backup/export smoke checklist
Record pass, fail, blocked, or not run for each item.

| ID | Check | Expected result | Observed result | Status |
| --- | --- | --- | --- | --- |
| B1 | Open the existing backup/export surface. | Existing UI is reachable without new Phase 24G-A UI. | | |
| B2 | Confirm backup/export copy is understandable as a user-controlled file action. | Copy does not imply sync, cloud, account, or guaranteed recovery. | | |
| B3 | Create/export a backup from disposable generated data. | Browser produces a backup file using the existing flow. | | |
| B4 | Confirm the backup file can be located by the tester. | Tester can identify the generated backup file without ambiguity. | | |
| B5 | Record visible source data counts or labels before restore. | Evidence includes enough source-state details to compare after restore. | | |

## Restore smoke checklist
Record pass, fail, blocked, or not run for each item.

| ID | Check | Expected result | Observed result | Status |
| --- | --- | --- | --- | --- |
| R1 | Prepare a second disposable local state before restore. | Current app state is disposable and safe to overwrite. | | |
| R2 | Start restore using the generated backup file. | Existing restore flow accepts the generated backup file. | | |
| R3 | Observe restore warning or overwrite confirmation. | Restore makes overwrite risk clear using existing behavior. | | |
| R4 | Complete restore only after confirming disposable data safety. | Restore completes or reports a clear existing error. | | |
| R5 | Compare visible labels, counts, and quiz content after restore. | Restored state matches the disposable source state closely enough for smoke evidence. | | |
| R6 | Record any mismatch, unexpected warning, browser issue, or file handling issue. | Failure details are concrete and reproducible. | | |

## No-new-UI/no-new-claim checklist
Record pass, fail, blocked, or not run for each item.

| ID | Check | Expected result | Observed result | Status |
| --- | --- | --- | --- | --- |
| G1 | Look for Phase 24G-A-only runtime UI. | No new runtime UI exists from this phase. | | |
| G2 | Look for sync/cloud/account/auth/backend claims during backup/restore. | No such claims are made. | | |
| G3 | Look for platform backup preservation wording. | No platform preservation promise is made. | | |
| G4 | Look for broad data-loss prevention wording. | No broad data-loss prevention claim is made. | | |
| G5 | Look for production adapter-aware backup/export/restore approval wording. | No approval is made. | | |

## Evidence table
Use this table during the future Phase 24G-B execution gate.

| Field | Value |
| --- | --- |
| Status | PREPARED_NOT_EXECUTED until manual/browser smoke is actually run |
| Tester name/handle | |
| Date/time | |
| Commit SHA | |
| App URL | |
| Browser | |
| OS | |
| Viewport/device class | |
| Disposable dataset name | |
| Backup file name or sanitized identifier | |
| Backup/export observed result | |
| Restore observed result | |
| No-new-UI/no-new-claim observed result | |
| Overall pass/fail/blocked result | |
| Follow-up issue or action | |

## Failure recording format
For each failure, record:
- check ID
- expected result
- actual result
- exact step where the failure occurred
- browser and OS
- commit SHA
- whether disposable data was used
- whether restore was attempted
- sanitized screenshot or log reference, if available
- recommended follow-up owner or phase

Follow-up action rules:
- File a follow-up issue for any failed or blocked check.
- Do not patch runtime behavior during Phase 24G-A evidence preparation.
- Escalate any unsafe claim, unclear overwrite warning, or data mismatch to a separate implementation or evidence gate.
- Keep the run status PREPARED_NOT_EXECUTED until Phase 24G-B actually executes browser/manual smoke.

## Pass/fail criteria
Pass requires all backup/export, restore, and no-new-UI/no-new-claim checklist items to pass with generated/test data only.
Fail if backup/export cannot produce a file, restore cannot complete from the generated file, restored visible data does not match the source state, overwrite risk is unclear, or unsafe claims appear.
Blocked if the app cannot load, the tester cannot isolate disposable data, the browser cannot access generated files, or the tester cannot verify source and restored state.
Do not claim broad data-loss prevention.
Do not claim platform backup preservation.
Do not claim production adapter-aware backup/export/restore.
Do not claim sync/cloud/account/auth/backend.

## Rollback plan
Remove docs/testing/phase24g-backup-restore-manual-smoke-run-pack.md.
Remove docs/release/phase24g-manual-smoke-run-pack-summary.md.
Remove scripts/validate-phase24g-manual-smoke-run-pack.js.
Remove Phase 24G-A CI registration.
No learner data migration or cleanup is required because Phase 24G-A changes no runtime behavior.

## What Phase 24G-A can claim
Phase 24G-A can claim that a strict backup/restore manual smoke run pack is prepared.
Phase 24G-A can claim that static validation checks the run pack, release summary, changed-file scope, and CI registration.
Phase 24G-A can claim current-phase CI strategy remains active.
Phase 24G-A can claim status only as PREPARED_NOT_EXECUTED.

## What Phase 24G-A must not claim
BETA_READY
manual/browser smoke was executed
broad data-loss prevention
platform backup preservation
production IndexedDB storage exists
storage migration complete
sync exists
cloud sync exists
account/auth/backend exists
production sync ready
adapter-aware backup/export/restore implemented for production
production adapter-aware backup/export/restore
guaranteed data-loss prevention
platform backup will preserve user data

## Guardrails
Phase 24G-A does not approve production adapter-aware backup/export/restore.
Phase 24G-A does not approve IndexedDB.
Phase 24G-A does not approve migration.
Phase 24G-A does not approve sync/cloud/account/auth/backend work.
Phase 24G-A does not modify historical validators.
Historical full-chain validators remain manual/local/scheduled audit guidance.
Full historical scripts/validate-*.js chain is not used as a Phase 24G-A merge-blocking requirement.

## Next recommended phase
Next recommended phase: Phase 24G-B — Execute Backup/Restore Manual Smoke Evidence
Phase 24G-B is a separate evidence execution gate.
Phase 24G-A does not approve production adapter-aware backup/export/restore.
