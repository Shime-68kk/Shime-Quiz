# AI draft evaluation fixture suite

Phase 8E adds a fixture/test suite for future provider-output readiness. It does **not** add built-in AI generation, does not call an AI provider, does not add API keys, and does not change the import schema.

The fixture suite models the kinds of text a future provider or a manual external AI tool might return. Each fixture is evaluated through the current Shime safety pipeline:

1. manual/provider-like output text
2. `reviewManualAiOutputText`
3. `parseTextQuizDraft`
4. `validateLearningDataImport`
5. `reviewQuizDraftQuality`
6. user preview and confirmation before save

## Good output criteria

A good provider-style draft should:

- use Shime-friendly text/Markdown, not hidden JSON;
- include `Môn:` and `Chủ đề:`;
- include clear `Câu hỏi:` blocks;
- use A/B/C/D choice labels for multiple-choice questions;
- include `Đáp án:` and, when possible, `Giải thích:`;
- support `Flashcard`, `Mặt trước`, `Mặt sau`;
- support `Câu hỏi ngắn` and `Đáp án`;
- parse into the existing flat v2 draft shape;
- pass import validation;
- pass advisory quality review without severe warnings;
- still require user preview and confirmation.

The fixture `test/fixtures/ai-draft-evaluation/good-shime-friendly-output.md` represents this target shape.

## Bad output categories

The fixture suite intentionally includes bad or risky patterns:

- JSON-like output that is not Shime-friendly text/Markdown.
- Extra commentary such as “Dưới đây là...” before the draft or “Hy vọng...” after it.
- Questions missing `Đáp án` markers.
- Multiple-choice questions missing A/B/C/D labels.
- Markdown tables that may not parse into useful quiz items.
- Duplicate visible choice text.
- Duplicate choice IDs through a synthetic draft object when raw text parsing would normalize IDs.
- Suspicious hallucination-risk examples that are parseable but factually unverifiable without source comparison.

## What Shime can detect automatically

Shime can detect basic format and quality risks, including:

- JSON-like output;
- extra commentary around quiz content;
- missing subject/topic markers;
- missing answer markers;
- missing choice labels;
- Markdown tables;
- low parse signal;
- duplicate choice text;
- duplicate choice IDs;
- import validation failures.

## What Shime cannot prove

Shime cannot prove factual correctness. It also cannot prove privacy behavior of external AI tools, cannot guarantee no hallucination, and cannot guarantee perfect quality. Users must verify the content before saving.

A future built-in provider must not claim that generated drafts are automatically correct. It must keep the preview and manual confirmation boundary.

## Future acceptance gate before built-in AI

Before any built-in AI provider is considered acceptable, provider output must pass these gates:

- provider output must pass parser/import validation;
- manual AI output review should not show serious format warnings;
- quiz draft quality review should not show severe quality issues such as duplicate choices or missing answers;
- sample fixtures for good and bad provider output must be maintained;
- user preview and confirmation must remain required;
- no auto-save and no auto-import may be added.

Phase 8E only adds test fixtures and readiness validation. It does not add built-in AI generation.
