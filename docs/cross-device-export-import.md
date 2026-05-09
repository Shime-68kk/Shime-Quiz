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
