# Phase 20G — Beta Readiness Re-decision After Evidence

## Purpose

Phase 20G is a docs/static-validator/CI-only re-decision gate for Shime Quiz /
ShimeChamhoc v2 local-first hybrid beta readiness. It consumes the Phase 20D HOLD
decision, the Phase 20D evidence inventory, the Phase 20E real-user testing results
log and protocol, and the Phase 20F performance/quota/import stress results log and
protocol.

Phase 20G does not implement runtime behavior. It records whether the repo contains
actual executed evidence after Phase 20E and Phase 20F. Because the Phase 20E and
Phase 20F result logs still contain zero recorded sessions/results, Phase 20G keeps
HOLD pending executed evidence.

```text
LOCAL_FIRST_HYBRID_BETA_REDECISION: HOLD_PENDING_EXECUTED_EVIDENCE
```

## Decision

Phase 20G records:

```text
LOCAL_FIRST_HYBRID_BETA_REDECISION: HOLD_PENDING_EXECUTED_EVIDENCE
```

Phase 20G does not claim beta-ready. Phase 20G preserves the Phase 20D HOLD decision.
The repo has a Phase 20E real-user testing results log template and a Phase 20F
stress results log template, but it does not contain actual completed sessions or
actual stress results.

## Evidence consumed

Phase 20G consumes:

- `docs/adr/phase20d-hold-decision-beta-ai-naming-cleanup.md`
- `docs/release/phase20d-beta-hold-evidence.md`
- `docs/testing/phase20e-real-user-testing-results-log.md`
- `docs/release/phase20e-real-user-testing-evidence-protocol.md`
- `docs/testing/phase20f-performance-quota-import-stress-results-log.md`
- `docs/release/phase20f-performance-quota-import-stress-evidence-protocol.md`

Phase 20G does not invent evidence and does not treat empty templates as executed
results.

## Relationship to Phase 20D

Phase 20D established:

```text
LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD
BETA_AI_NAMING_DECISION: REMOVE_BETA_AI_PUBLIC_NAMING
```

Phase 20G preserves the Phase 20D HOLD decision. Phase 20D held because executed
real-user testing evidence and executed performance/quota/import stress evidence were
missing. Those requirements remain unmet in repo evidence.

## Relationship to Phase 20E

Phase 20E established:

```text
REAL_USER_TEST_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY
```

Phase 20E is a results log template unless actual sessions are recorded. As of Phase
20G, Phase 20E records `Sessions completed: 0 of 5 minimum required`, and all session
entries remain empty templates. Zero recorded sessions cannot support a beta-ready
claim.

## Relationship to Phase 20F

Phase 20F established:

```text
PERFORMANCE_STRESS_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY
LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD
```

Phase 20F is a stress results log template unless actual results are recorded. As of
Phase 20G, Phase 20F records `Stress results recorded: 0`, and all stress result
sections remain templates. Zero recorded stress results cannot support a beta-ready
claim.

## Current evidence status

The current evidence status is HOLD pending executed evidence:

- Phase 20D HOLD remains active.
- Phase 20E real-user testing results log exists.
- Phase 20E actual sessions recorded: 0.
- Phase 20F performance/quota/import stress results log exists.
- Phase 20F actual stress results recorded: 0.
- No repo evidence shows completed real-user testing.
- No repo evidence shows completed stress testing.

## Real-user testing evidence status

Phase 20E contains the required structure for recording real-user testing results,
but it does not contain completed tester sessions. It states that sessions recorded
are 0 of 5 minimum required and that no tester has completed a session yet. Phase 20G
therefore treats Phase 20E as a template, not executed evidence.

## Performance/quota/import stress evidence status

Phase 20F contains the required structure for recording performance, quota, import,
backup/restore, manual transfer, mobile/PWA, and FSRS/review schedule stress results,
but it does not contain completed stress results. It states that stress results
recorded are 0 and that no performance/quota/import stress session has been completed
yet. Phase 20G therefore treats Phase 20F as a template, not executed evidence.

## Beta readiness re-decision

Phase 20G re-decides beta readiness as:

```text
LOCAL_FIRST_HYBRID_BETA_REDECISION: HOLD_PENDING_EXECUTED_EVIDENCE
```

If sessions/results are 0 or absent, BETA_READY is not allowed. The repo currently
has zero Phase 20E sessions and zero Phase 20F stress results, so HOLD remains the
only supported decision.

## Why BETA_READY is not selected

