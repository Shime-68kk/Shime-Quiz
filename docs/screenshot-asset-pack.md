# Screenshot Asset Pack

## Purpose of Phase 10D

Phase 10D prepares a public screenshot asset pack structure, capture checklist, and claims-control guidance for README, GitHub Release, landing-page documentation, and public release materials.

This phase is documentation/assets/static-validation only. It does not change runtime app behavior, user-facing features, import behavior, study behavior, storage behavior, package version, dependencies, release tags, GitHub Release publication, or release package publication.

## Current baseline

- The project is completed/merged through Phase 10C.
- Public landing/root route polish exists.
- Social preview metadata exists.
- Direct-route SPA fallback audit docs exist.
- The release tag has not been created.
- The GitHub Release has not been published.
- The release package has not been published.
- Shime remains a React/Vite local-first quiz study app with browser-local data.

## Screenshot asset status

Actual screenshots are pending actual capture. This phase creates the screenshot asset pack structure and capture guidance only.

Current screenshot directory:

```text
docs/assets/screenshots/
```

The directory is kept with `.gitkeep` until real, reviewed screenshots are captured from the current app and committed. Do not claim screenshots exist unless actual image files are present. Do not claim screenshot capture completed unless the expected image files are present and reviewed.

## Required screenshot checklist

Capture these screenshots only from the real app, using public release-safe sample data:

1. Public landing/root route.
2. Dashboard first-run onboarding.
3. Library empty-state onboarding.
4. **Dùng quiz mẫu** demo quickstart.
5. Demo sample preview / validation / quality review.
6. Study Room after saving demo sample.
7. Backup/restore surface.
8. Manual AI prompt/export workflow.
9. EduGen import surface with separate service boundary.
10. Optional accessibility/keyboard smoke or focus state if useful.

Suggested future filenames:

```text
docs/assets/screenshots/public-landing.png
docs/assets/screenshots/dashboard-first-run.png
docs/assets/screenshots/library-empty-state.png
docs/assets/screenshots/demo-quickstart.png
docs/assets/screenshots/demo-preview-quality-review.png
docs/assets/screenshots/study-room-demo-sample.png
docs/assets/screenshots/backup-restore.png
docs/assets/screenshots/manual-ai-workflow.png
docs/assets/screenshots/edugen-boundary.png
```

## Capture guidance

- Use the current app build for screenshot capture.
- Use public release-safe sample data only.
- Prefer the public demo sample pack or in-app demo sample quickstart instead of private/local notes.
- Avoid private data, local personal data, secrets, tokens, and environment values.
- Avoid browser extensions or private tabs visible in screenshots unless the goal is to document deployed route behavior.
- Prefer clean app-only screenshots.
- Capture desktop screenshots first; mobile viewport screenshots can be added later after review.
- Save screenshots under `docs/assets/screenshots/`.
- Retake screenshots after public UI changes.

## Claim rules

- Do not claim screenshots exist unless actual image files are present.
- Do not claim screenshot capture completed unless expected image files are present and reviewed.
- Do not fake screenshots.
- Do not add misleading mockups.
- Do not include screenshots that expose private data or secrets.
- Do not include screenshots that imply unsupported claims.
- Do not claim built-in AI generation.
- Do not claim external AI/API integration.
- Do not claim API key/BYOK support.
- Do not claim OCR.
- Do not claim backend/cloud sync.
- Do not claim EduGen bundled into Shime.
- Do not claim frontend-only document conversion for PDF/DOCX/PPTX/ZIP.
- Do not claim production/security/accessibility certification.
- Do not claim release tag creation or GitHub Release publication.

## README and GitHub Release usage guidance

- Only reference screenshots that actually exist as committed image files.
- README image links must point to existing files.
- GitHub Release draft image links must point to existing files.
- Alt text should be descriptive and truthful.
- Captions should include boundaries where relevant, especially for EduGen and manual AI workflow views.
- If screenshots are pending, link to this checklist instead of embedding missing images.

## Manual smoke checklist for screenshot assets

When real screenshots are added later, verify:

- Each screenshot file opens.
- Screenshots match the current UI.
- Screenshots use public release-safe sample data.
- Private data is absent.
- Unsupported visual claims are absent.
- README and GitHub Release image references are not broken.
- Captions and alt text do not imply built-in AI generation, OCR, cloud sync, bundled EduGen, frontend-only document conversion, production certification, security certification, accessibility certification, release tag creation, or GitHub Release publication.

## Recommended next step

Recommended next phase: Phase 10E — README Public-Facing Rewrite / Split.

If screenshots remain deferred, another safe option is Phase 10F — Performance / Bundle-Size Audit.

## README usage reference

README screenshot embeds should remain absent until actual reviewed screenshot image files exist. The README public-facing rewrite guide is available at [`docs/readme-public-facing-guide.md`](readme-public-facing-guide.md) and keeps the screenshot status explicit.


## Phase 10F performance / bundle-size audit reference

Screenshot planning should remain separate from performance claims. See [`docs/performance-bundle-audit.md`](performance-bundle-audit.md) for the current bundle-size warning documentation. Do not use screenshots or captions to claim performance optimized behavior, Lighthouse/Core Web Vitals pass, or mobile performance certification unless actually measured.

## Mobile screenshot planning reference

Future screenshot capture should consider the responsive/manual mobile surfaces in [`docs/mobile-ux-smoke.md`](mobile-ux-smoke.md). The mobile checklist does not claim mobile UX passed unless an actual run verifies it.

## Final public release readiness re-audit

The final public release readiness re-audit is documented in [`docs/final-public-release-readiness-reaudit.md`](final-public-release-readiness-reaudit.md). It records that screenshot capture checklist exists while actual screenshots remain not captured unless real image files are later added.
