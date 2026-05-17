# Phase 17I — Local Migration Readiness Closure / Phase 18 Gate

## Purpose

Phase 17I formally closes the Phase 17 local migration safety foundation track and establishes a strict gate for entering Phase 18A. It summarizes what Phase 17A–17H has proven, locks the Phase 17 claim boundary, and defines what Phase 18A may and may not implement.

Phase 17I is docs/static-validator/CI-only. It does not implement runtime migration, EventLog runtime, MigrationJournal runtime, migration engine, IndexedDBAdapter, SyncAdapter, live migration, dual-write, production adapter switch, app boot migration, user-facing migration UI, real data movement, localStorage deletion, sync/cloud/account/auth/backend, FSRS changes, EduGen changes, scheduler changes, import parser changes, backup schema changes, or storage schema behavior changes.

---

## Phase 17 Evidence Summary

### Phase 17A — Backup/Rollback Harness Before Migration

Established the backup/rollback readiness harness that must exist before any migration can begin. Proved that a snapshot-and-restore pattern exists in test-only code, using synthetic data only. No real localStorage data was read, written, or deleted. No production migration code was introduced.

### Phase 17B — LocalStorage-Backed StorageAdapter Scaffold

Introduced a StorageAdapter interface and a LocalStorageAdapter implementation. The production storage registry was wired to use LocalStorageAdapter as the sole adapter. No IndexedDB adapter was created. No migration was run. The scaffold exists as the abstraction layer that future adapters would implement.

### Phase 17C — IndexedDB Dry-Run Harness (Synthetic Data Only)

Introduced an indexedDbDryRunHarness test helper that probes IndexedDB capability using synthetic data only. No real user data was read or written. No production adapter switch was made. The harness confirmed that IndexedDB APIs are available in the test environment but does not constitute a production adapter.

### Phase 17D — Migration Journal / Event Log Architecture Guardrail

Added docs-only architecture definition for the migration journal and event log. Defined how migration status transitions should be represented. Established a static validator and CI step to enforce that no runtime EventLog or MigrationJournal is created prematurely. No runtime code was introduced.

### Phase 17E — Per-Key Migration Manifest Design

Added docs-only manifest design defining how individual storage keys will be tracked during migration. Specified manifest fields (key, family, status, checksums, timestamps) and the allowed status transitions. Established a static validator enforcing that no runtime manifest loader exists. No runtime code was introduced.

### Phase 17F — Test-Only Migration Journal Prototype

Introduced a test-only migration journal helper (`migrationJournalTestHarness.js`) that models status transitions in memory using synthetic data. Added 54 unit tests verifying status transition semantics, error code requirements, and invalid-transition rejection. The helper is gated entirely within `tests/` and does not reference any browser APIs, production storage modules, or real data.

### Phase 17G — Single-Key Dry-Run Migration Rehearsal

Introduced a test-only dry-run helper (`singleKeyDryRunMigrationRehearsal.js`) for the low-risk recommendation-feedback key family. Added 63 unit tests verifying dry-run status transitions, write verification logic, rollback preparedness, and live-mode rejection. Used synthetic fixtures only. No production adapter was switched, no real data was touched.

### Phase 17H — Single-Key Reversible Migration Pilot

Introduced a test-only reversible pilot helper (`singleKeyReversibleMigrationPilot.js`) for the recommendation-feedback family. The pilot modeled the full write-then-rollback loop (backup → write → verify → rollback → verify-restored) using synthetic data only. Added tests verifying rollback preconditions, checksum matching, write verification before completion, and rollback verification before final success. The pilot proved the rollback semantics but does not constitute a live migration.

---

## What Phase 17 Proves

Phase 17A–17H collectively prove only the following:

- Backup/rollback readiness patterns exist in test-only code.
- A StorageAdapter abstraction exists with LocalStorageAdapter as the sole production adapter.
- IndexedDB capability/dry-run probing exists for synthetic data only; no production adapter uses IndexedDB.
- The migration manifest and event log architecture is specified in documentation.
- Test-only journal helpers can model status transitions from `planned` through `rolled-back` using synthetic fixtures.
- A low-risk recommendation-feedback dry-run rehearsal can complete using synthetic data.
- A low-risk recommendation-feedback reversible pilot can prove rollback semantics using synthetic data.
- The static validator chain can enforce scope boundaries across all Phase 17 deliverables.

