# Shime Quiz demo script

## 60-second product pitch

Shime Quiz is a local-first study and quiz app for building a study library, importing quiz drafts, reviewing draft quality, and studying in a focused Study Room. The current release candidate emphasizes practical student workflows: JSON/CSV import, text/Markdown import, local `.txt`/`.md` draft import, document draft import through a separately configured EduGen service, and local progress tracking in the browser.

Shime is privacy-conscious because the main app is local-first and many workflows happen in the browser, but this is not a hosted production or security certification. Manual AI support is workflow-only: Shime helps users prepare prompts and review pasted AI output, but it does not provide built-in AI generation, API keys, BYOK, or external AI/API calls.


## Demo sample pack

For stable demo content, use the public sample pack at [`docs/demo-samples/README.md`](demo-samples/README.md). It includes JSON, CSV, text/Markdown, and manual AI paste-back samples that are synthetic, education-oriented, and designed for the current supported import paths.

For screenshot naming, recommended alt text, and visual claim guardrails, see [`docs/visual-asset-guidance.md`](visual-asset-guidance.md).

For the fastest in-app walkthrough, open Library and use **Dùng quiz mẫu**. This loads a local sample into the existing preview, validation, advisory quality review, and confirm-save flow. It does not call AI/API, does not use EduGen, and does not auto-save.

Phase 8P adds a small first-run Library hint near this button. In the demo, describe it as a discovery aid only: it does not auto-load the sample, does not auto-save, does not persist a dismissal state, does not call AI/API, and does not require EduGen.

If the Library is empty, point out the empty-state onboarding before using the sample. Say: "This empty state suggests safe first steps: try the local sample, import JSON/CSV, paste text/Markdown, use the manual AI copy-paste workflow, or configure EduGen separately for document imports. It does not auto-load or auto-save; the preview, review, and confirm-save steps still apply."



## Recommended RC demo path after onboarding polish

Use this short path when presenting the current release candidate:

1. Start on Dashboard and point out the first-run onboarding callout when the app has no meaningful saved study data.
2. Use the callout to go to Library as the safe start location.
3. Show the Library empty-state onboarding and the local **Dùng quiz mẫu** quickstart.
4. Click **Dùng quiz mẫu** and show the preview, validation, and advisory quality review before save.
5. Confirm save only if desired for the demo, then optionally open Study Room.
6. Mention the manual AI workflow honestly: users copy a prompt to an outside tool themselves and paste output back for review; Shime does not call AI/API providers.
7. Mention EduGen separately: PDF/DOCX/PPTX/ZIP import requires a separately running, browser-reachable EduGen service and is not OCR.

Do not claim screenshots already exist unless actual image files are present. This demo path relies on existing screens and the local demo sample quickstart, not new screenshot assets.

## 3-minute guided demo flow

### 1. Dashboard / Overview

Open the Dashboard first. Point out the learning overview, today's journey, goal progress, due-review surfaces, and local study history. Explain that these are local study helpers, not AI predictions or guaranteed learning outcomes.

If the app is in a first-run empty-data state, point out the Dashboard getting-started callout. Say: "This Dashboard hint sends new users to the Library, where they can use the local demo sample, import JSON/CSV, paste text/Markdown, use the manual AI copy-paste workflow, or configure EduGen separately for document imports. It does not auto-load or auto-save; preview, review, and confirm-save still apply."

Suggested wording:

> "This Dashboard gives learners a local study overview: what to review, what progress looks like, and what steps are available today. It is designed to help guide study sessions without requiring an account or cloud sync."

### 2. Library

Move to the Library. Show that this is where learners manage local study content, import quiz data, preview drafts, and use backup/restore options.

Suggested wording:

> "The Library is the control center for local study content. Imports are previewed and validated before anything is saved."

### 3. JSON/CSV or text/Markdown import

Show one stable import path. Prefer JSON/CSV if a known sample is ready. Use text/Markdown if the sample is easier to explain live.

Suggested wording:

> "Shime supports JSON/CSV import and text or Markdown draft import. The important boundary is that imported content is validated and previewed before the user confirms save."

### 4. Draft quality review

After parsing a draft, show the advisory quality review panel. Call out that it can warn about issues such as duplicate choice text or duplicate explicit multiple-choice choice IDs, but it does not guarantee perfect question quality.

