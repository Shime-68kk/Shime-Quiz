# Phase 13C - Local Adaptive Learning Roadmap

Phase 13C places the Phase 13B FSRS migration architecture into a broader local adaptive learning roadmap for Shime Quiz / ShimeChamhoc v2. It explains how Shime's learning brain can evolve while preserving local-first, browser-local behavior and strict public claim boundaries.

## 1. Purpose and Scope

Phase 13C is docs/static-validator/CI-only. It changes no runtime behavior and adds no dependency.

This phase does not implement FSRS, Glicko-2, IRT/adaptive rating, Transformers.js, local AI, semantic search, PowerSync, ElectricSQL, automatic sync, cloud/account sync, IndexedDB runtime migration, encryption, built-in AI quiz generation, external AI/API integration, API key/BYOK support, OCR, or production/security/accessibility/performance certification.

Phase 13C is a roadmap and boundary phase. It prepares future decision-making for Phase 14 and later, but it does not change Study Room, Dashboard, review scheduling, scoring, SRT, mastery, recommendation, weighted practice, backup/export/import, storage schema, package files, or release artifacts.

## 2. Current Implemented Learning Brain

The current implemented learning brain is local, browser-local, and heuristic. Phase 13A documents these implemented layers:

- SM-2-like / heuristic review scheduling in `src/quiz/spacedRepetition.js` and `src/state/reviewScheduleStorage.js`.
- Browser-local schedule records under `quizReviewScheduleV1` and `shimeV2ReviewScheduleV1`.
- Current review fields such as `easeFactor`, `intervalDays`, `repetitionCount`, `correctStreak`, `wrongCount`, `dueAt`, and `lastReviewedAt`.
- Weighted practice selection in `src/learning/weightedPracticeSelector.js` and `src/quiz/weightedSelection.js`.
- Mastery/progress signals in `src/quiz/mastery.js` and `src/analytics/masteryModel.js`.
- Study Room completion that saves local study history and then updates the current review schedule.
- Dashboard panels that read current local history, schedule, mastery, smart practice, and review summary data.
- Manual backup/export/import as the current safe data portability path.

The implemented scheduler is not FSRS. Weighted practice is not AI-based selection. Mastery is a local heuristic signal, not a certified learner model. Dashboard and Study Room depend on the current data shape and should not be disrupted by roadmap-only work.

## 3. Near-Term Future FSRS Layer

FSRS is the preferred near-term review-engine upgrade because it can improve spaced repetition quality while preserving Shime's local-first/browser-local identity. In Phase 13C, FSRS is future/planned only.

Phase 13B recommends a future FSRS layer with:

- A local scheduler adapter boundary.
- `schedulerVersion` or `schedulerKind` on future scheduler records.
- Dual scheduler support, where current scheduler records and future FSRS records can coexist.
- Opt-in or new-card FSRS first.
- The current scheduler preserved for existing records.
- Rollback defined before runtime migration.
- Backup/export/import compatibility preserved.
- No destructive automatic conversion of existing local data.
- No public FSRS claim before runtime implementation and verification.

FSRS estimates card memory timing through difficulty, stability, retrievability, due date, and review ratings such as Again, Hard, Good, and Easy. It is not just the current SM-2-like scheduler with different constants. A future Phase 14 runtime must treat it as a separate scheduler model behind an adapter, not as a global replacement of current records.

## 4. Adaptive Selection Layer

FSRS should not be treated as the whole learning brain. FSRS estimates when a card should be reviewed based on memory state. Weighted practice selection decides what to practice in a session by combining multiple local signals.

The future selection layer can remain explainable by combining:

- Due status from the current scheduler or future FSRS adapter.
- Weak items from mastery/progress signals.
- Wrong-count and low-correct-rate signals.
- Unpracticed items.
- Bookmarks or learner-selected focus.
- Future FSRS retrievability when available.

Weighted selection should not be replaced by FSRS alone. FSRS retrievability can become one input to selection, but it should not erase local mastery, unpracticed-item, weak-topic, or user-intent signals. Any FSRS-weighted selection integration is separate from Phase 13C and should be planned only after Phase 14 adapter/data/rollback gates are proven.

## 5. Future Learner/Item Modeling Research

Glicko-2 and IRT are future research references only. They are not implemented, not installed, and not publicly claimable.

Potential research use cases:

