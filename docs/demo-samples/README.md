# Shime Quiz public demo sample pack

This directory contains small, synthetic, education-oriented sample files for public demos, reviewer checks, and screenshot preparation. The samples are Vietnamese-friendly where useful, are not copied from copyrighted textbooks, and do not require external services.

Use these files to exercise supported import and manual workflow paths without inventing demo content during a presentation.

## Files

- [`shime-demo-quiz.json`](shime-demo-quiz.json): v2 JSON import sample with one subject, one topic, multiple-choice questions, a short-answer item, a flashcard, explanations, and stable IDs.
- [`shime-demo-quiz.csv`](shime-demo-quiz.csv): CSV import sample using current columns such as `subject`, `topic`, `type`, `prompt`, `choices`, `correctAnswer`, `answer`, `explanation`, `difficulty`, and `source`.
- [`shime-demo-text-markdown.md`](shime-demo-text-markdown.md): paste text/Markdown sample using supported Vietnamese markers such as `Môn:`, `Chủ đề:`, `Câu hỏi:`, `A/B/C/D`, `Đáp án:`, `Giải thích:`, `Câu hỏi ngắn:`, `Mặt trước:`, and `Mặt sau:`.
- [`shime-demo-manual-ai-output.md`](shime-demo-manual-ai-output.md): clean paste-back sample for the manual AI workflow. It is only a sample manual output and does not imply built-in AI generation.

## How to use the JSON sample

Open **Thư viện**, choose the JSON import path, and select `shime-demo-quiz.json`. Use it when you want the most complete quick demo because it includes multiple supported item types and explanations in the existing v2 import shape.

## How to use the CSV sample

Open **Thư viện**, choose the CSV import path, and select `shime-demo-quiz.csv`. Use it when you want to show spreadsheet-friendly import with clear columns and unambiguous answers.

## How to use the text/Markdown sample

Open the text/Markdown draft import flow and paste the contents of `shime-demo-text-markdown.md`, or save it as a local `.md` file and use the local `.txt`/`.md` draft import path. This is a good fallback when no JSON/CSV sample is already loaded.

## How to use the manual AI output sample

Use `shime-demo-manual-ai-output.md` only to demonstrate the manual paste-back path. Shime does not call an AI API, does not include built-in AI generation, and does not provide API key/BYOK support. The user manually pastes content back into Shime, then reviews parser output, validation messages, advisory quality review, preview, and confirm-save before saving.

## Best sample for screenshots and demos

- Use the JSON sample for a reliable Library import preview and Study Room demo.
- Use the text/Markdown sample to show parser markers and preview-before-save behavior.
- Use the manual AI output sample only when the manual workflow boundary is visible in the demo script or screenshot caption.
- Use the CSV sample when showing spreadsheet-style import compatibility.

## EduGen caveat

These samples do not require EduGen. PDF/DOCX/PPTX/ZIP document import still requires EduGen as a separately configured and browser-reachable file processor service. EduGen is not bundled into Shime. EduGen extraction is not OCR and is not AI generation.

## Unsupported claims to avoid

Do not present this sample pack as evidence of unsupported features. The current release candidate does not include OCR support, backend accounts, authentication, cloud sync, hosted production/security certification, built-in AI quiz generation, external AI/API integration from Shime, API key support, BYOK support, EduGen bundled into Shime, or legacy `.doc`/`.ppt` import support.
