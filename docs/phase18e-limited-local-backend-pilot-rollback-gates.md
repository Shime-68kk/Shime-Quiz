# Phase 18E — Limited Local Backend Pilot with Rollback Gates

## Purpose

Phase 18E establishes a limited local backend pilot with rollback gates within the
Shime study application.

The pilot proves that a synthetic local backend can participate in a guarded pilot
lifecycle — including write gate, backend commit, write verification, rollback gate,
rollback execution, and rollback verification — without becoming production storage
and without affecting production behavior, real user data, or localStorage state.

Phase 18E is internal and test-only. No production behavior changes. No user-facing
migration UI. No real data movement. No localStorage deletion. No production
IndexedDBAdapter. No production registry switch.

The scope is: docs/static-validator/CI only, plus a test-only helper and unit tests.

## Relationship to Phase 18D

Phase 18D (Internal / Test-Only Local Migration Pilot) proved that a single low-risk
key family (recommendation-feedback) can be migrated in a fully synthetic, non-destructive
manner. It established the internal/test-only gate pattern, preflight → snapshot →
write simulation → write verification → rollback simulation → rollback verification
lifecycle, and explicit failure codes.

Phase 18E extends Phase 18D by:

- Introducing a named **synthetic local backend** as an explicit participant in the pilot
  (rather than a write target implied by the write simulation alone).
- Adding explicit **write gate** and **rollback gate** steps that must pass before any
  backend commit or rollback execution proceeds.
- Separating **backend commit** (write to the synthetic backend) from the write gate
  check, making the gate-then-commit ordering structurally enforced.
- Introducing **backendKind** as a first-class result field documenting that the backend
  used is synthetic and not real IndexedDB.
- Keeping all other constraints from Phase 18D: recommendation-feedback only, synthetic
  data only, no real storage, no production behavior change.

Phase 18D artifacts remain valid and unchanged. Phase 18E does not modify Phase 18D files.

## Production baseline

Production behavior as of Phase 18E is unchanged from Phase 18D:

- localStorage is the canonical production source of truth for all user data.
- The StorageAdapter scaffold (Phase 17B) exists in production but is set to the
  LocalStorage driver (no-op). No production IndexedDBAdapter exists.
- No production registry switch has occurred.
- No production migration engine exists.
- No live migration exists.
- No app boot migration exists.
- No user-facing migration UI exists.
- Backup/export behavior is unchanged (reads from localStorage directly).
- Restore behavior is unchanged (writes to localStorage directly).
- Backup/export is not adapter-aware. Phase 18E does not make backup/export adapter-aware.
- Restore is not adapter-aware. Phase 18E does not make restore adapter-aware.
- No sync, cloud, account, auth, or backend service exists.
- The pilot is not reachable by production users.
- Data-loss prevention is not guaranteed by this pilot.

## Pilot scope

Phase 18E implements a pure internal/test-only limited local backend pilot:

- Single low-risk key family: recommendation-feedback only.
- Synthetic source payload only — no real user data.
- Synthetic local backend only — in-memory, no real IndexedDB.
- All operations are gated and synthetic; no real storage reads or writes occur.
- The pilot is gated behind an explicit `testOnlyGate: true` flag.
- The pilot is only instantiable with mode `test` or `internal-test-only`.
- Live mode and production mode are rejected.
- Explicit write gate before backend commit.
- Explicit rollback gate before rollback execution.
- Stop-on-failure behavior at every step.
- Explicit failure codes for all failure conditions.
- The result includes a `claimBoundary` field documenting the scope.
- `backupExportUnchanged: true` and `restoreUnchanged: true` are present in metadata.

No production behavior is changed by Phase 18E.

## Recommendation-feedback pilot family

The recommendation-feedback key family is the single low-risk family used in the pilot.

It was chosen because:

- It is not study history.
- It is not review schedules.
- It is not FSRS metadata.
- It is not library data.
- It is not backup data.
- It is not user learning content.

The localStorage key is `shimeV2RecommendationFeedbackV1`. localStorage remains the
canonical production source of truth. The synthetic target store is
`shime-v2-idb-rec-feedback`, which exists only within the in-memory synthetic local
backend in the test helper.

The pilot rejects any family other than `recommendation-feedback` with the
`unsupported_pilot_family` failure code.

## Synthetic local backend model

