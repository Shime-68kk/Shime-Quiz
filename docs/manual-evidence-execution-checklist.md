# Phase 10T — Manual Evidence Execution Checklist / Evidence Capture Guide

## Purpose

Phase 10T creates a Manual Evidence Execution Checklist / Evidence Capture Guide for ShimeChamhoc v2 / Shime Quiz.

This guide tells a future user-approved operator how to run optional manual evidence later and how to copy the results into [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md).

This phase creates a checklist/guide only. No manual evidence is executed by this phase. No screenshots are captured by this phase. PASS may only be recorded after actual run evidence exists.

## Current baseline

- Completed/merged through Phase 10S.
- Manual evidence results log exists.
- Release candidate freeze / final decision memo exists.
- Final main release authorization packet exists.
- Final release execution checklist exists.
- Manual evidence run pack exists.
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been created.
- Release package has not been published.
- Release package has not been created or published.
- Package version remains unchanged unless explicitly approved by the user.

## Evidence execution policy

- This phase creates a checklist/guide only.
- No manual evidence is executed by this phase.
- No screenshots are captured by this phase.
- PASS may only be recorded after actual run evidence exists.
- Results must be copied into [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md).
- Private user data should not be included in screenshots/logs.
- Evidence artifacts must not include secrets, real `.env` files, keys, credentials, service account files, private user backups, or personal study data unless intentionally redacted.
- Checklist existence does not imply that screenshots, mobile UX, configured EduGen import, cross-device restore, E2E, Lighthouse/Core Web Vitals, or release evidence passed.
- No certification is created or claimed by this guide.

## Preconditions before any optional evidence run

Use these preconditions only when a future user-approved evidence run is actually performed:

1. Start from latest validated main.
2. Confirm a clean working tree.
3. Install dependencies with `npm ci`.
4. Confirm the app builds with `npm run build`.
5. Run the full static validator chain.
6. Confirm optional browser/Chromium availability before E2E smoke/onboarding.
7. Configure a separate browser-reachable processor URL only if running configured EduGen/File Processor document import smoke.
8. Prepare a clean profile or second device/profile before cross-device backup/restore smoke.
9. Confirm private user data, secrets, keys, real `.env` files, credentials, private backups, and personal study data are excluded or redacted from evidence artifacts.

## Screenshot capture guide

Use this guide only for a future optional screenshot capture run.

1. Confirm no private user data is visible in the app UI.
2. Capture only actual app UI from the running app.
3. Do not create fake/mock screenshots.
4. Do not edit screenshots to imply states that were not actually reached.
5. Suggested future screenshot locations and filenames, if screenshots are later captured:
   - `docs/screenshots/landing-page.png`
   - `docs/screenshots/dashboard.png`
   - `docs/screenshots/library.png`
   - `docs/screenshots/sample-quiz-quickstart.png`
   - `docs/screenshots/study-room.png`
   - `docs/screenshots/import-surface.png`
   - `docs/screenshots/backup-restore.png`
6. Record each screenshot in [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) with the date/time, commit SHA, branch, environment, browser/device/viewport, manual path used, result, artifact path/URL, notes, blockers/follow-ups, and allowed claims.

## Mobile/responsive smoke guide

Use this guide only for a future optional mobile/responsive smoke run.

Suggested viewports:

- 360x640
- 375x667
- 390x844
- 412x915
- 768x1024

Surfaces to check:

- Landing page.
- Dashboard.
- Library.
- Sample quiz quickstart.
- Import surfaces.
- Study Room.
- Backup/restore.
- Dialogs/modals/previews.

Record PASS / PARTIAL PASS / FAIL / NOT RUN / ENVIRONMENT-BLOCKED only after an actual run. Do not claim mobile UX passed from this checklist alone.

## Configured EduGen/File Processor import smoke guide

Use this guide only for a future optional configured EduGen/File Processor import smoke.

1. Confirm a separate browser-reachable processor URL is configured for the test environment.
2. Confirm EduGen/File Processor is not bundled into Shime.
3. Confirm frontend-only document conversion is not claimed.
4. Check PDF/DOCX/PPTX/ZIP import only if the separate service is configured and reachable from the browser.
5. Record the service URL/environment without secrets, API keys, credentials, private hostnames, or private tokens.
6. Record PASS / PARTIAL PASS / FAIL / NOT RUN / ENVIRONMENT-BLOCKED only after the configured run.

## Cross-device backup/restore smoke guide

Use this guide only for a future optional cross-device backup/restore smoke.

1. Use a source profile/device and a destination clean profile or second device/profile.
2. Export/backup from the source profile/device.
3. Restore/import into the destination clean profile/device.
4. Verify library, quiz, Study Room, dashboard, and backup/restore surfaces as applicable.
5. Treat backup files as private user data.
6. Do not claim encrypted backup unless implemented.
7. Record PASS / PARTIAL PASS / FAIL / NOT RUN / ENVIRONMENT-BLOCKED only after a source/destination or clean-profile run.

## E2E smoke/onboarding guide

Use this guide only when Chromium/browser is available.

Commands:

```bash
npm run test:e2e:smoke
npm run test:e2e:onboarding
```

If Chromium/browser setup is unavailable, record ENVIRONMENT-BLOCKED and note that environment-blocked is not product failure. Do not claim E2E passed unless the commands actually pass.

## Optional Lighthouse/Core Web Vitals guide

This measurement is optional only.

1. Record the tool and version used.
2. Record the environment, URL, browser, device/viewport, network/CPU settings if applicable, and commit SHA.
3. Record measured Lighthouse/Core Web Vitals results in [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md).
4. Do not claim pass unless actually measured.
5. Do not claim certification, production certification, security certification, accessibility certification, or performance certification.

## Evidence recording instructions

After an actual future evidence run, fill [`docs/manual-evidence-results-log.md`](manual-evidence-results-log.md) with:

- Date/time.
- Commit SHA.
- Branch.
- Environment.
- Browser/device/viewport.
- Command or manual path used.
- Result: PASS / PARTIAL PASS / FAIL / NOT RUN / ENVIRONMENT-BLOCKED.
- Evidence artifact path or URL.
- Notes.
- Blocker/follow-up.
- Claim allowed after this evidence.

## Claims control

Checklist existence does not imply evidence passed.

Do not claim:

- Screenshots captured unless actual screenshot files exist.
- Mobile UX pass unless an actual responsive/mobile run passes.
- Configured EduGen import pass unless an actual configured service run passes.
- Cross-device restore pass unless an actual source/destination or clean-profile run passes.
- E2E pass unless tests pass.
- Lighthouse/Core Web Vitals pass unless measured.
- Release, publication, package, tag, asset upload, or GitHub Release evidence unless actually executed after explicit user approval.
- Production/security/accessibility/performance certification.
- Backend/auth/cloud sync, account sync, automatic cross-device sync, OCR, built-in AI generation, external AI/API calls from Shime, API key/BYOK support, EduGen bundled into Shime, or frontend-only PDF/DOCX/PPTX/ZIP document conversion.

## Recommended next step

The user may approve optional manual evidence execution, approve final release execution, or keep the release candidate unpublished.
