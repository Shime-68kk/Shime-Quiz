# Phase 31B — Data Safety UX Design Gate Seed

## Status token

```text
PHASE31B_DATA_SAFETY_UX_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 31B is a separate design gate and is not automatically approved by Phase 31A, Phase 30C, Phase 30B, or any prior phase. An explicit Phase 31B planning output must be produced.

## Purpose

Phase 31B is a Data Safety UX Design Gate. Its goal is to produce a reviewed, constrained UX design for a Data Safety Center / Local Backup Center panel — or a conservative subset of that design — and decide whether to proceed to a separately-gated runtime prototype.

Phase 31B must not implement runtime Data Safety Center behavior. Any runtime prototype is deferred to a later phase after the design gate.

## Inputs from Phase 31A

From Phase 31A:
- Roadmap doc: `docs/planning/phase31a-post-limited-beta-roadmap-data-safety-ux-planning.md`
- Local-first UX research brief: `docs/research/phase31a-local-first-ux-research-brief.md`
- Release summary: `docs/release/phase31a-post-limited-beta-roadmap-summary.md`
- This seed: `docs/planning/phase31b-data-safety-ux-design-gate-seed.md`

Phase 31A decisions relevant to Phase 31B:
- Data Safety Center / Local Backup Center UX planning is the highest-priority non-evidence lane.
- Better local backup UX and backup reminders are included in Phase 31B scope.
- No runtime implementation in Phase 31B.
- No cloud sync, BYOC/WebDAV, P2P, or server infrastructure in Phase 31B.

## Design constraints

Phase 31B must operate under the following design constraints:

1. **Planning and design only**: No runtime source changes, no new React/JSX components, no route/navigation changes.
2. **No new storage**: No localStorage writes from new code, no IndexedDB production storage, no backup file format changes.
3. **No runtime backup/export/restore changes**: Existing backup/export/restore behavior must not be modified.
4. **No sync/cloud/account/auth/backend**: All designs must be local-first only.
5. **No BYOC/WebDAV/P2P**: These remain research-only and are not in Phase 31B scope.
6. **No BETA_READY approval**: Phase 31B does not advance readiness status.
7. **No guaranteed data-loss prevention**: Designs may not claim to prevent data loss.
8. **Conservative default**: If design scope is unclear, the conservative (narrower) design scope must be chosen.
9. **Separate prototype gate**: Any runtime implementation requires a separately-gated prototype phase after Phase 31B.

## Candidate UX surfaces

The following UX surfaces are candidates for the Data Safety Center design. Phase 31B must select a subset or decide on a design approach.

**Surface A — Settings panel section**:
- Add a "Data Safety" or "Your Data" section to the existing settings page.
- No new route required.
- Lower navigation visibility.
- Lower implementation complexity.

**Surface B — Dashboard section**:
- Add a data safety status area to the dashboard.
- May include a backup freshness indicator (last export date from localStorage).
- Higher navigation visibility.
- Requires dashboard layout review.

**Surface C — Dedicated route** (`/data-safety` or `/backup`):
- Separate page for the Data Safety Center.
- Full copy and flow for export, restore, risk acknowledgment.
- Highest implementation complexity.
- Requires route/navigation change.

**Surface D — Modal / overlay**:
- Triggered from a settings or dashboard entry point.
- Contains full Data Safety Center content.
- No new route.
- Moderate complexity.

**Recommended design focus for Phase 31B**: Surface A (settings panel section) or Surface D (modal) as the minimal viable design. Surface C (dedicated route) may be included as an aspirational design for a later prototype phase.

## Required boundaries

Phase 31B must document:
- Which UX surfaces are in scope.
- What copy is planned (storage model explanation, backup/export instructions, restore instructions, failure scenario copy, known limitations).
- What the panel does NOT do (no cloud sync, no automatic backup, no guaranteed prevention).
- How the design fits within current local-first guardrails.
- What is deferred to a runtime prototype phase.

Phase 31B must not approve:
- Runtime Data Safety Center implementation.
- New storage infrastructure.
- Cloud sync or BYOC/WebDAV/P2P.
- BETA_READY advancement.
- Guaranteed data-loss prevention.

## Required evidence plan

Phase 31B must define an evidence plan for any runtime prototype that follows:
- Design review criteria.
- Copy review criteria.
- UX acceptance criteria.
- Test data plan (generated/test data only).
- Rollback plan if runtime prototype introduces regressions.

Phase 31B itself does not execute this evidence plan. Execution requires a separately-gated prototype/evidence phase.

## Decision options

Phase 31B must choose one of the following decisions:

```text
HOLD_DATA_SAFETY_UX
NEEDS_MORE_RESEARCH
PASS_TO_DATA_SAFETY_UX_PROTOTYPE
```

- `HOLD_DATA_SAFETY_UX`: Design scope is unclear, design constraints are not met, or evidence plan is insufficient. Hold until resolved.
- `NEEDS_MORE_RESEARCH`: Design requires additional research (e.g., Opus 4.7 research gate for BYOC/WebDAV/P2P comparison) before a design decision can be made.
- `PASS_TO_DATA_SAFETY_UX_PROTOTYPE`: Design scope is defined, constraints are met, evidence plan is ready. Proceed to a separately-gated runtime prototype phase.

Phase 31B is a separate design gate and is not automatically approved by Phase 31A. The decision must be made explicitly in Phase 31B based on Phase 31B deliverables.

## Forbidden default approvals

Phase 31B must not approve by default:
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
- Any claim not supported by Phase 31B evidence reviewed.
- Runtime Data Safety Center implementation without a separate prototype gate.

## Recommended next step

Phase 31B should begin by reviewing the Phase 31A roadmap doc and local-first UX research brief. For each candidate UX surface, decide whether it is in scope for Phase 31B design. Produce a Phase 31B design output with explicit decisions for each surface and a conservative evidence plan.

Phase 31B is a separate planning/research/design/docs-only gate.
Phase 31B is a separate design gate and is not automatically approved.
Phase 31A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31A does not approve BETA_READY.
Phase 31A does not approve public production readiness.
Phase 31A does not approve guaranteed data-loss prevention.
Phase 31A does not approve restore execution.
Phase 31A does not approve production restore rehearsal.
Phase 31A does not approve real learner data restore rehearsal.
Phase 31A does not approve runtime backup/export/restore changes.
Phase 31A does not approve backup file format changes.
Phase 31A does not approve restore overwrite behavior changes.
Phase 31A does not approve storage migration.
Phase 31A does not approve sync/cloud/account/auth/backend.
Phase 31A does not approve telemetry/analytics.
Phase 31A does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31A does not approve BYOC/WebDAV/P2P/device-transfer implementation.
