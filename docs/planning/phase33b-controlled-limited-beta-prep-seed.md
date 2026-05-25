# Phase 33B — Controlled Limited Beta Prep Seed

## Status token

```text
PHASE33B_CONTROLLED_LIMITED_BETA_PREP_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 33B is the Controlled Limited Beta Prep gate. It receives the Phase 33A stabilization
decision (`PASS_TO_PHASE33B_CONTROLLED_LIMITED_BETA_PREP`) and is tasked with preparing the
concrete communications, disclosure checklists, and review templates needed for a controlled
limited beta rollout — if and when such a rollout is approved.

Phase 33B is a separate controlled limited beta prep gate and is not automatically approved.
No readiness status change is implied by the existence of this seed. Phase 33B must
independently reach its own decision through its own prep review and evidence assessment.

Phase 33B does not inherit BETA_READY approval from Phase 33A or Phase 32F.
Phase 33B does not inherit any approval beyond LIMITED_BETA_CANDIDATE.
Phase 33B must plan within the boundaries established by Phase 33A.

## Inputs from Phase 33A

```text
PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_STATUS: COMPLETED_STABILIZATION_PLANNING
PHASE33A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_DECISION: PASS_TO_PHASE33B_CONTROLLED_LIMITED_BETA_PREP
PHASE33A_STABILIZATION_SCOPE: PLANNING_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE33A_LIMITATION_CARRYFORWARD_STATUS: LIMITATIONS_DISCLOSED_AND_TRACKED
PHASE33B_CONTROLLED_LIMITED_BETA_PREP_SEED_STATUS: PREPARED_PLANNING_SEED
```

Limitations carried forward from Phase 33A (originating in Phase 32F) into Phase 33B:
- Restore rehearsal browser lane: `BLOCKED_DEFAULT_OFF` — not production restore proof.
- Adapter-awareness browser lane: `BLOCKED_DEFAULT_OFF` — not production adapter proof.
- Generated/test stress evidence: smoke-level only — not production-grade.
- Rollback/removal evidence: simulation-only — not a guaranteed rollback proof.
- No real learner data evidence.
- No public production readiness evidence.
- No guaranteed data-loss prevention proof.
- Ordinary-user Data Safety UX visibility: not approved.
- No sync/cloud/account/auth/backend evidence present or intended.
- Phase 30C Beta Ready hold not lifted.

## Prep constraints

Phase 33B must:
- Plan within the LIMITED_BETA_CANDIDATE readiness boundary.
- Not approve BETA_READY automatically or without a separate gate.
- Not approve public production readiness.
- Not approve guaranteed data-loss prevention.
- Not approve restore execution.
- Not approve production restore rehearsal.
- Not approve real learner data restore rehearsal.
- Not approve runtime backup/export/restore behavior changes.
- Not approve backup file format changes.
- Not approve restore overwrite behavior changes.
- Not approve storage migration.
- Not approve sync/cloud/account/auth/backend.
- Not approve telemetry/analytics.
- Not approve BYOC/WebDAV/P2P/device-transfer.
- Not approve ordinary-user Data Safety UX visibility.
- Explicitly address each carried-forward limitation in the prep surfaces.
- Require disclosure of all limitations to any controlled beta participant.

Phase 33B may:
- Prepare a limitation disclosure checklist for controlled beta participants.
- Prepare release/PR note templates that use only LIMITED_BETA_CANDIDATE language.
- Define a controlled beta participant boundary document.
- Recommend next phases for resolving individual limitations.
- Prepare follow-up evidence plans for blocked/default-off lanes.

## Required prep surfaces

Phase 33B must address each of the following prep surfaces:

1. **Limited beta participant boundary** — define who qualifies as a controlled limited beta
   participant, how access is granted, what scope they are given, and what disclosures they
   receive.

2. **Limitation disclosure checklist** — a structured checklist of all carried-forward
   limitations that must be reviewed and acknowledged before any controlled beta participant
   is granted access.

3. **No public production wording** — a wording guide or template review confirming that no
   communication uses public production, production-ready, or broad-release language.

4. **No Beta Ready wording** — a wording guide or template review confirming that no
   communication uses BETA_READY or implies that the Phase 30C hold has been lifted.

5. **No data-loss guarantee wording** — a wording guide or template review confirming that
   no communication claims guaranteed data-loss prevention.

6. **No cloud/sync/backend/account/auth claim** — a wording guide or template review
   confirming that no communication claims sync, cloud, account, auth, or backend capability.

7. **Restore/adapter blocked-default-off follow-up** — a structured follow-up plan specifying
   what evidence or decision is needed to resolve or formally de-scope the blocked browser
   lanes. Must state explicitly that the lanes remain `BLOCKED_DEFAULT_OFF` at the time of
   Phase 33B.

8. **Stress/rollback follow-up** — a structured follow-up plan specifying what evidence is
   needed to upgrade smoke-level and simulation-only evidence to production-grade. Must state
   explicitly that stress and rollback evidence remain limited at the time of Phase 33B.

9. **Data Safety UX internal-only status** — confirmation that ordinary-user visibility
   remains not approved; a statement of what gate is needed to change this status.

10. **Release/PR note template for controlled limited beta candidate** — a template for PR
    descriptions and release notes that uses only approved language, discloses all
    limitations, and does not imply any higher readiness status than LIMITED_BETA_CANDIDATE.

## Required evidence plan

Phase 33B must include an evidence plan covering:

- How each prep surface will be verified before any controlled beta participant access is
  granted.
- Which limitations require dedicated evidence collection gates before they can be resolved.
- Which limitations can be de-scoped with rationale in a dedicated gate without additional
  evidence collection.
- What evidence would be required to lift the Phase 30C Beta Ready hold in a future gate.

The evidence plan must not claim that existing evidence is sufficient to approve any status
higher than LIMITED_BETA_CANDIDATE.

## Decision options

Phase 33B must choose one of the following decision options:

```text
HOLD_CONTROLLED_LIMITED_BETA_PREP
NEEDS_PREP_REWORK
PASS_TO_PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW
```

Use `HOLD_CONTROLLED_LIMITED_BETA_PREP` if any blocker prevents prep from proceeding or if
the current readiness state is too uncertain to define prep surfaces safely.

Use `NEEDS_PREP_REWORK` if specific prep surface gaps remain that must be resolved before a
controlled limited beta prep review phase can begin. Identify each gap specifically.

Use `PASS_TO_PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW` only if:
- All ten required prep surfaces have been addressed.
- All carried-forward limitations are explicitly disclosed and tracked.
- The limitation disclosure checklist is complete.
- No BETA_READY or public production readiness is implied in any prep surface.
- The evidence plan is complete.

## Forbidden default approvals

Phase 33B must not:
- Approve BETA_READY automatically or without a separate gate.
- Approve public production readiness.
- Approve guaranteed data-loss prevention.
- Approve restore execution.
- Approve production restore rehearsal.
- Approve real learner data restore rehearsal.
- Approve runtime backup/export/restore behavior changes.
- Approve backup file format changes.
- Approve restore overwrite behavior changes.
- Approve storage migration.
- Approve sync/cloud/account/auth/backend.
- Approve telemetry/analytics.
- Approve built-in AI/OCR/API-key/BYOK behavior.
- Approve BYOC/WebDAV/P2P/device-transfer implementation.
- Approve ordinary-user Data Safety UX visibility.
- Treat receiving this seed as automatic approval.
- Treat LIMITED_BETA_CANDIDATE as equivalent to BETA_READY.
- Lift the Phase 30C Beta Ready hold without a dedicated gate.
- De-scope blocked/default-off lanes without explicit rationale in a dedicated gate.

## Recommended next step

Phase 33B should begin by reading:
- `docs/testing/phase33a-limited-beta-candidate-stabilization.md` — full stabilization record
- `docs/release/phase33a-limited-beta-candidate-stabilization-summary.md` — summary
- `docs/testing/phase32f-beta-ready-redecision.md` — formal Beta Ready re-decision
- `docs/release/phase32f-beta-ready-redecision-summary.md` — Phase 32F summary
- `docs/testing/phase32c-remaining-evidence-review.md` — conservative evidence interpretation
- Phase 30B and 30C release summaries — readiness gate history
- Phase 31J release summary — Data Safety UX gate history

Phase 33B is a separate controlled limited beta prep gate and is not automatically approved.
Phase 33B does not inherit BETA_READY approval from Phase 33A.
Phase 33B must independently reach its own prep decision.