The synthetic local backend is a pure in-memory object created by
`createSyntheticLocalBackend()`. It:

- Has `kind: 'synthetic'`.
- Has `isReal: false` and `isProduction: false`.
- Maintains an internal `Map` for store operations.
- Exposes `read`, `write`, `delete`, `clear`, and `has` methods.
- Does not access real IndexedDB. Does not reference `window.indexedDB` or
  `globalThis.indexedDB`.
- Does not access real localStorage. Does not reference `window.localStorage` or
  `globalThis.localStorage`.
- Is not registered in any production storage registry.
- Is not imported by any production app runtime.
- Carries a `claimBoundary` field documenting its synthetic scope.

The synthetic local backend is only valid when its `kind` is `'synthetic'` and
`isReal` is `false`. The write gate and rollback gate both verify backend kind before
authorizing any operation.

## Internal/test-only gate

The pilot requires an explicit `testOnlyGate: true` boolean parameter before it can run.

Any call without `testOnlyGate: true` (boolean) returns `missing_test_only_gate` failure.
Any call with `mode: 'live'` or `mode: 'production'` returns `live_mode_rejected` failure.

The gate is enforced in `validateBackendPilotPreflight()` before any other step executes.

This ensures the pilot cannot be invoked from production code paths.

## Preflight requirements

All of the following must pass before the pilot proceeds:

1. Mode must be `test` or `internal-test-only`.
2. `testOnlyGate` must be `true` (boolean).
3. Manifest entry must be provided and valid.
4. Data family must be `recommendation-feedback`.
5. Source payload must be provided and non-null.
6. Backend must be provided and synthetic (`kind: 'synthetic'`, `isReal: false`).

If any preflight check fails, the pilot returns immediately with an explicit failure code
and `status: 'failed'`. No subsequent steps run (stop-on-failure).

## Write gate requirements

Before any backend commit proceeds, `prepareBackendWriteGate()` must pass:

- Manifest entry must be present.
- Snapshot must have been captured (enforcing snapshot-before-write ordering).
- Backend must be present and synthetic.

The write gate returns a `writeGate` object with `passed: true` and
`localStorageUnchanged: true`. The backend commit step (`commitSyntheticBackendWrite`)
requires `writeGate.passed === true` to proceed. If `writeGate` is absent or not passed,
`commitSyntheticBackendWrite` returns `backend_commit_failed`.

This models a mandatory authorization check before any target storage operation.

## Verification gate requirements

After backend commit, `verifyBackendWriteGate()` checks that the backend checksum
produced by the commit matches the expected synthetic checksum. If the checksum does
not match, the pilot returns `write_verification_failed` and stops.

Write verification is mandatory. The pilot does not proceed to the rollback gate until
write verification passes. This models the post-write integrity check requirement.

No real storage write verification occurs. All verification is synthetic.

## Rollback gate requirements

Before rollback execution proceeds, `prepareRollbackGate()` must pass:

- Manifest entry must be present.
- Snapshot must be present (rollback target reference).
- Write verification must have passed (`writeVerification.verified === true`).

The rollback gate returns a `rollbackGate` object with `passed: true` and
`noLocalStorageDeletion: true`. The rollback execution step (`executeSyntheticRollback`)
requires `rollbackGate.passed === true` to proceed.

This models a mandatory authorization check before any rollback operation is performed.

## Recovery verification requirements

After `executeSyntheticRollback()` runs, `verifyRollbackGate()` checks that the
restored checksum matches the original source checksum. If they do not match, the
pilot returns `rollback_checksum_mismatch` and stops.

Rollback verification is mandatory. The pilot status is `completed` only after rollback
verification passes.

No real storage rollback occurs. No localStorage is modified. No localStorage is deleted.
The rollback execution is purely synthetic.

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
- `missing_backend` — backend not provided
- `invalid_backend_kind` — backend is not synthetic
- `preflight_failed` — generic preflight failure
- `snapshot_failed` — snapshot capture failed
- `write_gate_failed` — write gate check failed
- `backend_commit_failed` — synthetic backend commit failed
- `write_verification_failed` — backend write verification failed
- `rollback_gate_failed` — rollback gate check failed
- `rollback_failed` — rollback execution failed
- `rollback_verification_failed` — rollback verification failed
- `rollback_checksum_mismatch` — restored checksum does not match source checksum

