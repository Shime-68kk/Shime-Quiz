# Phase 34A — Leader UI Effects Design Gate Seed

## Status token

```text
PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 34A is the Leader UI Effects Design Gate. It is the first gate dedicated to planning
and designing Leader UI visual effects for Shime Study.

Phase 34A is a separate Leader UI effects design gate and is not automatically approved.
No readiness status change is implied by the existence of this seed. Phase 34A must
independently reach its own design gate decision through its own process.

Phase 34A does not inherit any implementation approval from Phase 33F. Phase 33F's
GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS decision authorizes a controlled limited beta
run only; it does not grant or imply Phase 34A approval.

Phase 34A must not implement Leader UI effects without passing its own design gate.

## Inputs from Phase 33F

```text
PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_STATUS: COMPLETED_FINAL_GO_NO_GO
PHASE33F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_DECISION: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS
PHASE33F_GO_NO_GO_SCOPE: CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE33F_LIMITATION_STATUS: LIMITATIONS_ACCEPTED_FOR_CONTROLLED_LIMITED_BETA_ONLY
PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_SEED_STATUS: PREPARED_PLANNING_SEED
```

Highest approved readiness entering Phase 34A: `LIMITED_BETA_CANDIDATE`
BETA_READY: not approved.
Public production readiness: not approved.
Phase 30C Beta Ready hold: not lifted.

All 10 limitations carried forward from Phase 32F remain unresolved. Any Phase 34A
implementation must operate within the LIMITED_BETA_CANDIDATE readiness boundary.

Phase 33F GO decision does not change any limitation status. Phase 34A must not describe
any limitation as resolved without a dedicated gate.

## Design constraints

Phase 34A design work must operate within the following constraints inherited from the
full Phase 30–33F chain:

1. **Readiness ceiling:** LIMITED_BETA_CANDIDATE is the highest approved readiness.
   Phase 34A cannot approve BETA_READY or any higher status. Any implementation produced
   in Phase 34B+ operates under LIMITED_BETA_CANDIDATE constraints only.

2. **No runtime behavior changes in design gate:** Phase 34A itself is a design-only gate.
   No runtime/source/test/e2e behavior may be changed in the design gate phase. Implementation
   is reserved for Phase 34B and beyond, subject to design gate approval.

3. **No storage/backup/restore behavior changes:** Leader UI effects must not require or
   imply changes to storage drivers, backup/export/restore behavior, file formats, or
   restore overwrite behavior.

4. **No cloud/sync/backend/account/auth:** Leader UI effects must remain local-only. No
   cloud sync, account system, authentication backend, or server-side dependency may be
   introduced.

5. **No data-loss guarantee claims:** Leader UI effects must not imply data-loss guarantees.
   The absence-of-data-loss-guarantee limitation remains in force.

6. **No Beta Ready/public production claims:** Leader UI effects must not imply BETA_READY,
   public production readiness, or any claim not permitted at LIMITED_BETA_CANDIDATE.

7. **No telemetry/analytics:** Leader UI effects must not introduce telemetry or analytics
   unless a dedicated gate approves it.

8. **Performance budget:** Leader UI effects must be designed within a defined performance
   budget. No effect that materially degrades study session performance is permitted.

9. **Accessibility and reduced-motion:** Leader UI effects must include reduced-motion
   alternatives. Accessibility requirements must be addressed in the design surface, not
   deferred.

10. **Rollback/removal plan:** Leader UI effects must include a rollback/removal plan.
    No effect may be introduced without a documented removal path.

11. **Data Safety UX unchanged:** Phase 34A must not change Data Safety UX visibility.
    Ordinary-user Data Safety UX visibility remains not approved unless a dedicated gate
    decides otherwise.

12. **No Phase 34B automatic approval:** Passing Phase 34A does not automatically approve
    Phase 34B or any subsequent phase.

## Required design surfaces

Phase 34A must review and decide on each of the following design surfaces before reaching
a design gate decision:

1. **Effect inventory and ownership** — What Leader UI effects are proposed? Which source
   module/component owns each effect? What is the rendering boundary for each effect?

2. **Performance budget** — What is the maximum allowed rendering cost per effect? How is
   the budget measured? What is the threshold for rejection? How are frame-rate and
   layout-shift impacts assessed?

3. **Accessibility and reduced-motion rules** — What reduced-motion alternatives are
   provided for each effect? Which CSS media queries and/or JavaScript checks are required?
   How are WCAG motion requirements addressed?

4. **No storage/backup/restore behavior changes** — Confirmation that no proposed effect
   requires or implies storage, backup, export, or restore behavior changes.

5. **No cloud/sync/backend/account/auth claims** — Confirmation that no proposed effect
   requires or implies cloud sync, account, authentication, or server-side features.

6. **No data-loss guarantee claims** — Confirmation that no proposed effect implies a
   data-loss guarantee. Participant backup requirement remains in force.

7. **No Beta Ready/public production claims** — Confirmation that no proposed effect implies
   BETA_READY or public production readiness.

8. **Screenshots/manual evidence plan** — What manual evidence (screenshots, screen
   recordings, browser observations) is required to verify each effect works as intended
   and does not cause regressions?

9. **Rollback/removal plan** — What is the rollback/removal path for each proposed effect?
   What is the activation boundary (feature flag, test-only, or default-off gate)?

10. **Final implementation scope boundaries** — What is the exact set of files that may be
    modified during Phase 34B+ implementation? What files are explicitly out of scope?
    What is the test plan for verifying no regression in study session behavior?

## Required evidence plan

Before Phase 34A can reach a design gate decision, the following evidence plan items must
be addressed:

- Effect inventory complete with ownership and rendering boundary per effect.
- Performance budget defined with measurable threshold.
- Accessibility/reduced-motion alternatives specified per effect.
- No storage/backup/restore behavior change confirmed.
- No cloud/sync/backend/account/auth claim confirmed.
- No data-loss guarantee claim confirmed.
- No Beta Ready/public production claim confirmed.
- Screenshots/manual evidence plan documented.
- Rollback/removal plan documented per effect.
- Final implementation scope boundaries defined.
- All 10 inherited limitations confirmed still carried forward.
- Design gate decision documents marked as internal only.
- Validator and CI registration for Phase 34A.

Note: Phase 34A is a design-only gate. No runtime implementation is required for Phase 34A
itself. The evidence plan is for design surface completeness and claim boundary compliance.

## Decision options

Phase 34A must choose one of the following decision options:

```text
HOLD_LEADER_UI_EFFECTS_DESIGN
NEEDS_UI_EFFECTS_DESIGN_REWORK
PASS_TO_PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION
```

**`HOLD_LEADER_UI_EFFECTS_DESIGN`**

Use if any of the following is true:
- A blocking design finding is identified in any required design surface.
- The performance budget cannot be defined or validated within Phase 34A.
- Accessibility/reduced-motion alternatives cannot be specified.
- A claim boundary violation is found that cannot be resolved within Phase 34A scope.
- The rollback/removal plan is absent or incomplete.
- The implementation scope boundaries cannot be bounded safely.

A HOLD decision does not permanently block Leader UI effects. It requires a dedicated gate
to address the identified blocker before re-entry.

**`NEEDS_UI_EFFECTS_DESIGN_REWORK`**

Use if specific design surface gaps, performance budget gaps, accessibility gaps, or
claim boundary issues are identified that can be addressed by rework within the design
gate without a full re-evaluation. Identify each gap specifically and direct rework before
the design gate decision can be revisited.

**`PASS_TO_PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION`**

Use only if all of the following conditions are met:
- All required design surfaces reviewed: no blocking finding.
- Effect inventory complete with ownership and rendering boundary.
- Performance budget defined and measurable.
- Accessibility/reduced-motion alternatives specified per effect.
- No storage/backup/restore behavior change confirmed.
- No cloud/sync/backend/account/auth claim confirmed.
- No data-loss guarantee claim confirmed.
- No Beta Ready/public production claim confirmed.
- Screenshots/manual evidence plan documented.
- Rollback/removal plan documented per effect.
- Final implementation scope boundaries defined.
- All 10 inherited limitations confirmed carried forward.

A PASS decision authorizes Phase 34B to implement Leader UI effects within the design
boundaries established by Phase 34A only. It does not approve BETA_READY, public production
readiness, or any higher status.

## Forbidden default approvals

Phase 34A must not:
- Pass automatically on the basis of Phase 33F GO decision.
- Approve BETA_READY as a consequence of issuing a PASS decision.
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
- Lift the Phase 30C Beta Ready hold without a dedicated gate.
- De-scope blocked/default-off lanes without explicit rationale in a dedicated gate.
- Approve Phase 34B automatically.
- Expand the participant boundary beyond internal controlled access without a dedicated gate.
- Introduce Leader UI effects implementation in the design gate phase itself.

## Recommended next step

Phase 34A should begin by reading:
- `docs/testing/phase33f-controlled-limited-beta-final-go-no-go.md` — Phase 33F go/no-go record
- `docs/release/phase33f-controlled-limited-beta-final-go-no-go-summary.md` — Phase 33F summary
- `docs/planning/phase34a-leader-ui-effects-design-gate-seed.md` — this file

Phase 34A is a separate Leader UI effects design gate and is not automatically approved.
Phase 34A does not inherit BETA_READY approval from Phase 33F.
Phase 34A must independently reach its own design gate decision.

LIMITED_BETA_CANDIDATE remains the highest approved readiness status entering Phase 34A.
BETA_READY is not approved. Phase 30C hold is not lifted.
PASS_TO_PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION (if issued) does not change this.
