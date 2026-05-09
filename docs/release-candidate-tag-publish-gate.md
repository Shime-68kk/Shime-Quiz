# Release Candidate Tag Decision / Publish Gate — Phase 10K

## Purpose of Phase 10K

Phase 10K creates a release candidate tag decision / publish gate before any actual release tag, GitHub Release, or release package publication. This is a documentation/static-validator/CI registration phase only. It does not create a git tag, publish a GitHub Release, publish a release package, change package version, or change runtime app behavior.

## Current baseline

Shime Quiz / ShimeChamhoc v2 is completed/merged through Phase 10J.

The current public-readiness baseline includes:

- Final public release readiness re-audit docs exist.
- Public landing/root route polish exists.
- Social preview metadata exists.
- Direct-route SPA fallback audit docs exist.
- Screenshot capture checklist exists.
- README public-facing rewrite exists.
- Performance/bundle-size audit docs exist.
- Mobile UX smoke checklist exists.
- EduGen/File Processor boundary docs exist.
- Cross-device export/import guidance exists.

## Current publication state

- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been published.
- Package version remains unchanged unless explicitly updated by the user in a future phase.

Current package version recorded from `package.json`: `2.0.0-beta-ai.1`.

## Release gate decision

Recommended status: **HOLD FOR USER APPROVAL before tag/publish**.

- Tag/publish action requires explicit user approval.
- Do not tag automatically.
- Do not publish automatically.
- Do not change the package version unless explicitly instructed.
- Do not publish a release package unless explicitly approved.

## Evidence available

Available release-readiness evidence:

- `npm ci` passes when run in the validation environment.
- `npm run build` passes when run in the validation environment.
- Full static validator chain passes when run.
- Known Vite/Rolldown chunk-size warning is documented as non-blocking when build passes.
- Documentation, validators, and CI coverage exist for release-readiness guardrails.

## Evidence gaps

The following are documented gaps, not pass claims:

- Screenshots not captured unless separately done.
- Manual mobile UX smoke not run unless separately done.
- Configured EduGen document import smoke not run unless separately done.
- Cross-device backup/restore smoke not run unless separately done.
- E2E may be environment-blocked when Chromium is unavailable.
- Lighthouse/Core Web Vitals not measured unless separately done.

## Tag naming guidance

Proposed tag names are examples only. Do not create any of these tags automatically.

Possible candidate names:

- `v2.0.0-beta-ai.1-rc`
- `v2.0.0-rc1`
- `v2.0.0-beta-ai.1`

The final tag name must be chosen by the user before tagging.

## Publish gate checklist

Before any tag or GitHub Release publication:

1. Confirm latest `main` contains Phase 10J.
2. Run `npm ci`.
3. Run `npm run build`.
4. Run the full static validator chain.
5. Confirm the working tree is clean.
6. Confirm no generated artifacts are tracked.
7. Confirm no secrets are tracked.
8. Confirm release notes, GitHub Release draft, and publish checklist are current.
9. Confirm allowed/forbidden claims are still accurate.
10. Obtain explicit user approval for the release tag.
11. Obtain explicit user approval for GitHub Release publish.
12. Do not publish a release package without explicit user approval.

## Allowed claims

The project can claim:

- Release candidate readiness gate docs exist.
- Tag/publish decision checklist exists.
- Final re-audit docs exist.
- Phase 10 public-polish docs are inventoried.
- Known evidence gaps are documented.

## Forbidden claims

Do not claim:

- Release tag created.
- GitHub Release published.
- Release package published.
- Production/security/accessibility/performance certification.
- Built-in AI generation.
- External AI/API integration or external AI/API calls from Shime.
- API key/BYOK support.
- OCR.
- EduGen bundled into Shime.
- Frontend-only PDF/DOCX/PPTX/ZIP document conversion.
- Backend/cloud/account sync.
- Automatic cross-device sync.
- Encrypted backups unless implemented.
- Screenshots captured unless actual image files exist.
- Mobile UX passed unless actual run evidence exists.
- Configured EduGen import passed unless actual configured run exists.
- Cross-device restore passed unless actual run exists.
- Lighthouse/Core Web Vitals pass unless measured.

## Recommended next step

Recommended next phase: **Phase 10L — Manual Evidence Run Pack**.

Alternative: user-approved release tag creation if the user explicitly decides to tag and accepts the documented evidence gaps.


## Phase 10L manual evidence reference
Manual evidence run pack: [`docs/manual-evidence-run-pack.md`](manual-evidence-run-pack.md) gathers optional evidence checklists before user-approved tag/publish. No evidence pass is claimed unless the run is actually performed.

## Phase 10M release tag creation plan

The follow-up tag creation plan is documented in [`docs/release-tag-creation-plan.md`](release-tag-creation-plan.md). It provides example tag names and command plans only; explicit user approval is required before tag creation or publishing.

## Related GitHub Release publication plan

The release gate now links to the GitHub Release publication plan in [`docs/github-release-publication-plan.md`](github-release-publication-plan.md). Publication remains gated by explicit user approval, and release package/upload artifacts remain separate unless explicitly approved.
