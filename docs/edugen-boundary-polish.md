# EduGen Boundary / Integration Polish

## Purpose of Phase 10H

Phase 10H documents and validates the EduGen/File Processor boundary before public release. It is a documentation, static-validator, and CI-registration phase. It does not bundle EduGen into Shime, does not change import/parser behavior, and does not add OCR, backend/cloud sync, AI/API integration, API-key/BYOK support, a release tag, or a GitHub Release.

## Current baseline

- The project is completed/merged through Phase 10G.
- Public landing/root route polish exists.
- Social preview metadata exists.
- Direct-route SPA fallback audit docs exist.
- Screenshot capture checklist exists.
- README public-facing rewrite exists.
- Performance/bundle-size audit docs exist.
- Mobile UX smoke checklist exists.
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been published.

## Supported local import surfaces

These import paths are local/browser-facing Shime surfaces and do not require EduGen:

- JSON import.
- CSV import.
- Paste text/Markdown draft import.
- Local `.txt/.md` file import.

These local import surfaces still use the existing validation, preview/review, advisory quality review where applicable, and explicit confirm-save flow before content is stored locally.

## Document import boundary

PDF/DOCX/PPTX/ZIP document import has a stricter deployment boundary:

- PDF/DOCX/PPTX/ZIP requires a separate configured EduGen/File Processor service.
- The service must be browser-reachable from the deployed Shime frontend.
- `VITE_FILE_PROCESSOR_URL` must be configured for hosted document import.
- Frontend-only hosting alone cannot convert documents and does not provide document conversion.
- EduGen/File Processor is not bundled into Shime.
- No OCR claim is made; OCR is not included.
- No backend/cloud sync is added or required for Shime's local-first workflows.

Expected high-level flow when the separate service is configured:

```text
PDF/DOCX/PPTX/ZIP file
-> separate browser-reachable EduGen/File Processor service
-> extracted/cleaned text returned to Shime
-> existing text draft parser
-> import validation
-> advisory quality review where applicable
-> preview/review
-> user explicitly confirms save
```

If `VITE_FILE_PROCESSOR_URL` is missing, incorrect, blocked by CORS/network policy, or not reachable from the user's browser, PDF/DOCX/PPTX/ZIP document import should be treated as unavailable for that environment.

## Public UX copy rules

Use copy that keeps the boundary explicit:

- Say “requires a separate EduGen/File Processor service.”
- Say “document conversion unavailable unless configured.”
- Say “browser-reachable service” when describing hosted import.
- Keep JSON/CSV/text/Markdown/`.txt/.md` separate from PDF/DOCX/PPTX/ZIP document conversion.
- Avoid “built-in document conversion.”
- Avoid “OCR.”
- Avoid “cloud import.”
- Avoid “serverless backend included.”
- Avoid wording that implies EduGen is bundled into Shime.
- Avoid wording that implies frontend-only hosting can convert PDF/DOCX/PPTX/ZIP files.

## Deployment checklist

Before advertising document import for a deployed environment:

- Confirm the frontend static host is configured for the Shime SPA.
- Deploy EduGen/File Processor separately if PDF/DOCX/PPTX/ZIP import is intended.
- Set `VITE_FILE_PROCESSOR_URL` to a browser-reachable processor URL.
- Consider CORS/browser access for the deployed frontend origin.
- Confirm frontend-only deployment still supports JSON/CSV/text/Markdown/`.txt/.md` local import surfaces.
- Treat PDF/DOCX/PPTX/ZIP as unavailable without the configured processor.
- Keep public copy aligned with the separate-service boundary.

## Manual smoke checklist

Use this checklist only when a tester or user can actually run the app:

- With no `VITE_FILE_PROCESSOR_URL`, verify document import UI/copy does not imply conversion is available.
- With configured `VITE_FILE_PROCESSOR_URL`, verify document import copy indicates a separate service.
- Verify the configured service is browser-reachable before claiming PDF/DOCX/PPTX/ZIP import pass.
- Verify JSON/CSV/text/Markdown/`.txt/.md` local import surfaces remain documented and distinct from document conversion.
- Verify no copy claims OCR, bundled EduGen, frontend-only document conversion, backend/cloud sync, built-in AI generation, external AI/API integration, API-key/BYOK support, release publication, or production/security/accessibility certification.

## Evidence rules

- Do not claim document import passed unless a real configured service run verifies it.
- Do not claim OCR.
- Do not claim EduGen bundled into Shime.
- Do not claim frontend-only document conversion.
- Do not claim backend/cloud sync.
- Do not claim production/security/accessibility certification.
- Do not claim release tag created.
- Do not claim GitHub Release published.

## Claims control

Safe claims after Phase 10H:

- EduGen/File Processor boundary docs exist.
- PDF/DOCX/PPTX/ZIP document import requires a separate configured browser-reachable service.
- Frontend-only hosting alone does not provide document conversion.
- JSON/CSV/text/Markdown/`.txt/.md` remain local import surfaces.

Unsafe claims without separate evidence:

- Document import passed.
- OCR exists.
- EduGen is bundled into Shime.
- Backend/cloud sync exists.
- Built-in AI generation exists.
- External AI/API integration exists.
- API key/BYOK support exists.
- Release tag created.
- GitHub Release published.
- Production/security/accessibility certification exists.

## Recommended next step

Phase 10I — Cross-Device Export/Import Polish, or an actual manual EduGen configured smoke if the user wants document-import evidence before release.

## Phase 10I cross-device export/import reference

Cross-device data portability guidance is documented in [`docs/cross-device-export-import.md`](cross-device-export-import.md). It complements the EduGen boundary by keeping local content imports, document conversion requirements, and full app backup/restore portability separate and explicit.

## Final public release readiness re-audit

The final public release readiness re-audit is documented in [`docs/final-public-release-readiness-reaudit.md`](final-public-release-readiness-reaudit.md). It includes EduGen/File Processor boundary docs in the readiness inventory and preserves no-OCR, no-bundled-EduGen, and no-frontend-only-document-conversion guardrails.


## Phase 10L manual evidence reference
Manual evidence run pack: [`docs/manual-evidence-run-pack.md`](manual-evidence-run-pack.md) includes the optional configured EduGen document import evidence checklist. Configured document import is not claimed as passed without a real service run.

## Phase 10S evidence log reference

Record future configured EduGen/File Processor import results in [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) only after an actual configured service run. Phase 10S adds the template only and does not claim configured EduGen import passed, does not bundle EduGen, does not add frontend-only PDF/DOCX/PPTX/ZIP conversion, and does not change runtime behavior or dependencies.

## Phase 10T manual evidence execution checklist

Manual evidence execution guidance is documented in [`docs/manual-evidence-execution-checklist.md`](manual-evidence-execution-checklist.md). Phase 10T adds a checklist/evidence capture guide only: no manual evidence was executed, no screenshot files were added, no mobile UX pass was claimed, no configured EduGen import pass was claimed, no cross-device restore pass was claimed, no E2E pass was claimed, no Lighthouse/Core Web Vitals pass was claimed, no release tag was created, no GitHub Release was published, no release package was created or published, package version/dependencies remain unchanged, runtime app behavior was not changed, and no production/security/accessibility/performance certification is claimed. Future results should be copied into [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) only after actual evidence exists.

