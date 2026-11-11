# Phase 3 — FSRS Production Core

Status: implemented and production-build verified.

## Outcome

- Uses `ts-fsrs` 5.4.1 with the FSRS-6 parameter set.
- Runs real FSRS scheduling from the first eligible review when both rollout gates are enabled.
- Resolves memory ratings against the real study-session `createdAt` timestamp.
- Falls back to objective two-button semantics when no optional memory rating exists: correct is `Good`; wrong or unanswered is `Again`.
- Applies desired retention and maximum interval settings to the runtime scheduler.
- Persists the effective scheduler configuration with each FSRS card so future reviews are reproducible.
- Enforces maximum interval as a strict application cap.
- Replaces the former beta interval heuristic with the real `ts-fsrs` engine.
- Orders comparable due FSRS cards by current retrievability while retaining overdue ordering for mixed FSRS/SM-2 queues.
- Keeps malformed legacy metadata non-blocking and preserves the SM-2 rollback path.

## Rollout safety

FSRS remains off by default. Active scheduling requires both the experimental enrollment gate and the internal active-scheduling gate. Existing records are not bulk-migrated or rescheduled automatically.

## Verification

- FSRS and mixed-scheduler suite: 425 tests passed.
- Full unit suite: 3,574 tests passed across 292 files.
- 500-review deterministic stress sequence passed.
- Production Vite build passed.

## Next data-driven phase

After enough real review logs are collected, add per-user parameter optimization and an explicit reschedule preview. Optimization must be evaluated against held-out review history before any schedule rewrite is offered.