Suggested wording:

> "This quality review is advisory. It helps catch common draft issues before saving, but learners should still review correctness and wording themselves."

### 5. Study Room

Open Study Room and show a short flow for a supported item type such as multiple choice, short answer, or flashcard.

Suggested wording:

> "Once content is saved, Study Room provides a focused local study experience for supported item types."

### 6. Dashboard today-plan completion guard

Return to Dashboard and show the today-plan completion behavior. Mark an incomplete item complete if available, then explain that Phase 8H manual smoke verified completed items stay complete on repeated clicks and after refresh.

Suggested wording:

> "The today-plan completion guard was manually verified in the Phase 8H Ubuntu browser smoke: completed items remain stable and do not toggle back to incomplete on repeated clicks."

### 7. Manual AI prompt/export workflow

Show the manual AI prompt/export surface, but do not describe it as built-in generation.

Exact honest AI positioning:

> "Shime does not include built-in AI quiz generation and does not call external AI APIs. This workflow prepares a prompt locally so the user can manually copy it to an external AI tool if they choose. Any AI output must be pasted back by the user, reviewed, parsed, validated, previewed, and confirmed before save. Shime does not guarantee that AI output is correct, private, or high quality."

### 8. EduGen document import caveat

Show the document import surface only after explaining the boundary. If EduGen is running and `VITE_FILE_PROCESSOR_URL` is configured, show the document path. If not, describe the caveat and use the text/Markdown fallback.

Exact honest EduGen positioning:

> "PDF/DOCX/PPTX/ZIP draft import depends on EduGen as a separate file processor service. EduGen is not bundled into Shime. A hosted or frontend-only Shime deployment needs a browser-reachable `VITE_FILE_PROCESSOR_URL` that points to a separately hosted EduGen service. EduGen extracts text for parsing; it is not OCR and it is not AI generation."

## What not to say during the demo

Do not say or imply:

- Do not say: "Shime has built-in AI generation."
- Do not say: "Shime calls external AI APIs."
- Do not say: "Users can enter an API key or BYOK credential in Shime."
- Do not say: "Shime supports OCR."
- Do not say: "EduGen is bundled into Shime."
- Do not say: "A frontend-only deployment can import PDF/DOCX/PPTX/ZIP without a browser-reachable EduGen service."
- Do not say: "Shime has backend accounts, authentication, or cloud sync."
- Do not say: "This build is production certified or security certified."
- Do not say: "AI output is guaranteed correct, private, or high quality."
- Do not say: "Legacy `.doc` or `.ppt` files are supported."

## Fallback if EduGen is not running

If EduGen is unavailable, do not attempt to present document import as working in that environment. Use this wording:

> "Document import is intentionally dependent on a separate EduGen service. Since EduGen is not running or not reachable in this demo environment, we will use the text/Markdown import path to show the same downstream parser, validation, quality review, preview, and confirm-save workflow."

Then demonstrate paste text/Markdown import or local `.txt`/`.md` draft import.

## Fallback if no sample quiz exists

If there is no sample quiz already loaded, use a small text/Markdown draft and import it through the Library. Keep the sample short so the demo can still show validation, quality review, preview, save, and Study Room.

Example fallback draft:

```text
Môn: Demo
Chủ đề: Release Candidate

Câu hỏi: Shime document import uses which separate service?
A. EduGen
B. Browser preview
C. Manual review
D. Local Study Room
Đáp án: A
Giải thích: PDF/DOCX/PPTX/ZIP draft import depends on a separately configured EduGen service.

Flashcard:
Mặt trước: What is Shime's current AI workflow?
Mặt sau: The current workflow is manual prompt/export and manual pasted-output review only; Shime does not call AI/API providers.
```

## Phase 8V onboarding smoke coverage note

A targeted onboarding Playwright smoke spec now covers the release-candidate demo path from Dashboard first-run onboarding to Library onboarding and the **Dùng quiz mẫu** preview flow. The test is intended to protect the same safe-demo story used in this script: guide users to Library, open the local demo sample through preview/validation/quality review, and require explicit confirmation before local save.

The coverage does not require EduGen for the local demo sample and does not introduce built-in AI generation, external AI/API calls, API key/BYOK support, OCR, backend/cloud sync, or production/security certification.
