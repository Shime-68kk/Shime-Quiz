# Phase 10I — Cross-Device Export/Import Polish

## Purpose of Phase 10I

Phase 10I documents the cross-device export/import and backup/restore portability model for ShimeChamhoc v2 before public release. It is a documentation, static-validator, and CI-registration phase. It does not change backup/restore logic, storage schema, import/parser logic, runtime app behavior, package version, dependencies, release tags, GitHub Releases, or release packages.

## Current baseline

- The project is completed/merged through Phase 10H.
- Public landing/root route polish exists.
- Social preview metadata exists.
- Direct-route SPA fallback audit docs exist.
- Screenshot capture checklist exists.
- README public-facing rewrite exists.
- Performance/bundle-size audit docs exist.
- Mobile UX smoke checklist exists.
- EduGen/File Processor boundary docs exist.
- The release tag has not been created.
- The GitHub Release has not been published.
- The release package has not been published.
- Package version has not been changed by Phase 9A–10H.

## Local-first portability model

Shime is local-first and browser-local:

- Data is stored in browser-local storage.
- No account is required.
- No backend/cloud sync is provided.
- No automatic cross-device sync is provided.
- Moving data between devices requires explicit export/import or backup/restore by the user.

This means a quiz or study history saved on one browser/device will not automatically appear on another device. Users must export a backup or content file from the source device and import or restore it on the destination device or clean browser profile.

## Cross-device user workflow

1. On the source device/browser, create or load a sample quiz.
2. Export or backup data using the app's existing backup/export surface.
3. Save the backup file somewhere private and user-controlled.
4. Before replacing data on another device, keep a safe copy of any existing destination data.
5. On the destination device/browser or clean browser profile, import/restore the backup.
6. Verify Library content appears after restore where applicable.
7. Verify Dashboard/progress behavior where applicable.
8. Verify Study Room can open the restored quiz where applicable.
9. Confirm no cloud sync, account sync, or backend sync is implied by the UI or docs.

## Backup privacy notes

A full backup may include quiz content, answers, progress, study history, and local app data. Treat backup files as private user data.

- Do not upload backups publicly.
- Store backups in a location the user trusts.
- Share backups only with people who should see the quiz content, answers, and study data.
- Redacted/progress-only modes should be described only if supported by the actual app.
- No encrypted backup claim unless implemented and tested.

## Supported import/export surfaces

- Backup/restore supports app data portability when users explicitly export and restore data.
- JSON import remains a local content import surface.
- CSV import remains a local content import surface.
- text/Markdown paste import remains a local content import surface.
- Local `.txt/.md` file import remains a local content import surface.
- PDF/DOCX/PPTX/ZIP requires separate configured EduGen/File Processor service and a browser-reachable processor URL.
- EduGen/File Processor is not bundled into Shime.
- Frontend-only hosting alone does not provide document conversion.
- No OCR claim is made.

## Manual smoke checklist

Use this checklist only when an actual browser/profile run is available:

1. Create or load a sample quiz on the source browser/profile.
2. Save the quiz to Library.
3. Optionally complete some study items so progress or history can be checked.
4. Export/backup the current local app data.
5. Move the backup file to a clean browser profile or destination device.
6. Restore/import the backup.
7. Verify Library content appears.
8. Verify Dashboard/progress behavior where applicable.
9. Verify Study Room can open the restored quiz.
10. Verify backup warnings/copy are understandable.
11. Verify no cloud sync/account sync/backend sync is implied.
12. Verify unsupported claims are absent.

## Evidence rules

- Do not claim cross-device restore passed unless an actual source/destination device or clean-profile run passes.
- Do not claim all state categories are preserved unless each was actually checked.
- Do not claim cloud sync.
- Do not claim account sync.
- Do not claim backend sync.
- Do not claim encrypted backups unless implemented.
- Do not claim production/security/accessibility certification.
- Do not claim release tag created.
- Do not claim GitHub Release published.

## Claims control

Safe claims after Phase 10I:

- Cross-device export/import guidance exists.
- Manual backup/restore portability workflow is documented.
- No automatic cloud/account sync is provided.
- Full backups may contain private study data and answers.

Do not claim:

- Cross-device restore passed without actual run evidence.
- Encrypted backups unless implemented and tested.
- Backend/cloud sync.
- Account sync.
- Built-in AI generation.
- External AI/API integration.
- API key/BYOK support.
- OCR.
- EduGen bundled into Shime.
- Frontend-only PDF/DOCX/PPTX/ZIP conversion.
- Production/security/accessibility certification.
- Release tag created.
- GitHub Release published.

## Recommended next step

Recommended next phase after this, if accepted: **Phase 10J — Final Public Release Readiness Re-Audit**, or run an actual manual cross-device backup/restore smoke if the user wants cross-device portability evidence before release.

## Final public release readiness re-audit

The final public release readiness re-audit is documented in [`docs/final-public-release-readiness-reaudit.md`](final-public-release-readiness-reaudit.md). It records cross-device export/import guidance as documentation only and does not claim cross-device restore passed without actual source/destination or clean-profile evidence.


