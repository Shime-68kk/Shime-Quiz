# Phase 25H — Backup Health Persistence Signal Design

## Status token

```
PHASE25H_BACKUP_HEALTH_PERSISTENCE_SIGNAL_DESIGN_STATUS: COMPLETED_DESIGN_GATE
```

## Scope

Phase 25H is docs/design/static-validator/CI-only.
Phase 25H does not change runtime behavior.
Phase 25H does not implement Backup Health UI.
Phase 25H does not import or wire the Phase 25G helper into production.
Phase 25H does not modify Phase 25G runtime prototype behavior.
Phase 25H does not modify Phase 24E scaffold behavior.
Phase 25H does not implement production adapter-aware backup/export/restore.
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
Full historical scripts/validate-*.js chain is not used as a Phase 25H merge-blocking requirement.

## Inputs

Phase 25G status and runtime scope:

```
PHASE25G_BACKUP_HEALTH_TEST_ONLY_RUNTIME_PROTOTYPE_STATUS: COMPLETED_TEST_ONLY_PROTOTYPE
PHASE25G_BACKUP_HEALTH_RUNTIME_SCOPE: TEST_ONLY_NO_PRODUCTION_IMPORTS_NO_UI
```

Phase 25G delivered a pure, test-only backup health state derivation helper (`src/state/backupHealthTestOnlyPrototype.js`) with no production imports. The helper exposes `deriveBackupHealthState(inputSignals, options)`, `BACKUP_HEALTH_STATE`, `BACKUP_HEALTH_STATE_LABELS`, and `DEFAULT_STALE_THRESHOLD_MS`. It has no side effects, no localStorage/IndexedDB writes, no telemetry, and is never imported from production code.

## Purpose

Phase 25H decides whether a future Phase 25I may introduce a thin read-only production signal layer, and under what strict limits. This gate defines what signals may be read, what must not be read, what must not be written or persisted, the Phase 25G helper import boundary, proposed file ownership, rollback plan, evidence plan, validator plan, reviewer/tester requirements, and go/no-go criteria.

Phase 25H must not implement the read-only layer.

## Design decision

```
PHASE25H_BACKUP_HEALTH_PERSISTENCE_SIGNAL_DECISION: PASS_TO_PHASE25I_THIN_READ_ONLY_SIGNAL_LAYER_WITH_STRICT_GATES
```

Phase 25H approves opening a separate Phase 25I for a thin read-only signal layer, provided all strict gates defined in this document are met. This decision does not approve production Backup Health UI, production adapter-aware backup/export/restore, storage migration, or any write/persistence behavior.

## Read-only signal boundary

A future Phase 25I may only read signals that are already available as a natural byproduct of existing behavior, without changing that behavior. It must not add tracking, persistence, or side effects to generate signals.

Signal sources must be:
- Already in memory during a user-triggered export or restore operation
- Already available as a return value or in-memory state from existing code paths
- Not derived by scanning private learner content

No new localStorage keys, IndexedDB entries, or persistent records may be written to create or improve signal availability.

## Allowed future signals

If a later Phase 25I is opened, these read-only signals are permitted:

```
read-only signal: last manual export completion timestamp if already available without changing export behavior
read-only signal: generated/test restore verification timestamp only if already available without changing restore behavior
read-only signal: unavailable/error state only from local in-memory failure handling
```

Each signal must be sourced from existing in-memory state without modifying backup/export/restore behavior to supply it.

## Forbidden future signals

```
do not infer backup existence from private learner content
do not scan quiz/library/study data to determine backup health
do not read external files
do not inspect OS/platform backups
do not access cloud/account/backend state
do not use telemetry/analytics
do not add persistent tracking just to calculate health
do not treat browser/device/platform backup as verified
```

## Write and persistence boundary

