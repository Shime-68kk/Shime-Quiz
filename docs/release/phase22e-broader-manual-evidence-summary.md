# Phase 22E — Broader Manual Evidence Summary

## Status tokens

```text
PHASE22E_BROADER_MANUAL_EVIDENCE_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS
PHASE22E_BROADER_MANUAL_EVIDENCE_SCENARIOS_RECORDED: 12
```

## Scope

Phase 22E records broader manual/browser-style evidence using generated/test data only. It adds documentation, a static validator, and CI registration after Phase 22D. It does not change runtime behavior.

Required categories covered in the evidence run were: larger import, CSV import, text or Markdown import, storage quota or large import warning, backup before restore, restore preview or overwrite confirmation, manual transfer, mobile viewport, no-cloud default-off, FSRS boundary, EduGen boundary, and beta-ai naming absence.

## Evidence summary

Phase 22E recorded 12 scenario rows in `docs/testing/phase22e-broader-manual-evidence-run.md`.

Executed with anonymized generated/test observations:

- larger import: PASS for a 60-item generated JSON preview and local save with backup reminder.
- CSV import: PASS for a generated 2-row CSV preview and local save.
- text or Markdown import: PASS for a generated pasted draft preview and local save.
- storage quota or large import warning: PASS for large-import backup reminder and simulated near-full browser storage warning.
- backup before restore: PASS for creating a full backup before restore rehearsal.
- restore preview or overwrite confirmation: PASS for disposable backup preview, overwrite confirmation, and restore completion.
- manual transfer: PASS for visible manual backup/restore transfer copy.
- mobile viewport: PASS for basic Library render at 375 by 812 without horizontal overflow.
- no-cloud default-off: PASS for visible local/manual/no-cloud/no-account-sync boundary copy.
- FSRS boundary: PASS for observed FSRS/adaptive-memory boundary copy.
- EduGen boundary: PASS for observed separate/configured EduGen boundary copy; configured extraction was not tested.
- beta-ai naming absence: PASS for zero `beta-ai` occurrences in observed Settings and Library text.

## What Phase 22E can claim

Phase 22E can claim that broader manual/browser-style evidence exists, generated/test data was used, observations were anonymized, and the specific Phase 22E scenarios marked `PASS` were observed in the local Playwright Chromium run.

## What Phase 22E must not claim

Phase 22E must not claim beta readiness, local-first hybrid beta readiness, broad external real-user testing completion, full stress testing completion, production readiness, sync/cloud/account/auth/backend availability, production IndexedDB storage, completed storage migration, adapter-aware backup/export/restore, guaranteed data-loss prevention, built-in AI, AI quiz generation, OCR, external AI/API integration, or acceptable public beta-ai naming.

## Remaining evidence gaps

Remaining gaps include second physical device transfer, real mobile file handling, PWA install and offline behavior, configured EduGen service extraction, repeated larger stress runs, storage pressure beyond advisory warning copy, cross-browser coverage, broad external real-user evidence, and release-readiness re-decision with broader evidence.

## Guardrails

- Phase 22E is evidence-execution plus docs/static-validator/CI only.
- Runtime behavior is unchanged.
- Generated/test data only.
- Unsupported, unavailable, blocked, and not-tested work must remain clearly separated from PASS evidence.
- No ADR is added.
- No runtime, package, test, e2e, storage/import/backup/restore, FSRS runtime, sync/cloud/account/auth/backend, telemetry, analytics, or `docs/adr/**` files are changed.

## Next recommended phase

Phase 22F — Actual Stress Run With Larger Import / Quota / Backup Rehearsal
