# Phase 25D - Backup Health UX Planning
## Status token
PHASE25D_BACKUP_HEALTH_UX_PLANNING_STATUS: COMPLETED_UX_PLANNING_GATE

PHASE25D_BACKUP_HEALTH_UX_DECISION: PASS_TO_PHASE25E_COPY_AND_STATE_MODEL_BEFORE_RUNTIME

Phase 25C reference: PHASE25C_BROADER_BACKUP_RESTORE_MANUAL_EVIDENCE_STATUS: COMPLETED_BROADER_MANUAL_EVIDENCE

## Scope
Phase 25D is docs/planning/static-validator/CI-only.
Phase 25D does not change runtime behavior.
Phase 25D does not implement backup health UI.
Phase 25D does not modify Phase 24E scaffold behavior.
Phase 25D does not implement production adapter-aware backup/export/restore.
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
Full historical scripts/validate-*.js chain is not used as a Phase 25D merge-blocking requirement.

## Inputs
- Phase 25C broader backup/restore manual evidence.
- Existing local-first backup/export/restore guardrails.
- Phase 25D master task constraints.

## Purpose
Define a conservative future UX direction for backup health guidance before any runtime UI work begins.

## User problem
Users need a plain reminder that manual backup files are their responsibility and that browser/device storage can disappear, without being told the app has automatic backup, cloud recovery, platform backup preservation, or guaranteed data-loss prevention.

## UX principles
- Non-alarmist tone: use calm, factual language and avoid urgent or fear-based warnings.
- Manual backup mental model: backup health means the app may help users remember user-owned manual backup files, not that Shime Quiz protects data automatically.
- Evidence before claims: no runtime copy may claim a state unless the future implementation can prove the state from approved evidence.
- Reversible by design: any runtime implementation needs explicit ownership and rollback before it ships.

## Manual backup mental model
Backups are user-owned files that users create, store, and restore manually. Shime Quiz is local-first and data is stored on this device/browser. Browser/device storage can be cleared by the user, browser, OS, or device reset.

## Backup health state model
| State | User-facing meaning | Allowed copy | Forbidden copy | Evidence required before runtime implementation |
| --- | --- | --- | --- | --- |
| Unknown backup status | The app cannot determine whether a manual backup exists. | Backup status is unknown. Consider making a manual backup file. | Must not say data is protected or automatic backup is active. | Separate runtime design gate, explicit file ownership, generated/test data evidence, browser/manual smoke evidence, current-phase validator. |
| No backup recorded in this browser | No approved local marker says this browser has recorded a manual backup event. | No manual backup is recorded in this browser. You can create a user-owned backup file. | Must not say no backup exists anywhere or account recovery can restore this. | Separate runtime design gate, approved marker design, generated/test data evidence, browser/manual smoke evidence, rollback/removal plan. |
| Recent manual backup recorded | A future approved local marker may show a manual backup action happened recently in this browser. | A recent manual backup was recorded in this browser. Keep the file somewhere you control. | Must not say latest data is guaranteed safe or cloud sync is enabled. | Separate runtime design gate, copy review, timestamp/source evidence, generated/test data evidence, browser/manual smoke evidence. |
| Backup may be stale | A future approved local marker may show the last recorded manual backup is older than the accepted reminder window. | Your last recorded manual backup may be stale. Consider making a new manual backup file. | Must not say the backup is invalid or data loss is likely. | Separate runtime design gate, stale-window approval, generated/test data evidence, browser/manual smoke evidence, tester evidence if manual/browser behavior is claimed. |
| Restore recently verified on generated/test data | Future evidence may show restore behavior was checked using generated/test data, not real learner data. | Restore was recently verified on generated/test data. | Must not say restore is guaranteed for all production data or production adapter-aware backup/export/restore is approved. | Separate runtime design gate, generated/test data evidence, browser/manual smoke evidence, no production backup/restore behavior changes unless separately approved. |
| Backup status unavailable | The app cannot display or evaluate backup status in the current context. | Backup status is unavailable right now. You can still make a manual backup if export is available. | Must not say platform backup preservation is active or Shime Quiz can recover account data. | Separate runtime design gate, failure-state design, generated/test data evidence, browser/manual smoke evidence, rollback/removal plan. |

