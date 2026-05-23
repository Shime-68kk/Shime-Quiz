# Phase 26C — Limited Default-Off UI Wiring Design Summary

## Status token

```
PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_STATUS: COMPLETED_DESIGN_GATE
PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DECISION: PASS_TO_PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_WITH_TESTER_GATE
PHASE26C_UI_WIRING_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

## Scope

Phase 26C is a docs/design/testing/release/static-validator/CI-only gate.

No runtime source changes. No unit test changes. No e2e. No browser or manual execution. No production-visible UI. No storage, backup, export, or restore behavior changes. No telemetry/analytics. No dependencies. No sync/cloud/account/auth/backend.

## Design decision

```
PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DECISION: PASS_TO_PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_WITH_TESTER_GATE
```

Phase 26C approves a pass to Phase 26D for a limited hidden/default-off prototype of the **hidden default-off developer/test harness surface** only.

This is not production UI approval. Phase 26D is a separate scoped implementation/evidence gate with strict boundaries and required tester evidence.

## Chosen future surface

```
Chosen future Phase 26D surface: hidden default-off developer/test harness surface
```

Rationale: lowest risk surface. No production route. No user-visible navigation. Follows the existing `/dev/fsrs-ui-fixture` pattern. Gated behind explicit developer/test opt-in flag. Reversible.

## Deferred surfaces

The following surfaces are **deferred and not approved** by Phase 26C:

- **settings-local-data backup health hint is deferred** — separate production UI design gate required.
- **library backup health hint is deferred** — separate production UI design gate required.
- **dashboard backup health hint is deferred** — separate production UI design gate required.
- **navigation route is forbidden by default** — forbidden without explicit separate production approval.

## Run-pack status

```
PHASE26C_UI_WIRING_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

The Phase 26D evidence run pack is prepared in `docs/testing/phase26c-limited-default-off-ui-wiring-run-pack.md`. No evidence has been executed in Phase 26C. Phase 26D must execute and fill all run-pack rows before any user-facing or browser behavior claim.

## Validation summary

- Phase 26C validator: `scripts/validate-phase26c-limited-default-off-ui-wiring-design.js`
- CI workflow: `.github/workflows/e2e-smoke.yml` updated to run Phase 26C validator as the active merge-blocking gate.
- Prior validators (Phase 24D-HF1/HF2 through Phase 26B) are commented out or not active merge-blocking gates.
- No full `for f in scripts/validate-*.js` chain.
- No `continue-on-error: true`.
- Explicit `git fetch origin refs/heads/main:refs/remotes/origin/main --prune` step added before validator.
- Validator uses `origin/main..HEAD` double-dot diff (not triple-dot).

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
- backup file format changes are forbidden by this design.
- restore overwrite behavior changes are forbidden by this design.
- guaranteed data-loss prevention is not claimed.
- broad backup reliability is not claimed.
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
