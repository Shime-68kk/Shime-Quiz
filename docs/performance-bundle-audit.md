# Phase 10F — Performance / Bundle-Size Audit

## Purpose

Phase 10F documents the current build and bundle-size state before public release. It records the existing Vite/Rolldown chunk-size warning as a release-readiness follow-up item without hiding the warning or claiming performance optimization success.

## Current baseline

- Project state is completed/merged through Phase 10E.
- Public landing/root route polish exists.
- Social preview metadata exists.
- Direct-route SPA fallback docs exist.
- Screenshot capture checklist exists.
- README public-facing rewrite exists.
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been published.

## Build observation

Observed during Phase 10F local validation:

- `npm run build` passes.
- Vite/Rolldown chunk-size warning appears: some chunks are larger than 500 kB after minification.
- Largest observed JavaScript chunk: `dist/assets/index-B5DSKda9.js` at 519.02 kB minified.
- Observed gzip size for that JavaScript chunk: 147.47 kB.
- The warning is non-blocking unless the build fails.

Do not commit `dist/` or `node_modules/` from this measurement run.

## Interpretation

The chunk-size warning is a follow-up performance consideration. It is not automatically a product bug, and it does not certify performance. It should not be hidden by raising the chunk-size warning limit without a documented reason. This phase does not claim performance optimized behavior.

## Possible future improvements

Future work could include:

- route-level lazy loading or code splitting;
- dynamic imports for large route components;
- review of large dependencies if any are found;
- bundle composition review with an analyzer only if the user approves adding tooling;
- mobile performance smoke in a later phase.

## What this phase does not do

- No runtime optimization implemented.
- No package/dependency changes.
- No Vite config changes.
- No warning suppression.
- No chunk limit increase just to hide the warning.
- No Lighthouse/Core Web Vitals claim unless measured.
- No mobile performance certification.
- No production performance certification.
- No production/security/accessibility certification claim.
- No release tag created.
- No GitHub Release published.

## Manual performance smoke checklist

1. Run `npm ci`.
2. Run `npm run build`.
3. Note whether the Vite/Rolldown chunk-size warning appears.
4. If a browser is available, run `npm run preview`.
5. Open `/`.
6. Open `/dashboard`.
7. Open `/library`.
8. Confirm the app still loads.
9. Do not commit `dist/` or `node_modules/`.
10. Do not claim Lighthouse/Core Web Vitals pass unless those tools are actually measured and recorded.

## Claim rules

Safe claims:

- Performance/bundle-size audit docs exist.
- Known chunk-size warning is documented.
- Build passed during Phase 10F validation if the matching command output is available.

Do not claim:

- performance optimized unless actual optimization is implemented and measured;
- Lighthouse/Core Web Vitals pass unless measured;
- mobile performance certified;
- production certification;
- security certification;
- accessibility certification;
- release tag created;
- GitHub Release published;
- built-in AI generation;
- external AI/API integration;
- OCR;
- EduGen bundled into Shime;
- frontend-only PDF/DOCX/PPTX/ZIP document conversion;
- backend/cloud sync.

## Recommended next step

Phase 10G — Mobile UX Smoke / Responsive Polish, or an optional performance optimization phase only if the user wants to reduce bundle size before release.

## Phase 10G mobile UX smoke reference

Mobile UX / responsive smoke guidance is documented in [`docs/mobile-ux-smoke.md`](mobile-ux-smoke.md). It documents mobile viewports and responsive manual test surfaces without claiming mobile UX pass, Lighthouse/Core Web Vitals pass, or mobile performance certification without measured evidence.

## EduGen boundary polish reference

Performance and bundle-size notes should not turn into capability claims. See [`docs/edugen-boundary-polish.md`](edugen-boundary-polish.md) for the separate EduGen/File Processor boundary; Phase 10F and Phase 10H do not add OCR, backend/cloud sync, bundled EduGen, or frontend-only PDF/DOCX/PPTX/ZIP conversion.

## Phase 10I cross-device export/import reference

Performance notes do not change the local-first data model. Cross-device export/import guidance is documented in [`docs/cross-device-export-import.md`](cross-device-export-import.md), including explicit user backup/restore portability and no automatic cloud/account/backend sync.

## Final public release readiness re-audit

The final public release readiness re-audit is documented in [`docs/final-public-release-readiness-reaudit.md`](final-public-release-readiness-reaudit.md). It carries forward the known non-blocking Vite/Rolldown chunk-size warning and confirms there is no performance optimization or Lighthouse/Core Web Vitals pass claim without measurement.
