# Public Landing Page / Root Route Polish

## Purpose of Phase 10A

Phase 10A adds a public-facing root route polish for ShimeChamhoc v2 so a first-time visitor can understand the app before entering Dashboard, Library, or Study Room. This phase improves the user-visible React/Vite SPA root route; it is not a Next.js App Router migration and does not add middleware, auth, backend, or protected routes.

## Current baseline

- The project is completed/merged through Phase 9H.
- Release-prep, release tag/publish, package cleanliness, import regression, backup/restore regression, Study Room/Dashboard regression, and accessibility/keyboard smoke checklists exist.
- The release tag has not been created.
- The GitHub Release has not been published.
- The release package has not been published.
- Package version has not been changed by Phase 9A-9H.

## What the landing page solves

The root route should no longer feel like an unexplained app shell for new visitors. It provides:

- A better first impression for public review.
- A clearer introduction to ShimeChamhoc as a local-first quiz study app.
- A less blank app feeling for visitors who arrive at `/`.
- Clear boundaries before users enter the app.
- Safe calls to action for Dashboard, Library, Study Room, and the Library demo quickstart path.

## Landing page content checklist

The public landing page should communicate:

- ShimeChamhoc v2 is a local-first quiz study app.
- Users can study from imported quiz content.
- Users can start with the in-app **Dùng quiz mẫu** demo quickstart.
- Supported local import paths: JSON, CSV, paste text/Markdown, and local `.txt/.md` files.
- Core learning surfaces: Library, Study Room, Dashboard learning progress, and backup/restore.
- PDF/DOCX/PPTX/ZIP import requires a separate configured and browser-reachable EduGen/File Processor service.
- EduGen/File Processor is separate and not bundled into Shime.
- Frontend-only hosting alone does not provide document conversion.
- Manual AI workflow is manual copy/paste only: manual prompt/export and manual output paste/import.
- No built-in AI generation.
- No external AI/API calls from Shime.
- No API key/BYOK support.
- No OCR.
- No backend/cloud sync.
- No production/security certification.

## Direct route note

ShimeChamhoc is a React/Vite SPA. The user-visible root route can now explain the app, but simple crawlers may still not render rich body text from JavaScript. Static metadata, Open Graph, and social preview work should be handled separately in Phase 10B — SEO / Open Graph / Social Preview Metadata.

This phase focuses on public root route polish for users, not full SEO optimization. Do not claim all crawlers render app content or that crawler indexing success is guaranteed.

## Manual smoke checklist

Before accepting the public landing page polish, manually verify:

- Open `/` and confirm landing content appears.
- Confirm the page explains local-first quiz study usage.
- Confirm JSON, CSV, text/Markdown, and `.txt/.md` import are mentioned.
- Confirm the **Dùng quiz mẫu** demo quickstart path is mentioned.
- Confirm Library, Study Room, Dashboard, and backup/restore are mentioned.
- Confirm EduGen/File Processor is described as separate and required for PDF/DOCX/PPTX/ZIP document import.
- Confirm frontend-only hosting alone does not imply document conversion.
- Confirm manual AI workflow is described as manual copy/paste only.
- Confirm no built-in AI generation, external AI/API calls, API key/BYOK, OCR, backend/cloud sync, or production/security/accessibility certification claims appear.
- Verify CTA to Dashboard works.
- Verify CTA to Library works.
- Verify demo quickstart CTA routes to Library if implemented.
- Refresh `/` and confirm the root route still renders.
- Open `/dashboard` directly and confirm the existing Dashboard route still works.
- Open `/library` directly and confirm the existing Library route still works.

## Evidence rules

Safe claims after Phase 10A:

- Public landing/root route polish exists.
- Root route introduces the app more clearly to new visitors.
- Public landing page documentation exists.

Unsafe claims after Phase 10A:

- Do not claim public release published.
- Do not claim GitHub Release published.
- Do not claim release tag created.
- Do not claim production-ready or production certified.
- Do not claim security certified.
- Do not claim accessibility certified.
- Do not claim SEO optimization.
- Do not claim all crawlers render app content.
- Do not claim built-in AI generation.
- Do not claim external AI/API integration.
- Do not claim API key/BYOK support.
- Do not claim OCR.
- Do not claim EduGen bundled into Shime.
- Do not claim frontend-only PDF/DOCX/PPTX/ZIP conversion.
- Do not claim backend/cloud sync.

## Recommended next step

Recommended next phase: Phase 10B — SEO / Open Graph / Social Preview Metadata.

## Phase 10B social preview metadata reference

Basic static SEO/social preview metadata is documented in [`docs/social-preview-metadata.md`](social-preview-metadata.md). Phase 10B adds `index.html` title/description, Open Graph and Twitter/social card tags, and a static preview image. The Phase 10A recommended next step was Phase 10B — SEO / Open Graph / Social Preview Metadata; after Phase 10B, the recommended next step is Phase 10C — Direct Route / SPA Fallback UX Audit. Do not claim SEO optimization success or that all crawlers render SPA content.

## Phase 10C direct-route / SPA fallback reference

Direct-route and static-host fallback guidance is documented in [`docs/direct-route-spa-fallback.md`](direct-route-spa-fallback.md). Phase 10C documents how `/`, `/dashboard`, `/library`, `/study-room`, and unknown routes should be manually smoked in a React/Vite SPA with static-host fallback to `index.html`. It does not claim SSR, all-crawler rendering, direct-route smoke pass, auth/login, backend/cloud sync, release tag creation, or GitHub Release publication.
