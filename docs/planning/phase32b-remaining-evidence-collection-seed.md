# Phase 32B — Remaining Evidence Collection Seed

## Status token

```text
PHASE32B_REMAINING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 32B is the remaining evidence collection gate for the beta-ready evidence track. Phase 30C held the beta-ready decision pending more evidence. Phase 32A completed the evidence triage and defined the remaining lanes. Phase 32B collects the evidence specified in those lanes.

Phase 32B is a separate evidence collection gate and is not automatically approved by Phase 32A or any prior phase.

## Inputs from Phase 32A

Phase 32A returned:

```text
PHASE32A_BETA_READY_REMAINING_EVIDENCE_REENTRY_STATUS: COMPLETED_REENTRY_PLANNING
PHASE32A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE32A_BETA_READY_REENTRY_DECISION: PASS_TO_PHASE32B_REMAINING_EVIDENCE_COLLECTION
PHASE32A_REENTRY_SCOPE: PLANNING_EVIDENCE_REENTRY_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE32A_PHASE31_CHAIN_INPUT_STATUS: INTERNAL_VISIBILITY_CHAIN_CLOSED_WITH_LIMITED_INTERNAL_SCOPE
PHASE32B_REMAINING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 32A confirmed:
- LIMITED_BETA_CANDIDATE is the highest approved readiness status
- BETA_READY is not approved
- Seven of eight evidence lanes remain NOT_COLLECTED or PARTIAL
- One lane (Data Safety UX internal visibility) is COMPLETED_PHASE31J
- No blocking issue was identified that requires a HOLD

## Collection constraints

Phase 32B must respect all guardrails from Phase 32A and all prior phases:

- Generated/test data only — no real learner data
- No real learner backup files
- No production restore execution
- No backup file format changes
- No restore overwrite behavior changes
- No storage driver changes
- No migrations
- No sync/cloud/account/auth/backend
- No telemetry/analytics
- No BYOC/WebDAV/P2P implementation
- No production-visible UI changes
- No new runtime implementation
- No BETA_READY approval during collection
- Evidence collection does not automatically approve BETA_READY

## Required evidence packet

Phase 32B must produce an evidence packet at:

```text
/home/quang/Documents/quiz_beta/phase32b-remaining-evidence-collection-packet.md
```

The evidence packet must document results for each required evidence lane before Phase 32B can pass to Phase 32C. The packet must use generated/test data only. It must not include real learner data.

## Required evidence lanes

Phase 32B must collect evidence for the following lanes (from Phase 32A triage):

1. **restore rehearsal browser lane** — Direct Playwright browser evidence for Phase 28 restore rehearsal planner. Must confirm: UI renders, actions are inert, no real data modified, no production storage overwritten.

2. **adapter-awareness browser lane** — Direct Playwright browser evidence for Phase 27 adapter-awareness model. Must confirm: display is read-only, no storage driver switch triggered, no unexpected writes.

3. **before/after localStorage diff** — Before/after localStorage snapshot across: study session, import, backup flow, restore rehearsal. Must confirm: storage boundaries respected, no unexpected writes per flow.

4. **larger generated/test stress evidence** — Evidence run with 10+ decks, 200+ generated cards. Must confirm: performance acceptable, quota behavior stable, no data corruption.

5. **rollback/removal evidence** — Complete rollback evidence for at least one major feature flag. Must confirm: feature absent after flag removal, no residual state, no errors.

6. **claim/copy cleanup and legacy release notes review** — Manual review of user-visible claims, RELEASE_NOTES.md, RELEASE_NOTES_V2.md. Must flag any overstatements or outdated claims.

7. **Data Safety UX internal visibility evidence integration** — Already COMPLETED_PHASE31J. Phase 32B must confirm the Phase 31J result is correctly referenced in the evidence packet.

8. **Beta Ready final re-decision input review** — Not collectible in Phase 32B itself; requires a separate Phase 32C review gate after all other lanes are complete.

## Browser/manual evidence plan

For browser evidence lanes (restore rehearsal, adapter-awareness, localStorage diff, stress evidence):

- Use direct Playwright browser run (headless Chromium, Linux/X11)
- Capture before/after state for each lane
- Record all observations in the evidence packet
- Do not run against real learner data or production state
- Use generated/test data sets only

For manual review lanes (claim/copy, release notes):

- Review user-visible strings in the app
- Review RELEASE_NOTES.md and RELEASE_NOTES_V2.md
- Flag any claims that overstate capabilities or conflict with current implementation
- Record findings in the evidence packet

## Static evidence plan

For rollback/removal evidence:

- Select one major feature flag
- Rebuild without the flag
- Capture DOM/screenshot evidence of feature absence
- Verify no residual state in localStorage or console
- Record results in the evidence packet

## Decision options

Phase 32B must choose one of the following decisions after evidence collection:

```text
HOLD_REMAINING_EVIDENCE_COLLECTION
NEEDS_EVIDENCE_PACKET
PASS_TO_PHASE32C_REMAINING_EVIDENCE_REVIEW
```

- `HOLD_REMAINING_EVIDENCE_COLLECTION` — Evidence collection reveals a blocking issue or the evidence packet is insufficient. Hold until the blocking issue is resolved.
- `NEEDS_EVIDENCE_PACKET` — Some lanes are collected but the packet is incomplete. Identify which lanes remain and specify what is needed.
- `PASS_TO_PHASE32C_REMAINING_EVIDENCE_REVIEW` — All required lanes are collected and the evidence packet is complete. Proceed to Phase 32C for evidence review and beta-ready re-decision.

Phase 32B is a separate evidence collection gate and is not automatically approved. Evidence must be collected before a decision can be made.

## Forbidden default approvals

Phase 32B must not:
- Auto-approve BETA_READY based on Phase 32A or prior phases
- Default to PASS_TO_PHASE32C_REMAINING_EVIDENCE_REVIEW without completing all required lanes
- Auto-approve ordinary-user Data Safety UX visibility
- Auto-approve backup/export/restore behavior changes
- Auto-approve sync/cloud/account/auth/backend
- Auto-approve storage migration
- Auto-approve telemetry/analytics
- Use real learner data for any evidence run
- Claim stress-tested readiness without completing the larger stress evidence lane
- Claim broad validation without completing all required lanes
- Claim Phase 32B is approved before evidence collection is complete

## Recommended next step

Begin Phase 32B by:

1. Reviewing the Phase 32A evidence triage and all lane definitions.
2. Planning the Playwright browser runs for restore rehearsal, adapter-awareness, and localStorage diff lanes.
3. Generating test data for the stress evidence lane (10+ decks, 200+ cards).
4. Running the rollback evidence for at least one major flag.
5. Completing the claim/copy and release notes review.
6. Assembling all results into the evidence packet at `/home/quang/Documents/quiz_beta/phase32b-remaining-evidence-collection-packet.md`.
7. Deciding whether to pass to Phase 32C or hold pending additional evidence.

Next recommended phase: Phase 32B — Remaining Evidence Collection

Phase 32B is a separate evidence collection gate and is not automatically approved.
Phase 32A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 32A does not approve BETA_READY.
Phase 32A does not approve public production readiness.
