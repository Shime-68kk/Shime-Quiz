# Phase 14 - FSRS Implementation Scope

## Planning Boundary

This document is a Phase 13D planning artifact for future Phase 14 work. It does not implement FSRS runtime, does not install ts-fsrs, does not change scheduler behavior, does not change storage schema, and does not change Study Room, Dashboard, scoring, mastery, weighted practice, or backup/import runtime.

Phase 14 should be split into small gates. The first runtime step should be adapter and model scaffolding, not a global scheduler replacement.

## Phase 14A - Scheduler Adapter Boundary And Versioned Scaffolding

Phase 14A should create a small scheduler adapter boundary and versioned model scaffolding while preserving the current scheduler as the active default. It should define how current and future scheduler records are identified, read, and summarized without changing the current scheduling algorithm.

Recommended adapter responsibilities:

- `getSchedulerKind(record)` returns the current scheduler type or future FSRS scheduler type.
- `getDueStatus(record, now)` returns a normalized due status.
- `getDueSummary(records, now)` returns aggregate due counts for Dashboard and selection consumers.
- `scheduleReview(record, outcome, context)` delegates to the current scheduler path for current records.
- `rollback(record)` or an equivalent internal operation keeps future migration reversible.

Phase 14A should use planning language for future versioning such as `schedulerVersion` or `schedulerKind`. Current records must continue to preserve their existing review schedule schemaVersion envelope, including `schemaVersion: v2-review-schedule-v1`, when that envelope is present in current storage. This is planning language only and does not implement storage schema changes in Phase 13D.

Phase 14A must not globally convert records, install ts-fsrs, add FSRS Study Room controls, or publicly claim FSRS runtime.

## Phase 14B - FSRS Runtime Prototype Behind Opt-In Or New-Card Path

Phase 14B may introduce a future FSRS runtime prototype only after Phase 14A preserves current scheduler behavior. The prototype should be isolated behind opt-in or new-card behavior.

Candidate future FSRS card fields:

- `due`
- `stability`
- `difficulty`
- `retrievability`
- `scheduledDays` or `scheduled_days`
- `reps`
- `lapses`
- `state`: New, Learning, Review, or Relearning
- `lastReview` or `last_review`
- `schedulerVersion` or `schedulerKind`

Candidate future review-log fields:

- Review timestamp
- Rating: Again, Hard, Good, or Easy
- Prior state and resulting state
- Prior due and resulting due
- Prior stability/difficulty and resulting stability/difficulty when needed
- Scheduled days and elapsed days when needed
- Source session or question id when needed

The FSRS path must not overwrite the current scheduler path. Existing records should remain on the current scheduler unless explicitly opted in or migrated in a later approved phase.

## Phase 14C - Backup, Import, And Rollback Verification

Phase 14C should prove that current-only and mixed scheduler data can be exported, imported, and rolled back safely.

Required behaviors:

- Current-only backups round-trip without data loss.
- Mixed current/FSRS backups preserve scheduler-specific fields.
- Unknown scheduler-specific fields are retained where possible.
- Import does not destructively convert current records.
- Rollback can restore preserved current-scheduler due dates and fields.
- Corrupt or partial FSRS data does not break current scheduler records.

No public claim about existing-card FSRS support should be made until Phase 14C or later validates migration and rollback.

## Phase 14D - Study Room Rating UI If Needed

Phase 14D should add Study Room rating UI only if the FSRS runtime path requires explicit ratings. Any Again, Hard, Good, Easy flow must be tested for current and FSRS records.

Required constraints:

- Current scheduler Study Room completion remains unchanged for non-FSRS records.
- Keyboard and mobile behavior remain usable.
- Four-rating UI appears only where the scheduler path expects it.
- Rating labels do not imply AI, IRT, Glicko-2, or semantic selection.

## Phase 14E - Dashboard And Due-Count Compatibility If Needed

Phase 14E should verify Dashboard behavior with current-only and mixed scheduler states. Dashboard should read a normalized due summary from the adapter rather than assuming a single scheduler storage shape.

Required checks:

- Current scheduler due counts are unchanged.
- Future FSRS due dates count correctly when present.
- Missing or unknown scheduler metadata does not crash Dashboard.
- Mixed scheduler records do not double-count or disappear.

## Phase 14F - Weighted Practice Integration If Needed

Phase 14F should integrate FSRS retrievability into weighted practice only after the scheduler path is stable. FSRS retrievability is one future input, not the whole learning brain.

Weighted practice should continue to consider:

- Due status
- Weak items
- Low correct rate
- Wrong count
- Unpracticed or bookmarked items
- Mastery and progress signals
- Future FSRS retrievability where available

Selection must remain local-first and explainable. It must not become an AI-based selection engine unless a later approved phase explicitly implements and validates that behavior.

## Files Phase 14 May Need To Evaluate

Future runtime phases may need to evaluate, but not necessarily change, these areas:

- Current scheduler and storage modules
- Study Room completion and review-update paths
- Dashboard due summary consumers
- Weighted practice selection modules
- Backup/export/import payload handling
- Unit tests and E2E smoke coverage

Phase 13D changes none of those runtime files.

## Out Of Scope Until Separately Approved

These are not part of the Phase 14A entry unless a later prompt explicitly expands scope:

- Global scheduler replacement
- Automatic conversion of all existing records
- ts-fsrs dependency installation without dependency review
- Glicko-2 or IRT runtime
- Transformers.js, semantic search, local AI, or built-in AI quiz generation
- PowerSync, ElectricSQL, automatic sync, cloud/account sync, or hidden upload
- IndexedDB runtime migration
- Encryption implementation
- OCR, BYOK/API key support, or external AI/API integration
- Production/security/accessibility/performance certification claims

## Phase 14 Start Checklist

Do not start runtime implementation until:

- The adapter boundary is selected.
- `schedulerVersion` or `schedulerKind` strategy is selected.
- Current scheduler preservation plan is ready.
- Backup/export/import compatibility plan is ready.
- Rollback rules are defined.
- Local data migration risk is understood.
- Storage capacity risk is understood.
- Public claim boundaries are ready.
- Unit, static-validator, and CI validation plan is ready.
- Opt-in or new-card first strategy is selected.