## What Phase 18E explicitly does not implement

- No production IndexedDBAdapter exists.
- No production registry switch exists.
- No production migration engine exists.
- No app boot migration exists.
- No user-facing migration UI exists.
- No settings toggle exists.
- No real data movement occurs.
- No localStorage deletion happens.
- No sync, cloud, account, auth, or backend service exists.
- No backup/export runtime changes occur.
- No restore runtime changes occur.
- Phase 18E does not make backup/export adapter-aware.
- Phase 18E does not make restore adapter-aware.
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
- Data-loss prevention is not guaranteed.

## Claim boundaries

The following claims are TRUE as of Phase 18E:

- Phase 18E is internal/test-only.
- localStorage is the canonical production source of truth.
- Production behavior is unchanged.
- Backup/export behavior is unchanged.
- Restore behavior is unchanged.
- The pilot uses synthetic data only.
- The pilot uses a synthetic local backend only (no real IndexedDB).
- The pilot does not access real browser storage.
- The pilot requires an explicit test-only gate.
- Write gate must pass before backend commit.
- Rollback gate must pass before rollback execution.
- All pilot operations are fully reversible in memory.
- No localStorage deletion happens.
- `backupExportUnchanged: true` is present in the pilot result metadata.
- `restoreUnchanged: true` is present in the pilot result metadata.
- `internalPilotOnly: true` is present in the pilot result.

The following claims are FALSE and must not be made about Phase 18E:

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
- Any backend service exists.
- Public active FSRS rollout exists.
- Built-in AI or OCR exists.
- The pilot is reachable by production users.

## Go/no-go criteria for Phase 19A or storage-stabilization hold

Phase 19A (or the next storage pilot step) may begin only when:

1. Phase 18E CI is green.
2. Phase 18E unit tests pass (all required test cases).
3. Phase 18E validator chain passes with FINAL_STATUS=0.
4. Phase 18D artifacts remain valid and unchanged.
5. Phase 18C backup/export audit remains valid.
6. Phase 18C UX plan is unchanged.
7. No production src/ changes have been introduced.
8. No e2e/ changes have been introduced.
9. package.json and package-lock.json are unchanged.
10. No forbidden production runtime files exist.
11. The internal/test-only claim boundary is documented and verified.
12. No forbidden positive claims appear in docs.

If the full validator chain cannot be made green without expanding scope, or if any
forbidden file is created, the work stops and the leader is consulted before proceeding.

Phase 19A or any storage-stabilization step must remain internal/test-only unless a
separate go/no-go decision approves a staged production rollout (which requires Phase 18B
and Phase 18C requirements to be fully satisfied).

Alternatively, a storage-stabilization hold may be declared if no further local backend
pilot steps are needed before the next product release cycle.

## Future sequencing

- **Phase 18E** (this phase) — Limited local backend pilot with rollback gates; internal/test-only.
- **Phase 18F** — Staged production readiness review, including backup/export adapter
  awareness audit. Requires Phase 18B and Phase 18C requirements fully satisfied.
- **Phase 19A** — Extended pilot (additional key families or multi-key pilot), still
  test-only, or production readiness gate decision.
- **Production pilot** — Controlled production pilot with a single user-opt-in migration
  flow; requires Phase 18C UX requirements, backup-first guarantee, and a separate
  go/no-go decision.

None of the above phases will ship without a separate go/no-go decision, full CI green,
backup/export audit passing, and Phase 18C UX requirements being satisfied.

## Acceptance criteria

Phase 18E is complete when:

1. `tests/unit/helpers/limitedLocalBackendPilot.js` exists and passes all lint/import checks.
2. `tests/unit/limitedLocalBackendPilot.test.js` exists with at least 30 test cases.
3. All unit tests pass.
4. `docs/phase18e-limited-local-backend-pilot-rollback-gates.md` exists with all required sections.
5. `scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js` exists and passes.
6. `.github/workflows/e2e-smoke.yml` registers the Phase 18E validator after Phase 18D.
7. Full validator chain passes with FINAL_STATUS=0.
8. No production src/ changes.
9. No e2e/ changes.
10. No package.json or package-lock.json changes.
11. No forbidden production runtime files introduced.
12. The claim boundary is documented and accurate.
13. Backup/export and restore unchanged claims are present in metadata.
14. No forbidden positive claims appear in this document.