## Copy boundaries
Allowed copy may remind users to make a manual backup.
Allowed copy may say backups are user-owned files.
Allowed copy may say Shime Quiz is local-first and data is stored on this device/browser.
Allowed copy may say browser/device storage can be cleared by the user, browser, OS, or device reset.
Forbidden copy must not imply automatic backup.
Forbidden copy must not imply cloud sync.
Forbidden copy must not imply account recovery.
Forbidden copy must not imply platform-level backup preservation.
Forbidden copy must not imply guaranteed data-loss prevention.
Forbidden copy must not imply production adapter-aware backup/export/restore.

## Entry points
Future entry points may be settings, export/backup flows, restore flows, or a local data safety surface. Phase 25D does not approve adding those surfaces at runtime.

## Empty state / reminder direction
The empty state should explain that no manual backup is recorded in this browser and should offer a neutral reminder to create a user-owned backup file. It must not imply that no backup exists on another device or outside the browser.

## Failure and uncertainty handling
Unknown, stale, and unavailable states should be treated as uncertainty, not failure. Copy should invite manual backup action without claiming data is unsafe, protected, synced, recoverable, or preserved by the platform.

## Evidence requirements before runtime
Any future runtime implementation needs:
- a separate runtime design gate
- explicit file ownership
- rollback/removal plan
- copy review
- generated/test data evidence
- browser/manual smoke evidence
- no production backup/restore behavior changes unless separately approved
- current-phase validator
- strict reviewer before push/PR
- tester evidence if manual/browser behavior is claimed

## Runtime gating requirements
Runtime work must be separately approved after Phase 25E copy/state-model planning. The future gate must name owned files, reviewer role, tester role when manual/browser behavior is claimed, rollback plan, validator scope, and exact claims allowed by evidence.

Follow-up action rules: future phases may refine docs and copy first, then request a separate runtime gate only after evidence requirements, ownership, reviewer, tester needs, and rollback are explicit.

## Phase 25E outline
Phase 25E - Backup Health Copy and State Model Gate
- refine state names and microcopy
- keep scope docs/copy/static-validator unless separately approved
- do not implement runtime UI by default
- do not change backup/export/restore behavior
- require reviewer before push/PR

## Rollback plan
Remove docs/planning/phase25d-backup-health-ux-planning.md.
Remove docs/release/phase25d-backup-health-ux-planning-summary.md.
Remove scripts/validate-phase25d-backup-health-ux-planning.js.
Remove Phase 25D CI registration.
No learner data migration or cleanup is required because Phase 25D changes no runtime behavior.

## What Phase 25D can claim
What can be claimed:
Phase 25D can claim a completed UX planning gate for future backup health guidance. It can claim docs/planning/static-validator/CI-only coverage and a future-only state model.

## What Phase 25D must not claim
What must not be claimed:
Phase 25D must not claim runtime backup health UI is implemented.
Phase 25D must not claim production adapter-aware backup/export/restore.
Phase 25D must not claim broad backup reliability.
Phase 25D must not claim guaranteed data-loss prevention.
Phase 25D must not claim automatic backup, cloud sync, account recovery, platform-level backup preservation, IndexedDB, storage migration, or BETA_READY.

## Guardrails
Phase 25D preserves the existing runtime, backup file format, restore overwrite behavior, localStorage backup compatibility, default storage driver, Phase 24E scaffold behavior, and production backup/export/restore behavior.

## Next recommended phase
Next recommended phase: Phase 25E - Backup Health Copy and State Model Gate
Phase 25E is a separate copy/state-model gate.
Phase 25D does not approve runtime backup health UI.
Phase 25D does not approve production adapter-aware backup/export/restore.
