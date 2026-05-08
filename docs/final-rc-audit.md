# Final RC Audit / Release Tag Readiness

## Purpose

This document records the final release-candidate audit state before moving to later release-management work such as GitHub Actions / CI Green Verification, release tag/version planning, GitHub release drafting, and package cleanliness review.

It is a documentation and claims-control audit. It does not create a release tag, publish a release, certify a hosted production environment, certify security posture, or change runtime app behavior.

## Current audited baseline

Current audited baseline: Shime Quiz is completed and merged through **Phase 8W**.

Shime is a **local-first quiz study app**. The release-candidate baseline includes local study workflows, guarded import/review/save behavior, demo/onboarding improvements, public positioning docs, onboarding E2E coverage, and local E2E verification documentation.

## Current capabilities that can be safely claimed

The following capabilities can be described for the current release candidate with the caveats in this document:

- Local-first quiz study workflows using browser-local data.
- JSON/CSV import.
- Paste text/Markdown draft import.
- Local `.txt`/`.md` file import.
- PDF/DOCX/PPTX/ZIP draft import through a separate configured, browser-reachable EduGen/File Processor service.
- Advisory quiz draft quality review before save.
- Duplicate multiple-choice choice ID detection in quality review.
- Manual AI prompt/export workflow.
- Manual AI output review/import hardening.
- Public demo sample pack.
- In-app demo sample quickstart: **Dùng quiz mẫu**.
- Demo sample quickstart requires preview/review/confirm-save and does not auto-save.
- Library empty-state onboarding.
- Dashboard first-run onboarding.
- Onboarding E2E coverage.
- Local E2E verification docs.
- Final public positioning lock docs.

## Manual browser smoke evidence that can be safely referenced

The current audit may reference these scoped manual browser smoke results:

- Demo sample quickstart passed manual Ubuntu browser smoke.
- Library empty-state onboarding passed manual Ubuntu browser smoke.
- Dashboard first-run onboarding passed manual Ubuntu browser smoke.

These are scoped Ubuntu browser confirmations. They do not mean every device, browser, deployment, or hosted environment has passed E2E or manual smoke.

## Automated E2E evidence that can be safely referenced

The current audit may reference the following scoped automated evidence:

- Onboarding E2E coverage exists for the Dashboard first-run onboarding, Library empty-state onboarding, and **Dùng quiz mẫu** quickstart safety path.
- `npm run test:e2e:onboarding` passed on local Ubuntu after Playwright Chromium was installed, with 3 tests passed.

Do not claim that every environment has passed E2E. Future E2E pass claims require actual successful command output in the target environment.

## Local E2E verification docs reference

Local E2E setup and verification are documented in [`docs/local-e2e-verification.md`](local-e2e-verification.md). That guide explains Ubuntu assumptions, Playwright Chromium installation, smoke commands, port conflicts, missing Chromium errors, and how to classify app, test, browser/environment, timeout/flakiness, and selector issues.

## Public positioning and release docs reference

Related release-candidate documentation:

- Public release notes: [`docs/public-release-notes.md`](public-release-notes.md)
- Deployment readiness notes: [`docs/deployment-readiness.md`](deployment-readiness.md)
- Demo script: [`docs/demo-script.md`](demo-script.md)
- Public positioning lock validator: `scripts/validate-public-positioning-lock.js`
- Local E2E verification validator: `scripts/validate-local-e2e-verification-docs.js`

## EduGen boundary

EduGen remains a separate service boundary:

- EduGen is a separate service.
- EduGen is not bundled into Shime.
- PDF/DOCX/PPTX/ZIP document import requires a configured, browser-reachable EduGen/File Processor service.
- Frontend-only hosting alone does not provide document conversion.
- If `VITE_FILE_PROCESSOR_URL` is absent, unreachable, blocked by CORS/network policy, or points to the wrong service, PDF/DOCX/PPTX/ZIP import should be treated as unavailable for that deployment.

## Manual AI boundary

AI-related support remains manual workflow only:

- Manual prompt/export workflow only.
- Manual output paste/import only.
- No built-in AI quiz generation.
- No external AI/API calls from Shime.
- No API key/BYOK implementation.
- User review, validation, advisory quality review, preview, and confirm-save remain required before saving imported or pasted content.

## Unsupported / forbidden claims

Do not claim any of the following for the current release candidate:

- No built-in AI quiz generation.
- No external AI/API integration.
- No API key/BYOK support.
- No OCR.
- No backend/auth/cloud sync.
- No EduGen bundled into Shime.
- No frontend-only PDF/DOCX/PPTX/ZIP import without a separate browser-reachable EduGen service.
- No hosted production/security certification.
- No guarantee that AI output is correct/private/high-quality.
- No claim that every environment has passed E2E.
- No release tag created in this phase.
- No GitHub release published in this phase.

## Release readiness checklist

Before later release-management phases, confirm:

- README/public docs reviewed.
- Deployment readiness reviewed.
- Public release notes reviewed.
- Local E2E verification guide exists.
- Onboarding E2E coverage exists.
- Static validator chain is registered in CI.
- Package version/dependencies are unchanged in this phase.
- No runtime app code changes in this phase.
- No E2E logic changes in this phase.
- No import/parser changes in this phase.
- No EduGen source changes in this phase.
- No AI/API/OCR/backend changes in this phase.
- No storage/schema/scoring/SRT/mastery changes in this phase.
- No release tag is created in this phase.
- No GitHub release is published in this phase.

## Remaining caveats / next steps

Recommended next steps after this audit is accepted:

- Perform **GitHub Actions / CI Green Verification** as a later step using [`docs/ci-green-verification.md`](ci-green-verification.md).
- Review the Phase 9A version / release tag decision document at [`docs/release-tag-decision.md`](release-tag-decision.md) before choosing a tag.
- Review the Phase 9B GitHub Release Draft at [`docs/github-release-draft.md`](github-release-draft.md) before publishing release notes.
- Draft the GitHub release as a later step.
- Verify source archive/package cleanliness as a later step.
- Optionally prepare a screenshot asset pack only with real reviewed screenshots.

This phase does not decide the release version, create a release tag, publish a release, or certify production/security readiness. Phase 9B provides a GitHub Release Draft document for later publication, but it does not publish a release. Phase 9A documents release tag/version options in [`docs/release-tag-decision.md`](release-tag-decision.md); the user must still approve any package version or tag action later.

## Safe conclusion

Safe statements after this phase:

- Final RC audit documentation exists.
- Current release candidate capabilities and caveats are audited.
- A release tag readiness checklist exists for later release planning.

Do not say production certified. Do not say security certified. Do not say release published. Do not say release tag created. Do not say GitHub Actions CI is green unless a current CI run is actually verified. Phase 8Y CI green verification guidance is tracked in [`docs/ci-green-verification.md`](ci-green-verification.md).


## Phase 9C release package/source archive verification reference

Release package/source archive verification guidance is documented in [`docs/release-package-cleanliness.md`](release-package-cleanliness.md). This later release-finalization step documents generated/local artifacts that must not be committed, dry-run cleanup guidance, and source archive cleanliness checks before any tag or publish step. It does not create a release tag, publish a GitHub Release, publish a release package, or certify production/security readiness.