## Phase 10L manual evidence reference
Manual evidence run pack: [`docs/manual-evidence-run-pack.md`](manual-evidence-run-pack.md) includes the optional cross-device backup/restore evidence checklist. Cross-device restore is not claimed as passed without a source/destination or clean-profile run.

## Phase 10S evidence log reference

Record future cross-device backup/restore results in [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) only after an actual source/destination or clean-profile run. Phase 10S adds the template only and does not claim cross-device restore passed, does not add account/cloud sync, and does not change runtime behavior or dependencies.

## Phase 10T manual evidence execution checklist

Manual evidence execution guidance is documented in [`docs/manual-evidence-execution-checklist.md`](manual-evidence-execution-checklist.md). Phase 10T adds a checklist/evidence capture guide only: no manual evidence was executed, no screenshot files were added, no mobile UX pass was claimed, no configured EduGen import pass was claimed, no cross-device restore pass was claimed, no E2E pass was claimed, no Lighthouse/Core Web Vitals pass was claimed, no release tag was created, no GitHub Release was published, no release package was created or published, package version/dependencies remain unchanged, runtime app behavior was not changed, and no production/security/accessibility/performance certification is claimed. Future results should be copied into [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) only after actual evidence exists.


## Phase 11A cross-device transfer UX decision

The cross-device transfer UX decision plan is documented in [`docs/cross-device-transfer-ux-decision.md`](cross-device-transfer-ux-decision.md). Current portability remains manual backup/export/import. Phase 11A is planning only: no QR transfer implemented, no Web Share implementation added, no WebRTC/session transfer implemented, no backend/cloud/account sync added, no automatic sync added, no encryption claim added, no backup/restore/import/storage runtime behavior changed, no package version/dependencies changed, and no release package/tag/GitHub Release was created or published.


## Phase 11B transfer UX copy polish

Phase 11B updates the existing backup/restore surface with friendlier transfer language such as Transfer data, Save backup file, Restore from backup, and Move my quizzes to this device. Current portability remains manual backup/export/import via a backup file. No QR transfer was implemented, no Web Share implementation was added, no WebRTC/session transfer was implemented, no backend/cloud/account sync was added, no automatic sync was added, no encryption implementation was added, no storage schema changed, no backup file format changed, no package version/dependencies changed, and no release package/tag/GitHub Release was created or published.

## Phase 11C backup transfer safety hardening

Backup transfer safety hardening is documented in [`docs/backup-transfer-safety-hardening.md`](backup-transfer-safety-hardening.md). Current portability remains manual backup/export/import via a backup file. Phase 11C documents future backup metadata, checksum/error-detection, import preview, merge/replace/keep-both, duplicate/conflict handling, privacy, compatibility, and safe-failure requirements only. No backup format changed, no storage schema changed, no import/restore behavior changed, no checksum/compression/encryption was implemented, no QR transfer was implemented, no Web Share implementation was added, no WebRTC/session transfer was implemented, no backend/cloud/account sync was added, no automatic sync was added, no package version/dependencies changed, and no release package/tag/GitHub Release was created or published.

## Phase 11D Web Share / mobile sharing prototype plan

The Web Share / mobile sharing prototype plan is documented in [`docs/web-share-mobile-sharing-prototype-plan.md`](web-share-mobile-sharing-prototype-plan.md). It describes how a future mobile share-sheet option could help users move a backup file while keeping the normal manual backup/export/import and restore from backup file fallback. No Web Share runtime was implemented, and no QR/WebRTC/cloud/account/automatic sync, encryption, backup format change, storage schema change, or import/restore behavior change was added.


## Phase 11E Web Share fallback note

Phase 11E adds an optional Web Share runtime prototype where supported by the browser/platform. Current portability still remains manual backup/export/import: normal backup file download remains available, restore from backup file remains available, and unsupported browsers keep the existing file fallback. This does not implement QR transfer, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, backup format changes, storage schema changes, or import/restore behavior changes.


Phase 11E validation phrases: backup files may include quiz content, answers, progress, and study history; normal backup file download remains the fallback; no QR transfer; no WebRTC/session transfer; no backend/cloud/account sync; no cloud/automatic sync; no automatic sync; no encryption implementation.

## Phase 11F Web Share fallback hardening

Phase 11F adds [`docs/web-share-runtime-qa-fallback-hardening.md`](web-share-runtime-qa-fallback-hardening.md) and improves Web Share fallback guidance while preserving the current local-first manual backup/export/import model. Normal backup file download remains fallback, restore from backup remains available, and unsupported browser, user cancel, and share failure paths are non-destructive.

No QR transfer, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, backup format change, storage schema change, import/restore behavior change, package/dependency change, release tag, GitHub Release, or release package is added by Phase 11F.


## Phase 11H track closure note

Phase 11H adds the Phase 11 cross-device transfer track closure and release-readiness re-audit in [`docs/cross-device-transfer-track-closure.md`](cross-device-transfer-track-closure.md). It confirms that users can save backup files, restore from backup files, and use the Web Share runtime prototype where supported, while normal backup file download remains fallback.

The closure re-states that transfer remains local-first/browser-local and user-initiated. Backup files may include private quiz/study data. No QR transfer, transfer-code flow, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, backup format/storage schema/import behavior change, package/dependency change, release package, release tag, or GitHub Release is added by Phase 11H.
