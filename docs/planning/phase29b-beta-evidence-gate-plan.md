# Phase 29B — Beta Evidence Gate Plan

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

No runtime source changes. No unit test changes. No e2e changes. No production imports. No restore execution. No backup/export/restore behavior changes. No backup file format changes. No restore overwrite behavior changes. No storage driver changes. No migrations. No telemetry/analytics. No sync/cloud/account/auth/backend. No production-visible UI changes. No route/navigation/settings/library/dashboard changes. No browser/manual evidence execution in this phase. No BETA_READY or public production readiness approval.

Changed files:
- New: `docs/planning/phase29b-beta-evidence-gate-plan.md`
- New: `docs/testing/phase29b-beta-evidence-run-pack.md`
- New: `docs/release/phase29b-beta-evidence-gate-planning-summary.md`
- New: `docs/planning/phase29c-generated-test-manual-browser-evidence-run-seed.md`
- New: `scripts/validate-phase29b-beta-evidence-gate-planning.js`
- Modified: `.github/workflows/e2e-smoke.yml`

## Inputs from Phase 29A

Phase 29A delivered:
- Evidence review of Phase 22 through Phase 28 unit/static chain
- Readiness decision: `LIMITED_LOCAL_FIRST_HYBRID_EVIDENCE_PASS_NO_BETA_READY`
- Decision scope: `LIMITED_EVIDENCE_PASS_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY`
- Documented remaining evidence gaps (8 gaps)
- Phase 29B beta evidence gate planning seed

Phase 29A tokens carried into Phase 29B:

```text
PHASE29A_LOCAL_FIRST_HYBRID_EVIDENCE_REVIEW_STATUS: COMPLETED_PHASE22_TO_PHASE28_EVIDENCE_REVIEW
PHASE29A_LOCAL_FIRST_HYBRID_READINESS_DECISION: LIMITED_LOCAL_FIRST_HYBRID_EVIDENCE_PASS_NO_BETA_READY
PHASE29A_LOCAL_FIRST_HYBRID_DECISION_SCOPE: LIMITED_EVIDENCE_PASS_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY
PHASE29A_REMAINING_EVIDENCE_GAPS_STATUS: DOCUMENTED_FOR_FUTURE_BETA_EVIDENCE_GATE
```

Phase 29A did not execute any browser or manual evidence. Phase 29A did not approve BETA_READY, public production readiness, guaranteed data-loss prevention, restore execution, production restore rehearsal, real learner data restore rehearsal, runtime backup/export/restore changes, backup file format changes, restore overwrite behavior changes, storage migration, production adapter-aware backup/export/restore, sync/cloud/account/auth/backend, or browser/manual evidence collection.

Remaining evidence gaps from Phase 29A:
1. Manual restore rehearsal with generated/test data in a real browser session
2. Backup health signal validated in a real browser session
3. Adapter-awareness integration exercised in a real browser session
4. At least one stress test (quota/large-import) executed and results recorded
5. Tester evidence for hidden UI harness with at least one recorded session
6. Rollback of the full chain demonstrated in a dev/test environment
7. Real-user evidence expansion beyond internal sessions
8. BETA_READY evidence gate planning with explicit criteria and opt-in mechanism

## Gate purpose

Phase 29B converts the remaining evidence gaps from Phase 29A into an executable future evidence plan. Its purpose is to:

- Define beta evidence gate criteria without approving beta
- Prepare run packs for generated/test-only manual/browser evidence
- Prepare claim/copy audit criteria
- Prepare stress-adjacent generated/test evidence criteria
- Prepare Phase 29C seed for actual evidence execution
- Keep production behavior unchanged

Phase 29B does not execute any evidence. Phase 29B does not approve any readiness claim beyond the limited pass already made in Phase 29A.

## Beta evidence gate criteria

The following criteria must all be met before any BETA_READY claim can be considered in a future phase:

