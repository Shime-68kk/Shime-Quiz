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

