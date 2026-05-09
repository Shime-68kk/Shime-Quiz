# Phase 10B — SEO / Open Graph / Social Preview Metadata

## Purpose

Phase 10B documents and validates basic static metadata, Open Graph metadata, Twitter/social card metadata, and the social preview image used by the React/Vite public entry point.

## Current baseline

- ShimeChamhoc v2 is completed/merged through Phase 10A.
- Public landing/root route polish exists in [`docs/public-landing-page.md`](public-landing-page.md).
- The release tag has not been created.
- The GitHub Release has not been published.
- The release package has not been published.
- Package version has not been changed by Phase 10B.

## What Phase 10B adds

- Basic static metadata in `index.html`.
- Open Graph metadata for title, description, type, URL, and preview image.
- Twitter/social card metadata for title, description, card type, and image.
- A static social preview image at `public/og-image.svg`.
- A validator that checks the metadata, referenced preview asset, documentation links, workflow registration, and claims boundaries.

## Vite SPA note

ShimeChamhoc v2 is a React/Vite SPA, not a Next.js App Router project. Static metadata is available from `index.html`, while body content may require JavaScript rendering. This phase does not guarantee all crawlers render app body content, does not guarantee indexing, and does not claim SEO ranking or optimization success.

## Metadata claims boundary

The static title, description, Open Graph, Twitter/social card tags, and preview image describe ShimeChamhoc as a local-first quiz study app. They intentionally avoid unsupported claims:

- No built-in AI generation.
- No external AI/API integration or calls from Shime.
- No API key/BYOK support.
- No OCR.
- No backend/cloud sync or account/auth sync.
- No EduGen bundled into Shime.
- No frontend-only PDF/DOCX/PPTX/ZIP document conversion claim.
- No production/security/accessibility certification.
- No release tag created.
- No GitHub Release published.

## Manual smoke checklist

Before accepting Phase 10B in a browser environment:

1. Inspect page source or the built `index.html` for title, description, Open Graph, Twitter/social card, theme color, and preview-image tags.
2. Confirm `public/og-image.svg` is present and references only truthful, static preview copy.
3. Run `npm ci`.
4. Run `npm run build`.
5. Open `/` and confirm the landing page still loads.
6. Confirm metadata does not include forbidden claims such as built-in AI generation, external AI/API integration, OCR, bundled EduGen, backend/cloud sync, release published, or certification.
7. Optionally test social card preview externally, but do not claim platform preview success unless it was actually verified.

## Claims control

Safe claims after Phase 10B:

- Basic SEO/social preview metadata exists.
- Open Graph/social preview tags exist.
- A static social preview image exists.

Unsafe claims after Phase 10B:

- Do not claim SEO optimization success.
- Do not claim search ranking improvement.
- Do not claim all crawlers render SPA content.
- Do not claim production certification.
- Do not claim security certification.
- Do not claim accessibility certification.
- Do not claim release tag created.
- Do not claim GitHub Release published.

## Recommended next step

Recommended next phase: Phase 10C — Direct Route / SPA Fallback UX Audit.

## Phase 10C direct-route / SPA fallback reference

Direct-route and static-host fallback guidance is documented in [`docs/direct-route-spa-fallback.md`](direct-route-spa-fallback.md). Static metadata remains available from `index.html`, but React/Vite SPA body content may require JavaScript rendering. Phase 10C documents fallback/manual smoke expectations and does not claim SSR, all crawlers render SPA content, or direct-route smoke passed without evidence.

## Phase 10D screenshot asset pack reference

Screenshot asset pack guidance is documented in [`docs/screenshot-asset-pack.md`](screenshot-asset-pack.md). Social preview metadata uses `public/og-image.svg`; app screenshots for README or GitHub Release materials remain pending actual capture and review.

## README public-facing reference

The README public-facing rewrite/split guide is available at [`docs/readme-public-facing-guide.md`](readme-public-facing-guide.md). Metadata and README copy should remain aligned without claiming SEO ranking success or all-crawler rendering.
