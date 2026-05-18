# Phase 21A — Evidence Execution Safety Checklist

## Purpose

This checklist protects testers and project claims before anyone manually executes the Phase 21A run pack. It is docs/static-validator/CI-only and does not execute tests, collect telemetry, add analytics, or add runtime instrumentation.

## Status

```text
MANUAL_EVIDENCE_RUN_PACK_STATUS: READY_FOR_MANUAL_EXECUTION
LOCAL_FIRST_HYBRID_BETA_FINAL_DECISION: HOLD_EXECUTED_EVIDENCE_REQUIRED
```

The checklist is ready for manual execution support. It does not mean manual evidence has been executed, real user testing is complete, stress testing is complete, or the local-first hybrid beta is ready.

## Relationship to Phase 20J HOLD

Phase 20J kept HOLD active because actual executed evidence was absent: `REAL_USER_TEST_RECORDED_SESSIONS: 0` and `PERFORMANCE_STRESS_RECORDED_RUNS: 0`.

Phase 21A keeps HOLD active and prepares safe manual collection for Phase 21B, Phase 21C, and a Phase 21D readiness gate.

## Who may run this checklist

Only someone who understands that Shime is local-first, that backup is not sync, that restore may overwrite current data, and that no account/cloud/sync/backend recovery path exists should run evidence sessions.

## What data may be used

Use duplicate/generated/test data where possible. Small library and larger library import sessions should prefer disposable JSON import, CSV import, and text/markdown import data.

## What data must not be used

Do not use irreplaceable study data without a verified backup. Do not copy private study content into public docs. Do not record contact information, credentials, backup file contents, raw sensitive test content, device identifiers, browser fingerprints, geolocation, telemetry, or analytics.

## Backup-before-test checklist

Before risky action, confirm backup was created, the tester knows where it is stored, and the tester understands backup is not sync.

Risky action includes restore from backup, repeated backup/restore rehearsal, manual export/import transfer, larger library import, storage quota estimate exploration, and large import warning checks.

## Restore-risk checklist

Confirm the tester understands restore may overwrite current data. Stop if restore behavior is unclear, if the tester cannot identify the backup file, or if the tester expects cloud/account/backend recovery.

## Import-risk checklist

For JSON import, CSV import, text/markdown import, and import larger library scenarios, use duplicate/generated/test data where possible. Record storage quota estimate, large import warning clarity, and due cards / review schedule count after import.

## Manual-transfer-risk checklist

Manual export/import transfer is a one-time copy, not sync. Stop if the tester expects continued cross-device updates, cloud sync, account sync, or backend recovery.

## FSRS/review-schedule-risk checklist

Confirm FSRS experimental/off/default boundary before recording results. Stop if due cards / review schedule count appears inconsistent after import, restore, manual transfer, or study session actions.

## Mobile/PWA-risk checklist

For mobile viewport, mobile browser, or PWA testing, record file access, layout usability, restore-from-backup comprehension, and PWA/service-worker cache boundary expectations. Stop if cache behavior causes unsafe data assumptions.

## Trust-copy-risk checklist

Confirm local-first trust-copy comprehension and Vietnamese-first copy comprehension where applicable. Stop if testers believe account/cloud/sync/backend exists, backup is sync, or data-loss prevention is guaranteed.

## Privacy checklist

No private study content should be copied into public docs. No contact information should be recorded. No credentials should be recorded. Evidence should be anonymized and summarized. Raw sensitive test content should not be committed.

No telemetry/analytics should be added.

## Evidence quality checklist

Usable evidence should identify approximate date, anonymous platform class, scenario attempted, expected counts, observed counts, due cards / review schedule count, backup before risky action status, pass signals, hold signals, and claim-boundary observations.

## Stop conditions

Stop if backup/restore behavior is unclear, backup is mistaken for sync, cloud/account/backend is expected, due cards / review schedule count appears inconsistent, beta-ai naming appears, built-in AI/OCR/AI quiz generation is implied, sensitive raw content would need to be recorded, or tester safety is uncertain.

## Required artifacts from a manual run

Manual execution should produce anonymized Phase 21B real-user testing results or Phase 21C stress testing results, not raw private study content. Include pass/hold summaries for onboarding, create/import small library, import larger library, study session, backup and restore, manual transfer, mobile/PWA, FSRS, EduGen Draft Workshop import boundary, local-first trust-copy comprehension, and Vietnamese-first copy comprehension.

## What counts as usable evidence

Usable evidence is actual tester-provided or manual-run observation with anonymized summary, scenario coverage, expected and observed counts, safety notes, and clear pass or hold signal.

## What does not count as usable evidence

Templates, empty result slots, inferred success, CI passing, validator passing, screenshots without context, and undocumented manual activity do not count as executed evidence.

No cloud/account/backend claims should be made. No AI/OCR/AI quiz generation claims should be made.

## Claim boundaries

Allowed claims after Phase 21A are that the manual evidence execution run pack exists, the evidence safety checklist exists, HOLD remains active pending executed evidence, beta-ai naming cleanup remains preserved, and no-cloud/default-off trust boundaries remain active.

Forbidden claims after Phase 21A include manual evidence has been executed, real user testing is complete, stress testing is complete, local-first hybrid beta is ready, sync exists, cloud sync exists, account/auth/backend exists, production sync is ready, production IndexedDB storage exists, storage migration is complete, backup/export is adapter-aware, restore is adapter-aware, data-loss prevention is guaranteed, built-in AI exists, AI quiz generation exists, OCR exists, and beta-ai is acceptable public naming.

## Phase 21B relationship

Phase 21B should record actual real-user testing results using this checklist. Phase 21A does not execute those sessions.

## Phase 21C relationship

Phase 21C should record actual performance/quota/import stress results using this checklist. Phase 21A does not execute those runs.

## Phase 21D readiness gate

BETA_READY requires actual evidence after 21B/21C and a 21D re-decision. BETA_READY remains forbidden until Phase 21D or later with actual evidence.
