# Phase 27B — Adapter-Awareness Evidence and Runtime Design Summary

## Status tokens

```
PHASE27B_ADAPTER_AWARENESS_EVIDENCE_STATUS: COMPLETED_STATIC_LOCAL_EVIDENCE_REVIEW
PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_STATUS: COMPLETED_RUNTIME_DESIGN_REVIEW
PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_DECISION: PASS_TO_PHASE27C_TEST_ONLY_NO_WRITE_ADAPTER_AWARENESS_MODEL
PHASE27B_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: STATIC_LOCAL_DESIGN_EVIDENCE_NO_RUNTIME_BEHAVIOR_CLAIM
PHASE27C_TEST_ONLY_ADAPTER_AWARENESS_MODEL_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 27B is a docs/evidence/design/static-validator/CI-only phase.

Phase 27B:
- Executes and reviews the Phase 27A evidence matrix using static/local checks only.
- Records what can and cannot be inferred from current backup/export/restore/storage code without changing it.
- Defines a future runtime design for adapter-aware backup/export/restore.
- Makes a conservative implementation decision to permit a Phase 27C test-only/no-write model.
- Prepares a Phase 27C planning seed.
- Keeps all production backup/export/restore behavior unchanged.

Phase 27B does not:
- Change any runtime source files.
- Change any test files.
- Change any e2e files.
- Change backup/export/restore behavior.
- Change backup file format.
- Change restore overwrite behavior.
- Change storage drivers.
- Implement storage migration.
- Add telemetry or analytics.
- Add sync/cloud/account/auth/backend.
- Create production-visible UI.
- Claim BETA_READY.

## Evidence interpretation

`PHASE27B_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: STATIC_LOCAL_DESIGN_EVIDENCE_NO_RUNTIME_BEHAVIOR_CLAIM`

All evidence reviewed in Phase 27B is static/local:
- Repository file inspection.
- Document structure review.
- Source code structure analysis (no invocation).
- Prior-phase test coverage summary.

No claim is made about runtime behavior observed in a browser or live environment.
No claim is made that adapter-aware backup/export/restore was executed, tested end-to-end, or validated under real user conditions.

## Runtime design decision

```
PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_DECISION: PASS_TO_PHASE27C_TEST_ONLY_NO_WRITE_ADAPTER_AWARENESS_MODEL
```

Phase 27B approves Phase 27C to create a test-only, no-write, pure-function adapter-awareness model.

The following candidate functions are approved for Phase 27C design-only planning:
- `normalizeAdapterAwarenessInput`
- `deriveAdapterAwarenessState`
- `createAdapterCompatibilityWarning`
- `summarizeAdapterAwarenessForBackupHealth`

These candidate function names are design proposals only. They are not implemented in Phase 27B.

Phase 27B does NOT approve production runtime implementation of adapter-aware backup/export/restore.

## Phase 27C seed

```
PHASE27C_TEST_ONLY_ADAPTER_AWARENESS_MODEL_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 27C seed is prepared in `docs/planning/phase27c-test-only-adapter-awareness-model-seed.md`.

Phase 27C must implement only pure functions with generated/test data. Phase 27C must not change backup file format, restore overwrite behavior, storage drivers, or storage migration. Phase 27C is not automatically approved.

## What is supported

Based on Phase 27B static/local evidence review:

- Phase 27A design doc correctly documents the adapter-awareness problem space.
- Allowed future signal candidates are well-bounded (storage adapter identity, export source metadata, restore target adapter compatibility warning, generated/test restore rehearsal evidence, unavailable/unknown adapter state).
- Forbidden future signals are clearly documented.
- No production backup/export/restore, storage, or source files were changed by Phase 27A or Phase 27B.
- The runtime design defines safe Phase 27C candidate functions with strict no-write/no-production-import boundaries.
- Phase 27C is permitted as a test-only/no-write gate if all required gates pass.

## What remains not proven

The static/local evidence review does NOT prove:

- Adapter-aware backup/export/restore works correctly at runtime.
- Backup files correctly encode adapter identity.
- Restore correctly handles cross-adapter compatibility.
- Restore compatibility warnings are displayed to users.
- Generated/test data restore rehearsal succeeds.
- Manual/browser backup/export/restore operates without data loss.
- The current storage driver correctly surfaces its identity.
- Backup/export is correct for all adapter combinations.
- Restore is correct for all adapter combinations.

## Validation summary

Phase 27B validator (`scripts/validate-phase27b-adapter-awareness-evidence-runtime-design.js`) checks:

- All required docs exist and contain required tokens and headings.
- Evidence table contains all required rows and columns.
- Runtime design doc contains all required boundaries.
- Phase 27C seed exists with required token, headings, and candidate model function names.
- Phase 27C is framed as test-only/no-write.
- CI registers Phase 27B validator with explicit origin/main fetch.
- CI does not run prior-phase validators as active merge-blocking steps.
- No full `for f in scripts/validate-*.js` chain.
- No `continue-on-error: true`.
- Exact changed files are exactly the allowed files only.
- No runtime/source/test/e2e/ADR files changed.
- No package/dependency changes.
- No generated artifacts in changed files.
- No telemetry/analytics strings or files added outside negative guardrails.
- No sync/cloud/account/auth/backend files changed.
- Production backup/export/restore files unchanged.
- Storage drivers unchanged.
- Docs do not claim BETA_READY, production adapter-aware backup/export/restore, backup file format changes, restore overwrite behavior changes, storage migration, Phase 27C implementation exists.

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
- Full historical scripts/validate-*.js chain is not used as a Phase 27B merge-blocking requirement.
- Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.

## Next recommended phase

Next recommended phase: Phase 27C — Test-Only No-Write Adapter-Awareness Model
Phase 27C is a separate test-only implementation gate and is not automatically approved.
Phase 27B does not approve production runtime backup/export/restore changes.
Phase 27B does not approve backup file format changes.
Phase 27B does not approve restore overwrite behavior changes.
Phase 27B does not approve storage migration.
Phase 27B does not approve production adapter-aware backup/export/restore.
Phase 27B does not approve BETA_READY.
