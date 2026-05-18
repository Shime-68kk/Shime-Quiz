# Phase 20G — Beta Readiness Re-decision Evidence Summary

## Purpose

This document summarizes the evidence consumed by Phase 20G when re-deciding
local-first hybrid beta readiness after Phase 20E and Phase 20F. It is
docs/static-validator/CI-only and does not execute testing, collect data, or
implement runtime behavior.

## Decision summary

```text
LOCAL_FIRST_HYBRID_BETA_REDECISION: HOLD_PENDING_EXECUTED_EVIDENCE
```

HOLD remains active because the repo contains templates for real-user testing
results and performance/quota/import stress results, but it does not contain actual
executed sessions or actual stress results.

## Evidence inventory

- Phase 20D ADR: `docs/adr/phase20d-hold-decision-beta-ai-naming-cleanup.md`
- Phase 20D evidence: `docs/release/phase20d-beta-hold-evidence.md`
- Phase 20E results log: `docs/testing/phase20e-real-user-testing-results-log.md`
- Phase 20E evidence protocol:
  `docs/release/phase20e-real-user-testing-evidence-protocol.md`
- Phase 20F stress results log:
  `docs/testing/phase20f-performance-quota-import-stress-results-log.md`
- Phase 20F stress evidence protocol:
  `docs/release/phase20f-performance-quota-import-stress-evidence-protocol.md`

## Phase 20D evidence

Phase 20D records `LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD` and
`BETA_AI_NAMING_DECISION: REMOVE_BETA_AI_PUBLIC_NAMING`. It held beta readiness
because executed real-user testing evidence and executed performance/quota/import
stress evidence did not exist in the repo.

## Phase 20E evidence

Phase 20E records `REAL_USER_TEST_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY`.
It provides a results log template and evidence protocol. Phase 20E contains only
templates unless actual tester sessions are recorded. In the current repo, Phase 20E
states that sessions recorded are 0 of 5 minimum required.

## Phase 20F evidence

Phase 20F records `PERFORMANCE_STRESS_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY`.
It provides a stress results log template and evidence protocol. Phase 20F contains
only templates unless actual stress results are recorded. In the current repo, Phase
20F states that stress results recorded are 0.

## Real-user testing result count

Real-user testing result count: 0 completed sessions.

The Phase 20E log still says no tester has completed a session and each session entry
is `[No result yet]`. This is not executed evidence.

## Stress-test result count

Stress-test result count: 0 completed stress results.

The Phase 20F log still says no performance/quota/import stress session has been
completed and all result sections are templates. This is not executed evidence.

## Missing evidence

Missing evidence includes:

- Completed real-user testing sessions.
- Completed performance/quota/import stress results.
- Completed backup/restore rehearsal results.
- Completed manual transfer rehearsal results.
- Completed mobile/PWA stress observation results.
- Completed FSRS/review schedule observation results.
- A later decision that consumes actual executed evidence.

## Hold signals

The decisive hold signal is absence of executed evidence. Phase 20E and Phase 20F are
ready to receive results, but they currently record zero sessions/results. Data-loss
prevention is not guaranteed. Backup/export/restore are not adapter-aware.
Production IndexedDB storage remains absent. Sync remains unshipped.

## Pass signals

Pass signals are limited to documentation and guardrails:

- The Phase 20E real-user testing results log exists.
- The Phase 20F performance/quota/import stress results log exists.
- The Phase 20D beta-ai naming cleanup remains preserved.
- No-cloud/default-off trust boundaries remain active.

These are not enough for BETA_READY because they are not executed user or stress
results.

## Data safety assessment

Data safety remains a HOLD input. The app remains local-first with localStorage as
the canonical production storage backend. Browser quota, browser data clearing,
device loss, restore overwrite risk, and user error remain possible. Phase 20G does
not guarantee data-loss prevention.

## Backup and restore assessment

Backup/export/restore remain manual and localStorage-oriented. Backup is not sync.
Restore may overwrite current data. Backup/export/restore are not adapter-aware.
Executed rehearsal evidence is still missing.

## Import and quota assessment

Import and quota readiness cannot be upgraded from templates. The repo lacks executed
large-import and quota stress results under the Phase 20F protocol.

## FSRS and scheduler assessment

FSRS remains experimental, double-gated, and not publicly opted in by default. The
legacy scheduler remains the default. Executed FSRS/review schedule observation
evidence is still missing.

## Optional sync assessment

Sync remains unshipped. Cloud/account/auth/backend remain absent. Phase 20G does not
unlock sync runtime or production sync readiness.

## No-cloud/default-off trust assessment

No-cloud/default-off trust boundaries remain active. The app does not require an
account by default, does not collect telemetry or analytics by default, and does not
ship cloud sync by default.

## beta-ai naming assessment

The Phase 20D beta-ai naming cleanup remains preserved. Built-in AI/OCR/AI quiz
generation are not shipped, and beta-ai must not be used as acceptable public naming.

## Recommendation

Keep HOLD:

```text
LOCAL_FIRST_HYBRID_BETA_REDECISION: HOLD_PENDING_EXECUTED_EVIDENCE
```

BETA_READY is not supported because the repo contains zero Phase 20E completed
sessions and zero Phase 20F completed stress results.

## Next steps

Recommended next phases:

```text
20H — Real user testing execution results
20I — Performance/quota/import stress execution results
20J — Beta readiness re-decision after executed evidence
```

Phase 20G must not unlock sync/runtime/migration.
