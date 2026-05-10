# Shime Quiz public release notes

## Product summary

Shime Quiz is a local-first study and quiz app for organizing study content, importing quiz drafts, reviewing items in Study Room, and tracking progress in the browser. The current release-candidate focus is reliable local study workflows, transparent import boundaries, and conservative release claims.

## Current release-candidate status

Shime Quiz is completed and merged through Phase 8G, with release-candidate status documentation and validator claim guardrails in place. Phase 8H final RC manual smoke passed on the user's Ubuntu browser, covering app shell access, Dashboard, Library, Study Room access, Dashboard "Kế hoạch hôm nay" completion guard behavior, import surfaces, manual AI workflow surfaces, and the absence of built-in AI generation/API-key UI claims.

This status does not mean hosted production certification, security certification, or broad device certification. It means the current release-candidate documentation, validator chain, and the Phase 8H Ubuntu manual smoke evidence support a cautious RC handoff.

## Supported study and import workflows

The current release candidate supports these core workflows:

- Local study library management in the browser.
- Study Room access for supported local quiz/study items.
- Dashboard study planning and progress surfaces, including the manually verified today-plan completion guard.
- JSON/CSV import with validation and preview before save.
- Paste text/Markdown draft import.
- Local `.txt`/`.md` draft import.
- PDF/DOCX/PPTX/ZIP draft import through a separately configured EduGen file processor service.
- Advisory quiz draft quality review before save, including duplicate multiple-choice choice text warnings and duplicate explicit choice ID warnings.
- Manual AI prompt/export workflow, where the user copies a locally generated prompt to an external AI tool by choice.
- Manual AI output import hardening/advisory format review before using the existing text/Markdown import path.
- AI readiness/provider contract documentation and AI draft evaluation fixtures for future planning and test coverage.

Existing import validation remains the hard-blocking layer. Imported or generated draft content still requires preview and explicit user confirmation before save.

## Document import and EduGen boundary

Document import for PDF/DOCX/PPTX/ZIP depends on EduGen as a separate service. Shime does not bundle EduGen. The supported boundary is:

```text
PDF/DOCX/PPTX/ZIP file
-> EduGen POST /api/extract/single
-> extraction.cleanedText
-> Shime parseTextQuizDraft
-> import validation
-> advisory quality review
-> preview
-> user confirms save
```

EduGen document extraction is not OCR and is not AI generation. A frontend-only deployment cannot import PDF/DOCX/PPTX/ZIP unless the user's browser can reach a configured EduGen service.

## Manual AI workflow

Shime currently provides manual AI support only. It can build a prompt locally so the user can copy that prompt into an external AI tool, then paste the result back into Shime's existing text/Markdown import review path.

Shime does not provide built-in AI generation, does not call external AI APIs, does not handle API keys or BYOK, and does not guarantee that AI output is correct, private, or high quality. Users should review AI-assisted draft output before saving it.

## Local-first and privacy-conscious positioning

Shime is local-first: core study data and import review flows are designed around browser-local operation. This can reduce unnecessary data movement for ordinary local study workflows.

This is not a hosted production security certification. Local browser storage, imported files, full backups, and copied prompts can still expose sensitive content depending on the user's device, browser, extensions, backup sharing, and external tools they choose to use.

## Known limitations and unsupported features

The current release candidate does not include:

- Does not include built-in AI quiz generation.
- Does not include external AI/API integration from Shime.
- Does not include API key support or BYOK support.
- Does not include OCR support.
- Does not include backend accounts, authentication, cloud sync, or cross-device sync.
- Does not include hosted production/security certification.
- Does not include EduGen bundled into the Shime frontend.
- Does not include frontend-only PDF/DOCX/PPTX/ZIP import without a browser-reachable EduGen service.
- Does not include legacy `.doc` or `.ppt` import support.
- Guaranteed correctness, privacy, or quality for content produced by external AI tools.

## Honest deployment notes

