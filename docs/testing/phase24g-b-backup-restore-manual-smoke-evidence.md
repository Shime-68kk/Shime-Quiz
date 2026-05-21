# Phase 24G-B — Backup/Restore Manual Smoke Evidence
## Status token
PHASE24G_B_MANUAL_SMOKE_EVIDENCE_STATUS: COMPLETED_MANUAL_EVIDENCE

## Scope
Phase 24G-B is manual/browser evidence execution plus docs/static-validator/CI.
Phase 24G-B does not change runtime behavior.
Phase 24G-B does not modify Phase 24E scaffold behavior.
Phase 24G-B does not implement production adapter-aware backup/export/restore.
Production backup/export/restore behavior remains unchanged by this patch.
Backup file format remains unchanged.
Restore overwrite behavior remains unchanged.
Current localStorage backup compatibility remains unchanged.
Default storage driver remains unchanged.
No IndexedDB.
No storage migration.
No sync/cloud/account/auth/backend.
No BETA_READY.
Historical full-chain validators remain manual/local/scheduled audit guidance.
Full historical scripts/validate-*.js chain is not used as a Phase 24G-B merge-blocking requirement.

Phase 24D input: PHASE24D_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_DECISION: PASS_TO_PHASE24E_TEST_ONLY_SCAFFOLD_WITH_ROLLBACK_GATES
Phase 24D-HF2 input: PHASE24D_HF2_CI_VALIDATOR_STRATEGY_STATUS: COMPLETED_CURRENT_PHASE_GATE_RESET
Phase 24E input: PHASE24E_ADAPTER_AWARE_BACKUP_RESTORE_SCAFFOLD_STATUS: COMPLETED_TEST_ONLY_SCAFFOLD
Phase 24F input: PHASE24F_REGRESSION_EVIDENCE_AFTER_ADAPTER_CHANGES_STATUS: COMPLETED_EVIDENCE_GATE
Phase 24G-A input: PHASE24G_MANUAL_SMOKE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED

## Inputs
Tester name/handle: Codex browser smoke runner.
Date/time: 2026-05-21T13:19:30+07:00.
OS: Ubuntu 24.04.1/Linux 6.17.0-23-generic x86_64.
Browser and version or unknown: Playwright Chromium 148.0.7778.96.
Node/npm versions: Node v20.20.1, npm 10.8.2.
Commit SHA: 6c8bc5a80b03e1d75de9d12383f9fa1a2dde50e2.
App URL: http://127.0.0.1:4173/library.
Whether npm ci ran: PASS, `npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false`.
Whether npm run build ran: PASS before browser smoke.
Whether npm run test:unit ran: PASS, 39 test files and 1618 tests.
Whether app was opened in browser: yes, opened in Playwright Chromium through Vite preview.

## Environment
Viewport/device class: 1440x1000 desktop Chromium.
Storage mode observed by the app: local browser storage through the existing localStorage-backed UI.
Existing data state before test setup: browser localStorage and sessionStorage cleared before creating disposable data.
Browser/manual smoke was actually run: yes, Codex opened the app in Playwright Chromium and executed the Phase 24G-A checklist against the built app served at the App URL.

## Data safety setup
Use generated/test data only.
Real learner data was not used.
The browser profile state was disposable. localStorage and sessionStorage were cleared before source data setup and again before the second disposable state used for restore overwrite testing.
The generated backup file was kept only as `/tmp/phase24g-b-manual-smoke/shime-v2-backup-2026-05-21.json` during evidence collection.
Screenshot notes were stored outside the repository at `/tmp/phase24g-b-manual-smoke/after-backup.png` and `/tmp/phase24g-b-manual-smoke/after-restore.png`.

## Test data used
Disposable source dataset: `phase24g-disposable-library`.
Disposable source topic: `phase24g-disposable-topic`.
Disposable source item: one generated multiple-choice item with prompt `phase24g-disposable-question: correct option?`.
Second disposable overwrite-state dataset: `phase24g-second-overwrite-state`.
Backup file name: `shime-v2-backup-2026-05-21.json`.
Backup file size observed: 3260 bytes.
Visible source counts before backup: 1 môn học, 1 chủ đề, 1 mục học.

## Backup/export smoke result
B1: PASS. The existing backup/export surface was reachable on `/library` under the `Sao lưu dữ liệu` heading with no new Phase 24G-B runtime UI.
B2: PASS. Observed copy described a manual transfer file, this device only, and stated that the flow does not create automatic cloud sync and is not cloud or account sync.
B3: PASS. Clicking `Sao lưu dữ liệu` produced the generated JSON backup file `shime-v2-backup-2026-05-21.json`.
B4: PASS. The browser download event exposed the backup filename, and the file was saved to `/tmp/phase24g-b-manual-smoke/shime-v2-backup-2026-05-21.json`.
B5: PASS. Source labels and counts were recorded before restore: `phase24g-disposable-library`, 1 môn học, 1 chủ đề, 1 mục học.

