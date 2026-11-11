# Phase 4 — Scheduler Kernel v2

Status: implemented with legacy-compatible persistence.

## Non-negotiable invariants

1. SM-2 is the stable default and cannot be unregistered or replaced.
2. Every production review is scheduled through `scheduleRecordWithKernel()`.
3. A non-SM-2 adapter always advances an SM-2 shadow snapshot in parallel.
4. Missing, unplugged, malformed, or throwing adapters fall back atomically to SM-2.
5. Algorithm-specific state is stored inside a versioned `schedulerState` envelope.
6. Legacy FSRS fields remain projected during the compatibility window.
7. Optional behavior such as retrievability is accessed through declared capabilities.
8. New adapters must pass contract validation, state migration, output safety, and fault tests before registration.

## Runtime path

```text
study result
  -> reviewScheduleStorage
  -> reviewSchedulerAdapter compatibility facade
  -> Scheduler Kernel v2
  -> scheduler registry
      -> SM-2 stable
      -> FSRS beta
      -> future registered adapter
  -> generic schedule record + SM-2 fallback snapshot
  -> local persistence
```

## Generic persisted fields

- `schedulerId`
- `schedulerAdapterVersion`
- `schedulerStateSchemaVersion`
- `schedulerState`
- `fallbackSnapshot`
- `schedulerFallbackReason`
- `schedulerFallbackAt`
- `legacySchedulerId` when an installed adapter disappears

Common scheduling fields such as `dueAt`, `intervalDays`, `lastReviewedAt`, counters, and item ownership remain algorithm-neutral.

## Adding a future algorithm

A new adapter supplies the common contract functions, `stateSchemaVersion`, `migrateState()`, a decision-code namespace, and an optional capability list. Registering the adapter makes the kernel able to schedule records bearing that `schedulerId`; StudyRoom, review storage, backup, and due selection do not import the algorithm.

## Compatibility policy

Old SM-2 records are lazily upgraded on their next review. Old FSRS records are read through the legacy payload bridge and written back with both the generic envelope and legacy projection. No bulk rewrite runs at application boot.