```
A future Phase 25I must be read-only by default.
A future Phase 25I must not write new backup health state by default.
A future Phase 25I must not migrate data.
A future Phase 25I must not change backup/export/restore writes.
A future Phase 25I must not change backup file format.
A future Phase 25I must not change restore overwrite behavior.
Any later write/persistence behavior requires a separate design gate after Phase 25I.
```

## Phase 25G helper import boundary

The Phase 25G helper (`src/state/backupHealthTestOnlyPrototype.js`) must not be imported from production code in Phase 25I without passing an explicit production-import gate. The production-import gate must:

- Confirm the helper is ready for production use (type safety, error handling, no test-only assumptions)
- Confirm no production UI is wired without a separate UI gate
- Confirm all unit tests, validator, and reviewer requirements are met
- Be separately documented before any production import occurs

Phase 25H does not pass the production-import gate. That gate is a Phase 25I prerequisite.

## Backup/export/restore interaction boundary

A future Phase 25I must not modify:
- `src/state/v2BackupRestore.js` or any production backup/export/restore module
- Backup file format or schema
- Restore overwrite behavior
- localStorage compatibility
- Storage drivers

Phase 25I may only observe already-available in-memory state from existing code paths.

## UI boundary

Phase 25H does not approve production Backup Health UI.
Phase 25I must not implement Backup Health UI by default.
Any future Backup Health UI requires a separate UI design gate after Phase 25I.
UI wiring to routes, navigation, settings, library, or dashboard is forbidden in Phase 25I without a separate gate.

## Proposed file ownership for Phase 25I

The following is a proposal only. Actual file ownership must be re-confirmed in Phase 25I before any edits.

```
Potential read-only signal helper file: src/state/backupHealthSignal.js
Potential unit test file: tests/unit/backupHealthSignal.test.js
Potential docs file: docs/testing/phase25i-backup-health-thin-read-only-signal-layer.md
Potential validator file: scripts/validate-phase25i-backup-health-thin-read-only-signal-layer.js
Explicit no-go files: src/state/v2BackupRestore.js, src/state/backupHealthTestOnlyPrototype.js (no rename/modification), src/state/adapterAwareBackupRestoreTestScaffold.js, src/state/localStorageSync.js, src/state/store.js, sw.js, boot-guard.js, docs/adr/**, package.json, package-lock.json
```

Actual file ownership must be re-confirmed in Phase 25I before edits.

## Phase 25I framing

```
Phase 25I — Backup Health Thin Read-Only Signal Layer
- separate phase
- read-only by default
- no UI by default unless separately approved
- may import Phase 25G helper only if production-import gate passes
- must not change backup/export/restore behavior
- must not add telemetry/analytics
- must include unit tests, validator, reviewer, and tester if browser behavior is claimed
```

## Evidence plan

A future Phase 25I must provide:

```
unit coverage for read-only signal extraction
unit coverage proving no writes
validator coverage for no production UI wiring
validator coverage for no backup/export/restore behavior changes
manual/browser smoke only if browser behavior is claimed
generated/test data only
no real learner data
no telemetry/analytics
rollback/removal check
no-new-claim check
```

Phase 25H itself does not execute browser/manual evidence because no runtime behavior is changed.

## Manual/browser smoke plan

No browser/manual evidence is claimed in Phase 25H because no production UI is exposed and no runtime behavior is changed.

Manual/browser evidence is required before any user-facing runtime UI claim in a future phase.

## Validator plan

Phase 25H creates `scripts/validate-phase25h-backup-health-persistence-signal-design.js`.

