# Phase 22F — Actual Stress Run With Larger Import / Quota / Backup Rehearsal

## Status tokens

```text
PHASE22F_ACTUAL_STRESS_RUN_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS
PHASE22F_ACTUAL_STRESS_SCENARIOS_RECORDED: 12
```

## Environment and baseline

- Date: 2026-05-19
- Platform class: local Linux desktop environment
- Browser class: Playwright Chromium headless
- App server: Vite dev server on `127.0.0.1:4173`
- Baseline: `origin/main` after Phase 22E merge `e4394a9`
- Branch: `phase22f-actual-stress-run`
- Evidence method: Playwright-driven manual/browser-style stress rehearsal using generated files under `/tmp/phase22f-stress`.

No runtime files were changed for this evidence run.

## Generated/test data policy

Only generated/disposable test data was used. The run created temporary generated files under `/tmp/phase22f-stress`: a 240-item JSON import file, a 120-row CSV import file, an 80-item Markdown import file, two full backup downloads, one library export download, and a local result summary. No private study content, credentials, contact data, device identifiers, geolocation, telemetry, analytics, or backup contents are recorded in this document.

## Stress scenario table

| Scenario ID | Stress category | Data shape | Expected safety boundary | Observed result | Status | Notes |
|---|---|---|---|---|---|---|
| P22F-01 | larger import stress | generated JSON file with 240 multiple-choice items; 139686 bytes | Preview before save; local browser storage only; backup reminder before explicit import | JSON preview showed 1 subject, 1 topic, 240 items, 240 valid items, and the backup-before-import reminder; explicit import saved locally and displayed the generated JSON subject. | PASS | Generated data only. |
| P22F-02 | large CSV import stress | generated CSV file with 120 rows; 29178 bytes | Preview before save; validation before local save | CSV preview showed 120 CSV rows, 1 subject, 1 topic, 120 items, 120 valid items; explicit import saved locally and displayed the generated CSV subject. | PASS | CSV answer values matched generated choice text. |
| P22F-03 | large text or Markdown import stress | generated Markdown file with 80 multiple-choice items; 14360 bytes | Preview before save; quality review before local save | Markdown preview showed parsed content with 80 items and 80 valid items; explicit import saved locally and displayed the generated Markdown subject. | PASS | Used local `.md` file import path. |
| P22F-04 | storage quota or large import warning | generated larger import plus mocked browser storage estimate at 95 percent reported usage | Warning is advisory; no cloud upload or automatic sync | Backup panel displayed near-full browser storage warning copy at 95 percent reported usage and stated data remains on this device. | PASS | Storage pressure was simulated in the browser session; real quota exhaustion was not attempted. |
| P22F-05 | backup before restore rehearsal | generated 240-item imported library backup | Backup file created before restore rehearsal; backup remains a manual transfer file | Full backup download succeeded before restore; suggested filename was `shime-v2-backup-2026-05-19.json`; saved size was 195932 bytes. | PASS | Backup contents are not committed or quoted. |
| P22F-06 | repeated backup before restore rehearsal | two full backup downloads from the same generated library | Repeated backup action remains explicit and local | A second full backup download succeeded before restore; suggested filename matched the first backup and saved size was again 195932 bytes. | PASS | Repetition covered download stability only, not long-duration endurance. |
| P22F-07 | restore preview or overwrite confirmation | first generated full backup selected through restore file input | Preview before restore; explicit overwrite confirmation before completion | Restore preview showed valid file, restore-supported copy, recognized-key-only copy, and the confirmation dialog was accepted before applying restore. | PASS | Disposable generated backup only. |
| P22F-08 | restore completion with disposable/generated data | generated full backup restored into the same browser profile | Restore writes recognized Shime v2 keys only; current data may be overwritten | Restore completed with success copy, cleared the preview, and the generated JSON subject remained visible after completion. | PASS | No irreplaceable data was present. |
| P22F-09 | post-import app stability | generated JSON, CSV, and Markdown imports plus restore/export route interactions | No critical page errors or console errors during exercised flows | The Playwright run captured zero critical `console.error` or `pageerror` entries across the stress rehearsal. | PASS | This is not cross-browser or long-session endurance evidence. |
| P22F-10 | manual export or transfer rehearsal | generated 240-item imported library exported through `Xuất thư viện` | Manual export only; file can be imported later through existing JSON flow | Library export download succeeded; suggested filename was `shime-library-backup-2026-05-19.json`; saved size was 156792 bytes. | PASS | No second physical device transfer was run. |
| P22F-11 | mobile viewport stress-adjacent check | 375 by 812 browser viewport after generated imports | Basic Library layout visible without horizontal document overflow | Library rendered at mobile size; measured document `scrollWidth`, `clientWidth`, and body `scrollWidth` were all 375. | PASS | Real mobile file picker behavior was not tested. |
| P22F-12 | remaining gaps after stress run | second device, real storage exhaustion, cross-browser, PWA/offline, long-duration endurance, external-user testing | Gaps must remain separate from PASS evidence | These adjacent stress areas were recorded as remaining gaps and were not executed in Phase 22F. | NOT_TESTED | Not counted as PASS evidence. |

