# Phase 10M — Release Tag Creation Plan

## Purpose

Phase 10M creates a **Release Tag Creation Plan** for ShimeChamhoc v2. This is a plan only: this phase does not create a git tag, does not push a tag, does not publish a GitHub Release, does not publish a release package, does not change package version, does not add dependencies, and does not change runtime app behavior.

## Current baseline

- Shime Quiz / ShimeChamhoc v2 is completed/merged through Phase 10L.
- Manual evidence run pack docs exist.
- Release candidate tag/publish gate docs exist.
- Final public release readiness re-audit docs exist.
- Phase 10 public-polish docs are inventoried.
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been published.
- Package version remains unchanged unless explicitly approved by the user. Current package version remains `2.0.0-beta-ai.1`.

## Tag creation policy

- This phase does not create a tag.
- Tag creation requires explicit user approval.
- The final tag name must be chosen by user before any command is run.
- A tag must be created from latest validated main.
- A tag should not be created from a dirty working tree.
- A tag should not be created if validators fail or if the full static validator chain fails.
- GitHub Release publication and release package publication remain separate follow-up actions.

## Candidate tag naming options

These candidate tag naming options are examples only; they are not created tags.

- `v2.0.0-beta-ai.1`
  - Pro: matches the current package version exactly.
  - Con: reads like a beta tag rather than an RC-specific tag.
- `v2.0.0-beta-ai.1-rc1`
  - Pro: preserves current beta version lineage while marking the candidate as release-candidate 1.
  - Con: longer and slightly less conventional than a simple RC tag.
- `v2.0.0-rc1`
  - Pro: conventional release-candidate tag.
  - Con: differs from the current package version unless the user also approves a versioning decision later.

The final tag name must be chosen by user before tagging.

## Pre-tag validation checklist

Before a user-approved tag is created:

1. `git checkout main`
2. `git pull origin main`
3. Confirm a clean working tree with `git status --short`.
4. Run `npm ci`.
5. Run `npm run build`.
6. Run the full static validator chain.
7. Optionally run `npm run test:e2e:smoke` and `npm run test:e2e:onboarding` if Chromium is available.
8. Optionally run the manual evidence pack if the user wants screenshots, mobile, configured EduGen, cross-device, E2E, or Lighthouse/Core Web Vitals evidence before tagging.
9. Confirm no generated artifacts are tracked.
10. Confirm no secrets are tracked.
11. Confirm release notes, GitHub Release draft, release package cleanliness checklist, and release tag/publish checklist are current.
12. Confirm allowed/forbidden claims remain correct.

## Tag creation command plan only

The following commands are a plan only and are not executed in this phase:

```bash
git tag -a <chosen-tag> -m "<message>"
git push origin <chosen-tag>
```

Rollback notes:

- If a local tag was created but not pushed, delete it with `git tag -d <chosen-tag>`.
- If a remote tag was pushed by mistake, delete the remote tag only with explicit user approval, for example `git push origin :refs/tags/<chosen-tag>`.
- Do not delete remote tags casually; coordinate before changing public release history.

## GitHub Release follow-up plan

After a tag is created, the GitHub Release draft can be prepared or published only with explicit user approval. Release notes must preserve claims guardrails. Release package publication remains separate from tag creation and GitHub Release publication.

## Evidence gap reminder

- Screenshots not captured unless separately done.
- Manual mobile UX smoke not run unless separately done.
- Configured EduGen import smoke not run unless separately done.
- Cross-device restore smoke not run unless separately done.
- Lighthouse/Core Web Vitals not measured unless separately done.
- E2E may be environment-blocked if Chromium is unavailable.

## Allowed claims

- Release tag creation plan exists.
- Tag creation commands/checklist are documented.
- Tag/publish remains gated by explicit user approval.

## Forbidden claims

Do not claim:

- release tag created
- GitHub Release published
- release package published
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

After this plan is accepted, the next step is either user-approved actual tag creation or **Phase 10N — GitHub Release Publication Plan**.
