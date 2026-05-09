# Phase 10L — Manual Evidence Run Pack

## Purpose

Phase 10L creates a **Manual Evidence Run Pack** for optional pre-release evidence collection. It is a checklist pack only: this phase does not run or claim manual evidence, does not add screenshots, does not create a release tag, does not publish a GitHub Release, does not publish a release package, does not change package version, and does not change runtime app behavior.

## Current baseline

- Shime Quiz / ShimeChamhoc v2 is completed/merged through Phase 10K.
- Release candidate tag/publish gate docs exist.
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
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been published.

## Manual evidence pack overview

This pack collects optional evidence paths that a release manager or tester may run before approving tag/publish:

- screenshots
- mobile/responsive smoke
- configured EduGen document import smoke
- cross-device backup/restore smoke
- E2E smoke/onboarding when Chromium is available
- optional Lighthouse/Core Web Vitals measurement

## Prerequisites

- Use the latest `main` branch or the target PR branch.
- Start with a clean working tree.
- Run `npm ci`.
- Run `npm run build`.
- Run the full static validator chain.
- Use a browser for manual checks.
- Optionally use a mobile device or browser devtools responsive viewports.
- Optionally configure a separate EduGen/File Processor service.
- Optionally use a clean browser profile for cross-device restore.

## Screenshot evidence checklist

Only capture real app screenshots from the current app. Do not add fake/mock screenshots. Avoid private user data and browser extension/private-tab details. Suggested screenshots:

- root landing page
- Dashboard first-run/onboarding state
- Library empty state
- demo quickstart / **Dùng quiz mẫu**
- import surface
- review/confirm-save
- Study Room
- backup/restore
- manual AI prompt/export workflow
- EduGen boundary/unavailable/configured surface

Actual screenshots are not claimed until image files exist and are intentionally added.

## Mobile/responsive evidence checklist

- Test `360x640`.
- Test `390x844`.
- Test `412x915`.
- Test `768x1024` tablet.
- Open root `/`.
- Open `/dashboard`.
- Open `/library`.
- Open Study Room.
- Check import controls.
- Check backup/restore.
- Check no obvious horizontal overflow.
- Check primary controls are reachable/tappable.
- Do not claim mobile UX passed unless the run completes and evidence is recorded.

## Configured EduGen evidence checklist

- Verify `VITE_FILE_PROCESSOR_URL` is configured.
- Verify the service is browser-reachable.
- Verify docs/UI state the EduGen/File Processor is separate.
- Run a real PDF/DOCX/PPTX/ZIP import only if a processor is configured.
- Do not claim document import passed unless the actual configured run passes.
- Do not claim OCR.
- Do not claim EduGen bundled into Shime.

## Cross-device backup/restore evidence checklist

- Use a source browser/profile with sample data.
- Export/backup.
- Save backup privately.
- Use a clean destination browser/profile.
- Restore/import.
- Verify Library content.
- Verify Dashboard/progress where applicable.
- Verify Study Room opens the restored quiz.
- Do not claim cloud/account sync.
- Do not claim encrypted backups unless implemented.
- Do not claim cross-device restore passed unless the run completes.

## E2E evidence checklist

- Run `npm run test:e2e:smoke` when Chromium is available.
- Run `npm run test:e2e:onboarding` when Chromium is available.
- If Chromium is missing, classify the result as environment-blocked, not product failure.
- Do not claim E2E PASS unless tests pass.

## Optional Lighthouse/Core Web Vitals checklist

Only run this if the user wants measurement. Record the tool, URL, device mode, date/time, and scores. Do not claim Lighthouse/Core Web Vitals pass unless measured, and do not claim performance certification.

## Evidence recording template

Use this template for each manual evidence run:

```text
Date/time:
Commit SHA/branch:
Environment:
Commands run:
Browser/device:
Screenshots captured:
Result: PASS / PARTIAL / FAIL
Blockers:
Evidence artifacts:
Claims allowed after run:
```

## Claims control

Allowed claims after this phase:

- Manual evidence run pack exists.
- Manual evidence checklists exist.

Forbidden claims unless the relevant run actually produced evidence:

- Do not claim screenshots captured unless actual files exist.
- Do not claim mobile UX passed unless an actual run passes.
- Do not claim configured EduGen import passed unless an actual configured run passes.
- Do not claim cross-device restore passed unless an actual run passes.
- Do not claim E2E passed unless tests pass.
- Do not claim Lighthouse/Core Web Vitals pass unless measured.
- Do not claim release tag created.
- Do not claim GitHub Release published.
- Do not claim release package published.
- Do not claim production/security/accessibility/performance certification.
- Do not claim built-in AI generation, OCR, backend/cloud sync, EduGen bundled into Shime, or frontend-only document conversion.

## Recommended next step

The user may run this manual evidence pack, proceed with user-approved release tag creation if evidence gaps are accepted, or continue to **Phase 10M — Release Tag Creation Plan**.
