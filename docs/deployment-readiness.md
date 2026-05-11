# Deployment readiness notes

## Purpose

These notes summarize the current deployment boundaries for the Shime Quiz release candidate. They are intended for release-readiness review and cautious staging/deployment planning, not as a production security certification.

## Local development and preview basics

Use the existing Node/Vite workflow:

```bash
npm ci
npm run build
npm run preview
```

For day-to-day local development, use:

```bash
npm run dev
```

The app is local-first and stores supported study data in the browser. Browser storage limits, user browser settings, extensions, and manual backup practices can affect the user experience.

## Frontend hosting caveat

The Shime frontend can be hosted as a static Vite app for core local-first study workflows. Static hosting alone is enough for app shell access, Dashboard, Library, Study Room, JSON/CSV import, paste text/Markdown import, and local `.txt`/`.md` import.

Static frontend hosting alone is not enough for PDF/DOCX/PPTX/ZIP import. Document import requires the user's browser to reach a separate EduGen service.

## Document import configuration

For document import, configure:

```text
VITE_FILE_PROCESSOR_URL=<browser-reachable EduGen service URL>
```

EduGen must be hosted or run separately from Shime. It is not bundled into Shime. The expected document import boundary is:

```text
PDF/DOCX/PPTX/ZIP file
-> EduGen extraction service
-> extraction.cleanedText
-> Shime text draft parsing
-> import validation
-> advisory quality review
-> preview
-> user confirms save
```

If `VITE_FILE_PROCESSOR_URL` is missing, incorrect, blocked by CORS/network policy, or points to a service unavailable from the user's browser, PDF/DOCX/PPTX/ZIP import should be considered unavailable in that deployment.

## Explicit non-goals for this release candidate

This release candidate does not include:

- Backend accounts, authentication, or cloud sync.
- OCR support.
- Built-in AI provider integration.
- External AI/API calls from Shime.
- API key support or BYOK support.
- EduGen bundled into the Shime frontend.
- Hosted production/security certification.
- Legacy `.doc` or `.ppt` import support.

## Suggested pre-release checklist

Before publishing or widening access:

- Run `npm ci`.
- Run `npm run build` and confirm it completes successfully.
- Run the static validator chain, including `node scripts/validate-public-release-docs.js`.
- Confirm README, public release notes, and deployment readiness notes use only allowed release claims.
- Confirm no runtime app behavior changed during documentation-only phases.
- Confirm `VITE_FILE_PROCESSOR_URL` is configured only in environments that should support PDF/DOCX/PPTX/ZIP import.
- Confirm the target browser can reach EduGen if document import is advertised for that environment.
- Confirm user-facing copy does not promise OCR, built-in AI generation, external AI/API integration, backend accounts, cloud sync, or production security certification.

## Post-deploy smoke checklist

After deploying or previewing a candidate environment:

- Open the app shell.
- Open Dashboard.
- Open Library.
- Open Study Room.
- Confirm JSON/CSV import surfaces are visible.
- Confirm text/Markdown and `.txt`/`.md` import surfaces are visible.
- If document import is intended, confirm the browser can reach the configured EduGen service through `VITE_FILE_PROCESSOR_URL`.
- Confirm manual AI prompt/export and manual AI output review surfaces are present, without claiming built-in AI generation.
- Confirm there is no API key/BYOK field.
- Confirm Dashboard "Kế hoạch hôm nay" completed items remain complete when clicked again.
- Refresh and confirm local state remains stable for the tested data.

## Release communication guidance

Use cautious language: release candidate, local-first, browser-local workflows, separate EduGen requirement for document import, manual AI workflow only, and user review before save. Avoid language that implies production certification, server-backed privacy guarantees, OCR, built-in AI generation, external AI/API integration, API-key/BYOK support, backend accounts, or cloud sync.


## Current RC deployment positioning lock

For the current release candidate, keep deployment wording conservative:

- A frontend-only deployment can host the Shime app shell and local-first study workflows.
- PDF/DOCX/PPTX/ZIP document import requires a separately hosted, browser-reachable EduGen File Processor service configured through `VITE_FILE_PROCESSOR_URL`.
- Browser-local study data remains in browser storage; this release candidate does not include backend accounts, authentication, or cloud sync.
- Manual AI workflows are copy/paste only; this release candidate does not include a built-in AI provider, AI/API integration, API-key field, or BYOK support.
- OCR is not included. EduGen extracts available document text and is not bundled into Shime.
- This documentation does not certify a hosted production or security posture; target deployments still need environment-specific verification.

