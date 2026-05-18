# Phase 21A — Manual Evidence Execution Run Pack

## Purpose

Phase 21A creates a manual run pack only. It gives testers a safe sequence for collecting real-user and stress evidence after Phase 20J without changing runtime behavior.

Phase 21A does not execute the run pack. It does not collect telemetry, does not add analytics, and does not add runtime instrumentation.

## Status

```text
MANUAL_EVIDENCE_RUN_PACK_STATUS: READY_FOR_MANUAL_EXECUTION
LOCAL_FIRST_HYBRID_BETA_FINAL_DECISION: HOLD_EXECUTED_EVIDENCE_REQUIRED
```

This status means the manual run pack is ready for manual execution. It does not mean evidence has been executed, real user testing is complete, stress testing is complete, or the local-first hybrid beta is ready.

## Relationship to Phase 20J

Phase 20J recorded `LOCAL_FIRST_HYBRID_BETA_FINAL_DECISION: HOLD_EXECUTED_EVIDENCE_REQUIRED` because `REAL_USER_TEST_RECORDED_SESSIONS: 0` and `PERFORMANCE_STRESS_RECORDED_RUNS: 0`.

Phase 21A preserves that HOLD. It prepares the next manual evidence track so Phase 21B and Phase 21C can record actual results before Phase 21D or later makes any beta readiness re-decision.

## Evidence execution principle

Evidence must come from actual manual tester observations. Do not invent outcomes, infer success from templates, or treat setup documentation as completed evidence.

Record only anonymized summaries needed to assess safety, usability, local-first comprehension, import behavior, backup/restore behavior, manual transfer, mobile/PWA behavior, due cards / review schedule count, FSRS boundaries, and EduGen Draft Workshop import boundary behavior.

## Required tester safety rules

Testers must not use irreplaceable study data without backup. Testers should use duplicate/generated/test data where possible.

Do not record private study content, contact information, credentials, backup file contents, device identifiers, browser fingerprints, geolocation, telemetry, analytics, or raw sensitive test content.

## Required pre-run backup

Create a backup before risky import, restore, repeated backup/restore rehearsal, or manual export/import transfer testing. Confirm the tester understands backup is not sync and that restore may overwrite current data.

Testing must stop if backup/restore behavior is unclear, if the user believes backup is sync, or if the user expects a cloud/account/backend recovery path.

## Required test data rules

Prefer generated, duplicated, or disposable libraries. Avoid public docs that expose raw sensitive test content.

If a tester chooses to use meaningful study data, create a backup first and keep evidence limited to anonymized summaries, approximate counts, and pass/hold signals.

## Real-user testing run sequence

For each real-user session, record approximate date, anonymous tester profile, platform class, scenarios attempted, pass signals, hold signals, data safety observations, local-first trust-copy comprehension, and Vietnamese-first copy comprehension when applicable.

Do not claim real user testing is complete from this run pack. Completion requires actual Phase 21B results.

## Stress testing run sequence

For each stress run, record approximate date, anonymous device/browser class, data set size, import format, expected and observed card counts, due cards / review schedule count, storage quota estimate, large import warning clarity, backup/restore observations, manual export/import transfer, mobile viewport or PWA/service-worker cache boundary, FSRS experimental/off/default boundary, and EduGen Draft Workshop import boundary.

Do not claim stress testing is complete from this run pack. Completion requires actual Phase 21C results.

## Onboarding scenario

Observe whether a new tester can understand the first-run flow, local-first storage, backup responsibility, and no account/cloud/sync/backend boundary before adding important data.

## Small library scenario

Create/import small library data using disposable content. Include JSON import, CSV import, or text/markdown import where practical, then verify card counts and due cards / review schedule count.

## Larger library import scenario

Import larger library data with generated or duplicate content. Record storage quota estimate, large import warning clarity, import responsiveness, and whether backup before risky action was completed.

## Study session scenario

Run a Study Room session after create/import actions. Record card flow, answer persistence, due cards / review schedule count consistency, and any confusing state changes.

Testing must stop if due/review schedule counts appear inconsistent.

## Backup and restore scenario

Create a backup, make a controlled change, restore from backup, and record whether expected library and progress data return. Repeated backup/restore rehearsal should use disposable data.

Testing must stop if restore behavior is unclear, if restore may overwrite current data without tester understanding, or if backup is treated as sync.

## Manual transfer scenario

