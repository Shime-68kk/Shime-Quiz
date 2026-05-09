# Phase 10C — Direct Route / SPA Fallback UX Audit

## Purpose of Phase 10C

Phase 10C documents and validates direct-route/static-hosting fallback expectations for ShimeChamhoc v2 after the public landing and metadata work. It is a release-readiness audit for React/Vite SPA routing, not a runtime feature rewrite.

## Current baseline

- ShimeChamhoc v2 is completed/merged through Phase 10B.
- Public landing/root route polish exists in [`docs/public-landing-page.md`](public-landing-page.md).
- Static SEO/social preview metadata exists in [`docs/social-preview-metadata.md`](social-preview-metadata.md).
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been published.
- Package version has not been changed by this phase.

## Vite SPA routing note

ShimeChamhoc is a React/Vite SPA using client-side routing. Direct routes such as `/dashboard`, `/library`, and `/study-room` require the static host to fall back to `index.html` so the browser can load the SPA shell and let React Router render the route.

Static metadata exists in `index.html`, but app body content may require JavaScript rendering. Simple crawlers may not render app body content. Do not claim server-side rendering, all-crawlers-render support, or SEO/crawler success from this phase.

## Static-host fallback review

Current hosting fallback state to review before release:

- Vercel fallback reviewed: `vercel.json` rewrites `/(.*)` to `/index.html` for SPA routes.
- Netlify fallback reviewed: `netlify.toml` redirects `/*` to `/index.html` with status `200`.
- Static host fallback reviewed: `public/_redirects` contains `/* /index.html 200` for hosts that consume Netlify-style redirects.
- Unknown direct routes should not imply server-side auth/login, protected routes, account requirements, or backend routing.
- These fallback files should preserve static asset loading and must not add middleware, serverless functions, auth redirects, or cloud sync behavior.

## Direct route manual smoke checklist

Run this checklist in local preview and, if applicable, on the deployed static host before making direct-route claims:

1. Run `npm ci`.
2. Run `npm run build`.
3. Run `npm run preview` or use the deployed static host.
4. Open `/`.
5. Reload `/`.
6. Open `/dashboard` directly.
7. Reload `/dashboard`.
8. Open `/library` directly.
9. Reload `/library`.
10. Open `/study-room` directly if the Study Room route is supported in the current build.
11. Open an unknown route such as `/not-a-real-route`.
12. Verify the app does not show a blank page where SPA fallback is expected.
13. Verify the static host serves the SPA shell where expected.
14. Verify user-facing route/fallback behavior is understandable.
15. Verify unsupported claims are absent.

## Public UX expectation

- The root route should introduce the app and its boundaries clearly.
- Dashboard and Library direct routes should remain usable where supported.
- Missing or unknown routes should be understandable after the SPA shell loads.
- No login/auth redirect is expected because Shime has no auth.
- No backend/cloud sync is expected because Shime is local-first.

## Evidence rules

- Do not claim Vercel/direct-route smoke passed unless an actual deployed or local preview run verifies it.
- Do not claim all hosts are configured unless each config is present and checked.
- Do not claim all crawlers render SPA content.
- Do not claim SSR.
- Do not claim production/security/accessibility certification.
- Do not claim release tag created.
- Do not claim GitHub Release published.

## Claims control

Safe claims after Phase 10C:

- Direct-route / SPA fallback audit docs exist.
- Direct-route manual smoke checklist exists.
- Static-host fallback guidance exists.
- Existing Vercel, Netlify, and `_redirects` SPA fallback configuration has been documented.

Unsafe claims after Phase 10C:

- Do not claim direct-route smoke passed without actual run evidence.
- Do not claim SSR.
- Do not claim all crawlers render SPA content.
- Do not claim auth/login/protected routes.
- Do not claim backend/cloud sync.
- Do not claim built-in AI generation.
- Do not claim external AI/API integration.
- Do not claim API key/BYOK support.
- Do not claim OCR.
- Do not claim EduGen bundled into Shime.
- Do not claim frontend-only PDF/DOCX/PPTX/ZIP document conversion.
- Do not claim production/security/accessibility certification.
- Do not claim release tag created.
- Do not claim GitHub Release published.

## Recommended next step

Recommended next phase: Phase 10D — Screenshot Asset Pack.

## Phase 10D screenshot asset pack reference

Direct-route screenshots should follow [`docs/screenshot-asset-pack.md`](screenshot-asset-pack.md). Capture `/`, `/dashboard`, `/library`, `/study-room`, and fallback routes only after verifying they match the current app and do not imply SSR, all-crawler rendering, auth/login, cloud sync, or release publication.

## README public-facing reference

The README public-facing rewrite/split guide is available at [`docs/readme-public-facing-guide.md`](readme-public-facing-guide.md). README route guidance should remain concise and should not claim SSR, all-crawler rendering, auth/login redirects, or direct-route smoke pass without evidence.


## Phase 10F performance / bundle-size audit reference

Direct-route fallback behavior remains separate from bundle-size claims. See [`docs/performance-bundle-audit.md`](performance-bundle-audit.md) for current build warning documentation and future route-level lazy loading/code splitting considerations.
