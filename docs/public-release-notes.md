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

- Built-in AI quiz generation.
- External AI/API integration from Shime.
- API key support or BYOK support.
- OCR support.
- Backend accounts, authentication, cloud sync, or cross-device sync.
- Hosted production/security certification.
- EduGen bundled into the Shime frontend.
- Frontend-only PDF/DOCX/PPTX/ZIP import without a browser-reachable EduGen service.
- Legacy `.doc` or `.ppt` import support.
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

## Final RC smoke status

Phase 8H final RC manual smoke passed on the user's Ubuntu browser. The verified surfaces included app shell, Dashboard, Library, Study Room access, Dashboard "Kế hoạch hôm nay" completion guard behavior, import surfaces, manual AI prompt/export, manual AI output review, and the absence of built-in AI generation or API-key/BYOK fields.
