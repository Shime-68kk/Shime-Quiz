# Phase 22E — Broader Manual Evidence Run With Larger Import Coverage

## Status tokens

```text
PHASE22E_BROADER_MANUAL_EVIDENCE_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS
PHASE22E_BROADER_MANUAL_EVIDENCE_SCENARIOS_RECORDED: 12
```

## Environment and baseline

- Date: 2026-05-19
- Platform class: local Linux desktop environment
- Browser class: Playwright Chromium headless
- App server: Vite dev server on `127.0.0.1:4173`
- Baseline: `origin/main` after Phase 22D merge `59e6388`
- Branch: `phase22e-broader-manual-evidence`
- Evidence method: Playwright-driven manual/browser-style observation, following the Phase 22A precedent.

No runtime files were changed for this evidence run.

## Generated/test data policy

Only generated/disposable test data was used. The run created temporary files under `/tmp` for a 60-item JSON import, a 2-row CSV import, a pasted text/Markdown draft, and one backup file. No private study content, credentials, contact data, device identifiers, geolocation, telemetry, analytics, or backup contents are recorded in this document.

## Scenario table

| Scenario ID | Scenario category | Data type | Expected safety boundary | Observed result | Status | Notes |
|---|---|---|---|---|---|---|
| P22E-01 | larger import | generated JSON file with 60 multiple-choice items | Preview before save; local browser storage only; backup reminder before import | Import preview showed 1 subject, 1 topic, 60 items, 60 valid items, and a large-import backup reminder before explicit save; import then saved locally and displayed the generated subject. | PASS | No private data used. |
| P22E-02 | CSV import | generated CSV file with 2 rows | Preview before save; validation before local save | CSV preview showed 2 rows, 1 subject, 1 topic, 2 items, 2 valid items, then explicit import saved locally and displayed the generated CSV subject. | PASS | A low-item advisory appeared; it did not block import. |
| P22E-03 | text or Markdown import | generated pasted text/Markdown draft | Preview before save; quality review before local save | Text/Markdown preview showed 12 parsed lines, 1 subject, 1 topic, 3 valid items, then explicit import saved locally and displayed the generated subject. | PASS | Covered multiple choice, flashcard, and short answer. |
| P22E-04 | storage quota or large import warning | generated larger import plus mocked browser storage estimate | Warning is advisory; no cloud upload or automatic sync | Large import displayed backup-before-import copy, and the backup panel displayed a near-full browser storage warning at 95% reported usage. | PASS | Storage estimate was simulated in the browser session to exercise warning copy. |
| P22E-05 | backup before restore | generated imported library backup | Backup file created before restore rehearsal; backup is manual transfer, not sync | A full backup was created before restore. Suggested filename was `shime-v2-backup-2026-05-19.json`; saved size was 4284 bytes; success copy appeared. | PASS | Backup contents are not committed or quoted. |
| P22E-06 | restore preview or overwrite confirmation | generated disposable backup file | Preview before restore; explicit confirmation before overwrite | Restore preview showed a valid full backup, restore-supported copy, recognized-key-only copy, and the confirmation dialog was accepted before completion. | PASS | Restore used disposable generated data. |
| P22E-07 | manual transfer | backup/restore UI copy | Manual transfer only; no automatic cloud sync or account sync | Backup panel said transfer means saving a backup file here and restoring it on another device; it also said the flow does not create automatic cloud sync and is not cloud or account sync. | PASS | No second physical device transfer was claimed. |
| P22E-08 | mobile viewport | 375 by 812 browser viewport | Basic layout visible without horizontal document overflow | Library rendered at mobile size with heading visible; document width equaled viewport width and no horizontal overflow was observed. | PASS | PWA install and real mobile file handling were not tested. |
| P22E-09 | no-cloud default-off | visible copy in backup and import flows | No cloud/account/sync/backend availability claim | Observed copy stated local browser/device storage, manual backup transfer, not cloud/account sync, no automatic cloud sync, and no server upload by the share fallback copy. | PASS | Boundary copy only; no real-user comprehension interview. |
| P22E-10 | FSRS boundary | Settings page and review boundary copy | FSRS remains experimental/controlled; no broad rollout claim | Settings contained FSRS/adaptive-memory boundary wording in the observed browser session. | PASS | Scheduler readiness under stress was not claimed. |
| P22E-11 | EduGen boundary | Library document-import boundary copy | EduGen is separate/configured; no bundled AI/OCR behavior | Library showed the document-import path as requiring an EduGen File Processor URL and visible copy that EduGen only extracts text and requires preview before save. | PASS | No configured EduGen service extraction was tested. |
| P22E-12 | beta-ai naming absence | observed Settings and Library text | No `beta-ai` public naming in exercised flows | Browser text scan of observed Settings and Library flows found 0 `beta-ai` occurrences. | PASS | This does not audit every possible route or asset. |

## Executed observations

The Phase 22E run executed broader manual/browser-style coverage than Phase 22A using generated/test data only. Observed PASS rows were limited to the specific browser surfaces in the table: larger JSON import, CSV import, text/Markdown import, quota and large-import warnings, backup-before-restore, restore preview and confirmation, manual-transfer copy, mobile viewport basics, no-cloud default-off copy, FSRS boundary copy, EduGen boundary copy, and beta-ai naming absence in the exercised flows.

The temporary browser run produced no captured page errors or console errors. Evidence was anonymized into scenario-level outcomes, file sizes, counts, visible copy categories, and viewport measurements.

## Blocked, unsupported, unavailable, or not-tested scenarios

No Phase 22E scenario table rows were marked `BLOCKED`, `UNSUPPORTED`, `UNAVAILABLE`, or `NOT_TESTED`.

The following adjacent work was not tested or not claimed by this phase: second physical device transfer, PWA install prompt, offline service-worker behavior, real mobile file picker behavior, configured EduGen document extraction, full stress testing, broad external real-user testing, and production release readiness.

## Evidence interpretation

Phase 22E may claim only that broader manual/browser-style evidence exists, generated/test data was used, observations were anonymized, and the specific scenario rows marked `PASS` were observed in this local browser environment.

Phase 22E does not establish production readiness, does not prove broad external real-user testing, does not prove full stress testing, does not add sync/cloud/account/auth/backend behavior, does not prove production IndexedDB storage or storage migration, does not make backup/export/restore adapter-aware, does not guarantee data-loss prevention, does not add built-in AI, does not add AI quiz generation, does not add OCR, and does not add external AI/API integration.

## Guardrails

- Evidence-execution, docs, static-validator, and CI registration only.
- No runtime behavior changes.
- No changes to `src/**`, `tests/**`, `e2e/**`, package files, `sw.js`, backup/restore/import/storage runtime, FSRS runtime, sync/cloud/account/auth/backend files, telemetry, analytics, or `docs/adr/**`.
- No generated artifacts are committed.
- Scenario outcomes are recorded honestly from generated/test data only.

## Next recommended phase

Phase 22F — Actual Stress Run With Larger Import / Quota / Backup Rehearsal
