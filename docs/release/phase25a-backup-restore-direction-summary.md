# Phase 25A — Backup/Restore Direction Summary
## Status token
PHASE25A_BACKUP_RESTORE_DIRECTION_STATUS: COMPLETED_PLANNING_GATE

## Direction decision
PHASE25A_BACKUP_RESTORE_DIRECTION_DECISION: PASS_TO_PHASE25B_BROADER_EVIDENCE_BEFORE_RUNTIME

Option A first: Broader backup/restore manual evidence before runtime.

## Scope
Phase 25A is docs/planning/static-validator/CI-only.
Phase 25A does not change runtime behavior.
Phase 25A does not modify Phase 24E scaffold behavior.
Phase 25A does not implement production adapter-aware backup/export/restore.
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
Full historical scripts/validate-*.js chain is not used as a Phase 25A merge-blocking requirement.

## Options compared
Option A: Broader backup/restore manual evidence
- Safest first step because Phase 24G-B evidence is limited to a single local Chromium manual smoke run.
- Broader evidence should come before production backup/restore runtime changes.
- This avoids converting limited evidence into broad reliability claims.
- This keeps local-first/no-cloud/default-off identity intact.

Option B: Backup health UX planning
- Useful later for making local data survival expectations clearer.
- Not first because UX planning should be informed by broader evidence about the current flow.

Option C: Production adapter-aware backup/restore design gate
- Necessary before any production adapter-aware backup/export/restore runtime work.
- Not first because the current evidence base is too narrow to justify moving toward production runtime changes.

Option D: Local data survival / recovery UX refinement
- Valuable for recovery education and safer user expectations.
- Not first because it should follow broader evidence about actual backup/export/restore behavior.

## Why Option A is safest
Phase 24G-B evidence is limited to a single local Chromium manual smoke run.
Broader evidence should come before production backup/restore runtime changes.
This avoids converting limited evidence into broad reliability claims.
This keeps local-first/no-cloud/default-off identity intact.

## Not approved
Phase 25A does not approve:
- production adapter-aware backup/export/restore
- backup file format changes
- restore overwrite behavior changes
- IndexedDB production storage
- storage migration
- sync/cloud/account/auth/backend
- BETA_READY
- guaranteed data-loss prevention
- platform backup preservation claims

## Phase 25B outline
Phase 25B — Broader Backup/Restore Manual Evidence Run Pack
- create a browser/device/manual evidence matrix
- require generated/test data only
- preserve current backup/export/restore behavior
- include Chromium/Chrome desktop if available
- include Firefox or another browser if available
- include mobile-ish viewport if available
- include backup/export, restore/import, reload-after-restore, and no-new-claim checks
- do not claim broad reliability
- do not approve runtime changes

## Rollback plan
Remove docs/planning/phase25a-backup-restore-direction-decision.md.
Remove docs/release/phase25a-backup-restore-direction-summary.md.
Remove scripts/validate-phase25a-backup-restore-direction-decision.js.
Remove Phase 25A CI registration.
No learner data migration or cleanup is required because Phase 25A changes no runtime behavior.

## Next recommended phase
Next recommended phase: Phase 25B — Broader Backup/Restore Manual Evidence Run Pack
Phase 25B is a separate evidence planning gate.
Phase 25A does not approve production adapter-aware backup/export/restore.