BETA_READY is not selected because actual executed evidence does not exist in the
repo. A results log template is not a completed test result. A stress log template is
not a completed stress measurement. Choosing BETA_READY without completed results
would overstate data safety, performance, import, backup/restore, FSRS, and user
comprehension evidence.

## Conditions required before BETA_READY

BETA_READY may be reconsidered only after the repo contains actual executed evidence,
including:

1. Real user testing execution results with completed sessions under the Phase 20E
   evidence protocol.
2. Performance/quota/import stress execution results under the Phase 20F evidence
   protocol.
3. Backup and restore rehearsal evidence.
4. Manual transfer rehearsal evidence.
5. Mobile/PWA stress observation evidence.
6. FSRS and scheduler due-count observation evidence.
7. A later decision gate that consumes those executed results.

## Data safety decision

Data-loss prevention is not guaranteed. localStorage remains the canonical production
storage backend and remains subject to browser quota, browser data clearing, device
loss, and user error. Phase 20G does not add storage migration, sync, telemetry,
analytics, backup automation, or any new data safety guarantee.

## Backup and restore decision

Backup/export/restore behavior remains unchanged. Backup is a manual snapshot, not
sync. Restore may overwrite current data. Backup/export/restore are not adapter-aware.
Phase 20G does not implement backup, export, restore, or adapter changes.

## Import and quota decision

Phase 20G does not change import parser behavior or storage quota warning behavior.
The repo still lacks executed Phase 20F import and quota stress results. Large-import
and quota boundaries remain HOLD inputs until measured results are recorded.

## FSRS and scheduler decision

Phase 20G does not change FSRS or scheduler behavior. FSRS remains experimental,
double-gated, and not publicly opted in by default. The legacy scheduler remains the
default. The repo still lacks executed FSRS/review schedule stress observation
evidence under Phase 20F.

## Optional sync decision

Sync remains unshipped. Phase 20G does not implement sync and does not unlock Phase
19 optional sync design as runtime. Cloud/account/auth/backend remain absent.

## No-cloud/default-off trust decision

No-cloud/default-off trust boundaries remain active. Shime stores study data locally
by default, does not require an account by default, and does not collect telemetry or
analytics by default. Phase 20G does not change those boundaries.

## beta-ai naming decision

The Phase 20D beta-ai naming cleanup remains preserved. Built-in AI, OCR, and AI quiz
generation are not shipped. Phase 20G does not allow beta-ai as positive public
naming and does not introduce any AI runtime behavior.

## User-facing claim boundaries

Allowed claims after Phase 20G:

- beta readiness has been re-evaluated.
- HOLD remains active pending executed evidence.
- real-user testing results log exists.
- stress-test results log exists.
- beta-ai naming cleanup remains preserved.
- no-cloud/default-off trust boundaries remain active.

Forbidden claims after Phase 20G:

- local-first hybrid beta is ready, unless actual evidence supports BETA_READY.
- real user testing is complete, unless actual user-provided results are recorded.
- stress testing is complete, unless actual manual results are recorded.
- sync exists.
- cloud sync exists.
- account/auth/backend exists.
- production sync is ready.
- production IndexedDB storage exists.
- storage migration is complete.
- backup/export is adapter-aware.
- restore is adapter-aware.
- data-loss prevention is guaranteed.
- built-in AI exists.
- AI quiz generation exists.
- OCR exists.
- beta-ai is acceptable public naming.

## What Phase 20G explicitly does not implement

Phase 20G does not implement runtime code, UI, tests, e2e, dependencies, telemetry,
analytics, sync, cloud, account, auth, backend, production IndexedDB storage, storage
migration, backup/export/restore runtime changes, import parser changes, FSRS runtime
changes, performance instrumentation, runtime stress fixtures, or service worker
cache behavior.

## Required next evidence phases

Recommended next phases:

```text
20H — Real user testing execution results
20I — Performance/quota/import stress execution results
20J — Beta readiness re-decision after executed evidence
```

Phase 20G must not unlock sync/runtime/migration.

## Acceptance criteria

Phase 20G is accepted when:

- This ADR exists and records
  `LOCAL_FIRST_HYBRID_BETA_REDECISION: HOLD_PENDING_EXECUTED_EVIDENCE`.
- The evidence summary exists and matches the HOLD decision.
- CI registers the Phase 20G validator after Phase 20F.
- The validator confirms Phase 20E and Phase 20F contain templates with zero recorded
  sessions/results.
- No runtime, test, e2e, package, dependency, service worker, import, storage,
  backup/restore, FSRS, sync/cloud/account/auth/backend files are changed.
