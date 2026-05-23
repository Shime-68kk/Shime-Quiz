# Phase 26C — Limited Default-Off UI Wiring Design Seed

## Status token

```
PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 26C is a **planning/design-first** gate. It does not automatically approve runtime UI wiring.

## Purpose

Phase 26C is a design gate that identifies candidate limited/default-off UI wiring surfaces and constraints before any runtime implementation is attempted.

Phase 26C inherits the following from Phase 26B:
- Static/local automated evidence baseline is confirmed passing.
- Phase 25K integration prototype is confirmed default-off.
- Phase 25M UI view-model prototype is confirmed default-off.
- No production-visible UI wiring exists.
- No route/navigation/settings/library/dashboard wiring exists.

Phase 26C does not automatically activate any of the above. It designs only.

## Planning constraints

1. Phase 26C is **design/docs-first only**. No runtime source changes in Phase 26C unless a separate sub-gate explicitly approves them.
2. Any runtime UI wiring requires its own separate implementation gate, evidence gate, and manual/browser evidence run.
3. Phase 26C does not approve production rollout, broad dashboard/settings/library rollout, or adapter-aware backup/export/restore.
4. Phase 26C does not approve BETA_READY.
5. Phase 26C does not approve IndexedDB production storage or storage migration.
6. Phase 26C does not approve sync/cloud/account/auth/backend.
7. Phase 26C must not introduce telemetry/analytics.
8. Phase 26C must not change production backup, export, or restore behavior.
9. Phase 26C must not change storage drivers.
10. All evidence runs in Phase 26C must use generated or test data only; no real learner data.

## Candidate limited surfaces

The following are candidate surfaces for limited/default-off UI wiring design consideration. None are approved for production rollout by this seed.

- **Settings panel sub-section** — a hidden/default-off entry point in the settings panel, visible only to an internal or developer toggle. Candidate only; not approved.
- **Developer/debug overlay** — a low-risk surface accessible via non-production route or URL param, gated behind an internal flag. Candidate only; not approved.
- **Test fixture route** — an extension of the existing `/dev/fsrs-ui-fixture` or similar pattern for internal-only testing. Candidate only; not approved.

Each candidate surface requires:
1. A separate design sub-gate that defines the exact wiring, default-off guard, and rollback plan.
2. Manual/browser evidence using generated/test data before any user-facing behavior is claimed.
3. No exposure in production build unless explicitly approved.

## Required gates before runtime

The following gates are required before any runtime UI wiring may be implemented:

1. **Phase 26C design gate** — this document defines candidate surfaces. It must be replaced by a full design gate doc before implementation.
2. **Default-off guard specification** — each wiring point must have an explicit default-off guard with unit test coverage.
3. **Manual/browser evidence gate** — manual/browser evidence using generated/test data must be executed and recorded.
4. **No production-visible rollout gate** — explicit confirmation that the wiring is not visible in production builds without an explicit developer opt-in.
5. **Backup/export/restore boundary gate** — confirmation that no wiring affects production backup, export, or restore behavior.

## Forbidden default approvals

The following are **not approved** by Phase 26C design seed or by Phase 26B evidence:

- Production-visible Backup Health UI in any route, page, or component visible to end users.
- Backup file format changes.
- Restore overwrite behavior changes.
- IndexedDB production storage.
- Storage migration.
- Sync/cloud/account/auth/backend changes.
- Telemetry or analytics.
- BETA_READY status.
- Broad dashboard/settings/library rollout.
- Production adapter-aware backup/export/restore.
- Any runtime wiring without its own explicit implementation and evidence gate.

## Evidence needed before user-facing claims

Before any user-facing runtime behavior may be claimed:

1. Manual/browser evidence must be executed using generated/test data only.
2. No real learner data may be used in evidence runs.
3. Evidence must be recorded with observed results, not just expected results.
4. The evidence must confirm the wiring is default-off with no accidental production activation.
5. The evidence must confirm no regression in existing backup/export/restore behavior.
6. The evidence must confirm no route/navigation/settings/library/dashboard activation without explicit developer opt-in.

## Recommended next step

```
Next recommended phase: Phase 26C — Limited Default-Off UI Wiring Design Gate
Phase 26C is a separate design gate and is not automatically approved.
Phase 26B does not approve runtime UI wiring.
Phase 26B does not approve production adapter-aware backup/export/restore.
Phase 26B does not approve BETA_READY.
```

The recommended next step is to produce a full Phase 26C design gate document that:
1. Selects one candidate surface for a limited/default-off wiring prototype.
2. Defines the exact default-off guard and rollback plan.
3. Defines required evidence before any user-facing behavior is claimed.
4. Does not expand scope to production rollout, BETA_READY, or adapter-aware backup/export/restore.
