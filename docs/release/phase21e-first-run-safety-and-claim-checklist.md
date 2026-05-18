# Phase 21E — First Run Safety and Claim Checklist

## Purpose

This checklist keeps the first manual evidence run safe, anonymized, and honest. It supports the Phase 21E first-run pack without executing the run or claiming readiness.

## Status

```text
MANUAL_EVIDENCE_FIRST_RUN_PACK_STATUS: READY_FOR_FIRST_MANUAL_RUN
MANUAL_EVIDENCE_FIRST_RUN_COMPLETED: NO
```

HOLD remains active. BETA_READY requires actual filled evidence and a later re-decision.

## Before the run

- Use duplicate/generated/test data.
- Avoid irreplaceable study data unless a backup already exists.
- Confirm no private study content, contact info, credentials, telemetry, analytics, or raw sensitive test content will be recorded.
- Confirm no cloud/account/backend claims are made.
- Confirm no AI/OCR/AI quiz generation claims are made.

## During the run

- Stop before risky import, restore, repeated backup/restore rehearsal, or manual transfer if backup has not been created.
- Stop if backup/restore behavior is unclear.
- Stop if due cards / review schedule count appears inconsistent.
- Stop if beta-ai naming or AI capability implication appears.
- Record anonymized pass / hold / not tested notes only.

## After the run

- Summarize evidence without raw sensitive content.
- Leave unknown fields as not tested.
- Do not turn a template into invented results.
- Do not claim real user testing is complete, stress testing is complete, or local-first hybrid beta is ready.

## Data safety checklist

- No private study content should be committed.
- No contact info should be recorded.
- No credentials should be recorded.
- No telemetry/analytics should be added.
- Evidence should be anonymized and summarized.
- Raw sensitive test content should not be committed.

## Backup and restore checklist

- Backup before risky action: [required]
- Restore from backup: [manual rehearsal only]
- Repeated backup/restore rehearsal: [use disposable data]
- Backup is not sync: [must be understood]
- Restore may overwrite current data: [must be understood]

## Manual transfer checklist

Manual export/import transfer is a one-time copy path, not ongoing sync. It must not be described as cloud sync, account recovery, backend recovery, or guaranteed data-loss prevention.

## Trust-copy checklist

The tester should understand local-first trust-copy: data is local, backup is the user's responsibility, Backup is not sync, Restore may overwrite current data, no account/cloud/sync/backend exists, and no telemetry/analytics is added.

## Vietnamese-first copy checklist

When Vietnamese-first copy is reviewed, record only anonymized comprehension. The copy should preserve no-cloud/default-off trust boundaries and avoid AI/OCR/AI generation implications.

## FSRS boundary checklist

FSRS remains experimental/off/default. Do not claim active scheduler readiness from this first-run pack. Record due cards / review schedule count observations and stop if they appear inconsistent.

## EduGen boundary checklist

EduGen Draft Workshop import boundary remains review/import oriented. It must not imply built-in AI, OCR, AI quiz generation, or beta-ai public naming.

## Mobile/PWA checklist

Record mobile viewport, mobile browser, or PWA observations. The PWA/service-worker cache boundary must not be represented as sync, cloud backup, backend recovery, or data-loss prevention.

## Claim-safety checklist

Allowed claims after Phase 21E:

- first-run manual evidence pack exists;
- fillable evidence session template exists;
- first-run safety and claim checklist exists;
- HOLD remains active pending actual filled evidence;
- beta-ai naming cleanup remains preserved;
- no-cloud/default-off trust boundaries remain active.

Forbidden claims after Phase 21E:

- first manual evidence run has been executed;
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

## Stop conditions

Stop if backup/restore behavior is unclear, if backup before risky action was skipped, if the tester believes backup is sync, if the tester believes cloud/account/backend exists, if due cards / review schedule count looks inconsistent, if beta-ai or AI capability implication appears, if private data would need to be recorded, or if tester data safety cannot be protected.

## What may be recorded

Record anonymized summaries, approximate card counts, expected and observed counts, platform class, browser class, import format, pass signals, hold signals, and claim-safety notes.

## What must not be recorded

Do not record private study content, contact info, credentials, backup file contents, raw sensitive test content, telemetry, analytics, device identifiers, browser fingerprints, geolocation, or cloud/account credentials.

## How to summarize evidence

Use pass / hold / not tested. Separate actual observations from tester interpretation. Include onboarding, create/import small library, import larger library, study session, due cards / review schedule count, JSON import, CSV import, text/markdown import, EduGen Draft Workshop import boundary, storage quota estimate, large import warning, backup before risky action, restore from backup, repeated backup/restore rehearsal, manual export/import transfer, mobile viewport, PWA/service-worker cache boundary, FSRS experimental/off/default boundary, beta-ai naming absence, Backup is not sync, no account/cloud/sync/backend, no built-in AI/OCR/AI generation, Vietnamese-first copy comprehension, and local-first trust-copy comprehension.

Use placeholders such as `[fill after manual run]`, `[do not include private study content]`, and `[pass / hold / not tested]` when evidence is not yet available.

## Phase 21F readiness gate

Phase 21F may fill real-user evidence only after actual anonymized sessions are run. Phase 21E does not complete real-user testing.

## Phase 21G readiness gate

Phase 21G may fill stress evidence only after actual performance/quota/import runs are run. Phase 21E does not complete stress testing.

## Phase 21H readiness gate

Phase 21H may reconsider beta readiness only after actual filled evidence exists and unresolved critical hold signals are addressed. BETA_READY requires actual filled evidence and a later re-decision.
