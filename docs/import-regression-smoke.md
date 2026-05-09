# Import Surface Manual Regression Smoke

## Purpose of Phase 9E

Phase 9E documents a manual regression smoke checklist for Shime Quiz import surfaces before any final release tag or publish flow. It is a documentation, static validator, and CI-registration phase only. It does not change import behavior, parser behavior, runtime app behavior, E2E logic, package version, dependencies, release tags, GitHub Releases, or release packages.

## Current baseline

- Shime Quiz is completed/merged through Phase 9D.
- The release tag / publish checklist exists at [`docs/release-tag-publish-checklist.md`](release-tag-publish-checklist.md).
- The release tag has not been created.
- The GitHub release has not been published.
- The release package has not been published.
- Package version has not been changed by Phase 9E.

## Manual smoke prerequisites

Before manual import regression smoke, prepare a local test environment:

```bash
npm ci
npm run build
npm run dev
# or
npm run preview
```

Use a browser with a clean local test state when needed. A fresh browser profile, private window, or carefully cleared Shime localStorage can be used for regression smoke. Do not reset user data without backing it up.

EduGen/File Processor is optional and separate. It is not bundled into Shime. Document import for PDF/DOCX/PPTX/ZIP can be tested only when a separate EduGen/File Processor service is configured and browser-reachable.

## Import surfaces checklist

Manually smoke-test these surfaces before final publishing if release notes claim coverage:

- JSON import.
- CSV import.
- Paste text/Markdown draft import.
- Local `.txt/.md` file import.
- Public demo sample pack import from [`docs/demo-samples/README.md`](demo-samples/README.md).
- In-app **“Dùng quiz mẫu”** quickstart.
- Manual AI output paste/import.
- EduGen unavailable path.
- EduGen configured PDF/DOCX/PPTX/ZIP path, only if the separate service is configured and browser-reachable.

## Expected common behavior

Across applicable import flows:

- Preview/review/confirm-save appears before adding imported drafts to Library.
- Validation errors are shown for malformed input.
- Advisory quality review remains advisory.
- Duplicate multiple-choice choice ID detection is surfaced where applicable.
- Confirm-save is required before adding drafts to Library where applicable.
- The demo quickstart has no auto-save.
- Shime makes no external AI/API calls.
- No API key/BYOK is required or offered.
- No OCR claim is made.
- No backend/cloud sync claim is made.
- EduGen remains separate and not bundled.
- Frontend-only hosting does not provide PDF/DOCX/PPTX/ZIP document conversion without a separate browser-reachable EduGen/File Processor service.

## JSON import smoke steps

1. Open Library.
2. Import a valid demo/sample JSON file, such as `docs/demo-samples/shime-demo-quiz.json`.
3. Verify preview/validation appears.
4. Confirm advisory quality review appears where expected.
5. Save only after explicit confirmation.
6. Verify the imported item appears in Library.
7. Try malformed JSON and verify it is blocked or reported rather than silently saved.

## CSV import smoke steps

1. Open Library.
2. Import a valid demo/sample CSV file, such as `docs/demo-samples/shime-demo-quiz.csv`.
3. Verify preview/validation appears.
4. Save only after explicit confirmation.
5. Verify the imported item appears in Library.
6. Try malformed CSV and verify it is blocked or reported.

## Text/Markdown paste smoke steps

1. Open the text/Markdown paste import surface.
2. Paste a valid text/Markdown quiz draft, such as `docs/demo-samples/shime-demo-text-markdown.md`.
3. Verify parser preview appears.
4. Verify validation and advisory quality review run.
5. Save only after explicit confirmation.
6. Try malformed text/Markdown and verify it is blocked or reported.

## Local `.txt/.md` file smoke steps

1. Upload a valid `.txt` or `.md` file using the supported local text-file import flow.
2. Verify the same preview/review/confirm-save flow appears.
3. Verify unsupported local file types are not overclaimed.
4. Confirm no parser behavior is changed by this documentation phase.

## Public demo sample pack smoke steps

1. Use the sample files under `docs/demo-samples/`.
2. Verify JSON, CSV, text/Markdown, and manual AI output samples remain small, safe, and demo-oriented.
3. Verify samples exercise existing import/manual review paths without requiring external services.
4. Do not claim sample import regression passed unless the actual browser run passes.

## Demo sample quickstart smoke steps

1. Open Library in a clean or safe test state.
2. Click **“Dùng quiz mẫu”**.
3. Verify preview/review/confirm-save appears.
4. Verify demo quiz items appear.
5. Verify advisory quality review appears.
6. Verify no auto-save occurs before confirmation.
7. Save only if the test plan allows it.

## Manual AI output import smoke steps

1. Paste a valid manual AI output fixture/sample, such as `docs/demo-samples/shime-demo-manual-ai-output.md`.
2. Verify manual AI output review/import hardening surfaces warnings or review information as expected.
3. Verify invalid output is blocked or surfaced.
4. Explicitly note that Shime does not call AI APIs and does not provide built-in AI quiz generation.
5. Confirm preview/review/confirm-save remains required where applicable.

## EduGen unavailable smoke steps

1. Run Shime without a configured or browser-reachable EduGen/File Processor service.
2. Open the document import surface.
3. Verify the UI communicates the service requirement or unavailability.
4. Verify no frontend-only document conversion claim appears.
5. Verify no OCR claim appears.
6. Do not classify EduGen unavailability as an app import/parser failure unless the UI misrepresents the boundary.

## EduGen configured smoke steps

Only run this section if the separate EduGen/File Processor service is running and browser-reachable.

1. Configure the app with the correct file processor URL.
2. Verify PDF, DOCX, PPTX, and ZIP import paths according to the existing app surface.
3. Verify extraction routes into the existing cleaned text -> parser -> validation -> quality review -> preview -> confirm-save flow.
4. Do not claim pass if the service was not actually configured and tested.
5. Do not claim EduGen is bundled into Shime.
6. Do not claim OCR.

## Failure classification

Classify failures before requesting changes:

- App bug.
- Import/parser bug.
- Fixture/data issue.
- Browser/environment issue.
- EduGen service/configuration issue.
- Timeout/flakiness.

## Evidence rules

- Do not claim manual import regression passed unless an actual tester/user run passes.
- Do not claim EduGen document import passed unless the separate service was configured and tested.
- Do not claim all formats passed unless each was actually tested.
- Record exact browser, OS, service configuration, sample files, and pass/fail notes.

## Claims control

Safe claims after Phase 9E:

- Import regression smoke checklist exists.
- Import surfaces to test are documented.

Do not claim:

- Manual import regression passed without actual run evidence.
- EduGen document import passed without a configured/tested separate service.
- EduGen bundled into Shime.
- Frontend-only PDF/DOCX/PPTX/ZIP conversion.
- OCR.
- Built-in AI generation.
- External AI/API integration.
- API key/BYOK support.
- Backend/cloud sync.
- Production/security certification.
- Release tag created.
- GitHub release published.
- Release package published.

## Recommended next step

Recommended next phase after this, if continuing hardening: **Phase 9F — Backup / Restore Manual Regression Smoke**. Alternatively, stop and decide whether to proceed to the actual release tag/publish flow.
