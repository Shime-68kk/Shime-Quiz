# Phase 21F — First Manual Evidence Run Capture

## Purpose

Phase 21F creates a capture document for the first manual evidence run prepared by Phase 21E. It records the execution status and the evidence rules for a future filled run.

Phase 21F is docs/static-validator/CI-only. It does not execute testing, does not implement runtime behavior, does not collect telemetry, does not add analytics, and does not claim beta readiness.

## Status

```text
FIRST_MANUAL_EVIDENCE_RUN_CAPTURE_STATUS: CAPTURE_DOCUMENT_READY
FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: NO
```

No actual first manual evidence run results were provided for this phase. HOLD remains active until enough evidence exists. BETA_READY is not claimed in Phase 21F.

## Relationship to Phase 21E

Phase 21E created `docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, and `docs/release/phase21e-first-run-safety-and-claim-checklist.md`.

Phase 21F does not convert those instructions into completed evidence. It creates the official result-capture location for a first manual evidence run after actual user/tester-provided evidence exists.

## Relationship to Phase 21D

Phase 21D recorded `LOCAL_FIRST_HYBRID_BETA_FILLED_EVIDENCE_DECISION: HOLD_INSUFFICIENT_FILLED_EVIDENCE` because filled real-user and stress evidence remained insufficient.

Phase 21F does not re-decide readiness. HOLD remains active until enough real-user filled evidence exists, enough stress filled evidence exists, and no critical data safety hold signals remain unresolved.

## Evidence source rules

Results must be based only on actual user/tester-provided evidence. Do not invent results. Do not claim the first manual evidence run has been executed unless actual anonymized results are provided.

Use pass / hold / not tested after a real run. Until then, scenario sections remain not executed.

## Privacy and anonymization rules

Do not record private study content. Do not record contact information. Do not record credentials. Do not record backup file contents, raw sensitive test content, telemetry, analytics, device identifiers, browser fingerprints, geolocation, or account/cloud credentials.

Summaries must be anonymized and limited to approximate environment class, approximate card counts, pass signals, hold signals, and claim-safety observations.

## First run execution status

FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: NO

No actual first-run result was provided. The first manual evidence run has not been executed for this capture record.

## Captured run metadata

- Approximate date: [not executed]
- Anonymous tester label: [not executed]
- Session type: first manual evidence run capture
- Evidence state: not tested

## Environment observed

[not executed]

Future evidence may record platform class, browser class, mobile viewport, and PWA install mode without private identifiers.

## Version observed

[not executed]

Future evidence may record the app version or commit shown to the tester.

## Data set used

[not executed]

Future evidence must use duplicate/generated/test data or disposable libraries. Do not record private study content.

## Backup-before-test confirmation

[not executed]

Future evidence must confirm backup before risky action, Backup is not sync, and Restore may overwrite current data.

## Scenario results

No scenario results are captured because no actual run results were provided.

Coverage expected after a real run: onboarding, create/import small library, study session, due cards / review schedule count, backup before risky action, restore from backup, manual export/import transfer, mobile/PWA basic usage, local-first copy comprehension, no-cloud/default-off trust copy, Vietnamese-first copy comprehension, FSRS experimental/off/default boundary, EduGen Draft Workshop boundary, beta-ai naming absence, backup is not sync, restore may overwrite current data, no account/cloud/sync/backend, and no built-in AI/OCR/AI generation.

## Onboarding result

[not executed]

## Small library result

[not executed]

Create/import small library remains not tested.

## Study session result

[not executed]

Due cards / review schedule count remains not tested.

## Backup result

[not executed]

Backup before risky action remains not tested. Backup is not sync.

## Restore result

[not executed]

Restore from backup remains not tested. Restore may overwrite current data.

## Manual transfer result

[not executed]

Manual export/import transfer remains not tested. It must be treated as a one-time copy, not sync.

## Mobile/PWA result

[not executed]

Mobile/PWA basic usage remains not tested. PWA/service-worker cache must not be described as sync, cloud backup, backend recovery, or guaranteed data-loss prevention.

## Trust-copy comprehension result

[not executed]

Local-first copy comprehension and no-cloud/default-off trust copy remain not tested. The boundary remains no account/cloud/sync/backend.

## Vietnamese-first copy comprehension result

[not executed]

Vietnamese-first copy comprehension remains not tested.

## FSRS boundary result

[not executed]

FSRS experimental/off/default boundary remains not tested and must not be claimed as active scheduling readiness from this phase.

## EduGen Draft Workshop boundary result

[not executed]

EduGen Draft Workshop boundary remains not tested and must not imply built-in AI, OCR, AI quiz generation, or beta-ai public naming.

## Pass signals

No pass signals are captured because no actual run results were provided.

## Hold signals

HOLD remains active because the first manual evidence run has not been executed for this capture record and evidence completeness is insufficient.

## Data safety notes

No private study content, contact information, credentials, telemetry, analytics, backup contents, or raw sensitive test content was recorded. No runtime data collection was added.

## Claim-safety notes

Allowed claims after Phase 21F:

- first manual evidence run capture document exists;
- execution status is documented;
- HOLD remains active unless sufficient evidence exists;
- beta-ai naming cleanup remains preserved;
- no-cloud/default-off trust boundaries remain active.

Forbidden claims after Phase 21F:

- first manual evidence run has been executed, unless actual results were provided;
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

## Evidence completeness assessment

Evidence is incomplete. FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: NO. Phase 21F only prepares capture and documents that execution has not happened for this record.

## Phase 21G handoff

Phase 21G should capture actual stress/performance/quota/import evidence only after real runs are performed. This Phase 21F capture does not complete stress testing.

## Phase 21H handoff

Phase 21H must not reconsider BETA_READY unless enough real-user filled evidence exists, enough stress filled evidence exists, no critical data safety hold signals remain unresolved, beta-ai naming remains cleaned, and no cloud/sync/account/backend/AI/OCR overclaims appear.
