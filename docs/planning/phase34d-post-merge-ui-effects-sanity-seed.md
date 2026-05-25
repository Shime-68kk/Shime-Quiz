# Phase 34D — Post-Merge UI Effects Sanity Seed

## Status token

```text
PHASE34D_POST_MERGE_UI_EFFECTS_SANITY_SEED_STATUS: PREPARED_IF_NEEDED
```

## Purpose

Phase 34D is an optional post-merge sanity gate for the Phase 34B Leader UI effects
(E01, E02, E03). It is triggered only if a regression or unexpected behavior is observed
after Phase 34C merges to main. If no post-merge issues are found, Phase 34D may be
skipped entirely (`SKIP_POST_MERGE_SANITY_NO_ISSUES`) and the project proceeds directly
to the next higher gate.

Phase 34D is not automatically approved. It must make its own independent determination
based on post-merge observation evidence.

Phase 34D is constrained to the same scope as Phase 34C: evidence/review only. No source,
runtime, test, package, or release-note files may be modified in Phase 34D unless a
hotfix gate is opened and separately approved.

## Inputs from Phase 34C

```text
PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW_STATUS: COMPLETED_UI_EFFECTS_EVIDENCE_REVIEW
PHASE34C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE34C_CONTROLLED_LIMITED_BETA_STATUS: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS_CONFIRMED
PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW_DECISION: PASS_LEADER_UI_EFFECTS_WITH_LIMITED_EVIDENCE
PHASE34C_EVIDENCE_SCOPE: UI_EFFECTS_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE34C_MANUAL_BROWSER_EVIDENCE_STATUS: LIMITED_LOCAL_EVIDENCE
PHASE34D_POST_MERGE_UI_EFFECTS_SANITY_SEED_STATUS: PREPARED_IF_NEEDED
```

Active effects confirmed in Phase 34C: E01, E02, E03 (all CSS-first, decorative-only).
E04: CSS defined, activation deferred — not in scope for Phase 34D unless a separate
activation gate is opened.

Inherited limitations: all 10 carried forward unresolved.
Highest approved readiness: LIMITED_BETA_CANDIDATE.
BETA_READY: not approved. Phase 30C hold: not lifted.

## Sanity constraints

Phase 34D must observe the following constraints:

1. No source, runtime, test, package, or release-note files may be modified in Phase 34D
   unless a hotfix gate (`HOTFIX_UI_EFFECTS`) is opened and separately approved.
2. Phase 34D does not approve BETA_READY or public production readiness.
3. Phase 34D does not lift the Phase 30C Beta Ready hold.
4. Phase 34D does not resolve any inherited limitation.
5. Phase 34D does not approve E04 activation.
6. Phase 34D sanity scope covers E01, E02, E03 only.
7. Phase 34D may not automatically pass on the basis of Phase 34C PASS decision.
8. If a blocking regression is found, Phase 34D must choose `HOTFIX_UI_EFFECTS` or
   `HOLD_EFFECTS_POST_MERGE` rather than issuing a silent pass.

## Required sanity surfaces

If Phase 34D runs, it must verify the following post-merge sanity surfaces:

| Surface | Required observation | Method |
|---|---|---|
| E01 post-merge render | Flashcard answer reveal effect renders after merge to main | Browser observation on merged main build |
| E02 post-merge render | Rating button press feedback renders after merge to main | Browser observation on merged main build |
| E03 post-merge render | Session complete score effect renders after merge to main | Browser observation on merged main build |
| prefers-reduced-motion post-merge | All effects suppressed under `prefers-reduced-motion: reduce` after merge | Browser reduced-motion emulation on merged main build |
| no console/runtime errors post-merge | No new JS errors introduced by merge | Browser console observation on merged main build |
| regression smoke post-merge | Core study session flow (load, reveal, rate, complete) functions correctly after merge | Browser smoke observation on merged main build |
| unit test suite post-merge | All 2603 unit tests pass after merge | `npm run test:unit` run on merged main |

## Decision options

Phase 34D must choose one of the following:

```text
SKIP_POST_MERGE_SANITY_NO_ISSUES
RUN_POST_MERGE_SANITY
HOTFIX_UI_EFFECTS
```

**`SKIP_POST_MERGE_SANITY_NO_ISSUES`** — Use if Phase 34C evidence review was sufficient
and no post-merge issues are identified. Phase 34D is not run; project proceeds directly
to the next higher gate. This is the expected outcome if Phase 34C passes cleanly.

**`RUN_POST_MERGE_SANITY`** — Use if a brief post-merge sanity run is warranted after
Phase 34C merges. Collect observations on the merged main build across all required
sanity surfaces. Issue a sanity pass or flag issues if found.

**`HOTFIX_UI_EFFECTS`** — Use if a regression or unexpected behavior is discovered
post-merge that cannot be accepted. Open a bounded hotfix gate to address the specific
issue. Hotfix scope must be minimal: remove or adjust only the affected CSS block(s).
No broader source changes may be introduced under a `HOTFIX_UI_EFFECTS` gate.

## Forbidden default approvals

Phase 34D must not:
- Pass automatically on the basis of Phase 34C PASS decision.
- Approve BETA_READY.
- Approve public production readiness.
- Lift the Phase 30C Beta Ready hold.
- Describe any inherited limitation as resolved.
- Accept browser evidence that was not collected post-merge on the merged main build.
- Approve E04 activation without a dedicated activation gate.
- Expand sanity scope beyond E01, E02, E03 without a separate gate decision.

## Recommended next step

If Phase 34C passes cleanly and no post-merge regression is anticipated:
→ Choose `SKIP_POST_MERGE_SANITY_NO_ISSUES` and proceed directly to the next higher gate.

If a brief post-merge confirmation is desired before proceeding to Phase 35 or equivalent:
→ Choose `RUN_POST_MERGE_SANITY` and complete the required sanity surfaces above.

If an issue is discovered post-merge:
→ Choose `HOTFIX_UI_EFFECTS` and open a bounded remediation gate.

LIMITED_BETA_CANDIDATE remains the highest approved readiness status in all Phase 34D paths.
BETA_READY is not approved in Phase 34D. Phase 30C hold is not lifted by Phase 34D.
