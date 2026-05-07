# AI Safety and Privacy Contract for Future Quiz Draft Generation

Status: planning/spec only. This document is a safety contract for a future phase. It does not mean AI generation is supported today.

## Core principles

1. **Explicit consent before sending content to AI.**
   Shime must never silently send pasted text, extracted document text, or library content to an AI provider.

2. **Preview before save.**
   AI output must become a draft only. The user must review and confirm before saving.

3. **Existing validation remains mandatory.**
   AI drafts must pass import validation and quality review. AI cannot bypass the hard import validator.

4. **No learning-state writes from AI.**
   AI may propose quiz content only. It must not create history, mastery, review schedule, scoring, backup, or progress data.

5. **Honest privacy disclosure.**
   If an external AI provider is used, user content leaves the device. The UI must say this before the request.

## Sensitive data handling

User documents may contain private learning notes, names, school information, work content, answer keys, or copyrighted material. Future AI flows must clearly explain:

- what text will be sent;
- where it will be sent;
- whether a third-party provider is involved;
- whether a backend proxy is involved;
- whether data may be logged or retained;
- how the user can cancel before sending.

## BYOK safety contract

If a bring-your-own-key prototype is implemented, it must be labeled as a prototype and should:

- keep the key session-scoped where possible;
- avoid storing keys in persistent localStorage by default;
- warn that browser/runtime exposure is possible;
- document provider CORS limitations;
- provide a clear key removal path.

## Backend proxy safety contract

If a hosted backend is implemented, a separate backend/security phase must define:

- authentication model;
- key storage and rotation;
- rate limiting;
- abuse prevention;
- request size limits;
- logging and retention policy;
- provider selection and failover;
- error redaction;
- CORS policy;
- deployment and incident response process.

## Manual prompt/export workflow contract

If the first implementation is prompt/export only, Shime may generate a prompt for the user to copy into an AI tool manually. The UI/docs must still warn that external AI tools may receive private content if the user pastes it there.

## Provider-neutral output expectations

Future AI output should be parseable and conservative:

- preserve Vietnamese when the source is Vietnamese;
- preserve source language unless the user asks otherwise;
- generate multiple-choice, flashcard, and short-answer drafts only;
- include explanations only when supported by the source;
- avoid unsupported facts;
- prefer “not enough information” over hallucinating;
- include source snippets or references when feasible;
- use stable item text rather than writing progress/history metadata.

## Prompt templates — documentation only

### Structured Vietnamese quiz draft prompt

```text
Bạn là trợ lý tạo bản nháp câu hỏi học tập.
Chỉ dùng nội dung nguồn bên dưới. Không bịa thêm kiến thức ngoài nguồn.
Tạo bản nháp gồm câu hỏi trắc nghiệm, câu hỏi ngắn và thẻ ghi nhớ nếu phù hợp.
Giữ tiếng Việt nếu nguồn là tiếng Việt.
Mỗi câu hỏi cần có đáp án rõ ràng. Nếu không đủ thông tin, hãy bỏ qua thay vì đoán.
Trả về định dạng có thể phân tích bằng máy, gồm: môn học, chủ đề, loại câu hỏi, nội dung câu hỏi, lựa chọn, đáp án, giải thích ngắn nếu có trong nguồn.
```

### Multiple-choice requirements

```text
Với câu hỏi trắc nghiệm:
- Tạo 2-4 lựa chọn rõ ràng.
- Chỉ có một đáp án đúng nếu không có yêu cầu khác.
- Đáp án đúng phải khớp với một lựa chọn.
- Tránh lựa chọn trùng lặp hoặc mơ hồ.
```

### Flashcard requirements

```text
Với thẻ ghi nhớ:
- Mặt trước là khái niệm hoặc câu hỏi ngắn.
- Mặt sau là định nghĩa/câu trả lời ngắn dựa trên nguồn.
```

### Short-answer requirements

```text
Với câu hỏi ngắn:
- Câu trả lời nên ngắn gọn.
- Có thể liệt kê đáp án chấp nhận được nếu nguồn có nhiều cách diễn đạt.
```

## Required UI warnings for future implementation

Vietnamese copy should include the following meaning:

- AI may make mistakes.
- User content may be sent outside the device if using an external AI service.
- Users must review questions before saving.
- Shime does not guarantee automatic high-quality quiz generation.
- AI generation is unavailable offline unless the chosen provider/backend supports it.

## Release claim boundaries

Allowed only after a future implementation ships and passes review:

- “AI-assisted quiz draft generation is available behind explicit user action.”
- “AI-generated drafts still require preview and validation before save.”

Forbidden unless independently certified:

- “AI guarantees correct questions.”
- “AI replaces user review.”
- “Private documents never leave the device” when using external AI.
- “Production security certified.”
- “No hallucination risk.”
- “Automatic high-quality quiz generation.”
