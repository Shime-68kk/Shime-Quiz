# Phase 22A — Actual First Manual Evidence Run

## Purpose

Record the first actual Phase 22A manual/browser-style evidence run using existing app behavior only.

This phase records anonymized observations from generated/test data. It does not change runtime behavior, add telemetry, add analytics, or claim beta readiness.

No telemetry or analytics were added.

## Status

```text
PHASE22A_FIRST_MANUAL_EVIDENCE_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS
FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: YES
```

HOLD remains active because Phase 22A is only a first manual evidence run. BETA_READY is not claimed in Phase 22A.

## Relationship to Phase 21G

Phase 21G closed the evidence-preparation track with Phase 22 ready for actual manual evidence execution. Phase 22A uses that handoff and converts only the observed first-run subset into anonymized evidence.

## Relationship to Phase 21E

Phase 21E provided the first-run pack, privacy rules, backup-before-test expectations, and stop conditions. Phase 22A followed the safe subset that could be executed in this local browser environment.

## Relationship to Phase 21F

Phase 21F created the first manual evidence capture structure and recorded that no first run had been executed yet. Phase 22A updates the execution status with actual anonymized observations.

## Evidence source rules

Evidence in this document comes from local commands and one Playwright-driven browser observation session against the existing app at `http://127.0.0.1:4173/`.

No private study data was used. No app code was changed to make evidence pass.

## Privacy and anonymization rules

The run used generated fixture data from `tests/fixtures/valid-import.json` and disposable browser storage. Evidence records approximate environment class, visible UI outcomes, file sizes, status text, and localStorage key families only.

No contact information, credentials, private study content, backup contents, telemetry, analytics, device identifier, browser fingerprint, or geolocation is recorded.

## Execution environment

- Date: 2026-05-18
- Platform class: local Linux desktop environment
- Browser class: Playwright Chromium headless
- App server: Vite dev server on `127.0.0.1:4173`
- App title observed: `ShimeChamhoc v2 — Local-first quiz study app`
- Source baseline: `origin/main` after Phase 21G merge `e15af95`

## Execution status

The first manual/browser-style evidence run was executed with anonymized results.

```text
PHASE22A_FIRST_MANUAL_EVIDENCE_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS
FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: YES
```

## Commands run

```bash
git fetch origin --prune
git checkout main
git reset --hard origin/main
git clean -fd
git checkout -B phase22a-actual-first-manual-evidence-run origin/main
npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false
npm run build
npm run test:unit
npx playwright install chromium
npm run dev
node --input-type=module [inline Playwright browser observation]
```

## Manual/browser access status

Manual/browser-style access was available through Playwright Chromium. The browser session opened the app, interacted with visible controls, created a backup download, previewed and applied restore using disposable data, checked a study-room answer path, and used a mobile-sized viewport.

## Data set used

The run used generated/test fixture data only:

- import file: `tests/fixtures/valid-import.json`
- observed library summary after import: 1 subject, 1 topic, 3 study items
- no private study content was recorded

## Backup-before-test confirmation

A full backup was created before restore testing.

- suggested filename: `shime-v2-backup-2026-05-18.json`
- saved size observed: 3990 bytes
- success text observed: `Đã tạo file sao lưu`
- backup copy stated the file is a manual transfer file, not cloud or account sync
- Backup is not sync, and Restore may overwrite current data.

## Scenario results

Observed scenarios: app startup, first-run/onboarding copy, JSON import of a small generated library, study-room first answer path, backup creation, restore preview and confirmation, restore completion, manual transfer copy, mobile-sized viewport, trust-copy boundaries, Vietnamese-first copy, FSRS boundary copy, EduGen Draft Workshop boundary copy, beta-ai naming absence.

Not tested in Phase 22A: larger library import, CSV import, text/Markdown import, storage quota warning trigger, repeated backup/restore rehearsal, cross-device transfer on a second physical device, PWA install prompt, service-worker offline behavior, real-user comprehension interview, and stress evidence.

## App startup result

PASS. The app opened at `/dashboard`, `#root` was visible, and the Dashboard heading rendered without critical browser console errors.

## Onboarding result

PASS. First-run Dashboard copy surfaced safe Library start options, including Library, JSON/CSV, text/Markdown, and boundary copy that Shime does not call AI/API and EduGen runs separately.

## Small library result

PASS. The valid generated JSON fixture opened the import preview, showed ready-to-import status, imported successfully, displayed `Môn kiểm thử E2E`, and showed 1 subject, 1 topic, and 3 study items.

## Study session result

PASS for a limited first-answer path. Study Room opened, showed the imported test prompt, accepted the generated multiple-choice answer, displayed answer feedback, and wrote local progress/review/study key families in browser storage.

