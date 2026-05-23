# Phase 27A — Local-First Hybrid Next Direction Planning Seed

## Status token

```
PHASE27A_LOCAL_FIRST_HYBRID_NEXT_DIRECTION_PLANNING_STATUS: PREPARED_PLANNING_SEED
PHASE26E_NEXT_DIRECTION_DECISION: PASS_TO_PHASE27A_LOCAL_FIRST_HYBRID_NEXT_DIRECTION_PLANNING
PHASE26E_TESTER_EVIDENCE_REVIEW_STATUS: COMPLETED_TESTER_EVIDENCE_REVIEW
PHASE26E_UI_WIRING_REDECISION: KEEP_HIDDEN_DEFAULT_OFF_HARNESS_NO_PRODUCTION_UI_APPROVAL
PHASE26E_PHASE26_CLOSURE_DECISION: CLOSED_WITH_HIDDEN_DEFAULT_OFF_HARNESS_AND_LIMITED_TESTER_EVIDENCE
```

## Purpose

Phase 27A is a planning-first gate. It must choose one direction before any runtime implementation begins.

Phase 27A does not approve runtime changes. It does not approve production UI. It does not approve storage migrations. It does not approve sync/cloud/account/auth/backend work.

The purpose of Phase 27A is to evaluate the candidate directions from Phase 26E evidence and produce a single clear next-step decision, supported by a planning document and static validator.

## Inputs from Phase 26

Phase 26 delivered:
- A hidden/default-off developer/test Backup Health harness (`BackupHealthDevHarness`).
- Tester evidence confirming default-off behavior (blank/null route, no production nav, no storage writes).
- Strict reviewer confirmation of scope boundaries (no forbidden APIs, no broad rollout).
- Conservative closure decision: CLOSED_WITH_HIDDEN_DEFAULT_OFF_HARNESS_AND_LIMITED_TESTER_EVIDENCE.
- Re-decision: KEEP_HIDDEN_DEFAULT_OFF_HARNESS_NO_PRODUCTION_UI_APPROVAL.

Phase 26 did NOT deliver:
- Browser evidence of the enabled harness copy.
- Production-visible Backup Health UI.
- Adapter-aware backup/export/restore design or implementation.
- Broad backup reliability evidence.
- Local-first hybrid readiness decision.
- BETA_READY.

The highest-risk gap identified from Phase 26 evidence: adapter-aware backup/export/restore has no design gate, no evidence, and no safety analysis. This is the highest-priority unresolved item for local-first hybrid readiness.

## Candidate directions

Phase 27A must evaluate and choose from among the following candidate directions:

1. **hidden harness polish or rollback decision** — Either polish the Phase 26 hidden harness (e.g., accessibility improvements, test coverage expansion) or decide to remove it entirely. Low risk. Does not advance local-first hybrid readiness directly.

2. **limited production UI design exploration** — Begin a conservative design gate for limited Backup Health UI (e.g., a read-only status indicator in settings). Higher risk. Requires full browser evidence matrix and separate design gate before any runtime work. Does not address the adapter-aware backup gap.

3. **backup/export/restore adapter-awareness design** — Design a gate for making backup/export/restore operations aware of the active storage adapter (localStorage vs IndexedDB). Addresses the highest-risk local-first hybrid gap. Design gate only — no runtime changes in Phase 27A itself.

4. **broader manual/browser evidence matrix** — Expand the Phase 26 tester evidence to cover the enabled harness copy, multiple browsers, and screen sizes. Fills the browser evidence gap from Phase 26 before any production UI decision.

5. **local-first hybrid readiness decision** — Make a formal go/no-go decision for local-first hybrid readiness. Requires completion of adapter-aware backup design, broader browser evidence, and all prior safety gates. Not ready as Phase 27A without first completing #3 and #4.

## Recommended direction

**backup/export/restore adapter-awareness design** (candidate direction #3).

Reason: Backup Health UI work is now hidden/default-off and conservative; the next higher-risk gap for local-first hybrid readiness is adapter-aware backup/export/restore design, but only as a design gate first.

This direction:
- Directly addresses the highest-risk unresolved gap for local-first hybrid readiness.
- Is scoped as a design gate only — no runtime, no migration, no production behavior change in Phase 27A.
- Produces a concrete planning artifact (ADR or design doc) that gates future runtime phases.
- Is reversible — a design gate can be shelved or cancelled if the risk analysis warrants.

## Forbidden default approvals

Phase 27A must not approve by default:

- BETA_READY (any definition)
- production-visible Backup Health UI
- broad dashboard/settings/library rollout
- production adapter-aware backup/export/restore
- backup file format changes
- restore overwrite behavior changes
- IndexedDB production storage
- storage migration
- sync/cloud/account/auth/backend
- telemetry/analytics
- guaranteed data-loss prevention
- platform backup preservation claims
- automatic backup claims
- broad backup reliability
- local-first hybrid readiness claim

## Required gates before runtime

Before any runtime implementation (including production adapter-aware backup) the following gates are required:

1. **Phase 27A planning decision** — written direction chosen, documented, validated, CI-registered.
2. **Adapter-awareness design gate** — detailed design doc / ADR for adapter-aware backup/export/restore, reviewed before implementation.
3. **Strict Reviewer sign-off** — for each design gate and each runtime phase.
4. **Broad browser evidence** — enabled harness copy browser-tested, multiple browsers, screen sizes, a11y quick check.
5. **Product/stakeholder sign-off** — before any production UI or behavioral change visible to learners.

## Evidence needed before stronger claims

To claim local-first hybrid readiness:
- Adapter-aware backup/export/restore design completed and reviewed.
- IndexedDB production adapter implementation completed, tested, and reviewed.
- Full migration plan (per-key manifest, rollback, journal) completed and reviewed.
- Broad browser evidence matrix completed (multiple browsers, screen sizes, a11y).
- Production Backup Health UI design gate completed.
- All prior phase validators passing in CI.
- Strict Reviewer sign-off on each gate.

To claim BETA_READY:
- All local-first hybrid readiness gates above.
- Performance and quota stress tests completed.
- Real user testing results log completed.
- Product/stakeholder sign-off.

## Recommended next step

Create Phase 27A as a docs/design/static-validator/CI-only phase that:
1. Confirms the chosen direction (adapter-aware backup/export/restore design).
2. Produces an initial design doc or ADR stub for adapter-aware backup/export/restore scope.
3. Registers a Phase 27A static validator and CI step.
4. Does not modify runtime source, tests, e2e, package files, storage drivers, or backup behavior.
5. Does not approve BETA_READY, production UI, or local-first hybrid readiness.

Phase 27A is a separate gate and is not automatically approved by Phase 26E.
Phase 27A must not approve production runtime changes without completing the required gates listed above.