Use manual export/import transfer as a one-time copy between browsers or devices where possible. Confirm testers understand manual transfer is not ongoing sync and there is no account/cloud/sync/backend recovery path.

## Mobile/PWA scenario

Use a mobile viewport, mobile browser, or PWA where available. Record layout usability, backup/export file access, restore-from-backup comprehension, and PWA/service-worker cache boundary expectations.

## FSRS boundary scenario

Confirm FSRS remains experimental/off/default and is not publicly opted in by default. Record due cards / review schedule count before and after import, restore, manual transfer, and study actions.

Testing must stop if due/review schedule counts appear inconsistent.

## EduGen Draft Workshop boundary scenario

Confirm EduGen Draft Workshop remains a review/import boundary. It must not imply built-in AI, OCR, or AI quiz generation.

Testing must stop if beta-ai naming, built-in AI, OCR, or AI capability implication appears.

## Local-first trust-copy comprehension scenario

Ask testers to summarize what local-first means without recording contact information. Evidence should show whether they understand data is stored locally, backup is their responsibility, backup is not sync, and no cloud/account/backend exists.

Testing must stop if the user believes cloud/account/backend exists.

## Vietnamese-first copy comprehension scenario

When a Vietnamese-speaking tester is available, record anonymized comprehension of Vietnamese-first trust copy. Confirm the copy is clear about local-first storage, backup before risky action, no account/cloud/sync/backend, and no built-in AI/OCR/AI generation.

## Stop conditions

Stop testing if backup/restore behavior is unclear, if a user believes backup is sync, if a user believes cloud/account/backend exists, if due cards / review schedule count appears inconsistent, if beta-ai or AI capability implication appears, if private data would need to be recorded, or if tester data safety cannot be protected.

## Evidence recording format

Record each run as an anonymized summary with approximate date, platform class, data set size, scenarios attempted, expected counts, observed counts, pass signals, hold signals, safety observations, and claim-boundary notes.

Do not record raw sensitive test content, credentials, contact information, telemetry, analytics, or backup file contents.

## Pass signal checklist

Pass signals may include completed onboarding, create/import small library, import larger library, study session, stable due cards / review schedule count, successful JSON import, CSV import, text/markdown import, clear storage quota estimate, clear large import warning, backup before risky action, restore from backup, repeated backup/restore rehearsal, manual export/import transfer, mobile viewport usability, PWA/service-worker cache boundary comprehension, FSRS experimental/off/default boundary comprehension, EduGen Draft Workshop import boundary comprehension, beta-ai naming absence, no account/cloud/sync/backend comprehension, Vietnamese-first copy comprehension, and local-first trust-copy comprehension.

## Hold signal checklist

Hold signals include missing backup before risky action, unclear restore from backup, tester belief that backup is sync, tester belief that sync/cloud/account/auth/backend exists, due cards / review schedule count inconsistency, confusing storage quota estimate, missing large import warning for risky data sizes, PWA/service-worker cache boundary confusion, FSRS experimental/off/default confusion, EduGen Draft Workshop implying built-in AI/OCR/AI generation, beta-ai public naming, raw sensitive data exposure, or any claim that data-loss prevention is guaranteed.

## Claim boundaries

Allowed claims after Phase 21A:

- manual evidence execution run pack exists;
- evidence safety checklist exists;
- HOLD remains active pending executed evidence;
- beta-ai naming cleanup remains preserved;
- no-cloud/default-off trust boundaries remain active.

Forbidden claims after Phase 21A:

- manual evidence has been executed;
- real user testing is complete;
- stress testing is complete;
- local-first hybrid beta is ready;
- sync exists;
- cloud sync exists;
- account/auth/backend exists;
- production sync is ready;
- production IndexedDB storage exists;
- storage migration is complete;
- backup/export is adapter-aware;
- restore is adapter-aware;
- data-loss prevention is guaranteed;
- built-in AI exists;
- AI quiz generation exists;
- OCR exists;
- beta-ai is acceptable public naming.

BETA_READY remains forbidden until Phase 21D or later with actual evidence.

## Phase 21B handoff

Phase 21B should fill real-user testing results from actual anonymized tester sessions. This run pack provides the scenario sequence but does not execute or complete those sessions.

## Phase 21C handoff

Phase 21C should fill performance/quota/import stress results from actual manual runs. This run pack provides the stress sequence but does not execute or complete those runs.

## Phase 21D handoff

Phase 21D or later may reconsider beta readiness only after Phase 21B and Phase 21C contain actual evidence and no unresolved critical hold signals remain.
