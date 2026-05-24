# Phase 29B — Beta Evidence Run Pack

## Status tokens

```text
PHASE29B_BETA_EVIDENCE_GATE_PLANNING_STATUS: COMPLETED_PLANNING_GATE
PHASE29B_BETA_EVIDENCE_GATE_DECISION: PASS_TO_PHASE29C_GENERATED_TEST_MANUAL_BROWSER_EVIDENCE_RUN
PHASE29B_EVIDENCE_SCOPE: PLANNING_ONLY_GENERATED_TEST_DATA_NO_REAL_LEARNER_DATA_NO_BETA_READY
PHASE29B_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
PHASE29C_GENERATED_TEST_MANUAL_BROWSER_EVIDENCE_RUN_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 29B is a docs/planning/testing/release/static-validator/CI-only phase.

No runtime source changes. No test changes. No e2e changes. No restore execution. No production restore. No real learner data. No backup/export/restore behavior changes. No telemetry/analytics. No sync/cloud/account/auth/backend. No production-visible UI changes. No BETA_READY. No public production readiness.

## Run-pack status

```text
PHASE29B_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

This run pack is **PREPARED but NOT EXECUTED** in Phase 29B. No browser or manual evidence sessions have been run. All observed-result fields are `NOT_RUN_PHASE29B_PREPARED_ONLY`. Execution is deferred to Phase 29C.

## Purpose

This run pack defines the evidence scenarios for Phase 29C — Generated/Test Manual Browser Evidence Run. It converts the remaining evidence gaps from Phase 29A into concrete executable scenarios, with data safety rules, pass/fail criteria, and claim boundaries.

All scenarios use **generated/test data only**. No real learner data. No production state access.

## Evidence matrix

| Evidence area | Scenario | Data requirement | Expected result | Observed result | Status | Limitations | Claim allowed | Claim not allowed |
|---|---|---|---|---|---|---|---|---|
| generated/test restore rehearsal manual browser session | Open /dev restore rehearsal harness in incognito browser; load generated/test data; execute rehearsal planning; confirm canExecuteRestore is false throughout | Generated/test data only; no real learner data | Rehearsal plan generated; canExecuteRestore false; no localStorage/IndexedDB write from restore path | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Test-only prototype; no production restore; canExecuteRestore always false | Restore rehearsal planner functions with generated/test data in browser | Production restore execution; real learner data restore; canExecuteRestore true |
| backup health signal manual browser session | Open /dev/backup-health-harness in incognito browser; load generated/test data; observe backup health signal state | Generated/test data only; no real learner data | Backup health signal displays expected state (healthy/warning/unknown); no unexpected writes | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Hidden harness only; default-off; no production activation | Backup health signal reads and displays correctly with generated/test data | Production backup health activation; broad real-user validation |
| adapter-awareness manual browser session | Open app in incognito browser with default config; inspect adapter detection result via Phase 27E thin read-only integration; confirm LocalStorageAdapter detected | Generated/test data only; no real learner data | Adapter type returned is LocalStorageAdapter; no write path triggered; no IndexedDB production write | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Read-only thin integration; default LocalStorage adapter; no production adapter-aware backup/export/restore | Adapter detection returns expected adapter type with generated/test data | Production adapter-aware backup/export/restore; storage migration approved |
| stress-adjacent large import generated/test scenario | Import a synthetic deck with 100+ cards using generated/test data; observe import success, performance, and storage usage | Generated/test data only (synthetic 100+ card deck); no real learner data | Import completes successfully; no data loss; storage usage within expected bounds; no errors | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Synthetic/generated data only; not a full stress test; no real-user content | Large import succeeds with generated/test data within normal bounds | Stress-tested readiness; production data import approved |
| quota/limit warning generated/test scenario | Fill storage to near-quota using generated/test data; trigger quota warning; observe app behavior | Generated/test data only; simulated near-quota state | Quota warning displayed or handled gracefully; no data corruption; no crash | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Simulated quota; browser sandbox limits may vary; not a production stress test | Quota warning path exercised with generated/test data | Stress-tested readiness; guaranteed data-loss prevention |
| backup/export smoke with generated/test data only | Trigger backup/export flow with generated/test data; observe export file content; confirm no real learner data included | Generated/test data only; no real learner data | Export file generated with expected format; no real learner data present; export completes without error | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Generated/test data only; no production backup reliability claim | Backup/export flow operates with generated/test data | Production backup reliability; guaranteed data-loss prevention; backup format changes |
| restore rehearsal no-write verification | After restore rehearsal session: inspect localStorage and IndexedDB; confirm no unexpected writes from restore path | Generated/test data only; browser DevTools inspection | No unexpected localStorage or IndexedDB writes from restore path | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Manual DevTools inspection; not automated | Restore rehearsal produces no unexpected writes | Production restore execution approved |
| localStorage/IndexedDB no unexpected write verification | After each evidence session: inspect browser storage; confirm no unexpected writes beyond test fixtures | Generated/test data only; browser DevTools inspection | Only expected test fixture data present in storage; no production-schema writes from prototype paths | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Manual DevTools inspection; not automated | Storage inspection confirms no unexpected prototype writes | Production storage migration approved |
| network/telemetry no unexpected request verification | During each evidence session: open browser Network panel; confirm no unexpected outbound requests to sync/cloud/backend/analytics endpoints | Generated/test data only; browser Network panel inspection | No outbound requests to sync/cloud/backend/analytics/telemetry endpoints | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Manual Network panel inspection; not automated | No sync/cloud/backend/telemetry network activity confirmed | Sync/cloud/account/auth/backend approved; telemetry/analytics approved |
| rollback/removal demonstration in dev/test | In a dev/test environment: disable or remove Phase 25–28 prototype modules; confirm app builds and runs without them; confirm no production path depends on prototypes | Dev/test environment only; no production state | App builds and runs successfully with prototype chain removed; no production dependency on prototypes | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Dev/test environment only; not a production rollback; prototype modules are always-false/default-off | Rollback/removal of prototype chain demonstrated in dev/test | Production rollback plan approved; guaranteed data-loss prevention |
| claim/copy audit | Review all Phase 25–28 documentation and any user-facing copy for claim accuracy; confirm no copy claims BETA_READY, guaranteed data-loss prevention, production restore, or public production readiness | Documentation review only; no runtime changes | All claims accurate relative to current evidence posture; no overstatement | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Documentation review only; no automated claim extraction | Claim accuracy confirmed relative to unit/static evidence posture | BETA_READY; public production readiness; guaranteed data-loss prevention |
| evidence packet review | After all scenarios executed: compile evidence packet; review for completeness, accuracy, and boundary compliance; record final decision | Evidence from all sessions above | Complete, accurate, boundary-compliant evidence packet | NOT_RUN_PHASE29B_PREPARED_ONLY | PREPARED_NOT_EXECUTED | Planning-only in Phase 29B; no evidence collected yet | Evidence packet review framework defined | Any readiness claim without completed evidence packet |