1. **generated/test manual/browser restore rehearsal evidence** — at least one manual restore rehearsal session using the Phase 28D/28B test-only prototype, with generated/test data only, executed in a real browser session; no real learner data; no production restore; canExecuteRestore remains false unless a separate gate approves otherwise
2. **backup health signal manual/browser evidence** — at least one manual browser session exercising the backup health signal (Phase 25I/25K/25M) via the /dev/backup-health-harness with generated/test data only; results documented
3. **adapter-awareness manual/browser evidence** — at least one manual browser session exercising the adapter-awareness thin read-only integration (Phase 27E) with generated/test data only; results documented
4. **stress-adjacent generated/test import/backup/restore evidence** — at least one stress-adjacent test (quota/large-import/concurrent-write) using generated/test data only; results recorded and documented
5. **at least one rollback/removal demonstration in dev/test** — demonstrate removal or rollback of the Phase 25–28 chain in a dev/test environment; no production state affected
6. **claim/copy audit for local-first hybrid wording** — review all documentation and any user-facing copy for claim accuracy relative to the current unit/static evidence-only posture; audit result documented
7. **Explicit decision token after evidence execution** — after all criteria are satisfied, an explicit decision token must be recorded in a separate future phase doc
8. **No real learner data capture** — all evidence sessions must use generated/test data only; no real learner data may be captured or retained
9. **No production restore execution** — no restore execution against production state; canExecuteRestore remains false
10. **No sync/cloud/account/backend behavior** — all evidence sessions must remain within local-only, browser-local scope; no network calls, no sync, no cloud, no account, no backend

## Evidence directions

Evidence directions for Phase 29C and beyond:

- **Restore rehearsal manual browser lane** — generated/test data only, Phase 28D/28B prototype, real browser session
- **Backup health manual browser lane** — generated/test data only, /dev/backup-health-harness, real browser session
- **Adapter-awareness manual browser lane** — generated/test data only, Phase 27E thin read-only integration, real browser session
- **Stress-adjacent import/quota lane** — generated/test data only, large-import/quota/concurrent-write scenarios
- **Rollback/removal lane** — dev/test environment, full Phase 25–28 chain removal demonstration
- **Claim/copy audit lane** — documentation and user-facing copy review

Each direction must be executed in Phase 29C or a later phase with its own explicit gate and evidence capture.

## Generated/test data rule

All evidence executed in Phase 29C and beyond must use generated/test data only:
- No real learner content
- No production quiz data
- No real user account data
- Generated/test data may be synthetic quiz decks, synthetic flashcard sets, synthetic import payloads, or other fabricated test fixtures
- No generated/test data may be derived from or contain real learner data

## No-real-learner-data boundary

Phase 29B does not approve and does not permit:
- Real learner data in any evidence session
- Real user quiz or flashcard content in any evidence session
- Real browser state from a production user
- Production localStorage or IndexedDB snapshots from real users
- Any evidence session that touches production state with real learner data

This boundary applies to Phase 29C and all subsequent phases until a separate explicit real-learner-data gate is approved.

## Manual/browser evidence plan

Manual/browser evidence must be executed in Phase 29C or a later dedicated evidence execution phase. Phase 29B only defines the plan.

For each manual/browser evidence session:
1. Start from a clean browser profile or incognito window
2. Use only generated/test data (no real learner data)
3. Record the browser version, OS, date/time
4. Record each action taken and the observed result
5. Record any anomalies, errors, or unexpected behaviors
6. Record the final state of localStorage and/or IndexedDB (generated/test only)
7. Confirm no network requests were made to sync/cloud/backend services
8. Confirm canExecuteRestore was false throughout restore rehearsal sessions
9. Sign off with: evidence executor, date, scope declaration ("generated/test data only, no real learner data")

## Restore rehearsal evidence plan

Restore rehearsal manual/browser evidence must:
- Use the Phase 28D/28B test-only prototype (generatedTestRestoreRehearsalPrototype / restoreRehearsalPlanner)
- Use only generated/test data
- Confirm canExecuteRestore is false throughout
- Confirm no actual write to localStorage or IndexedDB from the restore path
- Document the restore rehearsal plan output (what would be restored, not what was restored)
- Record any anomalies
- Not approve production restore execution in Phase 29C

