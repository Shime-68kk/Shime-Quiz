# Release Package Assembly Plan

## Purpose of Phase 10O

Phase 10O documents a **Release Package Assembly Plan** for a future user-approved ShimeChamhoc v2 / Shime Quiz release. It explains how to assemble a clean release package later, what to include, what to exclude, and how to verify package cleanliness without creating or publishing a package in this phase.

## Current baseline

- Project state is completed/merged through Phase 10N.
- GitHub Release publication plan docs exist in [`docs/github-release-publication-plan.md`](github-release-publication-plan.md).
- Release tag creation plan docs exist in [`docs/release-tag-creation-plan.md`](release-tag-creation-plan.md).
- Manual evidence run pack docs exist in [`docs/manual-evidence-run-pack.md`](manual-evidence-run-pack.md).
- Release candidate tag/publish gate docs exist in [`docs/release-candidate-tag-publish-gate.md`](release-candidate-tag-publish-gate.md).
- Final public release readiness re-audit docs exist in [`docs/final-public-release-readiness-reaudit.md`](final-public-release-readiness-reaudit.md).
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been created.
- Release package has not been published.
- Package version remains unchanged unless explicitly approved by the user.

## Package policy

- This phase does not create a release package.
- Package assembly requires explicit user approval.
- Package upload/publication requires explicit user approval.
- Release tag and GitHub Release publication remain separate actions.
- Package contents must preserve claims guardrails from the README, public release notes, release draft, and release checklist.
- A package should not imply production/security/accessibility/performance certification or evidence that has not actually been collected.

## Recommended package contents

A future **source package** should include files needed to inspect, build, and validate the app:

- source files needed to build/run the app
- public assets
- documentation under `docs/`
- scripts under `scripts/`
- `package.json`
- `package-lock.json`
- config files needed for static hosting, CI, Vite, and local development
- safe `.env.example` template

## Exclude from package

A future source package should exclude generated artifacts, secrets, and local/private data:

- `node_modules`
- `dist` unless explicitly building a deploy artifact
- `test-results`
- `playwright-report`
- `coverage`
- `.git`
- `FETCH_HEAD`
- real `.env` files such as `.env`, `.env.local`, `.env.production`, `.env.development`, `.env.test`, `.env.staging`, and `.env.preview`
- private keys or credentials
- service account files
- local user data/backups
- fake/mock screenshots

## Optional package variants

Package variants should be named and labeled clearly:

- **Source package:** clean repository source for building and validation. This is the default package type.
- **Deploy artifact package:** built output such as `dist`, only if explicitly built and labeled as a deploy artifact.
- **Documentation/evidence package:** docs and evidence artifacts, only if actual evidence artifacts exist. Do not include fake/mock screenshots or unverified evidence.

## Assembly checklist

Before assembling a package after user approval:

1. Confirm latest validated `main` is checked out.
2. Confirm the working tree is clean.
3. Run `npm ci`.
4. Run `npm run build`.
5. Run the full static validator chain.
6. Remove generated artifacts before creating a source package.
7. Confirm no secrets are present.
8. Confirm no local user data/backups are present.
9. Confirm docs, public release notes, GitHub Release draft, tag/publish checklist, and package cleanliness docs are current.
10. Confirm allowed/forbidden claims remain accurate.
11. Obtain explicit user approval before package assembly.
12. Obtain explicit user approval before package upload/publication.

## Suggested commands as plan only

These are command examples only. Do not execute in this phase.

### `git archive` source package option

```bash
git archive --format=zip --output Shime-Quiz-<chosen-tag>-source.zip HEAD
```

### Zip clean source directory option

```bash
rsync -a --exclude node_modules --exclude dist --exclude test-results --exclude playwright-report --exclude coverage --exclude .git ./ /tmp/shime-release-source/
(cd /tmp && zip -r Shime-Quiz-<chosen-tag>-source.zip shime-release-source)
```

### Optional checksum generation

```bash
sha256sum Shime-Quiz-<chosen-tag>-source.zip > Shime-Quiz-<chosen-tag>-source.zip.sha256
```

## Verification checklist

After assembling a package, verify it in a clean temporary directory:

1. Unzip package into temp directory.
2. Confirm package does not contain `.git`.
3. Confirm package does not contain `node_modules`, `dist`, `test-results`, `playwright-report`, or `coverage` unless it is an explicitly labeled deploy artifact package.
4. Confirm package does not contain real `.env` files, private keys, credentials, service account files, local user data, or local backups.
5. Run `npm ci`.
6. Run `npm run build`.
7. Run target validators or the full static validator chain.
8. Confirm README and release docs claims are safe.
9. Confirm package contents match the intended package variant.

## Release asset guidance

- Upload package only after explicit user approval.
- GitHub Release publication remains separate from package assembly.
- Release package upload/publication should not imply production/security/accessibility/performance certification.
- Release package upload/publication should not imply screenshots, mobile UX, configured EduGen import, cross-device restore, E2E, Lighthouse, or Core Web Vitals passed unless those runs actually passed and evidence is available.

## Evidence gap reminder

The following remain gaps unless separately completed and recorded:

- Screenshots not captured unless separately done.
- Manual mobile UX smoke not run unless separately done.
- Configured EduGen import smoke not run unless separately done.
- Cross-device restore smoke not run unless separately done.
- Lighthouse/Core Web Vitals not measured unless separately done.
- E2E may be environment-blocked if Chromium is unavailable.

## Allowed claims

- Release package assembly plan exists.
- Package contents/exclusion checklist is documented.
- Package publication remains gated by explicit user approval.

## Forbidden claims

Do not claim any of the following unless separately completed and supported by evidence:

- release package created
- release package published/uploaded
- GitHub Release published
- release tag created
- production/security/accessibility/performance certification
- built-in AI generation
- external AI/API integration
- API key/BYOK support
- OCR
- EduGen bundled into Shime
- frontend-only document conversion
- backend/cloud/account sync
- automatic cross-device sync
- encrypted backups unless implemented
- screenshots captured unless actual files exist
- mobile UX passed unless actual run evidence exists
- configured EduGen import passed unless actual configured run exists
- cross-device restore passed unless actual run exists
- Lighthouse/Core Web Vitals pass unless measured

## Recommended next step

Recommended next step: user-approved release package assembly, user-approved actual tag/release publication, or Phase 10P — Final Release Execution Checklist.