---

## What Phase 17 Does Not Prove

Phase 17 does not prove any of the following:

- Production IndexedDB storage is ready.
- A production IndexedDBAdapter exists.
- Runtime EventLog or MigrationJournal exists in any form.
- Live migration is safe.
- Dual-write is safe.
- App boot migration is safe.
- User-facing migration UI is ready.
- Real user data movement is safe.
- localStorage deletion is safe.
- Backup/export compatibility for adapter-backed storage is complete.
- Sync/cloud/account/auth/backend exists or is ready.
- FSRS public rollout is ready.
- Data-loss prevention is guaranteed for any migration scenario.

---

## Phase 18A Entry Criteria

Phase 18A must not begin until all of the following are satisfied:

1. Phase 17I is merged and CI is green on `main`.
2. All Phase 17A–17H validators still pass on the `main` branch.
3. No pending artifact integrity issues (no generated artifacts in repo, no `node_modules` committed).
4. Phase 18A is explicitly and narrowly scoped as a test-only IndexedDBAdapter prototype.
5. Phase 18A must not switch the production storage registry.
6. Phase 18A must not migrate real data.
7. Phase 18A must not read, write, or delete real localStorage data as part of any migration flow.
8. Phase 18A must not delete localStorage keys.
9. Phase 18A must not add a user-facing migration UI or any Settings migration toggle.
10. Phase 18A must not add sync, cloud, account, auth, or backend runtime.
11. Phase 18A must use synthetic fixtures and tests first; no live data path.
12. Phase 18A must include fallback and error handling for unsupported-browser scenarios in tests.
13. Phase 18A must preserve export/backup trust boundaries.

---

## Phase 18A Allowed Scope Preview

### Phase 18A May

- Create a test-only IndexedDBAdapter prototype or isolated adapter test fixture.
- Use IndexedDB APIs only in test-gated contexts (never in production app boot or storage registry).
- Add tests for open/store/read/write/delete behavior using synthetic data.
- Define unsupported-browser fallback behavior and test it.
- Verify adapter contract behavior (reads return what was written, errors propagate correctly) without switching the production registry.
- Document limitations and non-goals explicitly.

### Phase 18A Must Not

- Switch the production StorageAdapter registry from LocalStorage to IndexedDB.
- Implement live migration or dual-write production data.
- Run an app boot migration.
- Add Settings UI or a user-facing migration flow.
- Migrate study, review, FSRS, or backup data.
- Delete localStorage keys in any production or semi-production context.
- Claim that production IndexedDB storage support exists after Phase 18A.

---

## Claim Boundaries

### Allowed Claims After Phase 17I

The following claims are true and may be made after Phase 17I merges:

- The Phase 17 local migration foundation is complete.
- Test-only dry-run and reversible pilot evidence exists for the low-risk recommendation-feedback key family.
- Phase 18A may begin as a test-only IndexedDBAdapter prototype, provided all Phase 18A entry criteria are satisfied and CI is green.
- Production migration remains unshipped.
- IndexedDB production storage remains unshipped.
- localStorage remains the canonical production storage baseline.

### Forbidden Claims

The following claims are false and must not be made after Phase 17I:

- Migration has shipped.
- IndexedDB production storage exists.
- A production IndexedDBAdapter exists.
- Runtime EventLog or MigrationJournal exists.
- Live migration is safe.
- Data-loss prevention is guaranteed.
- Sync, cloud, account, or auth exists.
- Public active FSRS rollout is ready.
- Built-in AI or built-in OCR exists.
- Security or E2EE certification exists.

---

## Risk Register for Phase 18

The following risks must be addressed before or during Phase 18 work:

| Risk | Description | Mitigation Required |
|------|-------------|---------------------|
| IndexedDB browser compatibility | IndexedDB may be unavailable or restricted in private browsing, certain browser versions, or embedded WebViews | Fallback to localStorage must be tested; browser-compat matrix must be defined |
| Quota / storage pressure | IndexedDB writes may fail silently or throw quota-exceeded errors under low-disk conditions | Quota error handling must be tested with synthetic scenarios |
| Async adapter boundary bugs | Async read/write semantics differ from synchronous localStorage; race conditions and missing await could produce phantom reads | All adapter contract tests must use async/await correctly; concurrency tests must be included |
| Schema mismatch | If the stored data format diverges from what the app expects after migration, reads may return corrupt or incomplete data | Schema version checks and validation must be included before any migration |
| Transaction failure | IndexedDB transactions may abort on quota errors, version mismatches, or concurrent access | Transaction abort handling must be tested with synthetic error injection |
| Partial writes | A failed transaction after partial writes may leave the store in a mixed state | Write atomicity must be verified; rollback must be triggered on any partial-write detection |
| Export/backup mismatch | Backup and export code currently reads from localStorage; an adapter switch without updating export/backup code would silently corrupt exports | Export/backup trust boundaries must be audited before any real adapter switch |
| Fallback to localStorage | If the IndexedDB adapter fails at runtime, the app must fall back to localStorage without data loss | Fallback behavior must be tested explicitly; no silent data loss is acceptable |
| Test-only code leaking into production | Test helpers and test-gated code must not be importable from production app boot paths | Validator must check that new IndexedDB code lives only in `tests/` or behind an explicit test gate |
| False claims about migration readiness | After Phase 18A, the project must not claim that production IndexedDB migration is complete | Phase 18A must close with an explicit claim boundary similar to Phase 17I |

---

## Safety Invariants That Must Be Preserved in Phase 18

The following invariants established in Phase 17 must be preserved in Phase 18 and beyond:

- No delete-before-verified-copy: data must not be deleted from any source store until a verified copy exists in the target store.
- Write verification before completion: any migration step that writes data must verify the written value before marking the step complete.
- Rollback metadata before rollback: rollback must not proceed unless rollback metadata (snapshot ref, pre-write checksum) was captured before the write.
- Explicit error code on failure: every failure path must produce an explicit error code; silent failures are forbidden.
- Dry-run before live: any new key family must complete a dry-run rehearsal using synthetic data before a reversible pilot is authorized.
- Synthetic data first: no test helper may use real localStorage data or real IndexedDB data.

---

## Future Sequencing

The Phase 17 local migration safety foundation is closed by Phase 17I. The following sequence applies:

| Phase | Name | Status |
|-------|------|--------|
| Phase 17A | Backup/Rollback Harness Before Migration | DONE |
| Phase 17B | StorageAdapter LocalStorage Scaffold | DONE |
| Phase 17C | IndexedDB Dry-Run Harness | DONE |
| Phase 17D | Migration Journal / Event Log Architecture | DONE |
| Phase 17E | Per-Key Migration Manifest Design | DONE |
| Phase 17F | Test-Only Migration Journal Prototype | DONE |
| Phase 17G | Single-Key Dry-Run Migration Rehearsal | DONE |
| Phase 17H | Single-Key Reversible Migration Pilot | DONE |
| Phase 17I | Local Migration Readiness Closure / Phase 18 Gate | **THIS PHASE** |
| Phase 18A | Test-Only IndexedDBAdapter Prototype | NEXT — test-only, synthetic data, no production adapter switch |

---

## Acceptance Criteria

Phase 17I is complete when:

1. `docs/phase17i-local-migration-readiness-closure-phase18-gate.md` exists and includes all required sections.
2. `scripts/validate-phase17i-local-migration-readiness-closure-phase18-gate.js` exists and passes.
3. `.github/workflows/e2e-smoke.yml` registers the Phase 17I validator after Phase 17H.
4. All Phase 17A–17H validators still pass with Phase 17I changes applied.
5. No `src/`, `tests/`, or `e2e/` files were modified.
6. No `package.json` or `package-lock.json` changes were made.
7. No forbidden runtime files exist (`src/storage/EventLog.js`, `src/storage/MigrationJournal.js`, `src/storage/IndexedDBAdapter.js`, `src/storage/SyncAdapter.js`).
8. All forbidden positive claims are absent from the documentation.
9. Phase 18A entry criteria are explicitly stated.
10. The risk register covers all required risk categories.
