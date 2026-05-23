# Phase 25G — Backup Health Test-Only Runtime Prototype

## Status token

```
PHASE25G_BACKUP_HEALTH_TEST_ONLY_RUNTIME_PROTOTYPE_STATUS: COMPLETED_TEST_ONLY_PROTOTYPE
```

## Runtime scope token

```
PHASE25G_BACKUP_HEALTH_RUNTIME_SCOPE: TEST_ONLY_NO_PRODUCTION_IMPORTS_NO_UI
```

## Phase 25F baseline

```
PHASE25F_BACKUP_HEALTH_RUNTIME_DESIGN_GATE_STATUS: COMPLETED_DESIGN_GATE
PHASE25F_BACKUP_HEALTH_RUNTIME_DESIGN_DECISION: PASS_TO_PHASE25G_TEST_ONLY_RUNTIME_PROTOTYPE_WITH_STRICT_GATES
```

## Implementation scope

Phase 25G is a test-only runtime prototype.
Phase 25G uses Option A only: test-only helper/module with unit tests and no production imports.
Phase 25G exposes no production Backup Health UI.
Phase 25G does not change production backup/export/restore behavior.
Phase 25G does not change backup file format.
Phase 25G does not change restore overwrite behavior.
Phase 25G does not implement production adapter-aware backup/export/restore.
Phase 25G does not add sync/cloud/account/auth/backend.
Phase 25G does not add telemetry/analytics.
Phase 25G does not add dependencies.
Phase 25G does not perform storage migration.
Phase 25G does not claim BETA_READY.

## Changed files

```
src/state/backupHealthTestOnlyPrototype.js         (new — test-only helper)
tests/unit/backupHealthTestOnlyPrototype.test.js   (new — unit tests)
docs/testing/phase25g-backup-health-test-only-runtime-prototype.md    (new — this doc)
docs/release/phase25g-backup-health-test-only-runtime-prototype-summary.md  (new — release summary)
scripts/validate-phase25g-backup-health-test-only-runtime-prototype.js (new — validator)
.github/workflows/e2e-smoke.yml                    (modified — CI registration)
```

## State model

The helper derives one of six state ids based on input signals:

| State ID | Phase 25E Display Name |
|---|---|
| `unknown` | Unknown backup status |
| `no_backup_recorded` | No backup recorded in this browser |
| `recent_manual_backup` | Recent manual backup recorded |
| `backup_may_be_stale` | Backup may be stale |
| `restore_verified_test_data` | Restore recently verified on generated/test data |
| `status_unavailable` | Backup status unavailable |

### Priority order (conservative)

1. `status_unavailable` — if `unavailable` or `error` is present
2. `restore_verified_test_data` — if restore was verified on generated/test/fixture/synthetic data
3. `recent_manual_backup` — if manual backup timestamp is within stale threshold
4. `backup_may_be_stale` — if manual backup timestamp exceeds stale threshold
5. `no_backup_recorded` — if no qualifying backup fields present
6. `unknown` — if no input signals provided at all (null/undefined)

### Input signals

```js
{
  manualBackupExportedAtMs,       // epoch ms of last manual export
  restoreVerifiedAtMs,            // epoch ms of last restore verification
  restoreVerificationDataKind,    // 'generated' | 'test' | 'fixture' | 'synthetic' | ...
  unavailable,                    // boolean: status cannot be determined
  error                           // any: error condition present
}
```

`restoreVerificationDataKind` must only count as verified when it indicates generated/test data.
Accepted kinds: `generated`, `test`, `fixture`, `synthetic`.

## Test-only proof

- `src/state/backupHealthTestOnlyPrototype.js` contains no imports from production modules.
- The helper does not read or write localStorage, IndexedDB, or any storage.
- The helper does not use `fetch`, `navigator.sendBeacon`, or any network calls.
- The helper does not produce telemetry or analytics.
- No production file imports the prototype module.
- The module is a pure derivation function — given the same inputs and options, always returns the same output.