## Final RC audit reference

See [`docs/final-rc-audit.md`](final-rc-audit.md) for the current release-candidate audit and release tag readiness checklist. The audit confirms that frontend-only deployment can host the app shell, while PDF/DOCX/PPTX/ZIP document import still requires a separate browser-reachable EduGen service.

The final RC audit does not certify production readiness or security posture, does not create a release tag, and does not publish a GitHub release. GitHub Actions / CI Green Verification remains a later step unless a current CI run is actually verified.

## EduGen boundary polish reference

For public-release copy and deployment evidence rules around the separate EduGen/File Processor boundary, see [`docs/edugen-boundary-polish.md`](edugen-boundary-polish.md). PDF/DOCX/PPTX/ZIP document import still requires `VITE_FILE_PROCESSOR_URL` to point to a separate browser-reachable processor; frontend-only hosting alone does not provide document conversion. This reference does not claim OCR, bundled EduGen, backend/cloud sync, production/security certification, release tag creation, or GitHub Release publication.

## Phase 10I cross-device portability reference

Cross-device export/import guidance is documented in [`docs/cross-device-export-import.md`](cross-device-export-import.md). Static hosting does not add automatic account/cloud/backend sync; users move data between browsers/devices through explicit backup/export and restore/import. Full backup files may include private quiz content, answers, progress, study history, and local app data.

## Final public release readiness re-audit

Final public release readiness is summarized in [`docs/final-public-release-readiness-reaudit.md`](final-public-release-readiness-reaudit.md). Deployment readiness remains bounded: static hosting does not add backend/cloud/account sync, document conversion, release publication, or certification claims.

## Phase 10K release candidate tag/publish gate

The release candidate tag/publish gate is documented in [`release-candidate-tag-publish-gate.md`](release-candidate-tag-publish-gate.md). It records that no release tag has been created, no GitHub Release has been published, no release package has been published, and explicit user approval is required before any tag or publish action. Known evidence gaps and allowed/forbidden claims remain documented.


## Phase 10L manual evidence reference
Manual evidence run pack: [`docs/manual-evidence-run-pack.md`](manual-evidence-run-pack.md) includes optional deployment-adjacent checks for configured EduGen and browser evidence. It does not add backend/cloud sync or publish the release.

## Phase 10M release tag creation plan

Tag creation planning is documented in [`docs/release-tag-creation-plan.md`](release-tag-creation-plan.md). Deployment readiness does not imply a tag has been created, a GitHub Release has been published, or a release package has been published.

## GitHub Release publication plan

Publication planning is documented in [`docs/github-release-publication-plan.md`](github-release-publication-plan.md). Deployment readiness remains separate from release publication, and Phase 10N does not publish a GitHub Release or release package.


## Release package assembly planning

See [`docs/release-package-assembly-plan.md`](release-package-assembly-plan.md) for future user-approved package assembly, package exclusions, and verification. Frontend deployment and package upload remain separate decisions.

## Phase 10P final release execution checklist

The final release execution checklist is documented in [`docs/final-release-execution-checklist.md`](final-release-execution-checklist.md). It keeps deployment/release actions explicit, separate, and user-approved, and it does not claim production/security/accessibility/performance certification.

## Final main release authorization reference

See [`docs/final-main-release-authorization.md`](final-main-release-authorization.md) for the final main verification / release authorization packet and explicit approval gates.

## Phase 10R release freeze note

See [Release Candidate Freeze / Final Decision Memo](release-candidate-freeze-final-decision.md). Deployment/release execution remains unpublished and requires explicit user approval; known evidence gaps remain documented.

## Phase 10S evidence log reference

Future deployment or release evidence can be recorded in [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) only after actual runs. Phase 10S adds a template only and does not execute manual evidence, create a tag, publish a GitHub Release, create/publish a release package, capture screenshots, claim Lighthouse/Core Web Vitals passed, change package version/dependencies, change runtime behavior, or certify production/security/accessibility/performance readiness.

## Phase 10T manual evidence execution checklist

