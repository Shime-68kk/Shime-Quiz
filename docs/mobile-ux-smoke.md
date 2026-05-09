# Phase 10G — Mobile UX Smoke / Responsive Polish

## Purpose

Phase 10G documents a manual mobile UX smoke checklist for ShimeChamhoc v2 before public release. It is a documentation/static-validator/CI phase by default: it records what to test on responsive/mobile viewports without claiming that mobile UX passed unless an actual mobile or browser-devtools run provides evidence.

## Current baseline

- The project is completed/merged through Phase 10F.
- Public landing/root route polish exists.
- Social preview metadata exists.
- Direct-route SPA fallback audit docs exist.
- Screenshot capture checklist exists.
- README public-facing rewrite exists.
- Performance/bundle-size audit docs exist.
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been published.
- Package version has not been changed by Phase 9A–10F.

## Manual mobile smoke prerequisites

- Run `npm ci`.
- Run `npm run build`.
- Run `npm run dev` or `npm run preview`.
- Use browser devtools responsive viewport or a real mobile device.
- Use a clean local test state or a known seeded state.
- At least one saved quiz/library item is recommended for Study Room, Dashboard, backup/restore, and learning-flow checks.

## Suggested viewports

Test at least a representative subset before claiming any mobile UX pass:

- `360x640`
- `375x667`
- `390x844`
- `412x915`
- `768x1024` tablet

## Mobile UX smoke checklist

- Open root `/` and verify the landing page is readable.
- Verify landing CTAs are tappable.
- Open `/dashboard` directly and verify the Dashboard route is usable.
- Open `/library` directly and verify the Library route is usable.
- Verify navigation/menu controls are reachable.
- Verify the Library empty state is readable.
- Verify **Dùng quiz mẫu** / demo quickstart is reachable.
- Verify import controls are visible and reachable.
- Verify JSON import, CSV import, text/Markdown paste/import, and local `.txt/.md` import surfaces are understandable.
- Verify document import/EduGen boundary is visible and understandable where applicable.
- Verify manual AI workflow guidance is readable and does not overclaim.
- Verify the preview/review/confirm-save flow is usable.
- Verify Study Room answer controls are tappable.
- Verify Study Room finish/exit/navigation controls are tappable.
- Verify Dashboard progress/recommendation sections remain readable.
- Verify backup/restore controls are reachable.
- Verify no obvious horizontal overflow appears in primary smoke paths.
- Verify no essential controls are clipped off-screen.
- Verify text remains readable at normal zoom.
- Verify modals/dialogs/previews remain understandable on mobile.

## Failure classification

Classify findings precisely so release decisions stay grounded:

- Horizontal overflow.
- Clipped control.
- Unreadable text.
- Inaccessible or tiny tap target.
- Modal/dialog overflow.
- Import control reachability issue.
- Study Room control issue.
- Dashboard layout issue.
- Browser/device environment issue.
- Timeout/flakiness.

## Evidence rules

- Do not claim mobile UX smoke passed unless an actual mobile/responsive run passes.
- Do not claim mobile performance pass unless measured.
- Do not claim Lighthouse/Core Web Vitals pass unless measured.
- Do not claim accessibility/WCAG compliance.
- Do not claim production/security certification.
- Record the tested viewport(s), browser/device, date, and whether each route/control path passed.

## Claims control

Safe claims after this phase:

- Mobile UX smoke checklist exists.
- Responsive/mobile manual test surfaces are documented.

Unsafe claims unless separately verified:

- Do not claim mobile UX passed without run evidence.
- Do not claim mobile performance certified.
- Do not claim Lighthouse/Core Web Vitals pass.
- Do not claim accessibility certification.
- Do not claim release tag created.
- Do not claim GitHub Release published.
- Do not claim built-in AI generation, external AI/API integration, API key/BYOK support, OCR, EduGen bundled into Shime, frontend-only document conversion, backend/cloud sync, production certification, or security certification.

## Recommended next step

Recommended next step: Phase 10H — EduGen Boundary / Integration Polish, or run an actual manual mobile smoke run if the user wants mobile evidence before release.

## EduGen boundary polish reference

Mobile smoke reviewers should also check [`docs/edugen-boundary-polish.md`](edugen-boundary-polish.md). On mobile viewports, document-import copy should still explain that PDF/DOCX/PPTX/ZIP requires a separate configured browser-reachable EduGen/File Processor service and should not imply OCR, bundled EduGen, frontend-only document conversion, backend/cloud sync, or a document import pass without an actual configured run.

## Phase 10I cross-device export/import reference

Mobile or cross-device testing should use [`docs/cross-device-export-import.md`](cross-device-export-import.md) to verify that users understand explicit backup/export and restore/import portability, no automatic cloud/account sync, and private backup file handling.

## Final public release readiness re-audit

The final public release readiness re-audit is documented in [`docs/final-public-release-readiness-reaudit.md`](final-public-release-readiness-reaudit.md). It records the mobile UX smoke checklist as documentation only and does not claim a manual mobile UX pass without run evidence.


## Phase 10L manual evidence reference
Manual evidence run pack: [`docs/manual-evidence-run-pack.md`](manual-evidence-run-pack.md) includes the optional mobile/responsive evidence checklist. Mobile UX is not claimed as passed unless a real run passes.
