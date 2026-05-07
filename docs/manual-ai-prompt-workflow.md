# Phase 8B — Manual AI Prompt/Export Workflow

Phase 8B adds a manual prompt/export workflow only. Shime does not call AI providers, does not collect API keys, and does not send source content to any external service.

## Intended user flow

1. User pastes source text into the manual AI prompt section in Library.
2. Shime builds a prompt locally in the browser.
3. User manually copies the prompt.
4. User manually pastes the prompt into an external AI tool of their choice.
5. User copies the AI result back.
6. User pastes the result into Shime's existing text/Markdown import box.
7. Shime runs the existing parser, import validation, advisory quality review, preview, and user-confirm-save flow.

There is no automatic import of AI output and no auto-save.

## Privacy and safety contract

- Content copied to an external AI tool may leave the user's device.
- Shime does not automatically send data to AI.
- Users should review the privacy policy of the external AI tool they choose.
- AI output may be inaccurate or unsupported by the source.
- Users must review generated drafts before saving.
- Existing import validation remains the hard blocking layer.
- Advisory quiz draft quality review remains active before save.

## Prompt output contract

The prompt asks the external AI tool to return Shime-friendly text/Markdown, not hidden JSON. It uses patterns already supported by `parseTextQuizDraft`:

```text
Môn: ...
Chủ đề: ...

Câu hỏi: ...
A. ...
B. ...
C. ...
D. ...
Đáp án: ...
Giải thích: ...

Flashcard:
Mặt trước: ...
Mặt sau: ...

Câu hỏi ngắn: ...
Đáp án: ...
```

The prompt instructs the AI to use only the provided source text, avoid hallucination, avoid duplicate choices or labels, preserve the source language unless Vietnamese is selected, and return only the draft content.

## Explicit non-goals

Phase 8B does not add:

- built-in AI quiz generation
- external API calls
- API key handling
- BYOK fields
- backend/auth/cloud sync
- OCR
- schema or storage changes
- automatic import of AI result
- auto-save

## Release wording

Allowed claim:

- Shime can help users build a manual AI prompt for external copy/paste workflows.

Forbidden claims:

- Shime supports built-in AI quiz generation.
- Shime sends content to AI automatically.
- Shime keeps external AI processing private on-device.
- Shime guarantees high-quality AI-generated quizzes.
