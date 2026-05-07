# Shime Quiz screenshot checklist

Use this checklist when preparing README, public release, or demo screenshots. Screenshots should show real release-candidate workflows without implying unsupported AI, OCR, API-key, backend, cloud, or hosted production/security certification features.

For recommended screenshot filenames, image folder path, and alt text, see [`docs/visual-asset-guidance.md`](visual-asset-guidance.md).


## Demo sample pack

Use [`docs/demo-samples/README.md`](demo-samples/README.md) when preparing screenshot data. The sample pack provides synthetic JSON, CSV, text/Markdown, and manual AI paste-back examples so public screenshots do not need private or copyrighted content.

For an in-app screenshot path without manually uploading files, use the Library **Dùng quiz mẫu** quickstart. Capture the resulting preview and quality review before saving, and avoid implying the sample is AI-generated, API-backed, EduGen-powered, or auto-saved.

## Recommended screenshots

### 1. Dashboard overview

Capture the Dashboard with the learning overview, today's journey, goal progress, and due-review or study-history surfaces visible. Prefer a state with realistic local data.

### 2. Library import panel

Capture the Library import area showing supported local import paths. Make sure the image does not imply unsupported legacy `.doc`/`.ppt` files, backend upload, or cloud account sync.

### 3. Text/Markdown import preview

Capture a parsed text/Markdown draft preview before save. The screenshot should reinforce that users review imported content before confirming save.

### 4. Quiz draft quality review panel

Capture the advisory quality review panel. If possible, include a safe example warning such as duplicate choice text or duplicate explicit multiple-choice choice IDs. Avoid wording that implies automatic correctness guarantees.

### 5. Study Room

Capture Study Room with a supported item type such as multiple choice, short answer, or flashcard. Avoid showing answer-key details in a public screenshot unless the example is synthetic.

### 6. Manual AI prompt/export panel

Capture the manual prompt/export workflow only with wording that makes the manual boundary visible. The screenshot must not imply built-in AI quiz generation, external AI/API calls, API-key support, or BYOK support.

### 7. Manual AI output review

Capture the manual AI output review surface showing advisory format checks before the user imports pasted output. Avoid implying that Shime verifies factual correctness, privacy, or guaranteed quality of AI output.

### 8. EduGen document import surface

Capture the document import surface with the EduGen boundary visible if possible. The screenshot should make clear that PDF/DOCX/PPTX/ZIP draft import depends on a separately configured, browser-reachable EduGen service and `VITE_FILE_PROCESSOR_URL`.

### 9. README release/deployment links

Capture the README section that links to:

- `docs/public-release-notes.md`
- `docs/deployment-readiness.md`
- `docs/demo-script.md`
- `docs/screenshot-checklist.md`

## Screenshots to avoid

Do not publish screenshots that imply or appear to advertise:

- Do not publish screenshots implying built-in AI generation;
- Do not publish screenshots implying external AI/API integration;
- Do not publish screenshots implying API key support or BYOK support;
- Do not publish screenshots implying OCR support;
- Do not publish screenshots implying EduGen bundled into Shime;
- Do not publish screenshots implying frontend-only document import for PDF/DOCX/PPTX/ZIP without a browser-reachable EduGen service;
- Do not publish screenshots implying backend accounts, authentication, or cloud sync;
- Do not publish screenshots implying hosted production certification or security certification;
- Do not publish screenshots implying guaranteed correctness, privacy, or high quality of AI output;
- Do not publish screenshots implying legacy `.doc` or `.ppt` support.

## Capture notes

- Use synthetic or non-sensitive study content.
- Prefer a clean browser window with the app visible and no unrelated tabs or personal data.
- Keep local-first language visible where possible.
- Prefer screenshots that show preview-before-save and user-confirm-save boundaries.
- Retake screenshots after any UI changes in later phases; this checklist is for the current release-candidate documentation state.