Shime can be built and previewed as a Vite frontend. Static frontend hosting can serve the core app, JSON/CSV import, text/Markdown import, local `.txt`/`.md` import, Study Room, Dashboard, and local-first workflows.

PDF/DOCX/PPTX/ZIP document import additionally requires `VITE_FILE_PROCESSOR_URL` to point to a separately hosted EduGen service reachable from the user's browser. Without that reachable service, document extraction should be treated as unavailable even if the frontend is deployed successfully.

## Recommended user setup

For the most complete RC experience:

1. Run or deploy the Shime frontend.
2. Keep regular browser/local backups of important study data.
3. Configure and run EduGen separately when document import is needed.
4. Set `VITE_FILE_PROCESSOR_URL` for environments that need PDF/DOCX/PPTX/ZIP import.
5. Review every imported or AI-assisted draft in the preview and advisory quality review before saving.
6. Avoid claiming production security certification, OCR, built-in AI generation, API-key/BYOK support, backend accounts, or cloud sync for this release candidate.

## Demo and screenshot planning

For public walkthroughs and reviewer demos, see [`docs/demo-script.md`](demo-script.md). For README/public documentation capture planning, see [`docs/screenshot-checklist.md`](screenshot-checklist.md) and [`docs/visual-asset-guidance.md`](visual-asset-guidance.md). These documents preserve the current release-candidate boundaries around manual AI workflows, separate EduGen document import, no OCR, no backend/cloud sync, and no hosted production or security certification claims.


## Public demo samples

A small public demo sample pack is available at [`docs/demo-samples/README.md`](demo-samples/README.md). It provides synthetic JSON, CSV, text/Markdown, and manual AI paste-back samples for demos and screenshot preparation without changing runtime behavior or adding external-service dependencies.

## In-app demo sample quickstart

The Library includes a local demo sample quickstart for trying Shime without manually uploading sample files. It loads a safe sample quiz into the same preview, import validation, advisory quality review, and confirm-save flow used by other imports. It does not auto-save, call AI/API, use EduGen, or change the document-import boundary.

A first-run Library hint helps users discover the quickstart. The hint is only guidance copy: it does not auto-load the sample, does not auto-save, does not change storage schema, does not call AI/API, and does not require EduGen.

When the Library has no saved quiz items, an empty-state onboarding guide points users to the local demo sample, JSON/CSV import, text/Markdown paste import, the manual AI prompt/export copy-paste workflow, and separately configured EduGen document import. The empty state is guidance only: it does not auto-load, auto-save, bypass preview/review/confirm-save, call AI/API, or require EduGen.

When Dashboard opens before a user has meaningful saved library or study data, a first-run callout points to the Library as the safe start location. It mentions the demo sample quickstart, JSON/CSV import, text/Markdown import, manual AI copy/paste workflow, and separately configured EduGen document import. It does not auto-load, auto-save, call AI/API, require EduGen, or bypass preview/review/confirm-save.



## Current release-candidate positioning

Phase 8N through Phase 8T completed the onboarding and demo quickstart polish for this release candidate:

- Phase 8N added the in-app Library **Dùng quiz mẫu** quickstart.
- Phase 8O verified the demo sample quickstart in the user's Ubuntu browser.
- Phase 8P added a first-run hint beside the Library quickstart.
- Phase 8Q added Library empty-state onboarding.
- Phase 8R verified Library empty-state onboarding in the user's Ubuntu browser.
- Phase 8S added Dashboard first-run onboarding.
- Phase 8T verified Dashboard first-run onboarding in the user's Ubuntu browser.

These improvements preserve the existing import safety model: the demo sample and import flows still require preview, validation, advisory quality review, and explicit confirm-save before content is stored locally. They do not auto-load or auto-save content. EduGen remains a separate configured service for PDF/DOCX/PPTX/ZIP document import, and AI support remains a manual copy/paste workflow only; Shime does not call AI/API providers.

## Final RC smoke status

