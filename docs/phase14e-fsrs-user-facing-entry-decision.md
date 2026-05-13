# Phase 14E - FSRS User-Facing Entry Decision

## Scope

Phase 14E is docs/static-validator/CI only. It locks the user-facing FSRS entry decision before any settings, Study Room, Dashboard, production routing, storage, backup/import/export, or migration work begins.

Phase 14E does not change runtime behavior. It does not change UI, package files, dependencies, source files, tests, storage schema, backup/import/export runtime, Study Room behavior, Dashboard behavior, scoring, mastery, weighted practice, recommendation, or scheduler runtime behavior.

Phase 14E does not make FSRS user-facing. It does not enable production FSRS scheduling. It does not add Again/Hard/Good/Easy buttons. It does not add a settings toggle. It does not migrate existing review schedule records.

## Current Foundation

Phases 14A through 14D established a narrow technical foundation:

- Phase 14A added the scheduler adapter boundary while preserving the current SM-2-like heuristic scheduler as production behavior.
- Phase 14B added exact-pinned `ts-fsrs` and an internal FSRS wrapper test prototype without production routing.
- Phase 14C added FSRS-shaped persistence and backup compatibility harness coverage without changing backup/import/export runtime claims.
- Phase 14D added developer/test-only FSRS adapter routing behind the explicit `context.enableFsrsTestRoute === true` gate.

Phase 14D's `correct -> Good` and `wrong` or `unanswered -> Again` mapping is only test wiring for the developer-gated route. It is not production policy and must not be treated as the user-facing FSRS rating model.

## Two-Step Evaluation

The Phase 14E decision is that future user-facing FSRS must use Two-Step Evaluation:

1. Objective correctness: the user answers the quiz question and Shime records whether the answer is correct, wrong, or unanswered.
2. Subjective memory rating: after the answer result is known, a future FSRS-kind card records a memory-effort rating for FSRS scheduling only.

Objective correctness feeds scoring, mastery, progress, correct streak, wrong count, repetition count, and current review analytics. Subjective memory rating feeds FSRS only. These two signals must remain separate because a quiz answer can be correct by guessing, and a guessed answer should not automatically produce a strong memory signal.

A future production flow must not auto-map `correct -> Good` or `wrong -> Again` as a complete production rating model. The Phase 14D binary mapping remains developer/test-only wiring.

## Wrong And Unanswered Policy

Future wrong or unanswered answer results must auto-lock the FSRS rating to `Again`.

For a wrong or unanswered result, the future Study Room flow must not offer Hard, Good, or Easy. The answer can still be shown for learning, but the FSRS review rating for that failed recall event is `Again`.

This protects the FSRS difficulty, stability, and retrievability state from subjective inflation after a failed answer. A user who failed the item does not have a reliable basis to rate the recall as Hard, Good, or Easy.

## Correct Answer Policy

Future correct answer results may show a memory-effort selector with Hard, Good, and Easy only.

Again is not offered after a correct answer because the objective answer succeeded. Correctness remains the signal for scoring and mastery; Hard, Good, or Easy is the separate subjective memory signal for FSRS scheduling.

This means future Study Room work must implement a split flow: answer first, then rate memory effort only when a future FSRS-kind card and eligible result require it.

## Experimental Toggle Policy

Future user-facing FSRS must be behind an experimental toggle that defaults OFF. The toggle is future work, not implemented in Phase 14E.

The toggle must be described as experimental until user-facing runtime behavior, Study Room flow, Dashboard mixed scheduler behavior, backup/import/export claims, and rollback behavior are implemented and tested in later phases.

Phase 14E does not add the toggle and does not expose any user-facing FSRS route.

## New-Card-Only Policy

Future FSRS entry must be new-card-only at first. When a future experimental FSRS toggle is ON, FSRS may apply only to new cards/items that are first scheduled after the toggle is enabled.

Existing SM-2-like heuristic records must never be automatically migrated. Missing `schedulerKind` stays on the current SM-2-like heuristic scheduler by read-time defaulting. Existing records with no `schedulerKind` continue to default to the current SM-2-like heuristic scheduler. Existing records with current scheduler metadata remain current scheduler records.

The future toggle must not backfill `schedulerKind`, `schedulerVersion`, `fsrsPayload`, or FSRS review logs onto existing records. It must not re-process older localStorage records just because a setting changed.

## Migration Policy

Automatic migration from current SM-2-like records to FSRS remains prohibited.

The current `easeFactor` is an SM-2-like interval multiplier, while FSRS `difficulty` is a different mathematical memory-model state. It is not a reliable scaling conversion. Existing aggregate fields such as `intervalDays`, `repetitionCount`, `wrongCount`, `dueAt`, and `lastReviewedAt` also cannot reconstruct historical FSRS review logs, stability, difficulty, or retrievability.

Any future migration seed strategy must be a separate approved phase with its own risk register, rollback plan, unit tests, and backup/import/export validation. It must not be bundled into initial user-facing FSRS entry.

## Backup Import Export Policy

Phase 14C validated preservation of future-shaped FSRS fields through normalization and backup round trips. That is a compatibility harness, not a public user-facing FSRS backup/import/export claim.

Future phases must keep backup/export/import compatibility ahead of public claims. Until later validation expands the claim, Shime may only say that Phase 14C preserves the fields needed for future FSRS experiments.

## Future Phase Split

Future user-facing FSRS work should be split into smaller phases instead of one broad runtime merge:

- Phase 14F: experimental settings toggle and new-card-only enrollment only. No Study Room rating UI, Dashboard mixed due-count UI, or backup/import/export claim expansion.
- Phase 14G: Study Room Two-Step Evaluation UI for FSRS-kind cards, including wrong/unanswered auto-lock to Again and correct-answer Hard/Good/Easy selection.
- Phase 14H: Dashboard mixed scheduler due-count handling after scheduler kinds can coexist in user data.
- Phase 14I: backup/import/export user-facing claim hardening if the Phase 14C preservation harness needs additional coverage for public FSRS use.

The exact future labels can be adjusted, but the scope separation is the decision: do not combine settings, Study Room UI, Dashboard UI, production routing, migration, and backup claims into one phase.

## Claim Boundaries

After Phase 14E, the project may claim:

- The Two-Step Evaluation policy is documented.
- Wrong/unanswered future FSRS reviews must auto-lock to Again.
- Correct future FSRS reviews may use Hard/Good/Easy only.
- Future FSRS user-facing entry is planned as experimental, default OFF, and new-card-only.
- Existing SM-2-like heuristic records are not automatically migrated.
- A static validator guards the Phase 14E docs/static-validator/CI scope.

After Phase 14E, the project must not claim:

- FSRS is user-facing, because that is not implemented.
- Production FSRS scheduling is enabled, because that is not implemented.
- Study Room supports Again/Hard/Good/Easy rating UI, because that is not implemented.
- Dashboard supports mixed scheduler due counts, because that is not implemented.
- Existing SM-2 records are migrated, because automatic migration is prohibited.
- Backup/import/export fully supports public user-facing FSRS, because Phase 14C only preserves future-shaped data.
- Glicko, IRT, AI, semantic search, sync, cloud accounts, IndexedDB migration, encryption, OCR, or production/security/accessibility/performance certification exists because none of those claims are implemented by Phase 14E.

## Phase 14E Checklist

- Decision document added.
- Static validator added.
- CI workflow registers the validator.
- No runtime files changed.
- No UI files changed.
- No package or dependency files changed.
- No source or test files changed.
- No storage, backup/import/export, scoring, mastery, weighted practice, recommendation, or scheduler runtime behavior changed.
