# Phase 13D - FSRS Entry Decision

## Purpose And Scope

Phase 13D is a docs/static-validator/CI-only closure decision for the Phase 13 review-engine planning track. It decides whether Shime Quiz / ShimeChamhoc v2 is ready to begin a narrow Phase 14 FSRS runtime entry, and it records the constraints that must govern that entry.

This phase adds no runtime implementation. It does not change Study Room, Dashboard, storage schema, scheduler behavior, scoring, SRT, mastery, recommendation, backup/import runtime, package files, dependencies, or release packaging. FSRS is not implemented in Phase 13D, and there is no ts-fsrs dependency.

## Evidence From Phase 13

Phase 13A established the current scheduler baseline:

- The current scheduler is browser-local and SM-2-like / heuristic.
- Current review records include fields such as `easeFactor`, `intervalDays`, `repetitionCount`, `correctStreak`, `wrongCount`, `dueAt`, and `lastReviewedAt`.
- Current schedule records are stored in browser-local schedule payloads such as `quizReviewScheduleV1` and `shimeV2ReviewScheduleV1`.
- Study Room, Dashboard, weighted practice selection, mastery, and progress signals depend on the current data model and due-state behavior.

Phase 13B established the FSRS migration architecture:

- Shime should not replace the current scheduler globally in one step.
- Future FSRS should sit behind a constrained local scheduler adapter boundary.
- Future records need `schedulerVersion` or `schedulerKind`.
- Dual scheduler support is required while current scheduler records and future FSRS records coexist.
- Opt-in or new-card FSRS is safer than automatic conversion of existing records.
- Rollback and backup/export/import compatibility must be defined before any runtime migration.

Phase 13C placed FSRS into a broader local adaptive learning roadmap:

- FSRS should estimate memory timing; it should not replace the whole learning brain.
- Weighted practice selection should remain explainable and may later combine due state, weak items, mastery signals, unpracticed items, and FSRS retrievability.
- Glicko-2, IRT, local AI, semantic assistance, optional sync, and storage evolution remain future research only.
- Browser-local and local-first behavior remains the default identity.

## Entry Decision

Phase 13D decision: Shime is ready to enter Phase 14 only through a narrow, reversible FSRS entry path.

The approved entry is not a global FSRS scheduler replacement. It is a Phase 14A adapter boundary and versioned model scaffolding step that preserves the current scheduler, keeps current records intact, and prepares a later opt-in or new-card FSRS path.

The current scheduler remains the source of truth for existing records unless a later runtime phase explicitly implements and validates migration. No destructive automatic conversion is allowed.

## Why FSRS Is The Preferred Near-Term Upgrade

FSRS is the preferred near-term scheduler upgrade because it models memory state with concepts such as difficulty, stability, retrievability, review state, and review ratings like Again, Hard, Good, and Easy. That model is more appropriate for future spaced-repetition quality than tuning the current SM-2-like heuristic constants.

FSRS should be treated as a distinct future scheduler model, not as a small adjustment to the current scheduler. The future adapter must translate scheduler operations for consumers without forcing Study Room, Dashboard, or weighted practice selection to understand every scheduler-specific field.

## Algorithm And Data Decision

The current scheduler fields can help seed conservative future FSRS state, but they cannot reliably reconstruct FSRS memory state. Binary correct/wrong history and aggregate fields do not contain enough information to recreate four-rating FSRS review logs.

The `easeFactor` to FSRS `difficulty` mapping is unreliable because SM-2-like ease and FSRS difficulty are different mathematical states, not a simple scaling conversion. `intervalDays` and `repetitionCount` can inform a seed, but they cannot prove prior stability, retrievability, or state-transition history.

Future Phase 14 work must therefore:

- Preserve current schedule records.
- Mark any seeded FSRS card state as approximate.
- Avoid replaying invented review logs.
- Avoid public claims that existing local records have been accurately converted to FSRS unless a later phase implements and validates that behavior.

## Phase 14A Entry Scope

Phase 14A should focus on adapter and model scaffolding only:

- Define a local scheduler adapter boundary.
- Preserve the current scheduler implementation as the active default path.
- Expose normalized due-state reads for Dashboard and weighted practice selection.
- Introduce a planned `schedulerVersion` or `schedulerKind` strategy for future records.
- Keep backup/export/import compatibility in view before adding migration.
- Keep rollback requirements explicit.

Phase 14A should not add a ts-fsrs dependency unless a later approved implementation task explicitly reviews and accepts that dependency. Phase 14A should not add Again / Hard / Good / Easy Study Room buttons unless the phase is explicitly expanded and tested for UI behavior.

## Required Gates Before FSRS Runtime

Phase 14B or later may introduce FSRS runtime only after these gates are satisfied:

- Adapter boundary exists and preserves current scheduler behavior.
- Current scheduler regression tests pass.
- `schedulerVersion` or `schedulerKind` strategy is documented and tested.
- Backup/export/import compatibility plan is ready.
- Rollback path preserves current due schedules.
- Opt-in or new-card strategy is selected.
- Storage capacity risk is understood.
- User-facing claim boundaries are ready.
- CI build, unit tests, and static validators pass.

## Rollback And Backup Compatibility

Rollback must be designed before migration. Future FSRS records must not overwrite the only copy of current schedule fields. Existing due dates and current-scheduler metadata must remain recoverable for non-migrated records and for migrated records until a later phase proves rollback is safe.

Backup/export/import compatibility must remain conservative. Current-only backups must continue to restore current records. Future mixed scheduler backups must preserve unknown scheduler-specific fields where possible and must not perform destructive import-time conversion.

## Local-First Boundary

Phase 14 must preserve Shime's local-first and browser-local identity. FSRS entry does not require account sync, cloud sync, automatic sync, PowerSync, ElectricSQL, external AI/API calls, BYOK/API key support, OCR, encryption, or hidden uploads.

Manual backup/export/import remains the current safe portability path unless a separately approved future phase changes that boundary.

## Public Claim Boundary

After Phase 13D, Shime may claim:

- The current scheduler has been audited as SM-2-like / heuristic.
- FSRS migration architecture has been planned.
- A local adaptive learning roadmap has been documented.
- Phase 14 has a recommended narrow FSRS entry path.

After Phase 13D, Shime must not claim:

- FSRS runtime is available.
- ts-fsrs is installed.
- Current records have been migrated to FSRS.
- Glicko-2, IRT, local AI, semantic search, sync, cloud sync, IndexedDB migration, encryption, OCR, or external AI/API integration exists.
- Production, security, accessibility, or performance certification has been completed.

## Decision Summary

Phase 14 should begin only with the smallest adapter/data/rollback-safe step. The recommended sequence is Phase 14A adapter boundary and versioned model scaffolding first, then an opt-in or new-card FSRS runtime prototype in a later sub-phase after rollback and backup/export/import rules are concrete.
