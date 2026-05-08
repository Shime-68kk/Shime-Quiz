# Version / Release Tag Decision

## Purpose

This document records the Phase 9A version / release tag decision planning for the Shime Quiz release-candidate track. It documents the current package version, safe release tag options, approval criteria, and claim boundaries before a GitHub Release draft is prepared.

Phase 9A is documentation, release-readiness, static validation, and CI registration only. It does not change the package version, does not create a git tag, does not publish a GitHub release, and does not certify production or security readiness.

## Current baseline

- Project baseline: completed/merged through Phase 8Y.
- Final RC audit documentation exists: [`docs/final-rc-audit.md`](final-rc-audit.md).
- CI green verification documentation exists: [`docs/ci-green-verification.md`](ci-green-verification.md).
- GitHub Release draft documentation is prepared later in Phase 9B at [`docs/github-release-draft.md`](github-release-draft.md).
- Release tag has not been created in this phase.
- GitHub release has not been published in this phase.
- Current `package.json` version: `2.0.0-beta-ai.1`.

## Release naming / tag options

These options are documented for the user to choose from before any tag or release is created:

1. **Keep the existing package version and create an RC tag later**
   - Keep `package.json` at `2.0.0-beta-ai.1`.
   - Use a git tag that clearly identifies the release-candidate state.
   - This is conservative because it avoids a package version bump in the release-decision phase.

2. **Create a `v2.0.0-rc1` tag later**
   - Use this if the user wants the current audited release-candidate baseline to become the first public RC tag.
   - This option may be appropriate if the current app is being presented as the first release candidate after the Phase 8X/8Y readiness work.
   - The tag should only be created after the user approves it and after release checks are current.

3. **Create a `v2.0.0-rc2` tag later**
   - Use this if the user considers the earlier RC baseline already represented and wants a new RC tag after the Phase 8X/8Y audit and CI verification work.
   - This is useful when the release track needs to distinguish the final docs/onboarding/E2E-readiness pass from an earlier candidate.

4. **Keep a beta-style tag for continuity**
   - Use this if the user wants tag naming to follow the current package version style, such as a tag aligned with `2.0.0-beta-ai.1`.
   - This keeps continuity with the current package label but may be less clear than an explicit RC tag for public release-candidate communication.

## Recommendation

Recommended conservative strategy: **do not change `package.json` in Phase 9A**. Document the options now, then let the user approve the exact tag in a later release step.

If the user wants a clear release-candidate tag, `v2.0.0-rc1` is the most straightforward option. If the user wants to treat the current post-audit baseline as a newer candidate after earlier RC work, `v2.0.0-rc2` is also reasonable. The final decision belongs to the user and should happen before tag creation.

## Criteria before creating a tag

Before a release tag is created, verify:

- Main branch is clean and up to date.
- GitHub Actions is green if claiming CI green.
- `npm ci` passes.
- `npm run build` passes.
- Full static validator chain passes.
- E2E pass evidence is available if claiming E2E pass.
- Public docs are reviewed.
- Final RC audit is reviewed.
- CI green verification guide is reviewed.
- Release notes/draft are prepared in Phase 9B — GitHub Release Draft at [`docs/github-release-draft.md`](github-release-draft.md).
- Package/source archive cleanliness is checked in Phase 9C.
- Final release checklist is completed in Phase 9D.

## This phase does not

Phase 9A does **not**:

- Change the package version.
- Create a git tag.
- Publish a GitHub release.
- Certify production readiness.
- Certify security readiness.
- Add runtime app behavior.
- Change E2E test logic.
- Change import/parser logic.
- Change EduGen source.
- Add AI/API/OCR/backend behavior.
- Change storage/schema/scoring/SRT/mastery behavior.
- Change dependencies.

## Claims control

Safe claims after Phase 9A:

- Release tag decision documentation exists.
- Release tag/version options are documented.
- Current package version is captured as `2.0.0-beta-ai.1`.
- Phase 9B — GitHub Release Draft is the recommended next release-finalization step.

Unsafe claims after Phase 9A:

- Do not claim a release tag was created.
- Do not claim a GitHub release was published.
- Do not claim the package version was changed unless the user explicitly requested and approved a future change.
- Do not claim production certification.
- Do not claim security certification.
- Do not claim built-in AI quiz generation.
- Do not claim external AI/API integration.
- Do not claim API key/BYOK support.
- Do not claim OCR support.
- Do not claim EduGen is bundled into Shime.
- Do not claim backend/cloud sync.


## Phase 9C release package/source archive verification reference

Before creating any tag, review [`docs/release-package-cleanliness.md`](release-package-cleanliness.md). The Phase 9C guide documents source archive cleanliness checks, generated artifact exclusions, dry-run cleanup guidance, and claims boundaries. It does not create a tag, publish a GitHub Release, publish a release package, or change package version.

## Phase 9D release tag / publish checklist reference

After the user chooses a tag/version strategy, review [`docs/release-tag-publish-checklist.md`](release-tag-publish-checklist.md) before creating any tag or publishing any GitHub Release. The checklist documents final pre-tag validation, source archive cleanliness, GitHub Release draft review, safe example commands, stop conditions, and claims controls. Phase 9D does not create a tag, publish a GitHub Release, publish a release package, or change package version.