## Data safety rules

1. All evidence sessions must use **generated/test data only**.
2. No real learner data may be used, captured, or retained in any evidence session.
3. Evidence sessions must start from a clean browser profile or incognito window.
4. No production localStorage or IndexedDB snapshots from real users may be used.
5. No production quiz or flashcard content from real users may be used.
6. All generated/test fixtures must be clearly identified as synthetic.
7. After each evidence session, any generated/test data left in the browser may be cleared.
8. No evidence session may connect to sync/cloud/backend/account services.
9. No network requests to analytics or telemetry endpoints are permitted.

## Generated/test data requirement

All evidence in Phase 29C and beyond must use generated/test data only:
- Synthetic quiz decks (fabricated; not from real learners)
- Synthetic flashcard sets (fabricated; not from real learners)
- Synthetic import payloads (fabricated; not from real learners)
- Synthetic storage states (fabricated; not from production snapshots)

Generated/test data must not be derived from or contain real learner data.

## No-real-learner-data rule

No real learner data may appear in any evidence session. This rule is absolute and applies to:
- Quiz content
- Flashcard content
- Import payloads
- Storage snapshots
- Browser state
- Exported files

Any evidence session that inadvertently touches real learner data must be halted and the session discarded.

## Manual/browser evidence scenarios

For each scenario, the evidence executor must:

1. Open an incognito/private browser window (Chrome, Firefox, or Safari — record which)
2. Navigate to the app served locally (e.g., `localhost:5173`)
3. Perform only the actions described in the scenario
4. Record: browser version, OS, date/time, actions taken, observed results, any anomalies
5. Inspect browser DevTools: Application > Storage (localStorage, IndexedDB) after each scenario
6. Inspect browser DevTools: Network panel during each scenario
7. Sign off: executor name/handle, date, scope declaration

Evidence session template:
```
Session: [scenario name]
Date: [YYYY-MM-DD]
Browser: [name + version]
OS: [name + version]
Executor: [name/handle]
Data used: generated/test only (no real learner data)
Actions taken:
  1. [action]
  2. [action]
  ...
Observed results:
  - [result]
  - [result]
  ...
Storage inspection: [findings]
Network inspection: [findings]
Anomalies: [none / description]
Pass/Fail: [PASS / FAIL]
Scope declaration: generated/test data only, no real learner data, no production state access
```

## Stress-adjacent evidence scenarios

Stress-adjacent scenarios (not full stress tests):

**Large import scenario:**
- Prepare a synthetic deck with 100+ cards (generated/test data)
- Import via the app's import flow
- Record: import duration, success/failure, any errors, storage size before/after
- Confirm no data loss, no crash, no unexpected network requests

**Quota/limit warning scenario:**
- Fill browser storage to near-quota using generated/test data
- Trigger the import or save flow
- Record: quota warning display (if any), graceful degradation (if any), any errors
- Confirm no data corruption, no crash

