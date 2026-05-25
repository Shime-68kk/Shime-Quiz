# Phase 32D — Claim/Copy Cleanup Seed

## Status token

```text
PHASE32D_CLAIM_COPY_CLEANUP_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 32D is a separate claim/copy cleanup gate. It receives the Phase 32C evidence review
decision and is tasked with reviewing and cleaning pre-existing release note claims and
copy boundary language before any Beta Ready re-decision can proceed.

Phase 32D is not automatically approved. No readiness status change is implied by the
existence of this seed. Phase 32D must independently reach its own decision.

## Inputs from Phase 32C

```text
PHASE32C_REMAINING_EVIDENCE_REVIEW_STATUS: COMPLETED_REMAINING_EVIDENCE_REVIEW
PHASE32C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE32C_REMAINING_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE32D_CLAIM_COPY_CLEANUP
PHASE32C_REVIEW_SCOPE: EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE32C_BLOCKED_LANE_INTERPRETATION: BLOCKED_DEFAULT_OFF_NOT_PRODUCTION_PROOF
PHASE32C_PHASE32B_HF1_INPUT_STATUS: VALIDATOR_ONLY_FIX_REVIEWED_NO_EVIDENCE_CHANGE
PHASE32D_CLAIM_COPY_CLEANUP_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 32C review findings carried into Phase 32D:
- Restore rehearsal and adapter-awareness lanes remain `BLOCKED_DEFAULT_OFF` — not production proof.
- Larger stress evidence remains smoke-level only (3-item fixture).
- Rollback evidence remains simulation-only.
- Pre-existing "AI-verified beta candidate: YES — SHIP" claim in RELEASE_NOTES.md and RELEASE_NOTES_V2.md
  was not modified in Phase 32B or 32C — cleanup is required in Phase 32D.
- No new risky claims were introduced in Phase 32B or 32C.
- `LIMITED_BETA_CANDIDATE` remains the highest approved readiness status.

## Cleanup constraints

Phase 32D must:
- Use static source review only. No runtime source changes.
- Not approve `BETA_READY`.
- Not approve public production readiness.
- Not approve restore execution.
- Not approve guaranteed data-loss prevention.
- Not approve runtime backup/export/restore behavior changes.
- Not approve storage migration.
- Not approve sync/cloud/account/auth/backend.
- Not approve telemetry/analytics.
- Not approve BYOC/WebDAV/P2P/device-transfer.
- Not approve ordinary-user Data Safety UX visibility.
- Frame Phase 32D as a separate gate; do not automatically advance to Beta Ready.
- Record all findings honestly, including pre-existing claims that require annotation.
- Not modify claims without explicit justification and evidence traceability.

Phase 32D may:
- Add clarifying notes or disclaimers to pre-existing release note claims.
- Update copy boundary language in planning/testing docs.
- Identify which claims are safe, which need annotation, and which need removal.
- Prepare a Phase 32E seed if cleanup is complete and Beta Ready re-decision is warranted.

## Required cleanup surfaces

Phase 32D must review and address each of the following:

### RELEASE_NOTES.md

- Pre-existing claim: `Kết luận đánh giá cuối: **AI-verified beta candidate: YES — SHIP**.`
  (Phase 29F/30B origin, line 7 approximate)
- Action required: Determine whether this claim should be annotated with an explicit limited
  internal scope note, updated to reflect `LIMITED_BETA_CANDIDATE` status, or left as-is
  with a new clarifying disclaimer. Provide traceability to Phase 30B decision.
- Do not remove or rewrite without explicit decision and rationale.

### RELEASE_NOTES_V2.md

- Same content as RELEASE_NOTES.md.
- Same action required as above.

### docs/release summaries with legacy `SHIP` or beta-ready-like wording

- Review Phase 29F, 30A, 30B, 30C release summaries for any `SHIP`, `BETA_READY`, or
  production-readiness language that implies more than `LIMITED_BETA_CANDIDATE`.
- Document findings. Do not modify prior phase files unless absolutely required and justified.
- If prior phase summaries contain appropriate limitations on the same page/doc, record that
  and accept as-is.

### Visible app copy if any new risky claims are found