## Restore/import smoke result
R1: PASS. A second disposable state named `phase24g-second-overwrite-state` was created before restore, and it was safe to overwrite.
R2: PASS. The existing restore flow accepted the generated backup file through `Khôi phục từ file sao lưu` and `Chọn file sao lưu`.
R3: PASS. The browser showed the existing confirm dialog: `Restore from backup? This can overwrite current Shime data on this device. Make sure this is the backup file you want to receive.`
R4: PASS. Restore completed after accepting the overwrite confirmation, and the UI reported `Khôi phục hoàn tất`.
R5: PASS. After reload, `phase24g-disposable-library` was visible again, the backup summary showed 1 môn học, 1 chủ đề, 1 mục học, and the second disposable state was no longer visible.
R6: PASS. No mismatch, unexpected warning, browser issue, file handling issue, console error, or page error was observed.

## No-new-UI/no-new-claim result
G1: PASS. No Phase 24G-B-only runtime UI was observed; the evidence used the existing Library backup/restore controls.
G2: PASS. No sync/cloud/account/auth/backend claim was observed during backup or restore; cloud/account sync wording appeared only as negative manual-transfer guardrail copy.
G3: PASS. No platform backup preservation promise was observed.
G4: PASS. No broad data-loss prevention claim was observed.
G5: PASS. No production adapter-aware backup/export/restore approval wording was observed.

## Failure/anomaly log
No app failure or anomaly was observed during the completed evidence run.
Non-app runner note: the first automation attempt used an ambiguous `.sourceSummaryGrid` selector and was rerun with the labeled `Nội dung sao lưu` summary. This did not indicate an application failure.
Console errors: none.
Page errors: none.

## Overall result
Overall result: PASS for the Phase 24G-A backup/export, restore/import, and no-new-UI/no-new-claim checklist using generated/test data only.
Status: PHASE24G_B_MANUAL_SMOKE_EVIDENCE_STATUS: COMPLETED_MANUAL_EVIDENCE.

## Evidence limitations
This was one local desktop Chromium smoke run, not a browser matrix, mobile-device run, accessibility audit, performance audit, long-lived retention test, or broad data-loss prevention proof.
This evidence confirms only the observed existing user-visible backup/export/restore smoke path with generated/test data.
It does not claim platform backup preservation.
It does not claim production adapter-aware backup/export/restore.
It does not claim sync/cloud/account/auth/backend.
It does not claim BETA_READY.

## Rollback plan
Remove docs/testing/phase24g-b-backup-restore-manual-smoke-evidence.md.
Remove docs/release/phase24g-b-manual-smoke-evidence-summary.md.
Remove scripts/validate-phase24g-b-manual-smoke-evidence.js.
Remove Phase 24G-B CI registration.
No learner data migration or cleanup is required because Phase 24G-B changes no runtime behavior.

## What Phase 24G-B can claim
Phase 24G-B can claim that a local Chromium manual/browser smoke run was executed with generated/test data only.
Phase 24G-B can claim that the observed existing backup/export flow produced a JSON backup file.
Phase 24G-B can claim that the observed existing restore flow accepted that generated backup file, showed overwrite confirmation, completed restore, and restored the visible generated labels and counts in this smoke run.
Phase 24G-B can claim that no new Phase 24G-B runtime UI, unsafe sync/cloud/account/auth/backend claim, BETA_READY claim, or production adapter-aware backup/export/restore approval was observed in this smoke run.

## What Phase 24G-B must not claim
BETA_READY
broad data-loss prevention
platform backup preservation
production IndexedDB storage exists
storage migration complete
sync exists
cloud sync exists
account/auth/backend exists
production sync ready
adapter-aware backup/export/restore implemented for production
production adapter-aware backup/export/restore
guaranteed data-loss prevention
platform backup will preserve user data

## Guardrails
Phase 24G-B does not approve production adapter-aware backup/export/restore.
Phase 24G-B does not approve IndexedDB.
Phase 24G-B does not approve migration.
Phase 24G-B does not approve sync/cloud/account/auth/backend work.
Phase 24G-B does not modify historical validators.
Historical full-chain validators remain manual/local/scheduled audit guidance.
Full historical scripts/validate-*.js chain is not used as a Phase 24G-B merge-blocking requirement.

## Next recommended phase
Next recommended phase: Phase 24H — Phase 24 Closure / Phase 25 Planning Gate
Phase 24H is a separate closure/planning gate.
Phase 24G-B does not approve production adapter-aware backup/export/restore.
