# Phase 27A — Backup/Export/Restore Adapter-Awareness Run Pack

## Status token

```
PHASE27A_ADAPTER_AWARENESS_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

## Scope

This run pack defines the evidence matrix and review checks for Phase 27B. It does not execute any evidence runs. It does not approve any runtime adapter-aware backup/export/restore implementation.

Phase 27A only prepares a design and evidence gate for Phase 27B. No runtime checks are performed by this run pack.

## Run-pack status

`PHASE27A_ADAPTER_AWARENESS_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED`

This run pack is prepared for Phase 27B. No evidence has been executed in Phase 27A. All Observed result fields are `NOT_RUN_PHASE27A_PREPARED_ONLY` unless the item is a static preparation fact that can be confirmed without executing runtime code.

## Purpose

The purpose of this run pack is to:

1. Define the evidence matrix required before Phase 27B can approve any adapter-aware backup/export/restore runtime design.
2. Establish data safety rules for all evidence collection.
3. Define the manual/browser evidence boundary.
4. Define the pass/fail criteria for Phase 27B.
5. Record failure/anomaly handling rules.
6. Establish the claim boundary.
7. Document the rollback/removal note.

This run pack is a gate document. Phase 27B must complete the evidence matrix before any runtime implementation decision.

## Phase 27B evidence matrix

| Evidence area | Command/check | Data requirement | Expected result | Observed result | Status | Limitations | Claim allowed | Claim not allowed |
|---|---|---|---|---|---|---|---|---|
| current backup/export behavior unchanged | `npm run test:unit` (backup/export unit tests) | Generated/test data only | All backup/export unit tests pass with no regression | NOT_RUN_PHASE27A_PREPARED_ONLY | PREPARED | Phase 27A does not run this check | Backup/export behavior unchanged in Phase 27A | Adapter-aware backup implemented |
| current restore/import behavior unchanged | `npm run test:unit` (restore/import unit tests) | Generated/test data only | All restore/import unit tests pass with no regression | NOT_RUN_PHASE27A_PREPARED_ONLY | PREPARED | Phase 27A does not run this check | Restore/import behavior unchanged in Phase 27A | Adapter-aware restore implemented |
| current storage driver behavior unchanged | `npm run test:unit` (storage driver unit tests) | Generated/test data only | All storage driver unit tests pass with no regression | NOT_RUN_PHASE27A_PREPARED_ONLY | PREPARED | Phase 27A does not run this check | Storage driver behavior unchanged in Phase 27A | IndexedDB production adapter enabled |
| backup file format unchanged | Static: no backup file format change in Phase 27A diff | N/A — static check | No backup file format change found in diff | NOT_RUN_PHASE27A_PREPARED_ONLY | PREPARED | Confirmed by allowed-file list (no src/ changes) | Backup file format unchanged | Backup file format change is not approved by Phase 27A |
| restore overwrite behavior unchanged | Static: no restore overwrite change in Phase 27A diff | N/A — static check | No restore overwrite behavior change found in diff | NOT_RUN_PHASE27A_PREPARED_ONLY | PREPARED | Confirmed by allowed-file list (no src/ changes) | Restore overwrite behavior unchanged | Restore overwrite behavior change is not approved by Phase 27A |
| adapter identity candidate review | Design doc review: `docs/planning/phase27a-backup-restore-adapter-awareness-design.md` | N/A — design review | Adapter identity candidate defined, not implemented | PREPARED_NOT_EXECUTED — design gate documented | PREPARED | Design only; no runtime signal exists yet | Adapter identity candidate defined | Adapter identity signal implemented in runtime |
| export metadata candidate review | Design doc review: `docs/planning/phase27a-backup-restore-adapter-awareness-design.md` | N/A — design review | Export source metadata candidate defined, not implemented | PREPARED_NOT_EXECUTED — design gate documented | PREPARED | Design only; no runtime metadata added | Export metadata candidate defined | Export metadata added to backup file format |
| restore compatibility warning candidate review | Design doc review: `docs/planning/phase27a-backup-restore-adapter-awareness-design.md` | N/A — design review | Restore compatibility warning candidate defined, not implemented | PREPARED_NOT_EXECUTED — design gate documented | PREPARED | Design only; no runtime warning added | Restore compatibility warning candidate defined | Restore compatibility warning implemented in runtime |
| generated/test data restore rehearsal plan | Design doc review: generated/test data only rule documented | Generated/test data only | Plan documented; no real learner content used | PREPARED_NOT_EXECUTED — rule documented | PREPARED | Phase 27B must collect actual rehearsal evidence | Rehearsal plan documented | Real learner content used in rehearsal |
| manual/browser evidence plan | Design doc review: manual/browser evidence boundary documented | N/A — plan review | Manual/browser evidence boundary documented | PREPARED_NOT_EXECUTED — boundary documented | PREPARED | Phase 27B must collect actual browser evidence | Browser evidence plan documented | Browser evidence claim without execution |
| no learner content scanning | Static: no src/ changes in Phase 27A | N/A — static check | No learner content scanning code introduced | NOT_RUN_PHASE27A_PREPARED_ONLY | PREPARED | Confirmed by allowed-file list | No learner content scanning in Phase 27A | Learner content scanning is permitted |
| no external file reads without explicit user action | Static: no src/ changes in Phase 27A | N/A — static check | No external file reads without explicit user action introduced | NOT_RUN_PHASE27A_PREPARED_ONLY | PREPARED | Confirmed by allowed-file list | No external file reads added in Phase 27A | Automatic external file reading is permitted |
| no telemetry/analytics | Static: no src/ changes in Phase 27A | N/A — static check | No telemetry or analytics code introduced | NOT_RUN_PHASE27A_PREPARED_ONLY | PREPARED | Confirmed by allowed-file list | No telemetry/analytics in Phase 27A | Telemetry/analytics approved |
| rollback/removal plan | Design doc review: rollback plan documented in design gate | N/A — plan review | Rollback plan documented | PREPARED_NOT_EXECUTED — plan documented | PREPARED | Phase 27B must confirm rollback plan for any runtime phase | Rollback plan documented | Rollback plan not required |

## Data safety rules

1. All restore rehearsal evidence collected for Phase 27B must use only generated/test data. Real learner content must never be used for automated rehearsal evidence.
2. No backup file format change may be introduced without a separate design/evidence gate.
3. No restore overwrite behavior change may be introduced without a separate design/evidence gate.
4. No storage migration may be performed without a separate design/evidence gate.
5. Any adapter-aware restore that could overwrite existing data must show a clear user warning before proceeding.
6. Rollback must be possible for any adapter-aware backup/export/restore change.
7. No cloud/account/backend access for adapter identity evidence.
8. No telemetry/analytics for adapter tracking evidence.
9. No scanning of learner content to infer adapter state.

## Manual/browser evidence boundary

Phase 27A does not require manual/browser evidence.

Phase 27B must include the following before approving any user-facing adapter-aware behavior:

- Browser evidence of the adapter identity signal (enabled state) in a local dev environment.
- Browser evidence that no learner content is scanned.
- Browser evidence of the restore compatibility warning (if implemented) on multiple browsers (Chrome, Firefox, Safari/WebKit).
- Screen size coverage: desktop and mobile viewport.
- Accessibility quick check: keyboard navigation, screen reader compatibility.
- Confirmation that no unexpected network or telemetry requests are made.

No user-facing runtime UI or browser behavior claim may be made without manual/browser evidence.

## Adapter-awareness design review checks

Before Phase 27B may approve any runtime implementation, the following design review checks must pass:

1. **Adapter identity source confirmed**: The source of the adapter identity signal is confirmed to be an existing runtime state with no new persistent tracking added.
2. **Backup file format decision gate**: A separate design/evidence gate is completed if any backup file format change is required.
3. **Restore overwrite decision gate**: A separate design/evidence gate is completed if any restore overwrite behavior change is required.
4. **Storage migration decision gate**: A separate design/evidence gate is completed if any storage migration is required.
5. **No learner content scan confirmed**: Static analysis confirms no learner content scan is introduced.
6. **No automatic external file read confirmed**: Static analysis confirms no automatic external file reading is introduced.
7. **No telemetry/analytics confirmed**: Static analysis confirms no telemetry or analytics is added.
8. **Rollback plan documented**: A concrete rollback plan is documented for any runtime phase.
9. **Strict reviewer sign-off**: A strict reviewer has reviewed the design and runtime implementation before merge.
10. **Generated/test data rehearsal evidence**: Restore rehearsal evidence using generated/test data is collected and reviewed.

## Pass/fail criteria for Phase 27B

Pass criteria (all must be met):

- All existing backup/export/restore unit tests pass with no regression.
- All existing storage driver unit tests pass with no regression.
- No backup file format change introduced (or separate gate completed).
- No restore overwrite behavior change introduced (or separate gate completed).
- No storage migration introduced (or separate gate completed).
- No learner content scanning introduced.
- No automatic external file reading introduced.
- No telemetry/analytics introduced.
- Rollback plan documented and confirmed feasible.
- Strict reviewer sign-off received.
- Generated/test data restore rehearsal evidence collected.
- Manual/browser evidence collected for any user-facing behavior.
- All Phase 27A and prior validators pass.

Fail criteria (any one causes failure):

- Any backup/export/restore unit test regression.
- Any backup file format change without a separate gate.
- Any restore overwrite behavior change without a separate gate.
- Any storage migration without a separate gate.
- Any learner content scanning introduced.
- Any automatic external file reading introduced.
- Any telemetry/analytics introduced.
- No rollback plan documented.
- No strict reviewer sign-off.
- No generated/test data rehearsal evidence.
- Any user-facing behavior without manual/browser evidence.

## Failure/anomaly recording

If any evidence item fails or produces an anomaly in Phase 27B:

1. Record the exact failure/anomaly in the Phase 27B evidence doc.
2. Do not proceed to runtime implementation until the failure/anomaly is resolved.
3. If the failure/anomaly reveals a design flaw, return to Phase 27A design gate and revise.
4. If the failure/anomaly reveals a safety risk, STOP and document the risk before any further implementation.
5. Do not claim PASS for Phase 27B if any failure/anomaly is unresolved.

## Claim boundary

Phase 27A can claim:
- Direction choice complete.
- Design gate complete.
- Run pack prepared.
- All Phase 26E and prior validators pass.
- No production behavior changed.
- No runtime code changed.

Phase 27A must not claim:
- Runtime adapter-aware backup/export/restore is not claimed as implemented.
- Backup file format change is not approved by Phase 27A.
- Restore overwrite behavior change is not approved by Phase 27A.
- Storage migration is not approved by Phase 27A.
- Production adapter-aware backup/export/restore is not approved by Phase 27A.
- Local-first hybrid readiness has not been achieved and is not claimed.
- BETA_READY is not claimed.
- No guaranteed data-loss prevention is claimed.
- No broad backup reliability is claimed.

## Rollback/removal note

If Phase 27B or any subsequent runtime phase is abandoned:

1. The design gate document (`docs/planning/phase27a-backup-restore-adapter-awareness-design.md`) may be kept as a historical reference or archived.
2. The run pack document (this file) may be kept as a historical reference or archived.
3. No runtime code needs to be removed (Phase 27A introduces no runtime code).
4. Any future runtime phase that is abandoned must follow its own rollback plan.

## Next recommended phase

Next recommended phase: Phase 27B — Adapter-Awareness Evidence and Runtime Design Review.
Phase 27B is a separate evidence/design review gate and is not automatically approved.
Phase 27A does not approve runtime backup/export/restore changes.
Phase 27A does not approve backup file format changes.
Phase 27A does not approve restore overwrite behavior changes.
Phase 27A does not approve storage migration.
Phase 27A does not approve production adapter-aware backup/export/restore.
Phase 27A does not approve BETA_READY.
