# README Public-Facing Rewrite / Split

## Purpose

Phase 10E documents the README public-facing rewrite / split. The goal is to keep the README useful for new visitors while linking detailed release, deployment, validation, and claims-control material to dedicated docs.

## Current baseline

- ShimeChamhoc v2 is completed/merged through Phase 10D.
- Public landing/root route polish exists.
- Static SEO/Open Graph/social preview metadata exists.
- Direct-route SPA fallback docs exist.
- Screenshot capture checklist exists.
- Actual screenshots are pending unless real image files exist under `docs/assets/screenshots/`.
- The release tag has not been created.
- The GitHub Release has not been published.
- The release package has not been published.

## README rewrite goals

- Keep the README shorter and public-facing.
- Put quick start commands before detailed release docs.
- Present clear local-first positioning.
- Explain safe import, EduGen, and manual AI boundaries.
- Link detailed release-readiness docs instead of duplicating every checklist in full.
- Preserve all claim guardrails.

## README structure checklist

The public README should include:

- intro
- quick start
- demo quickstart
- supported imports
- local-first privacy
- learning features
- manual AI boundary
- EduGen boundary
- public polish docs
- release docs
- validation
- unsupported / not claimed section

## Claim rules

The README and linked docs must not claim:

- built-in AI generation
- external AI/API calls
- API key/BYOK support
- OCR
- backend/cloud sync
- EduGen bundled into Shime
- frontend-only document conversion for PDF/DOCX/PPTX/ZIP
- production/security/accessibility certification
- SEO ranking/all-crawlers-render success
- screenshot availability unless actual image files exist
- release tag or GitHub Release publication unless actually created/published

## Manual review checklist

Before accepting a README/public-facing change:

- Render README on GitHub or a Markdown preview.
- Check that links resolve to existing files.
- Check quick start commands are accurate.
- Check public claims are truthful.
- Check no broken screenshot/image links are present.
- Check unsupported claims are absent.

## Recommended next step

Continue with Phase 10F — Performance / Bundle-Size Audit, or capture real screenshots first if the user wants visuals before README screenshot embeds.


## Phase 10F performance audit reference

The README should link to [`docs/performance-bundle-audit.md`](performance-bundle-audit.md) so public readers can find the current build/performance caveat. The performance / bundle-size audit documents the known Vite/Rolldown chunk-size warning, does not claim performance optimized behavior, and does not claim Lighthouse/Core Web Vitals results unless measured.

## Final public release readiness re-audit

The final public release readiness re-audit is documented in [`docs/final-public-release-readiness-reaudit.md`](final-public-release-readiness-reaudit.md). It includes README public-facing rewrite in the Phase 10 readiness inventory and preserves claim guardrails.
