# Phase 18D — Internal / Test-Only Local Migration Pilot

## Purpose

Phase 18D establishes the first internal/test-only pilot for local storage migration
within the Shime study application.

The pilot proves that the migration flow for a single low-risk key family
(recommendation-feedback) can be executed in a fully synthetic, non-destructive manner
without affecting production behavior, real user data, or localStorage state.

Phase 18D is internal and test-only. No production behavior changes. No user-facing
migration UI. No real data movement. No localStorage deletion.

The scope is: docs/static-validator/ci only, plus a test-only helper and unit tests.

## Relationship to Phase 18B and Phase 18C

Phase 18D builds directly on two prior phases:

**Phase 18B** (Backup/Export Compatibility Audit) audited the risk surface of adapter-backed
storage against backup/export/restore behavior. It confirmed that backup/export behavior
must remain unchanged and that verified-copy-before-delete is required before any real
migration proceeds.

**Phase 18C** (Manual Migration UX Plan) planned the user-facing UX requirements for
a future manual migration flow. It confirmed that no migration UI has been shipped,
no production migration has occurred, and that any future migration must be backup-first
and recovery-aware.

Phase 18D is the first executable pilot step after Phase 18B and Phase 18C.
It does not ship UI, does not run at app boot, and does not move real user data.

## Production baseline

Production behavior as of Phase 18D is unchanged from Phase 18C:

- localStorage is the canonical production source of truth for all user data.
- The StorageAdapter scaffold (Phase 17B) exists in production but is set to LocalStorage driver (no-op).
- No production IndexedDBAdapter exists.
- No production registry switch has occurred.
- No production migration engine exists.
- No live migration exists.
- No app boot migration exists.
- No user-facing migration UI exists.
- Backup/export behavior is unchanged (reads from localStorage directly).
- Restore behavior is unchanged (writes to localStorage directly).
- Backup/export is not adapter-aware.
- Restore is not adapter-aware.
- No sync, cloud, account, auth, or backend exists.
- The pilot is not reachable by production users.

## Pilot scope

Phase 18D implements a pure internal/test-only pilot:

- Single low-risk key family: recommendation-feedback only.
- Synthetic source payload only — no real user data.
- In-memory synthetic target adapter — no real IndexedDB.
- All operations are simulated; no real storage reads or writes occur.
- The pilot is gated behind an explicit `testOnlyGate: true` flag.
- The pilot is only instantiable with mode `test` or `internal-test-only`.
- Live mode and production mode are rejected.
- Stop-on-failure behavior at every step.
- Explicit failure codes for all failure conditions.
- The result includes a claimBoundary field documenting the scope.

No production behavior is changed by Phase 18D.

## Recommendation-feedback pilot family

The recommendation-feedback key family is the single low-risk family chosen for the pilot.

It was chosen because:

- It is not study history.
- It is not review schedules.
- It is not FSRS metadata.
- It is not library data.
- It is not backup data.
- It is not user learning content.

The localStorage key is `shimeV2RecommendationFeedbackV1`. localStorage remains canonical
as the write/read surface. localStorage remains the canonical production source of truth. The synthetic target store is `shime-v2-idb-rec-feedback`,
which exists only as an in-memory simulation within the test helper.

## Internal/test-only gate

The pilot requires an explicit `testOnlyGate: true` boolean parameter before it can run.

Any call without `testOnlyGate: true` (boolean) returns `MISSING_TEST_ONLY_GATE` failure.
Any call with `mode: 'live'` or `mode: 'production'` returns `LIVE_MODE_REJECTED` failure.

The gate is enforced in `validatePilotPreflight()` before any other step executes.

This ensures the pilot cannot be invoked from production code paths.

## Preflight requirements

All of the following must pass before the pilot proceeds:

1. Mode must be `test` or `internal-test-only`.
2. `testOnlyGate` must be `true` (boolean).
3. Manifest entry must be provided and valid.
4. Data family must be `recommendation-feedback`.
5. Source payload must be provided and non-null.

If any preflight check fails, the pilot returns immediately with an explicit failure code
and `status: 'failed'`. No subsequent steps run (stop-on-failure).

## Snapshot and backup expectations

Before any write simulation occurs, `createPilotSnapshot()` captures a synthetic snapshot
of the source state. The snapshot records:

- `snapshotId` — synthetic identifier
- `capturedAt` — timestamp string
- `sourceKey` — the localStorage key (canonical source)
- `canonicalSource: 'localStorage'`
- `sourceChecksum` — deterministic synthetic checksum
- `synthetic: true`
- `claimBoundary` — states no real storage snapshot was taken; localStorage unchanged

The snapshot is required by `simulatePilotWrite()`. Write simulation cannot proceed
without a snapshot being provided.

This models the backup-before-write invariant without accessing real storage.

Backup/export behavior is unchanged. The pilot's synthetic snapshot is not a backup.
Production backup/export behavior remains unchanged.

## Write verification requirements

After write simulation, `verifyPilotWrite()` checks that the target checksum produced
by the write simulation matches the expected synthetic checksum. If the checksum does
not match, the pilot returns `WRITE_VERIFICATION_FAILED` and stops.

Write verification is mandatory. The pilot does not proceed to rollback until write
verification passes. This models the post-migration verification requirement.

