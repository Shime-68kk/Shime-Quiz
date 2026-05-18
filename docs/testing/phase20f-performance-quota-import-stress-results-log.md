# Phase 20F — Performance / Quota / Import Stress Results Log

## Purpose

This document is the Phase 20F performance, quota, and import stress results log for
Shime Quiz / ShimeChamhoc v2. Phase 20F creates a stress-test results log structure
and a protocol for recording evidence from the Phase 20C plan. It does not implement
runtime code, stress fixtures, telemetry, analytics, UI behavior, storage behavior,
backup/export/restore behavior, import parser behavior, FSRS behavior, sync, cloud,
accounts, auth, or backend features.

Phase 20F does not claim stress testing is complete unless actual manual or
user-provided results are recorded in the result sections below.

```text
PERFORMANCE_STRESS_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY
LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD
```

## Status

```text
PERFORMANCE_STRESS_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY
```

Stress results recorded: 0.

No performance/quota/import stress session has been completed in this log yet. All
result sections are templates.

No telemetry is collected. No analytics are added. No runtime instrumentation is added.

## Relationship to Phase 20C

Phase 20C established:

```text
PERFORMANCE_STRESS_DECISION: PLAN_ONLY_NO_RUNTIME_STRESS_FIXTURES
```

Phase 20C defined the performance/quota/import stress-test plan. Phase 20F provides
the structured place to record results from that plan. Phase 20F does not replace the
Phase 20C ADR or execution guide, and it does not add stress fixtures.

## Relationship to Phase 20D HOLD

Phase 20D established:

```text
LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD
```

Phase 20D held because real user testing evidence and performance/quota/import
stress-test evidence were missing. Phase 20F creates the stress results log template
that Phase 20D identified as missing. The HOLD remains active until a later decision
phase evaluates recorded evidence.

## Relationship to Phase 20E

Phase 20E created the real user testing results log and evidence protocol. Phase 20F
is the companion stress results log for performance, quota, import, backup/restore,
manual transfer, mobile/PWA, and FSRS/review schedule checks. Phase 20F does not
override Phase 20E evidence requirements.

## Test execution rules

1. Use generated, duplicate, or synthetic test data where possible.
2. Create a backup before risky action, including large import, restore from backup,
   repeated backup/restore rehearsal, and manual export/import transfer.
3. Record subjective responsiveness only as observed evidence, not as objective
   benchmark proof.
4. Record app startup, Dashboard today plan, Study Room session, import, quota,
   backup/restore, manual transfer, mobile viewport, PWA/service-worker cache
   boundary, and FSRS experimental/off/default boundary outcomes.
5. Do not collect telemetry. Do not add analytics. Do not add runtime instrumentation.
6. Stop if import creates confusing or unsafe data.
7. Stop if backup/restore results are unclear.
8. Stop if due cards / review schedule count looks inconsistent.
9. Stop if storage quota warning is unclear or missing for risky import sizes.
10. Stop if PWA/cache behavior is confusing.
11. Stop if beta-ai or AI capability implication appears in public copy.

## Data safety rules

- Testers should use generated/duplicate/test data where possible.
- Backup must be created before risky import/restore/manual transfer testing.
- Backup is not sync.
- Restore may overwrite current data.
- There is no account/cloud/sync/backend capability to rely on.
- There is no built-in AI/OCR/AI generation capability to rely on.
- Do not record private study content from real libraries.
- Do not record account credentials, cloud credentials, device identifiers, or
  private backup file contents.

## What to record

- Scenario name and data set size: small data set, medium data set, or large data set.
- Device/browser and whether the session used desktop, mobile viewport, or PWA.
- Subjective responsiveness: immediate, slight delay, noticeable, long, or blocked.
- App startup result.
- Dashboard today plan result.
- Study Room session result.
- due cards / review schedule count before and after risky actions.
- JSON import, CSV import, text/markdown import, and EduGen Draft Workshop import
  boundary outcomes.
- storage quota estimate and large import warning outcome.
- backup before risky action, restore from backup, repeated backup/restore rehearsal,
  and manual export/import transfer outcomes.
- FSRS experimental/off/default boundary outcome.
- Hold signals and pass signals.

## What not to record

- Tester names, email addresses, phone numbers, or private identifiers.
- Private study card content from real libraries.
- Full backup files from real libraries.
- localStorage dumps from real libraries.
- Credentials, device identifiers, telemetry, analytics, or usage tracking data.
- Claims that stress testing is complete when result sections still contain
  placeholders.

## Required pre-test backup checklist

