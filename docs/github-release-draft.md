# GitHub Release Draft

## Purpose

This document records the Phase 9B GitHub Release Draft for the Shime Quiz release-finalization track. It provides safe release-note content that can be copied into a GitHub Release later, after the user decides the exact version/tag and after the remaining release package and publish checks are complete.

Phase 9B is documentation, release-readiness, static validation, and CI registration only. It does not change the package version, does not create a release tag, does not publish a GitHub release, and does not certify production or security readiness.

## Current baseline

- Project baseline: completed/merged through Phase 9A.
- Final RC audit documentation exists: [`docs/final-rc-audit.md`](final-rc-audit.md).
- CI green verification documentation exists: [`docs/ci-green-verification.md`](ci-green-verification.md).
- Release tag decision documentation exists: [`docs/release-tag-decision.md`](release-tag-decision.md).
- Release tag has not been created in this phase.
- GitHub release has not been published in this phase.
- Package version was not changed in this phase.

## Draft release title options

Choose one later, after the user approves the exact tag/version strategy:

- `Shime Quiz v2.0.0 RC`
- `Shime Quiz v2.0.0-rc1`
- `Shime Quiz beta/RC release` if the user chooses beta-style continuity with the current package version label

## Draft tag placeholder

**Tag placeholder:** `TBD by user before publishing`

Do not hard-claim that `v2.0.0-rc1` exists until the user has approved that tag and the tag is actually created. The release tag/version decision belongs to the user and is documented separately in [`docs/release-tag-decision.md`](release-tag-decision.md).

## Draft release summary

Shime Quiz is a local-first quiz study app for building and studying reviewed quiz content in the browser. This release-candidate draft highlights import workflows, first-run onboarding, a safe demo quickstart, release-readiness documentation, static validators, and E2E smoke coverage.

The app helps users study from imported quiz content, try the app with the local **Dùng quiz mẫu** demo quickstart, and use onboarding guidance from Dashboard and Library without auto-saving content. Import and demo paths preserve preview, validation, advisory quality review, and explicit confirm-save before local storage is updated.

## Draft capabilities

The current release-candidate notes can safely mention:

- Local-first quiz study app behavior.
- JSON/CSV import.
- Paste text/Markdown draft import.
- Local `.txt`/`.md` draft import.
- PDF/DOCX/PPTX/ZIP draft import through a separate configured EduGen/File Processor service.
- Advisory quiz draft quality review before save.
- Duplicate multiple-choice choice ID detection in quality review.
- Manual AI prompt/export workflow.
- Manual AI output review/import hardening.
- Public demo sample pack.
- In-app **Dùng quiz mẫu** quickstart.
- Library empty-state onboarding.
- Dashboard first-run onboarding.
- Onboarding E2E smoke coverage.
- Local E2E verification docs.
- Final RC audit docs.
- CI green verification docs.
- Release tag decision docs.

## Install and run locally

```bash
npm ci
npm run dev
```

For production-style local preview:

```bash
npm run build
npm run preview
```

## Validation before publishing

Use these checks before publishing a release or making CI/E2E claims:

```bash
npm ci
npm run build
# Run the full static validator chain registered in .github/workflows/e2e-smoke.yml
npm run test:e2e:smoke
npm run test:e2e:onboarding
```

GitHub Actions CI green can only be claimed after an actual passing GitHub Actions run for the target branch and commit. Local validation, static validation, or an environment-blocked browser run is not enough to claim GitHub Actions CI green.

## EduGen/File Processor requirement

EduGen/File Processor is a separate service and is not bundled into Shime. PDF/DOCX/PPTX/ZIP document import requires a configured, browser-reachable EduGen/File Processor service, such as a valid `VITE_FILE_PROCESSOR_URL` target.

Frontend-only hosting alone can host the Shime app shell, but it does not provide document conversion for PDF/DOCX/PPTX/ZIP. The onboarding E2E smoke path and **Dùng quiz mẫu** quickstart do not require EduGen.

## Manual AI workflow caveat

AI-related workflow support is manual only:

- Manual prompt/export workflow only.
- Manual output paste/import only.
- No built-in AI generation.
- No external AI/API calls from Shime.
- No API key/BYOK implementation.
- User preview, review, and confirm-save are still required before imported or pasted content is saved.

## Known boundaries and unsupported claims

Do not use this release draft to claim:

- OCR support.
- Backend/auth/cloud sync.
- EduGen bundled into Shime.
- Frontend-only hosting provides PDF/DOCX/PPTX/ZIP document conversion without a browser-reachable EduGen/File Processor service.
- Production certification.
- Security certification.
- A guarantee that AI output is correct, private, or high-quality.
- Every environment has passed E2E.
- GitHub Actions CI is green unless an actual GitHub Actions run passes.
- Release tag created.
- GitHub release published.

## Release checklist before publishing

Before publishing a GitHub Release, verify:

- Tag/version decision is completed and approved by the user.
- Main branch is clean and up to date.
- GitHub Actions is green if claiming CI green.
- `npm ci` passes.
- `npm run build` passes.
- Full static validator chain passes.
- E2E pass evidence is available if claiming E2E pass.
- Release package/source archive cleanliness is checked in Phase 9C — Release Package / Source Archive Verification.
- Final publish checklist is completed in Phase 9D.

## Safe conclusion

Safe claims after Phase 9B:

- GitHub release draft documentation exists.
- Release notes content is drafted for later publication.

Unsafe claims after Phase 9B:

- Do not say GitHub release published.
- Do not say release tag created.
- Do not say package version changed.
- Do not say production certified.
- Do not say security certified.


## Phase 9C release package/source archive verification reference

Before publishing this draft as a GitHub Release, review [`docs/release-package-cleanliness.md`](release-package-cleanliness.md). Phase 9C documents release package/source archive verification, generated/local artifact exclusions, and dry-run cleanup guidance. It does not publish a release package, create a tag, publish a GitHub Release, change package version, or certify production/security readiness.

## Phase 9D release tag / publish checklist reference

Before publishing this draft, review [`docs/release-tag-publish-checklist.md`](release-tag-publish-checklist.md). The checklist documents final tag/publish steps, validation evidence, release package cleanliness review, stop conditions, and safe example commands. Phase 9D does not create a release tag, publish a GitHub Release, publish a release package, change package version, or certify production/security readiness.

## Import regression smoke note

Import surface manual regression smoke steps are documented in [`docs/import-regression-smoke.md`](import-regression-smoke.md). Do not add release-note claims that all import formats passed unless the relevant manual smoke run actually passed. EduGen document import pass claims require a separate configured service to have been tested.

## Backup/restore regression smoke note

Backup / restore manual regression smoke steps are documented in [`docs/backup-restore-regression-smoke.md`](backup-restore-regression-smoke.md). Do not add release-note claims that backup/restore regression passed, or that all state categories were preserved, unless the relevant manual smoke run actually passed and each category was checked.