No real storage write verification occurs. All verification is synthetic.

## Rollback verification requirements

After `simulatePilotRollback()` runs, `verifyPilotRollback()` checks that the restored checksum
matches the original source checksum. If they do not match, the pilot returns
`ROLLBACK_CHECKSUM_MISMATCH` and stops.

Rollback verification is mandatory. The pilot status is `completed` only after rollback
verification passes.

No real storage rollback occurs. No localStorage is modified. No localStorage is deleted.
The rollback simulation is purely synthetic.

## Failure and stop-on-failure behavior

The pilot uses stop-on-failure: any step that fails causes immediate return with:

- `ok: false`
- `error: <failure_code>`
- `failureCode: <failure_code>`
- `status: 'failed'`

Defined failure codes (FAILURE_CODES):

- `live_mode_rejected` — live/production mode attempted
- `unsupported_pilot_family` — non-recommendation-feedback family
- `missing_test_only_gate` — testOnlyGate not explicitly true
- `missing_manifest_entry` — manifest entry absent
- `missing_source_payload` — source payload null or undefined
- `invalid_source_payload` — source payload not an object
- `preflight_failed` — generic preflight failure
- `snapshot_failed` — snapshot creation failed
- `write_simulation_failed` — write simulation failed
- `write_verification_failed` — write verification failed
- `rollback_simulation_failed` — rollback simulation failed
- `rollback_verification_failed` — rollback verification failed
- `rollback_checksum_mismatch` — restored checksum does not match source

## What Phase 18D explicitly does not implement

- No production IndexedDBAdapter exists.
- No production registry switch exists.
- No production migration engine exists.
- No app boot migration exists.
- No user-facing migration UI exists.
- No settings toggle exists.
- No real data movement occurs.
- No localStorage deletion happens.
- No sync, cloud, account, auth, or backend exists.
- No backup/export runtime changes occur.
- No restore runtime changes occur.
- No production behavior change of any kind.
- No real browser storage dependency.
- No dual-write to production storage.
- No pilot reachable by production users.
- No FSRS changes.
- No EduGen changes.
- No scheduler changes.
- No import parser changes.
- No package.json or package-lock.json changes.
- No e2e/ changes.
- No src/ changes.

## Claim boundaries

The following claims are TRUE as of Phase 18D:

- Phase 18D is internal/test-only.
- localStorage is the canonical production source of truth.
- Production behavior is unchanged.
- Backup/export behavior is unchanged.
- Restore behavior is unchanged.
- The pilot uses synthetic data only.
- The pilot does not access real browser storage.
- The pilot requires an explicit test-only gate.
- All pilot operations are fully reversible in memory.
- No localStorage deletion happens.

The following claims are FALSE and must not be made about Phase 18D:

- A production migration has shipped.
- Production IndexedDB storage exists.
- A production IndexedDBAdapter exists.
- A production registry switch has occurred.
- Backup/export is adapter-aware.
- Restore is adapter-aware.
- Data-loss prevention is guaranteed.
- Live migration is safe or implemented.
- Cloud sync exists.
- Account or auth system exists.
- Any backend exists.
- Public active FSRS rollout exists.
- Built-in AI or OCR exists.
- The pilot is reachable by production users.

## Go/no-go criteria for Phase 18E

Phase 18E (or the next internal pilot step) may begin only when:

1. Phase 18D CI is green.
2. Phase 18D unit tests pass (all 21+ test cases).
3. Phase 18D validator chain passes.
4. Phase 18C backup/export audit remains valid.
5. Phase 18C UX plan is unchanged.
6. No production src/ changes have been introduced.
7. No e2e/ changes have been introduced.
8. package.json and package-lock.json are unchanged.
9. No forbidden production runtime files exist.
10. The internal/test-only claim boundary is documented and verified.

Phase 18E must remain internal/test-only unless a separate go/no-go decision
approves a staged production rollout (which would require Phase 18B and Phase 18C
requirements to be fully satisfied).

## Future sequencing

- **Phase 18E** — Extended internal pilot (additional key families or multi-key pilot), still test-only.
- **Phase 18F** — Staged production readiness review, including backup/export adapter awareness audit.
- **Phase 18G** — Controlled production pilot with a single user-opt-in migration flow (requires Phase 18C UX requirements).

None of the above phases will ship without a separate go/no-go decision, full CI green,
backup/export audit passing, and Phase 18C UX requirements being satisfied.

## Acceptance criteria

Phase 18D is complete when:

1. `tests/unit/helpers/internalLocalMigrationPilot.js` exists and passes all lint/import checks.
2. `tests/unit/internalLocalMigrationPilot.test.js` exists with at least 21 test cases.
3. All unit tests pass.
4. `docs/phase18d-internal-test-only-local-migration-pilot.md` exists with all required sections.
5. `scripts/validate-phase18d-internal-test-only-local-migration-pilot.js` exists and passes.
6. `.github/workflows/e2e-smoke.yml` registers the Phase 18D validator after Phase 18C.
7. Full validator chain passes with FINAL_STATUS=0.
8. No production src/ changes.
9. No e2e/ changes.
10. No package.json or package-lock.json changes.
11. No forbidden production runtime files introduced.
12. The claim boundary is documented and accurate.
