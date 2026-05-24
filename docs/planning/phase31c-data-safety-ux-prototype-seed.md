# Phase 31C — Data Safety UX Prototype Seed

## Status token

```text
PHASE31C_DATA_SAFETY_UX_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 31C is a separate prototype gate and is not automatically approved by Phase 31B. An explicit Phase 31C planning output must be produced.

## Purpose

Phase 31C is a Data Safety UX Prototype phase. Its goal is to produce a conservative, default-off prototype of the Data Safety Center / Local Backup Center settings panel section — or a conservative subset — and decide whether to proceed to a separately-gated integration or production-wiring phase.

Phase 31C must not implement runtime backup/export/restore behavior changes. Phase 31C must not implement sync/cloud/account/auth/backend. Phase 31C must not approve BETA_READY. Phase 31C must operate behind a default-off flag with a defined rollback plan.

## Inputs from Phase 31B

From Phase 31B:
- Design gate doc: `docs/planning/phase31b-data-safety-ux-design-gate.md`
- UX spec: `docs/design/phase31b-data-safety-center-ux-spec.md`
- Release summary: `docs/release/phase31b-data-safety-ux-design-gate-summary.md`
- This seed: `docs/planning/phase31c-data-safety-ux-prototype-seed.md`

Phase 31B tokens:

```text
PHASE31B_DATA_SAFETY_UX_DESIGN_STATUS: COMPLETED_DATA_SAFETY_UX_DESIGN_GATE
PHASE31B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31B_DATA_SAFETY_UX_DESIGN_DECISION: PASS_TO_PHASE31C_DATA_SAFETY_UX_PROTOTYPE
PHASE31B_DESIGN_SCOPE: DESIGN_ONLY_NO_RUNTIME_BACKUP_RESTORE_SYNC_CLOUD_OR_BACKEND
```

Phase 31B key decisions for Phase 31C:
- Primary surface: settings panel section (Surface A) — no new route, lower complexity.
- Optional surface: modal/overlay (Surface D) for higher-complexity flows.
- Deferred surface: dedicated route (Surface C) — not in Phase 31C scope.
- Out of scope surface: dashboard section (Surface B) — deferred.
- Evidence plan ready for Phase 31C execution.
- Default-off flag required.
- Rollback plan required.

## Prototype constraints

Phase 31C must operate under the following constraints:

1. **Default-off flag required**: The Data Safety Center prototype must be hidden behind a default-off feature flag. It must not be visible in production without explicit activation.
2. **Rollback plan required**: If the prototype introduces regressions, the flag must be disabled and the settings page must revert to the Phase 31A baseline without data loss.
3. **No real backup/export/restore behavior changes**: Existing backup/export/restore behavior must not be modified. Entry point buttons may be added; the underlying flow is unchanged.
4. **No new storage writes**: No new localStorage keys may be created by Phase 31C code. Existing keys may be read (display-only).
5. **No sync/cloud/backend**: All data remains local. No server requests. No account/auth/backend.
6. **No telemetry**: No analytics events, no external instrumentation, no tracking calls.
7. **No production navigation change unless explicitly scoped**: No new routes. No dashboard layout changes. No global navigation changes without a separate Phase 31C gate decision.
8. **Generated/test-only data**: If any evidence run requires data, use generated/test-only data. No real learner data.
9. **Conservative scope**: If scope is unclear, the narrower implementation must be chosen.

## Allowed prototype surfaces

Phase 31C may prototype the following surfaces:

**Primary (required for Phase 31C)**:
- Settings panel section with "Data Safety" or "Your Data" collapsible section.
- Overview card with local-first storage model explanation.
- Local Backup Center sub-section with export and import entry points (no behavior change).
- Last backup status display (read-only, existing localStorage key only).
- Restore caution block (copy and warning only; no execution).
- Backup reminder concept (copy and prompt only; no runtime trigger).
- Storage/browser limitation explanation.
- Evidence gaps / beta limitations panel.
- Help/FAQ block.
- Non-goals section (no cloud, no sync, no auto backup).

**Optional (if complexity remains low)**:
- Modal/overlay triggered from settings entry point (Surface D).

**Deferred (not in Phase 31C)**:
- Dedicated route (`/data-safety` or `/backup`).
- Dashboard section.
- Automatic backup triggers.
- Runtime quota monitoring.

## Forbidden runtime behaviors

Phase 31C must not implement:

- Any new localStorage writes from Data Safety Center UI code.
- Any new localStorage keys created by Phase 31C prototype code.
- Runtime backup scheduling or automatic export triggers.
- Restore execution (any code that overwrites localStorage from the prototype UI).
- Cloud sync, server-side storage, or remote API calls.
- BYOC (Bring Your Own Cloud) / WebDAV.
- P2P / WebRTC device-to-device transfer.
- Telemetry events or analytics calls.
- Built-in AI / OCR / API-key / BYOK behavior.
- Authentication, account, or backend infrastructure.
- Production-visible route changes without explicit Phase 31C gate decision.
- BETA_READY advancement.

## Required evidence plan

Phase 31C must collect the following evidence before deciding to proceed:

**Design review evidence**:
- All required sections of UX spec implemented in prototype.
- Copy passes forbidden-claim boundary check (no guaranteed data safety, no cloud sync claims).
- State model covers all required states (empty, has backup, error, disabled, quota warning).
- Accessibility notes applied.

**Copy review evidence**:
- No forbidden claim strings in rendered copy.
- All required disclaimers present.
- Language clear and readable for Vietnamese-first users.

**UX acceptance evidence**:
- User can navigate to Data Safety section from settings (behind default-off flag).
- User can see last export timestamp (read-only, if available).
- User can reach export entry point (existing flow; no behavior change).
- User can see restore caution before initiating restore.
- User can see evidence gaps / beta limitations panel.
- User can access help/FAQ block.
- Non-goals section visible (no cloud, no sync, no auto backup).

**Rollback evidence**:
- Flag can be disabled without data loss.
- Settings page reverts to Phase 31A baseline when flag is disabled.

**Test data plan**:
- Use generated/test-only data for any evidence run.
- No real learner data in Phase 31C prototype testing.

**Phase 31C must not collect evidence using real learner data. Phase 31C must not execute restore rehearsal against production state.**

## Decision options

Phase 31C must choose one of the following decisions:

```text
HOLD_DATA_SAFETY_UX_PROTOTYPE
NEEDS_DESIGN_REWORK
PASS_TO_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE
```

- `HOLD_DATA_SAFETY_UX_PROTOTYPE`: Prototype scope is unclear, design constraints are not met, evidence plan is insufficient, or regressions were introduced. Hold until resolved.
- `NEEDS_DESIGN_REWORK`: Prototype revealed issues with the Phase 31B design that require rework before proceeding. Return to design gate with findings.
- `PASS_TO_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE`: Prototype is complete, evidence plan executed, constraints met, no regressions, default-off flag verified. Proceed to a separately-gated integration or production-wiring phase.

Phase 31C is a separate prototype gate and is not automatically approved by Phase 31B. The decision must be made explicitly in Phase 31C based on Phase 31C deliverables.

## Forbidden default approvals

Phase 31C must not approve by default:

- BETA_READY.
- Public production readiness.
- Guaranteed data-loss prevention.
- Production restore rehearsal.
- Real learner data restore rehearsal.
- Restore execution guarantees.
- Backup file format changes.
- Restore overwrite behavior changes.
- Storage migration.
- Sync/cloud/account/auth/backend.
- Telemetry/analytics approval.
- BYOC/WebDAV/P2P/device-transfer implementation.
- Built-in AI/OCR/API-key/BYOK behavior.
- Any claim not supported by Phase 31C evidence reviewed.
- Runtime Data Safety Center integration without a separate production-wiring gate.
- Removal of the default-off flag without a separate production-wiring gate.

## Recommended next step

Phase 31C should begin by reviewing the Phase 31B UX spec and design gate doc. For each required prototype surface, confirm that the implementation is within the allowed scope and behind the default-off flag. Execute the evidence plan using generated/test-only data. Make an explicit Phase 31C decision based on Phase 31C deliverables.

Phase 31C is a separate prototype gate and is not automatically approved.
Phase 31B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31B does not approve BETA_READY.
Phase 31B does not approve public production readiness.
Phase 31B does not approve guaranteed data-loss prevention.
Phase 31B does not approve restore execution.
Phase 31B does not approve production restore rehearsal.
Phase 31B does not approve real learner data restore rehearsal.
Phase 31B does not approve runtime backup/export/restore changes.
Phase 31B does not approve backup file format changes.
Phase 31B does not approve restore overwrite behavior changes.
Phase 31B does not approve storage migration.
Phase 31B does not approve sync/cloud/account/auth/backend.
Phase 31B does not approve telemetry/analytics.
Phase 31B does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31B does not approve BYOC/WebDAV/P2P/device-transfer implementation.
