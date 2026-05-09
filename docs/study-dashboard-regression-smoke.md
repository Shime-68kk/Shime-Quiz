# Study Room / Dashboard Learning Flow Smoke

## Purpose of Phase 9G

Phase 9G documents a manual regression smoke checklist for the core Shime Quiz learning flow before any final release tag or publish flow. It covers saving/importing quiz content, studying in the Study Room, generating or updating learning state, and checking that Dashboard surfaces reflect available local progress. This phase is documentation, static-validator, and CI-registration only. It does not change Study Room logic, Dashboard runtime logic, scoring/SRT/mastery logic, study history, recommendation logic, storage schema, runtime app behavior, E2E logic, package version, dependencies, release tags, GitHub Releases, or release packages.

## Current baseline

- The project is completed/merged through Phase 9F.
- The import regression smoke checklist exists in [`docs/import-regression-smoke.md`](import-regression-smoke.md).
- The backup/restore regression smoke checklist exists in [`docs/backup-restore-regression-smoke.md`](backup-restore-regression-smoke.md).
- The release tag has not been created.
- The GitHub release has not been published.
- The release package has not been published.
- Package version has not been changed by Phase 9G.

## Manual smoke prerequisites

Use an Ubuntu/local browser environment or another known test browser environment. Before manual smoke:

1. Run `npm ci`.
2. Run `npm run build`.
3. Start the app with `npm run dev` or `npm run preview`.
4. Open the local app in a browser.
5. Use a clean local test state or a known seeded state.
6. Ensure at least one saved quiz or Library item exists.
7. Recommended setup: use the in-app **Dùng quiz mẫu** quickstart or a known valid import fixture, then complete the normal preview/review/confirm-save flow.

Do not use this checklist as evidence of a pass unless an actual tester/user run completes the relevant steps.

## Learning flow checklist

1. Create, import, or use **Dùng quiz mẫu** to prepare quiz content.
2. Confirm the draft through the existing preview/review/confirm-save flow.
3. Verify the saved quiz appears in the Library.
4. Open the saved quiz from Library.
5. Start Study Room or the equivalent study flow.
6. Answer multiple items.
7. Verify correct/incorrect feedback where applicable.
8. Finish or exit the study session in a controlled way.
9. Verify study history or progress updates where applicable.
10. Verify review schedule or SRT updates where applicable.
11. Return to Dashboard.
12. Verify Dashboard reflects learning progress where applicable.
13. Verify recommendations or recommendation feedback appear or update where applicable.
14. Verify study goal or plan progress updates where applicable.
15. Navigate away and back, and reload if appropriate.
16. Verify no unexpected data reset after navigation or reload where applicable.

## Dashboard checks

- Dashboard first-run onboarding should appear only when applicable for an empty or first-run state.
- Dashboard should not block normal study flow.
- Today plan/progress surfaces should remain consistent where applicable.
- Review and recommendation indicators should be consistent with the study run where applicable.
- Dashboard should reflect available local study state, rather than implying backend/cloud sync.

## Expected behavior

- Learning flow remains local-first.
- No backend/cloud sync is required.
- No account/auth is required.
- Study data should not silently reset.
- Dashboard should reflect available local study state.
- Recommendations are advisory, not guaranteed.
- Correct/incorrect feedback should appear where the current Study Room flow supports it.
- Review schedule, SRT, mastery, study history, recommendations, and study plan progress should only be claimed as checked when the tester actually observes those categories.

## Failure classification

Classify any issue as one of the following before requesting a code change:

- App bug.
- Study Room flow bug.
- Dashboard/progress display bug.
- Scoring/SRT/mastery issue.
- Storage/state persistence issue.
- Fixture/data issue.
- Browser/environment issue.
- Timeout/flakiness.

A missing or stale local browser state can make Dashboard/Study Room behavior look wrong. Reproduce with a clean or known seeded state before classifying as an app bug.

## Evidence rules

- Do not claim manual Study Room/Dashboard regression passed unless an actual tester/user run passes.
- Do not claim all learning state categories updated unless each was actually checked.
- Do not claim scoring/SRT/mastery correctness certification.
- Do not claim cloud sync/backend restore.
- Do not claim account/auth sync.
- Do not claim production/security certification.
- Do not claim release tag created.
- Do not claim GitHub release published.

Suggested evidence to capture after a real run:

- Browser/OS used.
- App URL used.
- Whether a clean or seeded local state was used.
- Quiz/fixture used.
- Study Room actions performed.
- Dashboard surfaces checked.
- Which learning state categories were actually verified.
- Bugs found, if any.

## Claims control

Safe claims after Phase 9G:

- Study Room / Dashboard learning flow smoke checklist exists.
- Learning flow manual test surfaces are documented.

Unsafe claims after Phase 9G unless separately verified:

- Manual Study Room/Dashboard regression passed.
- All scoring/SRT/mastery behavior is certified correct.
- All learning state categories updated.
- Cloud sync/backend restore exists.
- Account/auth sync exists.
- Production/security certification exists.
- Release tag created.
- GitHub release published.

## Recommended next step

Recommended next phase after this, if continuing hardening: **Phase 9H — Accessibility / Keyboard Smoke**. Alternatively, stop and decide whether to proceed to the actual release tag/publish flow.
