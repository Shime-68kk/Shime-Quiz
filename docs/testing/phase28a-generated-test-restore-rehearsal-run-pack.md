# Phase 28A — Generated/Test Restore Rehearsal Run Pack

## Status token

```text
PHASE28A_RESTORE_REHEARSAL_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

## Scope

This run pack is prepared for Phase 28B execution. It is not executed in Phase 28A.

Phase 28A is a design/planning gate only. This run pack defines the evidence matrix that Phase 28B must satisfy before any test-only/no-write restore rehearsal planner implementation may be claimed as evidence.

## Run-pack status

**Status: PREPARED_NOT_EXECUTED**

This run pack has been prepared in Phase 28A but has not been executed. No evidence rows have observed results beyond static preparation facts.

Phase 28B is a separate gate and must execute this run pack as part of its implementation evidence. Execution requires a separate Phase 28B design gate approval and go/no-go decision.

## Purpose

This run pack defines:

1. The evidence areas that must be verified by Phase 28B.
2. The data requirements for each evidence area.
3. The expected results and observable evidence for each area.
4. The claim boundary — what can and cannot be claimed from this evidence.

This run pack does not authorize execution of restore rehearsal against production state. It is a planning artifact only.

## Phase 28B evidence matrix

| Evidence area | Command/check | Data requirement | Expected result | Observed result | Status | Limitations | Claim allowed | Claim not allowed |
|---|---|---|---|---|---|---|---|---|
| generated/test data fixture definition | Inspect test fixture source; grep for hardcoded synthetic data | Synthetic data only — no real learner data | Fixture is entirely synthetically generated; no real user data | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Only verifiable by reviewing fixture source | Fixture uses synthetic data | Fixture uses real learner data |
| no real learner data | Grep fixture source for real user IDs, real content references | No real learner IDs or content | No real learner data found in fixture | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Requires manual fixture source review | No real learner data used | Real learner data used in fixture |
| no production state writes | Static analysis of planner module; grep for localStorage.setItem, removeItem, clear, indexedDB write | Test-only planner source | No storage write calls in planner | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Static analysis only; does not confirm runtime behavior | No production state writes | Production state write calls present |
| no restore overwrite behavior | Grep planner source for restore import path calls | Test-only planner source | No production restore import path called | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Static analysis only | Restore overwrite behavior unchanged | Restore overwrite behavior changed |
| backup file format unchanged | Diff backup module source vs. main | Production backup module | No changes to backup module | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Requires diff at Phase 28B merge time | Backup format unchanged | Backup file format changed |
| restore/import behavior unchanged | Diff restore module source vs. main | Production restore module | No changes to restore module | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Requires diff at Phase 28B merge time | Restore/import behavior unchanged | Restore/import behavior changed |
| storage driver behavior unchanged | Diff storage driver source vs. main | Production storage driver | No changes to storage driver | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Requires diff at Phase 28B merge time | Storage driver behavior unchanged | Storage driver behavior changed |
| adapter-awareness signal compatibility | Static review of Phase 27C/27E model; confirm restore_rehearsal_verified_generated_data state reachable | Test-only adapter-awareness model | State reachable through enabled test path; canClaimProductionSafety = false | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Unit/static evidence only; no browser evidence | Adapter-awareness signal compatible with generated/test restore rehearsal | Production adapter-awareness integration approved |
| test-only planner boundary | Static review of planner module source; confirm no production imports | Test-only planner source | No production module imports the planner | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Static analysis only | Planner is test-only | Planner integrated into production |
| manual/browser evidence plan | Review manual test protocol doc if present | N/A — Phase 28B must produce this | Manual/browser evidence protocol defined | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Manual/browser evidence not collected in Phase 28A or 28B | Manual evidence plan defined | Browser evidence collected in Phase 28A |
| failure/anomaly recording | Review Phase 28B anomaly log | N/A — Phase 28B must produce this | Any anomalies recorded and described | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Anomaly recording template only | Anomalies recorded | No anomalies possible |
| rollback/removal plan | Review Phase 28B rollback plan | N/A — Phase 28B must produce this | Rollback plan defined: delete test-only file, no production change needed | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Planning only | Rollback plan defined | Rollback not needed |
| no telemetry/analytics | Grep Phase 28B source for telemetry/analytics references | Test-only planner source | No telemetry/analytics calls | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Static analysis only | No telemetry/analytics | Telemetry/analytics added |
| no sync/cloud/account/auth/backend | Grep Phase 28B source for sync/cloud/account/auth/backend imports | Test-only planner source | No sync/cloud/account/auth/backend references | NOT_RUN_PHASE28A_PREPARED_ONLY | PREPARED | Static analysis only | No sync/cloud/account/auth/backend | Sync/cloud/account/auth/backend added |

## Data safety rules

1. All fixture data used in Phase 28B must be synthetically generated.
2. No real learner data may be used at any point.
3. No real localStorage snapshot may be used.
4. No real device backup file may be used.
5. The planner must not write to any storage medium.
6. The planner must not call production restore import paths.
7. Any fixture generation code must be reviewable and confirmed to not reference real user data.

## Generated/test data requirement

Phase 28B must:

- Define synthetic backup fixtures in test files using hard-coded constants or programmatic generation.
- Confirm each fixture field is synthetic (no real user IDs, no real card content, no real progress records derived from actual users).
- Include a data safety attestation in the Phase 28B handoff: "All fixtures are synthetically generated. No real learner data was used."

## No-real-learner-data rule

Phase 28B must not:

- Import or read real localStorage content during fixture generation.
- Derive fixture data from a real backup export.
- Include any real learner IDs, card IDs, or progress records in fixtures.

## No-write/no-overwrite rule

Phase 28B must not:

- Call `localStorage.setItem`, `localStorage.removeItem`, or `localStorage.clear`.
- Call any IndexedDB write transaction.
- Import or call any production restore import function.
- Overwrite any production state.

The Phase 28B planner must be a pure function: given a fixture input, it returns a plan or summary object. It does not execute any writes.

## Manual/browser evidence boundary

- Phase 28A does not collect manual or browser evidence.
- Phase 28B does not collect manual or browser evidence (test-only/no-write implementation gate only).
- Manual/browser evidence for restore rehearsal flows requires a separate evidence collection phase.
- No user-facing restore rehearsal UI may be claimed based on Phase 28A or Phase 28B evidence alone.

## Pass/fail criteria for Phase 28B

Phase 28B may claim PASS if:

- All evidence matrix rows have observed results (not NOT_RUN).
- No real learner data used (confirmed by static review).
- No production state writes (confirmed by static analysis).
- No backup/restore/storage driver source changes.
- No production imports of the planner.
- Validator passes.
- npm ci passes.
- npm run build passes.
- npm run test:unit passes.

Phase 28B must claim FAIL if:

- Any evidence matrix row cannot be confirmed.
- Any real learner data is used.
- Any production state write call is found.
- Any production module imports the planner.
- Any backup/restore/storage driver source is changed.

## Failure/anomaly recording

If Phase 28B encounters an anomaly during evidence collection, it must record:

1. Evidence area affected.
2. Expected result.
3. Observed result.
4. Severity: BLOCKER / WARNING / INFORMATIONAL.
5. Resolution or deferral plan.

No anomaly may be suppressed or omitted from the Phase 28B handoff.

## Claim boundary

Phase 28A and Phase 28B may claim:

- Test-only/no-write restore rehearsal planner unit evidence collected.
- No real learner data used.
- No production state writes.
- Backup file format unchanged.
- Restore/import behavior unchanged.
- Storage driver behavior unchanged.

Phase 28A and Phase 28B must not claim:

- That production restore rehearsal is safe for production use.
- Restore rehearsal UI is ready for users.
- Backup reliability is guaranteed.
- Data-loss prevention is guaranteed.
- Browser evidence was collected.
- Local-first hybrid readiness.
- BETA_READY.

## Rollback/removal note

If Phase 28B introduces any risk or anomaly:

1. Delete the Phase 28B test-only planner file.
2. No production source changes are required.
3. No backup/restore/storage driver changes are required.
4. Re-evaluate the direction before proceeding.

## Next recommended phase

```text
Next recommended phase: Phase 28B — Test-Only No-Write Restore Rehearsal Planner
Phase 28B is a separate test-only/no-write implementation gate and is not automatically approved.
Phase 28A does not approve production restore rehearsal.
Phase 28A does not approve real learner data restore rehearsal.
Phase 28A does not approve runtime backup/export/restore changes.
Phase 28A does not approve backup file format changes.
Phase 28A does not approve restore overwrite behavior changes.
Phase 28A does not approve storage migration.
Phase 28A does not approve production adapter-aware backup/export/restore.
Phase 28A does not approve BETA_READY.
Phase 28A does not claim local-first hybrid readiness.
```
