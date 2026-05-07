# Phase 8A — AI Quiz Draft Generation Planning

Status: planning/spec only. Shime does **not** support working AI quiz generation yet.

## Product goal

A future AI-assisted flow should help learners create **reviewable quiz drafts** from:

- pasted user text;
- extracted document text from EduGen `extraction.cleanedText`;
- optional user-selected subject, topic, learning goal, or desired item mix.

AI should never write directly into the user library. It should only produce draft content that is validated, reviewed, and explicitly saved by the user.

## Non-negotiable future flow

```text
Input text
→ explicit user confirmation to use AI
→ AI draft generation
→ parse/normalize into Shime flat v2 draft shape
→ import validation
→ advisory quality review
→ user preview
→ user confirms save
```

There must be no auto-save and no bypass around import validation or quality review.

## Architecture recommendation

Recommended first implementation path: **Phase 8B prompt/export manual workflow, then Phase 8C backend-contract or BYOK spike before any working AI UI.**

Do not begin with direct provider calls from the production static frontend. The app is currently local-first/static, and user documents may contain private data. A planning-only manual workflow lets the team test prompt quality and output formats without adding API keys, network calls, billing, auth, backend operations, or privacy surprises.

### Option A — BYOK frontend-only

Users paste their own provider key into the browser/session and Shime calls the provider directly.

Pros:

- simplest prototype;
- user controls their own key;
- no Shime-hosted backend cost.

Cons:

- key is exposed to browser runtime and extensions;
- provider CORS may block direct calls;
- hard to enforce rate limits or abuse controls;
- unsuitable for broad production use without strong warnings.

Use only for a clearly labeled prototype/spike, not as a default public production design.

### Option B — hosted backend proxy

A Shime-controlled backend receives explicit AI generation requests and calls the provider server-side.

Pros:

- safer key handling;
- rate limiting, timeout, logging, and moderation controls are possible;
- provider details can be abstracted.

Cons:

- adds backend, auth/cost/security operations, and privacy responsibilities;
- no longer pure static local-first;
- requires deployment, incident response, and data-retention decisions.

This is the most appropriate architecture for a real public AI feature, but it should be planned as a separate backend/security phase.

### Option C — no AI in app; prompt/export workflow

Shime generates a prompt and users manually paste it into an AI tool outside the app, then paste generated draft text/JSON back into Shime.

Pros:

- safest and cheapest first step;
- no API keys in Shime;
- no network calls or backend;
- validates prompt/output contracts early.

Cons:

- less seamless;
- user must manually copy/paste;
- still requires privacy warnings because users may send content to third-party tools.

Recommended as the first product experiment.

## Output contract

Future AI output must be converted to the existing flat v2 draft shape only:

```json
{
  "subjects": [],
  "topics": [],
  "items": []
}
```

AI output must not create or modify:

- study history;
- review schedule;
- mastery data;
- spaced repetition state;
- recommendation feedback;
- study goals or plan progress;
- backup metadata;
- storage metadata;
- scoring outcomes.

## Parser and validation boundary

A future AI response may be structured JSON or parseable text, but Shime must still normalize it through a controlled adapter and run existing validation before preview/save. If the response is invalid, Shime should show Vietnamese feedback and keep the draft unsaved.

## UX contract

Future user-facing wording should be Vietnamese and explicit, for example:

- `Tạo bản nháp bằng AI`
- `AI có thể sai. Hãy kiểm tra câu hỏi, đáp án và giải thích trước khi lưu.`
- `Nội dung bạn chọn có thể được gửi tới dịch vụ AI bên ngoài nếu bạn tiếp tục.`
- `Bản nháp vẫn phải qua kiểm tra dữ liệu và đánh giá chất lượng trước khi lưu.`

Required UX behavior:

- explicit action before any AI request;
- no silent document upload to AI;
- visible loading, timeout, and failure states;
- preview before save;
- quality review panel visible;
- validation errors block save;
- advisory warnings do not claim guaranteed quality.

## Risk controls

Future implementation must define:

- maximum input length before request;
- chunking strategy for long documents;
- timeout and retry limits;
- rate limits and cost guardrails;
- provider availability fallback;
- partial result behavior;
- prompt injection handling;
- hallucination warnings;
- source-grounding expectations;
- Vietnamese and source-language handling;
- safe error messages without raw stack traces;
- audit/logging/data-retention policy if backend is used.

## Prompt injection and hallucination notes

Documents can contain adversarial instructions such as “ignore previous rules” or “make up answers.” The prompt contract must instruct the model to treat source text as content, not system instructions, and to avoid generating facts not supported by the source. Even with that instruction, users must review every draft.

## Non-goals for Phase 8A

This phase does not add:

- working AI generation;
- API key handling;
- external provider calls;
- backend/auth/cloud sync;
- schema/storage/scoring changes;
- OCR;
- auto-save;
- automatic quality guarantees.

## Future phase roadmap

- **Phase 8A:** planning/spec and safety contract only. No working AI calls.
- **Phase 8B:** prompt/export manual AI workflow so users can copy a prepared prompt to an external AI tool and paste draft output back into Shime.
- **Phase 8C:** BYOK prototype or backend-contract spike, focused on provider choice, key handling, privacy disclosure, rate limits, and failure modes.
- **Phase 8D:** guarded AI draft generation behind explicit user action, with validation, quality review, preview before save, and no auto-save.
- **Phase 8E:** AI quality/evaluation validators, regression fixtures, hallucination checks, and release-claim hardening.