The validator checks:
- Required docs exist
- Required validator exists
- CI registers Phase 25H validator
- CI does not run historical validators as Phase 25H merge blockers
- CI does not run full `for f in scripts/validate-*.js` chain as default PR blocker
- Workflow has no `continue-on-error: true`
- Required headings and status token exist in both docs
- Phase 25G status and runtime scope are referenced
- Required decision token exists
- Required statements exist
- Design coverage exists
- Allowed future signals exist
- Forbidden future signals exist
- Write/persistence boundary exists
- Phase 25I framing exists
- Proposed file ownership exists
- Evidence plan exists
- No-go/must-not-claim list exists
- Rollback plan exists
- Docs do not claim runtime Backup Health UI is implemented
- Docs do not claim production adapter-aware backup/export/restore
- Docs do not claim broad backup reliability or guaranteed data-loss prevention
- Changed files are exact allowed files only
- No historical validators changed
- No runtime/source/test/package/ADR/generated files changed
- No forbidden claims are made outside must-not-claim/negative guardrail context

## Rollback/removal plan

```
Remove docs/planning/phase25h-backup-health-persistence-signal-design.md.
Remove docs/release/phase25h-backup-health-persistence-signal-design-summary.md.
Remove scripts/validate-phase25h-backup-health-persistence-signal-design.js.
Remove Phase 25H CI registration.
No learner data migration or cleanup is required because Phase 25H changes no runtime behavior.
```

## Review and tester requirements

Strict Reviewer is required before push/PR.

Tester is not required because Phase 25H changes no runtime behavior and claims no manual/browser evidence execution.

A future Phase 25I requires:
- Strict Reviewer before push/PR
- Tester if any browser behavior is claimed
- Unit test coverage and validator passing before merge

## Go/no-go criteria

Phase 25I may open only if all of the following are met:
- Phase 25H validator passes
- Phase 25H patch applies cleanly to origin/main
- Phase 25H design doc is reviewed and approved by Strict Reviewer
- Phase 25I has unit tests covering read-only signal extraction and proving no writes
- Phase 25I has a passing validator covering no production UI wiring and no backup/export/restore behavior changes
- Phase 25I does not import the Phase 25G helper without passing an explicit production-import gate
- Phase 25I does not add telemetry/analytics
- Phase 25I does not implement UI without a separate UI gate

## What Phase 25H can claim

- A design gate for a future read-only Backup Health persistence/signal layer exists.
- Allowed and forbidden future signals are defined.
- Write/persistence boundary for Phase 25I is defined.
- Phase 25G helper import boundary is defined.
- Proposed file ownership for Phase 25I is documented (subject to re-confirmation).
- Rollback plan is documented.
- Evidence plan is documented.
- Validator plan is documented.
- Reviewer/tester requirements are documented.
- Go/no-go criteria are documented.
- No runtime behavior was changed.

## What Phase 25H must not claim

- Phase 25H does not approve runtime Backup Health UI implementation.
- Phase 25H does not approve production adapter-aware backup/export/restore.
- Phase 25H does not approve backup file format changes.
- Phase 25H does not approve restore overwrite behavior changes.
- Phase 25H does not approve IndexedDB production storage.
- Phase 25H does not approve storage migration.
- Phase 25H does not approve sync/cloud/account/auth/backend.
- Phase 25H does not approve telemetry/analytics.
- Phase 25H does not claim BETA_READY.
- Phase 25H does not claim guaranteed data-loss prevention.
- Phase 25H does not approve platform backup preservation claims.
- Phase 25H does not approve automatic backup claims.
- Phase 25H does not approve persistent backup health tracking writes.

## Guardrails

Phase 25H does not claim runtime backup health UI is implemented.
Phase 25H does not claim production adapter-aware backup/export/restore.
Phase 25H does not claim broad backup reliability.
Phase 25H does not claim guaranteed data-loss prevention.
Phase 25H does not claim automatic backup.
Phase 25H does not claim BETA_READY.
Phase 25H does not claim backup file format, restore overwrite behavior, or storage drivers have changed.

## Next recommended phase

```
Next recommended phase: Phase 25I — Backup Health Thin Read-Only Signal Layer
```

```
Phase 25I is a separate read-only runtime gate and is not automatically approved.
Phase 25H does not approve runtime Backup Health UI.
Phase 25H does not approve production adapter-aware backup/export/restore.
```