## Backup health evidence plan

Backup health manual/browser evidence must:
- Use the /dev/backup-health-harness route (Phase 26D hidden harness)
- Use only generated/test data
- Record the backup health signal state (healthy / warning / unknown) observed in the browser
- Confirm the backup health signal does not write unexpected data
- Record any anomalies
- Not approve production backup health activation in Phase 29C

## Adapter-awareness evidence plan

Adapter-awareness manual/browser evidence must:
- Use the Phase 27E thin read-only integration prototype
- Use only generated/test data
- Confirm the adapter detection returns expected adapter type (LocalStorageAdapter in default config)
- Confirm no write path is triggered
- Record any anomalies
- Not approve production adapter-aware backup/export/restore in Phase 29C

## Stress-adjacent evidence plan

Stress-adjacent evidence must:
- Use only generated/test data
- Test at least: large import payload (synthetic deck with 100+ cards), quota warning trigger scenario, concurrent-write simulation
- Record results: success/failure, any errors, any data loss, any unexpected behavior
- Not use real learner data
- Not test against production state
- Not approve stress-tested readiness in Phase 29C without full results

## Real-user evidence expansion rule

Real-user evidence expansion beyond internal sessions requires a separate explicit gate:
- No real learner data may be captured without a separate gate
- No beta user enrollment may be activated without a separate gate
- No opt-in mechanism may be activated without a separate gate
- No public-facing evidence collection may begin without a separate gate

Phase 29B does not approve real-user evidence expansion.

## Claim and copy audit plan

Claim/copy audit must:
- Review all documentation added in Phases 25–28 for claim accuracy
- Review any user-facing copy (UI strings, README, help text) for claims about local-first hybrid behavior
- Confirm no copy claims BETA_READY, guaranteed data-loss prevention, production restore, or public production readiness
- Confirm all copy is accurate relative to the current posture: test-only/default-off, unit/static evidence only, no production activation
- Document audit results: each claim reviewed, verdict (accurate / inaccurate / needs update), action taken
- Produce an updated claim boundary statement after audit

## Go/no-go criteria

Go criteria for Phase 29C (evidence execution):
- Phase 29B planning gate complete (this doc)
- Phase 29B validator passes
- CI registers Phase 29B validator
- All required Phase 29B docs present with required tokens
- Phase 29C seed prepared
- No forbidden claims in docs

No-go criteria (halt Phase 29C):
- Any doc claims BETA_READY or public production readiness
- Any doc claims restore execution has occurred
- Any doc claims real learner data was used
- Phase 29B validator fails
- Required tokens absent

## What Phase 29B can claim

- Planning gate complete: beta evidence gate criteria defined
- Run pack prepared (not executed) for generated/test manual/browser evidence
- Phase 29C seed prepared
- Phase 29A remaining evidence gaps converted into an executable evidence plan
- No production behavior changed
- No browser or manual evidence execution occurred in Phase 29B

## What Phase 29B must not claim

- BETA_READY
- Public production readiness
- Guaranteed data-loss prevention
- Restore execution performed
- Production restore rehearsal
- Real learner data restore rehearsal
- Runtime backup/export/restore changes
- Backup file format changes
- Restore overwrite behavior changes
- Storage migration approved
- Production adapter-aware backup/export/restore
- Sync/cloud/account/auth/backend approved
- Browser/manual evidence execution in Phase 29B (none occurred)
- Phase 29C implementation exists
- Stress-tested readiness
- Broad external real-user validation

## Guardrails

- No runtime source changes
- No test changes
- No e2e changes
- No restore execution
- No production restore
- No real learner data
- No backup/export/restore behavior changes
- No backup file format changes
- No restore overwrite changes
- No storage migration
- No telemetry/analytics
- No sync/cloud/account/auth/backend
- No UI wiring or routes
- No BETA_READY claim
- No public production readiness claim
- No guaranteed data-loss prevention claim
- No browser/manual evidence claim
- No stress-tested readiness claim
- No Phase 27/28 prototype module imports in new code

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
