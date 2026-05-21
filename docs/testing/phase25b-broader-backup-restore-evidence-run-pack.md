# Phase 25B — Broader Backup/Restore Manual Evidence Run Pack
## Status token
PHASE25B_BROADER_BACKUP_RESTORE_EVIDENCE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED

PHASE25A_BACKUP_RESTORE_DIRECTION_DECISION: PASS_TO_PHASE25B_BROADER_EVIDENCE_BEFORE_RUNTIME

## Scope
Phase 25B is docs/testing/static-validator/CI-only.
Phase 25B prepares a broader manual evidence run pack but does not execute manual/browser evidence.
Phase 25B does not change runtime behavior.
Phase 25B does not modify Phase 24E scaffold behavior.
Phase 25B does not implement production adapter-aware backup/export/restore.
Production backup/export/restore behavior remains unchanged by this patch.
Backup file format remains unchanged.
Restore overwrite behavior remains unchanged.
Current localStorage backup compatibility remains unchanged.
Default storage driver remains unchanged.
No IndexedDB.
No storage migration.
No sync/cloud/account/auth/backend.
No BETA_READY.
Historical full-chain validators remain manual/local/scheduled audit guidance.
Full historical scripts/validate-*.js chain is not used as a Phase 25B merge-blocking requirement.

## Inputs
- Phase 25A selected broader backup/restore evidence before runtime work.
- Phase 24G-B evidence is limited and must not be converted into broad reliability claims.
- Phase 25C will execute this run pack separately with generated/test data only.

## Purpose
Prepare a broader manual evidence matrix for backup/export, restore/import, reload-after-restore, and no-new-UI/no-new-claim checks without changing runtime behavior or executing browser/manual evidence in Phase 25B.

## Prerequisites
- Start from the Phase 25B branch built from clean origin/main after the Phase 25A merge.
- Install dependencies and build the app according to the Phase 25C execution instructions.
- Use only disposable generated/test data.
- Keep temporary screenshots/logs outside the repo unless a later phase explicitly scopes artifact handling.

## Environment fields
- Date/time:
- Operator:
- Commit SHA:
- OS:
- Browser and version:
- Viewport/device profile:
- Storage state before test:
- Network state:
- Notes:

## Data safety setup
Use generated/test data only.
Do not use real learner data.
Create disposable datasets before restore testing.
Keep temporary screenshots/logs outside the repo unless a later phase explicitly scopes artifact handling.
Do not claim broad backup reliability.
Do not claim long-term retention.
Do not claim browser/device matrix completion unless actually executed.
Do not claim platform backup preservation.
Do not claim production adapter-aware backup/export/restore.
Do not claim sync/cloud/account/auth/backend.
Do not claim BETA_READY.

## Generated/test data rules
- Create small disposable quiz/course data that is easy to identify after restore.
- Include at least one changed value after export so restore verification can distinguish source data from overwritten local state.
- Do not import personal, production, or real learner records.
- Record any generated dataset shape in the evidence table.

## Browser/device matrix
| Environment | Browser/viewport | Generated test data | Backup/export steps | Restore/import steps | Reload-after-restore steps | Expected result | Observed result | Pass/fail | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chromium/Chrome desktop baseline | Desktop viewport, current Chromium/Chrome if available | Disposable dataset name and contents | Record exact export action and saved file handling | Record exact import action into disposable local state | Reload app after restore and re-check restored data | Generated data restores through current behavior with no new claims | Not run in Phase 25B | Not run | Phase 25B prepared only |
| Firefox or alternative browser if available | Firefox or alternative desktop browser if available | Disposable dataset name and contents | Record exact export action and saved file handling | Record exact import action into disposable local state | Reload app after restore and re-check restored data | Generated data restores through current behavior with no new claims | Not run in Phase 25B | Not run | Record unavailable browser as not run |
| Mobile-ish viewport in Chromium/Chrome if available | Chromium/Chrome responsive or narrow viewport if available | Disposable dataset name and contents | Record exact export action and saved file handling | Record exact import action into disposable local state | Reload app after restore and re-check restored data | Generated data restores through current behavior with no new claims | Not run in Phase 25B | Not run | Record unavailable viewport as not run |
| Reload-after-restore check | Same browser used for restore row | Same disposable dataset used for restore | Reference prior export evidence | Reference prior restore evidence | Reload, close/reopen if applicable, then verify visible restored data | Restored generated data remains visible after reload under current behavior | Not run in Phase 25B | Not run | Does not prove long-term retention |
| No-new-UI/no-new-claim check | Any executed environment | N/A | Inspect backup/export UI text | Inspect restore/import UI text | Inspect post-reload UI text | No new UI claim promises broad reliability, platform preservation, sync/cloud, or BETA_READY | Not run in Phase 25B | Not run | Manual inspection only in Phase 25C |

## Backup/export checklist
- Confirm disposable generated/test data exists before export.
- Use the current backup/export flow only.
- Record browser, viewport, commit, and generated dataset.
- Record exported file name/location outside the repo.
- Do not change backup file format.