- Review `src/routes/Home.jsx`, `src/routes/Dashboard.jsx`, `src/routes/Library.jsx`,
  and any other visible user-facing copy surfaces for claims that exceed confirmed status.
- Phase 32B found no new risky claims in app copy. Phase 32D should re-verify.

### Planning/testing docs claim boundary language

- Review Phase 32A, 32B, 32C planning and testing docs for claim boundary language.
- Confirm that "LIMITED_BETA_CANDIDATE" is consistently used as the highest approved status.
- Confirm that "BETA_READY" is consistently framed as not approved.
- Update any inconsistencies found.

### Beta Ready decision input notes

- Review Phase 32C evidence review table for any language that could be misread as
  implying Beta Ready approval.
- Ensure the Phase 32C decision rationale is clear that `PASS_TO_PHASE32D` does not
  imply Beta Ready is pending approval — it implies further cleanup is required first.

## Legacy release notes review

The pre-existing "AI-verified beta candidate: YES — SHIP" claim in RELEASE_NOTES.md and
RELEASE_NOTES_V2.md originates from Phase 29F (evidence review) and Phase 30B (limited
beta candidate gate). At the time of those phases, the claim was supported by the evidence
available. However:

- Phase 30C (beta ready decision/hold) resulted in `NEEDS_MORE_EVIDENCE_FOR_BETA_READY`.
- Phase 31J and Phase 32B confirmed additional limitations.
- The current status is `LIMITED_BETA_CANDIDATE` with `BETA_READY_NOT_APPROVED`.

Phase 32D must decide whether to:
1. Add a clarifying annotation to the "SHIP" claim noting the current limited scope.
2. Update the claim to reflect the current `LIMITED_BETA_CANDIDATE` / internal-only status.
3. Accept the claim as-is given the surrounding limitations already present in the same file.

Phase 32D must not silently leave the "SHIP" claim without review and a documented decision.

## Required evidence plan

Phase 32D is a docs/static review/planning/validator/CI-only phase.

Required outputs:
- `docs/testing/phase32d-claim-copy-cleanup.md` — full claim/copy review with findings and
  decision for each surface
- `docs/release/phase32d-claim-copy-cleanup-summary.md` — conservative release summary
- `scripts/validate-phase32d-claim-copy-cleanup.js` — static validator
- Updated `.github/workflows/e2e-smoke.yml` — Phase 32D validator as active gate

Optional if Beta Ready re-decision is warranted:
- `docs/planning/phase32e-beta-ready-redecision-input-review-seed.md` — Phase 32E seed

Required tokens in Phase 32D docs:
```text
PHASE32D_CLAIM_COPY_CLEANUP_STATUS: COMPLETED_CLAIM_COPY_CLEANUP
PHASE32D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE32D_CLAIM_COPY_CLEANUP_DECISION: <chosen decision>
```

## Decision options

```text
HOLD_CLAIM_COPY_CLEANUP
NEEDS_COPY_REVIEW
PASS_TO_PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW
```

Use `HOLD_CLAIM_COPY_CLEANUP` if cleanup cannot proceed due to missing inputs or blockers.
Use `NEEDS_COPY_REVIEW` if one or more claim surfaces require additional review or decisions
before cleanup can be completed.
Use `PASS_TO_PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW` if cleanup is complete, all
claim surfaces have been reviewed and addressed, and the evidence packet is sufficient to
proceed to a Beta Ready re-decision review gate.

Phase 32D must not use a decision option not listed here.

## Forbidden default approvals

Phase 32D must not:
- Approve `BETA_READY`.
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
- Automatically approve any item that is currently not approved.
- Treat `PASS_TO_PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW` as Beta Ready approval.

## Recommended next step

Phase 32D should begin by reading:
- `docs/testing/phase32c-remaining-evidence-review.md` — full evidence review
- `docs/release/phase32c-remaining-evidence-review-summary.md` — summary and decision
- `RELEASE_NOTES.md` — pre-existing "SHIP" claim and surrounding context
- `RELEASE_NOTES_V2.md` — same as above
- Phase 29F, 30A, 30B release summaries — origin of existing claims

Phase 32D is a separate claim/copy cleanup gate and is not automatically approved.
Phase 32D does not inherit Beta Ready approval from Phase 32C.
Phase 32D must independently reach its own decision.