- Estimate item difficulty from aggregate answer patterns.
- Estimate learner ability or confidence for quiz calibration.
- Detect questions that are too easy, too hard, ambiguous, or noisy.
- Support analytics that explain where difficulty calibration is uncertain.

These models must remain separate from FSRS scheduler runtime. FSRS controls memory-timing decisions; Glicko-2 or IRT-style research would concern item difficulty and learner ability. Mixing them into scoring, mastery, recommendation, or scheduler behavior without a separate phase would make results hard to validate and unsafe to claim.

Before any Glicko-2 or IRT public claim, a later phase would need:

- A defined model objective and local data requirements.
- Evidence that current binary/ternary history is sufficient or a plan for collecting better signals.
- Unit tests and regression tests showing scoring and mastery are not accidentally changed.
- Clear UI copy that avoids overclaiming adaptive AI or certified ability measurement.

## 6. Future Local Semantic Assistance Research

Local AI, Transformers.js, and semantic search are future research only. Phase 13C adds no Transformers.js dependency and no AI runtime.

Potential local semantic assistance could include:

- Local semantic grouping of imported content.
- Duplicate or near-duplicate item detection.
- Hint or explanation support generated or selected locally.
- Review content clustering by concept.
- Topic cleanup suggestions.

Privacy and local-first constraints are mandatory. Any future semantic assistance should run locally by default, avoid hidden upload, avoid external AI/API calls unless a separate explicit phase adds them, and preserve manual review before changing user content.

Phase 13C does not implement built-in AI generation, external AI/API integration, API key/BYOK support, semantic search runtime, OCR, or Transformers.js/local AI.

## 7. Optional Sync/Storage Research

PowerSync and ElectricSQL are optional sync/storage research references only. They are infrastructure possibilities, not learning logic.

Any future sync track must preserve these boundaries:

- Browser-local remains the default.
- Manual backup/export/import remains the current safe portability path.
- Sync must be user-controlled and opt-in.
- No hidden uploads.
- No automatic sync claim.
- No cloud/account sync claim.
- No account requirement for core study behavior.
- No PowerSync or ElectricSQL implementation in Phase 13C.

IndexedDB is also future/planned storage research only. It may become relevant if review logs, semantic indexes, or larger libraries exceed practical localStorage limits, but Phase 13C does not implement IndexedDB runtime migration or storage schema changes.

## 8. Roadmap Ordering

The roadmap should avoid mixing all intelligence ideas into one runtime phase.

Recommended ordering:

1. Phase 14 should focus on a small FSRS runtime entry only after adapter, data model, backup, rollback, and current-scheduler preservation gates are clear.
2. Phase 14 should start with adapter and model scaffolding, then opt-in/new-card FSRS, then backup/rollback validation, and only then Study Room, Dashboard, or weighted practice integration if needed.
3. Phase 15+ can separately evaluate adaptive selection refinement, Glicko-2/IRT research, local semantic assistance, optional sync/storage research, and analytics improvements.
4. Each future intelligence track needs its own validation, public claim gate, and rollback story.

This ordering keeps Phase 14 narrow and reduces the risk of changing scheduler, selection, scoring, storage, and UI behavior at the same time.

## 9. Claim Boundary Summary

Safe claims after Phase 13C:

- Shime currently has a browser-local SM-2-like / heuristic scheduler.
- Shime currently has weighted local practice selection.
- Shime currently has local mastery/progress signals.
- Shime has a Phase 13C local adaptive learning roadmap.
- FSRS, Glicko-2, IRT, local AI, semantic assistance, optional sync, and storage evolution are future/planned or research topics only.
- Phase 14 should begin with small FSRS adapter/data model scaffolding before runtime rollout.

Forbidden claims after Phase 13C:

- FSRS is implemented.
- `ts-fsrs` is installed.
- Glicko-2 or IRT/adaptive rating is implemented.
- Transformers.js/local AI or semantic search is implemented.
- PowerSync, ElectricSQL, automatic sync, or cloud/account sync is implemented.
- IndexedDB runtime migration is implemented.
- Encryption, built-in AI quiz generation, external AI/API integration, API key/BYOK support, or OCR is implemented.
- Phase 13C changes runtime behavior, storage schema, scheduler behavior, scoring, SRT, mastery, recommendation, weighted practice, Study Room, Dashboard, package files, dependencies, or release execution.