**Concurrent-write simulation:**
- Open two browser tabs to the app simultaneously
- Perform writes in both tabs using generated/test data
- Record: any conflict, any data loss, any unexpected behavior

## Rollback/removal evidence scenario

Rollback/removal must be demonstrated in a dev/test environment only. Steps:

1. In a local development checkout, disable or remove Phase 25–28 prototype module references
2. Run `npm run build`
3. Run `npm run test:unit`
4. Confirm build passes and tests pass without the prototype chain
5. Confirm no production path depends on any Phase 25–28 prototype
6. Record: build output, test output, any errors
7. Re-enable the prototype chain after verification
8. Record: outcome (PASS / FAIL)

This scenario confirms that the always-false/default-off prototype chain can be removed without affecting production behavior.

## Claim/copy audit checklist

For each document and user-facing copy item:

- [ ] Does any text claim BETA_READY or beta-ready state? → Must not
- [ ] Does any text claim public production readiness? → Must not
- [ ] Does any text claim guaranteed data-loss prevention? → Must not
- [ ] Does any text claim production restore has been executed? → Must not
- [ ] Does any text claim production restore rehearsal with real learner data? → Must not
- [ ] Does any text claim real learner data was used in any evidence session? → Must not
- [ ] Does any text claim backup file format has been changed? → Must not
- [ ] Does any text claim restore overwrite behavior has changed? → Must not
- [ ] Does any text claim storage migration (LocalStorage → IndexedDB) is complete? → Must not
- [ ] Does any text claim production adapter-aware backup/export/restore is active? → Must not
- [ ] Does any text claim sync/cloud/account/auth/backend is active? → Must not
- [ ] Does any text claim telemetry/analytics is active? → Must not
- [ ] Does any text claim stress-tested readiness? → Must not
- [ ] Does any text claim broad external real-user validation? → Must not
- [ ] Are all local-first hybrid wording claims accurate relative to unit/static evidence only posture? → Must be

## Pass/fail criteria

**PASS** for an evidence session:
- All expected results observed
- No anomalies beyond documented limitations
- No unexpected storage writes
- No unexpected network requests
- Data safety rule confirmed: generated/test only, no real learner data
- canExecuteRestore false throughout restore rehearsal sessions
- Evidence record complete with executor sign-off

**FAIL** for an evidence session:
- Any unexpected behavior not explained by documented limitations
- Any unexpected storage write from a prototype path
- Any unexpected network request to sync/cloud/backend/analytics
- Any real learner data appearing in the session
- canExecuteRestore becomes true without explicit gate approval
- Evidence record incomplete or missing executor sign-off

## Failure/anomaly recording

Any failure or anomaly must be recorded as:
```
Anomaly:
  Session: [scenario name]
  Date: [YYYY-MM-DD]
  Description: [what was observed]
  Expected: [what should have happened]
  Severity: [BLOCKER / NOTABLE / INFORMATIONAL]
  Action: [investigation needed / no action / known limitation]
```

Blockers must be resolved before the evidence packet is considered complete. Notable anomalies must be documented with an explanation. Informational anomalies may be noted and filed for future reference.

## Claim boundary

After Phase 29C evidence execution (not Phase 29B), the following claims are conditionally allowed if all pass criteria are met:

- Restore rehearsal planner functions with generated/test data in a real browser session (generated/test data only)
- Backup health signal reads and displays correctly in a real browser session (generated/test data only)
- Adapter detection returns expected adapter type in a real browser session (generated/test data only)
- Large import succeeds with generated/test data within expected bounds
- Rollback/removal of prototype chain demonstrated in dev/test environment
- Claim/copy audit completed with no overstatement found

These claims are **not approved in Phase 29B**. They become available only after Phase 29C execution with documented evidence.

The following claims are not allowed regardless of Phase 29C evidence:
- BETA_READY
- Public production readiness
- Guaranteed data-loss prevention
- Production restore execution
- Real learner data restore rehearsal
- Backup format changed
- Restore overwrite behavior changed
- Storage migration complete
- Production adapter-aware backup/export/restore active
- Sync/cloud/account/auth/backend active
- Stress-tested readiness
- Broad external real-user validation

## Next recommended phase

Next recommended phase: Phase 29C — Generated/Test Manual Browser Evidence Run

Phase 29C is a separate evidence execution gate and is not automatically approved.
Phase 29B does not approve BETA_READY.
Phase 29B does not approve public production readiness.
Phase 29B does not approve guaranteed data-loss prevention.
Phase 29B does not approve restore execution.
Phase 29B does not approve production restore rehearsal.
Phase 29B does not approve real learner data restore rehearsal.
Phase 29B does not approve runtime backup/export/restore changes.
Phase 29B does not approve backup file format changes.
Phase 29B does not approve restore overwrite behavior changes.
Phase 29B does not approve storage migration.
Phase 29B does not approve sync/cloud/account/auth/backend.
Phase 29B does not claim browser/manual evidence has been executed.