Full session completion was not claimed in this Phase 22A run.

## Backup result

PASS. The backup control created a JSON download and showed `Đã tạo file sao lưu`.

## Restore result

PASS for disposable data. The backup file preview showed `File hợp lệ`, `Có thể khôi phục`, `Sao lưu đầy đủ`, and copy that restore only writes recognized Shime v2 data keys while PWA cache is not changed. The restore confirmation warned that restore can overwrite current Shime data on this device. Restore completed and the imported generated library remained visible.

## Manual transfer result

PASS for copy comprehension in the observed UI. The backup panel described transfer between devices as saving a backup file and restoring it on another device. It explicitly said the current transfer uses the existing backup file flow and does not create automatic cloud sync.

Actual transfer to a second physical device was not tested.

## Mobile/PWA result

PASS for mobile-sized viewport basics. At a 375 by 812 viewport, Library rendered with mobile navigation and no horizontal document overflow. Browser service-worker API support was present.

PWA install, offline behavior, and real mobile file handling were not tested.

## Trust-copy comprehension result

PASS for visible copy only. Observed copy stated that Shime stores data on this device, backup files may include private study content, backup files should be kept private, and the flow is a manual transfer file, not cloud or account sync.

No real-user comprehension interview was performed.

The no account/cloud/sync/backend boundary remained active in the observed copy.

## Vietnamese-first copy comprehension result

PASS for visible copy only. Vietnamese-first UI copy was visible across Dashboard, Library, import, backup, restore, and Study Room flows. The observed copy did not require recording private content and did not present account/cloud/sync/backend as available.

No Vietnamese-speaking tester interview was performed.

## FSRS boundary result

PASS for boundary copy observation. Settings loaded FSRS experimental wording, and Study Room used review schedule copy. Phase 22A does not claim active scheduler readiness or FSRS public rollout readiness.

## EduGen Draft Workshop boundary result

PASS for boundary copy observation. Library and Settings presented EduGen as separate/configured draft workflow support and included AI/API/OCR boundary language. No built-in AI generation, OCR, or automatic AI import claim was observed.

## beta-ai naming result

PASS. The browser observation found zero `beta-ai` occurrences on the observed Settings page, and no beta-ai public naming appeared in the exercised flows.

## Pass signals

- App startup rendered.
- First-run safe start copy rendered.
- Generated JSON small-library import succeeded.
- Study Room accepted a generated test answer and wrote local progress key families.
- Backup download succeeded before restore testing.
- Restore preview and overwrite confirmation were understandable.
- Restore completed with disposable data.
- Manual transfer copy described backup/restore as not cloud sync.
- Mobile-sized Library rendered without horizontal overflow.
- FSRS, EduGen, no-cloud/default-off, and beta-ai boundaries remained claim-limited in observed copy.
- No critical browser console or page errors were captured during the successful observation run.

## Hold signals

HOLD remains active. Phase 22A is not enough to claim beta readiness because real-user evidence, stress evidence, repeated backup/restore evidence, cross-device transfer evidence, quota/import stress evidence, and broader mobile/PWA evidence are still incomplete.

## Data safety notes

The run used generated/disposable data only. The backup file was created under `/tmp` for the observation and its contents are not committed. Restore testing used that disposable backup. Data-loss prevention is not guaranteed.

## Claim-safety notes

Phase 22A does not claim BETA_READY. It does not claim real user testing is complete, stress testing is complete, sync exists, cloud sync exists, account/auth/backend exists, production sync is ready, production IndexedDB storage exists, backup/export/restore are adapter-aware, restore is adapter-aware, built-in AI exists, AI quiz generation exists, OCR exists, or beta-ai is acceptable public naming.

## Evidence completeness assessment

Evidence completeness is partial. Phase 22A provides one actual anonymized first-run browser observation, but it does not replace Phase 22B real-user evidence, Phase 22C stress evidence, or Phase 22D readiness re-decision.

## Phase 22B handoff

Phase 22B should collect actual real-user filled evidence with anonymized tester comprehension, especially around local-first responsibility, backup before risky actions, restore overwrite risk, manual transfer limits, Vietnamese-first copy, and no cloud/account/sync/backend expectations.

## Phase 22C handoff

Phase 22C should collect stress evidence for larger imports, quota behavior, repeated backup/restore rehearsal, CSV and text/Markdown imports, storage pressure, and mobile/PWA file handling.

## Phase 22D handoff

Phase 22D must not reconsider BETA_READY unless enough actual first-run, real-user, and stress evidence exists and unresolved critical data safety hold signals are addressed.