## Executed stress observations

Phase 22F executed stress-oriented browser coverage with generated/test data only. Observed PASS rows are limited to the specific local Playwright Chromium surfaces in the table: larger JSON import, large CSV import, large Markdown import, mocked quota warning copy, backup before restore, repeated backup before restore, restore preview and overwrite confirmation, restore completion with disposable/generated data, post-import app stability, manual export, and mobile viewport stress-adjacent layout.

The browser run produced no captured critical page errors or console errors. Evidence was anonymized into scenario-level outcomes, generated file sizes, item counts, backup/export file sizes, visible copy categories, and viewport measurements.

## Blocked, unsupported, unavailable, or not-tested stress scenarios

No Phase 22F scenario table rows were marked `BLOCKED`, `UNSUPPORTED`, or `UNAVAILABLE`.

The remaining gaps after stress run row is `NOT_TESTED`: second physical device transfer, real browser storage exhaustion, cross-browser coverage, PWA install and offline behavior, real mobile file picker behavior, long-duration endurance, real-user comprehension, and broader production-scale stress were not run in this phase.

## Evidence interpretation

Phase 22F may claim only that actual stress-oriented evidence exists, generated/test data was used, observations were anonymized, and the specific Phase 22F scenarios marked `PASS` were observed in the local Playwright Chromium run.

Phase 22F does not establish production readiness, does not prove broad external real-user testing, does not prove full production stress testing, does not add sync/cloud/account/auth/backend behavior, does not prove production IndexedDB storage or storage migration, does not make backup/export/restore adapter-aware, does not guarantee data-loss prevention, does not add built-in AI, does not add AI quiz generation, does not add OCR, and does not add external AI/API integration.

## Guardrails

- Evidence-execution, docs, static-validator, and CI registration only.
- No runtime behavior changes.
- No changes to `src/**`, `tests/**`, `e2e/**`, package files, `sw.js`, backup/restore/import/storage runtime, FSRS runtime, sync/cloud/account/auth/backend files, telemetry, analytics, or `docs/adr/**`.
- No generated artifacts are committed.
- Scenario outcomes are recorded honestly from generated/test data only.
- Unsupported, unavailable, blocked, and not-tested work remains separated from PASS evidence.

## Remaining gaps

Remaining gaps after stress run include second physical device transfer, real browser storage exhaustion, larger and repeated long-duration stress, cross-browser coverage, PWA install and offline behavior, real mobile file picker behavior, real-user comprehension, and a later evidence update that incorporates both broader manual evidence and actual stress evidence.

## Next recommended phase

Phase 22G - Filled Evidence Update After Broader Manual and Stress Runs