Phase 8H final RC manual smoke passed on the user's Ubuntu browser. The verified surfaces included app shell, Dashboard, Library, Study Room access, Dashboard "Kế hoạch hôm nay" completion guard behavior, import surfaces, manual AI prompt/export, manual AI output review, and the absence of built-in AI generation or API-key/BYOK fields.

## Onboarding E2E smoke coverage

Phase 8V adds automated Playwright smoke coverage for the onboarding/demo quickstart flows introduced in Phase 8N through Phase 8S. The targeted smoke path checks Dashboard first-run onboarding, Library onboarding, the **Dùng quiz mẫu** quickstart, preview/validation/quality review visibility, and the absence of auto-save before explicit confirmation.

This is test automation only. It does not change runtime app behavior, import/parser logic, EduGen behavior, AI/API behavior, storage schema, scoring, SRT, or mastery logic.


## Local E2E verification setup

Phase 8W adds [`docs/local-e2e-verification.md`](local-e2e-verification.md) for Ubuntu maintainers who need to install Playwright Chromium and run `npm run test:e2e:smoke` plus `npm run test:e2e:onboarding`. The onboarding E2E coverage exists, and the local Ubuntu run passed after Playwright Chromium was installed.

A future automated E2E pass should only be claimed when the relevant command actually exits successfully in that environment. Missing Chromium or browser-launch failures should be reported as environment-blocked, not as product failures. EduGen is not required for onboarding E2E; PDF/DOCX/PPTX/ZIP document-import E2E would require a separate browser-reachable EduGen service if that path is tested.

## Final RC audit / release tag readiness

Phase 8X adds [`docs/final-rc-audit.md`](final-rc-audit.md) as the final release-candidate audit and release tag readiness reference for the current Phase 8W baseline. It audits current capabilities, caveats, Ubuntu browser smoke evidence, local onboarding E2E evidence, EduGen boundaries, manual AI boundaries, unsupported claims, and later release-management next steps.

The final RC audit does not create a release tag, publish a GitHub release, certify production readiness, certify security posture, or claim GitHub Actions / CI Green Verification unless a current CI run is actually verified.

## Phase 10H — EduGen boundary polish

Phase 10H adds [`docs/edugen-boundary-polish.md`](edugen-boundary-polish.md) to keep public copy and deployment guidance clear about the EduGen/File Processor boundary. JSON/CSV/text/Markdown/`.txt/.md` remain local import surfaces. PDF/DOCX/PPTX/ZIP document import requires a separately configured, browser-reachable EduGen/File Processor service through `VITE_FILE_PROCESSOR_URL`; frontend-only hosting alone does not provide document conversion. This phase does not bundle EduGen, add OCR, add backend/cloud sync, change import/parser behavior, create a release tag, publish a GitHub Release, or certify production/security readiness.

## Phase 10I — Cross-device export/import guidance

Phase 10I adds [`docs/cross-device-export-import.md`](cross-device-export-import.md) to explain the local-first portability model. Moving data between devices requires explicit user export/import/backup/restore; full backups may contain private study data and answers. This phase does not add cloud/account/backend sync, encrypted backups, runtime backup/restore changes, package/dependency changes, a release tag, or a GitHub Release.

## Phase 10J final public release readiness re-audit

Phase 10J adds [`docs/final-public-release-readiness-reaudit.md`](final-public-release-readiness-reaudit.md), a final public readiness inventory after Phase 10A–10I. It documents remaining evidence gaps and claim guardrails. It does not create a release tag, publish a GitHub Release, publish a release package, or certify production/security/accessibility/performance readiness.

## Phase 10K release candidate tag/publish gate

The release candidate tag/publish gate is documented in [`release-candidate-tag-publish-gate.md`](release-candidate-tag-publish-gate.md). It records that no release tag has been created, no GitHub Release has been published, no release package has been published, and explicit user approval is required before any tag or publish action. Known evidence gaps and allowed/forbidden claims remain documented.


## Phase 10L manual evidence reference
Manual evidence run pack: [`docs/manual-evidence-run-pack.md`](manual-evidence-run-pack.md) exists for optional screenshot/mobile/configured EduGen/cross-device/E2E/Lighthouse checks. Public notes should not claim those runs passed without evidence.