## Restore/import checklist
- Create disposable local state that can be safely overwritten.
- Use the current restore/import flow only.
- Record selected file and restore result.
- Verify generated/test data only.
- Do not claim restore overwrite behavior changed.

## Reload-after-restore checklist
- Reload the app after restore/import.
- Re-check the generated/test data.
- Record any missing, duplicated, stale, or unexpected state.
- Do not claim long-term retention from a reload check.

## No-new-UI/no-new-claim checklist
- Inspect backup/export UI for new reliability or preservation claims.
- Inspect restore/import UI for new overwrite or recovery guarantees.
- Inspect visible copy after reload.
- Record any broad claim as a failure/anomaly.

## Evidence table
| Evidence ID | Matrix row | Environment | Steps completed | Observed result | Pass/fail | Artifact location outside repo | Limitation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 25C-001 | Chromium/Chrome desktop baseline | To be recorded in Phase 25C | Not run in Phase 25B | Not run in Phase 25B | Not run | Outside repo if captured | Prepared only |
| 25C-002 | Firefox or alternative browser if available | To be recorded in Phase 25C | Not run in Phase 25B | Not run in Phase 25B | Not run | Outside repo if captured | Prepared only |
| 25C-003 | Mobile-ish viewport in Chromium/Chrome if available | To be recorded in Phase 25C | Not run in Phase 25B | Not run in Phase 25B | Not run | Outside repo if captured | Prepared only |
| 25C-004 | Reload-after-restore check | To be recorded in Phase 25C | Not run in Phase 25B | Not run in Phase 25B | Not run | Outside repo if captured | Prepared only |
| 25C-005 | No-new-UI/no-new-claim check | To be recorded in Phase 25C | Not run in Phase 25B | Not run in Phase 25B | Not run | Outside repo if captured | Prepared only |

## Failure/anomaly recording format
- Evidence ID:
- Environment:
- Generated/test data:
- Step where anomaly occurred:
- Expected result:
- Observed result:
- Screenshot/log location outside repo:
- Pass/fail:
- Follow-up recommendation:

## Pass/fail criteria
- Pass only when an executed Phase 25C row uses generated/test data, records the environment honestly, completes the required row steps, and observes the expected current behavior.
- Mark unavailable browsers/devices as not run, not pass.
- Fail any row that uses real learner data, changes runtime behavior, or adds broad reliability, platform preservation, sync/cloud, or BETA_READY claims.

## Phase 25C outline
Phase 25C — Execute Broader Backup/Restore Manual Evidence
- execute the Phase 25B matrix with generated/test data only
- record each environment honestly
- record unavailable browsers/devices as not run, not pass
- include backup/export, restore/import, reload-after-restore, and no-new-claim checks
- keep screenshots/logs outside the repo unless explicitly scoped
- do not claim broad reliability or data-loss prevention
- do not approve runtime changes

## Rollback plan
Remove docs/testing/phase25b-broader-backup-restore-evidence-run-pack.md.
Remove docs/release/phase25b-broader-backup-restore-evidence-run-pack-summary.md.
Remove scripts/validate-phase25b-broader-backup-restore-evidence-run-pack.js.
Remove Phase 25B CI registration.
No learner data migration or cleanup is required because Phase 25B changes no runtime behavior.

## What Phase 25B can claim
- Phase 25B prepared a broader backup/restore manual evidence run pack for Phase 25C.
- Phase 25B registered a static validator for the run pack.
- Phase 25B kept runtime behavior unchanged.

What can be claimed after execution:
- Phase 25C may claim only the specific environments, steps, and observed results that were actually executed and recorded.
- Phase 25C may claim unavailable browsers/devices were not run when recorded as not run.

## What Phase 25B must not claim
- Phase 25B must not claim manual/browser evidence was executed.
- Phase 25B must not claim broad backup reliability.
- Phase 25B must not claim long-term retention.
- Phase 25B must not claim browser/device matrix completion unless actually executed.
- Phase 25B must not claim platform backup preservation.
- Phase 25B must not claim production adapter-aware backup/export/restore.
- Phase 25B must not claim sync/cloud/account/auth/backend.
- Phase 25B must not claim BETA_READY.

What cannot be claimed after execution:
- Phase 25C must not claim broad reliability, data-loss prevention, platform backup preservation, sync/cloud/account/auth/backend, or BETA_READY from this matrix.
- Phase 25C must not claim unexecuted browser/device rows as pass.

Follow-up action rules:
- Treat failures/anomalies as inputs for a later scoped planning or fix phase.
- Do not approve runtime changes from Phase 25B or Phase 25C evidence alone.
- Keep follow-up artifacts outside the repo unless a later phase explicitly scopes them.

## Guardrails
- Phase 25B is evidence preparation only.
- Do not modify production backup/export/restore modules.
- Do not modify Phase 24E scaffold behavior.
- Do not add dependencies.
- Do not run the full historical scripts/validate-*.js chain as a Phase 25B merge-blocking requirement.

## Next recommended phase
Next recommended phase: Phase 25C — Execute Broader Backup/Restore Manual Evidence
Phase 25C is a separate evidence execution gate.
Phase 25B does not approve production adapter-aware backup/export/restore.