Manual evidence execution guidance is documented in [`docs/manual-evidence-execution-checklist.md`](manual-evidence-execution-checklist.md). Phase 10T adds a checklist/evidence capture guide only: no manual evidence was executed, no screenshot files were added, no mobile UX pass was claimed, no configured EduGen import pass was claimed, no cross-device restore pass was claimed, no E2E pass was claimed, no Lighthouse/Core Web Vitals pass was claimed, no release tag was created, no GitHub Release was published, no release package was created or published, package version/dependencies remain unchanged, runtime app behavior was not changed, and no production/security/accessibility/performance certification is claimed. Future results should be copied into [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) only after actual evidence exists.


## Phase 11A cross-device transfer UX decision note

Deployment readiness now references the planning-only cross-device transfer UX decision at [`docs/cross-device-transfer-ux-decision.md`](cross-device-transfer-ux-decision.md). Deployment claims remain unchanged: current portability remains manual backup/export/import; no QR transfer, Web Share, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, runtime behavior change, package/dependency change, release package, release tag, or GitHub Release was added.


## Phase 11B transfer UX copy note

Phase 11B improves the user-facing wording of the existing backup/restore UI for manual device transfer. Deployment claims remain unchanged: current portability still uses manual backup/export/import, no QR transfer, Web Share, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, storage schema change, backup file format change, package/dependency change, release package, release tag, or GitHub Release was added.

## Phase 11C backup transfer safety hardening note

Deployment readiness now references the backup transfer safety hardening plan at [`docs/backup-transfer-safety-hardening.md`](backup-transfer-safety-hardening.md). Deployment claims remain unchanged: current portability still uses manual backup/export/import, no backup format changed, no storage schema changed, no import/restore behavior changed, no checksum/compression/encryption was implemented, no QR transfer, Web Share, WebRTC/session transfer, backend/cloud/account sync, automatic sync, package/dependency change, release package, release tag, or GitHub Release was added.

## Phase 11D Web Share / mobile sharing prototype plan

Phase 11D documents a future Web Share / mobile sharing prototype plan in [`docs/web-share-mobile-sharing-prototype-plan.md`](web-share-mobile-sharing-prototype-plan.md). The deployed app remains local-first/browser-local, and current transfer remains manual backup/export/import. Phase 11D does not implement Web Share runtime, QR transfer, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, backup format/storage schema/import behavior changes, package/dependency changes, or release publication.


## Phase 11E deployment note

Phase 11E adds an optional browser Web Share runtime prototype for backup files where supported. It requires no backend service, adds no dependencies, changes no package version, and does not create cloud/account sync, automatic sync, QR transfer, WebRTC/session transfer, encryption, backup format changes, storage schema changes, or import/restore behavior changes. Normal backup file download remains the fallback.


Phase 11E validation phrases: backup files may include quiz content, answers, progress, and study history; normal backup file download remains the fallback; no QR transfer; no WebRTC/session transfer; no backend/cloud/account sync; no cloud/automatic sync; no automatic sync; no encryption implementation.

## Phase 11F Web Share fallback deployment note

Phase 11F hardens the optional Web Share runtime fallback path and documents it in [`docs/web-share-runtime-qa-fallback-hardening.md`](web-share-runtime-qa-fallback-hardening.md). The feature remains browser/platform-dependent and requires no backend service, no account service, no cloud sync service, no new dependency, and no release infrastructure change.

Normal backup file download remains fallback, restore from backup remains available, backup files may include private quiz/study data, and the app does not upload backup files to a server. No QR transfer, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, backup format change, storage schema change, or import/restore behavior change is added.


## Phase 11H transfer track closure deployment note

Phase 11H adds [`docs/cross-device-transfer-track-closure.md`](cross-device-transfer-track-closure.md), a release-readiness re-audit for the Phase 11 cross-device transfer track. The deployed app remains local-first/browser-local. Web Share support depends on browser/platform capability, normal backup file download remains fallback, and restore from backup remains available.

No new backend service, account service, cloud sync service, automatic sync service, QR/session transfer service, encryption service, dependency, package version change, release package, release tag, or GitHub Release is introduced by Phase 11H.

## Phase 12A roadmap/scope lock deployment note

Phase 12A adds the Phase 12 roadmap/scope lock in [`phase12-roadmap-risk-register.md`](phase12-roadmap-risk-register.md). The deployed app remains a local-first browser app with no backend service, no cloud/account sync service, and no automatic sync service introduced by Phase 12A.

