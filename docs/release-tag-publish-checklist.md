# Release Tag / Publish Checklist

## Purpose of Phase 9D

Phase 9D documents the final release tag / publish checklist for Shime Quiz. It gives the maintainer a safe, explicit, step-by-step gate before creating a release tag or publishing a GitHub Release.

This phase is documentation/static-validator/CI registration only. It does not create a tag, publish a GitHub Release, publish a release package, change package version, certify production readiness, or certify security readiness.

## Current baseline

The current repository baseline is completed/merged through Phase 9C.

Release-finalization documents exist:

- Final RC audit docs: [`docs/final-rc-audit.md`](final-rc-audit.md)
- CI green verification docs: [`docs/ci-green-verification.md`](ci-green-verification.md)
- Release tag decision docs: [`docs/release-tag-decision.md`](release-tag-decision.md)
- GitHub release draft docs: [`docs/github-release-draft.md`](github-release-draft.md)
- Release package cleanliness docs: [`docs/release-package-cleanliness.md`](release-package-cleanliness.md)

Current release state:

- Release tag has not been created.
- GitHub release has not been published.
- Release package has not been published.
- Package version is not changed in this phase.
- Dependencies are not changed in this phase.
- No production/security certification is claimed.

## Final pre-tag checklist

Before creating any release tag or publishing any GitHub Release, confirm:

- Main branch is clean.
- Main branch is up-to-date with `origin/main`.
- The release branch/PR has been reviewed and merged.
- `git status --short` is clean.
- Package version/tag decision is reviewed in [`docs/release-tag-decision.md`](release-tag-decision.md).
- Release tag name is selected by the user.
- GitHub release draft is reviewed in [`docs/github-release-draft.md`](github-release-draft.md).
- Source archive cleanliness is reviewed in [`docs/release-package-cleanliness.md`](release-package-cleanliness.md).
- No generated artifacts committed.
- No secrets/env files committed.
- Public docs are reviewed.
- Final RC audit is reviewed.
- Release package cleanliness checklist is reviewed.

## Validation checklist

Before tag or publish, confirm:

- `npm ci` PASS.
- `npm run build` PASS.
- Full static validator chain PASS.
- `npm run test:e2e:smoke` PASS if the release notes claim E2E smoke pass.
- `npm run test:e2e:onboarding` PASS if the release notes claim onboarding E2E pass.
- GitHub Actions green only if an actual GitHub Actions run passes.

Do not claim CI green without actual passing GitHub Actions evidence. Do not claim E2E passed without actual command output showing a passing E2E run.

## Known non-blocking caveat

Vite may warn that some chunks are larger than 500 kB after minification. If `npm run build` still completes successfully and reports a built output, treat this warning as non-blocking for the current release candidate.

Track chunk-size reduction or code-splitting as a future performance optimization, not a release blocker for this RC.

## Safe tag/publish command checklist

Use these commands as a pre-tag review sequence:

```bash
git checkout main
git pull origin main
git status --short
git log --oneline --decorate -5
```

Choose a tag only after the user has made the release tag/version decision.

Example tag commands are examples only. They are not performed by Phase 9D:

```bash
git tag -a v2.0.0-rc1 -m "Shime Quiz v2.0.0 RC1"
git push origin v2.0.0-rc1
```

GitHub Release publishing should be manual and based on [`docs/github-release-draft.md`](github-release-draft.md). Review the final tag name, release title, release notes, CI/E2E evidence, package cleanliness, and claims boundaries before pressing publish.

## Explicit stop conditions

Stop before creating a tag or publishing a GitHub Release if any of these are true:

- Dirty git status.
- Failing build.
- Failing validator chain.
- Missing release tag decision.
- Missing release draft.
- Generated artifacts/secrets present.
- GitHub Actions is not green if the release notes claim CI green.
- E2E is not passing if the release notes claim E2E pass.
- Package/source archive cleanliness has not been reviewed.
- The release notes imply production certification or security certification.

## Claims control

Safe claims after Phase 9D:

- Release tag / publish checklist docs exist.
- Final release publish steps are documented.
- Final pre-tag validation, source cleanliness, release draft review, and stop conditions are documented.

Unsafe claims after Phase 9D:

- Do not claim the package version was changed.
- Do not claim a release tag was created.
- Do not claim a GitHub release was published.
- Do not claim a release package was published.
- Do not claim production certification.
- Do not claim security certification.
- Do not claim CI green unless an actual GitHub Actions run passed.
- Do not claim E2E passed unless actual command output passed.
- Do not claim built-in AI quiz generation.
- Do not claim external AI/API integration.
- Do not claim API key/BYOK support.
- Do not claim OCR support.
- Do not claim EduGen is bundled into Shime.
- Do not claim backend/cloud sync.

## Next decision

After Phase 9D is accepted, stop and ask the user whether to create the actual release tag/publish flow, or run optional regression hardening phases 9E–9H.

## Import regression smoke checkpoint

Before creating a tag or publishing a GitHub Release, review [`docs/import-regression-smoke.md`](import-regression-smoke.md). Manual import regression pass claims require actual run evidence. EduGen PDF/DOCX/PPTX/ZIP pass claims require a separately configured and browser-reachable EduGen/File Processor service.

## Backup/restore regression smoke checkpoint



Before creating a tag or publishing a GitHub Release, review [`docs/study-dashboard-regression-smoke.md`](study-dashboard-regression-smoke.md). Manual Study Room/Dashboard regression pass claims require actual run evidence, and learning state claims should only mention categories that were actually checked.
Before creating a tag or publishing a GitHub Release, review [`docs/backup-restore-regression-smoke.md`](backup-restore-regression-smoke.md). Manual backup/restore regression pass claims require actual run evidence, and state-preservation claims should only mention categories that were actually checked.