## No production import proof

`grep -r "backupHealthTestOnlyPrototype" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"`

Expected result: only `src/state/backupHealthTestOnlyPrototype.js` itself is found, not imported from any other `src/` file.

## Unit test evidence

File: `tests/unit/backupHealthTestOnlyPrototype.test.js`

Covers:

- unknown / no signal (null, undefined, no args)
- empty signal object / no backup recorded
- recent manual backup (within threshold)
- stale manual backup (exceeds threshold)
- future timestamp (safe fallback — treated as recent)
- restore verified on generated/test data (kinds: generated, test, fixture, synthetic)
- restore verification not counted when data kind is real/user/unknown/empty
- restore verified outranks stale manual backup
- status unavailable / error signals (prefer status_unavailable)
- status unavailable overrides recent manual backup
- invalid timestamps (NaN, Infinity, -Infinity, string — treated as no backup)
- no mutation of input signals
- all state ids map to expected Phase 25E display names

## Validator evidence

File: `scripts/validate-phase25g-backup-health-test-only-runtime-prototype.js`

Checks:
- required docs, prototype file, unit test file, and validator exist
- CI registers Phase 25G validator
- CI does not run historical validators as Phase 25G merge blockers
- workflow has no `continue-on-error: true`
- docs contain required status and runtime scope tokens
- docs include all required guardrail statements
- changed files are exactly the allowed set
- forbidden files are not changed
- no package/dependency changes
- no telemetry/analytics strings in new files
- no sync/cloud/account/auth/backend files changed
- production backup/export/restore files unchanged
- prototype does not import production modules
- prototype does not use localStorage, indexedDB, fetch, analytics, telemetry
- prototype exports required state ids and function
- no production file imports the prototype
- no UI/route/navigation/settings/dashboard/library wiring added
- unit tests cover required derivation cases
- docs do not claim production Backup Health UI
- docs do not claim production adapter-aware backup/export/restore
- docs do not claim broad backup reliability or guaranteed data-loss prevention

## Rollback/removal plan

Remove src/state/backupHealthTestOnlyPrototype.js.
Remove tests/unit/backupHealthTestOnlyPrototype.test.js.
Remove docs/testing/phase25g-backup-health-test-only-runtime-prototype.md.
Remove docs/release/phase25g-backup-health-test-only-runtime-prototype-summary.md.
Remove scripts/validate-phase25g-backup-health-test-only-runtime-prototype.js.
Remove Phase 25G CI registration.
No learner data migration or cleanup is required because Phase 25G does not migrate data or change backup/export/restore behavior.

## Manual/browser evidence status

No browser/manual evidence claimed because no production UI is exposed.
Manual/browser evidence required before any user-facing runtime UI claim.

## Known limitations

- `restoreVerifiedAtMs` timestamp age is not checked — any timestamp with a valid data kind qualifies. A future phase may add a recency gate.
- Future timestamps for `manualBackupExportedAtMs` are treated conservatively as recent (no crash, no data loss).
- The helper has no persistence — it does not read or store backup metadata. It derives state only from caller-supplied signals.

## What Phase 25G can claim

- A pure, testable, test-only derivation helper for backup health state exists.
- Unit tests cover all required state derivation cases.
- The helper has no side effects, no production imports, and no production UI wiring.
- The state model is consistent with Phase 25E copy/display names.

## What Phase 25G must not claim

- Phase 25G must not claim runtime backup health UI is implemented.
- Phase 25G must not claim production adapter-aware backup/export/restore.
- Phase 25G must not claim broad backup reliability.
- Phase 25G must not claim guaranteed data-loss prevention.
- Phase 25G must not claim automatic backup.
- Phase 25G must not claim BETA_READY.
- Phase 25G must not claim that backup file format, restore overwrite behavior, or storage drivers have changed.

## Next recommended phase

Phase 25H — Backup Health persistence signal design or thin read-only production signal layer (strict production-import gate required before wiring).