EduGen/File Processor remains separate. Document import that requires PDF/DOCX/PPTX/ZIP conversion still requires a browser-reachable `VITE_FILE_PROCESSOR_URL`; frontend-only hosting does not provide document conversion by itself. Phase 12A does not add IndexedDB runtime migration, storage quota warning UI, FSRS, QR transfer, transfer-code flow, WebRTC/session transfer, encryption, dependency changes, package version changes, release package creation, release tag creation, or GitHub Release publication.

## Phase 12B storage planning note

Phase 12B documents storage capacity risk and future IndexedDB migration planning. This does not change the deployment model: Shime Quiz remains a local-first browser app with no backend/cloud/account sync, and manual backup/export/import remains the portability model.

EduGen/File Processor remains separate. Document import that depends on PDF/DOCX/PPTX/ZIP conversion still requires a browser-reachable `VITE_FILE_PROCESSOR_URL`; frontend-only hosting does not provide document conversion by itself.

## Phase 12C storage quota warning deployment note

Phase 12C adds an advisory storage quota warning that depends on browser storage estimate API availability. It does not require a backend, cloud service, account system, or automatic sync. Shime Quiz remains a local-first browser app, and manual backup/export/import remains the portability model.

## Phase 12D Dashboard Today Card UX planning deployment note

Phase 12D adds Dashboard Today Card UX planning only and does not change deployment requirements. The app remains a local-first browser app with no backend/cloud/account sync requirement. EduGen/File Processor remains separate; document import that uses PDF/DOCX/PPTX/ZIP conversion still requires a browser-reachable `VITE_FILE_PROCESSOR_URL`, and frontend-only hosting does not provide document conversion by itself. Manual backup/export/import remains the portability model.



## Phase 12E Dashboard Today Card runtime deployment note

Phase 12E adds a Dashboard Today Card runtime surface and does not change deployment requirements. The app remains a local-first/browser-local frontend with no backend, cloud, or account sync requirement. Manual backup/export/import remains the portability model, and EduGen/File Processor boundaries for document conversion remain unchanged.

## Phase 12F unit test planning deployment note

Phase 12F Unit Test Foundation planning does not change deployment requirements. Shime remains a local-first browser app with no backend/cloud/account sync requirement. EduGen/File Processor remains separate; document import using PDF/DOCX/PPTX/ZIP conversion still requires a browser-reachable `VITE_FILE_PROCESSOR_URL`, and frontend-only hosting does not provide document conversion by itself. Manual backup/export/import remains the portability model.


## Phase 12G unit test tooling deployment note

Phase 12G unit test tooling does not change deployment requirements. The app remains a local-first browser app with no backend/cloud/account sync requirement. EduGen/File Processor remains separate, document conversion still requires a browser-reachable `VITE_FILE_PROCESSOR_URL` when using PDF/DOCX/PPTX/ZIP conversion, frontend-only hosting does not provide document conversion by itself, and manual backup/export/import remains the portability model.

## Phase 12H Study Flow micro-feedback planning deployment note

Phase 12H Study Flow micro-feedback planning does not change deployment requirements. The app remains a local-first browser app with no backend/cloud/account sync requirement. EduGen/File Processor remains separate; document import using PDF/DOCX/PPTX/ZIP conversion still requires a browser-reachable `VITE_FILE_PROCESSOR_URL`, and frontend-only hosting does not provide document conversion by itself. Manual backup/export/import remains the portability model.


## Phase 12I Study Flow runtime deployment note

Phase 12I Study Flow micro-feedback runtime does not change deployment requirements. It is a browser-local Study Room UX update and does not add backend services, account/cloud sync, new environment variables, package dependencies, or deployment infrastructure.

The app remains local-first/browser-local. EduGen/File Processor remains separate; document import using PDF/DOCX/PPTX/ZIP conversion still requires a browser-reachable `VITE_FILE_PROCESSOR_URL`, and frontend-only hosting does not provide document conversion by itself. Manual backup/export/import remains the portability model.

## Phase 12J closure / deployment boundary

Phase 12J closes Phase 12 and does not change deployment requirements. The app remains a local-first/browser-local frontend app.

Phase 12J does not add a backend, cloud/account sync, automatic sync, encryption, release package, release tag, GitHub Release, or hosted-production certification.

EduGen/File Processor remains separate from the frontend app. Document conversion for PDF/DOCX/PPTX/ZIP still requires a browser-reachable `VITE_FILE_PROCESSOR_URL`; frontend-only hosting does not provide document conversion by itself. Manual backup/export/import remains the portability model.