- [ ] Tester is using generated, duplicate, or test data where possible.
- [ ] Tester understands backup is not sync.
- [ ] Tester understands restore may overwrite current data.
- [ ] Tester has created a backup before risky action.
- [ ] Tester understands manual export/import transfer is not sync.
- [ ] Tester understands there is no account/cloud/sync/backend.
- [ ] Tester understands there is no built-in AI/OCR/AI generation.
- [ ] Tester understands FSRS is experimental/off/default unless specifically enabled
      in an internal test boundary.

## Test data set template

Copy this template for each data set used.

```markdown
### Data set [S/M/L] — [Label]

**Size:** [small data set / medium data set / large data set]
**Format(s):** [JSON import / CSV import / text/markdown import / backup export]
**Card count:** [Expected count]
**Review schedule metadata:** [None / legacy scheduler / FSRS test metadata]
**Generated/duplicate/test data:** [Confirmed / Issue]
**Storage quota estimate before import:** [No result yet]
**Expected risky import warning:** [Yes / No / Unknown]
```

## Small data set result

Status: No result yet.

Record the small data set outcome here, including app startup, JSON import, storage
quota estimate, due cards / review schedule count, and backup before risky action if
the scenario includes restore or transfer.

## Medium data set result

Status: No result yet.

Record the medium data set outcome here, including CSV import, text/markdown import,
Dashboard today plan, Study Room session, backup/restore, and manual export/import
transfer observations.

## Large data set result

Status: No result yet.

Record the large data set outcome here, including app startup, large import warning,
storage quota estimate, Dashboard today plan, Study Room session, repeated
backup/restore rehearsal, mobile viewport, and PWA/service-worker cache boundary
observations.

## Startup responsiveness result

Status: No result yet.

Record app startup responsiveness for small data set, medium data set, and large data
set sessions. Do not treat subjective timing as objective benchmark proof.

## Dashboard today plan result

Status: No result yet.

Record Dashboard today plan responsiveness and due cards / review schedule count
accuracy.

## Study Room result

Status: No result yet.

Record Study Room session startup, card-transition responsiveness, and due cards /
review schedule count consistency.

## Import result

Status: No result yet.

Record JSON import, CSV import, text/markdown import, and EduGen Draft Workshop import
boundary results. Stop if import creates confusing or unsafe data.

## Storage quota result

Status: No result yet.

Record storage quota estimate, quota headroom, and large import warning visibility.
Stop if storage quota warning is unclear or missing for risky import sizes.

## Backup and restore result

Status: No result yet.

Record backup before risky action, restore from backup, and repeated backup/restore
rehearsal outcomes. Stop if backup/restore results are unclear.

## Manual transfer result

Status: No result yet.

Record manual export/import transfer outcomes. Confirm backup is not sync and manual
transfer is not sync.

## Mobile/PWA result

Status: No result yet.

Record mobile viewport behavior and PWA/service-worker cache boundary behavior. Stop
if PWA/cache behavior is confusing.

## FSRS and review schedule result

Status: No result yet.

Record FSRS experimental/off/default boundary behavior and due cards / review schedule
count accuracy. Stop if due cards/review schedule counts look inconsistent.

## Evidence summary

No evidence has been recorded yet. This section must summarize only executed,
recorded results. Do not infer passing evidence from the presence of this template.

## Hold signals

Record hold signals here:

- Import creates confusing or unsafe data.
- Backup/restore results are unclear.
- due cards / review schedule count is inconsistent.
- storage quota warning is unclear or missing for risky import sizes.
- PWA/cache behavior is confusing.
- beta-ai or AI capability implication appears in public copy.
- Tester expects no account/cloud/sync/backend or no built-in AI/OCR/AI generation
  boundaries to be false.

## Pass signals

Record pass signals here only after executed results exist:

- App startup remains acceptable across tested data sizes.
- Dashboard today plan and Study Room session remain responsive.
- JSON import, CSV import, text/markdown import, and EduGen Draft Workshop import
  boundary behave clearly.
- Storage quota estimate and large import warning are clear.
- backup before risky action, restore from backup, repeated backup/restore rehearsal,
  and manual export/import transfer are understood and complete.
- mobile viewport and PWA/service-worker cache boundary remain understandable.
- FSRS experimental/off/default boundary and due cards / review schedule count remain
  consistent.

## Claim boundaries

Phase 20F creates a stress-test results log structure. Phase 20F does not claim stress
testing is complete unless actual manual/user-provided results are recorded. Phase
20F does not claim beta readiness. Phase 20F does not introduce telemetry, analytics,
runtime instrumentation, account/cloud/sync/backend, or built-in AI/OCR/AI generation.

## Phase 20G handoff

Phase 20G may evaluate Phase 20F only after actual stress results are recorded here
and Phase 20E real user testing evidence requirements are also satisfied. Until then,
Phase 20D HOLD remains the active decision.