## Phase 9H accessibility / keyboard smoke reference

Accessibility / keyboard manual smoke guidance is documented in [`docs/accessibility-keyboard-smoke.md`](accessibility-keyboard-smoke.md). It documents keyboard navigation, focus visibility, reachable controls, import, Library, demo quickstart, preview/review/confirm-save, Study Room, Dashboard, backup/restore, readable labels, visible validation/error messages, EduGen unavailable guidance, manual AI caveats, and evidence rules. Phase 9H does not change runtime behavior and does not claim WCAG compliance, accessibility certification, production/security certification, or a manual accessibility/keyboard pass without an actual tester/user run.

## Phase 10A public landing/root route polish checkpoint

Before creating a tag or publishing a GitHub Release, review [`docs/public-landing-page.md`](public-landing-page.md) and manually smoke `/`, `/dashboard`, and `/library`. Phase 10A improves user-visible root route copy and CTAs only; it does not add auth/login, backend/cloud sync, built-in AI generation, external AI/API calls, OCR, EduGen bundling, package version changes, release tag creation, or GitHub Release publishing.


## Phase 10B SEO / social preview metadata checkpoint

Before creating a tag or publishing a GitHub Release, review [`docs/social-preview-metadata.md`](social-preview-metadata.md). Phase 10B adds basic static `index.html` metadata, Open Graph/Twitter social card tags, and a static preview image. It does not create a release tag, publish a GitHub Release, certify production/security/accessibility readiness, claim SEO ranking improvement, or guarantee all crawlers render SPA content.

## Phase 10C direct-route / SPA fallback checkpoint

Before creating a tag or publishing a GitHub Release, review [`docs/direct-route-spa-fallback.md`](direct-route-spa-fallback.md). Manually smoke `/`, `/dashboard`, `/library`, `/study-room`, and an unknown route on the target static host if making direct-route claims. Phase 10C does not add auth/login, middleware, backend/cloud sync, SSR, package version changes, release tag creation, or GitHub Release publishing.

## Phase 10D screenshot checkpoint

Before publishing, review [`docs/screenshot-asset-pack.md`](screenshot-asset-pack.md). If screenshots are added to README or GitHub Release notes, verify that every referenced image exists, opens, matches the current UI, avoids private data, and does not imply unsupported features or certification claims.

## README public-facing rewrite reference

Before tag/publish, review the concise public README and [`docs/readme-public-facing-guide.md`](readme-public-facing-guide.md). Do not claim screenshots, release publication, production/security/accessibility certification, or unsupported AI/EduGen/cloud capabilities unless separately verified and allowed.


## Phase 10F performance / bundle-size audit checkpoint

Review [`docs/performance-bundle-audit.md`](performance-bundle-audit.md) before tag/publish decisions. The known Vite/Rolldown chunk-size warning is documented as non-blocking if `npm run build` passes; do not claim performance optimized behavior, Lighthouse/Core Web Vitals pass, or performance certification without actual measured evidence.

## Mobile UX smoke checkpoint

Optional pre-publish mobile checks are documented in [`docs/mobile-ux-smoke.md`](mobile-ux-smoke.md). Do not claim mobile UX pass, mobile performance certification, or Lighthouse/Core Web Vitals pass unless actually measured.

## EduGen boundary polish checkpoint

Before creating a tag or publishing a GitHub Release, review [`docs/edugen-boundary-polish.md`](edugen-boundary-polish.md). Confirm JSON/CSV/text/Markdown/`.txt/.md` remain described as local import surfaces, and PDF/DOCX/PPTX/ZIP import is described as requiring a separate configured browser-reachable EduGen/File Processor service. Do not claim document import passed unless a real configured run verifies it.

## Phase 10I cross-device export/import checkpoint

Before publishing, review [`docs/cross-device-export-import.md`](cross-device-export-import.md). Confirm release notes do not imply automatic cloud/account/backend sync, encrypted backups, or cross-device restore pass evidence unless an actual source/destination or clean-profile run was completed.

## Final public release readiness re-audit checkpoint

Before creating a tag or publishing a GitHub Release, review [`docs/final-public-release-readiness-reaudit.md`](final-public-release-readiness-reaudit.md). It documents Phase 10A–10I readiness inventory, evidence gaps, forbidden claims, and final validation expectations.

## Phase 10K release candidate tag/publish gate

The release candidate tag/publish gate is documented in [`release-candidate-tag-publish-gate.md`](release-candidate-tag-publish-gate.md). It records that no release tag has been created, no GitHub Release has been published, no release package has been published, and explicit user approval is required before any tag or publish action. Known evidence gaps and allowed/forbidden claims remain documented.


## Phase 10L manual evidence reference
Manual evidence run pack: [`docs/manual-evidence-run-pack.md`](manual-evidence-run-pack.md) is an optional pre-tag/pre-publish evidence checklist. Tag/publish still requires explicit user approval.

## Phase 10M release tag creation plan

The release tag creation plan in [`docs/release-tag-creation-plan.md`](release-tag-creation-plan.md) documents pre-tag validation, example tag commands, rollback notes, and explicit user approval requirements.

## GitHub Release publication plan

See [`docs/github-release-publication-plan.md`](github-release-publication-plan.md) for the Phase 10N publication checklist and notes plan. The UI/CLI examples are documentation only and must not be executed without explicit user approval.


## Release package assembly reference

See [`docs/release-package-assembly-plan.md`](release-package-assembly-plan.md) before assembling or uploading any release package. The checklist documents allowed contents, exclusions, verification, and explicit user approval requirements.
