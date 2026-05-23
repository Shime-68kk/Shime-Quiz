# Phase 26C — Limited Default-Off UI Wiring Design Gate

## Status token

```
PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_STATUS: COMPLETED_DESIGN_GATE
PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DECISION: PASS_TO_PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_WITH_TESTER_GATE
PHASE26C_UI_WIRING_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

## Scope

Phase 26C is a docs/design/testing/release/static-validator/CI-only gate.

No runtime source changes. No unit test changes. No e2e. No browser or manual execution. No production-visible UI changes. No storage, backup, export, or restore behavior changes. No telemetry/analytics. No dependencies. No sync/cloud/account/auth/backend.

Phase 26C designs a limited/default-off UI wiring approach and prepares a run pack for Phase 26D. It does not implement runtime UI. It does not wire anything into production surfaces.

## Inputs

- Phase 26B evidence re-decision: `docs/testing/phase26b-local-first-hybrid-evidence-execution.md`
- Phase 26B readiness re-decision: `HOLD_READINESS_PASS_TO_PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_GATE`
- Phase 26C planning seed: `docs/planning/phase26c-limited-default-off-ui-wiring-design-seed.md`
- Phase 25M view-model prototype: `src/state/backupHealthUiPrototype.js` (default-off, read-only)
- Phase 25K integration prototype: `src/state/backupHealthIntegrationPrototype.js` (default-off)
- Phase 25I signal layer: `src/state/backupHealthSignal.js` (read-only)

## Purpose

Phase 26B held readiness and passed only to a limited/default-off UI wiring design gate. Phase 26C acts as that design gate.

Phase 26C must:
1. Select one candidate limited surface for a future Phase 26D hidden/default-off prototype.
2. Define the exact default-off guard and boundary requirements.
3. Enumerate what Phase 26D may and may not implement.
4. Prepare a Phase 26D run pack with pass/fail criteria.
5. Not implement any runtime UI itself.

Phase 26C must not:
- Approve production-visible UI rollout.
- Approve broad dashboard/settings/library rollout.
- Approve production adapter-aware backup/export/restore.
- Approve BETA_READY.
- Approve browser/manual evidence execution (no production UI exists to test).

## Design decision

```
PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DECISION: PASS_TO_PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_WITH_TESTER_GATE
```

Phase 26C approves a pass to Phase 26D for a limited hidden/default-off prototype of the **hidden default-off developer/test harness surface** only.

This is not production UI approval. It permits Phase 26D to add one scoped hidden prototype behind an explicit default-off gate, subject to tester evidence and strict boundaries described in this document and in the Phase 26C run pack.

## Limited default-off UI wiring boundary

The following boundary applies to any UI wiring in Phase 26D or later:

- Read-only only. No writes, mutations, or side effects from UI layer.
- Local-only. No cloud, account, sync, or network calls from UI layer.
- Default-off by default. The prototype must not activate without an explicit developer/test opt-in.
- Explicit test/default-off gate required. The activation path must check an explicit flag (e.g., `enabled: true, mode: 'test'` or `mode: 'default-off'`) before rendering.
- No production-visible UI by default. Nothing visible in a standard production build without opt-in.
- No broad dashboard/settings/library rollout. Prototype is limited to the hidden harness surface only.
- No navigation route. No production route, nav link, or settings entry for the prototype.
- No writes. No localStorage or IndexedDB writes from the prototype UI.
- No backup/export/restore behavior changes. The prototype must not touch backup, export, or restore code paths.
- No storage driver changes.
- No telemetry/analytics.
- No sync/cloud/account/auth/backend.
- No storage migration.
- No IndexedDB production storage.
- No BETA_READY claim.
- Generated/test data only for evidence. No real learner data.
- Tester/manual evidence required before any user-facing or browser behavior claim.

## Allowed future Phase 26D implementation scope

Phase 26D may implement only:

- limited hidden/default-off UI wiring prototype
- read-only only
- local-only
- default-off by default
- explicit test/default-off gate required
- may import Phase 25M view-model only if import gate passes
- no production-visible UI by default
- no broad dashboard/settings/library rollout
- no navigation route
- no writes
- no backup/export/restore behavior changes
- no storage driver changes
- no telemetry/analytics
- no sync/cloud/account/auth/backend
- no storage migration
- no IndexedDB production storage
- no BETA_READY
- generated/test data only for evidence
- tester/manual evidence required before any user-facing/browser behavior claim

## Forbidden future implementation scope

Phase 26D must not implement:

- production-visible Backup Health UI by default
- broad dashboard/settings/library rollout
- navigation route
- automatic backup claims
- platform backup preservation claims
- guaranteed data-loss prevention claims
- cloud/account recovery copy
- scanning learner content
- persistent tracking added to calculate health
- production adapter-aware backup/export/restore
- telemetry/analytics
- storage migration
- IndexedDB production storage
- sync/cloud/account/auth/backend
- BETA_READY

## Candidate limited surfaces

The following candidate surfaces were considered for Phase 26D:

1. **hidden default-off developer/test harness surface** — a hidden UI surface activated only by an explicit developer/test flag. Lowest risk. No production route. No user-visible surface. ← **Chosen for Phase 26D**.
2. **settings-local-data backup health hint** — a small informational hint in the settings/local data section. Deferred. Requires higher evidence bar and production UI review.
3. **library backup health hint** — a small hint in the card library view. Deferred. Requires production UI review.
4. **dashboard backup health hint** — a small hint on the dashboard. Deferred. Requires production UI review.
5. **navigation route** — a dedicated route for backup health. Forbidden by default. Requires explicit production approval.

## Chosen future surface

```
Chosen future Phase 26D surface: hidden default-off developer/test harness surface
```

Rationale:
- Lowest risk of accidental production activation.
- No route, navigation link, or settings entry required.
- Follows the existing `/dev/fsrs-ui-fixture` pattern for internal/developer-only surfaces.
- Gated behind explicit `enabled: true, mode: 'test'` or `mode: 'default-off'` flag.
- Reversible: can be removed with a single file deletion and CI de-registration.
- Does not change any production user flow.

The hidden harness surface is not approved for production rollout. It is only a developer/test surface.

## Deferred surfaces

The following surfaces are **deferred and not approved** for Phase 26D by this design gate:

- **settings-local-data backup health hint is deferred** — requires separate production UI design gate and tester evidence.
- **library backup health hint is deferred** — requires separate production UI design gate and tester evidence.
- **dashboard backup health hint is deferred** — requires separate production UI design gate and tester evidence.
- **navigation route is forbidden by default** — forbidden unless explicitly re-approved through a separate production approval gate.

Deferred surfaces must not be implemented in Phase 26D without an explicit separate approval gate.

## Phase 25M view-model import boundary

Phase 26D may import `src/state/backupHealthUiPrototype.js` (Phase 25M view-model) only if:

1. The import is inside the hidden harness component only.
2. The harness component is guarded by an explicit default-off flag before rendering.
3. The import does not appear in any production route, page, or settings surface.
4. The view-model's `isBackupHealthUiPrototypeEnabled` function returns false for `mode: 'production'` and `mode: 'live'` — this boundary must be verified in Phase 26D evidence.
5. No new read or write paths are opened by the import.

Phase 26D must not import `src/state/backupHealthIntegrationPrototype.js` or `src/state/backupHealthSignal.js` directly from UI layer components unless the same import gate criteria apply.

## Default-off gate requirements

Any hidden harness component added in Phase 26D must:

1. Check `isBackupHealthUiPrototypeEnabled(options)` from Phase 25M view-model before rendering anything.
2. The `options` object must require `{ enabled: true, mode: 'test' }` or `{ enabled: true, mode: 'default-off' }` — not `'production'` or `'live'`.
3. If the gate returns false, the component must render nothing (null/empty).
4. The component must have unit test coverage for the default-off case.
5. No production route may reference the harness component.

## No-write and no-telemetry boundary

- The hidden harness component must not write to localStorage, IndexedDB, or any storage layer.
- The hidden harness component must not call any analytics, telemetry, or tracking APIs.
- The hidden harness component must not call any backend, sync, or cloud APIs.
- The hidden harness component must be purely display-only, reading from the Phase 25M view-model only.

## Backup/export/restore boundary

Phase 26D must not modify production backup, export, or restore behavior.

- Production backup/export/restore behavior remains unchanged by this design.
- Backup file format remains unchanged.
- Restore overwrite behavior remains unchanged.
- Current localStorage backup compatibility remains unchanged.

The hidden harness component does not affect backup/export/restore paths.

## Vietnamese-first copy boundary

Any user-visible copy added in Phase 26D must be Vietnamese-first.

- No English-only user-facing strings in the hidden harness component.
- Developer-facing log/console strings may use English.
- Vietnamese-first copy boundary must be maintained.

## Accessibility and keyboard navigation plan

Phase 26D hidden harness component must meet minimum accessibility requirements:

- Any interactive element must be keyboard-navigable.
- Any text content must have sufficient contrast.
- No accessibility regressions may be introduced.

Phase 26D evidence must include a quick accessibility and keyboard navigation check. Manual/browser tester must verify this before any user-facing behavior claim is made.

## Manual/browser evidence plan

Phase 26D requires tester/manual evidence before any user-facing or browser behavior claim:

1. Tester opens the hidden harness surface using an explicit developer opt-in (URL param or config flag).
2. Tester confirms the surface does not appear in normal production navigation.
3. Tester confirms the display is read-only (no write actions).
4. Tester confirms Vietnamese-first copy.
5. Tester confirms keyboard navigation.
6. Tester confirms no backup/export/restore regressions.
7. All evidence runs must use generated or test data only — no real learner data.

If the tester evidence gate passes, Phase 26D may claim limited browser/harness evidence. It still does not prove BETA_READY, broad backup reliability, or production UI readiness.

## Validator plan

Phase 26D validator must check:
- Hidden harness component exists and is guarded by default-off gate.
- No production route references the harness component.
- No write APIs in the harness component.
- No telemetry/analytics in the harness component.
- Backup/export/restore files unchanged.
- Storage drivers unchanged.
- Vietnamese-first copy boundary maintained.
- Tester evidence recorded.

## Rollback/removal plan

To roll back Phase 26C:

1. Remove `docs/planning/phase26c-limited-default-off-ui-wiring-design.md`.
2. Remove `docs/testing/phase26c-limited-default-off-ui-wiring-run-pack.md`.
3. Remove `docs/release/phase26c-limited-default-off-ui-wiring-design-summary.md`.
4. Remove `scripts/validate-phase26c-limited-default-off-ui-wiring-design.js`.
5. Remove Phase 26C CI registration from `.github/workflows/e2e-smoke.yml`; restore Phase 26B as active gate.
6. No learner data migration or cleanup is required because Phase 26C does not migrate data or change backup/export/restore behavior.

Phase 26C changes are docs/design/validator/CI only. No runtime rollback is required.

## Proposed file ownership for Phase 26D

Phase 26D implementation is expected to add one new source file:

```
src/components/dev/BackupHealthDevHarness.jsx  (or .tsx)
```

This file must:
- Be a hidden developer/test harness component only.
- Import `isBackupHealthUiPrototypeEnabled` from `src/state/backupHealthUiPrototype.js`.
- Render null/empty when the gate returns false.
- Not be referenced from any production route, page, or settings component.
- Follow Vietnamese-first copy for any user-visible text.
- Have unit test coverage for the default-off case.

Phase 26D may also need:
```
tests/unit/components/dev/BackupHealthDevHarness.test.jsx  (or .test.tsx)
```

No other source or test files are expected to change. If any additional files are needed, Phase 26D must justify each one.

## Review and tester requirements

Phase 26C design gate (this document) requires Strict Reviewer before push/PR.

Phase 26D implementation and evidence gate requires both:
- Strict Reviewer: code review before merge.
- Tester: manual/browser evidence using generated/test data before any user-facing behavior claim.

Phase 26D tester must record:
- Exact steps taken.
- Observed results.
- Data source confirmation (generated/test data only, no real learner data).
- Pass/fail for each criterion in the run pack.

## Go/no-go criteria

Phase 26D may proceed only if all of the following pass:
1. Phase 26C design gate is merged and validates cleanly.
2. Phase 26D hidden harness component implements default-off gate correctly.
3. Unit tests cover the default-off case.
4. No production route references the harness.
5. No write APIs are added.
6. No backup/export/restore behavior changed.
7. No storage driver changed.
8. Tester/manual evidence passes all run-pack criteria.
9. No real learner data used in evidence.
10. Vietnamese-first copy maintained.

If any criterion fails, Phase 26D must not proceed to a readiness claim.

## What Phase 26C can claim

- Design gate completed: a limited/default-off UI wiring design has been documented.
- Chosen future surface is defined: hidden default-off developer/test harness.
- Deferred surfaces are enumerated and not approved.
- Phase 26D run pack is prepared.
- No runtime changes were made.

## What Phase 26C must not claim

- Production-visible Backup Health UI.
- Broad dashboard/settings/library rollout.
- Production adapter-aware backup/export/restore.
- BETA_READY.
- Browser/manual evidence executed.
- Any runtime UI implemented.
- Broad backup reliability.
- Guaranteed data-loss prevention.
- Automatic backup claims.
- Platform backup preservation claims.
- Cloud/account recovery claims.
- Scanning learner content.
- Persistent health tracking.
- Sync/cloud/account/auth/backend changes.
- Storage migration.
- IndexedDB production storage.
- Telemetry/analytics added.

## Guardrails

- Production backup/export/restore behavior remains unchanged by this patch.
- Backup file format remains unchanged.
- Restore overwrite behavior remains unchanged.
- Current localStorage backup compatibility remains unchanged.
- Default storage driver remains unchanged.
- No IndexedDB.
- No storage migration.
- No sync/cloud/account/auth/backend.
- No telemetry or analytics.
- No BETA_READY.
- Historical full-chain validators remain manual/local/scheduled audit guidance.
- Full historical scripts/validate-*.js chain is not used as a Phase 26C merge-blocking requirement.
- No browser/manual evidence claimed because no production-visible UI or browser/user-facing behavior is exposed.
- Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.
- All evidence runs must use generated or test data only; no real learner data.
- No learner data migration or cleanup is required because Phase 26C does not migrate data or change backup/export/restore behavior.
- backup file format changes are forbidden.
- restore overwrite behavior changes are forbidden.
- guaranteed data-loss prevention is not claimed by this phase.
- broad backup reliability is not claimed by this phase.
- production-visible Backup Health UI is not approved.
- broad dashboard/settings/library rollout is not approved.
- IndexedDB production storage is not approved.
- storage migration is not approved.

## Next recommended phase

```
Next recommended phase: Phase 26D — Limited Default-Off UI Wiring Prototype and Tester Evidence
Phase 26D is a separate scoped implementation/evidence gate and is not automatically approved.
Phase 26C does not approve production-visible Backup Health UI.
Phase 26C does not approve broad dashboard/settings/library rollout.
Phase 26C does not approve production adapter-aware backup/export/restore.
Phase 26C does not approve BETA_READY.
```