## Phase 10M release tag creation plan

Release tag creation planning is documented in [`docs/release-tag-creation-plan.md`](release-tag-creation-plan.md). No release tag has been created and no GitHub Release has been published by this planning phase.

## Phase 10N GitHub Release publication plan

Phase 10N adds [`docs/github-release-publication-plan.md`](github-release-publication-plan.md), documenting how a future GitHub Release can be prepared and published only after explicit user approval. No release tag, GitHub Release, or release package is created by this phase.


## Release package assembly planning

Phase 10O adds [`docs/release-package-assembly-plan.md`](release-package-assembly-plan.md) for future user-approved source/deploy/evidence package assembly. No release package has been created, published, or uploaded.

## Phase 10P final release execution checklist

Phase 10P adds the final release execution checklist: [`docs/final-release-execution-checklist.md`](final-release-execution-checklist.md). It documents a future user-approved execution flow only; no release tag, GitHub Release, release package, asset upload, or package version change is claimed.

## Final main release authorization reference

See [`docs/final-main-release-authorization.md`](final-main-release-authorization.md) for the final main verification / release authorization packet. No release tag, GitHub Release, or release package publication is claimed here.

## Phase 10R release freeze note

See [Release Candidate Freeze / Final Decision Memo](release-candidate-freeze-final-decision.md). The release candidate freeze memo exists; no release tag, GitHub Release, release package, production/security/accessibility/performance certification, or unsupported AI/EduGen/OCR/backend/cloud/account-sync claim is made.

## Phase 10S manual evidence results log note

[`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) exists as an optional future evidence result template. Phase 10S does not execute manual evidence, capture screenshots, claim mobile/EduGen/cross-device/Lighthouse PASS, create a release tag, publish a GitHub Release, create or publish a release package, change package version/dependencies, change runtime behavior, or add certification claims.

## Phase 10T manual evidence execution checklist

Manual evidence execution guidance is documented in [`docs/manual-evidence-execution-checklist.md`](manual-evidence-execution-checklist.md). Phase 10T adds a checklist/evidence capture guide only: no manual evidence was executed, no screenshot files were added, no mobile UX pass was claimed, no configured EduGen import pass was claimed, no cross-device restore pass was claimed, no E2E pass was claimed, no Lighthouse/Core Web Vitals pass was claimed, no release tag was created, no GitHub Release was published, no release package was created or published, package version/dependencies remain unchanged, runtime app behavior was not changed, and no production/security/accessibility/performance certification is claimed. Future results should be copied into [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) only after actual evidence exists.


## Phase 11A cross-device transfer UX decision note

The cross-device transfer UX decision plan is documented in [`docs/cross-device-transfer-ux-decision.md`](cross-device-transfer-ux-decision.md). It is not a shipped runtime feature: current portability remains manual backup/export/import; no QR transfer, Web Share, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, runtime behavior change, package/dependency change, release package, release tag, or GitHub Release was added.


## Phase 11B transfer UX copy polish note

Phase 11B adds friendlier transfer/backup UI copy for the existing local-first backup flow. It helps users understand that moving quizzes between devices currently means saving a backup file and restoring it on the other device. This is not QR transfer, Web Share, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, a storage schema change, a backup file format change, a package/dependency change, a release package, a release tag, or a published GitHub Release.

## Phase 11C backup transfer safety hardening note

Phase 11C adds [`docs/backup-transfer-safety-hardening.md`](backup-transfer-safety-hardening.md) as a planning-only safety foundation for future transfer work. It documents future schema/version marker, checksum/error-detection, import preview, merge/replace/keep-both, duplicate/conflict handling, privacy, compatibility, and safe-failure requirements. It does not change the backup format, storage schema, import/restore behavior, package/dependencies, or release status, and it does not implement checksum, compression, encryption, QR transfer, Web Share, WebRTC/session transfer, backend/cloud/account sync, or automatic sync.

