# Accessibility / Keyboard Smoke

## Purpose of Phase 9H

Phase 9H documents a manual accessibility / keyboard smoke checklist for release readiness. It helps a tester quickly verify that the main Shime Quiz paths are usable with basic keyboard navigation and understandable labels before any final release tag or publish flow.

This is not a full accessibility audit. It does not certify WCAG compliance, accessibility certification, production certification, or security certification.

## Current baseline

- Shime Quiz is completed/merged through Phase 9G.
- The import regression smoke checklist exists in `docs/import-regression-smoke.md`.
- The backup/restore regression smoke checklist exists in `docs/backup-restore-regression-smoke.md`.
- The Study Room / Dashboard smoke checklist exists in `docs/study-dashboard-regression-smoke.md`.
- The release tag has not been created.
- The GitHub release has not been published.
- The release package has not been published.
- Package version has not been changed by Phase 9H.

## Manual smoke prerequisites

Before running this checklist:

1. Run `npm ci`.
2. Run `npm run build`.
3. Start the app with `npm run dev` or `npm run preview`.
4. Use a browser with keyboard input available.
5. Use a clean local test state or a known seeded state.
6. Keep at least one saved quiz/library item available when testing Study Room and saved-quiz navigation.
7. Use the public demo sample pack or in-app **“Dùng quiz mẫu”** quickstart if a quick known-good quiz is needed.

## Keyboard smoke checklist

Use the keyboard only for the tested path where practical:

- Navigate from the app entry point using keyboard only.
- Verify visible focus on interactive controls where applicable.
- Reach primary navigation/menu controls.
- Reach Library controls.
- Reach import controls.
- Reach demo quickstart **“Dùng quiz mẫu”**.
- Reach preview/review/confirm-save controls.
- Reach Study Room controls.
- Reach Dashboard controls/links.
- Reach backup/restore controls where applicable.
- Verify no obvious keyboard trap in the smoke path.
- Verify Escape/close/cancel behavior where applicable.

## Accessibility smoke checklist

This manual smoke should check visible, basic usability signals:

- Page text is readable at normal browser zoom.
- Key buttons/controls have understandable visible labels.
- Validation/error messages are visible when triggered.
- Modal/preview flows are understandable in manual smoke.
- Disabled/unavailable states are visually understandable where applicable.
- EduGen unavailable guidance remains understandable.
- Manual AI workflow caveats remain visible/understandable where applicable.

## Import-specific keyboard checks

Confirm keyboard access to the supported import surfaces without changing import behavior:

- JSON/CSV/text import controls are reachable.
- Local `.txt/.md` upload is reachable.
- Demo sample quickstart is reachable.
- Manual AI output paste/import controls are reachable.
- Document import surface guidance is reachable where applicable.
- Preview/review/confirm-save remains reachable before saving imported content where applicable.

## Study/Dashboard keyboard checks

When a saved quiz exists:

- A saved quiz can be opened from Library where applicable.
- Study Room answer controls are reachable where applicable.
- Finish/exit/navigation controls are reachable where applicable.
- Dashboard controls/links are reachable.
- Dashboard progress/recommendation areas do not block keyboard flow.

## Expected behavior

- The smoke path remains usable with keyboard basics.
- There is no obvious keyboard trap in the tested path.
- Inaccessible findings should be recorded as issues, not silently ignored.
- This is not a full accessibility audit.
- This does not certify WCAG compliance.
- This does not provide accessibility certification.
- This does not certify production readiness or security readiness.

## Failure classification

Classify any finding as one of:

- Keyboard navigation issue.
- Focus visibility issue.
- Label/readability issue.
- Modal/dialog usability issue.
- Import control reachability issue.
- Study Room/Dashboard control reachability issue.
- Browser/environment issue.
- Timeout/flakiness.

## Evidence rules

- Do not claim accessibility smoke passed unless an actual tester/user run passes.
- Do not claim keyboard smoke passed unless an actual tester/user run passes.
- Do not claim WCAG compliance.
- Do not claim accessibility certification.
- Do not claim production/security certification.
- Do not claim a release tag was created.
- Do not claim a GitHub release was published.

## Claims control

Safe claims after this phase:

- Accessibility / keyboard smoke checklist exists.
- Keyboard/accessibility manual test surfaces are documented.

Unsafe claims without later evidence:

- Manual accessibility smoke passed.
- Manual keyboard smoke passed.
- WCAG compliance.
- Accessibility certification.
- Production/security certification.
- Release tag created.
- GitHub release published.
- Built-in AI generation.
- External AI/API integration.
- OCR support.
- Do not claim EduGen bundled into Shime.
- Do not claim backend/cloud sync or account/auth sync.

## Recommended next step

Stop and decide whether to proceed with the actual release tag/publish flow, or run a real manual regression pass using the 9E–9H checklists before publishing.

## Phase 10A public landing keyboard note

If Phase 10A is included in the release candidate, include the root landing page in the manual keyboard smoke path: open `/`, tab through the landing CTAs, and verify the Dashboard, Library, and Study Room navigation controls remain reachable. This does not claim WCAG compliance or accessibility certification. See [`docs/public-landing-page.md`](public-landing-page.md).
