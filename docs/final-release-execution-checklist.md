# Phase 10P — Final Release Execution Checklist

## Purpose

Phase 10P adds a **Final Release Execution Checklist** for the current ShimeChamhoc v2 / Shime Quiz release-candidate state. It consolidates the final user-approved release execution flow into one ordered checklist.

This phase is documentation/static-validator/CI registration only. It does not execute release actions.

## Current baseline

- Completed/merged through Phase 10O.
- Release package assembly plan docs exist.
- GitHub Release publication plan docs exist.
- Release tag creation plan docs exist.
- Manual evidence run pack docs exist.
- Release candidate tag/publish gate docs exist.
- Final public release readiness re-audit docs exist.
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been created.
- Release package has not been published.
- Package version remains unchanged unless explicitly approved by the user.

## Final release execution policy

- This phase does not execute release actions.
- Release execution requires explicit user approval.
- Tag creation, package assembly, release asset upload, and GitHub Release publication are separate user-approved actions.
- Final tag name must be chosen by user before tagging.
- Release notes must preserve claims guardrails.
- Do not create a tag, assemble a package, upload release assets, or publish a GitHub Release from this phase.

## Ordered release execution checklist

1. Confirm latest `main` is the intended release source.
2. Confirm clean working tree.
3. Confirm package version decision.
4. Run `npm ci`.
5. Run `npm run build`.
6. Run the full static validator chain.
7. Optionally run E2E smoke/onboarding if Chromium is available.
8. Optionally run the manual evidence pack.
9. Confirm no generated artifacts are included.
10. Confirm no secrets or user data are included.
11. Review README, public release notes, and GitHub Release draft.
12. Confirm allowed/forbidden claims.
13. Choose final tag name.
14. Create annotated tag only after explicit approval.
15. Assemble release package only after explicit approval.
16. Publish GitHub Release only after explicit approval.
17. Upload release assets only after explicit approval.
18. Record final release evidence, commands, commit SHA, and tag.

## Command checklist as documentation only

These commands are examples for a future user-approved execution. Do not execute in this phase.

```bash
git checkout main
git pull origin main
git status --short
npm ci
npm run build
# Run the full static validator chain.
# Optionally run E2E if Chromium is available.
git tag -a <chosen-tag> -m "<message>"
git push origin <chosen-tag>
# Package assembly command placeholders go here only after user approval.
# GitHub Release may be published through the GitHub UI or:
gh release create <tag>
```

## Release evidence recording template

Record the following after an actual user-approved release execution:

- Date/time:
- Commit SHA:
- Branch:
- Chosen tag:
- Package version:
- Commands run:
- Validator result:
- E2E result or environment-blocked reason:
- Manual evidence result, if any:
- Release package path/checksum, if created:
- GitHub Release URL, if published:
- Claims allowed after release:

## Pre-release blockers

Stop before release execution if any of the following are present:

- Failing validators.
- Dirty working tree.
- Generated artifacts in source package.
- Secrets or user data in package.
- Unclear tag/version decision.
- Unsupported claims in release notes.
- Accidental evidence-pass claims without evidence.

## Evidence gap reminder

These gaps remain unless separately completed and recorded:

- Screenshots not captured unless separately done.
- Manual mobile UX smoke not run unless separately done.
- Configured EduGen import smoke not run unless separately done.
- Cross-device restore smoke not run unless separately done.
- Lighthouse/Core Web Vitals not measured unless separately done.
- E2E may be environment-blocked if Chromium is unavailable.

## Allowed claims

- Final release execution checklist exists.
- Ordered release execution flow is documented.
- Release actions remain gated by explicit user approval.

## Forbidden claims

Do not claim any of the following unless separately and actually performed/implemented:

- Final release executed.
- Release package created.
- Release package published/uploaded.
- GitHub Release published.
- Release tag created.
- Tag pushed.
- Package version changed.
- Production/security/accessibility/performance certification.
- Built-in AI generation.
- External AI/API integration.
- API key/BYOK support.
- OCR.
- EduGen bundled into Shime.
- Frontend-only document conversion.
- Backend/cloud/account sync.
- Automatic cross-device sync.
- Encrypted backups unless implemented.
- Screenshots captured unless actual files exist.
- Mobile UX passed unless actual run evidence exists.
- Configured EduGen import passed unless actual configured run exists.
- Cross-device restore passed unless actual run exists.
- Lighthouse/Core Web Vitals pass unless measured.

## Recommended next step

- User-approved final release execution.
- Or stop planning and keep the release candidate unpublished.

## Phase 10Q reference

See [`docs/final-main-release-authorization.md`](final-main-release-authorization.md) for the final main verification / release authorization packet. Phase 10Q keeps release execution gated by explicit user approval and does not create a package, tag, GitHub Release, or upload assets.

## Phase 10R follow-up

See [Release Candidate Freeze / Final Decision Memo](release-candidate-freeze-final-decision.md). The freeze memo keeps release execution unpublished and documents final decision options.
