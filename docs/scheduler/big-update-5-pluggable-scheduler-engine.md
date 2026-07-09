# BIG-UPDATE-5 Pluggable Scheduler Engine

Status: BIG_UPDATE_5_SCHEDULER_ENGINE_DEFINED

## Current Architecture Audit

- Stable scheduling remains the current SM2-like heuristic in `src/state/reviewScheduleStorage.js`.
- The existing adapter boundary is `src/quiz/reviewSchedulerAdapter.js`; it recognizes current records and FSRS-family records.
- Study sessions persist item results through study history, then `updateReviewScheduleFromHistoryRecord()` updates review schedule records locally.
- Due summaries are computed from local schedule records in `src/state/reviewScheduleStorage.js` and `src/quiz/reviewSchedulerAdapter.js`.
- FSRS beta logic already exists in `src/quiz/fsrsWrapper.js` and is guarded by settings in `src/state/settingsStorage.js`.
- Backup/restore already preserves scheduler metadata fields on review records, including `schedulerKind`, `schedulerVersion`, `fsrsPayload`, and capped `fsrsReviewLogs`.

## Added Scheduler Contract

`src/scheduler/schedulerAdapterContract.js` defines a shared adapter shape:

- `schedulerId`
- `schedulerVersion`
- `stabilityLevel`
- `privacyClass`
- `supportsRollback`
- `computeNextReview()`
- `computeDueCards()`
- `summarizeWorkload()`
- `validateInput()`
- `explainDecision()`

The safe input model uses local derived fields only: card id, intervals, repetition count, ease factor, review rating, elapsed days, compact history summary, and scheduler state. It does not require prompt, question, answer, explanation, imported document text, source metadata, settings, or raw review logs.

## SM2 Default

`src/scheduler/sm2SchedulerAdapter.js` wraps the existing SM2 behavior without replacing it. SM2 remains the stable default scheduler and supports rollback.

## FSRS Beta

`src/scheduler/fsrsBetaSchedulerAdapter.js` defines an FSRS beta wrapper for preview/evidence work. FSRS is beta, opt-in only, and cannot become the default in this phase. `src/scheduler/fsrsReadinessGate.js` always returns `fsrsCanBeDefault: false`.

## Registry

`src/scheduler/schedulerRegistry.js` registers SM2 and FSRS beta. Unknown or invalid scheduler preferences fall back to SM2.

## Privacy and Local-First Boundary

This phase adds no cloud, AI, external service, backend, hardware transport, network transport, or irreversible migration. Scheduler outputs use safe decision codes and derived buckets only.

## Default Approval

This phase does not approve FSRS as the default. The release posture is: keep SM2 default, allow FSRS beta evidence and preview paths only when explicitly gated.
