# GitHub Actions / CI Green Verification

## Purpose

This document records the Phase 8Y GitHub Actions / CI Green Verification expectations for the Shime Quiz release-candidate track. It explains what the CI workflow should run, how to interpret results, and which claims are safe only after an actual passing GitHub Actions run.

Phase 8Y is CI verification, CI reliability, documentation, and static validation only. It does not create a release tag, does not publish a GitHub release, and does not certify hosted production or security readiness.

## Expected GitHub Actions workflow checks

The release-readiness workflow should verify the same release candidate baseline that local validation uses:

1. `npm ci`
2. `npm run build`
3. Full static validator chain, including release hardening, import validation, dashboard/onboarding validators, public positioning validators, local E2E verification docs, final RC audit, and CI green verification.
4. Playwright Chromium install using Playwright-managed Chromium setup, currently `npx playwright install --with-deps chromium` on GitHub Actions Ubuntu runners.
5. `npm run test:e2e:smoke`
6. `npm run test:e2e:onboarding`
7. Failure artifact upload for Playwright reports and test results when a run fails.

The workflow must not skip E2E smoke/onboarding coverage, must not add broad `continue-on-error`, and must not remove failure artifact upload just to make the workflow appear green.

## How to interpret CI outcomes

Use the failing step and logs to classify a failure before assigning product risk:

- **Green workflow**: all required install, build, static validators, Playwright setup, and E2E commands completed successfully in GitHub Actions for the relevant branch/commit.
- **App bug**: app behavior fails an assertion after the browser launches and the tested flow is reachable.
- **Test bug**: selector or assertion logic is inconsistent with supported product behavior or allowed negative/guardrail wording.
- **Browser/environment issue**: Playwright-managed Chromium or required OS browser dependencies are missing, failed to install, or cannot launch before app assertions run.
- **Timeout/flakiness**: the app or test server starts inconsistently, a port conflict blocks preview startup, or timing causes non-deterministic failure without a product assertion.
- **Selector issue**: the UI behavior is correct, but a selector is too brittle or too broad.

Missing Chromium/browser dependencies should be treated as a CI environment issue when failure happens before app assertions run. It is not proof of a product failure unless a browser launches and the app flow fails.

## Claims control

Only claim the following after an actual successful GitHub Actions run for the relevant branch/commit:

- GitHub Actions CI workflow is green.
- GitHub Actions E2E workflow passed.
- `npm run test:e2e:smoke` passed in GitHub Actions.
- `npm run test:e2e:onboarding` passed in GitHub Actions.

Do not claim CI green from local-only results, static validation only, or an environment-blocked browser run. If a CI run is not available, state that CI green verification must be completed after the PR/branch is pushed.

Do not claim production certification, security certification, hosted production readiness, release tag creation, or GitHub release publication from Phase 8Y.

## EduGen and E2E boundary

EduGen remains a separate service and is not bundled into Shime. The onboarding E2E smoke path does not require EduGen because it uses local app onboarding and the in-app demo sample quickstart.

PDF/DOCX/PPTX/ZIP document import E2E would require a separately configured, browser-reachable EduGen/File Processor service if that path is tested. Frontend-only hosting can serve the app shell, but it does not provide document conversion by itself.

## Release-readiness conclusion

Phase 8Y can conclude that CI green verification documentation and workflow expectations exist. It cannot conclude that GitHub Actions CI is green unless a real GitHub Actions run passes on the target branch/commit. It also does not create a release tag, publish a GitHub release, or provide production/security certification.


## Release tag decision handoff

After CI green verification guidance is reviewed, Phase 9A documents version and release tag options in [`docs/release-tag-decision.md`](release-tag-decision.md). That document records the current package version and possible RC tag strategies, but it does not create a release tag, publish a GitHub release, or certify production/security readiness.
