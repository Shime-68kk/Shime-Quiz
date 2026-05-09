# Phase 10N — GitHub Release Publication Plan

## Purpose

Phase 10N documents a safe, explicit, user-approved GitHub Release publication plan for the current ShimeChamhoc v2 release-candidate state.

This phase does not publish a GitHub Release, does not create or push a git tag, does not publish a release package, does not change package version, and does not change runtime app behavior.

## Current baseline

- Shime Quiz / ShimeChamhoc v2 is completed/merged through Phase 10M.
- Release tag creation plan docs exist in [`docs/release-tag-creation-plan.md`](release-tag-creation-plan.md).
- Manual evidence run pack docs exist in [`docs/manual-evidence-run-pack.md`](manual-evidence-run-pack.md).
- Release candidate tag/publish gate docs exist in [`docs/release-candidate-tag-publish-gate.md`](release-candidate-tag-publish-gate.md).
- Final public release readiness re-audit docs exist in [`docs/final-public-release-readiness-reaudit.md`](final-public-release-readiness-reaudit.md).
- Phase 10 public-polish docs are inventoried across README, release docs, and the final re-audit.
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been published.
- Package version remains unchanged unless explicitly approved by the user. Current package version remains `2.0.0-beta-ai.1` unless changed in a future approved phase.

## Publication policy

- This phase does not publish a GitHub Release.
- GitHub Release publication requires explicit user approval.
- A release tag should exist before publishing a GitHub Release.
- The final tag name must be chosen by user before publication.
- Release notes must preserve claims guardrails.
- Release package/upload artifacts remain separate unless explicitly approved.
- Do not publish automatically.
- Do not upload release artifacts automatically.

## Pre-publication checklist

Before publishing a GitHub Release later, verify:

1. Latest validated main is checked out.
2. Working tree is clean.
3. Release tag exists only after explicit approval.
4. `npm ci` passes.
5. `npm run build` passes.
6. Full static validator chain passes.
7. Optional E2E smoke/onboarding is run if Chromium is available.
8. Optional manual evidence pack is run if the user wants screenshot/mobile/EduGen/cross-device evidence.
9. No generated artifacts are staged or committed.
10. No secrets are staged or committed.
11. [`docs/github-release-draft.md`](github-release-draft.md) is current.
12. [`docs/public-release-notes.md`](public-release-notes.md) is current.
13. [`docs/release-tag-publish-checklist.md`](release-tag-publish-checklist.md) is current.
14. Allowed and forbidden claims are reviewed before publishing.

## GitHub Release draft content plan

Use the user-chosen tag in the release title. Suggested content sections:

- Summary of ShimeChamhoc v2 / Shime Quiz as a local-first browser quiz study app.
- Supported local-first features: Library, Study Room, Dashboard progress, local import surfaces, backup/restore, demo quickstart, and advisory quality review.
- Import boundaries: JSON, CSV, text/Markdown, and local `.txt/.md` are local/browser import surfaces.
- EduGen/File Processor boundary: PDF/DOCX/PPTX/ZIP document import requires a separate configured browser-reachable EduGen/File Processor service.
- Backup/privacy/cross-device portability notes: data is browser-local, backups may contain private study data and answers, and cross-device movement requires explicit export/import/backup/restore.
- Known limitations/evidence gaps.
- Validation summary.
- Forbidden claims reminder.

## Publication UI / command plan

These are documentation-only examples. Do not execute in this phase.

### GitHub UI path

1. Open the repository on GitHub.
2. Go to **Releases**.
3. Choose **Draft a new release**.
4. Select the user-approved tag.
5. Use [`docs/github-release-draft.md`](github-release-draft.md) and [`docs/public-release-notes.md`](public-release-notes.md) as release-note sources.
6. Review claims guardrails before publishing.
7. Publish only after explicit user approval.

### GitHub CLI example

```bash
gh release create <chosen-tag> --title "ShimeChamhoc v2 <chosen-tag>" --notes-file docs/github-release-draft.md
```

This command is a plan only and must not be run until the user explicitly approves publication and confirms the tag.

Artifact/upload guidance remains optional and separate. Do not attach release packages unless the user explicitly approves package assembly and upload.

## Rollback and correction notes

- If the release draft text is wrong, edit the draft before publishing.
- If a published release has incorrect text, edit release notes immediately and preserve claims guardrails.
- If the tag is wrong, handle tag correction only with explicit user approval.
- Do not delete remote tags or GitHub Releases casually.
- Do not rewrite release history without explicit user approval and a clear correction plan.

## Evidence gap reminder

Do not overclaim evidence that has not been collected:

- Screenshots not captured unless separately done.
- Manual mobile UX smoke not run unless separately done.
- Configured EduGen import smoke not run unless separately done.
- Cross-device restore smoke not run unless separately done.
- Lighthouse/Core Web Vitals not measured unless separately done.
- E2E may be environment-blocked if Chromium unavailable.

## Allowed claims

Safe claims after Phase 10N:

- GitHub Release publication plan exists.
- GitHub Release checklist/notes plan is documented.
- Release publication remains gated by explicit user approval.
- GitHub Release draft and public release notes are referenced for later publication review.

## Forbidden claims

Do not claim:

- GitHub Release published.
- Release tag created.
- Release package published.
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

Next options:

- User-approved actual tag creation and GitHub Release publication.
- Phase 10O — Release Package Assembly Plan.


## Release package assembly follow-up

See [`docs/release-package-assembly-plan.md`](release-package-assembly-plan.md) for the future user-approved release package assembly plan. No release package has been created or uploaded by that plan, and GitHub Release publication remains a separate explicit approval step.

## Phase 10P final release execution checklist

The final release execution checklist is documented in [`docs/final-release-execution-checklist.md`](final-release-execution-checklist.md). It keeps GitHub Release publication as a separate user-approved action and confirms no release has been published by Phase 10P.
