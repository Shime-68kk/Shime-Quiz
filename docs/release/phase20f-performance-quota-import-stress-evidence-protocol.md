# Phase 20F — Performance / Quota / Import Stress Evidence Protocol

## Purpose

This document defines the evidence protocol for Phase 20F performance, quota, and
import stress result collection. It pairs with
`docs/testing/phase20f-performance-quota-import-stress-results-log.md`.

Phase 20F creates a stress-test results log structure and evidence protocol. It does
not execute stress testing by itself, does not collect telemetry, does not add
analytics, and does not add runtime instrumentation.

```text
PERFORMANCE_STRESS_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY
LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD
```

## Evidence status

```text
PERFORMANCE_STRESS_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY
```

Evidence collected: none.

No performance/quota/import stress results have been recorded yet. The Phase 20D HOLD
decision remains active.

## Minimum evidence needed before Phase 20G

Before Phase 20G can evaluate beta-readiness evidence, the repo needs recorded
Phase 20E real user testing results and recorded Phase 20F stress results covering:

- small data set, medium data set, and large data set.
- app startup, Dashboard today plan, and Study Room session.
- due cards / review schedule count.
- JSON import, CSV import, text/markdown import, and EduGen Draft Workshop import
  boundary.
- storage quota estimate and large import warning.
- backup before risky action, restore from backup, and repeated backup/restore
  rehearsal.
- manual export/import transfer.
- mobile viewport and PWA/service-worker cache boundary.
- FSRS experimental/off/default boundary.
- beta-ai naming absence.
- backup is not sync, restore may overwrite current data, no account/cloud/sync/backend,
  and no built-in AI/OCR/AI generation.

## Test environment boundary

Testing is manual and local. Browser developer tools may be used for observation, but
no telemetry is collected and no analytics are added. Testers should use
generated/duplicate/test data where possible. A backup must be created before risky
import, restore, repeated backup/restore rehearsal, or manual transfer testing.

## Data set definitions

- small data set: 10-20 generated or duplicate cards, preferably simple text.
- medium data set: 50-100 generated or duplicate cards, including JSON import, CSV
  import, and text/markdown import coverage where possible.
- large data set: 200-500 generated or duplicate cards, intended to exercise app
  startup, storage quota estimate, large import warning, backup/restore, and
  mobile/PWA behavior.

## Performance protocol

Record app startup, Dashboard today plan, and Study Room session responsiveness for
each relevant data size. Use subjective labels only. Do not claim benchmark precision
unless a later approved protocol adds measurement tooling.

## Storage quota protocol

Record storage quota estimate before and after import. Record whether a large import
warning appears for risky import sizes and whether the warning is clear. Stop if
storage quota warning is unclear or missing for risky import sizes.

## Import protocol

Record JSON import, CSV import, text/markdown import, and EduGen Draft Workshop import
boundary behavior. Verify card counts and whether any confusing or unsafe data was
created. Stop if import creates confusing or unsafe data.

## Backup and restore protocol

Create backup before risky action. Record restore from backup and repeated
backup/restore rehearsal results. Confirm backup is not sync. Confirm restore may
overwrite current data. Stop if backup/restore results are unclear.

## Manual transfer protocol

Record manual export/import transfer from one browser profile or device to another.
Confirm manual transfer is not sync and that there is no account/cloud/sync/backend
path involved.

## Mobile/PWA protocol

Record mobile viewport behavior and PWA/service-worker cache boundary behavior. Check
whether cache state, reloads, or PWA installation create confusing data expectations.
Stop if PWA/cache behavior is confusing.

## FSRS and review schedule protocol

Record FSRS experimental/off/default boundary behavior and due cards / review schedule
count before and after import, restore, and manual transfer. Stop if due cards/review
schedule counts look inconsistent.

## Stop conditions

Stop and record hold evidence if:

- import creates confusing or unsafe data.
- backup/restore results are unclear.
- due cards / review schedule count looks inconsistent.
- storage quota warning is unclear or missing for risky import sizes.
- PWA/cache behavior is confusing.
- beta-ai or AI capability implication appears in public copy.
- a tester expects backup to be sync, restore not to overwrite current data, or an
  account/cloud/sync/backend path to exist.
- a tester expects built-in AI/OCR/AI generation.

## Evidence quality rubric

Passing evidence must be specific enough for another maintainer to understand the
device/browser, data set size, scenario, expected count, observed count, and result.
Hold evidence must preserve the exact risky behavior or confusing copy without
recording private study content.

## What counts as passing evidence

Passing evidence means an executed scenario was recorded with generated or duplicate
data, backup before risky action was confirmed where required, no stop condition was
triggered, and the observed result matched the expected result.

## What counts as hold evidence

Hold evidence means an executed scenario triggered a stop condition, produced unclear
data safety behavior, produced inconsistent due cards / review schedule count, missed
a storage quota estimate or large import warning, confused PWA/service-worker cache
behavior, or showed beta-ai naming absence was not preserved.

## Claim boundaries

Phase 20F creates a stress-test results log structure and evidence protocol. It does
not claim stress testing is complete unless actual manual/user-provided results are
recorded. It does not claim beta readiness. It does not add no account/cloud/sync/backend
features and does not add no built-in AI/OCR/AI generation features; those phrases are
boundaries, not shipped capability claims.

## Phase 20E relationship

Phase 20E created the real user testing results log. Phase 20F complements Phase 20E
by adding a performance/quota/import stress evidence path. Phase 20G needs both
Phase 20E and Phase 20F evidence before reconsidering the Phase 20D HOLD decision.

## Phase 20G readiness gate

Phase 20G should not evaluate readiness until this protocol has corresponding
executed results in the Phase 20F results log and Phase 20E has recorded real user
testing evidence. Until then, `LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD` remains active.
