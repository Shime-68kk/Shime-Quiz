# Phase 27A — Backup/Export/Restore Adapter-Awareness Design Summary

## Status tokens

```
PHASE27A_LOCAL_FIRST_HYBRID_DIRECTION_STATUS: COMPLETED_DIRECTION_CHOICE
PHASE27A_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_STATUS: COMPLETED_DESIGN_GATE
PHASE27A_BACKUP_RESTORE_ADAPTER_AWARENESS_DECISION: PASS_TO_PHASE27B_ADAPTER_AWARENESS_EVIDENCE_AND_RUNTIME_DESIGN_REVIEW
PHASE27A_ADAPTER_AWARENESS_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

## Scope

Phase 27A is a docs/planning/testing/release/static-validator/CI-only phase.

No runtime source changes. No test changes. No e2e changes. No package changes. No backup/export/restore behavior changes. No backup file format changes. No restore overwrite behavior changes. No storage driver changes. No storage migration. No telemetry. No sync/cloud/account/auth/backend. No production UI.

## Direction choice

Phase 27A chose: **backup/export/restore adapter-awareness design** as the next local-first hybrid direction.

`PHASE27A_LOCAL_FIRST_HYBRID_DIRECTION_STATUS: COMPLETED_DIRECTION_CHOICE`

This direction was selected because it directly addresses the highest-risk unresolved gap for local-first hybrid readiness identified in Phase 26E: adapter-aware backup/export/restore has no design gate, no evidence, and no safety analysis.

## Design decision

`PHASE27A_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_STATUS: COMPLETED_DESIGN_GATE`
`PHASE27A_BACKUP_RESTORE_ADAPTER_AWARENESS_DECISION: PASS_TO_PHASE27B_ADAPTER_AWARENESS_EVIDENCE_AND_RUNTIME_DESIGN_REVIEW`

Phase 27A completed the following design gate deliverables:

1. **Problem statement**: Defined the adapter-awareness problem for backup/export/restore in the context of local-first hybrid storage (localStorage vs IndexedDB).
2. **Allowed future signal candidates**: Storage adapter identity, export source metadata, restore compatibility warning, generated/test data rehearsal, unknown adapter state.
3. **Forbidden future signals**: Learner content scanning, external file reading without user action, OS/platform backup inspection, cloud/account/backend access, telemetry, automatic backup detection, backup file format change without separate gate, restore overwrite change without separate gate, storage migration without separate gate.
4. **Backup/export boundary**: No backup file format change. No export behavior change.
5. **Restore/import boundary**: No restore overwrite behavior change. No import behavior change.
6. **Storage driver boundary**: No storage driver changes. No IndexedDB production adapter.
7. **Data safety guardrails**: No data-loss guarantee. No broad reliability claim. Rollback plan required for future runtime phases. Generated/test data only for rehearsals.
8. **Manual/browser evidence boundary**: Required for any future user-facing runtime behavior.
9. **Rollback/removal plan**: Documented for future runtime phases.
10. **Phase 27B framing**: Evidence matrix and pass/fail criteria defined.

## Run-pack status

`PHASE27A_ADAPTER_AWARENESS_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED`

The Phase 27B evidence matrix is prepared with 14 evidence rows covering:
- Current backup/export/restore/storage driver behavior unchanged.
- Backup file format and restore overwrite behavior unchanged.
- All five allowed future signal candidates reviewed at design level.
- Data safety rules: no learner content scan, no external file reads, no telemetry.
- Rollback/removal plan documented.

No evidence has been executed. Phase 27B must execute the evidence matrix.

## What is allowed next

- Phase 27B may collect generated/test data restore rehearsal evidence.
- Phase 27B may review allowed future signal candidates against runtime state.
- Phase 27B may produce a runtime design for adapter-aware backup/export/restore (subject to evidence review and strict reviewer sign-off).
- Phase 27B may recommend runtime implementation (subject to all pass criteria being met).

## What is not approved

- Runtime adapter-aware backup/export/restore (not approved in Phase 27A).
- Backup file format change (not approved in Phase 27A).
- Restore overwrite behavior change (not approved in Phase 27A).
- Storage migration (not approved in Phase 27A).
- Production adapter-aware backup/export/restore (not approved in Phase 27A).
- Local-first hybrid readiness claim (not approved in Phase 27A).
- BETA_READY (not approved in Phase 27A).
- Guaranteed data-loss prevention claim (not approved in Phase 27A).
- Broad backup reliability claim (not approved in Phase 27A).
- Platform backup preservation claim (not approved in Phase 27A).
- Automatic backup detection claim (not approved in Phase 27A).

## Validation summary

Phase 27A validator (`scripts/validate-phase27a-backup-restore-adapter-awareness-design.js`) checks:

- Required docs and validator exist.
- CI runs Phase 27A validator with explicit origin/main fetch.
- Prior validators through Phase 26E are comments only, not active gates.
- No full validate-*.js glob loop. No continue-on-error: true.
- Required tokens and headings present in all docs.
- Direction choice documented.
- Allowed and forbidden future signals documented.
- Run pack is PREPARED_NOT_EXECUTED and does not claim execution.
- Evidence matrix has required rows and columns.
- Phase 27B framing documented.
- Exact changed files are only allowed files (post-merge-main safe).
- No package/dependency/generated artifact changes.
- No telemetry/sync/cloud/backend files changed.
- Backup/export/restore modules and storage drivers unchanged.
- No runtime/source/test/e2e/ADR files changed.
- Prior phase files not modified.
- No BETA_READY, production adapter-aware backup, backup file format change, restore overwrite change, storage migration, broad reliability, data-loss guarantee, or local-first hybrid readiness claims.

## Guardrails

Production backup/export/restore behavior remains unchanged by this patch.
Backup file format remains unchanged.
Restore overwrite behavior remains unchanged.
Current localStorage backup compatibility remains unchanged.
Default storage driver remains unchanged.
No IndexedDB.
No storage migration.
No sync/cloud/account/auth/backend.
No telemetry or analytics.
No BETA_READY.
Historical full-chain validators remain manual/local/scheduled audit guidance.
Full historical scripts/validate-*.js chain is not used as a Phase 27A merge-blocking requirement.
Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.

## Next recommended phase

Next recommended phase: Phase 27B — Adapter-Awareness Evidence and Runtime Design Review.
Phase 27B is a separate evidence/design review gate and is not automatically approved.
Phase 27A does not approve runtime backup/export/restore changes.
Phase 27A does not approve backup file format changes.
Phase 27A does not approve restore overwrite behavior changes.
Phase 27A does not approve storage migration.
Phase 27A does not approve production adapter-aware backup/export/restore.
Phase 27A does not approve BETA_READY.
