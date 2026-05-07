# Phase 8D — AI Integration Readiness / Provider Contract Planning

Phase 8D is a planning and readiness phase only. It does **not** add built-in AI quiz generation, provider calls, API key handling, BYOK, backend/auth/cloud sync, OCR, auto-import, or auto-save.

Shime's current safe AI boundary remains:

1. Shime may build a prompt locally.
2. The user may manually copy that prompt to an external AI tool.
3. The user may manually paste the external AI output back into Shime.
4. Shime reviews/imports the pasted text through existing local draft flows.

## Required future AI pipeline

Any future built-in AI integration must preserve this non-negotiable pipeline:

```text
source text
-> explicit user confirmation
-> AI provider call
-> parse/normalize into flat v2 draft
-> import validation
-> manual AI output review where relevant
-> quiz draft quality review
-> preview
-> user confirms save
```

A future AI integration must never write directly to study history, review schedule, mastery, SRT, backup metadata, storage metadata, or user progress.

## Future provider contract proposal

The following is a documentation-only interface proposal. It is not runtime code and is not implemented in Phase 8D.

```ts
type GenerateQuizDraftFromTextInput = {
  sourceText: string;
  subjectHint?: string;
  topicHint?: string;
  goals?: string[];
};

type GenerateQuizDraftOptions = {
  multipleChoiceCount?: number;
  flashcardCount?: number;
  shortAnswerCount?: number;
  languageMode: 'vietnamese' | 'keep_source_language';
  maxInputChars: number;
  timeoutMs: number;
  signal?: AbortSignal;
};

type AiDraftProviderResult = {
  ok: true;
  draftText: string;
  providerMetadata: {
    provider: string;
    model?: string;
    requestId?: string;
    elapsedMs?: number;
  };
  rawProviderResponse?: unknown;
} | {
  ok: false;
  code:
    | 'user_cancelled'
    | 'provider_unavailable'
    | 'timeout'
    | 'rate_limited'
    | 'quota_exceeded'
    | 'invalid_provider_response'
    | 'safety_rejected'
    | 'unknown_error';
  message: string;
  retryable: boolean;
};

async function generateQuizDraftFromText(
  input: GenerateQuizDraftFromTextInput,
  options: GenerateQuizDraftOptions
): Promise<AiDraftProviderResult>;
```

Future provider results must be converted into Shime-friendly text/Markdown or the official flat v2 draft shape before entering existing local validation. Raw provider JSON must not be imported directly as Shime library data.

## Provider option comparison

| Option | Privacy | Security | Cost | Deployment complexity | Rate limits | CORS/key exposure | User trust | Offline behavior |
|---|---|---|---|---|---|---|---|---|
| Manual prompt/export remains default | User chooses what to paste externally; no silent sending from Shime | No Shime-held key; lowest implementation risk | User/tool dependent | Low | External tool dependent | No key exposure in Shime | Clear and explicit, but manual | Works for prompt creation; external AI requires network |
| BYOK frontend-only prototype | Content leaves device when user sends it; key may live in browser memory/session | High key-exposure risk; provider CORS and browser storage concerns | User pays provider | Medium | User/provider dependent | Key exposure is the major risk | Must be labeled prototype, not production secure | Requires network and provider availability |
| Hosted backend proxy | Content leaves device and is processed by Shime-controlled backend/provider | Better key handling, rate limits, abuse controls, audit design possible | Operator pays or bills users | High: backend, auth, monitoring, policy, incident response | Can be centrally enforced | Keys not exposed to browser | Better production path if security design exists | Requires network/backend/provider |
| Local/private model future option | Best privacy if fully local and no telemetry | Model supply-chain/runtime risks; device capability limits | Hardware/runtime cost | High for packaging/support | Local resources are the limit | No provider key if fully local | Strong privacy story if verified | Possible offline, but heavy and inconsistent |

## Security and privacy contract

A future AI integration must include all of the following:

- No silent sending: Shime must never send source text or extracted document text to AI without explicit user action.
- Explicit consent before every AI call.
- A clear Vietnamese disclosure that content may leave the device when sent to an external AI provider.
- A reminder that the external provider's privacy policy, retention policy, and logging policy may apply.
- A sensitive-document warning before sending private notes, exams, personal data, or proprietary material.
- A prompt-injection warning: source documents can contain instructions that try to manipulate the model.
- A hallucination warning: AI may invent facts, wrong answers, or plausible but unsupported explanations.
- Cost/rate-limit disclosure for paid providers or hosted proxies.
- Timeout, cancellation, retry, and provider-unavailable states.
- No automatic correctness guarantee.

## Future UI contract

Future UI may use Vietnamese labels such as:

- `Tạo bản nháp bằng AI`
- `Nội dung có thể rời khỏi thiết bị nếu bạn tiếp tục.`
- `Tôi hiểu và muốn gửi nội dung này đến công cụ AI.`
- `Xem lại bản nháp trước khi lưu.`

Required UI behavior:

- Show a source preview before sending.
- Show a consent modal before every AI provider call.
- Make disabled/loading/error states clear.
- Allow cancellation/timeout where feasible.
- Show provider unavailable and rate-limit messages without raw stack traces.
- Show AI output only as a draft.
- Run manual AI output review where relevant.
- Run quiz draft quality review.
- Require preview before save.
- Require user confirmation before saving.
- No auto-save and no auto-import.

## Future validation and evaluation contract

A future implementation should add fixtures and validators for:

- Prompt-output compatibility with `parseTextQuizDraft`.
- `importValidator` compatibility with normalized AI drafts.
- `quizDraftQuality` checks, including duplicate choice text and duplicate choice IDs.
- `aiOutputReview` checks for JSON-like output, extra commentary, missing answer markers, missing choice labels, Markdown tables, and low parse signals.
- Good provider output, malformed output, hallucination-prone output, too-short output, and unsupported-language edge cases.
- No direct import of raw provider JSON into Shime library data.
- No writes to study progress/history/mastery/SRT before user confirmation.

## Rollout recommendation

Recommended next steps:

1. Keep Phase 8B manual prompt/export as the default safe mode.
2. Add Phase 8E sample fixtures and evaluation suite before any provider integration.
3. Decide between hosted backend proxy and BYOK only after a separate security/design review.
4. Treat BYOK frontend-only as prototype-risky because browser key exposure is hard to avoid.
5. Prefer hosted backend proxy for any production-grade provider integration, but only with auth, rate limits, logging policy, data retention policy, abuse controls, and incident-response planning.

## Release claim boundary

Allowed claim after Phase 8D:

- Shime has AI integration readiness / provider contract planning docs.

Forbidden claims after Phase 8D:

- Shime supports built-in AI quiz generation.
- Shime calls external AI APIs.
- Shime supports API keys or BYOK.
- Shime has backend AI generation.
- Shime guarantees AI correctness, privacy, or high-quality quiz generation.
